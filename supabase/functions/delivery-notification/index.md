---
domain: general
source_type: doc
namespace_type: module
source_path: supabase/functions/delivery-notification/index.ts
generated_at: 2026-05-24T08:21:00Z
---

## Genel Bakış
Teslimat tamamlandığında müşteriye e-posta bildirimi gönderen Edge Function. Sipariş bilgilerini veritabanından çeker, HTML şablon ile e-posta oluşturur ve Resend API üzerinden gönderir. Gönderim sonrası `shipping_email_events` tablosuna audit kaydı yazar.

## Fonksiyon Grupları

### Şablon İşleme
- `render(tpl, _data)` — Mustache benzeri `{{key}}` placeholder'larını veri ile değiştirir.
- `loadTemplate()` — `templates/email/delivered.html` dosyasını diskten okur; bulamazsa `null` döner.

### Ana Handler
- `serve(handler)` — POST isteklerini karşılar, yetkilendirme kontrolü yapar, sipariş bilgilerini çeker, e-posta gönderir.

## Fonksiyon Detayları

### render
**Ne yapar:** Verilen HTML şablonundaki `{{key}}` ifadelerini `_data` objesindeki değerlerle değiştirir.
**Parametreler:**
- `tpl: string` — HTML şablon metni
- `_data: Record<string, unknown>` — Anahtar/değer çiftleri
**Dönüş:** `string` — İşlenmiş HTML

### loadTemplate
**Ne yapar:** `templates/email/delivered.html` dosyasını asenkron olarak okur.
**Dönüş:** `Promise<string | null>` — Şablon içeriği veya `null`

### Ana Handler (serve callback)
**Ne yapar:** Teslimat bildirimi gönderir.
**Method:** POST
**Yetkilendirme:** Service Role Key veya admin/superadmin rolü
**Akış:**
1. CORS preflight kontrolü
2. Authorization header ile yetki doğrulama (service key veya user role check)
3. `order_id` ile `venthub_orders` tablosundan müşteri bilgisi çekme
4. HTML şablon yükleme ve render etme (yoksa inline fallback HTML)
5. Resend API ile e-posta gönderimi
6. `shipping_email_events` tablosuna audit kaydı

**Girdi (Body):**
```typescript
interface DeliveryRequest {
  order_id: string           // Zorunlu
  customer_email?: string    // Opsiyonel, DB'den türetilir
  customer_name?: string     // Opsiyonel, DB'den türetilir
  order_number?: string      // Opsiyonel, DB'den türetilir
}
```

**Tablolar:** `venthub_orders` (okuma), `user_profiles` (rol kontrolü), `shipping_email_events` (yazma)
**Dış Servisler:** Resend API (`https://api.resend.com/emails`)
**Env:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`

---

## NODE ID STANDARD
  file: supabase/functions/delivery-notification/index.ts
  function: supabase/functions/delivery-notification/index.ts::render
  function: supabase/functions/delivery-notification/index.ts::loadTemplate
  function: supabase/functions/delivery-notification/index.ts::delivery-notification_handler
  interface: supabase/functions/delivery-notification/index.ts::DeliveryRequest

## DISA AKTARILANLAR (EXPORTS)
  export: render
  export: loadTemplate
  export: delivery-notification_handler
