import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface DeliveryRequest {
  order_id: string
  customer_email?: string
  customer_name?: string
  order_number?: string
}

function render(tpl: string, data: Record<string, unknown>) {
  return tpl.replace(/{{(\w+)}}/g, (_m, k) => String(data[k] ?? ''))
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
    let emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub <onboarding@resend.dev>'

    const body = await req.json().catch(()=>({})) as DeliveryRequest
    let { order_id, customer_email, customer_name, order_number } = body
    if (!order_id) return new Response(JSON.stringify({ error: 'missing_fields', missing: ['order_id'] }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

    // Derive info if missing
    if ((!customer_email || !customer_name || !order_number) && supabaseUrl && serviceKey) {
      const o = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(order_id)}&select=order_number,customer_name,customer_email`, {
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
      return new Response(JSON.stringify({ error: 'customer_info_missing' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const prettyOrderNo = order_number ? `#${order_number.split('-')[1]}` : `#${order_id.slice(-8).toUpperCase()}`
    const subject = `Siparişiniz teslim edildi - ${prettyOrderNo}`

    let html = (await loadTemplate()) || ''
    if (!html) {
      html = [
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
        '<h2 style="color: #2563eb;">Teslimat Tamamlandı</h2>',
        `<p>Merhaba <strong>${customer_name}</strong>,</p>`,
        `<p><strong>${prettyOrderNo}</strong> numaralı siparişiniz başarıyla teslim edilmiştir.</p>`,
        '<p>Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.</p>',
        '<p>Teşekkürler,<br><strong>VentHub Ekibi</strong></p>',
        '</div>'
      ].join('')
    } else {
      html = render(html, { customer_name, order_number: prettyOrderNo })
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ disabled: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: emailFrom, to: [customer_email], subject, html })
    })
    if (!resp.ok) {
      const t = await resp.text().catch(()=> '')
      return new Response(JSON.stringify({ error: 'send_failed', body: t }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    const result = await resp.json().catch(()=>({}))

    // Audit
    try {
      if (supabaseUrl && serviceKey) {
        await fetch(`${supabaseUrl}/rest/v1/shipping_email_events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'return=minimal' },
          body: JSON.stringify({ order_id, email_to: customer_email, subject, provider: 'resend', provider_message_id: result?.id || null })
        })
      }
    } catch {}

    return new Response(JSON.stringify({ ok: true, order_id, subject, result }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
