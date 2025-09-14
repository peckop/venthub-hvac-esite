// supabase/functions/returns-webhook/index.ts
// Receives carrier webhook for return shipments. On delivered, marks venthub_returns.status='received'.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RETURNS_WEBHOOK_SECRET (HMAC) or RETURNS_WEBHOOK_TOKEN

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body, null, 2), { status: init.status || 200, headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers||{}) } })
}

async function hmacValid(secret: string, raw: string, signatureHeader: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw))
    const computed = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    const given = signatureHeader.trim().replace(/^sha256=/i, '')
    return given === computed
  } catch {
    return false
  }
}

function mapReturnStatus(input?: string): { status?: string; setReceived?: boolean } {
  const s = (input || '').toLowerCase()
  if (!s) return {}
  if (['in_transit','transit','return_in_transit','returning'].includes(s)) return { status: 'in_transit' }
  if (['received','delivered','returned','completed'].includes(s)) return { status: 'received', setReceived: true }
  if (['cancelled','canceled'].includes(s)) return { status: 'cancelled' }
  return { status: s }
}

function normalizePayload(obj: unknown) {
  const rec = (typeof obj === 'object' && obj !== null) ? (obj as Record<string, unknown>) : {}
  const pick = (...keys: string[]) => { for (const k of keys) { if (k in rec) { const v = rec[k]; if (v!=null) return v } } return undefined }
  return {
    return_id: (pick('return_id','returnId','rid') || '').toString(),
    order_id: (pick('order_id','orderId','id') || '').toString(),
    carrier: (pick('carrier','provider') || '').toString(),
    tracking_number: (pick('tracking_number','trackingNumber','tn') || '').toString(),
    status: (pick('status','state') || '').toString(),
    delivered_at: (pick('delivered_at','deliveredAt','deliveryDate') || '').toString(),
  }
}

async function sha256Base64(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 })

    const raw = await req.text()
    let body: unknown = {}
    try { body = JSON.parse(raw) } catch {}

    const secret = Deno.env.get('RETURNS_WEBHOOK_SECRET') || ''
    const token = Deno.env.get('RETURNS_WEBHOOK_TOKEN') || ''
    const sign = req.headers.get('x-signature') || ''
    const tok = req.headers.get('x-webhook-token') || ''
    let ok = false
    if (secret && sign) ok = await hmacValid(secret, raw, sign)
    if (!ok && token && tok && tok === token) ok = true
    if (!ok) return json({ error: 'Unauthorized' }, { status: 401 })

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: 'Config missing' }, { status: 500 })

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    const p = normalizePayload(body) as { return_id?: string; order_id?: string; carrier?: string; tracking_number?: string; status?: string; delivered_at?: string }

    // Optional dedup
    const eventId = (req.headers.get('x-id') || req.headers.get('x-event-id') || '').trim()
    if (eventId) {
      const { data: exist } = await supabase.from('returns_webhook_events').select('event_id').eq('event_id', eventId).limit(1)
      if (Array.isArray(exist) && exist.length > 0) return json({ ok: true, event_id: eventId, duplicate: true })
    }

    // Resolve return_id if missing using order_id + tracking_number if necessary (best effort)
    let returnId = (p.return_id || '').trim()
    if (!returnId && p.order_id) {
      try {
        const { data } = await supabase.from('venthub_returns').select('id').eq('order_id', p.order_id).order('created_at',{ ascending:false }).limit(1)
        if (Array.isArray(data) && data[0]) returnId = data[0].id
      } catch {}
    }
    if (!returnId) return json({ error: 'Missing return_id' }, { status: 400 })

    // Fetch current status
    const { data: cur, error: curErr } = await supabase.from('venthub_returns').select('id,status').eq('id', returnId).single()
    if (curErr || !cur) return json({ error: 'Return not found' }, { status: 404 })

    const mapped = mapReturnStatus(p.status)
    const patch: Record<string, unknown> = {}
    if (mapped.status) patch['status'] = mapped.status

    // Only allow progression to received (or mapped status) and never regress silently
    const rank: Record<string, number> = { requested:0, approved:1, rejected:1, in_transit:2, received:3, refunded:4, cancelled:4 }
    const curRank = rank[String(cur.status) as string] ?? 0
    const nextRank = rank[String(patch['status']) as string] ?? curRank
    if (nextRank < curRank) {
      return json({ ok: true, unchanged: true, reason: 'regression_blocked' })
    }

    // Update returns row
    if (Object.keys(patch).length > 0) {
      const { error: updErr } = await supabase.from('venthub_returns').update(patch).eq('id', returnId)
      if (updErr) return json({ error: updErr.message || 'DB update failed' }, { status: 500 })
    }

    // Audit event
    try {
      const bodyHash = await sha256Base64(raw)
      if (eventId) {
        await supabase.from('returns_webhook_events').insert({
          event_id: eventId,
          return_id: returnId,
          order_id: p.order_id || null,
          carrier: p.carrier || null,
          tracking_number: p.tracking_number || null,
          status_raw: p.status || null,
          status_mapped: (patch['status'] as string) || String(cur.status),
          body_hash: bodyHash,
          received_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        })
      }
    } catch {}

    return json({ ok: true, return_id: returnId, status: patch['status'] || cur.status })
  } catch (e) {
    return json({ error: (e as Error).message || 'Unexpected error' }, { status: 500 })
  }
})
