-- =============================================================================
-- Migration: Fix Remaining Security Lints
-- Date: 2026-04-08
-- Description: Replaces auth.uid() with (SELECT auth.uid()) across other missed RLS
-- policies to trigger initplan caching and reduce execution times.
-- =============================================================================

BEGIN;

DROP POLICY IF EXISTS "user_profiles_read_consolidated" ON public.user_profiles;
CREATE POLICY "user_profiles_read_consolidated"
    ON public.user_profiles FOR SELECT TO authenticated
    USING ( id = (SELECT auth.uid()) OR public.jwt_role() IN ('admin','superadmin') );

DROP POLICY IF EXISTS "user_profiles_insert_consolidated" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_consolidated"
    ON public.user_profiles FOR INSERT TO authenticated
    WITH CHECK ( id = (SELECT auth.uid()) OR public.jwt_role() IN ('admin','superadmin') );

DROP POLICY IF EXISTS "user_profiles_update_consolidated" ON public.user_profiles;
CREATE POLICY "user_profiles_update_consolidated"
    ON public.user_profiles FOR UPDATE TO authenticated
    USING ( id = (SELECT auth.uid()) OR public.jwt_role() IN ('admin','superadmin') )
    WITH CHECK ( id = (SELECT auth.uid()) OR public.jwt_role() IN ('admin','superadmin') );

COMMIT;
