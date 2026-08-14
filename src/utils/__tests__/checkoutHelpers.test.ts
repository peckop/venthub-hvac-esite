import { describe, expect,it } from 'vitest'

import type { CartItem } from '@/types/cart'

import { getPriceHashLocal } from '../checkoutHelpers'

/**
 * W4b: fiyat artık üründen değil, sunucunun doğruladığı `unitPrice`tan gelir.
 * Ham `product.price` fallback'i KALDIRILDI (emekli alan); fiyatı bilinmeyen kalem
 * hash'te `null` taşır ki "fiyat yok" ile "0 TL" birbirine karışmasın.
 */
const createMockItem = (id: string, quantity: number, unitPrice?: number): CartItem => ({
  id,
  quantity,
  product: { id: `p-${id}`, name: 'Test' } as Partial<CartItem['product']> as CartItem['product'],
  unitPrice
})

describe('getPriceHashLocal', () => {
  it('boş listede boş dizi döner', () => {
    expect(getPriceHashLocal([])).toBe('[]')
  })

  it('unitPrice varsa onu kullanır; fiyatı olmayan kalem null taşır', () => {
    const items = [
      createMockItem('item-1', 2, 90),
      createMockItem('item-2', 1) // fiyat bekleniyor → null
    ]

    const parsed = JSON.parse(getPriceHashLocal(items))

    expect(parsed).toEqual([
      { id: 'item-1', qty: 2, unit: 90 },
      { id: 'item-2', qty: 1, unit: null }
    ])
  })

  it('ondalıkları iki basamağa yuvarlar', () => {
    const items = [
      createMockItem('item-1', 1, 10.121), // 10.12
      createMockItem('item-2', 1, 15.559)  // 15.56
    ]

    const parsed = JSON.parse(getPriceHashLocal(items))

    expect(parsed).toEqual([
      { id: 'item-1', qty: 1, unit: 10.12 },
      { id: 'item-2', qty: 1, unit: 15.56 }
    ])
  })

  it('kalemleri id sırasına dizer', () => {
    const items = [
      createMockItem('z-item', 1, 100),
      createMockItem('a-item', 2, 50),
      createMockItem('m-item', 3, 75)
    ]

    const parsed = JSON.parse(getPriceHashLocal(items))

    expect(parsed).toEqual([
      { id: 'a-item', qty: 2, unit: 50 },
      { id: 'm-item', qty: 3, unit: 75 },
      { id: 'z-item', qty: 1, unit: 100 }
    ])
  })

  it('aynı id ile iki kalemi ayrı ayrı korur', () => {
    const items = [
      createMockItem('dup-item', 1, 100),
      createMockItem('dup-item', 3, 90)
    ]

    const parsed = JSON.parse(getPriceHashLocal(items))

    expect(parsed).toHaveLength(2)
    expect(parsed[0].id).toBe('dup-item')
    expect(parsed[1].id).toBe('dup-item')
    const units = parsed.map((p: { unit: number | null }) => p.unit)
    expect(units).toContain(100)
    expect(units).toContain(90)
  })
})
