import type { QueryData, SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

// Re-use query inference to define the type
const movementQueryFn = (supabase: SupabaseClient<Database>) => supabase
  .from('inventory_movements')
  .select('id, delta, reason, created_at, product_id, products(name)')
  .order('created_at', { ascending: false })

export type InventoryMovementRow = QueryData<ReturnType<typeof movementQueryFn>>[number]

/**
 * Fetches an ordered list of inventory movements between optional date ranges.
 *
 * @param supabase - The authenticated Supabase client instance
 * @param params - Date range filter parameters
 * @param params.from - Optional start date (inclusive). Movements must be created at or after this date.
 * @param params.to - Optional end date (inclusive). Movements must be created at or before this date.
 * @returns A promise that resolves to an array of inventory movement rows ordered by creation date descending
 * @throws {PostgrestError} If the database query fails
 *
 * @example
 * const from = new Date('2023-01-01')
 * const to = new Date('2023-12-31')
 * const movements = await getInventoryMovements(supabase, { from, to })
 * // returns [{ id: 'm1', delta: 5, reason: 'restock', ... }, ...]
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
