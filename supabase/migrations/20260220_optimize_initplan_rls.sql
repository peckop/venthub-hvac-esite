-- 20260220_optimize_initplan_rls.sql
-- Description: This migration fixes initplan limits by wrapping auth.uid() in a subselect
-- and resolves the security flaw where all authenticated users could write to categories.

BEGIN;

-- 1. FIX CATEGORIES TABLE SECURITY FLAW & INITPLAN LIMIT
-- Drop the insecure policy that allowed any authenticated user to create/update categories.
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON categories;

-- Create a secure, admin-only policy for category modifications
CREATE POLICY "categories_admin_modify"
ON categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = (SELECT auth.uid())
    AND role IN ('admin', 'superadmin', 'service_role')
  )
);

-- 2. FIX VENTHUB_ORDER_ITEMS INITPLAN LIMIT
-- Drop the existing policy that caused initplan caching issues due to direct auth.uid()
DROP POLICY IF EXISTS "venthub_order_items_insert" ON venthub_order_items;

-- Create an optimized policy wrapping auth.uid() in a sub-select
CREATE POLICY "venthub_order_items_insert_optimized"
ON venthub_order_items FOR INSERT
TO authenticated
WITH CHECK (
  (order_id IN (
    SELECT venthub_orders.id
    FROM venthub_orders
    WHERE venthub_orders.user_id = (SELECT auth.uid())
  ))
  OR (auth.role() = 'service_role'::text)
);

COMMIT;
