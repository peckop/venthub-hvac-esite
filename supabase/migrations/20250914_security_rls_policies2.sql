BEGIN;

-- 20250914_security_rls_policies2.sql
-- Purpose: Add explicit RLS policies (service_role insert, admin select) for email audit tables
--          and ensure returns_webhook_events also has policies. Re-apply safe search_path for enforce_role_change().

-- Ensure RLS is enabled (idempotent)
ALTER TABLE IF EXISTS public.shipping_email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_email_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.returns_webhook_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- shipping_email_events policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='shipping_email_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shipping_email_events' AND policyname='shipping_email_events_service_insert'
    ) THEN
      EXECUTE $$
        CREATE POLICY shipping_email_events_service_insert
        ON public.shipping_email_events
        FOR INSERT TO service_role
        WITH CHECK (true);
      $$;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shipping_email_events' AND policyname='shipping_email_events_admin_select'
    ) THEN
      EXECUTE $$
        CREATE POLICY shipping_email_events_admin_select
        ON public.shipping_email_events
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')
          )
        );
      $$;
    END IF;
  END IF;

  -- order_email_events policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='order_email_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_email_events' AND policyname='order_email_events_service_insert'
    ) THEN
      EXECUTE $$
        CREATE POLICY order_email_events_service_insert
        ON public.order_email_events
        FOR INSERT TO service_role
        WITH CHECK (true);
      $$;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_email_events' AND policyname='order_email_events_admin_select'
    ) THEN
      EXECUTE $$
        CREATE POLICY order_email_events_admin_select
        ON public.order_email_events
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')
          )
        );
      $$;
    END IF;
  END IF;

  -- returns_webhook_events policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='returns_webhook_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='returns_webhook_events' AND policyname='returns_webhook_events_service_insert'
    ) THEN
      EXECUTE $$
        CREATE POLICY returns_webhook_events_service_insert
        ON public.returns_webhook_events
        FOR INSERT TO service_role
        WITH CHECK (true);
      $$;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='returns_webhook_events' AND policyname='returns_webhook_events_admin_select'
    ) THEN
      EXECUTE $$
        CREATE POLICY returns_webhook_events_admin_select
        ON public.returns_webhook_events
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin','superadmin')
          )
        );
      $$;
    END IF;
  END IF;
END$$;

-- Re-apply safe search_path for enforce_role_change()
DO $$
DECLARE fn_oid oid;
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
