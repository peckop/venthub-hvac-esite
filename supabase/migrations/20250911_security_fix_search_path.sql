BEGIN;

-- Fix Advisor: function_search_path_mutable for SECURITY DEFINER / helper functions
-- Ensure functions use a safe, deterministic search_path

-- is_user_admin(user_id uuid) RETURNS boolean
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND role IN ('admin','superadmin')
  );
END;
$$;

-- is_admin_user() RETURNS boolean (current user)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin','superadmin')
  );
END;
$$;

-- set_user_admin_role(user_id uuid, new_role text) RETURNS boolean
CREATE OR REPLACE FUNCTION public.set_user_admin_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF new_role NOT IN ('user','admin','moderator','superadmin') THEN
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

-- _normalize_rls_expr(expr text) RETURNS text
-- Retain chosen implementation (latest plpgsql version) and set search_path.
CREATE OR REPLACE FUNCTION public._normalize_rls_expr(expr text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  s text;
BEGIN
  IF expr IS NULL THEN RETURN NULL; END IF;
  s := expr;

  -- unwrap existing wrappers
  s := replace(s, '(select auth.uid())', 'auth.uid()');
  s := replace(s, '(SELECT auth.uid())', 'auth.uid()');
  s := replace(s, '(select auth.role())', 'auth.role()');
  s := replace(s, '(SELECT auth.role())', 'auth.role()');
  s := replace(s, '(select auth.jwt())', 'auth.jwt()');
  s := replace(s, '(SELECT auth.jwt())', 'auth.jwt()');
  s := replace(s, '(select public.jwt_role())', 'public.jwt_role()');
  s := replace(s, '(SELECT public.jwt_role())', 'public.jwt_role()');
  s := replace(s, '(select current_setting(''request.jwt.claims''))', 'current_setting(''request.jwt.claims'')');
  s := replace(s, '(SELECT current_setting(''request.jwt.claims''))', 'current_setting(''request.jwt.claims'')');

  -- normalize current_setting variants
  s := replace(s, 'current_setting(''request.jwt.claims''::text, true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text,true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text, FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text,FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'', true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'',true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'', FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'',FALSE)', 'current_setting(''request.jwt.claims'')');

  -- re-wrap
  s := replace(s, 'auth.uid()', '(select auth.uid())');
  s := replace(s, 'auth.role()', '(select auth.role())');
  s := replace(s, 'auth.jwt()', '(select auth.jwt())');
  s := replace(s, 'public.jwt_role()', '(select public.jwt_role())');
  s := replace(s, 'current_setting(''request.jwt.claims'')', '(select current_setting(''request.jwt.claims''))');

  RETURN s;
END
$$;

COMMIT;

