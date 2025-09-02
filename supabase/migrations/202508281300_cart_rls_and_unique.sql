-- VentHub HVAC: cart_items RLS + unique constraint
-- Date: 2025-08-28
-- Updated: Direct user_id based cart (no separate shopping_carts table)

-- Ensure RLS is enabled (idempotent)
alter table if exists public.cart_items enable row level security;

-- Unique constraint for (user_id, product_id) to support upsert semantics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cart_items_user_product_uniq'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_user_product_uniq UNIQUE (user_id, product_id);
  END IF;
END
$$;

-- Policies for cart_items: user can only access own items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_select_own'
  ) THEN
    CREATE POLICY "cart_items_select_own"
    ON public.cart_items
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_modify_own'
  ) THEN
    CREATE POLICY "cart_items_modify_own"
    ON public.cart_items
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

