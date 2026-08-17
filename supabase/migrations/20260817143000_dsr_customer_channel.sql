-- =====================================================================
-- T063 PR-2 · KVKK veri sahibi talebi — MÜŞTERİ KANALI (RLS + kolon grant)
-- =====================================================================
-- Cetvel: docs/standards/legal-compliance-standard.md §3.5 / §3.6
--
-- NEDEN: `data_subject_requests` tablosunda tek politika vardı (`p_dsr_admin_all`
-- = is_admin_user()). Yani giriş yapmış bir kullanıcı KENDİ talebini ne açabiliyor
-- ne görebiliyordu — hesap sayfasından başvuru "kanalı" RLS tarafından sessizce
-- reddedilirdi. Bu migration o yolu, veri sahibini KENDİ satırına hapsederek açar.
--
-- ⚠️ MIGRATION = PROD: master'a merge edilince supabase-migrate.yml otomatik uygular
-- (CLAUDE.md kural 13). Merge kararı yalnız Recep'e aittir.
--
-- TASARIM — İKİ KAPI BİRLİKTE (biri tek başına yetersiz):
--   1) SATIR kapısı (RLS): kullanıcı yalnız `user_id = auth.uid()` satırını görür/yazar.
--   2) KOLON kapısı (GRANT): RLS kolon-düzeyi kontrol ETMEZ. Yalnız satır kapısı
--      konursa kullanıcı `status='completed'`, `outcome='...'`, `due_at=<uzak tarih>`
--      ile INSERT edip DEFTERİ KİRLETİR — kendi talebini "sonuçlanmış" gösterebilir
--      ya da 30 günlük süreyi kendi lehine/aleyhine kaydırabilir. Bu yüzden
--      yazılabilir kolonlar ADLA sayılır: applicant_email, request_type, user_id.
--      Süre (`due_at`), durum (`status`), sonuç (`outcome`), saklanan-veri notu ve
--      kimlik-tevsik damgası YALNIZ admin/service_role tarafından yazılır.
--
-- KİMLİK TEVSİKİ DB'DE ZORLANIR: `applicant_email` JWT'deki e-postaya EŞİT olmak
-- zorunda (with check). Tebliğ m.5 "sistemde kayıtlı e-posta" şartının teknik
-- karşılığı budur; kullanıcı başkasının adına talep açamaz.
--
-- `identity_verified_at`'i kullanıcı YAZAMAZ (bilinçli): damgayı admin, başvuruyu
-- değerlendirirken atar. Oturumdan gelen talepte kimlik zaten teknik olarak
-- doğrulanmıştır ama o değerlendirme hukuki bir karardır, istemcinin beyanı değil.

-- ---------------------------------------------------------------------
-- 1) Veri sahibi KENDİ talebini açabilir
-- ---------------------------------------------------------------------
drop policy if exists p_dsr_owner_insert on public.data_subject_requests;
create policy p_dsr_owner_insert on public.data_subject_requests
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and applicant_email = (select auth.jwt() ->> 'email')
  );

-- ---------------------------------------------------------------------
-- 2) Veri sahibi KENDİ talebini görebilir (sürecin şeffaflığı)
-- ---------------------------------------------------------------------
drop policy if exists p_dsr_owner_select on public.data_subject_requests;
create policy p_dsr_owner_select on public.data_subject_requests
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 3) KOLON kapısı — yazılabilir alanlar ADLA
-- ---------------------------------------------------------------------
-- NOT: UPDATE grant'i VERİLMEZ. Veri sahibi talebini açtıktan sonra üzerinde
-- değişiklik yapamaz; süreç admin tarafından yürütülür ve defter ispat aracıdır.
-- (Talebi geri çekmek isterse kanal üzerinden bildirir, admin `rejected` +
-- `outcome` ile kapatır — süreç izi silinmez.)
grant insert (applicant_email, request_type, user_id)
  on public.data_subject_requests to authenticated;

comment on policy p_dsr_owner_insert on public.data_subject_requests is
  'Veri sahibi kendi talebini açar. Kimlik tevsiki: applicant_email = JWT email (Tebliğ m.5). '
  'Yazabildiği kolonlar kolon-GRANT ile dar: status/due_at/outcome/identity_verified_at '
  'yalnız admin. UPDATE grant''i yok — açılan talep müşteri tarafından değiştirilemez.';

comment on policy p_dsr_owner_select on public.data_subject_requests is
  'Veri sahibi yalnız kendi talebini görür; süreci ve 30 günlük son tarihi izleyebilir.';
