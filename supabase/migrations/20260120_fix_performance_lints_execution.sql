-- Migration: 20260120_fix_performance_lints_execution.sql
-- Description: Fix auth_rls_initplan and multiple_permissive_policies warnings from Supabase Lint

-- ============================================================================
-- 1. PRODUCTS: Fix multiple_permissive_policies for SELECT & auth_rls_initplan
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "p_public_read" ON public.products;
DROP POLICY IF EXISTS "prod_admin" ON public.products;
DROP POLICY IF EXISTS "prod_read" ON public.products; -- Ensure cleanup

-- 1A. PUBLIC READ (SELECT) - Covers both anon and authenticated (including admins)
-- Since this is TRUE, we don't need a separate SELECT policy for admins
CREATE POLICY "p_public_read"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 1B. ADMIN WRITE (INSERT, UPDATE, DELETE) - Excludes SELECT to fix "multiple policies" warning
-- Also fixes auth_rls_initplan by using (SELECT auth.uid())

CREATE POLICY "prod_admin_insert" ON public.products FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "prod_admin_update" ON public.products FOR UPDATE TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "prod_admin_delete" ON public.products FOR DELETE TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
);


-- ============================================================================
-- 2. CONTACT_MESSAGES: Fix auth_rls_initplan & multiple policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view messages" ON public.contact_messages;
DROP POLICY IF EXISTS "merged_contact_messages_authenticated_select" ON public.contact_messages;

-- Consolidated Admin Viewer Policy
CREATE POLICY "admin_view_messages"
    ON public.contact_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = (SELECT auth.uid()) -- FIX: Wrap auth.uid()
            AND role IN ('admin', 'superadmin')
        )
    );


-- ============================================================================
-- 3. PRODUCT_IMAGES: Fix auth_rls_initplan
-- ============================================================================

DROP POLICY IF EXISTS "product_images_update_admin" ON public.product_images;

CREATE POLICY "product_images_update_admin"
    ON public.product_images
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = (SELECT auth.uid()) -- FIX: Wrap auth.uid()
            AND role IN ('admin', 'superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = (SELECT auth.uid()) -- FIX: Wrap auth.uid()
            AND role IN ('admin', 'superadmin')
        )
    );
