// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

function buildCors(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const ok = allowed.length === 0 || (origin && allowed.includes(origin))
  const headers = {
    'Access-Control-Allow-Origin': ok ? (origin || '*') : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  } as Record<string,string>
  return { headers, ok }
}

type CouponRow = {
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_order_amount: number | null
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  usage_limit: number | null
  used_count: number | null
}

type ApplyCouponReq = {
  code: string
  subtotal: number
}

type ApplyCouponResp = {
  valid: boolean
  reason?: string
  discount_amount?: number
  final_total?: number
  normalized_code?: string
}

Deno.serve(async (req: Request) => {
  const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now())
  const cors = buildCors(req)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors.headers })
  }
  if (!cors.ok) {
    return new Response(JSON.stringify({ error: 'forbidden_origin' }), { status: 403, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
  }

  // Content-Type & size limits
  const ct = (req.headers.get('content-type') || '').toLowerCase()
  if (!ct.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'unsupported_media_type' }), { status: 415, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
  }
  const max = parseInt(Deno.env.get('MAX_BODY_KB') || '100', 10) * 1024
  const cl = parseInt(req.headers.get('content-length') || '0', 10) || 0
  if (cl > max) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'missing_env' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = (await req.json().catch(()=>({}))) as ApplyCouponReq
    const code = String(body?.code || '').trim()
    const subtotal = Number(body?.subtotal || 0)
    if (!code || code.length < 3) {
      return new Response(JSON.stringify({ valid: false, reason: 'invalid_code' } satisfies ApplyCouponResp), { status: 400, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
    }
    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return new Response(JSON.stringify({ valid: false, reason: 'invalid_subtotal' } satisfies ApplyCouponResp), { status: 400, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('code,discount_type,discount_value,minimum_order_amount,valid_from,valid_until,is_active,usage_limit,used_count')
      .eq('code', code)
      .maybeSingle()

    if (error) {
      return new Response(JSON.stringify({ valid: false, reason: 'db_error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
    }
    const row = data as CouponRow | null
    if (!row) {
      return new Response(JSON.stringify({ valid: false, reason: 'not_found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
    }

    const now = Date.now()
    const startsOk = !row.valid_from || new Date(row.valid_from).getTime() <= now
    const endsOk = !row.valid_until || new Date(row.valid_until).getTime() > now
    const activeOk = !!row.is_active
    const limitOk = row.usage_limit == null || (Number(row.used_count || 0) < Number(row.usage_limit))
    const minOk = row.minimum_order_amount == null || subtotal >= Number(row.minimum_order_amount)

    if (!(startsOk && endsOk && activeOk && limitOk && minOk)) {
      return new Response(JSON.stringify({ valid: false, reason: 'not_applicable' } satisfies ApplyCouponResp), { status: 200, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
    }

    let discount = 0
    if (row.discount_type === 'percentage') {
      discount = (subtotal * Number(row.discount_value)) / 100
    } else {
      discount = Number(row.discount_value)
    }
    if (!Number.isFinite(discount) || discount <= 0) {
      return new Response(JSON.stringify({ valid: false, reason: 'zero_discount' } satisfies ApplyCouponResp), { status: 200, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
    }
    if (discount > subtotal) discount = subtotal
    const finalTotal = Number((subtotal - discount).toFixed(2))

    const resp: ApplyCouponResp = { valid: true, discount_amount: Number(discount.toFixed(2)), final_total: finalTotal, normalized_code: row.code }
    return new Response(JSON.stringify(resp), { status: 200, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ valid: false, reason: 'internal', details: msg } satisfies ApplyCouponResp), { status: 500, headers: { 'Content-Type': 'application/json', ...cors.headers, 'X-Request-Id': requestId } })
  }
})
