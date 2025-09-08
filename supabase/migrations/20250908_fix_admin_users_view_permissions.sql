-- Fix admin_users view permissions and allow selecting admin rows from user_profiles
-- Created: 2025-09-08

-- Ensure the admin_users view runs with owner's privileges (not invoker)
ALTER VIEW public.admin_users SET (security_invoker = off);

-- Grant read access to signed-in users (PostgREST "authenticated" role)
GRANT SELECT ON public.admin_users TO authenticated;

-- RLS: allow authenticated users to SELECT only admin/moderator rows from user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_admin_list'
  ) THEN
    CREATE POLICY user_profiles_select_admin_list
      ON public.user_profiles FOR SELECT
      TO authenticated
      USING (role IN ('admin','moderator'));
  END IF;
END $$;

