-- Drop the existing role CHECK constraint if it exists
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Re-create the constraint with 'moderator' included
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_role_check
CHECK (role IN ('super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer', 'user'));
