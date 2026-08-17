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
const ADMIN_ROLES: readonly string[] = ['admin', 'super_admin']

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

function renderTemplate(tpl: string, _data: Record<string, unknown>): string {
  tpl = tpl.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/?if}}/g, (_m, key: string, inner: string) => {
    const v = _data[key]
    const truthy = !!(typeof v === 'string' ? v : v)
    return truthy ? inner : ''
  })
  tpl = tpl.replace(/{{(\w+)}}/g, (_m, key: string) => {
    const v = _data[key]
    return v == null ? '' : String(v)
  })
  return tpl
}

async function loadTemplate(): Promise<string | null> {
  try {
    const url = new URL('./templates/email/order_confirmation.html', import.meta.url)
    return await Deno.readTextFile(url)
  } catch { return null }
}

serve(async (req) => {
  // CORS: origin whitelist (ALLOWED_ORIGINS), yoksa sadece gelen Origin'_e vary başlığı ile cevap ver
  const requestOrigin = req.headers.get('origin') || ''
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const originAllowed = allowedOrigins.length === 0 || (requestOrigin && allowedOrigins.includes(requestOrigin))
  const corsHeaders = getCorsHeaders(req)
  if (!originAllowed && req.method !== 'OPTIONS') {
    return new Response(JSON.stringify({ error: 'forbidden_origin' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const _text = await req.text()
    let parsed: Record<string, unknown> = {}
    try { parsed = _text ? JSON.parse(_text) : {} } catch {}

    // inputs
    const order_id = ((): string | null => {
      const v = parsed['order_id']
      if (typeof v === 'string' && v.trim()) return v.trim()
      return null
    })()

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

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

    const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
    let emailFrom = branding.emailFrom
    const testMode = (Deno.env.get('EMAIL_TEST_MODE') || '').toLowerCase() === 'true'
    const testTo = Deno.env.get('EMAIL_TEST_TO') || 'delivered@resend.dev'
    const bccList = (Deno.env.get('SHIP_EMAIL_BCC') || '').split(',').map(s=>s.trim()).filter(Boolean)

    const brandName = branding.brandName
    const brandPrimary = branding.brandPrimaryColor
    const brandLogoUrl = branding.brandLogoUrl

    if (!supabaseUrl || !serviceKey || !resendApiKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!order_id) {
      return new Response(JSON.stringify({ error: 'missing_fields', missing: ['order_id'] }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // fetch order basics
    let customer_email: string | null = null
    let customer_name: string | null = null
    let order_number: string | null = null
    try {
      const o = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=user_id,customer_email,customer_name,order_number`, {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
      })
      if (o.ok) {
        const arr = await o.json().catch(()=>[])
        const row = Array.isArray(arr) ? arr[0] : null
        if (row) {
          order_number = row.order_number || null
          customer_email = row.customer_email || null
          customer_name = row.customer_name || null
          const uid = row.user_id || null
          if ((!customer_email || !customer_name) && uid) {
            const u = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(uid)}`, { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } })
            if (u.ok) {
              interface UserResponse { email?: string; user_metadata?: { full_name?: string; name?: string } }
              const uj = await u.json().catch(()=>null) as UserResponse | null
              if (uj) {
                customer_email = customer_email || uj.email || null
                const metaName = (uj.user_metadata && (uj.user_metadata.full_name || uj.user_metadata.name)) || null
                customer_name = customer_name || metaName || customer_name
              }
            }
          }
        }
      }
    } catch {}

    // recipients
    const toList: string[] = []
    if (testMode) toList.push(testTo)
    else if (customer_email) toList.push(customer_email)
    let bcc = [...bccList]
    if (toList.length === 0 && bcc.length > 0) { toList.push(bcc[0]); bcc = bcc.slice(1) }

    const prettyOrderNo = order_number ? `#${String(order_number).split('-')[1]}` : `#${order_id.slice(-8).toUpperCase()}`
    const subject = `${brandName} | Siparişiniz alındı - ${prettyOrderNo}`

    // Load template
    let html = ''
    try {
      const tpl = await loadTemplate()
      if (tpl) html = renderTemplate(tpl, { brand_name: brandName, brand_primary_color: brandPrimary, brand_logo_url: brandLogoUrl, customer_name, order_number: prettyOrderNo })
    } catch {}
    if (!html) {
      html = [
        '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">',
        `<h2 style=\"color:${brandPrimary}\">${brandName} — Siparişiniz alındı</h2>`,
        `<p>Merhaba <strong>${customer_name || ''}</strong>,</p>`,
        `<p><strong>${prettyOrderNo}</strong> numaralı siparişiniz için ödemeniz başarıyla alındı ve siparişiniz kargoya hazırlanmaya alındı. Hazır olur olmaz kargo ve takip bilgilerini ayrıca ileteceğiz.</p>`,
        `<p>Teşekkürler,<br><strong>${brandName} Ekibi</strong></p>`,
        '</div>'
      ].join('')
    }

    // send
    async function send() {
      return await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: emailFrom, to: toList, bcc: bcc.length > 0 ? bcc : undefined, subject, html, text: `${subject}` })
      })
    }

    let resp = await send()
    if (!resp.ok) {
      const txt = await resp.text().catch(()=> '')
      if (txt.toLowerCase().includes('domain') && txt.toLowerCase().includes('verify')) {
        emailFrom = 'VentHub Test <onboarding@resend.dev>'
        resp = await send()
      }
      if (!resp.ok) return new Response(JSON.stringify({ error: 'send_failed', body: txt }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const result = await resp.json().catch(()=> ({}))

    // Log best-effort
    try {
      await fetch(`${supabaseUrl}/rest/v1/order_email_events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ order_id, email_to: toList[0] || '', subject, provider: 'resend', provider_message_id: result?.id || result?.data?.id || null })
      })
    } catch {}

    return new Response(JSON.stringify({ success: true, subject, result }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (_e) {
    try { await sentryCaptureException(_e as unknown, { fn: 'order-confirmation' }) } catch {}
    const msg = _e instanceof Error ? _e.message : String(_e)
    return new Response(JSON.stringify({ error: 'unexpected', message: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
