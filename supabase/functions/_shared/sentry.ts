// supabase/functions/_shared/sentry.ts
// Minimal Sentry client for Edge Functions (no external deps)
// Usage: set SENTRY_DSN (e.g., https://PUBLIC_KEY@o123456.ingest.sentry.io/987654) and optionally SENTRY_ENV/SENTRY_RELEASE

export type SentryLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'log';

function parseDsn(dsn: string): { host: string; publicKey: string; projectId: string } | null {
  try {
    // Examples:
    // https://PUBLIC_KEY@o123456.ingest.sentry.io/987654
    // https://PUBLIC_KEY@sentry.io/12345
    const u = new URL(dsn)
    const publicKey = (u.username || '').trim()
    const host = u.host
    const projectId = (u.pathname || '').replace(/^\//, '')
    if (!publicKey || !host || !projectId) return null
    return { host, publicKey, projectId }
  } catch {
    return null
  }
}

async function postStore(dsn: string, body: unknown): Promise<void> {
  const parsed = parseDsn(dsn)
  if (!parsed) return
  const url = `https://${parsed.host}/api/${parsed.projectId}/store/`
  const auth = [
    'Sentry sentry_version=7',
    `sentry_key=${parsed.publicKey}`,
    `sentry_client=venthub-edge/1.0.0`
  ].join(', ')
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': auth,
      },
      body: JSON.stringify(body),
    })
  } catch {
    // swallow
  }
}

export async function sentryCaptureMessage(message: string, level: SentryLevel = 'error', extra?: Record<string, unknown>) {
  const dsn = (globalThis as any).Deno?.env?.get?.('SENTRY_DSN') || ''
  if (!dsn) return
  const event = {
    platform: 'javascript',
    logger: 'edge',
    timestamp: Date.now() / 1000,
    level,
    message,
    extra,
    environment: (globalThis as any).Deno?.env?.get?.('SENTRY_ENV') || undefined,
    release: (globalThis as any).Deno?.env?.get?.('SENTRY_RELEASE') || undefined,
  }
  await postStore(dsn, event)
}

export async function sentryCaptureException(e: unknown, extra?: Record<string, unknown>) {
  const dsn = (globalThis as any).Deno?.env?.get?.('SENTRY_DSN') || ''
  if (!dsn) return
  const isErr = e instanceof Error
  const message = isErr ? (e.message || String(e)) : String(e)
  const stack = isErr ? (e.stack || undefined) : undefined
  const event = {
    platform: 'javascript',
    logger: 'edge',
    timestamp: Date.now() / 1000,
    level: 'error' as const,
    message,
    exception: stack ? { values: [{ type: e && (e as any).name || 'Error', value: message, stacktrace: { frames: [{ function: '<edge>', filename: '<edge>', lineno: 0, colno: 0 }] } }] } : undefined,
    extra,
    environment: (globalThis as any).Deno?.env?.get?.('SENTRY_ENV') || undefined,
    release: (globalThis as any).Deno?.env?.get?.('SENTRY_RELEASE') || undefined,
  }
  await postStore(dsn, event)
}
