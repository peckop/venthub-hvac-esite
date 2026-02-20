-- 20260220_optimize_performance_advisor.sql
-- Description: Applies Performance Advisor index optimizations (Unindexed Foreign Keys)
-- Security Advisor recommendations (Search paths) are ignored per user instruction.

BEGIN;

-- 1. Create missing indexes for Foreign Keys to improve JOIN and cascading DELETE performance
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_price_list_id ON public.product_prices(price_list_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_order_id ON public.venthub_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_product_id ON public.venthub_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_user_id ON public.venthub_orders(user_id);

-- 2. Cleanup duplicate indexes (if any)
DO $$ BEGIN
IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cart_items_cart_product_uniq'
    AND conrelid = 'public.cart_items'::regclass
) THEN
    EXECUTE 'ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_cart_product_uniq';
END IF;
END $$;

DO $$ BEGIN
IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='cart_items' AND indexname='cart_items_cart_product_unique'
) THEN
    EXECUTE 'CREATE UNIQUE INDEX cart_items_cart_product_unique ON public.cart_items (cart_id, product_id)';
END IF;
END $$;

COMMIT;
