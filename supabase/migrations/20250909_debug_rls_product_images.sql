begin;

-- Create helper to inspect current request/session context safely
-- Returns values that help diagnose RLS: current_user (db role), auth.uid(), and raw JWT claims
create or replace function public.debug_context()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'current_user', current_user,
    'auth_uid', auth.uid(),
    'jwt_claims', coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
  );
$$;

-- Allow both anon and authenticated to execute; the function only reads session context
grant execute on function public.debug_context() to anon, authenticated;

-- Create helper to list active policies on product_images
-- Uses SECURITY DEFINER so it can read pg_policies regardless of caller permissions.
create or replace function public.debug_policies_product_images()
returns table (
  schemaname text,
  tablename text,
  policyname text,
  permissive boolean,
  roles name[],
  cmd text,
  qual text,
  with_check text
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select p.schemaname,
         p.tablename,
         p.policyname,
         p.permissive,
         p.roles,
         p.cmd,
         p.qual,
         p.with_check
  from pg_policies p
  where p.schemaname = 'public' and p.tablename = 'product_images'
  order by p.policyname;
$$;

-- Make it callable by both anon and authenticated for read-only diagnostics
grant execute on function public.debug_policies_product_images() to anon, authenticated;

commit;
