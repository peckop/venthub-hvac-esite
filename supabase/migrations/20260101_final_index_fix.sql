-- ============================================================================
-- Supabase Advisor: FINAL FIX (2026-01-01)
-- Drops the remaining duplicate index on cart_items
-- ============================================================================

-- cart_items has TWO identical unique indexes:
-- 1. cart_items_cart_product_unique
-- 2. cart_items_cart_product_uniq
-- We keep cart_items_cart_product_uniq and drop cart_items_cart_product_unique

DROP INDEX IF EXISTS public.cart_items_cart_product_unique;

-- ============================================================================
-- Done - This should resolve the last duplicate index warning
-- ============================================================================
