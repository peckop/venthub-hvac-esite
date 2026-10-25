/**
 * URN-147 — ürün sayfasının "İlgili aileler" listesi SUNUCUDA okunur ve fiyatı süzülür (INV-FIYAT-SIZINTI-3 yüzeyi).
 *
 * NİÇİN: `ProductDetailPageView` ('use client') listeyi tarayıcıdan çekiyordu; XHR yanıtı teklif modundaki ailenin
 * gerçek `min_price`'ını taşıyordu. Kapılar: (a) kural istemci davranışıyla BİREBİR (alt kategori ?? ana kategori,
 * mevcut aile hariç, ilk 4), (b) teklif modunda `min_price` görünüme GİTMEZ, satış kipinde değişmez, (c) okuma
 * hatasında boş liste + uyarı, (d) `AileSayfasi` süzülmüş listeyi `PageComponent`e geçirir, (e) görünüm tarayıcıdan
 * aile çekmez.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { FamilyListItem } from '@/types/ui-models'

vi.mock('@/lib/supabase/static', () => ({ supabaseStaticClient: {} }))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
}))
const durum = vi.hoisted(() => ({ detail: null as unknown }))
vi.mock('@/lib/data/preload', () => ({
  preloadFamily: vi.fn(),
  getCachedFamilyDetail: vi.fn(),
  getCachedKategoriUstById: vi.fn(async () => null),
}))
vi.mock('@/lib/data/urunSegmenti', () => ({ urunRotasiBagimliliklari: vi.fn(() => ({})) }))
vi.mock('@/lib/data/productRoute', () => ({
  resolveProductRoute: vi.fn(async () => ({ kind: 'family', detail: durum.detail })),
}))
vi.mock('@/lib/bilgiMerkezi/tersDizin', () => ({ ilgiliRehberler: () => [] }))
// Görünüm modülü bu testin konusu değil (istemci bağlamları ağır); yalnız props'u okunur.
vi.mock('../_components/ProductDetailPageView', () => ({ ProductDetailPage: () => null }))

import { AileSayfasi, ILGILI_AILE_GOSTERILEN, ilgiliAileVerisi } from '../_components/aileSayfasi'

afterEach(() => {
  vi.restoreAllMocks()
})

const GIZLI = { metadata: { hide_price: true } }
const ACIK = { metadata: { hide_price: false } }

const aile = (id: string, minPrice: number | null): FamilyListItem => ({
  id,
  name: `Aile ${id}`,
  slug: `aile-${id}`,
  series_code: null,
  description: null,
  brand_name: 'Vortice',
  category_id: 'kat',
  subcategory_id: null,
  cover_image_path: null,
  variant_count: 3,
  min_price: minPrice,
  total_count: 12,
})

const fiyatSayisi = (veri: unknown) => (JSON.stringify(veri).match(/"min_price":[0-9][0-9.]*/g) ?? []).length

const ben = { id: 'ben', category_id: 'ana', subcategory_id: 'alt' }

describe('ilgiliAileVerisi: kural istemci davranışıyla birebir (URN-147)', () => {
  it('KURGU FİYATLI — sahte-yeşil olmasın', () => {
    expect(fiyatSayisi([aile('1', 37773), aile('2', null)])).toBe(1)
  })

  it('alt kategori kimliği önceliklidir; yoksa ana kategori; ikisi de yoksa okuma HİÇ atılmaz', async () => {
    const oku = vi.fn(async () => [aile('1', null)])
    await ilgiliAileVerisi(ben, GIZLI, oku)
    expect(oku).toHaveBeenLastCalledWith('alt')
    await ilgiliAileVerisi({ id: 'ben', category_id: 'ana', subcategory_id: null }, GIZLI, oku)
    expect(oku).toHaveBeenLastCalledWith('ana')
    oku.mockClear()
    expect(await ilgiliAileVerisi({ id: 'ben', category_id: null, subcategory_id: null }, GIZLI, oku)).toEqual([])
    expect(await ilgiliAileVerisi(null, GIZLI, oku)).toEqual([])
    expect(oku).not.toHaveBeenCalled()
  })

  it('mevcut aile listeden çıkarılır ve ilk 4 kalır (12 aday)', async () => {
    const adaylar = Array.from({ length: 12 }, (_, i) => aile(String(i + 1), null))
    adaylar.splice(2, 0, aile('ben', null))
    const sonuc = await ilgiliAileVerisi(ben, GIZLI, async () => adaylar)
    expect(ILGILI_AILE_GOSTERILEN).toBe(4)
    expect(sonuc.map((f) => f.id)).toEqual(['1', '2', '3', '4'])
    expect(sonuc.some((f) => f.id === 'ben')).toBe(false)
  })

  it('teklif modunda min_price görünüme GİTMEZ, diğer alanlar korunur; satış kipinde fiyat korunur', async () => {
    const oku = async () => [aile('1', 37773), aile('2', 41200.5), aile('3', null)]
    const teklif = await ilgiliAileVerisi(ben, GIZLI, oku)
    expect(fiyatSayisi(teklif)).toBe(0)
    expect(teklif.every((f) => f.min_price === null)).toBe(true)
    expect(teklif.map((f) => f.name)).toEqual(['Aile 1', 'Aile 2', 'Aile 3'])
    const satis = await ilgiliAileVerisi(ben, ACIK, oku)
    expect(fiyatSayisi(satis)).toBe(2)
  })

  it('kategori bağlamı yoksa mod bilinmiyor → teklif modu (fiyat çıkar)', async () => {
    const sonuc = await ilgiliAileVerisi(ben, null, async () => [aile('1', 100)])
    expect(fiyatSayisi(sonuc)).toBe(0)
  })

  it('okuma hatasında (ağ yok / DB hatası) boş liste, hata FIRLATILMAZ, uyarı basılır', async () => {
    const uyari = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const sonuc = await ilgiliAileVerisi(ben, GIZLI, async () => {
      throw new Error('ağ yok')
    })
    expect(sonuc).toEqual([])
    expect(uyari).toHaveBeenCalledTimes(1)
  })
})

function sayfaProps(agac: ReactNode): Record<string, unknown> | null {
  let bulunan: Record<string, unknown> | null = null
  const gez = (n: ReactNode) => {
    if (Array.isArray(n)) return n.forEach(gez)
    if (!isValidElement(n)) return
    const el = n as ReactElement<Record<string, unknown>>
    if ('initialRelatedFamilies' in el.props) bulunan = el.props
    gez(el.props.children as ReactNode)
  }
  gez(agac)
  return bulunan
}

describe('AileSayfasi: süzülmüş ilgili aileler PageComponent e gider (URN-147)', () => {
  const detay = (kategori: unknown) => ({
    family: {
      id: 'ben',
      name: 'BVU LS',
      slug: 'avens-bvu-ls',
      series_code: null,
      description: null,
      brand_name: null,
      category_id: 'ana',
      subcategory_id: 'alt',
      meta_title: null,
      meta_description: null,
      category: kategori,
      subcategory: null,
    },
    variants: [
      { id: 'v1', sku: 'ABC-1', name: 'BVU', slug: null, model_code: '1', price: null, stock_qty: null, technical_specs: null, description: null, images: [] },
    ],
    price_tax_included: null,
  })

  it('teklif modundaki ailede kartlar gelir (mevcut aile hariç) ama min_price yoktur', async () => {
    durum.detail = detay({ id: 'ana', name: 'Fan', slug: 'fan', menu_label: null, translation_key: null, metadata: { hide_price: true } })
    const oku = vi.fn(async () => [aile('ben', 5), aile('1', 37773), aile('2', 41200)])
    const props = sayfaProps(await AileSayfasi({ lang: 'tr', slug: 'avens-bvu-ls', ilgiliAileler: oku }))
    expect(oku).toHaveBeenCalledWith('alt')
    const kartlar = props?.initialRelatedFamilies as FamilyListItem[]
    expect(kartlar.map((f) => f.id)).toEqual(['1', '2'])
    expect(fiyatSayisi(kartlar)).toBe(0)
  })

  it('okuma hatası sayfayı kırmaz: initialRelatedFamilies boş liste', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    durum.detail = detay(null)
    const props = sayfaProps(
      await AileSayfasi({
        lang: 'en',
        slug: 'avens-bvu-ls',
        ilgiliAileler: async () => {
          throw new Error('ağ yok')
        },
      }),
    )
    expect(props?.initialRelatedFamilies).toEqual([])
  })
})

describe('kaynak kapıları (URN-147)', () => {
  it('okuma önbellekli; anahtar lang + tenantId + kategori; keşif etiketiyle tazelenir; süzgeç sayfa kategorisiyle', () => {
    const k = readFileSync(join(process.cwd(), 'src/app/_components/aileSayfasi.tsx'), 'utf8')
    expect(k).toMatch(/\['pdp-related-families',\s*lang,\s*tenantId,\s*kategoriId\]/)
    expect(k).toMatch(/getCachedKategoriAileleri[\s\S]{0,500}tags:\s*\[PRODUCTS_DISCOVERY_TAG,\s*discoveryTag\(tenantId\)\]/)
    expect(k).toMatch(/return listeFiyatiniSuz\(aday,\s*kategori\)/)
  })

  it('ProductDetailPageView tarayıcıdan aile çekmez; initialRelatedFamilies prop u var', () => {
    const k = readFileSync(join(process.cwd(), 'src/app/_components/ProductDetailPageView.tsx'), 'utf8')
    expect(k).not.toContain('getFamiliesEnriched')
    expect(k).not.toMatch(/setRelatedFamilies|relatedCategoryId/)
    expect(k).toMatch(/initialRelatedFamilies\??:\s*FamilyListItem\[\]/)
  })
})
