-- =============================================================================
-- Migration: Fix Remaining Security Lints
-- Date: 2026-04-08
-- Description: Replaces auth.uid() with (SELECT auth.uid()) across other missed RLS
-- policies to trigger initplan caching and reduce execution times.
-- =============================================================================

BEGIN;

DROP POLICY IF EXISTS "shipping_email_events_admin_all" ON public.shipping_email_events;
CREATE POLICY "shipping_email_events_admin_all" ON public.shipping_email_events
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')
        )
    );

DROP POLICY IF EXISTS "order_refund_events_admin_all" ON public.order_refund_events;
CREATE POLICY "order_refund_events_admin_all" ON public.order_refund_events
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')
        )
    );

DROP POLICY IF EXISTS "returns_webhook_events_admin_all" ON public.returns_webhook_events;
CREATE POLICY "returns_webhook_events_admin_all" ON public.returns_webhook_events
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')
        )
    );

DROP POLICY IF EXISTS "coupons_admin_all" ON public.coupons;
CREATE POLICY "coupons_admin_all" ON public.coupons
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')));

DROP POLICY IF EXISTS "order_notes_admin_all" ON public.order_notes;
CREATE POLICY "order_notes_admin_all" ON public.order_notes
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')));

DROP POLICY IF EXISTS "order_attachments_admin_all" ON public.order_attachments;
CREATE POLICY "order_attachments_admin_all" ON public.order_attachments
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = (SELECT auth.uid()) AND up.role IN ('admin','superadmin')));

DROP POLICY IF EXISTS "Users can read own non-internal notes" ON public.order_notes;
CREATE POLICY "Users can read own non-internal notes" ON public.order_notes
    FOR SELECT TO authenticated
    USING (NOT is_internal AND order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can read own non-internal attachments" ON public.order_attachments;
CREATE POLICY "Users can read own non-internal attachments" ON public.order_attachments
    FOR SELECT TO authenticated
    USING (NOT is_internal AND order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid())));


COMMIT;
