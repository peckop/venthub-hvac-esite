BEGIN;

-- Audit table for mock refunds (optional)
CREATE TABLE IF NOT EXISTS public.order_refund_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL,
  reason text NULL,
  actor_user_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_refund_events ENABLE ROW LEVEL SECURITY;

-- Policies: insert by service_role; select by admin/superadmin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_refund_events' AND policyname='order_refund_events_service_insert') THEN
    EXECUTE $$
      CREATE POLICY order_refund_events_service_insert
      ON public.order_refund_events
      FOR INSERT TO service_role
      WITH CHECK (true);
    $$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_refund_events' AND policyname='order_refund_events_admin_select') THEN
    EXECUTE $$
      CREATE POLICY order_refund_events_admin_select
      ON public.order_refund_events
      FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')));
    $$;
  END IF;
END$$;

COMMIT;
