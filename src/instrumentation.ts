import * as Sentry from '@sentry/nextjs'

/**
 * Sunucu ve edge Sentry başlatması (ALT-46, @sentry/nextjs 11).
 *
 * NİÇİN: `register()` olmadan `sentry.server.config.ts` / `sentry.edge.config.ts` hiçbir yerden
 * çağrılmıyordu (27 Ekim ölçümü: depoda bu dosyaları içe alan satır yok). `onRequestError`
 * sunucu tarafı istek hatalarını (RSC, route handler) Sentry'ye iletir.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
