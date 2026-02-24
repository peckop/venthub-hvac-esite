-- Fix missing SELECT policy for products table
DROP POLICY IF EXISTS "prod_public_read_opt" ON public.products;
CREATE POLICY "prod_public_read_opt" ON public.products
    FOR SELECT TO public
    USING (true);
