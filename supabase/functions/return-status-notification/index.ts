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

interface ReturnStatusNotificationRequest {
  return_id: string
  order_id?: string
  order_number?: string
  customer_email?: string
  customer_name?: string
  old_status: string
  new_status: string
  reason: string
  description?: string | null
  tenant_id?: string
}

interface ResendResult {
  id?: string
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json() as ReturnStatusNotificationRequest

    // Destructure without the underscore prefix hacks
    const { 
      return_id,
      old_status,
      new_status,
      reason,
      description
    } = body

    let { order_id, order_number } = body

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

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

    let customer_email: string | undefined = undefined
    let customer_name: string | undefined = undefined
    let user_id: string | undefined = undefined

    if (!supabaseUrl || !serviceKey) {
      customer_email = body.customer_email
      customer_name = body.customer_name
    } else {
      try {
        if (!order_id && return_id) {
          const retRes = await fetch(`${supabaseUrl}/rest/v1/venthub_returns?id=eq.${encodeURIComponent(return_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=order_id,user_id`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
          })
          if (retRes.ok) {
            const retArr = await retRes.json().catch(() => [])
            const ret = Array.isArray(retArr) ? retArr[0] : null
            if (ret) { order_id = ret.order_id || order_id; user_id = ret.user_id || user_id }
          }
        }

        if (order_id) {
          const ordRes = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=order_number,customer_name,customer_email,user_id`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
          })
          if (ordRes.ok) {
            const ordArr = await ordRes.json().catch(() => [])
            const ord = Array.isArray(ordArr) ? ordArr[0] : null
            if (ord) {
              order_number = ord.order_number || order_number
              customer_email = ord.customer_email || customer_email
              customer_name = ord.customer_name || customer_name
              user_id = ord.user_id || user_id
            }
          }
        }

        if ((!customer_email || !customer_name) && user_id) {
          const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user_id)}`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' }
          })
          if (authRes.ok) {
            const u = await authRes.json().catch(() => null)
            if (u) {
              customer_email = customer_email || u?.email || undefined
              const meta = (u?.user_metadata || {}) as { full_name?: string; name?: string }
              customer_name = customer_name || meta.full_name || meta.name || undefined
            }
          }
        }
      } catch (err) {
        console.error('Error resolving customer info:', err)
      }

      if (!customer_email) customer_email = body.customer_email
      if (!customer_name) customer_name = body.customer_name
    }

    if (!return_id || !new_status) {
      const missing = [!return_id && 'return_id', !new_status && 'new_status'].filter(Boolean)
      return new Response(JSON.stringify({
        error: 'Missing required fields: return_id, new_status',
        code: 'MISSING_REQUIRED_FIELDS',
        missing
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!customer_email || !customer_name) {
      const missing = [!customer_email && 'customer_email', !customer_name && 'customer_name'].filter(Boolean)
      return new Response(JSON.stringify({
        error: 'Customer info unavailable',
        code: 'CUSTOMER_INFO_MISSING',
        missing
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const brandName = branding.brandName
    const brandPrimary = branding.brandPrimaryColor
    const brandLogoUrl = branding.brandLogoUrl

    const prettyOrderNo = order_number ? `#${order_number.split('-')[1]}` : `#${order_id?.slice(-8).toUpperCase() || 'N/A'}`
    
    const getStatusLabel = (status: string): string => {
      const labels: Record<string, string> = {
        requested: 'Talep Alındı',
        approved: 'Onaylandı', 
        rejected: 'Reddedildi',
        in_transit: 'Kargoda (İade)',
        received: 'İade Teslim Alındı',
        refunded: 'İade Ücreti Ödendi',
        cancelled: 'İptal Edildi'
      }
      return labels[status] || status
    }

    const statusLabel = getStatusLabel(new_status)
    const subject = `${brandName} | İade durumu güncellendi - ${prettyOrderNo}`

    // Duruma özel müşteri mesajı + "Sonraki Adımlar" (prod v-frozen davranışı)
    const getStatusMessage = (status: string): { message: string; nextSteps?: string } => {
      switch (status) {
        case 'approved':
          return {
            message: 'İade talebiniz onaylandı! Ürünü kargoya verebilirsiniz.',
            nextSteps: 'Kargo bilgileri e-posta ile tarafınıza iletilecektir. Ürünü orijinal ambalajında ve tüm aksesuarları ile birlikte gönderiniz.'
          }
        case 'rejected':
          return {
            message: 'İade talebiniz maalesef reddedildi.',
            nextSteps: 'Daha fazla bilgi için müşteri hizmetleri ile iletişime geçebilirsiniz.'
          }
        case 'in_transit':
          return {
            message: 'İade ürününüz kargoda! Teslimatı bekleniyor.',
            nextSteps: 'Ürününüzü aldığımızda kontrol edilecek ve işleminiz devam edecektir.'
          }
        case 'received':
          return {
            message: 'İade ürününüz tarafımıza ulaştı ve kontrol ediliyor.',
            nextSteps: 'Kontrol tamamlandıktan sonra iade ücreti hesabınıza iade edilecektir.'
          }
        case 'refunded':
          return {
            message: '🎉 İade ücretiniz hesabınıza iade edildi!',
            nextSteps: 'İade tutarı 1-3 iş günü içinde hesabınızda görünecektir. Bizi tercih ettiğiniz için teşekkürler.'
          }
        case 'cancelled':
          return {
            message: 'İade işlemi iptal edildi.',
            nextSteps: 'Sorularınız için müşteri hizmetleri ile iletişime geçebilirsiniz.'
          }
        default:
          return { message: `İade durumunuz güncellendi: ${statusLabel}` }
      }
    }

    const { message, nextSteps } = getStatusMessage(new_status)

    // Düz metin gövde (Resend `text:`)
    const emailContent = `
Merhaba ${customer_name},

${prettyOrderNo} numaralı siparişinizin iade durumu güncellendi.

📦 İade Sebebi: ${reason}
${description ? `📝 Açıklama: ${description}` : ''}

🔄 Yeni Durum: ${statusLabel}

${message}

${nextSteps ? `\n📋 Sonraki Adımlar:\n${nextSteps}` : ''}

İade süreci ile ilgili sorularınız için destek ekibimizle iletişime geçebilirsiniz.

Teşekkürler,
${brandName} Ekibi

---
Bu otomatik bir e-postadır. Lütfen yanıtlamayın.
    `.trim()

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${brandPrimary};">${brandName} — İade Durumu Güncellendi</h2>
        ${brandLogoUrl ? `<p><img src="${brandLogoUrl}" alt="${brandName}" style="max-height:40px;"/></p>` : ''}
        <p>Merhaba <strong>${customer_name}</strong>,</p>
        <p><strong>${prettyOrderNo}</strong> numaralı siparişinizin iade durumu güncellendi.</p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">İade Bilgileri</h3>
          <p><strong>📦 İade Sebebi:</strong> ${reason}</p>
          ${description ? `<p><strong>📝 Açıklama:</strong> ${description}</p>` : ''}
          <div style="background-color: #dbeafe; border-left: 4px solid ${brandPrimary}; padding: 12px; margin: 12px 0;">
            <p style="margin: 0;"><strong>🔄 Yeni Durum:</strong> <span style="color: ${brandPrimary}; font-weight: bold;">${statusLabel}</span></p>
          </div>
        </div>

        <div style="background-color: #ecfccb; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #365314;"><strong>${message}</strong></p>
        </div>

        ${nextSteps ? `
        <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">📋 Sonraki Adımlar:</h4>
          <p style="margin-bottom: 0; color: #92400e;">${nextSteps}</p>
        </div>
        ` : ''}

        <p>İade süreci ile ilgili sorularınız için destek ekibimizle iletişime geçebilirsiniz.</p>
        <p>Teşekkürler,<br><strong>${brandName} Ekibi</strong></p>

        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Bu otomatik bir e-postadır. Lütfen yanıtlamayın.</p>
      </div>
    `

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const emailFrom = branding.emailFrom
    const notifyDebug = Deno.env.get('NOTIFY_DEBUG') === 'true'

    if (!resendApiKey) {
      if (notifyDebug) console.warn('[return-status-notification] Email disabled: missing RESEND_API_KEY')
      return new Response(JSON.stringify({ success: true, disabled: true, channel: 'email' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: emailFrom,
        to: [customer_email],
        subject: subject,
        text: emailContent,
        html,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Email failed: ${errorText}`)
    }

    const result = await emailResponse.json().catch(() => ({})) as ResendResult

    console.warn(`📧 Notification sent to ${customer_email} for return ${return_id}: ${old_status} → ${new_status}`)

    return new Response(JSON.stringify({
      success: true,
      result,
      return_id,
      customer_email,
      new_status,
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Notification error:', msg)
    return new Response(JSON.stringify({ error: msg, success: false }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
