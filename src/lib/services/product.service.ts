import { supabase } from '../supabase'
import type { DbProduct, DbAdminSearchResult } from '../../types/db-rows'
import type { Product, SearchSuggestion, FtsProductResult, GetProductsParams } from '../supabase'
import { toUIProductList, mapDatabaseProductToDomain } from '../type-converters'

/**
 * Fetches products enriched with full domain models via a Supabase RPC call.
 * If category slugs are provided instead of IDs, it automatically resolves them first.
 *
 * @param params - Configuration object including limits, offsets, filters, and search queries
 * @returns A promise resolving to an array of mapped Product objects
 * @throws {Error} Logs error and returns fallback plain products if the RPC call fails
 *
 * @example
 * const products = await getProductsEnriched({ limit: 10, categoryIds: ['fans'] })
 * console.log(`Got ${products.length} enriched products`)
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
 * Retrieves search suggestions for a given query string using a Supabase RPC call.
 *
 * @param q - The search query string
 * @param limit - Maximum number of suggestions to return (defaults to 6)
 * @returns A promise resolving to an array of SearchSuggestion objects
 *
 * @example
 * const suggestions = await getSearchSuggestions('fan')
 * console.log(suggestions.map(s => s.name))
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
 * Performs a Turkish full-text search via RPC, returning lightweight fields and match rank.
 *
 * @param q - The search query string
 * @param limit - Maximum number of results to return (defaults to 20)
 * @param filters - Optional filters like category_id
 * @returns A promise resolving to an array of FtsProductResult objects
 * @throws {Error} If the RPC call fails
 *
 * @example
 * const results = await ftsSearchProducts('sessiz fan', 10, { category_id: 'uuid' })
 */
export async function ftsSearchProducts(q: string, limit = 20, filters?: { category_id?: string }): Promise<FtsProductResult[]> {
  const payload = { p_q: q, p_limit: limit, p_filters: filters || {} }
  const { data, error } = await supabase.rpc('fts_search_products', payload)
  if (error) throw error
  return (data as FtsProductResult[]) || []
}

/**
 * Fetches a basic list of active products, optionally limited in number.
 * Products are ordered by 'is_featured' (descending) and 'name' (ascending).
 *
 * @param limit - Optional maximum number of products to return
 * @returns A promise resolving to an array of mapped Product objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const products = await getProducts(10)
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
 * Fetches all active products in the database without any limit.
 * Products are ordered by 'is_featured' (descending) and 'name' (ascending).
 *
 * @returns A promise resolving to an array of mapped Product objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const allProducts = await getAllProducts()
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
 * Fetches all active products belonging to a specific category or subcategory ID.
 *
 * @param categoryId - The UUID of the category
 * @returns A promise resolving to an array of mapped Product objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const products = await getProductsByCategory('category-uuid')
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
 * Fetches all active products belonging explicitly to a specific subcategory ID.
 *
 * @param subcategoryId - The UUID of the subcategory
 * @returns A promise resolving to an array of mapped Product objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const products = await getProductsBySubcategory('subcategory-uuid')
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
 * Fetches a single product by its exact UUID.
 *
 * @param id - The UUID of the product
 * @returns A promise resolving to the mapped Product, or null if not found
 * @throws {Error} If the query fails and throwsOnError is enabled internally
 *
 * @example
 * const product = await getProductById('product-uuid')
 */
export async function getProductById(id: string): Promise<Product | null> {
  return fetchProductBy('id', id, true)
}

/**
 * Fetches a single product, intelligently determining if the identifier is a UUID or a slug.
 *
 * @param identifier - The product's UUID or slug
 * @returns A promise resolving to the mapped Product, or null if not found
 *
 * @example
 * const product = await getProductBySlugOrId('sessiz-fan-model-x')
 */
export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
  return fetchProductBy(isUuid ? 'id' : 'slug', identifier, false)
}

/**
 * Fetches a single product strictly by its slug.
 *
 * @param slug - The URL-friendly slug of the product
 * @returns A promise resolving to the mapped Product, or null if not found
 *
 * @example
 * const product = await getProductBySlug('sessiz-fan')
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return fetchProductBy('slug', slug, false)
}

/**
 * Fetches up to 6 currently active products marked as 'featured'.
 *
 * @returns A promise resolving to an array of up to 6 mapped Product objects
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
 * Performs a basic ILIKE search across product name, brand, sku, model_code, and description.
 *
 * @param query - The search string
 * @returns A promise resolving to an array of mapped Product objects (max 20)
 * @throws {Error} If the database query fails
 *
 * @example
 * const results = await searchProducts('havalandırma')
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
 * Performs a specialized search for the admin panel via an RPC call.
 *
 * @param q - The search string
 * @param limit - Maximum number of results (defaults to 50)
 * @param offset - Pagination offset (defaults to 0)
 * @param categoryId - Optional category UUID filter
 * @returns A promise resolving to an array of DbAdminSearchResult objects
 * @throws {Error} If the RPC call fails
 *
 * @example
 * const results = await adminSearchProducts('fan', 20, 0, 'category-uuid')
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
