-- Migration: Resolve database linter warnings (GraphQL exposure, extension schema, public exec checks)
-- Target: pg_graphql, pg_net, is_admin/is_admin_user/is_staff_user/is_user_admin
-- Created: 2026-06-02

BEGIN;

-- ==========================================
-- 1. GraphQL Schema Exposure Cleanup
-- ==========================================
-- The project uses Supabase REST/PostgREST API exclusively (no Apollo client or graphql dependencies).
-- Dropping pg_graphql resolves all 48 lint warnings regarding schema exposure to anon/authenticated.
DROP EXTENSION IF EXISTS pg_graphql CASCADE;


-- ==========================================
-- 2. Extension Schema Hardening
-- ==========================================
-- Move pg_net extension out of public schema to clean extensions schema as recommended by lint 0014.
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION pg_net WITH SCHEMA extensions;


-- ==========================================
-- 3. Revoke Execute Permissions from Anon
-- ==========================================
-- Revoke execution rights from anon/public for administrative query check functions.
-- They remain accessible to authenticated and service_role as required for RLS policy evaluation.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin_user() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_staff_user() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_user_admin(uuid) FROM anon, public;

COMMIT;
