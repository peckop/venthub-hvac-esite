import React, { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
    threshold?: number
    rootMargin?: string
    triggerOnce?: boolean
}

/**
 * Custom hook for scroll-triggered animations using IntersectionObserver
 * Returns a ref to attach to the element and visibility state
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
    options: UseScrollAnimationOptions = {}
): [React.RefObject<T | null>, boolean] {
    const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options
    const ref = useRef<T>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (triggerOnce) {
                        observer.unobserve(element)
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false)
                }
            },
            { threshold, rootMargin }
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [threshold, rootMargin, triggerOnce])

    return [ref, isVisible]
}

/**
 * CSS classes for common scroll animations
 */
export const scrollAnimationClasses = {
    fadeUp: (isVisible: boolean) =>
        `transition-all duration-700 ease-out ${isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`,
    fadeIn: (isVisible: boolean) =>
        `transition-opacity duration-700 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'
        }`,
    scaleIn: (isVisible: boolean) =>
        `transition-all duration-500 ease-out ${isVisible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`,
    slideLeft: (isVisible: boolean) =>
        `transition-all duration-700 ease-out ${isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-8'
        }`,
    slideRight: (isVisible: boolean) =>
        `transition-all duration-700 ease-out ${isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-8'
        }`,
    staggerChild: (index: number) => ({
        transitionDelay: `${index * 100}ms`
    })
}

export default useScrollAnimation



