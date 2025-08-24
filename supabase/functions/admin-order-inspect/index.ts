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

    let id: string | null = null
    let conv: string | null = null
    try {
      const url = new URL(req.url)
      id = url.searchParams.get('id')
      conv = url.searchParams.get('conv')
    } catch {}

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
      const text = await resp.text().catch(()=>'' )
      return new Response(JSON.stringify({ ok:false, httpStatus: resp.status, rpcUrl, body:text }), { status: 200, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    const json = await resp.json().catch(()=>[])
    const row = Array.isArray(json) ? json[0] : null
    return new Response(JSON.stringify({ ok: !!row, rpcUrl, row }), { status: 200, headers: { ...cors, 'Content-Type':'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
  }
})
