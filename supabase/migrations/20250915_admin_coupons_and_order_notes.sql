BEGIN;

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('percent','fixed')),
  value numeric(12,2) NOT NULL,
  starts_at timestamptz NULL,
  ends_at timestamptz NULL,
  active boolean NOT NULL DEFAULT true,
  usage_limit int NULL,
  used_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Order notes
CREATE TABLE IF NOT EXISTS public.order_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.venthub_orders(id) ON DELETE CASCADE,
  user_id uuid NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Order attachments (url based)
CREATE TABLE IF NOT EXISTS public.order_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.venthub_orders(id) ON DELETE CASCADE,
  url text NOT NULL,
  filename text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;

-- Policies: admin (authenticated with role admin/superadmin) can SELECT/INSERT/UPDATE/DELETE; service_role can insert as needed
DO $$
BEGIN
  -- coupons
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='coupons' AND policyname='coupons_admin_all') THEN
    EXECUTE $$
      CREATE POLICY coupons_admin_all ON public.coupons
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')));
    $$;
  END IF;

  -- order_notes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_notes' AND policyname='order_notes_admin_all') THEN
    EXECUTE $$
      CREATE POLICY order_notes_admin_all ON public.order_notes
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')));
    $$;
  END IF;

  -- order_attachments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_attachments' AND policyname='order_attachments_admin_all') THEN
    EXECUTE $$
      CREATE POLICY order_attachments_admin_all ON public.order_attachments
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')));
    $$;
  END IF;
END$$;

COMMIT;
