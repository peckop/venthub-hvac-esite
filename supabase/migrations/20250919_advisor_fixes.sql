begin;

-- 1) Function search_path hardening for SECURITY DEFINER functions
ALTER FUNCTION public.bump_rate_limit(text, integer, integer) SET search_path = 'pg_catalog, public';
ALTER FUNCTION public.enforce_role_change() SET search_path = 'pg_catalog, public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'pg_catalog, public';
ALTER FUNCTION public.reverse_inventory_batch(uuid, integer) SET search_path = 'pg_catalog, public';

-- 2) Add missing foreign key covering indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_price_list_id ON public.product_prices(price_list_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_order_id ON public.venthub_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_product_id ON public.venthub_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_user_id ON public.venthub_orders(user_id);

-- 3) Drop duplicate index (best-effort; if not applicable, no-op)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='cart_items_cart_product_uniq') THEN
    EXECUTE 'DROP INDEX public.cart_items_cart_product_uniq';
  END IF;
END$$;

commit;