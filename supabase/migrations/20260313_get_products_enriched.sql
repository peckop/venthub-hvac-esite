-- PostgreSQL RPC for enriched product data to improve Lighthouse performance
-- Joins products with their primary cover image and ensures clean JSON/Numeric types

CREATE OR REPLACE FUNCTION public.get_products_enriched(
  p_category_ids uuid[] DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0,
  p_search_query text DEFAULT NULL,
  p_sort_by text DEFAULT 'name',
  p_brand text DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  brand text,
  price numeric,
  sku text,
  slug text,
  model_code text,
  category_id uuid,
  subcategory_id uuid,
  status text,
  is_featured boolean,
  description text,
  image_url text,
  image_alt text,
  stock_qty int,
  low_stock_threshold int,
  low_stock_override boolean,
  technical_specs jsonb,
  airflow_capacity numeric,
  noise_level numeric,
  pressure_rating numeric,
  created_at timestamptz,
  updated_at timestamptz,
  warehouse_location text,
  supplier_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH first_images AS (
    -- Her ürün için sadece ilk (en düşük sort_order) resmi seç
    SELECT DISTINCT ON (product_id)
      product_id,
      path,
      alt
    FROM product_images
    ORDER BY product_id, sort_order ASC
  )
  SELECT 
    p.id,
    p.name,
    p.brand,
    p.price::numeric,
    p.sku,
    p.slug,
    p.model_code,
    p.category_id,
    p.subcategory_id,
    p.status,
    p.is_featured,
    p.description,
    CASE 
      WHEN fi.path IS NOT NULL THEN 'product-images/' || fi.path 
      ELSE p.image_url -- Eğer tablodaki image_url alanı kullanılıyorsa fallback
    END as image_url,
    fi.alt as image_alt,
    p.stock_qty,
    p.low_stock_threshold,
    p.low_stock_override,
    p.technical_specs,
    p.airflow_capacity::numeric,
    p.noise_level::numeric,
    p.pressure_rating::numeric,
    p.created_at,
    p.updated_at,
    p.warehouse_location,
    p.supplier_name
  FROM products p
  LEFT JOIN first_images fi ON fi.product_id = p.id
  WHERE p.status = 'active'
    -- Filtreleme Lojiği
    AND (p_category_ids IS NULL OR p.category_id = ANY(p_category_ids) OR p.subcategory_id = ANY(p_category_ids))
    AND (p_brand IS NULL OR p.brand = p_brand)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_search_query IS NULL OR 
         p.name ILIKE '%' || p_search_query || '%' OR 
         p.brand ILIKE '%' || p_search_query || '%' OR 
         p.sku ILIKE '%' || p_search_query || '%' OR
         p.model_code ILIKE '%' || p_search_query || '%')
  ORDER BY 
    CASE WHEN p_sort_by = 'featured' THEN p.is_featured END DESC,
    CASE WHEN p_sort_by = 'price-low' THEN p.price END ASC,
    CASE WHEN p_sort_by = 'price-high' THEN p.price END DESC,
    CASE WHEN p_sort_by = 'name' THEN p.name END ASC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
