-- Fix Final Products Performance Lint: Drop merged select policy

-- products
DROP POLICY IF EXISTS merged_products_authenticated_select ON public.products;
