-- Migration: 20260225_admin_orders_search_view.sql
-- Description: Creates a secure view for unified searching across UUIDs and text columns.

BEGIN;

DROP VIEW IF EXISTS public.view_admin_orders;

CREATE VIEW public.view_admin_orders WITH (security_invoker = true) AS
SELECT 
  *,
  id::text AS id_text,
  conversation_id::text AS conversation_id_text,
  coalesce(id::text, '') || ' ' || 
  coalesce(conversation_id::text, '') || ' ' || 
  coalesce(order_number, '') || ' ' || 
  coalesce(customer_email, '') || ' ' || 
  coalesce(customer_name, '') || ' ' || 
  coalesce(customer_phone, '') AS search_text
FROM public.venthub_orders;

-- Grant permissions matching venthub_orders
GRANT SELECT, INSERT, UPDATE, DELETE ON public.view_admin_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.view_admin_orders TO service_role;

-- Ensure public cannot access directly (although RLS handles it, good practice)
REVOKE ALL ON public.view_admin_orders FROM anon;
REVOKE ALL ON public.view_admin_orders FROM public;

COMMIT;
