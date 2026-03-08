-- Migration: Fix Supabase Security Advisor Warnings
-- 1. Security Definer Views (change to Security Invoker)
-- 2. Multiple Permissive Policies (drop redundant merged_* policies)

-- =================================================================================
-- 1. Fix Security Definer Views
-- =================================================================================
DO $$
BEGIN
  -- inventory_summary view
  PERFORM 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'inventory_summary';
  IF FOUND THEN
    ALTER VIEW public.inventory_summary SET (security_invoker = on);
  END IF;

  -- inventory_velocity view
  PERFORM 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'inventory_velocity';
  IF FOUND THEN
    ALTER VIEW public.inventory_velocity SET (security_invoker = on);
  END IF;
END $$;


-- =================================================================================
-- 2. Fix Multiple Permissive Policies
-- =================================================================================
-- The tables below have multiple permissive policies for the 'authenticated' role.
-- We keep the primary custom policies (e.g., admin_audit_log_insert_v2)
-- and drop the generic/auto-generated 'merged_*' overlapping policies.

DROP POLICY IF EXISTS "merged_admin_audit_log_authenticated_insert" ON public.admin_audit_log;
DROP POLICY IF EXISTS "merged_admin_audit_log_authenticated_select" ON public.admin_audit_log;

DROP POLICY IF EXISTS "merged_error_groups_authenticated_select" ON public.error_groups;

DROP POLICY IF EXISTS "merged_returns_webhook_events_authenticated_select" ON public.returns_webhook_events;

DROP POLICY IF EXISTS "merged_shipping_email_events_authenticated_select" ON public.shipping_email_events;

DROP POLICY IF EXISTS "merged_shipping_webhook_events_authenticated_select" ON public.shipping_webhook_events;
