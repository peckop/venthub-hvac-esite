BEGIN;

-- 1) user_profiles.role CHECK constraint: include 'superadmin' (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema='public' AND table_name='user_profiles' AND constraint_name='user_profiles_role_check'
  ) THEN
    ALTER TABLE public.user_profiles DROP CONSTRAINT user_profiles_role_check;
  END IF;
END $$;

ALTER TABLE public.user_profiles 
  ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('user','moderator','admin','superadmin'));

-- 2) Helper functions: treat superadmin as admin-equivalent
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND role IN ('admin','superadmin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin','superadmin')
  );
END;
$$;

-- 3) set_user_admin_role: allow 'superadmin' as a valid target role
CREATE OR REPLACE FUNCTION public.set_user_admin_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF new_role NOT IN ('user','admin','moderator','superadmin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id) THEN
    INSERT INTO public.user_profiles (id, role) VALUES (user_id, new_role)
    ON CONFLICT (id) DO UPDATE SET role=new_role, updated_at=NOW();
  ELSE
    UPDATE public.user_profiles SET role=new_role, updated_at=NOW() WHERE id = user_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- 4) Update policies that explicitly list ('admin','moderator') to include 'superadmin'
-- products
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='products_insert_admin'
  ) THEN
    EXECUTE 'ALTER POLICY products_insert_admin ON public.products 
             USING ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin'')) 
             WITH CHECK ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin''))';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='products_update_admin_only'
  ) THEN
    EXECUTE 'ALTER POLICY products_update_admin_only ON public.products 
             USING ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin'')) 
             WITH CHECK ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin''))';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='products_delete_admin'
  ) THEN
    EXECUTE 'ALTER POLICY products_delete_admin ON public.products 
             USING ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin''))';
  END IF;
END $$;

-- categories
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='categories_insert_admin'
  ) THEN
    EXECUTE 'ALTER POLICY categories_insert_admin ON public.categories 
             USING ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin'')) 
             WITH CHECK ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin''))';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='categories_update_admin'
  ) THEN
    EXECUTE 'ALTER POLICY categories_update_admin ON public.categories 
             USING ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin'')) 
             WITH CHECK ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin''))';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='categories_delete_admin'
  ) THEN
    EXECUTE 'ALTER POLICY categories_delete_admin ON public.categories 
             USING ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin''))';
  END IF;
END $$;

-- user_profiles admin select/update via JWT claim
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_admin'
  ) THEN
    EXECUTE 'ALTER POLICY user_profiles_select_admin ON public.user_profiles 
             USING ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin''))';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_update_admin'
  ) THEN
    EXECUTE 'ALTER POLICY user_profiles_update_admin ON public.user_profiles 
             USING ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin'')) 
             WITH CHECK ((select public.jwt_role()) IN (''admin'',''moderator'',''superadmin''))';
  END IF;
END $$;

-- admin_audit_log policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_audit_log' AND policyname='admin_audit_log_select_admins'
  ) THEN
    EXECUTE 'ALTER POLICY admin_audit_log_select_admins ON public.admin_audit_log 
             USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role IN (''admin'',''moderator'',''superadmin'')))';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_audit_log' AND policyname='admin_audit_log_insert_admins'
  ) THEN
    EXECUTE 'ALTER POLICY admin_audit_log_insert_admins ON public.admin_audit_log 
             WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role IN (''admin'',''moderator'',''superadmin'')))';
  END IF;
END $$;

COMMIT;

