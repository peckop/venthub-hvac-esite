// Çağıran sınıfı: (c) DB tetiği (pg_net) — paylaşılan sır + ZORUNLU timestamp replay guard
//
// NİÇİN BU UÇ VAR (T137-VH · 2026-08-20)
// --------------------------------------
// Ödeme onayı e-postası ZATEN VARDI — ama iki kusurla, ve ikisi de T068-VH'de teklif
// tarafında kapattığım sınıfın aynısıydı:
//
//   (1) VERİYE BAĞLI DEĞİLDİ. `iyzico-callback` ucu `order-confirmation`'ı
//       `try { ... } catch { /* ignore */ }` içinde ateşle-unut çağırıyordu. Ağ düşerse,
//       uç soğuk başlarsa ya da 500 dönerse sipariş `paid` kalır, e-posta HİÇ gitmez ve
//       HİÇBİR İZ KALMAZ — log yok, yeniden deneme yok, kayıt yok.
//   (2) İDEMPOTANS HİÇ YOKTU. `order-confirmation` gönderimden SONRA deftere yazıyor ama
//       göndermeden ÖNCE oraya HİÇ BAKMIYOR. İki kez çağrılırsa iki e-posta gider.
//
// Bu uç ikisini birden kapatır: tetik `paid_at` damgasının İLK KEZ yazılmasına bağlıdır
// (durum karşılaştırmasına değil), ve gönderimden önce `paid_email_sent_at` damgasına bakar.
//
// NİÇİN "webhook" ADINDA
// -----------------------
// Bu uç sınıf (c)'dir ve `verify_jwt = false` ile çalışır; tek kimlik kanıtı gövdedeki
// sırdır. Adında `webhook` geçmesi tesadüf DEĞİL: `INV-EDGE-SECURITY` R9 kapısı webhook
// uçlarını ADA göre seçip HMAC/sır + ZORUNLU timestamp guard'ı zorunlu kılar. Ad böyle
// seçilerek uç, kapının KAPSAMI İÇİNDE doğar — sonradan "acaba kapsıyor mu" sorusu kalmaz.
//
// NİÇİN E-POSTAYI KENDİ GÖNDERMİYOR
// ----------------------------------
// Şablon ve gönderim mantığı `order-confirmation`'da yaşıyor ve çalışıyor. İkinci bir
// kopya çıkarmak, iki şablonun zamanla AYRIŞMASI demektir — bu depoda bugün tam olarak o
// sınıfı onardım (aynı kimlik iki kuralı gösteriyordu, #703). Bu uç orkestrasyon yapar:
// kimlik doğrular, idempotansı korur, gönderimi mevcut uca devreder, sonucu deftere yazar.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const SKEW_MS = 5 * 60 * 1000 // 5 dk tolerans (kardeş webhook'larla aynı pencere)
const KIND = 'order_paid'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Sabit zamanlı karşılaştırma — sır baytları zamanlamayla sızmasın (§3.5 disiplini). */
function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function hmacValid(secret: string, raw: string, signature: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw))
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return timingSafeEquals(hex, signature.replace(/^sha256=/i, '').toLowerCase())
  } catch {
    return false
  }
}

interface OrderPaidPayload {
  order_id?: string
  tenant_id?: string | null
  record?: { id?: string }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

    const raw = await req.text()

    // ── Sıra kutsal: (1) kimlik kanıtı → (2) replay guard → (3) ancak sonra DB ────────
    const secret = Deno.env.get('ORDER_PAID_WEBHOOK_SECRET') || ''
    if (!secret) return json({ error: 'CONFIG_MISSING' }, 500) // fail-closed: sır yoksa çalışma

    const sign = req.headers.get('x-signature') || ''
    const token = req.headers.get('x-webhook-secret') || ''
    let authorized = false
    if (sign) authorized = await hmacValid(secret, raw, sign)
    if (!authorized && token) authorized = timingSafeEquals(token, secret)
    if (!authorized) return json({ error: 'unauthorized' }, 401)

    // Timestamp ZORUNLU. "Başlık varsa kontrol et" fail-OPEN'dır: göndermeyen çağıran için
    // guard hiç çalışmaz (§3.5 — yeni kapıya geçiş modu konmaz).
    const tsHeader = req.headers.get('x-timestamp') || ''
    if (!tsHeader) return json({ error: 'missing_timestamp' }, 401)
    const t = /^\d+$/.test(tsHeader.trim()) ? parseInt(tsHeader.trim(), 10) : Date.parse(tsHeader)
    if (!t || Math.abs(Date.now() - t) > SKEW_MS) return json({ error: 'stale_timestamp' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) return json({ error: 'CONFIG_MISSING' }, 500)

    let payload: OrderPaidPayload = {}
    try {
      payload = JSON.parse(raw) as OrderPaidPayload
    } catch {
      return json({ error: 'invalid_json' }, 400)
    }
    const orderId = payload.order_id || payload.record?.id
    if (!orderId) return json({ error: 'order_id_required' }, 400)

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const { data: order, error: orderErr } = await supabase
      .from('venthub_orders')
      .select('id, tenant_id, payment_status, paid_at, paid_email_sent_at')
      .eq('id', orderId)
      .maybeSingle()
    // Okuma düştüyse 503: "bakamadım" ile "yok" AYNI cevaba düşmemeli (pg_net tekrar dener).
    if (orderErr) return json({ error: 'order_lookup_failed' }, 503)
    if (!order) return json({ error: 'order_not_found' }, 404)

    // Tetik yalnız paid geçişinde ateşlenir; yine de uç KENDİ ön koşulunu doğrular —
    // bekçi, çağıranın doğru davrandığı VARSAYIMIYLA yazılmaz.
    if (order.payment_status !== 'paid' || !order.paid_at) {
      return json({ error: 'order_not_paid', payment_status: order.payment_status }, 409)
    }

    // ── İDEMPOTANS ────────────────────────────────────────────────────────────────
    // Tetik yeniden kurulur, pg_net tekrar dener, migration yeniden koşar — hepsinde bu
    // uç ikinci kez çağrılabilir. Damga DB'de tutulur (bellekte değil): aynı sipariş için
    // ikinci e-posta ASLA gitmez. 200 dönülür çünkü çağıran açısından iş TAMAMDIR.
    if (order.paid_email_sent_at) {
      return json({ ok: true, skipped: 'already_sent', order_id: order.id }, 200)
    }

    // ── ÖNCE 'attempt' SATIRI — ölüm penceresini görünür kılar ─────────────────────
    // Sıra bilinçli: GÖNDER → DAMGALA (at-least-once). Ters sırası (önce damgala) çift
    // gönderimi imkânsız kılardı ama uç damgadan sonra ölürse e-posta hiç gitmez ve damga
    // "gitti" der — sessiz kayıp, yani T068-VH'nin kapattığı sınıf. Müşteri PARA ÖDEDİ:
    // eksik onay, mükerrer onaydan pahalıdır.
    // Bu satır mükerrerliği ENGELLEMEZ; gönderim ile damga arasında ölen bir çağrının TEK
    // izi olur. Terminal duruma hiç geçmeyen bir attempt = "e-posta gitmiş olabilir".
    let denemeId: string | null = null
    try {
      const { data: deneme } = await supabase
        .from('order_email_events')
        .insert({ order_id: order.id, kind: KIND, provider: 'resend', status: 'attempt' })
        .select('id')
        .maybeSingle()
      denemeId = deneme?.id ?? null
    } catch { /* defter düşerse gönderimi ENGELLEME — kayıt gözlem içindir, kapı değil */ }

    // ── Gönderim: mevcut uca devredilir (tek şablon, tek gönderim mantığı) ─────────
    let gonderimHatasi: string | null = null
    try {
      const resp = await fetch(`${supabaseUrl}/functions/v1/order-confirmation`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: order.id, tenant_id: order.tenant_id }),
      })
      if (!resp.ok) {
        gonderimHatasi = `order-confirmation ${resp.status}: ${(await resp.text().catch(() => '')).slice(0, 500)}`
      }
    } catch (e) {
      gonderimHatasi = e instanceof Error ? e.message : String(e)
    }

    if (gonderimHatasi) {
      // ⭐ BAŞARISIZLIK DA SATIR BIRAKIR. Defter yalnız başarıyı yazdığı sürece "niçin
      // gitmedi" sorusu cevapsız kalır ve sessiz kayıp hiçbir yerde görünmez (T068 dersi).
      // Bu yazma best-effort'tur: defter düşerse asıl hatayı YUTMAMALI.
      try {
        if (denemeId) {
          await supabase.from('order_email_events')
            .update({ status: 'failed', error: gonderimHatasi.slice(0, 1000) })
            .eq('id', denemeId)
        } else {
          await supabase.from('order_email_events').insert({
            order_id: order.id,
            kind: KIND,
            provider: 'resend',
            status: 'failed',
            error: gonderimHatasi.slice(0, 1000),
          })
        }
      } catch { /* defter düşse bile asıl hata aşağıda bildirilecek */ }
      // 500: pg_net tekrar dener. Damga ATILMADIĞI için tekrar denemesi GÜVENLİ.
      return json({ error: 'send_failed', detail: gonderimHatasi.slice(0, 500) }, 500)
    }

    // ── Damga — YALNIZ gönderim başarılı olduktan sonra, ve YALNIZ hâlâ boşsa ──────
    // `.is('paid_email_sent_at', null)` koşulu yarışı kapatır: iki eşzamanlı çağrıdan
    // yalnız biri damgayı yazar. Kaç satır etkilendiği, e-postanın BU çağrıda gidip
    // gitmediğinin kanıtıdır.
    const { data: stamped, error: stampErr } = await supabase
      .from('venthub_orders')
      .update({ paid_email_sent_at: new Date().toISOString() })
      .eq('id', order.id)
      .is('paid_email_sent_at', null)
      .select('id')

    if (stampErr) {
      // E-posta GİTTİ ama damga yazılamadı: en tehlikeli hâl, çünkü tekrar denemede
      // ikinci e-posta gidebilir. Deftere `sent` yazılması bu durumda SON SAVUNMADIR
      // (uq_order_email_events_sent_once kısıtı ikinci `sent` satırını reddeder).
      console.error(`[order-paid-webhook] damga yazilamadi, e-posta GITTI: ${order.id} — ${stampErr.message}`)
    }

    try {
      if (denemeId) {
        await supabase.from('order_email_events').update({ status: 'sent' }).eq('id', denemeId)
      } else {
        await supabase.from('order_email_events').insert({
          order_id: order.id,
          kind: KIND,
          provider: 'resend',
          status: 'sent',
        })
      }
    } catch { /* kısıt ikinci `sent` satırını reddeder — beklenen davranış */ }

    return json({
      ok: true,
      order_id: order.id,
      stamped: (stamped?.length ?? 0) > 0,
    }, 200)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return json({ error: 'unexpected', message: msg }, 500)
  }
})
