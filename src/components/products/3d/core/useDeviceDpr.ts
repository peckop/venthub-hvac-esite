'use client'

import { useMemo } from 'react'

export interface DprCap {
  desktop: number
  mobile: number
}

const DEFAULT_CAP: DprCap = { desktop: 1.0, mobile: 1.5 }

/**
 * B4 — DPR cap: masaüstü 1.0 · mobil 1.5. Ham `dpr={[1,2]}` YASAK (mobilde fazla).
 * Drop'ta drei <AdaptiveDpr>/<PerformanceMonitor> ayrıca DPR'yi düşürür (kabuk içinde).
 */
export function useDeviceDpr(cap?: Partial<DprCap>): number {
  const desktop = cap?.desktop ?? DEFAULT_CAP.desktop
  const mobile = cap?.mobile ?? DEFAULT_CAP.mobile
  return useMemo(() => {
    if (typeof window === 'undefined') return 1
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    const limit = coarse ? mobile : desktop
    const device = window.devicePixelRatio || 1
    return Math.min(device, limit)
  }, [desktop, mobile])
}
