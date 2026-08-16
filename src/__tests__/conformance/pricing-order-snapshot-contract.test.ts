/**
 * INV-PRICE-3 — Sipariş satırı anlık-görüntü (snapshot) sözleşmesi
 *
 * CETVEL: `docs/standards/pricing-standard.md` §4.1 (çoklu-para satış sözleşmesi) + §13
 * (zorunlu kurallar tablosu, "Sipariş satırında 9 snapshot alanı dolu" satırı) + §14 (enforcement).
 *
 * NEYİ KORUYOR. Sipariş satırı bir **fatura kaydıdır**, canlı kataloğun bir görünümü değil.
 * Ürün adı değişir, KDV oranı değişir, fiyat listesi değişir, kur oynar. Çekilen tutarın neye
 * dayandığı satırın kendisine yazılmadıysa, uyuşmazlık anında elde hiçbir şey kalmaz.
 *
 * NİÇİN BU TEST VAR. Bu tam olarak "yazılmış ama bağlanmamış" borcunun canlı örneğiydi:
 * `20250829_order_item_snapshots.sql` altı snapshot kolonunu 2025-08-29'da ekledi ve sipariş
 * kalemini yazan TEK yol (`supabase/functions/iyzico-payment`) bunlardan **hiçbirini**
 * doldurmadı. Kolonlar bir yıl boyunca NULL kaldı, hiçbir test bunu görmedi — çünkü hiçbir test
 * "kolon var mı"yı değil "kolonu DOLDURAN kod var mı"yı sormuyordu.
 *
 * TEHDİT MODELİ — bu bir **drift dedektörüdür**, güvenlik kontrolü değil. Dikkatli bir
 * geliştiricinin yeni bir sipariş-yazma yolu eklerken ya da mevcut yolu düzenlerken snapshot
 * alanlarını unutmasını yakalar. Kasıtlı atlatma (alan adını yorumda anmak, kaçak bir dinamik
 * tablo adı) kapsamda DEĞİLDİR; asıl fail-closed katman veritabanındaki NOT NULL kısıtlarıdır
 * (`20260815210000_pricing_w2b2_order_item_snapshots.sql`) — bu test onların da yerinde durduğunu
 * doğrular.
 *
 * ÜÇ YÖNLÜ BAĞ. Cetvel (§13) ↔ migration (NOT NULL DDL) ↔ kod (yazma yolu). Üçü birden
 * doğrulanır; birini değiştirip diğerini unutmak KIRMIZI verir.
 */
import { describe, expect, it } from 'vitest'

// Interface-merge ile mevcut global bildirime dizi-desenli aşırı yükleme eklenir
// (negatif `!` desenleri yalnız dizi biçiminde ifade edilebiliyor).
declare global {
  interface ImportMeta {
    glob(
      pattern: readonly string[],
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

/** Cetvel §13'ün saydığı 9 alan. Bu liste değişiyorsa §13 satırı da değişmeli. */
const SNAPSHOT_FIELDS = [
  'unit_price_snapshot',
  'price_list_id_snapshot',
  'product_name_snapshot',
  'product_sku_snapshot',
  'tax_rate_snapshot',
  'product_snapshot',
  'display_currency',
  'display_rate',
  'rate_effective_date',
] as const

/**
 * `price_list_id_snapshot` DIŞINDAKİ 8 alan veritabanında NOT NULL'dır. Liste kimliği bilerek
 * dışarıda: fiyat bir listeden değil bir kuraldan/tekliften gelebilir, o durumda liste YOKTUR.
 * Kodun alanı YAZMASI yine zorunlu (aşağıdaki kod taraması), ama değerin dolu olması değil.
 */
const NOT_NULL_FIELDS = SNAPSHOT_FIELDS.filter((f) => f !== 'price_list_id_snapshot')

/**
 * PARSER SAĞLIĞI ÇAPASI. Tarayıcının gerçekten bir şey gördüğünü kanıtlayan bilinen yol.
 * Sıfır yazma yolu bulmak "temiz" DEĞİL, "dedektör kör" demektir — bu ayrımı yapmayan bir
 * kapı sessiz-yeşile döner.
 */
const ANCHOR_WRITE_PATH = '/supabase/functions/iyzico-payment/index.ts'

const MIGRATION_PATH = '/supabase/migrations/20260815210000_pricing_w2b2_order_item_snapshots.sql'

// `!` deseni ŞART: eager glob içeriği filtreden ÖNCE okur; tests/e2e denoRuntime'ın
// geçici `*.compiled.<rastgele>.ts` dosyaları paralel koşuda ENOENT yarışı üretir.
const edgeSources = import.meta.glob(['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const appSources = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const migrationSql = import.meta.glob('/supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Test/mock dosyaları gerçek yazma yolu değildir. */
function isTestFile(path: string): boolean {
  return /__tests__|\.test\.|\.spec\.|\/tests?\//.test(path)
}

const productionSources: Record<string, string> = Object.fromEntries(
  [...Object.entries(edgeSources), ...Object.entries(appSources)].filter(([p]) => !isTestFile(p)),
)

/**
 * `venthub_order_items` tablosuna SATIR EKLEYEN dosyaları bulur. İki biçim tanınır:
 *
 *  A) Ham PostgREST: `` `${supabaseUrl}/rest/v1/venthub_order_items` `` + yakınında
 *     `method: 'POST'`. Tablo adından hemen sonra tırnak/backtick gelmesi şart — SELECT'ler
 *     `?order_id=eq...` sorgu dizesiyle gelir ve bu desene UYMAZ. `method` yakınlık koşulu,
 *     adın yalnızca yorumda geçtiği dosyaları eler.
 *  B) supabase-js: `.from('venthub_order_items')` + yakınında `.insert(` / `.upsert(`.
 */
function findsOrderItemInsert(src: string): boolean {
  const PROXIMITY = 700

  const rawUrl = /\/rest\/v1\/venthub_order_items(['"`])/g
  for (const m of src.matchAll(rawUrl)) {
    const window = src.slice(m.index ?? 0, (m.index ?? 0) + PROXIMITY)
    if (/method\s*:\s*['"`]POST['"`]/i.test(window)) return true
  }

  const jsFrom = /\.from\(\s*['"`]venthub_order_items['"`]\s*\)/g
  for (const m of src.matchAll(jsFrom)) {
    const window = src.slice(m.index ?? 0, (m.index ?? 0) + PROXIMITY)
    if (/\.(insert|upsert)\s*\(/.test(window)) return true
  }

  return false
}

const writePaths = Object.entries(productionSources)
  .filter(([, src]) => findsOrderItemInsert(src))
  .map(([path]) => path)
  .sort()

describe('INV-PRICE-3 — sipariş satırı snapshot sözleşmesi', () => {
  it('dedektör çalışıyor: bilinen yazma yolu bulunabiliyor (parser sağlığı)', () => {
    expect(
      writePaths,
      [
        `Bilinen sipariş-kalemi yazma yolu (${ANCHOR_WRITE_PATH}) bulunamadı.`,
        '',
        'YANLIŞ TEŞHİS UYARISI: bu KIRMIZI, "snapshot alanları silinmiş" demek DEĞİLDİR.',
        'Büyük ihtimalle yazma kodunun BİÇİMİ değişti (ör. ham fetch yerine supabase-js,',
        'ya da URL bir sabite taşındı) ve yukarıdaki `findsOrderItemInsert` tarayıcısı',
        'artık göremiyor. ÖNCE tarayıcıyı yeni biçime uyarla; kodu "onarmaya" çalışma.',
        '',
        `Şu an bulunan yollar: ${writePaths.length ? writePaths.join(', ') : '(HİÇBİRİ)'}`,
      ].join('\n'),
    ).toContain(ANCHOR_WRITE_PATH)
  })

  it('sipariş kalemi yazan HER yol 9 snapshot alanını da yazar', () => {
    const violations: string[] = []

    for (const path of writePaths) {
      const src = productionSources[path]
      const missing = SNAPSHOT_FIELDS.filter(
        // Nesne anahtarı olarak geçmeli: uzun biçim (`alan: deger`) ya da kısayol
        // (`{ alan, ... }` / `{ ..., alan }`). Yalnızca düz metin içinde anılması yetmez.
        (field) => !new RegExp(`\\b${field}\\s*[:,}]`).test(src),
      )
      if (missing.length > 0) violations.push(`${path} → eksik: ${missing.join(', ')}`)
    }

    expect(
      violations,
      [
        'Sipariş kalemi yazan bir yol snapshot alanlarını doldurmuyor.',
        '',
        'Sipariş satırı bir fatura kaydıdır: ürün adı/SKU/KDV oranı/birim fiyat/fiyat listesi',
        've gösterim kuru, SİPARİŞ ANINDAKİ hâliyle satıra yazılmalıdır. Katalog sonradan',
        'değiştiğinde geçmiş sipariş yeniden değerlenmemelidir.',
        '',
        'Bu alanların 8 tanesi veritabanında NOT NULL — eksik bırakmak zaten INSERT hatası',
        'verir. Bu test o hatayı prod yerine CI\'da gösterir.',
        '',
        "⚠️ YANLIŞ TEŞHİS UYARISI — bu KIRMIZI'yı okumadan koda dokunma:",
        'Bu tarayıcı STATİKTİR ve alan adlarını `.insert(`/POST ile AYNI DOSYADA arar',
        '(cetvel §14, "eş-konumluluk" notu). Satır kurucusunu paylaşılan bir modüle',
        'taşımak (ör. `_shared/orderItemSnapshot.ts`) sözleşmeyi BOZMAZ, aksine',
        'güçlendirir — ama bu testi haksız yere kırar. Böyle bir refactor yaptıysan',
        'doğru hamle ÖNCE tarayıcıyı yeni yapıya uyarlamaktır (kurucu modülünü de',
        '`writePaths`\'e dahil et); alanları geri kopyalamak DEĞİL.',
        '',
        'Gerçekten eksikse: 8 alan DB\'de NOT NULL, yani prod\'da zaten INSERT hatası alırsın.',
        '',
        'Cetvel: docs/standards/pricing-standard.md §4.1 + §13 + §14',
        '',
        ...violations,
      ].join('\n'),
    ).toEqual([])
  })

  it('şema tarafı: migration 3 yeni alanı ekler ve 8 alanı NOT NULL yapar', () => {
    const sql = migrationSql[MIGRATION_PATH]
    expect(
      sql,
      `Beklenen migration bulunamadı: ${MIGRATION_PATH}. Yeniden adlandırıldıysa bu testteki ` +
        'MIGRATION_PATH sabitini güncelle — snapshot sözleşmesinin fail-closed katmanı bu dosya.',
    ).toBeTruthy()

    const normalized = sql.toLowerCase()

    const missingAdds = ['display_currency', 'display_rate', 'rate_effective_date'].filter(
      (col) => !new RegExp(`add column if not exists\\s+${col}\\b`).test(normalized),
    )
    expect(missingAdds, `Migration şu kolonları eklemiyor: ${missingAdds.join(', ')}`).toEqual([])

    const missingNotNull = NOT_NULL_FIELDS.filter(
      (col) =>
        !new RegExp(`alter column\\s+${col}\\s+set not null`).test(normalized) &&
        !new RegExp(`add column if not exists\\s+${col}\\b[^,;]*not null`).test(normalized),
    )
    expect(
      missingNotNull,
      [
        `Migration şu kolonları NOT NULL yapmıyor: ${missingNotNull.join(', ')}`,
        '',
        'NOT NULL burada süs değil: `authenticated` rolünün bu tabloda INSERT grant\'i var',
        '(20260530220000_tenant_schema_setup.sql), yani satır yalnızca edge fonksiyonundan',
        'gelmek zorunda değil. Sözleşmeyi sadece bu statik testle korumak o yolu açık bırakır.',
      ].join('\n'),
    ).toEqual([])
  })

  it('migration dosya adı 14 haneli damga kuralına uyuyor', () => {
    // `.github/workflows/supabase-migrate.yml` migration'ları BAYT sırasıyla uygular ve
    // `migration-atomicity.test.ts` yeni dosyalarda 14 haneli damga şart koşuyor
    // (farklı genişlikteki damgalar dize olarak ters sıralanabiliyor).
    const base = MIGRATION_PATH.split('/').pop() ?? ''
    expect(base, `Migration adı YYYYMMDDHHMMSS_ ile başlamalı: ${base}`).toMatch(/^\d{14}_/)
  })
})
