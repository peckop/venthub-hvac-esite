-- Strengthen client_errors SELECT for admins and add email fallback for owner
-- Created: 2025-09-08

-- Ensure authenticated has SELECT privilege (RLS still applies)
GRANT SELECT ON public.client_errors TO authenticated;

-- Allow admins (via JWT role claim) to read client errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='client_errors' AND policyname='client_errors_select_admin_jwt'
  ) THEN
    CREATE POLICY client_errors_select_admin_jwt
      ON public.client_errors FOR SELECT
      TO authenticated
      USING (public.jwt_role() IN ('admin','moderator'));
  END IF;
END $$;

-- Fallback: allow the project owner by email (only this address) to read client errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='client_errors' AND policyname='client_errors_select_owner_email'
  ) THEN
    CREATE POLICY client_errors_select_owner_email
      ON public.client_errors FOR SELECT
      TO authenticated
      USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'recep.varlik@gmail.com');
  END IF;
END $$;

