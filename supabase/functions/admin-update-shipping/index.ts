// Çağıran sınıfı: (a) oturumlu admin tarayıcısı — getUser(jwt) + rol kapısı
//
// Tenant, isteğin HİÇBİR alanından (query/gövde) okunmaz: rol ile AYNI profil satırından
// türetilir (`_shared/tenant.ts::tenantFromVerifiedUser`). Eski `resolveTenantId(req, parsed)`
// tenant'ı istekten alıp profil sorgusuna FİLTRE koyuyordu (cetvel §3.9).
import { getCorsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"
import { TenantMismatchError, tenantFromVerifiedUser } from '../_shared/tenant.ts'

/**
 * PostgREST dizisinden ilk profil satırını RUNTIME kontrolüyle daraltır.
 * `fetch(...).json()` tipsiz döner; tip uydurmak yerine alanlar tek tek doğrulanır
 * (`_shared/caller.ts::toProfileRow` ile aynı desen).
 */
function firstProfileRow(value: unknown): { role: string | null; tenant_id: string | null } | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const first: unknown = value[0]
  if (typeof first !== 'object' || first === null) return null
  const record = first as Record<string, unknown>
  return {
    role: typeof record.role === 'string' ? record.role : null,
    tenant_id: typeof record.tenant_id === 'string' ? record.tenant_id : null,
  }
}

serve(async (req) => {
  const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now())
  const origin = req.headers.get('origin') || ''
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const okOrigin = allowed.length === 0 || (origin && allowed.includes(origin))
  const cors = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })
  if (!okOrigin) return new Response(JSON.stringify({ error: 'forbidden_origin' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })

  // Content-Type & size
  const ct = (req.headers.get('content-type') || '').toLowerCase()
  if (!ct.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'unsupported_media_type' }), { status: 415, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  }
  const max = parseInt(Deno.env.get('MAX_BODY_KB') || '200', 10) * 1024
  const cl = parseInt(req.headers.get('content-length') || '0', 10) || 0
  if (cl > max) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  }

  try {
    const _text = await req.text()
    let parsed: Record<string, unknown> = {}
    try { parsed = _text ? JSON.parse(_text) : {} } catch {}

    const pick = (keys: string[]): string | null => {
      for (const k of keys) {
        const v = parsed[k]
        if (typeof v === 'string' && v.trim()) return v.trim()
        if (typeof v === 'number' && Number.isFinite(v)) return String(v)
      }
      return null
    }

    // Query params must be available before any use
    const qs = new URL(req.url).searchParams

    const cancel = (() => {
      const vRaw = (parsed as Record<string, unknown>)['cancel'] ?? qs.get('cancel')
      if (typeof vRaw === 'boolean') return vRaw
      if (typeof vRaw === 'string') return vRaw.toLowerCase() === 'true'
      return false
    })()

    // Body + query fallback
    const order_id = pick(['order_id','orderId']) || qs.get('order_id') || qs.get('orderId')
    const carrier = pick(['carrier']) || qs.get('carrier')
    const tracking_number = pick(['tracking_number','trackingNumber']) || qs.get('tracking_number') || qs.get('trackingNumber')
    const tracking_url = pick(['tracking_url','trackingUrl']) || qs.get('tracking_url') || qs.get('trackingUrl')
    const send_email = ((): boolean => {
      const v = (parsed['send_email'] ?? parsed['sendEmail'] ?? qs.get('send_email') ?? qs.get('sendEmail'))
      if (typeof v === 'boolean') return v
      if (typeof v === 'string') return v.toLowerCase() === 'true'
      return true
    })()

    // Basic config
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey || !anonKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // 🚨 VULNERABILITY FIX: AUTHENTICATION + RBAC (Role-Based Access Control)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing Authorization header' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify caller identity.
    // JWT'yi AÇIKÇA geçir. Argümansız `getUser()` önce oturum deposuna bakar; edge
    // runtime'da oturum deposu YOKTUR → "Auth session missing" → burada 401'e dönüşür.
    // Belirti: geçerli bir admin token'ıyla bile 401. e2e ile ölçüldü (2026-08-14):
    // aynı token+anon key /auth/v1/user'a doğrudan gidince 200 dönüyordu, fonksiyon
    // içinden 401. anonKey boş DEĞİL (boş olsa satır 68 CONFIG_MISSING/500 dönerdi).
    const jwt = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authErr } = await authClient.auth.getUser(jwt)
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid or expired token' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
    }

    // Verify caller role (Must be admin or superadmin)
    // Rol VE tenant TEK sorgudan; filtre YALNIZ doğrulanmış `user.id`.
    const roleCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(user.id)}&select=role,tenant_id`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
    })

    if (!roleCheck.ok) {
      return new Response(JSON.stringify({ error: 'internal_error', message: 'Failed to verify user role' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
    }

    const profileRow = firstProfileRow(await roleCheck.json().catch(() => []))
    const role = profileRow?.role
    if (role !== 'admin' && role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'forbidden', message: 'Insufficient privileges' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
    }

    // Doğrulanmış kullanıcı + profil satırı → tenant. Çelişen `app_metadata` claim'i 403
    // (mesaj gövdesinde UUID yok).
    let tenantId: string
    try {
      tenantId = tenantFromVerifiedUser(
        { id: user.id, app_metadata: user.app_metadata ?? null },
        profileRow,
      ).tenantId
    } catch (tenantErr) {
      if (tenantErr instanceof TenantMismatchError) {
        return new Response(JSON.stringify({ error: 'forbidden', message: 'tenant_mismatch' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
      }
      throw tenantErr
    }

    // Read current order status to allow implicit cancel (if already shipped and no carrier/tracking provided)
    let isCurrentlyShipped = false
    if (order_id) {
      try {
        const cur = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=status,shipped_at`, {
          headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
        })
        if (cur.ok) {
          const arr = await cur.json().then(x => Array.isArray(x) ? x : []).catch(() => [])
          const row = arr[0]
          if (row && (row.shipped_at !== null || String(row.status) === 'shipped')) {
            isCurrentlyShipped = true
          }
        }
      } catch {}
    }

    const wantCancel = cancel || (isCurrentlyShipped && (!carrier || !tracking_number))

    // Cancel flow: revert shipping
    if (wantCancel) {
      if (!order_id) {
        return new Response(JSON.stringify({ error: 'missing_fields', missing: ['order_id'] }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
      }
      const updCancel = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ carrier: null, tracking_number: null, tracking_url: null, shipped_at: null, status: 'confirmed' })
      })
      if (!updCancel.ok) {
        const txt = await updCancel.text()
        return new Response(JSON.stringify({ error: 'cancel_failed', status: updCancel.status, body: txt }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({ ok: true, action: 'cancel' }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Validate for ship/update _path
    if (!order_id || !carrier || !tracking_number) {
      return new Response(JSON.stringify({ error: 'missing_fields', missing: [!order_id && 'order_id', !carrier && 'carrier', !tracking_number && 'tracking_number'].filter(Boolean) }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // ── AYNI TAKİP NUMARASI BAŞKA BİR SİPARİŞTE Mİ? (T058-VH) ────────────────
    //
    // Denetim (2026-08-15 §4) toplu kargolamanın AYNI takip numarasını N siparişe
    // yazdığını ölçtü: farklı müşterilere ait siparişler aynı numarayı taşıyor ve her
    // müşteriye BAŞKASININ kolisinin takip linki e-postalanıyordu. İstemci tarafı
    // düzeltildi (ADMIN-OPS, #557: takip numarası artık sipariş başına) — ama SUNUCU
    // hâlâ müsamahakârdı. İki bağımsız ölçüm (EDGE + LEGAL-OPS) doğruladı:
    // `venthub_orders` üzerinde takip numarasıyla ilgili TEK bir kısıt/indeks yok.
    //
    // İstemcideki bir düzeltme kapı DEĞİLDİR: aynı ucu curl'leyen, eski bir sekme
    // kullanan ya da yarın yazılacak başka bir istemci aynı hatayı tekrar yapar.
    //
    // NİÇİN VERİTABANI KISITI DEĞİL: gerçek lojistikte aynı müşterinin iki siparişini
    // TEK kolide birleştirmek meşrudur. Benzersizlik kısıtı bunu tamamen yasaklardı.
    // Doğru denge: **varsayılan RED, açık niyetle izin.** Çağıran birleştirmeyi
    // gerçekten istiyorsa `allow_shared_tracking: true` göndererek beyan eder; o zaman
    // karar kayda geçer ve kaza ile bilinçli tercih birbirinden ayrılabilir.
    // `pick` yalnız string/number döndürür (kırpar); burada gereken BOOLEAN niyet beyanı.
    // Yalnız gerçek `true` ya da açık `'true'` dizesi kabul edilir — "1"/"yes"/boş-değil
    // gibi gevşek doğruluk, kaza ile beyan üretir ve beyanın anlamını yok eder.
    const sharedFlag = parsed['allow_shared_tracking'] ?? parsed['allowSharedTracking']
    const allowSharedTracking = sharedFlag === true || sharedFlag === 'true'
    if (!allowSharedTracking) {
      const dupResp = await fetch(
        `${supabaseUrl}/rest/v1/venthub_orders` +
          `?tracking_number=eq.${encodeURIComponent(tracking_number)}` +
          `&tenant_id=eq.${encodeURIComponent(tenantId)}` +
          `&id=neq.${encodeURIComponent(order_id)}` +
          `&select=id&limit=5`,
        { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
      )
      // Kontrol YAPILAMADIYSA yazmayız. Bu kontrolün amacı veri bozulmasını önlemek;
      // "sorguyu koşamadım, o hâlde geçireyim" demek kapıyı fail-open yapardı.
      if (!dupResp.ok) {
        const detail = await dupResp.text().catch(() => '')
        return new Response(JSON.stringify({
          error: 'tracking_check_failed',
          message: 'Takip numarası benzersizlik kontrolü yapılamadı; kargo bilgisi YAZILMADI.',
          status: dupResp.status,
          detail: detail.slice(0, 200),
        }), { status: 503, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
      }
      const dupRows = await dupResp.json().then((x: unknown) => Array.isArray(x) ? x : []).catch(() => [])
      if (dupRows.length > 0) {
        return new Response(JSON.stringify({
          error: 'tracking_number_in_use',
          message:
            'Bu takip numarası başka bir siparişte kayıtlı. Farklı müşterilere aynı takip ' +
            'linkini göndermek veri bozulmasıdır. Gerçekten tek kolide birleştiriyorsanız ' +
            'isteği `allow_shared_tracking: true` ile tekrarlayın.',
          tracking_number,
          conflicting_order_ids: dupRows.map((r: { id: string }) => r.id),
        }), { status: 409, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
      }
    }

    // Fetch current order to decide first-time vs update (preserve shipped_at if already set)
    let isFirstShip = true
    try {
      const cur = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=status,shipped_at`, {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
      })
      if (cur.ok) {
        const arr = await cur.json().then(x => Array.isArray(x) ? x : []).catch(() => [])
        const row = arr[0]
        if (row && (row.shipped_at !== null || String(row.status) === 'shipped')) {
          isFirstShip = false
        }
      }
    } catch {}

    // Idempotency key (optional but recommended)
    async function computeIdemKey(action: 'ship' | 'cancel', orderId: string, carrier?: string|null, tn?: string|null) {
      const raw = [action, orderId || '', carrier || '', tn || ''].join('|')
      const bytes = new TextEncoder().encode(raw)
      const hash = await crypto.subtle.digest('SHA-256', bytes)
      return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
    }

    // patch order (only set shipped_at if first time)
    const patchBody: Record<string, unknown> = {
      carrier,
      tracking_number,
      tracking_url: tracking_url ?? null,
    }
    if (isFirstShip) {
      patchBody['shipped_at'] = new Date().toISOString()
      patchBody['status'] = 'shipped'
    }
    const upd = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(patchBody)
    })

    if (!upd.ok) {
      const txt = await upd.text()
      return new Response(JSON.stringify({ error: 'update_failed', status: upd.status, body: txt }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
    }

    // Record idempotency after successful update (best-effort)
    try {
      const headerKey = req.headers.get('x-idempotency-key') || ''
      const derivedKey = await computeIdemKey(isFirstShip ? 'ship':'ship', order_id, carrier || null, tracking_number || null)
      const idemKey = headerKey || derivedKey
      if (idemKey) {
        await fetch(`${supabaseUrl}/rest/v1/shipping_idempotency`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'resolution=ignore-duplicates' },
          body: JSON.stringify({ key: idemKey, scope: 'admin-update-shipping' })
        })
      }
    } catch {}

    // Derive customer email/name for notification
    let customer_email: string | null = null
    let customer_name: string | null = null
    try {
      const ordResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=user_id,order_number`, {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
      })
      if (ordResp.ok) {
        const arr = await ordResp.json().then(x=>Array.isArray(x)?x:[]).catch(()=>[])
        const row = arr[0]
        const uid = row?.user_id
        if (uid) {
          // Use Auth Admin API to fetch user securely with service role
          const usrResp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(uid)}`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
          })
          if (usrResp.ok) {
            const u = await usrResp.json().catch(()=>null) as { email?: string; user_metadata?: { full_name?: string; name?: string } }
            customer_email = (u && u.email) || null
            const metaName = u && u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)
            customer_name = (customer_name || metaName || null)
          }
        }
      }
    } catch {}

    // optional email with result flags
    const emailResult = { sent: false, disabled: false }
    if (send_email) {
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/shipping-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
          body: JSON.stringify({ order_id, carrier, tracking_number, tracking_url, customer_email, customer_name, tenant_id: tenantId })
        })
        interface ShippingNotifyResponse { disabled?: boolean; subject?: string; result?: { id?: string } }
        let j: ShippingNotifyResponse | null = null
        try { j = await resp.json() } catch {}
        if (resp.ok) {
          if (j && j.disabled) emailResult.disabled = true; else emailResult.sent = true
          // Log shipping email event (best-effort)
          try {
            const body = JSON.stringify({
              order_id,
              email_to: customer_email || '',
              subject: (j && j.subject) || 'Kargo bildirimi',
              provider: 'resend',
              provider_message_id: (j && j.result && j.result.id) || null,
              carrier,
              tracking_number,
              tenant_id: tenantId
            })
            await fetch(`${supabaseUrl}/rest/v1/shipping_email_events`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'return=minimal' },
              body
            })
          } catch {}
        }
      } catch {}
    }

    return new Response(JSON.stringify({ ok: true, email: emailResult }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : String(_e)
    return new Response(JSON.stringify({ error: 'unexpected', message: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  }
})
