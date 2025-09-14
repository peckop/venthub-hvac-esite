BEGIN;

-- Enforce stronger role protections: users cannot change their own role via UI unless superadmin
-- 1) Helper: only superadmin can change roles of others; user cannot change their own role to lower privilege
CREATE OR REPLACE FUNCTION public.enforce_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If the actor tries to change their own role and is not superadmin, block
  IF NEW.id = auth.uid() THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin') THEN
      RAISE EXCEPTION 'not authorized to change own role';
    END IF;
  END IF;
  -- Only allow target roles in whitelist (safety)
  IF NEW.role NOT IN ('user','moderator','admin','superadmin') THEN
    RAISE EXCEPTION 'invalid role %', NEW.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_role_change ON public.user_profiles;
CREATE TRIGGER trg_enforce_role_change
BEFORE UPDATE OF role ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_role_change();

COMMIT;
