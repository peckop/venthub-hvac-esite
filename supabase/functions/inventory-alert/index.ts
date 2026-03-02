import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

interface WebhookPayload {
    alert_type: 'critical_stock' | 'out_of_stock'
    product_id: string
    product_name: string
    current_stock: number
    threshold: number
    location?: string
    supplier?: string
    timestamp: string
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

        const supabase = createClient(supabaseUrl, serviceRoleKey)

        // 1. Ayarları Çek
        const { data: settings, error: settingsError } = await supabase
            .from('inventory_settings')
            .select('alert_email, alert_webhook_url')
            .eq('id', 1)
            .single()

        if (settingsError) {
            console.warn("Ayarlar bulunamadı, varsayılan değerlerle devam edilecek.", settingsError)
        }

        // 2. Kritik/Tükenmiş ürünleri çek (stock <= threshold)
        // inventory_summary view'unu kullanabiliriz
        const { data: lowStockProducts, error: productsError } = await supabase
            .from('inventory_summary')
            .select('*')
            .filter('available_stock', 'lte', 10) // Basit bir eşik. Gerçekte threshold map'den veya üründen okunur. 
        // Not: Eşikler inventory_low_stock_thresholds tablosundan veya default_low_stock_threshold'dan gelebilir.
        // Basitlik için stock_qty <= 5 diyelim veya ürüne özel veriyi çekelim.

        // Gerçekte inventory_velocity veya products tablosundan eşikleri detaylı okumak gerekir.
        // Şimdilik Phase 2 gereği basit bir sorgu atıyoruz:
        const { data: products } = await supabase
            .from('products')
            .select('id, name, stock_qty, low_stock_threshold, warehouse_location, supplier_name')

        if (!products) throw new Error('Ürünler çekilemedi')

        let defaultThreshold = 10
        const { data: defaultSet } = await supabase.from('inventory_settings').select('default_low_stock_threshold').single()
        if (defaultSet && defaultSet.default_low_stock_threshold) {
            defaultThreshold = defaultSet.default_low_stock_threshold
        }

        const alertsSent = []

        for (const p of products) {
            const threshold = p.low_stock_threshold ?? defaultThreshold
            if (p.stock_qty <= threshold) {
                const payload: WebhookPayload = {
                    alert_type: p.stock_qty <= 0 ? 'out_of_stock' : 'critical_stock',
                    product_id: p.id,
                    product_name: p.name,
                    current_stock: p.stock_qty,
                    threshold: threshold,
                    location: p.warehouse_location,
                    supplier: p.supplier_name,
                    timestamp: new Date().toISOString()
                }

                // Webhook'a gönder
                if (settings?.alert_webhook_url) {
                    try {
                        await fetch(settings.alert_webhook_url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        })
                        console.log(`Webhook sent for ${p.name}`)
                    } catch (err) {
                        console.error(`Webhook error for ${p.name}:`, err)
                    }
                }

                // E-Posta gönderimi (notification-service veya SendGrid)
                if (settings?.alert_email) {
                    // Bu kısımda e-posta servisine (örn: notification-service) POST atılır
                    try {
                        await fetch(`${supabaseUrl}/functions/v1/notification-service`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                type: 'email',
                                to: settings.alert_email,
                                subject: p.stock_qty <= 0 ? `🚨 TÜKENDİ: ${p.name}` : `⚠️ DÜŞÜK STOK: ${p.name}`,
                                message: `Ürün: ${p.name}\nMevcut Stok: ${p.stock_qty}\nEşik: ${threshold}\nRaf: ${p.warehouse_location || '-'}\nTedarikçi: ${p.supplier_name || '-'}`
                            })
                        })
                    } catch (err) {
                        console.error(`Email error for ${p.name}:`, err)
                    }
                }

                alertsSent.push(p.id)
            }
        }

        return new Response(JSON.stringify({
            success: true,
            alerts_triggered: alertsSent.length,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: unknown) {
        console.error('Inventory alert error:', error)
        const msg = error instanceof Error ? error.message : 'Unknown error'
        return new Response(JSON.stringify({ error: msg, success: false }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
