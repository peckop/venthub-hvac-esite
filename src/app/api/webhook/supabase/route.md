---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\api\webhook\supabase\route.ts
skeleton_hash: 08b98e8e9b42745f
entity_hashes:
  func:POST: f8624b1d68b4c268
  func:hasDiscoverySensitiveChange: accd627030a7d82e
  overview: b32240b75b2cdc96
generated_at: 2026-08-13T08:57:44Z
---

## Genel Bakış
Bu modül, Supabase veritabanında gerçekleşen değişiklikleri (INSERT, UPDATE, DELETE) izleyerek bir Next.js uygulamasının sayfa önbelleğini gerçek zamanlı olarak yeniler. Temel işlevi, gelen webhook isteklerini HMAC-SHA256 imzası ile güvenli bir şekilde doğrulamak, olay türünü ve tabloyu analiz etmek ve önceden tanımlı bir haritaya göre ilgili sayfaların yeniden derlenmesini (revalidation) tetikleyerek uygulama arayüzünün güncel kalmasını sağlamaktır.

## Fonksiyon Grupları
### HTTP Webhook İşleyici
Modülün tek dışsal giriş noktasıdır. Gelen POST isteğinin HMAC imzasını doğrular, JSON payload'ını ayrıştırır ve olay türüne/ tablosuna göre önbellek yenileme sürecini başlatır.
- POST

### Değişiklik Analizi Yardımcı Fonksiyonu
Bir veritabanı kaydındaki değişikliklerin, uygulama keşif (discovery) mantığı için hassas olup olmadığını belirler. POST işleyicisi tarafından çağrılarak önbellek yenileme kararının desteklenmesine katkı sağlar.
- hasDiscoverySensitiveChange

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aksiyom üretilebilmesi için fonksiyon gövde Implementasyonları gereklidir. Verilen sadece fonks

---

## FONKSİYON DETAYLARI

### hasDiscoverySensitiveChange
**Ne yapar**: Verilen bir ürün kaydının (`record`) ve eski hali (`oldRecord`) karşılaştırılarak, keşif (discovery) süreçlerini etkileyebilecek duyarlı alanların (örn: status, family_id, category_id) değişip değişmediğini kontrol eder.
**Nasıl yapar**: `PRODUCT_DISCOVERY_SENSITIVE_FIELDS` adlı sabit bir alan listesi üzerinde `Array.some()` metodunu kullanarak, herhangi bir duyarlı alanın yeni ve eski kayıt arasındaki değerinin farklı olup olmadığını (değişim olup olmadığını) belirler. Herhangi bir fark bulunursa `true` döner.
**Parametreler**:
- `record`: `Record<string, unknown>` — Karşılaştırmaya tabi tutulacak güncel (yeni) ürün kaydı.
- `oldRecord`: `Record<string, unknown>` — Karşılaştırma için kullanılacak önceki (eski) ürün kaydı.
**Dönüş**: `boolean` — Duyarlı herhangi bir alanda fark varsa `true`, aksi halde `false`.

### POST
**Ne yapar**: Supabase veritabanından gelen webhook isteklerini (INSERT, UPDATE, DELETE) alır, doğrular ve ilgili tablodaki değişikliğe bağlı olarak Next.js uygulamasının önbelleğini (cache) yeniden doğrular (revalidate).
**Nasıl yapar**:
1. İsteğin gövdesini (`payload`) ve `x-webhook-secret` başlığını okur.
2. Ortam değişkenindeki `SUPABASE_WEBHOOK_SECRET` değeri ile gönderilen secret'ı karşılaştırarak HMAC/Token doğrulaması yapar; eşleşmezse 401 Unauthorized döner.
3. Webhook olayının (`table`, `type`, `record`, `old_record`) bilgilerini çıkarır.
4. `products` tablosunda bir `UPDATE` olayı gerçekleştiğinde, `hasDiscoverySensitiveChange` fonksiyonunu kullanarak değişikliğin keşif tag'lerini tetikleyip tetiklemeyeceğini (`shouldRevalidateDiscovery`) belirler.
5. İlgili `tenant_id` mevcutsa ve keşif tetiklemesi uygunsa, kiracıya (tenant) özel keşif ve ana sayfa verisi tag'lerini yeniden doğrular.
6. Değişikliğin olduğu tabloya göre (`products`, `categories`, `inventory_movements`, `product_families`) ilgili sayfa yollarını (`revalidatePath`) ve global tag'leri (`revalidateTag`) yeniden doğrular. Bu süreçte veritabanından ek bilgiler (ürün slug'ı, kategori slug'ı) de sorgulanabilir.
7. İşlemin sonucu, yeniden doğrulanan yollar ve tag'lerin listesi ile birlikte JSON yanıtı olarak döner. Hata oluşursa 500 döner.
**Parametreler**:
- `request`: `NextRequest` — Gelen HTTP webhook isteği nesnesi. Gövdesi ve başlıkları erişim için kullanılır.
**Dönüş**: `Promise<NextResponse>` — İşlemin sonucunu (başarı/hata, yeniden doğrulanan kaynaklar, zaman damgası) içeren JSON yanıtı. Başarılı olduğunda `{ revalidated: true, event, revalidatedPaths, revalidatedTags, discoveryComparisonSkipped, timestamp }` yapısına sahiptir.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/supabase/static::supabaseStaticClient
- import: next/cache::revalidatePath
- import: next/cache::revalidateTag
- import: next/server::NextRequest
- import: next/server::NextResponse

---

## INTERFACES

### SupabaseWebhookPayload
- `type: 'INSERT' | 'UPDATE' | 'DELETE'`
- `table: string`
- `schema: string`
- `record: Record<string, unknown> | null`
- `old_record: Record<string, unknown> | null`

---

## SABİTLER
- **PRODUCT_DISCOVERY_SENSITIVE_FIELDS** (as_expression) — `[
  'status',
  'family_id',
  'category_id',
  'subcategory_id',
  'del...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/api/webhook/supabase/route.ts::hasDiscoverySensitiveChange
- **params**: `(record: Record<string, unknown>, oldRecord: Record<string, unknown>)`
- **ic_degiskenler**:
  - `field` — `.some()` callback parametresi; PRODUCT_DISCOVERY_SENSITIVE_FIELDS dizisindeki her bir alanı temsil eder; `record[field]` ve `oldRecord[field]` ile aynı alanın eski ve yeni değerleri karşılaştırılır
- **Dict Erişimleri**:
  - `record[field]` — güncellenmiş kayıtta duyaru alanının değeri
  - `oldRecord[field]` — eski kayıtta duyaru alanının değeri
- **Dönüş**: `boolean` — herhangi bir hassas alanda değer farkı varsa `true`

### [N2_NASIL] AST Pointer: src/app/api/webhook/supabase/route.ts::POST
- **params**: `(request: NextRequest)`
- **ic_degiskenler**:
  - `payload` — `request.json()`'dan parse edilen SupabaseWebhookPayload; webhook'un gövdesi (table, type, record, old_record içerir)
  - `webhookSecret` — `request.headers.get('x-webhook-secret')` ile alınan istemci tarafı webhook secret'ı
  - `expectedSecret` — `process.env.SUPABASE_WEBHOOK_SECRET` ortam değişkeninden okunan beklenen secret değeri; HMAC/token doğrulaması için kullanılır
  - `table` — `payload.table`; hangi tablonun değiştiğini belirtir (products, categories, inventory_movements, product_families)
  - `type` — `payload.type`; tetiklenen CRUD operasyonu türü (INSERT, UPDATE, DELETE)
  - `record` — `payload.record`; yeni/üncellenmiş kayıt verisi
  - `old_record` — `payload.old_record`; UPDATE öncesi eski kayıt verisi (sadece UPDATE'lerde mevcut olabilir)
  - `activeRecord` — `record || old_record`; mevcut kayıt; record yoksa old_record'a fallback
  - `revalidatedPaths` — `string[]`; tetiklenen path revalidation'ların logunu tutar; yanıtta raporlanır
  - `revalidatedTags` — `string[]`; tetiklenen tag revalidation'ların logunu tutar; yanıtta raporlanır
  - `discoveryComparisonSkipped` — `boolean`; products UPDATE'inde old_record olmadığı için alan-bazlı karşılamanın atlandığını belirtir (PS-042)
  - `shouldRevalidateDiscovery` — `boolean`; keşif (discovery) tag'lerinin tetiklenip tetiklenmeyeceğini kontrol eder; inventory_movements'ta `false`, products UPDATE'te hassas alan değişimine bağlı
  - `tenantId` — `activeRecord.tenant_id as string | undefined`; kiracı (tenant) identifier'ı; tag revalidation'ları tenant-scoped yapmak için kullanılır
  - `productSlug` (products bloğu) — `activeRecord.slug as string | undefined`; ürünün URL slug'ı; ürün detay sayfalarının path revalidation'ı için kullanılır
  - `categoryId` — `activeRecord.category_id as string | undefined`; ürünün bağlı olduğu kategori ID'si; ilgili kategori sayfalarının revalidation'ı için kullanılır
  - `category` — `supabase.from('categories').select('slug').eq('id', categoryId).single()` sonucu; kategori slug bilgisini içerir; kategori path revalidation'ı için kullanılır
  - `categorySlug` (categories bloğu) — `activeRecord.slug as string | undefined`; kategorinin URL slug'ı; kategori sayfalarının path revalidation'ı için kullanılır
  - `productId` — `activeRecord.product_id as string | undefined`; stok hareketinin ait olduğu ürün ID'si; ürün ve kategori sayfalarının revalidation'ı için kullanılır
  - `product` — `supabase.from('products').select('slug, category_id').eq('id', productId).single()` sonucu; ürünün slug ve category_id bilgilerini içerir
  - `productSlug` (inventory_movements bloğu) — `product.slug`; stok hareketine ait ürünün URL slug'ı
  - `category` (inventory_movements bloğu) — `supabase.from('categories').select('slug').eq('id', product.category_id).single()` sonucu; stok hareketine ait ürünün kategori slug bilgisi
  - `familySlug` — `activeRecord.slug as string | undefined`; ürün ailesinin URL slug'ı; aile-specific tag revalidation'ı için kullanılır
  - `errorMsg` — catch bloğunda `error instanceof Error ? error.message : String(error)` ile elde edilen hata mesajı; 500 yanıtı gövdesine yazılır
- **Dict/Subscript Erişimleri**:
  - `process.env.SUPABASE_WEBHOOK_SECRET` — ortam değişkeninden webhook secret okunması
  - `request.headers.get('x-webhook-secret')` — istek header'ından webhook secret alınması
  - `activeRecord.tenant_id` — aktif kayıttan tenant ID erişimi
  - `activeRecord.slug` — aktif kayıttan slug erişimi (products, categories, product_families bloklarında)
  - `activeRecord.category_id` — aktif kayıttan kategori ID erişimi (products bloğunda)
  - `activeRecord.product_id` — aktif kayıttan ürün ID erişimi (inventory_movements bloğunda)
  - `payload.table`, `payload.type`, `payload.record`, `payload.old_record` — webhook payload alan erişimleri
- **API Çağrıları**:
  - `request.json()` — webhook isteğinin gövdesini JSON olarak parse eder
  - `request.headers.get('x-webhook-secret')` — HTTP header değerini okur
  - `supabase.from('categories').select('slug').eq('id', categoryId).single()` — kategori tablosundan slug bilgisini çeker (products bloğunda)
  - `supabase.from('products').select('slug, category_id').eq('id', productId).single()` — ürün tablosundan slug ve category_id bilgisini çeker (inventory_movements bloğunda)
  - `supabase.from('categories').select('slug').eq('id', product.category_id).single()` — kategori tablosundan slug bilgisini çeker (inventory_movements bloğunda, ürünün kategorisi için)
  - `revalidatePath(...)` — Next.js path cache'ini invalidade eder (ürün/kategori sayfaları)
  - `revalidateTag(...)` — Next.js tag cache'ini invalidade eder (homeData, discovery, products_discovery, variantStock, family tag'leri)
  - `homeDataTag(tenantId)` — tenant-scoped ana sayfa verisi tag'i üretir
  - `discoveryTag(tenantId)` — tenant-scoped keşif tag'i üretir
  - `familyTag(familySlug)` — aile-specific tag üretir
  - `variantStockTag()` — varyant stok tag'i üretir
  - `NextResponse.json(...)` — HTTP yanıt gövdesi oluşturur
  - `console.warn(...)`, `console.error(...)` — konsol çıktıları (logging)
- **Dönüş**: `NextResponse` — başarılıysa revalidation detaylarını (revalidated, event, revalidatedPaths, revalidatedTags, discoveryComparisonSkipped, timestamp) içeren JSON 200 yanıtı; yetkisizse 401; hata durumunda 500 yanıtı döner

---

## NODE ID STANDARD

  file: src\app\api\webhook\supabase\route.ts
  function: src\app\api\webhook\supabase\route.ts::hasDiscoverySensitiveChange
  function: src\app\api\webhook\supabase\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST
  export: hasDiscoverySensitiveChange