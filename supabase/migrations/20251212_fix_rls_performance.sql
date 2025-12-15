-- Migration: Fix RLS Performance Issues
-- Date: 2025-12-12
-- Purpose: Resolve Supabase Advisor warnings for RLS initplan and multiple permissive policies

-- ============================================
-- SECTION 1: Consolidate Multiple Permissive Policies
-- ============================================

-- product_images: Consolidate UPDATE policies
DO $$
DECLARE r RECORD;
BEGIN
    -- Drop all existing UPDATE policies on product_images
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'product_images' AND cmd = 'UPDATE' AND schemaname = 'public' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON product_images';
        RAISE NOTICE 'Dropped product_images UPDATE policy: %', r.policyname;
    END LOOP;
END $$;

-- Recreate single consolidated UPDATE policy for product_images
CREATE POLICY "product_images_update_consolidated"
ON product_images FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- venthub_order_items: Consolidate SELECT policies
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'venthub_order_items' AND cmd = 'SELECT' AND schemaname = 'public' AND permissive = 'PERMISSIVE' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON venthub_order_items';
        RAISE NOTICE 'Dropped venthub_order_items SELECT policy: %', r.policyname;
    END LOOP;
END $$;

-- Recreate single consolidated SELECT policy for venthub_order_items using subselect pattern
CREATE POLICY "venthub_order_items_select_consolidated"
ON venthub_order_items FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT id FROM venthub_orders WHERE user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (SELECT 1 FROM auth.users WHERE id = (SELECT auth.uid()) AND raw_user_meta_data->>'role' = 'admin')
);

-- venthub_returns: Consolidate SELECT policies
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'venthub_returns' AND cmd = 'SELECT' AND schemaname = 'public' AND permissive = 'PERMISSIVE' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON venthub_returns';
        RAISE NOTICE 'Dropped venthub_returns SELECT policy: %', r.policyname;
    END LOOP;
END $$;

-- Recreate single consolidated SELECT policy for venthub_returns
CREATE POLICY "venthub_returns_select_consolidated"
ON venthub_returns FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR
    EXISTS (SELECT 1 FROM auth.users WHERE id = (SELECT auth.uid()) AND raw_user_meta_data->>'role' = 'admin')
);

-- ============================================
-- SECTION 2: Analyze tables to update statistics
-- ============================================
ANALYZE products;
ANALYZE product_images;
ANALYZE venthub_order_items;
ANALYZE venthub_returns;

-- ============================================
-- END OF MIGRATION
-- ============================================
