BEGIN;

-- USER_PROFILES: merged policies for authenticated; clean duplicates; align service insert
DO $$
BEGIN
  -- SELECT (authenticated: own or admin)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='merged_user_profiles_authenticated_select'
  ) THEN
    EXECUTE $$
      CREATE POLICY merged_user_profiles_authenticated_select
      ON public.user_profiles
      FOR SELECT TO authenticated
      USING ( id = auth.uid() OR public.jwt_role() IN ('admin','superadmin') );
    $$;
  END IF;

  -- INSERT (authenticated: own or admin)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='merged_user_profiles_authenticated_insert'
  ) THEN
    EXECUTE $$
      CREATE POLICY merged_user_profiles_authenticated_insert
      ON public.user_profiles
      FOR INSERT TO authenticated
      WITH CHECK ( id = auth.uid() OR public.jwt_role() IN ('admin','superadmin') );
    $$;
  END IF;

  -- UPDATE (authenticated: own or admin)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='merged_user_profiles_authenticated_update'
  ) THEN
    EXECUTE $$
      CREATE POLICY merged_user_profiles_authenticated_update
      ON public.user_profiles
      FOR UPDATE TO authenticated
      USING ( id = auth.uid() OR public.jwt_role() IN ('admin','superadmin') )
      WITH CHECK ( id = auth.uid() OR public.jwt_role() IN ('admin','superadmin') );
    $$;
  END IF;

  -- Ensure service insert exists for system writes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_service_insert'
  ) THEN
    EXECUTE $$
      CREATE POLICY user_profiles_service_insert
      ON public.user_profiles
      FOR INSERT TO service_role
      WITH CHECK (true);
    $$;
  END IF;

  -- If historical service insert policy exists, make sure it's assigned to service_role
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_insert_service'
  ) THEN
    EXECUTE 'ALTER POLICY user_profiles_insert_service ON public.user_profiles TO service_role';
  END IF;

  -- Drop older duplicates (safe: only if present)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_self') THEN
    EXECUTE 'DROP POLICY user_profiles_select_self ON public.user_profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_own') THEN
    EXECUTE 'DROP POLICY user_profiles_select_own ON public.user_profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_admin') THEN
    EXECUTE 'DROP POLICY user_profiles_select_admin ON public.user_profiles';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_insert_self') THEN
    EXECUTE 'DROP POLICY user_profiles_insert_self ON public.user_profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_insert_own') THEN
    EXECUTE 'DROP POLICY user_profiles_insert_own ON public.user_profiles';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_update_self') THEN
    EXECUTE 'DROP POLICY user_profiles_update_self ON public.user_profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_update_own') THEN
    EXECUTE 'DROP POLICY user_profiles_update_own ON public.user_profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_update_admin') THEN
    EXECUTE 'DROP POLICY user_profiles_update_admin ON public.user_profiles';
  END IF;
END$$;

-- VENTHUB_RETURNS: rely on merged_* for authenticated; align service policies
DO $$
BEGIN
  -- Ensure service policies are scoped to service_role (not authenticated)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='returns_update_service') THEN
    EXECUTE 'ALTER POLICY returns_update_service ON public.venthub_returns TO service_role';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='returns_delete_service') THEN
    EXECUTE 'ALTER POLICY returns_delete_service ON public.venthub_returns TO service_role';
  END IF;

  -- If merged authenticated policies exist, drop redundant specific ones
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='merged_venthub_returns_authenticated_select') THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='returns_select_admin') THEN
      EXECUTE 'DROP POLICY returns_select_admin ON public.venthub_returns';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='returns_select_own') THEN
      EXECUTE 'DROP POLICY returns_select_own ON public.venthub_returns';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='merged_venthub_returns_authenticated_insert') THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='returns_insert_own_order') THEN
      EXECUTE 'DROP POLICY returns_insert_own_order ON public.venthub_returns';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='merged_venthub_returns_authenticated_update') THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='returns_update_admin') THEN
      EXECUTE 'DROP POLICY returns_update_admin ON public.venthub_returns';
    END IF;
  END IF;

  -- delete: keep service delete for system ops; merged auth delete handles users
END$$;

COMMIT;