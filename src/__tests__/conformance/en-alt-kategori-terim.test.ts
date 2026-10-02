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
 * KAPI NASIL TARAR (ilk sürüm satır-regex'iydi ve KÖRDÜ — çürütme 2026-10-01, gerçek mutasyonla):
 * dizi elemanı (`['Sub Product Groups']`), değeri sonraki satırda olan alan ve eşanlamlılar
 * ('Sub Families', 'Sub Groups') kaçıyordu. Şimdi TypeScript derleyici API'siyle kaynak AST'ye
 * çevrilir ve TÜM metin düğümleri (StringLiteral, NoSubstitutionTemplateLiteral,
 * TemplateHead/Middle/Tail) toplanır. Yorumlar AST'de metin düğümü değildir, kendiliğinden dışarıda.
 * Mantık `yasakliAdlariBul(kaynakMetni)` yardımcısındadır; gerçek dosyalar da sabotaj dizgeleri
 * de AYNI fonksiyondan geçer.
 *
 * Yasak yazımlar (büyük/küçük harf; boşluk, çift boşluk, NBSP, tire varyantları fark etmez):
 *   "Sub Product Groups", "Sub-categories", "Sub Categories" (ve tekil sub-category),
 *   "Sub Families", "Sub Groups", "Technical Product Family" (tekil), "Series Detail" (karar 238 / URN-9).
 *   Doğru yazım: "Subcategory" / "Subcategories" / "Subcategory Detail".
 * KAPIYA GİRMEYENLER (bilerek): "sub-series", "sub-family" — ölü anahtarlarda (en.ts home.hero.metrics,
 * home.guidedDiscovery) duruyor, müşteriye görünen ad kararı bekliyor (BELİRSİZ).
 * TR sözlüğüne dokunulmaz ("Alt Ürün Grupları" kalır).
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
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

/** Kaynaktaki bütün metin düğümlerinin çözülmüş (kaçışsız) metinleri. Yorumlar dahil DEĞİL. */
const metinleriTopla = (kaynakMetni: string): string[] => {
  const kaynak = ts.createSourceFile('sozluk.ts', kaynakMetni, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const cikti: string[] = []
  const gez = (dugum: ts.Node): void => {
    if (
      ts.isStringLiteral(dugum) ||
      ts.isNoSubstitutionTemplateLiteral(dugum) ||
      ts.isTemplateHead(dugum) ||
      ts.isTemplateMiddle(dugum) ||
      ts.isTemplateTail(dugum)
    ) {
      cikti.push(dugum.text)
    }
    ts.forEachChild(dugum, gez)
  }
  gez(kaynak)
  return cikti
}

/** Ayraç: boşluk (NBSP dahil, \s), çift boşluk, tire/kısa çizgi/eksi varyantları. */
const AYRAC = '[\\s\\u00a0\\u2010-\\u2015\\u2212-]+'

const YASAK_YAZIMLAR: ReadonlyArray<{ ad: string; desen: RegExp }> = [
  { ad: 'Sub Product Groups', desen: new RegExp(`sub${AYRAC}product${AYRAC}groups?`, 'i') },
  { ad: 'Sub-categories / Sub Categories', desen: new RegExp(`sub${AYRAC}categor(?:y|ies)`, 'i') },
  { ad: 'Sub Families', desen: new RegExp(`sub${AYRAC}families`, 'i') },
  { ad: 'Sub Groups', desen: new RegExp(`sub${AYRAC}groups`, 'i') },
  // Karar 238 / URN-9: alt kategori sayfasında bu iki ad aile düzeyini adlandırıyordu. "families" çoğulu
  // (heroDefaultDesc'in yeni değeri "...technical product families.") `family\b` ile eşleşmez: temiz kalır.
  { ad: 'Technical Product Family', desen: new RegExp(`technical${AYRAC}product${AYRAC}family\\b`, 'i') },
  { ad: 'Series Detail', desen: new RegExp(`series${AYRAC}detail`, 'i') },
]

/** Kaynak metnindeki her metin düğümünü yasak yazımlara karşı tarar; ihlal satırları döner. */
const yasakliAdlariBul = (kaynakMetni: string): string[] => {
  const ihlaller: string[] = []
  for (const metin of metinleriTopla(kaynakMetni)) {
    for (const { ad, desen } of YASAK_YAZIMLAR) {
      if (desen.test(metin)) ihlaller.push(`"${metin}" (${ad})`)
    }
  }
  return ihlaller
}

describe('INV-EN-ALT-KATEGORI-TERIM-1: İngilizce sözlükte alt kategori yazımı', () => {
  it('sabotaj kanıtı: yasakliAdlariBul her yazım biçimini yakalar', () => {
    const kotuKaynaklar: ReadonlyArray<readonly [string, string]> = [
      ['alan değeri', "const a = { subGroups: 'Sub Product Groups' }"],
      ['çift tırnak', 'const a = { subGroups: "Sub Product Groups" }'],
      ['dizi elemanı', "const a = { pitfalls: ['Sub Product Groups'] }"],
      ['dizi ilk elemanı', "const a = { steps: ['Sub-categories', 'Explore'] }"],
      ['dizi son elemanı', "const a = { steps: ['Explore', 'Sub Categories'] }"],
      ['değer sonraki satırda', "const a = {\n  subGroups:\n    'Sub Product Groups',\n}"],
      ['eşanlamlı Sub Families', "const a = { x: 'Sub Families' }"],
      ['eşanlamlı Sub Groups', "const a = { x: 'Sub Groups' }"],
      ['şablon dizgesi (ikamesiz)', 'const a = { x: `Sub Categories` }'],
      ['şablon başı', 'const a = { x: `Sub Categories of ${ad}` }'],
      ['şablon ortası', 'const a = { x: `${ad} Sub Groups ${sayi}` }'],
      ['şablon sonu', 'const a = { x: `${ad} Sub Families` }'],
      ['NBSP', "const a = { x: 'Sub Product Groups' }"],
      ['çift boşluk', "const a = { x: 'Sub  Categories' }"],
      ['tire', "const a = { x: 'Sub-Categories' }"],
      ['tekil', "const a = { x: 'Sub-category' }"],
      ['küçük harf', "const a = { x: 'sub product groups' }"],
      ['kaçışlı dizgede', "const a = { x: 'Sub\\u0020Categories' }"],
      ['Technical Product Family (URN-9)', "const a = { technicalFamily: 'Technical Product Family' }"],
      ['Technical Product Family küçük harf, çift boşluk', "const a = { x: 'technical  product family' }"],
      ['Series Detail (URN-9)', "const a = { seriesDetail: 'Series Detail' }"],
      ['Series Detail tireli', "const a = { x: 'Series-Detail' }"],
    ]
    for (const [ad, kaynak] of kotuKaynaklar) {
      expect(yasakliAdlariBul(kaynak), ad).not.toEqual([])
    }
  })

  it('sabotaj kanıtı: meşru yazımlar ve yorumlar yanlış pozitif vermez', () => {
    const temizKaynaklar: ReadonlyArray<readonly [string, string]> = [
      ['Subcategories', "const a = { x: 'Subcategories' }"],
      ['Subcategory', "const a = { x: 'Subcategory' }"],
      ['sayılı şablon', 'const a = { x: `${n} Subcategories` }'],
      ['sub-series kapı dışı', "const a = { x: 'sub-series structure' }"],
      ['sub-family kapı dışı', "const a = { x: '{{count}} series and sub-family routes' }"],
      ['satır yorumu', "// subGroups: 'Sub Product Groups'\nconst a = 1"],
      ['blok yorumu', "/* 'Sub Categories' */ const a = 1"],
      ['yorumdaki sub-categories', '// REC-103: the six missing sub-categories.\nconst a = 1'],
      ['tek sözcük Subgroups', "const a = { x: 'Subgroups' }"],
      ['Subcategory Detail (URN-9)', "const a = { seriesDetail: 'Subcategory Detail' }"],
      ['technical product families çoğul (URN-9)', "const a = { x: 'by their technical product families.' }"],
      ['Technical Product Families çoğul, şablon', 'const a = { x: `${n} Technical Product Families` }'],
      ['product family tek başına', "const a = { x: 'Product Family' }"],
    ]
    for (const [ad, kaynak] of temizKaynaklar) {
      expect(yasakliAdlariBul(kaynak), ad).toEqual([])
    }
  })

  it('tarama gerçekten metin okuyor (boş taramayla yeşil olamaz)', () => {
    const tum = metinleriTopla(readFileSync(join(SOZLUK_DIZINI, 'en.ts'), 'utf8'))
    expect(tum.length).toBeGreaterThan(1000)
    expect(tum).toContain('Subcategories')
    expect(enDosyalar().length).toBeGreaterThan(10)
  })

  it('en.ts ve admin *.en.ts içinde yasak yazım yok (gerçek dosyalar, 0 ihlal)', () => {
    const ihlaller: string[] = []
    for (const dosya of enDosyalar()) {
      for (const ihlal of yasakliAdlariBul(readFileSync(dosya, 'utf8'))) ihlaller.push(`${dosya} → ${ihlal}`)
    }
    expect(ihlaller).toEqual([])
  })

  it('karar 236: alt kategori başlığı "Subcategories", düğme "Explore"', async () => {
    const { en } = await import('../../i18n/dictionaries/en')
    expect(en.category.showcase.subGroups).toBe('Subcategories')
    expect(en.category.showcase.exploreSeries).toBe('Explore')
  })

  /**
   * ALT KATEGORİ DÜZEYİNİ adlandıran anahtarlar (tüketici dosyaları açılıp düzey kodla doğrulandı):
   *  - category.showcase.subGroups       → CategoryShowcaseView (alt kategori ızgarası başlığı), CategorySeriesView (alt kategori bağlantı şeridi)
   *  - category.showcase.exploreSeries   → CategoryShowcaseView (kart, alt kategori sayfasına gider)
   *  - category.allSeries/chooseSeriesDesc/inspectSeries → components/category/CategoryShowcase.tsx.
   *    ⚠ÖLÜ BİLEŞEN: hiçbir dosya import etmiyor (useCategoryViewModel.ts:79; catalog-integrity-baseline.json
   *    ÖLÜ DOSYA kaydı), müşteriye görünmez. İleride canlanırsa terim tutarlı olsun diye çevrildi.
   *  - category.subcategories            → CategoryFilters (alt kategori listesi)
   *  - products.orbital.subcategoriesTitle, products.radialMenu.subcategoriesCount/noSubcategories → alt kategori düzeyi
   *  - megamenu.categoryHub.subCategoryCount → alt kategori sayısı
   * "series" cetvelde AİLE demektir; bu düzeyi adlandıran değerde "series" geçemez ve
   * değer "Subcategor..." ya da düğme ise "Explore" olmalıdır.
   * Karar 238 / URN-9: category.series.{technicalFamily,seriesDetail,heroDefaultDesc} de bu düzeydedir
   * (CategorySeriesView:71/120/88, alt kategori sayfası); tam eşitlikle aşağıdaki ayrı testte kilitlidir
   * (heroDefaultDesc "Subcategor..." taşımaz, çünkü cümle ailelerden söz eder; bu yüzden bu listeye girmez).
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

  it('karar 238 (URN-9): alt kategori sayfası etiketleri tam eşitlikle Subcategory dilinde', async () => {
    const { en } = await import('../../i18n/dictionaries/en')
    expect(en.category.series.technicalFamily).toBe('Subcategory')
    expect(en.category.series.seriesDetail).toBe('Subcategory Detail')
    expect(en.category.series.heroDefaultDesc).toBe(
      'Browse professional ventilation solutions by their technical product families.',
    )
  })

  it('sabotaj kanıtı: "series" yasağı eski değerleri yakalar', () => {
    expect(/\bseries\b/i.test('All Series')).toBe(true)
    expect(/\bseries\b/i.test('Choose the series that suits your needs')).toBe(true)
    expect(/\bseries\b/i.test('Explore Series')).toBe(true)
    expect(/\bseries\b/i.test('All Subcategories')).toBe(false)
    const eskiDugme: string = 'Inspect Series'
    expect(eskiDugme !== 'Explore').toBe(true)
  })
})
