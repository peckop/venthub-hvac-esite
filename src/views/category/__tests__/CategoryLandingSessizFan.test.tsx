// REC-300 Faz 1-B (#1352) — sessiz fan anlatısı ve sihirbazı, aile slug'ı migration'ın ÖNÜNDE de
// ARKASINDA da çalışır.
//
// Migration `vortice-lineo-quiet` ailesini `vortice-lineo-quiet-sessiz-kanal-fanlari` yapar; kod ile
// migration aynı anda canlıya çıkmaz. Yapı kapısı (INV-SILENTFAN-SERI-1) sabiti AST'den okur; bu
// dosya GÖRÜNÜMÜ çizer ve sihirbaza giden değeri ölçer: iki slug da anlatıyı açar, sihirbaz sayfadaki
// ailenin GERÇEK slug'ını alır, başka aile anlatıyı açmaz.
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { DbCategory } from '@/types/db-rows'
import type { FamilyListItem } from '@/types/ui-models'

import { mapDatabaseCategoryToDomain } from '../../../lib/type-converters'
import CategoryLanding from '../CategoryLandingView'

vi.mock('next/image', () => ({ default: () => null }))
vi.mock('../../../i18n/I18nProvider', () => ({ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }))
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
vi.mock('@/components/category/SilentFanWizard', () => ({
  default: ({ familySlug }: { familySlug: string }) => <div data-testid="sessiz-fan-sihirbazi" data-aile={familySlug} />,
}))
vi.mock('@/components/category/sections', () => {
  const kutu = (ad: string) => {
    const Kutu = () => <div data-testid={ad} />
    Kutu.displayName = `Kutu(${ad})`
    return Kutu
  }
  return {
    BottomCTA: kutu('BottomCTA'),
    FAQ: kutu('FAQ'),
    HowItWorks: kutu('HowItWorks'),
    ProblemSection: kutu('ProblemSection'),
    SilentFanFAQ: kutu('SilentFanFAQ'),
    SilentFanHowItWorks: kutu('SilentFanHowItWorks'),
    SilentFanProblem: kutu('SilentFanProblem'),
    SilentFanTypeComparison: kutu('SilentFanTypeComparison'),
    SilentFanVorticeBrand: kutu('SilentFanVorticeBrand'),
    TrustSignals: kutu('TrustSignals'),
    TypeComparison: kutu('TypeComparison'),
    VorticeBrand: kutu('VorticeBrand'),
  }
})

const kategoriSatiri: DbCategory = {
  id: 'cat-1',
  tenant_id: 'tenant-1',
  name: 'Duct Fans',
  slug: 'duct-fans',
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

function aile(slug: string): FamilyListItem {
  return {
    id: slug,
    name: slug,
    slug,
    series_code: null,
    description: null,
    brand_name: null,
    category_id: 'cat-1',
    subcategory_id: null,
    cover_image_path: null,
    variant_count: 1,
    min_price: null,
    total_count: 1,
  }
}

describe('sessiz fan anlatısı + sihirbazı: aile slug\'ı', () => {
  it('URN-53: ESKİ slug artık seri DEĞİL (geçiş köprüsü kaldırıldı): anlatı ve sihirbaz açılmaz', () => {
    render(<CategoryLanding category={kategori} families={[aile('vortice-lineo'), aile('vortice-lineo-quiet')]} />)
    expect(screen.queryByTestId('SilentFanProblem')).toBeNull()
    expect(screen.queryByTestId('sessiz-fan-sihirbazi')).toBeNull()
  })

  it('YENİ slug (#1352 sonrası): anlatı açık, sihirbaz YENİ slug ile beslenir', () => {
    render(<CategoryLanding category={kategori} families={[aile('vortice-lineo-quiet-sessiz-kanal-fanlari')]} />)
    expect(screen.queryByTestId('SilentFanProblem')).not.toBeNull()
    expect(screen.getByTestId('sessiz-fan-sihirbazi').getAttribute('data-aile')).toBe('vortice-lineo-quiet-sessiz-kanal-fanlari')
  })

  it('başka aile anlatıyı ve sihirbazı AÇMAZ (tetikleyici SERİdir, kategori değil)', () => {
    render(<CategoryLanding category={kategori} families={[aile('vortice-lineo-kanal-fanlari'), aile('vortice-radon-serisi-kanal-fanlari')]} />)
    expect(screen.queryByTestId('SilentFanProblem')).toBeNull()
    expect(screen.queryByTestId('sessiz-fan-sihirbazi')).toBeNull()
  })
})
