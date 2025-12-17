-- 20251215: Fix Filter Logic in Advanced Search
-- Adds support for brand, price_min, and price_max in the filter JSONB

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
  rank real,
  is_fuzzy_match boolean
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
  ),
  scoring AS (
    SELECT 
      p.id, 
      p.name, 
      p.sku, 
      p.brand, 
      p.price,
      -- Score 1: FTS Rank
      ts_rank(
        to_tsvector('turkish', coalesce(p.name,'') || ' ' || coalesce(p.model_code,'') || ' ' || coalesce(p.sku,'') || ' ' || coalesce(p.brand,'')),
        (SELECT tsq FROM params)
      ) AS fts_score,
      -- Score 2: Trigram Similarity
      similarity(p.name, (SELECT raw FROM params)) AS trgm_score
    FROM public.products p, params x
    WHERE 
      p.status = 'active'
      -- Category Filter
      AND (
        (NOT (x.f ? 'category_id')) OR (p.category_id = (x.f->>'category_id')::uuid)
      )
      -- Brand Filter
      AND (
        (NOT (x.f ? 'brand')) OR (p.brand = (x.f->>'brand'))
      )
      -- Price Min Filter
      AND (
        (NOT (x.f ? 'price_min')) OR (p.price >= (x.f->>'price_min')::numeric)
      )
      -- Price Max Filter
      AND (
        (NOT (x.f ? 'price_max')) OR (p.price <= (x.f->>'price_max')::numeric)
      )
  )
  SELECT
    s.id,
    s.name,
    s.sku,
    s.brand,
    s.price,
    (s.fts_score + (s.trgm_score * 0.5))::real AS rank,
    (s.fts_score < 0.1 AND s.trgm_score > 0.3) AS is_fuzzy_match
  FROM scoring s, params x
  WHERE
    (s.fts_score > 0 OR s.trgm_score > 0.1)
  ORDER BY rank DESC
  LIMIT x.lim;
$$;
