# Uygulama Planı - Supabase Güvenlik Sertifikasyonu ve Admin Giriş Düzeltmesi

Bu plan, VentHub platformunun veritabanı güvenlik açıklarını kapatmak, pg_graphql sızıntılarını sıfırlamak, depolama (storage) ve fonksiyon yetkilerini sıkılaştırmak ve sonsuz döngü RLS hatasından kaynaklanan admin panel giriş sorununu gidermek amacıyla hazırlanmıştır.

---

## Kullanıcı İncelemesi Gereken Hususlar

> [!IMPORTANT]
> - **Resmi Auth Hook Aktivasyonu:** `custom_access_token_hook` fonksiyonunun veritabanına yüklenmesinden sonra, JWT token claims enjeksiyonunun çalışması için Supabase Dashboard (`Authentication -> Hooks`) üzerinden bu fonksiyonun "Customize Access Token (JWT) Claims" kancasına bağlanması zorunludur.
> - **Anon SELECT Revocation (Sızdırmazlık):** `products` ve `categories` dışındaki tüm hassas tablolardan `anon` SELECT izinleri kaldırılacaktır. Bu durum, frontend tarafında anonim kullanıcıların bu tabloları okumasını engelleyecektir (sipariş, iade, fatura profilleri vb.).
> - **Eski Politikaların Temizlenmesi:** SaaS Faz 1 öncesinden kalan mükerrer permissive RLS politikaları tamamen silinecek, sadece `merged_*` kiracı-bazlı politikalar korunacaktır.

---

## Açık Sorular (Open Questions)

> [!WARNING]
> - Veritabanındaki değişikliklerin uzak Supabase sunucusuna uygulanması için kullanılacak veritabanı bağlantısı (`DATABASE_URL`) ortam değişkenlerinde tanımlı mıdır?
> - `pg_graphql` kısıtlamaları sonrası, müşteri tarafında GraphQL üzerinden sorgulanan başka bir özel tablo (örn: `site_settings`) bulunmakta mıdır? Yoksa varsayılan olarak sadece `products`, `categories`, `price_lists`, `product_prices` ve `tenants` (slug/domain) tablolarının açık kalması yeterli midir?

---

## Önerilen Değişiklikler (Proposed Changes)

### 1. Veritabanı ve Şema Sıkılaştırma (Database Schema & Security)

#### [MODIFY] [20260602070000_security_hardening.sql](file:///c:/Users/alize/venthub-hvac/supabase/migrations/20260602070000_security_hardening.sql)
#### [MODIFY] [20260602080000_security_hardening_fixes.sql](file:///c:/Users/alize/venthub-hvac/supabase/migrations/20260602080000_security_hardening_fixes.sql)
#### [MODIFY] [20260602090000_security_hardening_null_fix.sql](file:///c:/Users/alize/venthub-hvac/supabase/migrations/20260602090000_security_hardening_null_fix.sql)

Bu SQL migration dosyaları veritabanına uygulanarak şu düzenlemeler yapılacaktır:
*   **User Profiles SELECT RLS Fix:** `is_admin_user()` fonksiyonu JWT claimlerinden rol okuyacak şekilde yeniden tanımlanır. `user_profiles` select politikası bu recursion-free fonksiyonu kullanacak şekilde güncellenir.
*   **GraphQL Gizleme:** Hassas tablolara `@graphql({"disabled": true})` direktifleri comment olarak eklenir.
*   **Storage Listing Block:** `product-images` bucket'ı için listelemeyi (`list()`) engelleyen, sadece tekil erişime izin veren UUID/Tenant doğrulama politikası uygulanır.
*   **Function Revocation:** 30 adet `SECURITY DEFINER` fonksiyonun `PUBLIC` execute yetkisi geri alınır. Sadece RLS helper fonksiyonlarına gerekli izinler verilir.
*   **Triggers & Self-Elevation Guard:** `handle_new_user_metadata` ve `handle_new_user_profile` trigger fonksiyonlarında `COALESCE(auth.role(), '') = 'service_role'` null-safe kontrolü kullanılarak rol yükseltme (self-elevation) engellenir.
*   **Anon SELECT Revocation:** 36 hassas tablo ve view'dan `anon` SELECT yetkisi kaldırılır.

---

### 2. Uygulama ve Middleware Entegrasyonu (Application Middleware)

#### [MODIFY] [middleware.ts](file:///c:/Users/alize/venthub-hvac/src/middleware.ts)
*   Admin yetkilendirmesi yapan kontrol `user.user_metadata?.role` yerine, resmi Auth Hook tarafından JWT token claims içerisine enjekte edilen `user_role` değerini decode edip doğrulayacaktır:
    ```typescript
    const decoded = decodeJwt(session.access_token);
    const jwtRole = decoded?.user_role;
    ```

---

## Doğrulama Planı (Verification Plan)

### Otomatik Testler
*   Veritabanı üzerinde security advisor denetimi yapmak:
    ```bash
    supabase db advisors --db-url "$DATABASE_URL"
    ```
    Kritik güvenlik uyarılarının sıfıra yakınsadığı doğrulanmalıdır.
*   TypeScript ve Linter denetimi:
    ```bash
    pnpm run type-check
    pnpm run lint
    ```
*   Tüm E2E entegrasyon testlerinin regresyonsuz geçmesi:
    ```bash
    pnpm run test:e2e
    ```

### Manuel Doğrulama
*   Bir admin kullanıcısı ile `/admin` paneline başarıyla giriş yapılabildiği, RLS recursion döngüsünün kırıldığı doğrulanacaktır.
*   GraphQL API istemcisi üzerinden hassas tabloların şema listesinde görünmediği doğrulanacaktır.
*   Uzak veritabanına uygulanan local migration geçmişi listelenecektir:
    ```bash
    supabase migration list --local
    ```
