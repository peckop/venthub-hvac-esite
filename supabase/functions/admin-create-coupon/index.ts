// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'missing_env' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    })
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: userRes, error: userErr } = await supabaseUser.auth.getUser()
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const userId = userRes.user.id

    const { data: profile, error: profErr } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (profErr) {
      return new Response(JSON.stringify({ error: 'profile_error', details: profErr.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const role = (profile as any)?.role || 'user'
    if (!['admin', 'superadmin'].includes(role)) {
      return new Response(JSON.stringify({ error: 'forbidden', details: 'admin_only' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const body = await req.json().catch(() => ({})) as Record<string, any>

    const code = String(body.code || '').trim()
    const type = String(body.type || '')
    const value = Number(body.value)
    const starts_at = body.starts_at ? String(body.starts_at) : null
    const ends_at = body.ends_at ? String(body.ends_at) : null
    const is_active = Boolean(body.active ?? true)
    let usage_limit: number | null
    if (body.usage_limit === null || body.usage_limit === undefined || body.usage_limit === '') {
      usage_limit = null
    } else {
      const ul = Number(body.usage_limit)
      usage_limit = (!Number.isFinite(ul) || ul < 1) ? null : ul
    }

    const errs: string[] = []
    if (!code || code.length < 3 || code.length > 50) errs.push('code')
    if (!['percent', 'fixed'].includes(type)) errs.push('type')
    if (!value || value <= 0) errs.push('value')
    if (errs.length > 0) {
      return new Response(JSON.stringify({ error: 'bad_request', missing_or_invalid: errs }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const payload = {
      code,
      discount_type: type === 'percent' ? 'percentage' : 'fixed_amount',
      discount_value: value,
      valid_from: starts_at ? new Date(starts_at).toISOString() : null,
      valid_until: ends_at ? new Date(ends_at).toISOString() : null,
      is_active,
      usage_limit,
      used_count: 0,
      created_by: userId,
    }

    const { data, error: insErr } = await supabaseAdmin
      .from('coupons')
      .insert(payload)
      .select('id, code, discount_type, discount_value, valid_from, valid_until, is_active, usage_limit, used_count, created_at')
      .single()

    if (insErr) {
      return new Response(JSON.stringify({ error: 'insert_failed', details: insErr.message }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: 'internal', details: msg }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }
})
