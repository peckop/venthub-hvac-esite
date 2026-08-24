// Çağıran sınıfı: (c) DB tetiği (pg_net) — paylaşılan sır + ZORUNLU timestamp replay guard
//
// NİÇİN BU UÇ VAR (T068-VH · 2026-08-17)
// -------------------------------------
// Teklif/RFQ modülü (T067) uçtan uca canlı ama müşteri talebini gönderdikten sonra
// HİÇBİR onay almıyordu: ekranda "gönderildi" yazısı vardı, e-posta kutusunda hiçbir şey.
// Sipariş tarafında bu boşluk kapalı (`order-confirmation`), teklif tarafında açıktı.
//
// NİÇİN İSTEMCİDEN DEĞİL, DB TETİĞİNDEN
// --------------------------------------
// Teklif kaydı İSTEMCİDE oluşuyor (`quoteService.createQuoteRequest`). E-postayı oradan
// tetiklemek iki şeyi birden bozardı: (1) istemci kapanır/ağ düşerse kayıt DB'de kalır
// ama e-posta HİÇ gitmez — yani "gönderildi" yalanı sessizce sürer; (2) uç, istemciden
// çağrılabilir olmak zorunda kalır ve spam yüzeyi doğar. Tetik, e-postayı VERİNİN
// KENDİSİNE bağlar: satır yazıldıysa bildirim yolu işlemiştir.
//
// NİÇİN "webhook" ADINDA
// -----------------------
// Bu uç sınıf (c)'dir ve `verify_jwt = false` ile çalışır; tek kimlik kanıtı gövdedeki
// sırdır. Adında `webhook` geçmesi tesadüf DEĞİL: `INV-EDGE-SECURITY` R9 kapısı webhook
// uçlarını ADA göre seçip HMAC/sır + ZORUNLU timestamp guard'ı zorunlu kılar. Ad böyle
// seçilerek uç, kapının KAPSAMI İÇİNDE doğar — sonradan "acaba kapsıyor mu" sorusu kalmaz.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const SKEW_MS = 5 * 60 * 1000 // 5 dk tolerans (returns-webhook ile aynı pencere)

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

interface QuotePayload {
  quote_id?: string
  record?: { id?: string }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

    const raw = await req.text()

    // ── Sıra kutsal: (1) kimlik kanıtı → (2) replay guard → (3) ancak sonra DB ────────
    const secret = Deno.env.get('QUOTE_WEBHOOK_SECRET') || ''
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

    let payload: QuotePayload = {}
    try {
      payload = JSON.parse(raw) as QuotePayload
    } catch {
      return json({ error: 'invalid_json' }, 400)
    }
    const quoteId = payload.quote_id || payload.record?.id
    if (!quoteId) return json({ error: 'quote_id_required' }, 400)

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const { data: quote, error: quoteErr } = await supabase
      .from('venthub_quotes')
      .select('id, user_id, status, created_at, request_email_sent_at')
      .eq('id', quoteId)
      .maybeSingle()
    // Okuma düştüyse 503: "bakamadım" ile "yok" AYNI cevaba düşmemeli (pg_net tekrar dener).
    if (quoteErr) return json({ error: 'quote_lookup_failed' }, 503)
    if (!quote) return json({ error: 'quote_not_found' }, 404)

    // ── İDEMPOTENCY ────────────────────────────────────────────────────────────────
    // Tetik yeniden kurulur, pg_net tekrar dener, migration yeniden koşar — hepsinde bu
    // uç ikinci kez çağrılabilir. Damga DB'de tutulur (bellekte değil): aynı teklif için
    // ikinci e-posta ASLA gitmez. 200 dönülür çünkü çağıran açısından iş TAMAMDIR.
    if (quote.request_email_sent_at) {
      return json({ ok: true, skipped: 'already_sent', quote_id: quote.id }, 200)
    }

    const { data: userInfo, error: userErr } = await supabase.auth.admin.getUserById(quote.user_id)
    if (userErr) return json({ error: 'user_lookup_failed' }, 503)
    const to = userInfo?.user?.email
    if (!to) return json({ error: 'user_has_no_email' }, 422)

    const { data: items } = await supabase
      .from('venthub_quote_items')
      .select('product_name, qty')
      .eq('quote_id', quote.id)

    const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
    if (!resendApiKey) return json({ error: 'CONFIG_MISSING' }, 500)
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub <onboarding@resend.dev>'

    const kalemler = (items ?? [])
      .map((i) => `<li>${i.product_name} — ${i.qty} adet</li>`)
      .join('')
    const kisaId = quote.id.slice(0, 8).toUpperCase()
    const subject = `Teklif talebiniz alındı (#${kisaId})`
    const html = [
      '<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">',
      '<h2>Teklif talebiniz bize ulaştı</h2>',
      `<p><strong>#${kisaId}</strong> numaralı teklif talebinizi aldık. Ekibimiz kalemleri fiyatlandırıp size dönecek.</p>`,
      kalemler ? `<p>Talebinizdeki ürünler:</p><ul>${kalemler}</ul>` : '',
      '<p>Teklifiniz hazır olduğunda hesabınızdaki <em>Tekliflerim</em> sayfasından görüntüleyip onaylayabilir ya da reddedebilirsiniz.</p>',
      '<p>Teşekkürler,<br><strong>VentHub Ekibi</strong></p>',
      '</div>',
    ].join('')

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: emailFrom, to: [to], subject, html, text: subject }),
    })

    if (!resp.ok) {
      const govde = await resp.text().catch(() => '')
      // GÖNDERİLEMEDİ → damga ATILMAZ ve 5xx dönülür. Böylece pg_net'in yanıt defterinde
      // (net._http_response) başarısızlık GÖRÜNÜR olur; "ok" demek arızayı gizlerdi.
      console.error('[quote-notification-webhook] resend basarisiz', {
        quote_id: quote.id,
        status: resp.status,
        govde: govde.slice(0, 300),
      })
      return json({ error: 'send_failed', status: resp.status }, 502)
    }

    // Damgayı ancak GÖNDERİM BAŞARILI olduktan sonra at.
    const { error: stampErr } = await supabase
      .from('venthub_quotes')
      .update({ request_email_sent_at: new Date().toISOString() })
      .eq('id', quote.id)
    if (stampErr) {
      // E-posta GİTTİ ama damga düştü: bir sonraki tetik ikinci e-posta gönderir.
      // Yutma — görünür kıl (tek fazla e-posta, sessiz belirsizlikten iyidir).
      console.error('[quote-notification-webhook] damga yazilamadi', {
        quote_id: quote.id,
        detay: stampErr.message,
      })
      return json({ error: 'stamp_failed_email_sent', quote_id: quote.id }, 500)
    }

    return json({ ok: true, quote_id: quote.id, sent_to_domain: to.split('@')[1] ?? null }, 200)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[quote-notification-webhook] beklenmeyen hata', msg)
    return json({ error: 'internal_error' }, 500)
  }
})
