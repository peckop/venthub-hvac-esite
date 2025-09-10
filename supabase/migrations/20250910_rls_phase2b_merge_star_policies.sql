-- Phase 2B: Merge permissive policies that use polcmd='*' into per-action merged policies and remove role from originals
-- Rationale: Advisor flags multiple permissive policies per role+action; wildcard policies count for every action and cause duplicates.

DO $$
DECLARE
  t RECORD;
  r RECORD;
  pol RECORD;
  actions text[] := ARRAY['r','a','w','d'];
  cmd text;
  cmdname text;
  using_expr text;
  check_expr text;
  merged_name text;
  exists_count int;
  q text;
BEGIN
  -- Iterate public tables
  FOR t IN
    SELECT n.nspname AS schemaname, c.relname AS tablename, c.oid AS relid
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    -- Roles appearing on any permissive wildcard policy
    FOR r IN
      WITH roles AS (
        SELECT DISTINCT unnest(p.polroles) AS role_oid
        FROM pg_policy p
        WHERE p.polpermissive = true AND p.polrelid = t.relid AND p.polcmd = '*'
      )
      SELECT rol.rolname, rol.oid FROM roles JOIN pg_roles rol ON rol.oid = roles.role_oid
    LOOP
      -- For each wildcard policy of this role
      FOR pol IN
        SELECT p.oid, p.polname,
               pg_get_expr(p.polqual, p.polrelid)      AS using_expr,
               pg_get_expr(p.polwithcheck, p.polrelid) AS check_expr
        FROM pg_policy p
        WHERE p.polpermissive = true AND p.polrelid = t.relid AND p.polcmd = '*' AND (r.oid = ANY (p.polroles))
      LOOP
        using_expr := public._normalize_rls_expr(pol.using_expr);
        check_expr := public._normalize_rls_expr(pol.check_expr);

        FOREACH cmd IN ARRAY actions LOOP
          cmdname := CASE cmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' END;
          merged_name := format('merged_%s_%s_%s', t.tablename, r.rolname, lower(cmdname));

          SELECT count(*) INTO exists_count FROM pg_policy p WHERE p.polname = merged_name AND p.polrelid = t.relid AND p.polcmd = cmd;

          IF exists_count = 0 THEN
            q := format('CREATE POLICY %I ON %I.%I AS PERMISSIVE FOR %s TO %I', merged_name, t.schemaname, t.tablename, cmdname, r.rolname);
            IF using_expr IS NOT NULL AND cmd IN ('r','w','d') THEN
              q := q || format(' USING (%s)', using_expr);
            END IF;
            IF check_expr IS NOT NULL AND cmd IN ('a','w') THEN
              q := q || format(' WITH CHECK (%s)', check_expr);
            END IF;
            EXECUTE q;
          END IF;
        END LOOP; -- actions

        -- Remove this role from the original wildcard policy; drop if no roles remain
        IF array_length(pol.polroles,1) > 1 THEN
          q := (
            WITH role_names AS (
              SELECT rolname FROM pg_roles WHERE oid = ANY (pol.polroles) AND rolname <> r.rolname
            )
            SELECT 'ALTER POLICY ' || quote_ident(pol.polname) || ' ON ' || quote_ident(t.schemaname) || '.' || quote_ident(t.tablename) ||
                   ' TO ' || string_agg(quote_ident(rolname), ', ')
            FROM role_names
          );
          IF q IS NOT NULL THEN EXECUTE q; END IF;
        ELSE
          EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.polname, t.schemaname, t.tablename);
        END IF;
      END LOOP; -- pol
    END LOOP; -- role
  END LOOP; -- table
END
$$ LANGUAGE plpgsql;
