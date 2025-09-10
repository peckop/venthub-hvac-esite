-- 20250910_rls_initplan_rewrite2.sql
-- Purpose: Strengthen RLS initplan optimization by robustly wrapping auth.*() and public.jwt_role() and current_setting('request.jwt.claims')
-- Idempotent approach:
-- 1) First "unwrap" prior SELECT wrappers to avoid double wrapping
-- 2) Then wrap with (select ...)

BEGIN;

DO $$
DECLARE
  r RECORD;
  q TEXT;
  c TEXT;
  new_q TEXT;
  new_c TEXT;
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
      -- Unwrap previous wrappers to normalize
      new_q := regexp_replace(q, '\(\s*select\s+(auth\.[a-z_]+\(\))\s*\)', '\1', 'gi');
      new_q := regexp_replace(new_q, '\(\s*select\s+(public\.jwt_role\(\))\s*\)', '\1', 'gi');
      new_q := regexp_replace(new_q, '\(\s*select\s+current_setting\(\'\'request\.jwt\.claims\'\'([^)]*)\)\s*\)', 'current_setting(\'\'request.jwt.claims\'\'\1)', 'gi');
      -- Wrap
      new_q := regexp_replace(new_q, '(?<!select\s)\y(auth\.[a-z_]+\(\))\y', '(select \1)', 'gi');
      new_q := regexp_replace(new_q, '(?<!select\s)\y(public\.jwt_role\(\))\y', '(select \1)', 'gi');
      new_q := regexp_replace(new_q, '(?<!select\s)current_setting\(\'\'request\.jwt\.claims\'\'([^)]*)\)', '(select current_setting(\'\'request.jwt.claims\'\'\1))', 'gi');
      IF new_q IS DISTINCT FROM q THEN changed := TRUE; END IF;
    ELSE
      new_q := NULL;
    END IF;

    IF c IS NOT NULL THEN
      new_c := regexp_replace(c, '\(\s*select\s+(auth\.[a-z_]+\(\))\s*\)', '\1', 'gi');
      new_c := regexp_replace(new_c, '\(\s*select\s+(public\.jwt_role\(\))\s*\)', '\1', 'gi');
      new_c := regexp_replace(new_c, '\(\s*select\s+current_setting\(\'\'request\.jwt\.claims\'\'([^)]*)\)\s*\)', 'current_setting(\'\'request.jwt.claims\'\'\1)', 'gi');
      new_c := regexp_replace(new_c, '(?<!select\s)\y(auth\.[a-z_]+\(\))\y', '(select \1)', 'gi');
      new_c := regexp_replace(new_c, '(?<!select\s)\y(public\.jwt_role\(\))\y', '(select \1)', 'gi');
      new_c := regexp_replace(new_c, '(?<!select\s)current_setting\(\'\'request\.jwt\.claims\'\'([^)]*)\)', '(select current_setting(\'\'request.jwt.claims\'\'\1))', 'gi');
      IF new_c IS DISTINCT FROM c THEN changed := TRUE; END IF;
    ELSE
      new_c := NULL;
    END IF;

    IF changed THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I %s %s',
                     r.policyname, r.schemaname, r.tablename,
                     COALESCE('USING ('||new_q||')',''),
                     COALESCE('WITH CHECK ('||new_c||')',''));
    END IF;
  END LOOP;
END $$;

COMMIT;

