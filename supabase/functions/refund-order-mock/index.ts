import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Mock refund function: no real PSP call, only DB state updates + audit insert
// Auth: require authenticated; allow only admin or order owner

interface RefundRequest {
  order_id: string
  amount?: number
  reason?: string
}

function parseJwt(token?: string | null): { sub?: string } | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload)
  } catch {
    return null
  }
}

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const body = await req.json().catch(()=>({})) as RefundRequest
    const order_id = (body.order_id || '').trim()
    const amount = typeof body.amount === 'number' && isFinite(body.amount) ? Number(body.amount) : undefined
    const reason = typeof body.reason === 'string' ? body.reason.slice(0, 140) : undefined
    if (!order_id) {
      return new Response(JSON.stringify({ error: 'missing_fields', missing: ['order_id'] }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Auth check: admin or owner
    const authHeader = req.headers.get('authorization')
    const jwt = parseJwt(authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null)
    const actorUserId = typeof jwt?.sub === 'string' ? jwt!.sub : ''

    // Load order
    const ordResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&select=id,user_id,status,payment_status,total_amount,payment_debug`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
    })
    if (!ordResp.ok) {
      return new Response(JSON.stringify({ error: 'order_fetch_failed', status: ordResp.status }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    const arr = await ordResp.json().catch(()=>[])
    const order = Array.isArray(arr) ? arr[0] : null
    if (!order) return new Response(JSON.stringify({ error: 'order_not_found' }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } })

    // Role check
    let isAdmin = false
    if (actorUserId) {
      const prof = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(actorUserId)}&select=role`, {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
      })
      if (prof.ok) {
        const prows = await prof.json().catch(()=>[])
        const prow = Array.isArray(prows) ? prows[0] : null
        isAdmin = prow?.role === 'admin' || prow?.role === 'superadmin'
      }
    }
    const isOwner = actorUserId && order.user_id === actorUserId
    if (!(isAdmin || isOwner)) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const totalAmount = Number(order.total_amount || 0)
    const target = typeof amount === 'number' && amount > 0 ? amount : totalAmount

    // Update order payment_status and debug (mock)
    const isFull = target >= totalAmount
    const newPaymentStatus = isFull ? 'refunded' : 'partial_refunded'
    const newOrderStatus = isFull ? (order.status === 'shipped' || order.status === 'delivered' ? order.status : 'cancelled') : order.status
    const dbg = order.payment_debug || {}
    const newDebug = {
      ...dbg,
      mock_refund: true,
      mock_refund_reason: reason || null,
      refund_type: isFull ? 'cancel' : 'refund',
      refund_amount: target,
      refunded_total: isFull ? totalAmount : ((Number(dbg?.refunded_total || 0)) + target),
      partial_refunds: isFull ? (dbg?.partial_refunds || []) : ([...(Array.isArray(dbg?.partial_refunds) ? dbg.partial_refunds : []), { amount: target, at: new Date().toISOString() }])
    }

    // Stock restore on full refund (mock)
    if (isFull) {
      try {
        const itemsResp = await fetch(`${supabaseUrl}/rest/v1/venthub_order_items?order_id=eq.${encodeURIComponent(order_id)}&select=product_id,quantity`, {
          headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
        })
        if (itemsResp.ok) {
          const items = await itemsResp.json().catch(()=>[])
          for (const it of (Array.isArray(items) ? items : [])) {
            try {
              await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(it.product_id)}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
                body: JSON.stringify({ stock_qty: { "increment": Number(it.quantity||0) } })
              })
            } catch {}
          }
        }
      } catch {}
    }

    const upd = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ payment_status: newPaymentStatus, status: newOrderStatus, payment_debug: newDebug })
    })
    if (!upd.ok) {
      const txt = await upd.text().catch(()=> '')
      return new Response(JSON.stringify({ error: 'order_update_failed', status: upd.status, body: txt }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Audit insert (best effort)
    try {
      const payload = { order_id, amount: target, reason: reason || null, actor_user_id: actorUserId || null }
      await fetch(`${supabaseUrl}/rest/v1/order_refund_events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type':'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(payload)
      })
    } catch {}

    return new Response(JSON.stringify({ ok: true, order_id, payment_status: newPaymentStatus, amount: target }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
