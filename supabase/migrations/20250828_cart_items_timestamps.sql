-- Add created_at and updated_at to cart_items with trigger (idempotent)
-- Date: 2025-08-28

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='cart_items' AND column_name='created_at'
  ) THEN
    ALTER TABLE public.cart_items ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='cart_items' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.cart_items ADD COLUMN updated_at timestamptz NULL;
  END IF;
END
$$;

-- Upsert/updates should touch updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname='tr_cart_items_set_updated_at'
  ) THEN
    CREATE TRIGGER tr_cart_items_set_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
