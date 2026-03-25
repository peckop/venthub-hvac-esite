export function installErrorReporter(_endpoint: string, options?: { sample?: number; release?: string; env?: string; ttlMs?: number }) {
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
  const force = (() => {
    try {
      const isProd = options?.env === 'production'
      if (isProd) return false // Never allow force in production
      // Force switch for local tests
      if (typeof window === 'undefined') return false
      const w = window as { __ERROR_LOG_FORCE__?: boolean } & typeof globalThis
      if (w.__ERROR_LOG_FORCE__ === true) return true
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('errorlog:force') === '1'
      }
      return false
    } catch { return false }
  })()

  const baseSample = typeof options?.sample === 'number' ? clamp01(options.sample) : 0.2
  const sample = force ? 1 : baseSample
  const release = options?.release || 'dev'
  const env = options?.env || 'development'

  // simple dedup over a short time window
  const cache = new Map<string, number>()
  const baseTTL = typeof options?.ttlMs === 'number' ? Math.max(0, options.ttlMs) : 15_000
  const TTL = force ? 0 : baseTTL // Disable dedup when forced

  function shouldSend(key: string) {
    if (TTL <= 0) return true
    const now = Date.now()
    const ts = cache.get(key) || 0
    // prune
    cache.forEach((t, k) => {
      if (now - t > TTL) cache.delete(k)
    })
    if (now - ts < TTL) return false
    cache.set(key, now)
    return true
  }

  async function post(payload: Record<string, unknown>) {
    try {
      if (!force && Math.random() > sample) return
      const key = JSON.stringify([payload.msg, payload.url, payload.stack]).slice(0, 256)
      if (!shouldSend(key)) return

      const body = JSON.stringify(payload)
      // First try: sendBeacon (non-blocking, avoids JS imports)
      try {
        if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
          const nav = navigator as { sendBeacon?: (url: string, data?: BodyInit) => boolean }
          if (nav.sendBeacon && nav.sendBeacon(_endpoint, new Blob([body], { type: 'application/json' }))) {
            return
          }
        }
      } catch { }

      // Fallback: fetch (no supabase-js import)
      try {
        await fetch(_endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true })
      } catch (err) {
        console.warn('[errorReporter] fetch failed:', err)
      }
    } catch (e) {
      console.warn('[errorReporter] post failed:', e)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('error', (e) => {
      const err = (e as ErrorEvent)
      post({ t: Date.now(), type: 'error', msg: String(err.error?.message || err.message || 'Unknown'), stack: String(err.error?.stack || ''), url: location.href, ua: navigator.userAgent, release, env })
    })

    window.addEventListener('unhandledrejection', (e) => {
      const reason = (e as PromiseRejectionEvent).reason
      post({ t: Date.now(), type: 'unhandledrejection', msg: String(reason?.message || reason || 'Unknown'), stack: String(reason?.stack || ''), url: location.href, ua: navigator.userAgent, release, env })
    })
  }
}




