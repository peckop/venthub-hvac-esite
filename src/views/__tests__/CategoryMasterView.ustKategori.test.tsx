import { renderHook } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DomainCategory } from '@/lib/type-converters'

import { useCategoryGateway } from '../../hooks/useCategoryGateway'
import CategoryMasterView from '../CategoryMasterView'
import CategoryPage from '../CategoryPage'

/**
 * INV-KATEGORI-UST-SUNUCU-2 (URN-112) — alt kategori görünümü, üst kategoriyi sunucudan gelen prop'tan
 * (`initialParentCategory`) kullanır; istemci bağlamı (`useCategories`) hidrasyondan sonra dolsa da ilk
 * çizimde üst halka vardır.
 *
 * İKİ KOL:
 *  1. SUNUCU ÇİZİMİ — `renderToString` (efektler koşmaz, bağlam BOŞ = hidrasyon öncesi): görünüm kökü
 *     alt kategoriye üstü `parentCategory` olarak geçirir.
 *  2. GATEWAY — bağlam boşken prop; prop yokken bağlam (eski davranış); prop varken prop önce.
 *
 * ÖLÇMEDİĞİ: alt görünümlerin (`CategorySeriesView`, `CategoryLandingView`) kırıntı çizimi (zaten `parentCategory`
 * prop'unu okurlar; burada `next/dynamic` yer tutucuyla değiştirildi) ve canlı HTML.
 */

const baglam = vi.hoisted(() => ({ kategoriler: [] as unknown[] }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tr/category/kanal-tipi-fanlar',
}))

vi.mock('../../contexts/CategoryContext', () => ({
  useCategories: () => ({ categories: baglam.kategoriler, loading: false }),
}))

vi.mock('../../hooks/useManualScrollRestoration', () => ({ useManualScrollRestoration: () => undefined }))

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))

// Alt görünümler gerçek bileşenleri (framer-motion, sözlük...) çekmesin: üst halkayı DÜZ METİN olarak basan yer tutucu.
vi.mock('next/dynamic', () => ({
  default: () =>
    function GorunumYerTutucu(props: { parentCategory?: { name: string } | null }) {
      return <nav data-testid="kirinti">{props.parentCategory ? `UST:${props.parentCategory.name}` : 'UST:YOK'}</nav>
    },
}))

vi.mock('../../components/ui/Pagination', () => ({ default: () => null }))

function kategori(id: string, ad: string, parentId: string | null): DomainCategory {
  return {
    authority_content: null,
    created_at: '2026-09-01T00:00:00.000Z',
    description: '',
    display_mode: 'landing',
    id,
    image_url: null,
    is_active: true,
    is_featured: null,
    level: parentId ? 1 : 0,
    marketing_title: null,
    menu_label: ad,
    metadata: null,
    name: ad,
    parent_id: parentId,
    seo_desc: null,
    seo_title: null,
    slug: id,
    sort_order: null,
    tenant_id: 'tenant-1',
    translation_key: null,
    updated_at: '2026-09-01T00:00:00.000Z',
  }
}

const UST = kategori('fans', 'Fanlar', null)
const ALT = kategori('duct-fans', 'Kanal Tipi Fanlar', 'fans')

beforeEach(() => {
  baglam.kategoriler = []
})

describe('CategoryMasterView · sunucu çiziminde üst kategori', () => {
  it('bağlam BOŞKEN prop dolu → ilk (sunucu) çizim üstü içerir', () => {
    const html = renderToString(<CategoryMasterView initialCategory={ALT} initialParentCategory={UST} />)
    expect(html).toContain('UST:Fanlar')
  })

  it('prop null ve bağlam boş → üst YOK (eski davranış)', () => {
    const html = renderToString(<CategoryMasterView initialCategory={ALT} initialParentCategory={null} />)
    expect(html).toContain('UST:YOK')
  })

  it('prop verilmemiş, bağlam dolu → bağlamdan çözülür (eski çağıranlar bozulmaz)', () => {
    baglam.kategoriler = [UST, ALT]
    const html = renderToString(<CategoryMasterView initialCategory={ALT} />)
    expect(html).toContain('UST:Fanlar')
  })
})

describe('CategoryPage · üst kategori iletimi (kategoriSayfasi.tsx bu bileşeni çağırır)', () => {
  it('initialParentCategory CategoryPage üzerinden görünüme iner (bağlam boş); prop yokken eski davranış', () => {
    // Sunucu bileşeni `CategoryPage`'e prop geçirir; iletim kopsa MasterView testi yeşil kalır ama özellik ölür.
    const dolu = renderToString(<CategoryPage initialCategory={ALT} initialParentCategory={UST} />)
    expect(dolu).toContain('UST:Fanlar')

    const bos = renderToString(<CategoryPage initialCategory={ALT} />)
    expect(bos).toContain('UST:YOK')
    expect(bos).not.toContain('UST:Fanlar')
  })
})

describe('useCategoryGateway · üst kategori önceliği', () => {
  it('bağlam boşken prop döner', () => {
    const { result } = renderHook(() => useCategoryGateway(ALT, undefined, UST))
    expect(result.current.parentCategory).toBe(UST)
  })

  it('prop ve bağlam birlikte → prop önce (aynı nesne)', () => {
    baglam.kategoriler = [{ ...UST, name: 'Bağlam Adı' }, ALT]
    const { result } = renderHook(() => useCategoryGateway(ALT, undefined, UST))
    expect(result.current.parentCategory).toBe(UST)
  })

  it('prop null → bağlama düşer; ikisi de yoksa null', () => {
    baglam.kategoriler = [UST, ALT]
    expect(renderHook(() => useCategoryGateway(ALT, undefined, null)).result.current.parentCategory).toBe(UST)
    baglam.kategoriler = []
    expect(renderHook(() => useCategoryGateway(ALT, undefined, null)).result.current.parentCategory).toBeNull()
  })

  it('prop başka kategorinin üstüyse (parent_id eşleşmiyor) kullanılmaz', () => {
    const yabanci = kategori('air-treatment', 'Hava Şartlandırma', null)
    const { result } = renderHook(() => useCategoryGateway(ALT, undefined, yabanci))
    expect(result.current.parentCategory).toBeNull()
  })

  it('kök kategoride (parent_id yok) prop verilse bile üst null', () => {
    const { result } = renderHook(() => useCategoryGateway(UST, undefined, UST))
    expect(result.current.parentCategory).toBeNull()
  })
})
