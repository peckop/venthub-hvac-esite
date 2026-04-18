import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { sentryCaptureException } from "../_shared/sentry.ts"

// Tiny template renderer for {{var}} and {{#if var}} ... {{/if}}
function renderTemplate(tpl: string, _data: Record<string, unknown>): string {
  // if-blocks
  tpl = tpl.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/?if}}/g, (_m, key: string, inner: string) => {
    const v = _data[key]
    const truthy = !!(typeof v === 'string' ? v : v)
    return truthy ? inner : ''
  })
  // variables
  tpl = tpl.replace(/{{(\w+)}}/g, (_m, key: string) => {
    const v = _data[key]
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
}

serve(async (req) => {
  const requestOrigin = req.headers.get('origin') || ''
  const requestHeaders = req.headers.get('access-control-request-headers') ?? 'authorization, x-client-info, apikey, content-type'
  const requestMethod = req.headers.get('access-control-request-method') ?? 'POST, OPTIONS'
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const originAllowed = allowedOrigins.length === 0 || (requestOrigin && allowedOrigins.includes(requestOrigin))
  const corsHeaders = {
    'Access-Control-Allow-Origin': originAllowed ? (requestOrigin || '*') : 'null',
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': requestHeaders,
    'Access-Control-Allow-Methods': requestMethod,
    'Access-Control-Max-Age': '86400',
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const body = await req.json().catch(()=>({})) as ShippingNotificationRequest
    const { order_id, customer_email, customer_name, carrier, tracking_number, tracking_url } = body
    let { order_number } = body

    if (!order_id || !customer_email || !customer_name || !carrier || !tracking_number) {
      const missing = [!order_id && 'order_id', !customer_email && 'customer_email', !customer_name && 'customer_name', !carrier && 'carrier', !tracking_number && 'tracking_number'].filter(Boolean)
      return new Response(JSON.stringify({ error: 'missing_fields', missing }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const authHeader = req.headers.get('Authorization')
    let isAuthorized = false
    if (authHeader === `Bearer ${SERVICE_KEY}`) {
      isAuthorized = true
    } else if (authHeader) {
      try {
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4')
        const authClient = createClient(SUPABASE_URL, anonKey, { global: { headers: { Authorization: authHeader } } })
        const { data: { user } } = await authClient.auth.getUser()
        if (user) {
          const roleCheck = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${user.id}&select=role`, {
            headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY }
          })
          if (roleCheck.ok) {
            const arr = await roleCheck.json().catch(() => [])
            const role = arr[0]?.role
            if (role === 'admin' || role === 'superadmin') {
              isAuthorized = true
            }
          }
        }
      } catch (err) {
        console.error('Auth fallback error:', err)
      }
    }

    if (!isAuthorized) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
    const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'VentHub <onboarding@resend.dev>'

    // Resolve order_number if missing
    if (!order_number && SUPABASE_URL && SERVICE_KEY) {
      try {
        const o = await fetch(`${SUPABASE_URL}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&select=order_number`, {
          headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY }
        })
        if (o.ok) {
          const arr = await o.json().catch(()=>[])
          if (Array.isArray(arr) && arr[0]) order_number = arr[0].order_number
        }
      } catch {}
    }

    const prettyOrderNo = order_number ? `#${order_number.split('-')[1]}` : `#${order_id.slice(-8).toUpperCase()}`
    const subject = `Siparişiniz kargoya verildi - ${prettyOrderNo}`

    let html = (await loadShippingTemplate()) || ''
    if (!html) {
      html = [
        '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">',
        '<h2>Siparişiniz Kargoya Verildi</h2>',
        `<p>Merhaba ${customer_name},</p>`,
        `<p><strong>${prettyOrderNo}</strong> numaralı siparişiniz kargoya verilmiştir.</p>`,
        `<p><strong>Kargo Firması:</strong> ${carrier}</p>`,
        `<p><strong>Takip Numarası:</strong> ${tracking_number}</p>`,
        tracking_url ? `<p><a href="${tracking_url}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Kargomu Takip Et</a></p>` : '',
        '<p>Teşekkürler,<br>VentHub Ekibi</p>',
        '</div>'
      ].join('')
    } else {
      html = renderTemplate(html, { customer_name, order_number: prettyOrderNo, carrier, tracking_number, tracking_url: tracking_url || '#' })
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: true, disabled: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to: [customer_email], subject, html })
    })

    if (!resp.ok) {
      const t = await resp.text().catch(()=>'')
      throw new Error(`Resend failed (${resp.status}): ${t}`)
    }

    const result = await resp.json().catch(()=>({}))
    return new Response(JSON.stringify({ success: true, order_id, result }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: unknown) {
    const err = error as Error
    console.error('Shipping notification error:', err.message)
    try { sentryCaptureException(err) } catch {}
    return new Response(JSON.stringify({ error: err.message, success: false }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
