---
domain: general
source_type: doc
namespace_type: module
source_path: supabase/functions/order-confirmation/index.ts
generated_at: 2026-05-24T08:21:00Z
---

## Genel Bakış
Sipariş onay e-postası gönderen Edge Function. Ödeme başarılı olduktan sonra çağrılır, sipariş ve müşteri bilgilerini DB'den çeker, HTML şablon ile marka renklerine uygun e-posta oluşturur ve Resend API ile gönderir. Origin whitelist ile CORS koruması, domain doğrulama hatası durumunda otomatik fallback sender ve Sentry hata raporlaması içerir.

## Fonksiyon Grupları

### Şablon İşleme
- `renderTemplate(tpl, _data)` — `{{key}}` ve `{{#if key}}...{{/if}}` koşullu blokları destekleyen basit şablon motoru.
- `loadTemplate()` — `templates/email/order_confirmation.html` dosyasını diskten okur.

### E-posta Gönderimi
- `send()` — Resend API'ye POST isteği ile e-posta gönderir. BCC desteği içerir.

### Ana Handler
- `serve(handler)` — Sipariş onay akışını yönetir: auth, DB sorgusu, şablon render, gönderim, audit.

## Fonksiyon Detayları

### renderTemplate
**Ne yapar:** İki aşamalı şablon işleme: önce `{{#if key}}` koşullu blokları değerlendirir, sonra `{{key}}` placeholder'ları değiştirir.
**Parametreler:**
- `tpl: string` — HTML şablon
- `_data: Record<string, unknown>` — Veriler
**Dönüş:** `string`

### loadTemplate
**Ne yapar:** `templates/email/order_confirmation.html` dosyasını asenkron okur.
**Dönüş:** `Promise<string | null>`

### send (iç fonksiyon)
**Ne yapar:** Resend API üzerinden e-posta gönderir.
**Dönüş:** `Promise<Response>`

### Ana Handler (serve callback)
**Method:** POST
**Yetkilendirme:** Service Role Key veya admin/superadmin rolü
**CORS:** `ALLOWED_ORIGINS` env ile origin whitelist
**Akış:**
1. Origin whitelist kontrolü → 403 forbidden_origin
2. Auth: service key veya user role doğrulama
3. `order_id` parse → `venthub_orders`'dan müşteri bilgisi çekme
4. Eksik müşteri bilgisi varsa Auth Admin API'den kullanıcı metadata çekme
5. Test modu kontrolü (`EMAIL_TEST_MODE`, `EMAIL_TEST_TO`)
6. HTML şablon yükleme + marka renkleri ile render
7. Resend API ile gönderim (domain hatası varsa fallback sender)
8. `order_email_events` tablosuna audit kaydı

**Girdi (Body):** `{ order_id: string }`

**Tablolar:** `venthub_orders` (okuma), `user_profiles` (rol kontrolü), `order_email_events` (yazma)
**Dış Servisler:** Resend API, Supabase Auth Admin API, Sentry
**Env:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TEST_MODE`, `EMAIL_TEST_TO`, `SHIP_EMAIL_BCC`, `BRAND_NAME`, `BRAND_PRIMARY_COLOR`, `BRAND_LOGO_URL`, `ALLOWED_ORIGINS`

---

## NODE ID STANDARD
  file: supabase/functions/order-confirmation/index.ts
  function: supabase/functions/order-confirmation/index.ts::renderTemplate
  function: supabase/functions/order-confirmation/index.ts::loadTemplate
  function: supabase/functions/order-confirmation/index.ts::send
  function: supabase/functions/order-confirmation/index.ts::order-confirmation_handler

## DISA AKTARILANLAR (EXPORTS)
  export: renderTemplate
  export: loadTemplate
  export: order-confirmation_handler
