import { supabase } from './supabase'

export function installErrorReporter(_endpoint: string, options?: { sample?: number; release?: string; env?: string; ttlMs?: number }) {
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
  const force = (() => {
    try {
      const isProd = options?.env === 'production'
      if (isProd) return false // Never allow force in production
      // Force switch for local tests: window.__ERROR_LOG_FORCE__ = true or localStorage.setItem('errorlog:force','1')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = (window as any)
      if (w && w.__ERROR_LOG_FORCE__ === true) return true
      return localStorage.getItem('errorlog:force') === '1'
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
    for (const [k, t] of cache.entries()) {
      if (now - t > TTL) cache.delete(k)
    }
    if (now - ts < TTL) return false
    cache.set(key, now)
    return true
  }

  async function post(payload: Record<string, unknown>) {
    try {
      if (!force && Math.random() > sample) return
      const key = JSON.stringify([payload.msg, payload.url, payload.stack]).slice(0, 256)
      if (!shouldSend(key)) return
      // Use Supabase client to include Authorization/apikey headers automatically
      const { error } = await supabase.functions.invoke('log-client-error', { body: payload })
      if (error) {
        // Best-effort: surface in console for quick diagnosis during tests
        // eslint-disable-next-line no-console
        console.debug('[errorReporter] invoke error:', error)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug('[errorReporter] post failed:', e)
    }
  }

  window.addEventListener('error', (e) => {
    const err = (e as ErrorEvent)
    post({ t: Date.now(), type: 'error', msg: String(err.error?.message || err.message || 'Unknown'), stack: String(err.error?.stack || ''), url: location.href, ua: navigator.userAgent, release, env })
  })

  window.addEventListener('unhandledrejection', (e) => {
    const reason = (e as PromiseRejectionEvent).reason
    post({ t: Date.now(), type: 'unhandledrejection', msg: String(reason?.message || reason || 'Unknown'), stack: String(reason?.stack || ''), url: location.href, ua: navigator.userAgent, release, env })
  })
}

