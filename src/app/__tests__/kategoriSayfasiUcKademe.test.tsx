import type { ReactElement, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { KategoriUst } from '@/lib/data/preload'
import type { DomainCategory } from '@/lib/type-converters'

/**
 * URN-144 (karar 410) — kategori sayfası üç kademede: kırıntı TAM zincir, kök sayfası alt AĞAÇTAKİ ailelerin tümünü
 * listeler, liste önbellek anahtarı kümeyi içerir. Kök/orta/yaprak kimliği `parent_id` zincirinden gelir; aile
 * sütunları (category_id/subcategory_id) bu sayfanın kararına GİRMEZ (karma sütun fikstürü: küme sütundan bağımsız).
 * İki kademede çıktı eskisiyle aynıdır (`kategoriSayfasiUstKategori.test.tsx` DEĞİŞMEDEN yeşil).
 *
 * Fikstür gerçek dalı taklit eder (Aksesuarlar → Elektrik Aksesuarları → Frekans Konvertörleri); kimlikler test verisidir.
 * ÖLÇMEDİĞİ: canlı sayfa HTML'i ve RPC'nin SQL'i (bkz. PR gövdesi).
 */

const durum = vi.hoisted(() => ({
  satirlar: new Map<string, unknown>(),
  agac: [] as { id: string; parent_id: string | null; is_active: boolean | null }[],
  cocuklar: [] as unknown[],
  sayim: [] as { category_id: string; product_count: number }[],
  anahtarlar: [] as unknown[],
  aileCagrilari: [] as { categoryIds: string[] }[],
  ustOkumalari: [] as string[],
}))

vi.mock('next/cache', () => ({
  unstable_cache: <T,>(fn: T, anahtar?: unknown) => {
    durum.anahtarlar.push(anahtar)
    return fn
  },
}))

vi.mock('@/lib/data/preload', () => ({
  getCachedCategoryData: vi.fn(),
  eskiKategoriHedefi: vi.fn(),
  getCachedKategoriUstById: async (id: string) => {
    durum.ustOkumalari.push(id)
    return durum.satirlar.get(id) ?? null
  },
}))

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: () => ({
      select: (kolonlar: string) => {
        // Ağaç iskeleti sorgusu: süzgeçsiz, doğrudan beklenir.
        if (kolonlar === 'id, parent_id, is_active') return Promise.resolve({ data: durum.agac, error: null })
        return { eq: () => ({ eq: () => ({ order: async () => ({ data: durum.cocuklar, error: null }) }) }) }
      },
    }),
    rpc: async () => ({ data: durum.sayim, error: null }),
  },
}))

vi.mock('@/lib/services/family.service', async (orijinal) => ({
  ...(await orijinal<typeof import('@/lib/services/family.service')>()),
  getFamiliesEnriched: async (_c: unknown, secenek: { categoryIds: string[] }) => {
    durum.aileCagrilari.push(secenek)
    return { items: [], total: 0 }
  },
}))

import { KategoriSayfasi } from '../_components/kategoriSayfasi'

type Satir = { id: string; ad: string; slug: string; tr: string; parent_id: string | null; aktif: boolean }

const KOK: Satir = { id: 'k', ad: 'Accessories', slug: 'accessories', tr: 'aksesuarlar', parent_id: null, aktif: true }
const ORTA: Satir = { id: 'o', ad: 'Control Systems', slug: 'control-systems', tr: 'elektrik-aksesuarlari', parent_id: 'k', aktif: true }
const YAPRAK: Satir = { id: 'y', ad: 'Frequency Converters', slug: 'frequency-converters', tr: 'frekans-konvertorleri', parent_id: 'o', aktif: true }
const YAPRAK2: Satir = { id: 'y2', ad: 'Speed Controllers', slug: 'speed-controllers', tr: 'hiz-kontrol', parent_id: 'o', aktif: true }

const ustSatiri = (s: Satir): KategoriUst => ({
  id: s.id,
  slug: s.slug,
  name: s.ad,
  menu_label: null,
  translation_key: null,
  metadata: { slug: { tr: s.tr, en: s.slug } },
  is_active: s.aktif,
  parent_id: s.parent_id,
})

const domain = (s: Satir): DomainCategory => ({
  authority_content: null,
  created_at: '2026-10-25T00:00:00.000Z',
  description: '',
  display_mode: null,
  id: s.id,
  image_url: null,
  is_active: s.aktif,
  is_featured: null,
  level: 0,
  marketing_title: null,
  menu_label: null,
  metadata: { slug: { tr: s.tr, en: s.slug } },
  name: s.ad,
  parent_id: s.parent_id,
  seo_desc: null,
  seo_title: null,
  slug: s.slug,
  sort_order: null,
  tenant_id: 'tenant-1',
  translation_key: s.slug,
  updated_at: '2026-10-25T00:00:00.000Z',
})

/** Bir ağaç kur: satırlar, ağaç iskeleti, sayımlar (ürünlü kimlikler) ve sayfanın doğrudan çocukları. */
function kur(satirlar: Satir[], urunlu: string[]) {
  durum.satirlar = new Map(satirlar.map((s) => [s.id, ustSatiri(s)]))
  durum.agac = satirlar.map((s) => ({ id: s.id, parent_id: s.parent_id, is_active: s.aktif }))
  durum.sayim = satirlar.map((s) => ({ category_id: s.id, product_count: urunlu.includes(s.id) ? 3 : 0 }))
}

const cocuklar = (satirlar: Satir[]) => {
  durum.cocuklar = satirlar.filter((s) => s.aktif).map((s) => ({ ...domain(s), name: s.ad }))
}

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

const kimlikler = (liste: unknown) => (liste as DomainCategory[]).map((c) => c.id)
const sayfa = (s: Satir) => KategoriSayfasi({ lang: 'tr', category: domain(s), categorySlug: s.tr })

beforeEach(() => {
  durum.satirlar = new Map()
  durum.agac = []
  durum.cocuklar = []
  durum.sayim = []
  durum.anahtarlar.length = 0
  durum.aileCagrilari.length = 0
  durum.ustOkumalari.length = 0
})

describe('kırıntı — tam ata zinciri', () => {
  it('yaprak: atalar [kök, orta] kökten başa, doğrudan üst orta; üst okuması orta sonra kök', async () => {
    kur([KOK, ORTA, YAPRAK], ['y'])
    cocuklar([])
    const p = gorunumProplari(await sayfa(YAPRAK))
    expect(kimlikler(p.initialAncestors)).toEqual(['k', 'o'])
    expect((p.initialParentCategory as DomainCategory).id).toBe('o')
    expect(durum.ustOkumalari).toEqual(['o', 'k'])
  })

  it('orta kademe: atalar [kök]; yaprak çocuk kartları SUNUCUDA verilir', async () => {
    kur([KOK, ORTA, YAPRAK, YAPRAK2], ['y', 'y2'])
    cocuklar([YAPRAK, YAPRAK2])
    const p = gorunumProplari(await sayfa(ORTA))
    expect(kimlikler(p.initialAncestors)).toEqual(['k'])
    expect(kimlikler(p.initialSubCategories)).toEqual(['y', 'y2'])
  })

  it('pasif ara kademe kırıntıya BASILMAZ: yaprak atalar [kök], doğrudan üst null (ilk aktif ata)', async () => {
    const pasifOrta = { ...ORTA, aktif: false }
    kur([KOK, pasifOrta, YAPRAK], ['y'])
    cocuklar([])
    const p = gorunumProplari(await sayfa(YAPRAK))
    expect(kimlikler(p.initialAncestors)).toEqual(['k'])
    expect(p.initialParentCategory).toBeNull()
  })

  it('kök kategori: ata yok, üst okuması yok', async () => {
    kur([KOK, ORTA, YAPRAK], ['y'])
    cocuklar([ORTA])
    const p = gorunumProplari(await sayfa(KOK))
    expect(p.initialAncestors).toEqual([])
    expect(p.initialParentCategory).toBeNull()
    expect(durum.ustOkumalari).toEqual([])
  })

  it('eksik üst halka (kök satırı yok): zincir KISALIR, sayfa kırılmaz', async () => {
    kur([KOK, ORTA, YAPRAK], ['y'])
    durum.satirlar.delete('k')
    cocuklar([])
    // Eksik kök: zincir KISALIR (kırılmaz) — yalnız orta basılır.
    const p = gorunumProplari(await sayfa(YAPRAK))
    expect(kimlikler(p.initialAncestors)).toEqual(['o'])
  })
})

describe('kök sayfası — liste kümesi alt AĞAÇ', () => {
  it('kök: kendisi + orta + yaprak (yaprağa bağlı aileler kök sayfasından kaçmaz)', async () => {
    kur([KOK, ORTA, YAPRAK, YAPRAK2], ['o', 'y', 'y2'])
    cocuklar([ORTA])
    await sayfa(KOK)
    expect(durum.aileCagrilari.at(-1)?.categoryIds).toEqual(['k', 'o', 'y', 'y2'])
  })

  it('ürünsüz ve pasif torunlar kümeye girmez', async () => {
    const pasifYaprak2 = { ...YAPRAK2, aktif: false }
    kur([KOK, ORTA, YAPRAK, pasifYaprak2], ['o', 'y', 'y2'])
    cocuklar([ORTA])
    await sayfa(KOK)
    expect(durum.aileCagrilari.at(-1)?.categoryIds).toEqual(['k', 'o', 'y'])
    kur([KOK, ORTA, YAPRAK, YAPRAK2], ['o', 'y']) // y2 sayımı 0
    await sayfa(KOK)
    expect(durum.aileCagrilari.at(-1)?.categoryIds).toEqual(['k', 'o', 'y'])
  })

  it('pasif ORTA altında aktif yaprak: yaprak kök kümesinde, pasif orta kümede DEĞİL', async () => {
    const pasifOrta = { ...ORTA, aktif: false }
    kur([KOK, pasifOrta, YAPRAK], ['o', 'y'])
    cocuklar([pasifOrta]) // doğrudan çocuk sorgusu yalnız aktifleri döner → boş
    durum.cocuklar = []
    await sayfa(KOK)
    expect(durum.aileCagrilari.at(-1)?.categoryIds).toEqual(['k', 'y'])
  })

  it('orta kademe sayfası: kendisi + yapraklar; yaprak sayfası yalnız kendisi', async () => {
    kur([KOK, ORTA, YAPRAK, YAPRAK2], ['y', 'y2'])
    cocuklar([YAPRAK, YAPRAK2])
    await sayfa(ORTA)
    expect(durum.aileCagrilari.at(-1)?.categoryIds).toEqual(['o', 'y', 'y2'])
    cocuklar([])
    await sayfa(YAPRAK)
    expect(durum.aileCagrilari.at(-1)?.categoryIds).toEqual(['y'])
  })

  it('karma sütun fikstürü: küme yalnız parent_id ağacından kurulur (iki dalın sütunları farklı olsa da aynı kural)', async () => {
    // Aksesuarlar dalı: ürün category_id = orta, subcategory_id = yaprak. Fans dalı: category_id = kök, subcategory_id = alt.
    const fans: Satir = { id: 'f', ad: 'Fans', slug: 'fans', tr: 'fanlar', parent_id: null, aktif: true }
    const kanal: Satir = { id: 'a', ad: 'Duct Fans', slug: 'duct-fans', tr: 'kanal-tipi-fanlar', parent_id: 'f', aktif: true }
    kur([KOK, ORTA, YAPRAK, fans, kanal], ['o', 'y', 'f', 'a'])
    cocuklar([ORTA])
    await sayfa(KOK)
    expect(durum.aileCagrilari.at(-1)?.categoryIds).toEqual(['k', 'o', 'y'])
    cocuklar([kanal])
    await sayfa(fans)
    expect(durum.aileCagrilari.at(-1)?.categoryIds).toEqual(['f', 'a'])
  })

  it('iki kademe: küme bugünkü gibi [kök, ürünlü aktif çocuklar] (fark 0)', async () => {
    const fans: Satir = { id: 'f', ad: 'Fans', slug: 'fans', tr: 'fanlar', parent_id: null, aktif: true }
    const a: Satir = { id: 'a', ad: 'Duct Fans', slug: 'duct-fans', tr: 'kanal-tipi-fanlar', parent_id: 'f', aktif: true }
    const b: Satir = { id: 'b', ad: 'Axial', slug: 'axial', tr: 'aksiyel', parent_id: 'f', aktif: true }
    const bos: Satir = { id: 'c', ad: 'Empty', slug: 'empty', tr: 'bos', parent_id: 'f', aktif: true }
    kur([fans, a, b, bos], ['a', 'b'])
    cocuklar([a, b, bos])
    await sayfa(fans)
    expect(durum.aileCagrilari.at(-1)?.categoryIds).toEqual(['f', 'a', 'b'])
  })
})

describe('liste önbellek anahtarı', () => {
  it('küme değişince anahtar değişir (aynı kategori kimliği, farklı alt ağaç → farklı anahtar)', async () => {
    kur([KOK, ORTA, YAPRAK], ['o'])
    cocuklar([ORTA])
    await sayfa(KOK)
    const aileAnahtari = () =>
      durum.anahtarlar.filter((a): a is string[] => Array.isArray(a) && a[0] === 'category-families').at(-1)
    const once = aileAnahtari()
    expect(once?.slice(0, 5)).toEqual(['category-families', 'tr', expect.any(String), 'k', '1'])

    kur([KOK, ORTA, YAPRAK], ['o', 'y']) // yaprağa ürün geldi
    await sayfa(KOK)
    const sonra = aileAnahtari()
    expect(sonra?.slice(0, 5)).toEqual(once?.slice(0, 5))
    expect(sonra?.[5]).not.toBe(once?.[5])
  })

  it('ağaç iskeleti anahtarı lang × tenantId taşır ve KEŞİF etiketiyle tazelenir', async () => {
    kur([KOK], [])
    cocuklar([])
    await sayfa(KOK)
    const agacAnahtari = durum.anahtarlar.find((a) => Array.isArray(a) && a[0] === 'category-tree') as string[]
    expect(agacAnahtari).toEqual(['category-tree', 'tr', expect.any(String)])
  })
})
