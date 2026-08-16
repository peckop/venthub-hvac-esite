import { getCorsHeaders } from '../_shared/cors.ts'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

interface InventorySettings {
    reservation_timeout_hours: number
}

interface ExpiredOrder {
    id: string
    order_number: string | null
}

// NOT: `OrderItem` tipi kaldirildi — bu fonksiyon artik siparis kalemlerini HIC OKUMUYOR.
// Stok geri-vermesi `process_order_stock_restore` RPC'sine devredildi ve o, kalemlere degil
// `inventory_movements` kanitina bakiyor (T052-VH).

serve(async (req: Request) => {
    // CORS başlıkları req'e bağlı (origin allowlist) → modül seviyesinde tutulamaz.
    const corsHeaders = getCorsHeaders(req)

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
        const { data: { user } } = await authClient.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''))
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
        console.warn('Auth fallback error:', err)
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
            .limit(100)

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

                // c. Stoğu geri ver — YALNIZCA gerçekten düşülmüşse (T052-VH).
                //
                // ESKİ HÂLİ EN AĞIR YOLDU. Burası `pending` siparişleri, yani ödemesi HİÇ
                // ALINMAMIŞ siparişleri temizliyor. Eski kod `venthub_order_items`'a bakıp her
                // kalem için `adjust_stock_v2(+quantity)` çağırıyordu — hiç düşülmemiş miktarı
                // geri ekliyordu. Sonuç doğrudan HAYALÎ STOK: süresi dolan her sepet envanteri
                // şişiriyordu. Üstelik satışta stok zaten hiç düşmüyordu (RPC kapısı `'paid'`
                // bekliyor, öyle bir statü sözlükte YOK), yani dengeleyen taraf da yoktu.
                //
                // Şimdi tek kanıta-bağlı RPC. Kanıt = `inventory_movements`'taki `order_sale`
                // satırları. `pending` bir sipariş için öyle satır YOKTUR → RPC hiçbir şey
                // yapmaz ve `restored_count: 0` döner. Doğru davranış budur: kapatılan bir
                // rezervasyon, alınmamış stoğu geri veremez.
                const { data: restoreRaw, error: restoreErr } = await supabase.rpc('process_order_stock_restore', {
                    p_order_id: order.id,
                    p_reason: 'order_expire',
                })

                if (restoreErr) {
                    console.warn(`[ERROR] Stock restore RPC failed for order ${order.id}:`, restoreErr)
                } else {
                    // HTTP 200 tek başına başarı DEĞİL — T052'nin kök sebeplerinden biri tam
                    // olarak bu varsayımdı (callback, RPC'nin `success:false` yanıtına bakmadan
                    // `stock_processed=true` damgası basıyordu).
                    const restore = restoreRaw as { success?: boolean; error?: string; restored_count?: number; restored_units?: number } | null
                    if (restore?.success === false) {
                        console.warn(`[ERROR] Stock restore rejected for order ${order.id}: ${restore.error}`)
                    } else {
                        console.warn(`[SUCCESS] Order ${order.order_number || order.id}: ${restore?.restored_count ?? 0} product(s), ${restore?.restored_units ?? 0} unit(s) restored`)
                    }
                }
                
                releasedCount++
            } catch (orderErr) {
                console.warn(`[CRITICAL] Failed to release order ${order.id}:`, orderErr)
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
        console.warn('[FATAL] Edge Function Error:', error)

        return new Response(JSON.stringify({ error: 'internal_error' }), {
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
    }
})
