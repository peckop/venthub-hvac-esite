import { useState, useRef, useCallback, useEffect } from 'react'

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
  syncKey?: unknown
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

  const syncKey = typeof thresholdOrOptions === 'number'
    ? undefined
    : thresholdOrOptions.syncKey

  const [isScrolled, setIsScrolled] = useState(false)
  const tickingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasMountedRef = useRef(false)
  const lastAboveRef = useRef(false)
  const lastBelowRef = useRef(true)

  const handleScroll = useCallback(() => {
    if (tickingRef.current) return

    tickingRef.current = true
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY

      // Tepeye dönüldüyse yapışkan başlığı anında gizle (histerezisi aşmak için)
      if (scrollTop <= 1) {
        if (isScrolled) setIsScrolled(false)
        lastAboveRef.current = false
        lastBelowRef.current = true
        tickingRef.current = false
        return
      }

      // iki ardışık örneklemede doğrula
      const nowAbove = scrollTop > showAt
      const nowBelow = scrollTop < hideBelow

      if (isScrolled) {
        // gizlemek için iki kez below gerek
        if (nowBelow && lastBelowRef.current) {
          setIsScrolled(false)
        }
      } else {
        // göstermek için iki kez above gerek
        if (nowAbove && lastAboveRef.current) {
          setIsScrolled(true)
        }
      }

      lastAboveRef.current = nowAbove
      lastBelowRef.current = nowBelow

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
    // İlk yüklemede kısa gecikme, sonraki syncKey değişimlerinde anında senkronizasyon
    const initialScrollTop = window.scrollY

    if (initialTimerRef.current) {
      clearTimeout(initialTimerRef.current)
      initialTimerRef.current = null
    }

    if (!hasMountedRef.current) {
      if (initialScrollTop > showAt) {
        if (initialDelayMs > 0) {
          initialTimerRef.current = setTimeout(() => {
            if (window.scrollY > showAt) setIsScrolled(true)
          }, initialDelayMs)
        } else {
          setIsScrolled(true)
        }
      } else {
        setIsScrolled(false)
      }
      hasMountedRef.current = true
    } else {
      // syncKey değişimlerinde mevcut scroll konumuna göre hemen ayarla
      setIsScrolled(initialScrollTop > showAt)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current)
    }
  }, [showAt, initialDelayMs, throttledScroll, syncKey])

  return isScrolled
}
