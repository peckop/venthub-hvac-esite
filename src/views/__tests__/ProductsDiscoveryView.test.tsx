import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { Product } from '@/types/ui-models'

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

vi.mock('../../components/ProductCard', () => ({
  default: ({ product }: { product: { id: string; name: string } }) => (
    <div data-testid={`product-card-${product.id}`}>{product.name}</div>
  )
}))

describe('ProductsDiscoveryView', () => {
  it('should render products list container with content-auto class for CLS optimization', () => {
    const rawProducts: unknown = [
      { id: '1', name: 'Product 1', slug: 'p1', price: 100, original_price: 120, images: [], brand: 'vortice', description: 'desc1' },
      { id: '2', name: 'Product 2', slug: 'p2', price: 200, original_price: 220, images: [], brand: 'vortice', description: 'desc2' }
    ]
    const mockProducts = rawProducts as Product[]

    render(
      <ProductsDiscoveryView products={mockProducts} isLoading={false} />
    )

    const cards = screen.getAllByTestId(/product-card-/)
    expect(cards).toHaveLength(2)

    // cards[0].parentElement is the motion.div wrapper
    // cards[0].parentElement.parentElement is the container div with className containing content-auto
    const gridContainer = cards[0].parentElement?.parentElement
    expect(gridContainer).not.toBeNull()
    expect(gridContainer?.className).toContain('content-auto')
  })
})
