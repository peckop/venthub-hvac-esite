-- VentHub HVAC: shopping_carts & cart_items RLS + unique constraint
-- Date: 2025-08-28

-- Ensure RLS is enabled (idempotent)
alter table if exists public.shopping_carts enable row level security;
alter table if exists public.cart_items enable row level security;

-- Unique constraint for (cart_id, product_id) to support upsert semantics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cart_items_cart_product_uniq'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_cart_product_uniq UNIQUE (cart_id, product_id);
  END IF;
END
$$;

-- Policies for shopping_carts: user can only access own rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_select_own'
  ) THEN
    CREATE POLICY "shopping_carts_select_own"
    ON public.shopping_carts
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='shopping_carts' AND policyname='shopping_carts_modify_own'
  ) THEN
    CREATE POLICY "shopping_carts_modify_own"
    ON public.shopping_carts
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- Policies for cart_items: user can only access rows belonging to their cart
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='cart_items' AND policyname='cart_items_select_own'
  ) THEN
    CREATE POLICY "cart_items_select_own"
    ON public.cart_items
    FOR SELECT
    USING (
      exists (
        select 1 from public.shopping_carts c
        where c.id = cart_items.cart_id
          and c.user_id = auth.uid()
      )
    );
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
    USING (
      exists (
        select 1 from public.shopping_carts c
        where c.id = cart_items.cart_id
          and c.user_id = auth.uid()
      )
    )
    WITH CHECK (
      exists (
        select 1 from public.shopping_carts c
        where c.id = cart_items.cart_id
          and c.user_id = auth.uid()
      )
    );
  END IF;
END
$$;

