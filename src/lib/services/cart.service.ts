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

/**
 * Retrieves an existing shopping cart for a user or creates a new one.
 * If a new cart is created and the user lacks a profile record, it safely attempts
 * to create the profile first to satisfy foreign key constraints before retrying.
 *
 * @param userId - The UUID of the authenticated user.
 * @returns The database record for the user's shopping cart.
 * @throws {Error} If cart creation fails or an unrecoverable database error occurs.
 *
 * @example
 * const cart = await getOrCreateShoppingCart('123e4567-e89b-12d3-a456-426614174000')
 * console.log(cart.id) // e.g., 'cart-uuid'
 */
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

/**
 * Retrieves all items currently in the specified shopping cart.
 *
 * @param cartId - The unique identifier of the shopping cart.
 * @returns An array of cart items, empty if the cart has no items.
 * @throws {Error} If the database query fails.
 *
 * @example
 * const items = await listCartItems('cart-123')
 * console.log(items.length) // e.g., 2
 */
export async function listCartItems(cartId: string): Promise<DbCartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
  if (error) throw error
  return (data as DbCartItem[]) || []
}

/**
 * Retrieves cart items and enriches them with their corresponding domain product details.
 * Useful for displaying the cart with product names, images, and prices.
 *
 * @param cartId - The unique identifier of the shopping cart.
 * @returns An array of objects containing both the raw cart item and its mapped domain product.
 * @throws {Error} If fetching items or enriching products fails.
 *
 * @example
 * const cartDetails = await listCartItemsWithProducts('cart-123')
 * cartDetails.forEach(d => console.log(`${d.product.name}: ${d.item.quantity}`))
 */
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

/**
 * Adds a product to the shopping cart or updates its quantity and pricing if it already exists.
 *
 * @param params - The cart item details to insert or update.
 * @param params.cartId - The shopping cart identifier.
 * @param params._productId - The product identifier to add or update.
 * @param params.quantity - The desired quantity of the product.
 * @param params.unitPrice - Optional override for the product's unit price.
 * @param params.priceListId - Optional identifier for the price list applied.
 * @returns An array containing the newly upserted cart item(s).
 * @throws {Error} If the database upsert operation fails.
 *
 * @example
 * const items = await upsertCartItem({ cartId: 'cart-1', _productId: 'prod-A', quantity: 3 })
 */
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

/**
 * Removes a specific product from a shopping cart.
 *
 * @param cartId - The unique identifier of the shopping cart.
 * @param productId - The unique identifier of the product to remove.
 * @returns True if the deletion was successful.
 * @throws {Error} If the database deletion fails.
 *
 * @example
 * await removeCartItem('cart-123', 'prod-456')
 */
export async function removeCartItem(cartId: string, productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('product_id', productId)
  if (error) throw error
  return true
}

/**
 * Removes all items from a specified shopping cart.
 *
 * @param cartId - The unique identifier of the shopping cart to empty.
 * @returns True if the cart was successfully cleared.
 * @throws {Error} If the database deletion fails.
 *
 * @example
 * await clearCartItems('cart-123')
 */
export async function clearCartItems(cartId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
  if (error) throw error
  return true
}
