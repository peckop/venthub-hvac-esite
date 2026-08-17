/**
 * INV-PRICE-8 — "Bugün geçerli kur hangisi?" sorusunun TEK cevabı vardır.
 *
 * CETVEL: `docs/standards/pricing-standard.md` §8.2.1.
 *
 * NİÇİN VAR. Bu sorgunun iki kopyası vardı ve **ikisi aynı şeyi sormuyordu**: motor
 * (`pricingMaterialize`) `base_ccy='TRY'` filtresini uyguluyor, gösterim yolu
 * (`pricing.service.resolvePrice`) uygulamıyordu. Aynı ürün için "maliyet hangi kurdan
 * hesaplandı" ile "vitrinde hangi kurdan gösterildi" ayrışabiliyordu. Kusur prod'da
 * GİZLİYDİ (o gün tüm `currency_rates` satırları `base_ccy='TRY'`) — ama `base_ccy`
 * üzerinde CHECK yok ve `source='manual'` serbest.
 *
 * Üçüncü kopya doğmak üzereydi: fx-lock admin yüzeyi kilit anındaki kuru "enstantane"
 * alacaktı. Kilidin dondurduğu sayı motorunkinden farklı olsaydı fiyat **kilitliyken
 * oynardı**. Bu yüzden kural "dikkatli kopyala" değil: kopya SAYISI birdir.
 *
 * TEHDİT MODELİ: drift dedektörü. Yeni bir okuyucu (rapor, admin kartı, edge fn) kendi
 * kur sorgusunu yazdığında yakalar. Kasıtlı atlatma kapsamda değil.
 */
import { describe, expect, it } from 'vitest'

declare global {
  interface ImportMeta {
    glob(
      pattern: readonly string[],
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

/** Çözücünün kendisi — tek meşru yer. */
const RESOLVER_PATH = '/src/lib/services/fxRate.service.ts'

const sources = import.meta.glob(
  ['/src/**/*.{ts,tsx}', '/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'],
  { query: '?raw', import: 'default', eager: true },
)

function isTestPath(p: string): boolean {
  return /__tests__|\.test\.|\.spec\.|\/tests?\//.test(p)
}

/** CRLF-güvenli yorum sıyırma (`.` `\r` ile eşleşmez — bu depoda ölçüldü). */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\r\n]*/g, ' ')
}

/**
 * "GEÇERLİ KURU SEÇEN" sorgu imzası: `currency_rates` + tarih eşiği + tek satır.
 *
 * Kapsam bilerek dar. `CurrencyRatesCard` kur LİSTESİ gösterir (eşik/limit yok),
 * `tcmb-rates-sync` kur YAZAR — ikisi de bu kuralın konusu değil. Kural yalnız
 * "hangi kur geçerli" kararını verenleri bağlar; onu iki yerde farklı vermek
 * kusurun ta kendisiydi.
 */
function selectsEffectiveRate(src: string): boolean {
  const code = stripComments(src)
  if (!/currency_rates/.test(code)) return false
  const hasDateCutoff = /\.lte\(\s*['"`]effective_date['"`]/.test(code)
  const hasSingleRow = /\.limit\(\s*1\s*\)|\.maybeSingle\(|\.single\(/.test(code)
  return hasDateCutoff && hasSingleRow
}

const productionSources = Object.entries(sources).filter(([p]) => !isTestPath(p))

describe('INV-PRICE-8 — kur çözümü tek yerde', () => {
  it('parser sağlığı: sentetik pozitif/negatif ayırt ediliyor', () => {
    const secen = `supabase.from('currency_rates').select('rate').lte('effective_date', today).limit(1)`
    const listeleyen = `supabase.from('currency_rates').select('*').order('effective_date')`
    const yazan = `supabase.from('currency_rates').insert({ rate: 1 })`
    const alakasiz = `supabase.from('products').select('id').limit(1)`

    expect(selectsEffectiveRate(secen)).toBe(true)
    expect(selectsEffectiveRate(listeleyen)).toBe(false)
    expect(selectsEffectiveRate(yazan)).toBe(false)
    expect(selectsEffectiveRate(alakasiz)).toBe(false)
    // Yorumda anlatmak ihlal DEĞİLDİR (iyi belgelenmiş kod cezalandırılmaz).
    expect(
      selectsEffectiveRate(`// currency_rates .lte('effective_date', x) .limit(1) anlatimi\nconst a = 1`),
    ).toBe(false)
  })

  it('çözücü dosyası yerinde (stale-guard: taşınırsa kural sessizce düşmesin)', () => {
    expect(
      Object.keys(sources),
      `${RESOLVER_PATH} bulunamadı — çözücü taşındıysa bu testin yolu da güncellenmeli.`,
    ).toContain(RESOLVER_PATH)
    expect(
      selectsEffectiveRate(sources[RESOLVER_PATH] ?? ''),
      'Çözücü artık "geçerli kur" sorgusu yapmıyor görünüyor — tarayıcı biçimi kaçırıyor olabilir; ' +
      'ÖNCE tarayıcıyı yeni biçime uyarla.',
    ).toBe(true)
  })

  it('çözücü `base_ccy` filtresini uygular (kusurun kendisi buydu)', () => {
    const code = stripComments(sources[RESOLVER_PATH] ?? '')
    expect(
      /\.eq\(\s*['"`]base_ccy['"`]\s*,\s*['"`]TRY['"`]\s*\)/.test(code),
      'Çözücüde `base_ccy = TRY` filtresi YOK. Kayıt (base=TRY, quote=EUR, rate=55.32) ' +
      '"1 EUR kaç TL" demektir; yalnız `quote_ccy` eşleştirmek, TRY-dışı tabanlı bir satır ' +
      'girildiği gün YANLIŞ BİRİMİ döndürür. Tam olarak bu eksiklik `resolvePrice`\'ta vardı.',
    ).toBe(true)
  })

  it('BAŞKA hiçbir üretim dosyası geçerli-kur sorgusu yapmaz (kopya sayısı = 1)', () => {
    const violations = productionSources
      .filter(([p, src]) => p !== RESOLVER_PATH && selectsEffectiveRate(src))
      .map(([p]) => p)

    expect(
      violations,
      [
        'Kur seçimi ikinci bir yerde yapılıyor. Bu kuralın sebebi tam olarak buydu:',
        'iki kopya vardı ve biri `base_ccy` filtresini uygulamıyordu — maliyet ile gösterim',
        'farklı kurdan hesaplanabiliyordu; kusur, veri bir gün değişene kadar GİZLİ kalır.',
        '',
        `Doğrusu: ${RESOLVER_PATH} içindeki resolveFxRate(supabase, ccy, today) çağrılır.`,
        'Önbellek/defter tutmak gerekiyorsa çağıran tarafta tutulur (bkz. materialize).',
        '',
        ...violations,
      ].join('\n'),
    ).toEqual([])
  })

  it('bilinen iki okuyucu çözücüyü ÇAĞIRIR (ad geçmesi değil, çağrı)', () => {
    const cagiranlar = [
      '/src/lib/services/pricing.service.ts',
      '/src/lib/services/pricingMaterialize.service.ts',
    ]
    for (const path of cagiranlar) {
      const code = stripComments(sources[path] ?? '')
      expect(
        /\bresolveFxRate\s*\(/.test(code),
        `${path} çözücüyü çağırmıyor. Kendi sorgusuna geri dönmüş olabilir — ` +
        'yukarıdaki "kopya sayısı = 1" kuralı da o durumda kırmızı verir.',
      ).toBe(true)
    }
  })
})
