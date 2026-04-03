import React from 'react'
import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useCart } from '../useCartHook'
import { CartContext, type CartContextType, type CartItem } from '../../contexts/CartContext'
import type { DomainProduct as Product } from '../../types/ui-models'

describe('useCart hook', () => {
  it('returns safe fallback object when CartContext is undefined', () => {
    // Render the hook outside of any CartContext provider
    const { result } = renderHook(() => useCart())

    expect(result.current).toBeDefined()
    expect(result.current.items).toEqual([])
    expect(result.current.syncing).toBe(false)

    // Check default functions are no-ops that don't throw
    expect(() => result.current.addToCart({} as Partial<Product> as Product)).not.toThrow()
    expect(() => result.current.removeFromCart('id')).not.toThrow()
    expect(() => result.current.updateQuantity('id', 1)).not.toThrow()
    expect(() => result.current.clearCart()).not.toThrow()
    expect(() => result.current.applyServerPricing([])).not.toThrow()

    // Check getters return default 0
    expect(result.current.getCartTotal()).toBe(0)
    expect(result.current.getCartCount()).toBe(0)
  })

  it('returns context value when wrapped in CartContext provider', () => {
    const mockContextValue: CartContextType = {
      items: [{ id: '1', quantity: 2, unitPrice: 100 } as Partial<CartItem> as CartItem],
      syncing: true,
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      getCartTotal: vi.fn().mockReturnValue(200),
      getCartCount: vi.fn().mockReturnValue(2),
      applyServerPricing: vi.fn()
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartContext.Provider value={mockContextValue}>
        {children}
      </CartContext.Provider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.items).toEqual(mockContextValue.items)
    expect(result.current.syncing).toBe(true)
    expect(result.current.getCartTotal()).toBe(200)
    expect(result.current.getCartCount()).toBe(2)
  })
})
