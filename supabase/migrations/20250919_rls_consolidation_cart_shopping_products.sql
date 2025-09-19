BEGIN;

-- CART_ITEMS: consolidate RLS by replacing broad FOR ALL policy with separate write policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_modify_own') THEN
    EXECUTE 'DROP POLICY cart_items_modify_own ON public.cart_items';
  END IF;

  -- INSERT own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_insert_own') THEN
    EXECUTE $$
      CREATE POLICY cart_items_insert_own
      ON public.cart_items
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.shopping_carts c
          WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
        )
      );
    $$;
  END IF;

  -- UPDATE own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_update_own') THEN
    EXECUTE $$
      CREATE POLICY cart_items_update_own
      ON public.cart_items
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.shopping_carts c
          WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.shopping_carts c
          WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
        )
      );
    $$;
  END IF;

  -- DELETE own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_delete_own') THEN
    EXECUTE $$
      CREATE POLICY cart_items_delete_own
      ON public.cart_items
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.shopping_carts c
          WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
        )
      );
    $$;
  END IF;
END$$;

-- SHOPPING_CARTS: consolidate RLS similarly
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_modify_own') THEN
    EXECUTE 'DROP POLICY shopping_carts_modify_own ON public.shopping_carts';
  END IF;

  -- INSERT own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_insert_own') THEN
    EXECUTE $$
      CREATE POLICY shopping_carts_insert_own
      ON public.shopping_carts
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
    $$;
  END IF;

  -- UPDATE own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_update_own') THEN
    EXECUTE $$
      CREATE POLICY shopping_carts_update_own
      ON public.shopping_carts
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
    $$;
  END IF;

  -- DELETE own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_delete_own') THEN
    EXECUTE $$
      CREATE POLICY shopping_carts_delete_own
      ON public.shopping_carts
      FOR DELETE TO authenticated
      USING (user_id = auth.uid());
    $$;
  END IF;
END$$;

-- PRODUCTS: drop legacy duplicate update policy if the newer one exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='products_update_admin_only')
     AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='products_update_admin_stock') THEN
    EXECUTE 'DROP POLICY products_update_admin_stock ON public.products';
  END IF;
END$$;

COMMIT;