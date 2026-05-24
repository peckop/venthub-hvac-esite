---
domain: general
source_type: doc
namespace_type: module
source_path: supabase/functions/returns-webhook/index.ts
generated_at: 2026-05-24T08:21:00Z
---

## Genel Bakış
İade kargo webhook'u alan Edge Function. Kargo firmasından gelen durum güncellemelerini (transit, delivered, cancelled) alır, `venthub_returns` tablosundaki iade kaydını günceller. Monoton ilerleme kuralı uygular (durum gerilemesini engeller). İade "received" durumuna geçtiğinde müşteriye otomatik bildirim gönderir. HMAC-SHA256 veya token bazlı yetkilendirme, event dedup ve audit log desteği içerir.

## Fonksiyon Grupları

### Yardımcı Fonksiyonlar
- `json(body, init)` — Standart JSON response oluşturur.
- `hmacValid(secret, raw, signatureHeader)` — HMAC-SHA256 imza doğrulaması yapar.
- `sha256Base64(input)` — SHA-256 hash'i base64 olarak döner (audit için).

### Durum Haritalama
- `mapReturnStatus(input)` — Kargo firmasının durum kodunu iç durum koduna çevirir (`in_transit`, `received`, `cancelled`).
- `normalizePayload(obj)` — Farklı kargo firmalarının payload formatlarını standart bir yapıya dönüştürür.

### Ana Handler
- `Deno.serve(handler)` — Webhook isteklerini karşılar.

## Fonksiyon Detayları

### hmacValid
**Ne yapar:** Gelen webhook isteğinin HMAC-SHA256 imzasını doğrular.
**Parametreler:**
- `secret: string` — Paylaşılan gizli anahtar
- `raw: string` — Ham request body
- `signatureHeader: string` — `x-signature` header değeri
**Dönüş:** `Promise<boolean>`

### mapReturnStatus
**Ne yapar:** Kargo durum kodunu VentHub iç durum koduna çevirir.
**Haritalama:**
- `in_transit, transit, return_in_transit, returning` → `in_transit`
- `received, delivered, returned, completed` → `received` (setReceived=true)
- `cancelled, canceled` → `cancelled`
**Dönüş:** `{ status?: string; setReceived?: boolean }`

### normalizePayload
**Ne yapar:** Farklı kargo firmalarının JSON yapısını standart formata çevirir.
**Çıktı alanları:** `_return_id`, `order_id`, `carrier`, `tracking_number`, `status`, `delivered_at`

### Ana Handler (Deno.serve callback)
**Method:** POST
**Yetkilendirme:** HMAC-SHA256 (`RETURNS_WEBHOOK_SECRET`) veya Token (`RETURNS_WEBHOOK_TOKEN`)
**Akış:**
1. İmza/token doğrulama → 401
2. Payload normalize etme
3. Event dedup kontrolü (`returns_webhook_events` tablosu)
4. `_return_id` yoksa `order_id` ile `venthub_returns`'dan çözümleme
5. Monoton durum kontrolü: `requested(0) → approved(1) → in_transit(2) → received(3) → refunded(4)`
6. `venthub_returns` güncelleme
7. Audit event kaydı (`returns_webhook_events`)
8. Durum `received` olduysa → `return-status-notification` fonksiyonunu çağır

**Tablolar:** `venthub_returns` (okuma/yazma), `returns_webhook_events` (yazma), `venthub_orders` (okuma)
**Dış Çağrılar:** `return-status-notification` Edge Function, Supabase Auth Admin API
**Env:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RETURNS_WEBHOOK_SECRET`, `RETURNS_WEBHOOK_TOKEN`

---

## ÇAĞRI HARİTASI
- **Ana handler** → `hmacValid()` → imza doğrulama
- **Ana handler** → `normalizePayload()` → payload standartlaştırma
- **Ana handler** → `mapReturnStatus()` → durum haritalama
- **Ana handler** → `sha256Base64()` → audit hash
- **Ana handler** → `return-status-notification` (dış fonksiyon çağrısı)

## NODE ID STANDARD
  file: supabase/functions/returns-webhook/index.ts
  function: supabase/functions/returns-webhook/index.ts::json
  function: supabase/functions/returns-webhook/index.ts::hmacValid
  function: supabase/functions/returns-webhook/index.ts::mapReturnStatus
  function: supabase/functions/returns-webhook/index.ts::normalizePayload
  function: supabase/functions/returns-webhook/index.ts::sha256Base64
  function: supabase/functions/returns-webhook/index.ts::returns-webhook_handler

## DISA AKTARILANLAR (EXPORTS)
  export: json
  export: hmacValid
  export: mapReturnStatus
  export: normalizePayload
  export: sha256Base64
  export: returns-webhook_handler
