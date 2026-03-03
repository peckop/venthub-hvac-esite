import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }

    interface AlertSendResult { type: 'whatsapp' | 'sms' | 'email'; recipient: string; success: boolean; result?: unknown; error?: string }
    interface ProductAlertResult { product: string; alertType: string; priority: string; stock: number; threshold: number; notifications: AlertSendResult[]; totalNotifications: number; successfulNotifications: number }
    let alertResults: ProductAlertResult[] = []

    if (req.method === 'GET') {
      // Check all products for stock alerts
      alertResults = await checkAllProducts(supabaseUrl, serviceRoleKey)
    } else if (req.method === 'POST') {
      // Check specific product (triggered by stock change)
      const { productId } = await req.json()
      if (!productId) {
        throw new Error('Product ID is required')
      }
      alertResults = await checkSpecificProduct(productId, supabaseUrl, serviceRoleKey)
    }

    return new Response(JSON.stringify({
      success: true,
      alerts_sent: alertResults.length,
      results: alertResults,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: unknown) {
    console.error('Stock alert error:', error)

    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({
      error: msg,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function checkAllProducts(supabaseUrl: string, serviceRoleKey: string) {
  const headers = {
    'Authorization': `Bearer ${serviceRoleKey}`,
    'apikey': serviceRoleKey,
    'Content-Type': 'application/json'
  }

  // Get all products with stock at or below threshold
  const productsResp = await fetch(
    `${supabaseUrl}/rest/v1/products?select=id,name,stock_qty,low_stock_threshold&stock_qty=lte.low_stock_threshold`,
    { headers }
  )

  if (!productsResp.ok) {
    throw new Error('Failed to fetch products')
  }

  const products: Product[] = await productsResp.json()
  console.log(`Found ${products.length} products requiring alerts`)

  const alertResults: ProductAlertResult[] = []

  for (const product of products) {
    try {
      const result = await processProductAlert(product, supabaseUrl, serviceRoleKey)
      alertResults.push(result)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`Failed to process alert for ${product.name}:`, msg)
      alertResults.push({
        product: product.name,
        alertType: product.stock_qty === 0 ? 'out_of_stock' : 'low_stock',
        priority: product.stock_qty === 0 ? 'critical' : 'high',
        stock: product.stock_qty,
        threshold: product.low_stock_threshold || 5,
        notifications: [],
        totalNotifications: 0,
        successfulNotifications: 0
      })
    }
  }

  return alertResults
}

async function checkSpecificProduct(productId: string, supabaseUrl: string, serviceRoleKey: string) {
  const headers = {
    'Authorization': `Bearer ${serviceRoleKey}`,
    'apikey': serviceRoleKey,
    'Content-Type': 'application/json'
  }

  // Get specific product
  const productResp = await fetch(
    `${supabaseUrl}/rest/v1/products?id=eq.${productId}&select=id,name,stock_qty,low_stock_threshold`,
    { headers }
  )

  if (!productResp.ok) {
    throw new Error('Failed to fetch product')
  }

  const products: Product[] = await productResp.json()
  if (products.length === 0) {
    throw new Error('Product not found')
  }

  const product = products[0]

  // Check if alert is needed
  if (product.stock_qty > (product.low_stock_threshold || 5)) {
    return [{
      product: product.name,
      success: true,
      message: 'No alert needed - stock above threshold'
    }]
  }

  const result = await processProductAlert(product, supabaseUrl, serviceRoleKey)
  return [result]
}

async function processProductAlert(product: Product, supabaseUrl: string, serviceRoleKey: string) {
  // Get alert recipients configuration
  const recipients = await getAlertRecipients(supabaseUrl, serviceRoleKey)

  // Determine alert type
  const alertType: 'low_stock' | 'out_of_stock' = product.stock_qty <= 0 ? 'out_of_stock' : 'low_stock'
  const priority = product.stock_qty <= 0 ? 'critical' : 'high'

  // Prepare notification data
  const alertData = {
    productName: product.name,
    productId: product.id,
    currentStock: product.stock_qty,
    threshold: product.low_stock_threshold || 5,
    alertType
  }

  const notifications = []

  for (const recipient of recipients) {
    // Skip if recipient doesn't want this type of alert
    if (!recipient.notifications[alertType]) continue

    // Send WhatsApp if enabled
    if (recipient.notifications.whatsapp && recipient.whatsapp) {
      try {
        const whatsappResult = await sendNotification('whatsapp', recipient.whatsapp, alertData, priority)
        notifications.push({
          type: 'whatsapp',
          recipient: recipient.name,
          success: whatsappResult.success,
          result: whatsappResult
        })
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error(`WhatsApp notification failed for ${recipient.name}:`, msg)
        notifications.push({
          type: 'whatsapp',
          recipient: recipient.name,
          success: false,
          error: msg
        })
      }
    }

    // Send SMS if enabled
    if (recipient.notifications.sms && recipient.phone) {
      try {
        const smsResult = await sendNotification('sms', recipient.phone, alertData, priority)
        notifications.push({
          type: 'sms',
          recipient: recipient.name,
          success: smsResult.success,
          result: smsResult
        })
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error(`SMS notification failed for ${recipient.name}:`, msg)
        notifications.push({
          type: 'sms',
          recipient: recipient.name,
          success: false,
          error: msg
        })
      }
    }

    // Send Email if enabled
    if (recipient.notifications.email && recipient.email) {
      try {
        const emailResult = await sendNotification('email', recipient.email, alertData, priority)
        notifications.push({
          type: 'email',
          recipient: recipient.name,
          success: emailResult.success,
          result: emailResult
        })
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error(`Email notification failed for ${recipient.name}:`, msg)
        notifications.push({
          type: 'email',
          recipient: recipient.name,
          success: false,
          error: msg
        })
      }
    }
  }

  return {
    product: product.name,
    alertType,
    priority,
    stock: product.stock_qty,
    threshold: product.low_stock_threshold || 5,
    notifications,
    totalNotifications: notifications.length,
    successfulNotifications: notifications.filter(n => n.success).length
  }
}

interface AlertData { productName: string; productId: string; currentStock: number; threshold: number; alertType: 'low_stock' | 'out_of_stock' }
async function sendNotification(type: 'whatsapp' | 'sms' | 'email', to: string, data: AlertData, priority: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')

  // Template messages
  const templates = {
    whatsapp: {
      low_stock: `🚨 STOK UYARISI 🚨

📦 Ürün: {{productName}}
📊 Mevcut Stok: {{currentStock}} adet
⚠️ Eşik: {{threshold}} adet

Tedarik gerekli!

VentHub Stok Yönetimi`,

      out_of_stock: `🔴 KRİTİK: STOK TÜKENDİ! 🔴

📦 Ürün: {{productName}}
❌ Stok: 0 adet

ACİL TEDARİK GEREKLİ!

VentHub Stok Yönetimi`
    },

    sms: {
      low_stock: `VentHub UYARI: {{productName}} stoku düşük ({{currentStock}}/{{threshold}}). Tedarik gerekli.`,
      out_of_stock: `VentHub KRİTİK: {{productName}} stokta yok! Acil tedarik gerekli.`
    },

    email: {
      low_stock: `STOK UYARISI

Ürün: {{productName}}
Mevcut Stok: {{currentStock}} adet
Eşik Değeri: {{threshold}} adet

Lütfen tedarik planlaması yapınız.

VentHub Stok Yönetim Sistemi`,

      out_of_stock: `KRİTİK STOK UYARISI

Ürün: {{productName}}
Durum: STOK TÜKENDİ

ACİL TEDARİK GEREKLİ!

VentHub Stok Yönetim Sistemi`
    }
  }

  const template = templates[type][data.alertType] || templates[type].low_stock

  const notificationPayload = {
    type,
    to,
    message: template,
    priority,
    template,
    data: {
      ...data,
      subject: data.alertType === 'out_of_stock' ? 'KRİTİK STOK UYARISI' : 'Stok Uyarısı'
    }
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/notification-service`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(notificationPayload)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Notification service failed: ${error}`)
  }

  return await response.json()
}

async function getAlertRecipients(supabaseUrl: string, serviceRoleKey: string): Promise<AlertRecipient[]> {
  const headers = {
    'Authorization': `Bearer ${serviceRoleKey}`,
    'apikey': serviceRoleKey,
    'Content-Type': 'application/json'
  }

  try {
    const settingsResp = await fetch(
      `${supabaseUrl}/rest/v1/inventory_settings?select=alert_email,alert_webhook_url&limit=1`,
      { headers }
    )

    if (settingsResp.ok) {
      const settings = await settingsResp.json()
      if (settings && settings.length > 0) {
        const setting = settings[0]
        const baseRecipient: AlertRecipient = {
          name: 'Stok Yöneticisi',
          phone: '',
          email: setting.alert_email || '',
          whatsapp: '',
          role: 'manager',
          notifications: {
            low_stock: true,
            out_of_stock: true,
            sms: false,
            whatsapp: false,
            email: !!setting.alert_email
          }
        }

        // Eğer veritabanından geçerli bir email gelirse tek recipient olarak dönüyor
        return [baseRecipient]
      }
    }
  } catch (err) {
    console.warn('Failed to parse inventory_settings, falling back to defaults', err)
  }

  // Default recipients - fallback
  return [
    {
      name: 'Stok Yöneticisi',
      phone: '+905551234567',
      email: 'stok@venthub.com',
      whatsapp: '+905551234567',
      role: 'manager',
      notifications: {
        low_stock: true,
        out_of_stock: true,
        sms: true,
        whatsapp: true,
        email: true
      }
    }
  ]
}
