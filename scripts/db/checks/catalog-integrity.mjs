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
/** scripts/db/checks -> depo koku (uc seviye yukari). Kaynak tarayan kontroller buradan yurur. */
const REPO_KOK = path.join(__dirname, '..', '..', '..')

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
  /* ──────────────────────────────────────────────────────────────────────────
   * T158 — SONEK KAPSAMI OLCULEREK GENISLETILDI (2026-08-23).
   *
   * Kural yeni DEGIL; kapsami dardi. Onceki sonek kumesi dokuz kalemdi
   * (v|m3h|w|pa|kg|mm|a|ls|pct) ve cetvelin K1 listesiyle ORTUSMUYORDU: adi
   * birim tasiyan bes alan kapinin gormedigi yerdeydi. Canli DB'de
   * technical_specs'in TUM anahtar sonekleri sayildi (374 aktif urun, 34 ayri
   * sonek) ve birim olanlarla olmayanlar ELLE ayrildi:
   *   · BIRIM (kapsama alindi): _c (2 anahtar) · _l (1) · _ms (2) · _hz (1)
   *     · _db (1) · _kw (1) · _24h (1)
   *   · BIRIM DEGIL (KASTEN disarida): _sensor · _curve · _type · _rating
   *     · _class(es) · _marking · _model · _size · _code · _poles · _blades
   *     · _speeds · _timer · _bypass · _humidistat · _compliant · _max
   * Ikinci kumeyi eklemek kapiyi gurultuye bogar ve kapi kapatilir.
   *
   * Genisletmenin OLCULEN bedeli: bir tek yeni sinif — operating_temperature_c
   * (Vortice, 3 kayit, "5 - 32"). Yani sonek kumesini 9'dan 16'ya cikarmak
   * SIFIR yanlis-kirmizi uretti; tabana gerekcesiyle yazildi.
   * ────────────────────────────────────────────────────────────────────────── */
  {
    id: 'spec-type',
    title: 'Birimli sayısal alanda metin değer',
    why: 'Adı bir SI birimiyle biten alan sayı taşımak zorundadır (spec-axis-standard §K1). "380 V" gibi birimi metne gömülü bir değer sıralanamaz, filtrelenemez, karşılaştırılamaz; aynı alanın bazı satırda sayı bazı satırda metin olması bu üç yüzeyi de sessizce bozar.',
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
            and k.key ~ '_(v|m3h|w|pa|kg|mm|a|ls|pct|c|l|ms|hz|db|kw|24h)$'
            and (p.technical_specs->>k.key) is not null
            and (p.technical_specs->>k.key) <> ''
            and (p.technical_specs->>k.key) !~ '^[0-9]+(\\.[0-9]+)?$'
          group by k.key, b.name`,
    key: (r) => `spec-type:${r.key}|${r.brand}`,
    detail: (r) => `${r.n} kayıt · ör. "${r.sample_value}" (${r.sample_sku}) — sayı değil`,
  },
  {
    id: 'slug-unresolved',
    title: 'Kaynak koda gömülü kategori slug\'ı canlı taksonomide çözülmüyor',
    why: 'Vitrindeki bazı kategori bağlantıları ve bölüm koşulları DB\'den değil, koda yazılmış sabit dizeden kurulur. Böyle bir dize hiçbir kategoriye karşılık gelmediğinde ne tip hatası ne kırmızı test doğar: bağlantı kullanıcıyı boş sayfaya götürür, koşul hiç açılmaz ve kodu okuyan "bu bölüm var" sanır. Kusur tek tek satırlarda değil, sabit slug yazılabilmesinde ve doğruluğunun HİÇ ölçülmemesinde.',
    // SQL DEĞİL, KAYNAK TARAR: bu yüzden `sql` yerine `collect` taşır (koşucu ikisini de bilir).
    collect: async (client) => {
      const { rows: catRows } = await client.query(
        `select slug,
                metadata->'slug'->>'tr' as tr_slug,
                metadata->'slug'->>'en' as en_slug
         from public.categories`,
      )
      const cozulur = new Set()
      for (const r of catRows) for (const s of [r.slug, r.tr_slug, r.en_slug]) if (s) cozulur.add(s)

      // Kapının kendi ön koşulu: taksonomi boş dönerse HER literal "çözülmüyor" görünür ve kapı
      // toptan yanlış-kırmızı verir. Ölçemeyen kapı ne yeşil ne kırmızı demeli — ölçülemedi demeli.
      if (cozulur.size === 0) {
        throw new Error('slug-unresolved: categories tablosu BOS dondu — taksonomi okunamadi, OLCULEMEDI')
      }

      return scanSourceSlugLiterals()
        .filter((b) => !cozulur.has(b.slug))
        .map((b) => ({ ...b, taksonomi_boyutu: cozulur.size }))
    },
    key: (r) => `slug-unresolved:${r.file}|${r.slug}`,
    detail: (r) => `${r.file}:${r.line} — "${r.slug}" (${r.pattern}); canli taksonomide ${r.taksonomi_boyutu} slug var, bu yok`,
  },
]

/**
 * `src/` altında KATEGORİ slug'ı olduğu KESİN olan sabit dizeleri toplar.
 *
 * Desenler bilerek DAR: yalnız kategori rotası kuran ve kategori slug'ı karşılaştıran biçimler.
 * `.includes('...')` gibi parça eşleşmeleri ve ürün/marka/aile slug'ları KAPSAM DIŞI — geniş bir
 * tarama, kategori olmayan dizeleri "çözülmedi" diye kırmızıya çevirir, kapı gürültüye boğulur ve
 * kapatılır. Dar kapı, kapatılan kapıdan iyidir.
 *
 * Testler HARİÇ: test dosyaları KASTEN var olmayan slug taşır (sabotaj fikstürleri, kayıtlı
 * karar-bekleyenler). Onları saymak, kapıyı kendi kanıtıyla çelişkiye düşürürdü.
 */
function scanSourceSlugLiterals() {
  const SRC = path.join(REPO_KOK, 'src')
  const DESENLER = [
    { ad: "Routes.category('X')", re: /Routes\.category\(\s*'([a-z0-9-]+)'/g , ornek: "Routes.category('kanarya-slug')"},
    // Ilk argumanda IC ICE CAGRI olmamali. `Routes.category(getLocalizedCategorySlug(cat, 'tr'))`
    // gibi bir ifadede eski desen ic fonksiyonun DIL argumanini ('tr') alt-slug saniyordu —
    // sitemap.ts iki yanlis-kirmizi uretti. Ilk argumani tanimlayici/uye ifadesiyle sinirlamak
    // `Routes.category(categoryUrlSlug, 'elektrikli-isitici')` gercek isabetini korur.
    { ad: "Routes.category(_, 'X')", re: /Routes\.category\(\s*(?:'[a-z0-9-]+'|[A-Za-z_$][\w$.]*)\s*,\s*'([a-z0-9-]+)'/g , ornek: "Routes.category(ustSlug, 'kanarya-slug')"},
    // Alici ADIYLA sinirli: `b.slug === 'nicotra-gebhardt'` bir MARKA slug'idir ve genel
    // `.slug === 'X'` deseni onu kategori sanip yanlis-kirmizi uretmisti. Ayni alan adi farkli
    // varliklarda yasiyor; kapi hangi varligi olctugunu bilmek zorunda.
    { ad: "category.slug === 'X'", re: /(?:category|subCategory|mainCategory|subcategory)\.slug\s*===\s*'([a-z0-9-]+)'/g , ornek: "category.slug === 'kanarya-slug'"},
    { ad: "categorySlug: 'X'", re: /\bcategorySlug\s*:\s*'([a-z0-9-]+)'/g , ornek: "categorySlug: 'kanarya-slug'"},
    { ad: "subSlug: 'X'", re: /\bsubSlug\s*:\s*'([a-z0-9-]+)'/g , ornek: "subSlug: 'kanarya-slug'"},
  ]

  // ── DESEN KANARYASI ────────────────────────────────────────────────────────
  // Her desen, tanidigini iddia ettigi bicimi GERCEKTEN taniyor mu? Bu blok bir
  // paranoya degil, yasanmis bir kusurun panzehiri: 2026-08-23'te desenlerden birinin
  // basina gorunmez bir BACKSPACE (U+0008) karakteri sizdi (kabuk \b kacisini yedi).
  // Regex sorunsuz derlendi, .source ekranda DOGRU gorundu, ve HICBIR SEYLE eslesmedi.
  // Kapi yesil donuyordu; oysa o desen kordu ve iki gercek ihlali hic gormuyordu.
  // Kor desen, olmayan desenden TEHLIKELIDIR: varligi guvence sanilir.
  for (const desen of DESENLER) {
    const eslesme = desen.ornek.match(desen.re)
    desen.re.lastIndex = 0
    if (!eslesme) {
      throw new Error(
        `slug-unresolved: "${desen.ad}" deseni KENDI ORNEGINI tanimiyor — desen bozuk, tarama KOR. ` +
        `ornek: ${desen.ornek} · desen: ${desen.re.source}`,
      )
    }
  }

  const bulgular = []
  const gez = (dizin) => {
    for (const girdi of fs.readdirSync(dizin, { withFileTypes: true })) {
      const tam = path.join(dizin, girdi.name)
      if (girdi.isDirectory()) {
        if (girdi.name === '__tests__' || girdi.name === 'node_modules') continue
        gez(tam)
        continue
      }
      if (!/\.tsx?$/.test(girdi.name) || /\.test\.tsx?$/.test(girdi.name)) continue
      const icerik = fs.readFileSync(tam, 'utf8')
      const goreli = path.relative(REPO_KOK, tam).replace(/\\/g, '/')
      for (const desen of DESENLER) {
        for (const eslesme of icerik.matchAll(desen.re)) {
          const satir = icerik.slice(0, eslesme.index).split('\n').length
          bulgular.push({ file: goreli, line: satir, slug: eslesme[1], pattern: desen.ad })
        }
      }
    }
  }
  gez(SRC)
  return bulgular
}

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
      // Iki tur kontrol var: `sql` tasiyanlar dogrudan sorgulanir, `collect` tasiyanlar kendi
      // olcumunu yapar (or. kaynak kodu tarayip DB ile karsilastiran `slug-unresolved`).
      const rows = await (check.collect
        ? check.collect(client)
        : client.query(check.sql).then((r) => r.rows))
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
