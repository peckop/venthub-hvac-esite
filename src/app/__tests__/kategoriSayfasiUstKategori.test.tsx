import type { ReactElement, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import type { KategoriUst } from '@/lib/data/preload'
import type { DomainCategory } from '@/lib/type-converters'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '@/utils/categoryHelpers'

/**
 * INV-KATEGORI-UST-SUNUCU-1 (URN-112) — alt kategori sayfasında ÜST kategori SUNUCUDA okunur ve görünüme
 * `initialParentCategory` olarak iner; kırıntının üst halkası ham HTML'de dolu gelir.
 *
 * ÖLÇÜLMÜŞ KUSUR (canlı, 2026-10-12): `/tr/category/kanal-tipi-fanlar` ham HTML'inin BreadcrumbList'i
 * [Ana Sayfa, Kanal Tipi Fanlar]; üst ("Fanlar") yalnız istemci bağlamından (`useCategories`) çözüldüğü için
 * hidrasyondan SONRA geliyordu.
 *
 * ÖLÇMEDİĞİ: canlı HTML (yayın sonrası, curl) ve kırıntının JSON-LD'si (`Breadcrumb.tsx`, bu işin kapsamı dışı);
 * bu dosya yalnız sunucu bileşeninin prop'u doğru kurduğunu ve hata yolunu ölçer. Görünüm tarafı:
 * `src/views/__tests__/CategoryMasterView.ustKategori.test.tsx`.
 */

const cagri = vi.hoisted(() => ({
  ust: vi.fn(),
  aileler: vi.fn(),
}))

vi.mock('next/cache', () => ({ unstable_cache: <T,>(fn: T) => fn }))

vi.mock('@/lib/data/preload', () => ({
  getCachedCategoryData: vi.fn(),
  eskiKategoriHedefi: vi.fn(),
  getCachedKategoriUstById: cagri.ust,
}))

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) }) }),
    }),
    rpc: async () => ({ data: [], error: null }),
  },
}))

vi.mock('@/lib/services/family.service', async (orijinal) => ({
  ...(await orijinal<typeof import('@/lib/services/family.service')>()),
  getFamiliesEnriched: cagri.aileler,
}))

import { KategoriSayfasi, ustKategoriSatiri } from '../_components/kategoriSayfasi'

const UST_ID = 'c2f5d352-0000-0000-0000-000000000001'

/** Alt kategori (kanal tipi fanlar) — yalnız çizimin okuduğu alanlar anlamlı. */
function altKategori(parentId: string | null): DomainCategory {
  return {
    authority_content: null,
    created_at: '2026-09-01T00:00:00.000Z',
    description: '',
    display_mode: null,
    id: 'a77203a2-0000-0000-0000-000000000002',
    image_url: null,
    is_active: true,
    is_featured: null,
    level: 1,
    marketing_title: null,
    menu_label: null,
    metadata: { slug: { tr: 'kanal-tipi-fanlar', en: 'duct-fans' } },
    name: 'Duct Fans',
    parent_id: parentId,
    seo_desc: null,
    seo_title: null,
    slug: 'duct-fans',
    sort_order: null,
    tenant_id: 'tenant-1',
    translation_key: 'duct-fans',
    updated_at: '2026-09-01T00:00:00.000Z',
  }
}

function ustSatiri(parcasi: Partial<KategoriUst> = {}): KategoriUst {
  return {
    id: UST_ID,
    slug: 'fans',
    name: 'Fans',
    menu_label: null,
    translation_key: 'fans',
    metadata: { slug: { tr: 'fanlar', en: 'fans' }, description_i18n: { tr: 'uzun metin', en: 'long text' } },
    is_active: true,
    parent_id: null,
    ...parcasi,
  }
}

/** Dönen öğe ağacında `initialCategory` prop'unu taşıyan görünüm öğesinin prop'ları. */
function gorunumProplari(kok: ReactNode): Record<string, unknown> {
  const sirada: ReactNode[] = [kok]
  while (sirada.length > 0) {
    const dugum = sirada.shift()
    if (Array.isArray(dugum)) {
      sirada.push(...dugum)
      continue
    }
    if (!dugum || typeof dugum !== 'object' || !('props' in dugum)) continue
    const oge = dugum as ReactElement<Record<string, unknown>>
    if ('initialCategory' in oge.props) return oge.props
    sirada.push(oge.props.children as ReactNode)
  }
  throw new Error('Görünüm öğesi (initialCategory) dönen ağaçta bulunamadı')
}

beforeEach(() => {
  vi.clearAllMocks()
  cagri.aileler.mockResolvedValue({ items: [], total: 0 })
  cagri.ust.mockResolvedValue(ustSatiri())
})

describe('KategoriSayfasi · üst kategori sunucuda okunur', () => {
  it('alt kategori: initialParentCategory DOLU gelir, üst sorgusu TAM 1 kez ve üstün kimliğiyle', async () => {
    const dugum = await KategoriSayfasi({ lang: 'tr', category: altKategori(UST_ID), categorySlug: 'kanal-tipi-fanlar' })
    const ust = gorunumProplari(dugum).initialParentCategory as DomainCategory | null

    expect(ust).not.toBeNull()
    expect(ust?.id).toBe(UST_ID)
    expect(cagri.ust).toHaveBeenCalledTimes(1)
    expect(cagri.ust).toHaveBeenCalledWith(UST_ID)
  })

  it('görünen ad getCategoryDisplayName ile (TR "Fanlar", EN "Fans"), görünen slug dile göre', async () => {
    const dugum = await KategoriSayfasi({ lang: 'en', category: altKategori(UST_ID), categorySlug: 'duct-fans' })
    const ust = gorunumProplari(dugum).initialParentCategory as DomainCategory

    expect(getCategoryDisplayName(ust, (k) => getDictValue(tr, k))).toBe('Fanlar')
    expect(getCategoryDisplayName(ust, (k) => getDictValue(en, k))).toBe('Fans')
    expect(getLocalizedCategorySlug(ust, 'tr')).toBe('fanlar')
    expect(getLocalizedCategorySlug(ust, 'en')).toBe('fans')
  })

  it('istemciye üstün uzun metni gitmez: yalnız ad alanları + görünen slug taşınır', async () => {
    const dugum = await KategoriSayfasi({ lang: 'tr', category: altKategori(UST_ID), categorySlug: 'kanal-tipi-fanlar' })
    const ust = gorunumProplari(dugum).initialParentCategory as DomainCategory

    expect(ust.metadata).toEqual({ slug: { tr: 'fanlar', en: 'fans' } })
    expect(JSON.stringify(ust)).not.toContain('uzun metin')
    expect(JSON.stringify(ust)).not.toContain('long text')
  })

  it('kök kategori (parent_id yok): üst sorgusu YOK, prop null (eski davranış)', async () => {
    const dugum = await KategoriSayfasi({ lang: 'tr', category: altKategori(null), categorySlug: 'fanlar' })

    expect(gorunumProplari(dugum).initialParentCategory).toBeNull()
    expect(cagri.ust).not.toHaveBeenCalled()
  })

  it('üst pasifse prop null (pasif üst kırıntıya basılmaz)', async () => {
    cagri.ust.mockResolvedValue(ustSatiri({ is_active: false }))
    const dugum = await KategoriSayfasi({ lang: 'tr', category: altKategori(UST_ID), categorySlug: 'kanal-tipi-fanlar' })

    expect(gorunumProplari(dugum).initialParentCategory).toBeNull()
    expect(cagri.ust).toHaveBeenCalledTimes(1)
  })

  it('üst bulunamazsa (null) prop null', async () => {
    cagri.ust.mockResolvedValue(null)
    const dugum = await KategoriSayfasi({ lang: 'tr', category: altKategori(UST_ID), categorySlug: 'kanal-tipi-fanlar' })

    expect(gorunumProplari(dugum).initialParentCategory).toBeNull()
  })

  it('HATA YOLU: üst sorgusu düşerse sayfa FIRLATIR (üstsüz sayfa "üst yok" diye yazılmaz)', async () => {
    cagri.ust.mockRejectedValue(new Error('ust sorgusu dustu'))

    await expect(
      KategoriSayfasi({ lang: 'tr', category: altKategori(UST_ID), categorySlug: 'kanal-tipi-fanlar' }),
    ).rejects.toThrow('ust sorgusu dustu')
  })
})

describe('ustKategoriSatiri · saf dönüşüm', () => {
  it('null ve pasif → null; aktif → kimlik, slug ve ad alanları korunur', () => {
    expect(ustKategoriSatiri(null)).toBeNull()
    expect(ustKategoriSatiri(ustSatiri({ is_active: null }))).toBeNull()
    const satir = ustKategoriSatiri(ustSatiri({ menu_label: 'Fan Ailesi' }))
    expect(satir).toMatchObject({ id: UST_ID, slug: 'fans', name: 'Fans', menu_label: 'Fan Ailesi', translation_key: 'fans' })
  })

  it('bozuk metadata (dizge, boş slug) görünen slug üretmez; kanonik slug\'a düşülür', () => {
    const satir = ustKategoriSatiri(ustSatiri({ metadata: { slug: { tr: '', en: 5 } } }))
    expect(satir?.metadata).toBeNull()
    expect(getLocalizedCategorySlug(satir, 'tr')).toBe('fans')
    expect(ustKategoriSatiri(ustSatiri({ metadata: 'x' }))?.metadata).toBeNull()
  })
})
