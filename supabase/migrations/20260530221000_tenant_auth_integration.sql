-- Migration: Supabase Auth Claims & Profile Integration Triggers
-- Created: 2026-05-30 22:10:00
-- Target: auth.users triggers to inject tenant_id claims and sync with public.user_profiles

-- PART 1: handle_new_user_metadata trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  tenant_id_raw text;
  resolved_tenant_id uuid;
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

  -- Inject tenant_id into raw_app_meta_data so it is included in JWT claims
  new.raw_app_meta_data := jsonb_set(
    COALESCE(new.raw_app_meta_data, '{}'::jsonb),
    '{tenant_id}',
    to_jsonb(resolved_tenant_id::text)
  );

  -- Also set tenant_id in raw_user_meta_data
  new.raw_user_meta_data := jsonb_set(
    COALESCE(new.raw_user_meta_data, '{}'::jsonb),
    '{tenant_id}',
    to_jsonb(resolved_tenant_id::text)
  );

  RETURN new;
END;
$$;

-- Bind the metadata handler trigger BEFORE INSERT on auth.users
DROP TRIGGER IF EXISTS trg_handle_new_user_metadata ON auth.users;
CREATE TRIGGER trg_handle_new_user_metadata
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_metadata();


-- PART 2: handle_new_user_profile trigger function
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

-- Bind the profile handler trigger AFTER INSERT on auth.users
DROP TRIGGER IF EXISTS trg_handle_new_user_profile ON auth.users;
CREATE TRIGGER trg_handle_new_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();
