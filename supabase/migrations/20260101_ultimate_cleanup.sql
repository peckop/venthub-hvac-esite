-- ============================================================================
-- Supabase Advisor: ULTIMATE CLEANUP (2026-01-01)
-- Drops all remaining duplicate policies identified from pg_policies
-- ============================================================================

-- ============================================================================
-- PART 1: cart_items - Keep only ci_auth_all, drop merged_*
-- ============================================================================

DROP POLICY IF EXISTS "merged_cart_items_authenticated_select" ON public.cart_items;
DROP POLICY IF EXISTS "merged_cart_items_authenticated_insert" ON public.cart_items;
DROP POLICY IF EXISTS "merged_cart_items_authenticated_update" ON public.cart_items;
DROP POLICY IF EXISTS "merged_cart_items_authenticated_delete" ON public.cart_items;

-- ============================================================================
-- PART 2: products - Keep only prod_read + prod_admin, drop p_* (old duplicates)
-- ============================================================================

DROP POLICY IF EXISTS "p_admin_write" ON public.products;
DROP POLICY IF EXISTS "p_public_read" ON public.products;

-- ============================================================================
-- PART 3: shopping_carts - Keep only sc_auth_all, drop merged_*
-- ============================================================================

DROP POLICY IF EXISTS "merged_shopping_carts_authenticated_select" ON public.shopping_carts;
DROP POLICY IF EXISTS "merged_shopping_carts_authenticated_insert" ON public.shopping_carts;
DROP POLICY IF EXISTS "merged_shopping_carts_authenticated_update" ON public.shopping_carts;
DROP POLICY IF EXISTS "merged_shopping_carts_authenticated_delete" ON public.shopping_carts;

-- ============================================================================
-- PART 4: Drop duplicate index (ensure it's gone)
-- ============================================================================

DROP INDEX IF EXISTS public.cart_items_cart_product_unique;

-- ============================================================================
-- Done - Should now have exactly 1 policy per action per table
-- ============================================================================
