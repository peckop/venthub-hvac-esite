import type { QueryData, SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

// Build a base query to let Supabase infer the return type correctly
const buildBaseQuery = (supabase: SupabaseClient<Database>) => {
  return supabase
    .from('inventory_movements')
    .select('id, delta, reason, created_at, product_id, products(name)')
    .order('created_at', { ascending: false })
}

export type InventoryMovementRow = QueryData<ReturnType<typeof buildBaseQuery>>[number]

export async function getInventoryMovements(
  supabase: SupabaseClient<Database>,
  params: { from?: Date; to?: Date }
): Promise<InventoryMovementRow[]> {
  let query = buildBaseQuery(supabase)

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
