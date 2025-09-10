-- Normalize RLS policy expressions v6: extend replacements for current_setting with ::text variants
CREATE OR REPLACE FUNCTION public._normalize_rls_expr(expr text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  s text;
BEGIN
  IF expr IS NULL THEN RETURN NULL; END IF;
  s := expr;

  -- unwrap existing wrappers
  s := replace(s, '(select auth.uid())', 'auth.uid()');
  s := replace(s, '(SELECT auth.uid())', 'auth.uid()');
  s := replace(s, '(select auth.role())', 'auth.role()');
  s := replace(s, '(SELECT auth.role())', 'auth.role()');
  s := replace(s, '(select public.jwt_role())', 'public.jwt_role()');
  s := replace(s, '(SELECT public.jwt_role())', 'public.jwt_role()');
  s := replace(s, '(select current_setting(''request.jwt.claims''))', 'current_setting(''request.jwt.claims'')');
  s := replace(s, '(SELECT current_setting(''request.jwt.claims''))', 'current_setting(''request.jwt.claims'')');

  -- normalize current_setting variants (with/without ::text and boolean arg)
  s := replace(s, 'current_setting(''request.jwt.claims''::text, true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text,true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text, FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text,FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'', true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'',true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'', FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'',FALSE)', 'current_setting(''request.jwt.claims'')');

  -- re-wrap
  s := replace(s, 'auth.uid()', '(select auth.uid())');
  s := replace(s, 'auth.role()', '(select auth.role())');
  s := replace(s, 'public.jwt_role()', '(select public.jwt_role())');
  s := replace(s, 'current_setting(''request.jwt.claims'')', '(select current_setting(''request.jwt.claims''))');

  RETURN s;
END
$$;

-- Re-apply to all public policies
DO $$
DECLARE
  pol RECORD;
  new_using text;
  new_check text;
  sql text;
BEGIN
  FOR pol IN
    SELECT n.nspname AS schemaname, c.relname AS tablename, p.polname, p.polrelid,
           pg_get_expr(p.polqual, p.polrelid) AS using_expr,
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
      IF new_using IS NOT NULL THEN sql := sql || format(' USING (%s)', new_using); END IF;
      IF new_check IS NOT NULL THEN sql := sql || format(' WITH CHECK (%s)', new_check); END IF;
      EXECUTE sql;
    END IF;
  END LOOP;
END
$$ LANGUAGE plpgsql;
