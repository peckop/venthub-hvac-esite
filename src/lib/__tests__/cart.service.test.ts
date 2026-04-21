import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrCreateShoppingCart, listCartItems, upsertCartItem, removeCartItem, clearCartItems } from '../services/cart.service'
import { supabase } from '../supabase'

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis()
    }))
  }
}))

vi.mock('../type-converters', () => ({
  mapDatabaseProductToDomain: vi.fn((p) => p)
}))

describe('cart.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrCreateShoppingCart', () => {
    it('should return existing cart if found', async () => {
      const mockCart = { id: 'cart-1', user_id: 'user-1' }

      const mockFrom = vi.fn((table) => {
        if (table === 'shopping_carts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [mockCart], error: null })
              })
            })
          }
        }
        return {}
      })
      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      const result = await getOrCreateShoppingCart('user-1')
      expect(result).toEqual(mockCart)
    })

    it('should create new cart if none exists', async () => {
      const mockCart = { id: 'cart-1', user_id: 'user-1' }

      const mockFrom = vi.fn((table) => {
        if (table === 'shopping_carts') {
            return {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue({ data: [], error: null })
                    })
                }),
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: mockCart, error: null })
                    })
                })
            }
        }
        return {}
      })

      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      const result = await getOrCreateShoppingCart('user-1')
      expect(result).toEqual(mockCart)
    })

    it('should throw error if creation fails with unknown error', async () => {
        const mockError = { code: '500', message: 'Unknown error' }
        const mockFrom = vi.fn((table) => {
            if (table === 'shopping_carts') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue({ data: [], error: null })
                        })
                    }),
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: null, error: mockError })
                        })
                    })
                }
            }
            return {}
        })

        ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

        await expect(getOrCreateShoppingCart('user-1')).rejects.toEqual(mockError)
    })
  })

  describe('listCartItems', () => {
    it('should list cart items', async () => {
        const mockItems = [{ id: 'item-1', cart_id: 'cart-1' }]
        const mockFrom = vi.fn(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: mockItems, error: null })
            })
        }))
        ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

        const result = await listCartItems('cart-1')
        expect(result).toEqual(mockItems)
    })
  })

  describe('upsertCartItem', () => {
    it('should insert new item if not exists', async () => {
      const mockItems = [{ id: 'item-1', cart_id: 'cart-1', product_id: 'prod-1', quantity: 2 }]

      const mockFrom = vi.fn((table) => {
        if(table === 'cart_items') {
          return {
              select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                      eq: vi.fn().mockReturnValue({
                          limit: vi.fn().mockResolvedValue({ data: [], error: null })
                      })
                  })
              }),
              insert: vi.fn().mockReturnValue({
                  select: vi.fn().mockResolvedValue({ data: mockItems, error: null })
              })
          }
        }
        return {}
      })
      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      const result = await upsertCartItem({ cartId: 'cart-1', _productId: 'prod-1', quantity: 2 })
      expect(result).toEqual(mockItems)
    })

    it('should update item if exists', async () => {
        const mockItems = [{ id: 'item-1', cart_id: 'cart-1', product_id: 'prod-1', quantity: 3 }]

        let callCount = 0;
        const mockFrom = vi.fn((table) => {
            if (table === 'cart_items') {
              if (callCount === 0) {
                  callCount++
                  return {
                      select: vi.fn().mockReturnValue({
                          eq: vi.fn().mockReturnValue({
                              eq: vi.fn().mockReturnValue({
                                  limit: vi.fn().mockResolvedValue({ data: [{id: 'item-1'}], error: null })
                              })
                          })
                      })
                  }
              } else {
                  return {
                      update: vi.fn().mockReturnValue({
                          eq: vi.fn().mockReturnValue({
                              eq: vi.fn().mockReturnValue({
                                  select: vi.fn().mockResolvedValue({ data: mockItems, error: null })
                              })
                          })
                      })
                  }
              }
            }
            return {}
        })
        ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

        const result = await upsertCartItem({ cartId: 'cart-1', _productId: 'prod-1', quantity: 3 })
        expect(result).toEqual(mockItems)
      })
  })

  describe('removeCartItem', () => {
    it('should remove item', async () => {
        const mockFrom = vi.fn(() => ({
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            })
        }))
        ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

        const result = await removeCartItem('cart-1', 'prod-1')
        expect(result).toBe(true)
    })
  })

  describe('clearCartItems', () => {
    it('should clear all items', async () => {
        const mockFrom = vi.fn(() => ({
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        }))
        ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

        const result = await clearCartItems('cart-1')
        expect(result).toBe(true)
    })
  })
})
