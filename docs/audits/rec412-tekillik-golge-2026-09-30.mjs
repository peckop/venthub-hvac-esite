// Yeniden koşum: geçici bir klasörde `npm i @electric-sql/pglite`, bu dosyayı oraya kopyala, `node <kopya> <migration yolu>`. Depoya bağımlılık EKLENMEZ.
// REC-412 tekillik — gölge kanıtı (bellek-içi PGlite, Docker YOK). Emsal: rec168-satis-kipi-golge-2026-09-29.mjs.
//
// ÖLÇTİĞİ: `pricing_rule_urun_tek_sabit_uq` kısmi tekil indeksi — (1) migration temiz veride uygulanır ve tekrar koşulabilir
// (idempotent); (2) aynı tenant+ürün için ikinci sabit kural INSERT'i ve mevcut kuralı koşula SOKAN UPDATE 23505 verir;
// (3) koşul DIŞI satırlar (başka ürün, başka tenant, kitaplı, adet>1, scope 0, cost_plus, silme sonrası yeniden ekleme)
// engellenmez; (4) para birimli / dönemli (kampanya) sabit kural koşulun DIŞINDA kalır, engellenmez; (5) ihlalli veriyle migration
// EXCEPTION ile düşer ve indeks OLUŞMAZ; (6) yarım kalmış GEÇERSİZ indeks yeniden koşumda düşürülüp geçerlisi kurulur.
// Migration üç adımlıdır (işlem / CONCURRENTLY / işlem); dosya bu yüzden `psql -f` gibi ifade ifade koşulur.
// Tablo tanımı depodaki baseline'dan (supabase/baselines/2026-09-29_public_schema.sql) alınmıştır; FK'lar dışarıda bırakıldı.
//
// ÖLÇMEDİĞİ (PGlite kapsamaz): PostgREST hata biçimi (error.code/details/message'ın indeks adını nerede taşıdığı) ve
// `denetim_izi_pricing_rule` tetiğinin yeniden denemedeki günlük satırı; gerçek `jwt_tenant_id()` çözümlemesi.
import fs from 'node:fs'

import { PGlite } from '@electric-sql/pglite'

const yaz = (s) => process.stdout.write(`${s}\n`)
const MIGRATION = process.argv[2]
const migrationSql = fs.readFileSync(MIGRATION, 'utf8')

/**
 * `psql -f` gibi ifade ifade koşar: CREATE INDEX CONCURRENTLY işlem bloğunda ÇALIŞMAZ; PGlite `exec`i çok ifadeli metni
 * tek blok saydığı için dosya bütün olarak verilirse B adımı düşer. Bölücü: satır yorumları atılır, `$$ ... $$` içindeki
 * noktalı virgüller korunur. İlk hatada durur (ON_ERROR_STOP) ve hatayı fırlatır.
 */
function ifadeler(sql) {
  const govde = sql
    .split('\n')
    .filter((l) => !/^\s*--/.test(l))
    .join('\n')
  const out = []
  let bu = ''
  let icerde = false
  let tirnakta = false
  for (let i = 0; i < govde.length; i++) {
    if (!tirnakta && govde.startsWith('$$', i)) {
      icerde = !icerde
      bu += '$$'
      i++
      continue
    }
    if (!icerde && govde[i] === "'") tirnakta = !tirnakta
    if (govde[i] === ';' && !icerde && !tirnakta) {
      if (bu.trim()) out.push(`${bu.trim()};`)
      bu = ''
      continue
    }
    bu += govde[i]
  }
  if (bu.trim()) out.push(`${bu.trim()};`)
  return out
}

async function uygula(db, sql) {
  for (const ifade of ifadeler(sql)) await db.exec(ifade)
}

const T1 = '00000000-0000-0000-0000-00000000a001'
const T2 = '00000000-0000-0000-0000-00000000a002'
const P1 = '00000000-0000-0000-0000-00000000b001'
const P2 = '00000000-0000-0000-0000-00000000b002'
const P3 = '00000000-0000-0000-0000-00000000b003'
const KITAP ='00000000-0000-0000-0000-00000000c001'

const TABLO = `
  create function public.jwt_tenant_id() returns uuid language sql stable as $$ select '${T1}'::uuid $$;
  create table public.pricing_rule (
    id uuid default gen_random_uuid() not null primary key,
    tenant_id uuid default public.jwt_tenant_id() not null,
    price_book_id uuid, scope smallint not null, product_id uuid, brand_id uuid, category_id uuid,
    method text not null, base text default 'cost' not null, margin_pct numeric, surcharge numeric default 0 not null,
    fixed_price numeric, vat_rate_pct numeric default 20 not null, price_is_vat_inclusive boolean default false not null,
    min_margin_abs numeric, max_margin_abs numeric, round_to numeric, charm_ending numeric,
    min_quantity numeric default 1 not null, priority integer default 0 not null, is_exclusive boolean default true not null,
    currency character(3), valid_from date, valid_to date,
    created_at timestamptz default now() not null, updated_at timestamptz default now() not null, updated_by uuid,
    constraint pricing_rule_base_check check (base in ('cost','list_price','parent_book')),
    constraint pricing_rule_method_check check (method in ('cost_plus','fixed','percent_off_list')),
    constraint pricing_rule_method_fields check ((method != 'cost_plus' or margin_pct is not null) and (method != 'fixed' or fixed_price is not null)),
    constraint pricing_rule_min_quantity_check check (min_quantity >= 0),
    constraint pricing_rule_scope_check check (scope between 0 and 4),
    constraint pricing_rule_scope_target check (
      (scope in (0,1) and product_id is not null and brand_id is null and category_id is null) or
      (scope = 2 and brand_id is not null and product_id is null and category_id is null) or
      (scope = 3 and category_id is not null and product_id is null and brand_id is null) or
      (scope = 4 and product_id is null and brand_id is null and category_id is null))
  );
  create index pricing_rule_product_idx on public.pricing_rule (product_id) where product_id is not null;
  create index pricing_rule_tenant_scope_idx on public.pricing_rule (tenant_id, scope, priority desc);
`

let gecen = 0
let kalan = 0
function kanit(ad, kosul, ayrinti = '') {
  if (kosul) gecen++
  else kalan++
  yaz(`${kosul ? 'GEÇTİ ' : 'KALDI '} ${ad}${ayrinti ? ` — ${ayrinti}` : ''}`)
}

async function denePsql(db, sql) {
  try {
    await uygula(db, sql)
    return { ok: true }
  } catch (e) {
    // Gerçek koşuda (`psql -f`, ON_ERROR_STOP) bağlantı kapanır ve açık işlem geri alınır; PGlite oturumu açık kaldığı için elle.
    await db.exec('rollback;').catch(() => {})
    return { ok: false, kod: e.code, mesaj: String(e.message) }
  }
}

async function dene(db, sql) {
  try {
    await db.exec(sql)
    return { ok: true }
  } catch (e) {
    return { ok: false, kod: e.code, mesaj: String(e.message) }
  }
}

/** Alan-alan ekleme: varsayılan = ürün kapsamlı, sabit, adet 1, tüm kitaplar; `ek` ile alanlar ezilir. */
function ekle(tenant, urun, ek = {}) {
  const satir = { tenant_id: tenant, scope: 1, product_id: urun, method: 'fixed', fixed_price: 100, min_quantity: 1, ...ek }
  const kolonlar = Object.keys(satir)
  const degerler = kolonlar.map((k) => (satir[k] === null || typeof satir[k] === 'number' ? String(satir[k]) : `'${satir[k]}'`))
  return `insert into public.pricing_rule (${kolonlar.join(', ')}) values (${degerler.join(', ')});`
}

async function sayi(db, sql) {
  const r = await db.query(sql)
  return Number(Object.values(r.rows[0])[0])
}

async function temizVeri() {
  yaz('── 1) Temiz veri (canlı ölçüm: 1 satır) + migration ──')
  const db = new PGlite()
  await db.exec(TABLO)
  await db.exec(ekle(T1, P1)) // canlıdaki tek satırı taklit eder
  const m1 = await denePsql(db, migrationSql)
  kanit('migration temiz veride uygulanır', m1.ok, m1.mesaj ?? '')
  kanit('indeks oluştu (pg_indexes)', (await sayi(db, `select count(*) from pg_indexes where indexname='pricing_rule_urun_tek_sabit_uq'`)) === 1)
  const m2 = await denePsql(db, migrationSql)
  kanit('migration İKİNCİ kez koşar (idempotent)', m2.ok, m2.mesaj ?? '')

  yaz('── 2) İhlal: aynı tenant + ürün için ikinci sabit kural ──')
  const ihlal = await dene(db, ekle(T1, P1))
  kanit('ikinci sabit kural INSERT → 23505', !ihlal.ok && ihlal.kod === '23505', ihlal.mesaj ?? 'HATA VERMEDİ')
  kanit('hata mesajı indeks adını taşır', (ihlal.mesaj ?? '').includes('pricing_rule_urun_tek_sabit_uq'), ihlal.mesaj ?? '')

  yaz('── 3) Koşul DIŞI satırlar engellenmez ──')
  const izinli = [
    ['başka ürün', ekle(T1, P2)],
    ['aynı ürün, başka tenant', ekle(T2, P1)],
    ['kitaplı sabit kural (price_book_id dolu)', ekle(T1, P1, { price_book_id: KITAP })],
    ['adet>1 kademeli sabit kural', ekle(T1, P1, { min_quantity: 10, fixed_price: 90 })],
    ['scope 0 (varyant) sabit kural', ekle(T1, P1, { scope: 0 })],
    ['aynı ürüne cost_plus kuralı', ekle(T1, P1, { method: 'cost_plus', margin_pct: 20, fixed_price: null })],
  ]
  for (const [ad, sql] of izinli) {
    const r = await dene(db, sql)
    kanit(`${ad} EKLENEBİLİR`, r.ok, r.mesaj ?? '')
  }

  yaz('── 4) Para birimli / dönemli sabit kural koşula GİRMEZ → engellenmez ──')
  const pb = await dene(db, ekle(T1, P2, { currency: 'USD' }))
  kanit('aynı ürüne para birimli sabit kural EKLENEBİLİR', pb.ok, pb.mesaj ?? '')
  const pw = await dene(db, ekle(T1, P2, { valid_from: '2027-01-01', valid_to: '2027-02-01' }))
  kanit('aynı ürüne dönemli (kampanya) sabit kural EKLENEBİLİR', pw.ok, pw.mesaj ?? '')
  const p3 = await dene(db, ekle(T1, P3))
  kanit('yeni üründe süresiz, para birimi kısıtsız sabit kural EKLENEBİLİR (ilki)', p3.ok, p3.mesaj ?? '')
  const p2b = await dene(db, ekle(T1, P3))
  kanit('…ama ikincisi → 23505', !p2b.ok && p2b.kod === '23505', p2b.mesaj ?? 'HATA VERMEDİ')

  yaz('── 5) UPDATE yolu ──')
  const cp = await db.query(`select id from public.pricing_rule where tenant_id='${T1}' and product_id='${P1}' and method='cost_plus'`)
  const up = await dene(db, `update public.pricing_rule set method='fixed', fixed_price=50 where id='${cp.rows[0].id}';`)
  kanit('cost_plus kuralını fixed yapıp ikinci eşleşme yaratmak → 23505', !up.ok && up.kod === '23505', up.mesaj ?? 'HATA VERMEDİ')
  const adet = await db.query(`select id from public.pricing_rule where tenant_id='${T1}' and product_id='${P1}' and min_quantity=10`)
  const up2 = await dene(db, `update public.pricing_rule set min_quantity=1 where id='${adet.rows[0].id}';`)
  kanit('adet 10 → 1 yapıp ikinci eşleşme yaratmak → 23505', !up2.ok && up2.kod === '23505', up2.mesaj ?? 'HATA VERMEDİ')

  yaz('── 6) Silme sonrası yeniden ekleme ──')
  await db.exec(`delete from public.pricing_rule where tenant_id='${T1}' and product_id='${P1}' and scope=1 and method='fixed' and price_book_id is null and min_quantity=1;`)
  const yeni = await dene(db, ekle(T1, P1))
  kanit('kural silinince aynı ürüne yeniden eklenebilir', yeni.ok, yeni.mesaj ?? '')
  await db.close()
}

async function ihlalliVeri() {
  yaz('── 7) Ön-guard: ihlalli veride migration DÜŞER ve indeks OLUŞMAZ ──')
  const db = new PGlite()
  await db.exec(TABLO)
  await db.exec(ekle(T1, P1))
  await db.exec(ekle(T1, P1)) // indeks henüz yok → yinelenen satır eklenebilir
  const satir = await sayi(db, `select count(*) from public.pricing_rule where product_id='${P1}'`)
  kanit('fikstür: indeks yokken aynı ürüne 2 sabit kural yazıldı', satir === 2, `satır=${satir}`)
  const m = await denePsql(db, migrationSql)
  kanit('migration ihlalli veride EXCEPTION ile düşer', !m.ok && (m.mesaj ?? '').includes('iptal'), m.mesaj ?? 'HATA VERMEDİ')
  // Gerçek koşuda (`psql -f`, ON_ERROR_STOP) bağlantı kapanır ve açık işlem geri alınır; PGlite oturumu açık kaldığı için elle.
  await dene(db, 'rollback;')
  kanit('indeks OLUŞMADI (atomik geri alma)', (await sayi(db, `select count(*) from pg_indexes where indexname='pricing_rule_urun_tek_sabit_uq'`)) === 0)
  await db.close()
}

async function gecersizIndeks() {
  yaz('── 8) Yarım kalmış (GEÇERSİZ) indeks varsa yeniden koşum onu düşürüp geçerlisini kurar ──')
  const db = new PGlite()
  await db.exec(TABLO)
  await db.exec(ekle(T1, P1))
  await uygula(db, migrationSql)
  await db.exec(`update pg_index set indisvalid = false where indexrelid = 'public.pricing_rule_urun_tek_sabit_uq'::regclass;`)
  const bozuk = await sayi(db, `select count(*) from pg_index where indexrelid = 'public.pricing_rule_urun_tek_sabit_uq'::regclass and not indisvalid`)
  kanit('fikstür: indeks GEÇERSİZ yapıldı', bozuk === 1)
  const m = await denePsql(db, migrationSql)
  kanit('yeniden koşum başarılı', m.ok, m.mesaj ?? '')
  const iyi = await sayi(db, `select count(*) from pg_index where indexrelid = 'public.pricing_rule_urun_tek_sabit_uq'::regclass and indisvalid and indisunique`)
  kanit('indeks yeniden GEÇERLİ ve tekil', iyi === 1)
  await db.close()
}

await temizVeri()
await ihlalliVeri()
await gecersizIndeks()
yaz(`\nSONUÇ: ${gecen} geçti, ${kalan} kaldı`)
process.exit(kalan === 0 ? 0 : 1)
