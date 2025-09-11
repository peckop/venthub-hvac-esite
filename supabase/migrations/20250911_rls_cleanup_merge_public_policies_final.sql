BEGIN;

-- Merge INSERT policies for user_profiles into a single permissive policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_insert_merged'
  ) THEN
    EXECUTE $$
      CREATE POLICY user_profiles_insert_merged ON public.user_profiles
      FOR INSERT TO public
      WITH CHECK (
        (id = auth.uid() AND (role IS NULL OR role = 'user'))
        OR (auth.role() = 'service_role')
      )
    $$;
  END IF;
END $$;

-- Drop older duplicate INSERT policies (idempotent)
DROP POLICY IF EXISTS user_profiles_insert_service ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_own ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_self ON public.user_profiles;

-- Merge UPDATE policies for user_profiles into a single permissive policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_update_merged'
  ) THEN
    EXECUTE $$
      CREATE POLICY user_profiles_update_merged ON public.user_profiles
      FOR UPDATE TO public
      USING (
        (id = auth.uid()) OR ((SELECT jwt_role()) = ANY (ARRAY['admin','moderator','superadmin']))
      )
      WITH CHECK (
        ((id = auth.uid()) AND ((role IS NULL) OR (role::text = jwt_role())))
        OR ((SELECT jwt_role()) = ANY (ARRAY['admin','moderator','superadmin']))
      )
    $$;
  END IF;
END $$;

-- Drop older duplicate UPDATE policies (idempotent)
DROP POLICY IF EXISTS user_profiles_update_self ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update_admin ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;

-- Merge UPDATE policies for venthub_returns into a single permissive policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='venthub_returns_update_merged'
  ) THEN
    EXECUTE $$
      CREATE POLICY venthub_returns_update_merged ON public.venthub_returns
      FOR UPDATE TO public
      USING ( (auth.role() = 'service_role') OR is_admin_user() )
      WITH CHECK ( (auth.role() = 'service_role') OR is_admin_user() )
    $$;
  END IF;
END $$;

-- Drop older duplicate UPDATE policies (idempotent)
DROP POLICY IF EXISTS returns_update_service ON public.venthub_returns;
DROP POLICY IF EXISTS returns_update_admin ON public.venthub_returns;

COMMIT;

