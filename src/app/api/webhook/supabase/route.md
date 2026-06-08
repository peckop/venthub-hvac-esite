---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\api\webhook\supabase\route.ts
skeleton_hash: 2fd2103c27a09b70
entity_hashes:
  func:POST: b4117100eb99acd2
  overview: f01f3fd680e913b2
generated_at: 2026-06-08T10:08:11Z
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

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/api/webhook/supabase/route.ts::POST

- **params**:
  - `request: NextRequest` — Next.js tarafından sağlanan HTTP istek nesnesi, webhook payload'ını ve header'ları barındırır

- **ic_degiskenler**:
  - `payload` — `request.json()` ile parse edilen JSON gövdesi, `SupabaseWebhookPayload` tipinde; tablo adı, event türü, kayıt verilerini içerir
  - `webhookSecret` — `request.headers.get('x-webhook-secret')` ile alınan, istemcinin gönderdiği webhook doğrulama token'ı
  - `expectedSecret` — `process.env.SUPABASE_WEBHOOK_SECRET` ortam değişkeninden okunan, sunucuda beklenen geçerli secret değeri
  - `table` — `payload`'dan destructured; hangi veritabanı tablosunda değişim olduğunu belirtir (`'products'`, `'categories'`, `'inventory_movements'`)
  - `type` — `payload`'dan destructured; event türünü belirtir (`INSERT`, `UPDATE`, `DELETE`)
  - `record` — `payload`'dan destructured; insert/update sonrası yeni kayıt verisi (nullable)
  - `old_record` — `payload`'dan destructured; update/delete öncesi eski kayıt verisi (nullable)
  - `activeRecord` — `record || old_record` ifadesinden türetilen; mevcut olan kaydı tutar, `record` varsa onu, yoksa `old_record`'u kullanır
  - `tenantId` — `activeRecord.tenant_id` erişiminden elde edilen kiracı (tenant) tanımlayıcısı string; tenant'a özel tag revalidation'ları için kullanılır
  - `revalidatedPaths` — `string[]` tipinde dizi; fonksiyon boyunca revalidate edilen tüm URL path'lerinin toplandığı akümülatör listesi
  - `revalidatedTags` — `string[]` tipinde dizi; fonksiyon boyunca revalidate edilen tüm cache tag'lerinin toplandığı akümülatör listesi
  - `productSlug` (products dalı) — `activeRecord.slug` erişiminden elde edilen ürün slug'ı; ürün detay sayfalarının path revalidation'ı için kullanılır
  - `categoryId` — `activeRecord.category_id` erişiminden elde edilen kategori ID'si; ürünün ait olduğu kategoriyi bulmak için Supabase sorgusunda kullanılır
  - `category` — `supabase.from('categories').select('slug').eq('id', categoryId).single()` sorgusunun `data` alanından destructured; kategori nesnesi, `category.slug` erişimi ile kategori path revalidation'ı yapılır
  - `categorySlug` (categories dalı) — `activeRecord.slug` erişiminden elde edilen kategori slug'ı; kategori sayfalarının path revalidation'ı için kullanılır
  - `productId` — `activeRecord.product_id` erişiminden elde edilen ürün ID'si; envanter hareketinin ait olduğu ürünü bulmak için Supabase sorgusunda kullanılır
  - `product` — `supabase.from('products').select('slug, category_id').eq('id', productId).single()` sorgusunun `data` alanından destructured; ürün nesnesi, `product.slug` ve `product.category_id` erişimleri yapılır
  - `productSlug` (inventory_movements dalı) — `product.slug` erişiminden elde edilen ürün slug'ı; ürün detay sayfalarının path revalidation'ı için kullanılır
  - `category` (inventory_movements dalı) — `supabase.from('categories').select('slug').eq('id', product.category_id).single()` sorgusunun `data` alanından destructured; ürünün bağlı olduğu kategorinin slug bilgisini içerir
  - `errorMsg` — catch bloğunda `error instanceof Error ? error.message : String(error)` ifadesinden türetilen; hata mesajının string karşılığı, 500 yanıt gövdesine yazılır

- **Supabase API Çağrıları**:
  - `supabase.from('categories').select('slug').eq('id', categoryId).single()` — products dalında, ürünün kategori slug'ını çekmek için
  - `supabase.from('products').select('slug, category_id').eq('id', productId).single()` — inventory_movements dalında, envanter hareketinin ait olduğu ürünün slug ve kategori bilgisini çekmek için
  - `supabase.from('categories').select('slug').eq('id', product.category_id).single()` — inventory_movements dalında, ürünün bağlı olduğu kategorinin slug'ını çekmek için

- **Dönüş**: `NextResponse` — Üç farklı durumda döner:
  1. Başarılı webhook işleminde: `{ revalidated: true, event: { table, type }, revalidatedPaths, revalidatedTags, timestamp }` gövdeli 200 yanıtı
  2. Yetkisiz istekte (secret eşleşmiyor): `{ error: 'Unauthorized' }` gövdeli 401 yanıtı
  3. Hata yakalandığında: `{ error: errorMsg }` gövdeli 500 yanıtı
  - Yan etkiler: `revalidatePath()` ve `revalidateTag()` çağrıları ile Next.js ISR cache'ini invalidation eder

---

## NODE ID STANDARD

  file: src\app\api\webhook\supabase\route.ts
  function: src\app\api\webhook\supabase\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST