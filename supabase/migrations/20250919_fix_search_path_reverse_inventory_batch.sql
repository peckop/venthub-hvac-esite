-- Harden search_path for reverse_inventory_batch
BEGIN;
ALTER FUNCTION IF EXISTS public.reverse_inventory_batch(uuid, integer) SET search_path = pg_catalog, public;
COMMIT;
