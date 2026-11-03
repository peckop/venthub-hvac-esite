-- OPS-211 · karne 2026-11 kök 2 (DB tarafı) — Y4, Y5, K5
-- Cetvel: docs/audits/guvenlik-karnesi-2026-11.md §4 (Y4, Y5, K5), §9 madde 2 ·
--         docs/standards/migration-safety-standard.md · CLAUDE.md kural 11, 12, 13.
--
-- ⚠ MIGRATION = PROD (kural 13): master'a birleşince supabase-migrate.yml canlıya OTOMATİK uygular.
--   Yalnız Recep onayıyla birleşir.
--
-- KAYNAK: fonksiyon gövdeleri 2026-11-01 şema tabanından (supabase/baselines/2026-11-01_public_schema.sql:291-319,
--   :1769-1862, :8069) birebir alındı; tabandan sonraki iki migration (20261101150000, 20261101160000) bu üç
--   nesneye dokunmuyor (grep ile ölçüldü). Değişen satırlar aşağıda "OPS-211" etiketiyle işaretli.
--
-- NE YAPAR:
--   Y4) admin_list_all_users(): rol listesinden `moderator` çıkar → ('admin','super_admin').
--       Fonksiyon TÜM kullanıcıların e-posta ve telefonunu döndürür (KVKK). Arayüzde bu veriyi gösteren iki
--       ekran var: /admin/users (yalnız super_admin, src/lib/rbac.ts) ve /admin/quotes (admin + sales;
--       sales zaten listede yoktu). moderator ikisini de görmüyor (rbac.ts moderator listesi). REC-140 Faz 1b
--       (20261011140000) 16 politikadan moderator'u aynı gerekçeyle çıkarmıştı; bu fonksiyon o taramanın
--       dışında kalmıştı (politika değil, fonksiyon gövdesi). Ölçüm 2026-10-11 (o migration'ın başlığı):
--       canlıda moderator 0 kullanıcı → bugün kimse yetki KAYBETMİYOR.
--       Mükerrer 'super_admin' literali de temizlendi.
--   Y5) enforce_role_change(): oturumlu bağlamda iki ek kural.
--       (a) Hedef satırın ESKİ rolü super_admin ise yalnız super_admin değiştirebilir. Eskiden kural yalnız
--           YENİ rolüne bakıyordu: admin, bir super_admin'i `user`'a düşürebiliyordu (içeriden yetki gaspı).
--       (b) Başarılı her oturumlu rol değişikliği admin_audit_log'a TAM 1 satır yazar (kural 11). Eskiden iz
--           yalnız oturumsuz service_role dalında vardı. Bu yazım exception ile SARILMAZ: denetim satırı
--           yazılamıyorsa rol değişikliği de olmaz (fail-closed). Oturumsuz dalın davranışı DEĞİŞMEDİ
--           (signup akışı kırılmasın diye orada hata WARNING'e iner — tabandaki gerekçe aynen korundu).
--   K5) admin_audit_log INSERT politikası (authenticated): `actor = auth.uid()` şartı eklenir. Eskiden admin,
--       başka birinin adına denetim satırı yazabiliyordu (iz sahteciliği). İstemci yazıcısı
--       (src/lib/audit.ts::logAdminAction) actor'u oturumdaki kullanıcıdan doldurur → meşru yol etkilenmez.
--       actor NULL ile gelen yazım artık REDDEDİLİR (kimliği bilinmeyen iz, iz değildir). SECURITY DEFINER
--       fonksiyonları (owner postgres) ve service_role bu politikadan etkilenmez.
--
-- NE YAPMAZ (adıyla):
--   - admin_list_all_users'a TENANT filtresi eklemez (karne Y4'ün Faz 2 yönü, Y3 ailesi). LEFT JOIN ile profilsiz
--     auth.users satırları da dönüyor; tenant filtresi onları düşürür — davranış değişikliği ayrı ölçüm ister.
--   - Fonksiyon imzalarını DEĞİŞTİRMEZ → src/types/database.types.ts güncellemesi GEREKMEZ.
--   - GRANT'lere dokunmaz (CREATE OR REPLACE mevcut yetkileri korur).
--
-- GERİ ALMA: scripts/db/rollback/20261103090000_ops211_yetki_rpc_rol_denetimi_geri_al.sql (veri kaybı yok;
--   yalnız fonksiyon gövdeleri ve bir politika tabandaki hâline döner).

begin;

-- ───────────────────────────── Y4 ─────────────────────────────
create or replace function public.admin_list_all_users()
returns table(id uuid, email text, full_name text, phone text, role text, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  -- OPS-211 (karne 2026-11 Y4): yalnız admin/super_admin. moderator çıkarıldı — bu fonksiyon tüm
  -- kullanıcıların e-posta ve telefonunu döndürür; /admin/users yalnız super_admin'e açık.
  if not exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.role in ('admin','super_admin')
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

-- ───────────────────────────── Y5 ─────────────────────────────
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
  -- Hedef rol whitelist'i. ARTIK INSERT'te de koşar (eski sürümde yalnız UPDATE'te vardı).
  if new.role not in ('user','moderator','admin','super_admin','warehouse','sales','viewer') then
    raise exception 'invalid role %', new.role;
  end if;

  -- Rol değişmiyorsa karışma: ad/telefon güncellemeleri ve ON CONFLICT DO UPDATE
  -- (handle_new_user_profile) serbest kalsın.
  if tg_op = 'UPDATE' and new.role is not distinct from old.role then
    return new;
  end if;

  ayricalikli := new.role in ('admin','super_admin');

  -- ============================ OTURUMSUZ BAĞLAM ============================
  -- NİÇİN VAR: profil satırını auth.users üzerindeki trg_handle_new_user_profile
  -- OTURUMSUZ yaratır (auth.uid() NULL); sağlama/göç betikleri de service_role ile koşar.
  -- (Bu dalın davranışı OPS-211'de DEĞİŞMEDİ; tabandaki gerekçe aynen korunur.)
  if auth.uid() is null or coalesce(auth.role(), '') = 'service_role' then

    -- Sıradan kayıt (ayrıcalıksız rol): sessizce geçer, İZ YAZILMAZ.
    if not ayricalikli then
      return new;
    end if;

    -- Ayrıcalıklı rol, oturumsuz bağlamda: YALNIZ service_role.
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'oturumsuz baglamda ayricalikli rol atanamaz (%)', new.role;
    end if;

    -- service_role ile ayrıcalıklı yazım: GEÇER, ama iz bırakır. Denetim yazımı patlarsa
    -- KAYIT/GÖÇ AKIŞI KIRILMAMALI → exception WARNING'e iner (tabandaki karar).
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
  -- ========================== /OTURUMSUZ BAĞLAM ============================

  select role into aktor from public.user_profiles where id = auth.uid();

  -- Kendi rolünü değiştirme: yalnız super_admin (ESKİ KURAL KORUNDU)
  if new.id = auth.uid() and aktor is distinct from 'super_admin' then
    raise exception 'not authorized to change own role';
  end if;

  -- super_admin'e YÜKSELTMEYİ yalnız super_admin yapar (hedef kim olursa olsun)
  if new.role = 'super_admin' and aktor is distinct from 'super_admin' then
    raise exception 'only super_admin can grant super_admin';
  end if;

  -- OPS-211 (karne 2026-11 Y5-a): super_admin'i DÜŞÜRMEYİ de yalnız super_admin yapar.
  if tg_op = 'UPDATE' and old.role = 'super_admin' and aktor is distinct from 'super_admin' then
    raise exception 'only super_admin can change a super_admin role';
  end if;

  -- OPS-211 (karne 2026-11 Y5-b): oturumlu her rol değişikliği TAM 1 denetim satırı bırakır.
  -- Exception ile SARILMAZ: iz yazılamıyorsa değişiklik de olmaz (fail-closed, kural 11).
  -- Bu fonksiyon SECURITY DEFINER/owner postgres → admin_audit_log RLS'i (force=false) atlanır.
  insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
  values (
    auth.uid(),
    'user_profiles',
    new.id::text,
    case when tg_op = 'INSERT' then 'role_insert' else 'role_change' end,
    case when tg_op = 'UPDATE' then jsonb_build_object('role', old.role) else null end,
    jsonb_build_object('role', new.role),
    'oturumlu rol degisikligi: aktor rolu=' || coalesce(aktor, 'NULL'),
    new.tenant_id
  );

  return new;
end;
$$;

-- ───────────────────────────── K5 ─────────────────────────────
drop policy if exists "admin_audit_log_insert_v2" on public.admin_audit_log;
create policy "admin_audit_log_insert_v2" on public.admin_audit_log
  for insert to authenticated
  with check (
    tenant_id = public.jwt_tenant_id()
    and public.is_admin_user()
    -- OPS-211 (karne 2026-11 K5): kimse başkasının adına iz yazamaz.
    and actor = (select auth.uid())
  );

-- ───────────────────────── ÖZ-KONTROL ─────────────────────────
-- Biri başarısızsa migration TAMAMEN geri döner.
do $$
declare
  v_src text;
  v_check text;
begin
  select prosrc into v_src from pg_proc where oid = 'public.admin_list_all_users()'::regprocedure;
  -- Tırnaklı literal aranır: gövdedeki açıklama yorumu kelimeyi adıyla anar.
  if v_src like '%''moderator''%' then
    raise exception 'OPS-211 Y4: admin_list_all_users hala moderator iceriyor';
  end if;

  select prosrc into v_src from pg_proc where oid = 'public.enforce_role_change()'::regprocedure;
  if v_src not like '%only super_admin can change a super_admin role%'
     or v_src not like '%''role_change''%' then
    raise exception 'OPS-211 Y5: enforce_role_change yeni kurallari tasimiyor';
  end if;

  select pg_get_expr(polwithcheck, polrelid) into v_check
    from pg_policy
   where polrelid = 'public.admin_audit_log'::regclass and polname = 'admin_audit_log_insert_v2';
  if v_check is null or v_check not like '%actor%auth.uid()%' then
    raise exception 'OPS-211 K5: admin_audit_log_insert_v2 actor sartini tasimiyor (%)', v_check;
  end if;

  if not exists (
    select 1 from pg_trigger
     where tgrelid = 'public.user_profiles'::regclass and tgname = 'trg_enforce_role_change' and not tgisinternal
  ) then
    raise exception 'OPS-211 Y5: trg_enforce_role_change tetigi yok';
  end if;

  raise notice 'OPS-211 oz-kontrolu GECTI (Y4, Y5, K5)';
end $$;

commit;
