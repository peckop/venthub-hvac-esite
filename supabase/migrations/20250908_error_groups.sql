-- Error groups for client-side logging aggregation
-- Created: 2025-09-08

CREATE TABLE IF NOT EXISTS public.error_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signature text UNIQUE NOT NULL,
  level text NOT NULL DEFAULT 'error',
  last_message text NULL,
  url_sample text NULL,
  env text NULL,
  release text NULL,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  count bigint NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'open', -- open | resolved | ignored
  assigned_to uuid NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  notes text NULL
);

ALTER TABLE public.error_groups ENABLE ROW LEVEL SECURITY;

-- Admin/moderator can read/update
CREATE POLICY IF NOT EXISTS error_groups_select_admin ON public.error_groups
  FOR SELECT TO authenticated
  USING (public.jwt_role() IN ('admin','moderator'));

CREATE POLICY IF NOT EXISTS error_groups_update_admin ON public.error_groups
  FOR UPDATE TO authenticated
  USING (public.jwt_role() IN ('admin','moderator'))
  WITH CHECK (public.jwt_role() IN ('admin','moderator'));

-- No INSERT policy: insert via service role (Edge Function)

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_error_groups_last_seen ON public.error_groups(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_error_groups_count ON public.error_groups(count DESC);

-- Link raw errors to groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='client_errors' AND column_name='group_id'
  ) THEN
    ALTER TABLE public.client_errors
      ADD COLUMN group_id uuid NULL REFERENCES public.error_groups(id) ON DELETE SET NULL;
  END IF;
END $$;
