import { describe, it, expect, vi, beforeEach } from 'vitest'

import { getEffectiveUnitPrice, getEffectivePriceInfo } from '../pricing.service'

import { supabase } from '../../supabase'


vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis()
    }))
  }
}))

describe('pricing.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockProduct = {
    id: 'prod-1',
    price: 100,
    name: 'Test Product',
    sku: 'SKU-1'
  }

  describe('getEffectivePriceInfo', () => {
    it('should return fallback price if user is not authenticated', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: null }, error: null })

      const result = await getEffectivePriceInfo(mockProduct as unknown as Parameters<typeof getEffectivePriceInfo>[0])

      expect(result).toEqual({ unitPrice: 100, priceListId: null })
      expect(supabase.auth.getUser).toHaveBeenCalled()
    })

    it('should calculate discount correctly', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'user-1', role: 'dealer' }, error: null })

      const mockOr = vi.fn().mockResolvedValue({
        data: [
          { id: 'list-1', user_type: 'dealer', effective_from: '2023-01-01T00:00:00.000Z' }
        ],
        error: null
      })

      ;(supabase.from as import('vitest').Mock).mockImplementation((table) => {
        if (table === 'user_profiles') {
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }) }) }
        }
        if (table === 'price_lists') {
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ lte: vi.fn().mockReturnValue({ or: mockOr }) }) }) }
        }
        if (table === 'product_prices') {
           const mockIs = vi.fn().mockResolvedValue({ data: [], error: null })
           const mockEq3 = vi.fn().mockImplementation((_col, _val) => {
             if (_col === 'price_list_id' && _val === 'list-1') {
               return Promise.resolve({ data: [{ base_price: 200, discount_percentage: 10 }], error: null })
             }
             return { is: mockIs }
           })
           const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3, is: mockIs })
           const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
           return { select: vi.fn().mockReturnValue({ eq: mockEq1 }) }
        }
        return {}
      })

      const result = await getEffectivePriceInfo(mockProduct as unknown as Parameters<typeof getEffectivePriceInfo>[0])

      expect(result).toEqual({ unitPrice: 180, priceListId: 'list-1' })
    })

    it('should use fallback if no active product_prices exist', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'user-1', role: 'dealer' }, error: null })

      const mockOr = vi.fn().mockResolvedValue({
        data: [
          { id: 'list-1', user_type: 'dealer', effective_from: '2023-01-01T00:00:00.000Z' }
        ],
        error: null
      })

      ;(supabase.from as import('vitest').Mock).mockImplementation((table) => {
        if (table === 'user_profiles') {
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }) }) }
        }
        if (table === 'price_lists') {
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ lte: vi.fn().mockReturnValue({ or: mockOr }) }) }) }
        }
        if (table === 'product_prices') {
           const mockIs = vi.fn().mockResolvedValue({ data: [], error: null })
           const mockEq3 = vi.fn().mockImplementation((_col, _val) => {
             return Promise.resolve({ data: [], error: null })
           })
           const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3, is: mockIs })
           const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
           return { select: vi.fn().mockReturnValue({ eq: mockEq1 }) }
        }
        return {}
      })

      const result = await getEffectivePriceInfo(mockProduct as unknown as Parameters<typeof getEffectivePriceInfo>[0])

      expect(result).toEqual({ unitPrice: 100, priceListId: 'list-1' })
    })
  })

  describe('getEffectiveUnitPrice', () => {
    it('should return just the unit price', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: null }, error: null })
      const result = await getEffectiveUnitPrice(mockProduct as unknown as Parameters<typeof getEffectiveUnitPrice>[0])
      expect(result).toBe(100)
    })
  })
})
