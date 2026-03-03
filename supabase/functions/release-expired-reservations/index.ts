import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

serve(async (_req) => {
    // Sistem yetkilerine sahip client oluşturuyoruz (RLS atlar)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: 'Missing Supabase Config' }), { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // 1. Gecikme süresi ayarını (saat) tablodan al, yoksa 24 saat
        const { data: settings } = await supabase.from('inventory_settings').select('reservation_timeout_hours').single()
        const hours = settings?.reservation_timeout_hours || 24

        // 2. Süresi dolmuş, ödemesi gelmemiş siparişleri bul
        const timeoutDate = new Date()
        timeoutDate.setHours(timeoutDate.getHours() - hours)

        console.log(`Checking for orders created before ${timeoutDate.toISOString()} with timeout: ${hours}h`)

        const { data: expiredOrders, error: findErr } = await supabase
            .from('venthub_orders')
            .select('id')
            .eq('status', 'pending')
            .eq('payment_status', 'pending')
            .lt('created_at', timeoutDate.toISOString())

        if (findErr) throw findErr

        if (!expiredOrders || expiredOrders.length === 0) {
            return new Response(JSON.stringify({ message: 'No expired reservations found.' }), {
                headers: { 'Content-Type': 'application/json' }
            })
        }

        let releasedCount = 0

        // 3. Her sipariş için iptal ve restorasyon
        for (const order of expiredOrders) {
            // a. İptal olarak işaretle
            await supabase.from('venthub_orders').update({
                status: 'cancelled',
                payment_status: 'failed'
            }).eq('id', order.id)

            // b. Log yaz
            await supabase.from('order_notes').insert({
                order_id: order.id,
                note: `Sistem Otomasyonu: ${hours} saatlik rezervasyon/ödeme süresi dolduğu için sipariş iptal edildi ve stok boşa çıkarıldı.`
            })

            // c. Stok değerlerini geri ver 
            const { data: items } = await supabase.from('venthub_order_items').select('product_id, quantity').eq('order_id', order.id)
            if (items && items.length > 0) {
                for (const item of items) {
                    // Mewcut stoğu oku
                    const { data: prod } = await supabase.from('products').select('stock_qty').eq('id', item.product_id).single()
                    if (prod) {
                        const newStock = (prod.stock_qty || 0) + item.quantity

                        // Stok güncelle
                        await supabase.from('products').update({ stock_qty: newStock }).eq('id', item.product_id)

                        // Hareket olarak kaydet
                        await supabase.from('inventory_movements').insert({
                            product_id: item.product_id,
                            delta: item.quantity,
                            reason: 'return', // Rezervasyon iptali
                            order_id: order.id
                        })
                    }
                }
            }
            releasedCount++
        }

        return new Response(JSON.stringify({
            success: true,
            released_count: releasedCount,
            message: `Released ${releasedCount} expired orders and their stock reservations.`
        }), { headers: { 'Content-Type': 'application/json' } })

    } catch (error: unknown) {
        console.error('Edge Function Error:', error)
        const msg = error instanceof Error ? error.message : String(error)
        return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
})
