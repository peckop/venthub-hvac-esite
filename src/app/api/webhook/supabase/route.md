---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\api\webhook\supabase\route.ts
skeleton_hash: 3fb60d8dc42d092a
entity_hashes:
  func:POST: b4117100eb99acd2
  overview: f1a5a31fe18cb8c0
generated_at: 2026-05-30T21:35:25Z
---

## Genel Bakış
Bu modül, Supabase veritabanından gelen webhook olaylarını (INSERT, UPDATE, DELETE) HMAC ile doğrulayarak, Next.js uygulamasının önbelleğini (cache) ilgili sayfalar ve veriler için anlık olarak tetikler ve yeniler. Temel amacı, veritabanındaki değişikliklerin kullanıcı arayüzünde hemen görünür olmasını sağlamaktır.

## Fonksiyon Grupları
### HTTP Metodları ve Olay İşleme
Gelen webhook isteklerini karşılayan ve doğrulama, veri analizi ile önbellek yenileme adımlarını sırasıyla gerçekleştiren ana işleyici.
- POST

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase webhook olaylarını HMAC ile doğrulayıp önbellek yenileme tetikleyen bir API route handler'dır.

**[Aksiyom 1 - HMAC Secret Yapılandırması]:** Eğer `SUPABASE_WEBHOOK_SECRET` (veya HMAC doğrulama için kullanılan gizli anahtar) ortam değişkeni (env) olarak tanımlı yoksa, webhook imza doğrulaması başarısız olur ve tüm istekler reddedilir.

**[Aksiyom 2 - İstek Başlıkları]:** Eğer gelen POST isteğinin header'larında Supabase tarafından eklenen imza başlığı (örn: `x-webhook-signature`, `authorization` veya benzeri HMAC imza başlığı) yoksa, istek yetkisiz kabul edilerek 401/403 döner ve işlenmez.

**[Aksiyom 3 - İstek Body Yapısı]:** Eğer gelen POST isteğinin body'si geçerli bir JSON değilse veya Supabase webhook payload yapısına (tablo adı, operasyon türü, kayıt verisi) uygun structure içermiyorsa, payload ayrıştırma hatası oluşur ve istek işlenemez.

**[Aksiyom 4 - HMAC Doğrulama]:** Eğer isteğin imzası, beklenen HMAC algoritması ile doğrulanamıyorsa (secret eşleşmiyor veya imza geçersizse), istek reddedilir ve 401/403 yanıtı döner; hiçbir önbellek yenileme tetiklenmez.

**[Aksiyom 5 - Revalidation Mekanizması]:** Eğer Next.js revalidation endpoint'i (`/api/revalidate` veya karşılık gelen mekanizma) aktif ve erişilebilir değilse, webhook isteği doğrulanmış olsa bile etkilenen sayfaların önbelleği yenilenemez ve kullanıcı arayüzünde veri tutarsızlığı oluşur.

**[Aksiyom 6 - Tablo-URL Eşleme Tanımları]:** Eğer webhook'tan gelen tablo adı ile yenilenecek sayfa/etiket yolları (revalidation path'leri) arasında bir eşleme (mapping) tanımlı değilse, hangi sayfaların yenileneceği bilinemez ve ilgili önbellekler eski verilerle kalır.

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