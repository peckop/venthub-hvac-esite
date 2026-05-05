import { supabase } from '../supabase'
import type { DbProduct, DbAdminSearchResult } from '../../types/db-rows'
import type { Product, SearchSuggestion, FtsProductResult, GetProductsParams } from '../supabase'
import { toUIProductList, mapDatabaseProductToDomain } from '../type-converters'

/**
 * Retrieves an enriched list of products based on comprehensive filtering parameters.
 * Can resolve category slugs to IDs internally and gracefully falls back to basic selects on RPC errors.
 *
 * @param params - Configuration object containing limits, offsets, and filter criteria
 * @returns A promise resolving to an array of enriched Product domain models
 * @throws {Error} Never throws directly, returns empty array or fallback data on failure
 *
 * @example
 * const items = await getProductsEnriched({ limit: 10, brand: "Acme", categoryIds: ["slug-1"] })
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
 * Fetches lightweight search suggestions for a given query via an RPC call.
 *
 * @param q - The search query string
 * @param limit - Maximum number of suggestions to return (default: 6)
 * @returns A promise resolving to an array of SearchSuggestion objects
 *
 * @example
 * const suggestions = await getSearchSuggestions("fan", 3)
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
 * Performs a Turkish full-text search against the products table via an RPC call.
 * Returns lightweight fields and includes search ranking scores.
 *
 * @param q - The search query string
 * @param limit - Maximum number of results to return (default: 20)
 * @param filters - Optional filters object, like narrowing by category_id
 * @returns A promise resolving to an array of FTS product results
 * @throws {Error} If the RPC call fails
 *
 * @example
 * const ftsResults = await ftsSearchProducts("fan", 10, { category_id: "uuid-456" })
 */
export async function ftsSearchProducts(q: string, limit = 20, filters?: { category_id?: string }): Promise<FtsProductResult[]> {
  const payload = { p_q: q, p_limit: limit, p_filters: filters || {} }
  const { data, error } = await supabase.rpc('fts_search_products', payload)
  if (error) throw error
  return (data as FtsProductResult[]) || []
}

/**
 * Fetches a list of active products, ordered by featured status and then alphabetically.
 *
 * @param limit - Optional maximum number of products to return
 * @returns A promise resolving to an array of active Product domain models
 * @throws {Error} If the database query fails
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
 * Retrieves all active products in the system without any pagination limits.
 * Ordered by featured status and alphabetically by name.
 *
 * @returns A promise resolving to a complete array of active Product domain models
 * @throws {Error} If the database query fails
 *
 * @example
 * const allProds = await getAllProducts()
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
 * Fetches active products that belong to a specific category or subcategory ID.
 *
 * @param categoryId - The UUID of the category or subcategory to filter by
 * @returns A promise resolving to an array of active Product domain models
 * @throws {Error} If the database query fails
 *
 * @example
 * const catProducts = await getProductsByCategory("cat-uuid-123")
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
 * Fetches active products strictly assigned to a specific subcategory ID.
 *
 * @param subcategoryId - The UUID of the subcategory to filter by
 * @returns A promise resolving to an array of active Product domain models
 * @throws {Error} If the database query fails
 *
 * @example
 * const subCatProducts = await getProductsBySubcategory("sub-uuid-456")
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
 * Fetches a specific product by its exact UUID.
 *
 * @param id - The UUID of the product
 * @returns A promise resolving to the Product domain model, or null if not found
 * @throws {Error} If the database query encounters a critical error
 *
 * @example
 * const prod = await getProductById("uuid-123")
 */
export async function getProductById(id: string): Promise<Product | null> {
  return fetchProductBy('id', id, true)
}

/**
 * Intelligently fetches a product using either its UUID or slug identifier.
 * Gracefully handles non-existent products without throwing.
 *
 * @param identifier - The UUID or URL-friendly slug of the product
 * @returns A promise resolving to the Product domain model, or null if not found
 *
 * @example
 * const bySlug = await getProductBySlugOrId("heavy-duty-fan")
 */
export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
  return fetchProductBy(isUuid ? 'id' : 'slug', identifier, false)
}

/**
 * Fetches a specific product using its URL-friendly slug.
 * Gracefully returns null instead of throwing on not-found errors.
 *
 * @param slug - The URL-friendly slug of the product
 * @returns A promise resolving to the Product domain model, or null if not found
 *
 * @example
 * const prod = await getProductBySlug("heavy-duty-fan")
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return fetchProductBy('slug', slug, false)
}

/**
 * Retrieves the top 6 active products marked as featured.
 *
 * @returns A promise resolving to an array of up to 6 featured Product domain models
 * @throws {Error} If the database query fails
 *
 * @example
 * const heroProducts = await getFeaturedProducts()
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
 * Performs a basic ILIKE text search against multiple product fields (name, brand, sku, model, desc).
 * Limited to 20 active products.
 *
 * @param query - The string to search for across text fields
 * @returns A promise resolving to an array of matching active Product domain models
 * @throws {Error} If the database query fails
 *
 * @example
 * const basicSearch = await searchProducts("axial fan")
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
 * Performs a paginated search for products specifically tailored for the admin interface.
 * Can filter by category and leverages an RPC call.
 *
 * @param q - The search query string
 * @param limit - Maximum number of results to return per page (default: 50)
 * @param offset - Pagination offset (default: 0)
 * @param categoryId - Optional category UUID to narrow the search
 * @returns A promise resolving to an array of DbAdminSearchResult records
 * @throws {Error} If the RPC call fails
 *
 * @example
 * const adminResults = await adminSearchProducts("fan", 50, 0)
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
