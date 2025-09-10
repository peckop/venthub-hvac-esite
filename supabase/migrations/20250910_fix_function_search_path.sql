-- 20250910_fix_function_search_path.sql
-- Purpose: Set secure search_path for functions flagged by Advisor (role mutable search_path)
-- Approach: Dynamically ALTER FUNCTION ... SET search_path = 'public, pg_temp' for specific functions if they exist.
-- Generated: 2025-09-10

BEGIN;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_catalog.pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'normalize_product_threshold_overrides',
        'set_user_role',
        'is_user_admin',
        'get_user_role',
        'jwt_role',
        'generate_order_number',
        'set_order_number',
        'is_admin_user',
        'get_admin_users',
        'sync_payment_status_with_status',
        'process_order_stock_reduction',
        'update_updated_at_column',
        'set_stock',
        'adjust_stock',
        'update_user_profiles_updated_at',
        'set_user_admin_role',
        'increment_error_group_count',
        'set_updated_at'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp;',
                   r.schema_name, r.function_name, r.args);
  END LOOP;
END $$;

COMMIT;

