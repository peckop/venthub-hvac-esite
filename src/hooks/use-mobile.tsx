import * as React from "react"

export const MOBILE_BREAKPOINT = 768

/**
 * Custom hook to detect if the current viewport is mobile-sized.
 * It uses `window.matchMedia` to check if the window width is below `MOBILE_BREAKPOINT`.
 * Automatically updates state when the window is resized.
 *
 * @returns {boolean} True if the viewport is below 768px, false otherwise.
 *
 * @example
 * const isMobile = useIsMobile()
 * if (isMobile) return <MobileMenu />
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}



