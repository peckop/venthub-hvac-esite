-- ALT-155 · CANLI UYGULAMA ÖLÇÜMÜ — SALT OKUMA, YAZIM YOK (tek SELECT; hiçbir nesneye dokunmaz).
--
-- AMAÇ: şu üç migration'ın CANLIYA UYGULANDIĞINI ölçer; "birleşti" ile "prod'da yürürlükte" aynı şey değildir
--   (kural 13: supabase-migrate.yml damga sırasıyla uygular, düşen dosya sonrakileri de durdurur):
--     alt135  20261103140000_alt135_definer_yetki_sikilastirma.sql   (yalnız-tetik EXECUTE, deny politikaları, süper admin kuralı)
--     alt145  20261104100000_alt145_yetki_y4_y5b_k5.sql              (Y4 rol listesi, Y5-b oturumlu iz, K5 actor şartı)
--     alt136  20261104110000_alt136_definer_kiraci_kapisi.sql        (DEFINER fonksiyonlarına kiracı kapısı)
--   İki kanıt birlikte aranır: (1) defter kaydı (public._migration_ledger; supabase-migrate.yml basename'i .sql ile yazar),
--   (2) kataloğun KENDİSİ: pg_proc gövdesinde ayırt edici metin, pg_policies.with_check, ACL. Defter "uygulandı" der ama
--   gövde eski kalabilir (iki-defter vakası T073) ya da tersi; ikisi birbirini doğrular.
--
-- NASIL KOŞULUR (OPS): salt okuma, örn.
--     psql "$DB_URL" -v ON_ERROR_STOP=1 -f scripts/db/alt155-canli-uygulama-olcum.sql
--   ya da Supabase SQL düzenleyicisine/execute_sql'e olduğu gibi yapıştırılır. Bağlantı dizesini ya da çıktıdaki hiçbir değeri
--   (yalnız mantıksal sonuç ve sayılar basılır) rapora yazarken sır sayma: burada sır yok.
--
-- ÇIKTI: her satır bir kontrol. Sütunlar: kontrol, beklenen, gercek, tamam.
--   tamam = true  -> beklenen değer ölçüldü; false -> uygulanmamış ya da geri alınmış (satırın "kontrol" başlığındaki migration);
--   tamam = NULL  -> yalnız BİLGİ, hüküm taşımaz. Son satır OZET: tüm hüküm satırları tamam ise 'true'.
--   Kontrol başlığı migration kısaltmasıyla başlar (alt135 · , alt145 · , alt136 · ): hangi dosya eksikse bellidir.
--
-- ÖLÇÜLMEYEN (adıyla): fonksiyonun çağrıldığında ne yaptığı (davranış) bu sorguda ölçülmez; o CI'da gerçek Postgres'te
--   koşar (src/__tests__/conformance/yetki-davranis-pg.test.ts). Burada yalnız "doğru gövde canlıda mı" ölçülür.
--   Çağıran rollerin etkin EXECUTE yetkisi (anon dahil) INV-AUTH-DEFINER-ANON-1'in işidir; burada yalnız alt135'in
--   kapattığı dokuz fonksiyonun anon/authenticated yetkisi sayılır.
--
-- BEKLENEN DEĞERLERİN KAYNAĞI: her migration dosyasının SONUNDAKİ "Merge sonrası canlı doğrulama" yorumları + gövdelerinden
--   ayırt edici metin. Sorgu yalnız katalog ve defter okur (pg_proc, pg_policies, pg_class, has_*_privilege,
--   public._migration_ledger, auth.users sayacı); hiçbir tablo satırı değeri (e-posta vb.) okunmaz ya da basılmaz.

with
kayit as (
  select name from public._migration_ledger
),
fn as (
  select p.oid, p.proname, p.prosrc, p.proconfig
    from pg_proc p
   where p.pronamespace = 'public'::regnamespace
),
alt135_fn as (
  -- alt135'in anon/authenticated/PUBLIC EXECUTE'unu kapattığı dokuz fonksiyon (set_stock iki imzadır).
  select * from fn
   where proname in ('denetim_izi_yaz','notify_order_paid','notify_quote_request_created','set_order_number',
                     'stamp_order_paid_at','set_stock','admin_resend_quote_published','anonymize_user_personal_data')
),
alt135_servis as (
  select * from fn
   where proname in ('set_stock','admin_resend_quote_published','anonymize_user_personal_data')
),
alt135_tablo as (
  select unnest(array['order_number_counters','quote_number_counters','search_reindex_queue','url_takma_adlari','_migration_ledger']) as ad
),
alt136_fn as (
  select * from fn
   where proname in ('adjust_stock','admin_list_all_users','admin_list_users','process_order_stock_restore','set_user_admin_role')
),
olcum(sira, kontrol, beklenen, gercek, tamam) as (

  -- ───────────── alt135 · 20261103140000 ─────────────
  select 10, 'alt135 · defter kaydı (20261103140000_alt135_definer_yetki_sikilastirma.sql)', 'true',
         (select count(*) > 0 from kayit where name = '20261103140000_alt135_definer_yetki_sikilastirma.sql')::text,
         (select count(*) > 0 from kayit where name = '20261103140000_alt135_definer_yetki_sikilastirma.sql')
  union all
  select 11, 'alt135 · yalnız-tetik ve denetimli 9 fonksiyon: anon/authenticated EXECUTE''i açık olan sayısı (bulunan en az 9)', 'acik=0, bulunan>=9',
         'acik=' || (select count(*) from alt135_fn where has_function_privilege('anon', oid, 'execute') or has_function_privilege('authenticated', oid, 'execute'))
           || ', bulunan=' || (select count(*) from alt135_fn),
         (select count(*) from alt135_fn where has_function_privilege('anon', oid, 'execute') or has_function_privilege('authenticated', oid, 'execute')) = 0
           and (select count(*) from alt135_fn) >= 9
  union all
  select 12, 'alt135 · set_stock x2, admin_resend_quote_published, anonymize_user_personal_data: service_role EXECUTE var (4 imzanın 4''ü)', '4/4',
         (select count(*) filter (where has_function_privilege('service_role', oid, 'execute')) from alt135_servis) || '/' || (select count(*) from alt135_servis),
         (select count(*) filter (where has_function_privilege('service_role', oid, 'execute')) from alt135_servis) = 4
           and (select count(*) from alt135_servis) = 4
  union all
  select 13, 'alt135 · stamp_order_paid_at proconfig (search_path sabit)', 'search_path=""',
         coalesce((select array_to_string(proconfig, ',') from fn where proname = 'stamp_order_paid_at' limit 1), 'YOK'),
         coalesce((select array_to_string(proconfig, ',') from fn where proname = 'stamp_order_paid_at' limit 1), '') = 'search_path=""'
  union all
  select 14, 'alt135 · 5 tabloda RLS açık', '5',
         (select count(*) from pg_class c join alt135_tablo t on t.ad = c.relname
           where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and c.relrowsecurity)::text,
         (select count(*) from pg_class c join alt135_tablo t on t.ad = c.relname
           where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and c.relrowsecurity) = 5
  union all
  select 15, 'alt135 · 5 tabloda <tablo>_deny_all RESTRICTIVE ALL politikası', '5',
         (select count(*) from pg_policies pp join alt135_tablo t on t.ad = pp.tablename
           where pp.schemaname = 'public' and pp.policyname = pp.tablename || '_deny_all'
             and pp.permissive = 'RESTRICTIVE' and pp.cmd = 'ALL')::text,
         (select count(*) from pg_policies pp join alt135_tablo t on t.ad = pp.tablename
           where pp.schemaname = 'public' and pp.policyname = pp.tablename || '_deny_all'
             and pp.permissive = 'RESTRICTIVE' and pp.cmd = 'ALL') = 5
  union all
  select 16, 'alt135 · _migration_ledger: anon ve authenticated tablo yetkisi (select/insert/update/delete/truncate/references/trigger)', 'false',
         (has_table_privilege('anon', 'public._migration_ledger', 'select,insert,update,delete,truncate,references,trigger')
            or has_table_privilege('authenticated', 'public._migration_ledger', 'select,insert,update,delete,truncate,references,trigger'))::text,
         not (has_table_privilege('anon', 'public._migration_ledger', 'select,insert,update,delete,truncate,references,trigger')
            or has_table_privilege('authenticated', 'public._migration_ledger', 'select,insert,update,delete,truncate,references,trigger'))
  union all
  select 17, 'alt135 · enforce_role_change: son super_admin kilidi (pg_advisory_xact_lock + ''son super_admin dusurulemez'')', 'true',
         (select bool_and(prosrc like '%pg_advisory_xact_lock%' and prosrc like '%son super_admin dusurulemez%') from fn where proname = 'enforce_role_change')::text,
         coalesce((select bool_and(prosrc like '%pg_advisory_xact_lock%' and prosrc like '%son super_admin dusurulemez%') from fn where proname = 'enforce_role_change'), false)

  -- ───────────── alt145 · 20261104100000 ─────────────
  union all
  select 20, 'alt145 · defter kaydı (20261104100000_alt145_yetki_y4_y5b_k5.sql)', 'true',
         (select count(*) > 0 from kayit where name = '20261104100000_alt145_yetki_y4_y5b_k5.sql')::text,
         (select count(*) > 0 from kayit where name = '20261104100000_alt145_yetki_y4_y5b_k5.sql')
  union all
  select 21, 'alt145 · Y4 admin_list_all_users: gövdede tırnaklı ''moderator'' var mı', 'false',
         (select bool_or(prosrc like '%''moderator''%') from fn where proname = 'admin_list_all_users')::text,
         coalesce((select not bool_or(prosrc like '%''moderator''%') from fn where proname = 'admin_list_all_users'), false)
  union all
  select 22, 'alt145 · Y4 admin_list_all_users: çağıran kapısı yalnız (''admin'',''super_admin'')', 'true',
         (select bool_and(prosrc ~ $re$up\.role IN \('admin','super_admin'\)\s*\) THEN$re$) from fn where proname = 'admin_list_all_users')::text,
         coalesce((select bool_and(prosrc ~ $re$up\.role IN \('admin','super_admin'\)\s*\) THEN$re$) from fn where proname = 'admin_list_all_users'), false)
  union all
  select 23, 'alt145 · Y5-b enforce_role_change: oturumlu iz insert''ü (''role_change'') ve son super_admin kilidi birlikte', 'true',
         (select bool_and(prosrc like '%''role_change''%' and prosrc like '%pg_advisory_xact_lock%') from fn where proname = 'enforce_role_change')::text,
         coalesce((select bool_and(prosrc like '%''role_change''%' and prosrc like '%pg_advisory_xact_lock%') from fn where proname = 'enforce_role_change'), false)
  union all
  select 24, 'alt145 · K5 admin_audit_log_insert_v2 with_check: tenant_id, is_admin_user() ve actor = (SELECT auth.uid()) üçü de var', 'true',
         coalesce((select (with_check like '%tenant_id%' and with_check like '%is_admin_user()%' and with_check ~ 'actor\s*=\s*\(\s*SELECT\s+auth\.uid\(\)')::text
                     from pg_policies where schemaname = 'public' and tablename = 'admin_audit_log' and policyname = 'admin_audit_log_insert_v2'), 'POLITIKA YOK'),
         coalesce((select (with_check like '%tenant_id%' and with_check like '%is_admin_user()%' and with_check ~ 'actor\s*=\s*\(\s*SELECT\s+auth\.uid\(\)')
                     from pg_policies where schemaname = 'public' and tablename = 'admin_audit_log' and policyname = 'admin_audit_log_insert_v2'), false)

  -- ───────────── alt136 · 20261104110000 ─────────────
  union all
  select 30, 'alt136 · defter kaydı (20261104110000_alt136_definer_kiraci_kapisi.sql)', 'true',
         (select count(*) > 0 from kayit where name = '20261104110000_alt136_definer_kiraci_kapisi.sql')::text,
         (select count(*) > 0 from kayit where name = '20261104110000_alt136_definer_kiraci_kapisi.sql')
  union all
  select 31, 'alt136 · adjust_stock x2, admin_list_all_users, admin_list_users, process_order_stock_restore, set_user_admin_role: gövdede jwt_tenant_id() (kapılı/toplam)', '6/6',
         (select count(*) filter (where prosrc like '%jwt_tenant_id()%') from alt136_fn) || '/' || (select count(*) from alt136_fn),
         (select count(*) filter (where prosrc like '%jwt_tenant_id()%') from alt136_fn) = 6 and (select count(*) from alt136_fn) = 6
  union all
  select 32, 'alt136 · process_order_stock_restore: atlanan ürün sayacı (v_skipped) ve ''Product tenant mismatch'' zarfı', 'true',
         (select bool_and(prosrc like '%v_skipped%' and prosrc like '%Product tenant mismatch%') from fn where proname = 'process_order_stock_restore')::text,
         coalesce((select bool_and(prosrc like '%v_skipped%' and prosrc like '%Product tenant mismatch%') from fn where proname = 'process_order_stock_restore'), false)
  union all
  select 33, 'alt136 · set_user_admin_role: hedef kiracı kapısı (v_hedef_tenant)', 'true',
         (select bool_and(prosrc like '%v_hedef_tenant%') from fn where proname = 'set_user_admin_role')::text,
         coalesce((select bool_and(prosrc like '%v_hedef_tenant%') from fn where proname = 'set_user_admin_role'), false)
  union all
  select 34, 'alt136 · admin_list_all_users: kiracı süzgeci (up.tenant_id = public.jwt_tenant_id())', 'true',
         (select bool_and(prosrc ~ $re$up\.tenant_id\s*=\s*public\.jwt_tenant_id\(\)$re$) from fn where proname = 'admin_list_all_users')::text,
         coalesce((select bool_and(prosrc ~ $re$up\.tenant_id\s*=\s*public\.jwt_tenant_id\(\)$re$) from fn where proname = 'admin_list_all_users'), false)
  union all
  select 35, 'alt136 · admin_list_users: çağıran kapısı (''admin'',''super_admin''), satır öznesi moderator''ü hâlâ içerir (bilinçli)', 'true',
         (select bool_and(prosrc ~ $re$up\.role IN \('admin','super_admin'\)\s*\) THEN$re$ and prosrc like '%up.role IN (''admin'',''moderator'',''super_admin'')%')
            from fn where proname = 'admin_list_users')::text,
         coalesce((select bool_and(prosrc ~ $re$up\.role IN \('admin','super_admin'\)\s*\) THEN$re$ and prosrc like '%up.role IN (''admin'',''moderator'',''super_admin'')%')
            from fn where proname = 'admin_list_users'), false)

  -- ───────────── bilgi (hüküm yok) ─────────────
  union all
  select 90, 'bilgi · auth.users sayısı / user_profiles sayısı (fark = profilsiz satır; alt136 sonrası admin_list_all_users onları listelemez)', '(hüküm yok)',
         (select count(*) from auth.users) || ' / ' || (select count(*) from public.user_profiles), null::boolean
  union all
  select 91, 'bilgi · public._migration_ledger toplam kayıt ve en yeni 3 kayıt adı', '(hüküm yok)',
         (select count(*) from kayit) || ' · ' || coalesce((select string_agg(name, ', ' order by name desc) from (select name from kayit order by name desc limit 3) k), 'kayıt yok'),
         null::boolean
  union all
  select 92, 'bilgi · supabase_migrations.schema_migrations var mı (bu depo bu defteri KULLANMAZ; T073: supabase db push yasak)', '(hüküm yok)',
         case when to_regclass('supabase_migrations.schema_migrations') is null then 'yok' else 'var' end, null::boolean
)
select kontrol, beklenen, coalesce(gercek, 'YOK (fonksiyon/politika bulunamadı)') as gercek, tamam
  from (
    select sira, kontrol, beklenen, gercek, tamam from olcum
    union all
    select 99, 'OZET · hüküm taşıyan tüm satırlar tamam mı (tamam=false satırı varsa ilk önce oradaki migration eksiktir)',
           'true',
           (count(*) filter (where tamam is true))::text || '/' || (count(*) filter (where tamam is not null))::text,
           bool_and(tamam) filter (where tamam is not null)
      from olcum
  ) s
 order by sira;
