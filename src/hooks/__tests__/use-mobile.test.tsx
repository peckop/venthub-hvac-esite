import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useIsMobile, MOBILE_BREAKPOINT } from '../use-mobile'

describe('useIsMobile hook', () => {
  let matchMediaListeners: Array<(e: MediaQueryListEvent) => void> = []

  beforeEach(() => {
    matchMediaListeners = []

    // Mock window.matchMedia
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query) => {
          const isMobileQuery = query.includes(`${MOBILE_BREAKPOINT - 1}px`)
          return {
            get matches() { return isMobileQuery ? window.innerWidth < MOBILE_BREAKPOINT : false },
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn((event, callback) => {
              if (event === 'change') {
                matchMediaListeners.push(callback)
              }
            }),
            removeEventListener: vi.fn((event, callback) => {
              if (event === 'change') {
                matchMediaListeners = matchMediaListeners.filter(cb => cb !== callback)
              }
            }),
            dispatchEvent: vi.fn(),
          }
        }),
      })
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when window innerWidth is below mobile breakpoint', () => {
    // Set initial window width
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })
    }

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('returns false when window innerWidth is above mobile breakpoint', () => {
    // Set initial window width
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
    }

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('updates state when window is resized', () => {
    // Start as desktop
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
    }

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Change to mobile
    act(() => {
      if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })
      }
      // Trigger all registered media query change listeners
      const event = { matches: true, media: '(max-width: 767px)' } as MediaQueryListEvent
      matchMediaListeners.forEach(listener => listener(event))
    })

    expect(result.current).toBe(true)
  })
})
