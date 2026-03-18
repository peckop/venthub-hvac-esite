import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '../types/database.types'
import type { DomainCategory, DomainProduct } from '../types/ui-models'
import type { DbCategory, DbProduct, DbAdminSearchResult, DbFtsSearchResult } from '../types/db-rows'
export type { DbAdminSearchResult, DbFtsSearchResult }
import { toUICategoryList, toUIProductList, mapDatabaseProductToDomain } from './type-converters'

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

// Database types
export type Category = DomainCategory
export type Product = DomainProduct

import type { DbUserProject, DbProjectItem } from '../types/db-rows'
export type UserProject = DbUserProject
export type ProjectItem = DbProjectItem & { product?: Product }

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
}

// Search and Enriched types
export interface SearchSuggestion {
  text?: string
  label: string
  type: 'product' | 'category' | 'brand'
  slug?: string
  url: string
  metadata?: Json
}

export interface FtsProductResult extends DomainProduct {
  rank?: number
  is_fuzzy_match?: boolean
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

// HVAC specific types
export interface HVACBrand {
  name: string
  slug: string
  description: string
  country: string
  logo?: string
}

export const HVAC_BRANDS: HVACBrand[] = [
  {
    name: 'AVenS',
    slug: 'avens',
    description: 'Türk premium HVAC çözümleri',
    country: 'TR'
  },
  {
    name: 'Vortice',
    slug: 'vortice',
    description: 'İtalyan havalandırma teknolojisi',
    country: 'IT'
  },
  {
    name: 'Casals',
    slug: 'casals',
    description: 'İspanyol güvenilir çözümler',
    country: 'ES'
  },
  {
    name: 'Nicotra Gebhardt',
    slug: 'nicotra-gebhardt',
    description: 'Alman endüstriyel teknoloji',
    country: 'DE'
  },
  {
    name: 'Flexiva',
    slug: 'flexiva',
    description: 'Esnek kanal sistemleri',
    country: 'EU'
  },
  {
    name: 'Frekans Konvertörü',
    slug: 'frekans-konvertoru',
    description: 'Yüksek verimli hız kontrolü',
    country: 'DK'
  }
]

// API functions
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true) // Sadece aktif kategorileri getir
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return toUICategoryList(data as unknown as DbCategory[])
}

export async function getProductsEnriched(params: GetProductsParams = {}): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    
    return toUIProductList(fallbackData as unknown as DbProduct[] || [])
  }

  return toUIProductList(data as unknown as DbProduct[])
}

export async function getSearchSuggestions(q: string, limit: number = 6): Promise<SearchSuggestion[]> {
  const { data, error } = await supabase.rpc('get_search_suggestions', {
    p_q: q,
    p_limit: limit
  })

  if (error) {
    console.error('getSearchSuggestions error:', error)
    return []
  }

  return data as unknown as SearchSuggestion[]
}

// Full‑text search (Turkish) via RPC; returns lightweight fields + rank
export async function ftsSearchProducts(q: string, limit = 20, filters?: { category_id?: string }): Promise<FtsProductResult[]> {
  const payload = { p_q: q, p_limit: limit, p_filters: filters || {} }
  const { data, error } = await supabase.rpc('fts_search_products', payload)
  if (error) throw error
  return (data || []) as FtsProductResult[]
}

export async function getProducts(limit?: number) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) throw error
  return toUIProductList(data as unknown as DbProduct[])
}

// Get all products without limit
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList(data as unknown as DbProduct[])
}

export async function getProductsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`category_id.eq.${categoryId}, subcategory_id.eq.${categoryId} `)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList(data as unknown as DbProduct[])
}

export async function getProductsBySubcategory(subcategoryId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('subcategory_id', subcategoryId)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList(data as unknown as DbProduct[])
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapDatabaseProductToDomain(data as unknown as DbProduct) : null
}

export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
  
  const query = supabase
    .from('products')
    .select('*')
    .eq(isUuid ? 'id' : 'slug', identifier)
    .maybeSingle()

  const { data, error } = await query
  if (error || !data) return null
  return mapDatabaseProductToDomain(data as DbProduct)
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'active')
    .limit(6)

  if (error) throw error
  return toUIProductList(data as unknown as DbProduct[])
}

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.% ${query}%, brand.ilike.% ${query}%, sku.ilike.% ${query}%, model_code.ilike.% ${query}%, description.ilike.% ${query}% `)
    .eq('status', 'active')
    .limit(20)

  if (error) throw error
  return toUIProductList(data as unknown as DbProduct[])
}


// Admin panel FTS search — returns ALL statuses, supports pagination
export interface AdminSearchResult {
  id: string
  name: string
  sku: string
  model_code: string | null
  brand: string | null
  status: string | null
  category_id: string | null
  price: number | null
  purchase_price: number | null
  stock_qty: number | null
  low_stock_threshold: number | null
  is_featured: boolean | null
  slug: string | null
  rank: number
  total_count: number
}

export async function adminSearchProducts(
  q: string, limit = 50, offset = 0, categoryId?: string
): Promise<AdminSearchResult[]> {
  const payload: Record<string, unknown> = { p_q: q, p_limit: limit, p_offset: offset }
  if (categoryId) payload.p_category_id = categoryId
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('admin_search_products', payload)
  if (error) throw error
  return (data || []) as AdminSearchResult[]
}


// ========== Account: Address Book ==========
export interface UserAddress {
  id: string
  user_id: string
  label: string | null
  full_name: string | null
  phone: string | null
  address_line: string
  city: string
  district: string
  postal_code: string | null
  country: string
  is_default_shipping: boolean | null
  is_default_billing: boolean | null
  created_at: string
  updated_at: string
  // Legacy or Helper aliases (optional for UI compatibility)
  full_address?: string | null
  street_address?: string | null
}

export interface CreateAddressInput {
  label?: string | null
  full_name?: string | null
  phone?: string | null
  address_line: string
  city: string
  district: string
  postal_code?: string | null
  country?: string
  is_default_shipping?: boolean | null
  is_default_billing?: boolean | null
  address_type?: string
}

export type UpdateAddressInput = Partial<CreateAddressInput>

export async function listAddresses() {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .order('is_default_shipping', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as UserAddress[]
}

export async function createAddress(payload: CreateAddressInput) {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const dbPayload = {
    user_id: user.id,
    street_address: payload.address_line,
    address_type: payload.address_type || (payload.is_default_shipping ? 'shipping' : 'billing'),
    ...payload
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert(dbPayload as any)
    .select('*')
    .single()

  if (error) throw error

  if (payload.is_default_shipping) await setDefaultAddress('shipping', data.id)
  if (payload.is_default_billing) await setDefaultAddress('billing', data.id)

  return (data as unknown) as UserAddress
}

export async function updateAddress(id: string, payload: UpdateAddressInput) {
  const updatePatch = { ...payload } as Record<string, unknown>
  if (payload.address_line) {
    updatePatch.street_address = payload.address_line
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .update(updatePatch)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  if (payload.is_default_shipping) await setDefaultAddress('shipping', id)
  if (payload.is_default_billing) await setDefaultAddress('billing', id)

  return data as UserAddress
}

export async function deleteAddress(id: string) {
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function setDefaultAddress(kind: 'shipping' | 'billing', id: string) {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const flag: 'is_default_shipping' | 'is_default_billing' = kind === 'shipping' ? 'is_default_shipping' : 'is_default_billing'

  // Clear others
  const clearPatch = { [flag]: false } as Pick<UserAddress, 'is_default_shipping' | 'is_default_billing'>
  const clear = await supabase
    .from('user_addresses')
    .update(clearPatch)
    .eq('user_id', user.id)

  if (clear.error) throw clear.error

  const setPatch = { [flag]: true } as Pick<UserAddress, 'is_default_shipping' | 'is_default_billing'>
  const { data, error } = await supabase
    .from('user_addresses')
    .update(setPatch)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as UserAddress
}

// ========== Account: Invoice Profiles ==========
export type InvoiceProfileType = 'individual' | 'corporate'
export interface InvoiceProfile {
  id: string
  user_id: string
  profile_type: string
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  tax_number?: string | null
  tax_office?: string | null
  address_line: string
  city: string
  district: string
  postal_code?: string | null
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CreateInvoiceProfileInput {
  profile_type: InvoiceProfileType
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  tax_number: string
  tax_office?: string | null
  address_line: string
  city: string
  district: string
  postal_code?: string | null
  country?: string
  is_default?: boolean
}
export type UpdateInvoiceProfileInput = Partial<CreateInvoiceProfileInput>

export async function listInvoiceProfiles() {
  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) {
    const e = error as unknown as { code?: string; message?: string }
    if (e?.code === 'PGRST205' || (e?.message || '').includes("Could not find the table 'public.user_invoice_profiles'")) {
      // Table not yet migrated on the target — return empty list gracefully
      return [] as InvoiceProfile[]
    }
    throw error
  }
  return (data as unknown) as InvoiceProfile[]
}

export async function createInvoiceProfile(payload: CreateInvoiceProfileInput) {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const dbPayload = {
    user_id: user.id,
    ...payload
  }

  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .insert(dbPayload as any)
    .select('*')
    .single()
  if (error) throw error
  return (data as unknown) as InvoiceProfile
}

export async function updateInvoiceProfile(id: string, payload: UpdateInvoiceProfileInput) {
  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .update(payload as any)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return (data as unknown) as InvoiceProfile
}

export async function deleteInvoiceProfile(id: string) {
  const { error } = await supabase
    .from('user_invoice_profiles')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

export async function setDefaultInvoiceProfile(id: string) {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  // Clear other defaults for this user
  const clear = await supabase
    .from('user_invoice_profiles')
    .update({ is_default: false })
    .eq('user_id', user.id)
    .eq('is_default', true)
  if (clear.error) throw clear.error

  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .update({ is_default: true })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  const mapped = { ...data, type: (data as any).profile_type || (data as any).type }
  return (mapped as unknown) as InvoiceProfile
}

export async function fetchDefaultInvoiceProfile() {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .select('*')
    .eq('user_id', user.id) // Filter by user_id
    .eq('is_default', true)
    .order('updated_at', { ascending: false })
    .limit(1)
  if (error) {
    const e = error as unknown as { code?: string; message?: string }
    if (e?.code === 'PGRST205' || (e?.message || '').includes("Could not find the table 'public.user_invoice_profiles'")) {
      return null
    }
    throw error
  }
  const row = Array.isArray(data) && data.length > 0 ? ((data[0] as unknown) as InvoiceProfile) : null
  return row
}

// ========== Shopping Cart (Server-side sync) ==========
export interface ShoppingCart {
  id: string
  user_id: string
  created_at?: string
  updated_at?: string
}

export interface CartDbItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  unit_price?: number | null
  price_list_id?: string | null
  created_at?: string
  updated_at?: string
}

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
      // Ignore if conflict or RLS prevents it; caller may still succeed if profile appears by trigger
      return false
    }
    return true
  } catch {
    return false
  }
}

export async function getOrCreateShoppingCart(userId: string) {
  // Try existing
  const { data: existing, error: selErr } = await supabase
    .from('shopping_carts')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
  if (!selErr && Array.isArray(existing) && existing.length > 0) {
    return existing[0] as ShoppingCart
  }
  // Create new (with FK-safe retry if profile missing)
  const attemptInsert = async () => supabase
    .from('shopping_carts')
    .insert({ user_id: userId })
    .select('*')
    .single()

  let { data, error } = await attemptInsert()
  // If FK to user_profiles missing, create profile then retry once
  interface SupabaseError {
    code?: string
    message?: string
  }

  if (error && (String((error as SupabaseError).code) === '23503' || /user_profiles/i.test(String((error as SupabaseError).message || '')))) {
    await ensureUserProfile(userId)
      ; ({ data, error } = await attemptInsert())
  }
  // If unique conflict (cart already exists), select and return it
  if (error && (String((error as SupabaseError).code) === '23505' || String((error as SupabaseError).code) === '409' || /conflict|duplicate key/i.test(String((error as SupabaseError).message || '')))) {
    const { data: again, error: sel2 } = await supabase
      .from('shopping_carts')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
    if (!sel2 && Array.isArray(again) && again.length > 0) return again[0] as ShoppingCart
  }
  if (error) throw error
  return data as ShoppingCart
}

export async function listCartItems(cartId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
  if (error) throw error
  return (data || []) as CartDbItem[]
}

export async function listCartItemsWithProducts(cartId: string) {
  const items = await listCartItems(cartId)
  if (items.length === 0) return [] as { item: CartDbItem; product: Product }[]
  const productIds = Array.from(new Set(items.map(i => i.product_id)))
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
  if (pErr) throw pErr
  const map = new Map<string, Product>()
  for (const p of (products || []) as Product[]) map.set(p.id, p)
  return items
    .map(i => ({ item: i, product: map.get(i.product_id)! }))
    .filter(x => !!x.product)
}

export async function upsertCartItem(params: { cartId: string; productId: string; quantity: number; unitPrice?: number | null; priceListId?: string | null }) {
  const { cartId, productId, quantity, unitPrice, priceListId } = params
  // Manual UPSERT to avoid relying on on_conflict and optional columns
  const sel = await supabase
    .from('cart_items')
    .select('id')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .limit(1)
  const common: Record<string, unknown> = { quantity }
  if (unitPrice !== undefined) common.unit_price = unitPrice
  if (priceListId !== undefined) common.price_list_id = priceListId

  if (!sel.error && Array.isArray(sel.data) && sel.data.length > 0) {
    const upd = await supabase
      .from('cart_items')
      .update(common)
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .select('*')
    if (upd.error) throw upd.error
    return (upd.data || []) as CartDbItem[]
  }
  const ins = await supabase
    .from('cart_items')
    .insert({ cart_id: cartId, product_id: productId, ...common })
    .select('*')
  if (ins.error) throw ins.error
  return (ins.data || []) as CartDbItem[]
}

export async function removeCartItem(cartId: string, productId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('product_id', productId)
  if (error) throw error
  return true
}

export async function clearCartItems(cartId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
  if (error) throw error
  return true
}

// ========== Pricing: getEffectiveUnitPrice ==========
export type UserRole = 'individual' | 'dealer' | 'corporate' | 'admin'

export interface UserProfileLight {
  id: string
  role?: UserRole | null
  organization_id?: string | null
}

export interface OrganizationLight {
  id: string
  tier_level?: number | null
}

function nowIso() {
  return new Date().toISOString()
}

// Compute effective unit price for a product based on user's role/tier and active price lists.
// Fallbacks safely to product.price numeric parse on any error or if no matching price found.
export async function getEffectiveUnitPrice(product: Product): Promise<number> {
  const info = await getEffectivePriceInfo(product)
  return info.unitPrice
}

export async function getEffectivePriceInfo(product: Product): Promise<{ unitPrice: number, priceListId: string | null }> {
  // Fallback: product.price numeric
  const fallback = (() => {
    const v = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0))
    return Number.isFinite(v) ? v : 0
  })()

  try {
    // Try to get current user
    const { data: authData, error: userErr } = await supabase.auth.getUser()
    const user = userErr ? null : authData?.user

    // If not authenticated, return public price immediately
    if (!user) return { unitPrice: fallback, priceListId: null }

    // Fetch user profile (role, organization)
    const { data: prof, error: profErr } = await supabase
      .from('user_profiles')
      .select('id, role, organization_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profErr) return { unitPrice: fallback, priceListId: null }

    const profile = (prof || {}) as UserProfileLight
    const role = (profile.role || 'individual') as UserRole

    // Fetch organization tier if available
    let tierLevel: number | null = null
    if (profile.organization_id) {
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .select('id, tier_level')
        .eq('id', profile.organization_id)
        .maybeSingle()
      if (!orgErr && org) {
        tierLevel = (org as OrganizationLight)?.tier_level ?? null
      }
    }

    // Load active price lists (time window + is_active)
    const now = nowIso()
    const { data: lists, error: listErr } = await supabase
      .from('price_lists')
      .select('*')
      .eq('is_active', true)
      .lte('effective_from', now)
      .or('effective_to.is.null,effective_to.gte.' + now)

    if (listErr || !Array.isArray(lists)) return { unitPrice: fallback, priceListId: null }

    // Filter lists by role and tier (client-side contains checks)
    type AnyList = { id: string; is_default?: boolean | null; allowed_user_roles?: UserRole[] | null; organization_tiers?: number[] | null; effective_from?: string | null }
    const filtered = (lists as AnyList[]).filter(pl => {
      const roleOk = !pl.allowed_user_roles || pl.allowed_user_roles.length === 0 || pl.allowed_user_roles.includes(role)
      const tierOk = tierLevel == null || !pl.organization_tiers || pl.organization_tiers.length === 0 || pl.organization_tiers.includes(tierLevel)
      return roleOk && tierOk
    })

    // Choose a list: prefer specific over default; latest effective_from wins
    const chosen = filtered.sort((a, b) => {
      const aDef = a.is_default ? 1 : 0
      const bDef = b.is_default ? 1 : 0
      // non-default before default
      if (aDef !== bDef) return aDef - bDef
      const aTime = a.effective_from ? Date.parse(a.effective_from) : 0
      const bTime = b.effective_from ? Date.parse(b.effective_from) : 0
      return bTime - aTime
    })[0]

    // Try product_prices with chosen list, otherwise global (price_list_id is null)
    const priceQueries: { price_list_id: string | null }[] = chosen ? [{ price_list_id: (chosen as { id: string }).id }, { price_list_id: null }] : [{ price_list_id: null }]

    for (const pq of priceQueries) {
      let query = supabase
        .from('product_prices')
        .select('base_price, sale_price, discount_percentage, is_active, valid_from, valid_until')
        .eq('product_id', product.id)
        .eq('is_active', true)

      if (pq.price_list_id === null) {
        query = query.is('price_list_id', null as any)
      } else {
        query = query.eq('price_list_id', pq.price_list_id as any)
      }

      const { data: rows, error: prErr } = await query
      if (prErr || !Array.isArray(rows) || rows.length === 0) continue

      // pick first valid by date window
      const pick = rows.find(r => {
        const fromOk = !r.valid_from || Date.parse(r.valid_from) <= Date.now()
        const toOk = !r.valid_until || Date.parse(r.valid_until) >= Date.now()
        return fromOk && toOk
      }) || rows[0]

      const base = Number(pick.base_price || 0)
      const sale = pick.sale_price != null ? Number(pick.sale_price) : null
      const disc = Number(pick.discount_percentage || 0)

      if (sale != null && Number.isFinite(sale) && sale > 0) return { unitPrice: sale, priceListId: pq.price_list_id }
      if (Number.isFinite(base) && base > 0) {
        if (disc > 0) {
          const val = base * (1 - disc / 100)
          return { unitPrice: Math.max(0, Number(val.toFixed(2))), priceListId: pq.price_list_id }
        }
        return { unitPrice: base, priceListId: pq.price_list_id }
      }
    }

    // No special price found -> fallback
    return { unitPrice: fallback, priceListId: chosen ? (chosen as { id: string }).id : null }
  } catch (e) {
    console.error('getEffectiveUnitPrice error', e)
    return { unitPrice: fallback, priceListId: null }
  }
}

// ========== Project Management ==========

export async function listUserProjects(): Promise<UserProject[]> {
  const { data, error } = await (supabase.from as any)('user_projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data as unknown) as UserProject[]
}

export async function createProject(project: Partial<UserProject>): Promise<UserProject> {
  const { data, error } = await (supabase.from as any)('user_projects')
    .insert(project as unknown as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return (data as unknown) as UserProject
}

export async function deleteProject(id: string) {
  const { error } = await (supabase.from as any)('user_projects')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function addProductToProject(projectId: string, productId: string, quantity: number = 1) {
  const { data, error } = await (supabase.from as any)('project_items')
    .insert({ project_id: projectId, product_id: productId, quantity } as unknown as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeProductFromProject(projectId: string, productId: string) {
  const { error } = await (supabase.from as any)('project_items')
    .delete()
    .match({ project_id: projectId, product_id: productId } as unknown as Record<string, unknown>)

  if (error) throw error
  return true
}

export async function listProjectItems(projectId: string): Promise<ProjectItem[]> {
  const { data, error } = await (supabase.from as any)('project_items')
    .select('*, product:products(*)')
    .eq('project_id', projectId)

  if (error) throw error
  
  // Map internal product to unified Product type
  const items = (data || []) as unknown as any[]
  return items.map(item => ({
    ...item,
    product: item.product ? mapDatabaseProductToDomain(item.product as unknown as DbProduct) : undefined
  })) as unknown as ProjectItem[]
}
