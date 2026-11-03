-- ALT-135 — Supabase Security Advisor düzeltmeleri: DEFINER/tetik yetki sıkılaştırma, RLS'li-politikasız tablolar,
-- _migration_ledger istemci yetkisi, süper admin koruma kuralı. (Kanban: ALT-135)
-- Cetvel: supabase-security yeteneği · migration-safety-standard.md · CLAUDE.md kural 11/12/13/14 ·
--         sınıflandırma: ALTYAPI araştırmacısı kod okuması, 2026-11-03 (taban 2026-11-01_public_schema.sql). Canlı ACL ÖLÇÜLMEDİ.
--
-- NE YAPAR:
--   1) Yalnız-tetik 5 fonksiyondan (denetim_izi_yaz, notify_order_paid, notify_quote_request_created,
--      set_order_number, stamp_order_paid_at) PUBLIC/anon/authenticated EXECUTE alınır. Tetik fonksiyonunun
--      EXECUTE yetkisi yalnız CREATE TRIGGER anında denetlenir, tetik ateşlenirken değil; satır tetikleri etkilenmez.
--      stamp_order_paid_at (SECURITY INVOKER) için search_path='' sabitlenir (gövde yalnız NEW/OLD/now(): pg_catalog
--      her zaman örtük aranır, şemasız tablo adı yok).
--   2) Çağıranı olmayan 4 DENETİMLİ fonksiyondan (set_stock x2, admin_resend_quote_published,
--      anonymize_user_personal_data) PUBLIC/anon/authenticated alınır; service_role açıkça GRANT edilir.
--   3) RLS açık + politikasız 4 tabloya (order_number_counters, quote_number_counters, search_reindex_queue,
--      url_takma_adlari) açık RESTRICTIVE deny politikası ve açıklama eklenir. Yazıcı/okuyucular SECURITY DEFINER
--      (sahip postgres; tablolarda FORCE ROW LEVEL SECURITY YOK, taban ölçüldü) ve service_role (BYPASSRLS): etkilenmez.
--   4) public._migration_ledger: anon/authenticated tablo yetkisi (TRUNCATE/TRIGGER/REFERENCES RLS dışıdır) alınır +
--      deny politikası. supabase-migrate.yml ledger'a SUPABASE_DB_URL (postgres) ile yazar: etkilenmez.
--   5) enforce_role_change (user_profiles tetiği): (a) super_admin satırının rolünü yalnız super_admin değiştirir;
--      (b) son super_admin düşürülemez (service_role dahil). Mevcut gövde tabandan birebir, yalnız iki blok eklendi.
--
-- NE YAPMAZ (adıyla): adjust_stock, set_user_admin_role, admin_list_*, admin_publish_quote, process_goods_receipt,
--   process_order_stock_restore, satis_kipi_oku, submit_contact_message, url_takma_ad_* DEĞİŞMEZ.
--   Kiracı kapısı (kural 12) ALT-136, iletişim formu sınırı ALT-137 kartlarındadır. Sızmış parola koruması
--   Free planda kapalı: kabul edilmiş risk. venthub_orders monoton tetiği ALT-131 dalındadır.
--
-- ⚠ davranış değişikliği: admin_resend_quote_published artık authenticated için kapalı (istemci çağıranı yok,
--   2026-11-03 src/supabase/functions/scripts taraması). Admin ekranı bunu ileride çağıracaksa GRANT ile açılır.
--
-- GERİ ALMA: 1-2) grant execute on function <imza> to anon, authenticated; (tetikler için gerek yok) ·
--   3-4) drop policy <tablo>_deny_all on public.<tablo>; _migration_ledger için grant all ... to anon, authenticated ·
--   5) enforce_role_change gövdesi 2026-11-01 tabanındaki sürüme döndürülür (CREATE OR REPLACE).

-- Tek işlem: ya hepsi ya hiçbiri (yarım kalan sıkılaştırma yok). Kilit/süre sınırı: bekleyen ALTER vitrini durdurmasın.
begin;
set lock_timeout = '5s';
set statement_timeout = '5s';

-- ───────── 1) yalnız-tetik fonksiyonlar ─────────
revoke execute on function public.denetim_izi_yaz() from public, anon, authenticated;
revoke execute on function public.notify_order_paid() from public, anon, authenticated;
revoke execute on function public.notify_quote_request_created() from public, anon, authenticated;
revoke execute on function public.set_order_number() from public, anon, authenticated;
revoke execute on function public.stamp_order_paid_at() from public, anon, authenticated;
alter function public.stamp_order_paid_at() set search_path = '';

-- ───────── 2) denetimli, çağıranı olmayan fonksiyonlar ─────────
revoke execute on function public.set_stock(uuid, integer, text) from public, anon, authenticated;
revoke execute on function public.set_stock(uuid, integer, text, uuid) from public, anon, authenticated;
revoke execute on function public.admin_resend_quote_published(uuid) from public, anon, authenticated;
revoke execute on function public.anonymize_user_personal_data(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.set_stock(uuid, integer, text) to service_role;
grant execute on function public.set_stock(uuid, integer, text, uuid) to service_role;
grant execute on function public.admin_resend_quote_published(uuid) to service_role;
grant execute on function public.anonymize_user_personal_data(uuid, uuid, boolean) to service_role;

-- ───────── 3) RLS açık, politikasız tablolar: açık deny ─────────
alter table public.order_number_counters enable row level security;
drop policy if exists order_number_counters_deny_all on public.order_number_counters;
create policy order_number_counters_deny_all on public.order_number_counters
  as restrictive for all to anon, authenticated using (false) with check (false);
comment on table public.order_number_counters is 'RLS açık, istemci erişimi yok; yalnız service_role ve SECURITY DEFINER fonksiyonlar (ALT-135). REC-156: sipariş numarasının günlük sıra sayacı; yalnız generate_order_number() yazar.';

alter table public.quote_number_counters enable row level security;
drop policy if exists quote_number_counters_deny_all on public.quote_number_counters;
create policy quote_number_counters_deny_all on public.quote_number_counters
  as restrictive for all to anon, authenticated using (false) with check (false);
comment on table public.quote_number_counters is 'RLS açık, istemci erişimi yok; yalnız service_role ve SECURITY DEFINER fonksiyonlar (ALT-135). REC-384: teklif numarasının kiracı+gün sayacı; yalnız stamp_quote_published yazar.';

alter table public.search_reindex_queue enable row level security;
drop policy if exists search_reindex_queue_deny_all on public.search_reindex_queue;
create policy search_reindex_queue_deny_all on public.search_reindex_queue
  as restrictive for all to anon, authenticated using (false) with check (false);
comment on table public.search_reindex_queue is 'RLS açık, istemci erişimi yok; yalnız service_role ve SECURITY DEFINER fonksiyonlar (ALT-135). REC-340: arama gövdesi tazeleme kuyruğu.';

alter table public.url_takma_adlari enable row level security;
drop policy if exists url_takma_adlari_deny_all on public.url_takma_adlari;
create policy url_takma_adlari_deny_all on public.url_takma_adlari
  as restrictive for all to anon, authenticated using (false) with check (false);
comment on table public.url_takma_adlari is 'RLS açık, istemci erişimi yok; yalnız service_role ve SECURITY DEFINER fonksiyonlar (ALT-135). REC-300: eski slug → bugünkü nesne; url_takma_ad_coz()/url_takma_adlari_listele() okur.';

-- ───────── 4) _migration_ledger ─────────
revoke all on table public._migration_ledger from anon, authenticated;
alter table public._migration_ledger enable row level security;
drop policy if exists _migration_ledger_deny_all on public._migration_ledger;
create policy _migration_ledger_deny_all on public._migration_ledger
  as restrictive for all to anon, authenticated using (false) with check (false);
comment on table public._migration_ledger is 'RLS açık, istemci erişimi yok; yalnız service_role ve SECURITY DEFINER fonksiyonlar (ALT-135). Migration defteri: supabase-migrate.yml postgres rolüyle yazar.';

-- ───────── 5) süper admin kuralı ─────────
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


commit;

-- Merge sonrası canlı doğrulama (salt okuma):
--   select p.proname, has_function_privilege('anon', p.oid, 'execute') anon, has_function_privilege('authenticated', p.oid, 'execute') auth
--     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public' and p.proname in ('denetim_izi_yaz','notify_order_paid','notify_quote_request_created','set_order_number','stamp_order_paid_at','set_stock','admin_resend_quote_published','anonymize_user_personal_data');  -- beklenen: hepsi false/false
--   select relname, relrowsecurity from pg_class where relname in ('order_number_counters','quote_number_counters','search_reindex_queue','url_takma_adlari','_migration_ledger');
--   select proconfig from pg_proc where proname = 'stamp_order_paid_at';  -- beklenen: {search_path=""}
