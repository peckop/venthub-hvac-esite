import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json() as ReturnStatusNotificationRequest

    // Extract and then resolve sensitive fields server-side
    let { 
      return_id,
      order_id, 
      order_number,
      old_status,
      new_status,
      reason,
      description
    } = body

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    let customer_email: string | undefined = undefined
    let customer_name: string | undefined = undefined
    let user_id: string | undefined = undefined

    if (!supabaseUrl || !serviceKey) {
      // Fallback to client-provided values only if server config missing
      customer_email = body.customer_email
      customer_name = body.customer_name
    } else {
      try {
        // 1) If order_id not provided, look up from returns
        if (!order_id && return_id) {
          const retRes = await fetch(`${supabaseUrl}/rest/v1/venthub_returns?id=eq.${encodeURIComponent(return_id)}&select=order_id,user_id`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
          })
          if (retRes.ok) {
            const retArr = await retRes.json().catch(() => [])
            const ret = Array.isArray(retArr) ? retArr[0] : null
            if (ret) { order_id = ret.order_id || order_id; user_id = ret.user_id || user_id }
          }
        }

        // 2) Load order to get canonical customer info
        if (order_id) {
          const ordRes = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&select=order_number,customer_name,customer_email,user_id`, {
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

        // 3) Fallback to Auth Admin API if still missing
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
      } catch {
        // ignore and fallback to client-provided
      }

      // Final fallback to client-sent values (if any)
      if (!customer_email) customer_email = body.customer_email
      if (!customer_name) customer_name = body.customer_name
    }

    // Validate required fields (after server-side resolution)
    if (!return_id || !new_status) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: return_id, new_status' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!customer_email || !customer_name) {
      return new Response(JSON.stringify({ 
        error: 'Customer info unavailable', code: 'CUSTOMER_INFO_MISSING' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const prettyOrderNo = order_number ? `#${order_number.split('-')[1]}` : `#${order_id?.slice(-8).toUpperCase() || 'N/A'}`
    
    // Status labels in Turkish
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
    const emailSubject = `İade durumu güncellendi - ${prettyOrderNo}`
    
    // Get status-specific message and next steps
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
    
    const emailContent = `
Merhaba ${customer_name},

${prettyOrderNo} numaralı siparişinizin iade durumu güncellendi.

📦 İade Sebepleri: ${reason}
${description ? `📝 Açıklama: ${description}` : ''}

🔄 Yeni Durum: ${statusLabel}

${message}

${nextSteps ? `\n📋 Sonraki Adımlar:\n${nextSteps}` : ''}

İade süreci ile ilgili sorularınız için destek ekibimizle iletişime geçebilirsiniz.

Teşekkürler,
VentHub Ekibi

---
Bu otomatik bir e-postadır. Lütfen yanıtlamayın.
    `.trim()

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub <info@venthub.com>'
    const notifyDebug = Deno.env.get('NOTIFY_DEBUG') === 'true'
    if (!resendApiKey) {
      if (notifyDebug) console.warn('[return-status-notification] Email disabled: missing RESEND_API_KEY')
      return new Response(JSON.stringify({ success: true, disabled: true, channel: 'email' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Direct email sending
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [customer_email],
        subject: emailSubject,
        text: emailContent,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">İade Durumu Güncellendi</h2>
            <p>Merhaba <strong>${customer_name}</strong>,</p>
            <p><strong>${prettyOrderNo}</strong> numaralı siparişinizin iade durumu güncellendi.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">İade Bilgileri</h3>
              <p><strong>📦 İade Sebebi:</strong> ${reason}</p>
              ${description ? `<p><strong>📝 Açıklama:</strong> ${description}</p>` : ''}
              <div style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 12px; margin: 12px 0;">
                <p style="margin: 0;"><strong>🔄 Yeni Durum:</strong> <span style="color: #1d4ed8; font-weight: bold;">${statusLabel}</span></p>
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
            <p>Teşekkürler,<br><strong>VentHub Ekibi</strong></p>
            
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Bu otomatik bir e-postadır. Lütfen yanıtlamayın.</p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Email send failed: ${error}`)
    }

    const result = await response.json()

    console.log(`📧 Return status notification sent to ${customer_email} for return ${return_id}: ${old_status} → ${new_status}`)

    return new Response(JSON.stringify({ 
      success: true,
      result,
      return_id,
      customer_email,
      new_status,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('Return status notification error:', error)
    
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ 
      error: msg,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
