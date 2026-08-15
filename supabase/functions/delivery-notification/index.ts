// Çağıran sınıfı: (b) sunucu→sunucu service_role + (a) oturumlu admin — resolveCaller kapısı
import { getCorsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

interface DeliveryRequest {
  order_id: string
  customer_email?: string
  customer_name?: string
  order_number?: string
  tenant_id?: string
}

function render(tpl: string, _data: Record<string, unknown>) {
  return tpl.replace(/{{(\w+)}}/g, (_m, k) => String(_data[k] ?? ''))
}

async function loadTemplate() {
  try {
    const url = new URL('./templates/email/delivered.html', import.meta.url)
    return await Deno.readTextFile(url)
  } catch {
    return null
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const body = await req.json().catch(()=>({})) as DeliveryRequest
    const order_id = body.order_id
    let customer_email = body.customer_email
    let customer_name = body.customer_name
    let order_number = body.order_number

    // ---- Yetki kapısı: ortak `resolveCaller` (cetvel §3.2/§3.6) ----
    // Sıra sabittir: kimlik → yetki → ancak sonra service_role verisi/`tenants` sorgusu.
    let ctx: CallerContext
    try {
      ctx = await resolveCaller(req, body)
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

    if (!order_id) return new Response(JSON.stringify({ error: 'missing_fields', missing: ['order_id'] }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    // Derive info if missing
    if ((!customer_email || !customer_name || !order_number) && supabaseUrl && serviceKey) {
      const o = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=order_number,customer_name,customer_email`, {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
      })
      if (o.ok) {
        const arr = await o.json().catch(()=>[])
        const row = Array.isArray(arr) ? arr[0] : null
        if (row) {
          order_number = order_number || row.order_number
          customer_name = customer_name || row.customer_name
          customer_email = customer_email || row.customer_email
        }
      }
    }

    if (!customer_email || !customer_name) {
      return new Response(JSON.stringify({ error: 'customer_info_missing' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const brandName = branding.brandName
    const brandPrimary = branding.brandPrimaryColor
    const brandLogoUrl = branding.brandLogoUrl

    const prettyOrderNo = order_number ? `#${order_number.split('-')[1]}` : `#${order_id.slice(-8).toUpperCase()}`
    const subject = `${brandName} | Siparişiniz teslim edildi - ${prettyOrderNo}`

    let html = (await loadTemplate()) || ''
    if (!html) {
      html = [
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
        `<h2 style="color: ${brandPrimary};">${brandName} — Teslimat Tamamlandı</h2>`,
        `<p>Merhaba <strong>${customer_name}</strong>,</p>`,
        `<p><strong>${prettyOrderNo}</strong> numaralı siparişiniz başarıyla teslim edilmiştir.</p>`,
        '<p>Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.</p>',
        `<p>Teşekkürler,<br><strong>${brandName} Ekibi</strong></p>`,
        '</div>'
      ].join('')
    } else {
      html = render(html, { customer_name, order_number: prettyOrderNo, brand_name: brandName, brand_primary_color: brandPrimary, brand_logo_url: brandLogoUrl })
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ disabled: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: emailFrom, to: [customer_email], subject, html })
    })
    if (!resp.ok) {
      const t = await resp.text().catch(()=> '')
      return new Response(JSON.stringify({ error: 'send_failed', body: t }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const result = await resp.json().catch(()=>({}))

    // Audit
    try {
      if (supabaseUrl && serviceKey) {
        await fetch(`${supabaseUrl}/rest/v1/shipping_email_events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'return=minimal' },
          body: JSON.stringify({ order_id, email_to: customer_email, subject, provider: 'resend', provider_message_id: result?.id || null, tenant_id: tenantId })
        })
      }
    } catch {}

    return new Response(JSON.stringify({ ok: true, order_id, subject, result }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (_e: unknown) {
    const msg = _e instanceof Error ? _e.message : String(_e)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
