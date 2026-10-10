// URN-84 — nem alma cihazları kategori sayfasının rakam çipleri: değeri sözlükte BOŞ ('') bırakılan çip,
// etiketiyle birlikte atılır (etiket tek başına anlamsız); hiç çip kalmazsa ızgara da basılmaz.
//
// NİÇİN: `dehumidifierCapacityValue` / `dehumidifierNoiseValue` tabloda BOŞ (kaynaksız teknik değer, çip kalkar).
// Bileşen '' değerini olduğu gibi basarsa büyük, boş bir rakam kutusunun altında "Kapasite" etiketi kalırdı.
import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { DbCategory } from '@/types/db-rows'

import { mapDatabaseCategoryToDomain } from '../../../lib/type-converters'
import CategoryLanding from '../CategoryLandingView'

const kaynak = vi.hoisted(() => ({
  kapasite: '',
  gurultu: '',
  kapasiteEtiketi: 'Kapasite',
  gurultuEtiketi: 'Ses Seviyesi',
}))

vi.mock('next/image', () => ({ default: () => null }))
vi.mock('../../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    lang: 'tr',
    t: (k: string) =>
      ({
        'category.landing.dehumidifierTitle': 'Nem Alma',
        'category.landing.dehumidifierDesc': 'Açıklama',
        'category.landing.dehumidifierCapacityValue': kaynak.kapasite,
        'category.landing.dehumidifierCapacityLabel': kaynak.kapasiteEtiketi,
        'category.landing.dehumidifierNoiseValue': kaynak.gurultu,
        'category.landing.dehumidifierNoiseLabel': kaynak.gurultuEtiketi,
      } as Record<string, string>)[k] ?? k,
  }),
}))
vi.mock('../../../hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({ category: (s: string) => `/tr/category/${s}`, product: (s: string) => `/tr/products/${s}` }),
}))
vi.mock('../../../hooks/useCategoryViewModel', () => ({
  useCategoryViewModel: () => ({
    wrapCategory: (c?: { slug?: string }) => (c ? { displayName: c.slug ?? '', raw: c, imageUrl: null, description: '' } : undefined),
  }),
}))
vi.mock('@/components/navigation/Breadcrumb', () => ({ default: () => null }))
vi.mock('@/components/products/FamilyCard', () => ({ default: () => null }))
vi.mock('@/components/category/EnhancedNeedsWizard', () => ({ default: () => null }))
vi.mock('@/components/category/SilentFanWizard', () => ({ default: () => null }))
vi.mock('@/components/category/sections', () => {
  const kutu = () => () => null
  return {
    BottomCTA: kutu(),
    FAQ: kutu(),
    HowItWorks: kutu(),
    ProblemSection: kutu(),
    SilentFanFAQ: kutu(),
    SilentFanHowItWorks: kutu(),
    SilentFanProblem: kutu(),
    SilentFanTypeComparison: kutu(),
    SilentFanVorticeBrand: kutu(),
    TrustSignals: kutu(),
    TypeComparison: kutu(),
    VorticeBrand: kutu(),
  }
})

const kategoriSatiri: DbCategory = {
  id: 'cat-nem',
  tenant_id: 'tenant-1',
  name: 'Dehumidifiers',
  slug: 'dehumidifiers',
  parent_id: null,
  level: 0,
  is_active: true,
  is_featured: false,
  sort_order: 0,
  image_url: null,
  seo_title: null,
  seo_desc: null,
  display_mode: null,
  menu_label: null,
  marketing_title: null,
  translation_key: null,
  description: null,
  metadata: null,
  authority_content: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}
const kategori = mapDatabaseCategoryToDomain(kategoriSatiri)

/** Çipler: büyük rakam paragrafı (`text-3xl`) + altındaki etiket. */
const cipler = (container: HTMLElement) => Array.from(container.querySelectorAll('p.text-3xl'))

afterEach(() => {
  kaynak.kapasite = ''
  kaynak.gurultu = ''
  kaynak.kapasiteEtiketi = 'Kapasite'
  kaynak.gurultuEtiketi = 'Ses Seviyesi'
})

describe('nem alma kategori sayfası — boş değerli rakam çipi çizilmez', () => {
  it('iki değer de boşken çip de etiket de ızgara da basılmaz; başlık ve açıklama durur', () => {
    const { container } = render(<CategoryLanding category={kategori} families={[]} />)
    expect(cipler(container)).toHaveLength(0)
    expect(container.textContent).not.toContain('Kapasite')
    expect(container.textContent).not.toContain('Ses Seviyesi')
    expect(container.querySelector('div.grid.grid-cols-2.gap-8')).toBeNull()
    expect(container.textContent).toContain('Nem Alma')
    expect(container.textContent).toContain('Açıklama')
  })

  it('OLUMLU KONTROL + KISMİ: yalnız kapasite doluysa tek çip (değeri + etiketi), gürültü etiketi YOK', () => {
    kaynak.kapasite = 'KAP-DEĞER'
    const { container } = render(<CategoryLanding category={kategori} families={[]} />)
    expect(cipler(container).map((p) => p.textContent)).toEqual(['KAP-DEĞER'])
    expect(container.textContent).toContain('Kapasite')
    expect(container.textContent).not.toContain('Ses Seviyesi')
  })

  it('iki çipin etiketi de boşsa (yalnız değerler dolu) etiket paragrafı basılmaz ve React yinelenen anahtar uyarısı vermez', () => {
    kaynak.kapasite = 'KAP-DEĞER'
    kaynak.gurultu = 'SES-DEĞER'
    kaynak.kapasiteEtiketi = ''
    kaynak.gurultuEtiketi = ''
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { container } = render(<CategoryLanding category={kategori} families={[]} />)
      expect(cipler(container).map((p) => p.textContent)).toEqual(['KAP-DEĞER', 'SES-DEĞER'])
      expect(container.querySelectorAll('p.text-xs')).toHaveLength(0)
      const yinelenenAnahtar = hata.mock.calls.filter((cagri) => String(cagri[0]).includes('same key'))
      expect(yinelenenAnahtar).toHaveLength(0)
    } finally {
      hata.mockRestore()
    }
  })

  it('iki değer de doluysa iki çip', () => {
    kaynak.kapasite = 'KAP-DEĞER'
    kaynak.gurultu = 'SES-DEĞER'
    const { container } = render(<CategoryLanding category={kategori} families={[]} />)
    expect(cipler(container).map((p) => p.textContent)).toEqual(['KAP-DEĞER', 'SES-DEĞER'])
    expect(container.textContent).toContain('Ses Seviyesi')
  })
})
