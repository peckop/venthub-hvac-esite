-- Broaden error_groups RLS to allow admin/moderator by DB role as well as JWT claim
-- Created: 2025-09-08

-- SELECT policy via user_profiles (non-recursive, safe)
CREATE POLICY IF NOT EXISTS error_groups_select_admin_db
  ON public.error_groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

-- UPDATE policy via user_profiles (for status/assigned_to/notes changes)
CREATE POLICY IF NOT EXISTS error_groups_update_admin_db
  ON public.error_groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

