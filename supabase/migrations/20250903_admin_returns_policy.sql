-- Admin users should be able to update returns status
-- This extends the existing service_role policy to include admin users

-- Create a helper function to check if user is admin
create or replace function public.is_admin_user()
returns boolean
language plpgsql security definer
as $$
begin
  -- For development: allow all authenticated users to be admin
  if current_setting('app.environment', true) = 'development' then
    return auth.uid() is not null;
  end if;
  
  -- For production: check user_profiles table for admin role
  return exists (
    select 1 from public.user_profiles 
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Update the returns update policy to allow admin users
drop policy if exists returns_update_admin on public.venthub_returns;
create policy returns_update_admin
  on public.venthub_returns for update
  using (
    auth.role() = 'service_role' OR 
    public.is_admin_user()
  )
  with check (
    auth.role() = 'service_role' OR 
    public.is_admin_user()
  );

-- Allow admin users to select all returns (not just their own)
drop policy if exists returns_select_admin on public.venthub_returns;
create policy returns_select_admin
  on public.venthub_returns for select
  using (
    user_id = auth.uid() OR  -- Users can see their own
    public.is_admin_user()   -- Admins can see all
  );

-- Set development environment (remove this in production)
-- This can be set via Supabase dashboard: Settings > API > Custom Claims
-- ALTER DATABASE postgres SET app.environment = 'development';
