import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSettings } from '../useSettings'
import { supabase } from '../../lib/supabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  }
}))

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    // Override mock to delay response
    let resolvePromise: (value: unknown) => void;
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        single: vi.fn().mockReturnValueOnce(new Promise(resolve => {
          resolvePromise = resolve;
        }))
      })
    })

    const { result } = renderHook(() => useSettings())
    expect(result.current.loading).toBe(true)
    expect(result.current.settings).toBeNull()
    expect(result.current.error).toBeNull()

    // Clean up pending promise
    resolvePromise!({ data: null, error: null })
  })

  it('should fetch and set settings successfully', async () => {
    const mockSettings = {
      id: '1',
      site_title: 'Test Site',
      contact_email: 'test@test.com'
    }

    ;(supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        single: vi.fn().mockResolvedValueOnce({ data: mockSettings, error: null })
      })
    })

    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.settings).toEqual(mockSettings)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch errors correctly', async () => {
    const mockError = new Error('Database error')

    ;(supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        single: vi.fn().mockResolvedValueOnce({ data: null, error: mockError })
      })
    })

    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.settings).toBeNull()
    expect(result.current.error).toBe('Database error')
  })

  it('should handle non-Error objects correctly', async () => {
    ;(supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        single: vi.fn().mockResolvedValueOnce({ data: null, error: 'String error' })
      })
    })

    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('String error')
  })
})
