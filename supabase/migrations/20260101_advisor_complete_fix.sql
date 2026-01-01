-- ============================================================================
-- Supabase Advisor Complete Fix (2026-01-01 v3)
-- Fixes ALL remaining security and performance warnings
-- ============================================================================

-- ============================================================================
-- PART 1: SECURITY - Fix Function Search Paths (4 functions)
-- ============================================================================

-- These functions exist but need search_path set
ALTER FUNCTION IF EXISTS public.reverse_inventory_batch(uuid, integer) SET search_path = pg_catalog, public;
ALTER FUNCTION IF EXISTS public.bump_rate_limit(text, integer, integer) SET search_path = pg_catalog, public;
ALTER FUNCTION IF EXISTS public.enforce_role_change() SET search_path = pg_catalog, public;
ALTER FUNCTION IF EXISTS public.update_updated_at_column() SET search_path = pg_catalog, public;

-- ============================================================================
-- PART 2: PERFORMANCE - Fix duplicate index on cart_items
-- ============================================================================

DROP INDEX IF EXISTS public.cart_items_cart_product_unique;
-- Keep cart_items_cart_product_uniq

-- ============================================================================
-- PART 3: PERFORMANCE - Consolidate wizard_selections policies
-- Drop ALL existing and create single optimized policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "merged_wizard_selections_authenticated_select" ON public.wizard_selections;
DROP POLICY IF EXISTS "Anyone can insert selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "merged_wizard_selections_anon_insert" ON public.wizard_selections;
DROP POLICY IF EXISTS "merged_wizard_selections_authenticated_insert" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_user_all" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_admin_read" ON public.wizard_selections;

-- Consolidated policies with initplan optimization
CREATE POLICY "wizard_selections_anon_insert" ON public.wizard_selections
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "wizard_selections_auth_all" ON public.wizard_selections
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 4: PERFORMANCE - Consolidate cart_items policies
-- Policies causing issues: cart_items_modify_own, cart_items_policy
-- ============================================================================

DROP POLICY IF EXISTS "cart_items_modify_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_user_all" ON public.cart_items;

-- Single consolidated policy
CREATE POLICY "cart_items_all" ON public.cart_items
    FOR ALL TO authenticated
    USING (
        cart_id IN (
            SELECT id FROM public.shopping_carts
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        cart_id IN (
            SELECT id FROM public.shopping_carts
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================================================
-- PART 5: PERFORMANCE - Consolidate shopping_carts policies
-- Policies causing issues: shopping_carts_modify_own, shopping_carts_policy, shopping_carts_select_own
-- ============================================================================

DROP POLICY IF EXISTS "shopping_carts_modify_own" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_policy" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_select_own" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_user_all" ON public.shopping_carts;

-- Single consolidated policy
CREATE POLICY "shopping_carts_all" ON public.shopping_carts
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 6: PERFORMANCE - Consolidate products policies
-- Policies causing issues: merged_products_*, products_*_policy
-- ============================================================================

DROP POLICY IF EXISTS "merged_products_anon_select" ON public.products;
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "merged_products_authenticated_delete" ON public.products;
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
DROP POLICY IF EXISTS "merged_products_authenticated_insert" ON public.products;
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
DROP POLICY IF EXISTS "merged_products_authenticated_update" ON public.products;
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
DROP POLICY IF EXISTS "products_public_read" ON public.products;

-- Public read
CREATE POLICY "products_read" ON public.products
    FOR SELECT TO anon, authenticated
    USING (true);

-- Admin write (insert, update, delete)
CREATE POLICY "products_admin_write" ON public.products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = (SELECT auth.uid())
            AND role IN ('admin', 'superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = (SELECT auth.uid())
            AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================================================
-- PART 7: PERFORMANCE - Consolidate user_invoice_profiles policies
-- Policies causing issues: merged_user_invoice_profiles_*, user_invoice_profiles_*
-- ============================================================================

DROP POLICY IF EXISTS "merged_user_invoice_profiles_authenticated_delete" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_delete" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "merged_user_invoice_profiles_authenticated_insert" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_insert" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "merged_user_invoice_profiles_authenticated_select" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_select" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "merged_user_invoice_profiles_authenticated_update" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_update" ON public.user_invoice_profiles;

-- Single consolidated policy for user's own profiles
CREATE POLICY "user_invoice_profiles_own" ON public.user_invoice_profiles
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- Done - All advisor warnings should be resolved (except password which is auth config)
-- ============================================================================
