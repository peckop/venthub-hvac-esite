import { getCorsHeaders } from '../_shared/cors.ts'
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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
}

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

    const authHeader = req.headers.get('Authorization')
    let isAuthorized = false
    if (authHeader === `Bearer ${serviceKey}`) {
      isAuthorized = true
    } else if (authHeader) {
      try {
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4')
        const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
        const { data: { user } } = await authClient.auth.getUser()
        if (user) {
          const roleCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${user.id}&select=role`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
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


    let customer_email: string | undefined = undefined
    let customer_name: string | undefined = undefined
    let user_id: string | undefined = undefined

    if (!supabaseUrl || !serviceKey) {
      customer_email = body.customer_email
      customer_name = body.customer_name
    } else {
      try {
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
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    if (!customer_email || !customer_name) {
      return new Response(JSON.stringify({ error: 'Customer info unavailable' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

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
    const subject = `İade durumu güncellendi - ${prettyOrderNo}`
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub <info@venthub.com>'
    
    if (!resendApiKey) {
      return new Response(JSON.stringify({ success: true, disabled: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: emailFrom,
        to: [customer_email],
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>İade Durumu Güncellendi</h2>
            <p>Merhaba ${customer_name},</p>
            <p>Siparişinizin iade durumu güncellendi: <strong>${statusLabel}</strong></p>
            <p>Sebepler: ${reason}</p>
            ${description ? `<p>Açıklama: ${description}</p>` : ''}
            <p>Teşekkürler,<br>VentHub Ekibi</p>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Email failed: ${errorText}`)
    }

    console.warn(`📧 Notification sent to ${customer_email} for return ${return_id}: ${old_status} → ${new_status}`)

    return new Response(JSON.stringify({ success: true, return_id, new_status }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Notification error:', msg)
    return new Response(JSON.stringify({ error: msg, success: false }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
