// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return jsonResponse({ error: 'Function misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    // IP-based Rate Limiting to prevent tracking_number brute-force attacks
    const forwarded = req.headers.get('x-forwarded-for') || ''
    const ip = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || (forwarded.split(',')[0]?.trim() || '') || 'unknown'
    const key = `shipping-status:${ip}`
    try {
      const { checkRateLimit, rateLimitHeaders } = await import('../_shared/rate_limit.ts')
      const { result } = await checkRateLimit(key, SUPABASE_URL, SERVICE_KEY, {
        _limit: Number(Deno.env.get('SHIPPING_STATUS_RATE_LIMIT_PER_MINUTE') || 30),
        _windowSec: Number(Deno.env.get('SHIPPING_STATUS_RATE_LIMIT_WINDOW_SEC') || 60)
      })
      if (!result.allowed) {
        const rlHeaders = rateLimitHeaders(Number(Deno.env.get('SHIPPING_STATUS_RATE_LIMIT_PER_MINUTE') || 30), result.remaining, result.resetAt)
        return jsonResponse({ error: 'too_many_requests' }, { status: 429, headers: rlHeaders as Record<string, string> })
      }
    } catch (e) {
    console.error(e)

      // If rate_limit module is missing or throws, continue but log error
      console.warn('Rate limiting failed or unavailable:', e)
    }

    const url = new URL(req.url)
    // Option A: Explicitly reject the internal identifier `order_id` if provided and rely solely on `tracking_number`
    if (url.searchParams.has('order_id')) {
      return jsonResponse({ error: 'Internal identifiers (order_id) are not permitted for public tracking lookups. Please use tracking_number.' }, { status: 403 })
    }

    const tracking = url.searchParams.get('tracking_number') || ''

    if (!tracking) {
      return jsonResponse({ error: 'Provide a tracking_number' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    const query = supabase.from('venthub_orders')
      .select('id, status, carrier, tracking_number, tracking_url, shipped_at, delivered_at')
      .eq('tracking_number', tracking)
      .limit(1)

    const { data, error } = await query.single()
    if (error) return jsonResponse({ error: error.message || 'Not found' }, { status: 404 })

    return jsonResponse({ ok: true, shipping: data })
  } catch (_e) {
    console.error('Shipping status error:', _e);
    return jsonResponse({ error: _e instanceof Error ? _e.message : 'Unexpected error' }, { status: 500 })
  }
})

