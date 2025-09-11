Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  } as Record<string, string>

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ ok: false, error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const now = Date.now()
    const th30 = new Date(now - 30 * 60 * 1000).toISOString() // 30 dk
    const th15 = new Date(now - 15 * 60 * 1000).toISOString() // 15 dk

    // 1) Token YOK: 30 dk sonra cancelled
    const cancelResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?status=eq.pending&created_at=lt.${encodeURIComponent(th30)}&payment_token=is.null`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ status: 'cancelled' })
    })
    const cancelled = cancelResp.ok ? await cancelResp.json().catch(() => []) : []

    // 2) Token VAR: 15 dk sonra 1 kez reconcile; SUCCESS değilse failed
    const listResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?select=id,created_at,payment_token,status&status=eq.pending&created_at=lt.${encodeURIComponent(th15)}&payment_token=not.is.null&limit=1000`, {
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
    })
    const pendWithToken = listResp.ok ? await listResp.json().catch(() => []) : []

    const fnHost = (() => { try { const host = new URL(supabaseUrl).host; const ref = host.split('.')[0]; return `https://${ref}.functions.supabase.co`; } catch { return '' } })();

    const reconciled: string[] = []
    const failed: string[] = []

    for (const o of pendWithToken as Array<{ id: string }>) {
      try {
        const cb = await fetch(`${fnHost}/iyzico-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ orderId: o.id })
        })
        const body = await cb.json().catch(() => ({})) as { status?: string }
        if (body?.status === 'success') {
          reconciled.push(o.id)
        } else {
          // Tek deneme sonrası hala success değilse failed yap
          await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(o.id)}&status=eq.pending`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status: 'failed' })
          }).catch(() => {})
          failed.push(o.id)
        }
      } catch {
        // Hata alırsak da failed'a çekelim (pending kalmasın)
        await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(o.id)}&status=eq.pending`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ status: 'failed' })
        }).catch(() => {})
        failed.push(o.id)
      }
    }

    return new Response(JSON.stringify({ ok: true, cancelled_count: Array.isArray(cancelled) ? cancelled.length : 0, reconciled, failed }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e ?? '')
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
