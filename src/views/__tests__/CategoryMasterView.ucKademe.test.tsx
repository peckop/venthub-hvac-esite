import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DomainCategory } from '@/lib/type-converters'

import { useCategoryGateway } from '../../hooks/useCategoryGateway'

/**
 * URN-144 (karar 410) — gateway üç kademede: `ancestors` (kökten başa, kendisi hariç) ve geriye uyumlu
 * `parentCategory` (= son ata). Kaynak sırası: sunucudan gelen `initialAncestors` → doğrudan üst prop'u/bağlam +
 * bağlamdaki üst zinciri. İki kademede `parentCategory` ve `ancestors[0]` bugünkü tek üsttür.
 * Kimlikler test verisidir.
 */

const baglam = vi.hoisted(() => ({ kategoriler: [] as unknown[] }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tr/kategori/x',
}))
vi.mock('../../contexts/CategoryContext', () => ({
  useCategories: () => ({ categories: baglam.kategoriler, loading: false }),
}))
vi.mock('../../hooks/useManualScrollRestoration', () => ({ useManualScrollRestoration: () => undefined }))
vi.mock('../../i18n/I18nProvider', () => ({ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }))

function kategori(id: string, parentId: string | null): DomainCategory {
  return {
    authority_content: null,
    created_at: '2026-10-25T00:00:00.000Z',
    description: '',
    display_mode: null,
    id,
    image_url: null,
    is_active: true,
    is_featured: null,
    level: 0,
    marketing_title: null,
    menu_label: id,
    metadata: null,
    name: id,
    parent_id: parentId,
    seo_desc: null,
    seo_title: null,
    slug: id,
    sort_order: null,
    tenant_id: 'tenant-1',
    translation_key: null,
    updated_at: '2026-10-25T00:00:00.000Z',
  }
}

const KOK = kategori('accessories', null)
const ORTA = kategori('control-systems', 'accessories')
const YAPRAK = kategori('frequency-converters', 'control-systems')

const kimlikler = (l: DomainCategory[]) => l.map((c) => c.id)

beforeEach(() => {
  baglam.kategoriler = []
})

describe('useCategoryGateway · üç kademe', () => {
  it('sunucudan gelen atalar öncelikli: ancestors [kök, orta], parentCategory = orta', () => {
    const { result } = renderHook(() => useCategoryGateway(YAPRAK, [], ORTA, [KOK, ORTA]))
    expect(kimlikler(result.current.ancestors)).toEqual(['accessories', 'control-systems'])
    expect(result.current.parentCategory?.id).toBe('control-systems')
  })

  it('prop yok, bağlam dolu: zincir bağlamdaki parent_id\'den kurulur (kökten başa)', () => {
    baglam.kategoriler = [KOK, ORTA, YAPRAK]
    const { result } = renderHook(() => useCategoryGateway(YAPRAK))
    expect(kimlikler(result.current.ancestors)).toEqual(['accessories', 'control-systems'])
    expect(result.current.parentCategory?.id).toBe('control-systems')
  })

  it('doğrudan üst prop\'u + bağlamdaki üst: [kök, orta]', () => {
    baglam.kategoriler = [KOK]
    const { result } = renderHook(() => useCategoryGateway(YAPRAK, [], ORTA))
    expect(kimlikler(result.current.ancestors)).toEqual(['accessories', 'control-systems'])
  })

  it('pasif ara kademe sunucuda elendi: ancestors [kök], parentCategory = kök (ilk aktif ata)', () => {
    const { result } = renderHook(() => useCategoryGateway(YAPRAK, [], null, [KOK]))
    expect(kimlikler(result.current.ancestors)).toEqual(['accessories'])
    expect(result.current.parentCategory?.id).toBe('accessories')
  })

  it('kendi kimliğini içeren atalar prop\'u (bayat/yanlış) KULLANILMAZ', () => {
    baglam.kategoriler = [KOK, ORTA]
    const { result } = renderHook(() => useCategoryGateway(ORTA, [], null, [ORTA]))
    expect(kimlikler(result.current.ancestors)).toEqual(['accessories'])
  })

  it('kök kategori: ata yok, parentCategory null', () => {
    const { result } = renderHook(() => useCategoryGateway(KOK, [ORTA]))
    expect(result.current.ancestors).toEqual([])
    expect(result.current.parentCategory).toBeNull()
  })
})

describe('useCategoryGateway · iki kademe (fark 0)', () => {
  it('tek üst: ancestors [üst], parentCategory = üst (prop ya da bağlam)', () => {
    const alt = kategori('duct-fans', 'fans')
    const fans = kategori('fans', null)
    const a = renderHook(() => useCategoryGateway(alt, [], fans))
    expect(kimlikler(a.result.current.ancestors)).toEqual(['fans'])
    expect(a.result.current.parentCategory?.id).toBe('fans')
    baglam.kategoriler = [fans, alt]
    const b = renderHook(() => useCategoryGateway(alt))
    expect(kimlikler(b.result.current.ancestors)).toEqual(['fans'])
    expect(b.result.current.parentCategory?.id).toBe('fans')
  })

  it('üst prop\'u başka kategoriye ait (bayat) ve bağlam boş: üst yok', () => {
    const alt = kategori('duct-fans', 'fans')
    const { result } = renderHook(() => useCategoryGateway(alt, [], kategori('baska', null)))
    expect(result.current.parentCategory).toBeNull()
  })
})
