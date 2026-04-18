import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

interface Product {
  id: string
  name: string
  stock_qty: number
  low_stock_threshold: number
}

interface AlertRecipient {
  name: string
  phone: string
  email: string
  whatsapp: string
  role: 'admin' | 'manager' | 'buyer'
  notifications: {
    low_stock: boolean
    out_of_stock: boolean
    sms: boolean
    whatsapp: boolean
    email: boolean
  }
}

interface AlertData {
  productName: string
  _productId: string
  currentStock: number
  threshold: number
  alertType: 'out_of_stock' | 'low_stock'
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase Config' }), { status: 500, headers: corsHeaders })
  }


    if (req.headers.get('Authorization') !== `Bearer ${serviceRoleKey}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    let alertResults = []

    if (req.method === 'GET') {
      // Tüm ürünleri kontrol et
      alertResults = await checkAllProducts(supabase)
    } else if (req.method === 'POST') {
      // Spesifik bir ürünü kontrol et (Genelde stok değişimi sonrası tetiklenir)
      const { _productId } = await req.json()
      if (!_productId) throw new Error('Product ID is required')
      alertResults = await checkSpecificProduct(supabase, _productId)
    }

    return new Response(JSON.stringify({
      success: true,
      alerts_processed: alertResults.length,
      results: alertResults,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: unknown) {
    const err = error as Error
    console.error('[FATAL] Stock alert error:', err)
    return new Response(JSON.stringify({ error: err.message, success: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function checkAllProducts(supabase: SupabaseClient) {
  // Eşik değerinin altında kalan ürünleri çek
  // Üstteki filtreleme SQL tarafında karmaşık olabilir, basitleştirip JS tarafında filtreleyelim
  const { data: allLowStock, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, stock_qty, low_stock_threshold')
    .filter('stock_qty', 'lte', 10) // Önce genel bir filtre
  
  if (fetchErr) throw fetchErr

  const productsToAlert = ((allLowStock || []) as Product[]).filter(p => p.stock_qty <= (p.low_stock_threshold || 5))
  console.warn(`[JOB] Found ${productsToAlert.length} products requiring alerts`)

  const results = []
  for (const product of productsToAlert) {
    results.push(await processProductAlert(supabase, product))
  }
  return results
}

async function checkSpecificProduct(supabase: SupabaseClient, _productId: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, stock_qty, low_stock_threshold')
    .eq('id', _productId)
    .single()

  if (error || !product) throw new Error('Product not found')

  if (product.stock_qty > (product.low_stock_threshold || 5)) {
    return [{ product: product.name, message: 'Stock above threshold' }]
  }

  return [await processProductAlert(supabase, product as Product)]
}

async function processProductAlert(supabase: SupabaseClient, product: Product) {
  const recipients = await getAlertRecipients(supabase)
  const alertType = product.stock_qty <= 0 ? 'out_of_stock' : 'low_stock'
  const priority = product.stock_qty <= 0 ? 'critical' : 'high'

  const alertData: AlertData = {
    productName: product.name,
    _productId: product.id,
    currentStock: product.stock_qty,
    threshold: product.low_stock_threshold || 5,
    alertType
  }

  const notifications = []
  for (const recipient of recipients) {
    if (!recipient.notifications[alertType]) continue

    // WhatsApp
    if (recipient.notifications.whatsapp && recipient.whatsapp) {
      notifications.push(await sendNotification('whatsapp', recipient.whatsapp, alertData, priority))
    }
    // SMS
    if (recipient.notifications.sms && recipient.phone) {
      notifications.push(await sendNotification('sms', recipient.phone, alertData, priority))
    }
    // Email
    if (recipient.notifications.email && recipient.email) {
      notifications.push(await sendNotification('email', recipient.email, alertData, priority))
    }
  }

  return {
    product: product.name,
    alertType,
    notifications: notifications.length,
    success: notifications.every(n => n.success)
  }
}

async function sendNotification(type: string, to: string, data: AlertData, priority: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const response = await fetch(`${supabaseUrl}/functions/v1/notification-service`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        to,
        priority,
        data: {
          ...data,
          subject: data.alertType === 'out_of_stock' ? '🚨 KRİTİK: STOK TÜKENDİ' : '⚠️ DÜŞÜK STOK UYARISI'
        }
      })
    })

    return { type, recipient: to, success: response.ok }
  } catch (err) {
    console.error(`[ERROR] Notification failed (${type} to ${to}):`, err)
    return { type, recipient: to, success: false }
  }
}

async function getAlertRecipients(supabase: SupabaseClient): Promise<AlertRecipient[]> {
  // inventory_settings'den ana email'i al
  const { data: settings } = await supabase
    .from('inventory_settings')
    .select('alert_email')
    .maybeSingle()

  const recipients: AlertRecipient[] = []
  
  if (settings?.alert_email) {
    recipients.push({
      name: 'Sistem Yöneticisi',
      phone: '',
      email: settings.alert_email,
      whatsapp: '',
      role: 'manager',
      notifications: { low_stock: true, out_of_stock: true, sms: false, whatsapp: false, email: true }
    })
  }

  // Fallback (En azından bir yere gitmeli)
  if (recipients.length === 0) {
    recipients.push({
      name: 'Acil Durum Bildirimi',
      phone: '',
      email: 'stok@venthub.com',
      whatsapp: '',
      role: 'manager',
      notifications: { low_stock: true, out_of_stock: true, sms: false, whatsapp: false, email: true }
    })
  }

  return recipients
}
