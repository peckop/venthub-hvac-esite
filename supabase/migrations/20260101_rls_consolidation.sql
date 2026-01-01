-- ============================================================================
-- Supabase Advisor: RLS Policy Consolidation (2026-01-01)
-- Drops duplicate/overlapping policies and creates single consolidated ones
-- ============================================================================

-- ============================================================================
-- PART 1: wizard_selections - Drop all and create clean policies
-- Policies: "Users can view own selections", "merged_wizard_selections_authenticated_select",
--           "Anyone can insert selections", "merged_wizard_selections_anon_insert", etc.
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "merged_wizard_selections_authenticated_select" ON public.wizard_selections;
DROP POLICY IF EXISTS "Anyone can insert selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "merged_wizard_selections_anon_insert" ON public.wizard_selections;
DROP POLICY IF EXISTS "merged_wizard_selections_authenticated_insert" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_user_all" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_auth_all" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_anon_insert" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_admin_read" ON public.wizard_selections;

-- Anon insert (anyone can start wizard)
CREATE POLICY "ws_anon_insert" ON public.wizard_selections FOR INSERT TO anon WITH CHECK (true);

-- Authenticated users can do all with their own selections (initplan optimized)
CREATE POLICY "ws_auth_all" ON public.wizard_selections
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 2: cart_items - Drop all and create clean policies
-- Policies: cart_items_modify_own, cart_items_policy
-- ============================================================================

DROP POLICY IF EXISTS "cart_items_modify_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_user_all" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_all" ON public.cart_items;

-- Single policy for authenticated users
CREATE POLICY "ci_auth_all" ON public.cart_items
    FOR ALL TO authenticated
    USING (
        cart_id IN (SELECT id FROM public.shopping_carts WHERE user_id = (SELECT auth.uid()))
    )
    WITH CHECK (
        cart_id IN (SELECT id FROM public.shopping_carts WHERE user_id = (SELECT auth.uid()))
    );

-- ============================================================================
-- PART 3: shopping_carts - Drop all and create clean policies
-- Policies: shopping_carts_modify_own, shopping_carts_policy, shopping_carts_select_own
-- ============================================================================

DROP POLICY IF EXISTS "shopping_carts_modify_own" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_policy" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_select_own" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_user_all" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_all" ON public.shopping_carts;

-- Single policy for authenticated users
CREATE POLICY "sc_auth_all" ON public.shopping_carts
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 4: products - Drop duplicates and create clean policies
-- Policies: merged_products_anon_select, products_select_policy,
--           merged_products_authenticated_*, products_*_policy
-- ============================================================================

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

-- Public read for all
CREATE POLICY "p_public_read" ON public.products FOR SELECT TO anon, authenticated USING (true);

-- Admin write (check role exists and is admin/superadmin)
CREATE POLICY "p_admin_write" ON public.products
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'superadmin'))
    );

-- ============================================================================
-- PART 5: user_invoice_profiles - Drop duplicates and create clean policy
-- Policies: merged_user_invoice_profiles_authenticated_*, user_invoice_profiles_*
-- ============================================================================

DROP POLICY IF EXISTS "merged_user_invoice_profiles_authenticated_delete" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_delete" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "merged_user_invoice_profiles_authenticated_insert" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_insert" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "merged_user_invoice_profiles_authenticated_select" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_select" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "merged_user_invoice_profiles_authenticated_update" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_update" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_own" ON public.user_invoice_profiles;

-- Single policy for user's own profiles
CREATE POLICY "uip_own" ON public.user_invoice_profiles
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 6: Drop duplicate index
-- ============================================================================

DROP INDEX IF EXISTS public.cart_items_cart_product_unique;

-- ============================================================================
-- Done
-- ============================================================================
