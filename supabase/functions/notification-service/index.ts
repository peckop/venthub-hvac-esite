import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface NotificationRequest {
  type: 'whatsapp' | 'sms' | 'email'
  to: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  template?: string
  data?: Record<string, any>
}

interface StockAlertData {
  productName: string
  currentStock: number
  threshold: number
  productId: string
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
    const body = await req.json() as NotificationRequest
    const { type, to, message, priority, template, data } = body

    // Environment variables
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER') // e.g., 'whatsapp:+14155238886'
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub <noreply@venthub.com>'
    const notifyDebug = Deno.env.get('NOTIFY_DEBUG') === 'true'
    
    let result: any = { success: false, note: undefined }

    // Graceful disable per channel if missing config
    const isWhatsAppEnabled = !!(twilioAccountSid && twilioAuthToken && twilioWhatsAppNumber)
    const isSmsEnabled = !!(twilioAccountSid && twilioAuthToken && twilioPhoneNumber)
    const isEmailEnabled = !!resendApiKey

    switch (type) {
      case 'whatsapp':
        if (!isWhatsAppEnabled) {
          if (notifyDebug) console.warn('[notification-service] WhatsApp disabled: missing env')
          result = { success: true, disabled: true, channel: 'whatsapp' }
          break
        }
        result = await sendWhatsApp(to, message, template, data, {
          accountSid: twilioAccountSid!,
          authToken: twilioAuthToken!,
          fromNumber: twilioWhatsAppNumber!
        })
        break
      
      case 'sms':
        if (!isSmsEnabled) {
          if (notifyDebug) console.warn('[notification-service] SMS disabled: missing env')
          result = { success: true, disabled: true, channel: 'sms' }
          break
        }
        result = await sendSMS(to, message, {
          accountSid: twilioAccountSid!,
          authToken: twilioAuthToken!,
          fromNumber: twilioPhoneNumber!
        })
        break
      
      case 'email':
        if (!isEmailEnabled) {
          if (notifyDebug) console.warn('[notification-service] Email disabled: missing RESEND_API_KEY')
          result = { success: true, disabled: true, channel: 'email' }
          break
        }
        result = await sendEmail(to, message, template, { ...(data||{}), emailFrom }, {
          apiKey: resendApiKey!,
          from: emailFrom,
        })
        break
      
      default:
        throw new Error(`Unsupported notification type: ${type}`)
    }

    console.log(`📱 Notification sent: ${type} to ${to} - Priority: ${priority}`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      result,
      type,
      priority,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Notification service error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function sendWhatsApp(to: string, message: string, template?: string, data?: any, config?: any) {
  if (!config?.accountSid || !config?.authToken || !config?.fromNumber) {
    throw new Error('WhatsApp configuration missing')
  }

  const finalMessage = template ? formatTemplate(template, data) : message
  
  // Format phone number for WhatsApp (must include whatsapp: prefix)
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`
  const credentials = btoa(`${config.accountSid}:${config.authToken}`)
  
  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: config.fromNumber,
      To: formattedTo,
      Body: finalMessage,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`WhatsApp send failed: ${error}`)
  }
  
  return await response.json()
}

async function sendSMS(to: string, message: string, config: any) {
  if (!config?.accountSid || !config?.authToken || !config?.fromNumber) {
    throw new Error('SMS configuration missing')
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`
  const credentials = btoa(`${config.accountSid}:${config.authToken}`)
  
  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: config.fromNumber,
      To: to,
      Body: message,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SMS send failed: ${error}`)
  }
  
  return await response.json()
}

async function sendEmail(to: string, message: string, template?: string, data?: any, config?: any) {
  if (!config?.apiKey) {
    throw new Error('Email configuration missing')
  }

  const subject = data?.subject || 'VentHub Bildirim'
  const finalMessage = template ? formatTemplate(template, data) : message
  const from = config?.from || data?.emailFrom || 'VentHub <noreply@venthub.com>'
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: subject,
      text: finalMessage,
      html: `<p>${finalMessage.replace(/\n/g, '<br>')}</p>`,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Email send failed: ${error}`)
  }
  
  return await response.json()
}

function formatTemplate(template: string, data: any): string {
  if (!data) return template
  
  let formatted = template
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g')
    formatted = formatted.replace(placeholder, data[key])
  })
  
  return formatted
}

// Stock alert template examples
const stockAlertTemplates = {
  whatsapp: {
    low_stock: `🚨 STOK UYARISI 🚨
    
📦 Ürün: {{productName}}
📊 Mevcut Stok: {{currentStock}} adet
⚠️ Eşik Değeri: {{threshold}} adet

Acil tedarik gerekli!

VentHub Stok Yönetimi`,
    
    out_of_stock: `🔴 KRİTİK: STOK TÜKENDİ! 🔴

📦 Ürün: {{productName}}
❌ Mevcut Stok: 0 adet

ACIL TEDARIK GEREKLİ!

VentHub Stok Yönetimi`
  },
  
  sms: {
    low_stock: `VentHub UYARI: {{productName}} stoku düşük ({{currentStock}}/{{threshold}}). Tedarik gerekli.`,
    out_of_stock: `VentHub KRİTİK: {{productName}} stokta yok! Acil tedarik gerekli.`
  }
}
