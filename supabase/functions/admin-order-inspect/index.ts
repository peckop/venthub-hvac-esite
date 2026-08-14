import { getCorsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const cors = corsHeaders;

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: userRes, error: userErr } = await supabaseUser.auth.getUser()
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const { data: profile, error: profErr } = await supabaseAdmin.from('user_profiles').select('role').eq('id', userRes.user.id).maybeSingle()
    const userRole = profile?.role as string | undefined
    if (profErr || !userRole || !['admin', 'superadmin'].includes(userRole)) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    let id: string | null = null
    let conv: string | null = null
    try {
      const url = new URL(req.url)
      id = url.searchParams.get('id')
      conv = url.searchParams.get('conv')
    } catch { /* ignore parse error */ }

    if ((!id && !conv) && (req.method === 'POST' || req.method === 'PUT')) {
      const body = await req.json().catch(()=>null)
      id = body?.id || null
      conv = body?.conv || null
    }

    if (!id && !conv) {
      return new Response(JSON.stringify({ error: 'MISSING_ID_OR_CONV' }), { status: 400, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const rpcUrl = `${supabaseUrl}/rest/v1/rpc/fn_admin_get_orders`
    const body = { p_id: id, p_conv: conv, p_status: null, p_limit: 1 }
    const resp = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!resp.ok) {
      const _text = await resp.text().catch(()=>'' )
      return new Response(JSON.stringify({ ok:false, httpStatus: resp.status, rpcUrl, body:_text }), { status: 200, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const json = await resp.json().catch(()=>[])
    const row = Array.isArray(json) ? json[0] : null
    return new Response(JSON.stringify({ ok: !!row, rpcUrl, row }), { status: 200, headers: { ...cors, 'Content-Type':'application/json' } })
  } catch (_e: unknown) {
    console.error('Admin order inspect error:', _e);
    const msg = _e instanceof Error ? _e.message : 'unknown';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
  }
})
