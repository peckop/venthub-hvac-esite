import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollToHash } from '../useScrollToHash'

describe('useScrollToHash', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn> & ((arg?: boolean | ScrollIntoViewOptions) => void)

  beforeEach(() => {
    vi.useFakeTimers()
    scrollIntoViewMock = vi.fn() as unknown as ReturnType<typeof vi.fn> & ((arg?: boolean | ScrollIntoViewOptions) => void)

    // Mock requestAnimationFrame to execute synchronously
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })

    // Create an element to find
    const el = document.createElement('div')
    el.id = 'section1'
    el.scrollIntoView = scrollIntoViewMock
    document.body.appendChild(el)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    document.body.innerHTML = ''
    window.location.hash = ''
  })

  it('should not do anything if hash is empty', () => {
    window.location.hash = ''
    renderHook(() => useScrollToHash())

    vi.advanceTimersByTime(2000)
    expect(scrollIntoViewMock).not.toHaveBeenCalled()
  })

  it('should scroll to element if hash matches an existing element id', () => {
    window.location.hash = '#section1'
    renderHook(() => useScrollToHash())

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('should poll if element is not initially in DOM', () => {
    // Remove the element temporarily
    document.body.innerHTML = ''
    window.location.hash = '#section1'

    renderHook(() => useScrollToHash())

    // Initial check fails
    expect(scrollIntoViewMock).not.toHaveBeenCalled()

    // Advance 100ms - still not there
    vi.advanceTimersByTime(100)
    expect(scrollIntoViewMock).not.toHaveBeenCalled()

    // Add element to DOM
    const el = document.createElement('div')
    el.id = 'section1'
    el.scrollIntoView = scrollIntoViewMock
    document.body.appendChild(el)

    // Advance another 100ms - should find it now
    vi.advanceTimersByTime(100)
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('should stop polling after max attempts', () => {
    document.body.innerHTML = '' // Element not in DOM
    window.location.hash = '#missing-element'

    renderHook(() => useScrollToHash())

    // Advance time past max attempts (20 * 100ms)
    vi.advanceTimersByTime(2500)

    // Add element after polling stopped
    const el = document.createElement('div')
    el.id = 'missing-element'
    el.scrollIntoView = scrollIntoViewMock
    document.body.appendChild(el)

    // Advance time again - should not trigger scroll
    vi.advanceTimersByTime(500)
    expect(scrollIntoViewMock).not.toHaveBeenCalled()
  })
})
