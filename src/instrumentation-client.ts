import * as Sentry from '@sentry/nextjs'

/**
 * İstemci Sentry başlatması (ALT-46). `sentry.client.config.ts` yerine geçer: 11 sürümü o dosyayı
 * kullanımdan kaldırılmış sayıyor (Turbopack'te çalışmaz). Davranış aynı: DSN yoksa ya da
 * yer tutucuysa başlatma.
 *
 * Replay: `replaysSessionSampleRate` / `replaysOnErrorSampleRate` kaldırıldı. `replayIntegration()`
 * hiç eklenmediği için bu oranlar etkisizdi (kod okuması, 27 Ekim); replay açılması ayrı bir
 * Recep kararıdır, bu işe girmez.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const isProd = process.env.NODE_ENV === 'production'

if (dsn && !dsn.includes('placeholder')) {
  Sentry.init({
    dsn,
    tracesSampleRate: isProd ? 0.05 : 0,
    debug: false,
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
