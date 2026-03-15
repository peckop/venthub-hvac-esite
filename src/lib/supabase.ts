import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'
import { mapDatabaseProductToDomain } from './type-converters'
import { DbProduct } from '../types/db-rows'

// Import types for aliasing and internal use
export type { Database } from '../types/database.types'
export type UserAddress = Database['public']['Tables']['user_addresses']['Row']
export type InvoiceProfile = Database['public']['Tables']['user_invoice_profiles']['Row']
export type InvoiceProfileType = 'individual' | 'corporate'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  brand: string
  sku: string
  category_id: string | null
  subcategory_id: string | null
  status: string
  is_featured: boolean
  technical_specs: any
  stock_qty: number | null
  slug: string | null
  airflow_capacity: number | null
  noise_level: number | null
  pressure_rating: number | null
  model_code: string | null
  low_stock_threshold: number | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  metadata: any
  created_at?: string
}

export interface FtsProductResult extends Product {
  rank?: number
  is_fuzzy_match?: boolean
}

export interface SearchSuggestion {
  text: string
  label: string
  type: 'product' | 'category' | 'brand'
  slug?: string
  url: string
  metadata?: any
}

export type UserProject = {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type ProjectItem = {
  id: string
  project_id: string
  product_id: string
  quantity: number
  created_at: string
  products?: Product
}

// -----------------------------------------------------------------------------
// PRODUCT & CATEGORY GETTERS
// -----------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data as Category[]
}

export async function getProducts(limit: number = 100): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .limit(limit)

  if (error) throw error
  return (data as DbProduct[]).map(mapDatabaseProductToDomain)
}

export async function getFeaturedProducts(limit: number = 10): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'active')
    .limit(limit)

  if (error) throw error
  return (data as DbProduct[]).map(mapDatabaseProductToDomain)
}

export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
  
  const query = supabase
    .from('products')
    .select('*')
    .eq(isUuid ? 'id' : 'slug', identifier)
    .single()

  const { data, error } = await query
  if (error || !data) return null
  return mapDatabaseProductToDomain(data as DbProduct)
}

export async function getProductsBySubcategory(subcategoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('subcategory_id', subcategoryId)
    .eq('status', 'active')

  if (error) throw error
  return (data as DbProduct[]).map(mapDatabaseProductToDomain)
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')

  if (error) throw error
  return (data as DbProduct[]).map(mapDatabaseProductToDomain)
}

export interface GetProductsParams {
  categoryIds?: string[]
  searchQuery?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}

export async function getProductsEnriched(params: GetProductsParams = {}): Promise<Product[]> {
  const { data, error } = await (supabase.rpc as any)('get_products_enriched', {
    p_category_ids: params.categoryIds,
    p_limit: params.limit || 50,
    p_offset: params.offset || 0,
    p_search_query: params.searchQuery,
    p_brand: params.brand,
    p_min_price: params.minPrice,
    p_max_price: params.maxPrice
  })

  if (error) {
    console.error('getProductsEnriched error:', error)
    const { data: fallbackData } = await supabase
      .from('products')
      .select('*')
      .limit(params.limit || 50)
    
    return (fallbackData as DbProduct[] || []).map(mapDatabaseProductToDomain)
  }

  return (data as DbProduct[]).map(mapDatabaseProductToDomain)
}

export async function getSearchSuggestions(q: string, limit: number = 6): Promise<SearchSuggestion[]> {
  const { data, error } = await (supabase.rpc as any)('get_search_suggestions', {
    p_query: q,
    p_limit: limit
  })

  if (error) {
    console.error('getSearchSuggestions error:', error)
    return []
  }

  return data as SearchSuggestion[]
}

export async function ftsSearchProducts(term: string, limit: number = 20): Promise<FtsProductResult[]> {
  const { data, error } = await (supabase.rpc as any)('fts_search_products', {
    p_term: term,
    p_limit: limit
  })

  if (error) {
    console.error('ftsSearchProducts error:', error)
    return []
  }

  return (data as DbProduct[]).map(mapDatabaseProductToDomain) as FtsProductResult[]
}

// -----------------------------------------------------------------------------
// CART MANAGEMENT
// -----------------------------------------------------------------------------

export async function getOrCreateShoppingCart(userId: string) {
  const { data: existing } = await (supabase as any).from('shopping_carts').select('id').eq('user_id', userId).maybeSingle()
  if (existing) return existing
  
  const { data: created, error: createErr } = await (supabase as any).from('shopping_carts').insert({ user_id: userId }).select('id').single()
  if (createErr) throw createErr
  return created
}

export async function listCartItemsWithProducts(cartId: string): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from('cart_items')
    .select('*, products(*)')
    .eq('cart_id', cartId)
  
  if (error) throw error
  return data || []
}

export interface UpsertCartItemParams {
  cartId: string
  productId: string
  quantity: number
  unitPrice?: number
  priceListId?: string
}

export async function upsertCartItem(params: UpsertCartItemParams) {
  const { data, error } = await (supabase as any)
    .from('cart_items')
    .upsert({ 
      cart_id: params.cartId, 
      product_id: params.productId, 
      quantity: params.quantity,
      unit_price: params.unitPrice,
      price_list_id: params.priceListId
    }, { 
      onConflict: 'cart_id,product_id' 
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function removeCartItem(cartId: string, productId: string) {
  const { error } = await (supabase as any)
    .from('cart_items')
    .delete()
    .match({ cart_id: cartId, product_id: productId })
  if (error) throw error
}

export async function clearCartItems(cartId: string) {
  const { error } = await (supabase as any).from('cart_items').delete().eq('cart_id', cartId)
  if (error) throw error
}

export async function getEffectivePriceInfo(productId: string) {
  const { data, error } = await (supabase.rpc as any)('get_effective_price', { p_product_id: productId })
  if (error) return { unitPrice: 0, priceListId: null }
  return {
    unitPrice: data.unit_price || 0,
    priceListId: data.price_list_id || null
  }
}

// -----------------------------------------------------------------------------
// ADDRESS & PROFILE MANAGEMENT
// -----------------------------------------------------------------------------

export async function listAddresses() {
  const { data, error } = await supabase.from('user_addresses').select('*').order('is_default', { ascending: false })
  if (error) throw error
  return data as any[]
}

export async function createAddress(address: any) {
  const { data, error } = await supabase.from('user_addresses').insert(address).select().single()
  if (error) throw error
  return data
}

export async function updateAddress(id: string, address: any) {
  const { data, error } = await supabase.from('user_addresses').update(address).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from('user_addresses').delete().eq('id', id)
  if (error) throw error
}

export async function setDefaultAddress(kind: 'shipping' | 'billing', id: string) {
  const field = kind === 'shipping' ? 'is_default_shipping' : 'is_default_billing'
  await (supabase as any).from('user_addresses').update({ [field]: false }).neq('id', id)
  const { error } = await (supabase as any).from('user_addresses').update({ [field]: true }).eq('id', id)
  if (error) throw error
}

export async function listInvoiceProfiles() {
  const { data, error } = await supabase.from('user_invoice_profiles').select('*').order('is_default', { ascending: false })
  if (error) throw error
  return data as any[]
}

export async function createInvoiceProfile(profile: any) {
  const { data, error } = await supabase.from('user_invoice_profiles').insert(profile).select().single()
  if (error) throw error
  return data
}

export async function updateInvoiceProfile(id: string, profile: any) {
  const { data, error } = await supabase.from('user_invoice_profiles').update(profile).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteInvoiceProfile(id: string) {
  const { error } = await supabase.from('user_invoice_profiles').delete().eq('id', id)
  if (error) throw error
}

export async function setDefaultInvoiceProfile(id: string) {
  await supabase.from('user_invoice_profiles').update({ is_default: false }).neq('id', id)
  const { error } = await supabase.from('user_invoice_profiles').update({ is_default: true }).eq('id', id)
  if (error) throw error
}

// -----------------------------------------------------------------------------
// PROJECT MANAGEMENT
// -----------------------------------------------------------------------------

export async function listUserProjects(): Promise<UserProject[]> {
  const { data, error } = await (supabase as any).from('projects').select('*').order('updated_at', { ascending: false })
  if (error) throw error
  return data as UserProject[]
}

export async function createProject(project: any): Promise<UserProject> {
  const { data, error } = await (supabase as any).from('projects').insert(project).select().single()
  if (error) throw error
  return data as UserProject
}

export async function deleteProject(id: string) {
  const { error } = await (supabase as any).from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function addProductToProject(projectId: string, productId: string, quantity: number = 1) {
  const { data, error } = await (supabase as any).from('project_items').insert({ project_id: projectId, product_id: productId, quantity }).select().single()
  if (error) throw error
  return data
}

export async function removeProductFromProject(projectId: string, productId: string) {
  const { error } = await (supabase as any).from('project_items').delete().match({ project_id: projectId, product_id: productId })
  if (error) throw error
}

export async function listProjectItems(projectId: string): Promise<any[]> {
  const { data, error } = await (supabase as any).from('project_items').select('*, products(*)').eq('project_id', projectId)
  if (error) throw error
  return data || []
}

// -----------------------------------------------------------------------------
// ADMIN ACTIONS
// -----------------------------------------------------------------------------

export async function adminSearchProducts(q: string, limit: number = 20, offset: number = 0, categoryId?: string) {
  let query = supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
    .range(offset, offset + limit - 1)
  
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query
  
  if (error) throw error
  return (data as DbProduct[]).map(mapDatabaseProductToDomain)
}
