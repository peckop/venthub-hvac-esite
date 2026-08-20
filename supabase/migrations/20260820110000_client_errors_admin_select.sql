-- T136-VH · client_errors GÖRÜNMEZLİK ONARIMI
-- 2026-08-20 · EDGE şeridi
--
-- KAYNAK / CETVEL
-- ---------------
-- Kaynak: AUTH'un 2026-08-20 10:23:55Z pano ölçümü (kontrol kollu, canlı prod, salt-okuma):
--         client_errors gerçek=39, admin görür=0. EDGE bağımsız doğruladı (aşağıdaki ölçüm).
-- Cetvel: docs/standards/edge-function-security-standard.md §3.9 ailesi (RLS zemini) —
--         ayrıca kardeş desen `error_groups` üzerinde ZATEN CANLI ve bu migration onu taklit eder.
--
-- SORUN — TEK BİR MIGRATION İÇİNDE, İKİ TABLODAN BİRİ UNUTULMUŞ
-- --------------------------------------------------------------
-- `20260225_admin_system_fix_final.sql`, aynı dosya:
--   satır 34: GRANT SELECT ON public.error_groups  TO authenticated, service_role;
--   satır 35: GRANT SELECT ON public.client_errors TO authenticated, service_role;   <- GRANT VAR
--   satır 46: CREATE POLICY admins_read_error_groups      ... USING (is_admin_user())
--   satır 52: CREATE POLICY admins_read_returns_webhooks  ... USING (is_admin_user())
--   satır 56: CREATE POLICY admins_read_shipping_webhooks ... USING (is_admin_user())
--   client_errors -> authenticated icin POLITIKA YAZILMAMIS.
--
-- ⚠ DIKKAT (LEGAL duzeltmesi, 2026-08-20 11:22): "client_errors'ta politika yok" demek
-- YANLIS olur ve bu ayrim kapinin sorusunu degistirir. Canli semada IKI politika VAR:
--   merged_client_errors_service_role_select (SELECT, roller: {service_role})
--   service_role_only                        (ALL,    roller: {service_role})
-- Ikisi de YALNIZ service_role icindir. Eksik olan sey "politika" degil, OKUYAN ROLE
-- yazilmis politika: `authenticated` icin SELECT'e izin veren TEK BIR politika yok.
-- Dogru sinif adi: "politika unutulmus" DEGIL, "politika OKUYAN ROLE yazilmamis".
--
-- RLS açıkken GRANT tek başına SIFIR satır demektir: kolon kapısı açık, satır kapısı yok.
-- Kontrol kolu belgenin KENDİ İÇİNDE duruyor — kardeş tablo çalışıyor, bu çalışmıyor.
--
-- ÖNCESİ (tam zincir, tekrarı önlemek için yazılıyor):
--   2025-09-08 `client_errors_admin_fallback.sql` -> admin SELECT politikası VARDI.
--   Bir konsolidasyon onu `merged_client_errors_authenticated_select` adına birleştirdi.
--   2026-06-02 `resolve_performance_and_duplicate_rls.sql:104` -> o adı "gereksiz merged
--   politikaları temizle" toplu bloğunda DROP etti. Diğer tablolarda o blok FAZLALIĞI
--   alıyordu; client_errors'ta ise TEK authenticated politikaydı ve sıfıra düştü.
--   Yeniden yaratma bölümünde client_errors hiç geçmiyor.
--   SINIF: "toplu temizlik, kalabalık tabloda fazlalığı alır, yalnız tabloda kapıyı kaldırır."
--
-- NİÇİN KİMSE FARK ETMEDİ
-- ------------------------
-- Yazan uç sağlıklı: `supabase/functions/log-client-error` service_role ile yazıyor, RLS onu
-- ilgilendirmiyor. Boru ÇALIŞIYOR — 39 satır tam da bu yüzden birikti. Bozuk olan yalnız
-- PENCERE: `/admin/errors` her panel rolü için boş döner ve AdminEmptyState basar, yani
-- "hata yok" gibi okunur. Gözlemlenebilirlik yüzeyinin kendi kendini kör etmesi.
--
-- NİÇİN POLİTİKA, NİÇİN YENİ BİR service_role UCU DEĞİL
-- ------------------------------------------------------
-- Gerekçe vekil değil KANIT: kardeş tablo `error_groups` zaten bu desenle çalışıyor
-- (admin canlıda 11 satır görüyor). Aynı deseni vermek yeni bir zemin AÇMAZ, asimetriyi
-- KAPATIR. Yeni bir service_role ucu ise: yeni yüzey, yeni yetki kontrolü, R9/R10 kapsamına
-- girme sorusu ve RLS zeminini düzeltmeden üstünü örten kalıcı bir baypas olurdu.
--
-- ⚠ MODERATÖR BİLEREK DIŞARIDA
-- ----------------------------
-- `is_admin_user()` gövdesi (canlı `pg_proc`'tan okundu) yalnız 'admin' / 'super_admin'
-- kabul eder; `user_metadata` dalı BİLEREK yoktur (INV-AUTH-ROLE R1). Bu migration o kararı
-- DEĞİŞTİRMEZ — kardeş tabloyla birebir aynı davranır. Sonuç: moderatör bu sayfada yine 0
-- satır görür. Bu SESSİZ kalmamalı; arayüzün "yetkin yok" demesi gerekir ve o iş AUTH'un
-- rbac.ts daraltmasındadır (T136 kapsamı DEĞİL). İki işin SIRASI önemli: aksi hâlde bir
-- sessiz-boşu bir başkasıyla değiştirmiş oluruz.
--
-- KAPSAM DIŞI BIRAKILAN (ölçüldü, adıyla yazılıyor — sessizce geçilmiyor)
-- -----------------------------------------------------------------------
-- `client_errors` üzerinde `authenticated` VE `anon` rollerinin
-- DELETE/INSERT/TRUNCATE/UPDATE/REFERENCES/TRIGGER yetkileri VAR. Ölçüm aynı yetkilerin
-- `error_groups`, `returns_webhook_events`, `shipping_webhook_events` üzerinde de durduğunu
-- gösterdi — yani tekil bir hata değil, tabloları tutan tek şeyin RLS olduğu SİSTEMİK bir
-- zemin (Supabase'in public şema varsayılan grant'ları). Bu migration onu DEĞİŞTİRMEZ:
--   (a) eklenen politika SELECT-only'dir, hiçbir yazma yolunu genişletmez;
--   (b) grant hijyeni LEGAL'in `db-grant-hygiene-standard` alanıdır ve dört tabloyu birden
--       kapsayan ayrı bir iş olmalıdır (bkz. #672 deseni: REVOKE ile kapat).
-- Panoya LEGAL'e adresli olarak bildirildi.

-- ============================================================================
-- 1) Admin SELECT politikası — kardeş tablo `error_groups` ile BİREBİR aynı desen
-- ============================================================================
drop policy if exists "admins_read_client_errors" on public.client_errors;

create policy "admins_read_client_errors"
  on public.client_errors
  for select
  to authenticated
  using (public.is_admin_user());

comment on policy "admins_read_client_errors" on public.client_errors is
  'T136-VH (2026-08-20): 20260225_admin_system_fix_final.sql error_groups icin politika yazdi, '
  'client_errors icin YALNIZ grant verdi. RLS acikken grant tek basina 0 satir demektir; '
  '39 gercek hata admin dahil kimseye gorunmuyordu. Kardes tablo deseni birebir kopyalandi. '
  'Moderator BILEREK disaridadir (is_admin_user yalniz admin/super_admin).';

-- ============================================================================
-- 2) Öz-denetim — migration KENDİ İDDİASINI ÖLÇER
-- ============================================================================
-- Niçin: bu dosya "artık admin görecek" diye bir SÖZ veriyor. Sözün arkasında mekanizma
-- olduğunu migration'ın kendisi kanıtlamalı; yoksa uygulanır, yeşil görünür ve kimse
-- politikanın gerçekten doğduğunu ölçmez.
do $$
declare
  politika_sayisi int;
begin
  select count(*) into politika_sayisi
  from pg_policies
  where schemaname = 'public'
    and tablename  = 'client_errors'
    and policyname = 'admins_read_client_errors'
    and cmd        = 'SELECT'
    and 'authenticated' = any (roles);

  if politika_sayisi <> 1 then
    raise exception
      'T136-VH: admins_read_client_errors politikasi dogmadi (bulunan: %). Migration yalan soyluyor.',
      politika_sayisi;
  end if;
end $$;
