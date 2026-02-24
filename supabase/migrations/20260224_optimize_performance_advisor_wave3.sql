-- ============================================================================
-- Supabase Performance Advisor: WAVE 3 CLEANUP (2026-02-24)
-- Resolves auth_rls_initplan and multiple_permissive_policies warnings
-- ============================================================================

-- ============================================================================
-- PART 1: Remove Duplicate Permissive Policies for shopping_carts & cart_items
-- Both tables already have complete, optimized ALL policies (sc_auth_all / ci_auth_all)
-- Drop the overlapping _own policies that cause the multiple_permissive_policies warning.
-- ============================================================================

DROP POLICY IF EXISTS "shopping_carts_delete_own" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_insert_own" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_select_own" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_update_own" ON public.shopping_carts;

DROP POLICY IF EXISTS "cart_items_delete_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update_own" ON public.cart_items;

-- ============================================================================
-- PART 2: Clean up Categories multiple_permissive_policies and add safe InitPlans
-- ============================================================================

DROP POLICY IF EXISTS "categories_public_select" ON public.categories;
DROP POLICY IF EXISTS "merged_categories_anon_select" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_modify" ON public.categories;
DROP POLICY IF EXISTS "merged_categories_authenticated_select" ON public.categories;
DROP POLICY IF EXISTS "merged_categories_authenticated_insert" ON public.categories;
DROP POLICY IF EXISTS "merged_categories_authenticated_update" ON public.categories;
DROP POLICY IF EXISTS "merged_categories_authenticated_delete" ON public.categories;

-- Public read for all
CREATE POLICY "cat_public_read_opt" ON public.categories
    FOR SELECT TO public
    USING (true);

-- Admin write (InitPlan safe)
CREATE POLICY "cat_admin_all_opt" ON public.categories
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );


-- ============================================================================
-- PART 3: Fix Contact Messages (auth_rls_initplan + multiple_permissive_policies)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view messages" ON public.contact_messages;
DROP POLICY IF EXISTS "merged_contact_messages_authenticated_select" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_all" ON public.contact_messages;

-- Admins can view all, or users can view their own, InitPlan safe
CREATE POLICY "cm_auth_select_opt" ON public.contact_messages
    FOR SELECT TO authenticated
    USING (
        (user_id = (SELECT auth.uid())) OR
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );


-- ============================================================================
-- PART 4: Fix Products (auth_rls_initplan + multiple_permissive_policies)
-- ============================================================================

DROP POLICY IF EXISTS "prod_admin" ON public.products;
DROP POLICY IF EXISTS "p_public_read" ON public.products;
DROP POLICY IF EXISTS "p_admin_write" ON public.products;

-- Public read (active only for non-admins, but usually just everything ok for select if handled in app)
-- However, we will make sure public read works
CREATE POLICY "prod_public_read_opt" ON public.products
    FOR SELECT TO public
    USING (true);

-- Admin ALL operations (InitPlan safe)
CREATE POLICY "prod_admin_all_opt" ON public.products
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );


-- ============================================================================
-- PART 5: Fix Product Images (auth_rls_initplan)
-- ============================================================================

DROP POLICY IF EXISTS "product_images_update_admin" ON public.product_images;

CREATE POLICY "pi_admin_all_opt" ON public.product_images
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin', 'moderator'))
    );

-- ============================================================================
-- Done
-- ============================================================================
