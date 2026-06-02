# Görev Takip Listesi - Supabase Güvenlik Sertifikasyonu ve Admin Giriş Düzeltmesi

Bu takip listesi, PRD belgesinden türetilen ve her biri uçtan uca doğrulanabilir dikey görev dilimlerini (tracer bullets) içerir.

---

## Dikey Görev Dilimleri (Tracer Bullet Slices)

- [x] **Slice 1: R1 & R6 - Admin Panel Giriş Sorunu Düzeltmesi (RLS & Auth Hook Entegrasyonu)**
  - [x] `20260602070000_security_hardening.sql`, `20260602080000_security_hardening_fixes.sql` ve `20260602090000_security_hardening_null_fix.sql` içindeki RLS Recursion düzeltmelerini (`user_profiles_select_policy`) ve `custom_access_token_hook` işlevini veritabanına uygula.
  - [x] `src/middleware.ts` dosyasını `user.user_metadata?.role` yerine JWT `decoded.user_role` claim'ini okuyacak şekilde güncelle.
  - [x] E2E admin login testlerinin ve JWT Hook'un çalıştığını doğrula.

- [x] **Slice 2: R2 & R10 - pg_graphql Şema Gizleme ve Anon SELECT Yetki Sıkılaştırması**
  - [x] GraphQL şemasını hassas tablolarda kapatacak `@graphql({"disabled": true})` direktiflerini ve `anon` rolünden SELECT yetkisini kaldıran revocation SQL komutlarını uygula.
  - [x] `pg_graphql` API üzerinden hassas tabloların (siparişler vb.) artık dışarıdan keşfedilemediğini ve yetkisiz anonim SELECT isteklerinin engellendiğini doğrula.

- [x] **Slice 3: R3 & R4 - Storage Policy Sıkılaştırma ve Eski Mükerrer Politikaların Temizliği**
  - [x] `product-images` storage bucket SELECT politikasını, listelemeyi (`list()`) engelleyecek fakat dosya adına göre tekil erişime izin verecek şekilde UUID/Tenant eşleşmeli olarak güncelle.
  - [x] Eski mükerrer RLS politikalarını veritabanından temizle (`coupons`, `price_lists`, `user_profiles` vb.).
  - [x] Farklı tenant'lar arasında dosya listeleme veya erişim sızıntısı olmadığını doğrula.

- [x] **Slice 4: R5, R7, R8, R9 - Fonksiyon Yetkileri, Search Path, Webhook ve Debug Temizliği**
  - [x] 30 SECURITY DEFINER fonksiyonunun `EXECUTE` yetkilerini `PUBLIC` rolden geri al ve sadece gerekli RLS fonksiyonlarına izin ver.
  - [x] `handle_supabase_webhook()` fonksiyonunun search_path'ini pg_catalog/public olarak kilitle.
  - [x] `scripts/webhook_setup.sql` içindeki webhook secret'ı `'REPLACE_WITH_ENV_SECRET'` olarak düzenle ve debug fonksiyonlarını sil.
  - [x] Supabase Security Advisor uyarısı sayısının sıfıra yakınsadığını doğrula.

- [x] **Slice 5: Nihai Entegrasyon & UAT Doğrulaması**
  - [x] `pnpm run type-check` ve `pnpm run lint` komutlarının sıfır hata ile geçtiğini doğrula.
  - [x] `pnpm run build` komutunun başarıyla production build oluşturduğunu doğrula.
  - [x] E2E test suite'ini (`pnpm run test:e2e`) çalıştırıp 109/109 testin başarıyla geçtiğini ve regresyon olmadığını doğrula.
