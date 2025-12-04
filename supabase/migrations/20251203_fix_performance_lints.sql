-- Fix Performance Lints: RLS Initplan & Multiple Permissive Policies

-- 1. venthub_returns
DROP POLICY IF EXISTS returns_update_admin ON public.venthub_returns;
DROP POLICY IF EXISTS returns_update_service ON public.venthub_returns;
DROP POLICY IF EXISTS returns_select_admin ON public.venthub_returns;
DROP POLICY IF EXISTS returns_insert_own_order ON public.venthub_returns;
DROP POLICY IF EXISTS returns_delete_service ON public.venthub_returns;

CREATE POLICY returns_select_policy ON public.venthub_returns FOR SELECT
  USING ( user_id = (SELECT auth.uid()) OR (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY returns_insert_policy ON public.venthub_returns FOR INSERT
  WITH CHECK ( user_id = (SELECT auth.uid()) OR (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY returns_update_policy ON public.venthub_returns FOR UPDATE
  USING ( (SELECT auth.role()) = 'service_role' OR (SELECT is_admin_user()) );

CREATE POLICY returns_delete_policy ON public.venthub_returns FOR DELETE
  USING ( (SELECT auth.role()) = 'service_role' OR (SELECT is_admin_user()) );


-- 2. shopping_carts
DROP POLICY IF EXISTS shopping_carts_delete_own ON public.shopping_carts;
DROP POLICY IF EXISTS shopping_carts_insert_own ON public.shopping_carts;
DROP POLICY IF EXISTS shopping_carts_update_own ON public.shopping_carts;
DROP POLICY IF EXISTS shopping_carts_select_own ON public.shopping_carts;

CREATE POLICY shopping_carts_policy ON public.shopping_carts
  USING ( user_id = (SELECT auth.uid()) OR (SELECT auth.role()) = 'service_role' )
  WITH CHECK ( user_id = (SELECT auth.uid()) OR (SELECT auth.role()) = 'service_role' );


-- 3. orders
DROP POLICY IF EXISTS orders_delete_own ON public.venthub_orders;
DROP POLICY IF EXISTS orders_insert_own ON public.venthub_orders;
DROP POLICY IF EXISTS orders_update_own ON public.venthub_orders;
DROP POLICY IF EXISTS orders_select_own ON public.venthub_orders;

CREATE POLICY orders_select_policy ON public.venthub_orders FOR SELECT
  USING ( user_id = (SELECT auth.uid()) OR (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY orders_insert_policy ON public.venthub_orders FOR INSERT
  WITH CHECK ( user_id = (SELECT auth.uid()) OR (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY orders_update_policy ON public.venthub_orders FOR UPDATE
  USING ( user_id = (SELECT auth.uid()) OR (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY orders_delete_policy ON public.venthub_orders FOR DELETE
  USING ( (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );


-- 4. products
DROP POLICY IF EXISTS merged_products_authenticated_delete ON public.products;
DROP POLICY IF EXISTS merged_products_authenticated_insert ON public.products;
DROP POLICY IF EXISTS merged_products_authenticated_update ON public.products;
DROP POLICY IF EXISTS merged_products_anon_select ON public.products;
DROP POLICY IF EXISTS products_delete_admin ON public.products;
DROP POLICY IF EXISTS products_insert_admin ON public.products;
DROP POLICY IF EXISTS products_update_admin ON public.products;
DROP POLICY IF EXISTS products_select_public ON public.products;

CREATE POLICY products_select_policy ON public.products FOR SELECT
  USING (true);

CREATE POLICY products_modify_policy ON public.products
  USING ( (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' )
  WITH CHECK ( (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );
