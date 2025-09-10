-- Phase 2: Consolidate multiple permissive RLS policies per table/role/action by OR-merging their predicates
-- This script creates/updates merged policies and removes the role from originals, dropping originals if they end up with no roles.
-- It relies on public._normalize_rls_expr created by a prior migration.

DO $merge$
DECLARE
  t RECORD;
  r RECORD;
  cmd text;
  cmdname text;
  pol RECORD;
  using_list text[];
  check_list text[];
  using_or text;
  check_or text;
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
    -- For each role present in any permissive policy on this table
    FOR r IN
      WITH roles AS (
        SELECT DISTINCT unnest(p.polroles) AS role_oid
        FROM pg_policy p
        WHERE p.polpermissive = true AND p.polrelid = t.relid
      )
      SELECT rol.rolname, rol.oid
      FROM roles
      JOIN pg_roles rol ON rol.oid = roles.role_oid
    LOOP
      FOREACH cmd IN ARRAY ARRAY['r','a','w','d']
      LOOP
        cmdname := CASE cmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' END;

        using_list := ARRAY[]::text[];
        check_list := ARRAY[]::text[];

        -- Collect policies for (table, role, command)
        FOR pol IN
          SELECT p.oid, p.polname, p.polcmd,
                 pg_get_expr(p.polqual, p.polrelid)      AS using_expr,
                 pg_get_expr(p.polwithcheck, p.polrelid) AS check_expr
          FROM pg_policy p
          WHERE p.polpermissive = true
            AND p.polrelid = t.relid
            AND p.polcmd = cmd
            AND (r.oid = ANY (p.polroles))
        LOOP
          IF pol.using_expr IS NOT NULL AND cmd IN ('r','w','d') THEN
            using_list := using_list || public._normalize_rls_expr(pol.using_expr);
          END IF;
          IF pol.check_expr IS NOT NULL AND cmd IN ('a','w') THEN
            check_list := check_list || public._normalize_rls_expr(pol.check_expr);
          END IF;
        END LOOP;

        -- If zero or one policy, nothing to consolidate
        IF (
          SELECT count(*) FROM pg_policy p
           WHERE p.polpermissive = true
             AND p.polrelid = t.relid
             AND p.polcmd = cmd
             AND (r.oid = ANY (p.polroles))
        ) <= 1 THEN
          CONTINUE;
        END IF;

        -- Build OR expressions
        IF array_length(using_list,1) IS NOT NULL THEN
          SELECT string_agg('(' || e || ')', ' OR ') INTO using_or FROM unnest(using_list) e;
        ELSE
          using_or := NULL;
        END IF;

        IF array_length(check_list,1) IS NOT NULL THEN
          SELECT string_agg('(' || e || ')', ' OR ') INTO check_or FROM unnest(check_list) e;
        ELSE
          check_or := NULL;
        END IF;

        merged_name := format('merged_%s_%s_%s', t.tablename, r.rolname, lower(cmdname));

        -- Create or update merged policy
        SELECT count(*) INTO exists_count
        FROM pg_policy p
        WHERE p.polname = merged_name AND p.polrelid = t.relid;

        IF exists_count = 0 THEN
          q := format('CREATE POLICY %I ON %I.%I AS PERMISSIVE FOR %s TO %I',
                      merged_name, t.schemaname, t.tablename, cmdname, r.rolname);
          IF using_or IS NOT NULL AND cmd IN ('r','w','d') THEN
            q := q || format(' USING (%s)', using_or);
          END IF;
          IF check_or IS NOT NULL AND cmd IN ('a','w') THEN
            q := q || format(' WITH CHECK (%s)', check_or);
          END IF;
          EXECUTE q;
        ELSE
          q := format('ALTER POLICY %I ON %I.%I', merged_name, t.schemaname, t.tablename);
          IF using_or IS NOT NULL AND cmd IN ('r','w','d') THEN
            q := q || format(' USING (%s)', using_or);
          END IF;
          IF check_or IS NOT NULL AND cmd IN ('a','w') THEN
            q := q || format(' WITH CHECK (%s)', check_or);
          END IF;
          EXECUTE q;
        END IF;

        -- Remove this role from original policies and drop if empty
        FOR pol IN
          SELECT p.oid, p.polname, p.polroles
          FROM pg_policy p
          WHERE p.polpermissive = true
            AND p.polrelid = t.relid
            AND p.polcmd = cmd
            AND (r.oid = ANY (p.polroles))
            AND p.polname <> merged_name
        LOOP
          IF array_length(pol.polroles,1) > 1 THEN
            -- Reassign remaining roles to this policy (excluding r)
            q := (
              WITH role_names AS (
                SELECT rolname
                FROM pg_roles
                WHERE oid = ANY (pol.polroles) AND rolname <> r.rolname
              )
              SELECT 'ALTER POLICY ' || quote_ident(pol.polname) ||
                     ' ON ' || quote_ident(t.schemaname) || '.' || quote_ident(t.tablename) ||
                     ' TO ' || string_agg(quote_ident(rolname), ', ')
              FROM role_names
            );
            IF q IS NOT NULL THEN
              EXECUTE q;
            END IF;
          ELSE
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.polname, t.schemaname, t.tablename);
          END IF;
        END LOOP;

      END LOOP; -- cmd
    END LOOP; -- role
  END LOOP; -- table
END
$merge$ LANGUAGE plpgsql;

