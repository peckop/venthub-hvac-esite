-- REC-321 adım 2 — error_groups YAZMA politikası (UPDATE)
--
-- ⛔BU DOSYA MERGE EDİLMEZ. CLAUDE.md kural 13: migration içeren dal master'a
-- merge edilince `supabase-migrate.yml` onu prod DB'ye OTOMATİK uygular.
-- Merge yalnız Recep'in açık sözüyle olur. PR'da inceleme içindir.
--
-- NİÇİN: `public.error_groups` tablosunda RLS AÇIK ve tek politika var, o da
-- SELECT (`admins_read_error_groups`). Yazma politikası yok, `service_role`
-- politikası da yok. Yani `authenticated` için UPDATE tamamen reddediliyor.
--
-- ÖLÇÜLDÜ (2026-09-13): admin paneli tarayıcı istemcisiyle bu tabloya DÖRT
-- ayrı yerden yazıyor — src/views/admin/ErrorGroupsTableBody.tsx
--   satır 313  .update({ status })        tek satır durum değiştirme
--   satır 346  .update({ assigned_to })   atama
--   satır 377  .update({ notes })         not yazma
--   satır 408  .update({ status })        toplu durum değiştirme (.in)
-- Dördü de RLS'e takılıyor. Kanıt sınıfı: kod + `pg_policies` listesi;
-- canlı deneme YAPILMADI.
--
-- ⚠SAPMA, ADIYLA: iş emri politikayı `admin_audit_log` *_v2 kalıbıyla, yani
-- `tenant_id = jwt_tenant_id() AND is_admin_user()` ile istedi. Bu tabloda
-- UYGULANAMAZ: `error_groups` tablosunda `tenant_id` sütunu YOK (ölçüldü,
-- information_schema.columns: id, signature, level, last_message, url_sample,
-- env, release, first_seen, last_seen, count, status, assigned_to, notes).
-- Kalıp körü körüne kopyalansa migration "column does not exist" ile patlardı.
-- Bu yüzden koşul, aynı tablodaki MEVCUT SELECT politikasıyla birebir aynı
-- tutuldu: `is_admin_user()`. Tek tablo içinde okuma ve yazma kararının aynı
-- yerden verilmesi, iki ayrı doğruluk kaynağı bırakmaktan iyidir.
--
-- `is_admin_user()` uygulama rolünü `user_role` / `app_metadata.user_role`
-- üzerinden okur (CLAUDE.md kural 12). ⛔`jwt_role()` KULLANILMADI: o fonksiyon
-- JWT'nin üst düzey `role` talebini, yani POSTGRES rolünü okuyor ve yetki
-- kararı için yanlıştır (bkz. REC-322 — uyuyan kapı).

-- Kilit bekleyen bir ifade prod'da tabloya gelen tüm istekleri süresiz
-- durdurabilir. Zaman aşımı = bekleyip kilitlemek yerine hızlı başarısız olmak.
-- INV-MIGRATION-3 bu iki satırı arar.
set lock_timeout = '5s';
set statement_timeout = '5s';

-- CREATE POLICY için `IF NOT EXISTS` PostgreSQL'de YOKTUR (depodaki altı eski
-- dosyanın düştüğü tuzak tam buydu — REC-321). Yeniden koşulabilirliğin doğru
-- biçimi `drop policy if exists` + `create policy`.
drop policy if exists error_groups_update_admin on public.error_groups;

create policy error_groups_update_admin
  on public.error_groups
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- NOT: INSERT ve DELETE politikası BİLEREK eklenmedi. İstemci kodunda bu
-- tabloya insert/delete YOK; satır üretimi `log-client-error` edge
-- fonksiyonunun increment yolundan geliyor ve o yol `service_role` ile koşuyor
-- (bypassrls). Kapsamı gereksiz genişletmek, kapalı kalması gereken bir yüzeyi
-- açmak olurdu.
