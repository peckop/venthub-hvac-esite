import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDragScroll } from '../useDragScroll'

describe('useDragScroll', () => {
  let element: HTMLDivElement

  beforeEach(() => {
    element = document.createElement('div')
    // Mock offsetLeft and scrollLeft since jsdom doesn't implement layout
    Object.defineProperty(element, 'offsetLeft', { value: 0, writable: true })
    Object.defineProperty(element, 'scrollLeft', { value: 0, writable: true })
  })

  it('should return a ref callback', () => {
    const { result } = renderHook(() => useDragScroll())
    expect(typeof result.current).toBe('function')
  })

  it('should apply initial styles when ref is set', () => {
    const { result } = renderHook(() => useDragScroll())

    act(() => {
      result.current(element)
    })

    expect(element.style.cursor).toBe('grab')
    expect(element.style.touchAction).toBe('pan-x')
  })

  it('should change styles on mousedown (button 0)', () => {
    const { result } = renderHook(() => useDragScroll())

    act(() => {
      result.current(element)
    })

    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))
    })

    expect(element.style.cursor).toBe('grabbing')
    expect(element.style.userSelect).toBe('none')
  })

  it('should ignore mousedown if not button 0', () => {
    const { result } = renderHook(() => useDragScroll())

    act(() => {
      result.current(element)
    })

    const initialCursor = element.style.cursor

    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown', { button: 1 })) // middle click
    })

    expect(element.style.cursor).toBe(initialCursor) // should not change to grabbing
  })

  it('should revert styles on mouseup', () => {
    const { result } = renderHook(() => useDragScroll())

    act(() => {
      result.current(element)
    })

    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))
    })

    expect(element.style.cursor).toBe('grabbing')

    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'))
    })

    expect(element.style.cursor).toBe('grab')
    expect(element.style.userSelect).toBe('')
  })

  it('should revert styles on mouseleave', () => {
    const { result } = renderHook(() => useDragScroll())

    act(() => {
      result.current(element)
    })

    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))
    })

    expect(element.style.cursor).toBe('grabbing')

    act(() => {
      element.dispatchEvent(new MouseEvent('mouseleave'))
    })

    expect(element.style.cursor).toBe('grab')
    expect(element.style.userSelect).toBe('')
  })

  it('should prevent default on click if dragged', () => {
    const { result } = renderHook(() => useDragScroll())

    act(() => {
      result.current(element)
    })

    // Start drag. Note: the hook uses e.pageX for calculations and e.pageX for distance.
    // However startClientX is initialized from e.pageX, so we just need pageX.
    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 100 } as MouseEventInit))
    })

    // Move significantly (threshold is 5)
    act(() => {
      element.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 } as MouseEventInit))
    })

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation')

    act(() => {
      element.dispatchEvent(clickEvent)
    })

    expect(preventDefaultSpy).toHaveBeenCalled()
    expect(stopPropagationSpy).toHaveBeenCalled()
  })

  it('should calculate and apply scroll offset correctly', () => {
    const { result } = renderHook(() => useDragScroll())

    act(() => {
      result.current(element)
    })

    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 100 } as MouseEventInit))
    })

    act(() => {
      element.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 } as MouseEventInit)) // dragged left by 50px
    })

    // walk = (x - startX) * 1.5 = (50 - 100) * 1.5 = -50 * 1.5 = -75
    // el.scrollLeft = scrollLeft - walk = 0 - (-75) = 75
    expect(element.scrollLeft).toBe(75)
  })

  it('should remove event listeners on unmount/cleanup', () => {
    const { result } = renderHook(() => useDragScroll())

    const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener')
    const windowRemoveEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    act(() => {
      result.current(element)
    })

    act(() => {
      result.current(null) // trigger cleanup
    })

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), { capture: true })
    expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })
})
