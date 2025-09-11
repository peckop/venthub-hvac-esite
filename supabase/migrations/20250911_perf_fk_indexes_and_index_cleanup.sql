BEGIN;

-- Add covering indexes for foreign keys (idempotent)
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_price_list_id ON public.product_prices(price_list_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_order_id ON public.venthub_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_product_id ON public.venthub_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_user_id ON public.venthub_orders(user_id);

-- Remove duplicate index (keep a single unique constraint/index)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='cart_items' AND indexname='cart_items_cart_product_uniq'
  ) THEN
    EXECUTE 'DROP INDEX IF EXISTS public.cart_items_cart_product_uniq';
  END IF;
END $$;

COMMIT;

