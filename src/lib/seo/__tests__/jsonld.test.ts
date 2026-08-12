import { afterEach, describe, expect, it, vi } from 'vitest'

import type { FamilyListItem } from '../../../types/ui-models'
import type { FamilyVariant } from '../../services/family.service'
import { assertNoUuid, buildCategoryJsonLd, buildProductGroupJsonLd } from '../jsonld'

// F5-B W3.1 — jsonld.ts saf-fonksiyon birim testleri.
// Sunucu bileşenlerine (page.tsx) hiç dokunmaz; yalnız buildProductGroupJsonLd /
// buildCategoryJsonLd / assertNoUuid'nin girdi→çıktı sözleşmesini doğrular.

const BASE_URL = 'https://venthub.com'

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
    ...overrides,
  }
}

describe('buildProductGroupJsonLd', () => {
  it('productGroupID alanını family.slug olarak yazar', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily({ slug: 'dds-nano' }),
      variants: [],
      lang: 'tr',
      baseUrl: BASE_URL,
    })

    expect(jsonLd.productGroupID).toBe('dds-nano')
    expect(jsonLd['@type']).toBe('ProductGroup')
  })

  it('url alanına dil prefix\'i garanti eder, varyant URL\'i asla yazmaz', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily({ slug: 'dds-nano' }),
      variants: [makeVariant({ slug: 'dds-nano-100' })],
      lang: 'en',
      baseUrl: BASE_URL,
    })

    expect(jsonLd.url).toBe(`${BASE_URL}/en/products/dds-nano`)
    expect(JSON.stringify(jsonLd)).not.toContain('dds-nano-100')
  })

  it('fiyatı NULL olan varyanta offers alanı hiç yazılmaz', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeVariant({ price: null })],
      lang: 'tr',
      baseUrl: BASE_URL,
    })

    const hasVariant = jsonLd.hasVariant as Record<string, unknown>[]
    expect(hasVariant).toHaveLength(1)
    expect(hasVariant[0]).not.toHaveProperty('offers')
  })

  it('fiyatı olan varyanta Offer (price/priceCurrency/availability) yazar', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeVariant({ price: 1234.5, stock_qty: 3 })],
      lang: 'tr',
      baseUrl: BASE_URL,
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
    })

    const hasVariant = jsonLd.hasVariant as Record<string, unknown>[]
    const offers = hasVariant[0].offers as Record<string, unknown>
    expect(offers.availability).toBe('https://schema.org/OutOfStock')
  })

  it('mpn = model_code ?? sku', () => {
    const withModelCode = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeVariant({ sku: 'SKU-A', model_code: 'MC-100' })],
      lang: 'tr',
      baseUrl: BASE_URL,
    })
    const withoutModelCode = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [makeVariant({ sku: 'SKU-B', model_code: null })],
      lang: 'tr',
      baseUrl: BASE_URL,
    })

    const v1 = (withModelCode.hasVariant as Record<string, unknown>[])[0]
    const v2 = (withoutModelCode.hasVariant as Record<string, unknown>[])[0]
    expect(v1.mpn).toBe('MC-100')
    expect(v2.mpn).toBe('SKU-B')
  })

  it('görseli olan varyanta image alanı ekler, olmayana eklemez', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily(),
      variants: [
        makeVariant({ sku: 'SKU-IMG', images: [{ path: 'products/a.webp', alt: null, sort_order: 0 }] }),
        makeVariant({ sku: 'SKU-NOIMG', images: [] }),
      ],
      lang: 'tr',
      baseUrl: BASE_URL,
    })

    const hasVariant = jsonLd.hasVariant as Record<string, unknown>[]
    expect(hasVariant[0]).toHaveProperty('image')
    expect(hasVariant[1]).not.toHaveProperty('image')
  })

  it('brand_name varsa Brand node yazar, yoksa brand alanını hiç yazmaz', () => {
    const withBrand = buildProductGroupJsonLd({
      family: makeFamily({ brand_name: 'Vortice' }),
      variants: [],
      lang: 'tr',
      baseUrl: BASE_URL,
    })
    const withoutBrand = buildProductGroupJsonLd({
      family: makeFamily({ brand_name: null }),
      variants: [],
      lang: 'tr',
      baseUrl: BASE_URL,
    })

    expect(withBrand.brand).toEqual({ '@type': 'Brand', name: 'Vortice' })
    expect(withoutBrand).not.toHaveProperty('brand')
  })

  it('description dil çözülür (tr/en fallback)', () => {
    const trOut = buildProductGroupJsonLd({
      family: makeFamily({ description: { tr: 'TR açıklama', en: 'EN description' } }),
      variants: [],
      lang: 'tr',
      baseUrl: BASE_URL,
    })
    const enOut = buildProductGroupJsonLd({
      family: makeFamily({ description: { tr: 'TR açıklama', en: 'EN description' } }),
      variants: [],
      lang: 'en',
      baseUrl: BASE_URL,
    })

    expect(trOut.description).toBe('TR açıklama')
    expect(enOut.description).toBe('EN description')
  })

  it('serialize edilmiş çıktıda UUID sızmaz (assertNoUuid yeşil)', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: makeFamily({ id: '11111111-2222-3333-4444-555555555555', slug: 'test-family' }),
      variants: [makeVariant({ id: '66666666-7777-8888-9999-000000000000' })],
      lang: 'tr',
      baseUrl: BASE_URL,
    })

    expect(() => assertNoUuid(jsonLd)).not.toThrow()
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

    expect(jsonLd.url).toBe(`${BASE_URL}/tr/category/fanlar`)
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

    const items = jsonLd.itemListElement as Record<string, unknown>[]
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

    const items = jsonLd.itemListElement as Record<string, unknown>[]
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

    expect(jsonLd.numberOfItems).toBe(42)
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
