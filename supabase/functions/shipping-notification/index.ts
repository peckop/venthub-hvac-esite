// Çağıran sınıfı: (b) sunucu→sunucu service_role + (a) oturumlu admin — resolveCaller kapısı
import { getCorsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { sentryCaptureException } from "../_shared/sentry.ts"
import { getTenantBranding } from '../_shared/tenant_config.ts'
import {
  CallerConfigError,
  CallerLookupError,
  TenantMismatchError,
  resolveCaller,
  type CallerContext,
} from '../_shared/caller.ts'

/** Cetvel §3.2 — yetkili roller. Gövdeden gelen `role`/`is_admin` ASLA kaynak değildir. */
const ADMIN_ROLES: readonly string[] = ['admin', 'superadmin']

/**
 * KAPI HATASI → HTTP EŞLEMESİ (T026-VH Adım 3 · BEŞ bildirim ucunda BİREBİR AYNI):
 *   `TenantMismatchError` → **403** (claim ile profil çelişiyor; kullanıcı o tenant'a ait değil)
 *   `CallerConfigError`   → **500** (ortam değişkeni eksik — bizim hatamız, çağıranın değil)
 *   `CallerLookupError`   → **503** (profil satırı OKUNAMADI; geçici DB/ağ hatası, tekrar denenebilir)
 * `null` dönerse hata bu kapıya ait DEĞİLDİR — yeniden fırlatılır ve dıştaki catch 500 döner
 * (fail-closed). Eşleme `_shared`'a çıkarılmadı: Adım 1'de yazılan paylaşılan modüller
 * dondurulmuş durumda; bu yüzden beş uca aynı metinle kopyalanır.
 */
function callerFailure(error: unknown): { status: number; error: string } | null {
  if (error instanceof TenantMismatchError) return { status: 403, error: 'tenant_mismatch' }
  if (error instanceof CallerConfigError) return { status: 500, error: 'CONFIG_MISSING' }
  if (error instanceof CallerLookupError) return { status: 503, error: 'profile_lookup_failed' }
  return null
}

// Tiny template renderer for {{var}} and {{#if var}} ... {{/if}}
function renderTemplate(tpl: string, data: Record<string, unknown>): string {
  // if-blocks
  tpl = tpl.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/?if}}/g, (_m, key: string, inner: string) => {
    const v = data[key]
    const truthy = !!(typeof v === 'string' ? v : v)
    return truthy ? inner : ''
  })
  // variables
  tpl = tpl.replace(/{{(\w+)}}/g, (_m, key: string) => {
    const v = data[key]
    return v == null ? '' : String(v)
  })
  return tpl
}

async function loadShippingTemplate(): Promise<string | null> {
  try {
    const url = new URL('./templates/email/shipping.html', import.meta.url)
    return await Deno.readTextFile(url)
  } catch {
    return null
  }
}

interface ShippingNotificationRequest {
  order_id: string
  customer_email: string
  customer_name: string
  order_number?: string
  carrier: string
  tracking_number: string
  tracking_url?: string | null
  tenant_id?: string
}

interface OrderRow {
  user_id?: string | null
  order_number?: string | null
  carrier?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
}

interface AuthAdminUser {
  email?: string | null
  user_metadata?: { full_name?: string | null; name?: string | null } | null
}

interface ResendResult {
  id?: string
}

serve(async (req) => {
  const requestOrigin = req.headers.get('origin') || ''
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const originAllowed = allowedOrigins.length === 0 || (requestOrigin && allowedOrigins.includes(requestOrigin))
  const corsHeaders = getCorsHeaders(req)

  // Bu 403 kapısı prod v21'de VAR; codemod hesaplamayı bırakıp kapıyı silmişti
  // (originAllowed ölü değişkene dönmüştü). order-confirmation ile aynı desen.
  if (!originAllowed && req.method !== 'OPTIONS') {
    return new Response(JSON.stringify({ error: 'forbidden_origin' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    // Parse body robustly and support camelCase as well (prod v21 davranışı)
    const rawText = await req.text()
    type ParsedBody = Record<string, unknown> & Partial<ShippingNotificationRequest>
    let parsed: ParsedBody
    try { parsed = rawText ? JSON.parse(rawText) as ParsedBody : {} } catch { parsed = {} }

    const pick = (keys: string[]): string | null => {
      for (const k of keys) {
        const v = parsed[k]
        if (typeof v === 'string') {
          const s = v.trim()
          if (s.length > 0) return s
        }
        if (typeof v === 'number' && Number.isFinite(v)) {
          return String(v)
        }
      }
      return null
    }

    let order_id = pick(['order_id', 'orderId'])
    let customer_email = pick(['customer_email', 'customerEmail'])
    let customer_name = pick(['customer_name', 'customerName'])
    let order_number = pick(['order_number', 'orderNumber'])
    let carrier = pick(['carrier'])
    let tracking_number = pick(['tracking_number', 'trackingNumber'])
    let tracking_url = pick(['tracking_url', 'trackingUrl'])

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    // ---- Yetki kapısı: ortak `resolveCaller` (cetvel §3.2/§3.6) ----
    // Sıra sabittir: kimlik → yetki → ancak sonra service_role verisi/`tenants` sorgusu.
    let ctx: CallerContext
    try {
      ctx = await resolveCaller(req, parsed)
    } catch (err) {
      const failure = callerFailure(err)
      if (!failure) throw err
      return new Response(JSON.stringify({ error: failure.error }), { status: failure.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // `resolveCaller` geçersiz/eksik JWT'yi 401'e ÇEVİRMEZ — `kind: 'anon'` döndürüp kararı
    // buraya bırakır (sınıf (c+a) uçları anon çağıranla meşru çalışabildiği için). Bu uçta
    // anonim çağıran AÇIKÇA reddedilir; bu satır olmazsa uç anonime AÇIK kalır.
    if (ctx.kind === 'anon') {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    // Sınıf (b) service_role VEYA sınıf (a) admin/superadmin. Diğer her oturumlu kullanıcı 403
    // (kimlik ≠ yetki — §3.2: eskiden burada 401 dönüyordu, yetkisizlik kimliksizlikle karışıyordu).
    if (ctx.kind !== 'service_role' && !ADMIN_ROLES.includes(ctx.role ?? '')) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Tenant artık istekten DEĞİL, doğrulanmış çağırandan gelir (§3.9).
    const tenantId = ctx.tenantId
    // Branding kapının ARKASINDA: yetkisiz çağıran `tenants` tablosuna sorgu tetikleyemez.
    const branding = await getTenantBranding(tenantId)

    // Env-derived test flags must exist before the validation branches
    const testMode = Deno.env.get('EMAIL_TEST_MODE') === 'true'
    const testTo = Deno.env.get('EMAIL_TEST_TO') || 'delivered@resend.dev'

    // ---- Derive missing fields from DB (tenant-scoped) + Auth Admin API ----
    try {
      if (order_id && SUPABASE_URL && SERVICE_KEY) {
        if (!order_number || !customer_email || !customer_name || !carrier || !tracking_number || !tracking_url) {
          const sel = encodeURIComponent('user_id,order_number,carrier,tracking_number,tracking_url')
          const ordResp = await fetch(`${SUPABASE_URL}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=${sel}`, {
            headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY }
          })
          if (ordResp.ok) {
            const arr = await ordResp.json().catch(() => []) as OrderRow[]
            const row = Array.isArray(arr) ? arr[0] : null
            if (row) {
              if (!order_number && row.order_number) order_number = String(row.order_number)
              if (!carrier && row.carrier) carrier = String(row.carrier)
              if (!tracking_number && row.tracking_number) tracking_number = String(row.tracking_number)
              if (!tracking_url && row.tracking_url) tracking_url = String(row.tracking_url)
              const uid = row.user_id || undefined
              if ((!customer_email || !customer_name) && uid) {
                // Use Auth Admin API to fetch user securely with service role
                const usrResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(uid)}`, {
                  headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY }
                })
                if (usrResp.ok) {
                  const u = await usrResp.json().catch(() => null) as AuthAdminUser | null
                  if (u) {
                    customer_email = customer_email || u.email || customer_email
                    const metaName = (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || null
                    customer_name = customer_name || metaName || customer_name
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Shipping field derivation failed (best effort):', err)
    }

    // In test mode, allow missing fields by auto-filling placeholders
    if (testMode) {
      if (!order_id) order_id = 'TEST-ORDER'
      if (!carrier) carrier = 'test-carrier'
      if (!tracking_number) tracking_number = 'T123'
      if (!customer_email) customer_email = testTo
    }

    // Validate required fields (after derivation)
    if (!order_id || !carrier || !tracking_number) {
      const missing: string[] = []
      if (!order_id) missing.push('order_id')
      if (!carrier) missing.push('carrier')
      if (!tracking_number) missing.push('tracking_number')
      return new Response(JSON.stringify({
        error: 'missing_fields',
        missing,
        received: Object.keys(parsed)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const brandName = branding.brandName
    const brandPrimary = branding.brandPrimaryColor
    const brandLogoUrl = branding.brandLogoUrl

    const prettyOrderNo = order_number ? `#${String(order_number).split('-')[1]}` : `#${order_id.slice(-8).toUpperCase()}`
    const subject = `${brandName} | Siparişiniz kargoya verildi - ${prettyOrderNo}`

    // ---- Plain-text body (Resend `text:`) ----
    const emailContent = `
Merhaba ${customer_name || ''},

${prettyOrderNo} numaralı siparişiniz kargoya verildi! 📦

🚛 Kargo Firması: ${carrier}
📋 Takip Numarası: ${tracking_number}
${tracking_url ? `🔗 Takip Linki: ${tracking_url}` : ''}

Siparişinizi takip edebilir ve teslimat durumunu kontrol edebilirsiniz.

Teşekkürler,
${brandName} Ekibi

---
Bu otomatik bir e-postadır. Lütfen yanıtlamayın.
    `.trim()

    // ---- HTML body: file template first, rich inline fallback second ----
    let html = ''
    try {
      const tpl = await loadShippingTemplate()
      if (tpl) {
        html = renderTemplate(tpl, {
          customer_name,
          order_number: prettyOrderNo,
          carrier,
          tracking_number,
          tracking_url,
          brand_name: brandName,
          brand_primary_color: brandPrimary,
          brand_logo_url: brandLogoUrl,
        })
      }
    } catch { /* ignore, fall back to inline */ }

    if (!html) {
      html = [
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
        `<h2 style="color: ${brandPrimary};">${brandName} — Siparişiniz kargoya verildi! 📦</h2>`,
        brandLogoUrl ? `<p><img src="${brandLogoUrl}" alt="${brandName}" style="max-height:40px;"/></p>` : '',
        `<p>Merhaba <strong>${customer_name || ''}</strong>,</p>`,
        `<p><strong>${prettyOrderNo}</strong> numaralı siparişiniz kargoya verildi!</p>`,
        '<div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">',
        '<h3 style="margin-top: 0; color: #374151;">Kargo Bilgileri</h3>',
        `<p><strong>🚛 Kargo Firması:</strong> ${carrier}</p>`,
        `<p><strong>📋 Takip Numarası:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${tracking_number}</code></p>`,
        tracking_url ? `<p><strong>🔗 Takip Linki:</strong> <a href="${tracking_url}" target="_blank" style="background: ${brandPrimary}; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Kargomu Takip Et</a></p>` : '',
        '</div>',
        '<p>Siparişinizi takip edebilir ve teslimat durumunu kontrol edebilirsiniz.</p>',
        `<p>Teşekkürler,<br><strong>${brandName} Ekibi</strong></p>`,
        '<hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">',
        '<p style="color: #6b7280; font-size: 14px;">Bu otomatik bir e-postadır. Lütfen yanıtlamayın.</p>',
        '</div>'
      ].join('')
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
    let EMAIL_FROM = branding.emailFrom
    const notifyDebug = Deno.env.get('NOTIFY_DEBUG') === 'true'
    // İşletme kopyası. VARSAYILAN YOK — bu satırda bir zamanlar gömülü bir KİŞİSEL adres
    // vardı (`|| 'recep.varlik@gmail.com'`) ve iki ayrı soruna yol açıyordu:
    //
    //   1. Env değişkeni tanımlı değilken HER kargo bildiriminin bir kopyası, koda
    //      gömülmüş özel bir gerçek kişinin gelen kutusuna gidiyordu — müşteri adı,
    //      sipariş numarası ve takip bilgisiyle birlikte. Kimse ayarlamamış olmasına
    //      rağmen. Bu bir yapılandırma değil, koda yazılmış bir alıcıydı.
    //   2. Aşağıdaki "alıcı yoksa BCC'yi TO yap" dalıyla birleşince daha da kötüleşiyordu
    //      (bkz. oradaki not).
    //
    // Boş varsayılan doğru olan: işletme kopyası isteyen `SHIP_EMAIL_BCC`'yi TANIMLAR.
    // Repo PUBLIC — koda gömülü kişisel adres ayrıca kalıcı bir sızıntıdır.
    const bccList = (Deno.env.get('SHIP_EMAIL_BCC') || '').split(',').map(s=>s.trim()).filter(Boolean)

    if (!RESEND_API_KEY) {
      if (notifyDebug) console.warn('[shipping-notification] Email disabled: missing RESEND_API_KEY')
      return new Response(JSON.stringify({ success: true, disabled: true, channel: 'email' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Alıcılar. İŞLETME KOPYASI ASLA BİRİNCİL ALICIYA TERFİ ETMEZ.
    //
    // Eskiden burada şu dal vardı: müşteri e-postası yoksa BCC listesinin ilk adresini
    // TO yap. Görünüşte "hiç değilse bir yere gitsin" mantığı, ama ürettiği şey şuydu:
    // müşterinin kargo bildirimi — adı, sipariş numarası, takip linkiyle — işletme
    // kopyası için konulmuş adrese MÜŞTERİYE YAZILMIŞ GİBİ gönderiliyordu. Üstelik o
    // adresin varsayılanı koda gömülü kişisel bir adresti.
    //
    // Doğrusu: alıcı yoksa GÖNDERME ve bunu çağırana AÇIKÇA söyle. Sessizce başka bir
    // yere göndermek, eksik veriyi gizlerken bir de gizlilik sorunu yaratır.
    const toList: string[] = []
    if (testMode) {
      toList.push(testTo)
    } else if (customer_email) {
      toList.push(customer_email)
    }
    const bcc = [...bccList]

    if (toList.length === 0) {
      return new Response(JSON.stringify({
        error: 'missing_fields',
        missing: ['customer_email'],
        message: 'Müşteri e-postası yok; bildirim GÖNDERİLMEDİ. İşletme kopyası adresi birincil alıcı yerine kullanılmaz.',
        received: Object.keys(parsed),
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    async function sendEmail(fromAddr: string, to: string[], bccArr: string[]): Promise<Response> {
      return await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddr,
          to,
          bcc: bccArr.length > 0 ? bccArr : undefined,
          subject,
          text: emailContent,
          html,
        }),
      })
    }

    // Try configured sender; if the domain is not verified, retry ONCE with the Resend test sender
    let resp = await sendEmail(EMAIL_FROM, toList, bcc)
    if (!resp.ok) {
      const errorText = await resp.text().catch(()=>'')
      const normalized = errorText.toLowerCase()
      if ((normalized.includes('domain') && normalized.includes('verify')) || normalized.includes('from address')) {
        EMAIL_FROM = 'VentHub Test <onboarding@resend.dev>'
        resp = await sendEmail(EMAIL_FROM, toList, bcc)
      }
      if (!resp.ok) {
        try { await sentryCaptureException(new Error(`Email send failed: ${errorText}`), { fn: 'shipping-notification', tenant_id: tenantId }) } catch { /* swallow */ }
        throw new Error(`Email send failed: ${errorText}`)
      }
    }

    const result = await resp.json().catch(()=>({})) as ResendResult

    // Best-effort audit insert (tenant-scoped); silent on failure
    try {
      if (SUPABASE_URL && SERVICE_KEY) {
        const payload = {
          order_id,
          email_to: toList[0] || '',
          subject,
          provider: 'resend',
          provider_message_id: result?.id || null,
          carrier: carrier || null,
          tracking_number: tracking_number || null,
          tenant_id: tenantId
        }
        await fetch(`${SUPABASE_URL}/rest/v1/shipping_email_events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, Prefer: 'return=minimal' },
          body: JSON.stringify(payload)
        })
      }
    } catch { /* best effort */ }

    console.warn(`📧 Shipping notification sent to ${toList[0]} for order ${prettyOrderNo}`)

    return new Response(JSON.stringify({
      success: true,
      result,
      order_id,
      customer_email,
      subject,
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error ?? 'Unknown error')
    console.error('Shipping notification error:', msg)
    try { await sentryCaptureException(error, { fn: 'shipping-notification' }) } catch { /* swallow */ }
    return new Response(JSON.stringify({ error: msg, success: false }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
