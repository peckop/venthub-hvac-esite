-- F1 — Güvenlik hotfix'leri (plan: docs/plans/kademe2-clean-rebuild-2026-08-11.md, PS Wave 1)
-- 1) Rol kanonikleştirme: user_profiles_role_check yalnız 'super_admin' tanır; fonksiyon/politikalardaki
--    'superadmin' (bitişik) ve 'moderater' (typo) ölü-string'leri kanonik forma çevrilir (PS-046).
--    Etki: super_admin rolündeki kullanıcılar is_user_admin/site_settings vb. yüzeylerde artık tanınır.
-- 2) set_user_admin_role yetki daraltma: rol atamayı yalnız super_admin/admin yapabilir
--    (önceden warehouse/moderator da yapabiliyordu = privilege escalation, PS-003/004).
-- 3) SECURITY DEFINER envanteri değişmedi; iç guard'lar sıkılaştırıldı (REST'ten çağrılabilirlik
--    admin UI için kasıtlı, advisor WARN'ı bilinçli-kabul).

begin;

-- === 1a. Fonksiyonlarda rol-string kanonikleştirme (dinamik, idempotent) ===
do $$
declare
  r record;
  newdef text;
begin
  for r in
    select p.oid, pg_get_functiondef(p.oid) as def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (p.prosrc ilike '%superadmin%' or p.prosrc ilike '%moderater%')
  loop
    newdef := replace(replace(r.def, '''superadmin''', '''super_admin'''), '''moderater''', '''moderator''');
    execute newdef;
  end loop;
end $$;

-- === 1b. RLS politikalarında rol-string kanonikleştirme (USING / WITH CHECK ifadeleri) ===
do $$
declare
  r record;
  new_qual text;
  new_check text;
  stmt text;
begin
  for r in
    select pol.polname,
           c.relname,
           pg_get_expr(pol.polqual, pol.polrelid) as qual,
           pg_get_expr(pol.polwithcheck, pol.polrelid) as withcheck
    from pg_policy pol
    join pg_class c on c.oid = pol.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and (coalesce(pg_get_expr(pol.polqual, pol.polrelid), '') ilike '%superadmin%'
        or coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid), '') ilike '%superadmin%')
  loop
    new_qual  := replace(r.qual, '''superadmin''', '''super_admin''');
    new_check := replace(r.withcheck, '''superadmin''', '''super_admin''');
    stmt := format('alter policy %I on public.%I', r.polname, r.relname);
    if new_qual is not null then
      stmt := stmt || format(' using (%s)', new_qual);
    end if;
    if new_check is not null then
      stmt := stmt || format(' with check (%s)', new_check);
    end if;
    execute stmt;
  end loop;
end $$;

-- === 1c. site_settings: mükerrer/karmaşık INSERT politikasını düşür (temiz eşdeğeri zaten var) ===
drop policy if exists merged_site_settings_authenticated_insert on public.site_settings;

-- === 2. set_user_admin_role — yalnız super_admin/admin rol atayabilir; rol listesi = constraint listesi ===
create or replace function public.set_user_admin_role(user_id uuid, new_role text)
returns boolean
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $function$
begin
  if not (coalesce(auth.role(), '') = 'service_role' or exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('super_admin', 'admin')
  )) then
    raise exception 'not authorized';
  end if;

  if new_role not in ('user','admin','moderator','super_admin','warehouse','sales','viewer') then
    raise exception 'Invalid role: %', new_role;
  end if;

  insert into public.user_profiles (id, role) values (user_id, new_role)
  on conflict (id) do update set role = excluded.role, updated_at = now();

  return true;
end;
$function$;

-- === Doğrulama guard'ları ===
do $$
declare n int;
begin
  select count(*) into n
  from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public' and (p.prosrc ilike '%superadmin%' or p.prosrc ilike '%moderater%');
  if n <> 0 then
    raise exception 'F1 guard: % fonksiyonda hala superadmin/moderater var', n;
  end if;

  select count(*) into n
  from pg_policy pol join pg_class c on c.oid = pol.polrelid
  join pg_namespace ns on ns.oid = c.relnamespace
  where ns.nspname = 'public'
    and (coalesce(pg_get_expr(pol.polqual, pol.polrelid), '') ilike '%superadmin%'
      or coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid), '') ilike '%superadmin%');
  if n <> 0 then
    raise exception 'F1 guard: % politikada hala superadmin var', n;
  end if;
end $$;

commit;
