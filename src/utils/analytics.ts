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
