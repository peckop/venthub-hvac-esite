import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now())
  const origin = req.headers.get('origin') || ''
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const okOrigin = allowed.length === 0 || (origin && allowed.includes(origin))
  const cors = {
    'Access-Control-Allow-Origin': okOrigin ? (origin || '*') : 'null',
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': req.headers.get('access-control-request-headers') ?? 'authorization, x-client-info, apikey, content-type, x-idempotency-key',
    'Access-Control-Allow-Methods': req.headers.get('access-control-request-method') ?? 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })
  if (!okOrigin) return new Response(JSON.stringify({ error: 'forbidden_origin' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })

  // Content-Type & size
  const ct = (req.headers.get('content-type') || '').toLowerCase()
  if (!ct.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'unsupported_media_type' }), { status: 415, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  }
  const max = parseInt(Deno.env.get('MAX_BODY_KB') || '200', 10) * 1024
  const cl = parseInt(req.headers.get('content-length') || '0', 10) || 0
  if (cl > max) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  }

  try {
    const text = await req.text()
    let parsed: Record<string, unknown> = {}
    try { parsed = text ? JSON.parse(text) : {} } catch {}

    const pick = (keys: string[]): string | null => {
      for (const k of keys) {
        const v = parsed[k]
        if (typeof v === 'string' && v.trim()) return v.trim()
        if (typeof v === 'number' && Number.isFinite(v)) return String(v)
      }
      return null
    }

    // Query params must be available before any use
    const qs = new URL(req.url).searchParams

    const cancel = (() => {
      const vRaw = (parsed as Record<string, unknown>)['cancel'] ?? qs.get('cancel')
      if (typeof vRaw === 'boolean') return vRaw
      if (typeof vRaw === 'string') return vRaw.toLowerCase() === 'true'
      return false
    })()

    // Body + query fallback
    let order_id = pick(['order_id','orderId']) || qs.get('order_id') || qs.get('orderId')
    let carrier = pick(['carrier']) || qs.get('carrier')
    let tracking_number = pick(['tracking_number','trackingNumber']) || qs.get('tracking_number') || qs.get('trackingNumber')
    let tracking_url = pick(['tracking_url','trackingUrl']) || qs.get('tracking_url') || qs.get('trackingUrl')
    const send_email = ((): boolean => {
      const v = (parsed['send_email'] ?? parsed['sendEmail'] ?? qs.get('send_email') ?? qs.get('sendEmail'))
      if (typeof v === 'boolean') return v
      if (typeof v === 'string') return v.toLowerCase() === 'true'
      return true
    })()

    // Basic config
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Read current order status to allow implicit cancel (if already shipped and no carrier/tracking provided)
    let isCurrentlyShipped = false
    if (order_id) {
      try {
        const cur = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&select=status,shipped_at`, {
          headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
        })
        if (cur.ok) {
          const arr = await cur.json().then(x => Array.isArray(x) ? x : []).catch(() => [])
          const row = arr[0]
          if (row && (row.shipped_at !== null || String(row.status) === 'shipped')) {
            isCurrentlyShipped = true
          }
        }
      } catch {}
    }

    const wantCancel = cancel || (isCurrentlyShipped && (!carrier || !tracking_number))

    // Cancel flow: revert shipping
    if (wantCancel) {
      if (!order_id) {
        return new Response(JSON.stringify({ error: 'missing_fields', missing: ['order_id'] }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
      }
      const updCancel = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ carrier: null, tracking_number: null, tracking_url: null, shipped_at: null, status: 'confirmed' })
      })
      if (!updCancel.ok) {
        const txt = await updCancel.text()
        return new Response(JSON.stringify({ error: 'cancel_failed', status: updCancel.status, body: txt }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({ ok: true, action: 'cancel' }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Validate for ship/update path
    if (!order_id || !carrier || !tracking_number) {
      return new Response(JSON.stringify({ error: 'missing_fields', missing: [!order_id && 'order_id', !carrier && 'carrier', !tracking_number && 'tracking_number'].filter(Boolean) }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
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

    // Idempotency key (optional but recommended)
    async function computeIdemKey(action: 'ship' | 'cancel', orderId: string, carrier?: string|null, tn?: string|null) {
      const raw = [action, orderId || '', carrier || '', tn || ''].join('|')
      const bytes = new TextEncoder().encode(raw)
      const hash = await crypto.subtle.digest('SHA-256', bytes)
      return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
    }

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
      return new Response(JSON.stringify({ error: 'update_failed', status: upd.status, body: txt }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
    }

    // Record idempotency after successful update (best-effort)
    try {
      const headerKey = req.headers.get('x-idempotency-key') || ''
      const derivedKey = await computeIdemKey(isFirstShip ? 'ship':'ship', order_id, carrier || null, tracking_number || null)
      const idemKey = headerKey || derivedKey
      if (idemKey) {
        await fetch(`${supabaseUrl}/rest/v1/shipping_idempotency`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'resolution=ignore-duplicates' },
          body: JSON.stringify({ key: idemKey, scope: 'admin-update-shipping' })
        })
      }
    } catch {}

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
          // Use Auth Admin API to fetch user securely with service role
          const usrResp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(uid)}`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
          })
          if (usrResp.ok) {
            const u = await usrResp.json().catch(()=>null) as any
            customer_email = (u && u.email) || null
            const metaName = u && u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)
            customer_name = (customer_name || metaName || null)
          }
        }
      }
    } catch {}

    // optional email with result flags
    let emailResult = { sent: false, disabled: false }
    if (send_email) {
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/shipping-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
          body: JSON.stringify({ order_id, carrier, tracking_number, tracking_url, customer_email, customer_name })
        })
        let j: any = null
        try { j = await resp.json() } catch {}
        if (resp.ok) {
          if (j && j.disabled) emailResult.disabled = true; else emailResult.sent = true
          // Log shipping email event (best-effort)
          try {
            const body = JSON.stringify({
              order_id,
              email_to: customer_email || '',
              subject: (j && j.subject) || 'Kargo bildirimi',
              provider: 'resend',
              provider_message_id: (j && j.result && j.result.id) || null,
              carrier,
              tracking_number
            })
            await fetch(`${supabaseUrl}/rest/v1/shipping_email_events`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'return=minimal' },
              body
            })
          } catch {}
        }
      } catch {}
    }

    return new Response(JSON.stringify({ ok: true, email: emailResult }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: 'unexpected', message: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  }
})
