-- Normalize RLS policy expressions to avoid per-row re-evaluation of auth.* and current_setting() calls
-- This migration creates a helper normalizer and rewrites all public schema policies accordingly.

-- 1) Helper function to normalize a single expression text
CREATE OR REPLACE FUNCTION public._normalize_rls_expr(expr text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE WHEN $1 IS NULL THEN NULL ELSE
    -- Unwrap then wrap common function calls to ensure a single (select ...) wrapper
    -- Start from input and apply nested regexp_replace calls
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    -- auth.uid()
                    regexp_replace(
                      regexp_replace($1, '\\(select\\s+auth\\.uid\\s*\\(\\s*\\)\\)', 'auth.uid()', 'gi'),
                      'auth\\.uid\\s*\\(\\s*\\)', '(select auth.uid())', 'gi'
                    ),
                    -- auth.role()
                    '\\(select\\s+auth\\.role\\s*\\(\\s*\\)\\)', 'auth.role()', 'gi'
                  ),
                  'auth\\.role\\s*\\(\\s*\\)', '(select auth.role())', 'gi'
                ),
                -- public.jwt_role()
                '\\(select\\s+public\\.jwt_role\\s*\\(\\s*\\)\\)', 'public.jwt_role()', 'gi'
              ),
              'public\\.jwt_role\\s*\\(\\s*\\)', '(select public.jwt_role())', 'gi'
            ),
            -- current_setting('request.jwt.claims') with optional second arg
            '\\(select\\s+current_setting\\(\\s*''request\\.jwt\\.claims''(?:\\s*,\\s*true)?\\s*\\)\\)', 'current_setting(''request.jwt.claims'')', 'gi'
          ),
          'current_setting\\(\\s*''request\\.jwt\\.claims''(?:\\s*,\\s*true)?\\s*\\)', '(select current_setting(''request.jwt.claims''))', 'gi'
        ),
        -- Optional: auth.email()
        '\\(select\\s+auth\\.email\\s*\\(\\s*\\)\\)', 'auth.email()', 'gi'
      ),
      'auth\\.email\\s*\\(\\s*\\)', '(select auth.email())', 'gi'
    )
  END
$$;

-- 2) Rewrite all policies in public schema to use normalized expressions
DO $$
DECLARE
  pol RECORD;
  new_using text;
  new_check text;
  sql text;
BEGIN
  FOR pol IN
    SELECT n.nspname AS schemaname,
           c.relname AS tablename,
           p.polname,
           p.polrelid,
           pg_get_expr(p.polqual, p.polrelid)      AS using_expr,
           pg_get_expr(p.polwithcheck, p.polrelid) AS check_expr
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
  LOOP
    new_using := public._normalize_rls_expr(pol.using_expr);
    new_check := public._normalize_rls_expr(pol.check_expr);

    IF (new_using IS DISTINCT FROM pol.using_expr) OR (new_check IS DISTINCT FROM pol.check_expr) THEN
      sql := format('ALTER POLICY %I ON %I.%I', pol.polname, pol.schemaname, pol.tablename);
      IF new_using IS NOT NULL THEN
        sql := sql || format(' USING (%s)', new_using);
      END IF;
      IF new_check IS NOT NULL THEN
        sql := sql || format(' WITH CHECK (%s)', new_check);
      END IF;
      EXECUTE sql;
    END IF;
  END LOOP;
END
$$ LANGUAGE plpgsql;

