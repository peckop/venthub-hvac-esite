-- 20260225_admin_audit_log_fix.sql
-- Purpose: Fix 500 Internal Server Error in admin_audit_log by streamlining RLS and removing recursion.
-- Created: 2026-02-25

BEGIN;

-- 1. CLEANUP: Drop all possible existing RLS policies for admin_audit_log
-- This ensures a clean slate and avoids conflicts between old direct-query policies and new function-based ones.
DROP POLICY IF EXISTS "admin can read logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "admin can insert logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "admin_audit_log_select_admins" ON public.admin_audit_log;
DROP POLICY IF EXISTS "admin_audit_log_insert_admins" ON public.admin_audit_log;

-- 2. CREATE STABLE POLICIES: Use public.is_admin_user() which is SECURITY DEFINER
-- Using a SECURITY DEFINER function is the best practice for RLS because it:
-- A) Prevents infinite recursion (circular policy dependencies)
-- B) Simplifies policy management by centralizing admin logic
CREATE POLICY "admin_audit_log_select_v2" 
  ON public.admin_audit_log
  FOR SELECT 
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admin_audit_log_insert_v2" 
  ON public.admin_audit_log
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_admin_user());

-- 3. ENSURE GRANTS: Refresh access for authenticated and service roles
GRANT SELECT ON public.admin_audit_log TO authenticated, service_role;

-- 4. Audit Log View Permissions (If it exists as a view anywhere)
-- Currently it's a table, but we ensure systematic access.

COMMIT;
