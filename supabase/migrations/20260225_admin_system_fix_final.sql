-- 20260225_admin_system_fix_final.sql
-- Purpose: Final fix for admin tabs and order search
-- Approach: 1) Redefine view_admin_orders with expanded search (TC check via JSONB).
--           2) Apply GRANTS to the CORRECT table names found in public schema.

BEGIN;

-- 1. REDEFINE view_admin_orders with deep search
DROP VIEW IF EXISTS public.view_admin_orders;
CREATE VIEW public.view_admin_orders WITH (security_invoker = true) AS
SELECT 
  o.*,
  o.id::text AS id_text,
  o.conversation_id::text AS conversation_id_text,
  coalesce(o.id::text, '') || ' ' || 
  coalesce(o.conversation_id::text, '') || ' ' || 
  coalesce(o.order_number, '') || ' ' || 
  coalesce(o.customer_email, '') || ' ' || 
  coalesce(o.customer_name, '') || ' ' || 
  coalesce(o.customer_phone, '') || ' ' ||
  coalesce(o.invoice_info::text, '') || ' ' ||
  coalesce(o.billing_address::text, '') || ' ' ||
  coalesce(o.shipping_address::text, '') || ' ' ||
  coalesce(p.full_name, '') AS search_text
FROM public.venthub_orders o
LEFT JOIN public.user_profiles p ON o.user_id = p.id;

-- 2. APPLY GRANTS TO ALL ADMIN CORE TABLES
-- Webhook Tables
GRANT SELECT ON public.returns_webhook_events TO authenticated, service_role;
GRANT SELECT ON public.shipping_webhook_events TO authenticated, service_role;
GRANT SELECT ON public.shipping_email_events TO authenticated, service_role;

-- Error Tables
GRANT SELECT ON public.error_groups TO authenticated, service_role;
GRANT SELECT ON public.client_errors TO authenticated, service_role;

-- Core Admin Tables & Views
GRANT SELECT ON public.admin_audit_log TO authenticated, service_role;
GRANT SELECT ON public.user_profiles TO authenticated, service_role;
GRANT SELECT ON public.venthub_orders TO authenticated, service_role;
GRANT SELECT ON public.view_admin_orders TO authenticated, service_role;

-- 3. ENSURE RLS FOR SYSTEM TABLES (ADMIN ONLY)
-- Error Groups
ALTER TABLE IF EXISTS public.error_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_read_error_groups" ON public.error_groups;
CREATE POLICY "admins_read_error_groups" ON public.error_groups
  FOR SELECT TO authenticated USING (public.is_admin_user());

-- Webhook Events
ALTER TABLE IF EXISTS public.returns_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_read_returns_webhooks" ON public.returns_webhook_events;
CREATE POLICY "admins_read_returns_webhooks" ON public.returns_webhook_events
  FOR SELECT TO authenticated USING (public.is_admin_user());

ALTER TABLE IF EXISTS public.shipping_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_read_shipping_webhooks" ON public.shipping_webhook_events;
CREATE POLICY "admins_read_shipping_webhooks" ON public.shipping_webhook_events
  FOR SELECT TO authenticated USING (public.is_admin_user());

ALTER TABLE IF EXISTS public.shipping_email_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_read_shipping_emails" ON public.shipping_email_events;
CREATE POLICY "admins_read_shipping_emails" ON public.shipping_email_events
  FOR SELECT TO authenticated USING (public.is_admin_user());

COMMIT;
