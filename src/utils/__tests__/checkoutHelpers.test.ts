import { describe, it, expect } from 'vitest'
import { getPriceHashLocal } from '../checkoutHelpers'
import type { CartItem } from '../../contexts/CartContext'

const createMockItem = (
  id: string,
  quantity: number,
  productPrice: number,
  unitPrice?: number
): CartItem => ({
  id,
  quantity,
  product: { price: productPrice } as unknown as CartItem['product'],
  unitPrice
})

describe('getPriceHashLocal', () => {
  it('should return an empty array string for an empty list', () => {
    expect(getPriceHashLocal([])).toBe('[]')
  })

  it('should use unitPrice if provided, otherwise fallback to product.price', () => {
    const items = [
      createMockItem('item-1', 2, 100, 90), // Uses unitPrice 90
      createMockItem('item-2', 1, 50)       // Uses product.price 50
    ]

    const result = getPriceHashLocal(items)
    const parsed = JSON.parse(result)

    expect(parsed).toEqual([
      { id: 'item-1', qty: 2, unit: 90 },
      { id: 'item-2', qty: 1, unit: 50 }
    ])
  })

  it('should handle decimal prices and apply rounding correctly', () => {
    const items = [
      createMockItem('item-1', 1, 10.121), // Rounds down to 10.12
      createMockItem('item-2', 1, 20.999, 15.559) // Rounds up to 15.56
    ]

    const result = getPriceHashLocal(items)
    const parsed = JSON.parse(result)

    expect(parsed).toEqual([
      { id: 'item-1', qty: 1, unit: 10.12 },
      { id: 'item-2', qty: 1, unit: 15.56 }
    ])
  })

  it('should sort items by id', () => {
    const items = [
      createMockItem('z-item', 1, 100),
      createMockItem('a-item', 2, 50),
      createMockItem('m-item', 3, 75)
    ]

    const result = getPriceHashLocal(items)
    const parsed = JSON.parse(result)

    expect(parsed).toEqual([
      { id: 'a-item', qty: 2, unit: 50 },
      { id: 'm-item', qty: 3, unit: 75 },
      { id: 'z-item', qty: 1, unit: 100 }
    ])
  })

  it('should handle two items with the same ID', () => {
    const items = [
      createMockItem('dup-item', 1, 100),
      createMockItem('dup-item', 3, 100, 90)
    ]

    const result = getPriceHashLocal(items)
    const parsed = JSON.parse(result)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].id).toBe('dup-item')
    expect(parsed[1].id).toBe('dup-item')
    const units = parsed.map((p: { unit: number }) => p.unit)
    expect(units).toContain(100)
    expect(units).toContain(90)
  })
})
