-- 20260220_restore_select_policies.sql
-- Description: Restores SELECT policies that were inadvertently dropped during performance optimizations.

BEGIN;

-- 1. RESTORE CATEGORY READ ACCESS TO EVERYONE
DROP POLICY IF EXISTS "categories_public_select" ON public.categories;
CREATE POLICY "categories_public_select"
ON public.categories FOR SELECT
USING (true);

-- 2. RESTORE SHOPPING CART READ ACCESS TO OWNERS
DROP POLICY IF EXISTS "shopping_carts_select_own" ON public.shopping_carts;
CREATE POLICY "shopping_carts_select_own"
ON public.shopping_carts FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- 3. RESTORE CART ITEMS READ ACCESS TO CART OWNERS
DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
CREATE POLICY "cart_items_select_own"
ON public.cart_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shopping_carts c
    WHERE c.id = cart_items.cart_id
    AND c.user_id = (SELECT auth.uid())
  )
);

COMMIT;
