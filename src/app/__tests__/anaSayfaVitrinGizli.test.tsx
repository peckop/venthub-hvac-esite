import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { tr } from '../../i18n/dictionaries/tr'

/**
 * INV-ANASAYFA-VITRIN-1 — ana sayfadaki "Fanlar ve Havalandırma Ürünleri" ürün vitrini, satış kipi
 * kapalıyken ÇİZİLMEZ ve sorgusu koşmaz (URN-98, Recep kararı 2026-10-10).
 *
 * NİÇİN VAR (canlı ölçüm, 2026-10-10): blok başlığı "Fanlar ve Havalandırma Ürünleri" iken ilk dört
 * kart AVenS elektrikli ısıtıcıydı (12/15/18/3 kW). Bileşenin yedeği "seçili ürün yoksa listenin ilk
 * dördü"ydü ve 441 üründe `is_featured` 0 olduğundan her ziyaretçi bunu gördü. Karar: fiyat açılana
 * kadar blok yok; açılınca bugünkü biçimde dönmez.
 *
 * BU KAPI NE ÖLÇER (iki katman):
 *  1) Sayfa sunucusu (`RootPage`): kip kapalı → ürün sorgusu çağrılmaz ve `urunVitrini` false; kip açık
 *     ama seçili ürün yok → yine false (yedek dönüşü kapalı); kip açık + seçili ürün → true; ürün
 *     sorgusu hata verirse sayfa düşmez, blok yok.
 *  2) Görünüm (`HomePage`): kapıyla blok çizilmez ve sarmalayıcısı da kalmaz (boşluk/çift aralık yok);
 *     kapı açıkken çizilir. Varsayılan KAPALI.
 *
 * ÖLÇMEDİĞİ: canlıda gerçek HTML (tarayıcı bölmesiyle yayın sonrası ölçülür) ve üretim sınıfı (statik
 * kalması `anasayfa-rotasi-statik` kapısı + önizleme başlığıyla).
 */

const sahte = vi.hoisted(() => ({
  satisKipiOku: vi.fn(),
  getProducts: vi.fn(),
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: vi.fn(),
}))
vi.mock('../../lib/kip/satisKipi', () => ({ satisKipiOku: sahte.satisKipiOku }))
vi.mock('@/lib/services/product.service', () => ({ getProducts: sahte.getProducts }))
vi.mock('@/lib/services/category.service', () => ({ getCategories: async () => [] }))
vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: { rpc: async () => ({ data: [] }) },
}))

// Sayfa katmanı testinde `HomePage` yalnız prop yakalayan bir kuklaya çevrilir; görünüm katmanı testi
// gerçeğini `vi.importActual` ile yükler. Çocuk bileşenler işaretçi basan kuklalardır.
vi.mock('../../views/HomePage', () => ({ default: vi.fn(() => null) }))

async function isaretci(testId: string, sarmalayici = false) {
  const React = await import('react')
  return sarmalayici
    ? { default: ({ children }: { children?: React.ReactNode }) => React.createElement('div', { 'data-testid': testId }, children) }
    : { default: () => React.createElement('div', { 'data-testid': testId }) }
}
vi.mock('../../components/home/ApplicationSolutions', () => isaretci('uygulama-cozumleri'))
vi.mock('../../components/home/CinematicProductShowcase', () => isaretci('sinematik-vitrin'))
vi.mock('../../components/home/FeaturedCommercialBlocks', () => isaretci('urun-vitrini'))
vi.mock('../../components/home/GuidedCategoryDiscovery', () => isaretci('kategori-kesfi'))
vi.mock('../../components/home/HomePageClientWrapper', () => isaretci('istemci-sarmalayici', true))
vi.mock('../../components/home/HomeSinevizyon', () => isaretci('sinevizyon'))
vi.mock('../../components/home/KnowledgeBlock', () => isaretci('bilgi-blogu'))
vi.mock('../../components/home/RevealSection', () => isaretci('reveal', true))
vi.mock('../../components/home/StrategicBrands', () => isaretci('markalar'))
vi.mock('../../components/home/TrustProofSection', () => isaretci('guven-kaniti'))
vi.mock('../../components/ui/ScrollObserver', async () => {
  const React = await import('react')
  return { ScrollObserver: () => React.createElement('span', { 'data-testid': 'scroll-gozlemci' }) }
})

const KAPALI = { acik: false, damga: null, kaynak: 'kapali-varsayilan' }
const ACIK = { acik: true, damga: '2026-10-10T00:00:00Z', kaynak: 'db' }

/** `RootPage`in döndürdüğü element ağacında `tip`e eşit ilk elementin prop'ları. */
function propBul(dugum: unknown, tip: unknown): Record<string, unknown> | null {
  if (dugum === null || typeof dugum !== 'object') return null
  if (Array.isArray(dugum)) {
    for (const cocuk of dugum) {
      const bulunan = propBul(cocuk, tip)
      if (bulunan) return bulunan
    }
    return null
  }
  const el: { type?: unknown; props?: Record<string, unknown> } = dugum
  if (el.type === tip) return el.props ?? {}
  return propBul(el.props?.children, tip)
}

async function sayfaPropu(lang: 'tr' | 'en') {
  const { default: RootPage } = await import('../[lang]/page')
  const { default: HomePageKukla } = await import('../../views/HomePage')
  const agac = await RootPage({ params: Promise.resolve({ lang }) })
  const props = propBul(agac, HomePageKukla)
  if (!props) throw new Error('HomePage elementi sayfa ağacında bulunamadı')
  return props
}

describe('INV-ANASAYFA-VITRIN-1 — sayfa sunucusu kapısı', () => {
  beforeEach(() => {
    sahte.satisKipiOku.mockReset()
    sahte.getProducts.mockReset()
  })

  it('satış kipi KAPALI: ürün sorgusu HİÇ koşmaz, blok kapalı', async () => {
    sahte.satisKipiOku.mockResolvedValue(KAPALI)
    sahte.getProducts.mockResolvedValue([{ id: 'p1', is_featured: true }])
    const props = await sayfaPropu('tr')
    expect(sahte.getProducts).not.toHaveBeenCalled()
    expect(props.urunVitrini).toBe(false)
    expect(props.initialProducts).toEqual([])
  })

  it('satış kipi AÇIK ama seçili ürün yok (is_featured 0): blok kapalı, "ilk dört" yedeği dönmez', async () => {
    sahte.satisKipiOku.mockResolvedValue(ACIK)
    sahte.getProducts.mockResolvedValue([
      { id: 'p1', is_featured: false },
      { id: 'p2', is_featured: false },
    ])
    const props = await sayfaPropu('tr')
    expect(sahte.getProducts).toHaveBeenCalledTimes(1)
    expect(props.urunVitrini).toBe(false)
  })

  it('satış kipi AÇIK + en az bir seçili ürün: blok açık ve ürünler olduğu gibi geçer', async () => {
    const urunler = [
      { id: 'p1', is_featured: true },
      { id: 'p2', is_featured: false },
    ]
    sahte.satisKipiOku.mockResolvedValue(ACIK)
    sahte.getProducts.mockResolvedValue(urunler)
    const props = await sayfaPropu('tr')
    expect(props.urunVitrini).toBe(true)
    expect(props.initialProducts).toEqual(urunler)
  })

  it('aynı kapı EN sayfada da geçerli', async () => {
    sahte.satisKipiOku.mockResolvedValue(KAPALI)
    const props = await sayfaPropu('en')
    expect(props.urunVitrini).toBe(false)
    expect(sahte.getProducts).not.toHaveBeenCalled()
  })

  it('kip açıkken ürün sorgusu hata verirse sayfa düşmez, blok kapalı kalır', async () => {
    sahte.satisKipiOku.mockResolvedValue(ACIK)
    sahte.getProducts.mockRejectedValue(new Error('ağ yok'))
    const uyari = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const props = await sayfaPropu('tr')
    expect(props.urunVitrini).toBe(false)
    expect(props.initialProducts).toEqual([])
    uyari.mockRestore()
  })
})

describe('INV-ANASAYFA-VITRIN-1 — görünüm', () => {
  afterEach(() => vi.clearAllMocks())

  async function gercekHomePage() {
    const gercek = await vi.importActual<typeof import('../../views/HomePage')>('../../views/HomePage')
    return gercek.default
  }

  it('bileşen dosyası SİLİNMEDİ (fiyat açılışında yeniden karar verilir)', () => {
    expect(existsSync(join(__dirname, '..', '..', 'components', 'home', 'FeaturedCommercialBlocks.tsx'))).toBe(true)
  })

  it('kapı verilmezse (varsayılan) blok ve sarmalayıcısı çizilmez; kalan bölümler yerinde', async () => {
    const HomePage = await gercekHomePage()
    const { queryByTestId, getAllByTestId, container } = render(<HomePage dictionary={tr.home} lang="tr" />)
    expect(queryByTestId('urun-vitrini')).toBeNull()
    // Yalnız sinematik vitrinin sarmalayıcısı kalır; bloğunki YOK (boş sarmalayıcı = boşluk).
    expect(getAllByTestId('reveal')).toHaveLength(1)
    for (const id of ['uygulama-cozumleri', 'guven-kaniti', 'markalar', 'bilgi-blogu']) {
      expect(queryByTestId(id), `${id} yerinde değil`).not.toBeNull()
    }
    const bolumler = container.querySelector('.space-y-32')
    expect(bolumler, 'bölüm kapsayıcısı bulunamadı').not.toBeNull()
    // Her çocuk içerik taşır: boş eleman çift aralık üretirdi.
    for (const cocuk of Array.from(bolumler?.children ?? [])) {
      expect(cocuk.querySelector('[data-testid]') ?? cocuk.getAttribute('data-testid')).not.toBeNull()
    }
  })

  it('kapı AÇIKKEN blok kendi sarmalayıcısıyla çizilir', async () => {
    const HomePage = await gercekHomePage()
    const { queryByTestId, getAllByTestId } = render(<HomePage dictionary={tr.home} lang="tr" urunVitrini />)
    expect(queryByTestId('urun-vitrini')).not.toBeNull()
    expect(getAllByTestId('reveal')).toHaveLength(2)
  })
})
