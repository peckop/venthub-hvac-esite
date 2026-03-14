import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'
import { 
  DbProduct, 
  DbShoppingCart, 
  DbCartItem,
  DbUserAddressInsert,
  DbUserAddressUpdate
} from '../types/db-rows'
import { 
  mapDatabaseProductToDomain, 
  mapDatabaseCategoryToDomain,
  DomainProduct,
  DomainCategory
} from './type-converters'

// Re-export domain types as the standard Product/Category for the app
export type Product = DomainProduct;
export type Category = DomainCategory;

// Define SUPABASE config from process.env for Next.js
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Fallback mechanism to prevent white screen on build/env errors
const missingEnv = !SUPABASE_URL || !SUPABASE_ANON_KEY
if (missingEnv) {
  console.error('CRITICAL: Supabase config missing. App will strictly fail on data fetch but should render UI.')
  if (typeof window !== 'undefined') {
    (window as unknown as { __SUPABASE_CONFIG_ERROR__?: boolean }).__SUPABASE_CONFIG_ERROR__ = true
  }
}

// Create client with real or dummy values to prevent instant crash
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
}

// B2B/Project management types
export interface UserProject {
  id: string
  user_id: string
  name: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProjectItem {
  id: string
  project_id: string
  product_id: string
  product?: Product // Optional joined product data
  quantity: number
  notes?: string | null
  created_at?: string
  updated_at?: string
}

// API functions
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return (data || []).map(mapDatabaseCategoryToDomain)
}

export interface GetProductsParams {
  categoryIds?: string[]
  limit?: number
  offset?: number
  searchQuery?: string
  sortBy?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
}

/**
 * Enriched product fetcher using PostgreSQL RPC for high performance (Lighthouse optimization)
 */
export async function getProductsEnriched(params: GetProductsParams = {}): Promise<Product[]> {
  const { data, error } = await (supabase.rpc as any)('get_products_enriched', {
    p_category_ids: params.categoryIds,
    p_limit: params.limit || 50,
    p_offset: params.offset || 0,
    p_search_query: params.searchQuery,
    p_sort_by: params.sortBy || 'name',
    p_brand: params.brand,
    p_min_price: params.minPrice,
    p_max_price: params.maxPrice
  })

  if (error) throw error
  // Data already matches DomainProduct structure from RPC, but we use the mapper for safety/consistency
  return (data || []).map((row: any) => mapDatabaseProductToDomain(row as DbProduct))
}

export async function getProducts(limit?: number) {
  return getProductsEnriched({ limit, sortBy: 'featured' })
}

export async function getAllProducts() {
  return getProductsEnriched({ limit: 1000 })
}

export async function getProductsByCategory(categoryId: string) {
  return getProductsEnriched({ categoryIds: [categoryId], sortBy: 'featured' })
}

// Alias for compatibility
export const getProductsBySubcategory = getProductsByCategory;

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapDatabaseProductToDomain(data as DbProduct) : null
}

export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  if (!identifier) return null
  
  // Clean potential 'cc' suffix and whitespace
  const cleanId = identifier.trim().replace(/cc$/, '')
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isUuid = uuidRegex.test(cleanId)

  // Try fetching by ID or Slug regardless of regex for maximum robustness
  // First attempt: Primary key if it looks like UUID, otherwise slug
  const field = isUuid ? 'id' : 'slug'
  
  let { data, error } = await supabase
    .from('products')
    .select('*')
    .eq(field, cleanId)
    .maybeSingle()

  // Second attempt: Fallback to the other field if first fetch yielded nothing
  if (!data && !error) {
    const otherField = isUuid ? 'slug' : 'id'
    const fallbackRes = await supabase
      .from('products')
      .select('*')
      .eq(otherField, cleanId)
      .maybeSingle()
    data = fallbackRes.data
    error = fallbackRes.error
  }

  if (error) throw error
  return data ? mapDatabaseProductToDomain(data as DbProduct) : null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'active')
    .limit(6)

  if (error) throw error
  return (data || []).map(row => mapDatabaseProductToDomain(row as DbProduct))
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%, brand.ilike.%${query}%, sku.ilike.%${query}%, model_code.ilike.%${query}%, description.ilike.%${query}%`)
    .eq('status', 'active')
    .limit(20)

  if (error) throw error
  return (data || []).map(row => mapDatabaseProductToDomain(row as DbProduct))
}

// Full‑text search
export interface FtsProductResult extends Product {
  rank: number | null
  is_fuzzy_match?: boolean
}

export async function ftsSearchProducts(q: string, limit = 20, filters?: { category_id?: string }) {
  const payload = { p_q: q, p_limit: limit, p_filters: filters || {} }
  const { data, error } = await supabase.rpc('fts_search_products', payload)
  if (error) throw error
  return (data || []).map((row: any) => mapDatabaseProductToDomain(row as DbProduct)) as FtsProductResult[]
}

// Admin panel search
export interface AdminSearchResult extends Product {
  rank: number
  total_count: number
  purchase_price: number | null
}

export async function adminSearchProducts(q: string, limit = 50, offset = 0, categoryId?: string): Promise<AdminSearchResult[]> {
  const payload: { p_q: string, p_limit: number, p_offset: number, p_category_id?: string } = { p_q: q, p_limit: limit, p_offset: offset }
  if (categoryId) payload.p_category_id = categoryId
  
  const { data, error } = await supabase.rpc('admin_search_products', payload)
  if (error) throw error
  return (data || []).map((row: any) => mapDatabaseProductToDomain(row as DbProduct)) as AdminSearchResult[]
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand'
  label: string
  url: string
  metadata: Record<string, unknown>
}

export async function getSearchSuggestions(q: string, limit = 5) {
  const { data, error } = await supabase.rpc('get_search_suggestions', { p_q: q, p_limit: limit })
  if (error) throw error
  return (data || []) as SearchSuggestion[]
}

// ========== Account: Address Book ==========
export interface UserAddress {
  id: string
  user_id: string
  label?: string | null
  full_name?: string | null
  phone?: string | null
  full_address: string
  address_line: string
  address_type: string
  city: string
  district: string
  postal_code?: string | null
  country?: string | null
  is_default_shipping: boolean
  is_default_billing: boolean
  created_at: string
  updated_at: string
  street_address?: string | null
}

export interface CreateAddressInput {
  address_type?: string;
  address_line?: string;
  label?: string
  full_name?: string
  phone?: string
  full_address: string
  city: string
  district: string
  postal_code?: string
  country?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

export async function listAddresses(): Promise<UserAddress[]> {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .order('is_default_shipping', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as UserAddress[]
}

export async function createAddress(payload: CreateAddressInput): Promise<UserAddress> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const dbPayload: DbUserAddressInsert = {
    address_type: payload.address_type || (payload.is_default_shipping ? 'shipping' : 'billing'),
    address_line: payload.address_line || payload.full_address || '',
    user_id: user.id,
    label: payload.label || 'Adres',
    full_name: payload.full_name,
    phone: payload.phone,
    full_address: payload.full_address,
    street_address: payload.full_address,
    city: payload.city,
    district: payload.district,
    postal_code: payload.postal_code,
    country: payload.country || 'Türkiye',
    is_default_shipping: !!payload.is_default_shipping,
    is_default_billing: !!payload.is_default_billing
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert(dbPayload)
    .select('*')
    .single()

  if (error) throw error
  if (payload.is_default_shipping && data) await setDefaultAddress('shipping', data.id)
  if (payload.is_default_billing && data) await setDefaultAddress('billing', data.id)

  return data as UserAddress
}

export async function updateAddress(id: string, payload: Partial<CreateAddressInput>): Promise<UserAddress> {
  const dbUpdate: DbUserAddressUpdate = payload as DbUserAddressUpdate
  const { data, error } = await supabase
    .from('user_addresses')
    .update(dbUpdate)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as UserAddress
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from('user_addresses').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function setDefaultAddress(kind: 'shipping' | 'billing', id: string): Promise<UserAddress> {
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) throw new Error('Not authenticated')

  const flag = kind === 'shipping' ? 'is_default_shipping' : 'is_default_billing'
  await supabase.from('user_addresses').update({ [flag]: false } as DbUserAddressUpdate).eq('user_id', authData.user.id)
  
  const { data, error } = await supabase.from('user_addresses').update({ [flag]: true } as DbUserAddressUpdate).eq('id', id).select('*').single()
  if (error) throw error
  return data as UserAddress
}

// ========== Account: Invoice Profiles ==========
export type InvoiceProfileType = 'individual' | 'corporate'
export interface InvoiceProfile {
  id: string
  user_id: string
  type: InvoiceProfileType
  title?: string | null
  company_name?: string | null
  tckn?: string | null
  vkn?: string | null
  tax_office?: string | null
  e_invoice?: boolean
  e_archive?: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export async function listInvoiceProfiles(): Promise<InvoiceProfile[]> {
  const { data, error } = await supabase.from('user_invoice_profiles').select('*').order('is_default', { ascending: false })
  if (error) return []
  return (data || []).map((row: any) => ({
    ...row,
    type: (row.type || 'individual') as InvoiceProfileType,
    e_invoice: !!row.e_invoice,
    e_archive: !!row.e_archive
  }))
}

export async function createInvoiceProfile(payload: Partial<InvoiceProfile>): Promise<InvoiceProfile> {
  if (!payload.type) payload.type = 'individual';
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase.from('user_invoice_profiles').insert({ ...payload, user_id: authData.user.id } as any).select('*').single()
  if (error) throw error
  return data as unknown as InvoiceProfile
}

export async function updateInvoiceProfile(id: string, payload: Partial<InvoiceProfile>): Promise<InvoiceProfile> {
  const { data, error } = await supabase.from('user_invoice_profiles').update(payload as any).eq('id', id).select('*').single()
  if (error) throw error
  return data as unknown as InvoiceProfile
}

export async function deleteInvoiceProfile(id: string) {
  const { error } = await supabase.from('user_invoice_profiles').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function setDefaultInvoiceProfile(id: string): Promise<InvoiceProfile> {
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) throw new Error('Not authenticated')

  await supabase.from('user_invoice_profiles').update({ is_default: false } as any).eq('user_id', authData.user.id)
  const { data, error } = await supabase.from('user_invoice_profiles').update({ is_default: true } as any).eq('id', id).select('*').single()
  if (error) throw error
  return data as unknown as InvoiceProfile
}

// ========== Shopping Cart ==========
export interface CartDbItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  unit_price?: number | null
  price_list_id?: string | null
}

export async function getOrCreateShoppingCart(userId: string): Promise<DbShoppingCart> {
  const { data: existing } = await supabase.from('shopping_carts').select('*').eq('user_id', userId).maybeSingle()
  if (existing) return existing
  const { data, error } = await supabase.from('shopping_carts').insert({ user_id: userId } as any).select('*').single()
  if (error) throw error
  return data
}

export async function listCartItemsWithProducts(cartId: string): Promise<{ item: DbCartItem, product: Product }[]> {
  const { data: items } = await supabase.from('cart_items').select('*').eq('cart_id', cartId)
  if (!items || items.length === 0) return []
  
  const productIds = items.map(i => i.product_id)
  const { data: products } = await supabase.from('products').select('*').in('id', productIds)
  
  const domainProducts = (products || []).map((row: DbProduct) => mapDatabaseProductToDomain(row))
  const map = new Map<string, Product>()
  domainProducts.forEach(p => map.set(p.id, p))
  
  return items.map(i => ({ item: i, product: map.get(i.product_id)! })).filter(x => !!x.product)
}

export async function upsertCartItem(params: { cartId: string, productId: string, quantity: number, unitPrice?: number, priceListId?: string | null }): Promise<DbCartItem[]> {
  const { cartId, productId, quantity, unitPrice, priceListId } = params
  const payload: any = { cart_id: cartId, product_id: productId, quantity }
  if (unitPrice !== undefined) payload.unit_price = unitPrice
  if (priceListId !== undefined) payload.price_list_id = priceListId
  
  const { data, error } = await supabase.from('cart_items').upsert(payload, { onConflict: 'cart_id,product_id' }).select('*')
  if (error) throw error
  return data
}

export async function removeCartItem(cartId: string, productId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId).eq('product_id', productId)
  if (error) throw error
  return true
}

export async function clearCartItems(cartId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId)
  if (error) throw error
  return true
}

// ========== B2B: Projects ==========
export async function listUserProjects(): Promise<UserProject[]> {
  const { data, error } = await supabase.from('user_projects' as any).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as unknown as UserProject[]
}

export async function createProject(name: string, description?: string): Promise<UserProject> {
  const { data: authData } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('user_projects' as any).insert({ user_id: authData?.user?.id, name, description }).select('*').single()
  if (error) throw error
  return data as unknown as UserProject
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('user_projects' as any).delete().eq('id', id)
  if (error) throw error
  return true
}

export async function listProjectItems(projectId: string): Promise<(ProjectItem & { product: Product })[]> {
  const { data, error } = await supabase.from('project_items' as any).select('*, product:products(*)').eq('project_id', projectId)
  if (error) throw error
  return (data || []).map((row: any) => ({
    ...row,
    product: mapDatabaseProductToDomain(row.product)
  })) as (ProjectItem & { product: Product })[]
}

export async function addProductToProject(projectId: string, productId: string, quantity = 1): Promise<ProjectItem> {
  const { data, error } = await supabase.from('project_items' as any).upsert({ project_id: projectId, product_id: productId, quantity }, { onConflict: 'project_id,product_id' }).select('*').single()
  if (error) throw error
  return data as unknown as ProjectItem
}

export async function removeProductFromProject(projectId: string, productId: string) {
  const { error } = await supabase.from('project_items' as any).delete().eq('project_id', projectId).eq('product_id', productId)
  if (error) throw error
  return true
}

// ========== Pricing ==========
export async function getEffectiveUnitPrice(product: Product): Promise<number> {
  const info = await getEffectivePriceInfo(product)
  return info.unitPrice
}

export async function getEffectivePriceInfo(product: Product): Promise<{ unitPrice: number, priceListId: string | null }> {
  return { unitPrice: product.price, priceListId: null }
}
