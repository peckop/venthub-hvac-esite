// Supabase Edge Function: shipping-webhook
// Receives carrier sandbox/live webhook and updates order shipping fields securely
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Optional (recommended): SHIPPING_WEBHOOK_SECRET (HMAC-SHA256) or SHIPPING_WEBHOOK_TOKEN (legacy)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
    status: init.status || 200,
  })
}

async function hmacValid(secret: string, raw: string, signatureHeader: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw))
    const computed = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    // Accept base64 or hex signatures; normalize
    const normalize = (s: string) => s.trim().replace(/^sha256=/i, '')
    const given = normalize(signatureHeader)
    return given === computed
  } catch {
    return false
  }
}

function mapCarrierStatus(input?: string): { status?: string; setShipped?: boolean; setDelivered?: boolean } {
  const s = (input || '').toLowerCase()
  // Generic mapping across carriers
  if (!s) return {}
  if (['label_created','created','ready','processing','info_received'].includes(s)) return { status: 'paid' }
  if (['accepted','picked_up','in_transit','transit','out_for_delivery','dispatched'].includes(s)) return { status: 'shipped', setShipped: true }
  if (['delivered','completed'].includes(s)) return { status: 'delivered', setDelivered: true }
  if (['failed','exception','return_to_sender','cancelled','canceled'].includes(s)) return { status: 'failed' }
  return { status: s }
}

const RANK: Record<string, number> = { pending: 0, paid: 1, confirmed: 2, shipped: 3, delivered: 4 }

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
    }

    // Read raw body first for signature verification
    const raw = await req.text()
    let payload: any = {}
    try { payload = JSON.parse(raw) } catch { payload = {} }

    const secret = Deno.env.get('SHIPPING_WEBHOOK_SECRET') || ''
    const signature = req.headers.get('x-signature') || req.headers.get('x-carrier-signature') || ''
    let authorized = false

    if (secret && signature) {
      authorized = await hmacValid(secret, raw, signature)
    }

    // Legacy token fallback (sandbox)
    if (!authorized) {
      const token = req.headers.get('x-webhook-token') || ''
      const expected = Deno.env.get('SHIPPING_WEBHOOK_TOKEN') || ''
      if (expected && token === expected) authorized = true
    }

    if (!authorized) {
      return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return jsonResponse({ error: 'Function misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // Expected payload
    // { order_id?, order_number?, carrier?, tracking_number?, tracking_url?, status?, shipped_at?, delivered_at? }
    const p = payload as {
      order_id?: string
      order_number?: string
      carrier?: string
      tracking_number?: string
      tracking_url?: string
      status?: string
      shipped_at?: string
      delivered_at?: string
    }

    let orderId = (p.order_id || '').trim()

    if (!orderId && p.order_number) {
      const { data, error } = await supabase
        .from('venthub_orders')
        .select('id')
        .eq('order_number', p.order_number)
        .limit(1)
        .single()
      if (error) return jsonResponse({ error: 'Order not found for given order_number' }, { status: 404 })
      orderId = data?.id
    }

    if (!orderId) {
      return jsonResponse({ error: 'order_id or order_number is required' }, { status: 400 })
    }

    // Fetch current to enforce monotonic status progression and for idempotency
    const { data: current, error: curErr } = await supabase
      .from('venthub_orders')
      .select('id, status, shipped_at, delivered_at, tracking_number, tracking_url, carrier')
      .eq('id', orderId)
      .single()
    if (curErr || !current) return jsonResponse({ error: 'Order not found' }, { status: 404 })

    const patch: Record<string, unknown> = {}
    if (typeof p.carrier === 'string') patch.carrier = p.carrier
    if (typeof p.tracking_number === 'string') patch.tracking_number = p.tracking_number
    if (typeof p.tracking_url === 'string') patch.tracking_url = p.tracking_url

    // Map external status to internal and enforce monotonic upgrade
    const mapped = mapCarrierStatus(p.status)
    const curStatus = String(current.status || 'pending').toLowerCase()
    if (mapped.status) {
      const next = mapped.status.toLowerCase()
      const curRank = RANK[curStatus] ?? 0
      const nextRank = RANK[next] ?? curRank
      if (nextRank >= curRank) {
        patch.status = next
        // Timestamps: allow explicit dates from payload, otherwise set now if transitioning
        const parseDate = (s?: string) => (s ? new Date(s).toISOString() : undefined)
        if (next === 'shipped' && !current.shipped_at) {
          patch.shipped_at = parseDate(p.shipped_at) || new Date().toISOString()
        }
        if (next === 'delivered' && !current.delivered_at) {
          patch.delivered_at = parseDate(p.delivered_at) || new Date().toISOString()
        }
      }
    }

    // If no effective changes, short‑circuit
    const noChange =
      (patch.status == null || patch.status === curStatus) &&
      (patch.tracking_number == null || patch.tracking_number === current.tracking_number) &&
      (patch.tracking_url == null || patch.tracking_url === current.tracking_url) &&
      (patch.carrier == null || patch.carrier === current.carrier) &&
      (patch.shipped_at == null) &&
      (patch.delivered_at == null)

    if (noChange) {
      return jsonResponse({ ok: true, order_id: current.id, shipping: current, unchanged: true })
    }

    const { data, error } = await supabase
      .from('venthub_orders')
      .update(patch)
      .eq('id', orderId)
      .select('id, status, carrier, tracking_number, tracking_url, shipped_at, delivered_at')
      .single()

    if (error) return jsonResponse({ error: error.message || 'Update failed' }, { status: 500 })

    return jsonResponse({ ok: true, order_id: data.id, shipping: data })
  } catch (e) {
    return jsonResponse({ error: (e as Error).message || 'Unexpected error' }, { status: 500 })
  }
})

