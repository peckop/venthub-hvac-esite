BEGIN;

-- Cleanup multiple permissive policies (first wave): cart_items, shopping_carts, user_addresses
-- Strategy: if a merged_* policy exists for the same table/action, drop older duplicate select/insert/update/delete policies by name.
-- Idempotent and cautious: only drops when policy exists and (where applicable) only for specific polcmd (action).

DO $$
BEGIN
  -- CART_ITEMS (SELECT duplicates)
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='merged_cart_items_anon_select'
  ) OR EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='merged_cart_items_authenticated_select'
  ) THEN
    -- Drop SELECT-only duplicates if they exist
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_select_own' AND cmd='SELECT'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS cart_items_select_own ON public.cart_items';
    END IF;
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_modify_own' AND cmd='SELECT'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS cart_items_modify_own ON public.cart_items';
    END IF;
  END IF;

  -- SHOPPING_CARTS (SELECT duplicates)
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='merged_shopping_carts_anon_select'
  ) OR EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='merged_shopping_carts_authenticated_select'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_select_own' AND cmd='SELECT'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS shopping_carts_select_own ON public.shopping_carts';
    END IF;
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_modify_own' AND cmd='SELECT'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS shopping_carts_modify_own ON public.shopping_carts';
    END IF;
  END IF;

  -- USER_ADDRESSES (DELETE/INSERT/SELECT/UPDATE duplicates for authenticated)
  -- DELETE
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_addresses' AND policyname='merged_user_addresses_authenticated_delete'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_addresses' AND policyname='user_addresses_delete' AND cmd='DELETE'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS user_addresses_delete ON public.user_addresses';
    END IF;
  END IF;
  -- INSERT
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_addresses' AND policyname='merged_user_addresses_authenticated_insert'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_addresses' AND policyname='user_addresses_insert' AND cmd='INSERT'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS user_addresses_insert ON public.user_addresses';
    END IF;
  END IF;
  -- SELECT
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_addresses' AND policyname='merged_user_addresses_authenticated_select'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_addresses' AND policyname='user_addresses_select' AND cmd='SELECT'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS user_addresses_select ON public.user_addresses';
    END IF;
  END IF;
  -- UPDATE
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_addresses' AND policyname='merged_user_addresses_authenticated_update'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_addresses' AND policyname='user_addresses_update' AND cmd='UPDATE'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS user_addresses_update ON public.user_addresses';
    END IF;
  END IF;
END $$;

COMMIT;

