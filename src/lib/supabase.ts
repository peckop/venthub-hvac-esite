import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://tnofewwkwlyjsqgwjjga.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mzg1MzIsImV4cCI6MjA3MTIxNDUzMn0.pqgvGZQS4x9WcIo7TqqobK_1PiUSbuCyw_mORBea4g4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  level: number
  description: string
}

export interface Product {
  id: string
  name: string
  brand: string
  price: string
  sku: string
  category_id: string
  subcategory_id: string
  status: 'active' | 'inactive' | 'out_of_stock'
  is_featured: boolean
  description?: string
  technical_specs?: unknown
  image_url?: string
  // Teknik alanlar (varsa Supabase'ten gelir)
  airflow_capacity?: number | null
  noise_level?: number | null
  pressure_rating?: number | null
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
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
    name: 'Danfoss',
    slug: 'danfoss',
    description: 'İskandinav kontrol teknolojisi',
    country: 'DK'
  }
]

// API functions
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return data as Category[]
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
  return data as Product[]
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
  return data as Product[]
}

export async function getProductsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`category_id.eq.${categoryId},subcategory_id.eq.${categoryId}`)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return data as Product[]
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
  return data as Product[]
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Product | null
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'active')
    .limit(6)

  if (error) throw error
  return data as Product[]
}

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%,sku.ilike.%${query}%`)
    .eq('status', 'active')
    .limit(20)

  if (error) throw error
  return data as Product[]
}

// ========== Account: Address Book ==========
export interface UserAddress {
  id: string
  user_id: string
  label?: string | null
  full_name?: string | null
  phone?: string | null
  full_address: string
  city: string
  district: string
  postal_code?: string | null
  country?: string | null
  is_default_shipping: boolean
  is_default_billing: boolean
  created_at: string
  updated_at: string
}

export interface CreateAddressInput {
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

  const { data, error } = await supabase
    .from('user_addresses')
    .insert({ user_id: user.id, street_address: payload.full_address, ...payload })
    .select('*')
    .single()

  if (error) throw error

  if (payload.is_default_shipping) await setDefaultAddress('shipping', data.id)
  if (payload.is_default_billing) await setDefaultAddress('billing', data.id)

  return data as UserAddress
}

export async function updateAddress(id: string, payload: UpdateAddressInput) {
  const updatePatch = { ...payload } as Record<string, unknown>
  if (payload.full_address) {
    (updatePatch as Record<string, unknown>).street_address = payload.full_address
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
  type: InvoiceProfileType
  title?: string | null
  tckn?: string | null
  company_name?: string | null
  vkn?: string | null
  tax_office?: string | null
  e_invoice?: boolean | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CreateInvoiceProfileInput {
  type: InvoiceProfileType
  title?: string
  // individual
  tckn?: string
  // corporate
  company_name?: string
  vkn?: string
  tax_office?: string
  e_invoice?: boolean
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
  return data as InvoiceProfile[]
}

export async function createInvoiceProfile(payload: CreateInvoiceProfileInput) {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .insert({ user_id: user.id, ...payload })
    .select('*')
    .single()
  if (error) throw error
  return data as InvoiceProfile
}

export async function updateInvoiceProfile(id: string, payload: UpdateInvoiceProfileInput) {
  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as InvoiceProfile
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
  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .update({ is_default: true })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as InvoiceProfile
}

export async function fetchDefaultInvoiceProfile() {
  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .select('*')
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
  const row = Array.isArray(data) && data.length > 0 ? (data[0] as InvoiceProfile) : null
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
  if (error && (String((error as any).code) === '23503' || /user_profiles/i.test(String((error as any).message || '')))) {
    await ensureUserProfile(userId)
    ;({ data, error } = await attemptInsert())
  }
  // If unique conflict (cart already exists), select and return it
  if (error && (String((error as any).code) === '23505' || String((error as any).code) === '409' || /conflict|duplicate key/i.test(String((error as any).message || '')))) {
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
    const v = parseFloat(product.price || '0')
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
    const priceQueries: { price_list_id: string | null }[] = chosen ? [{ price_list_id: (chosen as any).id }, { price_list_id: null }] : [{ price_list_id: null }]

    for (const pq of priceQueries) {
      let query = supabase
        .from('product_prices')
        .select('base_price, sale_price, discount_percentage, is_active, valid_from, valid_until')
        .eq('product_id', product.id)
        .eq('is_active', true)

      if (pq.price_list_id === null) {
        query = query.is('price_list_id', null as unknown as undefined)
      } else {
        query = query.eq('price_list_id', pq.price_list_id)
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
    return { unitPrice: fallback, priceListId: chosen ? (chosen as any).id : null }
  } catch (e) {
    console.error('getEffectiveUnitPrice error', e)
    return { unitPrice: fallback, priceListId: null }
  }
}
