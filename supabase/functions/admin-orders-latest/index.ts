Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  } as Record<string,string>

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    // Parse filters from query string
    const url = new URL(req.url)
    const status = url.searchParams.get('status')?.trim() || ''
    const from = url.searchParams.get('from')?.trim() || ''
    const to = url.searchParams.get('to')?.trim() || ''
    const q = url.searchParams.get('q')?.trim() || ''
    const limitParam = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 100)
    const pageParam = Math.max(parseInt(url.searchParams.get('page') || '1', 10) || 1, 1)
    const offset = (pageParam - 1) * limitParam

    const params = new URLSearchParams()
    params.set('select', 'id,status,conversation_id,total_amount,created_at')
    params.set('order', 'created_at.desc')

    if (status) params.set('status', `eq.${status}`)

    function normalizeDateStart(d: string) {
      // accepts YYYY-MM-DD or ISO; returns ISO start of day Z
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d}T00:00:00Z`
      return d
    }
    function normalizeDateEnd(d: string) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d}T23:59:59Z`
      return d
    }

    if (from) params.append('created_at', `gte.${normalizeDateStart(from)}`)
    if (to) params.append('created_at', `lte.${normalizeDateEnd(to)}`)

    if (q) {
      const isUuid = /^[0-9a-fA-F-]{32,36}$/.test(q)
      const like = `*${q}*`
      const orExpr = isUuid
        ? `(id.eq.${q},conversation_id.ilike.${like})`
        : `(conversation_id.ilike.${like},id.ilike.${like})`
      params.append('or', orExpr)
    }

    const requestUrl = `${supabaseUrl}/rest/v1/venthub_orders?${params.toString()}`

    const resp = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Prefer": "count=exact",
        "Range-Unit": "items",
        "Range": `${offset}-${offset + limitParam - 1}`
      }
    })

    const rows = await resp.json().catch(()=>[])
    const contentRange = resp.headers.get('content-range') || '0-0/0'
    const total = Number(contentRange.split('/')[1] || '0') || 0
    return new Response(JSON.stringify({ total, page: pageParam, limit: limitParam, rows }), { status: 200, headers: { ...cors, 'Content-Type':'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
  }
})
