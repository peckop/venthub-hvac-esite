-- ============================================================================
-- Supabase Advisor Fixes v2 (2026-01-01)
-- Fix remaining search_path warnings for 4 functions
-- Fix remaining RLS policy consolidations
-- ============================================================================

-- ============================================================================
-- PART 1: Fix Function Search Paths using ALTER (correct syntax without quotes)
-- ============================================================================

-- 1. reverse_inventory_batch (uuid, integer signature)
ALTER FUNCTION IF EXISTS public.reverse_inventory_batch(uuid, integer) SET search_path = pg_catalog, public;

-- 2. bump_rate_limit (text, integer, integer signature)
ALTER FUNCTION IF EXISTS public.bump_rate_limit(text, integer, integer) SET search_path = pg_catalog, public;

-- 3. enforce_role_change (no params)
ALTER FUNCTION IF EXISTS public.enforce_role_change() SET search_path = pg_catalog, public;

-- 4. update_updated_at_column (no params)
ALTER FUNCTION IF EXISTS public.update_updated_at_column() SET search_path = pg_catalog, public;

-- ============================================================================
-- PART 2: Fix wizard_selections RLS policies (drop all and create consolidated)
-- ============================================================================

-- Drop all existing wizard_selections policies
DROP POLICY IF EXISTS "Users can view own wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "Users can create own wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "Users can update own wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "Users can delete own wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "Admins can view all wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_select" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_insert" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_update" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_delete" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_user_all" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_admin_select" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_authenticated_all" ON public.wizard_selections;

-- Create single consolidated policy for users with initplan optimization
CREATE POLICY "wizard_selections_user_all" ON public.wizard_selections
    FOR ALL
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Admin read access with initplan optimization
CREATE POLICY "wizard_selections_admin_read" ON public.wizard_selections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = (SELECT auth.uid())
            AND up.role IN ('admin', 'superadmin')
        )
    );

-- ============================================================================
-- PART 3: Fix cart_items RLS policies
-- ============================================================================

-- Drop all existing cart_items policies
DROP POLICY IF EXISTS "cart_items_select" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete" ON public.cart_items;
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_authenticated_all" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_user_all" ON public.cart_items;

-- Create single consolidated policy with initplan optimization
CREATE POLICY "cart_items_user_all" ON public.cart_items
    FOR ALL
    TO authenticated
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
-- PART 4: Fix shopping_carts RLS policies
-- ============================================================================

-- Drop all existing shopping_carts policies
DROP POLICY IF EXISTS "shopping_carts_select" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_insert" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_update" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_delete" ON public.shopping_carts;
DROP POLICY IF EXISTS "Users can manage own shopping carts" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_authenticated_all" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_user_all" ON public.shopping_carts;

-- Create single consolidated policy with initplan optimization
CREATE POLICY "shopping_carts_user_all" ON public.shopping_carts
    FOR ALL
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 5: Fix products RLS policies (consolidate public read)
-- ============================================================================

-- Drop potential duplicate policies
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_anon_select" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "products_select" ON public.products;

-- Create single public read policy
CREATE POLICY "products_public_read" ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================================================
-- Done
-- ============================================================================
