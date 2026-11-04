// Çağıran sınıfı: (b) zamanlanmış iş (service_role) — ya da (a) yönetici; ortak resolveCaller kapısı
//
// Süresi dolan stok rezervasyonlarını bırakır. Çağıranlar: `.github/workflows/expired-reservations-cron.yml`
// (Bearer service_role) ve yönetici paneli. TENANT: tüm kiracıları süpürür (Faz 2 borcu, R13).
import { getCorsHeaders } from '../_shared/cors.ts'
import { ayricalikliMi, resolveCaller } from '../_shared/caller.ts'
import { eslesmeyenOdemeSiparisleri } from '../_shared/odeme_inceleme.ts'
import { raiseRevenueAlarm } from '../_shared/revenue_alarm.ts'
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

Deno.serve(async (req: Request) => {
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


    // KAPI (karne 2026-11 kök 2 · K4): eskiden service_role anahtarı `authHeader ===
    // \`Bearer ${key}\`` ile (sabit zamanlı DEĞİL) karşılaştırılıyor, admin dalı ise kendi
    // `getUser` + `user_profiles` kopyasını taşıyordu. Artık ortak `resolveCaller`: anahtar
    // sabit zamanlı, rol ve tenant tek satırdan. Profil okunamazsa sessiz geçiş YOK → 500.
    let isAuthorized = false
    try {
      isAuthorized = ayricalikliMi(await resolveCaller(req))
    } catch (err) {
      console.warn('release-expired-reservations: kimlik kapısı ölçülemedi:', err instanceof Error ? err.name : 'hata')
      return new Response(JSON.stringify({ error: 'auth_check_failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
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

        // ⛔PARASI ÇEKİLMİŞ OLABİLECEK SİPARİŞ İPTAL EDİLMEZ (karne 2026-11 P2 · OPS-222).
        //
        // `iyzico-callback` ödeme BAŞARILI ama siparişle eşleşmediğinde siparişe hiçbir şey yazmaz;
        // sipariş `pending/pending` kalır ve tek iz `client_errors`'taki `PAYMENT_ORDER_MISMATCH`
        // alarmıdır. Bu iş yalnız durum + yaşa bakıyordu: müşteri ödemiş, 24 saat sonra sipariş
        // `cancelled + failed`. Artık o kaydı taşıyan sipariş `pending` kalır ve raporlanır.
        // Kayıt sorgusu düşerse HİÇBİR sipariş iptal edilmez: "bakamadım" "kayıt yok" değildir.
        const adaylar = expiredOrders as ExpiredOrder[]
        let incelemeSeti: Set<string>
        try {
            incelemeSeti = await eslesmeyenOdemeSiparisleri(supabaseUrl, supabaseKey, adaylar.map((o) => o.id))
        } catch (olcumErr) {
            console.warn('[JOB] needs_review kaydi olculemedi; hicbir siparis iptal edilmedi:', olcumErr instanceof Error ? olcumErr.message : 'hata')
            return new Response(JSON.stringify({ error: 'review_check_failed', released: 0 }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }
        const incelemeBekleyen = adaylar.filter((o) => incelemeSeti.has(o.id)).map((o) => o.id)
        if (incelemeBekleyen.length > 0) {
            await raiseRevenueAlarm(supabaseUrl, supabaseKey, {
                fn: 'release-expired-reservations',
                code: 'PAYMENT_NEEDS_REVIEW_SURESI_DOLDU',
                message: `${incelemeBekleyen.length} siparis rezervasyon suresini doldurdu ama eslesmeyen odeme kaydi var; iptal EDILMEDI, insan mudahalesi gerekiyor.`,
                extra: { adet: incelemeBekleyen.length, order_ids: incelemeBekleyen },
            })
        }

        for (const order of adaylar.filter((o) => !incelemeSeti.has(o.id))) {

            try {
                // a. Siparişi iptal et — yalnız HÂLÂ pending/pending ise. Okuma ile yazma arasında
                // callback siparişi ilerletmiş olabilir; koşulsuz yazım ödenmiş siparişi ezerdi.
                const { data: guncellenen, error: updateErr } = await supabase
                    .from('venthub_orders')
                    .update({
                        status: 'cancelled',
                        payment_status: 'failed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', order.id)
                    .eq('status', 'pending')
                    .eq('payment_status', 'pending')
                    .select('id')

                if (updateErr) throw updateErr
                if (!Array.isArray(guncellenen) || guncellenen.length === 0) {
                    console.warn(`[JOB] Order ${order.id} artik pending degil; atlandi`)
                    continue
                }

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
            // Boşken de yazılır: "hiç olmadı" ile "hiç bakılmadı" ayırt edilsin.
            inceleme_bekleyen: incelemeBekleyen,
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
