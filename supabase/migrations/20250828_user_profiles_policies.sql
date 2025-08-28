-- RLS and policies for user_profiles: allow authenticated users to manage their own row
-- Idempotent policies

-- Ensure RLS is enabled (no-op if already enabled)
DO $$
BEGIN
  EXECUTE 'ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN
  -- ignore
  NULL;
END
$$;

-- SELECT own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_self'
  ) THEN
    CREATE POLICY user_profiles_select_self
    ON public.user_profiles
    FOR SELECT
    USING (id = auth.uid());
  END IF;
END
$$;

-- INSERT self profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_insert_self'
  ) THEN
    CREATE POLICY user_profiles_insert_self
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());
  END IF;
END
$$;

-- UPDATE own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_update_self'
  ) THEN
    CREATE POLICY user_profiles_update_self
    ON public.user_profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
  END IF;
END
$$;
