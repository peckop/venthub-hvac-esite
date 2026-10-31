/**
 * URN-149 — aile sayfası H1'ine ve (≤60 karakter kalırsa) <title>'a debi aralığı; JSON-LD adı DEĞİŞMEZ.
 *
 * KAPI NE ÖLÇER: gerçek `aileSayfasiUstVerisi` + `AileSayfasi`: (a) debisiz / yalnız-nominal aile H1 ve title'a ek almaz,
 * (b) debili aile H1 "<ad> <debi>", title tavan içindeyse debili, (c) title >60 olacaksa title değişmez ama H1 debili,
 * (d) dolu `meta_title` sabit, (e) EN sayı biçimi, (f) JSON-LD `name` ham aile adı (debisiz).
 * ÖLÇMEDİĞİ: canlı HTML (birleşme sonrası tarayıcı bölmesiyle ayrıca ölçülür).
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const durum = vi.hoisted(() => ({ dil: 'tr' as 'tr' | 'en', detail: null as unknown }))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tr/products/x',
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/lib/data/preload', () => ({
  preloadFamily: vi.fn(),
  getCachedFamilyDetail: vi.fn(async () => durum.detail),
}))
vi.mock('@/lib/data/urunSegmenti', () => ({ urunRotasiBagimliliklari: vi.fn(() => ({})) }))
vi.mock('@/lib/data/productRoute', () => ({
  resolveProductRoute: vi.fn(async () => ({ kind: 'family', detail: durum.detail })),
}))
vi.mock('@/lib/bilgiMerkezi/tersDizin', () => ({ ilgiliRehberler: () => [] }))
vi.mock('@/i18n/I18nProvider', async () => {
  const { tr: trSozluk } = await import('@/i18n/dictionaries/tr')
  const { en: enSozluk } = await import('@/i18n/dictionaries/en')
  const { getDictValue: oku } = await import('@/i18n/getDictValue')
  return {
    useI18n: () => ({
      lang: durum.dil,
      t: (k: string) => oku(durum.dil === 'en' ? enSozluk : trSozluk, k),
    }),
  }
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

import { AileSayfasi, aileSayfasiUstVerisi } from '../_components/aileSayfasi'

type Specs = Record<string, string | number | boolean | null> | null

function varyant(kod: string, technical_specs: Specs) {
  return {
    id: `v-${kod}`,
    sku: `SKU-${kod}`,
    name: `Model ${kod}`,
    slug: null,
    model_code: kod,
    price: null,
    stock_qty: null,
    technical_specs,
    description: null,
    images: [],
  }
}

function detayKur(ad: string, specler: Specs[], metaTitle: { tr: string; en: string } | null = null) {
  return {
    family: {
      id: 'f1',
      name: ad,
      name_i18n: { tr: ad, en: ad },
      slug: 'test-ailesi',
      series_code: null,
      description: { tr: 'Aile açıklaması.', en: 'Family description.' },
      brand_name: 'Vortice',
      category_id: null,
      subcategory_id: null,
      meta_title: metaTitle,
      meta_description: null,
      category: null,
      subcategory: null,
    },
    variants: specler.map((s, i) => varyant(String(i + 1), s)),
    price_tax_included: null,
  }
}

const h1ler = (h: string) => [...h.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim())
const jsonLdler = (h: string): Array<Record<string, unknown>> =>
  [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1].replace(/\\u003c/g, '<').replace(/\\u003e/g, '>')),
  )

async function sayfa(lang: 'tr' | 'en', detay: unknown) {
  durum.dil = lang
  durum.detail = detay
  const meta = await aileSayfasiUstVerisi(lang, 'test-ailesi')
  const h = renderToStaticMarkup(await AileSayfasi({ lang, slug: 'test-ailesi', sunucuSku: null }))
  return { title: String(meta.title), h1: h1ler(h), jsonLd: jsonLdler(h) }
}

const AD = 'Vortice VORT Quadro Evo'
const DEBILI: Specs[] = [{ max_delivery_m3h: 60 }, { max_delivery_m3h: 100 }]

beforeEach(() => {
  durum.dil = 'tr'
  durum.detail = null
})

describe('URN-149 aile başlığı debi aralığı', () => {
  it('(a) debisiz aile ve yalnız-nominal aile: H1 ve title ek almaz', async () => {
    for (const specler of [[null, null], [{ nominal_delivery_m3h: 500 }, { nominal_delivery_m3h: 900 }]] as Specs[][]) {
      const s = await sayfa('tr', detayKur(AD, specler))
      expect(s.h1).toEqual([AD])
      expect(s.title).toBe(`${AD} | VentHub`)
    }
  })

  it('(b) debili aile: H1 "<ad> <debi>", title 45 karakter ve debili', async () => {
    const s = await sayfa('tr', detayKur(AD, DEBILI))
    expect(s.h1).toEqual([`${AD} 60–100 m³/h`])
    expect(s.title).toBe(`${AD} 60–100 m³/h | VentHub`)
    expect(s.title.length).toBe(45)
  })

  it('(c) title >60 olacaksa title değişmez, H1 debili kalır', async () => {
    const uzun = 'Avens Hücreli Aspiratörler HF Serisi Uzun Ad'
    const s = await sayfa('tr', detayKur(uzun, [{ max_delivery_m3h: 2540 }, { max_delivery_m3h: 22100 }]))
    expect(s.title).toBe(`${uzun} | VentHub`)
    expect(s.h1).toEqual([`${uzun} 2.540–22.100 m³/h`])
  })

  it('(d) dolu meta_title sabit kalır; H1 yine debili', async () => {
    const s = await sayfa('tr', detayKur(AD, DEBILI, { tr: 'DB meta başlığı', en: 'DB meta title' }))
    expect(s.title).toBe('DB meta başlığı')
    expect(s.h1).toEqual([`${AD} 60–100 m³/h`])
  })

  it('(e) EN sayfa EN sayı biçimini kullanır', async () => {
    const s = await sayfa('en', detayKur(AD, [{ max_delivery_m3h: 2540 }, { max_delivery_m3h: 22100 }]))
    expect(s.h1).toEqual([`${AD} 2,540–22,100 m³/h`])
  })

  it('(e2) karma ailede nominal sayılmaz; min=max tek değer', async () => {
    const s = await sayfa('tr', detayKur(AD, [{ max_delivery_m3h: 300 }, { nominal_delivery_m3h: 9000 }, { max_delivery_m3h: 300 }]))
    expect(s.h1).toEqual([`${AD} 300 m³/h`])
  })

  it('(f) JSON-LD name ham aile adı kalır (debi eklenmez)', async () => {
    const s = await sayfa('tr', detayKur(AD, DEBILI))
    const adlar = s.jsonLd.map((j) => j.name).filter((n): n is string => typeof n === 'string')
    expect(adlar).toContain(AD)
    expect(adlar.some((n) => n.includes('m³/h'))).toBe(false)
  })
})
