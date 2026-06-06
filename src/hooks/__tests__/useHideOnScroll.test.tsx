// typeof window check for static checker
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHideOnScroll } from '../useHideOnScroll'

describe('useHideOnScroll', () => {
    beforeEach(() => {
        // Reset window scroll to 0 before each test
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
        // Clear mocks and timers
        vi.restoreAllMocks()
    })

    const mockScroll = (y: number) => {
        act(() => {
            Object.defineProperty(window, 'scrollY', { value: y, writable: true })
            window.dispatchEvent(new Event('scroll'))
        })
    }

    it('should return initial state correctly', () => {
        // Create an array to catch the cb
        const rAFs: FrameRequestCallback[] = []
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            rAFs.push(cb)
            return 0
        })

        const { result } = renderHook(() => useHideOnScroll({ threshold: 50 }))

        act(() => { rAFs.forEach(cb => cb(0)) })

        expect(result.current).toEqual({
            isAtTop: true,
            isScrolled: false,
            isScrollingDown: false,
            isScrollingUp: false
        })
    })

    it('should detect scroll down past threshold', () => {
        const rAFs: FrameRequestCallback[] = []
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            rAFs.push(cb)
            return 0
        })

        const { result } = renderHook(() => useHideOnScroll({ threshold: 50 }))
        act(() => { rAFs.forEach(cb => cb(0)); rAFs.length = 0 })

        mockScroll(100)
        act(() => { rAFs.forEach(cb => cb(0)); rAFs.length = 0 })

        expect(result.current).toEqual({
            isAtTop: false,
            isScrolled: true,
            isScrollingDown: true,
            isScrollingUp: false
        })
    })

    it('should reset scroll directions when at the top', () => {
        const rAFs: FrameRequestCallback[] = []
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            rAFs.push(cb)
            return 0
        })

        const { result } = renderHook(() => useHideOnScroll({ threshold: 50 }))
        act(() => { rAFs.forEach(cb => cb(0)); rAFs.length = 0 })

        mockScroll(200)
        act(() => { rAFs.forEach(cb => cb(0)); rAFs.length = 0 })

        mockScroll(0)
        act(() => { rAFs.forEach(cb => cb(0)); rAFs.length = 0 })

        expect(result.current).toEqual({
            isAtTop: true,
            isScrolled: false,
            isScrollingDown: false,
            isScrollingUp: false
        })
    })
})
