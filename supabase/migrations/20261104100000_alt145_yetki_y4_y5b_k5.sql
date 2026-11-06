-- Migration: 20261104100000_alt145_yetki_y4_y5b_k5.sql
-- ALT-145 — yetki sıkılaştırması: Y4 (admin_list_all_users rol listesi), Y5-b (oturumlu rol değişikliği denetimi),
-- K5 (admin_audit_log INSERT politikasına actor şartı). (Kanban: ALT-145)
-- Cetvel: docs/standards/migration-safety-standard.md · CLAUDE.md kural 11, 12, 13, 14 · karne docs/audits/guvenlik-karnesi-2026-11.md (Y4, Y5, K5).
--
-- ⚠ MIGRATION = PROD (kural 13): master'a birleşince supabase-migrate.yml canlıya OTOMATİK uygular.
--   Yalnız Recep onayıyla birleşir.
--
-- NİÇİN BU DOSYA VAR: #2217 (OPS-211) bu üç açığı kapatıyordu ama damgası 20261103090000 idi ve enforce_role_change'i
--   11-01 tabanından yazıyordu. Defter modeli (supabase-migrate.yml, public._migration_ledger) deftere işlenmemiş
--   dosyaları damga sırasıyla uygular: #2217, alt135'ten (20261103140000) SONRA işlenir ve alt135'in "son super_admin
--   düşürülemez" korumasını (danışma kilidi) canlıda SİLERDİ. Bu migration #2217'nin yerine geçer; damgası alt135'ten
--   sonradır, yalnız hâlâ AÇIK üç parçayı taşır ve enforce_role_change gövdesini alt135'ten AYNEN alır.
--
-- NE YAPAR:
--   Y4)   admin_list_all_users(): rol listesi ('admin','super_admin'); moderator çıkar (fonksiyon tüm kullanıcıların
--         e-posta ve telefonunu döndürür, KVKK). Moderator'ün /admin/users ve /admin/quotes rotası zaten yok
--         (src/lib/rbac.ts), yani arayüzde işlevsel kayıp yok. Gövde 2026-11-03 şema tabanından birebir; imza,
--         SECURITY DEFINER, search_path ve GRANT'lar aynı (CREATE OR REPLACE ACL'i korur).
--   Y5-b) enforce_role_change(): gövde alt135 (20261103140000) ile BİREBİR aynı, "son super_admin düşürülemez"
--         danışma kilidi ve Y5-a dahil; tek ekleme, OTURUMLU rol değişikliği yolunun sonuna admin_audit_log insert'ü.
--         Fail-closed: exception ile sarılmaz.
--   K5)   admin_audit_log_insert_v2: WITH CHECK'e actor = (select auth.uid()) eklenir (iz sahteciliği: bir admin
--         başkası adına satır yazamaz). ALTER POLICY komutu, rolü ve adı korur; diğer iki şart tabandan aynen.
--
-- K5 ETKİ ÖLÇÜMÜ (2026-11-04, kaynak okuması): istemci yazıcısı src/lib/audit.ts actor'u oturumdan doldurur
--   (hiçbir çağıran actor vermiyor), yani normal yazım politikayı geçer. Veritabanı içi yazıcıların hepsi
--   SECURITY DEFINER (taban: admin_publish_quote, admin_resend_quote_published, anonymize_user_personal_data,
--   denetim_izi_fiyat_ozet, denetim_izi_maliyet_ozet, denetim_izi_yaz, enforce_role_change) ve kenar fonksiyonları service_role anahtarıyla yazar:
--   hepsi RLS'i atlar, politikadan etkilenmez. Artık reddedilen tek yazım: authenticated rolüyle actor'u açıkça
--   NULL ya da başkasının kimliği gönderilen satır (audit.ts oturum okunamazsa actor: null yollar; authenticated
--   JWT'si olup oturumu okunamayan bir istemci src taramasında bulunmadı).
--
-- NE YAPMAZ: Y5-a (super_admin düşürme kuralı) ve super_admin'e yükseltme kuralı alt135'te zaten var, burada
--   TEKRARLANMAZ. İmza değiştirmez (src/types/database.types.ts güncellemesi gerekmez), GRANT/REVOKE'a dokunmaz,
--   admin_list_users'a dokunmaz, tenant filtresi eklemez, src/lib/audit.ts'e dokunmaz.
--
-- GERİ ALMA: scripts/db/rollback/20261104100000_alt145_yetki_y4_y5b_k5_geri_al.sql — yalnız bu migration'ın eklediklerini kaldırır
--   (moderator listeye geri girer, Y5-b insert'ü çıkar ve enforce_role_change alt135 hâline döner, korumalar KALIR,
--   politika eski hâline döner). Veri silinmez; yazılmış admin_audit_log satırları kalır.

begin;
set lock_timeout = '1s';
set statement_timeout = '5s';

-- ───────── Y4: admin_list_all_users rol kapısı ─────────
CREATE OR REPLACE FUNCTION "public"."admin_list_all_users"() RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "phone" "text", "role" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Authorization: yalnız admin ve super_admin (ALT-145 karne Y4: moderator çıkarıldı).
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','super_admin')
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

-- ───────── Y5-b: enforce_role_change (gövde alt135 + oturumlu denetim insert'ü) ─────────
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

  -- ALT-145 (karne Y5-b, kural 11): OTURUMLU her rol değişikliği TAM bir denetim satırı bırakır.
  -- Buraya yalnız yukarıdaki tüm kapıları geçen yazım gelir (oturumsuz/service_role dalı yukarıda erken döndü;
  -- onun kendi izi ve WARNING'e inen davranışı DEĞİŞMEDİ). Sütun kümesi o dalın insert'ü ile aynıdır.
  -- Exception ile SARILMAZ (fail-closed): iz yazılamıyorsa rol değişikliği de olmaz; satır aynı işlemdedir,
  -- değişiklik geri alınırsa iz de geri alınır. Fonksiyon SECURITY DEFINER/owner postgres: admin_audit_log
  -- RLS'i (force=false) atlanır, K5 politikası (actor = auth.uid()) bu yazımı etkilemez.
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

-- ───────── K5: admin_audit_log INSERT politikası, actor şartı ─────────
alter policy admin_audit_log_insert_v2 on public.admin_audit_log
  with check (
    tenant_id = public.jwt_tenant_id()
    and public.is_admin_user()
    and actor = (select auth.uid())
  );

commit;

-- Merge sonrası canlı doğrulama (salt okuma; ALT-145 beklenen değerleri):
--   select prosrc like '%''moderator''%' as moderator_var from pg_proc where oid = 'public.admin_list_all_users()'::regprocedure;
--     -- beklenen: false
--   select prosrc like '%pg_advisory_xact_lock%' as son_super_admin_kilidi, prosrc like '%''role_change''%' as oturumlu_iz
--     from pg_proc where oid = 'public.enforce_role_change()'::regprocedure;
--     -- beklenen: true, true
--   select with_check from pg_policies where tablename = 'admin_audit_log' and policyname = 'admin_audit_log_insert_v2';
--     -- beklenen: tenant_id, is_admin_user() ve actor = ( SELECT auth.uid() ) üçü de var
