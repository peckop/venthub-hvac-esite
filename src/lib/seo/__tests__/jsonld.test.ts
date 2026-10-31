import { afterEach, describe, expect, it, vi } from 'vitest'

import type { FamilyListItem } from '../../../types/ui-models'
import type { FamilyVariant } from '../../services/family.service'
import {
  assertNoUuid,
  buildCategoryJsonLd,
  buildProductGroupJsonLd,
  buildSeriesLandingJsonLd,
  tumVaryantlarFiyatliMi,
} from '../jsonld'

// F5-B W3.1 — jsonld.ts saf-fonksiyon birim testleri.
// Sunucu bileşenlerine (page.tsx) hiç dokunmaz; yalnız buildProductGroupJsonLd /
// buildCategoryJsonLd / assertNoUuid'nin girdi→çıktı sözleşmesini doğrular.

const BASE_URL = 'https://venthub.com'

/**
 * REC-494: CollectionPage üreticilerinde liste üst düzeyde DEĞİL, `mainEntity` ItemList içindedir
 * (`numberOfItems` ve `itemListElement` schema.org'da `ItemList`'in özellikleridir).
 */
function liste(ld: Record<string, unknown>) {
  return ld.mainEntity as { numberOfItems: number; itemListElement: Record<string, unknown>[] }
}

function makeVariant(overrides: Partial<FamilyVariant> = {}): FamilyVariant {
  return {
    id: 'v-1',
    sku: 'SKU-001',
    name: 'Test Variant 100',
    slug: 'test-variant-100',
    model_code: null,
    price: null,
    stock_qty: 0,
    technical_specs: null,
    description: null,
    images: [],
    ...overrides,
  }
}

function makeFamily(overrides: Partial<Parameters<typeof buildProductGroupJsonLd>[0]['family']> = {}) {
  return {
    id: 'f-1',
    name: 'Test Family',
    slug: 'test-family',
    series_code: null,
    description: { tr: 'Aile açıklaması', en: 'Family description' },
    brand_name: 'Vortice',
    category_id: null,
    subcategory_id: null,
    meta_title: null,
    meta_description: null,
    category: null,
    subcategory: null,
    ...overrides,
  }
}

/**
 * REC-111: bu birim testleri FIYATIN YAZILDIGI dali dogruluyor; o dal artik yalniz
 * teklif modu KAPALIYKEN calisir. Kategori `hide_price: false` verilmezse hukum
 * guvenli tarafa duser (teklif modu) ve testler fiyat gormez. Yani bu sabit bir
 * kolaylik degil, testin ONKOSULU.
 */
const FIYATLI_KATEGORI = { metadata: { hide_price: false } }

/**
 * URN-138: ProductGroup dalına YALNIZ ailenin tüm varyantları görünür fiyat taşıyorsa girilir. ProductGroup
 * sözleşmesini ölçen testler bu yardımcıyla fiyatlı varyant kurar; fiyatsız/karışık dal aşağıdaki
 * `buildProductGroupJsonLd — fiyatsız aile` bloğunda ölçülür.
 */
function makeFiyatliVariant(overrides: Partial<FamilyVariant> = {}): FamilyVariant {
  return makeVariant({ price: 1500, stock_qty: 2, ...overrides })
}

describe('buildProductGroupJsonLd', () => {
  it('productGroupID alanını family.slug olarak yazar', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily({ slug: 'dds-nano' }),
      variants: [makeFiyatliVariant()],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    expect(jsonLd.productGroupID).toBe('dds-nano')
    expect(jsonLd['@type']).toBe('ProductGroup')
  })

  it('url alanına dil prefix\'i garanti eder, varyant URL\'i asla yazmaz', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily({ slug: 'dds-nano' }),
      variants: [makeFiyatliVariant({ slug: 'dds-nano-100' })],
      lang: 'en',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    expect(jsonLd.url).toBe(`${BASE_URL}/en/products/dds-nano`)
    expect(JSON.stringify(jsonLd)).not.toContain('dds-nano-100')
  })

  it('fiyatı NULL olan varyantlı aileye ProductGroup/hasVariant/offers HİÇ yazılmaz (URN-138: CollectionPage)', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeVariant({ price: null })],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    expect(jsonLd['@type']).toBe('CollectionPage')
    expect(jsonLd).not.toHaveProperty('hasVariant')
    expect(JSON.stringify(jsonLd)).not.toContain('"offers"')
  })

  it('fiyatı olan varyanta Offer (price/priceCurrency/availability) yazar', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeVariant({ price: 1234.5, stock_qty: 3 })],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    const hasVariant = jsonLd.hasVariant as Record<string, unknown>[]
    const offers = hasVariant[0].offers as Record<string, unknown>
    expect(offers).toEqual({
      '@type': 'Offer',
      price: '1234.50',
      priceCurrency: 'TRY',
      availability: 'https://schema.org/InStock',
    })
  })

  it('stok 0 (veya null) olan fiyatlı varyantı OutOfStock işaretler', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeVariant({ price: 99, stock_qty: 0 })],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    const hasVariant = jsonLd.hasVariant as Record<string, unknown>[]
    const offers = hasVariant[0].offers as Record<string, unknown>
    expect(offers.availability).toBe('https://schema.org/OutOfStock')
  })

  // REC-272 — ESKİ HÂLİ: `mpn = model_code ?? sku` ve bu test onu DOĞRULUYORDU, yani
  // kusuru sabitlemişti. `mpn` ÜRETİCİ kodudur; iç SKU'yu oraya yazmak arama motoruna
  // yanlış beyandır ve productHelpers'ın hükmü ("sku'ya düşmek YASAK") bunu zaten
  // yasaklıyordu. Test artık yasağı ölçüyor: kod yoksa alan HİÇ YAZILMAZ.
  it('mpn yalnız model_code ile yazılır; kod yoksa alan hiç eklenmez ve sku HİÇ yazılmaz', () => {
    const withModelCode = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeFiyatliVariant({ sku: 'SKU-A', model_code: 'MC-100' })],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })
    const withoutModelCode = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeFiyatliVariant({ sku: 'SKU-B', model_code: null })],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    const v1 = (withModelCode.hasVariant as Record<string, unknown>[])[0]
    const v2 = (withoutModelCode.hasVariant as Record<string, unknown>[])[0]
    expect(v1.mpn).toBe('MC-100')
    // Alan YOK — `undefined` yeterli değil, anahtarın kendisi bulunmamalı ki
    // serialize edilen JSON-LD'de boş bir mpn görünmesin.
    expect(v2).not.toHaveProperty('mpn')
    // ⭐HÜKÜM DEĞİŞTİ (REC-146, 2026-09-09) — burada eskiden şu yazıyordu:
    // *"`sku` yayınlanmaya devam eder: o SATICININ kendi kodudur, yanlış beyan değildir."*
    // Öncül çürüdü: beş üründe `sku` UYDURMA (VRT-16076..16080), yani tam olarak yanlış
    // beyandır. Recep sözü *"kodu boşalt"*. Artık kod yayınlama yolu TEK: `mpn` (model_code),
    // o da yoksa hiçbiri. `sku` hiçbir müşteri/arama motoru yüzeyine yazılmaz.
    // Yapısal bekçi: INV-SKU-GORUNMEZ-1 (`bos-sku-render.test.ts`).
    expect(v1).not.toHaveProperty('sku')
    expect(v2).not.toHaveProperty('sku')
  })

  it('görseli olan varyanta image alanı ekler, olmayana eklemez', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [
        makeFiyatliVariant({ sku: 'SKU-IMG', images: [{ path: 'products/a.webp', alt: null, sort_order: 0 }] }),
        makeFiyatliVariant({ sku: 'SKU-NOIMG', images: [] }),
      ],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    const hasVariant = jsonLd.hasVariant as Record<string, unknown>[]
    expect(hasVariant[0]).toHaveProperty('image')
    expect(hasVariant[1]).not.toHaveProperty('image')
  })

  it('brand_name varsa Brand node yazar, yoksa brand alanını hiç yazmaz', () => {
    const withBrand = buildProductGroupJsonLd({
      family: makeFamily({ brand_name: 'Vortice' }),
      variants: [makeFiyatliVariant()],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })
    const withoutBrand = buildProductGroupJsonLd({
      family: makeFamily({ brand_name: null }),
      variants: [makeFiyatliVariant()],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    expect(withBrand.brand).toEqual({ '@type': 'Brand', name: 'Vortice' })
    expect(withoutBrand).not.toHaveProperty('brand')
  })

  it('description dil çözülür (tr/en fallback)', () => {
    const trOut = buildProductGroupJsonLd({
      family: makeFamily({ description: { tr: 'TR açıklama', en: 'EN description' } }),
      variants: [makeFiyatliVariant()],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })
    const enOut = buildProductGroupJsonLd({
      family: makeFamily({ description: { tr: 'TR açıklama', en: 'EN description' } }),
      variants: [makeFiyatliVariant()],
      lang: 'en',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    expect(trOut.description).toBe('TR açıklama')
    expect(enOut.description).toBe('EN description')
  })

  it('serialize edilmiş çıktıda UUID sızmaz (assertNoUuid yeşil)', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily({ id: '11111111-2222-3333-4444-555555555555', slug: 'test-family' }),
      variants: [makeFiyatliVariant({ id: '66666666-7777-8888-9999-000000000000' })],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    expect(() => assertNoUuid(jsonLd)).not.toThrow()
  })
})

/**
 * URN-138 (SEO-56 A) — Search Console "Ürün snippet'leri" KRİTİK ("hasVariant.offers, review veya
 * aggregateRating belirtilmelidir"). İKİ YÖNLÜ KAPI: tüm varyantı görünür fiyatlı aile ProductGroup (offers ile),
 * fiyatsız/karışık/teklif kipli/kategori bilinmeyen aile CollectionPage + ItemList (Product düğümü ve fiyat YOK).
 */
describe('buildProductGroupJsonLd — ürün işaretlemesi yalnız tüm varyantı fiyatlı ailede (URN-138)', () => {
  const YASAK_ANAHTARLAR = [
    'hasVariant', 'offers', 'price', 'priceCurrency', 'availability', 'aggregateRating', 'review',
    'productGroupID', 'sku', 'mpn',
  ]

  /** JSON-LD ağacında herhangi bir derinlikte geçen anahtarlar. */
  function tumAnahtarlar(dugum: unknown, biriktir: Set<string> = new Set()): Set<string> {
    if (Array.isArray(dugum)) {
      for (const x of dugum) tumAnahtarlar(x, biriktir)
    } else if (dugum && typeof dugum === 'object') {
      for (const [k, v] of Object.entries(dugum as Record<string, unknown>)) {
        biriktir.add(k)
        tumAnahtarlar(v, biriktir)
      }
    }
    return biriktir
  }

  /** Düğüm tiplerini toplar: Product/ProductGroup/Offer hiçbir derinlikte geçmemeli. */
  function tumTipler(dugum: unknown, biriktir: Set<string> = new Set()): Set<string> {
    if (Array.isArray(dugum)) {
      for (const x of dugum) tumTipler(x, biriktir)
    } else if (dugum && typeof dugum === 'object') {
      const o = dugum as Record<string, unknown>
      if (typeof o['@type'] === 'string') biriktir.add(o['@type'])
      for (const v of Object.values(o)) tumTipler(v, biriktir)
    }
    return biriktir
  }

  function kur(variants: FamilyVariant[], mainCategory: { metadata?: unknown } | null, lang = 'tr') {
    return buildProductGroupJsonLd({ family: makeFamily({ slug: 'fc-51' }), variants, lang, baseUrl: BASE_URL, mainCategory })
  }

  function fiyatsizdaYasakVarMi(ld: Record<string, unknown>) {
    expect(ld['@type']).toBe('CollectionPage')
    const anahtarlar = tumAnahtarlar(ld)
    expect(YASAK_ANAHTARLAR.filter((k) => anahtarlar.has(k))).toEqual([])
    const tipler = tumTipler(ld)
    expect(['Product', 'ProductGroup', 'Offer', 'AggregateRating', 'Review'].filter((t) => tipler.has(t))).toEqual([])
    const metin = JSON.stringify(ld)
    expect(metin).not.toContain('0.00')
    expect(metin).not.toMatch(/"price"/)
  }

  it('(1) tüm varyantı fiyatlı + teklif modu kapalı → ProductGroup, HER varyantta offers', () => {
    const ld = kur(
      [makeFiyatliVariant({ sku: 'A', price: 100 }), makeFiyatliVariant({ id: 'v-2', sku: 'B', price: 250.5, stock_qty: 0 })],
      FIYATLI_KATEGORI,
    )

    expect(ld['@type']).toBe('ProductGroup')
    const hasVariant = ld.hasVariant as Record<string, unknown>[]
    expect(hasVariant).toHaveLength(2)
    expect(hasVariant.every((v) => typeof v.offers === 'object' && v.offers !== null)).toBe(true)
    expect((hasVariant[1].offers as Record<string, unknown>).price).toBe('250.50')
    expect(tumVaryantlarFiyatliMi([makeFiyatliVariant()], FIYATLI_KATEGORI)).toBe(true)
  })

  it.each([
    ['price null', null],
    ['price 0', 0],
    ['price negatif', -5],
    ['price NaN dizesi', 'abc'],
  ] as const)('(2) tüm varyantı fiyatsız aile (%s) → CollectionPage, ürün düğümü/fiyat/review YOK, ItemList sayısı = varyant sayısı', (_ad, price) => {
    const varyantlar = [
      makeVariant({ id: 'v-1', sku: 'S1', name: 'FC 51 A', price: price as FamilyVariant['price'] }),
      makeVariant({ id: 'v-2', sku: 'S2', name: 'FC 51 B', price: price as FamilyVariant['price'] }),
      makeVariant({ id: 'v-3', sku: 'S3', name: 'FC 51 C', price: price as FamilyVariant['price'] }),
    ]
    const ld = kur(varyantlar, FIYATLI_KATEGORI)

    fiyatsizdaYasakVarMi(ld)
    expect(liste(ld).numberOfItems).toBe(3)
    expect(liste(ld).itemListElement).toHaveLength(3)
    expect(tumVaryantlarFiyatliMi(varyantlar, FIYATLI_KATEGORI)).toBe(false)
  })

  it('(3) KARIŞIK aile (biri fiyatlı, biri fiyatsız) → CollectionPage; kısmi hasVariant YAZILMAZ', () => {
    const ld = kur(
      [makeFiyatliVariant({ id: 'v-1', sku: 'S1', name: 'Fiyatlı Model', price: 999 }), makeVariant({ id: 'v-2', sku: 'S2', name: 'Fiyatsız Model', price: null })],
      FIYATLI_KATEGORI,
    )

    fiyatsizdaYasakVarMi(ld)
    expect(liste(ld).numberOfItems).toBe(2)
    // Fiyatlı varyantın fiyatı da sızmaz (999 hiçbir yerde yok).
    expect(JSON.stringify(ld)).not.toContain('999')
    expect(liste(ld).itemListElement.map((e) => e.name)).toEqual(['Fiyatlı Model', 'Fiyatsız Model'])
  })

  it('(4) kategori hide_price (teklif modu) → fiyatlı varyantlar olsa da CollectionPage', () => {
    const varyantlar = [makeFiyatliVariant({ id: 'v-1', sku: 'S1', price: 37773.38 }), makeFiyatliVariant({ id: 'v-2', sku: 'S2', price: 100 })]
    expect(Number(varyantlar[0].price)).toBeGreaterThan(0) // kurgu gerçekten fiyatlı (negatif kontrol boş koşmasın)

    const ld = kur(varyantlar, { metadata: { hide_price: true } })

    fiyatsizdaYasakVarMi(ld)
    expect(JSON.stringify(ld)).not.toContain('37773')
    expect(liste(ld).numberOfItems).toBe(2)
  })

  it('(5) mainCategory null (mod bilinmiyor = güvenli taraf = teklif modu) → CollectionPage', () => {
    const ld = kur([makeFiyatliVariant({ price: 1500 })], null)

    fiyatsizdaYasakVarMi(ld)
    expect(liste(ld).numberOfItems).toBe(1)
  })

  it('(5b) varyantsız aile → CollectionPage (boş ProductGroup zorunlu alanı karşılayamaz), çökmez', () => {
    const ld = kur([], FIYATLI_KATEGORI)

    expect(ld['@type']).toBe('CollectionPage')
    expect(liste(ld)).toEqual({ '@type': 'ItemList', numberOfItems: 0, itemListElement: [] })
    expect(tumVaryantlarFiyatliMi([], FIYATLI_KATEGORI)).toBe(false)
  })

  it('(6) fiyatsız dalda tüm JSON çıktıda "price" anahtarı ve "0.00" yok (bayrak kapalı ve açık)', () => {
    for (const bayrak of [false, true]) {
      const ld = buildProductGroupJsonLd({
        family: makeFamily(),
        variants: [makeVariant({ price: 0 }), makeVariant({ id: 'v-2', sku: 'SKU-002', price: null })],
        lang: 'tr',
        baseUrl: BASE_URL,
        mainCategory: FIYATLI_KATEGORI,
        bayrak,
      })
      const metin = JSON.stringify(ld)
      expect(metin).not.toMatch(/"price/)
      expect(metin).not.toContain('0.00')
      expect(metin).not.toContain('TRY')
    }
  })

  it.each([
    ['tr', 'Aile açıklaması', 'Fan Ailesi Adı', 'Vortice Modeli'],
    ['en', 'Family description', 'Fan Family Name', 'Vortice Model'],
  ] as const)('(7) %s: CollectionPage dili bilir (ad, açıklama, url öneki, ListItem adı) ve marka about:Brand', (lang, aciklama, aileAdi, modelAdi) => {
    const ld = buildProductGroupJsonLd({
      family: makeFamily({
        slug: 'fc-51',
        name: 'Ham Ad',
        name_i18n: { tr: 'Fan Ailesi Adı', en: 'Fan Family Name' },
      }),
      variants: [makeVariant({ name_i18n: { tr: 'Vortice Modeli', en: 'Vortice Model' } })],
      lang,
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
      bayrak: false,
    })

    expect(ld['@type']).toBe('CollectionPage')
    expect(ld.description).toBe(aciklama)
    expect(ld.name).toBe(aileAdi)
    expect(ld.url).toBe(`${BASE_URL}/${lang}/products/fc-51`)
    expect(ld.about).toEqual({ '@type': 'Brand', name: 'Vortice' })
    expect(ld.isPartOf).toEqual({ '@type': 'WebSite', name: 'VentHub', url: BASE_URL })
    expect(liste(ld).itemListElement[0]).toEqual({ '@type': 'ListItem', position: 1, name: modelAdi })
  })

  it('marka yoksa about yazılmaz; açıklama yoksa bugünkü sabit metin (zincir korunur)', () => {
    const ld = buildProductGroupJsonLd({
      family: makeFamily({ brand_name: null, description: null }),
      variants: [makeVariant()],
      lang: 'en',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    expect(ld).not.toHaveProperty('about')
    expect(ld.description).toBe('VentHub Product Details')
  })

  it('grup görseli kuralı korunur: ilk görselli varyantın görseli CollectionPage.image; görsel yoksa alan YOK', () => {
    const gorselli = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [
        makeVariant({ id: 'v-1', sku: 'S1' }),
        makeVariant({ id: 'v-2', sku: 'S2', images: [{ path: 'aile/b.webp', alt: null, sort_order: 0 }] }),
        makeVariant({ id: 'v-3', sku: 'S3', images: [{ path: 'aile/a.webp', alt: null, sort_order: 0 }] }),
      ],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })
    const gorselsiz = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeVariant(), makeVariant({ id: 'v-2', sku: 'S2' })],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    expect(typeof gorselli.image).toBe('string')
    expect(String(gorselli.image)).toContain('aile/b.webp')
    expect(Object.prototype.hasOwnProperty.call(gorselsiz, 'image')).toBe(false)
  })

  it('ItemList url kararı: bayrak KAPALI → hiçbir satırda url yok (aile adresi yinelenmez); AÇIK kol adresUretYayindaModel.test.ts', () => {
    const varyantlar = [
      makeVariant({ id: 'v-1', sku: 'AAA-100', name: 'M1' }),
      makeVariant({ id: 'v-2', sku: 'AAA-101', name: 'M2' }),
    ]
    const kapali = buildProductGroupJsonLd({
      family: makeFamily({ slug: 'aile-a' }),
      variants: varyantlar,
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
      bayrak: false,
    })
    expect(liste(kapali).itemListElement.every((e) => !('url' in e))).toBe(true)
    expect(JSON.stringify(liste(kapali))).not.toContain('/products/aile-a')
    expect(liste(kapali).itemListElement.map((e) => e.position)).toEqual([1, 2])
  })

  it('UUID sızmaz (assertNoUuid yeşil) ve sku/mpn/model kodu ListItem\'a yazılmaz', () => {
    const ld = buildProductGroupJsonLd({
      family: makeFamily({ id: '11111111-2222-3333-4444-555555555555' }),
      variants: [makeVariant({ id: '66666666-7777-8888-9999-000000000000', sku: 'IC-KOD-1', model_code: 'MC-77' })],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: FIYATLI_KATEGORI,
    })

    expect(() => assertNoUuid(ld)).not.toThrow()
    const metin = JSON.stringify(ld)
    expect(metin).not.toContain('IC-KOD-1')
    expect(metin).not.toContain('MC-77')
  })
})

describe('buildCategoryJsonLd', () => {
  function makeFamilyListItem(overrides: Partial<FamilyListItem> = {}): FamilyListItem {
    return {
      id: 'fam-1',
      name: 'Family',
      slug: 'family-slug',
      series_code: null,
      description: null,
      brand_name: null,
      category_id: null,
      subcategory_id: null,
      cover_image_path: null,
      variant_count: 1,
      min_price: null,
      total_count: 1,
      ...overrides,
    }
  }

  it('url alanına /${lang} prefix\'i garanti eder', () => {
    const jsonLd = buildCategoryJsonLd({
      lang: 'tr',
      baseUrl: BASE_URL,
      categorySlug: 'fanlar',
      name: 'Fanlar',
      description: 'Fanlar kategorisindeki ürünler',
      total: 1,
      page: 1,
      pageSize: 24,
      families: [],
    })

    // Faz 3-C (URN-85 2/2): `ADRES_SEMASI_K3B` AÇIK → TR kategori adresi `/tr/kategori/<slug>` (EN: `/en/category/<slug>`).
    expect(jsonLd.url).toBe(`${BASE_URL}/tr/kategori/fanlar`)
  })

  it('itemListElement URL\'lerinde /${lang} prefix\'i eksik olmaz (B9)', () => {
    const jsonLd = buildCategoryJsonLd({
      lang: 'en',
      baseUrl: BASE_URL,
      categorySlug: 'fans',
      name: 'Fans',
      description: 'Products in category Fans',
      total: 1,
      page: 1,
      pageSize: 24,
      families: [makeFamilyListItem({ slug: 'dds-nano' })],
    })

    const items = liste(jsonLd).itemListElement
    expect(items[0].url).toBe(`${BASE_URL}/en/products/dds-nano`)
  })

  it('sayfalama pozisyonunu (page-1)*pageSize + index + 1 olarak hesaplar', () => {
    const jsonLd = buildCategoryJsonLd({
      lang: 'tr',
      baseUrl: BASE_URL,
      categorySlug: 'fanlar',
      name: 'Fanlar',
      description: '',
      total: 50,
      page: 2,
      pageSize: 24,
      families: [makeFamilyListItem({ slug: 'a' }), makeFamilyListItem({ slug: 'b' })],
    })

    const items = liste(jsonLd).itemListElement
    expect(items[0].position).toBe(25)
    expect(items[1].position).toBe(26)
  })

  it('isPartOf (WebSite) ekler', () => {
    const jsonLd = buildCategoryJsonLd({
      lang: 'tr',
      baseUrl: BASE_URL,
      categorySlug: 'fanlar',
      name: 'Fanlar',
      description: '',
      total: 0,
      page: 1,
      pageSize: 24,
      families: [],
    })

    expect(jsonLd.isPartOf).toEqual({ '@type': 'WebSite', name: 'VentHub', url: BASE_URL })
  })

  it('numberOfItems = total', () => {
    const jsonLd = buildCategoryJsonLd({
      lang: 'tr',
      baseUrl: BASE_URL,
      categorySlug: 'fanlar',
      name: 'Fanlar',
      description: '',
      total: 42,
      page: 1,
      pageSize: 24,
      families: [],
    })

    expect(liste(jsonLd).numberOfItems).toBe(42)
  })
})

describe('buildSeriesLandingJsonLd', () => {
  // T138-VH K7 — seri landing JSON-LD'si. Kart modeli kasıtlı `FamilyListItem` (SERİ kartıyla
  // BİREBİR aynı sözleşme, bkz. family.service.ts SeriesLanding yorumu).
  function makeFamilyListItem(overrides: Partial<FamilyListItem> = {}): FamilyListItem {
    return {
      id: 'model-1',
      name: 'Model',
      slug: 'model-slug',
      series_code: null,
      description: null,
      brand_name: null,
      category_id: null,
      subcategory_id: null,
      cover_image_path: null,
      variant_count: 1,
      min_price: null,
      total_count: 1,
      ...overrides,
    }
  }

  it('ProductGroup DEĞİL — CollectionPage üretir (seri satılabilir bir ürün değil, model listesi)', () => {
    const jsonLd = buildSeriesLandingJsonLd({
      lang: 'tr',
      baseUrl: BASE_URL,
      seriesSlug: 'lineo-quiet',
      name: 'Lineo Quiet',
      description: 'Lineo Quiet serisi',
      models: [],
    })

    expect(jsonLd['@type']).toBe('CollectionPage')
    expect(jsonLd['@type']).not.toBe('ProductGroup')
    expect(jsonLd).not.toHaveProperty('productGroupID')
    expect(jsonLd).not.toHaveProperty('hasVariant')
  })

  it('url alanına dil prefix\'i garanti eder (/products/<seri-slug>, /<kategori> DEĞİL)', () => {
    const jsonLd = buildSeriesLandingJsonLd({
      lang: 'en',
      baseUrl: BASE_URL,
      seriesSlug: 'lineo-quiet',
      name: 'Lineo Quiet',
      description: 'x',
      models: [],
    })

    expect(jsonLd.url).toBe(`${BASE_URL}/en/products/lineo-quiet`)
  })

  it('itemListElement her modelin AİLE URL\'ini (slug) taşır, id/UUID değil', () => {
    const jsonLd = buildSeriesLandingJsonLd({
      lang: 'tr',
      baseUrl: BASE_URL,
      seriesSlug: 'lineo-quiet',
      name: 'Lineo Quiet',
      description: 'x',
      models: [
        makeFamilyListItem({ id: '11111111-2222-3333-4444-555555555555', slug: 'lineo-100-quiet' }),
        makeFamilyListItem({ id: '22222222-3333-4444-5555-666666666666', slug: 'lineo-150-quiet' }),
      ],
    })

    const items = liste(jsonLd).itemListElement
    expect(items).toHaveLength(2)
    // Faz 3-C: aile adresi TR'de `/tr/urun/<slug>` (EN: `/en/products/<slug>`); id/UUID adreste hiç geçmez.
    expect(items[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      url: `${BASE_URL}/tr/urun/lineo-100-quiet`,
    })
    expect(items[1].url).toBe(`${BASE_URL}/tr/urun/lineo-150-quiet`)
    // Fiyat/offers hiç yazılmaz (kategori sayfasıyla aynı disiplin).
    expect(items[0]).not.toHaveProperty('offers')
  })

  it('numberOfItems = models.length', () => {
    const jsonLd = buildSeriesLandingJsonLd({
      lang: 'tr',
      baseUrl: BASE_URL,
      seriesSlug: 'lineo-quiet',
      name: 'Lineo Quiet',
      description: 'x',
      models: [makeFamilyListItem(), makeFamilyListItem({ id: 'model-2', slug: 'model-2' })],
    })

    expect(liste(jsonLd).numberOfItems).toBe(2)
  })

  it('isPartOf (WebSite) ekler', () => {
    const jsonLd = buildSeriesLandingJsonLd({
      lang: 'tr',
      baseUrl: BASE_URL,
      seriesSlug: 'lineo-quiet',
      name: 'Lineo Quiet',
      description: 'x',
      models: [],
    })

    expect(jsonLd.isPartOf).toEqual({ '@type': 'WebSite', name: 'VentHub', url: BASE_URL })
  })

  it('serialize edilmiş çıktıda UUID sızmaz (assertNoUuid yeşil) — model id DEĞİL slug yazılır', () => {
    const jsonLd = buildSeriesLandingJsonLd({
      lang: 'tr',
      baseUrl: BASE_URL,
      seriesSlug: 'lineo-quiet',
      name: 'Lineo Quiet',
      description: 'x',
      models: [makeFamilyListItem({ id: '11111111-2222-3333-4444-555555555555', slug: 'lineo-100-quiet' })],
    })

    expect(() => assertNoUuid(jsonLd)).not.toThrow()
  })
})

describe('assertNoUuid', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('UUID deseni içeren objede (dev/test ortamında) throw eder', () => {
    vi.stubEnv('NODE_ENV', 'test')
    const leaking = { id: '11111111-2222-3333-4444-555555555555' }

    expect(() => assertNoUuid(leaking)).toThrow(/UUID/)
  })

  it('production ortamında hiç kontrol etmez (no-op)', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const leaking = { id: '11111111-2222-3333-4444-555555555555' }

    expect(() => assertNoUuid(leaking)).not.toThrow()
  })

  it('UUID içermeyen objede (dev/test) throw etmez', () => {
    vi.stubEnv('NODE_ENV', 'test')
    expect(() => assertNoUuid({ id: 'dds-nano', slug: 'dds-nano-100' })).not.toThrow()
  })
})
