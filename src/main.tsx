import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWrapper from './AppWrapper.tsx'
import { installErrorReporter } from './lib/errorReporter'
import { supabase } from './lib/supabase'

// Sentry init (yalnızca DSN varsa)
try {
  const viteEnv = ((import.meta as unknown) as { env?: Record<string, string> }).env || ({} as Record<string, string>)
  // Install lightweight error reporter to Supabase Edge Function
  const supaUrl = viteEnv.VITE_SUPABASE_URL
  if (supaUrl) {
    const isLocal = /localhost|127\.0\.0\.1/.test(supaUrl)
    const endpoint = isLocal
      ? `${supaUrl}/functions/v1/log-client-error`
      : `${supaUrl.replace('.supabase.co', '.functions.supabase.co')}/log-client-error`
    const release = (window as unknown as { __COMMIT_SHA__?: string }).__COMMIT_SHA__ || 'dev'
    const devSample = (viteEnv.MODE === 'production' ? 0.2 : 1.0)
    installErrorReporter(endpoint, { sample: devSample, release, env: viteEnv.MODE, ttlMs: viteEnv.MODE === 'production' ? 15_000 : 0 })
  }
} catch {}

// Optional: automatic test error trigger behind a flag
try {
  const params = new URLSearchParams(location.search)
  const hash = String(location.hash || '')
  const trigger = params.get('vh_error_test') === '1' || /vh_error_test=1/.test(hash) || localStorage.getItem('errorlog:test') === '1'
  if (trigger) {
    try {
      // Force error reporting for a short window (bypass sample/dedup)
      localStorage.setItem('errorlog:force', '1')
      setTimeout(() => { try { localStorage.removeItem('errorlog:force') } catch {} }, 30000)
    } catch {}
    // 1) Throw a real error so window.onerror path is tested
    setTimeout(() => {
      throw new Error('VH TEST ' + new Date().toISOString())
    }, 300)
    // 2) Also call the Edge Function directly to guarantee a row
    setTimeout(async () => {
      try {
        await supabase.functions.invoke('log-client-error', {
          body: {
            msg: 'VH SELF-TEST ' + new Date().toISOString(),
            stack: 'auto-test',
            url: location.href,
            ua: navigator.userAgent,
            level: 'error',
            env: (import.meta as unknown as { env?: Record<string,string> }).env?.MODE || 'production',
            release: (window as unknown as { __COMMIT_SHA__?: string }).__COMMIT_SHA__ || 'prod'
          }
        })
      } catch {}
    }, 600)
  }
} catch {}

// Sayfa yenilemelerinde tarayıcının otomatik scroll restorasyonunu kapat
// Böylece yenilemede her zaman sayfa başına çıkılır
if ('scrollRestoration' in window.history) {
  try {
    window.history.scrollRestoration = 'manual'
  } catch {}
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)
