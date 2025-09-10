-- 20250910_fix_admin_audit_log_policies.sql
-- Purpose: Ensure admin_audit_log has explicit RLS policies (Advisor: RLS enabled but no policies)
-- Approach: Idempotently (re)create SELECT/INSERT policies limited to admin/moderator via user_profiles.
-- Generated: 2025-09-10

BEGIN;

-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at timestamptz NOT NULL DEFAULT now(),
  actor uuid NULL DEFAULT auth.uid(),
  table_name text NOT NULL,
  row_pk text NULL,
  action text NOT NULL,
  before jsonb NULL,
  after jsonb NULL,
  comment text NULL
);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies if present (to avoid duplicates / quoted names)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_audit_log' AND policyname='admin can read logs'
  ) THEN
    DROP POLICY "admin can read logs" ON public.admin_audit_log;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_audit_log' AND policyname='admin can insert logs'
  ) THEN
    DROP POLICY "admin can insert logs" ON public.admin_audit_log;
  END IF;
END $$;

-- CREATE SELECT policy (admins/moderators)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_audit_log' AND policyname='admin_audit_log_select_admins'
  ) THEN
    CREATE POLICY admin_audit_log_select_admins
      ON public.admin_audit_log
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
        )
      );
  END IF;
END $$;

-- CREATE INSERT policy (admins/moderators)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_audit_log' AND policyname='admin_audit_log_insert_admins'
  ) THEN
    CREATE POLICY admin_audit_log_insert_admins
      ON public.admin_audit_log
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
        )
      );
  END IF;
END $$;

-- NOTE: No UPDATE/DELETE policies (disallow by default)

COMMIT;

