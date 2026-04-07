// supabase/functions/_shared/rate_limit.ts
// Small helper to call DB-side rate _limit and emit standard headers.
// Env vars: RATE_LIMIT_PER_MINUTE (default 60), RATE_LIMIT_WINDOW_SEC (default 60)

export type RateLimitResult = { allowed: boolean; remaining: number; resetAt: string };

export async function checkRateLimit(key: string, fetchBase: string, serviceRoleKey: string, opts?: { _limit?: number; _windowSec?: number }) {
  const _limit = Math.max(1, Number(opts?._limit ?? Number((globalThis as unknown as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno?.env?.get?.('RATE_LIMIT_PER_MINUTE') ?? 60)));
  const _windowSec = Math.max(1, Number(opts?._windowSec ?? Number((globalThis as unknown as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno?.env?.get?.('RATE_LIMIT_WINDOW_SEC') ?? 60)));
  const body = { p_key: key, p_limit: _limit, p_window_seconds: _windowSec } as Record<string, unknown>
  const resp = await fetch(`${fetchBase}/rest/v1/rpc/bump_rate_limit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  })
  if (!resp.ok) throw new Error(`rate_limit_rpc_failed:${resp.status}`)
  const _data = await resp.json().catch(()=> []) as Array<{ allowed: boolean; remaining: number; reset_at: string }>
  const row = Array.isArray(_data) && _data[0] ? _data[0] : { allowed: true, remaining: _limit-1, reset_at: new Date(Date.now()+_windowSec*1000).toISOString() }
  const result: RateLimitResult = { allowed: !!row.allowed, remaining: Number(row.remaining||0), resetAt: String(row.reset_at) }
  return { result, _limit, _windowSec }
}

export function rateLimitHeaders(_limit: number, remaining: number, resetAt: string) {
  return {
    'RateLimit-_limit': String(_limit),
    'RateLimit-Remaining': String(Math.max(0, remaining)),
    'RateLimit-Reset': String(Math.max(1, Math.ceil((new Date(resetAt).getTime() - Date.now())/1000))),
  } as Record<string,string>
}
