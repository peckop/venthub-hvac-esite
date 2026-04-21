import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCategories } from '../category.service'
import { supabase } from '../../supabase'

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis()
    }))
  }
}))

vi.mock('../../type-converters', () => ({
  toUICategoryList: vi.fn((list) => list)
}))

describe('category.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCategories', () => {
    it('should fetch and return active categories ordered by level and name', async () => {
      const mockCategories = [{ id: '1', name: 'Cat 1' }]

      const mockOrder2 = vi.fn().mockResolvedValue({ data: mockCategories, error: null })
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder1 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

      const mockFrom = vi.fn(() => ({ select: mockSelect }))

      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      const result = await getCategories()

      expect(result).toEqual(mockCategories)
      expect(supabase.from).toHaveBeenCalledWith('categories')
      expect(mockSelect).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('is_active', true)
      expect(mockOrder1).toHaveBeenCalledWith('level', { ascending: true })
      expect(mockOrder2).toHaveBeenCalledWith('name', { ascending: true })
    })

    it('should throw error if fetch fails', async () => {
      const mockError = new Error('Fetch failed')
      const mockOrder2 = vi.fn().mockResolvedValue({ data: null, error: mockError })
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder1 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

      const mockFrom = vi.fn(() => ({ select: mockSelect }))

      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      await expect(getCategories()).rejects.toThrow('Fetch failed')
    })
  })
})
