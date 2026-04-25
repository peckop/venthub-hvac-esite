import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getEffectiveUnitPrice, getEffectivePriceInfo } from '../pricing.service'
import { supabase } from '../../supabase'

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

describe('pricing.service', () => {
  const mockProduct = {
    id: 'prod-123',
    price: 150.00,
    name: 'Test Product',
    status: 'active'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getEffectivePriceInfo', () => {
    it('should return fallback price if user is not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: null } as unknown as never)

      const result = await getEffectivePriceInfo(mockProduct as unknown as never)

      expect(result).toEqual({ unitPrice: 150.00, priceListId: null })
    })

    it('should return fallback price if no price lists found', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null } as unknown as never)

      // Mock user profile
      const mockProfSingle = vi.fn().mockResolvedValue({ data: { role: 'individual' }, error: null })
      const mockProfEq = vi.fn().mockReturnValue({ maybeSingle: mockProfSingle })
      const mockProfSelect = vi.fn().mockReturnValue({ eq: mockProfEq })

      // Mock price lists (empty)
      const mockListOr = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockListLte = vi.fn().mockReturnValue({ or: mockListOr })
      const mockListEq = vi.fn().mockReturnValue({ lte: mockListLte })
      const mockListSelect = vi.fn().mockReturnValue({ eq: mockListEq })

      vi.mocked(supabase.from).mockImplementation((table: unknown) => {
        if (table === 'user_profiles') return { select: mockProfSelect } as unknown as never
        if (table === 'price_lists') return { select: mockListSelect } as unknown as never
        return {} as unknown as never
      })

      const result = await getEffectivePriceInfo(mockProduct as unknown as never)

      expect(result).toEqual({ unitPrice: 150.00, priceListId: null })
    })

    it('should calculate discounted price from active price list', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null } as unknown as never)

      // Mock user profile
      const mockProfSingle = vi.fn().mockResolvedValue({ data: { role: 'dealer' }, error: null })
      const mockProfEq = vi.fn().mockReturnValue({ maybeSingle: mockProfSingle })
      const mockProfSelect = vi.fn().mockReturnValue({ eq: mockProfEq })

      // Mock price lists (returns one dealer list)
      const mockListOr = vi.fn().mockResolvedValue({
        data: [{ id: 'pl-1', user_type: 'dealer', effective_from: '2023-01-01T00:00:00Z' }],
        error: null
      })
      const mockListLte = vi.fn().mockReturnValue({ or: mockListOr })
      const mockListEq = vi.fn().mockReturnValue({ lte: mockListLte })
      const mockListSelect = vi.fn().mockReturnValue({ eq: mockListEq })

      // Mock product prices (returns 10% discount on base 200)
      const mockPricesEq2 = vi.fn().mockResolvedValue({
        data: [{ base_price: 200, discount_percentage: 10 }],
        error: null
      })
      const mockPricesEq1 = vi.fn().mockReturnValue({ eq: mockPricesEq2 }) // is_active
      const mockPricesEqProd = vi.fn().mockReturnValue({ eq: mockPricesEq1 }) // product_id
      const mockPricesSelect = vi.fn().mockReturnValue({ eq: mockPricesEqProd })

      vi.mocked(supabase.from).mockImplementation((table: unknown) => {
        if (table === 'user_profiles') return { select: mockProfSelect } as unknown as never
        if (table === 'price_lists') return { select: mockListSelect } as unknown as never
        if (table === 'product_prices') return { select: mockPricesSelect } as unknown as never
        return {} as unknown as never
      })

      const result = await getEffectivePriceInfo(mockProduct as unknown as never)

      expect(result).toEqual({ unitPrice: 180.00, priceListId: 'pl-1' })
    })

    it('should return sale price if specified', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null } as unknown as never)

      // Mock user profile
      const mockProfSingle = vi.fn().mockResolvedValue({ data: { role: 'individual' }, error: null })
      const mockProfEq = vi.fn().mockReturnValue({ maybeSingle: mockProfSingle })
      const mockProfSelect = vi.fn().mockReturnValue({ eq: mockProfEq })

      // Mock price lists
      const mockListOr = vi.fn().mockResolvedValue({
        data: [{ id: 'pl-1', user_type: 'individual', effective_from: '2023-01-01T00:00:00Z' }],
        error: null
      })
      const mockListLte = vi.fn().mockReturnValue({ or: mockListOr })
      const mockListEq = vi.fn().mockReturnValue({ lte: mockListLte })
      const mockListSelect = vi.fn().mockReturnValue({ eq: mockListEq })

      // Mock product prices (returns sale_price 99.99)
      const mockPricesEq2 = vi.fn().mockResolvedValue({
        data: [{ base_price: 150, sale_price: 99.99 }],
        error: null
      })
      const mockPricesEq1 = vi.fn().mockReturnValue({ eq: mockPricesEq2 })
      const mockPricesEqProd = vi.fn().mockReturnValue({ eq: mockPricesEq1 })
      const mockPricesSelect = vi.fn().mockReturnValue({ eq: mockPricesEqProd })

      vi.mocked(supabase.from).mockImplementation((table: unknown) => {
        if (table === 'user_profiles') return { select: mockProfSelect } as unknown as never
        if (table === 'price_lists') return { select: mockListSelect } as unknown as never
        if (table === 'product_prices') return { select: mockPricesSelect } as unknown as never
        return {} as unknown as never
      })

      const result = await getEffectivePriceInfo(mockProduct as unknown as never)

      expect(result).toEqual({ unitPrice: 99.99, priceListId: 'pl-1' })
    })
  })

  describe('getEffectiveUnitPrice', () => {
    it('should return only the number from getEffectivePriceInfo', async () => {
      // Re-use logic from previous test for quick check
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: null } as unknown as never)

      const price = await getEffectiveUnitPrice(mockProduct as unknown as never)

      expect(price).toBe(150.00)
    })
  })
})
