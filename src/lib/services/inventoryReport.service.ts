import type { SupabaseClient } from '@supabase/supabase-js'
import type { QueryData } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

// We create a dummy query to extract the return type using QueryData
const inventoryMovementsQuery = (supabase: SupabaseClient<Database>) =>
  supabase
    .from('inventory_movements')
    .select('id, delta, reason, created_at, product_id, products(name)')

export type InventoryMovementRow = QueryData<ReturnType<typeof inventoryMovementsQuery>>[number]

export async function getInventoryMovements(
  supabase: SupabaseClient<Database>,
  params: { from?: Date; to?: Date }
): Promise<InventoryMovementRow[]> {
  let query = supabase
    .from('inventory_movements')
    .select('id, delta, reason, created_at, product_id, products(name)')
    .order('created_at', { ascending: false })

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

  return (data || []) as InventoryMovementRow[]
}
