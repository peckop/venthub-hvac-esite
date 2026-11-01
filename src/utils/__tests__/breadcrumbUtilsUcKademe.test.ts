/**
 * URN-144 (karar 410) — kategori sayfası kırıntısı üç kademede TAM zincirdir; iki kademede çıktı eskisiyle aynıdır.
 * Her ata kendi TEK segmentli adresine gider (karar 407). Veri test verisidir.
 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/config/features', async (orijinal) => ({
  ...(await orijinal<typeof import('@/config/features')>()),
  ADRES_SEMASI_K3B: true,
}))

import type { DomainCategory } from '../../lib/type-converters'
import { buildCategoryBreadcrumb } from '../breadcrumbUtils'

const kat = (id: string, slug: string, tr: string, ad: string, parent_id: string | null): DomainCategory => ({
  id,
  slug,
  name: ad,
  parent_id,
  level: 0,
  is_active: true,
  is_featured: null,
  menu_label: ad,
  translation_key: null,
  metadata: { slug: { tr, en: slug } },
  authority_content: null,
  description: '',
  display_mode: null,
  image_url: null,
  marketing_title: null,
  seo_desc: null,
  seo_title: null,
  sort_order: null,
  tenant_id: 'tenant-1',
  created_at: '2026-10-25T00:00:00.000Z',
  updated_at: '2026-10-25T00:00:00.000Z',
})

const KOK = kat('k', 'accessories', 'aksesuarlar', 'Aksesuarlar', null)
const ORTA = kat('o', 'control-systems', 'elektrik-aksesuarlari', 'Elektrik Aksesuarları', 'k')
const YAPRAK = kat('y', 'frequency-converters', 'frekans-konvertorleri', 'Frekans Konvertörleri', 'o')

describe('buildCategoryBreadcrumb — ata zinciri', () => {
  it('üç kademe: Ana Sayfa › kök › orta › yaprak; atalar bağlantı, yaprak bağlantısız', () => {
    const items = buildCategoryBreadcrumb(YAPRAK, ORTA, 'Ana Sayfa', 'tr', undefined, [KOK, ORTA])
    expect(items.map((i) => i.label)).toEqual(['Ana Sayfa', 'Aksesuarlar', 'Elektrik Aksesuarları', 'Frekans Konvertörleri'])
    expect(items.map((i) => i.href)).toEqual(['/', '/tr/kategori/aksesuarlar', '/tr/kategori/elektrik-aksesuarlari', undefined])
  })

  it('orta kademe sayfası: Ana Sayfa › kök › orta', () => {
    const items = buildCategoryBreadcrumb(ORTA, KOK, 'Ana Sayfa', 'en', undefined, [KOK])
    expect(items.map((i) => i.href)).toEqual(['/', '/en/category/accessories', undefined])
  })

  it('iki kademe: yalnız tek üst — `ancestors` verilmese de verilse de çıktı AYNI', () => {
    const kok = kat('f', 'fans', 'fanlar', 'Fanlar', null)
    const alt = kat('a', 'duct-fans', 'kanal-tipi-fanlar', 'Kanal Tipi Fanlar', 'f')
    const eski = buildCategoryBreadcrumb(alt, kok, 'Ana Sayfa', 'tr')
    expect(buildCategoryBreadcrumb(alt, kok, 'Ana Sayfa', 'tr', undefined, [kok])).toEqual(eski)
    expect(buildCategoryBreadcrumb(alt, kok, 'Ana Sayfa', 'tr', undefined, [])).toEqual(eski)
    expect(eski.map((i) => i.label)).toEqual(['Ana Sayfa', 'Fanlar', 'Kanal Tipi Fanlar'])
  })

  it('kök kategori: yalnız Ana Sayfa › kendisi', () => {
    expect(buildCategoryBreadcrumb(KOK, null, 'Ana Sayfa', 'tr').map((i) => i.label)).toEqual(['Ana Sayfa', 'Aksesuarlar'])
  })
})
