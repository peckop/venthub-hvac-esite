import { supabase } from '../supabase'
import type { DbProduct, DbAdminSearchResult } from '../../types/db-rows'
import type { Product, SearchSuggestion, FtsProductResult, GetProductsParams } from '../supabase'
import { toUIProductList, mapDatabaseProductToDomain } from '../type-converters'

/**
 * Fetches products enriched with metadata, optionally filtered by categories, search query, brand, or price range.
 * Relies on the `get_products_enriched` RPC to handle complex filtering logic on the database side.
 * Fallbacks to a generic product query if the RPC fails.
 *
 * @param params - Configuration object for filtering, searching, and pagination
 * @returns A promise that resolves to an array of enriched UI Product objects
 *
 * @example
 * const products = await getProductsEnriched({
 *   categoryIds: ['fans'],
 *   minPrice: 1000,
 *   limit: 10
 * })
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
 * Retrieves search autocomplete suggestions based on a partial query.
 * Uses the `get_search_suggestions` RPC.
 *
 * @param q - The partial search query string
 * @param limit - Maximum number of suggestions to return (default: 6)
 * @returns A promise that resolves to an array of search suggestions
 *
 * @example
 * const suggestions = await getSearchSuggestions('fan', 5)
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
 * Performs a Turkish full-text search across products via RPC.
 * Returns lightweight, ranked results optimized for search-as-you-type or quick lookups.
 *
 * @param q - The search query string
 * @param limit - Maximum number of results to return (default: 20)
 * @param filters - Optional filters (e.g., category_id) to narrow the search scope
 * @returns A promise that resolves to an array of ranked full-text search results
 * @throws {Error} If the database RPC fails
 *
 * @example
 * const results = await ftsSearchProducts('sessiz fan', 10, { category_id: 'cat-123' })
 */
export async function ftsSearchProducts(q: string, limit = 20, filters?: { category_id?: string }): Promise<FtsProductResult[]> {
  const payload = { p_q: q, p_limit: limit, p_filters: filters || {} }
  const { data, error } = await supabase.rpc('fts_search_products', payload)
  if (error) throw error
  return (data as FtsProductResult[]) || []
}

/**
 * Retrieves a list of active products, prioritizing featured ones.
 *
 * @param limit - Optional maximum number of products to return
 * @returns A promise that resolves to an array of active UI Product objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const homepageProducts = await getProducts(10)
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
 * Retrieves all active products from the database without any limits.
 * Prioritizes featured products, then sorts alphabetically by name.
 * Use with caution on large datasets due to memory and network overhead.
 *
 * @returns A promise that resolves to an array of all active UI Product objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const allActiveProducts = await getAllProducts()
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
 * Retrieves all active products belonging to a specific category or its subcategories.
 * Prioritizes featured products, then sorts alphabetically by name.
 *
 * @param categoryId - The unique ID of the parent or target category
 * @returns A promise that resolves to an array of matched active UI Product objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const categoryProducts = await getProductsByCategory('cat-123')
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
 * Retrieves all active products belonging explicitly to a specific subcategory.
 * Prioritizes featured products, then sorts alphabetically by name.
 *
 * @param subcategoryId - The unique ID of the target subcategory
 * @returns A promise that resolves to an array of matched active UI Product objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const subcategoryProducts = await getProductsBySubcategory('subcat-456')
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
 * Retrieves a single product by its unique UUID.
 *
 * @param id - The unique UUID of the product
 * @returns A promise that resolves to the UI Product object, or null if not found
 * @throws {Error} If the database query fails
 *
 * @example
 * const product = await getProductById('123e4567-e89b-12d3-a456-426614174000')
 */
export async function getProductById(id: string): Promise<Product | null> {
  return fetchProductBy('id', id, true)
}

/**
 * Retrieves a single product by determining if the identifier is a UUID or a slug.
 * Safely handles both formats without throwing errors on not found.
 *
 * @param identifier - The product UUID or URL slug
 * @returns A promise that resolves to the UI Product object, or null if not found
 *
 * @example
 * const product1 = await getProductBySlugOrId('sessiz-fan')
 * const product2 = await getProductBySlugOrId('123e4567-e89b-12d3-a456-426614174000')
 */
export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
  return fetchProductBy(isUuid ? 'id' : 'slug', identifier, false)
}

/**
 * Retrieves a single product by its URL slug.
 *
 * @param slug - The URL-friendly slug of the product
 * @returns A promise that resolves to the UI Product object, or null if not found
 *
 * @example
 * const product = await getProductBySlug('endustriyel-havalandirma-fani')
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return fetchProductBy('slug', slug, false)
}

/**
 * Retrieves up to 6 featured active products.
 *
 * @returns A promise that resolves to an array of featured UI Product objects
 * @throws {Error} If the database query fails
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
 * Performs a basic ILIKE text search across product name, brand, SKU, model code, and description.
 * Limited to 20 active products.
 *
 * @param query - The string to search for
 * @returns A promise that resolves to an array of matched UI Product objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const results = await searchProducts('fan')
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
 * Performs an admin-level product search via RPC, supporting pagination and optional category filtering.
 * Returns raw database results for admin UI consumption.
 *
 * @param q - The search query string
 * @param limit - Maximum number of products to return (default: 50)
 * @param offset - Number of products to skip (default: 0)
 * @param categoryId - Optional category ID to restrict the search to
 * @returns A promise that resolves to an array of raw admin search results
 * @throws {Error} If the database RPC fails
 *
 * @example
 * const adminResults = await adminSearchProducts('fan', 25, 0, 'cat-123')
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
