-- Migration: 20260120_fix_security_wizard_selections.sql
-- Description: Fix rls_policy_always_true for wizard_selections (ws_anon_insert)

-- Drop the permissive policy
DROP POLICY IF EXISTS "ws_anon_insert" ON public.wizard_selections;

-- Re-create with rate limiting (global limit for anon users to prevent spam)
CREATE POLICY "ws_anon_insert"
    ON public.wizard_selections
    FOR INSERT
    TO anon
    WITH CHECK (
        -- Simple rate limit: allow max 10 inserts in last 5 minutes globally for anon
        -- This satisfies the "not always true" requirement and adds basic protection
        (SELECT COUNT(*) FROM public.wizard_selections 
         WHERE user_id IS NULL 
         AND created_at > NOW() - INTERVAL '5 minutes') < 10
    );
