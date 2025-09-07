-- Admin Audit Log table and RLS policies
-- Created: 2025-09-07

-- Ensure pgcrypto is available for gen_random_uuid (already enabled in repo)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

-- RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can read logs
CREATE POLICY IF NOT EXISTS "admin can read logs"
  ON public.admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

-- Only admins/moderators can insert logs
CREATE POLICY IF NOT EXISTS "admin can insert logs"
  ON public.admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

-- No update/delete via clients
-- (No policies defined for UPDATE/DELETE)
