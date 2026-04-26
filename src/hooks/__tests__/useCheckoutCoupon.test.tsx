import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCheckoutCoupon } from '../useCheckoutCoupon'
import toast from 'react-hot-toast'

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock fetch for Edge Function call
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

describe('useCheckoutCoupon', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv, NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key' }
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useCheckoutCoupon(1000))
    expect(result.current.couponCode).toBe('')
    expect(result.current.couponApplied).toBeNull()
  })

  it('should reject short coupon codes without calling API', async () => {
    const { result } = renderHook(() => useCheckoutCoupon(1000))

    act(() => {
      result.current.setCouponCode('AB')
    })

    await act(async () => {
      await result.current.applyCoupon()
    })

    expect(mockFetch).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Kupon kodu geçersiz')
    expect(result.current.couponApplied).toBeNull()
  })

  it('should successfully apply a valid coupon', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, normalized_code: 'TEST10', discount_amount: 100 })
    })

    const { result } = renderHook(() => useCheckoutCoupon(1000))

    act(() => {
      result.current.setCouponCode('test10')
    })

    await act(async () => {
      await result.current.applyCoupon()
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/apply-coupon',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ code: 'test10', subtotal: 1000 })
      })
    )

    expect(toast.success).toHaveBeenCalledWith('Kupon uygulandı')
    expect(result.current.couponApplied).toEqual({ code: 'TEST10', discount: 100 })
  })

  it('should handle API validation failure correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ valid: false, error: 'Süresi dolmuş kupon' })
    })

    const { result } = renderHook(() => useCheckoutCoupon(1000))

    act(() => {
      result.current.setCouponCode('EXPIRED')
    })

    await act(async () => {
      await result.current.applyCoupon()
    })

    expect(toast.error).toHaveBeenCalledWith('Süresi dolmuş kupon')
    expect(result.current.couponApplied).toBeNull()
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCheckoutCoupon(1000))

    act(() => {
      result.current.setCouponCode('ERROR')
    })

    await act(async () => {
      await result.current.applyCoupon()
    })

    expect(toast.error).toHaveBeenCalledWith('Kupon doğrulanamadı')
    expect(result.current.couponApplied).toBeNull()
  })

  it('should clear coupon state when removeCoupon is called', () => {
    const { result } = renderHook(() => useCheckoutCoupon(1000))

    // Simulate applied state
    act(() => {
      result.current.setCouponCode('TEST10')
      // Hacky way to set internal state for testing remove
      result.current.applyCoupon = async () => {} // skip fetch
    })

    act(() => {
      result.current.removeCoupon()
    })

    expect(result.current.couponCode).toBe('')
    expect(result.current.couponApplied).toBeNull()
  })
})
