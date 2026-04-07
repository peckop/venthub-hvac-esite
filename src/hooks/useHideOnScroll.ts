import { useState, useEffect, useRef } from 'react'

interface UseHideOnScrollOptions {
    threshold?: number
}

interface HideOnScrollState {
    isScrolled: boolean
    isScrollingDown: boolean
    isScrollingUp: boolean
    isAtTop: boolean
}

export function useHideOnScroll({ threshold = 50 }: UseHideOnScrollOptions = {}): HideOnScrollState {
    const [state, setState] = useState<HideOnScrollState>({
        isScrolled: false,
        isScrollingDown: false,
        isScrollingUp: false,
        isAtTop: true,
    })

    const lastScrollY = useRef(0)
    const ticking = useRef(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const updateScrollDir = () => {
            const scrollY = window.scrollY

            // Capture last scroll synchronously
            const currentLastScrollY = lastScrollY.current

            setState((prevState) => {
                const isAtTop = scrollY < threshold
                const isScrolled = scrollY > 0
                let isScrollingDown = prevState.isScrollingDown
                let isScrollingUp = prevState.isScrollingUp

                if (Math.abs(scrollY - currentLastScrollY) > 5) {
                    if (scrollY > currentLastScrollY && scrollY > threshold) {
                        isScrollingDown = true
                        isScrollingUp = false
                    } else if (scrollY < currentLastScrollY) {
                        isScrollingDown = false
                        isScrollingUp = true
                    }
                }

                // If at top, reset scroll directions to show everything normally
                if (isAtTop) {
                    isScrollingDown = false
                    isScrollingUp = false
                }

                if (
                    prevState.isAtTop === isAtTop &&
                    prevState.isScrolled === isScrolled &&
                    prevState.isScrollingDown === isScrollingDown &&
                    prevState.isScrollingUp === isScrollingUp
                ) {
                    return prevState
                }

                return {
                    isAtTop,
                    isScrolled,
                    isScrollingDown,
                    isScrollingUp,
                }
            })

            lastScrollY.current = scrollY > 0 ? scrollY : 0
            ticking.current = false
        }

        const onScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(updateScrollDir)
                ticking.current = true
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        // Initial check
        updateScrollDir()

        return () => window.removeEventListener('scroll', onScroll)
    }, [threshold])

    return state
}
