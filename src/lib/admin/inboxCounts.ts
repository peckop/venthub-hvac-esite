import { SupabaseClient } from '@supabase/supabase-js'

import { Database } from '@/types/database.types'

export interface InboxCounts {
  pendingReturnsCount: number
  pendingShipmentsCount: number
  lowStockAlarmsCount: number
  unresolvedErrorsCount: number
}

/**
 * Parallel aggregation query for "attention required" counts.
 * It uses dependency injection (no module-level static client import)
 * and executes 4 isolated queries in parallel using Promise.allSettled.
 */
export async function fetchInboxCounts(supabase: SupabaseClient<Database>): Promise<InboxCounts> {
  const [returnsRes, shipRes, productsRes, errorsRes] = await Promise.allSettled([
    // 1. Pending Returns (status in ('requested', 'approved'))
    supabase.from('venthub_returns').select('id', { count: 'exact', head: true }).in('status', ['requested', 'approved']),

    // 2. Pending Shipments (status in ('confirmed', 'processing') and shipped_at is null)
    supabase.from('venthub_orders').select('id', { count: 'exact', head: true }).is('shipped_at', null).in('status', ['confirmed', 'processing']),

    // 3. Low stock products (stock_qty <= low_stock_threshold)
    supabase.from('products').select('stock_qty, low_stock_threshold'),

    // 4. Unresolved error groups (status != 'resolved')
    supabase.from('error_groups').select('id', { count: 'exact', head: true }).neq('status', 'resolved')
  ])

  const pendingReturnsCount = returnsRes.status === 'fulfilled' && !returnsRes.value.error ? (returnsRes.value.count ?? 0) : 0
  const pendingShipmentsCount = shipRes.status === 'fulfilled' && !shipRes.value.error ? (shipRes.value.count ?? 0) : 0

  let lowStockAlarmsCount = 0
  if (productsRes.status === 'fulfilled' && !productsRes.value.error && productsRes.value.data) {
    const rawProducts = productsRes.value.data
    for (let i = 0; i < rawProducts.length; i++) {
      const p = rawProducts[i]
      const stockQty = typeof p.stock_qty === 'number' ? p.stock_qty : 0
      const lowStockThreshold = typeof p.low_stock_threshold === 'number' ? p.low_stock_threshold : 5
      if (stockQty <= lowStockThreshold) {
        lowStockAlarmsCount++
      }
    }
  }

  const unresolvedErrorsCount = errorsRes.status === 'fulfilled' && !errorsRes.value.error ? (errorsRes.value.count ?? 0) : 0

  return {
    pendingReturnsCount,
    pendingShipmentsCount,
    lowStockAlarmsCount,
    unresolvedErrorsCount
  }
}
