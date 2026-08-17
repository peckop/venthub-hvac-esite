import { getCorsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const cors = corsHeaders;

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(JSON.stringify({ ok: false, error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing Authorization header' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Allow system/cron invocation to bypass user checks
    if (authHeader !== `Bearer ${serviceRoleKey}`) {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } }
      })

      const { data: { user }, error: authErr } = await authClient.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''))
      if (authErr || !user) {
        return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid or expired token' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
      }

      const roleCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${user.id}&select=role`, {
        headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
      })

      if (roleCheck.ok) {
        const arr = await roleCheck.json().catch(() => [])
        const role = arr[0]?.role
        if (role !== 'admin' && role !== 'super_admin') {
          return new Response(JSON.stringify({ error: 'forbidden', message: 'Insufficient privileges' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } })
        }
      } else {
        return new Response(JSON.stringify({ error: 'internal_error', message: 'Failed to verify user role' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
      }
    }

    const now = Date.now()
    const th30 = new Date(now - 30 * 60 * 1000).toISOString() // 30 dk
    const th15 = new Date(now - 15 * 60 * 1000).toISOString() // 15 dk

    // 1) Token YOK: 30 dk sonra cancelled
    const cancelResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?status=eq.pending&created_at=lt.${encodeURIComponent(th30)}&payment_token=is.null`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ status: 'cancelled' })
    })
    const cancelled = cancelResp.ok ? await cancelResp.json().catch(() => []) : []

    // 2) Token VAR: 15 dk sonra 1 kez reconcile; SUCCESS değilse failed
    const listResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?select=id,created_at,payment_token,status&status=eq.pending&created_at=lt.${encodeURIComponent(th15)}&payment_token=not.is.null&limit=1000`, {
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
    })
    const pendWithToken = listResp.ok ? await listResp.json().catch(() => []) : []

    const fnHost = (() => { try { const host = new URL(supabaseUrl).host; const ref = host.split('.')[0]; return `https://${ref}.functions.supabase.co`; } catch { return '' } })();

    const reconciled: string[] = []
    const failed: string[] = []

    for (const o of pendWithToken as Array<{ id: string }>) {
      try {
        const cb = await fetch(`${fnHost}/iyzico-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ orderId: o.id })
        })
        const body = await cb.json().catch(() => ({})) as { status?: string }
        if (body?.status === 'success') {
          reconciled.push(o.id)
        } else {
          // Tek deneme sonrası hala success değilse failed yap
          await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(o.id)}&status=eq.pending`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status: 'failed' })
          }).catch(() => {})
          failed.push(o.id)
        }
      } catch {
        // Hata alırsak da failed'a çekelim (pending kalmasın)
        await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(o.id)}&status=eq.pending`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ status: 'failed' })
        }).catch(() => {})
        failed.push(o.id)
      }
    }

    return new Response(JSON.stringify({ ok: true, cancelled_count: Array.isArray(cancelled) ? cancelled.length : 0, reconciled, failed }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : String(_e ?? '')
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
