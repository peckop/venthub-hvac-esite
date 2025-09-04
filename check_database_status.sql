-- Check if main tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'venthub_orders', 'venthub_order_items', 'user_profiles')
ORDER BY table_name;

-- Check products table structure and sample data
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if products table has data
SELECT COUNT(*) as product_count FROM products;

-- Check venthub_orders table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'venthub_orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if venthub_orders table has data
SELECT COUNT(*) as order_count FROM venthub_orders;

-- Check current user permissions and RLS status
SELECT schemaname, tablename, rowsecurity, enablerls 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'venthub_orders', 'venthub_order_items')
ORDER BY tablename;
