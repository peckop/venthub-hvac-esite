-- Phase 2C: Consolidate permissive policies including PUBLIC (polroles is NULL)
-- For each table/role/action, create a single merged policy and remove the role from originals.
-- PUBLIC policies are converted to explicit role lists by subtracting the merged role.

DO $$
DECLARE
  t RECORD;
  role_name text;
  role_list text[] := ARRAY['anon','authenticated','authenticator','dashboard_user','service_role'];
  cmds text[] := ARRAY['r','a','w','d'];
  cmd text; cmdname text;
  pol RECORD;
  using_list text[]; check_list text[];
  using_or text; check_or text;
  merged_name text; exists_count int;
  q text;
  remaining_roles text[];
BEGIN
  FOR t IN
    SELECT n.nspname AS schemaname, c.relname AS tablename, c.oid AS relid
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    FOREACH role_name IN ARRAY role_list LOOP
      FOREACH cmd IN ARRAY cmds LOOP
        cmdname := CASE cmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' END;

        using_list := ARRAY[]::text[]; check_list := ARRAY[]::text[];
        -- Collect policies matching: same table, permissive, command (or '*'), and role contained OR PUBLIC
        FOR pol IN
          SELECT p.oid, p.polname, p.polcmd,
                 p.polroles,
                 pg_get_expr(p.polqual, p.polrelid) AS using_expr,
                 pg_get_expr(p.polwithcheck, p.polrelid) AS check_expr
          FROM pg_policy p
          WHERE p.polpermissive = true
            AND p.polrelid = t.relid
            AND (p.polcmd = cmd OR p.polcmd = '*')
            AND (
              (p.polroles IS NULL) OR
              EXISTS (
                SELECT 1 FROM pg_roles r WHERE r.oid = ANY(p.polroles) AND r.rolname = role_name
              )
            )
        LOOP
          IF pol.using_expr IS NOT NULL AND (cmd IN ('r','w','d') OR pol.polcmd='*') THEN
            using_list := using_list || public._normalize_rls_expr(pol.using_expr);
          END IF;
          IF pol.check_expr IS NOT NULL AND (cmd IN ('a','w') OR pol.polcmd='*') THEN
            check_list := check_list || public._normalize_rls_expr(pol.check_expr);
          END IF;
        END LOOP;

        -- If fewer than 2 source policies, skip
        IF array_length(using_list,1) IS NULL AND array_length(check_list,1) IS NULL THEN
          CONTINUE;
        END IF;

        IF array_length(using_list,1) IS NOT NULL THEN
          SELECT string_agg('(' || e || ')',' OR ') INTO using_or FROM unnest(using_list) e;
        ELSE using_or := NULL; END IF;
        IF array_length(check_list,1) IS NOT NULL THEN
          SELECT string_agg('(' || e || ')',' OR ') INTO check_or FROM unnest(check_list) e;
        ELSE check_or := NULL; END IF;

        merged_name := format('merged_%s_%s_%s', t.tablename, role_name, lower(cmdname));
        SELECT count(*) INTO exists_count FROM pg_policy p WHERE p.polname=merged_name AND p.polrelid=t.relid AND p.polcmd=cmd;
        IF exists_count = 0 THEN
          q := format('CREATE POLICY %I ON %I.%I AS PERMISSIVE FOR %s TO %I', merged_name, t.schemaname, t.tablename, cmdname, role_name);
          IF using_or IS NOT NULL AND cmd IN ('r','w','d') THEN q := q || format(' USING (%s)', using_or); END IF;
          IF check_or IS NOT NULL AND cmd IN ('a','w') THEN q := q || format(' WITH CHECK (%s)', check_or); END IF;
          EXECUTE q;
        ELSE
          q := format('ALTER POLICY %I ON %I.%I', merged_name, t.schemaname, t.tablename);
          IF using_or IS NOT NULL AND cmd IN ('r','w','d') THEN q := q || format(' USING (%s)', using_or); END IF;
          IF check_or IS NOT NULL AND cmd IN ('a','w') THEN q := q || format(' WITH CHECK (%s)', check_or); END IF;
          EXECUTE q;
        END IF;

        -- Now remove this role from originals (including PUBLIC)
        FOR pol IN
          SELECT p.oid, p.polname, p.polroles, p.polcmd
          FROM pg_policy p
          WHERE p.polpermissive = true AND p.polrelid = t.relid AND (p.polcmd = cmd OR p.polcmd='*')
            AND (
              (p.polroles IS NULL) OR
              EXISTS (SELECT 1 FROM pg_roles r WHERE r.oid = ANY(p.polroles) AND r.rolname = role_name)
            )
            AND p.polname <> merged_name
        LOOP
          IF pol.polroles IS NULL THEN
            -- PUBLIC: convert to explicit list minus role_name
            SELECT array_agg(rn) INTO remaining_roles FROM unnest(role_list) rn WHERE rn <> role_name;
            IF array_length(remaining_roles,1) >= 1 THEN
              q := 'ALTER POLICY ' || quote_ident(pol.polname) || ' ON ' || quote_ident(t.schemaname) || '.' || quote_ident(t.tablename) ||
                   ' TO ' || array_to_string(ARRAY(SELECT quote_ident(x) FROM unnest(remaining_roles) x), ', ');
              EXECUTE q;
            ELSE
              EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.polname, t.schemaname, t.tablename);
            END IF;
          ELSE
            -- Explicit role list: rebuild without role_name
            SELECT array_agg(rolname) INTO remaining_roles
            FROM pg_roles r WHERE r.oid = ANY(pol.polroles) AND r.rolname <> role_name;
            IF array_length(remaining_roles,1) >= 1 THEN
              q := 'ALTER POLICY ' || quote_ident(pol.polname) || ' ON ' || quote_ident(t.schemaname) || '.' || quote_ident(t.tablename) ||
                   ' TO ' || array_to_string(ARRAY(SELECT quote_ident(x) FROM unnest(remaining_roles) x), ', ');
              EXECUTE q;
            ELSE
              EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.polname, t.schemaname, t.tablename);
            END IF;
          END IF;
        END LOOP;

      END LOOP; -- cmd
    END LOOP; -- role
  END LOOP; -- table
END
$$ LANGUAGE plpgsql;
