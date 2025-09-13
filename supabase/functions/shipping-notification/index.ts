import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
  const origin = req.headers.get('origin') ?? '*'
  const requestHeaders = req.headers.get('access-control-request-headers') ?? 'authorization, x-client-info, apikey, content-type'
  const requestMethod = req.headers.get('access-control-request-method') ?? 'POST, OPTIONS'
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': requestHeaders,
    'Access-Control-Allow-Methods': requestMethod,
    'Access-Control-Max-Age': '86400',
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
    // Parse body robustly and support camelCase as well
    const text = await req.text()
    let parsed: Record<string, unknown>
    try { parsed = text ? JSON.parse(text) : {} } catch { parsed = {} }
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
    let order_id = pick(['order_id','orderId'])
    let customer_email = pick(['customer_email','customerEmail'])
    let customer_name = pick(['customer_name','customerName'])
    let order_number = pick(['order_number','orderNumber'])
    let carrier = pick(['carrier'])
    let tracking_number = pick(['tracking_number','trackingNumber'])
    let tracking_url = pick(['tracking_url','trackingUrl'])

    // Ensure env-derived flags are available before validation branches
    const testMode = Deno.env.get('EMAIL_TEST_MODE') === 'true'
    const testTo = Deno.env.get('EMAIL_TEST_TO') || 'delivered@resend.dev'

    // Derive fields from DB if not provided
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      if (order_id && supabaseUrl && serviceKey) {
        // Load order basics if needed
        if (!order_number || !customer_email || !customer_name || !carrier || !tracking_number || !tracking_url) {
          const sel = encodeURIComponent('user_id,order_number,carrier,tracking_number,tracking_url')
          const ordResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&select=${sel}`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
          })
          if (ordResp.ok) {
            const arr = await ordResp.json().catch(()=>[])
            const row = Array.isArray(arr) ? arr[0] : null
            if (row) {
              if (!order_number && row.order_number) order_number = row.order_number
              if (!carrier && row.carrier) carrier = String(row.carrier)
              if (!tracking_number && row.tracking_number) tracking_number = String(row.tracking_number)
              if (!tracking_url && row.tracking_url) tracking_url = String(row.tracking_url)
              const uid = row.user_id as string | undefined
              if ((!customer_email || !customer_name) && uid) {
                // Use Auth Admin API to fetch user email securely with service role
                const usrResp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(uid)}`, {
                  headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
                })
                if (usrResp.ok) {
                  const u = await usrResp.json().catch(()=>null) as any
                  if (u) {
                    customer_email = customer_email || u.email || customer_email
                    // Try to read name from user_metadata
                    const metaName = (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || null
                    customer_name = customer_name || metaName || customer_name
                  }
                }
              }
            }
          }
        }
      }
    } catch { /* best effort */ }

    // Validate required fields (after derivation)
    // In test mode, allow missing fields by auto-filling placeholders
    if (testMode) {
      if (!order_id) order_id = 'TEST-ORDER'
      if (!carrier) carrier = 'test-carrier'
      if (!tracking_number) tracking_number = 'T123'
      if (!customer_email) customer_email = testTo
    }

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

    // Create email content
    const prettyOrderNo = order_number ? `#${String(order_number).split('-')[1]}` : `#${order_id.slice(-8).toUpperCase()}`
    
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
    const _notificationRequest = {
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
    let emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub Test <onboarding@resend.dev>'
    const notifyDebug = Deno.env.get('NOTIFY_DEBUG') === 'true'
    const bccList = (Deno.env.get('SHIP_EMAIL_BCC') || 'recep.varlik@gmail.com').split(',').map(s=>s.trim()).filter(Boolean)
    if (!resendApiKey) {
      if (notifyDebug) console.warn('[shipping-notification] Email disabled: missing RESEND_API_KEY')
      return new Response(JSON.stringify({ success: true, disabled: true, channel: 'email' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Build recipients with optional BCC; if no customer email, fall back to first BCC for testing
    const toList: string[] = []
    if (testMode) {
      toList.push(testTo)
    } else if (customer_email) {
      toList.push(customer_email)
    }
    const bcc = [...bccList]
    if (toList.length === 0 && bcc.length > 0) {
      toList.push(bcc[0])
      bcc.shift()
    }

    // Direct email sending (bypass notification-service for simplicity)
    async function sendEmail(fromAddr: string, to: string[], bccArr: string[]) {
      return await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddr,
          to,
          bcc: bccArr.length > 0 ? bccArr : undefined,
          subject: emailSubject,
          text: emailContent,
          html: `
          <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
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
    }

    // Try with configured from; if domain not verified, fallback to onboarding@resend.dev
    let response = await sendEmail(emailFrom, toList, bcc)
    if (!response.ok) {
      const errorText = await response.text()
      const normalized = errorText.toLowerCase()
      if (normalized.includes('domain') && normalized.includes('verify') || normalized.includes('from address')) {
        // Retry once with Resend test sender
        emailFrom = 'VentHub Test <onboarding@resend.dev>'
        response = await sendEmail(emailFrom, toList, bcc)
      }
      if (!response.ok) {
        throw new Error(`Email send failed: ${errorText}`)
      }
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
