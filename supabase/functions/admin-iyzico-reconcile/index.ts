import { getCorsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

Deno.serve(async (req) => {
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
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing Authorization header' }), { status: 401, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authErr } = await authClient.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''))
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid or expired token' }), { status: 401, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const roleCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${user.id}&select=role`, {
      headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
    })

    if (roleCheck.ok) {
      const arr = await roleCheck.json().catch(() => [])
      const role = arr[0]?.role
      if (role !== 'admin' && role !== 'super_admin') {
        return new Response(JSON.stringify({ error: 'forbidden', message: 'Insufficient privileges' }), { status: 403, headers: { ...cors, 'Content-Type':'application/json' } })
      }
    } else {
      return new Response(JSON.stringify({ error: 'internal_error', message: 'Failed to verify user role' }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    let id: string | null = null
    let conv: string | null = null
    if (req.method === 'POST') {
      const body = await req.json().catch(()=>null)
      id = body?.id || null
      conv = body?.conv || null
    } else {
      const url = new URL(req.url)
      id = url.searchParams.get('id')
      conv = url.searchParams.get('conv')
    }

    // RPC ile listeleme
    // NOT: `?limit=` override bloğu prod v20'de VARDI; codemod `let limit` → `const _limit = 10`
    // yaparken override'ı da sildi → operatör toplu uzlaştırma yapamaz hale gelmişti. Geri kondu.
    let limit = 10
    try {
      const url = new URL(req.url)
      const l = url.searchParams.get('limit')
      if (l) limit = Math.max(1, Math.min(100, parseInt(l)))
    } catch { /* URL parse edilemezse varsayılan 10 */ }
    const rpcListUrl = `${supabaseUrl}/rest/v1/rpc/fn_admin_get_orders`
    const listBody: { p_id: string | null; p_conv: string | null; p_limit: number; p_status?: string | null } = { p_id: id, p_conv: conv, p_limit: limit }
    if (!id && !conv) listBody.p_status = 'pending'; else listBody.p_status = null

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
        const msg = e instanceof Error ? e.message : String(e ?? '')
        results.push({ id:o.id, conversation_id:o.conversation_id, error: msg })
      }
    }

    return new Response(JSON.stringify({ ok:true, processed: results.length, results }), { status: 200, headers: { ...cors, 'Content-Type':'application/json' } })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e ?? '')
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
  }
})
