import os
import requests
import json
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load env vars
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_KEY:
    logger.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

def apply_migration():
    migration_file = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'migrations', '20251128_fts_technical_specs.sql')
    
    with open(migration_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Split into statements (rough split by ;)
    # Note: This is a simple splitter, might break on complex PL/PGSQL. 
    # But the migration file mainly has CREATE INDEX and CREATE FUNCTION.
    # The CREATE FUNCTION uses $$ so ; inside it shouldn't be split.
    # A better way is to send the whole thing if the RPC supports it, or use the `exec_sql` format if known.
    # Based on run-sql-curl.sh, it expects "statements" array.
    
    # Let's try sending the whole content as one statement first, or split intelligently.
    # The run-sql-curl.sh example sends a list of statements.
    
    # For this specific migration, we have:
    # 1. DROP INDEX
    # 2. CREATE INDEX
    # 3. CREATE FUNCTION
    
    # We can manually define the statements to be safe.
    
    statements = [
        "DROP INDEX IF EXISTS public.idx_products_fts_tr;",
        
        """CREATE INDEX idx_products_fts_tr_enhanced ON public.products USING gin (
          to_tsvector('turkish', 
            coalesce(name,'') || ' ' || 
            coalesce(model_code,'') || ' ' || 
            coalesce(sku,'') || ' ' || 
            coalesce(brand,'') || ' ' ||
            coalesce(description,'') || ' ' ||
            coalesce(technical_specs::text,'')
          )
        );""",
        
        """CREATE OR REPLACE FUNCTION public.fts_search_products(
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
        $$;"""
    ]
    
    # Join statements into one block for exec function
    full_sql = "\n".join(statements)
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec"
    headers = {
        "Authorization": f"Bearer {SERVICE_KEY}",
        "apikey": SERVICE_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "query": full_sql
    }
    
    logger.info(f"Executing migration via RPC: {url}")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        logger.info("Migration applied successfully!")
        logger.info(response.text)
    else:
        logger.error(f"Failed to apply migration: {response.status_code}")
        logger.error(response.text)
        # If exec doesn't exist, try asking user
        if response.status_code == 404:
             logger.error("RPC 'exec' not found. Please run 'supabase db push' manually.")
        exit(1)

if __name__ == "__main__":
    apply_migration()
