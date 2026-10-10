import { describe, expect, it, vi } from 'vitest'

import { DomainCategory } from '../../lib/type-converters'
import { buildCategoryBreadcrumb } from '../breadcrumbUtils'

// Mock dependencies
vi.mock('../categoryHelpers', () => ({
  getCategoryDisplayName: vi.fn((cat: DomainCategory) => cat.name || cat.slug),
  getLocalizedCategorySlug: vi.fn((cat: DomainCategory) => cat.slug)
}))

// Faz 3-C (URN-85 2/2): kırıntıdaki üst kategori adresi `adresUret`'ten (plan §2: `/<dil>/kategori/<slug>` TR,
// `/<dil>/category/<slug>` EN) gelir; eski `Routes` sahtesi `localizedHref`'i eksik bırakıp üreticiyi kırıyordu.
// Adres burada GERÇEK üreticiyle ölçülür (sahte yok) — bu dosyanın konusu kırıntının BASAMAK YAPISIDIR.

describe('buildCategoryBreadcrumb', () => {
  const parentCategory: DomainCategory = {
    id: '1',
    tenant_id: 'd3b07384-d113-495f-a558-8c38634e0000',
    slug: 'hvac',
    name: 'HVAC Systems',
    description: '',
    parent_id: null,
    level: 0,
    is_active: true,
    is_featured: false,
    image_url: null,
    seo_title: null,
    seo_desc: null,
    sort_order: 0,
    display_mode: 'grid',
    menu_label: null,
    marketing_title: null,
    translation_key: null,
    metadata: null,
    authority_content: null,
    created_at: '',
    updated_at: ''
  }

  const category: DomainCategory = {
    id: '2',
    tenant_id: 'd3b07384-d113-495f-a558-8c38634e0000',
    slug: 'air-curtains',
    name: 'Air Curtains',
    description: '',
    parent_id: '1',
    level: 1,
    is_active: true,
    is_featured: false,
    image_url: null,
    seo_title: null,
    seo_desc: null,
    sort_order: 1,
    display_mode: 'grid',
    menu_label: null,
    marketing_title: null,
    translation_key: null,
    metadata: null,
    authority_content: null,
    created_at: '',
    updated_at: ''
  }

  it('should return only home when no categories are provided', () => {
    const result = buildCategoryBreadcrumb(null)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ label: 'Ana Sayfa', href: '/' })
  })

  it('should allow custom home label', () => {
    const result = buildCategoryBreadcrumb(null, null, 'Home')
    expect(result[0]).toEqual({ label: 'Home', href: '/' })
  })

  it('should include parent category only if category is null', () => {
    const result = buildCategoryBreadcrumb(null, parentCategory)
    expect(result).toHaveLength(2)
    expect(result[1]).toEqual({
      label: 'HVAC Systems',
      href: '/tr/kategori/hvac'
    })
  })

  it('should build the parent href with the active language section name (EN: /en/category)', () => {
    const result = buildCategoryBreadcrumb(null, parentCategory, 'Home', 'en')
    expect(result[1]).toEqual({
      label: 'HVAC Systems',
      href: '/en/category/hvac'
    })
  })

  it('should include category without href as the last item', () => {
    const result = buildCategoryBreadcrumb(category)
    expect(result).toHaveLength(2)
    expect(result[1]).toEqual({
      label: 'Air Curtains',
      href: undefined
    })
  })

  it('should build full breadcrumb with parent and category', () => {
    const result = buildCategoryBreadcrumb(category, parentCategory)
    expect(result).toHaveLength(3)
    expect(result[1]).toEqual({
      label: 'HVAC Systems',
      href: '/tr/kategori/hvac'
    })
    expect(result[2]).toEqual({
      label: 'Air Curtains',
      href: undefined
    })
  })
})
