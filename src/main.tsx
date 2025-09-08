import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWrapper from './AppWrapper.tsx'
import * as Sentry from '@sentry/react'
import { installErrorReporter } from './lib/errorReporter'

// Sentry init (yalnızca DSN varsa)
try {
  const viteEnv = ((import.meta as unknown) as { env?: Record<string, string> }).env || ({} as Record<string, string>)
  const DSN = viteEnv.VITE_SENTRY_DSN
  if (DSN) {
    Sentry.init({
      dsn: DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
      ],
      tracesSampleRate: 0.2,
      environment: viteEnv.MODE,
      release: (window as unknown as { __COMMIT_SHA__?: string }).__COMMIT_SHA__,
    })
  }
  // Install lightweight error reporter to Supabase Edge Function
  const supaUrl = viteEnv.VITE_SUPABASE_URL
  if (supaUrl) {
    const endpoint = `${supaUrl}/functions/v1/log-client-error`
    const release = (window as unknown as { __COMMIT_SHA__?: string }).__COMMIT_SHA__ || 'dev'
    installErrorReporter(endpoint, { sample: 0.2, release, env: viteEnv.MODE })
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
