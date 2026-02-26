-- 20260225_admin_system_fix.sql
-- Purpose: Fix broken admin tabs and improve order search capabilities
-- Approach: 1) Redefine view_admin_orders with JSONB search support.
--           2) Ensure all admin views/tables have necessary GRANTS.

BEGIN;

-- 1. REDEFINE view_admin_orders
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
  coalesce(p.full_name, '') AS search_text
FROM public.venthub_orders o
LEFT JOIN public.user_profiles p ON o.user_id = p.id;

-- 2. APPLY GRANTS (Ensuring API can see these)
DO $$
DECLARE
    role_name text;
    table_name text;
    admin_tables text[] := ARRAY[
        'view_admin_orders',
        'admin_audit_log',
        'client_error_groups',
        'client_errors',
        'webhook_events',
        'user_profiles',
        'venthub_orders',
        'venthub_order_items'
    ];
BEGIN
    FOR table_name IN SELECT unnest(admin_tables) LOOP
        -- Grant to authenticated (for Admin Dashboard)
        EXECUTE format('GRANT SELECT ON public.%I TO authenticated', table_name);
        EXECUTE format('GRANT SELECT ON public.%I TO service_role', table_name);
        
        -- Special case for tables that need tracking updates during shipment
        IF table_name IN ('venthub_orders', 'admin_audit_log') THEN
            EXECUTE format('GRANT INSERT, UPDATE ON public.%I TO authenticated', table_name);
            EXECUTE format('GRANT INSERT, UPDATE ON public.%I TO service_role', table_name);
        END IF;
    END LOOP;
END $$;

-- 3. ENSURE RLS POLICIES FOR ADMINS IN SYSTEM TABLES
-- admin_audit_log already has policies (from 20250910_fix_admin_audit_log_policies.sql)
-- Let's ensure client_error_groups and webhook_events are also readable by admins if RLS is enabled.
ALTER TABLE IF EXISTS public.client_error_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_read_error_groups" ON public.client_error_groups;
CREATE POLICY "admins_read_error_groups" ON public.client_error_groups
  FOR SELECT TO authenticated USING (public.is_admin_user());

ALTER TABLE IF EXISTS public.webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_read_webhook_events" ON public.webhook_events;
CREATE POLICY "admins_read_webhook_events" ON public.webhook_events
  FOR SELECT TO authenticated USING (public.is_admin_user());

COMMIT;
