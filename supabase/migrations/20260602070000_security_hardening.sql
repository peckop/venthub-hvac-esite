BEGIN;

-- ============================================================================
-- R1: User Profiles RLS Recursion Fix
-- ============================================================================
-- Redefine is_admin_user() to safely read role from JWT claims first (recursion-free)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- If service_role, bypass checks and return true
  IF auth.role() = 'service_role' THEN
    RETURN TRUE;
  END IF;

  -- Retrieve JWT claims from request context
  claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  
  IF claims IS NOT NULL THEN
    user_role := COALESCE(
      claims ->> 'user_role',
      claims -> 'app_metadata' ->> 'user_role',
      claims -> 'user_metadata' ->> 'role'
    );
    IF user_role IS NOT NULL THEN
      RETURN user_role IN ('admin', 'superadmin');
    END IF;
  END IF;

  -- Fallback to database lookup if claims are empty (e.g. backend script, triggers)
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin','superadmin')
  );
END;
$$;

-- Drop and recreate the user_profiles SELECT policy to use the non-recursive is_admin_user()
DROP POLICY IF EXISTS user_profiles_select_policy ON public.user_profiles;
CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT
  USING ( id = auth.uid() OR public.is_admin_user() );


-- ============================================================================
-- R2: GraphQL Schema Exposure Prevention
-- ============================================================================
-- 1. Tables with existing comments (Preserve and Append)
COMMENT ON TABLE public.user_profiles IS 'Kullanıcı profilleri ve rolleri | @graphql({"disabled": true})';
COMMENT ON TABLE public.wizard_selections IS 'Hava perdesi seçim wizard kaydları - hukuki koruma amaçlı | @graphql({"disabled": true})';
COMMENT ON TABLE public.venthub_orders IS 'Payment system fixed on 2025-09-03 - all required columns added | @graphql({"disabled": true})';
COMMENT ON TABLE public.venthub_order_items IS 'Order items schema fixed on 2025-09-03 - optional fields made nullable | @graphql({"disabled": true})';
COMMENT ON VIEW public.admin_users IS 'Admin ve moderatör kullanıcıları listesi | @graphql({"disabled": true})';

-- 2. Tables without existing comments (Directly Disable)
COMMENT ON TABLE public.admin_audit_log IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.cart_items IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.category_mapping_rules IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.client_errors IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.contact_messages IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.coupons IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.error_groups IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.inventory_movements IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.inventory_settings IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.order_attachments IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.order_email_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.order_notes IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.order_refund_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.organizations IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.payment_transactions IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.product_authorities IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.project_items IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.rate_limits IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.returns_webhook_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.shipping_email_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.shipping_idempotency IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.shipping_webhook_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.shopping_carts IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.site_settings IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.user_addresses IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.user_invoice_profiles IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.user_projects IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.venthub_returns IS '@graphql({"disabled": true})';


-- ============================================================================
-- R3 & R4: Storage Policy Hardening & Obsolete Policy Drop
-- ============================================================================
-- Drop permissive public/authenticated read/upload policies on product-images bucket
DROP POLICY IF EXISTS product_images_read_public ON storage.objects;
DROP POLICY IF EXISTS product_images_select_tenant ON storage.objects;
DROP POLICY IF EXISTS product_images_insert_authenticated ON storage.objects;

-- Recreate the SELECT policy to target authenticated roles only, fix the name shadowing bug,
-- and enforce user membership validation against the active tenant.
CREATE POLICY product_images_select_tenant ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/')
    AND split_part(name, '/', 1)::uuid = public.jwt_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.tenant_id = public.jwt_tenant_id()
    )
  );


-- ============================================================================
-- R5a: Search Path Lock for Webhook Trigger Function
-- ============================================================================
ALTER FUNCTION public.handle_supabase_webhook() SET search_path = pg_catalog, public, net;


-- ============================================================================
-- R6: Custom Auth JWT Hook
-- ============================================================================
-- Update handle_new_user_metadata() to populate user_role and tenant_id claims
CREATE OR REPLACE FUNCTION public.handle_new_user_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  tenant_id_raw text;
  resolved_tenant_id uuid;
  role_val text;
BEGIN
  -- Extract tenant_id from raw_user_meta_data
  tenant_id_raw := new.raw_user_meta_data ->> 'tenant_id';
  
  -- Safe block to parse and check tenant_id validity in the tenants table
  BEGIN
    IF tenant_id_raw IS NOT NULL THEN
      SELECT id INTO resolved_tenant_id FROM public.tenants WHERE id = tenant_id_raw::uuid AND is_active = true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    resolved_tenant_id := NULL;
  END;

  -- Default to 'd3b07384-d113-495f-a558-8c38634e0000' if not found or invalid
  IF resolved_tenant_id IS NULL THEN
    resolved_tenant_id := 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
  END IF;

  -- Extract role from metadata, default to 'user'
  role_val := COALESCE(new.raw_user_meta_data ->> 'role', 'user');

  -- Inject tenant_id and user_role into raw_app_meta_data so they are included in JWT claims
  new.raw_app_meta_data := jsonb_set(
    COALESCE(new.raw_app_meta_data, '{}'::jsonb),
    '{tenant_id}',
    to_jsonb(resolved_tenant_id::text)
  );
  new.raw_app_meta_data := jsonb_set(
    new.raw_app_meta_data,
    '{user_role}',
    to_jsonb(role_val)
  );

  -- Also set tenant_id and user_role in raw_user_meta_data
  new.raw_user_meta_data := jsonb_set(
    COALESCE(new.raw_user_meta_data, '{}'::jsonb),
    '{tenant_id}',
    to_jsonb(resolved_tenant_id::text)
  );
  new.raw_user_meta_data := jsonb_set(
    new.raw_user_meta_data,
    '{role}',
    to_jsonb(role_val)
  );

  RETURN new;
END;
$$;


-- ============================================================================
-- R7: Function Execution Revocation
-- ============================================================================
-- Revoke execution from public for all 30 security definer functions
REVOKE EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text) FROM public;
REVOKE EXECUTE ON FUNCTION public.adjust_stock_v2(uuid, integer) FROM public;
REVOKE EXECUTE ON FUNCTION public.admin_list_all_users() FROM public;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM public;
REVOKE EXECUTE ON FUNCTION public.enforce_role_change() FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_admin_get_orders(text, text, text, integer) FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_admin_update_order_status(text, text, text) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM public;
REVOKE EXECUTE ON FUNCTION public.get_products_enriched(uuid[], integer, integer, text, text, text, numeric, numeric) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_metadata() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_supabase_webhook() FROM public;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(text) FROM public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
REVOKE EXECUTE ON FUNCTION public.is_admin_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.is_staff_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.is_user_admin(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.jwt_tenant_id() FROM public;
REVOKE EXECUTE ON FUNCTION public.process_order_stock_reduction(text) FROM public;
REVOKE EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid, integer) FROM public;
REVOKE EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.set_stock(uuid, integer, text, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.set_stock(uuid, integer, text) FROM public;
REVOKE EXECUTE ON FUNCTION public.set_user_admin_role(uuid, text) FROM public;
REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, text) FROM public;
REVOKE EXECUTE ON FUNCTION public.update_inventory_settings(integer) FROM public;
REVOKE EXECUTE ON FUNCTION public.update_inventory_thresholds(integer, boolean) FROM public;
REVOKE EXECUTE ON FUNCTION public.user_invoice_profiles_ensure_single_default() FROM public;

-- Grant EXECUTE back to authenticated and anon for the functions used in RLS policies or context resolution
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.jwt_tenant_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_staff_user() TO authenticated, anon;


-- ============================================================================
-- R9: Drop Obsolete Debug Functions
-- ============================================================================
DROP FUNCTION IF EXISTS public.debug_context();
DROP FUNCTION IF EXISTS public.debug_policies_product_images();


-- ============================================================================
-- R10: Restrict Anon SELECT Privileges
-- ============================================================================
-- Revoke SELECT privilege from anon on the 36 sensitive tables and views
REVOKE SELECT ON TABLE public.admin_audit_log FROM anon;
REVOKE SELECT ON TABLE public.admin_users FROM anon;
REVOKE SELECT ON TABLE public.cart_items FROM anon;
REVOKE SELECT ON TABLE public.category_mapping_rules FROM anon;
REVOKE SELECT ON TABLE public.client_errors FROM anon;
REVOKE SELECT ON TABLE public.contact_messages FROM anon;
REVOKE SELECT ON TABLE public.coupons FROM anon;
REVOKE SELECT ON TABLE public.error_groups FROM anon;
REVOKE SELECT ON TABLE public.inventory_movements FROM anon;
REVOKE SELECT ON TABLE public.inventory_settings FROM anon;
REVOKE SELECT ON TABLE public.inventory_summary FROM anon;
REVOKE SELECT ON TABLE public.inventory_velocity FROM anon;
REVOKE SELECT ON TABLE public.order_attachments FROM anon;
REVOKE SELECT ON TABLE public.order_email_events FROM anon;
REVOKE SELECT ON TABLE public.order_notes FROM anon;
REVOKE SELECT ON TABLE public.order_refund_events FROM anon;
REVOKE SELECT ON TABLE public.organizations FROM anon;
REVOKE SELECT ON TABLE public.payment_transactions FROM anon;
REVOKE SELECT ON TABLE public.product_authorities FROM anon;
REVOKE SELECT ON TABLE public.project_items FROM anon;
REVOKE SELECT ON TABLE public.rate_limits FROM anon;
REVOKE SELECT ON TABLE public.returns_webhook_events FROM anon;
REVOKE SELECT ON TABLE public.shipping_email_events FROM anon;
REVOKE SELECT ON TABLE public.shipping_idempotency FROM anon;
REVOKE SELECT ON TABLE public.shipping_webhook_events FROM anon;
REVOKE SELECT ON TABLE public.shopping_carts FROM anon;
REVOKE SELECT ON TABLE public.site_settings FROM anon;
REVOKE SELECT ON TABLE public.user_addresses FROM anon;
REVOKE SELECT ON TABLE public.user_invoice_profiles FROM anon;
REVOKE SELECT ON TABLE public.user_profiles FROM anon;
REVOKE SELECT ON TABLE public.user_projects FROM anon;
REVOKE SELECT ON TABLE public.venthub_order_items FROM anon;
REVOKE SELECT ON TABLE public.venthub_orders FROM anon;
REVOKE SELECT ON TABLE public.venthub_returns FROM anon;
REVOKE SELECT ON TABLE public.view_admin_orders FROM anon;
REVOKE SELECT ON TABLE public.wizard_selections FROM anon;

COMMIT;
