-- Performance: Add covering indexes for reported unindexed foreign keys; Drop reported unused indexes

-- 1) Covering indexes for FKs (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_cart_items_price_list_id ON public.cart_items(price_list_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_client_errors_group_id ON public.client_errors(group_id);
CREATE INDEX IF NOT EXISTS idx_error_groups_assigned_to ON public.error_groups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON public.products(subcategory_id);

-- 2) Drop unused indexes (IF EXISTS)
DROP INDEX IF EXISTS public.idx_cart_items_cart_id;
DROP INDEX IF EXISTS public.idx_cart_items_product_id;
DROP INDEX IF EXISTS public.idx_product_images_product_sort;
DROP INDEX IF EXISTS public.idx_product_prices_active;
DROP INDEX IF EXISTS public.idx_product_prices_price_list_id;
DROP INDEX IF EXISTS public.idx_product_prices_product_id;
DROP INDEX IF EXISTS public.idx_user_addresses_user_id;
DROP INDEX IF EXISTS public.idx_user_invoice_profiles_user;
DROP INDEX IF EXISTS public.idx_user_profiles_created_at;
DROP INDEX IF EXISTS public.idx_user_profiles_role;
DROP INDEX IF EXISTS public.idx_venthub_order_items_order_id;
DROP INDEX IF EXISTS public.idx_venthub_order_items_product_id;
DROP INDEX IF EXISTS public.idx_venthub_orders_conversation_id;
DROP INDEX IF EXISTS public.idx_venthub_orders_created_at;
DROP INDEX IF EXISTS public.idx_venthub_orders_order_number;
DROP INDEX IF EXISTS public.idx_venthub_orders_payment_status;
DROP INDEX IF EXISTS public.idx_venthub_orders_status;
DROP INDEX IF EXISTS public.idx_venthub_orders_user_id;
DROP INDEX IF EXISTS public.idx_venthub_returns_order;
DROP INDEX IF EXISTS public.idx_venthub_returns_user;
DROP INDEX IF EXISTS public.shipping_webhook_events_order_id_idx;
DROP INDEX IF EXISTS public.shipping_webhook_events_received_at_idx;
DROP INDEX IF EXISTS public.venthub_orders_shipping_method_idx;
