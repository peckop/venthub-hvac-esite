import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  } as Record<string,string>

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })

  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    // Optional origin restriction (comma-separated list)
    const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)
    if (allowedOrigins.length > 0) {
      const originHeader = req.headers.get('origin') || ''
      let originToCheck = originHeader
      if (!originToCheck) {
        const ref = req.headers.get('referer') || ''
        try { originToCheck = new URL(ref).origin } catch {}
      }
      if (!originToCheck || !allowedOrigins.includes(originToCheck)) {
        return new Response('Forbidden', { status: 403, headers: cors })
      }
    }

    const requireAuth = (Deno.env.get('REQUIRE_AUTH') ?? 'true').toLowerCase() !== 'false'
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    if (requireAuth) {
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || ''
      if (!authHeader.toLowerCase().startsWith('bearer ')) {
        return new Response('Unauthorized', { status: 401, headers: cors })
      }
      const accessToken = authHeader.slice(7).trim()
      const { data: authData, error: authErr } = await supabase.auth.getUser(accessToken)
      if (authErr || !authData?.user) {
        return new Response('Unauthorized', { status: 401, headers: cors })
      }
    }

    const body = await req.json().catch(()=>null) as unknown
    if (!body || typeof body !== 'object') {
      return new Response('Bad Request', { status: 400, headers: cors })
    }

    // Very small sanitizer to mask potential PII
    const mask = (s: string) => String(s)
      .slice(0, 4000)
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+/gi, '***@***')
      .replace(/[A-Za-z0-9_\-]{20,}/g, '***')

    const payload = body as Record<string, unknown>

    // Build signature from message + first stack line + url path
    const firstLine = String(payload.stack || '').split('\n')[0] || ''
    const urlObj = (()=>{ try { return new URL(String(payload.url||'')) } catch { return null } })()
    const path = urlObj?.pathname || ''
    const signature = mask(`${String(payload.msg||'')}`.slice(0,300) + ' :: ' + `${firstLine}`.slice(0,300) + ' :: ' + `${path}`.slice(0,200))

    // Upsert group (best-effort: do not fail request if grouping fails)
    let groupId: string | null = null
    try {
      const groupPayload = {
        signature,
        level: mask(String(payload.level || 'error')),
        last_message: mask(String(payload.msg || '')),
        url_sample: mask(String(payload.url || '')),
        env: mask(String(payload.env || '')),
        release: mask(String(payload.release || '')),
        last_seen: new Date().toISOString(),
      }
      const { data: upsertRow } = await supabase
        .from('error_groups')
        .upsert(groupPayload, { onConflict: 'signature' })
        .select('id, count')
        .maybeSingle()
      groupId = upsertRow?.id ?? null
      if (!groupId) {
        // Try to get id by signature (handles cases where upsert returns no row)
        const q = await supabase
          .from('error_groups')
          .select('id')
          .eq('signature', signature)
          .maybeSingle()
        groupId = (q.data as { id?: string } | null)?.id || null
      }
      if (groupId) {
        await supabase.rpc('increment_error_group_count', { p_group_id: groupId }).catch(()=>{})
      }
    } catch (_) {
      // ignore grouping errors
      groupId = null
    }

    // Server-side lightweight dedup by group within a short window (default 5s)
    const dedupSeconds = parseInt(Deno.env.get('DEDUP_SECONDS') || '5')
    if (groupId && dedupSeconds > 0) {
      try {
        const since = new Date(Date.now() - dedupSeconds * 1000).toISOString()
        const { data: recent } = await supabase
          .from('client_errors')
          .select('id, at')
          .eq('group_id', groupId)
          .gte('at', since)
          .limit(1)
        if (Array.isArray(recent) && recent.length > 0) {
          return new Response('ok', { status: 200, headers: cors })
        }
      } catch {
        // ignore dedup errors, proceed to insert
      }
    }

    const row: Record<string, unknown> = {
      at: new Date().toISOString(),
      url: mask(String(payload.url || '')),
      message: mask(String(payload.msg || '')),
      stack: mask(String(payload.stack || '')),
      user_agent: mask(String(payload.ua || '')),
      release: mask(String(payload.release || '')),
      env: mask(String(payload.env || '')),
      level: mask(String(payload.level || 'error')),
      extra: (typeof payload.extra === 'object' && payload.extra !== null) ? payload.extra : null,
    }
    // Only include group_id if available; avoid failures if column doesn't exist
    if (groupId) (row as any).group_id = groupId

    const { error } = await supabase.from('client_errors').insert(row)
    if (error) {
      // As a last resort, avoid failing the function; report error in body for observability
      return new Response(JSON.stringify({ error: String(error?.message || error) }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    return new Response('ok', { status: 200, headers: cors })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
  }
})

