/**
 * orderStatusService.ts
 * Merkezi sipariş statü güncelleme servisi.
 *
 * Girdi  → orderId + yeni statü + opsiyonel context
 * İşlem  → venthub_orders güncelle → gerekirse venthub_returns upsert → audit log yaz
 * Çıktı  → { ok, error? }
 *
 * DB Kısıtlaması:
 * venthub_orders.status  → pending | confirmed | processing | shipped | delivered | cancelled
 * venthub_orders.payment_status → pending | paid | failed | refunded | partial_refunded
 *
 * "refunded" bir sipariş statüsü DEĞİL, ödeme statüsüdür.
 * Bu yüzden iade durumunda: status=cancelled + payment_status=refunded yapılır.
 */

import type { Database } from '../types/database.types'
import { canTransitionOrder } from './admin/orderStatusMachine'
import { logAdminAction } from './audit'
import { supabase } from './supabase'

// İade/İptal olarak kabul edilen statüler (UI tarafında kullanılan)
const RETURN_STATUSES = ['cancelled', 'refunded', 'partial_refunded'] as const

// Geçerli sipariş statüleri (DB check constraint)
const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const

interface UpdateOrderStatusInput {
    orderId: string
    newStatus: string           // UI'dan gelen statü (cancelled, refunded vb.)
    oldStatus?: string
    userId?: string | null      // sipariş sahibi (returns kaydı için)
    reason?: string             // returns kaydının açıklaması
    auditComment?: string       // audit log yorumu
    skipReturnsSync?: boolean   // returns tablosuna yazmayı atla
    skipOrdersSync?: boolean    // orders tablosuna yazmayı atla
}

interface UpdateOrderStatusResult {
    ok: boolean
    error?: string
    /**
     * Statü değişti AMA yan bir adım başarısız oldu (ör. stok geri verilemedi).
     * `ok: true` ile birlikte gelir — çağıran bunu kullanıcıya GÖSTERMELİ; sessizce
     * yutmak envanterin kaydığını gizler.
     */
    warning?: string
}

/**
 * UI statüsünü DB'ye uygun status + payment_status çiftine çevirir.
 *
 * Örnek:
 * "refunded" → { status: "cancelled", payment_status: "refunded" }
 * "shipped"  → { status: "shipped", payment_status: undefined }
 */
function resolveDbFields(uiStatus: string): { status: string; payment_status?: string } {
    if (uiStatus === 'refunded') {
        return { status: 'cancelled', payment_status: 'refunded' }
    }
    if (uiStatus === 'partial_refunded') {
        return { status: 'cancelled', payment_status: 'partial_refunded' }
    }
    // Geçerli sipariş statüsü mü kontrol et
    if ((VALID_ORDER_STATUSES as readonly string[]).includes(uiStatus)) {
        return { status: uiStatus }
    }
    // Bilinmeyen statü → cancelled olarak kaydet (güvenli varsayılan)
    return { status: 'cancelled' }
}

/**
 * Merkezi sipariş statüsü güncelleme fonksiyonu.
 */
export async function updateOrderStatus(input: UpdateOrderStatusInput): Promise<UpdateOrderStatusResult> {
    const {
        orderId,
        newStatus,
        oldStatus,
        userId,
        reason,
        auditComment,
        skipReturnsSync = false,
        skipOrdersSync = false,
    } = input

    let stockWarning: string | undefined

    try {
        /*
          --- 0. MONOTONLUK KAPISI (kural 11) ---
          Koruma bilerek SERVİSTE, arayüzde değil. Kanban'daki sürükle-bırak
          kontrolü yalnız kullanıcıya sebebini söyleyen bir NEZAKET katmanıdır;
          tek koruma orada olsaydı bileşen değiştiğinde sessizce düşerdi ve hiçbir
          birim testi göremezdi — bilerek bozma denemesinde tam olarak bu yaşandı:
          UI koşulu devre dışı bırakıldı, tüm testler YEŞİL kaldı. Mutasyonun tek
          kapısı burası olduğu için asıl değişmez burada durur.

          `oldStatus` verilmediğinde kontrol yapılamaz (çağıranın elinde kaynak
          statü yok) ve geçişe izin verilir; bu yol yalnız senkronizasyon
          çağrılarında kullanılıyor.
        */
        if (oldStatus && !skipOrdersSync && !canTransitionOrder(oldStatus, newStatus)) {
            return {
                ok: false,
                error: `Geçersiz statü geçişi: ${oldStatus} → ${newStatus} (sipariş durumu yalnız ileri taşınabilir)`,
            }
        }

        // --- 1. Sipariş statüsünü güncelle ---
        let deliveredNow = false
        if (!skipOrdersSync) {
            const dbFields = resolveDbFields(newStatus)
            const updatePayload: Database['public']['Tables']['venthub_orders']['Update'] = { status: dbFields.status }
            if (dbFields.payment_status) {
                updatePayload.payment_status = dbFields.payment_status
            }

            /*
              TESLİM ZAMAN DAMGASI — 2026-08-15'e kadar HİÇBİR yoldan yazılmıyordu.
              Tek yazıcısı `shipping-webhook`'tu ve o webhook'un ÇAĞIRANI yok (taşıyıcı
              entegrasyonu kurulmamış). Sonuç: `delivered_at` tüm siparişlerde NULL,
              teslim e-postası hiç gitmiyor ve "kaç günde teslim ediyoruz" sorusunun
              cevabı veride yok. Kanban'dan teslim işaretlemek ARA ÇÖZÜMDÜR; taşıyıcı
              entegrasyonu gelince webhook asıl kaynak olur ve buradaki yazım
              idempotent kalır (aşağıdaki `is('delivered_at', null)` koşulu).
            */
            if (dbFields.status === 'delivered') {
                const { data: stamped, error: deliverErr } = await supabase
                    .from('venthub_orders')
                    .update({ ...updatePayload, delivered_at: new Date().toISOString() })
                    .eq('id', orderId)
                    .is('delivered_at', null)
                    .select('id')

                if (deliverErr) throw new Error('Sipariş güncellenemedi: ' + deliverErr.message)

                // Satır dönmediyse damga ZATEN vardı → statüyü yine de hizala, ama
                // `delivered_at`'i EZME (ilk teslim anı korunur) ve e-posta TEKRAR gitmesin.
                deliveredNow = (stamped?.length ?? 0) > 0
                if (!deliveredNow) {
                    const { error: alignErr } = await supabase
                        .from('venthub_orders')
                        .update(updatePayload)
                        .eq('id', orderId)
                    if (alignErr) throw new Error('Sipariş güncellenemedi: ' + alignErr.message)
                }
            } else {
                const { error: orderErr } = await supabase
                    .from('venthub_orders')
                    .update(updatePayload)
                    .eq('id', orderId)

                if (orderErr) throw new Error('Sipariş güncellenemedi: ' + orderErr.message)
            }
        }

        // --- 2. İade/İptal → venthub_returns senkronizasyonu ve Stok Restorasyonu ---
        if (!skipReturnsSync && isReturnStatus(newStatus)) {
            await syncReturnsRecord(orderId, newStatus, userId, reason)

            // Eğer daha önceden iptal/iade HALE GELMEMİŞSE stokları iade et
            if (oldStatus && !isReturnStatus(oldStatus)) {
                const restore = await restoreStockForOrder(
                    orderId,
                    newStatus === 'cancelled' ? 'order_cancel' : 'order_refund',
                )
                /*
                  Hata SESSİZCE YUTULMAZ ama statüyü de geri almaz. Sipariş gerçekten
                  iptal/iade edildi; o kaydı geri çevirmek daha büyük bir yalan olurdu.
                  Ama stok geri verilmediyse envanter YANLIŞ ve elle düzeltme gerekir —
                  kullanıcı bunu görmek zorunda. Eski gövde `catch{}` ile yutuyordu,
                  yani envanter sessizce kayıyordu.
                */
                if (!restore.ok) {
                    stockWarning = restore.error ?? 'Stok geri verilemedi'
                    console.error('[orderStatusService] stok geri verme başarısız:', stockWarning)
                }
            }
        }

        /*
          --- 2b. Teslim bildirimi ---
          YALNIZ damganın İLK kez yazıldığı çağrıda tetiklenir; aksi halde panoda
          ileri-geri sürükleyen admin müşteriye tekrar tekrar "siparişiniz teslim
          edildi" e-postası gönderirdi.
          Best-effort: e-posta hatası teslim kaydını GERİ ALMAZ — teslim gerçekleşti,
          bildirim ayrı bir yan etkidir. `delivery-notification` yalnız `order_id`
          alır, alıcı bilgisini sunucuda çözer (istemci e-posta adresi göndermez).
        */
        if (deliveredNow) {
            try {
                await supabase.functions.invoke('delivery-notification', {
                    body: { order_id: orderId },
                })
            } catch {
                // yutulur — bildirim hatası statüyü geri almaz
            }
        }

        /*
          --- 2b. Teslim bildirimi ---
          YALNIZ damganın İLK kez yazıldığı çağrıda tetiklenir; aksi halde panoda
          ileri-geri sürükleyen admin müşteriye tekrar tekrar "siparişiniz teslim
          edildi" e-postası gönderirdi.
          Best-effort: e-posta hatası teslim kaydını GERİ ALMAZ — teslim gerçekleşti,
          bildirim ayrı bir yan etkidir. `delivery-notification` yalnız `order_id`
          alır, alıcı bilgisini sunucuda çözer (istemci e-posta adresi göndermez).
        */
        if (deliveredNow) {
            try {
                await supabase.functions.invoke('delivery-notification', {
                    body: { order_id: orderId },
                })
            } catch {
                // yutulur — bildirim hatası statüyü geri almaz
            }
        }

        // --- 3. Audit log (hata UI'ı bloklamasın) ---
        try {
            await logAdminAction(supabase, {
                table_name: 'venthub_orders',
                row_pk: orderId,
                action: 'UPDATE',
                before: oldStatus ? { status: oldStatus } : undefined,
                after: { status: newStatus },
                comment: auditComment || `status → ${newStatus}`
            })
        } catch {
            // audit log hataları sessizce yutulur
        }

        return stockWarning ? { ok: true, warning: stockWarning } : { ok: true }
    } catch (err: unknown) {
        const message = (err as Error).message || 'Bilinmeyen hata'
        console.error('[orderStatusService]', message)
        return { ok: false, error: message }
    }
}

/**
 * Returns tablosundan statü değiştiğinde Orders tablosunu da günceller.
 * (İki yönlü senkronizasyon — Returns→Orders tarafı)
 */
export async function syncOrderFromReturn(orderId: string, returnStatus: string): Promise<UpdateOrderStatusResult> {
    /*
      M1 (20-madde v2 denetimi) — `payment_status` YALNIZ paranın gerçekten
      hareket ettiği dalda yazılır.

      `received` = iade edilen ürün depoya ULAŞTI. Para o an hareket etmemiştir;
      gerçek iade `refunded` dalında olur ve o dal ödeme sağlayıcısını (iyzico-refund)
      fiilen çağırır. `received` dalında `payment_status: 'refunded'` yazmak muhasebe
      YALANI üretiyordu: sipariş "iadesi yapıldı" görünür, para hâlâ satıcıdadır.

      Neden hiçbir kapı görmedi: 'refunded' DB'nin payment_status sözlüğünde GEÇERLİ
      bir değer (pending/paid/failed/refunded/partial_refunded), yani kısıt itiraz
      etmez; ve iade çağrısı yapılmadığı için ödeme sağlayıcısının defterinde de iz
      kalmaz — yalan tek başına, sessizce yaşar.

      Statü davranışı (received → cancelled) BİLEREK değiştirilmedi: o ayrı bir karar.
    */
    const orderStatusMap: Record<string, { status: string; payment_status?: string }> = {
        refunded: { status: 'cancelled', payment_status: 'refunded' },
        cancelled: { status: 'cancelled' },
        approved: { status: 'processing' },
        rejected: { status: 'delivered' },
        received: { status: 'cancelled' },
    }

    const mapped = orderStatusMap[returnStatus]
    if (!mapped) return { ok: true }

    try {
        const updatePayload: Database['public']['Tables']['venthub_orders']['Update'] = { status: mapped.status }
        if (mapped.payment_status) {
            updatePayload.payment_status = mapped.payment_status
        }

        const { error } = await supabase
            .from('venthub_orders')
            .update(updatePayload)
            .eq('id', orderId)

        if (error) throw error

        try {
            await logAdminAction(supabase, {
                table_name: 'venthub_orders',
                row_pk: orderId,
                action: 'UPDATE',
                after: updatePayload,
                comment: `returns sync: return_status=${returnStatus}`
            })
        } catch { /* swallow */ }

        return { ok: true }
    } catch (err: unknown) {
        return { ok: false, error: (err as Error).message }
    }
}

// --- Yardımcı Fonksiyonlar ---

function isReturnStatus(status: string): boolean {
    return (RETURN_STATUSES as readonly string[]).includes(status)
}

async function syncReturnsRecord(
    orderId: string,
    newStatus: string,
    userId?: string | null,
    reason?: string
): Promise<void> {
    const { data: existing } = await supabase
        .from('venthub_returns')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle()

    if (!existing) {
        const defaultReason = newStatus === 'cancelled'
            ? 'Sipariş İptal Edildi'
            : 'Sipariş İade Edildi'

        await supabase.from('venthub_returns').insert({
            order_id: orderId,
            user_id: userId || '00000000-0000-0000-0000-000000000000',
            reason: reason || defaultReason,
            status: newStatus === 'cancelled' ? 'cancelled' : 'refunded',
        })
    } else {
        await supabase
            .from('venthub_returns')
            .update({ status: newStatus })
            .eq('id', existing.id)
    }
}

/** RPC'nin döndürdüğü zarf — `success` bayrağı HTTP durumundan ayrı okunur. */
interface StockRestoreResult {
    success?: boolean
    error?: string
    restored_count?: number
    restored_units?: number
}

/**
 * İptal/iade sonrası stok geri verme.
 *
 * ESKİ GÖVDE SİLİNDİ (2026-08-16, T052-VH). İki ayrı kusuru vardı:
 *
 *  1. **Yanlış soruyu soruyordu.** Sipariş KALEMLERİNE bakıp `quantity` kadar stok
 *     EKLİYORDU — yani "sipariş ne kadardı?" sorusunun cevabını geri veriyordu,
 *     "stoktan ne kadar düşüldü?" sorusunun değil. Satışta stok hiç düşmediği için
 *     (RPC kapısı hiç var olmayan bir `paid` statüsünü bekliyordu) her iptal saf
 *     HAYALİ STOK üretiyordu.
 *  2. **Oku-sonra-yaz yarışı.** `currentStock + quantity` iki eş zamanlı çağrıda
 *     birbirini eziyordu.
 *
 * Yerine tek, kanıta bağlı RPC: `inventory_movements`'taki `order_sale` satırlarına
 * bakar, `düşülen - geri verilen` hesaplar. Düşülmemişse HİÇBİR ŞEY yapmaz.
 * İdempotens bayrakla değil HESAPLA sağlanır — ikinci çağrı no-op'tur.
 * Yetki kapısı fonksiyonun içindedir (`adjust_stock` ile aynı).
 */
async function restoreStockForOrder(
    orderId: string,
    reason: 'order_cancel' | 'order_refund',
): Promise<{ ok: boolean; error?: string }> {
    try {
        /*
          TIP KÖPRÜSÜ — `process_order_stock_restore` henüz `database.types.ts`e
          ÜRETİLMEDİ (migration bu depoya yeni girdi). `any` yasak olduğu için
          köprü `unknown` üzerinden ve YALNIZ bu çağrının imzasını tanımlıyor.
          `pnpm supabase:gen` koşulduğunda bu blok SİLİNMELİ — kalırsa gerçek
          şemadaki bir değişikliği tsc'den gizler.
        */
        type StockRestoreRpc = (
            fn: 'process_order_stock_restore',
            args: { p_order_id: string; p_reason: string },
        ) => Promise<{ data: unknown; error: { message: string } | null }>

        const { data, error } = await (supabase.rpc as unknown as StockRestoreRpc)(
            'process_order_stock_restore',
            { p_order_id: orderId, p_reason: reason },
        )

        if (error) return { ok: false, error: error.message }

        /*
          KRİTİK: HTTP 200 tek başına BAŞARI DEĞİL. RPC geçersiz sebep, bulunamayan
          sipariş ya da yetkisizlik durumunda `{ success: false, error }` döndürür ve
          çağrı yine 200 ile biter. T052'nin kök sebeplerinden biri tam olarak buydu:
          dönüş zarfı okunmadan "oldu" varsayılıyordu.
        */
        const result = (data ?? null) as StockRestoreResult | null
        if (!result || result.success !== true) {
            return { ok: false, error: result?.error ?? 'Stok geri verme yanıtı doğrulanamadı' }
        }
        return { ok: true }
    } catch (err) {
        console.error('[restoreStockForOrder] Hata:', err)
        return { ok: false, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
    }
}

