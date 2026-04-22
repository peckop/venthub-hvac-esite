import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  } as Record<string,string>

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
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing Authorization header' }), { status: 401, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authErr } = await authClient.auth.getUser()
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid or expired token' }), { status: 401, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const roleCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${user.id}&select=role`, {
      headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
    })

    if (roleCheck.ok) {
      const arr = await roleCheck.json().catch(() => [])
      const role = arr[0]?.role
      if (role !== 'admin' && role !== 'superadmin') {
        return new Response(JSON.stringify({ error: 'forbidden', message: 'Insufficient privileges' }), { status: 403, headers: { ...cors, 'Content-Type':'application/json' } })
      }
    } else {
      return new Response(JSON.stringify({ error: 'internal_error', message: 'Failed to verify user role' }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    let _id: string | null = null
    let conv: string | null = null
    if (req.method === 'POST') {
      const body = await req.json().catch(()=>null)
      _id = body?.id || null
      conv = body?.conv || null
    } else {
      const url = new URL(req.url)
      _id = url.searchParams.get('id')
      conv = url.searchParams.get('conv')
    }

    // RPC ile listeleme
    const _limit = 10
    const rpcListUrl = `${supabaseUrl}/rest/v1/rpc/fn_admin_get_orders`
    const listBody: { p_id: string | null; p_conv: string | null; p_limit: number; p_status?: string | null } = { p_id: _id, p_conv: conv, p_limit: _limit }
    if (!_id && !conv) listBody.p_status = 'pending'; else listBody.p_status = null

    const listResp = await fetch(rpcListUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey, 'Content-Type':'application/json' },
      body: JSON.stringify(listBody)
    })
    if (!listResp.ok) {
      const text = await listResp.text().catch(()=>'' )
      return new Response(JSON.stringify({ ok:false, httpStatus: listResp.status, rpcUrl: rpcListUrl, body:text }), { status: 200, headers: { ...cors, 'Content-Type':'application/json' } })
    }
    const orders = await listResp.json().catch(()=>[])
    if (!Array.isArray(orders) || orders.length === 0) {
      return new Response(JSON.stringify({ ok:false, processed:0, rpcUrl: rpcListUrl, message:'no orders found' }), { status: 200, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    // Callback üzerinden doğrula
    const fnHost = (() => { const su = supabaseUrl!; try { const host = new URL(su).host; const ref = host.split('.')[0]; return `https://${ref}.functions.supabase.co`; } catch { return '' } })();

    const results: Array<Record<string, unknown>> = []
    for (const o of orders) {
      const token = o?.payment_token || null
      if (!token) {
        results.push({ id:o.id, conversation_id:o.conversation_id, skipped:'no_token' })
        continue
      }

      try {
        const cbUrl = `${fnHost}/iyzico-callback`
        const cbResp = await fetch(cbUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey
          },
          body: JSON.stringify({ token, conversationId: o.conversation_id, orderId: o.id })
        })
        const cbJson = await cbResp.json().catch(()=>({}))
        const st = cbJson?.status || 'pending'
        results.push({ id:o.id, conversation_id:o.conversation_id, status: st, from:'callback' })
      } catch (e: unknown) {
    console.error(e);
        results.push({ id:o.id, conversation_id:o.conversation_id, error: 'Internal server error' })
      }
    }

    return new Response(JSON.stringify({ ok:true, processed: results.length, results }), { status: 200, headers: { ...cors, 'Content-Type':'application/json' } })
  } catch (e: unknown) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
  }
})
