-- GERİ ALMA · 20261103090000_ops211_yetki_rpc_rol_denetimi.sql (OPS-211, karne 2026-11 Y4/Y5/K5)
-- Veri kaybı yok: üç nesne 2026-11-01 şema tabanındaki hâline döner
-- (supabase/baselines/2026-11-01_public_schema.sql:291-319, :1769-1862, :8069).
-- Migration'ın yazdığı admin_audit_log satırları SİLİNMEZ (denetim izi geri alınmaz).
-- Koşan: OPS, Recep onayıyla. Uygulama zincirinin dışında elle koşulur.

begin;

create or replace function public.admin_list_all_users()
returns table(id uuid, email text, full_name text, phone text, role text, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if not exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.role in ('admin','moderator','super_admin','super_admin')
  ) then
    raise exception 'not authorized';
  end if;

  return query
  select u.id,
         (u.email)::text        as email,
         (up.full_name)::text   as full_name,
         (up.phone)::text       as phone,
         coalesce((up.role)::text, 'user') as role,
         coalesce(up.created_at, u.created_at) as created_at,
         coalesce(up.updated_at, u.updated_at) as updated_at
  from auth.users u
  left join public.user_profiles up on up.id = u.id
  order by coalesce(up.created_at, u.created_at) desc;
end;
$$;

create or replace function public.enforce_role_change()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $$
declare
  aktor text;
  ayricalikli boolean;
begin
  if new.role not in ('user','moderator','admin','super_admin','warehouse','sales','viewer') then
    raise exception 'invalid role %', new.role;
  end if;

  if tg_op = 'UPDATE' and new.role is not distinct from old.role then
    return new;
  end if;

  ayricalikli := new.role in ('admin','super_admin');

  if auth.uid() is null or coalesce(auth.role(), '') = 'service_role' then
    if not ayricalikli then
      return new;
    end if;

    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'oturumsuz baglamda ayricalikli rol atanamaz (%)', new.role;
    end if;

    begin
      insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
      values (
        auth.uid(),
        'user_profiles',
        new.id::text,
        case when tg_op = 'INSERT' then 'role_insert_service_role' else 'role_change_service_role' end,
        case when tg_op = 'UPDATE' then jsonb_build_object('role', old.role) else null end,
        jsonb_build_object('role', new.role),
        'service_role ile ayricalikli rol yazimi: auth.uid()=' || coalesce(auth.uid()::text, 'NULL'),
        new.tenant_id
      );
    exception when others then
      raise warning 'enforce_role_change: denetim yazimi basarisiz (% - %), rol degisikligi DEVAM ETTI', sqlstate, sqlerrm;
    end;

    return new;
  end if;

  select role into aktor from public.user_profiles where id = auth.uid();

  if new.id = auth.uid() and aktor is distinct from 'super_admin' then
    raise exception 'not authorized to change own role';
  end if;

  if new.role = 'super_admin' and aktor is distinct from 'super_admin' then
    raise exception 'only super_admin can grant super_admin';
  end if;

  return new;
end;
$$;

drop policy if exists "admin_audit_log_insert_v2" on public.admin_audit_log;
create policy "admin_audit_log_insert_v2" on public.admin_audit_log
  for insert to authenticated
  with check (tenant_id = public.jwt_tenant_id() and public.is_admin_user());

commit;
