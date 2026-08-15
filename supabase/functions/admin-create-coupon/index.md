---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\admin-create-coupon\index.ts
skeleton_hash: 6032379d786e47a1
entity_hashes:
  func:admin-create-coupon_handler: 72913923d4da4715
  overview: cd57faa16c1d1db9
generated_at: 2026-08-15T09:05:02Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Function olarak çalışan bir HTTP endpoint'idir. Tek bir işleyici fonksiyon aracılığıyla, yöneticilerin yeni indirim kuponu oluşturma isteklerini alır, doğrular ve veritabanına kaydederek uygun HTTP yanıtını döndürür.

## Fonksiyon Grupları
### Kupon Oluşturma İşleyicisi
Tek bir endpoint olarak, tüm HTTP isteklerini yöneten kapsamlı bir işleyici fonksiyonu barındırır. Yetkilendirme kontrolü, istek doğrulama, veritabanına yazma ve yanıt oluşturma adımlarını tek bir akışta gerçekleştirir.
- admin-create-coupon_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir HTTP isteği alıp yanıt döndüren bir Edge Function handler'ıdır. Fonksiyon gövdesi paylaşılmadığı için somut implementasyon detaylarına dayalı aksiyomlar üretilememektedir.

**Bilinenler:**
- Fonksiyon imzası: `admin-create-coupon_handler(req: Request) -> Response`

**Eğer [geçerli bir HTTP Request nesnesi] yoksa, [fonksiyon uygun bir hata yanıtı veya istisna döndürür] olur.**

---

## FONKSİYON DETAYLARI

### admin-create-coupon_handler

**Ne yapar**: Bu fonksiyon, administrative panel üzerinden yeni bir kupon oluşturma işlemini yöneten HTTP isteklerini işler. Supabase Edge Function yapısında yer alan bu handler, admin kullanıcılarının kupon sistemine yeni kayıtlar eklemesini sağlar.

**Nasıl yapar**: Fonksiyon, gelen HTTP Request nesnesini kabul eder ve ilgili isteği işleyerek bir Response döndürür. Supabase Edge Functions mimarisinde çalışır ve TypeScript tabanlıdır. İşlevin detaylı iç mantığı dokümanda belirtilmemiştir.

**Parametreler**:
- `req`: Request — İşlenecek HTTP istek nesnesi. İstek gövdesinde kupon verileri ve authentication bilgileri bulunmaktadır.

**Dönüş**: Response — İşlem sonucunu içeren HTTP yanıt nesnesi. Başarılı oluşturma durumunda onay, hata durumunda ise uygun hata mesajını döndürür.

**Not**: Fonksiyon docstring'i boş bırakılmış olup, detaylı iç mantık ve implementasyon bilgileri kaynak kodda mevcuttur. Belgeleme için kaynak kod incelenerek parametre şeması, validasyon kuralları ve hata yönetimi detayları eklenmelidir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: ../_shared/tenant.ts::TenantMismatchError
- import: ../_shared/tenant.ts::tenantFromVerifiedUser
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `supabase/functions/admin-create-coupon/index.ts`::`admin-create-coupon_handler`

- **params**:
  - `req: Request` — gelen HTTP istek nesnesi; method, headers ve JSON body içerir

- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` çağrısıyla elde edilen CORS başlıkları nesnesi, tüm Response'lara eklenir
  - `SUPABASE_URL` — `Deno.env.get('SUPABASE_URL')` ile okunan ortam değişkeni; Supabase proje URL'i
  - `SUPABASE_ANON_KEY` — `Deno.env.get('SUPABASE_ANON_KEY')` ile okunan ortam değişkeni; Supabase anonim anahtarı
  - `SUPABASE_SERVICE_ROLE_KEY` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile okunan ortam değişkeni; Supabase servis rolü anahtarı, admin izinleriyle istemci oluşturmak için kullanılır
  - `authHeader` — `req.headers.get('Authorization')` ile istek başlığından okunan Bearer token
  - `supabaseUser` — `createClient(SUPABASE_URL, SUPABASE_ANON_KEY, ...)` ile oluşturulan Supabase istemcisi; kullanıcının kendi tokenıyla Yetkilendirme istekleri yapar (getUser)
  - `supabaseAdmin` — `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` ile oluşturulan Supabase admin istemcisi; servis rolüyle veritabanı sorguları ve insert işlemleri yapar
  - `userRes` — `supabaseUser.auth.getUser(...)` çağrısının `data` alanından destructure edilen kullanıcı sonucu; `userRes.user` içinde authenticated kullanıcı bilgisi tutulur
  - `userErr` — `supabaseUser.auth.getUser(...)` çağrısının `error` alanından destructure edilen hata nesnesi
  - `userId` — `userRes.user.id`; doğrulanmış kullanıcının UUID'isi, profil sorgusu ve payload.created_by için kullanılır
  - `profile` — `supabaseAdmin.from('user_profiles').select('role, tenant_id').eq('id', userId).maybeSingle()` sorgusunun `data` sonucu; kullanıcının rolü ve tenant_id bilgisi tutulur
  - `profErr` — aynı sorgunun `error` sonucu
  - `userRole` — `profile?.role` değerinden türetilen kullanıcı rolü; `'user'` fallback'li string, `['admin', 'superadmin']` kontrolü için kullanılır
  - `tenantId` — `tenantFromVerifiedUser({ id: userId, app_metadata: userRes.user.app_metadata ?? null }, profile)` çağrısıyla elde edilen kiracı UUID'isi; `TenantMismatchError` fırlatılabilir, `payload.tenant_id` için kullanılır
  - `body` — `req.json()` ile parse edilen request body; `CouponBody` arayüzüne cast edilmiş nesne
  - `code` — `body.code` değerinden `String(...).trim()` ile temizlenmiş kupon kodu; 3-50 karakter arası olmalı
  - `type` — `body.type` değerinden elde edilen indirim türü; `'percent'` veya `'fixed'` olmalı
  - `value` — `Number(body.value)` ile parse edilen indirim miktarı; 0'dan büyük olmalı
  - `starts_at` — `body.starts_at` varsa `String(...)` ile string'e çevrilmiş geçerlilik başlangıç tarihi, yoksa `null`
  - `ends_at` — `body.ends_at` varsa `String(...)` ile string'e çevrilmiş geçerlilik bitiş tarihi, yoksa `null`
  - `is_active` — `Boolean(body.active ?? true)` ile belirlenen aktiflik durumu; varsayılan `true`
  - `usage_limit` — `body.usage_limit`'tenparse edilen maksimum kullanım sayısı; `null`, geçersiz veya <1 ise `null`落とす
  - `ul` — `usage_limit` hesaplama içinde `Number(body.usage_limit)` ile elde edilen geçici numeric değer
  - `errs` — validasyon hatalarını toplayan `string[]` dizisi; hatalı alan isimleri eklenir
  - `payload` — `coupons` tablosuna insert edilecek veri objesi; `code`, `discount_type`, `discount_value`, `valid_from`, `valid_until`, `is_active`, `usage_limit`, `used_count`, `created_by`, `tenant_id` alanlarını içerir
  - `data` — `supabaseAdmin.from('coupons').insert(payload).select(...).single()` çağrısının `data` sonucu; inserted kuponun tüm alanlarıyla birlikte dönendir
  - `insErr` — insert çağrısının `error` sonucu

- **Dönüş**: `Response` — Success: `200` ile insert edilmiş kupon objesi JSON; Hata durumlarına göre `405` (method_not_allowed), `500` (missing_env, profile_error, internal), `401` (unauthenticated, unauthorized), `403` (forbidden: admin_only veya tenant_mismatch), `400` (bad_request: validasyon hataları veya insert_failed). Try-catch `_e` yakalayıp `500 internal` dönerek tüm yakalanmamış istisnaları yönetir.

---

## NODE ID STANDARD

  file: supabase\functions\admin-create-coupon\index.ts
  function: supabase\functions\admin-create-coupon\index.ts::admin-create-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-create-coupon_handler