-- =============================================================================
-- Migration: Fix Security Lints
-- Date: 2026-04-08
-- Description: Replaces auth.uid() with (SELECT auth.uid()) to trigger
-- PostgreSQL's initplan caching and reduce row-by-row execution times,
-- fixing the initplan performance vulnerability and type linting issues.
-- =============================================================================

BEGIN;

DROP POLICY IF EXISTS "product_images_update_admin" ON public.product_images;

CREATE POLICY "product_images_update_admin"
    ON public.product_images
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
    );


DROP POLICY IF EXISTS "prod_admin" ON public.products;

CREATE POLICY "prod_admin"
    ON public.products
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
    );

COMMIT;
