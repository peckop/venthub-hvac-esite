-- ALT-135 yerel SINAMALAR. Önkoşul: alt135-yerel-kurulum.sql + taban enforce_role_change + tetik + migration (sıra için kurulum başlığı).
-- Her sınama ALT İŞLEMDE koşar ve geri alınır (kalıcı veri bırakmaz). FAIL = hata (ON_ERROR_STOP ile koşu durur).

create or replace function pg_temp.sinama(
  etiket text, rol text, jwt_sub text, jwt_rol text, hazirlik text, sorgu text, beklenen_hata text
) returns void language plpgsql as $$
declare hata text := null;
begin
  begin
    -- hazırlık sahip (postgres) olarak koşar; ayrıcalıklı rol yazımı oturumsuzda yasak olduğundan service_role bağlamı verilir
    perform set_config('request.jwt.claim.role', 'service_role', true);
    if hazirlik is not null then execute hazirlik; end if;
    perform set_config('request.jwt.claim.sub', coalesce(jwt_sub, ''), true);
    perform set_config('request.jwt.claim.role', coalesce(jwt_rol, ''), true);
    if rol is not null then execute format('set local role %I', rol); end if;
    begin
      execute sorgu;
    exception when others then
      hata := sqlerrm;
    end;
    reset role;
    -- her durumda geri al
    raise exception using errcode = 'P0099', message = 'geri_al';
  exception when sqlstate 'P0099' then
    null;
  end;
  if beklenen_hata is null and hata is not null then
    raise exception 'FAIL [%]: hata beklenmiyordu: %', etiket, hata;
  elsif beklenen_hata is not null and hata is null then
    raise exception 'FAIL [%]: "%" hatası bekleniyordu, sorgu GEÇTİ', etiket, beklenen_hata;
  elsif beklenen_hata is not null and hata not like '%' || beklenen_hata || '%' then
    raise exception 'FAIL [%]: beklenen "%", gelen "%"', etiket, beklenen_hata, hata;
  end if;
  raise notice 'PASS [%]%', etiket, case when hata is null then '' else ' (hata: ' || hata || ')' end;
end $$;

-- ───────── A) EXECUTE yetkileri ─────────
do $$
declare rol text; f text;
begin
  for f in select unnest(array[
    'public.denetim_izi_yaz()','public.notify_order_paid()','public.notify_quote_request_created()',
    'public.set_order_number()','public.stamp_order_paid_at()',
    'public.set_stock(uuid,integer,text)','public.set_stock(uuid,integer,text,uuid)',
    'public.admin_resend_quote_published(uuid)','public.anonymize_user_personal_data(uuid,uuid,boolean)'])
  loop
    foreach rol in array array['anon','authenticated'] loop
      if has_function_privilege(rol, f::regprocedure, 'execute') then
        raise exception 'FAIL [execute] % hala % icin acik', f, rol;
      end if;
    end loop;
  end loop;
  -- PUBLIC (grantee 0) satırı kalmamalı
  if exists (
    select 1 from pg_proc p, aclexplode(p.proacl) a
    where p.oid = any (array['public.denetim_izi_yaz()','public.stamp_order_paid_at()','public.set_stock(uuid,integer,text)',
      'public.admin_resend_quote_published(uuid)','public.anonymize_user_personal_data(uuid,uuid,boolean)']::regprocedure[])
      and a.grantee = 0) then
    raise exception 'FAIL [execute] PUBLIC EXECUTE kaldi';
  end if;
  foreach f in array array['public.set_stock(uuid,integer,text)','public.set_stock(uuid,integer,text,uuid)',
    'public.admin_resend_quote_published(uuid)','public.anonymize_user_personal_data(uuid,uuid,boolean)'] loop
    if not has_function_privilege('service_role', f::regprocedure, 'execute') then
      raise exception 'FAIL [execute] service_role % icin KAPALI', f;
    end if;
  end loop;
  -- dokunulmayan: adjust_stock hala açık
  if not has_function_privilege('authenticated', 'public.adjust_stock(uuid,integer,text)'::regprocedure, 'execute') then
    raise exception 'FAIL [dokunulmayan] adjust_stock authenticated icin kapandi';
  end if;
  if (select proconfig from pg_proc where oid = 'public.stamp_order_paid_at()'::regprocedure) is distinct from array['search_path=""'] then
    raise exception 'FAIL [search_path] stamp_order_paid_at proconfig=%', (select proconfig from pg_proc where oid = 'public.stamp_order_paid_at()'::regprocedure);
  end if;
  raise notice 'PASS [execute+search_path] 9 fonksiyon anon/authenticated/PUBLIC kapali, service_role acik, adjust_stock dokunulmadi, stamp_order_paid_at search_path=""';
end $$;

select pg_temp.sinama('anon set_stock cagrisi reddedilir', 'anon', null, 'anon', null,
  $q$select public.set_stock(gen_random_uuid(), 1, 'x')$q$, 'permission denied');
select pg_temp.sinama('authenticated anonymize cagrisi reddedilir', 'authenticated', gen_random_uuid()::text, 'authenticated', null,
  $q$select public.anonymize_user_personal_data(gen_random_uuid(), gen_random_uuid(), true)$q$, 'permission denied');
select pg_temp.sinama('service_role set_stock cagirabilir', 'service_role', null, 'service_role', null,
  $q$select public.set_stock(gen_random_uuid(), 1, 'x')$q$, null);
-- tetik ateşlenirken EXECUTE aranmaz: authenticated UPDATE yapar, stamp_order_paid_at tetiği çalışır
select pg_temp.sinama('tetik EXECUTE olmadan atesler (paid_at damgalanir)', 'authenticated', gen_random_uuid()::text, 'authenticated', null,
  $q$do $d$ begin
       update public.siparis_taklit set payment_status = 'paid' where id = 1;
       if (select paid_at from public.siparis_taklit where id = 1) is null then raise exception 'paid_at damgalanmadi'; end if;
     end $d$$q$, null);

-- ───────── B) RLS: açık deny + DEFINER yazıcı etkilenmez ─────────
do $$
declare t text;
begin
  foreach t in array array['order_number_counters','quote_number_counters','search_reindex_queue','url_takma_adlari','_migration_ledger'] loop
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname = t || '_deny_all'
                   and permissive = 'RESTRICTIVE' and cmd = 'ALL') then
      raise exception 'FAIL [policy] % icin deny politikasi yok', t;
    end if;
    if obj_description(('public.' || quote_ident(t))::regclass, 'pg_class') not like 'RLS açık, istemci erişimi yok;%' then
      raise exception 'FAIL [yorum] % yorumu yok', t;
    end if;
  end loop;
  if has_table_privilege('anon', 'public._migration_ledger', 'select,insert,update,delete,truncate,references,trigger')
     or has_table_privilege('authenticated', 'public._migration_ledger', 'select')
     or has_table_privilege('authenticated', 'public._migration_ledger', 'truncate') then
    raise exception 'FAIL [ledger] anon/authenticated tablo yetkisi kaldi';
  end if;
  if not has_table_privilege('service_role', 'public._migration_ledger', 'insert') then
    raise exception 'FAIL [ledger] service_role yazamaz';
  end if;
  raise notice 'PASS [rls] 5 tabloda RESTRICTIVE deny politikasi + yorum, ledger anon/authenticated yetkisiz';
end $$;

-- Politika savunma derinliği: yetki sonradan açılsa bile istemci satır göremez/yazamaz
select pg_temp.sinama('deny politikasi: yetki acilsa bile authenticated 0 satir gorur', 'authenticated', gen_random_uuid()::text, 'authenticated',
  $h$grant select, insert on public.order_number_counters to authenticated; insert into public.order_number_counters values (current_date, 5)$h$,
  $q$do $d$ begin
       if (select count(*) from public.order_number_counters) <> 0 then raise exception 'satir gorundu'; end if;
     end $d$$q$, null);
select pg_temp.sinama('deny politikasi: yetki acilsa bile authenticated INSERT reddedilir', 'authenticated', gen_random_uuid()::text, 'authenticated',
  $h$grant select, insert on public.quote_number_counters to authenticated$h$,
  $q$insert into public.quote_number_counters (tenant_id, gun) values (gen_random_uuid(), current_date)$q$, 'row-level security');
select pg_temp.sinama('anon ledger okuyamaz', 'anon', null, 'anon', null,
  $q$select count(*) from public._migration_ledger$q$, 'permission denied');
select pg_temp.sinama('authenticated ledger TRUNCATE edemez', 'authenticated', gen_random_uuid()::text, 'authenticated', null,
  $q$truncate public._migration_ledger$q$, 'permission denied');
-- DEFINER yazıcı (sahip postgres, FORCE yok) deny politikasından etkilenmez
select pg_temp.sinama('DEFINER yazici RLS altinda sayac yazar (authenticated cagirir)', 'authenticated', gen_random_uuid()::text, 'authenticated',
  $h$grant execute on function public.sayac_yaz_taklit() to authenticated$h$,
  $q$select public.sayac_yaz_taklit()$q$, null);
-- sahip (supabase-migrate.yml postgres ile yazar) ledger'a yazabilir
select pg_temp.sinama('sahip (postgres) ledger yazar', null, null, null, null,
  $q$insert into public._migration_ledger(name) values ('x.sql')$q$, null);
select pg_temp.sinama('service_role (BYPASSRLS) ledger yazar', 'service_role', null, 'service_role', null,
  $q$insert into public._migration_ledger(name) values ('y.sql')$q$, null);

-- ───────── C) süper admin kuralı ─────────
-- Sabit kimlikler: s1,s2 = super_admin; a1 = admin; m1 = moderator; u1 = user
select set_config('request.jwt.claim.role', 'service_role', false);
insert into public.user_profiles (id, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin'),
  ('00000000-0000-0000-0000-0000000000b1', 'moderator'),
  ('00000000-0000-0000-0000-0000000000c1', 'user');
select set_config('request.jwt.claim.role', '', false);
-- (a) admin süper admini düşüremez
select pg_temp.sinama('(a) admin, super_admin satirini dusuremez', 'authenticated', '00000000-0000-0000-0000-0000000000a1', 'authenticated',
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin'),('00000000-0000-0000-0000-0000000000d2','super_admin')$h$,
  $q$update public.user_profiles set role = 'user' where id = '00000000-0000-0000-0000-0000000000d1'$q$, 'only super_admin can change a super_admin role');
select pg_temp.sinama('(a) moderator, super_admin satirini dusuremez', 'authenticated', '00000000-0000-0000-0000-0000000000b1', 'authenticated',
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin'),('00000000-0000-0000-0000-0000000000d2','super_admin')$h$,
  $q$update public.user_profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000d1'$q$, 'only super_admin can change a super_admin role');
-- kontrol: super_admin başka super_admini düşürebilir (en az biri kalıyor)
select pg_temp.sinama('super_admin, baska super_admini dusurebilir', 'authenticated', '00000000-0000-0000-0000-0000000000d1', 'authenticated',
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin'),('00000000-0000-0000-0000-0000000000d2','super_admin')$h$,
  $q$update public.user_profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000d2'$q$, null);
-- (b) tek super_admin kendini düşüremez
select pg_temp.sinama('(b) tek super_admin kendini dusuremez', 'authenticated', '00000000-0000-0000-0000-0000000000d1', 'authenticated',
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin')$h$,
  $q$update public.user_profiles set role = 'user' where id = '00000000-0000-0000-0000-0000000000d1'$q$, 'son super_admin dusurulemez');
-- (b) service_role da son super_admini düşüremez
select pg_temp.sinama('(b) service_role son super_admini dusuremez', 'service_role', null, 'service_role',
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin')$h$,
  $q$update public.user_profiles set role = 'user' where id = '00000000-0000-0000-0000-0000000000d1'$q$, 'son super_admin dusurulemez');
-- (b) oturumsuz (auth.uid() NULL, rol yok) bağlam da düşüremez
select pg_temp.sinama('(b) oturumsuz baglam son super_admini dusuremez', null, null, null,
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin')$h$,
  $q$update public.user_profiles set role = 'user' where id = '00000000-0000-0000-0000-0000000000d1'$q$, 'son super_admin dusurulemez');
-- (b) iki super_admin tek UPDATE'te birlikte düşürülemez
select pg_temp.sinama('(b) iki super_admin tek UPDATE ile birlikte dusurulemez', 'service_role', null, 'service_role',
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin'),('00000000-0000-0000-0000-0000000000d2','super_admin')$h$,
  $q$update public.user_profiles set role = 'user' where role = 'super_admin'$q$, 'son super_admin dusurulemez');
-- (b) sıralı: biri düşer, kalan son olur ve artık düşemez
select pg_temp.sinama('(b) sirali dusurme: kalan son super_admin korunur', 'service_role', null, 'service_role',
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin'),('00000000-0000-0000-0000-0000000000d2','super_admin')$h$,
  $q$do $d$ begin
       update public.user_profiles set role = 'user' where id = '00000000-0000-0000-0000-0000000000d1';
       update public.user_profiles set role = 'user' where id = '00000000-0000-0000-0000-0000000000d2';
     end $d$$q$, 'son super_admin dusurulemez');
-- (b) service_role başka super_admin varken düşürebilir (kilitlenme yok, sistem çalışır)
select pg_temp.sinama('service_role, baska super_admin varken dusurebilir', 'service_role', null, 'service_role',
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin'),('00000000-0000-0000-0000-0000000000d2','super_admin')$h$,
  $q$update public.user_profiles set role = 'user' where id = '00000000-0000-0000-0000-0000000000d1'$q$, null);
-- Eski davranışlar bozulmadı
select pg_temp.sinama('admin, user rolunu moderator yapabilir', 'authenticated', '00000000-0000-0000-0000-0000000000a1', 'authenticated', null,
  $q$update public.user_profiles set role = 'moderator' where id = '00000000-0000-0000-0000-0000000000c1'$q$, null);
select pg_temp.sinama('admin super_admin yapamaz', 'authenticated', '00000000-0000-0000-0000-0000000000a1', 'authenticated', null,
  $q$update public.user_profiles set role = 'super_admin' where id = '00000000-0000-0000-0000-0000000000c1'$q$, 'only super_admin can grant super_admin');
select pg_temp.sinama('rol degismeyen guncelleme (updated_at) super_admin satirinda serbest', 'authenticated', '00000000-0000-0000-0000-0000000000a1', 'authenticated',
  $h$insert into public.user_profiles (id, role) values ('00000000-0000-0000-0000-0000000000d1','super_admin')$h$,
  $q$update public.user_profiles set updated_at = now() where id = '00000000-0000-0000-0000-0000000000d1'$q$, null);
