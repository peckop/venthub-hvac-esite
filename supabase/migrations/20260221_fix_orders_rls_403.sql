-- Migration: 20260221_fix_orders_rls_403.sql
-- Description: Fixes 403 Forbidden errors by removing direct references to auth.users in RLS policies.
-- These references were causing permission denied errors for non-admin authenticated users.

BEGIN;

-- 1. FIX VENTHUB_ORDERS SELECT POLICY
DROP POLICY IF EXISTS "orders_select_policy" ON public.venthub_orders;
CREATE POLICY "orders_select_policy" ON public.venthub_orders 
FOR SELECT TO authenticated
USING (
    user_id = (SELECT auth.uid()) 
    OR (SELECT public.is_admin_user())
);

-- 2. FIX VENTHUB_ORDER_ITEMS SELECT POLICY
DROP POLICY IF EXISTS "venthub_order_items_select_consolidated" ON public.venthub_order_items;
CREATE POLICY "venthub_order_items_select_consolidated"
ON public.venthub_order_items FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid())
    )
    OR (SELECT public.is_admin_user())
);

-- 3. FIX VENTHUB_RETURNS SELECT POLICY
DROP POLICY IF EXISTS "venthub_returns_select_consolidated" ON public.venthub_returns;
CREATE POLICY "venthub_returns_select_consolidated"
ON public.venthub_returns FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR (SELECT public.is_admin_user())
);

-- 4. FIX ADDITIONAL POLICIES USING AUTH.USERS (IF ANY)
-- Shopping carts already use a safer pattern, but let's ensure consistency if needed.
-- (Checking other potential 403 sources based on the same pattern)

COMMIT;
