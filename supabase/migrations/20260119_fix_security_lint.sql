-- ============================================================================
-- Supabase Security Lint Fixes (2026-01-19)
-- Fixes 3 "RLS Policy Always True" warnings by adding proper constraints
-- ============================================================================

-- ============================================================================
-- FIX 1: contact_messages - Add email-based rate limiting
-- ============================================================================

DROP POLICY IF EXISTS "contact_messages_public_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;

-- Create new policy with rate limit: max 3 messages per hour from same email
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        -- Rate limit: same email can send max 3 messages per hour
        (SELECT COUNT(*) FROM public.contact_messages 
         WHERE email = NEW.email 
         AND created_at > NOW() - INTERVAL '1 hour') < 3
    );

-- ============================================================================
-- FIX 2: product_images - Restrict UPDATE to admin only
-- ============================================================================

DROP POLICY IF EXISTS "product_images_update_consolidated" ON public.product_images;
DROP POLICY IF EXISTS "product_images_update_admin" ON public.product_images;

-- Create admin-only UPDATE policy
CREATE POLICY "product_images_update_admin" ON public.product_images
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = (SELECT auth.uid()) 
            AND role IN ('admin', 'superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = (SELECT auth.uid()) 
            AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================================================
-- FIX 3: wizard_selections - Add global rate limiting for anonymous users
-- ============================================================================

DROP POLICY IF EXISTS "ws_anon_insert" ON public.wizard_selections;

-- Create new policy with global rate limit for anonymous users
CREATE POLICY "ws_anon_insert" ON public.wizard_selections 
    FOR INSERT 
    TO anon 
    WITH CHECK (
        -- Anonymous users: global limit of 10 wizard starts per 5 minutes
        -- This prevents spam while still allowing legitimate usage
        (SELECT COUNT(*) FROM public.wizard_selections 
         WHERE user_id IS NULL 
         AND created_at > NOW() - INTERVAL '5 minutes') < 10
    );

-- ============================================================================
-- NOTE: Auth Leaked Password Protection
-- ============================================================================
-- The 4th lint warning (auth_leaked_password_protection) cannot be fixed
-- via migration. It must be enabled manually in Supabase Dashboard:
-- Dashboard → Authentication → Policies → "Enable leaked password protection"
-- ============================================================================

-- ============================================================================
-- Done
-- ============================================================================
