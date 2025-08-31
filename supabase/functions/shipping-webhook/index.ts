// Supabase Edge Function: shipping-webhook
// Receives carrier sandbox webhook and updates order shipping fields
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SHIPPING_WEBHOOK_TOKEN

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
    status: init.status || 200,
  })
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
    }

    const token = req.headers.get('x-webhook-token') || ''
    const expected = Deno.env.get('SHIPPING_WEBHOOK_TOKEN') || ''
    if (!expected || token !== expected) {
      return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return jsonResponse({ error: 'Function misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    const payload = await req.json().catch(() => ({} as Record<string, unknown>)) as {
      order_id?: string
      order_number?: string
      carrier?: string
      tracking_number?: string
      tracking_url?: string
      status?: string
      shipped_at?: string
      delivered_at?: string
    }

    let orderId = payload.order_id?.trim()

    if (!orderId && payload.order_number) {
      // Allow lookup by order_number in sandbox
      const { data, error } = await supabase
        .from('venthub_orders')
        .select('id')
        .eq('order_number', payload.order_number)
        .limit(1)
        .single()
      if (error) return jsonResponse({ error: 'Order not found for given order_number' }, { status: 404 })
      orderId = data?.id
    }

    if (!orderId) {
      return jsonResponse({ error: 'order_id or order_number is required' }, { status: 400 })
    }

    const patch: Record<string, unknown> = {}
    if (typeof payload.carrier === 'string') patch.carrier = payload.carrier
    if (typeof payload.tracking_number === 'string') patch.tracking_number = payload.tracking_number
    if (typeof payload.tracking_url === 'string') patch.tracking_url = payload.tracking_url

    const validStatuses = ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'failed', 'cancelled']
    if (payload.status && validStatuses.includes(payload.status.toLowerCase())) {
      patch.status = payload.status.toLowerCase()
    }

    const parseDate = (s?: string) => (s ? new Date(s).toISOString() : undefined)
    if (payload.shipped_at) patch.shipped_at = parseDate(payload.shipped_at)
    if (payload.delivered_at) patch.delivered_at = parseDate(payload.delivered_at)

    if (Object.keys(patch).length === 0) {
      return jsonResponse({ error: 'No valid fields to update' }, { status: 400 })
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

