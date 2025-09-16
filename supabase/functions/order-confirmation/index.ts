import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

function renderTemplate(tpl: string, data: Record<string, unknown>): string {
  tpl = tpl.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/?if}}/g, (_m, key: string, inner: string) => {
    const v = data[key]
    const truthy = !!(typeof v === 'string' ? v : v)
    return truthy ? inner : ''
  })
  tpl = tpl.replace(/{{(\w+)}}/g, (_m, key: string) => {
    const v = data[key]
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
  const origin = req.headers.get('origin') ?? '*'
  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': req.headers.get('access-control-request-headers') ?? 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': req.headers.get('access-control-request-method') ?? 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } })

  try {
    const text = await req.text()
    let parsed: Record<string, unknown> = {}
    try { parsed = text ? JSON.parse(text) : {} } catch {}

    // inputs
    const order_id = ((): string | null => {
      const v = parsed['order_id']
      if (typeof v === 'string' && v.trim()) return v.trim()
      return null
    })()

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
    let emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub Test <onboarding@resend.dev>'
    const testMode = (Deno.env.get('EMAIL_TEST_MODE') || '').toLowerCase() === 'true'
    const testTo = Deno.env.get('EMAIL_TEST_TO') || 'delivered@resend.dev'
    const bccList = (Deno.env.get('SHIP_EMAIL_BCC') || '').split(',').map(s=>s.trim()).filter(Boolean)

    const brandName = Deno.env.get('BRAND_NAME') || 'VentHub'
    const brandPrimary = Deno.env.get('BRAND_PRIMARY_COLOR') || '#2563eb'
    const brandLogoUrl = Deno.env.get('BRAND_LOGO_URL') || ''

    if (!supabaseUrl || !serviceKey || !resendApiKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (!order_id) {
      return new Response(JSON.stringify({ error: 'missing_fields', missing: ['order_id'] }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // fetch order basics
    let customer_email: string | null = null
    let customer_name: string | null = null
    let order_number: string | null = null
    try {
      const o = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&select=user_id,customer_email,customer_name,order_number`, {
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
              const uj = await u.json().catch(()=>null) as any
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
      if (!resp.ok) return new Response(JSON.stringify({ error: 'send_failed', body: txt }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
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

    return new Response(JSON.stringify({ success: true, subject, result }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: 'unexpected', message: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})