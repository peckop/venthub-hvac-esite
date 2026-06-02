-- Migration: Security Hardening Fixes
-- Target: public.user_profiles, custom JWT auth hook, prevent self-elevation, internal auth checks, explicit function revocations
-- Created: 2026-06-02

BEGIN;

-- ==========================================
-- 1. R1 Fix (Cross-Tenant Leak)
-- ==========================================
DROP POLICY IF EXISTS user_profiles_select_policy ON public.user_profiles;
CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT TO authenticated
  USING ( tenant_id = public.jwt_tenant_id() AND (id = auth.uid() OR public.is_admin_user()) );


-- ==========================================
-- 2. R6 (Custom Access Token Auth Hook)
-- ==========================================
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  claims jsonb;
  user_role text;
  tenant_id_val text;
BEGIN
  -- Retrieve the user's role and tenant_id from the database user_profiles table
  SELECT role, tenant_id::text INTO user_role, tenant_id_val
  FROM public.user_profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Ensure app_metadata is not null
  IF (claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  END IF;

  -- Inject the role into JWT claims as user_role
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', '"user"'::jsonb);
    claims := jsonb_set(claims, '{app_metadata, user_role}', '"user"'::jsonb);
  END IF;

  -- Inject tenant_id into JWT claims as tenant_id (both root and app_metadata)
  IF tenant_id_val IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(tenant_id_val));
    claims := jsonb_set(claims, '{app_metadata, tenant_id}', to_jsonb(tenant_id_val));
  ELSE
    claims := jsonb_set(claims, '{tenant_id}', '"d3b07384-d113-495f-a558-8c38634e0000"'::jsonb);
    claims := jsonb_set(claims, '{app_metadata, tenant_id}', '"d3b07384-d113-495f-a558-8c38634e0000"'::jsonb);
  END IF;

  -- Put the modified claims back in the event
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Configure permissions for the Auth Hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON TABLE public.user_profiles TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM anon, authenticated, public;


-- ==========================================
-- 3. Prevent Role Self-Elevation Triggers
-- ==========================================
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

  -- Prevent role self-elevation
  IF NOT (auth.role() = 'service_role' OR public.is_admin_user()) THEN
    role_val := 'user';
  END IF;

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

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  resolved_tenant_id uuid;
  full_name_val text;
  role_val text;
BEGIN
  -- Extract resolved tenant_id from new.raw_app_meta_data
  resolved_tenant_id := (new.raw_app_meta_data ->> 'tenant_id')::uuid;
  
  -- Extract other metadata values
  full_name_val := new.raw_user_meta_data ->> 'full_name';
  role_val := COALESCE(new.raw_user_meta_data ->> 'role', 'user');

  -- Prevent role self-elevation
  IF NOT (auth.role() = 'service_role' OR public.is_admin_user()) THEN
    role_val := 'user';
  END IF;

  -- Insert or update public.user_profiles mapping
  INSERT INTO public.user_profiles (id, tenant_id, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    resolved_tenant_id,
    full_name_val,
    role_val,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    tenant_id = EXCLUDED.tenant_id,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN new;
END;
$$;


-- ==========================================
-- 4. Internal Authorization Checks (Defense-in-depth)
-- ==========================================

-- Drop functions before recreating to avoid parameter default / signature collision errors
DROP FUNCTION IF EXISTS public.set_user_admin_role(uuid, text);
DROP FUNCTION IF EXISTS public.adjust_stock(uuid, integer, text, uuid);
DROP FUNCTION IF EXISTS public.adjust_stock(uuid, integer, text);
DROP FUNCTION IF EXISTS public.set_stock(uuid, integer, text, uuid);
DROP FUNCTION IF EXISTS public.set_stock(uuid, integer, text);

-- set_user_admin_role
CREATE OR REPLACE FUNCTION public.set_user_admin_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF new_role NOT IN ('user','admin','moderator','superadmin', 'super_admin', 'warehouse', 'sales', 'viewer') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id) THEN
    INSERT INTO public.user_profiles (id, role) VALUES (user_id, new_role)
    ON CONFLICT (id) DO UPDATE SET role=new_role, updated_at=NOW();
  ELSE
    UPDATE public.user_profiles SET role=new_role, updated_at=NOW() WHERE id = user_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- adjust_stock(p_product_id, p_delta, p_reason, p_batch_id)
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id uuid,
  p_delta int,
  p_reason text,
  p_batch_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog, public'
AS $$
BEGIN
  IF NOT (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id)
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'), p_batch_id);
END;
$$;

-- adjust_stock(p_product_id, p_delta, p_reason)
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id uuid,
  p_delta int,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog, public'
AS $$
BEGIN
  IF NOT (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;
  
  INSERT INTO public.inventory_movements (product_id, delta, reason) 
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'));
END;
$$;

-- set_stock(p_product_id, p_new_qty, p_reason, p_batch_id)
CREATE OR REPLACE FUNCTION public.set_stock(
  p_product_id uuid,
  p_new_qty int,
  p_reason text,
  p_batch_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog, public'
AS $$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  IF NOT (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COALESCE(stock_qty, 0) INTO v_current 
  FROM public.products 
  WHERE id = p_product_id;

  v_delta := p_new_qty - v_current;
  IF v_delta = 0 THEN
    RETURN;
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, p_new_qty)
  WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id) 
  VALUES (p_product_id, v_delta, COALESCE(p_reason, 'set'), p_batch_id);
END;
$$;

-- set_stock(p_product_id, p_new_qty, p_reason)
CREATE OR REPLACE FUNCTION public.set_stock(
  p_product_id uuid,
  p_new_qty int,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog, public'
AS $$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  IF NOT (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COALESCE(stock_qty, 0) INTO v_current 
  FROM public.products 
  WHERE id = p_product_id;
  
  v_delta := p_new_qty - v_current;
  
  IF v_delta = 0 THEN
    RETURN;
  END IF;
  
  UPDATE public.products 
  SET stock_qty = GREATEST(0, p_new_qty)
  WHERE id = p_product_id;
  
  INSERT INTO public.inventory_movements (product_id, delta, reason) 
  VALUES (p_product_id, v_delta, COALESCE(p_reason, 'set'));
END;
$$;


-- ==========================================
-- 5. R7 Fix (Explicit Function Execution Revocation)
-- ==========================================

-- Revoke execution from public, anon, and authenticated explicitly for all 30 functions
REVOKE EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.adjust_stock_v2(uuid, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_list_all_users() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_role_change() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_admin_get_orders(text, text, text, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_admin_update_order_status(text, text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_products_enriched(uuid[], integer, integer, text, text, text, numeric, numeric) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_metadata() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_supabase_webhook() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_admin_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_staff_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_user_admin(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.jwt_tenant_id() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.process_order_stock_reduction(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_stock(uuid, integer, text, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_stock(uuid, integer, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_user_admin_role(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_inventory_settings(integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_inventory_thresholds(integer, boolean) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.user_invoice_profiles_ensure_single_default() FROM anon, authenticated, public;

-- Grant execution back to authenticated and anon ONLY for RLS helper functions
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.jwt_tenant_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_staff_user() TO authenticated, anon;

-- Grant execute to authenticated/service_role on other RPC functions as needed by application or admin actions
GRANT EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_stock(uuid, integer, text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_stock(uuid, integer, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_user_admin_role(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_products_enriched(uuid[], integer, integer, text, text, text, numeric, numeric) TO authenticated, anon, service_role;

COMMIT;
