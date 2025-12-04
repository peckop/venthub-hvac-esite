-- Fix Remaining Performance Lints: Drop merged policies and fix cart_items

-- 1. cart_items
DROP POLICY IF EXISTS cart_items_delete_own ON public.cart_items;
DROP POLICY IF EXISTS cart_items_insert_own ON public.cart_items;
DROP POLICY IF EXISTS cart_items_update_own ON public.cart_items;
DROP POLICY IF EXISTS cart_items_select_own ON public.cart_items;
DROP POLICY IF EXISTS merged_cart_items_authenticated_delete ON public.cart_items;
DROP POLICY IF EXISTS merged_cart_items_authenticated_insert ON public.cart_items;
DROP POLICY IF EXISTS merged_cart_items_authenticated_update ON public.cart_items;

CREATE POLICY cart_items_policy ON public.cart_items
  USING ( (SELECT auth.uid()) = (SELECT user_id FROM public.shopping_carts WHERE id = cart_id) OR (SELECT auth.role()) = 'service_role' )
  WITH CHECK ( (SELECT auth.uid()) = (SELECT user_id FROM public.shopping_carts WHERE id = cart_id) OR (SELECT auth.role()) = 'service_role' );

-- 2. shopping_carts (Drop merged)
DROP POLICY IF EXISTS merged_shopping_carts_authenticated_delete ON public.shopping_carts;
DROP POLICY IF EXISTS merged_shopping_carts_authenticated_insert ON public.shopping_carts;
DROP POLICY IF EXISTS merged_shopping_carts_authenticated_update ON public.shopping_carts;

-- 3. venthub_orders (Drop merged)
DROP POLICY IF EXISTS merged_venthub_orders_authenticated_select ON public.venthub_orders;

-- 4. venthub_returns (Drop merged)
DROP POLICY IF EXISTS merged_venthub_returns_authenticated_delete ON public.venthub_returns;
DROP POLICY IF EXISTS merged_venthub_returns_authenticated_insert ON public.venthub_returns;
DROP POLICY IF EXISTS merged_venthub_returns_authenticated_select ON public.venthub_returns;
