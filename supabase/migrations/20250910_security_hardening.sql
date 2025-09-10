-- 20250910_security_hardening.sql
-- Purpose: Fix Supabase database linter security findings
-- - Remove exposure of auth.users via public.admin_users view
-- - Provide safe admin_list_users() RPC with role check
-- - Set inventory-related views to security_invoker=true
-- Generated: 2025-09-10

BEGIN;

-- 1) admin_users view: remove exposure to anon/authenticated and enforce invoker semantics
DO $$
BEGIN
  -- REVOKE selects if previously granted
  PERFORM 1
  FROM information_schema.table_privileges
  WHERE table_schema='public' AND table_name='admin_users' AND privilege_type='SELECT';
  -- Revoke from anon/authenticated explicitly (ignore errors if roles not present)
  BEGIN
    REVOKE SELECT ON public.admin_users FROM authenticated;
  EXCEPTION WHEN undefined_object THEN
    -- role may not exist in this context; ignore
    NULL;
  END;
  BEGIN
    REVOKE SELECT ON public.admin_users FROM anon;
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;
EXCEPTION WHEN undefined_table THEN
  -- View might not exist yet; ignore
  NULL;
END $$;

-- Ensure the view runs with invoker privileges (not definer)
DO $$
BEGIN
  PERFORM 1 FROM pg_views WHERE schemaname='public' AND viewname='admin_users';
  IF FOUND THEN
    ALTER VIEW public.admin_users SET (security_invoker = on);
  END IF;
END $$;

-- 2) Safe RPC for listing admin/moderator users
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  role text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only allow admins/moderators to execute successfully
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id, u.email, up.full_name, up.phone, up.role, up.created_at, up.updated_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  WHERE up.role IN ('admin','moderator')
  ORDER BY up.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- 3) Inventory-related views should run with invoker semantics
DO $$
BEGIN
  PERFORM 1 FROM pg_views WHERE schemaname='public' AND viewname='reserved_orders';
  IF FOUND THEN
    ALTER VIEW public.reserved_orders SET (security_invoker = on);
  END IF;
END $$;

DO $$
BEGIN
  PERFORM 1 FROM pg_views WHERE schemaname='public' AND viewname='inventory_summary';
  IF FOUND THEN
    ALTER VIEW public.inventory_summary SET (security_invoker = on);
  END IF;
END $$;

COMMIT;

