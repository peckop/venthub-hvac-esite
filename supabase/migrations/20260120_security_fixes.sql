-- Migration: 20260120_security_fixes.sql
-- Fix security lint warnings for product_images, wizard_selections, and products SELECT policies

-- 1. Drop existing permissive UPDATE policy on product_images and create admin-only policy
DROP POLICY IF EXISTS "product_images_update_consolidated" ON public.product_images;
CREATE POLICY "product_images_update_admin"
    ON public.product_images
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
    );

-- 2. Drop existing anonymous INSERT policy on wizard_selections and create rate-limited policy
DROP POLICY IF EXISTS "ws_anon_insert" ON public.wizard_selections;
CREATE POLICY "ws_anon_insert"
    ON public.wizard_selections
    FOR INSERT TO anon
    WITH CHECK (
        (SELECT COUNT(*) FROM public.wizard_selections WHERE created_at > NOW() - INTERVAL '5 minutes') < 10
    );

-- 3. Consolidate SELECT policies on products table
-- Drop all existing SELECT policies for products (including duplicates)
DROP POLICY IF EXISTS "merged_products_anon_select" ON public.products;
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "merged_products_authenticated_select" ON public.products;
DROP POLICY IF EXISTS "p_public_read" ON public.products;
DROP POLICY IF EXISTS "prod_read" ON public.products;
DROP POLICY IF EXISTS "prod_admin" ON public.products;

-- Public read (anon & authenticated)
CREATE POLICY "p_public_read"
    ON public.products
    FOR SELECT TO anon, authenticated
    USING (true);

-- Admin write (authenticated admins can read/write/delete)
CREATE POLICY "prod_admin"
    ON public.products
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
    );

-- Note: Enable leaked password protection manually via Supabase Dashboard.
