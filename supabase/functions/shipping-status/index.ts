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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'unauthenticated' }, { status: 401 })
    }

    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || SERVICE_KEY
    const supabaseUser = createClient(SUPABASE_URL, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: userRes, error: userErr } = await supabaseUser.auth.getUser()
    if (userErr || !userRes?.user) {
      return jsonResponse({ error: 'unauthorized' }, { status: 401 })
    }
    const uid = userRes.user.id

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: profile, error: profErr } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', uid)
      .maybeSingle();

    // deno-lint-ignore no-explicit-any
    const role = (profile as any)?.role || 'user';
    const isAdmin = ['admin', 'superadmin'].includes(role);

    let query = supabase.from('venthub_orders').select('id, user_id, status, carrier, tracking_number, tracking_url, shipped_at, delivered_at').limit(1)
    if (orderId) query = query.eq('id', orderId)
    if (tracking) query = query.eq('tracking_number', tracking)

    const { data, error } = await query.single()
    if (error) return jsonResponse({ error: error.message || 'Not found' }, { status: 404 })

    if (data.user_id !== uid && !isAdmin) {
      return jsonResponse({ error: 'forbidden' }, { status: 403 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_id, ...shippingData } = data;

    return jsonResponse({ ok: true, shipping: shippingData })
  } catch (e) {
    return jsonResponse({ error: (e as Error).message || 'Unexpected error' }, { status: 500 })
  }
})
