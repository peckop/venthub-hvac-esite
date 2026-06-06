---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\api\webhook\supabase\route.ts
skeleton_hash: fd9bb44065467f64
entity_hashes:
  func:POST: b4117100eb99acd2
  overview: f01f3fd680e913b2
generated_at: 2026-06-06T21:54:12Z
---

## Genel Bakış
Bu modül, Supabase veritabanında gerçekleşen değişiklikleri (INSERT, UPDATE, DELETE) izleyerek Next.js uygulamasının önbelleğini gerçek zamanlı olarak yeniler. Temel işlevi, veritabanı olaylarını HMAC ile güvenli bir şekilde doğrulamak ve ilgili sayfaların önbelleğini tetikleyerek kullanıcı arayüzünün güncel kalmasını sağlamaktır.

## Fonksiyon Grupları
### HTTP Webhook İşleyici
Gelen webhook isteklerini doğrulayan ve işleyen ana modül giriş noktası. HMAC imza kontrolü, payload ayrıştırma ve önbellek yenileme tetikleme süreçlerini yönetir.
- POST

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase webhook olaylarını HMAC ile doğrulayıp önbellek yenileme tetikleyen bir API route handler'dır.

**[Aksiyom 1 - HMAC Secret Zorunluluğu]:** Eğer `SUPABASE_WEBHOOK_SECRET` ortam değişkeni yoksa veya boşsa, webhook istekleri HMAC ile doğrulanamaz ve güvenlik açığı oluşur.

**[Aksiyom 2 - Request Body Zorunluluğu]:** Eğer POST request'in body içeriği yoksa veya geçerli bir JSON değilse, webhook olayı işlenemez ve istek başarısız olur.

**[Aksiyom 3 - Desteklenen Olay Türleri]:** Eğer webhook payload'ındaki `type` alanı `INSERT`, `UPDATE` veya `DELETE` değerlerinden biri değilse, olay işlenmez ve önbellek yenileme tetiklenmez.

**[Aksiyom 4 - Tablo Bazlı Önbellek Yenileme]:** Eğer webhook payload'ındaki tablo adı (`table` alanı) uygulama tarafından izlenen tablolardan biri değilse, önbellek yenileme işlemi gerçekleşmez.

**[Aksiyom 5 - HMAC İmza Doğrulama]:** Eğer gelen isteğin `x-supabase-signature` header'ı yoksa veya HMAC-SHA256 imzası SECRET ile eşleşmiyorsa, istek reddedilir (401 Unauthorized döner).

**[Aksiyom 6 -revalidationPath Haritası]:** Eğer webhook payload'ındaki tablo adı `revalidationPath` haritasında eşleşen bir anahtar içermiyorsa, hangi sayfaların yenileneceği bilinmez ve önbellek güncellenemez.

---

## FONKSİYON DETAYLARI

### POST

**Ne yapar**: Supabase veritabanından gelen webhook olaylarını alır ve Next.js'in_isr önbelleğini ilgili sayfa yollarına ve etiketlere göre yeniden doğrular (revalidate). Ürün, kategori veya stok hareketi değişikliklerinde ilgili sayfaların güncel veriyi göstermesini sağlar.

**Nasıl yapar**: Önce `x-webhook-secret` başlığını `SUPABASE_WEBHOOK_SECRET` ortam değişkeniyle karşılaştırarak HMAC/token doğrulaması yapar. Yetkili isteklerde, payload içindeki `table`, `type`, `record` ve `old_record` alanlarını çıkarır. `record` veya `old_record` içinden `tenant_id` varsa kiracıya özel (`home-data-{tenantId}`, `products-discovery-{tenantId}`) etiketleri yeniden doğrular. Ardından tablo adına göre (`products`, `categories`, `inventory_movements`) dalgalı (cascading) bir yeniden doğrulama stratejisi uygular: ürün slug'ına göre detay sayfalarını, kategori slug'ına göre kategori sayfalarını ve ilgili listeleme etiketlerini (`home-data`, `products-discovery`) yeniden doğrular. `inventory_movements` durumunda ürün ve kategori ilişkileri supabase üzerinden sorgulanarak dolaylı etkilenen sayfalar da dahil edilir. Son olarak tüm yeniden doğrulanan yolları ve etiketleri JSON yanıtıyla birlikte döner.

**Parametreler**:
- `request`: NextRequest — Gelen HTTP istek nesnesi. Supabase webhook tarafından gönderilir ve JSON payload ile `x-webhook-secret` header'ını içerir. Payload `SupabaseWebhookPayload` tipine assert edilerek `table`, `type`, `record`, `old_record` alanları çıkarılır.

**Dönüş**: `NextResponse` — Üç farklı durum döner:
- **Başarılı (200)**: `{ revalidated: true, event: { table, type }, revalidatedPaths: string[], revalidatedTags: string[], timestamp: string }` formatında yanıt döner. Yeniden doğrulanan tüm sayfa yolları ve etiket listeleri dahil edilir.
- **Kayıt bulunamadı (200)**: Payload içinde `record` ve `old_record` alanlarının her ikisi de yoksa `{ revalidated: false, message: 'No record found in payload' }` döner.
- **Hata (401 veya 500)**: Geçersiz webhook secret için `{ error: 'Unauthorized' }` (401), yakalanan beklenmedik istisnalar için `{ error: string }` (500) formatında hata yanıtı döner.

---

## INTERFACES

### SupabaseWebhookPayload
- `type: 'INSERT' | 'UPDATE' | 'DELETE'`
- `table: string`
- `schema: string`
- `record: Record<string, unknown> | null`
- `old_record: Record<string, unknown> | null`

---

## NODE ID STANDARD

  file: src\app\api\webhook\supabase\route.ts
  function: src\app\api\webhook\supabase\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST