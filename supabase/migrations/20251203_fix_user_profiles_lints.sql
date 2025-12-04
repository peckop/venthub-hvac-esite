-- Fix User Profiles Performance Lints: Drop merged and redundant policies

-- user_profiles
DROP POLICY IF EXISTS merged_user_profiles_authenticated_delete ON public.user_profiles;
DROP POLICY IF EXISTS merged_user_profiles_authenticated_select ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_own ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_self ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_service ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_select_admin ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update_admin ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update_self ON public.user_profiles;

CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT
  USING ( id = (SELECT auth.uid()) OR (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY user_profiles_insert_policy ON public.user_profiles FOR INSERT
  WITH CHECK ( id = (SELECT auth.uid()) OR (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY user_profiles_update_policy ON public.user_profiles FOR UPDATE
  USING ( id = (SELECT auth.uid()) OR (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );

CREATE POLICY user_profiles_delete_policy ON public.user_profiles FOR DELETE
  USING ( (SELECT is_admin_user()) OR (SELECT auth.role()) = 'service_role' );
