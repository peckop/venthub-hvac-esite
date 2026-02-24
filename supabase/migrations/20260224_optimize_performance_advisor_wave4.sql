-- ============================================================================
-- Supabase Performance Advisor: WAVE 4 DEFINITIVE (2026-02-24)
-- Resolves remaining multiple_permissive_policies, unindexed_foreign_keys, and unused_index (obsolete ones)
-- ============================================================================

-- ============================================================================
-- PART 1: Remove Duplicate Permissive Policies for cart_items & shopping_carts
-- ============================================================================

-- Shopping Carts: We have "sc_auth_all" doing everything correctly. Drop merged select.
DROP POLICY IF EXISTS "merged_shopping_carts_authenticated_select" ON public.shopping_carts;

-- Cart Items: We have "ci_auth_all" doing everything correctly. Drop merged select.
DROP POLICY IF EXISTS "merged_cart_items_authenticated_select" ON public.cart_items;

-- ============================================================================
-- PART 2: Remove Duplicate Permissive Policies for categories
-- ============================================================================

-- Categories: "cat_public_read_opt" provides SELECT to all.
-- We must restrict "cat_admin_all_opt" to INSERT, UPDATE, DELETE to avoid SELECT conflict for authenticated users.
DROP POLICY IF EXISTS "cat_admin_all_opt" ON public.categories;

CREATE POLICY "cat_admin_insert_opt" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );

CREATE POLICY "cat_admin_update_opt" ON public.categories
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );

CREATE POLICY "cat_admin_delete_opt" ON public.categories
    FOR DELETE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );

-- ============================================================================
-- PART 3: Remove Duplicate Permissive Policies for products
-- ============================================================================

-- Products: "prod_public_read_opt" provides SELECT to all.
-- Drop all old specific admin polices that overlap with "prod_admin_all_opt" or "p_admin_write".
DROP POLICY IF EXISTS "prod_admin_insert" ON public.products;
DROP POLICY IF EXISTS "prod_admin_update" ON public.products;
DROP POLICY IF EXISTS "prod_admin_delete" ON public.products;
DROP POLICY IF EXISTS "p_admin_write" ON public.products;
DROP POLICY IF EXISTS "p_public_read" ON public.products; -- dropped in wave3 but safety drop here

-- Like categories, "prod_admin_all_opt" from wave 3 is FOR ALL and overlaps with SELECT. 
-- We drop it, and create separate INSERT/UPDATE/DELETE policies.
DROP POLICY IF EXISTS "prod_admin_all_opt" ON public.products;

CREATE POLICY "prod_admin_insert_opt" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );

CREATE POLICY "prod_admin_update_opt" ON public.products
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );

CREATE POLICY "prod_admin_delete_opt" ON public.products
    FOR DELETE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );


-- ============================================================================
-- PART 4: Fix Unindexed Foreign Keys (unindexed_foreign_keys WARN)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_wizard_selections_selected_product_id ON public.wizard_selections(selected_product_id);

-- ============================================================================
-- PART 5: Drop Obsolete Unused Indexes (unused_index INFO)
-- We strictly drop the ones that are NOT foreign keys, e.g. obsolete search/trgm indices.
-- (Dropping FK indices would just trigger unindexed_foreign_keys again in production)
-- ============================================================================

DROP INDEX IF EXISTS public.idx_products_fts_tr_enhanced;
DROP INDEX IF EXISTS public.idx_products_model_code_trgm;
DROP INDEX IF EXISTS public.idx_products_sku_trgm;

-- ============================================================================
-- Done
-- ============================================================================
