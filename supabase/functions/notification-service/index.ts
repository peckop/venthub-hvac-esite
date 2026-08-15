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

type TemplateData = Record<string, string | number | boolean>;

interface NotificationRequest {
  type: 'whatsapp' | 'sms' | 'email'
  to: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  template?: string
  data?: TemplateData
  tenant_id?: string
}

interface _StockAlertData {
  productName: string
  currentStock: number
  threshold: number
  _productId: string
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

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
    const body = await req.json().catch(()=>({})) as NotificationRequest
    const { type, to, message, priority, template, data } = body

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
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing or invalid Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    // Sınıf (b) service_role VEYA sınıf (a) admin/superadmin.
    if (ctx.kind !== 'service_role' && !ADMIN_ROLES.includes(ctx.role ?? '')) {
      return new Response(JSON.stringify({ error: 'forbidden', message: 'Insufficient privileges' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Tenant artık istekten DEĞİL, doğrulanmış çağırandan gelir (§3.9).
    // `stock-alert` bu ucu gövdesinde tenant GÖNDERMEDEN çağırır → sınıf (b) DEFAULT
    // fallback'i (tenantFromServiceBody) o zinciri ayakta tutar (plan R4).
    const tenantId = ctx.tenantId
    // Branding kapının ARKASINDA: yetkisiz çağıran `tenants` tablosuna sorgu tetikleyemez.
    const branding = await getTenantBranding(tenantId)

    // Environment variables
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER') // _e.g., 'whatsapp:+14155238886'
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    let emailFrom = branding.emailFrom
    const notifyDebug = Deno.env.get('NOTIFY_DEBUG') === 'true'
    
    let result: unknown = { success: false, note: undefined as unknown }

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
        result = await sendEmail(to, message, template, { ...(data||{}), emailFrom, brandName: branding.brandName, brandPrimaryColor: branding.brandPrimaryColor }, {
          apiKey: resendApiKey!,
          from: emailFrom,
        })
        break
      
      default:
        throw new Error(`Unsupported notification type: ${type}`)
    }

    console.warn(`📱 Notification sent: ${type} to ${to} - Priority: ${priority}`)
    
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

  } catch (error: unknown) {
    console.error('Notification service error:', error)
    
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

interface TwilioConfig { accountSid: string; authToken: string; fromNumber: string }

async function sendWhatsApp(to: string, message: string, template?: string, data?: TemplateData, config?: TwilioConfig) {
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

async function sendSMS(to: string, message: string, config: TwilioConfig) {
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

async function sendEmail(to: string, message: string, template?: string, data?: TemplateData, config?: { apiKey: string; from?: string }) {
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

function formatTemplate(template: string, data?: TemplateData): string {
  if (!data) return template
  
  let formatted = template
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g')
    const value = String(data[key])
    formatted = formatted.replace(placeholder, value)
  })
  
  return formatted
}

// Stock alert template examples (currently unused)
const _stockAlertTemplates = {
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
