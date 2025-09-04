-- Check all RLS policies on main tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'venthub_orders', 'venthub_order_items', 'user_profiles')
ORDER BY tablename, policyname;

-- Check current user context
SELECT current_user, current_setting('request.jwt.claims', true) as jwt_claims;

-- Test basic table access (this might fail if RLS is blocking)
-- First disable RLS temporarily to test if that's the issue
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE venthub_orders DISABLE ROW LEVEL SECURITY;

-- Try to query the tables
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as order_count FROM venthub_orders;

-- Re-enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE venthub_orders ENABLE ROW LEVEL SECURITY;
