// Supabase Edge Function: shipping-status
// Returns shipping status for a given order_id or tracking_number
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (read-only is okay but service role simplifies policies in sandbox)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...(init.headers || {}) },
    status: init.status || 200,
  })
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
    }

    const url = new URL(req.url)
    const orderId = url.searchParams.get('order_id') || ''
    const tracking = url.searchParams.get('tracking_number') || ''

    if (!orderId && !tracking) {
      return jsonResponse({ error: 'Provide order_id or tracking_number' }, { status: 400 })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return jsonResponse({ error: 'Function misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    let query = supabase.from('venthub_orders').select('id, status, carrier, tracking_number, tracking_url, shipped_at, delivered_at').limit(1)
    if (orderId) query = query.eq('id', orderId)
    if (tracking) query = query.eq('tracking_number', tracking)

    const { data, error } = await query.single()
    if (error) return jsonResponse({ error: error.message || 'Not found' }, { status: 404 })

    return jsonResponse({ ok: true, shipping: data })
  } catch (e) {
    return jsonResponse({ error: (e as Error).message || 'Unexpected error' }, { status: 500 })
  }
})

