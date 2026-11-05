// Çağıran sınıfı: (a) oturumlu admin tarayıcısı — resolveCaller (getUser) + rol kapısı + tenant filtresi
import { getCorsHeaders } from '../_shared/cors.ts'
import { resolveCaller, type CallerContext } from '../_shared/caller.ts'
import { metniMaskele } from '../_shared/maske.ts'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const cors = corsHeaders;

  const origin = req.headers.get('origin') || ''
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)
  const okOrigin = allowed.length === 0 || (origin && allowed.includes(origin))
  const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now())

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })
  if (!okOrigin) return new Response(JSON.stringify({ error: 'forbidden_origin' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!anonKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // KİMLİK + ROL + TENANT tek kapıdan (karne 2026-11 kök 2 · Y2): eskiden rol okunuyor,
    // tenant hiç okunmuyordu → liste TÜM kiracıların siparişlerini döndürüyordu.
    let caller: CallerContext
    try {
      caller = await resolveCaller(req)
    } catch (err) {
      console.warn('admin-orders-latest: kimlik kapısı ölçülemedi:', err instanceof Error ? err.name : 'hata')
      return new Response(JSON.stringify({ error: 'auth_check_failed' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    if (caller.kind === 'anon') {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    const userRole = caller.role
    if (caller.kind !== 'user' || !userRole || !['admin', 'super_admin'].includes(userRole)) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    const tenantId = caller.tenantId


    // Parse filters from query string
    const url = new URL(req.url)
    const status = url.searchParams.get('status')?.trim() || ''
    const from = url.searchParams.get('from')?.trim() || ''
    const to = url.searchParams.get('to')?.trim() || ''
    const q = url.searchParams.get('q')?.trim() || ''
    const preset = url.searchParams.get('preset')?.trim() || ''
    const limitParam = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 100)
    const pageParam = Math.max(parseInt(url.searchParams.get('page') || '1', 10) || 1, 1)
    const offset = (pageParam - 1) * limitParam

    const params = new URLSearchParams()
    params.set('select', 'id,status,conversation_id,total_amount,created_at,order_number')
    params.set('order', 'created_at.desc')

    const isPendingShipments = preset === 'pendingShipments'
    if (isPendingShipments) {
      // Show orders awaiting shipment: confirmed or processing and not shipped yet
      params.append('status', 'in.(confirmed,processing)')
      params.append('shipped_at', 'is.null')
    } else if (status) {
      params.set('status', `eq.${status}`)
    }

    function normalizeDateStart(d: string) {
      // accepts YYYY-MM-DD or ISO; returns ISO start of day Z
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d}T00:00:00Z`
      return d
    }
    function normalizeDateEnd(d: string) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d}T23:59:59Z`
      return d
    }

    if (from) params.append('created_at', `gte.${normalizeDateStart(from)}`)
    if (to) params.append('created_at', `lte.${normalizeDateEnd(to)}`)

    if (q) {
      // PostgREST'te uuid sütunlarında ilike çalışmaz (tip uyumsuzluğu).
      // Bu nedenle: id ve conversation_id için sadece tam eşleşme,
      // order_number (_text) için kısmi eşleşme (ilike) kullanıyoruz.
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(q)
      const like = `*${q}*`

      if (isUuid) {
        // Tam UUID girilmiş → id veya conversation_id ile birebir eşleştir
        params.append('or', `(id.eq.${q},conversation_id.eq.${q})`)
      } else {
        // Kısmi metin → sadece order_number'da ara (_text alanı, ilike destekler)
        params.append('order_number', `ilike.${like}`)
      }
    }

    const requestUrl = `${supabaseUrl}/rest/v1/venthub_orders?tenant_id=eq.${encodeURIComponent(tenantId)}&${params.toString()}`

    const resp = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Prefer": "count=exact",
        "Range-Unit": "items",
        "Range": `${offset}-${offset + limitParam - 1}`
      }
    })

    const rows = await resp.json().catch(() => [])
    const contentRange = resp.headers.get('content-range') || '0-0/0'
    const total = Number(contentRange.split('/')[1] || '0') || 0
    return new Response(JSON.stringify({ total, page: pageParam, limit: limitParam, rows }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  } catch (_e) {
    // K6: iç hata metni yanıta dönmez; ayrıntı maskeli olarak loga, istemci `request_id` ile bulur (OPS-213).
    console.error('Admin orders latest error:', requestId, metniMaskele(_e instanceof Error ? _e.message : String(_e), 500));
    return new Response(JSON.stringify({ error: 'internal_error', request_id: requestId }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  }
})
