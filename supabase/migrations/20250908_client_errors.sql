-- Client-side error logging table
-- Created: 2025-09-08

CREATE TABLE IF NOT EXISTS public.client_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at timestamptz NOT NULL DEFAULT now(),
  url text NULL,
  message text NOT NULL,
  stack text NULL,
  user_agent text NULL,
  release text NULL,
  env text NULL,
  level text NOT NULL DEFAULT 'error',
  extra jsonb NULL
);

-- Helpful index for sorting/filtering by time
CREATE INDEX IF NOT EXISTS idx_client_errors_at ON public.client_errors (at);

-- Enable RLS
ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;

-- Allow only admins/moderators to read logs
CREATE POLICY IF NOT EXISTS "admin can read client errors"
  ON public.client_errors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

-- No INSERT/UPDATE/DELETE policies for authenticated users; inserts should come via service role in Edge Function.
