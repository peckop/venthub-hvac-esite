-- REC-322: public.jwt_role() EMEKLİ + storage.objects üzerindeki üç ölü admin politikası KALDIRILIR
--
-- Recep kararı 2026-09-14 (kendi sözü: "6. Kaldırılsın"; REC-322 kaydında yazılı hâli).
-- Bu dosya MERGE EDİLMEDEN prod'a uygulanmaz; merge = uygulama (CLAUDE.md kural 13).
--
-- ══════════════════════════════════════════════════════════════════════════════
-- NİÇİN — iki ayrı kusur, tek kök: "JWT'nin üst düzey `role` talebi" yanlış okundu
--
-- Supabase'de JWT'nin üst düzey `role` talebi POSTGRES rolüdür (`anon` /
-- `authenticated` / `service_role`), uygulama rolü DEĞİLDİR. Dolayısıyla
-- `... ->> 'role' IN ('admin','moderator')` biçimindeki bir koşul normal bir
-- kullanıcı için HİÇBİR ZAMAN doğru olmaz. Uygulama rolü kararı yalnız
-- `public.is_admin_user()` üzerinden verilir; o fonksiyon `user_role` /
-- `app_metadata.user_role` okur (CLAUDE.md kural 12).
--
-- Cetvel: docs/standards/rls-yetki-karari-standard.md (bu işle birlikte yazıldı).
-- Kapı: INV-AUTH-ROLE-2 (src/__tests__/conformance/rls-yetki-karari.test.ts).
-- ══════════════════════════════════════════════════════════════════════════════

-- Kilit kuyruğunda bekleyip tabloyu kilitlemek yerine HIZLI BAŞARISIZ OL.
-- INV-MIGRATION-3 bu iki satırı arar.
set lock_timeout = '5s';
set statement_timeout = '5s';

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) storage.objects üzerindeki üç ölü admin politikası
--
-- ⚠KAPSAM, ADIYLA: yalnız `storage.objects`. AYNI ÜÇ AD `public.product_images`
-- tablosunda DA var ve ORASI KAPSAM DIŞI — oradaki politikalar çalışıyor
-- (20260119 / 20260120 / 20260224 migration'ları onları düşürüp yeniden
-- oluşturuyor). Bu ayrımı yazmak zorunlu: şema/tablo belirtmeyen bir DROP,
-- çalışan bir yetki politikasını silerdi.
--
-- ⚠BU ÜÇ POLİTİKANIN CANLIDA HÂLÂ VAR OLDUĞU BU DOSYADA DOĞRULANMADI.
-- Deponun kendi geçmişi bunların 2026-05-30'da
-- (20260530224000_tenant_aware_storage_policies.sql satır 9-11) DÜŞÜRÜLDÜĞÜNÜ
-- ve bir daha OLUŞTURULMADIĞINI söylüyor; REC-322'nin 2026-09-13 canlı ölçümü
-- ise hâlâ var olduklarını söylüyor. Çelişki ÇÖZÜLMEDİ (canlı okuma izni bu
-- oturumda verilmedi). `IF EXISTS` kullanıldığı için ifade İKİ HÂLDE DE
-- güvenlidir: varsa düşer, yoksa sessizce geçer. Yani bu dosyanın doğruluğu o
-- çelişkinin çözümüne BAĞLI DEĞİL; bağlı olan şey yalnız "bu iş bir şey
-- değiştirdi mi" sorusunun cevabı.
--
-- İşlev kaybı YOK: görsel yükleme yolunu `product_images_*_tenant` politikaları
-- (rol `authenticated`, tenant klasörü + user_profiles.role kontrolü) taşıyor.
-- Kaldırılan üçü `roles = {public}` yüzeyini de kaldırır — uyuyan kapının
-- tehlikesi buydu: koşul bir gün doğru hâle gelirse `anon` dahil HERKESİ
-- kapsayacak bir yazma/silme yolu açardı.
drop policy if exists product_images_insert_admin on storage.objects;
drop policy if exists product_images_update_admin on storage.objects;
drop policy if exists product_images_delete_admin on storage.objects;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) public.jwt_role() emekli
--
-- ⭐CASCADE BİLEREK KULLANILMADI — ve bu, bu dosyanın en önemli tasarım kararı.
-- Eğer canlıda bu fonksiyona bağlı bir politika KALMIŞSA, `drop function`
-- bağımlılık hatası verir ve migration KIRMIZI yanar. Yani yanlış varsayım
-- sessizce yetki kaybına DEĞİL, gürültülü bir hataya dönüşür.
-- `cascade` yazmak tam tersini yapardı: bağlı politikaları da sessizce silerdi.
--
-- REC-322'nin 2026-09-13 ölçümü canlıda `jwt_role()` çağıran politika sayısını
-- 0 buldu. Bu dosya o ölçüme GÜVENMİYOR, ona DAYANMIYOR: ölçüm yanlışsa kapı
-- kapanır (fail-closed). Depoda 19 migration bu adı anıyor, ama hepsi ya
-- sonradan değiştirilmiş politikalar ya da yalnız yorum metni.
drop function if exists public.jwt_role();

commit;
