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

function normalizePayload(carrierHint: string, obj: unknown) {
  const rec = (typeof obj === 'object' && obj !== null) ? (obj as Record<string, unknown>) : {};
  const c = (carrierHint || (typeof rec.carrier === 'string' ? rec.carrier : '') || '').toString().trim().toLowerCase()
  // Common aliases
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      if (k in rec) {
        const v = rec[k]
        if (v != null) return v
      }
    }
    return undefined
  }
  const norm = {
    order_id: (pick('order_id','orderId','id') || '').toString(),
    order_number: (pick('order_number','orderNo','orderCode') || '').toString(),
    carrier: c || (pick('carrier','provider') || '').toString(),
    tracking_number: (pick('tracking_number','trackingNumber','trackingNo','tn') || '').toString(),
    tracking_url: (pick('tracking_url','trackingUrl','url','link') || '').toString(),
    status: (pick('status','state','shipmentStatus') || '').toString(),
    shipped_at: (pick('shipped_at','shippedAt','shipDate') || '').toString(),
    delivered_at: (pick('delivered_at','deliveredAt','deliveryDate') || '').toString(),
  }
  // Example: mock carrier custom mapping
  if (c === 'mock') {
    // no extra mapping for now
  }
  return norm
}

async function sha256Base64(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

const RANK: Record<string, number> = { pending: 0, paid: 1, confirmed: 2, shipped: 3, delivered: 4 }
const SKEW_MS = 5 * 60 * 1000 // 5 minutes tolerance

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
    }

    // Read raw body first for signature verification
    const raw = await req.text()
    let payload: unknown = {}
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

    // Optional replay guard — enforce only if timestamp header present
    const tsHeader = req.headers.get('x-timestamp') || req.headers.get('x-event-time') || ''
    if (tsHeader) {
      let t = 0
      // support epoch ms or ISO
      if (/^\d+$/.test(tsHeader.trim())) {
        t = parseInt(tsHeader.trim(), 10)
      } else {
        const d = Date.parse(tsHeader)
        t = Number.isFinite(d) ? d : 0
      }
      if (!t || Math.abs(Date.now() - t) > SKEW_MS) {
        return jsonResponse({ error: 'Stale or invalid timestamp' }, { status: 401 })
      }
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return jsonResponse({ error: 'Function misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // Normalize payload (carrier adapters)
    const carrierHint = (req.headers.get('x-carrier') || '') as string
    const p = normalizePayload(carrierHint, payload) as {
      order_id?: string
      order_number?: string
      carrier?: string
      tracking_number?: string
      tracking_url?: string
      status?: string
      shipped_at?: string
      delivered_at?: string
    }

    // Optional dedup by event id
    const eventId = (req.headers.get('x-id') || req.headers.get('x-event-id') || '').trim()
    if (eventId) {
      try {
        const { data: existing } = await supabase
          .from<{ event_id: string }>('shipping_webhook_events')
          .select('event_id')
          .eq('event_id', eventId)
          .limit(1)
        if (Array.isArray(existing) && existing.length > 0) {
          return jsonResponse({ ok: true, event_id: eventId, duplicate: true, unchanged: true })
        }
      } catch {}
    }

    let orderId = (p.order_id || '').trim()

    if (!orderId && p.order_number) {
      const { data, error } = await supabase
        .from<{ id: string }>('venthub_orders')
        .select('id')
        .eq('order_number', p.order_number)
        .limit(1)
        .single()
      if (error) return jsonResponse({ error: 'Order not found for given order_number' }, { status: 404 })
      orderId = data?.id as string
    }

    if (!orderId) {
      return jsonResponse({ error: 'order_id or order_number is required' }, { status: 400 })
    }

    // Fetch current to enforce monotonic status progression and for idempotency
    interface OrderRow { id: string; status?: string; shipped_at?: string | null; delivered_at?: string | null; tracking_number?: string | null; tracking_url?: string | null; carrier?: string | null }
    const { data: current, error: curErr } = await supabase
      .from<OrderRow>('venthub_orders')
      .select('id, status, shipped_at, delivered_at, tracking_number, tracking_url, carrier')
      .eq('id', orderId)
      .single()
    if (curErr || !current) return jsonResponse({ error: 'Order not found' }, { status: 404 })

    const patch: Partial<OrderRow> & Record<string, unknown> = {}
    if (typeof p.carrier === 'string' && p.carrier) patch.carrier = p.carrier
    if (typeof p.tracking_number === 'string' && p.tracking_number) patch.tracking_number = p.tracking_number
    if (typeof p.tracking_url === 'string' && p.tracking_url) patch.tracking_url = p.tracking_url

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
      // Log event as unchanged
      try {
        const bodyHash = await sha256Base64(raw)
        if (eventId) {
          await supabase.from('shipping_webhook_events').insert({
            event_id: eventId,
            order_id: orderId,
            carrier: p.carrier || null,
            status_raw: p.status || null,
            status_mapped: (patch.status as string) || curStatus,
            body_hash: bodyHash,
            received_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
          })
        }
      } catch {}
      return jsonResponse({ ok: true, order_id: current.id, shipping: current, unchanged: true })
    }

    const { data, error } = await supabase
      .from<OrderRow>('venthub_orders')
      .update(patch)
      .eq('id', orderId)
      .select('id, status, carrier, tracking_number, tracking_url, shipped_at, delivered_at')
      .single()

    if (error) {
      const msg = (typeof (error as { message?: unknown })?.message === 'string') ? (error as { message: string }).message : 'Update failed'
      return jsonResponse({ error: msg }, { status: 500 })
    }

    // Insert event audit
    try {
      const bodyHash = await sha256Base64(raw)
      if (eventId) {
        await supabase.from('shipping_webhook_events').insert({
          event_id: eventId,
          order_id: orderId,
          carrier: p.carrier || null,
          status_raw: p.status || null,
          status_mapped: data?.status || undefined,
          body_hash: bodyHash,
          received_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        })
      }
    } catch {}

    return jsonResponse({ ok: true, order_id: data?.id, shipping: data })
  } catch (e) {
    return jsonResponse({ error: (e as Error).message || 'Unexpected error' }, { status: 500 })
  }
})

