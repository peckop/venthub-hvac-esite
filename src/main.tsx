import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWrapper from './AppWrapper.tsx'
import { installErrorReporter } from './lib/errorReporter'

// Add critical resource preloads
const criticalPreloads = [
  // Preload critical fonts if they were local
  // { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }
]

criticalPreloads.forEach(({ href, as, type, crossOrigin }) => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  if (crossOrigin) link.crossOrigin = crossOrigin
  document.head.appendChild(link)
})

// Sentry init (yalnızca DSN varsa) ve Supabase origin için preconnect
try {
  const viteEnv = ((import.meta as unknown) as { env?: Record<string, string> }).env || ({} as Record<string, string>)
  const supaUrl = viteEnv.VITE_SUPABASE_URL
  if (supaUrl) {
    // 1) Runtime preconnect/dns-prefetch (env'e göre)
    try {
      const origin = new URL(supaUrl).origin
      const link1 = document.createElement('link')
      link1.rel = 'preconnect'
      link1.href = origin
      link1.crossOrigin = 'anonymous'
      document.head.appendChild(link1)
      const link2 = document.createElement('link')
      link2.rel = 'dns-prefetch'
      link2.href = origin
      document.head.appendChild(link2)
    } catch {}

    // 2) Lightweight error reporter to Supabase Edge Function
    const isLocal = /localhost|127\.0\.0\.1/.test(supaUrl)
    const endpoint = isLocal
      ? `${supaUrl}/functions/v1/log-client-error`
      : `${supaUrl.replace('.supabase.co', '.functions.supabase.co')}/log-client-error`
    const release = (window as unknown as { __COMMIT_SHA__?: string }).__COMMIT_SHA__ || 'dev'
    const isProd = viteEnv.MODE === 'production'
    const sample = isProd ? 0.1 : 1.0
    const ttlMs = isProd ? 60_000 : 0
    installErrorReporter(endpoint, { sample, release, env: viteEnv.MODE, ttlMs })
  }
} catch {}

// Optional: automatic test error trigger behind a flag (disabled in production; only active on localhost)
try {
  const envMode = ((import.meta as unknown) as { env?: Record<string, string> }).env?.MODE || 'production'
  const isProd = envMode === 'production'
  const host = location.hostname
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1'

  if (!isProd && isLocal) {
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
      // 2) Also call the Edge Function directly to guarantee a row (lazy import Supabase)
      setTimeout(async () => {
        try {
          const { supabase } = await import('./lib/supabase')
          await supabase.functions.invoke('log-client-error', {
            body: {
              msg: 'VH SELF-TEST ' + new Date().toISOString(),
              stack: 'auto-test',
              url: location.href,
              ua: navigator.userAgent,
              level: 'error',
              env: envMode || 'development',
              release: (window as unknown as { __COMMIT_SHA__?: string }).__COMMIT_SHA__ || 'dev'
            }
          })
        } catch {}
      }, 600)
    }
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
