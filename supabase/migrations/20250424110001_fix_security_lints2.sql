-- =============================================================================
-- Migration: Fix Remaining Security Lints
-- Date: 2026-04-08
-- Description: Replaces auth.uid() with (SELECT auth.uid()) across other missed RLS
-- policies to trigger initplan caching and reduce execution times.
-- =============================================================================

BEGIN;

DROP POLICY IF EXISTS "Users can read own cart items" ON public.cart_items;
CREATE POLICY "Users can read own cart items"
    ON public.cart_items FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart_items;
CREATE POLICY "Users can insert own cart items"
    ON public.cart_items FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
CREATE POLICY "Users can update own cart items"
    ON public.cart_items FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;
CREATE POLICY "Users can delete own cart items"
    ON public.cart_items FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can read own shopping carts" ON public.shopping_carts;
CREATE POLICY "Users can read own shopping carts"
    ON public.shopping_carts FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own shopping carts" ON public.shopping_carts;
CREATE POLICY "Users can insert own shopping carts"
    ON public.shopping_carts FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own shopping carts" ON public.shopping_carts;
CREATE POLICY "Users can update own shopping carts"
    ON public.shopping_carts FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own shopping carts" ON public.shopping_carts;
CREATE POLICY "Users can delete own shopping carts"
    ON public.shopping_carts FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid()));

COMMIT;
