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
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
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
