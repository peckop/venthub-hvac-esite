-- Add optional price_list_id to cart_items and FK
-- Date: 2025-08-28

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='cart_items' AND column_name='price_list_id'
  ) THEN
    ALTER TABLE public.cart_items ADD COLUMN price_list_id uuid NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='cart_items_price_list_id_fkey'
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_price_list_id_fkey
      FOREIGN KEY (price_list_id) REFERENCES public.price_lists(id) ON DELETE SET NULL;
  END IF;
END
$$;

