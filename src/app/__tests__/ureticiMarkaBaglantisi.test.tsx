/**
 * URN-126 — aile ve model sayfasının ÜRETİCİ bloğunda marka sayfasına giden gerçek `<a href>`.
 *
 * NİÇİN: aynı iş kırıntıdan marka basamağını kaldırdı (kategoriden bir adım geri giden kullanıcı markanın TÜM
 * ürünlerine düşüyordu). Aile/model sayfasından marka sayfasına giden TEK gövde bağlantısı o basamaktı (URN-21,
 * arama motoru siteyi `<a href>` ile gezer). Bağlantı artık üretici bloğunda; kırıntıda marka hâlâ YOK.
 *
 * Ölçüm yöntemi: sayfanın GERÇEK sunucu çıktısı — `AileSayfasi` çağrılır, dönen ağaç `renderToStaticMarkup` ile
 * HTML'e çevrilir (JS koşmayan tarayıcının ve botun gördüğü). İstemci bağlamları (router, sepet vb.) taklit
 * edilir; adres çözümü (`markaBulAdla` → `adresRotalari().brand`) ve bileşen GERÇEK koddur.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'

// Bayrak bir ANAHTAR: getter, adres üreticisinin her çağrıda güncel değeri okumasını sağlar
// (desen: urunRotasi.test.tsx / kategoriMarkaRotalariK3b.test.tsx).
const durum = vi.hoisted(() => ({ acik: false, dil: 'tr' as 'tr' | 'en', detail: null as unknown }))

vi.mock('@/config/features', async (orijinal) => ({
  ...(await orijinal<typeof import('@/config/features')>()),
  get ADRES_SEMASI_K3B() {
    return durum.acik
  },
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tr/products/avens-bvu-ls',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/data/preload', () => ({ preloadFamily: vi.fn(), getCachedFamilyDetail: vi.fn() }))
vi.mock('@/lib/data/urunSegmenti', () => ({ urunRotasiBagimliliklari: vi.fn(() => ({})) }))
vi.mock('@/lib/data/productRoute', () => ({
  resolveProductRoute: vi.fn(async () => ({ kind: 'family', detail: durum.detail })),
}))
vi.mock('@/lib/bilgiMerkezi/tersDizin', () => ({ ilgiliRehberler: () => [] }))

// İstemci bağlamları: görünüm yalnız okur, bu testin konusu değil.
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

import { AileSayfasi } from '../_components/aileSayfasi'

const VARYANT = {
  id: 'v1',
  sku: 'ABC-1',
  name: 'BVU LS 200',
  slug: null,
  model_code: '200',
  price: null,
  stock_qty: null,
  technical_specs: null,
  description: null,
  images: [],
}

function detayKur(markaAdi: string | null) {
  return {
    family: {
      id: 'f1',
      name: 'BVU LS',
      slug: 'avens-bvu-ls',
      series_code: null,
      description: null,
      brand_name: markaAdi,
      category_id: null,
      subcategory_id: null,
      meta_title: null,
      meta_description: null,
      category: null,
      subcategory: null,
    },
    variants: [VARYANT],
    price_tax_included: null,
  }
}

async function html(lang: 'tr' | 'en', markaAdi: string | null, sunucuSku: string | null): Promise<string> {
  durum.dil = lang
  durum.detail = detayKur(markaAdi)
  const agac = await AileSayfasi({ lang, slug: 'avens-bvu-ls', sunucuSku })
  return renderToStaticMarkup(agac)
}

const tumBaglantilar = (h: string) => [...h.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
const metin = (s: string) => s.replace(/<[^>]+>/g, '').trim()
const markaBaglantilari = (h: string) => tumBaglantilar(h).filter((m) => /\/(brands|markalar)(\/|$)/.test(m[1]))
const kirintiBolgesi = (h: string) => h.match(/<nav aria-label="[^"]*">[\s\S]*?<\/nav>/)?.[0] ?? ''

beforeEach(() => {
  durum.acik = false
  durum.dil = 'tr'
})

describe('üretici bloğu: marka sayfasına gerçek <a href> (URN-126)', () => {
  it.each([
    ['aile · TR · kapalı bayrak', 'tr', null, false, '/tr/brands/avens'],
    ['aile · EN · kapalı bayrak', 'en', null, false, '/en/brands/avens'],
    ['model · TR · kapalı bayrak', 'tr', 'ABC-1', false, '/tr/brands/avens'],
    ['model · EN · kapalı bayrak', 'en', 'ABC-1', false, '/en/brands/avens'],
    ['aile · TR · açık bayrak', 'tr', null, true, '/tr/markalar/avens'],
    ['aile · EN · açık bayrak', 'en', null, true, '/en/brands/avens'],
    ['model · TR · açık bayrak', 'tr', 'ABC-1', true, '/tr/markalar/avens'],
    ['model · EN · açık bayrak', 'en', 'ABC-1', true, '/en/brands/avens'],
  ] as [string, 'tr' | 'en', string | null, boolean, string][])(
    '%s: marka adı bağlantı, adres üreticiden',
    async (_ad, dil, sku, acik, beklenen) => {
      durum.acik = acik
      const h = await html(dil, 'AVenS', sku)
      const baglanti = markaBaglantilari(h)
      // Sayfada marka sayfasına giden bağlantı TAM bir tane (üretici bloğu); metni markanın kendi adı.
      expect(baglanti.map((m) => m[1])).toEqual([beklenen])
      expect(metin(baglanti[0][2])).toBe('AVenS')
      // Kırıntı nav'ında marka YOK (URN-126'nın kaldırdığı basamak geri gelmedi).
      expect(markaBaglantilari(kirintiBolgesi(h))).toHaveLength(0)
    },
  )

  it('marka bağlantısı üretici bloğunda: "resmi distribütör" satırıyla aynı blok, kırıntının DIŞINDA', async () => {
    const h = await html('tr', 'AVenS', null)
    const yer = h.indexOf('href="/tr/brands/avens"')
    expect(yer).toBeGreaterThan(-1)
    expect(kirintiBolgesi(h)).not.toContain('/brands/avens')
    expect(h.slice(yer, yer + 700)).toContain(getDictValue(tr, 'pdp.officialDistributor'))
    expect(getDictValue(en, 'pdp.officialDistributor')).not.toBe(getDictValue(tr, 'pdp.officialDistributor'))
  })

  it('model sayfasında da aynı bileşen: kırıntıda aile bağlantısı kalır, marka yok', async () => {
    const h = await html('tr', 'AVenS', 'ABC-1')
    const kirintiYollari = tumBaglantilar(kirintiBolgesi(h)).map((m) => m[1])
    expect(kirintiYollari).toContain('/tr/products/avens-bvu-ls')
    expect(kirintiYollari.some((y) => /\/(brands|markalar)\//.test(y))).toBe(false)
  })

  it.each([
    ['vitrinde olmayan marka', 'Bilinmeyen Marka'],
    ['boş ad', '   '],
    ['ad yok (null)', null],
  ] as [string, string | null][])('%s: bağlantı YOK, bozuk adres üretilmez', async (_ad, marka) => {
    for (const acik of [false, true]) {
      durum.acik = acik
      const h = await html('tr', marka, null)
      expect(markaBaglantilari(h)).toHaveLength(0)
      expect(h).not.toMatch(/href="[^"]*undefined/)
    }
  })

  it('çözülemeyen ama dolu marka adı düz metin olarak yazılır (görünür metin kaybolmaz)', async () => {
    const h = await html('tr', 'Bilinmeyen Marka', null)
    expect(h).toContain('Bilinmeyen Marka')
    expect(tumBaglantilar(h).some((m) => metin(m[2]) === 'Bilinmeyen Marka')).toBe(false)
  })
})

describe('kaynak denetimi (URN-126)', () => {
  const oku = (...p: string[]) => readFileSync(join(process.cwd(), ...p), 'utf8')

  it('istemci bileşeni marka kataloğunu import etmez (adres sunucuda çözülür)', () => {
    const pdp = oku('src/app/_components/ProductDetailPageView.tsx')
    expect(pdp).not.toMatch(/from ['"][^'"]*data\/brands['"]/)
    expect(pdp).not.toMatch(/markaBulAdla/)
    expect(pdp).toMatch(/markaHref\s*\?/)
  })

  it('sayfa adresi tek üreticiden alır; kırıntı çağrısına marka girmez', () => {
    const sayfa = oku('src/app/_components/aileSayfasi.tsx')
    expect(sayfa).toMatch(/ureticiMarkaAdresi\(family\.brand_name, adresDili\(lang\)\)/)
    expect(sayfa).toMatch(/markaHref=\{markaHref\}/)
    const cagri = sayfa.match(/aileKirintiAdimlari\(\{[\s\S]*?\n\s*\}\)/)
    expect(cagri?.[0]).toBeTruthy()
    expect(cagri?.[0]).not.toMatch(/marka/i)
  })
})
