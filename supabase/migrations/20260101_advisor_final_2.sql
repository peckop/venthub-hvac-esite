-- ============================================================================
-- Supabase Advisor: Final 2 Warnings Fix (2026-01-01)
-- 1. products - remaining multiple permissive policy warning
-- 2. cart_items - duplicate index
-- ============================================================================

-- ============================================================================
-- PART 1: products - Ensure only 2 policies exist (no duplicates)
-- Drop any remaining old policies and ensure clean state
-- ============================================================================

-- Drop all possible product policy names
DROP POLICY IF EXISTS "merged_products_anon_select" ON public.products;
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "merged_products_authenticated_delete" ON public.products;
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
DROP POLICY IF EXISTS "merged_products_authenticated_insert" ON public.products;
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
DROP POLICY IF EXISTS "merged_products_authenticated_update" ON public.products;
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
DROP POLICY IF EXISTS "products_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_write" ON public.products;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "p_public_read" ON public.products;
DROP POLICY IF EXISTS "p_admin_write" ON public.products;

-- Create single public read policy
CREATE POLICY "prod_read" ON public.products 
    FOR SELECT 
    TO anon, authenticated 
    USING (true);

-- Create single admin write policy (for INSERT, UPDATE, DELETE)
CREATE POLICY "prod_admin" ON public.products
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
    );

-- ============================================================================
-- PART 2: cart_items - Drop duplicate index
-- Keep only cart_items_cart_product_uniq
-- ============================================================================

DROP INDEX IF EXISTS public.cart_items_cart_product_unique;

-- ============================================================================
-- Done - All advisor warnings should now be resolved
-- ============================================================================
