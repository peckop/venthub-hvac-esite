-- Migration: Security Hardening Null-Safe Fixes
-- Target: Redefine 7 database functions to use COALESCE(auth.role(), '') = 'service_role'
-- Created: 2026-06-02

BEGIN;

-- 1. handle_new_user_metadata()
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

  -- Prevent role self-elevation using COALESCE for null-safety
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR public.is_admin_user()) THEN
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


-- 2. handle_new_user_profile()
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

  -- Prevent role self-elevation using COALESCE for null-safety
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR public.is_admin_user()) THEN
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


-- 3. set_user_admin_role(user_id UUID, new_role TEXT)
CREATE OR REPLACE FUNCTION public.set_user_admin_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
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


-- 4. adjust_stock(p_product_id, p_delta, p_reason, p_batch_id)
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
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
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


-- 5. adjust_stock(p_product_id, p_delta, p_reason)
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
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
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


-- 6. set_stock(p_product_id, p_new_qty, p_reason, p_batch_id)
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
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
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


-- 7. set_stock(p_product_id, p_new_qty, p_reason)
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
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
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

COMMIT;
