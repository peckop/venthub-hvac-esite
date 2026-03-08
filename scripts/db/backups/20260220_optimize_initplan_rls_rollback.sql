-- 20260220_optimize_initplan_rls_rollback.sql
-- Description: Safety net rollback script to restore the exact previous state of the RLS policies
-- modified by the 20260220_optimize_initplan_rls migration.

BEGIN;

-- 1. REVERT CATEGORIES TABLE
-- Drop the new secure policy
DROP POLICY IF EXISTS "categories_admin_modify" ON categories;

-- Restore the old (insecure) policy as it was
CREATE POLICY "Enable write access for authenticated users" 
ON categories FOR ALL 
TO authenticated 
USING ( (auth.role() = 'authenticated'::text) );


-- 2. REVERT VENTHUB_ORDER_ITEMS
-- Drop the new optimized policy
DROP POLICY IF EXISTS "venthub_order_items_insert_optimized" ON venthub_order_items;

-- Restore the old unoptimized policy
CREATE POLICY "venthub_order_items_insert"
ON venthub_order_items FOR INSERT
TO authenticated
WITH CHECK (
  ((order_id IN ( SELECT venthub_orders.id
   FROM venthub_orders
  WHERE (venthub_orders.user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))
);

COMMIT;
