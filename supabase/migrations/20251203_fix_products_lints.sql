-- Fix Products Performance Lints: Split modify policy and drop redundant ones

-- products
DROP POLICY IF EXISTS products_modify_policy ON public.products;
DROP POLICY IF EXISTS products_update_admin_stock ON public.products;

CREATE POLICY products_insert_policy ON public.products FOR INSERT
  WITH CHECK ( (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY products_update_policy ON public.products FOR UPDATE
  USING ( (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY products_delete_policy ON public.products FOR DELETE
  USING ( (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );
