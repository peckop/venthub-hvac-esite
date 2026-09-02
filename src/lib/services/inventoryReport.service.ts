import type { QueryData, SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

// Re-use query inference to define the type
const movementQueryFn = (supabase: SupabaseClient<Database>) => supabase
  .from('inventory_movements')
  .select('id, delta, reason, created_at, product_id, products(name)')
  .order('created_at', { ascending: false })

export type InventoryMovementRow = QueryData<ReturnType<typeof movementQueryFn>>[number]

/**
 * Fetches inventory movements within an optional date range.
 * Results are ordered by creation date descending (newest first).
 *
 * @param supabase - The Supabase client instance
 * @param params - Optional date range filters (`from` and `to` dates)
 * @returns A promise that resolves to an array of inventory movement records including joined product names
 * @throws {PostgrestError} If a database error occurs
 *
 * @example
 * const movements = await getInventoryMovements(supabase, {
 *   from: new Date('2024-01-01'),
 *   to: new Date('2024-12-31')
 * })
 */
export async function getInventoryMovements(
  supabase: SupabaseClient<Database>,
  params: { from?: Date; to?: Date }
): Promise<InventoryMovementRow[]> {
  let query = movementQueryFn(supabase)

  if (params.from) {
    query = query.gte('created_at', params.from.toISOString())
  }
  if (params.to) {
    query = query.lte('created_at', params.to.toISOString())
  }

  const { data, error } = await query
  if (error) {
    throw error
  }

  return data || []
}
