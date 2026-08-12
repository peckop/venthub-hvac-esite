import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { DbAdminSearchResult,DbProduct } from '../../types/db-rows'
import type { FtsProductResult, Product, SearchSuggestion } from '../../types/ui-models'
import { mapDatabaseProductToDomain,toUIProductList } from '../type-converters'
import { VARIANT_DETAIL_COLUMNS } from './product.columns'

export async function getSearchSuggestions(
  supabase: SupabaseClient<Database>,
  q: string,
  limit: number = 6
): Promise<SearchSuggestion[]> {
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
export async function ftsSearchProducts(
  supabase: SupabaseClient<Database>,
  q: string,
  limit = 20,
  filters?: { category_id?: string }
): Promise<FtsProductResult[]> {
  const payload = { p_q: q, p_limit: limit, p_filters: filters || {} }
  const { data, error } = await supabase.rpc('fts_search_products', payload)
  if (error) throw error
  return (data as FtsProductResult[]) || []
}

export async function getProducts(supabase: SupabaseClient<Database>, limit?: number): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(VARIANT_DETAIL_COLUMNS)
    .eq('status', 'active')
    .is('deleted_at', null)
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
export async function getAllProducts(supabase: SupabaseClient<Database>): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(VARIANT_DETAIL_COLUMNS)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

export async function getProductsByCategory(supabase: SupabaseClient<Database>, categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(VARIANT_DETAIL_COLUMNS)
    .or(`category_id.eq.${categoryId}, subcategory_id.eq.${categoryId}`)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

export async function getProductsBySubcategory(supabase: SupabaseClient<Database>, subcategoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(VARIANT_DETAIL_COLUMNS)
    .eq('subcategory_id', subcategoryId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

async function fetchProductBy(
  supabase: SupabaseClient<Database>,
  column: 'id' | 'slug',
  value: string,
  throwOnError = false
): Promise<Product | null> {
  const query = supabase
    .from('products')
    .select(VARIANT_DETAIL_COLUMNS)
    .eq(column, value)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle()

  const { data, error } = await query
  if (error && throwOnError) throw error
  if (error || !data) return null
  return mapDatabaseProductToDomain(data as DbProduct)
}

export async function getProductById(supabase: SupabaseClient<Database>, id: string): Promise<Product | null> {
  return fetchProductBy(supabase, 'id', id, true)
}

export async function getProductBySlugOrId(supabase: SupabaseClient<Database>, identifier: string): Promise<Product | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
  return fetchProductBy(supabase, isUuid ? 'id' : 'slug', identifier, false)
}

export async function getProductBySlug(supabase: SupabaseClient<Database>, slug: string): Promise<Product | null> {
  return fetchProductBy(supabase, 'slug', slug, false)
}

export async function getFeaturedProducts(supabase: SupabaseClient<Database>): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(VARIANT_DETAIL_COLUMNS)
    .eq('is_featured', true)
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(6)

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

export async function adminSearchProducts(
  supabase: SupabaseClient<Database>,
  q: string,
  limit = 50,
  offset = 0,
  categoryId?: string
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
