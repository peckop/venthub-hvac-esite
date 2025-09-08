import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface ReturnStatusNotificationRequest {
  return_id: string
  order_id: string
  order_number?: string
  customer_email: string
  customer_name: string
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
    const { 
      return_id,
      order_id, 
      order_number,
      customer_email, 
      customer_name, 
      old_status,
      new_status,
      reason,
      description
    } = body

    // Validate required fields
    if (!return_id || !customer_email || !customer_name || !new_status) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: return_id, customer_email, customer_name, new_status' 
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

  } catch (error: any) {
    console.error('Return status notification error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
