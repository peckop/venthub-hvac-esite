begin;

-- Ensure user 'recep.varlik@gmail.com' has admin role in public.user_profiles
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'recep.varlik@gmail.com' LIMIT 1;
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, role, created_at, updated_at)
    VALUES (uid, 'admin', now(), now())
    ON CONFLICT (id)
    DO UPDATE SET role='admin', updated_at=now();
  END IF;
END $$;

commit;

