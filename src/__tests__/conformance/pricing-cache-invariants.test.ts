import { describe, expect, it } from 'vitest'

/**
 * INV-PRICE-6 · Fiyat cache'i değişmezleri (kalıcı bekçi).
 *
 * Cetvel: docs/standards/pricing-standard.md §8.1 —
 *  (a) cache tekil anahtarı **currency İÇERİR** (aynı ürünün TRY/EUR satırı yan yana durabilsin;
 *      "ürün/marka bazında para birimi" gereksiniminin fiziksel ön koşulu),
 *  (b) `product_prices`'a **yalnız materialize servisi yazar** — elle-ezme (`is_derived=false`)
 *      ve bayat-satır tasfiyesi disiplini oraya gömülüdür; başka bir yol açılırsa
 *      fiyat kilidi (§8.2) sessizce ezilebilir.
 *
 * Neden test: migration SQL'i ve "kim yazıyor" sorusu tsc/lint/build için opaktır. Bu iki
 * değişmez tam olarak sessizce bozulabilen türden — biri indekste, diğeri yeni bir çağrı
 * yerinde kaybolur ve hiçbir mevcut kapı fark etmez.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const MIGRATION_SOURCES: Record<string, string> = import.meta.glob(
  '/supabase/migrations/**/*.sql',
  { query: '?raw', import: 'default', eager: true },
)

const SRC_SOURCES: Record<string, string> = import.meta.glob(
  '/src/**/*.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true },
)

/** product_prices'a yazmasına izin verilen TEK yol (cetvel §8.1/§8.2). */
const WRITE_ALLOWLIST = ['src/lib/services/pricingMaterialize.service.ts']

function normalize(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '')
}

describe('INV-PRICE-6 · fiyat cache değişmezleri', () => {
  it('product_prices tekil anahtarı currency içerir (en son tanım kazanır)', () => {
    const definitions: { file: string; def: string }[] = []
    for (const [file, source] of Object.entries(MIGRATION_SOURCES)) {
      const re = /create\s+unique\s+index[^;]*\bproduct_prices_unique\b[^;]*;/gi
      for (const match of source.matchAll(re)) {
        definitions.push({ file: normalize(file), def: match[0] })
      }
    }

    // Stale-guard: indeks hiç tanımlanmıyorsa test anlamsızlaşır (sessiz yeşil olmasın).
    expect(definitions.length, 'product_prices_unique tanımı hiçbir migration\'da bulunamadı').toBeGreaterThan(0)

    // Dosya adları tarih önekli → sıralama uygulanma sırasını verir; son tanım geçerlidir.
    definitions.sort((a, b) => a.file.localeCompare(b.file))
    const latest = definitions[definitions.length - 1]

    expect(
      /\bcurrency\b/i.test(latest.def),
      `Cache tekil anahtarı currency içermiyor (${latest.file}): ${latest.def}`,
    ).toBe(true)
  })

  it('product_prices\'a yalnız materialize servisi yazar', () => {
    const offenders: string[] = []
    for (const [file, source] of Object.entries(SRC_SOURCES)) {
      const path = normalize(file)
      if (WRITE_ALLOWLIST.includes(path)) continue
      if (path.includes('__tests__')) continue

      // .from('product_prices') zincirinde yazma çağrısı (upsert/insert/update/delete) var mı?
      const re = /from\(\s*['"]product_prices['"]\s*\)[\s\S]{0,200}?\.(upsert|insert|update|delete)\s*\(/g
      if (re.test(source)) offenders.push(path)
    }

    expect(
      offenders,
      `product_prices'a izinsiz yazma yolu: ${offenders.join(', ')} — cetvel §8.1: elle-ezme ` +
        've bayat-satır disiplini yalnız materialize servisinde; yeni yazma yolu fiyat kilidini sessizce ezer.',
    ).toEqual([])
  })

  it('materialize servisi elle-ezme (is_derived) korumasını taşır', () => {
    const entry = Object.entries(SRC_SOURCES).find(
      ([file]) => normalize(file) === WRITE_ALLOWLIST[0],
    )
    expect(entry, 'materialize servisi bulunamadı — allowlist yolu eskimiş olabilir').toBeDefined()
    const source = entry ? entry[1] : ''

    expect(
      /is_derived/.test(source),
      'materialize servisi is_derived ayrımını hiç yapmıyor (elle-ezme koruması kaybolmuş)',
    ).toBe(true)
  })
})
