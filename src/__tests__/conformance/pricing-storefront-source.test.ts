import { describe, expect, it } from 'vitest'

/**
 * INV-PRICE-1 · Vitrin fiyatının kaynağı (kalıcı bekçi).
 *
 * Cetvel: docs/standards/pricing-standard.md §1 (fiyat TÜRETİLİR) + §14 —
 * müşteri yüzeyi ham `products.price` OKUMAZ. O alan Kademe-2'de emekli edildi; fiyat
 * motordan gelir (`display_price(products)` / `get_display_prices` RPC → cache).
 *
 * Neden bu biçimde ölçülüyor: "hangi `.price` okuması meşru" sorusu statik olarak
 * ayrıştırılamaz — aile RPC'sinden dönen `variant.price` motorun fiyatıdır ve meşrudur.
 * Ölçülebilir ve kesin olan şey **kolonun hiç çekilmemesi**: müşteri yolu `products`
 * tablosundan `price` kolonunu SELECT etmiyorsa, okuduğu her fiyat motordan gelmiş demektir.
 * Bu yüzden bekçi select listelerini denetler, okuma noktalarını değil.
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

/** Admin, ham fiyat alanını meşru olarak görebilir (emekli alanın yönetimi/temizliği). */
const ADMIN_PREFIXES = ['src/views/admin/', 'src/components/admin/', 'src/app/admin/']

/** Tip tanımları ve testler kolon adını anmakta serbesttir. */
const EXEMPT_PREFIXES = ['src/types/', 'src/__tests__/', 'src/lib/services/__tests__/']

function normalize(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '')
}

function isCustomerSurface(path: string): boolean {
  if (ADMIN_PREFIXES.some(p => path.startsWith(p))) return false
  if (EXEMPT_PREFIXES.some(p => path.startsWith(p))) return false
  return true
}

/**
 * Select listesinde TEK BAŞINA `price` kolonu geçiyor mu?
 * `purchase_price`, `price_at_time`, `unit_price`, `min_price`, `net_price` gibi
 * bileşik adlar meşrudur — sınır kontrolü onları dışarıda bırakır.
 */
function hasBarePriceColumn(selectList: string): boolean {
  return /(^|[\s,(])price([\s,)]|$)/.test(selectList)
}

describe('INV-PRICE-1 · vitrin fiyatı motordan gelir', () => {
  it('paylaşılan kolon SSOT listeleri ham `price` kolonunu taşımaz', () => {
    const entry = Object.entries(SRC_SOURCES).find(
      ([file]) => normalize(file) === 'src/lib/services/product.columns.ts',
    )
    expect(entry, 'product.columns.ts bulunamadı — kolon SSOT yolu değişmiş olabilir').toBeDefined()
    const source = entry ? entry[1] : ''

    const constants = [...source.matchAll(/export const (VARIANT_\w+|FAMILY_\w+)\s*=\s*\n?\s*'([^']*)'/g)]
    // Stale-guard: sabitler bulunamıyorsa test sessizce yeşil kalmasın.
    expect(constants.length, 'product.columns.ts içinde kolon sabiti bulunamadı').toBeGreaterThan(0)

    const offenders = constants
      .filter(m => hasBarePriceColumn(m[2]))
      .map(m => m[1])

    expect(
      offenders,
      `Kolon SSOT'unda ham 'price' kolonu var: ${offenders.join(', ')} — müşteri yüzeyi emekli ` +
        'alanı çekiyor demektir (cetvel §1). Fiyat display_price/get_display_prices üzerinden gelmeli.',
    ).toEqual([])
  })

  it("müşteri yüzeyi products tablosundan ham `price` kolonunu SELECT etmez", () => {
    const offenders: string[] = []

    for (const [file, source] of Object.entries(SRC_SOURCES)) {
      const path = normalize(file)
      if (!isCustomerSurface(path)) continue

      // .from('products') zincirinde geçen select(...) string literalleri.
      // `*` de ihlaldir: yıldız seçim ham `price`i de getirir ve kolon-adı taraması
      // onu göremez — bu kör nokta gerçek bir kaçağa yol açtı (cart.service, W4b).
      const chains = source.matchAll(
        /from\(\s*['"]products['"]\s*\)([\s\S]{0,400}?)\.select\(\s*(['"`])([\s\S]*?)\2/g,
      )
      for (const match of chains) {
        const selectList = match[3]
        if (hasBarePriceColumn(selectList) || /(^|[\s,(])\*([\s,)]|$)/.test(selectList)) {
          offenders.push(path)
        }
      }
    }

    expect(
      [...new Set(offenders)],
      'Müşteri yüzeyinde products.price SELECT ediliyor — bu alan emekli; fiyat motordan ' +
        '(display_price / get_display_prices) gelmeli (INV-PRICE-1).',
    ).toEqual([])
  })
})
