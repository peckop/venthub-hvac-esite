import { describe, expect, it, vi } from 'vitest'

import { DomainCategory } from '../../lib/type-converters'
import { buildCategoryBreadcrumb } from '../breadcrumbUtils'

// Mock dependencies
vi.mock('../categoryHelpers', () => ({
  getCategoryDisplayName: vi.fn((cat: DomainCategory) => cat.name || cat.slug)
}))

vi.mock('../../utils/routes', () => ({
  Routes: {
    category: vi.fn((slug: string) => `/category/${slug}`)
  }
}))

describe('buildCategoryBreadcrumb', () => {
  const parentCategory: DomainCategory = {
    id: '1',
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
      href: '/category/hvac'
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
      href: '/category/hvac'
    })
    expect(result[2]).toEqual({
      label: 'Air Curtains',
      href: undefined
    })
  })
})
