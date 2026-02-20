-- 20260220_optimize_performance_advisor_part2.sql
-- Description: Applies the final set of Performance Advisor fixes 
-- specifically targeting the "Multiple Permissive RLS Policies" issue on cart_items and shopping_carts.

BEGIN;

-- cart_items: drop broad ALL policy if exists; create split write policies
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_modify_own') THEN
    EXECUTE 'DROP POLICY cart_items_modify_own ON public.cart_items';
END IF;
END $$;

DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_insert_own') THEN
    EXECUTE 'CREATE POLICY cart_items_insert_own ON public.cart_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())));';
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_update_own') THEN
    EXECUTE 'CREATE POLICY cart_items_update_own ON public.cart_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())));';
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_delete_own') THEN
    EXECUTE 'CREATE POLICY cart_items_delete_own ON public.cart_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())));';
END IF;
END $$;

-- shopping_carts: drop broad ALL policy; create split write policies
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_modify_own') THEN
    EXECUTE 'DROP POLICY shopping_carts_modify_own ON public.shopping_carts';
END IF;
END $$;

DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_insert_own') THEN
    EXECUTE 'CREATE POLICY shopping_carts_insert_own ON public.shopping_carts FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));';
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_update_own') THEN
    EXECUTE 'CREATE POLICY shopping_carts_update_own ON public.shopping_carts FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));';
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_delete_own') THEN
    EXECUTE 'CREATE POLICY shopping_carts_delete_own ON public.shopping_carts FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));';
END IF;
END $$;

COMMIT;
