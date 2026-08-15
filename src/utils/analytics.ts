// Lightweight analytics utility. Safe to import anywhere.
// Attempts GA4 (gtag), then GTM (dataLayer), otherwise no-op with console debug.
//
// RIZA KAPISI (T020-VH): `trackEvent` analitik rızası YOKSA hiçbir şey göndermez.
// Öncesinde rızaya hiç bakılmıyordu; sistemin sessiz olmasının tek sebebi GA kimliğinin
// yokluğuydu. Bu kapı olmadan `NEXT_PUBLIC_GA_ID` konulduğu an "Reddet" demiş kullanıcıdan
// da olay akardı. Kapı burada, çağrı yerlerinde DEĞİL — 3 çağrı yeri var ve dördüncüsünü
// ekleyen kişinin rızayı hatırlaması gerekmesin (hatırlamaya bağlı adım çürür).

import { hasConsent } from '@/lib/consent'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    DEBUG_ANALYTICS?: boolean
  }
}

/**
 * Safely tracks an analytics event by delegating to GA4 (`gtag`) or GTM (`dataLayer`).
 * If neither is available, it gracefully falls back to a no-op or logs to the console in development/debug modes.
 *
 * @param name - The name of the event to track (e.g., 'add_to_cart')
 * @param params - Additional parameters/metadata for the event (defaults to an empty object)
 * @returns void
 *
 * @example
 * trackEvent('checkout_started', { currency: 'TRY', value: 1500 })
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    if (typeof window === 'undefined') return

    // Analitik rızası yoksa HİÇBİR ŞEY gönderme. Karar verilmemiş kullanıcı da
    // "rıza vermemiş" sayılır (opt-in) — sessiz kabul yok.
    if (!hasConsent('analytics')) {
      if (window.DEBUG_ANALYTICS) {
        console.warn('[analytics:blocked-no-consent]', name)
      }
      return
    }

    let delivered = false

    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params)
      delivered = true
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...params })
      delivered = true
    }
    
    // Only log if explicit debug is enabled, otherwise stay silent to keep console clean
    if (window.DEBUG_ANALYTICS) {
      console.warn('[analytics]', name, params)
    }
    
    // In dev environment without GA/GTM, we might want to know if events are firing
    if (!delivered && process.env.NODE_ENV === 'development' && window.DEBUG_ANALYTICS) {
      console.warn('[analytics:dev-fallback]', name, params)
    }
  } catch {
    // swallow analytics errors to prevent app crashes
  }
}
