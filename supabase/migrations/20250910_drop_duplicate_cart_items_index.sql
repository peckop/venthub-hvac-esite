-- 20250910_drop_duplicate_cart_items_index.sql
-- Purpose: Drop duplicate index on cart_items: {cart_items_cart_product_uniq, cart_items_cart_product_unique}
-- Keep: cart_items_cart_product_unique; Drop: cart_items_cart_product_uniq (if exists)

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname='public' AND tablename='cart_items' AND indexname='cart_items_cart_product_uniq'
  ) THEN
    EXECUTE 'DROP INDEX IF EXISTS public.cart_items_cart_product_uniq';
  END IF;
END $$;

COMMIT;

