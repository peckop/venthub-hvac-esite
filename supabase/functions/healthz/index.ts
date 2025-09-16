// supabase/functions/healthz/index.ts
// Basic health check. Returns 200 if function is up. If SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY exist,
// optionally performs a lightweight DB call to confirm connectivity and returns 200/503 accordingly.

Deno.serve(async (req: Request) => {
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0',
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers })
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const release = Deno.env.get('SENTRY_RELEASE') || Deno.env.get('RELEASE') || ''
    const commit = Deno.env.get('GITHUB_SHA') || Deno.env.get('COMMIT_SHA') || (Deno.env.get('VITE_COMMIT_SHA') || '')

    if (supabaseUrl && serviceKey) {
      // Try a minimal REST call: request 1 row from a small table or use RPC ping if available
      const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/now`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
        body: '{}'
      })
      if (!resp.ok) throw new Error(`db_unhealthy: status=${resp.status}`)
      return new Response(JSON.stringify({ ok: true, db: 'ok', release: release || null, commit: commit || null, time: new Date().toISOString() }), { status: 200, headers })
    }

    return new Response(JSON.stringify({ ok: true, release: release || null, commit: commit || null, time: new Date().toISOString() }), { status: 200, headers })
  } catch (e) {
    try {
      const { sentryCaptureException } = await import('../_shared/sentry.ts')
      await sentryCaptureException(e as unknown, { fn: 'healthz' })
    } catch {}
    return new Response(JSON.stringify({ ok: false, error: 'unhealthy' }), { status: 503, headers })
  }
})
