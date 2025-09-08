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

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Upsert group
    const groupPayload = {
      signature,
      level: mask(String(payload.level || 'error')),
      last_message: mask(String(payload.msg || '')),
      url_sample: mask(String(payload.url || '')),
      env: mask(String(payload.env || '')),
      release: mask(String(payload.release || '')),
      last_seen: new Date().toISOString(),
    }
    const upsertRes = await supabase
      .from('error_groups')
      .upsert(groupPayload, { onConflict: 'signature' })
      .select('id, count')
      .single()
      .catch(()=>({ data: null }))

    let groupId: string | null = null
    // If select did not return existing row, fetch id now
    if (upsertRes && (upsertRes as any).data && (upsertRes as any).data.id) {
      groupId = (upsertRes as any).data.id as string
    } else {
      // Try to get id by signature
      const q = await supabase.from('error_groups').select('id').eq('signature', signature).maybeSingle()
      groupId = (q.data as { id?: string } | null)?.id || null
    }

    // Update count atomically
    if (groupId) {
      await supabase.rpc('increment_error_group_count', { p_group_id: groupId }).catch(()=>{})
    }

    const row = {
      at: new Date().toISOString(),
      url: mask(String(payload.url || '')),
      message: mask(String(payload.msg || '')),
      stack: mask(String(payload.stack || '')),
      user_agent: mask(String(payload.ua || '')),
      release: mask(String(payload.release || '')),
      env: mask(String(payload.env || '')),
      level: mask(String(payload.level || 'error')),
      extra: (typeof payload.extra === 'object' && payload.extra !== null) ? payload.extra : null,
      group_id: groupId,
    }

    const { error } = await supabase.from('client_errors').insert(row)
    if (error) {
      return new Response(JSON.stringify({ error: String(error?.message || error) }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    return new Response('ok', { status: 200, headers: cors })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
  }
})

