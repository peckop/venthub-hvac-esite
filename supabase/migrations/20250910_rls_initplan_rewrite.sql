-- 20250910_rls_initplan_rewrite.sql
-- Purpose: Optimize RLS policies by avoiding per-row re-evaluation of auth.* and current_setting
-- Strategy: For all public schema policies, rewrite occurrences of:
--   auth.uid()                  -> (select auth.uid())
--   public.jwt_role()           -> (select public.jwt_role())
--   current_setting('request.jwt.claims' ...) -> (select current_setting('request.jwt.claims' ...))
-- Applies to both USING and WITH CHECK expressions when present.
-- Notes:
-- - Idempotent: running again will not introduce double wrappers due to exact-match replacement.
-- - Limited to schemaname='public'. Adjust if needed.

BEGIN;

DO $$
DECLARE
  r RECORD;
  new_qual TEXT;
  new_check TEXT;
  stmt TEXT;
  changed BOOLEAN;
BEGIN
  FOR r IN
    SELECT 
      pol.schemaname,
      pol.tablename,
      pol.policyname,
      pg_get_expr(pol.polqual, pol.polrelid)       AS qual,
      pg_get_expr(pol.polwithcheck, pol.polrelid)  AS withcheck
    FROM pg_policies pol
    WHERE pol.schemaname = 'public'
  LOOP
    changed := FALSE;
    new_qual := r.qual;
    new_check := r.withcheck;

    IF new_qual IS NOT NULL THEN
      -- auth.uid() -> (select auth.uid())
      new_qual := regexp_replace(new_qual, '\mauth\.uid\(\)\M', '(select auth.uid())', 'g');
      -- public.jwt_role() -> (select public.jwt_role())
      new_qual := regexp_replace(new_qual, '\mpublic\.jwt_role\(\)\M', '(select public.jwt_role())', 'g');
      -- current_setting('request.jwt.claims' -> (select current_setting('request.jwt.claims'
      new_qual := regexp_replace(new_qual, 'current_setting\(''request\.jwt\.claims''', '(select current_setting(''request.jwt.claims''', 'g');
      IF new_qual IS DISTINCT FROM r.qual THEN
        changed := TRUE;
      END IF;
    END IF;

    IF new_check IS NOT NULL THEN
      new_check := regexp_replace(new_check, '\mauth\.uid\(\)\M', '(select auth.uid())', 'g');
      new_check := regexp_replace(new_check, '\mpublic\.jwt_role\(\)\M', '(select public.jwt_role())', 'g');
      new_check := regexp_replace(new_check, 'current_setting\(''request\.jwt\.claims''', '(select current_setting(''request.jwt.claims''', 'g');
      IF new_check IS NOT DISTINCT FROM r.withcheck THEN
        -- no-op
      ELSE
        changed := TRUE;
      END IF;
    END IF;

    IF changed THEN
      stmt := format('ALTER POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
      IF new_qual IS NOT NULL THEN
        stmt := stmt || ' USING (' || new_qual || ')';
      END IF;
      IF new_check IS NOT NULL THEN
        stmt := stmt || ' WITH CHECK (' || new_check || ')';
      END IF;
      EXECUTE stmt;
    END IF;
  END LOOP;
END $$;

COMMIT;

