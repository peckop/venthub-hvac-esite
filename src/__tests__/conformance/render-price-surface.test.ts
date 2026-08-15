import { describe, expect, it } from 'vitest'

/**
 * INV-RENDER-1 · Fiyat YALNIZ ürün satış sayfasında (PDP) gösterilir (kalıcı bekçi).
 *
 * Recep kararı (2026-08-15): fiyat kartlarda/keşif yüzeylerinde GÖSTERİLMEZ. Cetvel gerekçesi
 * PS-042 (`docs/standards/product-schema-standard.md` §2.2): kart fiyat taşımazsa keşif
 * önbelleği de taşımaz — fiyat değişince keşif önbelleğini geçersiz kılmak zorunda kalmayız.
 *
 * Bu gece kartlarda fiyat canlıya çıkmıştı; hiçbir kapı görmedi, insan gözü yakaladı. Statik
 * tarama: `formatCurrency(...)` çağrısı YASAK yüzeylerde (liste/kart/keşif) sıfır olmalı.
 *
 * `ProductCard.tsx` ÖZEL DURUM: paylaşılan bileşen `showPrice` bayrağıyla fiyatı BİLEREK
 * gösterebilir (çağıran `hidePrice` ile bastırır) — o yüzden "formatCurrency çağıramaz"
 * listesinde YOK. Onun kilidi ayrı: her `<ProductCard` çağrı yeri `hidePrice` GEÇMEK
 * ZORUNDA (aşağıdaki ikinci blok).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SRC_SOURCES: Record<string, string> = import.meta.glob(
  '/src/**/*.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true },
)

function normalize(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\/+/, '')
}

const ALL_PATHS = Object.keys(SRC_SOURCES).map(normalize)

/**
 * YASAK yüzeyler — `formatCurrency(...)` ÇAĞIRAMAZ, 0 ihlal beklenir. `ProductCard.tsx`
 * bilinçli olarak burada YOK (yukarıdaki not); onun kilidi ayrı bir blokta.
 */
const FORBIDDEN_FILES = [
  'src/components/products/FamilyCard.tsx',
  'src/views/ProductsDiscoveryView.tsx',
  'src/views/BrandDetailPage.tsx',
  'src/components/SearchOverlay.tsx',
  'src/components/QuickViewModal.tsx',
]
const FORBIDDEN_PREFIXES = ['src/views/category/', 'src/components/home/']

/**
 * İZİNLİ yüzeyler — fiyat göstermesi MEŞRU (PDP ve altı, sepet/checkout, tüm admin,
 * hesap/sipariş, lib/servis yardımcıları, testler, i18n). Bu liste testte İHLAL taraması
 * için KULLANILMAZ (yasak liste zaten dar ve açık yazılı) — yalnız STALE-GUARD için: liste
 * çürüyüp artık var olmayan bir dosyayı/kökü anmaya devam ederse test bunu yakalar.
 */
const ALLOWLIST_FILES = [
  'src/app/_components/ProductDetailPageView.tsx',
  'src/components/products/VariantSelector.tsx',
  'src/views/CartPage.tsx', // sepet sayfası
  'src/components/StickyHeader.tsx', // header sepet toplamı
]
const ALLOWLIST_PREFIXES = [
  'src/views/checkout/',
  // `src/components/cart/**` bu kod tabanında henüz YOK — sepet UI'ı `src/views/CartPage.tsx`
  // (ALLOWLIST_FILES) ve `src/components/AddToCartToast*.tsx` (fiyat göstermiyor) altında.
  // Gerçekte var olmayan bir kökü listeye eklemek stale-guard'ı anlamsızlaştırır; ileride
  // sepet bileşenleri ayrı bir klasöre taşınırsa bu satır geri eklenmeli.
  'src/views/admin/',
  'src/components/admin/',
  'src/app/admin/',
  'src/views/account/',
  'src/lib/',
  'src/i18n/',
]

function isForbidden(p: string): boolean {
  if (FORBIDDEN_FILES.includes(p)) return true
  return FORBIDDEN_PREFIXES.some(prefix => p.startsWith(prefix))
}

describe('INV-RENDER-1 · yasak yüzeyler formatCurrency çağırmaz', () => {
  it('yasak liste güncel — her giriş gerçek bir dosyaya/köke karşılık gelir (stale-guard)', () => {
    for (const f of FORBIDDEN_FILES) {
      expect(
        ALL_PATHS.includes(f),
        `yasak liste bayatlamış: ${f} artık repoda yok — dosya taşınmış/yeniden adlandırılmışsa koruma sessizce düşer, listeyi güncelle`,
      ).toBe(true)
    }
    for (const prefix of FORBIDDEN_PREFIXES) {
      expect(
        ALL_PATHS.some(p => p.startsWith(prefix)),
        `yasak liste bayatlamış: ${prefix} altında hiç dosya yok`,
      ).toBe(true)
    }
  })

  it('izin listesi güncel — her giriş gerçek bir dosyaya/köke karşılık gelir (stale-guard)', () => {
    for (const f of ALLOWLIST_FILES) {
      expect(
        ALL_PATHS.includes(f),
        `izin listesi bayatlamış: ${f} artık repoda yok — liste çürümüş olabilir`,
      ).toBe(true)
    }
    for (const prefix of ALLOWLIST_PREFIXES) {
      expect(
        ALL_PATHS.some(p => p.startsWith(prefix)),
        `izin listesi bayatlamış: ${prefix} altında hiç dosya yok`,
      ).toBe(true)
    }
  })

  it('liste/kart/keşif yüzeylerinde formatCurrency(...) çağrısı YOK', () => {
    const offenders: string[] = []
    for (const [file, source] of Object.entries(SRC_SOURCES)) {
      const p = normalize(file)
      if (!isForbidden(p)) continue
      if (/formatCurrency\s*\(/.test(source)) offenders.push(p)
    }

    expect(
      [...new Set(offenders)],
      `Yasak yüzeyde formatCurrency(...) çağrısı bulundu: ${offenders.join(', ')} — Recep kararı (2026-08-15) ` +
        've PS-042: fiyat yalnız PDP\'de gösterilir, kartlarda/keşifte kaçak fiyat gösterimi ' +
        'yeniden canlıya çıkmış olabilir (bu gece tam olarak bu oldu).',
    ).toEqual([])
  })
})

/**
 * `InfiniteProductsShowcase.tsx` içindeki `<ProductCard` FARKLI bir bileşendir: aynı adı
 * taşıyan ayrı bir yerel component (3D R3F showcase parçası), `item`/`index`/`gap`/`scrollOffset`
 * prop'ları alır ve fiyat/hidePrice kavramıyla hiç ilgisi yoktur (bkz. dosya içi tanım). Kilide
 * dahil edilirse hep-yanlış-pozitif üretir; bu yüzden bilinçli olarak hariç tutulur.
 */
const PRODUCT_CARD_CALLSITE_EXEMPT = ['src/components/products/InfiniteProductsShowcase.tsx']

describe('INV-RENDER-1 · ProductCard her çağrı yerinde hidePrice geçer', () => {
  it('paylaşılan <ProductCard/> bileşeninin tüm çağıranları hidePrice prop\'unu geçirir', () => {
    const offenders: string[] = []
    let callsiteCount = 0

    for (const [file, source] of Object.entries(SRC_SOURCES)) {
      const p = normalize(file)
      if (PRODUCT_CARD_CALLSITE_EXEMPT.includes(p)) continue

      // Açılış etiketinden ilk `/>` ya da `>`e kadarki prop bloğu (bu kod tabanındaki gerçek
      // kullanım basit — iç içe `>` içeren JSX-ifade prop'u yok; pricing-cache-invariants.test.ts
      // ile aynı pragmatik regex tarzı).
      const re = /<ProductCard\b([\s\S]*?)(?:\/>|>)/g
      for (const m of source.matchAll(re)) {
        callsiteCount++
        if (!/\bhidePrice\b/.test(m[1])) offenders.push(p)
      }
    }

    // Stale-guard: hiç çağrı yeri bulunamıyorsa bu kontrol vakumda geçer (sahte güven) —
    // ProductCard hiç kullanılmıyor demektir, taşınmış/yeniden adlandırılmış olabilir.
    expect(callsiteCount, '<ProductCard çağrı yeri hiç bulunamadı — regex ya da dosya yolu bayatlamış olabilir').toBeGreaterThan(0)

    expect(
      [...new Set(offenders)],
      `<ProductCard> çağıranı hidePrice GEÇMİYOR: ${offenders.join(', ')} — showPrice bayrağı varsayılan ` +
        'olarak AÇIK (hidePrice=false), yeni bir çağrı yeri bunu unutursa kartta fiyat sessizce yeniden canlıya çıkar.',
    ).toEqual([])
  })
})
