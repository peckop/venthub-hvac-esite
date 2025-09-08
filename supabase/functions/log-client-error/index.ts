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
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { error } = await supabase.from('client_errors').insert(row)
    if (error) {
      return new Response(JSON.stringify({ error: String(error?.message || error) }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    return new Response('ok', { status: 200, headers: cors })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
  }
})

