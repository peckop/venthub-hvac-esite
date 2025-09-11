import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

interface ShippingNotificationRequest {
  order_id: string
  customer_email: string
  customer_name: string
  order_number?: string
  carrier: string
  tracking_number: string
  tracking_url?: string | null
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
    const body = await req.json() as ShippingNotificationRequest
    const { 
      order_id, 
      customer_email, 
      customer_name, 
      order_number,
      carrier, 
      tracking_number, 
      tracking_url 
    } = body

    // Validate required fields
    if (!order_id || !customer_email || !customer_name || !carrier || !tracking_number) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: order_id, customer_email, customer_name, carrier, tracking_number' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create email content
    const prettyOrderNo = order_number ? `#${order_number.split('-')[1]}` : `#${order_id.slice(-8).toUpperCase()}`
    
    const emailSubject = `Siparişiniz kargoya verildi - ${prettyOrderNo}`
    
    const emailContent = `
Merhaba ${customer_name},

${prettyOrderNo} numaralı siparişiniz kargoya verildi! 📦

🚛 Kargo Firması: ${carrier}
📋 Takip Numarası: ${tracking_number}
${tracking_url ? `🔗 Takip Linki: ${tracking_url}` : ''}

Siparişinizi takip edebilir ve teslimat durumunu kontrol edebilirsiniz.

Teşekkürler,
VentHub Ekibi

---
Bu otomatik bir e-postadır. Lütfen yanıtlamayın.
    `.trim()

    // Send email via notification service
    const notificationRequest = {
      type: 'email',
      to: customer_email,
      message: emailContent,
      priority: 'medium',
      data: {
        subject: emailSubject,
        customer_name,
        order_number: prettyOrderNo,
        carrier,
        tracking_number,
        tracking_url
      }
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub <info@venthub.com>'
    const notifyDebug = Deno.env.get('NOTIFY_DEBUG') === 'true'
    if (!resendApiKey) {
      if (notifyDebug) console.warn('[shipping-notification] Email disabled: missing RESEND_API_KEY')
      return new Response(JSON.stringify({ success: true, disabled: true, channel: 'email' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Direct email sending (bypass notification-service for simplicity)
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
            <h2 style="color: #2563eb;">Siparişiniz kargoya verildi! 📦</h2>
            <p>Merhaba <strong>${customer_name}</strong>,</p>
            <p><strong>${prettyOrderNo}</strong> numaralı siparişiniz kargoya verildi!</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Kargo Bilgileri</h3>
              <p><strong>🚛 Kargo Firması:</strong> ${carrier}</p>
              <p><strong>📋 Takip Numarası:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${tracking_number}</code></p>
              ${tracking_url ? `<p><strong>🔗 Takip Linki:</strong> <a href="${tracking_url}" target="_blank" style="color: #2563eb;">Kargo takip sayfası</a></p>` : ''}
            </div>
            
            <p>Siparişinizi takip edebilir ve teslimat durumunu kontrol edebilirsiniz.</p>
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

    console.log(`📧 Shipping notification sent to ${customer_email} for order ${prettyOrderNo}`)

    return new Response(JSON.stringify({ 
      success: true,
      result,
      order_id,
      customer_email,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error ?? 'Unknown error')
    console.error('Shipping notification error:', msg)
    
    return new Response(JSON.stringify({ 
      error: msg,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
