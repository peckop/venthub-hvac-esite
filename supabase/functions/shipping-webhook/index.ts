// Çağıran sınıfı: (c) harici kargo/iade sistemi — HMAC imzası + zorunlu timestamp
//
// Supabase Edge Function: shipping-webhook
// Receives carrier sandbox/live webhook and updates order shipping fields securely
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Optional (recommended): SHIPPING_WEBHOOK_SECRET (HMAC-SHA256) or SHIPPING_WEBHOOK_TOKEN (legacy)
//
// TENANT (T026-VH Adım 5): kargo firması bizim tenant UUID'lerimizi BİLMEZ — `order_id` /
// `order_number` bilir. Bu yüzden tenant istekten OKUNMAZ, imzalı isteğin işaret ettiği
// `venthub_orders` satırından TÜRETİLİR (`_shared/tenant.ts::tenantFromRow`). Eski kod
// `resolveTenantId(req, payload)` ile istekten okuyup satırla KARŞILAŞTIRIYORDU; karşılaştırma
// `isMockEnv` dalıyla testlerde tamamen atlanıyordu — yani kapı test edilmiyordu (cetvel §3.9).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { tenantFromRow } from '../_shared/tenant.ts'
import { kargoHedefiCoz, kargoYazimKarari, tetikReddiMi } from '../_shared/kargo_webhook_gecis.ts'

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
    status: init.status || 200,
  })
}

async function hmacValid(secret: string, raw: string, signatureHeader: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw))
    const computed = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    // Yalnız BASE64 imza kabul edilir (hex kabul EDİLMEZ); yalnız `sha256=` öneki normalize edilir
    const normalize = (s: string) => s.trim().replace(/^sha256=/i, '')
    const given = normalize(signatureHeader)
    return given === computed
  } catch {
    return false
  }
}

function normalizePayload(carrierHint: string, obj: unknown) {
  const rec = (typeof obj === 'object' && obj !== null) ? (obj as Record<string, unknown>) : {};
  const c = (carrierHint || (typeof rec.carrier === 'string' ? rec.carrier : '') || '').toString().trim().toLowerCase()
  // Common aliases
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      if (k in rec) {
        const v = rec[k]
        if (v != null) return v
      }
    }
    return undefined
  }
  const norm = {
    order_id: (pick('order_id','orderId','id') || '').toString(),
    order_number: (pick('order_number','orderNo','orderCode') || '').toString(),
    carrier: c || (pick('carrier','provider') || '').toString(),
    tracking_number: (pick('tracking_number','trackingNumber','trackingNo','tn') || '').toString(),
    tracking_url: (pick('tracking_url','trackingUrl','url','link') || '').toString(),
    status: (pick('status','state','shipmentStatus') || '').toString(),
    shipped_at: (pick('shipped_at','shippedAt','shipDate') || '').toString(),
    delivered_at: (pick('delivered_at','deliveredAt','deliveryDate') || '').toString(),
  }
  // Example: mock carrier custom mapping
  if (c === 'mock') {
    // no extra mapping for now
  }
  return norm
}

async function sha256Base64(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

const SKEW_MS = 5 * 60 * 1000 // 5 minutes tolerance

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
    }

    // Read raw body first for signature verification
    const raw = await req.text()
    let payload: unknown = {}
    try { payload = JSON.parse(raw) } catch { payload = {} }

    // TENANT BURADA ÇÖZÜLMEZ. Sıra kutsal: önce imza/token, sonra replay guard, sonra
    // DB'ye dokunuş, en son sipariş satırından türetme (aşağıda `tenantFromRow`).
    const secret = Deno.env.get('SHIPPING_WEBHOOK_SECRET') || ''
    const signature = req.headers.get('x-signature') || req.headers.get('x-carrier-signature') || ''
    let authorized = false

    if (secret && signature) {
      authorized = await hmacValid(secret, raw, signature)
    }

    // Legacy token fallback (sandbox)
    if (!authorized) {
      const token = req.headers.get('x-webhook-token') || ''
      const expected = Deno.env.get('SHIPPING_WEBHOOK_TOKEN') || ''
      if (expected && token === expected) authorized = true
    }

    if (!authorized) {
      return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
    }

    // Replay guard — ZORUNLU (T025-VH, 2026-08-15). Eskiden "başlık varsa kontrol et"ti;
    // yani göndermeyen çağıran için guard hiç çalışmıyordu = fail-OPEN. Kardeşi
    // `returns-webhook` (satır 76) başlığı zaten ZORUNLU tutuyor — asimetri kusurdu.
    // Cetvel §3.5: kapı ya vardır ya yoktur; "uyar-geç"/"varsa uygula" geçiş modu YASAK.
    // Şu an entegre bir kargo sağlayıcısı YOK, yani kıracak canlı çağıran da yok —
    // kapıyı sıkı kurmanın en ucuz anı burası. Sağlayıcı bağlanırken `x-timestamp`
    // (veya `x-event-time`) göndermesi ENTEGRASYON ÖN KOŞULUDUR.
    const tsHeader = req.headers.get('x-timestamp') || req.headers.get('x-event-time') || ''
    if (!tsHeader) {
      return jsonResponse({ error: 'Missing timestamp header' }, { status: 401 })
    }
    {
      let t = 0
      // support epoch ms or ISO
      if (/^\d+$/.test(tsHeader.trim())) {
        t = parseInt(tsHeader.trim(), 10)
      } else {
        const d = Date.parse(tsHeader)
        t = Number.isFinite(d) ? d : 0
      }
      if (!t || Math.abs(Date.now() - t) > SKEW_MS) {
        return jsonResponse({ error: 'Stale or invalid timestamp' }, { status: 401 })
      }
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return jsonResponse({ error: 'Function misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // Normalize payload (carrier adapters)
    const carrierHint = (req.headers.get('x-carrier') || '') as string
    const p = normalizePayload(carrierHint, payload) as {
      order_id?: string
      order_number?: string
      carrier?: string
      tracking_number?: string
      tracking_url?: string
      status?: string
      shipped_at?: string
      delivered_at?: string
    }

    // Optional dedup by event id
    // Dedup, tenant türetmeden ÖNCE gelir çünkü henüz sipariş satırı okunmadı. Eskiden burada
    // `matched.tenant_id === tenantId` karşılaştırması vardı ve `tenantId` İSTEKTEN geliyordu —
    // yani saldırgan farklı bir `?tenant_id=` göndererek idempotency'yi ATLAYABİLİYORDU.
    // `event_id` kargo firmasının global tekil kimliği; varlığı tek başına "bu olay işlendi"
    // demektir. Karşılaştırmayı silmek burada sınırı gevşetmez, bypass kolunu kaldırır.
    const eventId = (req.headers.get('x-id') || req.headers.get('x-event-id') || '').trim()
    if (eventId) {
      try {
        const { data: existing } = await supabase
          .from('shipping_webhook_events')
          .select('event_id')
          .eq('event_id', eventId)
          .limit(1)
        if (Array.isArray(existing) && existing.length > 0) {
          return jsonResponse({ ok: true, event_id: eventId, duplicate: true, unchanged: true })
        }
      } catch {}
    }

    let orderId = (p.order_id || '').trim()

    if (!orderId && p.order_number) {
      const { data, error } = await supabase
          .from('venthub_orders')
          .select('id, tenant_id')
          .eq('order_number', p.order_number)
          .limit(1)
          .single()
      if (error || !data) return jsonResponse({ error: 'Order not found for given order_number' }, { status: 404 })
      orderId = data?.id as string
    }

    if (!orderId) {
      return jsonResponse({ error: 'order_id or order_number is required' }, { status: 400 })
    }

    // Fetch current to enforce monotonic status progression and for idempotency
    interface OrderRow { id: string; tenant_id?: string; status?: string; payment_status?: string | null; shipped_at?: string | null; delivered_at?: string | null; tracking_number?: string | null; tracking_url?: string | null; carrier?: string | null }
    const { data: current, error: curErr } = await supabase
      .from('venthub_orders')
      .select('id, tenant_id, status, payment_status, shipped_at, delivered_at, tracking_number, tracking_url, carrier')
      .eq('id', orderId)
      .single()
    if (curErr || !current) return jsonResponse({ error: 'Order not found' }, { status: 404 })

    // ★ TENANT TÜRETME NOKTASI — imza + replay guard'dan SONRA, sipariş satırından.
    // Bundan sonraki HER yazma/çağrı bu değeri kullanır; istekten okunan bir tenant YOK.
    const { tenantId } = tenantFromRow(current)

    const patch: Partial<OrderRow> & Record<string, unknown> = {}
    if (typeof p.carrier === 'string' && p.carrier) patch.carrier = p.carrier
    if (typeof p.tracking_number === 'string' && p.tracking_number) patch.tracking_number = p.tracking_number
    if (typeof p.tracking_url === 'string' && p.tracking_url) patch.tracking_url = p.tracking_url

    // ALT-134 — status'a YAZMA kararı saf modülde (`_shared/kargo_webhook_gecis.ts`): taşıyıcı kelimesi yalnız
    // shipped/delivered hedefine çözülür (ham değer, 'paid', 'failed' ASLA status'a gitmez); cancelled çıkışsız;
    // delivered, sipariş henüz shipped değilse iki adım; her adım okunan kaynak duruma bağlı yazılır.
    const curStatus = String(current.status || 'pending').toLowerCase()
    const cozum = kargoHedefiCoz(p.status)
    if (cozum.tur === 'durum_yok' && cozum.neden === 'bilinmeyen') {
      console.warn('[shipping-webhook] tanınmayan taşıyıcı durumu, status yazılmadı', { order_id: orderId, status_raw: p.status })
    }
    async function olayKaydet(statusMapped: string) {
      try {
        const bodyHash = await sha256Base64(raw)
        if (eventId) {
          await supabase.from('shipping_webhook_events').insert({
            event_id: eventId,
            order_id: orderId,
            carrier: p.carrier || null,
            status_raw: p.status || null,
            status_mapped: statusMapped,
            body_hash: bodyHash,
            received_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
            tenant_id: tenantId,
          })
        }
      } catch {}
    }

    // Cevap SINIRLI: yalnız { ok, order_id, status }. payment_status, tenant_id, müşteri bilgisi cevaba girmez;
    // yoksayma nedeni yalnız log'da ve olay kaydında (status_mapped `ignored:<neden>`), cevapta genel `ignored: true`.
    async function yoksay(neden: string, durumu: string) {
      console.error('[shipping-webhook] olay yoksayıldı', { code: neden, order_id: orderId, status: durumu, status_raw: p.status })
      await olayKaydet(`ignored:${neden}`)
      return jsonResponse({ ok: true, order_id: orderId, status: durumu, ignored: true, unchanged: true })
    }

    const parseDate = (s?: string) => {
      if (!s) return undefined
      const t = Date.parse(s)
      return Number.isFinite(t) ? new Date(t).toISOString() : undefined
    }
    const SELECT_KOLONLAR = 'id, tenant_id, status, carrier, tracking_number, tracking_url, shipped_at, delivered_at, order_number, customer_email, customer_name'
    type YazilanSatir = Record<string, unknown> & { status?: string }

    // Okunan sipariş durumu; kaynak durum koşulu tutmazsa (satır arada ilerledi) BİR KEZ yeniden okunur ve karar
    // taze durumla tekrar verilir — aksi halde ilerleyen yarışta teslim sinyali (tekrar gelmeyebilir) kaybolurdu.
    let okunan = {
      status: curStatus,
      payment_status: current.payment_status ?? null,
      shipped_at: current.shipped_at ?? null,
      delivered_at: current.delivered_at ?? null,
      tracking_number: current.tracking_number ?? null,
      tracking_url: current.tracking_url ?? null,
      carrier: current.carrier ?? null,
    }
    let data: YazilanSatir | null = null
    const yazilan: string[] = []

    for (let deneme = 0; deneme < 2; deneme++) {
      const karar = kargoYazimKarari({ status: okunan.status, payment_status: okunan.payment_status }, cozum)
      // Yoksayılan olay: 200 (taşıyıcı sonsuz yeniden denemesin), olay kaydı + günlük; siparişe HİÇBİR şey yazılmaz.
      if (karar.islem === 'yoksay') return await yoksay(karar.neden, okunan.status)

      // Yazım planı: adım yoksa tek (takip) yazımı; adım varsa her biri kendi kaynak durumuna bağlı.
      const plan: Array<{ kaynak: string; govde: Record<string, unknown> }> = []
      if (karar.islem === 'yalniz_takip') {
        plan.push({ kaynak: okunan.status, govde: { ...patch } })
      } else {
        karar.adimlar.forEach((adim, i) => {
          const govde: Record<string, unknown> = i === 0 ? { ...patch } : {}
          govde.status = adim.hedef
          if (adim.hedef === 'shipped' && !okunan.shipped_at) govde.shipped_at = parseDate(p.shipped_at) || new Date().toISOString()
          if (adim.hedef === 'delivered' && !okunan.delivered_at) govde.delivered_at = parseDate(p.delivered_at) || new Date().toISOString()
          plan.push({ kaynak: adim.kaynak, govde })
        })
      }

      // Etkisiz istek (takip alanları aynı, status adımı yok): yazmadan çık.
      const etkisiz = karar.islem === 'yalniz_takip' &&
        (patch.tracking_number == null || patch.tracking_number === okunan.tracking_number) &&
        (patch.tracking_url == null || patch.tracking_url === okunan.tracking_url) &&
        (patch.carrier == null || patch.carrier === okunan.carrier)
      if (etkisiz) {
        await olayKaydet(okunan.status)
        return jsonResponse({ ok: true, order_id: current.id, status: okunan.status, unchanged: true })
      }

      let yeniden = false
      for (const adim of plan) {
        const { data: satirlar, error } = await supabase
          .from('venthub_orders')
          .update(adim.govde)
          .eq('id', orderId)
          .eq('status', adim.kaynak)
          .select(SELECT_KOLONLAR)
        if (error) {
          if (tetikReddiMi(error)) {
            // Veritabanı monotonluk tetiği reddetti: fail-closed yazım (reddedilen adım yazılmadı), fail-safe cevap (200),
            // aksi halde taşıyıcı aynı olayı sonsuza kadar yeniden dener. Önceki adım yazıldıysa o durum raporlanır.
            console.error('[shipping-webhook] monotonluk tetiği reddetti', { code: 'MONOTON_REJECTED', order_id: orderId, status: okunan.status, status_raw: p.status })
            if (yazilan.length === 0) return await yoksay('MONOTON_REJECTED', okunan.status)
            break
          }
          const msg = (typeof (error as { message?: unknown })?.message === 'string') ? (error as { message: string }).message : 'Update failed'
          return jsonResponse({ error: msg }, { status: 500 })
        }
        const ilk = Array.isArray(satirlar) ? satirlar[0] : null
        if (!ilk) {
          // Kaynak durum tutmadı: satır okuma ile yazma arasında başka bir yazıcıyla ilerledi.
          if (yazilan.length > 0) break // önceki adım yazıldı; o durum raporlanır
          if (deneme === 0) {
            const { data: taze } = await supabase
              .from('venthub_orders')
              .select('id, status, payment_status, shipped_at, delivered_at, tracking_number, tracking_url, carrier')
              .eq('id', orderId)
              .single()
            if (taze) {
              okunan = {
                status: String(taze.status || 'pending').toLowerCase(),
                payment_status: taze.payment_status ?? null,
                shipped_at: taze.shipped_at ?? null,
                delivered_at: taze.delivered_at ?? null,
                tracking_number: taze.tracking_number ?? null,
                tracking_url: taze.tracking_url ?? null,
                carrier: taze.carrier ?? null,
              }
              yeniden = true
              break
            }
          }
          return await yoksay('STATE_CHANGED', okunan.status)
        }
        yazilan.push(String(adim.govde.status ?? 'takip'))
        data = ilk as YazilanSatir
      }
      if (!yeniden) break
    }
    if (!data) return jsonResponse({ error: 'Update failed' }, { status: 500 })
    // İki adımın yalnız ilki yazıldıysa cevap/kayıt GERÇEKLEŞEN son durumu söyler (unchanged yalnız hiç adım yazılmadıysa).

    // Insert event audit
    try {
      const bodyHash = await sha256Base64(raw)
      if (eventId) {
        await supabase.from('shipping_webhook_events').insert({
          event_id: eventId,
          order_id: orderId,
          carrier: p.carrier || null,
          status_raw: p.status || null,
          status_mapped: data?.status || undefined,
          body_hash: bodyHash,
          received_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
          tenant_id: tenantId,
        })
      }
    } catch {}

    // On delivered, send delivery notification (best effort)
    try {
      if ((data?.status || '').toLowerCase() === 'delivered' && yazilan.includes('delivered')) {
        await fetch(`${SUPABASE_URL}/functions/v1/delivery-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
          body: JSON.stringify({
            order_id: data?.id,
            order_number: (data as Record<string, unknown>)?.order_number,
            customer_email: (data as Record<string, unknown>)?.customer_email,
            customer_name: (data as Record<string, unknown>)?.customer_name,
            tenant_id: tenantId,
          })
        })
      }
    } catch {}

    return jsonResponse({ ok: true, order_id: data?.id, status: data?.status })
  } catch (_e) {
    console.error('Shipping webhook error:', _e);
    return jsonResponse({ error: _e instanceof Error ? _e.message : 'Unexpected error' }, { status: 500 })
  }
})

