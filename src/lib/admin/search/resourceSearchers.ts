import { type QueryData,SupabaseClient } from '@supabase/supabase-js'

import { adminSearchProducts } from '@/lib/services/product.service'
import type { Database } from '@/types/database.types'

export interface CommandResult {
  resourceKey: string
  id: string
  title: string
  subtitle?: string
  route: string
}

export type AdminSearcher = (
  supabase: SupabaseClient<Database>,
  query: string,
  limit: number
) => Promise<CommandResult[]>

// Dummy queries for type extraction
const dummyReturnsQuery = (supabase: SupabaseClient<Database>) =>
  supabase.from('venthub_returns').select('id, reason, status, venthub_orders!inner(order_number, customer_name)')

const dummyMovementsQuery = (supabase: SupabaseClient<Database>) =>
  supabase.from('inventory_movements').select('id, reason, delta, products!inner(name, sku)')

type VenthubReturnJoinedRow = QueryData<ReturnType<typeof dummyReturnsQuery>>[number]
type InventoryMovementJoinedRow = QueryData<ReturnType<typeof dummyMovementsQuery>>[number]
// inventory_velocity is a view. we must type it explicitly instead of using QueryData with 'never'
type InventoryVelocityRow = Database['public']['Views']['inventory_velocity']['Row']

export const searchProducts: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const data = await adminSearchProducts(supabase, query, limit)
  return data.map((p) => ({
    resourceKey: 'products',
    id: String(p.id),
    title: p.name,
    subtitle: `SKU: ${p.sku}`,
    route: `/admin/products?q=${p.sku}`
  }))
}

export const searchOrders: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('view_admin_orders')
    .select('id, order_number, conversation_id, customer_name, customer_email')
    .or(`order_number.ilike.%${query}%,conversation_id.ilike.%${query}%`)
    .limit(limit)
  if (error) throw error
  return (data || []).map((o) => ({
    resourceKey: 'orders',
    id: String(o.id),
    title: o.order_number || '',
    subtitle: `${o.customer_name || ''} ${o.customer_email ? `(${o.customer_email})` : ''}`.trim() || undefined,
    route: `/admin/orders?q=${o.order_number || ''}`
  }))
}

export const searchReturns: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('venthub_returns')
    .select('id, reason, status, venthub_orders!inner(order_number, customer_name)')
    .or(`reason.ilike.%${query}%,venthub_orders.order_number.ilike.%${query}%`)
    .limit(limit)
  if (error) throw error
  const rows = (data || []) as VenthubReturnJoinedRow[]
  return rows.map((r) => {
    const order = Array.isArray(r.venthub_orders) ? r.venthub_orders[0] : r.venthub_orders
    const orderNum = order?.order_number || ''
    return {
      resourceKey: 'returns',
      id: String(r.id),
      title: orderNum ? `Order #${orderNum}` : 'Return Request',
      subtitle: `${r.reason} (${r.status})`,
      route: `/admin/returns?q=${orderNum}`
    }
  })
}

export const searchCategories: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit)
  if (error) throw error
  return (data || []).map((c) => ({
    resourceKey: 'categories',
    id: String(c.id),
    title: c.name,
    subtitle: c.description || c.slug,
    route: `/admin/categories?q=${c.name}`
  }))
}

export const searchUsers: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, phone, role')
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(limit)
  if (error) throw error
  return (data || []).map((u) => ({
    resourceKey: 'users',
    id: String(u.id),
    title: u.full_name || 'Anonymous',
    subtitle: `${u.role} - ${u.phone || ''}`.trim().replace(/ -$/, ''),
    route: `/admin/users?q=${u.full_name || ''}`
  }))
}

export const searchCoupons: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('coupons')
    .select('id, code, discount_type, discount_value')
    .or(`code.ilike.%${query}%,discount_type.ilike.%${query}%`)
    .limit(limit)
  if (error) throw error
  return (data || []).map((c) => ({
    resourceKey: 'coupons',
    id: String(c.id),
    title: c.code,
    subtitle: `${c.discount_type}: ${c.discount_value}`,
    route: `/admin/coupons?q=${c.code}`
  }))
}

export const searchMovements: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('id, reason, delta, products!inner(name, sku)')
    .or(`reason.ilike.%${query}%,products.name.ilike.%${query}%,products.sku.ilike.%${query}%`)
    .limit(limit)
  if (error) throw error
  const rows = (data || []) as InventoryMovementJoinedRow[]
  return rows.map((m) => {
    const prod = Array.isArray(m.products) ? m.products[0] : m.products
    const prodName = prod?.name || ''
    return {
      resourceKey: 'movements',
      id: String(m.id),
      title: prodName,
      subtitle: `${m.reason} (${m.delta > 0 ? '+' : ''}${m.delta})`,
      route: `/admin/movements?q=${prodName}`
    }
  })
}

export const searchErrorGroups: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('error_groups')
    .select('id, signature, last_message, status')
    .or(`signature.ilike.%${query}%,last_message.ilike.%${query}%`)
    .limit(limit)
  if (error) throw error
  return (data || []).map((eg) => ({
    resourceKey: 'error_groups',
    id: String(eg.id),
    title: eg.signature || '',
    subtitle: `${eg.status || ''} - ${eg.last_message || ''}`,
    route: `/admin/error-groups?q=${eg.signature || ''}`
  }))
}

export const searchAudit: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('id, table_name, row_pk, comment, action')
    .or(`table_name.ilike.%${query}%,row_pk.ilike.%${query}%,comment.ilike.%${query}%`)
    .limit(limit)
  if (error) throw error
  return (data || []).map((a) => ({
    resourceKey: 'audit',
    id: String(a.id),
    title: `${a.action || ''} on ${a.table_name || ''}`,
    subtitle: `PK: ${a.row_pk || ''} - ${a.comment || ''}`,
    route: `/admin/audit-logs?q=${a.row_pk || ''}`
  }))
}

export const searchInventory: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('inventory_velocity' as never)
    .select('product_id, name, physical_stock, available_stock, warehouse_location, supplier_name')
    .or(`name.ilike.%${query}%,warehouse_location.ilike.%${query}%,supplier_name.ilike.%${query}%`)
    .limit(limit)
  if (error) throw error
  const rows = (data || []) as InventoryVelocityRow[]
  return rows.map((i) => ({
    resourceKey: 'inventory',
    id: String(i.product_id),
    title: i.name || '',
    subtitle: `Loc: ${i.warehouse_location || '-'}, Avail: ${i.available_stock || 0}, Supplier: ${i.supplier_name || '-'}`,
    route: `/admin/inventory?q=${i.name || ''}`
  }))
}
