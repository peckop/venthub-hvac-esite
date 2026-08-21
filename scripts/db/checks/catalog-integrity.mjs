#!/usr/bin/env node
/**
 * Katalog bütünlüğü kapısı — T099.
 *
 * NİÇİN VAR: "aile adı içeriğine uyuyor mu" bir YARGIDIR; statik tarama da SQL de bunu karara
 * bağlayamaz. O yüzden burada semantik uyum ÖLÇÜLMEZ — ölçülse "kapı var" sanılır ve sahte yeşil
 * üretir. Burada yalnız **kesin olarak ölçülebilen** değişmezler var; her biri, T099'da gerçekten
 * yaşanmış bir kusurun makineyle görülebilen izidir.
 *
 * CIRCIR (ratchet): bugünkü ihlallerin düzeltilmesi prod yazımıdır (Recep kapısı). Kapı bu yüzden
 * "sıfır ihlal" istemez; bilinen ihlalleri `catalog-integrity-baseline.json` içinde adıyla tutar ve
 * **tabanın dışındaki her yeni ihlalde KIRMIZI** olur. Taban yalnız küçülebilir.
 *
 * ⚠️ BİLEREK VERİLEN KARAR — bayat taban satırı kırmızı YAPMAZ, yalnız uyarır.
 * Gerekçe: taban satırı, veri prod'da düzeltildiği anda bayatlar. Bunu kırmızı yapsaydık, Recep'in
 * bir veri düzeltmesi, konuyla ilgisi olmayan bir şeridin PR'ını kırardı — yani kapı, kimsenin
 * hatası olmayan bir anda YANLIŞ KIRMIZI verirdi (yanlış-kırmızı da bir kusurdur). Bayat satır
 * sınıfın geri gelmesine de yol açamaz; en kötü ihtimalle taban gereğinden geniş kalır. Karşılığı:
 * tabanı küçültmek, veri düzeltme işinin PARÇASIDIR (cetvel bunu yazar).
 *
 * KOŞTURMA:
 *   SUPABASE_DB_URL=... node scripts/db/checks/catalog-integrity.mjs [--json]
 * Bağlantı dizesi yoksa çıkış kodu 0'dır ve "ÖLÇÜLEMEDİ" der — "geçti" DEMEZ (mekanizma ilanı
 * kuralı: kapı kendi günlüğünden pozitif satır göstermeden çalıştığını iddia edemez).
 */
import pg from 'pg'
import fs from 'node:fs'
import tls from 'node:tls'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASELINE_PATH = path.join(__dirname, 'catalog-integrity-baseline.json')

/**
 * Her kontrol bir anahtar kümesi üretir. Anahtar = ihlalin KİMLİĞİ; taban bu anahtarları tutar.
 * Anahtarın insan-okur olması şart: taban dosyasına bakan biri neyi muaf tuttuğunu görmeli.
 */
const CHECKS = [
  {
    id: 'dup-name',
    title: 'Aile içinde çakışan ürün adı',
    why: 'Ad tek başına ayırt edici değilse, yalnız adı gösteren yüzey (sepet, e-posta, fatura) iki farklı ürünü aynı gösterir.',
    sql: `select f.name as family_name, p.name as product_name, count(*)::int as n,
                 string_agg(p.sku, ', ' order by p.sku) as skus
          from public.products p
          join public.product_families f on f.id = p.family_id
          group by f.name, p.name
          having count(*) > 1`,
    key: (r) => `dup-name:${r.family_name}|${r.product_name}`,
    detail: (r) => `${r.n} kayıt — ${r.skus}`,
  },
  {
    id: 'dup-label',
    title: 'Aile içinde çakışan ayırt edici etiket (model_code || sku)',
    why: 'Ürün detay sayfası varyantı bu etiketle ayırıyor. Çakışırsa müşteri iki varyantı ayırt edemez ve seçim yüzeyi anlamsızlaşır.',
    sql: `select f.name as family_name,
                 coalesce(nullif(p.model_code, ''), p.sku) as label,
                 count(*)::int as n
          from public.products p
          join public.product_families f on f.id = p.family_id
          group by f.name, coalesce(nullif(p.model_code, ''), p.sku)
          having count(*) > 1`,
    key: (r) => `dup-label:${r.family_name}|${r.label}`,
    detail: (r) => `${r.n} kayıt`,
  },
  {
    id: 'orphan',
    title: 'Ailesiz ürün',
    why: 'Aile URL kanonik adrestir; ailesiz ürünün kanonik bir vitrin adresi yoktur.',
    sql: `select p.sku, p.name from public.products p where p.family_id is null`,
    key: (r) => `orphan:${r.sku}`,
    detail: (r) => r.name,
  },
  {
    id: 'brand-mix',
    title: 'Aile içinde marka karışımı',
    why: 'Aile tek bir üreticinin serisidir; birden çok marka (ya da boş marka) aile sınırının yanlış çizildiğini gösterir.',
    sql: `select f.name as family_name,
                 count(distinct p.brand)::int as brands,
                 string_agg(distinct coalesce(p.brand, '(bos)'), ' / ') as brand_list
          from public.products p
          join public.product_families f on f.id = p.family_id
          group by f.name
          having count(distinct p.brand) <> 1 or bool_or(p.brand is null)`,
    key: (r) => `brand-mix:${r.family_name}`,
    detail: (r) => r.brand_list,
  },
  /* ──────────────────────────────────────────────────────────────────────────
   * T140 — BİRİM SÖZLEŞMESİ (2026-08-21). Cetvel: product-schema-standard §11.6.
   *
   * Ölçüm: `max_absorbed_power_w` alanı SEAT'te 0,06–7,5 arası değer taşıyor,
   * Vortice'te 4–10230. Yani aynı alan, aynı tablo, markaya göre FARKLI BİRİM
   * (kW vs W). Bu "boş alan"dan tehlikelidir: boş alan görünür, yanlış birim
   * DOLU ve makul görünür. Karşılaştırma, sıralama, filtreleme ve hesaplayıcı
   * yüzeylerinin hepsi bu alanda yanlış sonuç verir, hiçbiri kırmızı vermez.
   *
   * ⚠️ YANLIŞ-KIRMIZI TUZAKLARI (ölçülüp ELENDİ — kural yazmadan ÖNCE bakıldı):
   *   • `blade_diameter_mm` 3000–7000: GERÇEK veri. NORDIK HVLS HYPERBLADE
   *     tavan fanları 3–7 METRE kanatlı. "Şüpheli büyük sayı" kuralı yazsaydık
   *     7 doğru satırı kırmızı yapardı.
   *   • `frequency_hz = 0`: BRA.VO S1–S4, 5 V'luk DC cihazlar; 0 Hz orada
   *     anlamlı. Bu bir birim hatası değil, alan-uygunluğu konusu.
   * Bu yüzden kapsam, KESİN olarak ölçülebilen iki sınıfla sınırlı tutuldu.
   * ────────────────────────────────────────────────────────────────────────── */
  {
    id: 'spec-unit',
    title: 'Birim kayması: alan adının ima ettiği birimle bağdaşmayan değer',
    why: 'Alan adı birimi TAAHHÜT eder. Bir HVAC fanının/sürücüsünün çektiği güç 1 W altında olamaz; 1 W altındaki bir `max_absorbed_power_w` değeri oraya kW yazıldığı anlamına gelir. Değer dolu ve makul göründüğü için hiçbir yüzey şikâyet etmez, ama karşılaştırma ve hesap yanlış olur.',
    // Anahtar SKU bazında DEĞİL, alan|marka bazında: tek bir ingestion hatası 81 ürüne
    // yayıldığı için SKU bazlı taban 191 gerekçesiz satır olurdu ve kimse okumazdı.
    // Sınıf bazlı taban, "bu marka bu alanda hâlâ yanlış birimde" der ve marka
    // düzeltilince TEK satır silinir. (dup-name'in grup bazlı anahtarıyla aynı desen.)
    sql: `select b.name as brand, count(*)::int as n,
                 min((p.technical_specs->>'max_absorbed_power_w')::numeric) as min_value,
                 max((p.technical_specs->>'max_absorbed_power_w')::numeric) as max_value,
                 (array_agg(p.sku order by p.sku))[1] as sample_sku
          from public.products p
          join public.product_families f on f.id = p.family_id
          join public.brands b on b.id = f.brand_id
          where p.deleted_at is null
            and p.technical_specs->>'max_absorbed_power_w' ~ '^[0-9]+(\\.[0-9]+)?$'
            and (p.technical_specs->>'max_absorbed_power_w')::numeric < 1
          group by b.name`,
    key: (r) => `spec-unit:max_absorbed_power_w|${r.brand}`,
    detail: (r) => `${r.n} kayıt · ${r.min_value}–${r.max_value} (1 W altı = kW yazılmış) · ör. ${r.sample_sku}`,
  },
  {
    id: 'spec-type',
    title: 'Birimli sayısal alanda metin değer',
    why: 'Adı bir SI birimiyle biten alan (`_v`, `_m3h`, `_w`, `_pa`, `_kg`, `_mm`, `_a`, `_ls`, `_pct`) sayı taşımak zorundadır. "380 V" gibi birimi metne gömülü bir değer sıralanamaz, filtrelenemez, karşılaştırılamaz; aynı alanın bazı satırda sayı bazı satırda metin olması bu üç yüzeyi de sessizce bozar.',
    // Anahtar alan|marka bazında — gerekçesi yukarıdaki `spec-unit` ile aynı.
    sql: `select k.key, b.name as brand, count(*)::int as n,
                 (array_agg(p.technical_specs->>k.key order by p.sku))[1] as sample_value,
                 (array_agg(p.sku order by p.sku))[1] as sample_sku
          from public.products p
          join public.product_families f on f.id = p.family_id
          join public.brands b on b.id = f.brand_id
          cross join lateral jsonb_object_keys(p.technical_specs) k(key)
          where p.deleted_at is null
            and p.technical_specs is not null
            and k.key ~ '_(v|m3h|w|pa|kg|mm|a|ls|pct)$'
            and (p.technical_specs->>k.key) is not null
            and (p.technical_specs->>k.key) <> ''
            and (p.technical_specs->>k.key) !~ '^[0-9]+(\\.[0-9]+)?$'
          group by k.key, b.name`,
    key: (r) => `spec-type:${r.key}|${r.brand}`,
    detail: (r) => `${r.n} kayıt · ör. "${r.sample_value}" (${r.sample_sku}) — sayı değil`,
  },
]

/**
 * TLS ayarı — doğrulama DAİMA açık.
 *
 * Depodaki eski DB betikleri `rejectUnauthorized: false` kullanıyor; o deseni DEVRALMIYORUM.
 * Bu bağlantı prod DB kimlik bilgisi taşıyor ve repo PUBLIC; doğrulama kapatılırsa aradaki
 * bir taraf bağlantıyı dinleyebilir ve bunu hiçbir çıktı göstermez.
 *
 * Supabase sunucusu kendi kök sertifikasıyla imzalı bir zincir sunar; sistem güven deposu bunu
 * tanımaz. Bu yüzden kök sertifika `PGSSLROOTCERT` ile VERİLİR. Verilmezse bağlantı ölür ve
 * betik çıkış kodu 2 ile "ÖLÇÜLEMEDİ" der — sessizce güvenip "yeşil" demez.
 */
function resolveTls() {
  const caPath = process.env.PGSSLROOTCERT
  if (!caPath) return { rejectUnauthorized: true }

  const provided = fs.readFileSync(caPath, 'utf8')
  const blocks = (provided.match(/-----BEGIN CERTIFICATE-----/g) ?? []).length
  if (blocks === 0) {
    // Sırrın içeriği PEM değil. En sık sebep: panoya kopyalarken satır sonlarının kaybolması.
    // Sessizce sistem deposuna düşmek YANLIŞ olurdu — hata mesajı o zaman sertifikayı değil
    // sunucuyu suçlar ve saatler kaybettirir.
    throw new Error(`PGSSLROOTCERT bir PEM sertifikasi degil (BEGIN CERTIFICATE blogu yok, ${provided.length} bayt).`)
  }
  console.log(`catalog-integrity: kok sertifika yuklendi (${blocks} blok, ${provided.length} bayt)`)

  // NİÇİN SİSTEM KÖKLERİ DE: `ca` verildiğinde Node varsayılan güven deposunu DEVRE DIŞI
  // bırakır. Supabase'in doğrudan bağlantısı kendi özel kökünü kullanıyor, havuz (pooler)
  // ucu ise kamuya açık bir CA kullanabiliyor; yalnız birini vermek diğerini kırar. İkisini
  // birden vermek doğrulamayı ZAYIFLATMAZ — güvenilen kök kümesini eksiksiz yapar.
  return { ca: [...tls.rootCertificates, provided], rejectUnauthorized: true }
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return { entries: {} }
  const parsed = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
  return { entries: parsed.entries ?? {} }
}

/**
 * İhlalleri prod DB'den toplar.
 */
async function collectFromDatabase(connectionString) {
  // `sslmode` URL'DEN SÖKÜLÜR. node-postgres bağlantı dizesini kendi ayrıştırıcısıyla okuyor ve
  // oradaki `sslmode` bizim verdiğimiz `ssl` nesnesinin YERİNE geçebiliyor — o an kök sertifikamız
  // devre dışı kalıyor ve zincir "self-signed certificate in certificate chain" ile düşüyor.
  // Belirti sinsiydi: aynı betik aynı sertifikayla YERELDE çalışıyordu (yerel dizede `sslmode` yok),
  // CI'da çalışmıyordu. Yani kusur koda ya da sertifikaya değil, ikisinin ARASINDAKİ önceliğe aitti.
  const hadSslMode = /[?&]sslmode=/.test(connectionString)
  const cleaned = connectionString.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  if (hadSslMode) console.log('catalog-integrity: baglanti dizesindeki sslmode kaldirildi (TLS ayari kodda belirlenir)')

  const client = new pg.Client({ connectionString: cleaned, ssl: resolveTls() })
  await client.connect()
  const found = new Map()
  try {
    for (const check of CHECKS) {
      const { rows } = await client.query(check.sql)
      for (const row of rows) found.set(check.key(row), { check, detail: check.detail(row) })
    }
  } finally {
    await client.end()
  }
  return found
}

/**
 * İhlalleri bir fikstür dosyasından toplar (`--fixture <yol>`, JSON: string dizisi).
 *
 * NİÇİN VAR: kapının KARAR mantığı (taban farkı, çıkış kodları) DB'siz sınanabilmeli. Bir kapıyı
 * "çalışıyor" diye ilan etmeden önce onu BİLEREK bozup kırmızı gördüğümü kanıtlamam gerekiyor
 * (memory: prove-the-gate-with-deliberate-failure) ve bu, canlı veriye bağlı olmamalı — canlı veri
 * değişir, sınav deterministik kalmalı. Fikstür yolu ÜRETİMDE kullanılmaz; CI DB yolunu koşar.
 */
function collectFromFixture(fixturePath) {
  const keys = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
  const byId = new Map(CHECKS.map((c) => [c.id, c]))
  const found = new Map()
  for (const key of keys) {
    const check = byId.get(String(key).split(':')[0]) ?? CHECKS[0]
    found.set(key, { check, detail: '(fikstur)' })
  }
  return found
}

async function main() {
  const asJson = process.argv.includes('--json')
  const fixtureIdx = process.argv.indexOf('--fixture')
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

  let found
  if (fixtureIdx !== -1) {
    found = collectFromFixture(process.argv[fixtureIdx + 1])
  } else if (!connectionString) {
    // ÇIKIŞ 0 DEĞİL. Eskiden burada `exit 0` vardı ve "ÖLÇÜLEMEDİ" yalnız bir ETİKETTİ — iş yeşil
    // dönüyordu. Yani kapı, ölçemediği hâlde "geçti" diyordu; tam da bugün üç kez yaşanan
    // "yoklukla ölçme" sınıfı. Ölçemeyen kapı YEŞİL DÖNMEZ. Sırların hiç verilmediği hâl (fork
    // PR'ı) iş SEVİYESİNDE atlanır (workflow `if:` koşulu) — atlanmış iş "başarılı" değildir.
    console.error('catalog-integrity: OLCULEMEDI — baglanti dizesi yok (SUPABASE_DB_URL). Kapi olcemedigi icin YESIL DONMUYOR.')
    process.exit(2)
  } else {
    found = await collectFromDatabase(connectionString)
  }

  const baseline = loadBaseline()
  const fresh = [...found.entries()].filter(([key]) => !(key in baseline.entries))
  const stale = Object.keys(baseline.entries).filter((key) => !found.has(key))

  if (asJson) {
    console.log(JSON.stringify({
      found: [...found.keys()],
      fresh: fresh.map(([key]) => key),
      stale,
    }, null, 2))
  }

  console.log(`catalog-integrity: toplam ihlal ${found.size} | tabanda ${found.size - fresh.length} | YENI ${fresh.length} | bayat taban satiri ${stale.length}`)

  for (const key of stale) {
    console.log(`::warning title=Bayat taban satiri::${key} artik ihlal DEGIL — ${BASELINE_PATH} icinden silinmeli (veri duzeltme isinin parcasi).`)
  }

  if (fresh.length === 0) {
    console.log('catalog-integrity: tabanin disinda YENI ihlal yok -> YESIL')
    process.exit(0)
  }

  console.log('')
  console.log('catalog-integrity: TABANIN DISINDA YENI IHLAL VAR -> KIRMIZI')
  for (const [key, { check, detail }] of fresh) {
    console.log(`  [${check.id}] ${key}`)
    console.log(`        ${detail}`)
    console.log(`        nicin: ${check.why}`)
  }
  console.log('')
  console.log('Bu ihlal katalog verisinde YENI dogdu. Ya veri duzeltilir, ya da bilincli bir karar')
  console.log('ise tabana GEREKCESIYLE yazilir. Gerekcesiz taban satiri kabul edilmez.')
  process.exit(1)
}

main().catch((err) => {
  const isCertError = /certificate|self-signed|SELF_SIGNED/i.test(err.message)
  if (isCertError) {
    console.error('catalog-integrity: OLCULEMEDI — TLS zinciri dogrulanamadi:', err.message)
    console.error('Supabase kok sertifikasini PGSSLROOTCERT ile verin (dogrulamayi KAPATMAK cozum degildir).')
  } else {
    console.error('catalog-integrity: kosum HATASI —', err.message)
  }
  process.exit(2)
})
