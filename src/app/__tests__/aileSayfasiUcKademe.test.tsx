/**
 * URN-144 (karar 410) — aile sayfası kırıntısı üç kademede: görünür `<nav>` ve BreadcrumbList JSON-LD AYNI zincirden,
 * zincir `parent_id`'den. KARMA sütun (Aksesuarlar dalı: category_id = orta, subcategory_id = yaprak) kökü düşürmez;
 * diğer dallar (category_id = kök, subcategory_id = alt) iki kademe olarak eskisiyle aynı çıkar.
 *
 * Yöntem `ureticiMarkaBaglantisi.test.tsx` ile aynı: sayfanın GERÇEK sunucu çıktısı (AileSayfasi → renderToStaticMarkup).
 * Kimlikler/adlar test verisidir. ÖLÇMEDİĞİ: canlı HTML.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const durum = vi.hoisted(() => ({
  detail: null as unknown,
  satirlar: new Map<string, unknown>(),
  okunan: [] as string[],
}))

vi.mock('@/config/features', async (orijinal) => ({
  ...(await orijinal<typeof import('@/config/features')>()),
  ADRES_SEMASI_K3B: true,
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tr/urun/ptc',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/data/preload', () => ({
  preloadFamily: vi.fn(),
  getCachedFamilyDetail: vi.fn(),
  getCachedKategoriUstById: async (id: string) => {
    durum.okunan.push(id)
    return durum.satirlar.get(id) ?? null
  },
}))
vi.mock('@/lib/data/urunSegmenti', () => ({ urunRotasiBagimliliklari: vi.fn(() => ({})) }))
vi.mock('@/lib/data/productRoute', () => ({
  resolveProductRoute: vi.fn(async () => ({ kind: 'family', detail: durum.detail })),
}))
vi.mock('@/lib/bilgiMerkezi/tersDizin', () => ({ ilgiliRehberler: () => [] }))

vi.mock('@/i18n/I18nProvider', async () => {
  const { tr: trSozluk } = await import('@/i18n/dictionaries/tr')
  const { getDictValue: oku } = await import('@/i18n/getDictValue')
  return { useI18n: () => ({ lang: 'tr', t: (k: string) => oku(trSozluk, k) }) }
})
vi.mock('../../contexts/CategoryContext', () => ({ useCategories: () => ({ categories: [] }) }))
vi.mock('../../hooks/useCartHook', () => ({ useCart: () => ({ addToCart: vi.fn() }) }))
vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => ({ isFavorite: () => false, toggleFavorite: vi.fn() }),
}))
vi.mock('../../hooks/useProjectLists', () => ({ useProjectLists: () => ({ refreshProjects: vi.fn() }) }))
vi.mock('../../lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../components/ImageGallery', () => ({ default: () => null }))
vi.mock('../../components/product/ProductSmartInference', () => ({ ProductSmartInference: () => null }))
vi.mock('../../components/products', () => ({ AddToProjectModal: () => null }))
vi.mock('../../components/quotes/QuoteRequestModal', () => ({ default: () => null }))

import { AileSayfasi } from '../_components/aileSayfasi'

type Satir = { id: string; ad: string; slug: string; tr: string; parent_id: string | null; aktif?: boolean }

const KOK: Satir = { id: 'k', ad: 'Aksesuarlar', slug: 'test-kok', tr: 'aksesuarlar', parent_id: null }
const ORTA: Satir = { id: 'o', ad: 'Elektrik Aksesuarları', slug: 'test-orta', tr: 'elektrik-aksesuarlari', parent_id: 'k' }
const YAPRAK: Satir = { id: 'y', ad: 'Frekans Konvertörleri', slug: 'test-yaprak', tr: 'frekans-konvertorleri', parent_id: 'o' }
const FANS: Satir = { id: 'f', ad: 'Fanlar', slug: 'fans', tr: 'fanlar', parent_id: null }
const KANAL: Satir = { id: 'a', ad: 'Kanal Tipi Fanlar', slug: 'duct-fans', tr: 'kanal-tipi-fanlar', parent_id: 'f' }

const dbSatiri = (s: Satir) => ({
  id: s.id,
  slug: s.slug,
  name: s.ad,
  menu_label: s.ad,
  translation_key: null,
  metadata: { slug: { tr: s.tr, en: s.slug } },
  is_active: s.aktif ?? true,
  parent_id: s.parent_id,
})

function kur(ana: Satir | null, alt: Satir | null, tum: Satir[]) {
  durum.satirlar = new Map(tum.map((s) => [s.id, dbSatiri(s)]))
  durum.okunan.length = 0
  durum.detail = {
    family: {
      id: 'f1',
      name: 'PTC',
      slug: 'ptc',
      series_code: null,
      description: null,
      brand_name: null,
      category_id: ana?.id ?? null,
      subcategory_id: alt?.id ?? null,
      meta_title: null,
      meta_description: null,
      category: ana ? dbSatiri(ana) : null,
      subcategory: alt ? dbSatiri(alt) : null,
    },
    variants: [
      { id: 'v1', sku: 'PTC-1', name: 'PTC 1', slug: null, model_code: '1', price: null, stock_qty: null, technical_specs: null, description: null, images: [] },
    ],
    price_tax_included: null,
  }
}

async function sayfa() {
  const html = renderToStaticMarkup(await AileSayfasi({ lang: 'tr', slug: 'ptc', sunucuSku: null }))
  const nav = html.match(/<nav aria-label="[^"]*">[\s\S]*?<\/nav>/)?.[0] ?? ''
  const baglantilar = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => [m[1], m[2].replace(/<[^>]+>/g, '').trim()])
  const jsonlar = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
  const liste = jsonlar.find((j) => j['@type'] === 'BreadcrumbList') as { itemListElement: { name: string }[] } | undefined
  return { baglantilar, jsonAdlari: liste?.itemListElement.map((e) => e.name) ?? [] }
}

beforeEach(() => {
  durum.okunan.length = 0
})

describe('AileSayfasi kırıntısı — zincir parent_id\'den', () => {
  it('KARMA sütun (category_id = orta, subcategory_id = yaprak): kök eksik KALMAZ; kök tek okumayla gelir', async () => {
    kur(ORTA, YAPRAK, [KOK, ORTA, YAPRAK])
    const { baglantilar, jsonAdlari } = await sayfa()
    expect(baglantilar.map((b) => b[1])).toEqual(['Ana Sayfa', 'Aksesuarlar', 'Elektrik Aksesuarları', 'Frekans Konvertörleri'])
    expect(baglantilar.map((b) => b[0]).slice(1)).toEqual([
      '/tr/kategori/aksesuarlar',
      '/tr/kategori/elektrik-aksesuarlari',
      '/tr/kategori/frekans-konvertorleri',
    ])
    // JSON-LD aynı diziden (son basamak aile adı bağlantısızdır, JSON-LD'de bulunur).
    expect(jsonAdlari).toEqual(['Ana Sayfa', 'Aksesuarlar', 'Elektrik Aksesuarları', 'Frekans Konvertörleri', 'PTC'])
    expect(durum.okunan).toEqual(['k'])
  })

  it('iki kademe (category_id = kök, subcategory_id = alt): eski çıktı, HİÇ ek okuma yok', async () => {
    kur(FANS, KANAL, [FANS, KANAL])
    const { baglantilar, jsonAdlari } = await sayfa()
    expect(baglantilar.map((b) => b[1])).toEqual(['Ana Sayfa', 'Fanlar', 'Kanal Tipi Fanlar'])
    expect(jsonAdlari).toEqual(['Ana Sayfa', 'Fanlar', 'Kanal Tipi Fanlar', 'PTC'])
    expect(durum.okunan).toEqual([])
  })

  it('yalnız yaprak sütunda ve alt boş değil: orta ve kök ata zincirinden', async () => {
    kur(null, YAPRAK, [KOK, ORTA, YAPRAK])
    const { jsonAdlari } = await sayfa()
    expect(jsonAdlari).toEqual(['Ana Sayfa', 'Aksesuarlar', 'Elektrik Aksesuarları', 'Frekans Konvertörleri', 'PTC'])
  })

  it('alt kategori boş (aile ana kategoriye bağlı): yalnız ana', async () => {
    kur(FANS, null, [FANS])
    const { jsonAdlari } = await sayfa()
    expect(jsonAdlari).toEqual(['Ana Sayfa', 'Fanlar', 'PTC'])
  })

  it('pasif ORTA ara halka kırıntıya BASILMAZ (sayfası aktif atasına yönlenir)', async () => {
    kur(null, YAPRAK, [KOK, { ...ORTA, aktif: false }, YAPRAK])
    const { jsonAdlari } = await sayfa()
    expect(jsonAdlari).toEqual(['Ana Sayfa', 'Aksesuarlar', 'Frekans Konvertörleri', 'PTC'])
  })
})
