/**
 * orderStatusService.ts
 * Merkezi sipariş statü güncelleme servisi.
 *
 * Girdi  → orderId + yeni statü + opsiyonel context
 * İşlem  → venthub_orders güncelle → gerekirse venthub_returns upsert → audit log yaz
 * Çıktı  → { ok, error? }
 *
 * Tablo, Kanban ve Returns sayfalarının hepsinin aynı akıştan geçmesini sağlar.
 */

import { supabase } from './supabase'
import { logAdminAction } from './audit'

// İade/İptal olarak kabul edilen statüler
const RETURN_STATUSES = ['cancelled', 'refunded', 'partial_refunded'] as const

interface UpdateOrderStatusInput {
    orderId: string
    newStatus: string
    oldStatus?: string
    userId?: string | null       // sipariş sahibi (returns kaydı için)
    reason?: string              // returns kaydının açıklaması
    auditComment?: string        // audit log yorumu
    skipReturnsSync?: boolean    // returns tablosuna yazmayı atla (Returns sayfasından çağrılıyorsa)
    skipOrdersSync?: boolean     // orders tablosuna yazmayı atla (Orders sayfasından çağrılıyorsa)
}

interface UpdateOrderStatusResult {
    ok: boolean
    error?: string
}

/**
 * Merkezi sipariş statüsü güncelleme fonksiyonu.
 *
 * Akış:
 * 1. venthub_orders.status → newStatus (skipOrdersSync=false ise)
 * 2. Eğer newStatus cancelled/refunded ise → venthub_returns'e upsert (skipReturnsSync=false ise)
 * 3. Audit log kaydı
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

    try {
        // --- 1. Sipariş statüsünü güncelle ---
        if (!skipOrdersSync) {
            const { error: orderErr } = await supabase
                .from('venthub_orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (orderErr) throw new Error('Sipariş güncellenemedi: ' + orderErr.message)
        }

        // --- 2. İade/İptal → venthub_returns senkronizasyonu ---
        if (!skipReturnsSync && isReturnStatus(newStatus)) {
            await syncReturnsRecord(orderId, newStatus, userId, reason)
        }

        // --- 3. Audit log ---
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
            // audit log hataları UI'ı bloklamasın
        }

        return { ok: true }
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
    // Returns statülerini Orders statülerine map'le
    const orderStatusMap: Record<string, string> = {
        refunded: 'refunded',
        cancelled: 'cancelled',
        approved: 'processing',     // iade onaylandı → sipariş hâlâ işlemde
        rejected: 'delivered',      // iade reddedildi → sipariş teslim edilmiş sayılır
        received: 'refunded',       // iade teslim alındı → iade süreci tamamlanıyor
    }

    const mappedOrderStatus = orderStatusMap[returnStatus]
    if (!mappedOrderStatus) return { ok: true } // bilinmeyen statü ise bir şey yapma

    try {
        const { error } = await supabase
            .from('venthub_orders')
            .update({ status: mappedOrderStatus })
            .eq('id', orderId)

        if (error) throw error

        // Audit log
        try {
            await logAdminAction(supabase, {
                table_name: 'venthub_orders',
                row_pk: orderId,
                action: 'UPDATE',
                after: { status: mappedOrderStatus },
                comment: `returns sync: return_status=${returnStatus} → order_status=${mappedOrderStatus}`
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

/**
 * venthub_returns tablosuna upsert mantığı:
 * - Kayıt yoksa insert
 * - Kayıt varsa statü güncelle
 */
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
        // Yeni return kaydı oluştur
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
        // Mevcut return kaydını güncelle
        await supabase
            .from('venthub_returns')
            .update({ status: newStatus })
            .eq('id', existing.id)
    }
}
