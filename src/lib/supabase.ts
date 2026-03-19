import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '../types/database.types'
import type { DomainCategory, DomainProduct } from '../types/ui-models'
import { 
  toUICategoryList, 
  toUIProductList, 
  mapDatabaseProductToDomain 
} from './type-converters'
import type { 
  DbCategory, 
  DbProduct, 
  DbAdminSearchResult, 
  DbFtsSearchResult,
  DbUserProject,
  DbProjectItem,
  DbUserAddress,
  DbUserAddressInsert,
  DbUserAddressUpdate,
  DbInvoiceProfile,
  DbInvoiceProfileInsert,
  DbInvoiceProfileUpdate,
  DbShoppingCart,
  DbCartItem
} from '../types/db-rows'

export type { DbAdminSearchResult, DbFtsSearchResult }
export type UserAddress = DbUserAddress
export type InvoiceProfile = DbInvoiceProfile

// Define SUPABASE config from process.env for Next.js
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Fallback mechanism to prevent white screen on build/env errors
const missingEnv = !SUPABASE_URL || !SUPABASE_ANON_KEY
if (missingEnv) {
  console.error('CRITICAL: Supabase config missing. App will strictly fail on data fetch but should render UI.')
  if (typeof window !== 'undefined') {
    interface VentHubWindow extends Window {
      __SUPABASE_CONFIG_ERROR__?: boolean
    }
    (window as VentHubWindow & typeof globalThis).__SUPABASE_CONFIG_ERROR__ = true
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
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true) // Sadece aktif kategorileri getir
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return toUICategoryList((data as DbCategory[]) || [])
}

export async function getProductsEnriched(params: GetProductsParams = {}): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.rpc('get_products_enriched' as any, {
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
    
    return toUIProductList((fallbackData as DbProduct[]) || [])
  }

  return toUIProductList((data as DbProduct[]) || [])
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

  return (data as SearchSuggestion[]) || []
}

// Full‑text search (Turkish) via RPC; returns lightweight fields + rank
export async function ftsSearchProducts(q: string, limit = 20, filters?: { category_id?: string }): Promise<FtsProductResult[]> {
  const payload = { p_q: q, p_limit: limit, p_filters: filters || {} }
  const { data, error } = await supabase.rpc('fts_search_products', payload)
  if (error) throw error
  return (data as FtsProductResult[]) || []
}

export async function getProducts(limit?: number): Promise<Product[]> {
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
  return toUIProductList((data as DbProduct[]) || [])
}

// Get all products without limit
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`category_id.eq.${categoryId}, subcategory_id.eq.${categoryId}`)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

export async function getProductsBySubcategory(subcategoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('subcategory_id', subcategoryId)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

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

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'active')
    .limit(6)

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%, brand.ilike.%${query}%, sku.ilike.%${query}%, model_code.ilike.%${query}%, description.ilike.%${query}%`)
    .eq('status', 'active')
    .limit(20)

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

export async function adminSearchProducts(
  q: string, limit = 50, offset = 0, categoryId?: string
): Promise<DbAdminSearchResult[]> {
  const payload: { p_q: string; p_limit: number; p_offset: number; p_category_id?: string } = { 
    p_q: q, 
    p_limit: limit, 
    p_offset: offset 
  }
  if (categoryId) payload.p_category_id = categoryId
  
  const { data, error } = await supabase.rpc('admin_search_products', payload)
  if (error) throw error
  return (data as DbAdminSearchResult[]) || []
}

// ========== Account: Address Book ==========

export async function listAddresses(): Promise<DbUserAddress[]> {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .order('is_default_shipping', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DbUserAddress[]) || []
}

export async function createAddress(payload: DbUserAddressInsert): Promise<DbUserAddress> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const dbPayload: DbUserAddressInsert = {
    ...payload,
    user_id: user.id,
    street_address: payload.street_address || payload.address_line,
    address_type: payload.address_type || (payload.is_default_shipping ? 'shipping' : 'billing')
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert(dbPayload)
    .select('*')
    .single()

  if (error) throw error

  if (payload.is_default_shipping) await setDefaultAddress('shipping', data.id)
  if (payload.is_default_billing) await setDefaultAddress('billing', data.id)

  return data as DbUserAddress
}

export async function updateAddress(id: string, payload: DbUserAddressUpdate): Promise<DbUserAddress> {
  const updatePatch: DbUserAddressUpdate = { ...payload }
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

  return data as DbUserAddress
}

export async function deleteAddress(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function setDefaultAddress(kind: 'shipping' | 'billing', id: string): Promise<DbUserAddress> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const flag: 'is_default_shipping' | 'is_default_billing' = kind === 'shipping' ? 'is_default_shipping' : 'is_default_billing'

  // Clear others
  const clearPatch: DbUserAddressUpdate = { [flag]: false }
  const clear = await supabase
    .from('user_addresses')
    .update(clearPatch)
    .eq('user_id', user.id)

  if (clear.error) throw clear.error

  const setPatch: DbUserAddressUpdate = { [flag]: true }
  const { data, error } = await supabase
    .from('user_addresses')
    .update(setPatch)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as DbUserAddress
}

// ========== Account: Invoice Profiles ==========

export async function listInvoiceProfiles(): Promise<DbInvoiceProfile[]> {
  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (error) {
    interface PostgrestErrorExtended { code?: string; message?: string }
    const e = error as PostgrestErrorExtended
    if (e?.code === 'PGRST205' || (e?.message || '').includes("Could not find the table 'public.user_invoice_profiles'")) {
      return []
    }
    throw error
  }
  return (data as DbInvoiceProfile[]) || []
}

export async function createInvoiceProfile(payload: DbInvoiceProfileInsert): Promise<DbInvoiceProfile> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const dbPayload: DbInvoiceProfileInsert = {
    ...payload,
    user_id: user.id
  }

  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .insert(dbPayload)
    .select('*')
    .single()
  
  if (error) throw error
  return data as DbInvoiceProfile
}

export async function updateInvoiceProfile(id: string, payload: DbInvoiceProfileUpdate): Promise<DbInvoiceProfile> {
  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) throw error
  return data as DbInvoiceProfile
}

export async function deleteInvoiceProfile(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_invoice_profiles')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

export async function setDefaultInvoiceProfile(id: string): Promise<DbInvoiceProfile> {
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
  return data as DbInvoiceProfile
}

export async function fetchDefaultInvoiceProfile(): Promise<DbInvoiceProfile | null> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .order('updated_at', { ascending: false })
    .limit(1)
  
  if (error) {
    interface PostgrestErrorExtended { code?: string; message?: string }
    const e = error as PostgrestErrorExtended
    if (e?.code === 'PGRST205' || (e?.message || '').includes("Could not find the table 'public.user_invoice_profiles'")) {
      return null
    }
    throw error
  }
  
  return (data && data.length > 0) ? (data[0] as DbInvoiceProfile) : null
}

// ========== Shopping Cart (Server-side sync) ==========

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
  
  const productIds = Array.from(new Set(items.map(i => i.product_id)))
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
  
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
  productId: string; 
  quantity: number; 
  unitPrice?: number | null; 
  priceListId?: string | null 
}): Promise<DbCartItem[]> {
  const { cartId, productId, quantity, unitPrice, priceListId } = params
  
  const sel = await supabase
    .from('cart_items')
    .select('id')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .limit(1)
  
  const common: Record<string, Json> = { quantity }
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
    return (upd.data as DbCartItem[]) || []
  }
  
  const ins = await supabase
    .from('cart_items')
    .insert({ cart_id: cartId, product_id: productId, ...common })
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

function nowIso(): string {
  return new Date().toISOString()
}

export async function getEffectiveUnitPrice(product: Product): Promise<number> {
  const info = await getEffectivePriceInfo(product)
  return info.unitPrice
}

export async function getEffectivePriceInfo(product: Product): Promise<{ unitPrice: number, priceListId: string | null }> {
  const fallback = (() => {
    const v = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0))
    return Number.isFinite(v) ? v : 0
  })()

  try {
    const { data: authData, error: userErr } = await supabase.auth.getUser()
    const user = userErr ? null : authData?.user

    if (!user) return { unitPrice: fallback, priceListId: null }

    const { data: prof, error: profErr } = await supabase
      .from('user_profiles')
      .select('id, role, organization_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profErr) return { unitPrice: fallback, priceListId: null }

    const profile = (prof || {}) as UserProfileLight
    const role = (profile.role || 'individual') as UserRole

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

    const now = nowIso()
    const { data: lists, error: listErr } = await supabase
      .from('price_lists')
      .select('id, is_default, allowed_user_roles, organization_tiers, effective_from')
      .eq('is_active', true)
      .lte('effective_from', now)
      .or(`effective_to.is.null,effective_to.gte.${now}`)

    if (listErr || !Array.isArray(lists)) return { unitPrice: fallback, priceListId: null }

    interface PriceListRow { 
      id: string; 
      is_default: boolean | null; 
      allowed_user_roles: string[] | null; 
      organization_tiers: number[] | null; 
      effective_from: string | null 
    }
    
    const castedLists = lists as unknown as PriceListRow[]
    
    const filtered = castedLists.filter(pl => {
      const roles = pl.allowed_user_roles || []
      const tiers = pl.organization_tiers || []
      const roleOk = roles.length === 0 || roles.includes(role)
      const tierOk = tierLevel === null || tiers.length === 0 || tiers.includes(tierLevel)
      return roleOk && tierOk
    })

    const chosen = filtered.sort((a, b) => {
      const aDef = a.is_default ? 1 : 0
      const bDef = b.is_default ? 1 : 0
      if (aDef !== bDef) return aDef - bDef
      const aTime = a.effective_from ? Date.parse(a.effective_from) : 0
      const bTime = b.effective_from ? Date.parse(b.effective_from) : 0
      return bTime - aTime
    })[0]

    const priceQueries: { price_list_id: string | null }[] = chosen 
      ? [{ price_list_id: chosen.id }, { price_list_id: null }] 
      : [{ price_list_id: null }]

    for (const pq of priceQueries) {
      let query = supabase
        .from('product_prices')
        .select('base_price, sale_price, discount_percentage, is_active, valid_from, valid_until')
        .eq('product_id', product.id)
        .eq('is_active', true)

      if (pq.price_list_id === null) {
        query = query.is('price_list_id', null)
      } else {
        query = query.eq('price_list_id', pq.price_list_id)
      }

      const { data: rows, error: prErr } = await query
      if (prErr || !Array.isArray(rows) || rows.length === 0) continue

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

    return { unitPrice: fallback, priceListId: chosen ? chosen.id : null }
  } catch (e) {
    console.error('getEffectiveUnitPrice error', e)
    return { unitPrice: fallback, priceListId: null }
  }
}

// ========== Project Management ==========

export async function listUserProjects(): Promise<DbUserProject[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data as DbUserProject[]) || []
}

export async function createProject(project: Partial<DbUserProject>): Promise<DbUserProject> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_projects')
    .insert(project)
    .select()
    .single()

  if (error) throw error
  return data as DbUserProject
}

export async function deleteProject(id: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('user_projects')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function addProductToProject(projectId: string, productId: string, quantity: number = 1): Promise<DbProjectItem> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('project_items')
    .insert({ project_id: projectId, product_id: productId, quantity })
    .select()
    .single()

  if (error) throw error
  return data as DbProjectItem
}

export async function removeProductFromProject(projectId: string, productId: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('project_items')
    .delete()
    .match({ project_id: projectId, product_id: productId })

  if (error) throw error
  return true
}

export async function listProjectItems(projectId: string): Promise<ProjectItem[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('project_items')
    .select('*, product:products(*)')
    .eq('project_id', projectId)

  if (error) throw error
  
  const items = (data as (DbProjectItem & { product: DbProduct | null })[]) || []
  return items.map(item => ({
    ...item,
    product: item.product ? mapDatabaseProductToDomain(item.product) : undefined
  }))
}
