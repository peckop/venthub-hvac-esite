// Lightweight analytics utility. Safe to import anywhere.
// Attempts GA4 (gtag), then GTM (dataLayer), otherwise no-op with console debug.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    DEBUG_ANALYTICS?: boolean
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    if (typeof window === 'undefined') return
    let delivered = false
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params)
      delivered = true
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...params })
      delivered = true
    }
    // Fallback / debug log (visible when in dev OR when explicitly enabled)
    if (!delivered && (process.env.NODE_ENV !== 'production' || window.DEBUG_ANALYTICS)) {
      console.warn('[analytics]', name, params)
    }
    // Optional: when DEBUG_ANALYTICS is enabled, always mirror to console
    if (window.DEBUG_ANALYTICS) {
      console.warn('[analytics->mirror]', name, params)
    }
} catch {
    // swallow
  }
}

