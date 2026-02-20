-- 20260220_optimize_performance_advisor_part3.sql
-- Description: Applies the ultimate fix for the lingering 6 Performance Advisor warnings

BEGIN;

-- 1. FIX MULTIPLE PERMISSIVE POLICIES ON CATEGORIES
-- Drop the old duplicate 'merged_' policies that overlap with our recent 'categories_admin_modify'
DROP POLICY IF EXISTS "merged_categories_authenticated_delete" ON public.categories;
DROP POLICY IF EXISTS "merged_categories_authenticated_insert" ON public.categories;
DROP POLICY IF EXISTS "merged_categories_authenticated_select" ON public.categories;
DROP POLICY IF EXISTS "merged_categories_authenticated_update" ON public.categories;

-- 2. FIX MULTIPLE PERMISSIVE POLICIES AND INITPLAN ON VENTHUB_ORDER_ITEMS
-- Drop the old duplicate 'merged_' insert policy
DROP POLICY IF EXISTS "merged_venthub_order_items_authenticated_insert" ON public.venthub_order_items;

-- Drop the prior optimized policy to redefine it perfectly without auth.role() (which caused the initplan warning)
DROP POLICY IF EXISTS "venthub_order_items_insert_optimized" ON public.venthub_order_items;

-- Recreate the pure optimized insert policy. 
-- Note 1: (SELECT auth.uid()) properly bypasses initplan limits on row evaluation.
-- Note 2: We omit auth.role() = 'service_role' check entirely because service_role inherently bypasses RLS and shouldn't be evaluated per-row.
CREATE POLICY "venthub_order_items_insert_optimized"
ON public.venthub_order_items FOR INSERT
TO authenticated
WITH CHECK (
  order_id IN (
    SELECT venthub_orders.id
    FROM public.venthub_orders
    WHERE venthub_orders.user_id = (SELECT auth.uid())
  )
);

COMMIT;
