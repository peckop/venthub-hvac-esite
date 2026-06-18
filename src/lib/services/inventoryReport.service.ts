import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

export interface InventoryMovementRow {
  id: string
  delta: number
  reason: string
  created_at: string
  product_id: string
  products: {
    name: string
  } | null | Record<string, unknown>
}

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

  return (data || []) as unknown as InventoryMovementRow[]
}
