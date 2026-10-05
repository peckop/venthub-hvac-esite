/**
 * REC-300 Faz 3d — bayrak AÇIKKEN (Faz 3-C benzetimi, `features.ts` modül düzeyinde taklit) yüzeylerin
 * VARSAYILAN bayrakla davranışı: `useLocalizedRoutes` vekili (35+ yüzey), Bilgi Merkezi iç bağlantı
 * çözücüsü, aile/model sayfasının canonical/hreflang/og:url adresleri.
 *
 * EK ÖLÇÜM (OPS): frekans konvertörü yazısının üç aile bağlantısı bayrak açıkken DOĞRUDAN yeni adrese
 * çözülür; bugün sayfada yazılı eski adres (`/tr/products/danfoss-*`, canlı ölçüm 2026-09-27) ise 3c eski
 * adres eşleyicisinde AYNI hedefe TEK 308 alır — iki yolun hedefi birebir aynı.
 */
import { renderHook } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

// `EN_YAYIN: true`: hreflang yalnız EN yayındayken yazılır (REC-300 3e-3); bu dosya hreflang ADRESLERİNİ ölçer.
vi.mock('@/config/features', async (asil) => ({ ...(await asil<typeof import('@/config/features')>()), ADRES_SEMASI_K3B: true, EN_YAYIN: true }))

const db = vi.hoisted(() => ({ aile: vi.fn() }))
vi.mock('@/lib/data/preload', () => ({
  getCachedFamilyDetail: db.aile,
  preloadFamily: vi.fn(),
  getFamilyDetailForRoute: vi.fn(),
  getCachedSeriesLanding: vi.fn(),
  getCachedProductBySlug: vi.fn(),
  getCachedFamilySlugById: vi.fn(),
  getCachedTakmaAd: vi.fn(),
  getCachedVariantById: vi.fn(),
  getCachedModelBySku: vi.fn(),
}))

import { aileSayfasiAdresleri, aileSayfasiUstVerisi } from '../../app/_components/aileSayfasi'
import { SITE_URL } from '../../config/siteUrl'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { I18nProvider } from '../../i18n/I18nProvider'
import { eskiAdresEsle } from '../../lib/adres/eslestirici'
import type { KiraciHaritasi } from '../../lib/adres/haritaTipi'
import { sahteKaynak } from '../../lib/bilgiMerkezi/__tests__/sahteKaynak'
import { icBaglantiCoz } from '../../lib/bilgiMerkezi/icBaglanti'
import { buildProductGroupJsonLd } from '../../lib/seo/jsonld'
import { dilDegistirYolu } from '../yuzeyAdresleri'

const SITE = SITE_URL

function sarici(lang: 'tr' | 'en') {
  return function Sarici({ children }: { children: React.ReactNode }) {
    return <I18nProvider lang={lang}>{children}</I18nProvider>
  }
}

describe('useLocalizedRoutes vekili — K3-b açık', () => {
  it('TR: vitrin nesneleri adresUret şemasında, ?sku= yok', () => {
    const { result } = renderHook(() => useLocalizedRoutes(), { wrapper: sarici('tr') })
    const r = result.current
    expect(r.products()).toBe('/tr/urunler')
    expect(r.products({ brand: 'Vortice' })).toBe('/tr/urunler?brand=Vortice')
    expect(r.product('storm-serisi')).toBe('/tr/urun/storm-serisi')
    expect(r.product('storm-serisi', 'SEA-61143003')).toBe('/tr/urun/storm-serisi-p-sea-61143003')
    expect(r.category('fanlar', 'kanal-tipi-fanlar')).toBe('/tr/kategori/fanlar/kanal-tipi-fanlar')
    expect(r.category('fanlar')).toBe('/tr/kategori/fanlar')
    expect(r.brand('vortice')).toBe('/tr/markalar/vortice')
  })

  it('EN: önekler aynı, dal iki seviyeli, model kendi adresinde', () => {
    const { result } = renderHook(() => useLocalizedRoutes(), { wrapper: sarici('en') })
    expect(result.current.category('fans', 'duct-fans')).toBe('/en/category/fans/duct-fans')
    expect(result.current.product('storm-serisi', 'SEA-1')).toBe('/en/products/storm-serisi-p-sea-1')
    expect(result.current.brand('vortice')).toBe('/en/brands/vortice')
  })

  it('vitrin nesnesi OLMAYAN rotalar değişmez (sepet, hesap, marka listesi)', () => {
    const { result } = renderHook(() => useLocalizedRoutes(), { wrapper: sarici('tr') })
    expect(result.current.cart()).toBe('/tr/cart')
    expect(result.current.account.orders()).toBe('/tr/account/orders')
    expect(result.current.brands()).toBe('/tr/brands')
  })
})

describe('Bilgi Merkezi iç bağlantı çözücüsü — K3-b açık (adresUret doğrudan)', () => {
  const k = sahteKaynak()
  it('aile, model (seçili model korunur), kategori, tüm ürünler', async () => {
    expect(await icBaglantiCoz('vh:aile/danfoss-fc101', 'tr', k)).toBe('/tr/urun/danfoss-fc101')
    expect(await icBaglantiCoz('vh:model/vrt-65195', 'tr', k)).toBe('/tr/urun/vortice-hava-perdesi-p-vrt-65195')
    expect(await icBaglantiCoz('vh:kategori/frequency-converters', 'tr', k)).toBe('/tr/kategori/frekans-konvertorleri')
    expect(await icBaglantiCoz('vh:kategori/smoke-exhaust-fans', 'tr', k)).toBe('/tr/kategori/fanlar/duman-egzoz-fanlari')
    expect(await icBaglantiCoz('vh:sayfa/urunler', 'tr', k)).toBe('/tr/urunler')
    expect(await icBaglantiCoz('vh:marka/vortice', 'tr', k)).toBe('/tr/markalar/vortice')
  })

  it('EK ÖLÇÜM: frekans konvertörü yazısı — bugünkü href 3c eşleyicisinde yeni adrese TEK 308, hedef çözücüyle AYNI', async () => {
    const aileler = ['danfoss-fc101', 'danfoss-fc102', 'danfoss-fc51']
    const harita: KiraciHaritasi = {
      urunSayisi: 35,
      aileler,
      modeller: {},
      eskiSkular: {},
      urunSluglari: {},
      aileSluglari: Object.fromEntries(aileler.map((a, i) => [a, i])),
      kategoriler: [],
      kategoriSluglari: {},
    }
    for (const aile of aileler) {
      const yeni = await icBaglantiCoz(`vh:aile/${aile}`, 'tr', k)
      // Canlıdaki yazıda bugün yazılı olan href (ölçüldü 2026-09-27: /tr/products/danfoss-fc101 · fc102 · fc51, üçü 200).
      const eski = `/tr/products/${aile}`
      expect(eskiAdresEsle(harita, { yol: eski, sku: null, dilTespit: () => 'tr' })).toEqual({ hedef: yeni, durum: 308 })
    }
  })
})

describe('aile/model sayfası adresleri — K3-b açık', () => {
  it('aile sayfası: canonical + hreflang + og:url adresUret', async () => {
    db.aile.mockResolvedValue({
      family: { slug: 'storm-serisi', name: 'Storm', meta_title: null, meta_description: null, description: null },
      variants: [],
    })
    const m = await aileSayfasiUstVerisi('tr', 'storm-serisi')
    expect(m.alternates?.canonical).toBe(`${SITE}/tr/urun/storm-serisi`)
    expect(m.alternates?.languages).toEqual({
      tr: `${SITE}/tr/urun/storm-serisi`,
      en: `${SITE}/en/products/storm-serisi`,
      'x-default': `${SITE}/tr/urun/storm-serisi`,
    })
    expect(m.openGraph?.url).toBe(`${SITE}/tr/urun/storm-serisi`)
  })

  it('model sayfası: kanonik modelin KENDİ adresi (aile değil)', async () => {
    const m = await aileSayfasiUstVerisi('en', 'storm-serisi', 'SEA-61143003')
    expect(m.alternates?.canonical).toBe(`${SITE}/en/products/storm-serisi-p-sea-61143003`)
    expect(m.openGraph?.url).toBe(`${SITE}/en/products/storm-serisi-p-sea-61143003`)
  })

  it('bayrak kapalı kolu (parametre) bugünkü ifade', () => {
    expect(aileSayfasiAdresleri('storm-serisi', 'SEA-1', false)).toEqual({
      tr: `${SITE}/tr/products/storm-serisi`,
      en: `${SITE}/en/products/storm-serisi`,
    })
  })
})

describe('varsayılan bayrakla diğer yüzeyler', () => {
  it('JSON-LD ProductGroup varsayılanı yeni şema', () => {
    const ld = buildProductGroupJsonLd({
      family: { id: 'f', name: 'S', slug: 'storm-serisi', series_code: null, description: null, brand_name: null, category_id: null, subcategory_id: null, meta_title: null, meta_description: null, category: null, subcategory: null },
      variants: [],
      lang: 'tr',
      baseUrl: SITE,
      mainCategory: null,
    }) as { url: string }
    expect(ld.url).toBe(`${SITE}/tr/urun/storm-serisi`)
  })

  it('LanguageSwitcher yolu bölüm adını çevirir', () => {
    expect(dilDegistirYolu('/tr/urun/storm-serisi', 'en')).toBe('/en/products/storm-serisi')
  })
})
