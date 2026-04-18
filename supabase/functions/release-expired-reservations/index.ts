import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InventorySettings {
    reservation_timeout_hours: number
}

interface ExpiredOrder {
    id: string
    order_number: string | null
}

interface OrderItem {
    product_id: string
    quantity: number
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: 'Missing Supabase Config' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
    }


    const authHeader = req.headers.get('Authorization')
    let isAuthorized = false
    if (authHeader === `Bearer ${supabaseKey}`) {
      isAuthorized = true
    } else if (authHeader) {
      try {
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
        const { createClient: createClientAuth } = await import('https://esm.sh/@supabase/supabase-js@2.45.4')
        const authClient = createClientAuth(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
        const { data: { user } } = await authClient.auth.getUser()
        if (user) {
          const roleCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${user.id}&select=role`, {
            headers: { Authorization: `Bearer ${supabaseKey}`, apikey: supabaseKey }
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

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // 1. Ayarları al (saat cinsinden timeout)
        const { data: settingsData } = await supabase
            .from('inventory_settings')
            .select('reservation_timeout_hours')
            .maybeSingle()
        
        const settings = settingsData as InventorySettings | null
        const hours = settings?.reservation_timeout_hours || 24

        // 2. Zaman eşiğini hesapla
        const timeoutDate = new Date()
        timeoutDate.setHours(timeoutDate.getHours() - hours)

        console.warn(`[JOB] Checking for orders before: ${timeoutDate.toISOString()} (Timeout: ${hours}h)`)

        // 3. Süresi dolmuş "pending" siparişleri bul
        const { data: expiredOrders, error: findErr } = await supabase
            .from('venthub_orders')
            .select('id, order_number')
            .eq('status', 'pending')
            .eq('payment_status', 'pending')
            .lt('created_at', timeoutDate.toISOString())
            ._limit(100)

        if (findErr) throw findErr

        if (!expiredOrders || expiredOrders.length === 0) {
            return new Response(JSON.stringify({ message: 'No expired reservations found.', released: 0 }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        console.warn(`[JOB] Found ${expiredOrders.length} expired orders. Processing...`)
        let releasedCount = 0

        for (const order of (expiredOrders as ExpiredOrder[])) {

            try {
                // a. Siparişi iptal et
                const { error: updateErr } = await supabase
                    .from('venthub_orders')
                    .update({
                        status: 'cancelled',
                        payment_status: 'failed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', order.id)
                
                if (updateErr) throw updateErr

                // b. Log/Not ekle
                await supabase.from('order_notes').insert({
                    order_id: order.id,
                    note: `Sistem Otomasyonu: ${hours} saatlik rezervasyon/ödeme süresi dolduğu için sipariş iptal edildi ve stok boşa çıkarıldı.`,
                    is_internal: true
                })

                // c. Ürünleri ve stokları iade et
                const { data: itemsRaw } = await supabase
                    .from('venthub_order_items')
                    .select('product_id, quantity')
                    .eq('order_id', order.id)
                
                const items = itemsRaw as OrderItem[]
                
                if (items && items.length > 0) {
                    for (const item of items) {
                        // ATOMİK STOK ARTIŞI (adjust_stock_v2 RPC kullanıyoruz)
                        const { error: rpcErr } = await supabase.rpc('adjust_stock_v2', {
                            p_product_id: item.product_id,
                            p_delta: item.quantity
                        })

                        if (rpcErr) {
                            console.error(`[ERROR] Could not adjust stock for product ${item.product_id}:`, rpcErr)
                            continue
                        }

                        // Hareket kaydı
                        await supabase.from('inventory_movements').insert({
                            product_id: item.product_id,
                            delta: item.quantity,
                            reason: 'return', 
                            order_id: order.id
                        })
                        
                        console.warn(`[SUCCESS] Returned ${item.quantity} units to product ${item.product_id} from order ${order.order_number || order.id}`)
                    }
                }
                
                releasedCount++
            } catch (orderErr) {
                console.error(`[CRITICAL] Failed to release order ${order.id}:`, orderErr)
            }
        }

        return new Response(JSON.stringify({
            success: true,
            released_count: releasedCount,
            message: `Successfully released ${releasedCount} expired orders and restored their stock.`
        }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })

    } catch (error: unknown) {
        console.error('[FATAL] Edge Function Error:', error)
        const msg = error instanceof Error ? error.message : String(error)
        return new Response(JSON.stringify({ error: msg }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
    }
})
