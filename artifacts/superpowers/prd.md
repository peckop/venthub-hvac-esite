# Ürün Gereksinim Belgesi (PRD) - Supabase Güvenlik Sertifikasyonu ve Admin Giriş Düzeltmesi

Bu belge, VentHub HVAC SaaS platformunun veritabanı katmanında tespit edilen güvenlik uyarılarını (Advisor Warnings) gidermek, admin paneli giriş sorunlarını çözmek ve genel sistem sızdırmazlığını sağlamak amacıyla tasarlanan iyileştirmelerin ürün gereksinimlerini tanımlar.

---

## 1. Problem Tanımı (Problem Statement)
SaaS Faz 1 (Çoklu Kiracı Altyapısı) geçişi sonrası sistemde iki kritik problem ortaya çıkmıştır:
1. **Admin Panel Giriş Sorunu:** `user_profiles` tablosundaki SELECT politikasının `is_admin_user()` fonksiyonunu çağırması ve bu fonksiyonun da `user_profiles` tablosuna sorgu atması nedeniyle **sonsuz döngü (RLS Recursion Loop)** oluşmakta ve admin kullanıcılar panele giriş yapamamaktadır. Ayrıca frontend tarafının `user.user_metadata?.role` gibi güvenli olmayan istemci verilerine güvenmesi güvenlik açığı oluşturmaktadır.
2. **Supabase Güvenlik Açıkları (Security Advisor Warnings):** Veritabanı denetim motoru (Supabase Security Advisor), veritabanında ~145 güvenlik uyarısı vermektedir. Bu uyarılar şunları kapsar:
   - `pg_graphql` eklentisinin aktif olması nedeniyle, SELECT yetkisi verilmiş tüm hassas tabloların (siparişler, iadeler, profiller vb.) dış dünyaya GraphQL API üzerinden keşfedilebilir olması.
   - `product-images` storage bucket'ının genel RLS politikasının, istemcilerin tüm görselleri listelemesine (`list()`) izin vermesi.
   - Eski tek kiracılı dönemden kalan mükerrer RLS politikalarının veri sızıntısı riski ve performans kaybı yaratması.
   - Webhook tetikleyici fonksiyonunun `search_path` kilidinin olmaması (hijacking riski).
   - 30 adet hassas `SECURITY DEFINER` veritabanı fonksiyonunun anonim ve yetkilendirilmiş tüm kullanıcılar tarafından doğrudan tetiklenebilmesi.
   - Webhook kurulum betiklerinde (`webhook_setup.sql`) gizli anahtarların (secret) düz metin (hardcoded) olarak yer alması.
   - Eski debug fonksiyonlarının ve hassas tablolarda gereksiz `anon` yetkilerinin bulunması.

---

## 2. Önerilen Çözüm (Solution)
Veritabanı düzeyinde geriye dönük uyumlu, sızdırmazlığı kanıtlanmış ve tüm E2E testleri (89/89) başarıyla geçen bir **Güvenlik Sertifikasyon ve Düzeltme Paketi** uygulanacaktır.
*   **RLS Recursion Düzeltmesi:** `user_profiles` SELECT politikasındaki `is_admin_user()` çağrısı kaldırılacak ve inline JWT claim kontrolü uygulanarak sonsuz döngü kırılacaktır.
*   **Resmi Auth Hook Entegrasyonu:** Supabase resmi RBAC standartlarına uygun `custom_access_token_hook` kurulacak; kullanıcının veritabanındaki güncel rol ve kiracı bilgisi doğrudan JWT token (`app_metadata.user_role` ve `app_metadata.tenant_id`) claims içine enjekte edilecektir.
*   **GraphQL ve Storage Sıkılaştırma:** GraphQL şemasından hassas tablolar `@graphql({"disabled": true})` yorumlarıyla tamamen gizlenecek. `product-images` bucket RLS politikaları listelemeyi engelleyecek, sadece dosya yoluyla tekil erişime izin verecektir.
*   **Yetki Temizliği & Revocation:** Eski mükerrer politikalar silinecek. 30 SECURITY DEFINER fonksiyonunun `EXECUTE` yetkisi `PUBLIC` rolden geri çekilecek, sadece RLS ve Auth Hook için gerekli olanlara kısıtlı yetki verilecektir. Hassas tabloların `anon` SELECT izinleri kaldırılacaktır.
*   **Gizli Anahtar ve Debug Temizliği:** Hardcoded webhook secret parametrik hale getirilecek. Debug fonksiyonları silinecektir.

---

## 3. Kullanıcı Hikayeleri (User Stories)
1.  **US1 - Güvenli Admin Girişi:** Bir Admin/Superadmin olarak, admin paneline giriş yapmak istediğimde sonsuz RLS döngülerine takılmadan saniyeler içinde yetkimin JWT üzerinden doğrulanmasını ve panele güvenli bir şekilde erişebilmeyi istiyorum.
2.  **US2 - Rol Güvenliği:** Bir Sistem Sahibi olarak, kullanıcıların istemci tarafında kendi rollerini (`user_metadata.role`) değiştirerek admin yetkilerine yükselmesini engellemek ve tüm rol/kiracı doğrulamalarının JWT token içindeki resmi claims üzerinden yapılmasını istiyorum.
3.  **US3 - GraphQL Veri Gizliliği:** Bir Sistem Sahibi olarak, iade talepleri, sipariş detayları ve audit loglar gibi hassas verilerimizin pg_graphql API'si üzerinden yetkisiz kişilerce keşfedilmesini veya listelenmesini engellemek istiyorum.
4.  **US4 - Dosya Listeleme Koruması:** Bir Sistem Sahibi olarak, `product-images` bucket'ındaki ürün görsellerimizin toplu bir şekilde dışarıdan listelenmesini (listing attack) engellemek, ancak ürün detay sayfalarında tekil olarak URL üzerinden erişilebilir kalmasını istiyorum.
5.  **US5 - Otonom Güvenlik Sertifikasyonu:** Bir Sistem Sahibi olarak, tüm güvenlik sıkılaştırmaları uygulandıktan sonra veritabanı analiz motorunun (Supabase Security Advisor) 0 kritik uyarı vermesini ve projenin E2E test suite'inin (89/89) tamamen yeşil kalmasını istiyorum.

---

## 4. Teknik Entegrasyon ve Mimari Detaylar (Technical Specs)

### A. Middleware ve İstemci Güncellemesi
- **Giriş Guard:** `src/middleware.ts` içindeki admin yetki kontrolü `user.user_metadata?.role` yerine JWT decode edilmiş `decoded.user_role` claim'inden yapılacaktır.

### B. Veritabanı ve Şema Sıkılaştırması
- **User Profiles SELECT Politikası:**
  ```sql
  CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT TO authenticated
    USING ( tenant_id = public.jwt_tenant_id() AND (id = auth.uid() OR public.is_admin_user()) );
  ```
- **Custom Access Token Hook (`public.custom_access_token_hook`):**
  - JWT token claim'lerini `user_profiles` tablosundaki gerçek değerlerle senkronize eder.
  - Sadece `supabase_auth_admin` rolüne EXECUTE izni verilecektir.
- **GraphQL Gizleme:**
  - Tablolara `@graphql({"disabled": true})` direktifleri eklenecektir.
- **Storage SELECT Politikası:**
  - `storage.objects` tablosunda `product-images` için listelemeyi kapatan UUID/Tenant eşleşmeli koruma:
  ```sql
  CREATE POLICY product_images_select_tenant ON storage.objects FOR SELECT TO authenticated
    USING ( bucket_id = 'product-images' AND name ~ '^[0-9a-f]{8}-.../' AND split_part(name, '/', 1)::uuid = public.jwt_tenant_id() );
  ```
- **Fonksiyon Yetkileri (Revoke):**
  - 30 SECURITY DEFINER fonksiyonun `EXECUTE` yetkisi `PUBLIC`, `anon` ve `authenticated` rollerinden geri alınacaktır (`REVOKE`).
  - Sadece RLS'de kullanılan helper fonksiyonlara (`is_admin_user()`, `jwt_tenant_id()`, `is_user_admin()`, `is_admin()`, `is_staff_user()`) `authenticated` ve `anon` için `GRANT` verilecektir.

---

## 5. Doğrulama Seam'leri (Testing Seams)
1.  **Güvenlik Danışmanı (Advisor) Testi:** `supabase db advisors` veya `get_advisors({type: 'security'})` çalıştırılarak uyarı sayısının sıfıra yakınsadığı kanıtlanmalıdır.
2.  **E2E Test Suite:** `pnpm run test:e2e` ile 89/89 testin başarıyla geçtiği doğrulanacaktır.
3.  **Admin Login Testi:** Admin credentials ile giriş yapılabildiği, RLS loop'unun kırıldığı UAT testleriyle doğrulanacaktır.
4.  **GraphQL Engelleme Testi:** pg_graphql üzerinden hassas şemaların çağrılamadığı test edilecektir.
