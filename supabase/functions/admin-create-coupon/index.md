---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\supabase\functions\admin-create-coupon\index.ts
skeleton_hash: 5b8fe91e8f0455cf
entity_hashes:
  func:admin-create-coupon_handler: 72913923d4da4715
  overview: cd57faa16c1d1db9
generated_at: 2026-08-25T07:32:52Z
---

## Genel Bakış

Bu modül, Supabase Edge Function altyapısı üzerinde çalışan bir yönetici kupon oluşturma uç noktasıdır. Gelen HTTP isteklerini `Deno.serve` aracılığıyla dinler ve yönetici yetkisine sahip kullanıcıların yeni kupon kayıtları oluşturmasına olanak tanır. Modül tek bir işlevden oluşur ve bağımsız bir servis olarak çalışır.

## Fonksiyon Grupları

### Ana İşleyici

Gelen HTTP isteğini karşılayıp yönetici kuponu oluşturma işlemini yürüten tek sorumlu işlevdir. Supabase'in `serve` dekoratörü ile dış dünyaya açılan bu fonksiyon, istek gövdesini çözümleyip kupon verisini işler ve sonuç olarak bir HTTP yanıtı döndürür.

- admin-create-coupon_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, yalnızca `admin-create-coupon_handler(req: Request) -> Response` imzası mevcuttur. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebilir; gövde verilmediği için modüle özgü bir varsayımda bulunulamaz.

---

## FONKSİYON DETAYLARI

### admin-create-coupon_handler
**Ne yapar**: Fonksiyonun görevi belirtilmemiştir. Docstring boş olduğundan ne iş yaptığı bilinmiyor.

**Nasıl yapar**: `@serve(Deno.serve)` dekoratörü ile tanımlanmıştır. Bu dekoratör, fonksiyonu Deno'nun yerleşik HTTP sunucusuna bağlayarak bir Supabase Edge Function olarak çalışmasını sağlar. Fonksiyon asenkron (`async`) olarak tanımlanmıştır. İç mantığı hakkında docstring veya kaynak kod bilgisi bulunmadığından detay bilinmiyor.

**Parametreler**:
- req: Request — Gelen HTTP isteğini temsil eden nesne. Detaylı alan bilgisi verilmemiştir.

**Dönüş**: Response — HTTP yanıtını temsil eden nesne döndürür. Yanıtın içeriği ve yapısı hakkında bilgi verilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: ../_shared/tenant.ts::TenantMismatchError
- import: ../_shared/tenant.ts::tenantFromVerifiedUser
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-create-coupon/index.ts::admin-create-coupon_handler
- **params**: `req: Request` — gelen HTTP isteği
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` çağrısından dönen CORS başlıkları; tüm yanıtlarda kullanılır
  - `SUPABASE_URL` — `Deno.env.get('SUPABASE_URL')` ile alınan ortam değişkeni; Supabase proje URL'si
  - `SUPABASE_ANON_KEY` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan ortam değişkeni; anonim erişim anahtarı
  - `SUPABASE_SERVICE_ROLE_KEY` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan ortam değişkeni; yönetici erişim anahtarı
  - `authHeader` — `req.headers.get('Authorization')` ile alınan yetkilendirme başlığı; yoksa 401 döner
  - `supabaseUser` — `createClient(SUPABASE_URL, SUPABASE_ANON_KEY, ...)` ile oluşturulan Supabase istemcisi; kullanıcı oturumunu doğrulamak için `authHeader` başlığıyla yapılandırılır
  - `supabaseAdmin` — `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` ile oluşturulan Supabase istemcisi; yönetici ayrıcalıklarıyla veritabanı işlemleri yapar
  - `userRes` — `supabaseUser.auth.getUser(authHeader.replace(...))` sonucundaki `data`; doğrulanmış kullanıcı bilgisini içerir
  - `userErr` — `supabaseUser.auth.getUser(...)` sonucundaki hata; varsa 401 döner
  - `userId` — `userRes.user.id`; doğrulanmış kullanıcının benzersiz kimliği
  - `profile` — `supabaseAdmin.from('user_profiles').select('role, tenant_id').eq('id', userId).maybeSingle()` sonucundaki `data`; kullanıcının rolü ve kiracı kimliğini içerir
  - `profErr` — profil sorgusu hatası; varsa 500 döner
  - `userRole` — `profile?.role` değeri, string olarak atanır; yoksa `'user'` varsayılır. `['admin', 'super_admin']` içinde değilse 403 döner
  - `tenantId` — `tenantFromVerifiedUser(...)` fonksiyonundan dönen `tenantId`; doğrulanmış kullanıcı ve profil bilgisinden çıkarılan kiracı kimliği. `TenantMismatchError` yakalanırsa 403 döner
  - `tenantErr` — `tenantFromVerifiedUser(...)` çağrısında oluşan hata; `TenantMismatchError` türünde ise 403, diğer durumlarda yeniden fırlatılır
  - `body` — `req.json().catch(() => ({}))` ile parse edilen istek gövdesi; `CouponBody` arayüzüne uygun
  - `code` — `String(body.code || '').trim()` ile elde edilen kupon kodu; 3–50 karakter arası olmalı
  - `type` — `String(body.type || '')` ile elde edilen kupon tipi; `'percent'` veya `'fixed'` olmalı
  - `value` — `Number(body.value)` ile elde edilen kupon değeri; sıfırdan büyük olmalı
  - `starts_at` — `body.starts_at` varsa `String(body.starts_at)`, yoksa `null`; kupon geçerlilik başlangıcı
  - `ends_at` — `body.ends_at` varsa `String(body.ends_at)`, yoksa `null`; kupon geçerlilik bitişi
  - `is_active` — `Boolean(body.active ?? true)` ile elde edilen kupon aktiflik durumu
  - `usage_limit` — kullanım limiti; `body.usage_limit` null/undefined/boş ise `null`, aksi halde `Number(body.usage_limit)` sonucu. Sonuç sonlu değilse veya 1'den küçükse `null` atanır
  - `ul` — `Number(body.usage_limit)` sonucu; geçerlilik kontrolünde kullanılır
  - `errs` — validasyon hatalarını toplayan `string[]` dizi; boş değilse 400 döner
  - `payload` — veritabanına eklenecek kupon kaydı objesi; `code`, `discount_type`, `discount_value`, `valid_from`, `valid_until`, `is_active`, `usage_limit`, `used_count` (0), `created_by` (userId), `tenant_id` alanlarını içerir
  - `data` — `supabaseAdmin.from('coupons').insert(payload).select(...).single()` sonucundaki `data`; eklenen kuponun seçili alanlarını içerir
  - `insErr` — insert işlemi hatası; varsa 400 döner
  - `_e` — `catch` bloğundaki yakalanan hata; `Error` türünde ise `message`, aksi halde `String(_e)` ile mesaj çıkarılır
- **Dönüş**: `Response` — duruma göre: 200 (başarılı kupon oluşturma, `data` JSON), 204 (OPTIONS), 400 (validasyon/insert hatası), 401 (yetkisiz), 403 (yasak), 405 (yanlış metod), 500 (sunucu/ortam hatası)

---

## NODE ID STANDARD

  file: index.ts
  function: index.ts::admin-create-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-create-coupon_handler