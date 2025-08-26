import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnofewwkwlyjsqgwjjga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mzg1MzIsImV4cCI6MjA3MTIxNDUzMn0.pqgvGZQS4x9WcIo7TqqobK_1PiUSbuCyw_mORBea4g4'

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
    .insert({ user_id: user.id, ...payload })
    .select('*')
    .single()

  if (error) throw error

  if (payload.is_default_shipping) await setDefaultAddress('shipping', data.id)
  if (payload.is_default_billing) await setDefaultAddress('billing', data.id)

  return data as UserAddress
}

export async function updateAddress(id: string, payload: UpdateAddressInput) {
  const { data, error } = await supabase
    .from('user_addresses')
    .update(payload)
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
