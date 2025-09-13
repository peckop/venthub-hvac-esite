import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const origin = req.headers.get('origin') ?? '*'
  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': req.headers.get('access-control-request-headers') ?? 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': req.headers.get('access-control-request-method') ?? 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } })

  try {
    const text = await req.text()
    let parsed: Record<string, unknown> = {}
    try { parsed = text ? JSON.parse(text) : {} } catch {}
    const cancel = (() => {
      const v = (parsed as Record<string, unknown>)['cancel']
      if (typeof v === 'boolean') return v
      if (typeof v === 'string') return v.toLowerCase() === 'true'
      return false
    })()
    const text = await req.text()
    let body: Record<string, unknown> = {}
    try { body = text ? JSON.parse(text) : {} } catch {}

    const pick = (keys: string[]): string | null => {
      for (const k of keys) {
        const v = body[k]
        if (typeof v === 'string' && v.trim()) return v.trim()
        if (typeof v === 'number' && Number.isFinite(v)) return String(v)
      }
      return null
    }

    const order_id = pick(['order_id','orderId'])
    let carrier = pick(['carrier'])
    let tracking_number = pick(['tracking_number','trackingNumber'])
    let tracking_url = pick(['tracking_url','trackingUrl'])
    const send_email = ((): boolean => {
      const v = body['send_email'] ?? body['sendEmail']
      if (typeof v === 'boolean') return v
      if (typeof v === 'string') return v.toLowerCase() === 'true'
      return true
    })()

    if (!order_id || (!cancel && (!carrier || !tracking_number))) {
      return new Response(JSON.stringify({ error: 'missing_fields', missing: [!order_id && 'order_id', (!cancel && !carrier) && 'carrier', (!cancel && !tracking_number) && 'tracking_number'].filter(Boolean) }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Cancel flow: revert shipping
    if (cancel) {
      const updCancel = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ carrier: null, tracking_number: null, tracking_url: null, shipped_at: null, status: 'confirmed' })
      })
      if (!updCancel.ok) {
        const txt = await updCancel.text()
        return new Response(JSON.stringify({ error: 'cancel_failed', status: updCancel.status, body: txt }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
      }
      // audit best-effort will be handled via db trigger or future enhancement
      return new Response(JSON.stringify({ ok: true, action: 'cancel' }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Fetch current order to decide first-time vs update (preserve shipped_at if already set)
    let isFirstShip = true
    try {
      const cur = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&select=status,shipped_at`, {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
      })
      if (cur.ok) {
        const arr = await cur.json().then(x => Array.isArray(x) ? x : []).catch(() => [])
        const row = arr[0]
        if (row && (row.shipped_at !== null || String(row.status) === 'shipped')) {
          isFirstShip = false
        }
      }
    } catch {}

    // patch order (only set shipped_at if first time)
    const patchBody: Record<string, unknown> = {
      carrier,
      tracking_number,
      tracking_url: tracking_url ?? null,
    }
    if (isFirstShip) {
      patchBody['shipped_at'] = new Date().toISOString()
      patchBody['status'] = 'shipped'
    }
    const upd = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(patchBody)
    })

    if (!upd.ok) {
      const txt = await upd.text()
      return new Response(JSON.stringify({ error: 'update_failed', status: upd.status, body: txt }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Derive customer email/name for notification
    let customer_email: string | null = null
    let customer_name: string | null = null
    try {
      const ordResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&select=user_id,order_number`, {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
      })
      if (ordResp.ok) {
        const arr = await ordResp.json().then(x=>Array.isArray(x)?x:[]).catch(()=>[])
        const row = arr[0]
        const uid = row?.user_id
        if (uid) {
          const usrResp = await fetch(`${supabaseUrl}/rest/v1/admin_users?id=eq.${encodeURIComponent(uid)}&select=email,full_name`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
          })
          if (usrResp.ok) {
            const uarr = await usrResp.json().then(x=>Array.isArray(x)?x:[]).catch(()=>[])
            const u = uarr[0]
            customer_email = u?.email || null
            customer_name = u?.full_name || null
          }
        }
      }
    } catch {}

    // optional email
    if (send_email) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/shipping-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id, carrier, tracking_number, tracking_url, customer_email, customer_name })
        })
      } catch {}
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: 'unexpected', message: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
