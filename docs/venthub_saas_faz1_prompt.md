# Teamwork Project Prompt — VentHub SaaS Foundation (Faz 1)


VentHub, mevcut tek kiracılı (single-tenant) HVAC e-ticaret platformunu çoklu kiracılı (multi-tenant) SaaS altyapısına dönüştürme projesidir. Bu faz (Faz 1 — Foundation), mevcut uygulamayı bozmadan multi-tenancy temelini atar. Mevcut VentHub "default tenant" olarak çalışmaya devam edecek, yeni tenant'lar eklenebilir hale gelecektir.

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
3. Mevcut 26 tablonun tenant-aware olanlarına `tenant_id UUID REFERENCES tenants(id)` kolonu ekle. Tenant-agnostik tablolar (örn: saf lookup/enum tabloları) varsa onlara ekleme. **Özellikle `admin_audit_log` tablosuna `tenant_id` ekle** — super_admin hangi tenant'ta hangi işlemin yapıldığını izleyebilmeli.
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
3. RLS zaten izolasyonu sağlayacak, ama uygulama katmanında da tenant_id kontrolü olmalı (defense in depth).

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

---
*This is Faz 1 (Foundation) of a 4-phase SaaS transformation. Faz 2 (White-Label), Faz 3 (Tenant Admin + Billing), and Faz 4 (Marketplace) will follow in separate teamwork sessions.*
