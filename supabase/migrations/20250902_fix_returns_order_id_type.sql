BEGIN;

-- If venthub_returns.order_id is TEXT, convert it to UUID and (re)create FK to venthub_orders(id)
DO $$
BEGIN
  IF to_regclass('public.venthub_returns') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='venthub_returns'
        AND column_name='order_id' AND data_type='text'
    ) THEN
      -- Drop FK if exists
      BEGIN
        ALTER TABLE public.venthub_returns DROP CONSTRAINT IF EXISTS venthub_returns_order_id_fkey;
      EXCEPTION WHEN undefined_object THEN
        -- continue
        NULL;
      END;

      -- Convert to UUID
      ALTER TABLE public.venthub_returns
        ALTER COLUMN order_id TYPE uuid USING order_id::uuid;

      -- Recreate FK to orders.id (uuid)
      ALTER TABLE public.venthub_returns
        ADD CONSTRAINT venthub_returns_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE CASCADE;
    END IF;
  END IF;
END$$;

COMMIT;
