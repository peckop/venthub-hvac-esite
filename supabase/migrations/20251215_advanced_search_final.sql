-- 20251215: Advanced Search & Autocomplete
-- Enables hybrid FTS + Trigram scoring and "Did you mean?" logic.

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- 2. Upgrade Search RPC (Hybrid Scoring)
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
      -- Score 2: Trigram Similarity (name only for simplicity/speed)
      similarity(p.name, (SELECT raw FROM params)) AS trgm_score
    FROM public.products p, params x
    WHERE 
      p.status = 'active'
      AND (
        (NOT (x.f ? 'category_id')) OR (p.category_id = (x.f->>'category_id')::uuid)
      )
  )
  SELECT
    s.id,
    s.name,
    s.sku,
    s.brand,
    s.price,
    -- Hybrid Rank: FTS is primary (1.0), Trigram is boost (0.5)
    (s.fts_score + (s.trgm_score * 0.5))::real AS rank,
    -- If FTS score is low/zero but Trigram is high, it's a fuzzy match
    (s.fts_score < 0.1 AND s.trgm_score > 0.3) AS is_fuzzy_match
  FROM scoring s, params x
  WHERE
    -- Return if either FTS matches OR Trigram similarity is good enough (>0.1)
    s.fts_score > 0 OR s.trgm_score > 0.1
    -- Also check direct SKU match separately? No, FTS handles it.
  ORDER BY rank DESC
  LIMIT x.lim;
$$;

-- 3. New RPC: Search Suggestions (Autocomplete)
CREATE OR REPLACE FUNCTION public.get_search_suggestions(
  p_q text,
  p_limit integer DEFAULT 5
)
RETURNS TABLE(
  type text,
  label text,
  url text,
  metadata jsonb
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO pg_catalog, public
AS $$
  WITH params AS (SELECT p_q AS raw),
  -- Product Suggestions
  products AS (
    SELECT
      'product'::text AS type,
      name AS label,
      '/products/' || id AS url,
      jsonb_build_object('price', price, 'brand', brand) AS metadata,
      similarity(name, (SELECT raw FROM params)) AS sim
    FROM public.products
    WHERE status = 'active' 
      AND (name ILIKE '%' || (SELECT raw FROM params) || '%' OR similarity(name, (SELECT raw FROM params)) > 0.1)
    ORDER BY sim DESC
    LIMIT 3
  ),
  -- Category Suggestions
  categories AS (
    SELECT
      'category'::text AS type,
      name AS label,
      '/category/' || slug AS url,
      jsonb_build_object('description', description) AS metadata,
      similarity(name, (SELECT raw FROM params)) AS sim
    FROM public.categories
    WHERE name ILIKE '%' || (SELECT raw FROM params) || '%'
    ORDER BY sim DESC
    LIMIT 2
  ),
  -- Brand Suggestions
  brands AS (
    SELECT DISTINCT
      'brand'::text AS type,
      brand AS label,
      '/products?brand=' || brand AS url,
      '{}'::jsonb AS metadata,
      similarity(brand, (SELECT raw FROM params)) AS sim
    FROM public.products
    WHERE brand ILIKE '%' || (SELECT raw FROM params) || '%'
    LIMIT 1
  )
  SELECT type, label, url, metadata FROM products
  UNION ALL
  SELECT type, label, url, metadata FROM categories
  UNION ALL
  SELECT type, label, url, metadata FROM brands
  LIMIT p_limit;
$$;
