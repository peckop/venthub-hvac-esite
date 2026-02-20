import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Custom hook to automatically scroll to element based on URL hash
 * 
 * Usage:
 * ```tsx
 * function MyPage() {
 *   useScrollToHash([dependency1, dependency2]) // Re-run when dependencies change
 *   return <div id="section1">...</div>
 * }
 * ```
 * 
 * Navigate to: `/my-page#section1` → automatically scrolls to element with id="section1"
 * 
 * @param deps - Optional dependencies to re-trigger scroll (e.g., when content changes)
 */
export function useScrollToHash(deps: unknown[] = []) {
    const pathname = usePathname()

    useEffect(() => {
        const hash = location.hash.slice(1) // Remove # prefix
        if (!hash) return

        // Robust polling mechanism for React Router Link navigation
        // Element might not be in DOM yet when this effect runs
        let attempts = 0
        const maxAttempts = 20 // 20 attempts * 100ms = 2 seconds max

        const pollForElement = () => {
            const element = document.getElementById(hash)

            if (element) {
                // Element found - scroll to it
                requestAnimationFrame(() => {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    })
                })
                return true
            }

            attempts++
            if (attempts < maxAttempts) {
                // Keep trying
                setTimeout(pollForElement, 100)
            }
            return false
        }

        // Start polling
        pollForElement()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.hash, ...deps])
}

