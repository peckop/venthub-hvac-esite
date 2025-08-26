begin;

-- Ensure user_addresses.user_id references auth.users(id) instead of legacy user_profiles
DO $$
DECLARE
  v_target_schema text;
  v_target_table text;
BEGIN
  SELECT ccu.table_schema, ccu.table_name
    INTO v_target_schema, v_target_table
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.constraint_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'user_addresses'
    AND tc.constraint_name = 'user_addresses_user_id_fkey';

  IF v_target_schema IS NOT NULL AND (v_target_schema <> 'auth' OR v_target_table <> 'users') THEN
    -- Drop legacy FK and recreate to auth.users
    BEGIN
      ALTER TABLE public.user_addresses DROP CONSTRAINT user_addresses_user_id_fkey;
    EXCEPTION WHEN undefined_object THEN
      -- already dropped
      NULL;
    END;

    ALTER TABLE public.user_addresses
      ADD CONSTRAINT user_addresses_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

commit;

