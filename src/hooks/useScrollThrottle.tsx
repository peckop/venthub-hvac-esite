import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Scroll event'lerini throttle ederek performance optimize eden hook
 * @param threshold - Sticky header'ın aktif olacağı scroll mesafesi (px)
 * @param throttleMs - Throttle süresi (ms) - varsayılan 16ms (60fps)
 */
export const useScrollThrottle = (threshold: number = 100, throttleMs: number = 16) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const tickingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleScroll = useCallback(() => {
    if (tickingRef.current) return

    // Throttling için RAF kullan
    tickingRef.current = true
    
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY
      const shouldShowSticky = scrollTop > threshold
      
      if (isScrolled !== shouldShowSticky) {
        setIsScrolled(shouldShowSticky)
      }
      
      tickingRef.current = false
    })
  }, [threshold, isScrolled])

  const throttledScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(handleScroll, throttleMs)
  }, [handleScroll, throttleMs])

  useEffect(() => {
    // Initial scroll pozisyonunu kontrol et
    const initialScrollTop = window.scrollY
    setIsScrolled(initialScrollTop > threshold)

    // Scroll event listener ekle
    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [threshold, throttledScroll])

  return isScrolled
}
