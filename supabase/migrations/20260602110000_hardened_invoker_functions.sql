-- Migration: Convert RLS helpers and public search to SECURITY INVOKER
-- Target: jwt_tenant_id, is_admin_user, is_admin, is_staff_user, is_user_admin, get_products_enriched
-- Created: 2026-06-02

BEGIN;

ALTER FUNCTION public.jwt_tenant_id() SECURITY INVOKER;
ALTER FUNCTION public.is_admin_user() SECURITY INVOKER;
ALTER FUNCTION public.is_admin() SECURITY INVOKER;
ALTER FUNCTION public.is_staff_user() SECURITY INVOKER;
ALTER FUNCTION public.is_user_admin(uuid) SECURITY INVOKER;
ALTER FUNCTION public.get_products_enriched(uuid[], integer, integer, text, text, text, numeric, numeric) SECURITY INVOKER;

COMMIT;
