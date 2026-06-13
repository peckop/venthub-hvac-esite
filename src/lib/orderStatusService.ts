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
 * Centralized service to update an order's status and perform related synchronization tasks.
 * Converts UI status strings into corresponding `status` and `payment_status` database fields, handles returns table sync, restores inventory stocks if the order transitions into a cancelled state, and writes an entry into the audit log.
 *
 * @param input - The payload containing order identifiers, the targeted new status, and sync override flags.
 * @returns A promise that resolves to the result detailing the success state and error message (if any).
 * @throws Never throws; exceptions are caught and returned inside the error property of `UpdateOrderStatusResult`.
 *
 * @example
 * const result = await updateOrderStatus({
 *   orderId: 'uuid-123',
 *   newStatus: 'refunded',
 *   oldStatus: 'shipped',
 *   userId: 'user-456'
 * });
 * if (!result.ok) console.error(result.error);
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
            const dbFields = resolveDbFields(newStatus)
            const updatePayload: Database['public']['Tables']['venthub_orders']['Update'] = { status: dbFields.status }
            if (dbFields.payment_status) {
                updatePayload.payment_status = dbFields.payment_status
            }

            const { error: orderErr } = await supabase
                .from('venthub_orders')
                .update(updatePayload)
                .eq('id', orderId)

            if (orderErr) throw new Error('Sipariş güncellenemedi: ' + orderErr.message)
        }

        // --- 2. İade/İptal → venthub_returns senkronizasyonu ve Stok Restorasyonu ---
        if (!skipReturnsSync && isReturnStatus(newStatus)) {
            await syncReturnsRecord(orderId, newStatus, userId, reason)

            // Eğer daha önceden iptal/iade HALE GELMEMİŞSE stokları iade et
            if (oldStatus && !isReturnStatus(oldStatus)) {
                await restoreStockForOrder(orderId)
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

        return { ok: true }
    } catch (err: unknown) {
        const message = (err as Error).message || 'Bilinmeyen hata'
        console.error('[orderStatusService]', message)
        return { ok: false, error: message }
    }
}

/**
 * Synchronizes a status update originating from the `venthub_returns` table back to the primary `venthub_orders` table.
 * Translates return-specific statuses (e.g., 'received', 'approved') into strictly valid DB-level order statuses. Includes writing an audit log for traceability.
 *
 * @param orderId - The unique identifier of the order to update.
 * @param returnStatus - The updated status string from the returns table.
 * @returns A promise resolving to the success state, or error message on failure.
 * @throws Never throws; DB failures are caught and returned in the result object.
 *
 * @example
 * const result = await syncOrderFromReturn('uuid-123', 'approved');
 * // The order status in venthub_orders is now 'processing'
 */
export async function syncOrderFromReturn(orderId: string, returnStatus: string): Promise<UpdateOrderStatusResult> {
    // Returns statülerini Orders statülerine map'le (DB kısıtlamalarına uygun)
    const orderStatusMap: Record<string, { status: string; payment_status?: string }> = {
        refunded: { status: 'cancelled', payment_status: 'refunded' },
        cancelled: { status: 'cancelled' },
        approved: { status: 'processing' },
        rejected: { status: 'delivered' },
        received: { status: 'cancelled', payment_status: 'refunded' },
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

async function restoreStockForOrder(orderId: string): Promise<void> {
    try {
        // Fetch order items and related products in a single relational query
        const { data: items } = await supabase
            .from('venthub_order_items')
            .select('product_id, quantity, products(id, stock_qty)')
            .eq('order_id', orderId)

        if (!items || items.length === 0) return

        const updates: { id: string; stock_qty: number }[] = []
        const movements: { product_id: string; delta: number; reason: string; order_id: string }[] = []

        // Group items by product_id to sum quantities correctly and avoid overwriting
        const groupedItems = items.reduce((acc, item) => {
            const prod = Array.isArray(item.products) ? item.products[0] : item.products;
            if (!item.product_id || !prod) return acc;

            if (!acc[item.product_id]) {
                acc[item.product_id] = { quantity: 0, currentStock: prod.stock_qty || 0 };
            }
            acc[item.product_id].quantity += item.quantity;
            return acc;
        }, {} as Record<string, { quantity: number; currentStock: number }>)

        for (const [productId, data] of Object.entries(groupedItems)) {
            updates.push({
                id: productId,
                stock_qty: data.currentStock + data.quantity
            })
            movements.push({
                product_id: productId,
                delta: data.quantity,
                reason: 'return',
                order_id: orderId
            })
        }

        await Promise.all(
            updates.map(update => supabase.from('products').update({ stock_qty: update.stock_qty }).eq('id', update.id))
        )

        if (movements.length > 0) {
            await supabase.from('inventory_movements').insert(movements)
        }
    } catch (err) {
        console.error('[restoreStockForOrder] Hata:', err)
    }
}

