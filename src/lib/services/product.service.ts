import { supabase } from '../supabase'
import type { DbProduct, DbAdminSearchResult } from '../../types/db-rows'
import type { Product, SearchSuggestion, FtsProductResult, GetProductsParams } from '../supabase'
import { toUIProductList, mapDatabaseProductToDomain } from '../type-converters'

/**
 * Fetches products enriched with complex filtering, pagination, and fallback handling.
 * Resolves category slugs to IDs automatically and utilizes an RPC call for advanced queries.
 * Provides a reliable fallback to standard table queries if the RPC or filters fail.
 *
 * @param params - Configuration object for filtering, search, and pagination
 * @returns An array of mapped UI product domain models
 * @throws Does not throw; returns fallbacks on internal query errors
 *
 * @example
 * const products = await getProductsEnriched({ categoryIds: ['fans-slug'], limit: 10 });
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
 * Retrieves autocomplete search suggestions based on the provided query string.
 * Uses a dedicated RPC function to quickly find relevant product matches.
 *
 * @param q - The user's partial search string
 * @param limit - The maximum number of suggestions to return (defaults to 6)
 * @returns An array of search suggestions, or an empty array if the query fails
 * @throws Does not throw; handles database errors silently
 *
 * @example
 * const suggestions = await getSearchSuggestions('fan', 5);
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
 * Executes a full-text search against products utilizing PostgreSQL's FTS engine (Turkish dictionary).
 * Returns lightweight search result items heavily optimized for autocomplete and search popups.
 *
 * @param q - The search query term
 * @param limit - Maximum results to retrieve (defaults to 20)
 * @param filters - Optional filters such as narrowing to a specific category
 * @returns An array of ranked lightweight search results
 * @throws {Error} If the RPC call fails
 *
 * @example
 * const results = await ftsSearchProducts('aspiratör', 10, { category_id: 'uuid-123' });
 */
export async function ftsSearchProducts(q: string, limit = 20, filters?: { category_id?: string }): Promise<FtsProductResult[]> {
  const payload = { p_q: q, p_limit: limit, p_filters: filters || {} }
  const { data, error } = await supabase.rpc('fts_search_products', payload)
  if (error) throw error
  return (data as FtsProductResult[]) || []
}

/**
 * Retrieves a list of active products, prioritizing featured items first.
 * Useful for general listing pages or home page grids.
 *
 * @param limit - Optional upper bound on the number of products returned
 * @returns An array of mapped UI product models
 * @throws {Error} If the database query encounters an error
 *
 * @example
 * const homepageProducts = await getProducts(12);
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
 * Retrieves the entire catalog of active products without any pagination limits.
 * Warning: This can become a heavy operation as the catalog grows.
 *
 * @returns A comprehensive array of all active UI product models
 * @throws {Error} If the database query fails
 *
 * @example
 * const fullCatalog = await getAllProducts(); // Might return 1000+ items
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
 * Retrieves active products that belong to a specific category or subcategory.
 *
 * @param categoryId - The UUID of the category to filter by
 * @returns An array of matched UI product models ordered by feature status and name
 * @throws {Error} If the database query fails
 *
 * @example
 * const industrialFans = await getProductsByCategory('category-uuid-456');
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
 * Retrieves active products that belong specifically to a given subcategory.
 *
 * @param subcategoryId - The UUID of the target subcategory
 * @returns An array of matched UI product models
 * @throws {Error} If the database query fails
 *
 * @example
 * const wallFans = await getProductsBySubcategory('subcat-uuid-789');
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
 * Retrieves a single product by its exact UUID.
 *
 * @param id - The UUID of the target product
 * @returns The mapped product object, or null if not found
 * @throws {Error} If the underlying database request throws an error
 *
 * @example
 * const prod = await getProductById('e4d...3f');
 */
export async function getProductById(id: string): Promise<Product | null> {
  return fetchProductBy('id', id, true)
}

/**
 * Intelligently retrieves a product by examining the identifier string.
 * If the string is a valid UUID, it queries by ID; otherwise, it queries by slug.
 *
 * @param identifier - The product's slug or UUID
 * @returns The mapped product object, or null if no match is found
 * @throws Does not throw on query errors (returns null instead)
 *
 * @example
 * const prod = await getProductBySlugOrId('endustriyel-fan-x1');
 */
export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
  return fetchProductBy(isUuid ? 'id' : 'slug', identifier, false)
}

/**
 * Retrieves a single product strictly by its human-readable slug.
 *
 * @param slug - The URL-friendly slug of the product
 * @returns The mapped product object, or null if no match is found
 * @throws Does not throw on query errors (returns null instead)
 *
 * @example
 * const prod = await getProductBySlug('heavy-duty-vent');
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return fetchProductBy('slug', slug, false)
}

/**
 * Retrieves a small subset of active products explicitly marked as featured.
 * Returns a maximum of 6 items, making it ideal for landing page carousels.
 *
 * @returns An array of up to 6 featured UI product models
 * @throws {Error} If the database query fails
 *
 * @example
 * const carouselItems = await getFeaturedProducts();
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
 * Performs a basic ILIKE text search across product names, brands, SKUs, model codes, and descriptions.
 * Limits results to 20 active products.
 *
 * @param query - The user's search string
 * @returns An array of mapped UI products matching the query
 * @throws {Error} If the database query fails
 *
 * @example
 * const basicSearch = await searchProducts('motor');
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
 * Executes an administrative product search using an RPC function designed for admin dashboards.
 * Allows deep pagination and filtering by category for inventory management tasks.
 *
 * @param q - The administrative search query
 * @param limit - Max results to return per page (defaults to 50)
 * @param offset - Offset for pagination (defaults to 0)
 * @param categoryId - Optional category UUID filter
 * @returns An array of specialized admin product rows
 * @throws {Error} If the RPC call fails
 *
 * @example
 * const adminInventory = await adminSearchProducts('missing-sku', 100, 0, 'cat-id');
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
