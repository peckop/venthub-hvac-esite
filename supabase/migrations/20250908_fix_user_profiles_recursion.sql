-- Fix infinite recursion in user_profiles RLS policies by avoiding subqueries on the same table
-- Created: 2025-09-08

-- Helper expression to read JWT role safely
-- Note: This reads the 'role' claim from the current request JWT
CREATE OR REPLACE FUNCTION public.jwt_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE( NULLIF(current_setting('request.jwt.claims', true), ''), '{}' )::jsonb ->> 'role'
$$;

-- Ensure RLS enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop recursive policies if they exist
DROP POLICY IF EXISTS user_profiles_select_admin ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update_admin ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;

-- Re-create safe policies
-- 1) Select own (keep)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_own'
  ) THEN
    CREATE POLICY user_profiles_select_own
      ON public.user_profiles FOR SELECT
      USING (id = auth.uid());
  END IF;
END $$;

-- 2) Select for admins via JWT claim (no subselects)
CREATE POLICY user_profiles_select_admin
  ON public.user_profiles FOR SELECT
  USING (
    public.jwt_role() IN ('admin','moderator')
  );

-- 3) Update own (allow if same user; prevent role escalation by requiring NEW.role equals JWT role)
CREATE POLICY user_profiles_update_own
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    (role IS NULL OR role = public.jwt_role())
  );

-- 4) Update for admins via JWT claim
CREATE POLICY user_profiles_update_admin
  ON public.user_profiles FOR UPDATE
  USING (public.jwt_role() IN ('admin','moderator'))
  WITH CHECK (public.jwt_role() IN ('admin','moderator'));

-- Note: Existing insert policies (insert_own, insert_service) remain unchanged
