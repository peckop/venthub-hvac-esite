-- GERİ ALMA · 20261104100000_alt145_yetki_y4_y5b_k5.sql (ALT-145)
-- OTOMATİK UYGULANMAZ (supabase/migrations dışında). Elle, Recep sözüyle koşulur.
--
-- YALNIZ bu migration'ın eklediklerini geri alır:
--   Y4   admin_list_all_users rol listesi 2026-11-03 tabanındaki hâline döner (moderator geri gelir).
--   Y5-b enforce_role_change alt135 hâline (20261103140000_alt135_definer_yetki_sikilastirma.sql) döner:
--        oturumlu denetim insert'ü kalkar; alt135 korumaları (son super_admin kilidi, Y5-a, yükseltme kuralı) KALIR.
--   K5   admin_audit_log_insert_v2 actor şartsız eski hâline döner.
-- Etki: moderator tüm kullanıcıların e-posta ve telefonunu yeniden görebilir; oturumlu rol değişiklikleri iz
-- bırakmaz; bir admin başkası adına denetim satırı yazabilir. Veri silinmez; migration'ın yazdığı
-- admin_audit_log satırları kalır.

begin;
set lock_timeout = '1s';
set statement_timeout = '5s';

CREATE OR REPLACE FUNCTION "public"."admin_list_all_users"() RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "phone" "text", "role" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Authorization: allow admins/moderators/super_admin/super_admin only
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','moderator','super_admin','super_admin')
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id,
         (u.email)::text        AS email,
         (up.full_name)::text   AS full_name,
         (up.phone)::text       AS phone,
         COALESCE((up.role)::text, 'user') AS role,
         COALESCE(up.created_at, u.created_at) AS created_at,
         COALESCE(up.updated_at, u.updated_at) AS updated_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  ORDER BY COALESCE(up.created_at, u.created_at) DESC;
END;
$$;

create or replace function public.enforce_role_change() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
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

  -- ALT-135 kural (b): SON super_admin düşürülemez (service_role dahil: sistemi kilitlememe).
  -- Bu blok oturumsuz/service_role dalından ÖNCE durur; çünkü o dal aşağıda erken `return new` verir.
  -- Eşzamanlı iki düşürme birbirini görmesin diye işlem-düzeyi danışma kilidi alınır; kilit işlem
  -- sonunda kalkar ve sonraki işlem yeni anlık görüntüyle sayar (READ COMMITTED).
  if tg_op = 'UPDATE' and old.role = 'super_admin' and new.role is distinct from 'super_admin' then
    perform pg_advisory_xact_lock(hashtextextended('user_profiles:super_admin_sayisi', 0));
    if not exists (
      select 1 from public.user_profiles up
      where up.role = 'super_admin' and up.id <> old.id
    ) then
      raise exception 'son super_admin dusurulemez (en az bir super_admin kalmali)';
    end if;
  end if;

  ayricalikli := new.role in ('admin','super_admin');

  -- ============================ OTURUMSUZ BAĞLAM ============================
  -- NİÇİN VAR: profil satırını auth.users üzerindeki trg_handle_new_user_profile
  -- OTURUMSUZ yaratır (auth.uid() NULL); sağlama/göç betikleri de service_role ile koşar.
  --
  -- ÖNCEKİ TASLAK BU DALI KOŞULSUZ SERBEST BIRAKIYORDU. Ölçüm bunun GEREKMEDİĞİNİ
  -- gösterdi: handle_new_user_profile rolü zorla ayrıcalıksız yapıyor —
  --   IF NOT (auth.role()='service_role' OR is_admin_user()) THEN role_val := 'user'
  -- yani sıradan kayıtta rol DAİMA ayrıcalıksız. Dolayısıyla dal, "her oturumsuz bağlam
  -- serbest" olmak zorunda değil; yalnız AYRICALIKLI yazımlar için gevşetilir.
  if auth.uid() is null or coalesce(auth.role(), '') = 'service_role' then

    -- Sıradan kayıt (ayrıcalıksız rol): sessizce geçer, İZ YAZILMAZ.
    -- Niçin iz yok: her signup'a bir denetim satırı yazmak, asıl sinyali (oturumsuz bir
    -- ayrıcalıklı yazım) gürültüde boğar. Okunmayan alarm alarm değildir.
    if not ayricalikli then
      return new;
    end if;

    -- Ayrıcalıklı rol, oturumsuz bağlamda: YALNIZ service_role.
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'oturumsuz baglamda ayricalikli rol atanamaz (%)', new.role;
    end if;

    -- service_role ile ayrıcalıklı yazım: GEÇER, ama iz bırakır.
    --
    -- ⚠ BU İZİN YAZILABİLMESİ, YAZILMAMIŞ BİR ÖZELLİĞE BAĞLI — adıyla yazıyorum:
    -- admin_audit_log RLS AÇIK (rowsecurity=true) ama force=false ve tablo sahibi postgres.
    -- Bu fonksiyon SECURITY DEFINER/owner=postgres olduğu için sahip RLS'i ATLAR ve INSERT
    -- geçer. INSERT politikası ((tenant_id = jwt_tenant_id()) AND is_admin_user()) oturumsuz
    -- bağlamda YANLIŞ'tır. Biri admin_audit_log'a FORCE ROW LEVEL SECURITY verirse bu alarm
    -- SESSİZCE ölür — çünkü aşağıdaki exception guard hatayı WARNING'e indirir.
    -- Kalıcı çözüm bu migration'da değil, bekçi kaleminde.
    --
    -- NİÇİN exception ile sarılı: denetim yazımı patlarsa KAYIT/GÖÇ AKIŞI KIRILMAMALI.
    -- Alarm, korumaya çalıştığı şeyi bozarsa net zarar üretir.
    begin
      insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
      values (
        auth.uid(),                       -- NULL olabilir: kolon nullable, kasıtlı
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

  -- ALT-135 kural (a): super_admin satırının rolünü yalnız super_admin değiştirir
  -- (admin ya da moderatör bir super_admin'i düşüremez).
  if tg_op = 'UPDATE' and old.role = 'super_admin' and aktor is distinct from 'super_admin' then
    raise exception 'only super_admin can change a super_admin role';
  end if;

  -- YENİ: super_admin'e YÜKSELTMEYİ yalnız super_admin yapar (hedef kim olursa olsun)
  if new.role = 'super_admin' and aktor is distinct from 'super_admin' then
    raise exception 'only super_admin can grant super_admin';
  end if;

  return new;
end;
$$;

alter policy admin_audit_log_insert_v2 on public.admin_audit_log
  with check (
    tenant_id = public.jwt_tenant_id()
    and public.is_admin_user()
  );

commit;
