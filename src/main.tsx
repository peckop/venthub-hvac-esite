import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// CRITICAL: Fail-safe check for missing environment variables
// This prevents "White Screen of Death" by showing a clear config error
if ((window as unknown as { __SUPABASE_CONFIG_ERROR__?: boolean }).__SUPABASE_CONFIG_ERROR__) {
  document.body.innerHTML = `
    <div style="background:#fee2e2; color:#991b1b; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding:2rem;">
      <h1 style="font-size:2rem; margin-bottom:1rem;">⚠️ Configuration Error</h1>
      <p style="max-width:600px; font-size:1.1rem; line-height:1.6;">
        The application failed to initialize because <strong>Environment Variables</strong> are missing in the build.
      </p>
      <div style="background:white; padding:1.5rem; border-radius:8px; box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1); margin-top:1.5rem; text-align:left;">
        <h3 style="margin-top:0;">Diagnostics:</h3>
        <ul style="margin-bottom:0; padding-left:1.2rem;">
          <li><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Loaded' : '❌ MISSING (undefined)'}</li>
          <li><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ MISSING (undefined)'}</li>
          <li><strong>Mode:</strong> ${process.env.NODE_ENV}</li>
        </ul>
      </div>
      <p style="margin-top:2rem; color:#7f1d1d; font-size:0.9rem;">
        <strong>Fix for Cloudflare Pages:</strong><br>
        Dashboard > Settings > Environment Variables > Add variables exactly as NEXT_PUBLIC_...
      </p>
    </div>
  `
  throw new Error('Halting app execution due to missing config')
}
import './index.css'
// Self-hosted fonts (reduced weights to 400 & 600; latin + latin-ext)
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-ext-400.css'
import '@fontsource/inter/latin-ext-600.css'
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

// Sentry init (yalnızca DSN varsa); Supabase preconnect'i globalden kaldırdık (gerektiğinde kullanılacak)
try {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supaUrl = envUrl
  if (supaUrl) {
    // Lightweight error reporter to Supabase Edge Function
    const isLocal = /localhost|127\.0\.0\.1/.test(supaUrl)
    const endpoint = isLocal
      ? `${supaUrl}/functions/v1/log-client-error`
      : `${supaUrl.replace('.supabase.co', '.functions.supabase.co')}/log-client-error`
    const release = (window as unknown as { __COMMIT_SHA__?: string }).__COMMIT_SHA__ || 'dev'
    const isProd = process.env.NODE_ENV === 'production'
    // Production'da başlangıç ölçüm penceresinde hata raporlamayı tamamen kapat (supabase-js import'unu tetiklememek için)
    const sample = isProd ? 0 : 1.0
    const ttlMs = isProd ? 120_000 : 0
    installErrorReporter(endpoint, { sample, release, env: process.env.NODE_ENV, ttlMs })
  }
} catch { }

// Optional: automatic test error trigger behind a flag (disabled in production; only active on localhost)
try {
  const envMode = process.env.NODE_ENV || 'production'
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
        setTimeout(() => { try { localStorage.removeItem('errorlog:force') } catch { } }, 30000)
      } catch { }
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
        } catch { }
      }, 600)
    }
  }
} catch { }

// Sayfa yenilemelerinde tarayıcının otomatik scroll restorasyonunu kullan (kaldırıldı: manual override)
// if ('scrollRestoration' in window.history) {
//   try {
//     window.history.scrollRestoration = 'manual'
//   } catch {}
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)
