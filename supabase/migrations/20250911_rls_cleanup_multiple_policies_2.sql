BEGIN;

-- RLS cleanup (wave 2): drop duplicate SELECT policies when merged_*_select exists
-- Safe mode: only SELECT (polcmd='r'), only specific "*_select_own" / "*_select_self" names.

DO $$
BEGIN
  -- USER_PROFILES (SELECT): drop *_select_own and *_select_self if merged_user_profiles_authenticated_select exists
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='merged_user_profiles_authenticated_select'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_own' AND polcmd='r'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS user_profiles_select_own ON public.user_profiles';
    END IF;
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_self' AND polcmd='r'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS user_profiles_select_self ON public.user_profiles';
    END IF;
    -- Not dropping user_profiles_select_admin (admin semantics)
  END IF;

  -- VENTHUB_ORDER_ITEMS (SELECT): drop select_own_order_items if merged exists
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_order_items' AND policyname='merged_venthub_order_items_authenticated_select'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_order_items' AND policyname='select_own_order_items' AND polcmd='r'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS select_own_order_items ON public.venthub_order_items';
    END IF;
  END IF;

  -- VENTHUB_RETURNS (SELECT): drop returns_select_own if merged exists (returns_select_admin tutulur)
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='merged_venthub_returns_authenticated_select'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='returns_select_own' AND polcmd='r'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS returns_select_own ON public.venthub_returns';
    END IF;
  END IF;
END $$;

COMMIT;

