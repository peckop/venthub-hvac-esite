import { supabase } from '../supabase'
import type { DbProduct, DbAdminSearchResult } from '../../types/db-rows'
import type { Product, SearchSuggestion, FtsProductResult, GetProductsParams } from '../supabase'
import { toUIProductList, mapDatabaseProductToDomain } from '../type-converters'

/**
 * Retrieves a paginated list of enriched products with optional filtering by category, search query, brand, and price.
 * Automatically resolves category slugs to IDs before querying the database RPC.
 * Falls back to basic product querying if the enriched RPC fails.
 *
 * @param params - Configuration object for filtering, pagination, and searching
 * @returns A promise resolving to an array of enriched UI-ready Product objects
 *
 * @example
 * const products = await getProductsEnriched({ categoryIds: ['ac-units'], limit: 10 })
 */
export async function getProductsEnriched(params: GetProductsParams = {}): Promise<Product[]> {
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
          .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
          .or(`category_id.in.(${resolvedCategoryIds.join(',')}),subcategory_id.in.(${resolvedCategoryIds.join(',')})`)
          .limit(params.limit || 50)
        return toUIProductList((fallbackData as DbProduct[]) || [])
    }

    const { data: fallbackData } = await supabase
      .from('products')
      .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
      .limit(params.limit || 50)
    
    return toUIProductList((fallbackData as DbProduct[]) || [])
  }

  const enrichedProducts = (data || []).map(p => ({
    ...p,
    meta_description: null,
    meta_title: null,
    purchase_price: null,
    is_category_manual: null
  })) as DbProduct[]

  return toUIProductList(enrichedProducts)
}

/**
 * Fetches lightweight search suggestions via a dedicated RPC function.
 * Designed for real-time autocomplete dropdowns.
 *
 * @param q - The partial search query string
 * @param limit - Maximum number of suggestions to return (defaults to 6)
 * @returns A promise resolving to an array of search suggestions, or empty array on error
 *
 * @example
 * const suggestions = await getSearchSuggestions('split')
 */
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

/**
 * Executes a PostgreSQL full-text search (optimized for Turkish) against the product catalog.
 * Returns lightweight results including a search rank score for relevance sorting.
 *
 * @param q - The full-text search query string
 * @param limit - Maximum number of results to return (defaults to 20)
 * @param filters - Optional object containing additional filters like category_id
 * @returns A promise resolving to an array of ranked full-text search results
 * @throws {PostgrestError} If the database RPC fails
 *
 * @example
 * const results = await ftsSearchProducts('klima', 10, { category_id: 'uuid-123' })
 */
export async function ftsSearchProducts(q: string, limit = 20, filters?: { category_id?: string }): Promise<FtsProductResult[]> {
  const payload = { p_q: q, p_limit: limit, p_filters: filters || {} }
  const { data, error } = await supabase.rpc('fts_search_products', payload)
  if (error) throw error
  return (data as FtsProductResult[]) || []
}

/**
 * Retrieves a list of all active products, optionally limited in number.
 * Ordered by featured status (featured first) and then alphabetically by name.
 *
 * @param limit - Optional maximum number of products to return
 * @returns A promise resolving to an array of active Product objects
 * @throws {PostgrestError} If the database query fails
 *
 * @example
 * const topProducts = await getProducts(10)
 */
export async function getProducts(limit?: number): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
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

/**
 * Retrieves the complete catalog of active products without any row limits.
 * Ordered by featured status (featured first) and then alphabetically by name.
 * Note: Use with caution on large datasets to avoid memory or bandwidth issues.
 *
 * @returns A promise resolving to an array of all active Product objects
 * @throws {PostgrestError} If the database query fails
 *
 * @example
 * const catalog = await getAllProducts()
 */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

/**
 * Retrieves all active products belonging to a specific category or subcategory.
 * Matches the provided ID against both the `category_id` and `subcategory_id` columns.
 *
 * @param categoryId - The UUID of the category or subcategory
 * @returns A promise resolving to an array of matching active Product objects
 * @throws {PostgrestError} If the database query fails
 *
 * @example
 * const categoryProducts = await getProductsByCategory('uuid-123')
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
    .or(`category_id.eq.${categoryId}, subcategory_id.eq.${categoryId}`)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

/**
 * Retrieves all active products belonging strictly to a specific subcategory.
 * Only checks the `subcategory_id` column.
 *
 * @param subcategoryId - The UUID of the subcategory
 * @returns A promise resolving to an array of matching active Product objects
 * @throws {PostgrestError} If the database query fails
 *
 * @example
 * const subcategoryProducts = await getProductsBySubcategory('uuid-123')
 */
export async function getProductsBySubcategory(subcategoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
    .eq('subcategory_id', subcategoryId)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

async function fetchProductBy(column: 'id' | 'slug', value: string, throwOnError: boolean = false): Promise<Product | null> {
  const query = supabase
    .from('products')
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
    .eq(column, value)
    .maybeSingle()

  const { data, error } = await query
  if (error && throwOnError) throw error
  if (error || !data) return null
  return mapDatabaseProductToDomain(data as DbProduct)
}

/**
 * Retrieves a single product by its exact database UUID.
 * Throws an error if the underlying database query fails.
 *
 * @param id - The precise UUID of the product
 * @returns A promise resolving to the Product object, or null if not found
 * @throws {PostgrestError} If the database query fails
 *
 * @example
 * const product = await getProductById('uuid-123')
 */
export async function getProductById(id: string): Promise<Product | null> {
  return fetchProductBy('id', id, true)
}

/**
 * Smartly retrieves a single product by determining if the identifier is a UUID or a slug.
 * Does not throw on database errors, returning null instead.
 *
 * @param identifier - Either a UUID or a URL-friendly slug
 * @returns A promise resolving to the Product object, or null if not found/error
 *
 * @example
 * const bySlug = await getProductBySlugOrId('split-ac')
 * const byId = await getProductBySlugOrId('uuid-123')
 */
export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
  return fetchProductBy(isUuid ? 'id' : 'slug', identifier, false)
}

/**
 * Retrieves a single product explicitly by its URL-friendly slug.
 * Does not throw on database errors, returning null instead.
 *
 * @param slug - The URL-friendly slug of the product
 * @returns A promise resolving to the Product object, or null if not found/error
 *
 * @example
 * const product = await getProductBySlug('split-ac')
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return fetchProductBy('slug', slug, false)
}

/**
 * Retrieves up to 6 active products explicitly marked as featured.
 *
 * @returns A promise resolving to an array of up to 6 featured Product objects
 * @throws {PostgrestError} If the database query fails
 *
 * @example
 * const featured = await getFeaturedProducts()
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
    .eq('is_featured', true)
    .eq('status', 'active')
    .limit(6)

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

/**
 * Performs a broad text search across active products using standard ILIKE matching.
 * Checks name, brand, SKU, model code, and description.
 *
 * @param query - The text string to search for
 * @returns A promise resolving to an array of up to 20 matching Product objects
 * @throws {PostgrestError} If the database query fails
 *
 * @example
 * const results = await searchProducts('inverter')
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
    .or(`name.ilike.%${query}%, brand.ilike.%${query}%, sku.ilike.%${query}%, model_code.ilike.%${query}%, description.ilike.%${query}%`)
    .eq('status', 'active')
    .limit(20)

  if (error) throw error
  return toUIProductList((data as DbProduct[]) || [])
}

/**
 * Specialized search for the admin panel, providing robust filtering and pagination.
 * Bypasses the 'active only' status filter to allow managing all products.
 *
 * @param q - The search query string
 * @param limit - Maximum number of results to return (defaults to 50)
 * @param offset - Offset for pagination (defaults to 0)
 * @param categoryId - Optional UUID to restrict search to a specific category
 * @returns A promise resolving to an array of DbAdminSearchResult objects
 * @throws {PostgrestError} If the database RPC fails
 *
 * @example
 * const adminResults = await adminSearchProducts('test', 10, 0, 'uuid-123')
 */
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
