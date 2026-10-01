/**
 * INV-EN-ALT-KATEGORI-TERIM-1 — İNGİLİZCE SÖZLÜKTE "alt kategori" TEK YAZIMLA GEÇER.
 *
 * NİÇİN VAR (karar 236 / URN-5, REC-300 3e-4):
 * Kategori sayfasındaki alt kategori başlığı İngilizcede "Sub Product Groups" idi;
 * aynı sözlüğün öbür yerleri ("Subcategories", "{{count}} Subcategories") bitişik
 * yazıyordu. Aynı kavram iki ayrı adla görününce müşteri iki ayrı şey sanır. Ayrıca
 * "series" cetvelde AİLE demektir; alt kategori sayfasına giden düğme "Explore Series"
 * olamaz, düğme "Explore" olur.
 *
 * Kapı yalnız sözlük DEĞER dizgelerini tarar (yorum satırları taranmaz); yasak yazımlar:
 *   "Sub Product Groups", "Sub-categories", "Sub Categories" (büyük/küçük harf fark etmez).
 * Doğru yazım: "Subcategories". TR sözlüğüne dokunulmaz ("Alt Ürün Grupları" kalır).
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const SOZLUK_DIZINI = join(process.cwd(), 'src', 'i18n', 'dictionaries')

/** Müşteri yüzeyi + admin İngilizce sözlük kaynakları (yalnız .ts). */
const enDosyalar = (): string[] => {
  const adminDizin = join(SOZLUK_DIZINI, 'admin')
  const admin = readdirSync(adminDizin)
    .filter((f) => f.endsWith('.en.ts'))
    .map((f) => join(adminDizin, f))
  return [join(SOZLUK_DIZINI, 'en.ts'), ...admin]
}

/** `anahtar: 'değer'` / `"değer"` / `` `değer` `` biçimindeki DEĞER dizgeleri; yorum satırları atlanır. */
const DEGER = /:\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g

const degerler = (kaynak: string): string[] => {
  const cikti: string[] = []
  for (const satir of kaynak.split('\n')) {
    if (/^\s*(\/\/|\*|\/\*)/.test(satir)) continue
    for (const m of satir.matchAll(DEGER)) cikti.push(m[2] ?? '')
  }
  return cikti
}

const YASAK_YAZIMLAR = [
  { ad: 'Sub Product Groups', desen: /sub\s+product\s+groups?/i },
  { ad: 'Sub-categories / Sub Categories', desen: /sub[\s-]+categor/i },
]

describe('INV-EN-ALT-KATEGORI-TERIM-1: İngilizce sözlükte alt kategori yazımı', () => {
  it('sabotaj kanıtı: desenler yasak yazımı gerçekten yakalar, doğru yazımı yakalamaz', () => {
    const kotu = "      subGroups: 'Sub Product Groups',"
    expect(degerler(kotu)).toEqual(['Sub Product Groups'])
    expect(YASAK_YAZIMLAR[0]?.desen.test(degerler(kotu)[0] ?? '')).toBe(true)
    expect(YASAK_YAZIMLAR[1]?.desen.test('Sub-categories')).toBe(true)
    expect(YASAK_YAZIMLAR[1]?.desen.test('Sub Categories')).toBe(true)
    expect(YASAK_YAZIMLAR[1]?.desen.test('Subcategories')).toBe(false)
    // Yorum satırı değer sayılmaz.
    expect(degerler("// subGroups: 'Sub Product Groups'")).toEqual([])
  })

  it('tarama gerçekten değer okuyor (boş taramayla yeşil olamaz)', () => {
    const en = readFileSync(join(SOZLUK_DIZINI, 'en.ts'), 'utf8')
    const tum = degerler(en)
    expect(tum.length).toBeGreaterThan(1000)
    expect(tum).toContain('Subcategories')
  })

  it('en.ts ve admin *.en.ts değerlerinde yasak yazım yok', () => {
    const ihlaller: string[] = []
    for (const dosya of enDosyalar()) {
      for (const deger of degerler(readFileSync(dosya, 'utf8'))) {
        for (const { ad, desen } of YASAK_YAZIMLAR) {
          if (desen.test(deger)) ihlaller.push(`${dosya} → "${deger}" (${ad})`)
        }
      }
    }
    expect(ihlaller).toEqual([])
  })

  it('karar 236: alt kategori başlığı "Subcategories", düğme "Explore"', async () => {
    const { en } = await import('../../i18n/dictionaries/en')
    expect(en.category.showcase.subGroups).toBe('Subcategories')
    expect(en.category.showcase.exploreSeries).toBe('Explore')
  })

  /**
   * ALT KATEGORİ DÜZEYİNİ adlandıran anahtarlar (tüketici dosyası açılıp düzey kodla doğrulandı):
   *  - category.showcase.subGroups       → CategoryShowcaseView (alt kategori ızgarası başlığı), CategorySeriesView (alt kategori bağlantı şeridi)
   *  - category.showcase.exploreSeries   → CategoryShowcaseView (kart, alt kategori sayfasına gider)
   *  - category.allSeries/chooseSeriesDesc/inspectSeries → components/category/CategoryShowcase.tsx (alt kategori kartları)
   *  - category.subcategories            → CategoryFilters (alt kategori listesi)
   *  - products.orbital.subcategoriesTitle, products.radialMenu.subcategoriesCount/noSubcategories → alt kategori düzeyi
   *  - megamenu.categoryHub.subCategoryCount → alt kategori sayısı
   * "series" cetvelde AİLE demektir; bu düzeyi adlandıran değerde "series" geçemez ve
   * değer "Subcategor..." ya da düğme ise "Explore" olmalıdır.
   */
  it('alt kategori düzeyi anahtarlarında "series" geçmez; terim "Subcategories" ya da düğme "Explore"', async () => {
    const { en } = await import('../../i18n/dictionaries/en')
    const altKategoriBaslik: ReadonlyArray<readonly [string, string]> = [
      ['category.showcase.subGroups', en.category.showcase.subGroups],
      ['category.allSeries', en.category.allSeries],
      ['category.chooseSeriesDesc', en.category.chooseSeriesDesc],
      ['category.subcategories', en.category.subcategories],
      ['products.orbital.subcategoriesTitle', en.products.orbital.subcategoriesTitle],
      ['products.radialMenu.subcategoriesCount', en.products.radialMenu.subcategoriesCount],
      ['products.radialMenu.noSubcategories', en.products.radialMenu.noSubcategories],
      ['megamenu.categoryHub.subCategoryCount', en.megamenu.categoryHub.subCategoryCount],
    ]
    const ihlal: string[] = []
    for (const [yol, deger] of altKategoriBaslik) {
      if (!/subcategor/i.test(deger)) ihlal.push(`${yol} → "${deger}" ("Subcategor..." yok)`)
    }
    const dugmeler: ReadonlyArray<readonly [string, string]> = [
      ['category.showcase.exploreSeries', en.category.showcase.exploreSeries],
      ['category.inspectSeries', en.category.inspectSeries],
    ]
    for (const [yol, deger] of dugmeler) {
      if (deger !== 'Explore') ihlal.push(`${yol} → "${deger}" (düğme "Explore" olmalı)`)
    }
    for (const [yol, deger] of [...altKategoriBaslik, ...dugmeler]) {
      if (/\bseries\b/i.test(deger)) ihlal.push(`${yol} → "${deger}" ("series" aile demektir)`)
    }
    expect(ihlal).toEqual([])
  })

  it('sabotaj kanıtı: "series" yasağı ve düğme koşulu eski değerleri yakalar', () => {
    expect(/\bseries\b/i.test('All Series')).toBe(true)
    expect(/\bseries\b/i.test('Choose the series that suits your needs')).toBe(true)
    expect(/\bseries\b/i.test('Explore Series')).toBe(true)
    expect(/\bseries\b/i.test('All Subcategories')).toBe(false)
    expect(/subcategor/i.test('Sub Product Groups')).toBe(false)
    const eskiDugme: string = 'Inspect Series'
    expect(eskiDugme !== 'Explore').toBe(true)
  })
})
