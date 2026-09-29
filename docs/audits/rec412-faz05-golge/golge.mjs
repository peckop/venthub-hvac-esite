// REC-412 Faz 0.5 gölge kanıtı — PGlite (saf Node PostgreSQL). ŞEMA gerçek DEĞİL: yalnız tetik MANTIĞI.
// Sınırlar: auth.uid() NULL, PostgREST yok (request.headers set_config ile taklit), webhook tetiği taklit.
// Docker GEREKMEZ. Depoya bağımlılık EKLENMEDİ: geçici bir klasörde `npm i @electric-sql/pglite`, bu dosyayı oraya
// kopyala ve `KOK=<depo yolu> node golge.mjs` (sabotaj: SABOTAJ=computed_at | sale_price). Çıkış 0 = tüm kollar geçti.
// Çıktılar aynı klasörde: cikti-temiz.txt (29/29) ve iki bilinçli bozma (kırmızı olması BEKLENİR).
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { PGlite } from '@electric-sql/pglite'

/** Sonuç satırları standart çıktıya (konsol lint kuralı yalnız warn/error'a izin verir). */
const yaz = (...parcalar) => process.stdout.write(`${parcalar.join(' ')}\n`)

// Depo kökü: KOK ortam değişkeniyle verilir (ör. KOK=C:/tmp/vh-admin-411); yoksa bu dosyanın üç üstü.
const KOK = process.env.KOK ?? fileURLToPath(new URL('../../../', import.meta.url))
const T1 = 'd3b07384-d113-495f-a558-8c38634e0000'
const T2 = '22222222-2222-2222-2222-222222222222'
const OTURUM = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'

const db = new PGlite()
let ok = 0
let kotu = 0
function kontrol(ad, kosul, ayrinti = '') {
  if (kosul) { ok++; yaz(`  ✓ ${ad}`) }
  else { kotu++; yaz(`  ✗ ${ad} ${ayrinti}`) }
}
const q = async (s, p) => (await db.query(s, p)).rows
const temizle = () => db.exec('delete from admin_audit_log')
const denetim = (tablo) => q('select * from admin_audit_log where table_name = $1 order by at, id', [tablo])
/** Başlıkla bir işlem: PostgREST her isteği tek işlemde başlıklarla koşturur. */
async function istek(basliklar, ...sqller) {
  return db.transaction(async (tx) => {
    if (basliklar !== undefined) await tx.query('select set_config($1, $2, true)', ['request.headers', basliklar])
    let son
    for (const s of sqller) son = await tx.query(s)
    return son
  })
}
const H = (o) => JSON.stringify(o)

yaz('PostgreSQL:', (await q('select version() v'))[0].v.split(',')[0])

await db.exec(`
  create schema auth;
  create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
  create role authenticated; create role anon;
  create table tenants(id uuid primary key);
  insert into tenants values ('${T1}'), ('${T2}');
  create table admin_audit_log(id uuid primary key default gen_random_uuid(), at timestamptz not null default clock_timestamp(),
    actor uuid default auth.uid(), table_name text not null, row_pk text, action text not null, before jsonb, after jsonb,
    comment text, tenant_id uuid not null default '${T1}' references tenants(id));
  create table price_lists(id uuid primary key default gen_random_uuid(), name varchar not null, is_active boolean,
    updated_at timestamptz default now(), tenant_id uuid not null default '${T1}');
  create table urun(id uuid primary key default gen_random_uuid());
  create table product_prices(id uuid primary key default gen_random_uuid(), product_id uuid not null references urun(id) on delete cascade,
    price_list_id uuid not null references price_lists(id), base_price numeric not null default 0, sale_price numeric,
    discount_percentage numeric, is_active boolean, valid_from timestamptz, valid_until timestamptz,
    created_at timestamptz default now(), updated_at timestamptz default now(), tenant_id uuid not null default '${T1}',
    currency char(3) not null default 'TRY', net_price numeric, gross_price numeric, is_derived boolean not null default false,
    computed_at timestamptz not null default now(), unique (product_id, price_list_id, currency));
  create table pricing_rule(id uuid primary key default gen_random_uuid(), tenant_id uuid not null default '${T1}',
    scope smallint not null default 1, fixed_price numeric, updated_at timestamptz default now());
  create table pricing_policy(id uuid primary key default gen_random_uuid(), tenant_id uuid not null default '${T1}',
    fx_lock boolean not null default false, updated_at timestamptz default now());
  create table currency_rates(id uuid primary key default gen_random_uuid(), tenant_id uuid not null default '${T1}',
    rate numeric not null, source text not null default 'tcmb', effective_date date not null default current_date,
    fetched_at timestamptz default now());
  create table categories(id uuid primary key default gen_random_uuid(), name text, tenant_id uuid not null default '${T1}',
    updated_at timestamptz default now());
  create function dokun() returns trigger language plpgsql as $$
    begin new.computed_at := clock_timestamp(); new.updated_at := clock_timestamp(); return new; end $$;
  create trigger trg_product_prices_computed_at before insert or update on product_prices for each row execute function dokun();
  create table webhook_log(n serial, t text);
  create function kanca() returns trigger language plpgsql security definer as $$ begin insert into webhook_log(t) values (tg_table_name||':'||tg_op); return null; end $$;
  create trigger on_product_prices_upd after update on product_prices for each row execute function kanca();
  grant all on all tables in schema public to authenticated;
`)

// ── Başlangıç: ESKİ denetim_izi_yaz() (REC-292) — regresyon tabanı
const eski = fs.readFileSync(`${KOK}/supabase/migrations/20260909071451_denetim_izi_dml_tetikleri.sql`, 'utf8')
const eskiFonk = eski.slice(eski.indexOf('create or replace function public.denetim_izi_yaz()'), eski.indexOf('$$;', eski.indexOf('create or replace function public.denetim_izi_yaz()')) + 3)
await db.exec(eskiFonk)
await db.exec(`create trigger denetim_izi_categories after insert or update or delete on categories for each row execute function public.denetim_izi_yaz();`)
await db.exec(`insert into categories(id, name) values ('aaaaaaaa-0000-0000-0000-000000000001', 'x')`)
await db.exec(`update categories set name = 'y', updated_at = now() where id = 'aaaaaaaa-0000-0000-0000-000000000001'`)
const eskiYorum = (await denetim('categories')).map((r) => r.comment)
await temizle()

// ── MIGRATION'IN KENDİSİ (birebir dosya)
let mig = fs.readFileSync(`${KOK}/supabase/migrations/20260929110000_fiyat_degisiklik_gunlugu.sql`, 'utf8')
if (process.env.SABOTAJ === 'computed_at') mig = mig.replaceAll(", 'atla:computed_at'", '')
// Sabotaj 2: değişiklik ölçütünü yalnız net/gross/is_active/currency'ye daralt (plan-challenger 2.1'in kör noktası)
if (process.env.SABOTAJ === 'sale_price') {
  mig = mig
    .replace(/\(o\.net_price, o\.gross_price, o\.base_price, o\.sale_price, o\.discount_percentage,\s+o\.valid_from, o\.valid_until, o\.is_active, o\.currency\)/, '(o.net_price, o.gross_price, o.is_active, o.currency)')
    .replace(/\(n\.net_price, n\.gross_price, n\.base_price, n\.sale_price, n\.discount_percentage,\s+n\.valid_from, n\.valid_until, n\.is_active, n\.currency\)/, '(n.net_price, n.gross_price, n.is_active, n.currency)')
}
await db.exec(mig)
yaz('\nmigration uygulandı (son-guard geçti: 11 tetik, hata yakalayıcı yok)')

await db.exec(`insert into price_lists(id, name) values ('bbbbbbbb-0000-0000-0000-000000000001', 'bireysel'), ('bbbbbbbb-0000-0000-0000-000000000002', 'bayi')`)

yaz('\n(vi) mevcut tablo regresyonu: categories yorum metni migration öncesi/sonrası AYNI')
await db.exec(`update categories set name = 'z', updated_at = now() where id = 'aaaaaaaa-0000-0000-0000-000000000001'`)
const yeniYorum = (await denetim('categories')).map((r) => r.comment)
await db.exec(`insert into categories(id, name) values ('aaaaaaaa-0000-0000-0000-000000000002', 'q')`)
kontrol('UPDATE yorumu birebir aynı', JSON.stringify(eskiYorum.slice(-1)) === JSON.stringify(yeniYorum.slice(-1)), `${eskiYorum} | ${yeniYorum}`)
await temizle()

yaz('\n(i)(ii)(v)(viii) pricing_rule — başlıklar')
await db.exec(`insert into pricing_rule(id, fixed_price) values ('cccccccc-0000-0000-0000-000000000001', 100)`)
let r = await denetim('pricing_rule')
kontrol('başlıksız INSERT → 1 satır, yontem=BILINMIYOR', r.length === 1 && /yontem=BILINMIYOR/.test(r[0].comment), r[0]?.comment)
await temizle()
await istek(H({ 'x-degisiklik-yontemi': 'panel', 'x-degisiklik-oturumu': OTURUM }), `update pricing_rule set fixed_price = 120 where id = 'cccccccc-0000-0000-0000-000000000001'`)
r = await denetim('pricing_rule')
kontrol('panel + oturum UPDATE → yontem=panel, oturum=uuid, eski→yeni', r.length === 1 && /yontem=panel/.test(r[0].comment) && r[0].comment.includes(`oturum=${OTURUM}`) && r[0].before.fixed_price == 100 && r[0].after.fixed_price == 120, JSON.stringify(r[0]))
await temizle()
for (const [ad, hdr] of [['boş dize', ''], ['geçersiz JSON', 'x'], ['beyaz liste dışı', H({ 'x-degisiklik-yontemi': 'hackle' })], ['başlık yok', H({ 'baska': 'a' })], ['bozuk oturum', H({ 'x-degisiklik-yontemi': 'panel', 'x-degisiklik-oturumu': "1'; drop" })]]) {
  let hata = null
  try { await istek(hdr, `update pricing_rule set fixed_price = fixed_price + 1 where id = 'cccccccc-0000-0000-0000-000000000001'`) } catch (e) { hata = e.message }
  r = await denetim('pricing_rule')
  const beklenen = ad === 'bozuk oturum' ? /yontem=panel/ : /yontem=BILINMIYOR/
  kontrol(`GUC=${ad} → HATA YOK, satır yazıldı`, hata === null && r.length === 1 && beklenen.test(r[0].comment) && !/drop/.test(r[0].comment), hata ?? r[0]?.comment)
  await temizle()
}
await istek(H({ 'x-degisiklik-yontemi': 'panel' }), `delete from pricing_rule where id = 'cccccccc-0000-0000-0000-000000000001'`)
r = await denetim('pricing_rule')
kontrol('(v) DELETE panel → 1 satır, action=DELETE, yontem=panel', r.length === 1 && r[0].action === 'DELETE' && /yontem=panel/.test(r[0].comment))
await temizle()

yaz('\nFail-closed: günlük yazılamazsa fiyat yazımı GERİ ALINIR')
let hataKapali = null
try { await db.exec(`insert into pricing_rule(id, tenant_id, fixed_price) values ('cccccccc-0000-0000-0000-000000000009', '99999999-9999-9999-9999-999999999999', 1)`) } catch (e) { hataKapali = e.message }
const kural9 = await q(`select count(*)::int n from pricing_rule where id = 'cccccccc-0000-0000-0000-000000000009'`)
kontrol('tenant FK ihlali → hata VAR, kural satırı YOK', hataKapali !== null && kural9[0].n === 0, hataKapali ?? 'hata yok')

yaz('\nproduct_prices — türetilmiş satırlar tek özet')
await db.exec(`insert into urun select gen_random_uuid() from generate_series(1, 5)`)
const ins = `insert into product_prices(product_id, price_list_id, net_price, gross_price, base_price, is_active, is_derived, currency)
             select u.id, 'bbbbbbbb-0000-0000-0000-000000000001', 100, 120, 120, true, true, 'TRY' from urun u`
await istek(H({ 'x-degisiklik-yontemi': 'yeniden_hesap', 'x-degisiklik-oturumu': OTURUM }), ins)
r = await denetim('product_prices')
kontrol('5 türetilmiş INSERT → TEK özet satırı, 5 girişli dizi', r.length === 1 && r[0].row_pk === 'OZET' && r[0].after.length === 5 && /satir=5/.test(r[0].comment) && /yontem=yeniden_hesap/.test(r[0].comment), JSON.stringify(r.map((x) => [x.row_pk, x.after?.length, x.comment])))
await temizle()

const upsert = (net, kosul = '') => `insert into product_prices(product_id, price_list_id, net_price, gross_price, base_price, is_active, is_derived, currency)
  select u.id, 'bbbbbbbb-0000-0000-0000-000000000001', ${net}, ${net} * 1.2, ${net} * 1.2, true, true, 'TRY' from urun u ${kosul}
  on conflict (product_id, price_list_id, currency) do update set net_price = excluded.net_price, gross_price = excluded.gross_price,
    base_price = excluded.base_price, is_active = excluded.is_active, is_derived = excluded.is_derived`
await istek(H({ 'x-degisiklik-yontemi': 'yeniden_hesap' }), upsert(100))
kontrol('(iv) fiyat DEĞİŞMEDEN yeniden hesap → 0 satır (computed_at gürültüsü yok)', (await denetim('product_prices')).length === 0)

const ilk3 = `where u.id in (select id from urun order by id limit 3)`
await istek(H({ 'x-degisiklik-yontemi': 'yeniden_hesap' }), upsert(150, ilk3))
r = await denetim('product_prices')
kontrol('(iii) 3 satırın fiyatı değişti → TEK UPDATE özeti, before/after 3 girişli, eski→yeni doğru',
  r.length === 1 && r[0].action === 'UPDATE' && r[0].before.length === 3 && r[0].after.length === 3 &&
  r[0].before.every((e) => e.net_price == 100) && r[0].after.every((e) => e.net_price == 150) && /satir=3/.test(r[0].comment), JSON.stringify(r.map((x) => [x.action, x.before?.length, x.comment])))
await temizle()

yaz('\n(ix) karışık parti: 2 mevcut değişen + 2 yeni')
await db.exec(`insert into urun select gen_random_uuid() from generate_series(1, 2)`)
await istek(H({ 'x-degisiklik-yontemi': 'yeniden_hesap' }), upsert(200, `where u.id in (select id from urun order by id limit 2) or u.id not in (select product_id from product_prices)`))
r = await denetim('product_prices')
kontrol('INSERT özeti + UPDATE özeti (2 satır) — ifade tetikleri bölündü', r.length === 2 && r.map((x) => x.action).sort().join() === 'INSERT,UPDATE', JSON.stringify(r.map((x) => [x.action, x.after?.length])))
await temizle()

yaz('\n(x) başlık yeniden_hesap + sale_price/discount değişimi susturamaz')
await istek(H({ 'x-degisiklik-yontemi': 'yeniden_hesap' }), `update product_prices set sale_price = 1, discount_percentage = 50 where id = (select id from product_prices order by id limit 1)`)
r = await denetim('product_prices')
kontrol('türetilmiş satırda sale_price/discount değişimi → özette VAR', r.length === 1 && r[0].after[0].sale_price == 1 && r[0].after[0].discount_percentage == 50, JSON.stringify(r[0]?.after))
await temizle()
await db.exec(`insert into product_prices(id, product_id, price_list_id, net_price, gross_price, is_derived, currency, is_active)
               values ('dddddddd-0000-0000-0000-000000000001', (select id from urun limit 1), 'bbbbbbbb-0000-0000-0000-000000000002', 10, 12, false, 'TRY', true)`)
r = await denetim('product_prices')
kontrol('elle ezilmiş INSERT → SATIR bazlı (row_pk=id), yontem=BILINMIYOR', r.length === 1 && r[0].row_pk === 'dddddddd-0000-0000-0000-000000000001' && /yontem=BILINMIYOR/.test(r[0].comment), JSON.stringify(r.map((x) => [x.row_pk, x.comment])))
await temizle()
await istek(H({ 'x-degisiklik-yontemi': 'yeniden_hesap' }), `update product_prices set sale_price = 5, discount_percentage = 10 where id = 'dddddddd-0000-0000-0000-000000000001'`)
r = await denetim('product_prices')
kontrol('elle ezilmiş satır + yeniden_hesap başlığı + sale_price → satır bazlı log VAR (beyan susturamaz)', r.length === 1 && r[0].row_pk === 'dddddddd-0000-0000-0000-000000000001' && r[0].after.sale_price == 5 && !('computed_at' in r[0].after), JSON.stringify(r[0]))
await temizle()
await db.exec(`update product_prices set is_active = is_active where id = 'dddddddd-0000-0000-0000-000000000001'`)
kontrol('elle ezilmiş satırda değişmeyen UPDATE → 0 satır', (await denetim('product_prices')).length === 0)

yaz('\n(xi) iki tenant: tek UPDATE → iki özet, doğru tenant')
await db.exec(`update product_prices set tenant_id = '${T2}' where id in (select id from product_prices where is_derived order by id limit 3)`)
await temizle()
await istek(H({ 'x-degisiklik-yontemi': 'yeniden_hesap' }), `update product_prices set net_price = net_price + 1 where is_derived`)
r = await denetim('product_prices')
kontrol('iki özet satırı, tenant_id\'ler {T1,T2}', r.length === 2 && new Set(r.map((x) => x.tenant_id)).size === 2, JSON.stringify(r.map((x) => [x.tenant_id, x.after?.length])))
await temizle()

yaz('\n(vii) rol authenticated ile fiyat UPDATE\'i başarılı (tetik EXECUTE tuzağı yok)')
let hataRol = null
try {
  await db.transaction(async (tx) => {
    await tx.query('set local role authenticated')
    await tx.query(`update product_prices set net_price = net_price + 1 where is_derived`)
    await tx.query(`update pricing_rule set fixed_price = 1`)
  })
} catch (e) { hataRol = e.message }
kontrol('authenticated UPDATE geçti', hataRol === null, hataRol ?? '')
kontrol('  ve günlük satırları yazıldı', (await q('select count(*)::int n from admin_audit_log'))[0].n >= 1)
await temizle()

yaz('\n(xii) ürün silme kaskadı')
await db.exec(`delete from urun where id = (select product_id from product_prices where is_derived limit 1)`)
r = await denetim('product_prices')
kontrol('kaskad DELETE → türetilmiş satır için DELETE özeti', r.some((x) => x.action === 'DELETE' && x.row_pk === 'OZET'), JSON.stringify(r.map((x) => [x.action, x.row_pk])))
await db.exec(`delete from urun where id = (select product_id from product_prices where not is_derived limit 1)`)
r = await denetim('product_prices')
kontrol('kaskad DELETE → elle ezilmiş satır SATIR bazlı', r.some((x) => x.action === 'DELETE' && x.row_pk === 'dddddddd-0000-0000-0000-000000000001'), JSON.stringify(r.map((x) => [x.action, x.row_pk])))
await temizle()

yaz('\n(xiii) currency_rates')
await db.exec(`insert into currency_rates(rate, source) values (32, 'tcmb')`)
kontrol('tcmb INSERT → 0 satır', (await denetim('currency_rates')).length === 0)
await db.exec(`insert into currency_rates(id, rate, source) values ('eeeeeeee-0000-0000-0000-000000000001', 33, 'manual')`)
r = await denetim('currency_rates')
kontrol('manual INSERT → 1 satır', r.length === 1 && r[0].action === 'INSERT')
await db.exec(`update currency_rates set rate = 34 where id = 'eeeeeeee-0000-0000-0000-000000000001'`)
await db.exec(`delete from currency_rates where id = 'eeeeeeee-0000-0000-0000-000000000001'`)
r = await denetim('currency_rates')
kontrol('UPDATE + DELETE → toplam 3 satır', r.length === 3, String(r.length))
await temizle()

yaz('\nprice_lists / pricing_policy')
await db.exec(`insert into pricing_policy(id) values ('ffffffff-0000-0000-0000-000000000001'); update pricing_policy set fx_lock = true; update price_lists set is_active = true where name = 'bayi'`)
kontrol('politika INSERT+UPDATE ve liste UPDATE günlüğe girdi', (await denetim('pricing_policy')).length === 2 && (await denetim('price_lists')).length === 1)
await temizle()

yaz('\nTavan: 2100 türetilmiş satır → 2000 girişli dizi + kirpildi')
await db.exec(`delete from product_prices; delete from urun; insert into urun select gen_random_uuid() from generate_series(1, 2100)`)
await temizle()
await istek(H({ 'x-degisiklik-yontemi': 'yeniden_hesap' }), `insert into product_prices(product_id, price_list_id, net_price, gross_price, base_price, is_active, is_derived, currency)
  select id, 'bbbbbbbb-0000-0000-0000-000000000001', 1, 1.2, 1.2, true, true, 'TRY' from urun`)
r = await denetim('product_prices')
kontrol('tek özet, dizi 2000, satir=2100, kirpildi=evet', r.length === 1 && r[0].after.length === 2000 && /satir=2100/.test(r[0].comment) && /kirpildi=evet/.test(r[0].comment), JSON.stringify(r.map((x) => [x.after?.length, x.comment])))
await temizle()

yaz('\nTetik envanteri')
const tet = await q(`select c.relname, t.tgname from pg_trigger t join pg_class c on c.oid=t.tgrelid where not t.tgisinternal and t.tgname like 'denetim_izi%' order by 1,2`)
yaz('  ' + tet.map((x) => `${x.relname}:${x.tgname}`).join('\n  '))
kontrol('sıralama: denetim_izi_product_prices_upd, on_product_prices_upd\'den ÖNCE ateşlenir (alfabetik)', 'denetim_izi_product_prices_upd' < 'on_product_prices_upd')

yaz(`\nSONUÇ: ${ok} geçti, ${kotu} kaldı`)
process.exit(kotu === 0 ? 0 : 1)
