-- =====================================================================
-- T063 PR-2 · KVKK veri sahibi talebi — MÜŞTERİ KANALI (RLS satır + with-check değer kapısı)
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
-- TEHLIKE VE NEDEN BOYLE COZULDU (2026-08-18 prod olcumu):
-- Bu dosyanin ilk hali, yazilabilir alanlari KOLON-GRANT ile sinirlamaya calisiyordu:
--   grant insert (applicant_email, request_type, user_id) ... to authenticated
-- OLCTUM VE BU YETMIYOR. Prod'da `authenticated` rolunun bu tabloda ZATEN tablo
-- duzeyinde INSERT/UPDATE/DELETE/SELECT yetkisi var (Supabase'in varsayilan
-- `grant all on all tables in schema public` davranisi). PostgreSQL'de kolon
-- ayricaligi tablo ayricaligini DARALTMAZ, uzerine EKLENIR -- yani tablo grant'i
-- durdukca kolon grant'i hicbir seyi kapatmaz. Kolon kapisi kagit uzerinde vardi,
-- prod'da YOKTU.
--
-- Tablo grant'ini `revoke` etmek de COZUM DEGIL: admin de ayni `authenticated`
-- rolunde calisiyor (yetkisi p_dsr_admin_all politikasindan geliyor, ayri bir
-- DB rolunden degil). Revoke, PR-1 ile canliya alinan admin defterini kirardi.
--
-- DOGRU YER RLS POLITIKASININ KENDISI: kisit politika bazlidir, yani yalniz
-- veri sahibinin yolunu baglar; admin ayri politikadan gectigi icin etkilenmez.
-- Bu yuzden asagidaki p_dsr_owner_insert `with check` blogu surec alanlarinin
-- her birini DB default'una PIN'ler. Istemci farkli bir deger gonderirse INSERT
-- reddedilir -- yani musteri kendi talebini "sonuclanmis" gosteremez ve 30 gunluk
-- sureyi bir saniye bile oynatamaz.
--
-- TASARIM — IKI KAPI BIRLIKTE:
--   1) SATIR kapisi (RLS using/with check): kullanici yalniz kendi satirini gorur/yazar.
--   2) DEGER kapisi (ayni politikanin with check'i): status/due_at/outcome/
--      completed_at/identity_verified_at/handled_by/retained_data_note DB
--      default'una esit olmak ZORUNDA. Yazma yetkisi admin/service_role'de kalir.
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
    -- KIMLIK: kullanici baskasinin adina talep acamaz (Teblig m.5).
    user_id = (select auth.uid())
    and applicant_email = (select auth.jwt() ->> 'email')
    -- DEGER KAPISI: surec alanlari istemci tarafindan BELIRLENEMEZ. Buradaki her
    -- esitlik, kolonun DB default'unu tekrar eder; istemci farkli bir deger
    -- gonderirse politika satiri REDDEDER. (Kolon-GRANT bunu YAPAMAZ -- asagidaki
    -- 3. bolumdeki uyariya bak.)
    and status = 'received'
    and due_at = received_at + interval '30 days'
    and outcome is null
    and completed_at is null
    and identity_verified_at is null
    and handled_by is null
    and retained_data_note is null
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
-- 3) Kolon grant'i — NIYET BEYANI, kapi DEGIL
-- ---------------------------------------------------------------------
-- UYARI: asagidaki grant tek basina HICBIR SEYI KISITLAMAZ (yukaridaki tehlike
-- notuna bak: tablo-duzeyi grant zaten var ve kolon grant'i onu daraltmaz).
-- Yine de birakiliyor cunku (a) niyeti kod icinde belgeliyor, (b) ileride tablo
-- grant'i daraltilirsa musteri yolu calismaya devam eder. GERCEK KAPI, yukaridaki
-- p_dsr_owner_insert politikasinin with check blogudur.
--
-- UPDATE politikasi VERILMEZ: veri sahibi talebini actiktan sonra degistiremez
-- (RLS'te politika yoksa islem reddedilir; ispat izi korunur). Talebi geri cekmek
-- isterse kanal uzerinden bildirir, admin `rejected` + `outcome` ile kapatir.
grant insert (applicant_email, request_type, user_id)
  on public.data_subject_requests to authenticated;

comment on policy p_dsr_owner_insert on public.data_subject_requests is
  'Veri sahibi kendi talebini acar. Kimlik tevsiki: applicant_email = JWT email (Teblig m.5). '
  'Surec alanlari (status/due_at/outcome/completed_at/identity_verified_at/handled_by/'
  'retained_data_note) with check ile DB default''una PIN''lidir -- kolon-GRANT ile DEGIL, '
  'cunku tablo-duzeyi grant kolon grant''ini gecersiz kilar. UPDATE politikasi yok.';

comment on policy p_dsr_owner_select on public.data_subject_requests is
  'Veri sahibi yalnız kendi talebini görür; süreci ve 30 günlük son tarihi izleyebilir.';
