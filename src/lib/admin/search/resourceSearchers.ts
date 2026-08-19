import { SupabaseClient } from '@supabase/supabase-js'

import { adminSearchProducts } from '@/lib/services/product.service'
import type { Database } from '@/types/database.types'
import { orIlikeContains } from '@/utils/adminQueryFilters'

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

interface InventoryMovementJoinedRow {
  id: string
  reason: string
  delta: number
  products: { name: string; sku: string } | { name: string; sku: string }[] | null
}

interface InventoryVelocityRow {
  product_id: string
  name: string | null
  physical_stock: number | null
  available_stock: number | null
  warehouse_location: string | null
  supplier_name: string | null
}

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
    .or(orIlikeContains(['order_number', 'conversation_id'], query))
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
  /*
    T090-VH: burası `venthub_orders.order_number` diye GÖMÜLÜ bir kolona atıf
    yapıyordu; PostgREST üst-düzey or= içinde gömülü kaynağa atıf kabul etmez, yani
    komut paletinin iade araması da üretimden beri 400 ile düşüyordu. Artık
    `view_admin_returns` okunur ve tek `search_text` kolonu aranır — sayfanın
    kendi aramasıyla AYNI kaynak, iki farklı cevap üretemezler.

    Yan kazanç: view satırı düz olduğu için "ilişki obje mi tek-elemanlı dizi mi"
    belirsizliğini çözen tip zorlaması da gerekmiyor; satır artık ÜRETİLMİŞ tipten
    geliyor, elle bildirilen bir şekilden değil.
  */
  const { data, error } = await supabase
    .from('view_admin_returns')
    .select('id, reason, status, order_number')
    .ilike('search_text', `%${query}%`)
    .limit(limit)
  if (error) throw error
  return (data ?? []).map((r) => {
    const orderNum = r.order_number ?? ''
    return {
      resourceKey: 'returns',
      id: String(r.id),
      title: orderNum ? `Order #${orderNum}` : 'Return Request',
      subtitle: `${r.reason ?? ''} (${r.status ?? ''})`,
      route: `/admin/returns?q=${orderNum}`
    }
  })
}

export const searchCategories: AdminSearcher = async (supabase, query, limit) => {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .or(orIlikeContains(['name', 'description'], query))
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
    .or(orIlikeContains(['full_name', 'phone'], query))
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
    .or(orIlikeContains(['code', 'discount_type'], query))
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
    /*
      Gömülü kaynağa süzme `foreignTable` ile YAPILIR — üst-düzey or= içinde
      `products.name` yazmak sorguyu 400'e düşürüyordu (aynı sınıf: T090-VH).
      `reason` bilinçli olarak DÜŞTÜ: tek sorguda hem ana tabloyu hem gömülü
      kaynağı OR'lamak PostgREST'te ifade edilemez ve paletin yönlendirdiği
      /admin/movements sayfası zaten YALNIZ ürün adı/SKU arıyor (MovementsTableBody).
      İki yüzeyin farklı cevap vermesi, çalışmayan bir `reason` aramasından beterdi.
    */
    .or(orIlikeContains(['name', 'sku'], query), { foreignTable: 'products' })
    .limit(limit)
  if (error) throw error
  const rows = (data || []) as unknown as InventoryMovementJoinedRow[]
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
    .or(orIlikeContains(['signature', 'last_message'], query))
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
    .or(orIlikeContains(['table_name', 'row_pk', 'comment'], query))
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
    .or(orIlikeContains(['name', 'warehouse_location', 'supplier_name'], query))
    .limit(limit)
  if (error) throw error
  const rows = (data || []) as unknown as InventoryVelocityRow[]
  return rows.map((i) => ({
    resourceKey: 'inventory',
    id: String(i.product_id),
    title: i.name || '',
    subtitle: `Loc: ${i.warehouse_location || '-'}, Avail: ${i.available_stock || 0}, Supplier: ${i.supplier_name || '-'}`,
    route: `/admin/inventory?q=${i.name || ''}`
  }))
}
