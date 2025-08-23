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
  technical_specs?: any
  image_url?: string
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