import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { DbAdminSearchResult,DbProduct } from '../../types/db-rows'
import type { FtsProductResult, GetProductsParams,Product, SearchSuggestion } from '../../types/ui-models'
import { mapDatabaseProductToDomain,toUIProductList } from '../type-converters'

export async function getProductsEnriched(
  supabase: SupabaseClient<Database>,
  params: GetProductsParams = {}
): Promise<Product[]> {
  let resolvedCategoryIds = params.categoryIds;

  // If we have category IDs that are actually SLUGS (from CATEGORY_REGISTRY), resolve them to IDs first
  if (resolvedCategoryIds && resolvedCategoryIds.length > 0) {
    const potentialSlugs = resolvedCategoryIds.filter(id => id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
    
    if (potentialSlugs.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, slug')
        .in('slug', potentialSlugs);
      
      if (categories && categories.length > 0) {
        const slugToIdMap = new Map(categories.map(c => [c.slug, c.id]));
        resolvedCategoryIds = resolvedCategoryIds.map(id => slugToIdMap.get(id) || id);
      }
    }
  }

  const { data, error } = await supabase.rpc('get_products_enriched', {
    p_category_ids: resolvedCategoryIds,
    p_limit: params.limit || 50,
    p_offset: params.offset || 0,
    p_search_query: params.searchQuery,
    p_brand: params.brand,
    p_min_price: params.minPrice,
    p_max_price: params.maxPrice
  })

  if (error) {
    console.error('getProductsEnriched error:', error)
    
    // If there was an error with filtering, don't just return 50 random products
    // Instead return empty or a more specific fallback
    if (resolvedCategoryIds && resolvedCategoryIds.length > 0) {
        const { data: fallbackData } = await supabase
          .from('products')
          .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
          .or(`category_id.in.(${resolvedCategoryIds.join(',')}),subcategory_id.in.(${resolvedCategoryIds.join(',')})`)
          .eq('status', 'active')
          .is('deleted_at', null)
          .limit(params.limit || 50)
        return toUIProductList((fallbackData as DbProduct[]) || [])
    }

    const { data: fallbackData } = await supabase
      .from('products')
      .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(params.limit || 50)

    return toUIProductList((fallbackData as DbProduct[]) || [])
  }

  const enrichedProducts = (data || []).map(p => ({
    ...p,
    meta_description: null,
    meta_title: null,
    purchase_price: 0,
    purchase_currency: 'TRY',
    is_category_manual: null,
    description_i18n: null,
    family_id: null,
    barcode: null,
    deleted_at: null,
    depth_mm: null,
    height_mm: null,
    width_mm: null,
    weight_kg: null,
    tax_rate: 20,
    is_taxable: true,
    tenant_id: ''
  })) as DbProduct[]

  return toUIProductList(enrichedProducts)
}

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
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
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
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
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
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
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
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
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
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
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
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
    .eq('is_featured', true)
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(6)

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

export async function searchProducts(supabase: SupabaseClient<Database>, query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
    .or(`name.ilike.%${query}%, brand.ilike.%${query}%, sku.ilike.%${query}%, model_code.ilike.%${query}%, description.ilike.%${query}%`)
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(20)

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
