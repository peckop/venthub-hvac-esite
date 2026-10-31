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

import { LINEO_QUIET_AILE_SLUG } from '@/data/sessizFan/aileMetinleri'

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

function detayKur(ad: string, specler: Specs[], metaTitle: { tr: string; en: string } | null = null, slug = 'test-ailesi') {
  return {
    family: {
      id: 'f1',
      name: ad,
      name_i18n: { tr: ad, en: ad },
      slug,
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

async function sayfa(lang: 'tr' | 'en', detay: unknown, sunucuSku: string | null = null, slug = 'test-ailesi') {
  durum.dil = lang
  durum.detail = detay
  const meta = await aileSayfasiUstVerisi(lang, slug, sunucuSku)
  const h = renderToStaticMarkup(await AileSayfasi({ lang, slug, sunucuSku }))
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

  it('(g) BreadcrumbList son öğe adı ve tüm itemListElement adları debisiz', async () => {
    const s = await sayfa('tr', detayKur(AD, DEBILI))
    const kirinti = s.jsonLd.find((j) => j['@type'] === 'BreadcrumbList')
    expect(kirinti).toBeDefined()
    const ogeler = (kirinti?.itemListElement ?? []) as Array<{ name?: string }>
    expect(ogeler.length).toBeGreaterThan(0)
    expect(ogeler[ogeler.length - 1].name).toBe(AD)
    expect(ogeler.every((o) => !String(o.name).includes('m³/h'))).toBe(true)
    const liste = s.jsonLd.flatMap((j) => ((j.itemListElement ?? []) as Array<{ name?: string; item?: { name?: string } }>))
    expect(liste.every((o) => !String(o.name ?? o.item?.name ?? '').includes('m³/h'))).toBe(true)
  })

  it('(h) model rotası (sunucuSku dolu) aile rotasıyla AYNI title ve H1', async () => {
    for (const lang of ['tr', 'en'] as const) {
      const aile = await sayfa(lang, detayKur(AD, DEBILI))
      const model = await sayfa(lang, detayKur(AD, DEBILI), 'SKU-1')
      expect(model.title).toBe(aile.title)
      expect(model.h1).toEqual(aile.h1)
      expect(model.h1).toEqual([`${AD} 60–100 m³/h`])
    }
  })

  it('(i) Lineo Quiet: H1 debili, title şablonu DEĞİŞMEZ (TR ve EN)', async () => {
    const kodlar = ['17160', '17161', '17162', '17164', '17165', '17166', '17170', '17171', '17172', '17174', '17175', '17176']
    const detay = detayKur('Vortice Lineo Quiet Sessiz Kanal Fanları', [], null, LINEO_QUIET_AILE_SLUG)
    detay.variants = kodlar.map((k, i) => ({ ...varyant(k, { max_delivery_m3h: i === 0 ? 260 : i === 11 ? 2890 : 1000 }), sku: `VRT-${k}` }))
    const tr = await sayfa('tr', detay, null, LINEO_QUIET_AILE_SLUG)
    expect(tr.title).toBe('Vortice Lineo Quiet Sessiz Kanal Fanı: 12 Model | VentHub')
    expect(tr.h1).toEqual(['Vortice Lineo Quiet Sessiz Kanal Tipi Fan 260–2.890 m³/h'])
    const en = await sayfa('en', detay, null, LINEO_QUIET_AILE_SLUG)
    expect(en.title).toBe('Vortice Lineo Quiet Silent Duct Fan: 12 Models | VentHub')
    expect(en.h1).toEqual(['Vortice Lineo Quiet Silent In-Line Duct Fan 260–2,890 m³/h'])
  })

  it('(j) EN title ≤60 ise EN sayı biçimiyle debi alır', async () => {
    const ad = 'Vortice VORT QBK SAL KC Evo'
    const s = await sayfa('en', detayKur(ad, [{ max_delivery_m3h: 2540 }, { max_delivery_m3h: 22100 }]))
    expect(s.title).toBe(`${ad} 2,540–22,100 m³/h | VentHub`)
    expect(s.title.length).toBeLessThanOrEqual(60)
  })
})
