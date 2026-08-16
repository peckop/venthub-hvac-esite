// Çağıran sınıfı: (c) harici kargo/iade sistemi — HMAC imzası + zorunlu timestamp
//
// supabase/functions/returns-webhook/index.ts
// Receives carrier webhook for return shipments. On delivered, marks venthub_returns.status='received'.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RETURNS_WEBHOOK_SECRET (HMAC) or RETURNS_WEBHOOK_TOKEN
//
// TENANT (T026-VH Adım 5): kargo firması tenant UUID'lerimizi bilmez; `return_id`/`order_id`
// bilir. Tenant istekten OKUNMAZ — imza doğrulandıktan sonra `venthub_returns` satırından
// TÜRETİLİR (`_shared/tenant.ts::tenantFromRow`). Eski kod `resolveTenantId(req, body)` ile
// istekten okuyup bunu PostgREST filtresine koyuyordu: filtreyi saldırganın verdiği değerle
// kurmak sınırı çizmez, sınırı SALDIRGANA çizdirir (cetvel §3.9).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { tenantFromRow } from '../_shared/tenant.ts'
import { canCarrierTransition } from '../_shared/return_transitions.ts'

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
  // TANIMADIĞIMIZ STATÜ YAZILMAZ. Eskiden burası `return { status: s }` idi: kargo
  // firmasının gönderdiği ham dize doğrudan patch'e giriyordu. Bilinmeyen bir değer ya
  // DB CHECK kısıtına çarpıp 500 üretir, ya da (kısıt gevşerse) statü sözlüğünü sessizce
  // genişletir. Kuralı olmayan girdiyi geçirmek, kapıyı dış sisteme yazdırmaktır.
  return {}
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

const SKEW_MS = 5 * 60 * 1000 // 5 minutes tolerance

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 })

    const raw = await req.text()
    let body: unknown = {}
    try { body = JSON.parse(raw) } catch {}

    // TENANT BURADA ÇÖZÜLMEZ. Sıra kutsal: önce imza/token, sonra replay guard, sonra
    // DB'ye dokunuş, en son iade satırından türetme (aşağıda `tenantFromRow`).
    const secret = Deno.env.get('RETURNS_WEBHOOK_SECRET') || ''
    const token = Deno.env.get('RETURNS_WEBHOOK_TOKEN') || ''
    const sign = req.headers.get('x-signature') || ''
    const tok = req.headers.get('x-webhook-token') || ''
    let ok = false
    if (secret && sign) ok = await hmacValid(secret, raw, sign)
    if (!ok && token && tok && tok === token) ok = true
    if (!ok) return json({ error: 'Unauthorized' }, { status: 401 })

    // Enforce replay guard - mandatory timestamp header
    const tsHeader = req.headers.get('x-timestamp') || req.headers.get('x-event-time') || ''
    if (!tsHeader) {
      return json({ error: 'Missing timestamp header' }, { status: 401 })
    }

    let t = 0
    // support epoch ms or ISO
    if (/^\d+$/.test(tsHeader.trim())) {
      t = parseInt(tsHeader.trim(), 10)
    } else {
      const d = Date.parse(tsHeader)
      t = Number.isFinite(d) ? d : 0
    }
    if (!t || Math.abs(Date.now() - t) > SKEW_MS) {
      return json({ error: 'Stale or invalid timestamp' }, { status: 401 })
    }


    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: 'Config missing' }, { status: 500 })

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    const p = normalizePayload(body) as { return_id?: string; order_id?: string; carrier?: string; tracking_number?: string; status?: string; delivered_at?: string }

    // Optional dedup. Tenant filtresi KALDIRILDI: filtre istekten gelen değerle kuruluyordu,
    // yani farklı bir `?tenant_id=` göndermek idempotency'yi atlatıyordu. `event_id` kargo
    // firmasının global tekil kimliği; varlığı tek başına "bu olay işlendi" demektir.
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

    // Fetch current status — tenant SÜTUNU da seçilir çünkü tenant buradan TÜRETİLİR.
    const { data: cur, error: curErr } = await supabase.from('venthub_returns').select('id,status,tenant_id').eq('id', returnId).single()
    if (curErr || !cur) return json({ error: 'Return not found' }, { status: 404 })

    // ★ TENANT TÜRETME NOKTASI — imza + replay guard'dan SONRA, iade satırından.
    // Bundan sonraki HER yazma/sorgu/bildirim bu değeri kullanır.
    const { tenantId, source: tenantSource } = tenantFromRow(cur)

    // Çapraz-kaynak (sipariş) okumasında tenant filtresi YALNIZ tenant'ı gerçekten satırdan
    // türetebildiysek kurulur. Satırın tenant'ı boşsa `tenantFromRow` DEFAULT'a düşer; o
    // uydurulmuş değeri filtreye koymak eski satırlarda sorguyu sessizce boşa çıkarır
    // (bildirim zinciri kırılır) — bilmediğimiz sınırı varmış gibi çizmeyiz.
    const orderTenantFilter = tenantSource === 'resource_row'
      ? `&tenant_id=eq.${encodeURIComponent(tenantId)}`
      : ''

    const mapped = mapReturnStatus(p.status)
    const patch: Record<string, unknown> = {}
    if (mapped.status) patch['status'] = mapped.status

    // ── Geçiş kapısı ──────────────────────────────────────────────────────────────
    // ESKİDEN BURADA BİR SIRALAMA (rank) HARİTASI VARDI ve iki yerden sızdırıyordu:
    //   • `rejected` sonlanma durumu olduğu hâlde rütbesi 1'di → kargo firmasının
    //     gönderdiği `in_transit` (2) "ilerleme" sayılıp REDDEDİLMİŞ iadeyi canlandırıyordu.
    //   • `refunded` ve `cancelled` eşit rütbedeydi (4) ve kontrol `nextRank < curRank`
    //     olduğu için `4 < 4` yanlış → parası iade edilmiş iade `cancelled`'a çevrilebiliyordu.
    // Kök sebep: iade akışı bir SIRA değil, bir geçiş grafiğidir. Tablo artık
    // `_shared/return_transitions.ts`'te ve sonlanma durumları SOĞURUCU.
    const nextStatusCandidate = String(patch['status'] ?? cur.status)
    const verdict = canCarrierTransition(String(cur.status), nextStatusCandidate)
    if (!verdict.allowed) {
      // 200 dönülür: kargo firmasının kuyruğu tekrar tekrar denemesin. Reddin SEBEBİ
      // gövdede açıkça yazar — sessiz yutma değil, kayıtlı ret.
      return json({
        ok: true,
        unchanged: true,
        reason: 'transition_blocked',
        detail: verdict.reason,
        current: cur.status,
        attempted: nextStatusCandidate,
      })
    }

    // Update returns row
    let updated = false
    if (Object.keys(patch).length > 0) {
      const { error: updErr } = await supabase.from('venthub_returns').update(patch).eq('id', returnId)
      if (updErr) return json({ error: updErr.message || 'DB update failed' }, { status: 500 })
      updated = true
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
          tenant_id: tenantId,
        })
      }
    } catch {}

    // Optional email: send only when we progressed to 'received'
    try {
      const nextStatus = (patch['status'] as string) || String(cur.status)
      if (updated && nextStatus === 'received') {
        // Load full return + order + user for notification payload
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
        const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        if (SUPABASE_URL && SERVICE_KEY) {
          // 1) Return details (reason, description, order_id fallback)
          let rOrderId = p.order_id || ''
          let reason = ''
          let description = ''
          try {
            // Tenant filtresi YOK: bu, tenant'ı türettiğimiz SATIRIN kendisi (id tekil).
            // Filtre eklemek totoloji olurdu, dahası satırın tenant'ı boşken sorguyu boşa çıkarırdı.
            const r = await fetch(`${SUPABASE_URL}/rest/v1/venthub_returns?id=eq.${encodeURIComponent(returnId)}&select=order_id,reason,description,status`, {
              headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY }
            })
            if (r.ok) {
              const arr = await r.json().catch(()=>[])
              const row = Array.isArray(arr) ? arr[0] : null
              if (row) {
                rOrderId = rOrderId || String(row.order_id || '')
                reason = String(row.reason || '')
                description = String(row.description || '')
              }
            }
          } catch {}
          // 2) Order details (order_number, user_id)
          let orderNumber = ''
          let userId = ''
          if (rOrderId) {
            try {
              const o = await fetch(`${SUPABASE_URL}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(rOrderId)}${orderTenantFilter}&select=order_number,user_id`, {
                headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY }
              })
              if (o.ok) {
                const arr = await o.json().catch(()=>[])
                const row = Array.isArray(arr) ? arr[0] : null
                if (row) {
                  orderNumber = String(row.order_number || '')
                  userId = String(row.user_id || '')
                }
              }
            } catch {}
          }
          // 3) User email/name via Auth Admin API
          let customerEmail = ''
          let customerName = ''
          if (userId) {
            try {
              const u = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
                headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY }
              })
              if (u.ok) {
                interface UserMetadata { full_name?: string; name?: string }
                interface UserResponse { email?: string; user_metadata?: UserMetadata }
                const ju = await u.json().catch(()=>null) as UserResponse | null
                if (ju) {
                  customerEmail = String(ju.email || '')
                  const meta = (ju.user_metadata || {}) as UserMetadata
                  customerName = String(meta.full_name || meta.name || '')
                }
              }
            } catch {}
          }
          // 4) Invoke return-status-notification
          if (customerEmail && customerName) {
            try {
              await fetch(`${SUPABASE_URL}/functions/v1/return-status-notification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
                body: JSON.stringify({
                  return_id: returnId,
                  order_id: rOrderId,
                  order_number: orderNumber,
                  customer_email: customerEmail,
                  customer_name: customerName,
                  old_status: String(cur.status || ''),
                  new_status: nextStatus,
                  reason,
                  description,
                  tenant_id: tenantId
                })
              })
            } catch {}
          }
        }
      }
    } catch {}

    return json({ ok: true, return_id: returnId, status: (patch['status'] || cur.status) })
  } catch (_e) {
    console.error('Returns webhook error:', _e);
    return json({ error: _e instanceof Error ? _e.message : 'Unexpected error' }, { status: 500 })
  }
})
