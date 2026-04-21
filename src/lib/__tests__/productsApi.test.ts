import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchHomeProducts } from '../productsApi'

// Mock fetch globally
global.fetch = vi.fn()

describe('productsApi - fetchHomeProducts', () => {
  const MOCK_BASE = 'http://localhost:54321'
  const MOCK_KEY = 'mock-anon-key'

  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', MOCK_BASE)
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', MOCK_KEY)
    vi.clearAllMocks()
  })

  it('should fetch featured and general products successfully', async () => {
    const mockFeatured = [{ id: '1', name: 'Featured Product 1' }]
    const mockList = [{ id: '2', name: 'General Product 1' }]

    // Mock fetch responses
    ;(global.fetch as import("vitest").Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFeatured,
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => mockList,
    })

    const result = await fetchHomeProducts()

    expect(result).toEqual({ featured: mockFeatured, list: mockList })
    expect(global.fetch).toHaveBeenCalledTimes(2)

    // Verify first call (featured)
    const featuredCallUrl = (global.fetch as import("vitest").Mock).mock.calls[0][0]
    expect(featuredCallUrl).toContain('is_featured=eq.true')
    expect(featuredCallUrl).toContain('limit=6')

    // Verify second call (list)
    const listCallUrl = (global.fetch as import("vitest").Mock).mock.calls[1][0]
    expect(listCallUrl).not.toContain('is_featured=eq.true')
    expect(listCallUrl).toContain('limit=36')
  })

  it('should pass custom limit to general list fetch', async () => {
    const mockFeatured = [{ id: '1', name: 'Featured Product 1' }]
    const mockList = [{ id: '2', name: 'General Product 1' }]

    ;(global.fetch as import("vitest").Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFeatured,
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => mockList,
    })

    await fetchHomeProducts(10)

    const listCallUrl = (global.fetch as import("vitest").Mock).mock.calls[1][0]
    expect(listCallUrl).toContain('limit=10')
  })

  it('should throw error if featured fetch fails', async () => {
    ;(global.fetch as import("vitest").Mock).mockResolvedValueOnce({
      ok: false,
    })

    await expect(fetchHomeProducts()).rejects.toThrow('Featured fetch failed')
    expect(global.fetch).toHaveBeenCalledTimes(1) // General list fetch should not be called
  })

  it('should throw error if list fetch fails', async () => {
    ;(global.fetch as import("vitest").Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    }).mockResolvedValueOnce({
      ok: false,
    })

    await expect(fetchHomeProducts()).rejects.toThrow('Products fetch failed')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
