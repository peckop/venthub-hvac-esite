import { describe, expect, it } from 'vitest'

import { kontrolEt } from '../../../../scripts/seo/canli-kapi.mjs'
import type { FamilyListItem } from '../../../types/ui-models'
import type { FamilyVariant } from '../../services/family.service'
import { buildCategoryJsonLd, buildProductGroupJsonLd, buildSeriesLandingJsonLd } from '../jsonld'

/**
 * REC-494 — JSON-LD ŞEKLİ (canlı kapı `JSONLD-COLLECTIONPAGE` ve `JSONLD-ISPARTOF`).
 *
 * Canlıda ölçülen iki kusur (scripts/seo/canli-kapi.mjs `jsonldKontrolleri`):
 *   1. `CollectionPage` üst düzeyde `numberOfItems`/`itemListElement` taşıyordu (28 kategori sayfası);
 *      doğrusu `mainEntity: { '@type': 'ItemList', numberOfItems, itemListElement }`.
 *   2. `ProductGroup` `isPartOf` taşıyordu (47 aile sayfası); schema.org'da ProductGroup'un
 *      `isPartOf` özelliği yok (şema uyarısı).
 *
 * Bu dosya İKİ şeyi kilitler: (a) üreticilerin çıktısı yeni şekildedir ve konum/adresler eskisiyle
 * AYNIDIR (yalnız şekil değişti, görünür metin ve sayılar değişmedi); (b) kapının KENDİ koşulu
 * (`kontrolEt`, kopya değil) üç üreticinin çıktısına bulgu vermez, eski şekli ise yakalar — yani
 * dedektör kör değil. "Kapıyı bilerek bozmak" yerine eski şekil SENTETİK olarak yeniden kurulur.
 */

const BASE_URL = 'https://venthub.com'

const WEBSITE_REF = { '@type': 'WebSite', name: 'VentHub', url: BASE_URL }

function aile(slug: string): FamilyListItem {
  return {
    id: `id-${slug}`,
    name: slug,
    slug,
    series_code: null,
    description: null,
    brand_name: null,
    category_id: null,
    subcategory_id: null,
    cover_image_path: null,
    variant_count: 1,
    min_price: null,
    total_count: 1,
  }
}

function varyant(sku: string): FamilyVariant {
  return {
    id: `v-${sku}`,
    sku,
    name: `Varyant ${sku}`,
    slug: sku.toLowerCase(),
    model_code: null,
    price: null,
    stock_qty: 0,
    technical_specs: null,
    description: null,
    images: [],
  }
}

const GRUP_AILESI: Parameters<typeof buildProductGroupJsonLd>[0]['family'] = {
  id: 'f-1',
  name: 'Storm',
  slug: 'storm-serisi',
  series_code: null,
  description: { tr: 'Aile açıklaması', en: 'Family description' },
  brand_name: 'Vortice',
  category_id: null,
  subcategory_id: null,
  meta_title: null,
  meta_description: null,
  category: null,
  subcategory: null,
}

/** Eski şemada adres şeması bayrağı: `false` → `/products/<slug>`, `true` → `/urun/<slug>` (adresUret). */
const ADRES_SEMALARI = [
  ['KAPALI', false, 'products'],
  ['AÇIK', true, 'urun'],
] as const

/**
 * Kapının JSON-LD kusur kodları (yalnız `JSONLD-*`). Koşul KOPYALANMAZ: gerçek `kontrolEt` çağrılır,
 * sayfa tek bir `ld+json` bloğu taşıyan minimal bir HTML'dir. Çıktı tarayıcıya giden dizgeyle aynı
 * yoldan (JSON.stringify) geçer.
 */
function kapiBulgulari(ld: unknown): string[] {
  const yol = '/tr/a'
  const html =
    '<!DOCTYPE html><html lang="tr"><head><title>T | VentHub</title>' +
    `<script type="application/ld+json">${JSON.stringify(ld)}</script>` +
    '</head><body><h1>T</h1></body></html>'
  const bulgular: Array<{ kod: string }> = kontrolEt({
    harita: { satirlar: [] },
    sayfalar: [{ adres: `https://venthub.com.tr${yol}`, yol, durum: 200, html }],
    ek: {},
  })
  return bulgular.map((b) => b.kod).filter((kod) => kod.startsWith('JSONLD-'))
}

function kategoriLd(bayrak: boolean) {
  return buildCategoryJsonLd({
    lang: 'tr',
    baseUrl: BASE_URL,
    categorySlug: 'kanal-tipi-fanlar',
    sayfaYolu: bayrak ? '/tr/kategori/fanlar/kanal-tipi-fanlar' : undefined,
    name: 'Kanal Tipi Fanlar',
    description: 'Kanal tipi fanlar kategorisindeki ürünler',
    total: 50,
    page: 2,
    pageSize: 24,
    families: [aile('a'), aile('b')],
    bayrak,
  })
}

function seriLd(bayrak: boolean) {
  return buildSeriesLandingJsonLd({
    lang: 'tr',
    baseUrl: BASE_URL,
    seriesSlug: 'lineo',
    name: 'Lineo',
    description: 'Lineo serisi',
    models: [aile('lineo-100'), aile('lineo-150')],
    bayrak,
  })
}

function grupLd() {
  return buildProductGroupJsonLd({
    family: GRUP_AILESI,
    variants: [varyant('SEA-1'), varyant('SEA-2')],
    lang: 'tr',
    baseUrl: BASE_URL,
    mainCategory: null,
  })
}

describe('REC-494 · CollectionPage: liste mainEntity ItemList içinde, üst düzeyde değil', () => {
  it.each(ADRES_SEMALARI)('kategori (%s): üst düzeyde numberOfItems/itemListElement YOK; mainEntity konum ve adresleri eskisiyle AYNI', (_ad, bayrak, onEk) => {
    const ld = kategoriLd(bayrak)

    expect(ld['@type']).toBe('CollectionPage')
    expect(ld).not.toHaveProperty('numberOfItems')
    expect(ld).not.toHaveProperty('itemListElement')
    // CollectionPage bir WebPage'dir: site ilişkisi (isPartOf) KALIR.
    expect(ld.isPartOf).toEqual(WEBSITE_REF)
    // numberOfItems = sayfa-dışı TOPLAM (50), satır sayısı (2) değil; konumlar sayfalamayı sürdürür: (2-1)*24 + i + 1.
    expect(ld.mainEntity).toEqual({
      '@type': 'ItemList',
      numberOfItems: 50,
      itemListElement: [
        { '@type': 'ListItem', position: 25, url: `${BASE_URL}/tr/${onEk}/a` },
        { '@type': 'ListItem', position: 26, url: `${BASE_URL}/tr/${onEk}/b` },
      ],
    })
  })

  it.each(ADRES_SEMALARI)('seri (%s): üst düzeyde numberOfItems/itemListElement YOK; mainEntity konum ve adresleri eskisiyle AYNI', (_ad, bayrak, onEk) => {
    const ld = seriLd(bayrak)

    expect(ld['@type']).toBe('CollectionPage')
    expect(ld).not.toHaveProperty('numberOfItems')
    expect(ld).not.toHaveProperty('itemListElement')
    expect(ld.isPartOf).toEqual(WEBSITE_REF)
    expect(ld.mainEntity).toEqual({
      '@type': 'ItemList',
      numberOfItems: 2,
      itemListElement: [
        { '@type': 'ListItem', position: 1, url: `${BASE_URL}/tr/${onEk}/lineo-100` },
        { '@type': 'ListItem', position: 2, url: `${BASE_URL}/tr/${onEk}/lineo-150` },
      ],
    })
  })

  it('boş liste de mainEntity ItemList taşır (numberOfItems 0, itemListElement [])', () => {
    const ld = buildSeriesLandingJsonLd({
      lang: 'en',
      baseUrl: BASE_URL,
      seriesSlug: 'lineo',
      name: 'Lineo',
      description: 'x',
      models: [],
      bayrak: false,
    })

    expect(ld.mainEntity).toEqual({ '@type': 'ItemList', numberOfItems: 0, itemListElement: [] })
  })
})

describe('REC-494 · ProductGroup: isPartOf YOK, başka alana dokunulmadı', () => {
  it('çıktıda isPartOf yok', () => {
    expect(grupLd()).not.toHaveProperty('isPartOf')
  })

  it('üst düzey alan kümesi tam olarak beklenen (offers/review/aggregateRating/varyant alanlarına dokunulmadı)', () => {
    const ld = grupLd()

    expect(Object.keys(ld).sort()).toEqual(
      ['@context', '@type', 'brand', 'description', 'hasVariant', 'name', 'productGroupID', 'url'].sort(),
    )
    expect(ld.productGroupID).toBe('storm-serisi')
    // Faz 3-C (URN-85 2/2): `ADRES_SEMASI_K3B` AÇIK → TR aile adresi `/tr/urun/<slug>` (EN: `/en/products/<slug>`).
    expect(ld.url).toBe(`${BASE_URL}/tr/urun/storm-serisi`)
    expect(ld.hasVariant).toHaveLength(2)
  })
})

describe('REC-494 · gerçek kapı (kontrolEt) ile eşleşme', () => {
  it.each(ADRES_SEMALARI)('kategori ve seri çıktısı (%s) JSONLD-* bulgusu vermez', (_ad, bayrak) => {
    expect(kapiBulgulari(kategoriLd(bayrak))).toEqual([])
    expect(kapiBulgulari(seriLd(bayrak))).toEqual([])
  })

  it('ProductGroup çıktısı JSONLD-* bulgusu vermez', () => {
    expect(kapiBulgulari(grupLd())).toEqual([])
  })

  it('dedektör kör değil — eski CollectionPage şekli (üst düzey liste) JSONLD-COLLECTIONPAGE verir', () => {
    const { mainEntity, ...sayfa } = kategoriLd(false)
    const eski = { ...sayfa, numberOfItems: 50, itemListElement: (mainEntity as { itemListElement: unknown[] }).itemListElement }

    expect(kapiBulgulari(eski)).toEqual(['JSONLD-COLLECTIONPAGE'])
    // Yalnız numberOfItems ya da yalnız itemListElement de yeter (kapı `||` ile sınar).
    expect(kapiBulgulari({ ...sayfa, numberOfItems: 50 })).toEqual(['JSONLD-COLLECTIONPAGE'])
    expect(kapiBulgulari({ ...sayfa, itemListElement: [] })).toEqual(['JSONLD-COLLECTIONPAGE'])
  })

  it('dedektör kör değil — eski ProductGroup şekli (isPartOf) JSONLD-ISPARTOF verir', () => {
    expect(kapiBulgulari({ ...grupLd(), isPartOf: WEBSITE_REF })).toEqual(['JSONLD-ISPARTOF'])
  })
})
