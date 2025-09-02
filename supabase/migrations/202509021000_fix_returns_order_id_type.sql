BEGIN;

-- Align venthub_returns.order_id type to venthub_orders.id, then (re)create FK and policy.
DO $$
DECLARE
  v_orders_type text;
  v_returns_type text;
BEGIN
  IF to_regclass('public.venthub_orders') IS NULL OR to_regclass('public.venthub_returns') IS NULL THEN
    RETURN;
  END IF;

  SELECT data_type INTO v_orders_type
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='venthub_orders' AND column_name='id';

  SELECT data_type INTO v_returns_type
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='venthub_returns' AND column_name='order_id';

  IF v_orders_type IS NULL OR v_returns_type IS NULL THEN
    RETURN;
  END IF;

  IF v_orders_type <> v_returns_type THEN
    -- Drop dependent objects
    BEGIN
      DROP POLICY IF EXISTS returns_insert_own_order ON public.venthub_returns;
    EXCEPTION WHEN undefined_object THEN NULL; END;
    BEGIN
      ALTER TABLE public.venthub_returns DROP CONSTRAINT IF EXISTS venthub_returns_order_id_fkey;
    EXCEPTION WHEN undefined_object THEN NULL; END;

    -- Convert returns.order_id to match orders.id type
    IF v_orders_type = 'uuid' THEN
      EXECUTE 'ALTER TABLE public.venthub_returns ALTER COLUMN order_id TYPE uuid USING order_id::uuid';
    ELSIF v_orders_type = 'text' THEN
      EXECUTE 'ALTER TABLE public.venthub_returns ALTER COLUMN order_id TYPE text USING order_id::text';
    ELSE
      -- Unsupported type; do nothing
      RETURN;
    END IF;

    -- Recreate FK
    EXECUTE 'ALTER TABLE public.venthub_returns ADD CONSTRAINT venthub_returns_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE CASCADE';

    -- Recreate policy (idempotent)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='venthub_returns' AND policyname='returns_insert_own_order'
    ) THEN
      CREATE POLICY returns_insert_own_order
        ON public.venthub_returns FOR INSERT
        WITH CHECK (
          user_id = auth.uid()
          AND EXISTS (
            SELECT 1 FROM public.venthub_orders o
            WHERE o.id = order_id AND o.user_id = auth.uid()
          )
        );
    END IF;
  END IF;
END$$;

COMMIT;
