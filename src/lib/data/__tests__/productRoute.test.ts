/**
 * INV-SERIES-LANDING-1 — seri slug'ı 200 + landing döndürür; ÜRÜNSÜZ ve seri OLMAYAN
 * aile ise GERÇEK 404 alır (soft-404 yasak).
 *
 * Ölçüm (2026-08-21, T138 K1 öncesi): `get_family_detail` varyant şartı koymuyor —
 * varyantsız bir aile satırı için `family` dolu, `variants` boş dönüyordu. Sayfa bunu
 * "aile bulundu" sayıp PDP'ye giriyor, PDP de varyant seçemediği için `pdp.productNotFound`
 * kutusunu **HTTP 200 ile** basıyordu. Yani:
 *   - model katmanı açıldığında her SERİ sayfası boş bir kutu olacaktı,
 *   - içi boşalmış her aile arama motoruna "bu sayfa var ve geçerli" diyecekti.
 * İki arıza da hiçbir testi kırmıyordu. Bekçisi bu dosyadır.
 *
 * Yöntem: `resolveProductRoute` saf ve DI'lı — veri erişimi enjekte edilir, karar
 * deterministik ölçülür (ağ yok, Next runtime yok).
 *
 * Cetvel: docs/standards/product-schema-standard.md §11.5 · rendering-cache-standard.md
 */
import { describe, expect, it, vi } from 'vitest'

import type { FamilyDetail, SeriesLanding } from '@/lib/services/family.service'

import type { ProductRouteDeps } from '../productRoute'
import { resolveProductRoute } from '../productRoute'

function familyDetailFixture(variantCount: number): FamilyDetail {
  return {
    family: {
      id: 'fam-1',
      name: 'Lineo 100 Quiet',
      slug: 'lineo-100-quiet',
      series_code: 'LINEO',
      description: null,
      brand_name: 'Vortice',
      category_id: null,
      subcategory_id: null,
      meta_title: null,
      meta_description: null,
    },
    variants: Array.from({ length: variantCount }, (_, i) => ({
      id: 'var-' + i,
      sku: 'SKU-' + i,
      name: 'Varyant ' + i,
      slug: 'varyant-' + i,
      model_code: null,
      price: null,
      stock_qty: null,
      technical_specs: null,
      description: null,
      images: [],
    })),
    price_tax_included: null,
  }
}

const seriesLandingFixture: SeriesLanding = {
  series: {
    id: 'series-1',
    name: 'Lineo Quiet',
    slug: 'lineo-quiet',
    series_code: 'LINEO',
    description: null,
    brand_name: 'Vortice',
    category_id: null,
    subcategory_id: null,
    // T138-VH K7: breadcrumb/JSON-LD kategori zenginleştirmesi bu fixture'ın konusu değil —
    // resolveProductRoute kategori alanlarına hiç bakmaz, yalnız tip sözleşmesi için doldurulur.
    category: null,
    subcategory: null,
  },
  models: [
    {
      id: 'fam-1',
      name: 'Lineo 100 Quiet',
      slug: 'lineo-100-quiet',
      series_code: 'LINEO',
      description: null,
      brand_name: 'Vortice',
      category_id: null,
      subcategory_id: null,
      cover_image_path: 'tenant/fam-1/01.webp',
      variant_count: 2,
      min_price: null,
      total_count: 1,
    },
  ],
}

/** Varsayılan: hiçbir şey bulunamaz. Her test yalnız ilgilendiği ucu doldurur. */
function deps(overrides: Partial<ProductRouteDeps> = {}): ProductRouteDeps {
  return {
    familyDetail: vi.fn(async () => null),
    seriesLanding: vi.fn(async () => null),
    variantBySlug: vi.fn(async () => null),
    familySlugById: vi.fn(async () => null),
    ...overrides,
  }
}

describe('INV-SERIES-LANDING-1: seri landing 200, ürünsüz aile gerçek 404', () => {
  it('SERİ slug → landing döndürür (soft-404 kutusu DEĞİL)', async () => {
    // Seri satırı `get_family_detail`te family dolu / variants BOŞ gelir — eski zincir
    // tam burada PDP'ye girip "ürün bulunamadı" basıyordu.
    const d = deps({
      familyDetail: vi.fn(async () => familyDetailFixture(0)),
      seriesLanding: vi.fn(async () => seriesLandingFixture),
    })

    const result = await resolveProductRoute('lineo-quiet', 'tr', d)

    expect(result.kind).toBe('series')
    if (result.kind !== 'series') throw new Error('seri beklenirken ' + result.kind)
    expect(result.landing.series.slug).toBe('lineo-quiet')
    expect(result.landing.models).toHaveLength(1)
  })

  it('ÜRÜNSÜZ ve seri OLMAYAN aile → GERÇEK 404 (200 + boş kutu değil)', async () => {
    const d = deps({
      // Aile satırı var ama aktif varyantı yok; seri de değil (parent dolu ya da modeli yok).
      familyDetail: vi.fn(async () => familyDetailFixture(0)),
      seriesLanding: vi.fn(async () => null),
    })

    const result = await resolveProductRoute('ici-bosalmis-aile', 'tr', d)

    expect(result.kind).toBe('not-found')
  })

  it('aktif varyantlı aile → PDP; seri sorgusu HİÇ çalışmaz (sıra bekçisi)', async () => {
    const seriesLanding = vi.fn(async () => seriesLandingFixture)
    const d = deps({
      familyDetail: vi.fn(async () => familyDetailFixture(3)),
      seriesLanding,
    })

    const result = await resolveProductRoute('lineo-100-quiet', 'tr', d)

    expect(result.kind).toBe('family')
    // Aile slug'ı asla seri/redirect dalına düşmemeli — döngü ve gereksiz sorgu yok.
    expect(seriesLanding).not.toHaveBeenCalled()
  })

  it('varyant slug → kanonik aile URL’ine 308 (sku URL-kodlanır)', async () => {
    const d = deps({
      variantBySlug: vi.fn(async () => ({ sku: 'A/B 100', family_id: 'fam-1' })),
      familySlugById: vi.fn(async () => 'lineo-100-quiet'),
    })

    const result = await resolveProductRoute('eski-varyant-slug', 'en', d)

    expect(result.kind).toBe('redirect')
    if (result.kind !== 'redirect') throw new Error('redirect beklenirken ' + result.kind)
    expect(result.to).toBe('/en/products/lineo-100-quiet?sku=A%2FB%20100')
  })

  it('VERİYE ULAŞILAMADI 404 DEĞİLDİR — geçici arıza kalıcı yokluk beyanına dönüşmez', async () => {
    const d = deps({
      familyDetail: vi.fn(async () => {
        throw new Error('fetch failed')
      }),
    })

    const result = await resolveProductRoute('lineo-quiet', 'tr', d)

    expect(result.kind).toBe('unavailable')
    expect(result.kind).not.toBe('not-found')
  })

  it('hiçbir kayıt yok → 404', async () => {
    const result = await resolveProductRoute('boyle-bir-sey-yok', 'tr', deps())
    expect(result.kind).toBe('not-found')
  })
})
