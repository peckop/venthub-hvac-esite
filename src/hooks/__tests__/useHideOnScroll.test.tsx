import { renderHook, act } from '@testing-library/react';
import { useHideOnScroll } from '../useHideOnScroll';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useHideOnScroll', () => {


    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
            setTimeout(() => cb(performance.now()), 16);
            return 0;
        });

        // Set initial scroll to 0
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    const fireScroll = async (scrollY: number) => {
        await act(async () => {
            window.scrollY = scrollY;
            window.dispatchEvent(new Event('scroll'));
            vi.advanceTimersByTime(20);
        });
    };

    it('should return the correct initial state', () => {
        const { result } = renderHook(() => useHideOnScroll());

        expect(result.current).toEqual({
            isScrolled: false,
            isScrollingDown: false,
            isScrollingUp: false,
            isAtTop: true,
        });
    });

    it('should update state when scrolling down past the threshold', async () => {
        const { result } = renderHook(() => useHideOnScroll());

        await fireScroll(100);

        expect(result.current.isScrolled).toBe(true);
        expect(result.current.isAtTop).toBe(false);
        expect(result.current.isScrollingDown).toBe(true);
        expect(result.current.isScrollingUp).toBe(false);
    });

    it('should update state when scrolling up', async () => {
        const { result } = renderHook(() => useHideOnScroll());

        await fireScroll(100);
        expect(result.current.isScrollingDown).toBe(true);

        await fireScroll(70);
        expect(result.current.isScrolled).toBe(true);
        expect(result.current.isAtTop).toBe(false);
        expect(result.current.isScrollingDown).toBe(false);
        expect(result.current.isScrollingUp).toBe(true);
    });

    it('should reset scroll directions when scrolled back to the very top', async () => {
        const { result } = renderHook(() => useHideOnScroll());

        await fireScroll(100);

        await fireScroll(0);

        expect(result.current.isScrolled).toBe(false);
        expect(result.current.isAtTop).toBe(true);
        expect(result.current.isScrollingDown).toBe(false);
        expect(result.current.isScrollingUp).toBe(false);
    });

    it('should respect a custom threshold', async () => {
        const { result } = renderHook(() => useHideOnScroll({ threshold: 200 }));

        await fireScroll(150);

        expect(result.current.isAtTop).toBe(true);
        expect(result.current.isScrollingDown).toBe(false);

        await fireScroll(250);

        expect(result.current.isAtTop).toBe(false);
        expect(result.current.isScrollingDown).toBe(true);
    });

    it('should not update direction if scroll difference is less than 5px', async () => {
        const { result } = renderHook(() => useHideOnScroll());

        await fireScroll(100);
        expect(result.current.isScrollingDown).toBe(true);

        await fireScroll(96);
        expect(result.current.isScrollingUp).toBe(false);
        expect(result.current.isScrollingDown).toBe(true);

        await fireScroll(80);
        expect(result.current.isScrollingUp).toBe(true);
        expect(result.current.isScrollingDown).toBe(false);
    });
});
