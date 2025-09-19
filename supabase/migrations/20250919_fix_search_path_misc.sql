-- Harden search_path for remaining functions flagged by Advisor
BEGIN;
ALTER FUNCTION IF EXISTS public.enforce_role_change() SET search_path = pg_catalog, public;
ALTER FUNCTION IF EXISTS public.bump_rate_limit(text, int, int) SET search_path = pg_catalog, public;
ALTER FUNCTION IF EXISTS public.update_updated_at_column() SET search_path = pg_catalog, public;
COMMIT;
