// REC-412 Faz 0.5b gölge kanıtı — PGlite (saf Node PostgreSQL). ŞEMA gerçek DEĞİL: yalnız RPC + tetik MANTIĞI.
// Gerçek kullanılan parçalar (dosyadan BİREBİR): 20260929143000 migration'ı, `is_admin_claim()` (20260918063600),
// `denetim_izi_yaz()` (20260929110000). Taklit: auth.uid()/auth.role() (JWT claims'ten), jwt_tenant_id(), RLS YOK.
// Docker GEREKMEZ. Depoya bağımlılık EKLENMEDİ: geçici klasörde `npm i @electric-sql/pglite`, bu dosyayı oraya kopyala,
// `KOK=<depo yolu> node golge.mjs` (sabotaj: SABOTAJ=tenant | dedup | kapi). Çıkış 0 = tüm kollar geçti.
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { PGlite } from '@electric-sql/pglite'

/** Sonuç satırları standart çıktıya (konsol lint kuralı yalnız warn/error'a izin verir). */
const yaz = (...parcalar) => process.stdout.write(`${parcalar.join(' ')}\n`)

const KOK = process.env.KOK ?? fileURLToPath(new URL('../../../', import.meta.url))
const T1 = 'd3b07384-d113-495f-a558-8c38634e0000'
const T2 = '22222222-2222-2222-2222-222222222222'
const T3 = '33333333-3333-3333-3333-333333333333' // tenants tablosunda YOK → günlük FK ihlali (fail-closed sınaması)
const UID = '99999999-0000-0000-0000-000000000001'
const OTURUM = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'
const P = (n) => `aaaaaaaa-0000-0000-0000-${String(n).padStart(12, '0')}`

const db = new PGlite()
let ok = 0
let kotu = 0
function kontrol(ad, kosul, ayrinti = '') {
  if (kosul) { ok++; yaz(`  ✓ ${ad}`) }
  else { kotu++; yaz(`  ✗ ${ad} ${ayrinti}`) }
}
const q = async (s, p) => (await db.query(s, p)).rows
const temizle = () => db.exec('delete from admin_audit_log')
const denetim = () => q('select * from admin_audit_log order by at, id')
const H = (o) => JSON.stringify(o)
const claims = (rol, ek = {}) => H({ sub: UID, role: 'authenticated', app_metadata: { user_role: rol, ...ek } })
const ADMIN = claims('admin')
const ADMIN_T2 = claims('admin', { tenant_id: T2 })
const MOD = claims('moderator')
const USERMETA = H({ sub: UID, role: 'authenticated', user_metadata: { user_role: 'admin' } })
const SERVIS = H({ role: 'service_role' })
const YONTEM = H({ 'x-degisiklik-yontemi': 'maliyet_yenileme', 'x-degisiklik-oturumu': OTURUM })

/** PostgREST her isteği tek işlemde claims + başlıklarla, verilen rolle koşturur. Hata → { hata }. */
async function istek({ jwt, baslik, rol = 'authenticated' }, sql) {
  try {
    const son = await db.transaction(async (tx) => {
      if (jwt !== undefined) await tx.query('select set_config($1, $2, true)', ['request.jwt.claims', jwt])
      if (baslik !== undefined) await tx.query('select set_config($1, $2, true)', ['request.headers', baslik])
      await tx.query(`set local role ${rol}`)
      return tx.query(sql)
    })
    return { son }
  } catch (e) {
    return { hata: e.message, kod: e.code }
  }
}
const rpc = (dizi) => `select public.maliyet_yenile('${JSON.stringify(dizi)}'::jsonb) as n`
// Payload: maliyetin HESAPLANDIĞI alış fiyatı da gider (varsayılan ürün: 100 EUR) — iyimser eşzamanlılık koruması.
const satir = (n, cost, rate = 35, fiyat = 100, para = 'EUR') => ({
  id: P(n), cost_in_base: cost, purchase_rate_to_base: rate, purchase_price: fiyat, purchase_currency: para,
})
const maliyet = () => q('select id, cost_in_base::float8 c, purchase_rate_to_base::float8 r from products order by id')

yaz('PostgreSQL:', (await q('select version() v'))[0].v.split(',')[0])

await db.exec(`
  create schema auth;
  create function auth.claims() returns jsonb language sql stable as $$ select nullif(current_setting('request.jwt.claims', true), '')::jsonb $$;
  create function auth.uid() returns uuid language sql stable as $$ select (auth.claims() ->> 'sub')::uuid $$;
  create function auth.role() returns text language sql stable as $$ select coalesce(auth.claims() ->> 'role', 'anon') $$;
  create role authenticated; create role anon; create role service_role;
  grant usage on schema public, auth to authenticated, anon, service_role;
  grant execute on all functions in schema auth to authenticated, anon, service_role;
  create function public.jwt_tenant_id() returns uuid language sql stable as
    $$ select coalesce(auth.claims() -> 'app_metadata' ->> 'tenant_id', '${T1}')::uuid $$;
  create table tenants(id uuid primary key);
  insert into tenants values ('${T1}'), ('${T2}');
  create table admin_audit_log(id uuid primary key default gen_random_uuid(), at timestamptz not null default clock_timestamp(),
    actor uuid default auth.uid(), table_name text not null, row_pk text, action text not null, before jsonb, after jsonb,
    comment text, tenant_id uuid not null default '${T1}' references tenants(id));
  create table products(id uuid primary key default gen_random_uuid(), name text default 'u', tenant_id uuid not null default '${T1}',
    purchase_price numeric not null default 100, purchase_currency varchar not null default 'EUR',
    purchase_rate_to_base numeric(18,6), cost_in_base numeric(14,4), stock int not null default 0, updated_at timestamptz default now());
  grant all on all tables in schema public to authenticated, service_role;
  alter default privileges in schema public grant execute on functions to service_role; -- Supabase varsayılanını taklit
  -- RLS MODELİ (canlı \`products\` UPDATE politikası: profil rolü admin/super_admin/moderator; tenant süzgeci YOK).
  -- Çürütme B1: JWT'de admin olup PROFİL rolü düşmüş kullanıcı INVOKER RPC'de sessizce 0 satıra iner.
  create table user_profiles(id uuid primary key, role text not null);
  insert into user_profiles values ('${UID}', 'admin');
  grant select on user_profiles to authenticated;
  alter table products enable row level security;
  create policy p_sec on products for select to authenticated using (true);
  create policy p_upd on products for update to authenticated
    using (exists (select 1 from user_profiles up where up.id = auth.uid() and up.role in ('admin','super_admin','moderator')))
    with check (exists (select 1 from user_profiles up where up.id = auth.uid() and up.role in ('admin','super_admin','moderator')));
  alter role service_role bypassrls;
`)

// Gerçek fonksiyonlar dosyalardan (taklit değil)
const yetki = fs.readFileSync(`${KOK}/supabase/migrations/20260918063600_yetki_dongusu_kesildi.sql`, 'utf8')
const bas = yetki.indexOf('CREATE OR REPLACE FUNCTION public.is_admin_claim()')
await db.exec(yetki.slice(bas, yetki.indexOf('REVOKE EXECUTE ON FUNCTION public.is_admin_claim() FROM PUBLIC')))
await db.exec(`revoke all on function public.is_admin_claim() from public, anon; grant execute on function public.is_admin_claim() to authenticated, service_role;`)
const pa = fs.readFileSync(`${KOK}/supabase/migrations/20260929110000_fiyat_degisiklik_gunlugu.sql`, 'utf8')
const izBas = pa.indexOf('create or replace function public.denetim_izi_yaz()')
await db.exec(pa.slice(izBas, pa.indexOf('$$;', izBas) + 3))
// Mevcut satır tetiği (canlı tanımın kolon listesi)
await db.exec(`create trigger denetim_izi_products_upd after update of name, price_yok_sayilir_degil, purchase_price, purchase_currency, tenant_id
  on products for each row execute function public.denetim_izi_yaz()`.replace('price_yok_sayilir_degil, ', ''))
await db.exec(`insert into products(id, cost_in_base, purchase_rate_to_base) select ('aaaaaaaa-0000-0000-0000-' || lpad(g::text, 12, '0'))::uuid, 100, 30 from generate_series(1, 5) g`)

// ── MIGRATION'IN KENDİSİ (birebir dosya)
let mig = fs.readFileSync(`${KOK}/supabase/migrations/20260929143000_maliyet_yenileme_gunlugu.sql`, 'utf8')
if (process.env.SABOTAJ === 'tenant') mig = mig.replaceAll(' and p.tenant_id = public.jwt_tenant_id()', '')
if (process.env.SABOTAJ === 'dedup') mig = mig.replace(/\s+and o\.purchase_price is not distinct from n\.purchase_price\s+and o\.purchase_currency is not distinct from n\.purchase_currency/, '')
if (process.env.SABOTAJ === 'kapi') mig = mig.replace('if not public.is_admin_claim() then', 'if false then')
if (process.env.SABOTAJ === 'beklenen') mig = mig.replace('if v_say <> v_beklenen then', 'if false then')
if (process.env.SABOTAJ === 'nan') mig = mig.replaceAll(/\s+or s\.(cost_in_base|purchase_rate_to_base) = '(NaN|Infinity)'::numeric/g, '')
await db.exec(mig)
yaz('\nmigration uygulandı (son-guard geçti: tetik kuruldu, hata yakalayıcı yok, anon/PUBLIC EXECUTE kapalı)')

yaz('\n(1) yönetici, 5 satır değişiyor → TEK özet, eski→yeni dizisi, yöntem+oturum')
let s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 110), satir(2, 120), satir(3, 130), satir(4, 140), satir(5, 150)]))
let r = await denetim()
kontrol('RPC 5 döndürdü', s.son?.rows[0].n === 5, JSON.stringify(s))
kontrol('TEK satır, row_pk=OZET, action=UPDATE, table=products', r.length === 1 && r[0].row_pk === 'OZET' && r[0].action === 'UPDATE' && r[0].table_name === 'products', JSON.stringify(r.map((x) => [x.row_pk, x.table_name])))
kontrol('before/after 5 girişli; eski 100 → yeni doğru', r[0]?.before.length === 5 && r[0].after.length === 5 && r[0].before.every((e) => e.cost_in_base == 100) && r[0].after.map((e) => e.cost_in_base).sort().join() === '110,120,130,140,150', JSON.stringify(r[0]?.after))
kontrol('yorum: yontem=maliyet_yenileme, oturum=uuid, satir=5, actor=admin', /yontem=maliyet_yenileme/.test(r[0]?.comment) && r[0].comment.includes(`oturum=${OTURUM}`) && /satir=5/.test(r[0].comment) && r[0].actor === UID, r[0]?.comment)
kontrol('satır tetiği (denetim_izi_products_upd) ATEŞLENMEDİ → çift kayıt yok', r.every((x) => x.row_pk === 'OZET'))
await temizle()

yaz('\n(2) aynı değerler yeniden → 0 değişiklik, 0 günlük satırı')
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 110), satir(2, 120), satir(3, 130), satir(4, 140), satir(5, 150)]))
kontrol('RPC 0 döndürdü, günlük boş', s.son?.rows[0].n === 0 && (await denetim()).length === 0, JSON.stringify(s))

yaz('\n(3) yalnız 3 satır değişiyor → özet 3 girişli')
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 111), satir(2, 121), satir(3, 131), satir(4, 140), satir(5, 150)]))
r = await denetim()
kontrol('RPC 3, özet 3 girişli, satir=3', s.son?.rows[0].n === 3 && r.length === 1 && r[0].after.length === 3 && /satir=3/.test(r[0].comment), JSON.stringify(r.map((x) => x.after?.length)))
await temizle()

yaz('\n(4) yönetici kapısı (JWT app_metadata; tabloya DÜŞMEZ)')
const once = JSON.stringify(await maliyet())
for (const [ad, ctx] of [['JWT yok (anon rolü)', { jwt: undefined, rol: 'anon' }], ['JWT yok, authenticated', { jwt: undefined }], ['moderatör', { jwt: MOD }], ['user_metadata admin (yok sayılır)', { jwt: USERMETA }]]) {
  s = await istek({ ...ctx, baslik: YONTEM }, rpc([satir(1, 999)]))
  kontrol(`${ad} → REDDEDİLDİ`, s.hata !== undefined, JSON.stringify(s.son?.rows))
}
kontrol('  hiçbir satır değişmedi, günlük boş', JSON.stringify(await maliyet()) === once && (await denetim()).length === 0)
s = await istek({ jwt: SERVIS, rol: 'service_role', baslik: YONTEM }, rpc([satir(1, 112)]))
kontrol('service_role izinli (betik yolu)', s.son?.rows[0].n === 1, JSON.stringify(s))
await temizle()

yaz('\n(5) TEK ATOMİK parti: tek bozuk eleman → TÜM parti reddedilir, hiçbir satır yazılmaz')
const snapshot = JSON.stringify(await maliyet())
const bozuklar = [
  ['oran eksik', [satir(1, 200), { id: P(2), cost_in_base: 200 }, satir(3, 200)]],
  ['negatif maliyet', [satir(1, 200), satir(2, -1), satir(3, 200)]],
  ['oran sıfır', [satir(1, 200), satir(2, 200, 0)]],
  ['olmayan ürün id', [satir(1, 200), { id: P(999), cost_in_base: 1, purchase_rate_to_base: 1 }]],
  ['bozuk uuid', [satir(1, 200), { id: 'x', cost_in_base: 1, purchase_rate_to_base: 1 }]],
]
for (const [ad, dizi] of bozuklar) {
  s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc(dizi))
  kontrol(`${ad} → hata, yazım YOK`, s.hata !== undefined && JSON.stringify(await maliyet()) === snapshot, JSON.stringify(s.son?.rows))
}
s = await istek({ jwt: ADMIN, baslik: YONTEM }, `select public.maliyet_yenile('{"a":1}'::jsonb)`)
kontrol('dizi olmayan girdi → 22023', s.kod === '22023', JSON.stringify(s))
s = await istek({ jwt: ADMIN, baslik: YONTEM }, `select public.maliyet_yenile(null)`)
kontrol('null girdi → hata', s.hata !== undefined)
kontrol('  günlük boş kaldı', (await denetim()).length === 0)

yaz('\n(6) tenant sınırı: başka tenant\'ın yöneticisi bu tenant\'ın ürününü yazamaz')
s = await istek({ jwt: ADMIN_T2, baslik: YONTEM }, rpc([satir(1, 777)]))
kontrol('T2 yöneticisi, T1 ürünü → reddedildi, satır değişmedi', s.hata !== undefined && JSON.stringify(await maliyet()) === snapshot, JSON.stringify(s))

yaz('\n(7) parti sınırı 5000')
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc(Array.from({ length: 5001 }, (_, i) => satir(1, 300 + i))))
kontrol('5001 eleman → 54000, yarım yenileme YOK', s.kod === '54000' && JSON.stringify(await maliyet()) === snapshot, JSON.stringify(s).slice(0, 160))

yaz('\n(8) FAIL-CLOSED: günlük yazılamazsa maliyet yazımı GERİ ALINIR')
// Kurulum: T3 yalnız ürünü taşımak için geçici var (satır tetiği günlük yazar); RPC anında tenants'ta YOK.
await db.exec(`insert into tenants values ('${T3}'); update products set tenant_id = '${T3}' where id = '${P(1)}'; delete from admin_audit_log; delete from tenants where id = '${T3}'`)
const oncekiC = (await maliyet())[0].c
s = await istek({ jwt: claims('admin', { tenant_id: T3 }), baslik: YONTEM }, rpc([satir(1, 888)]))
kontrol('tenant FK ihlali (günlük) → hata VAR, maliyet DEĞİŞMEDİ', s.hata !== undefined && /foreign key/.test(s.hata) && (await maliyet())[0].c === oncekiC, JSON.stringify(s).slice(0, 200))
await db.exec(`insert into tenants values ('${T3}'); update products set tenant_id = '${T1}' where id = '${P(1)}'; delete from admin_audit_log; delete from tenants where id = '${T3}'`)

yaz('\n(9) çift kayıt önlemi: purchase_price değişen satır özete GİRMEZ (satır tetiği yazar)')
await istek({ jwt: ADMIN, baslik: YONTEM }, `update public.products set purchase_price = 120, cost_in_base = 4200, purchase_rate_to_base = 35 where id = '${P(2)}'`)
r = await denetim()
kontrol('1 satır (satır tetiği, row_pk=ürün id), OZET YOK', r.length === 1 && r[0].row_pk === P(2), JSON.stringify(r.map((x) => [x.row_pk])))
kontrol('  satır tetiği maliyet kolonlarını da taşıdı (diff tüm değişenleri içerir)', 'cost_in_base' in (r[0]?.after ?? {}) && 'purchase_price' in (r[0]?.after ?? {}), JSON.stringify(r[0]?.after))
await temizle()

yaz('\n(10) regresyon: stok/isim gibi başka UPDATE\'ler günlük ÜRETMEZ, özet tetiği sessiz')
await db.exec(`update products set stock = stock + 1`)
kontrol('stok UPDATE → 0 günlük satırı', (await denetim()).length === 0)
await db.exec(`update products set cost_in_base = cost_in_base where id = '${P(3)}'`)
kontrol('değişmeyen maliyet UPDATE → 0 satır', (await denetim()).length === 0)

yaz('\n(11) ilk doldurma: NULL → değer de değişikliktir')
await db.exec(`update products set cost_in_base = null, purchase_rate_to_base = null where id = '${P(4)}'`)
await temizle()
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(4, 555, 30)]))
r = await denetim()
kontrol('before=NULL, after=555 özette', r.length === 1 && r[0].before[0].cost_in_base === null && r[0].after[0].cost_in_base == 555, JSON.stringify(r[0]))
await temizle()

yaz('\n(12) doğrudan SQL, iki tenant → iki özet (tenant başına)')
await db.exec(`update products set tenant_id = '${T2}' where id in ('${P(1)}', '${P(2)}')`)
await temizle()
await istek({ jwt: SERVIS, rol: 'service_role', baslik: YONTEM }, `update public.products set cost_in_base = cost_in_base + 1, purchase_rate_to_base = purchase_rate_to_base + 1 where cost_in_base is not null and purchase_rate_to_base is not null`)
r = await denetim()
kontrol('iki özet, tenant\'lar {T1,T2}', r.length === 2 && new Set(r.map((x) => x.tenant_id)).size === 2, JSON.stringify(r.map((x) => [x.tenant_id, x.after?.length])))
await temizle()
await db.exec(`update products set tenant_id = '${T1}'`) // satır tetiği (tenant_id UPDATE OF listesinde) günlük yazar
await temizle()

yaz('\n(15) çürütme B1: JWT admin ama PROFİL rolü düşmüş → RLS sessizce 0 satır → TÜM parti reddedilir (sessiz başarı YOK)')
const b1Once = JSON.stringify(await maliyet())
await db.exec(`update user_profiles set role = 'user' where id = '${UID}'`)
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 601), satir(3, 602)]))
kontrol('hata 40001, hiçbir satır değişmedi, günlük boş', s.kod === '40001' && JSON.stringify(await maliyet()) === b1Once && (await denetim()).length === 0, JSON.stringify(s).slice(0, 200))
await db.exec(`update user_profiles set role = 'admin' where id = '${UID}'`)

yaz('\n(16) çürütme B2: NaN / Infinity → TÜM parti reddedilir')
for (const [ad, bozuk] of [['NaN maliyet', { ...satir(2, 'NaN') }], ['Infinity oran', { ...satir(2, 200, 'Infinity') }], ['NaN oran', { ...satir(2, 200, 'NaN') }]]) {
  s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 611), bozuk]))
  kontrol(`${ad} → 22023, yazım YOK`, s.kod === '22023' && JSON.stringify(await maliyet()) === b1Once, JSON.stringify(s).slice(0, 160))
}

yaz('\n(17) çürütme B6: aynı id iki kez → reddedilir')
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 621), satir(1, 622)]))
kontrol('yinelenen id → 22023, yazım YOK', s.kod === '22023' && JSON.stringify(await maliyet()) === b1Once, JSON.stringify(s).slice(0, 160))

yaz('\n(18) çürütme B8: okuma ile yazma arasında alış fiyatı değişti → o satır yazılamaz, TÜM parti geri alınır')
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 631), satir(3, 632, 35, 999)])) // ürün 3 gerçekte 100 EUR
kontrol('eski fiyattan üretilmiş satır → 40001; ürün 1 de YAZILMADI', s.kod === '40001' && JSON.stringify(await maliyet()) === b1Once, JSON.stringify(s).slice(0, 200))
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 631), satir(3, 632, 35, 100, 'USD')]))
kontrol('para birimi değişmişse de → 40001', s.kod === '40001' && JSON.stringify(await maliyet()) === b1Once, JSON.stringify(s).slice(0, 200))
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([{ id: P(1), cost_in_base: 5, purchase_rate_to_base: 5 }]))
kontrol('payload\'da alış fiyatı/para birimi yoksa → 22023', s.kod === '22023', JSON.stringify(s).slice(0, 160))

yaz('\n(19) çürütme B5: sütundan fazla ondalık → ilk koşuda yazılır, İKİNCİ koşuda değişmedi sayılır (döngü yok)')
await temizle()
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 351.23456789, 35.1234567)]))
r = await denetim()
kontrol('1. koşu: n=1, özet 1 satır, değerler yuvarlanmış (351.2346 / 35.123457)', s.son?.rows[0].n === 1 && r.length === 1 && r[0].after[0].cost_in_base == 351.2346 && r[0].after[0].purchase_rate_to_base == 35.123457, JSON.stringify(r[0]?.after))
await temizle()
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc([satir(1, 351.23456789, 35.1234567)]))
kontrol('2. koşu (aynı girdi): n=0, günlük boş', s.son?.rows[0].n === 0 && (await denetim()).length === 0, JSON.stringify(s))
await temizle()

yaz('\n(13) yetki matrisi')
const acl = await q(`select has_function_privilege('anon','public.maliyet_yenile(jsonb)','execute') a, has_function_privilege('authenticated','public.maliyet_yenile(jsonb)','execute') u, has_function_privilege('service_role','public.maliyet_yenile(jsonb)','execute') sv,
  has_function_privilege('authenticated','public.denetim_izi_maliyet_ozet()','execute') tu, has_function_privilege('anon','public.denetim_izi_maliyet_ozet()','execute') ta`)
kontrol('anon: EXECUTE YOK · authenticated: VAR · service_role: VAR', acl[0].a === false && acl[0].u === true && acl[0].sv === true, JSON.stringify(acl[0]))
kontrol('tetik fonksiyonu istemci rollerine KAPALI', acl[0].tu === false && acl[0].ta === false, JSON.stringify(acl[0]))

yaz('\n(14) ölçek: 5000 satırlık parti (tek ifade) ve sıcak yol maliyeti — bilgi amaçlı, kapı değil')
await db.exec(`delete from products; insert into products(id, cost_in_base, purchase_rate_to_base) select gen_random_uuid(), 100, 30 from generate_series(1, 5000)`)
const idler = await q('select id from products order by id')
await temizle()
const t0 = Date.now()
s = await istek({ jwt: ADMIN, baslik: YONTEM }, rpc(idler.map((x) => ({ id: x.id, cost_in_base: 101, purchase_rate_to_base: 31, purchase_price: 100, purchase_currency: 'EUR' }))))
const ms = Date.now() - t0
r = await denetim()
kontrol(`5000 satır TEK özet, dizi 5000, kirpildi YOK (${ms} ms)`, s.son?.rows[0].n === 5000 && r.length === 1 && r[0].after.length === 5000 && !/kirpildi/.test(r[0].comment), JSON.stringify(s).slice(0, 160))
await temizle()
const tek = async () => { const a = Date.now(); for (let i = 0; i < 1000; i++) await db.exec(`update products set stock = stock + 1 where id = '${idler[i % 50].id}'`); return Date.now() - a }
const tetikli = await tek()
await db.exec('drop trigger denetim_izi_maliyet_ozet on products')
const tetiksiz = await tek()
yaz(`  bilgi: 1000 tek-satır stok UPDATE'i — tetikli ${tetikli} ms, tetiksiz ${tetiksiz} ms (PGlite, gerçek DB ölçeği DEĞİL)`)

yaz(`\nSONUÇ: ${ok} geçti, ${kotu} kaldı`)
process.exit(kotu === 0 ? 0 : 1)
