begin;

-- Ensure required extensions
create extension if not exists pgcrypto;

-- 1) Add stock and low stock threshold columns to products (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'stock_qty'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN stock_qty integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN low_stock_threshold integer NULL;
  END IF;
END$$;

-- 2) Create inventory_settings (single row table)
CREATE TABLE IF NOT EXISTS public.inventory_settings (
  id boolean PRIMARY KEY DEFAULT true,
  default_low_stock_threshold integer NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.inventory_settings (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

-- 3) Create inventory_movements table
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id uuid NULL REFERENCES public.venthub_orders(id) ON DELETE SET NULL,
  delta integer NOT NULL,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 32),
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Unique guard to prevent double-deduction for the same order+product+reason
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='inventory_movements' AND indexname='inventory_movements_order_product_reason_key'
  ) THEN
    CREATE UNIQUE INDEX inventory_movements_order_product_reason_key
    ON public.inventory_movements(order_id, product_id, reason)
    WHERE order_id IS NOT NULL;
  END IF;
END$$;

-- 4) Enable RLS and basic policies
ALTER TABLE public.inventory_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Allow everyone to SELECT settings; only admin (role claim) can UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory_settings' AND policyname='inventory_settings_select_all'
  ) THEN
    CREATE POLICY inventory_settings_select_all ON public.inventory_settings
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory_settings' AND policyname='inventory_settings_update_admin'
  ) THEN
    CREATE POLICY inventory_settings_update_admin ON public.inventory_settings
      FOR UPDATE USING ( (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') = 'admin' );
  END IF;
END$$;

-- Movements: allow SELECT for admin; INSERT only via RPC (deny-all policy here)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory_movements' AND policyname='inventory_movements_select_admin'
  ) THEN
    CREATE POLICY inventory_movements_select_admin ON public.inventory_movements
      FOR SELECT USING ( (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') = 'admin' );
  END IF;
END$$;

-- 5) RPCs: set_stock and adjust_stock (security definer)
CREATE OR REPLACE FUNCTION public.set_stock(p_product_id uuid, p_new_qty int, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  SELECT stock_qty INTO v_current FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF v_current IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  v_delta := p_new_qty - v_current;
  IF v_delta = 0 THEN
    RETURN;
  END IF;
  UPDATE public.products SET stock_qty = stock_qty + v_delta WHERE id = p_product_id;
  INSERT INTO public.inventory_movements (product_id, delta, reason) VALUES (p_product_id, v_delta, COALESCE(p_reason, 'adjust'));
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_stock(p_product_id uuid, p_delta int, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products SET stock_qty = stock_qty + p_delta WHERE id = p_product_id;
  INSERT INTO public.inventory_movements (product_id, delta, reason) VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'));
END;
$$;

-- 6) Grants: allow authenticated to execute RPC; updates to products still rely on RLS policies if enabled
GRANT EXECUTE ON FUNCTION public.set_stock(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_stock(uuid, int, text) TO authenticated;

commit;
