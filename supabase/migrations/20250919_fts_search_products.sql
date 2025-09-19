-- 20250919: Full-text search (Turkish) + trigram search for products
-- Safe/idempotent migration for Supabase

-- Enable extension (Supabase recommends using the "extensions" schema)
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Trigram GIN indexes for fuzzy search
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_model_code_trgm ON public.products USING gin (model_code extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_sku_trgm ON public.products USING gin (sku extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_brand_trgm ON public.products USING gin (brand extensions.gin_trgm_ops);

-- Turkish tsvector GIN index combining key text fields
CREATE INDEX IF NOT EXISTS idx_products_fts_tr ON public.products USING gin (
  to_tsvector('turkish', coalesce(name,'') || ' ' || coalesce(model_code,'') || ' ' || coalesce(sku,'') || ' ' || coalesce(brand,''))
);

-- RPC: Full-text + fuzzy search on products (RLS applies)
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
           to_tsvector('turkish', coalesce(p.name,'') || ' ' || coalesce(p.model_code,'') || ' ' || coalesce(p.sku,'') || ' ' || coalesce(p.brand,'')),
           (SELECT tsq FROM params)
         ) AS rank
  FROM public.products p, params x
  WHERE (
    p.name ILIKE '%' || replace(x.raw, ' ', '%') || '%'
    OR p.model_code ILIKE '%' || replace(x.raw, ' ', '%') || '%'
    OR p.sku ILIKE '%' || replace(x.raw, ' ', '%') || '%'
    OR p.brand ILIKE '%' || replace(x.raw, ' ', '%') || '%'
    OR to_tsvector('turkish', coalesce(p.name,'') || ' ' || coalesce(p.model_code,'') || ' ' || coalesce(p.sku,'') || ' ' || coalesce(p.brand,'')) @@ x.tsq
  )
  AND (
    (NOT (x.f ? 'category_id')) OR (p.category_id = (x.f->>'category_id')::uuid)
  )
  ORDER BY rank DESC NULLS LAST, p.name ASC
  LIMIT x.lim;
$$;
