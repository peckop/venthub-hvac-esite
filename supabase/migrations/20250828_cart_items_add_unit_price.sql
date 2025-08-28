-- Add unit_price column to cart_items (idempotent)
-- Date: 2025-08-28

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='cart_items' AND column_name='unit_price'
  ) THEN
    ALTER TABLE public.cart_items ADD COLUMN unit_price numeric NULL;
  END IF;
END
$$;

