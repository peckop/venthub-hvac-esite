-- =============================================================================
-- Migration: Fix contact_messages RLS
-- Date: 2026-04-08
-- Description: Replaces auth.uid() with (SELECT auth.uid()) to trigger
-- PostgreSQL's initplan caching and reduce row-by-row execution times,
-- fixing the initplan performance vulnerability and type linting issues.
-- =============================================================================

BEGIN;

DROP POLICY IF EXISTS "Admins can view messages" ON public.contact_messages;

CREATE POLICY "Admins can view messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = (SELECT auth.uid())
        AND role IN ('admin', 'superadmin')
    )
);

COMMIT;
