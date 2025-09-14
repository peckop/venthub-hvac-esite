BEGIN;

-- 20250914_security_rls_email_events_and_search_path.sql
-- Purpose:
-- 1) Enable RLS on email audit tables in public schema
-- 2) Add admin-only SELECT policies (optional but avoids "no policy" info)
-- 3) Set safe search_path for enforce_role_change() trigger function

-- 1) Enable RLS on shipping_email_events and order_email_events if they exist
ALTER TABLE IF EXISTS public.shipping_email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_email_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.returns_webhook_events ENABLE ROW LEVEL SECURITY;

-- 2) Admin-only SELECT policies (idempotent via pg_policies check)
DO $$
BEGIN
  -- shipping_email_events admin select
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='shipping_email_events'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shipping_email_events' AND policyname='shipping_email_events_admin_select'
  ) THEN
    EXECUTE $$
      CREATE POLICY shipping_email_events_admin_select
      ON public.shipping_email_events
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid()
            AND up.role IN ('admin','superadmin')
        )
      );
    $$;
  END IF;

  -- order_email_events admin select
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='order_email_events'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_email_events' AND policyname='order_email_events_admin_select'
  ) THEN
    EXECUTE $$
      CREATE POLICY order_email_events_admin_select
      ON public.order_email_events
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid()
            AND up.role IN ('admin','superadmin')
        )
      );
    $$;
  END IF;

  -- returns_webhook_events admin select (silence INFO and allow admin inspection)
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='returns_webhook_events'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='returns_webhook_events' AND policyname='returns_webhook_events_admin_select'
  ) THEN
    EXECUTE $$
      CREATE POLICY returns_webhook_events_admin_select
      ON public.returns_webhook_events
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid()
            AND up.role IN ('admin','superadmin')
        )
      );
    $$;
  END IF;
END$$;

-- 3) Harden search_path for trigger function public.enforce_role_change()
DO $$
DECLARE
  fn_oid oid;
BEGIN
  SELECT p.oid INTO fn_oid
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname = 'enforce_role_change'
    AND pg_catalog.pg_get_function_identity_arguments(p.oid) = '';

  IF fn_oid IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.enforce_role_change() SET search_path = pg_catalog, public;';
  END IF;
END$$;

COMMIT;
