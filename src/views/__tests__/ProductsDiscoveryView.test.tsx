import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { FamilyListItem } from '@/types/ui-models'

import ProductsDiscoveryView from '../ProductsDiscoveryView'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  })
}))

vi.mock('../i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (k: string) => k
  })
}))

vi.mock('../../components/products/CategoryOrbitCarousel', () => ({
  default: () => <div data-testid="category-orbit-carousel" />
}))

vi.mock('../../components/products/FamilyCard', () => ({
  default: ({ family }: { family: { id: string; name: string } }) => (
    <div data-testid={`family-card-${family.id}`}>{family.name}</div>
  )
}))

describe('ProductsDiscoveryView', () => {
  it('should render products list container with content-auto class for CLS optimization', () => {
    const rawFamilies: unknown = [
      { id: '1', name: 'Family 1', slug: 'f1', brand_name: 'vortice', variant_count: 3, min_price: null, cover_image_path: null, total_count: 2 },
      { id: '2', name: 'Family 2', slug: 'f2', brand_name: 'vortice', variant_count: 5, min_price: null, cover_image_path: null, total_count: 2 }
    ]
    const mockFamilies = rawFamilies as FamilyListItem[]

    render(
      <ProductsDiscoveryView families={mockFamilies} total={2} isLoading={false} />
    )

    const cards = screen.getAllByTestId(/family-card-/)
    expect(cards).toHaveLength(2)

    // cards[0].parentElement is the motion.div wrapper
    // cards[0].parentElement.parentElement is the container div with className containing content-auto
    const gridContainer = cards[0].parentElement?.parentElement
    expect(gridContainer).not.toBeNull()
    expect(gridContainer?.className).toContain('content-auto')
  })
})
