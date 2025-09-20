import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Scroll event'lerini throttle ederek optimize eden hook.
 * Histerezis (showAt/hideBelow) ve ilk gösterim için kısa gecikme destekler.
 * 
 * Kullanım:
 * - useScrollThrottle(100, 16) → eski uyumlu; showAt=100, hideBelow=60
 * - useScrollThrottle({ showAt: 120, hideBelow: 80, throttleMs: 16, initialDelayMs: 180 })
 */
export type ScrollThrottleOptions = {
  showAt?: number
  hideBelow?: number
  throttleMs?: number
  initialDelayMs?: number
}

export const useScrollThrottle = (
  thresholdOrOptions: number | ScrollThrottleOptions = 100,
  throttleMsParam: number = 16
) => {
  const showAt = typeof thresholdOrOptions === 'number'
    ? thresholdOrOptions
    : (thresholdOrOptions.showAt ?? 100)

  const hideBelow = typeof thresholdOrOptions === 'number'
    ? Math.max(0, thresholdOrOptions - 40)
    : (thresholdOrOptions.hideBelow ?? Math.max(0, (thresholdOrOptions.showAt ?? 100) - 40))

  const throttleMs = typeof thresholdOrOptions === 'number'
    ? throttleMsParam
    : (thresholdOrOptions.throttleMs ?? throttleMsParam)

  const initialDelayMs = typeof thresholdOrOptions === 'number'
    ? 180
    : (thresholdOrOptions.initialDelayMs ?? 180)

  const [isScrolled, setIsScrolled] = useState(false)
  const tickingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleScroll = useCallback(() => {
    if (tickingRef.current) return

    tickingRef.current = true
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY

      if (isScrolled) {
        // Gizleme eşik altına inince kapat (histerezis)
        if (scrollTop < hideBelow) {
          setIsScrolled(false)
        }
      } else {
        // Gösterme eşiğini aşınca aç
        if (scrollTop > showAt) {
          setIsScrolled(true)
        }
      }

      tickingRef.current = false
    })
  }, [isScrolled, showAt, hideBelow])

  const throttledScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(handleScroll, throttleMs)
  }, [handleScroll, throttleMs])

  useEffect(() => {
    // İlk yüklemede minik bir gecikmeden sonra görünürlüğü değerlendir (ilk flicker'ı önler)
    const initialScrollTop = window.scrollY

    if (initialTimerRef.current) {
      clearTimeout(initialTimerRef.current)
      initialTimerRef.current = null
    }

    if (initialScrollTop > showAt) {
      if (initialDelayMs > 0) {
        initialTimerRef.current = setTimeout(() => {
          if (window.scrollY > showAt) {
            setIsScrolled(true)
          }
        }, initialDelayMs)
      } else {
        setIsScrolled(true)
      }
    } else {
      setIsScrolled(false)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current)
    }
  }, [showAt, initialDelayMs, throttledScroll])

  return isScrolled
}
