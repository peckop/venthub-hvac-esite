import { supabase } from './supabase'

export function installErrorReporter(_endpoint: string, options?: { sample?: number; release?: string; env?: string }) {
  const sample = typeof options?.sample === 'number' ? Math.max(0, Math.min(1, options.sample)) : 0.2
  const release = options?.release || 'dev'
  const env = options?.env || 'development'

  // simple dedup over a short time window
  const cache = new Map<string, number>()
  const TTL = 15_000 // 15s

  function shouldSend(key: string) {
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
      if (Math.random() > sample) return
      const key = JSON.stringify([payload.msg, payload.url, payload.stack]).slice(0, 256)
      if (!shouldSend(key)) return
      // Use Supabase client to include Authorization/apikey headers automatically
      await supabase.functions.invoke('log-client-error', { body: payload })
    } catch {
      // swallow
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

