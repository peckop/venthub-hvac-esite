-- =============================================================================
-- VentHub: Sentinel Batch Sweep - Security Definer Hardening
-- Target: SECURITY DEFINER functions missing SET search_path = public, extensions
-- Reason: Prevent search_path privilege escalation attacks
-- =============================================================================

BEGIN;

-- From 20250911_rbac_superadmin.sql
ALTER FUNCTION public.is_user_admin(UUID) SET search_path = public, extensions;
ALTER FUNCTION public.is_admin_user() SET search_path = public, extensions;
ALTER FUNCTION public.set_user_admin_role(UUID, TEXT) SET search_path = public, extensions;

-- From 20250915152500_admin_coupons_notes_attachments.sql
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, extensions;

-- From 20250914_enforce_role_change_self_protect.sql
ALTER FUNCTION public.enforce_role_change() SET search_path = public, extensions;

-- From 20250902_create_stock_rpc_functions.sql
ALTER FUNCTION public.get_product_stock(UUID) SET search_path = public, extensions;
ALTER FUNCTION public.check_stock_availability(UUID, INTEGER) SET search_path = public, extensions;

-- From 20250902_fix_stock_reduction_uuid.sql
ALTER FUNCTION public.reduce_product_stock(UUID, INTEGER) SET search_path = public, extensions;

-- From 20250903_role_based_admin_system.sql
ALTER FUNCTION public.get_user_role() SET search_path = public, extensions;

-- From 20250919_inventory_batch_window.sql
ALTER FUNCTION public.process_inventory_batch(UUID) SET search_path = public, extensions;

-- From 20250902_order_stock_deduction.sql
ALTER FUNCTION public.deduct_order_stock(UUID) SET search_path = public, extensions;

-- From 20250902_inventory_and_stock.sql
ALTER FUNCTION public.increase_product_stock(UUID, INTEGER) SET search_path = public, extensions;

COMMIT;
