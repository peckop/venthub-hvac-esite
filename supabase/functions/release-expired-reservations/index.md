---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\release-expired-reservations\index.ts
skeleton_hash: 7b8da6bd0f25e4d8
entity_hashes:
  func:release-expired-reservations_handler: 2ee83a2fc9a11645
  overview: d6e6683c81c36dd3
generated_at: 2026-05-29T11:47:19Z
---

## Genel Bakış
Bu modül, süresi dolmuş rezervasyonları otomatik olarak serbest bırakan bir Supabase Edge Function'dır. Gelen HTTP istekleri aracılığıyla tetiklenerek veritabanındaki geçerlilik süresi dolan rezervasyon kayıtlarını tespit eder, bunların durumunu günceller ve ilişkili kaynakların yeniden kullanıma açılmasını sağlar.

## Fonksiyon Grupları

### HTTP İstek İşleyici
Tek bir HTTP endpoint üzerinden dışarıya açılan giriş noktasıdır; isteği alır, iş mantığını koordine eder ve sonucu yanıt olarak döner.
- release-expired-reservations_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Supabase Edge Functions ortamında HTTP tabanlı bir istek işleyicisi olarak yapılandırılmıştır.

[Aksiyom 1]: Eğer geçerli bir HTTP `Request` nesnesi (req parametresi) sağlanmazsa, fonksiyon başlatılamaz ve HTTP yanıtı üretilemez.

[Aksiyom 2]: Eğer `corsHeaders` sabiti (object) tanımlı değilse veya boş/eksik ise, istemcilere döndürülen HTTP yanıtlarında CORS başlıkları eksik kalır ve tarayıcı tarafı istekleri engellenebilir.

[Aksiyom 3]: Eğer Supabase Edge Functions çalışma ortamı (runtime) mevcut değilse, bu fonksiyon çalıştırılamaz — fonksiyon imzası `Request` tipine bağımlıdır.

[Aksiyom 4]: Eğer Supabase veritabanı bağlantısı (edge function ortamında otomatik sağlanan) erişilebilir durumda değilse, rezervasyon kayıtları sorgulanamaz ve süresi dolmuş kayıtlar tespit edilemez.

---

## FONKSİYON DETAYLARI

### release-expired-reservations_handler

**Ne yapar**: Süresi dolmuş rezervasyonları serbest bırakan HTTP istek işleyicisidir. Bu fonksiyon, belirli bir zaman dilimi içinde kullanılmamış veya son kullanma tarihi geçmiş rezervasyonları tespit edip iptal ederek ilgili kaynakları tekrar müsait hale getirir.

**Nasıl yapar**: Fonksiyon, bir Supabase Edge Function olarak HTTP isteklerini karşılar. Gelen isteği işler ve süresi dolmuş rezervasyonları veritabanında bulup serbest bırakma işlemini gerçekleştirir. İşlem sonucunda HTTP yanıt döndürür.

**Parametreler**:
- `req`: Request — Gelen HTTP istek nesnesi. İstek ile ilgili bilgileri (metot, gövde, başlıklar vb.) içerir ve fonksiyonun çalıştırılması için gerekli parametreleri taşır.

**Dönüş**: Response — İşlem sonucuna göre HTTP yanıt nesnesi döndürür. Başarı veya hata durumunu belirten durum kodu ve opsiyonel mesaj içerebilir.

---

## INTERFACES

### InventorySettings
- `reservation_timeout_hours: number`

### ExpiredOrder
- `id: string`
- `order_number: string | null`

### OrderItem
- `product_id: string`
- `quantity: number`

---

## SABİTLER
- **corsHeaders** (object) — `{
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, c...`

---

## NODE ID STANDARD

  file: supabase\functions\release-expired-reservations\index.ts
  function: supabase\functions\release-expired-reservations\index.ts::release-expired-reservations_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: release-expired-reservations_handler