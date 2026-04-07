import { supabase } from '../supabase'
import type { DbShoppingCart, DbCartItem, DbProduct } from '../../types/db-rows'
import type { Product } from '../supabase'
import { mapDatabaseProductToDomain } from '../type-converters'
import type { Database } from '../../types/database.types'
async function ensureUserProfile(userId: string): Promise<boolean> {
  try {
    const { data: prof, error: selErr } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    
    if (!selErr && prof) return true
    
    const { error: insErr } = await supabase
      .from('user_profiles')
      .insert({ id: userId })
    
    if (insErr) {
      return false
    }
    return true
  } catch {
    return false
  }
}

export async function getOrCreateShoppingCart(userId: string): Promise<DbShoppingCart> {
  // Try existing
  const { data: existing, error: selErr } = await supabase
    .from('shopping_carts')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
  
  if (!selErr && Array.isArray(existing) && existing.length > 0) {
    return existing[0] as DbShoppingCart
  }
  
  // Create new (with FK-safe retry if profile missing)
  const attemptInsert = async () => supabase
    .from('shopping_carts')
    .insert({ user_id: userId })
    .select('*')
    .single()

  let { data, error } = await attemptInsert()
  
  interface SupabaseError { code?: string; message?: string }
  const err = error as SupabaseError

  if (error && (String(err.code) === '23503' || /user_profiles/i.test(err.message || ''))) {
    await ensureUserProfile(userId)
    const retry = await attemptInsert()
    data = retry.data
    error = retry.error
  }
  
  // If unique conflict (cart already exists), select and return it
  if (error && (String(err.code) === '23505' || String(err.code) === '409' || /conflict|duplicate key/i.test(err.message || ''))) {
    const { data: again, error: sel2 } = await supabase
      .from('shopping_carts')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
    if (!sel2 && Array.isArray(again) && again.length > 0) return again[0] as DbShoppingCart
  }
  
  if (error) throw error
  if (!data) throw new Error('Failed to create shopping cart')
  return data as DbShoppingCart
}

export async function listCartItems(cartId: string): Promise<DbCartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
  if (error) throw error
  return (data as DbCartItem[]) || []
}

export async function listCartItemsWithProducts(cartId: string): Promise<{ item: DbCartItem; product: Product }[]> {
  const items = await listCartItems(cartId)
  if (items.length === 0) return []
  
  const _productIds = Array.from(new Set(items.map(i => i.product_id)))
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*')
    .in('id', _productIds)
  
  if (pErr) throw pErr
  
  const map = new Map<string, Product>()
  for (const p of (products as DbProduct[]) || []) {
    map.set(p.id, mapDatabaseProductToDomain(p))
  }
  
  return items
    .map(i => ({ item: i, product: map.get(i.product_id)! }))
    .filter(x => !!x.product)
}

export async function upsertCartItem(params: { 
  cartId: string; 
  _productId: string; 
  quantity: number; 
  unitPrice?: number | null; 
  priceListId?: string | null 
}): Promise<DbCartItem[]> {
  const { cartId, _productId, quantity, unitPrice, priceListId } = params
  
  const sel = await supabase
    .from('cart_items')
    .select('id')
    .eq('cart_id', cartId)
    .eq('product_id', _productId)
    .limit(1)
  
  const common: Database['public']['Tables']['cart_items']['Update'] = { quantity }
  if (unitPrice !== undefined) common.unit_price = unitPrice
  if (priceListId !== undefined) common.price_list_id = priceListId

  if (!sel.error && Array.isArray(sel.data) && sel.data.length > 0) {
    const upd = await supabase
      .from('cart_items')
      .update(common)
      .eq('cart_id', cartId)
      .eq('product_id', _productId)
      .select('*')
    if (upd.error) throw upd.error
    return (upd.data as DbCartItem[]) || []
  }
  
  const ins = await supabase
    .from('cart_items')
    .insert({ cart_id: cartId, product_id: _productId, ...common })
    .select('*')
  if (ins.error) throw ins.error
  return (ins.data as DbCartItem[]) || []
}

export async function removeCartItem(cartId: string, productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('product_id', productId)
  if (error) throw error
  return true
}

export async function clearCartItems(cartId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
  if (error) throw error
  return true
}
