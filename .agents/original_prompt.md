## 2026-05-30T21:59:03Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

# Teamwork Project Prompt — VentHub SaaS Foundation (Faz 1)


VentHub, mevcut tek kiracılı (single-tenant) HVAC e-ticaret platformunu çoklu kiracılı (multi-tenant) SaaS altyapısına dönüştürme projesidir. Bu faz (Faz 1 — Foundation), mevcut uygulamayı bozmadan multi-tenancy temelini atar. Mevcut VentHub "default tenant" olarak çalışmaya devam edecek, yeni tenant'lar eklenebilir hale gelecektir.


## 🏛️ Resolved Enterprise Design Decisions (NotebookLM Approved)

Based on the VentHub project memory and master roadmap, the teamwork agent team must adhere to the following strict architectural decisions:

1. **Middleware Tenant Resolution (R3):** **Option B (Vercel Edge Config / Redis / Edge-safe lookup)**
   - Directly querying the database using a Supabase client inside `src/middleware.ts` is **STRICTLY PROHIBITED (`YASAK`)** due to Edge Runtime constraints and database fatigue.
   - You must implement a dynamic, Edge-safe tenant resolver (`src/lib/tenantResolver.ts`) that is pre-wired to support reading from Vercel Edge Config or Redis to support dynamic tenant onboarding in Phase 3 without code deployments. In development, a static map fallback is allowed.

2. **Database Migration Approach (R1):** **Option A (Supabase CLI Migrations)**
   - All schema, table, and RLS alterations must be created as sürüm-kontrollü, idempotent migrations under `supabase/migrations/` using the format `YYYYMMDD_kisa_aciklama.sql`.
   - The **Golden Triad (Altın Üçlü)** rule (`GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY` in that exact order) must be applied to every new table created. Foreign keys must be indexed.

3. **Behavioral Integrity Constraints:**
   - The project runs in `Integrity mode: development` to allow full execution and local validations.
   - However, modifying the core HVAC engine (`hvacCalculations.ts`), using pre-built frameworks like Flask that are outside the stack, or violating `no-arbitrary-value` Tailwind rules is **STRICTLY PROHIBITED**.
   - You must inspect and read existing code and test suites before writing modifications ("zihinsel tarama yasaktır" rule). You must execute verification scripts (`pnpm run lint`, `npx tsc`, `pnpm run build`) at every step to verify correctness.

Working directory: c:\Users\alize\venthub-hvac
Branch: feature/saas-core (main'den oluşturulacak)
Integrity mode: development

## Context — Mevcut Altyapı

Bu bilgiler projenin NotebookLM dijital ikizinden doğrulanmıştır:

- **Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 4, TypeScript 5, Supabase (PostgreSQL + Auth + Edge Functions), Vercel
- **Veritabanı:** 26 tablo, 108 RLS politikası, 52 RPC fonksiyonu
- **Auth:** Supabase Auth, JWT-based, 7 RBAC rolü (super_admin → user)
- **Routing:** `src/app/[lang]/` sub-path i18n routing, middleware ile locale detection + admin guard
- **Design System:** HSL CSS Custom Properties, `tokens.js` SSOT, `no-arbitrary-value` Tailwind kuralı
- **Ödeme:** İyzico 3D Secure, Strategy Pattern ile soyutlanmış
- **i18n:** JSONB-based çeviriler (ilişkisel çeviri tablosu YASAK — Aksiyom 5), 2 dil (TR/EN)
- **HVAC Motoru:** `hvacCalculations.ts` — tenant-agnostik, DOKUNULMAYACAK (Kural 6)

## Requirements

### R1. Tenants Table & Database Migration

Supabase veritabanında multi-tenancy temeli oluştur:

1. `tenants` tablosu oluştur. Her tenant'ın bir slug'ı, opsiyonel custom domain'i, tema konfigürasyonu (CSS token override'ları için JSONB), feature flags (JSONB), ve genel config (JSONB — varsayılan dil, para birimi, ödeme geçidi ayarları, email_from, brand_name, brand_logo_url) olmalı.
2. `tenants` tablosu oluşturulurken **Golden Triad** (GRANT → ENABLE RLS → POLICY) katı bir şekilde uygulanmalıdır.
3. Mevcut 26 tablonun tenant-aware olanlerine `tenant_id UUID REFERENCES tenants(id)` kolonu ekle. Tenant-agnostik tablolar (örn: saf lookup/enum tabloları) varsa onlara ekleme. **Özellikle `admin_audit_log` tablosuna `tenant_id` ekle** — super_admin hangi tenant'ta hangi işlemin yapıldığını izleyebilmeli.
4. `jwt_tenant_id()` adında bir RPC/helper fonksiyon oluştur — JWT'deki `tenant_id` claim'ini döndürsün. **ÖNEMLİ:** Bu fonksiyon R2'deki JWT claim entegrasyonuyla birlikte çalışır — RLS güncellemeleri (madde 5) bu fonksiyonun hazır olmasına bağlıdır.
5. Mevcut 108 RLS politikasını güncelle — tenant izolasyonu ekle. Her politikaya `tenant_id = jwt_tenant_id()` koşulu eklenmeli. Public READ politikaları (products, categories gibi) tenant-scoped olmalı.
6. Bir "default" tenant kaydı oluştur — mevcut VentHub bu tenant'a atansın.
7. Migration atomik olmalı — ya hepsi başarılı ya hiçbiri.

### R2. JWT Tenant Claim & Auth Integration

Supabase Auth JWT token'ına tenant bilgisi ekle:

1. Kullanıcı login olduğunda JWT `app_metadata`'sına `tenant_id` claim'i eklenmeli.
2. `user_profiles` tablosuna `tenant_id` FK ekle — kullanıcı hangi tenant'a ait.
3. Yeni kullanıcı kaydı (signup) sırasında tenant_id otomatik atansın.
4. Mevcut auth akışı (login, logout, session refresh) kırılmamalı.

### R3. Middleware Tenant Resolution

`src/middleware.ts`'i genişleterek gelen isteğin hangi tenant'a ait olduğunu tespit et:

1. Subdomain parse: `acme.venthub.com` → tenant slug = "acme"
2. Custom domain lookup: `www.avensair.com` → tenants tablosundan eşleştir
3. Subdomain veya custom domain bulunamazsa → default tenant'a düş
4. Tenant bilgisini request header veya cookie ile downstream'e ilet
5. **KRİTİK:** Middleware Edge Runtime'da çalışır — burada Supabase client ile doğrudan DB sorgusu ATMA. Tenant resolution için statik map, Vercel Edge Config, veya request-time header kullan.
6. Mevcut `detectLocale` ve admin guard mantığı korunmalı, kırılmamalı.

### R4. Cache Key Isolation

Mevcut caching mekanizmalarını tenant-aware yap:

1. `unstable_cache` veya `next/cache` kullanan tüm yerlerde cache key'e `tenantId` dahil et: `['key', lang, tenantId]`
2. `revalidateTag` çağrılarını tenant-scoped yap: `revalidateTag(\`products-${tenantId}\`)`
3. ISR/On-Demand revalidation webhook'ları tenant-aware olmalı.
4. **KRİTİK:** Cache izolasyonu olmadan Data Bleeding riski var — Tenant A verileri Tenant B'ye görünür. Bu bir güvenlik felaketidir.

### R5. Feature Flags System (Hibrit Yapı)

Tenant bazlı özellik açma/kapama mekanizması oluştur:

1. **Server-side:** `getTenantConfig()` async helper fonksiyonu oluştur — Middleware'in enjekte ettiği `x-tenant-id` header'ından tenant bilgisini okuyarak Server Component'larda kullanılabilir hale getir. Hook'lar RSC'de çalışmaz, bu yüzden Server Component'lar için saf fonksiyon gerekli.
2. **Client-side:** `useTenant()` hook'u oluştur — Client Component'larda tenant config, theme ve features bilgisini döndürsün.
3. `tenants.features` JSONB alanından okunan feature flags ile bileşenler koşullu render edilsin.
4. Örnek feature flag'ler: `3d_orbit`, `hvac_calculator`, `whatsapp_float`, `engineering_pdf`, `multi_language`, `needs_wizard`
5. Default tenant'ta tüm feature'lar açık olmalı.
6. **KRİTİK (Next.js 15 RSC Uyumu):** Hook'lar (`useContext`, `useTenant`) Server Component'larda kullanılamaz. Feature flag okuma mutlaka `getTenantConfig()` (server) + `useTenant()` (client) hibrit yapısında olmalı.

### R6. Tenant-Aware Data Fetching

Veri çekme katmanını tenant-scoped yap:

1. Supabase client oluşturulurken veya sorgu atılırken tenant context'i dahil et.
2. Mevcut data fetching fonksiyonları (ürün listeleme, kategori çekme, sipariş sorgulama vb.) tenant-filtered çalışmalı.
3. RLS zaten izolasyonu sağlayacak, ama uygulama katmanında juga tenant_id kontrolü olmalı (defense in depth).

### R7. Edge Functions Tenant Context (NLM Denetim Bulgusu — KRİTİK)

DB'ye INSERT/UPDATE yapan 26 Edge Function'a tenant context ekle:

1. `tenant_id NOT NULL` constraint'i eklendiğinde, Edge Functions güncellenmezse `NOT NULL constraint violation` ile çökecektir. Bu nedenle "Edge Functions'a dokunma" kuralı iptal edilmiştir.
2. DB INSERT/UPDATE işlemi yapan tüm Edge Functions'a (iyzico-callback, admin-create-coupon, returns-webhook, shipping-webhook, order-confirmation, admin-update-shipping vb.) `tenant_id` context'i eklenmeli.
3. Tenant context, JWT authHeader'dan veya webhook URL query parametresinden (`?tenant_id=xxx`) okunmalı.
4. `service_role` kullanan Edge Function'larda JWT bypass edildiği için, tenant_id açıkça payload'dan veya URL'den alınmalı.
5. **Alternatif:** Migration'da `tenant_id` kolonuna `DEFAULT '<default_tenant_uuid>'` eklenebilir — bu durumda Edge Functions Faz 2'ye bırakılabilir ama bu geçici bir çözümdür.

### R8. Realtime Channel Isolation (NLM Denetim Bulgusu — KRİTİK)

Supabase Realtime kanallarını tenant-scoped yap:

1. `AdminRealtimeNotifications.tsx` içindeki kanal isimleri (`admin-orders-realtime`, `admin-stock-realtime`) tenant-scoped olmalı: `admin-orders-realtime-${tenantId}`
2. Realtime izolasyonu olmazsa, Tenant A'nın admin'i Tenant B'nin canlı sipariş ve stok bildirimlerini görecektir — bu kabul edilemez bir data bleeding'dir.
3. WebSocket kanalları oluşturulurken tenant_id enjekte edilmeli.

### R9. Webhook Collision Guard (NLM Denetim Bulgusu — KRİTİK)

Kargo ve ödeme webhook'larında tenant çakışmasını önle:

1. `shipping-webhook` handler'ı siparişi `order_number` ile bulur. Farklı tenant'lar aynı `order_number`'a sahip olabilir → yanlış tenant'ın siparişi güncellenir.
2. Webhook endpoint URL'leri tenant-specific olmalı: `/api/webhook/shipping?tenant_id=abc`
3. Veya sipariş arama sorgusuna `eq('tenant_id', ...)` eklenmeli.
4. `iyzico-callback` handler'ı da aynı şekilde tenant-aware yapılmalı.

### R10. Storage Bucket İzolasyonu (NLM Denetim Bulgusu — KRİTİK)

Supabase Storage politikalarına tenant izolasyonu ekle:

1. `product_images` ve diğer tenant-specific bucket'lardaki Storage politikalarına `tenant_id` kontrolü ekle.
2. Mevcut `product_images_select_all` (USING true) politikası tenant-scoped olmalı — Tenant B, Tenant A'ın ürün fotoğraflarını silememeli veya kendi ürünlerine bağlayamamalı.
3. Storage bucket yapısını tenant-aware hale getir (bucket per tenant veya path-based izolasyon).

### R11. Edge Function Email Hijyeni (NLM Denetim Bulgusu — KRİTİK)

Email gönderen Edge Function'lar tenant bazlı branding kullanmalı:

1. `order-confirmation`, `delivery-notification` ve diğer email gönderen Edge Function'lar, `brandName`, `EMAIL_FROM` ve `brandLogoUrl` değerlerini global `.env`'den değil, R7'de iletilen `tenant_id` üzerinden `tenants.config` JSONB objesinden çekmeli.
2. Faz 1'de yeni bir tenant sipariş aldığında, e-posta default VentHub markasıyla değil, tenant'ın kendi markasıyla gitmeli.
3. Fallback: Tenant config'de email ayarları yoksa default VentHub değerlerine düşülmeli.

---

## Verification Checklist

> Faz 1 tamamlandığında aşağıdaki tüm maddeler kontrol edilmelidir:

### Database
- [ ] `tenants` tablosu Golden Triad (GRANT → ENABLE RLS → POLICY) ile oluşturulmuş
- [ ] Default tenant kaydı mevcut
- [ ] Tüm tenant-aware tablolarda `tenant_id` kolonu var ve NOT NULL
- [ ] `admin_audit_log` tablosunda `tenant_id` mevcut
- [ ] 108 RLS politikası `jwt_tenant_id()` ile güncellenmiş)
- [ ] `jwt_tenant_id()` fonksiyonu çalışıyor ve JWT'den tenant_id döndürüyor
- [ ] Tüm güncellenmiş RLS politikaları tenant izolasyonu sağlıyor

### Auth
- [ ] Login sonrası JWT token'ında `tenant_id` claim'i mevcut
- [ ] Mevcut auth akışı (login/logout/refresh) kırılmamış — default tenant ile çalışıyor

### Middleware
- [ ] Subdomain'li istek doğru tenant'a çözümleniyor
- [ ] Custom domain'li istek doğru tenant'a çözümleniyor
- [ ] Subdomain/domain bulunamazsa default tenant'a düşüyor
- [ ] Mevcut locale detection ve admin guard çalışmaya devam ediyor
- [ ] Middleware'de doğrudan DB sorgusu yok

### Cache
- [ ] Cache key'lerde tenantId mevcut
- [ ] Farklı tenant'ların cache'leri birbirinden izole

### Feature Flags
- [ ] `getTenantConfig()` server helper Server Component'larda çalışıyor
- [ ] `useTenant()` hook'u Client Component'larda tenant bilgisini döndürüyor
- [ ] Feature flag'e göre bileşen koşullu render ediliyor (örn: 3d_orbit=false → 3D bileşen görünmüyor)
- [ ] Default tenant'ta tüm feature'lar açık

### Edge Functions & Realtime
- [ ] DB INSERT/UPDATE yapan Edge Functions tenant_id context'i alıyor
- [ ] Realtime kanalları tenant-scoped (`admin-orders-realtime-${tenantId}`)
- [ ] Farklı tenant admin'leri birbirlerinin gerçek zamanlı bildirimlerini göremiyor

### Webhook Isolation
- [ ] Kargo webhook'u tenant-aware sipariş araması yapıyor
- [ ] İyzico callback'i tenant context'i ile çalışıyor
- [ ] Aynı order_number farklı tenant'larda çakışma yaratmıyor

### Integration
- [ ] `pnpm run type-check` → 0 hata
- [ ] `pnpm run lint` → 0 hata
- [ ] `pnpm run build` → başarılı production build
- [ ] Mevcut VentHub (default tenant) aynen çalışıyor — hiçbir mevcut işlevsellik kırılmamış

### Storage Isolation
- [ ] Test tenant'ı, default tenant'ın storage bucket'ındaki dosyaları okuyamamalı/modifiye edememeli
- [ ] Ürün görselleri tenant-scoped erişim politikalarıyla korunuyor

### Email Branding
- [ ] Test tenant siparişinde gönderilen email, test tenant'ın brandName/logo bilgisini taşıyor
- [ ] Default tenant siparişinde email hâlâ VentHub markasıyla gidiyor

### Data Isolation Verification
- [ ] İkinci bir test tenant oluşturulduğunda, bu tenant'ın verileri default tenant'tan izole
- [ ] Default tenant'ın ürünleri test tenant'ta görünmüyor
- [ ] Test tenant'ın siparişleri default tenant admin'inde görünmüyor
- [ ] Middleware tenant resolution 50ms altında çalışıyor (Edge Runtime performans testi)
- [ ] Client tarafından sahte `raw_user_meta_data` ile tenant atlaması (tenant-hopping) yapılamıyor

## Constraints

- `hvacCalculations.ts` dosyasına DOKUNMA — fizik motoru tenant-agnostik kalmalı
- JSONB çeviri yapısını koru — ilişkisel çeviri tablosu oluşturma (Aksiyom 5)
- `no-arbitrary-value` Tailwind kuralını ihlal etme
- Mevcut 7 RBAC rolünü kırma — genişlet ama var olanı bozma
- ~~Edge Functions'a bu fazda dokunma~~ → **İPTAL EDİLDİ (NLM denetim bulgusu):** DB INSERT/UPDATE yapan Edge Functions tenant context'i olmadan `NOT NULL constraint violation` ile çökecektir
- Middleware'de URL rewrite YAPMA — tenant çözümünü `x-tenant-id` header ile ilet, URL yapısını bozma (detectLocale offset koruması)
- `SECURITY DEFINER` RPC fonksiyonlarına `tenant_id` filtresi ekle — cross-tenant veri sızıntısını önle

## 2026-06-02T06:47:06Z

# Teamwork Project Prompt — VentHub Supabase Security Hardening & Admin Login Fix

> **Proje:** VentHub HVAC E-Commerce Platform  
> **Çalışma Dizini:** `c:\Users\alize\venthub-hvac`  
> **Supabase Ref:** `tnofewwkwlyjsqgwjjga`  
> **Postgres Sürümü:** 17.6.1.003  
> **Bağlam:** SaaS Faz 1 (multi-tenant foundation) başarıyla uygulandı ve 89/89 E2E test geçti. Ancak migration sonrası admin panele giriş yapılamıyor ve Supabase Security Advisor'da ~145 uyarı bulunuyor. Bu proje, bu uyarıları sıfırlayıp admin erişimini yeniden kazandıracak.

---

## Görev Özeti

Supabase veritabanındaki güvenlik uyarılarını çözmek ve admin panel giriş fonksiyonelliğini geri kazandırmak. Tüm değişiklikler **geriye dönük uyumlu** olmalı, mevcut frontend kodunu kırmamalı ve 89/89 E2E test suite'i temiz geçmeli.

---

## R1. KRİTİK — Admin Panel Giriş Düzeltmesi (RLS Recursion Loop)

### Sorunun Kök Nedeni #1: Sonsuz Döngü
`is_admin_user()` fonksiyonu, `user_profiles` tablosunu sorgulayarak kullanıcının `admin` veya `superadmin` rolünde olup olmadığını kontrol eder:

```sql
-- Bu fonksiyon user_profiles tablosuna SELECT atar
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin','superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Ancak `user_profiles` tablosunun SELECT RLS politikası da `is_admin_user()` fonksiyonunu çağırıyor:

```
user_profiles SELECT policy → is_admin_user() → user_profiles SELECT → is_admin_user() → ∞ RECURSION
```

Mevcut politika (`20260530220000_tenant_schema_setup.sql`, satır 524-526):
```sql
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (id = (SELECT auth.uid()) OR public.is_admin_user()));
```

### Çözüm Stratejisi
`user_profiles` tablosunun SELECT politikasında `is_admin_user()` çağrısını **kaldırıp**, yerine doğrudan inline JWT claim tabanlı kontrol kullanmak:

```sql
-- YANLIŞ (recursion): USING (... OR public.is_admin_user())
-- DOĞRU (recursion-free): USING (
--   tenant_id = public.jwt_tenant_id() AND (
--     id = (SELECT auth.uid())
--     OR (SELECT auth.role()) = 'service_role'
--     OR (SELECT current_setting('request.jwt.claims', true)::json->>'role') IN ('admin','superadmin')
--   )
-- )
```

> [!CAUTION]
> `is_admin_user()` fonksiyonu projede 50+ yerde kullanılıyor. Sadece `user_profiles` tablosunun **kendi SELECT politikasındaki** çağrıyı değiştirin. Diğer tablolardaki `is_admin_user()` çağrılarına DOKUNMAYIN — onlar recursion yaratmaz çünkü is_admin_user() SECURITY DEFINER olarak RLS'i bypass eder; sorun sadece user_profiles'ın kendi politikasının kendini çağırmasında.

### Doğrulama
- Admin kullanıcıyla login yapılabilmeli
- Normal kullanıcı yalnızca kendi profilini görebilmeli
- `service_role` tüm profillere erişebilmeli

---

## R6. KRİTİK — JWT Rol Enjeksiyonu (Admin Login Kök Neden #2)

### Sorun
`src/middleware.ts` (satır 134-183) admin guard kontrolünde `user.user_metadata?.role` değerini kontrol eder. Ancak:
1. Veritabanında `user_profiles.role` değiştiğinde JWT'ye senkronize eden mekanizma yok
2. `user_metadata` kullanıcı tarafından `supabase.auth.updateUser()` ile değiştirilebilir — **güvenli değil**

### Supabase Resmi Çözümü: Custom Access Token Auth Hook
Supabase'in resmi RBAC dökümantasyonuna göre doğru yöntem **Auth Hook** kullanmaktır. Bu hook her token yenilemede (refresh) otomatik çalışır ve JWT'ye güncel rol bilgisini enjekte eder.

**Kaynak:** https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac

```sql
-- 1. Auth Hook fonksiyonu oluştur
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- user_profiles tablosundan güncel rolü çek
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', '"user"'::jsonb);
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- 2. Yetkileri ayarla (sadece supabase_auth_admin çağırabilmeli)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT SELECT ON TABLE public.user_profiles TO supabase_auth_admin;
```

### Hook'u Etkinleştirme
Migration uygulandıktan sonra Supabase Dashboard'da:
`Authentication → Hooks (Beta)` → `Customize Access Token (JWT) Claims` → `public.custom_access_token_hook` seçin.

### Middleware Uyumu
Middleware'deki okumayı JWT claim'den yapacak şekilde güncelleyin:
```typescript
// ESKİ (güvensiz): user.user_metadata?.role
// YENİ (güvenli): JWT'deki custom claim
const jwt = jwtDecode(session.access_token);
const userRole = jwt.user_role;
```
**Bu, koruma alanları istisnası olarak middleware'deki TEK değişikliktir.**

> [!IMPORTANT]
> Bu düzeltme olmadan R1'i çözseniz bile admin login çalışmayabilir. R1 ve R6 birlikte uygulanmalıdır.

> [!CAUTION]
> **Supabase Resmi Kural:** `raw_user_meta_data` kullanıcı tarafından değiştirilebilir. Yetkilendirme kararlarında KESİNLİKLE kullanmayın. Custom Access Token Auth Hook ile JWT claims'e doğrudan enjekte edin.

---

## R2. GraphQL Schema Exposure Düzeltmesi (83 uyarı: 41 anon + 42 authenticated)

### Sorun
`pg_graphql` eklentisi aktif olduğu için, `SELECT` yetkisi verilen tüm `public` şema tabloları otomatik olarak GraphQL API üzerinden keşfedilebilir hale geliyor. Bu, `admin_audit_log`, `payment_transactions`, `client_errors` gibi hassas tabloları dış dünyaya açıyor.

İki uyarı türü var:
- **`pg_graphql_anon_table_exposed`**: Anonim (giriş yapmamış) kullanıcıların görebildiği tablolar
- **`pg_graphql_authenticated_table_exposed`**: Giriş yapmış kullanıcıların görebildiği tablolar

### Çözüm
Hassas tablolara `COMMENT ON TABLE ... IS '@graphql({"disabled": true})'` ile GraphQL'den gizleme uygulanmalı.

**GraphQL'de AÇIK kalması gereken tablolar** (frontend bunları kullanır):
- `products`
- `categories`
- `price_lists`
- `product_prices`
- `tenants` (sadece slug/domain bilgisi için)

**GraphQL'den GİZLENMESİ gereken tablolar** (hassas/admin-only):
- `admin_audit_log`
- `client_errors`
- `contact_messages`
- `coupons`
- `inventory_movements`
- `inventory_settings`
- `order_attachments`
- `order_notes`
- `order_refund_events`
- `payment_transactions`
- `returns_webhook_events`
- `shipping_email_events`
- `shipping_webhook_events`
- `user_profiles`
- `user_addresses`
- `user_invoice_profiles`
- `venthub_orders`
- `venthub_returns`
- `wizard_selections`
- `cart_items`
- Ve `public` şemasındaki diğer tüm hassas tablolar

```sql
-- Örnek uygulama (her hassas tablo için tekrarla):
COMMENT ON TABLE public.admin_audit_log IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.payment_transactions IS '@graphql({"disabled": true})';
-- ... diğer hassas tablolar
```

> [!WARNING]
> **Mevcut COMMENT'leri koruyun!** İki tablonun halihazırda comment'i var:
> - `user_profiles`: `'Kullanıcı profilleri ve rolleri'`
> - `wizard_selections`: `'Hava perdesi seçim wizard kaydları - hukuki koruma amaçlı'`
> 
> Bu tablolar için mevcut açıklamayı `@graphql` direktifiyle birleştirin:
> ```sql
> COMMENT ON TABLE public.user_profiles IS E'Kullanıcı profilleri ve rolleri\n@graphql({"disabled": true})';
> ```

---

## R3. Storage Bucket Listing Policy Düzeltmesi

### Sorun
`product-images` bucket'ı herkese açık (public) bucket olarak ayarlı ve geniş bir `SELECT` RLS politikası mevcut. Bu, istemcilerin bucket içindeki **tüm dosyaları listelemesine** olanak tanıyor.

### Çözüm
`storage.objects` tablosundaki `product-images` bucket'ına ait SELECT politikasını, yalnızca **tekil dosya erişimine** (belirli bir dosya adıyla okuma) izin verecek şekilde sıkılaştırın. Listeleme (`SELECT` without specific file name filter) engellenmelidir.

```sql
-- Mevcut geniş politikayı dar kapsamlı olanla değiştir:
-- Kullanıcılar dosya URL'si ile tekil erişim yapabilir, ama tüm dosyaları listeleyemez.
```

> [!IMPORTANT]
> Frontend'de ürün görselleri `getPublicUrl()` ile tek tek çekilir, listeleme (`list()`) kullanılmaz. Bu değişiklik frontend'i kırmaz.

---

## R4. Eski Mükerrer RLS Politikalarının Temizlenmesi

### Sorun
SaaS Faz 1 geçişinde yeni `merged_*` ön ekli kiracı-bazlı RLS politikaları eklendi. Ancak eski tek kiracılı dönemden kalan orijinal politikalar silinmedi. PostgreSQL'de birden fazla `PERMISSIVE` politika `OR` mantığıyla değerlendirilir — bu hem **performans kaybına** hem de **kiracılar arası veri sızıntısı riskine** yol açar.

### Silinmesi Gereken Eski Politikalar
Aşağıdaki SQL, hazırlanmış ve test edilmiş remediation scriptidir. Bu politikaların her birinin yerine zaten `merged_*` versiyonu mevcuttur:

```sql
-- coupons
DROP POLICY IF EXISTS "coupons_public_select" ON public.coupons;
DROP POLICY IF EXISTS "coupons_admin_all" ON public.coupons;

-- inventory_movements
DROP POLICY IF EXISTS "inventory_movements_select_admin" ON public.inventory_movements;

-- inventory_settings
DROP POLICY IF EXISTS "inventory_settings_select_all" ON public.inventory_settings;
DROP POLICY IF EXISTS "inventory_settings_update_admin" ON public.inventory_settings;

-- order_attachments
DROP POLICY IF EXISTS "order_attachments_admin_all" ON public.order_attachments;
DROP POLICY IF EXISTS "order_attachments_view_policy" ON public.order_attachments;

-- order_notes
DROP POLICY IF EXISTS "order_notes_admin_all" ON public.order_notes;
DROP POLICY IF EXISTS "order_notes_view_policy" ON public.order_notes;

-- order_refund_events
DROP POLICY IF EXISTS "order_refund_events_admin_select" ON public.order_refund_events;

-- price_lists
DROP POLICY IF EXISTS "Anyone can view price lists" ON public.price_lists;
DROP POLICY IF EXISTS "price_lists_admin_all" ON public.price_lists;
DROP POLICY IF EXISTS "price_lists_select" ON public.price_lists;

-- product_prices
DROP POLICY IF EXISTS "Anyone can view product prices" ON public.product_prices;
DROP POLICY IF EXISTS "product_prices_admin_all" ON public.product_prices;
DROP POLICY IF EXISTS "product_prices_select" ON public.product_prices;

-- tenants
DROP POLICY IF EXISTS "tenants_select" ON public.tenants;

-- user_addresses
DROP POLICY IF EXISTS "user_addresses_delete" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_insert" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_select" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_update" ON public.user_addresses;

-- user_profiles
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON public.user_profiles;

-- venthub_orders
DROP POLICY IF EXISTS "orders_delete_policy" ON public.venthub_orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON public.venthub_orders;
DROP POLICY IF EXISTS "orders_update_policy" ON public.venthub_orders;

-- venthub_returns
DROP POLICY IF EXISTS "returns_update_policy" ON public.venthub_returns;
```

---

## R5. Fonksiyon Güvenlik Sıkılaştırması

### 5a. Search Path Kilitleme
`handle_supabase_webhook()` fonksiyonunun `search_path` parametresi belirtilmemiş. Bu, `SECURITY DEFINER` fonksiyonlarda search path hijacking saldırısına yol açabilir.

```sql
ALTER FUNCTION public.handle_supabase_webhook() SET search_path = public;
```

### 5b. Unused Indexes (46 adet — INFO seviyesi, opsiyonel)
SaaS Faz 1'de eklenen `tenant_id` indeksleri henüz kullanılmadığı için `unused_index` uyarısı veriyor. Bu indeksler **ileride SaaS Faz 2-3'te kullanılacak** olduğundan **SİLİNMEMELİDİR**. Uyarılar dikkate alınıp görmezden gelinebilir.

> [!CAUTION]
> `idx_*_tenant_id` indekslerini KESİNLİKLE silmeyin. Bunlar SaaS multi-tenant altyapısının parçasıdır.

---

## R7. KRİTİK — 30 Adet SECURITY DEFINER Fonksiyon Açık Erişimi

### Sorun (MCP Canlı Tarama Sonucu)
Supabase MCP `get_advisors` taraması, **30 adet SECURITY DEFINER fonksiyonun** `anon` ve `authenticated` rollerine açık olduğunu tespit etti. Postgres varsayılan olarak `public` şemasındaki fonksiyonlara `EXECUTE` yetkisini `PUBLIC` rolüne verir — bu `anon` ve `authenticated`'ın hepsini çağırabilmesi demektir.

**Etkilenen 30 fonksiyonun tam listesi:**
```
public.adjust_stock(uuid, integer, text)
public.adjust_stock(uuid, integer, text, uuid)
public.adjust_stock_v2(uuid, integer)
public.admin_list_all_users()
public.admin_list_users()
public.enforce_role_change()
public.fn_admin_get_orders(text, text, text, integer)
public.fn_admin_update_order_status(text, text, text)
public.get_admin_users()
public.get_products_enriched(uuid[], integer, integer, text, text, text, numeric, numeric)
public.get_user_role(uuid)
public.handle_new_user_metadata()
public.handle_new_user_profile()
public.handle_supabase_webhook()
public.increment_coupon_usage(text)
public.is_admin()
public.is_admin_user()
public.is_staff_user()
public.is_user_admin(uuid)
public.jwt_tenant_id()
public.process_order_stock_reduction(text)
public.reverse_inventory_batch(uuid)
public.reverse_inventory_batch(uuid, integer)
public.set_stock(uuid, integer, text)
public.set_stock(uuid, integer, text, uuid)
public.set_user_admin_role(uuid, text)
public.set_user_role(uuid, text)
public.update_inventory_settings(integer)
public.update_inventory_thresholds(integer, boolean)
public.user_invoice_profiles_ensure_single_default()
```

### Çözüm Stratejisi
Her fonksiyonu analiz edip uygun erişim seviyesini belirleyin:

```sql
-- ADMIN FONKSİYONLARI: Sadece service_role çağırabilmeli
REVOKE EXECUTE ON FUNCTION public.admin_list_all_users() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_admin_get_orders(text, text, text, integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_admin_update_order_status(text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.set_user_admin_role(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, text) FROM anon, public;

-- STOK FONKSİYONLARI: Sadece authenticated + service_role
REVOKE EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.process_order_stock_reduction(text) FROM anon, public;
-- ... diğer stok fonksiyonları

-- TRIGGER FONKSİYONLARI: Sadece postgres/service_role (doğrudan çağrılmaz)
REVOKE EXECUTE ON FUNCTION public.handle_new_user_metadata() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_role_change() FROM anon, authenticated, public;

-- YARDIMCI FONKSİYONLAR: RLS politikalarında kullanılıyor, kaldırma dikkatli yapılmalı
-- is_admin_user(), jwt_tenant_id() gibi fonksiyonlar RLS'de çağrıldığı için
-- authenticated rolünün EXECUTE yetkisi gerekebilir — analiz edin
```

> [!WARNING]
> `is_admin_user()`, `jwt_tenant_id()`, `is_user_admin()` gibi fonksiyonlar RLS politikalarında kullanılıyor. Bu fonksiyonlardan `authenticated` yetkisini kaldırmak RLS'i kırabilir. Her fonksiyonun kullanım yerini kontrol edin.

---

## R8. Hardcoded Webhook Secret Temizliği

### Sorun
`scripts/webhook_setup.sql` (satır 10) içinde düz metin olarak webhook secret'ı bulunuyor:

```sql
webhook_secret text := 'whsec_venthub_a61f54b2bcff63f221259b315256d006';
```

Bu dosya versiyon kontrolünde ve GitHub'da herkes tarafından görülebilir durumdadır.

### Çözüm
Bu değeri `current_setting('app.webhook_secret', true)` veya parametreli bir yaklaşımla değiştirin. Veya dosyadaki hardcoded secret'ı `'REPLACE_WITH_ENV_SECRET'` placeholder'ıyla değiştirin ve dosyanın başına bir açıklama ekleyin.

```sql
-- DEĞİŞTİR: webhook_secret text := 'whsec_venthub_...'
-- YENİ:      webhook_secret text := current_setting('app.settings.webhook_secret', true);
```

---

## R9. Debug Fonksiyonlarının Temizlenmesi

### Sorun
`20250909_debug_rls_product_images.sql` migration'ında oluşturulan debug fonksiyonları hâlâ production veritabanında mevcut:
- `debug_context()` — anon'a EXECUTE yetkisi var
- `debug_policies_product_images()` — anon'a EXECUTE yetkisi var

Bu fonksiyonlar iç veritabanı yapısını (politika tanımları, JWT bağlamı) dış dünyaya sızdırır.

### Çözüm
```sql
DROP FUNCTION IF EXISTS public.debug_context();
DROP FUNCTION IF EXISTS public.debug_policies_product_images();
```

---

## R10. Hassas Tablolarda Aşırı `anon` SELECT Yetkileri (İnceleme)

### Sorun
SaaS Faz 1 migration'ı (`20260530220000_tenant_schema_setup.sql`) aşağıdaki hassas tablolara `anon` rolüne `SELECT` yetkisi veriyor:

- `admin_audit_log`, `order_refund_events`, `user_profiles`, `user_addresses`, `user_invoice_profiles`, `wizard_selections`, `shipping_webhook_events`, `returns_webhook_events`, `inventory_movements`, `inventory_settings`, `order_notes`, `order_attachments`

RLS politikaları bu verileri korusa da, `SELECT` yetkisinin kendisi gereksiz bir saldırı yüzeyi oluşturur ve pg_graphql uyarılarının (R2) asıl kaynağıdır.

### Çözüm Stratejisi
Bu tabloların hangilerinde `anon` erişiminin gerçekten gerekli olduğunu analiz edin. Gerekli olmayan tablolardaki `anon` SELECT yetkisini kaldırın:

```sql
-- Örnek (frontend anon erişimi gerektirmeyen tablolar için):
REVOKE SELECT ON public.admin_audit_log FROM anon;
REVOKE SELECT ON public.order_refund_events FROM anon;
-- ... analiz sonucuna göre diğerleri
```

> [!WARNING]
> Bu adım dikkatli analiz gerektirir. Bazı tablolarda anonim kullanıcıların okuma yapması gerekebilir (örn: `products`, `categories` tabloları). Her tablonun frontend kullanımını kontrol edin ve yalnızca gereksiz olanları kısıtlayın.

---

## 🛡️ DOKUNULMAZ KORUMA ALANLARI

Bu projede aşağıdaki dosyalara/modüllere **KESİNLİKLE DOKUNULMAYACAKTIR**:

1. **HVAC Fizik Motoru**: `src/utils/hvacCalculations.ts` — Mühendislik hesaplamaları kiracı-bağımsızdır
2. **Edge Functions**: `supabase/functions/` dizinindeki Deno Edge fonksiyonları değiştirilmeyecek
3. **Frontend Bileşenleri**: React/Next.js bileşenleri (src/components, src/app) değiştirilmeyecek — bu iş tamamen veritabanı katmanında
4. **Mevcut Migration Dosyaları**: Hiçbir mevcut migration dosyası değiştirilmeyecek. Tüm düzeltmeler **yeni idempotent migration dosyaları** olarak eklenecek
5. **`merged_*` RLS Politikaları**: Yeni SaaS tenant-scoped politikalar korunacak
6. **Middleware Dosyası** (`src/middleware.ts`): R6 kapsamında **sadece** `user_metadata.role` → JWT `user_role` claim okumasını değiştirmek dışında dokunulmayacak

---

## ✅ Kabul Kriterleri

### Erişim & Güvenlik
- [ ] Admin kullanıcı (`role = 'admin'` veya `superadmin`) ile admin panele başarıyla giriş yapılabilir
- [ ] `user_profiles` SELECT politikası sonsuz rekürsiyona girmez
- [ ] Custom Access Token Auth Hook aktif — JWT'ye `user_role` claim'i enjekte ediliyor
- [ ] Middleware `user_role` claim'ini JWT'den okuyor (eski `user_metadata` değil)
- [ ] GraphQL şeması üzerinden hassas tablolar keşfedilemez
- [ ] `product-images` storage bucket'ında dosya listeleme engellenmiş
- [ ] Eski mükerrer RLS politikaları tamamen kaldırılmış
- [ ] `handle_supabase_webhook()` fonksiyonunun search_path'i kilitlenmiş
- [ ] 30 SECURITY DEFINER fonksiyonun erişim yetkileri sıkılaştırılmış
- [ ] Hardcoded webhook secret temizlenmiş
- [ ] Debug fonksiyonları kaldırılmış
- [ ] Hassas tablolardaki gereksiz `anon` SELECT yetkileri gözden geçirilmiş

### Kod Bütünlüğü
- [ ] `pnpm run type-check` — 0 hata ile geçer
- [ ] `pnpm run lint` — 0 hata ile geçer  
- [ ] `pnpm run test:e2e` — 89/89 test geçer (sıfır regression)
- [ ] Yeni migration dosyası `supabase/migrations/` dizinine idempotent olarak eklenir

### MCP Doğrulama (ZORUNLU)
- [ ] `get_advisors({type: 'security'})` — kritik uyarı kalmamış (146 → ~0 hedef)
- [ ] `get_advisors({type: 'performance'})` — yeni performans sorunu oluşmamış

### Anti-Pattern Kontrol Listesi (YAPMA!)
- [ ] `is_admin_user()` fonksiyonunu silme — sadece `user_profiles` SELECT policy'sindeki çağrıyı düzelt
- [ ] `merged_*` RLS politikalarını silme veya değiştirme
- [ ] `tenant_id` indekslerini silme
- [ ] `products` veya `categories` tablolarını GraphQL'den gizleme
- [ ] Mevcut migration dosyalarını düzenleme (her zaman yeni dosya oluştur)
- [ ] Frontend/React kodunu değiştirme
- [ ] `src/middleware.ts` admin guard mantığını değiştirme (sadece R6 JWT okuma değişikliği)
- [ ] `supabase/functions/` altındaki Edge Functions'a dokunma
- [ ] RLS'de kullanılan fonksiyonlardan (`is_admin_user`, `jwt_tenant_id`) `authenticated` yetkisini körü körüne kaldırma

---

## 📋 Öncelik Sıralaması

| Öncelik | Gereksinim | Risk | Etki |
|:---:|:---|:---:|:---|
| 🔴 P0 | R1 — RLS Recursion Fix | KRİTİK | Admin login'i engelliyor |
| 🔴 P0 | R6 — Auth Hook JWT Enjeksiyonu | KRİTİK | Admin login'in ikinci kök nedeni |
| 🟠 P1 | R7 — 30 SECURITY DEFINER Revoke | YÜKSEK | Stok/admin manipülasyonu riski |
| 🟠 P1 | R4 — Mükerrer Policy Temizliği | YÜKSEK | Tenant bypass riski |
| 🟡 P2 | R2 — GraphQL Exposure (83) | ORTA | Veri keşfi riski |
| 🟡 P2 | R10 — Anon SELECT Revoke | ORTA | GraphQL'in kök nedeni |
| 🟡 P2 | R9 — Debug Functions | ORTA | İç yapı sızdırma riski |
| 🟡 P2 | R3 — Storage Listing | ORTA | Dosya isim listesi sızıntısı |
| 🟡 P2 | R8 — Webhook Secret | ORTA | Versiyon kontrolünde secret |
| 🟢 P3 | R5 — Search Path | DÜŞÜK | Teorik hijacking riski |

---

## 📋 Veritabanı Bağlantısı

Uzaki Supabase veritabanına bağlantı için `.env` dosyasındaki `DATABASE_URL` kullanılmalıdır. Supabase CLI komutları `supabase db query --db-url "$DATABASE_URL"` şeklinde çalıştırılabilir.

## 📋 Mevcut Araçlar

- `supabase` CLI (v2.101.0) kurulu ve linked
- Proje kökünde `supabase/` dizini mevcut
- Mevcut migration'lar `supabase/migrations/` altında
- E2E test suite: `pnpm run test:e2e`
- Type check: `pnpm run type-check`
- Lint: `pnpm run lint`

## 📚 Zorunlu Referans Kaynakları (Supabase Resmi Kuralları)

Bu projedeki tüm veritabanı değişikliklerinden ÖNCE aşağıdaki skill dosyalarını okuyun:

1. **`.agent/skills/supabase/SKILL.md`** — Supabase resmi ajan kuralları:
   - `user_metadata` vs `app_metadata` güvenlik farkı
   - `SECURITY DEFINER` fonksiyon riskleri ve koruma yöntemleri
   - `auth.role()` deprecation → `TO authenticated/anon` kullanımı
   - RLS policy yazım kalıpları (USING + WITH CHECK)
   - Views bypass RLS uyarısı

2. **`.agent/skills/supabase-security/SKILL.md`** — VentHub'a özel güvenlik kuralları:
   - Migration şablonları ve isimlendirme kuralları
   - Yıkıcı SQL korumaları (DROP TABLE/COLUMN yasak)
   - RLS policy yazım standartları

## ⚙️ Çalışma Akışı (Supabase Resmi Önerisi)

1. **Geliştirme aşaması**: Şema değişikliklerini `execute_sql` (MCP) veya `supabase db query` (CLI) ile uygulayın — bu migration geçmişi oluşturmaz, iterasyon yapabilirsiniz
2. **Doğrulama**: Her DDL değişikliğinden sonra `get_advisors` (MCP) veya `supabase db advisors` (CLI) çalıştırarak yeni uyarı oluşmadığını kontrol edin
3. **Commit**: Değişiklikler doğrulandığında `supabase migration new <descriptive-name>` ile temiz migration dosyası oluşturun
4. Son kontrol: `supabase migration list --local` ile migration'ın doğru kaydedildiğini teyit edin

## 2026-06-02T07:00:00Z

The user updated BRIEFING.md and handoff.md:
- Cron 1 (Progress Reporting): 5cec3e65-fcce-4217-9f5c-1d46b2232dbe/task-31
- Cron 2 (Liveness Check): 5cec3e65-fcce-4217-9f5c-1d46b2232dbe/task-34
- Active orchestrator: e48c4e27-c09a-439b-b5f0-d1cd72ff80f9
- Active worker: worker_m1_gen2 (progress updated as of 2026-06-02T09:56:00+03:00)
