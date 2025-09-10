-- 20250910_rls_initplan_rewrite3.sql
-- Purpose: Final pass to wrap auth.uid(), auth.role(), public.jwt_role(), current_setting('request.jwt.claims')
-- using simple text replace to maximize coverage and avoid regex engine quirks.
-- This is idempotent: running multiple times does not change expressions further.

BEGIN;

DO $$
DECLARE
  r RECORD;
  q TEXT;
  c TEXT;
  nq TEXT;
  nc TEXT;
  changed BOOLEAN;
BEGIN
  FOR r IN
    SELECT pol.schemaname, pol.tablename, pol.policyname,
           pg_get_expr(pol.polqual, pol.polrelid)      AS qual,
           pg_get_expr(pol.polwithcheck, pol.polrelid) AS withcheck
    FROM pg_policies pol
    WHERE pol.schemaname = 'public'
  LOOP
    changed := FALSE;
    q := r.qual; c := r.withcheck;

    IF q IS NOT NULL THEN
      nq := q;
      -- Unwrap any previous wrappers
      nq := replace(nq, '(select auth.uid())', 'auth.uid()');
      nq := replace(nq, '(select auth.role())', 'auth.role()');
      nq := replace(nq, '(select public.jwt_role())', 'public.jwt_role()');
      nq := replace(nq, '(select current_setting(''request.jwt.claims''', 'current_setting(''request.jwt.claims''');
      -- Wrap
      nq := replace(nq, 'auth.uid()', '(select auth.uid())');
      nq := replace(nq, 'auth.role()', '(select auth.role())');
      nq := replace(nq, 'public.jwt_role()', '(select public.jwt_role())');
      nq := replace(nq, 'current_setting(''request.jwt.claims''', '(select current_setting(''request.jwt.claims''');
      IF nq IS DISTINCT FROM q THEN changed := TRUE; END IF;
    ELSE
      nq := NULL;
    END IF;

    IF c IS NOT NULL THEN
      nc := c;
      -- Unwrap
      nc := replace(nc, '(select auth.uid())', 'auth.uid()');
      nc := replace(nc, '(select auth.role())', 'auth.role()');
      nc := replace(nc, '(select public.jwt_role())', 'public.jwt_role()');
      nc := replace(nc, '(select current_setting(''request.jwt.claims''', 'current_setting(''request.jwt.claims''');
      -- Wrap
      nc := replace(nc, 'auth.uid()', '(select auth.uid())');
      nc := replace(nc, 'auth.role()', '(select auth.role())');
      nc := replace(nc, 'public.jwt_role()', '(select public.jwt_role())');
      nc := replace(nc, 'current_setting(''request.jwt.claims''', '(select current_setting(''request.jwt.claims''');
      IF nc IS DISTINCT FROM c THEN changed := TRUE; END IF;
    ELSE
      nc := NULL;
    END IF;

    IF changed THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I%s%s',
                     r.policyname, r.schemaname, r.tablename,
                     CASE WHEN nq IS NOT NULL THEN ' USING ('||nq||')' ELSE '' END,
                     CASE WHEN nc IS NOT NULL THEN ' WITH CHECK ('||nc||')' ELSE '' END);
    END IF;
  END LOOP;
END $$;

COMMIT;

