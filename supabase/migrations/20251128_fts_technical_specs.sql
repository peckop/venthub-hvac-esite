-- 20251128: Enhanced Full-text search including technical_specs and description
-- Fixes issue where searching for technical values (debi, airflow, etc.) returns 0 results

-- Drop old index
DROP INDEX IF EXISTS public.idx_products_fts_tr;

-- Create enhanced FTS index including technical_specs and description
CREATE INDEX idx_products_fts_tr_enhanced ON public.products USING gin (
  to_tsvector('turkish', 
    coalesce(name,'') || ' ' || 
    coalesce(model_code,'') || ' ' || 
    coalesce(sku,'') || ' ' || 
    coalesce(brand,'') || ' ' ||
    coalesce(description,'') || ' ' ||
    -- Extract text from technical_specs JSON
    coalesce(technical_specs::text,'')
  )
);

-- Update fts_search_products function to include technical_specs
CREATE OR REPLACE FUNCTION public.fts_search_products(
  p_q text,
  p_limit integer DEFAULT 20,
  p_filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  id uuid,
  name text,
  sku text,
  brand text,
  price numeric,
  rank real
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO pg_catalog, public
AS $$
  WITH params AS (
    SELECT
      coalesce(p_q,'')::text AS raw,
      plainto_tsquery('turkish', coalesce(p_q,'')) AS tsq,
      LEAST(GREATEST(p_limit,1), 100) AS lim,
      p_filters AS f
  )
  SELECT p.id, p.name, p.sku, p.brand, p.price,
         ts_rank(
           to_tsvector('turkish', 
             coalesce(p.name,'') || ' ' || 
             coalesce(p.model_code,'') || ' ' || 
             coalesce(p.sku,'') || ' ' || 
             coalesce(p.brand,'') || ' ' ||
             coalesce(p.description,'') || ' ' ||
             coalesce(p.technical_specs::text,'')
           ),
           (SELECT tsq FROM params)
         ) AS rank
  FROM public.products p, params x
  WHERE (
    p.name ILIKE '%' || replace(x.raw, ' ', '%') || '%'
    OR p.model_code ILIKE '%' || replace(x.raw, ' ', '%') || '%'
    OR p.sku ILIKE '%' || replace(x.raw, ' ', '%') || '%'
    OR p.brand ILIKE '%' || replace(x.raw, ' ', '%') || '%'
    OR p.description ILIKE '%' || replace(x.raw, ' ', '%') || '%'
    OR p.technical_specs::text ILIKE '%' || x.raw || '%'
    OR to_tsvector('turkish', 
         coalesce(p.name,'') || ' ' || 
         coalesce(p.model_code,'') || ' ' || 
         coalesce(p.sku,'') || ' ' || 
         coalesce(p.brand,'') || ' ' ||
         coalesce(p.description,'') || ' ' ||
         coalesce(p.technical_specs::text,'')
       ) @@ x.tsq
  )
  AND (
    (NOT (x.f ? 'category_id')) OR (p.category_id = (x.f->>'category_id')::uuid)
  )
  AND p.status = 'active'
  ORDER BY rank DESC NULLS LAST, p.name ASC
  LIMIT x.lim;
$$;
