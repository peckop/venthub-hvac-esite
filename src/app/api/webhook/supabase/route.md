---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\api\webhook\supabase\route.ts
skeleton_hash: 08b98e8e9b42745f
entity_hashes:
  func:POST: 2fcd3f5f1c25bb41
  func:hasDiscoverySensitiveChange: accd627030a7d82e
  overview: b32240b75b2cdc96
generated_at: 2026-08-15T06:32:18Z
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
**Ne yapar**: Supabase veritabanından gelen webhook isteklerini alır, tablo bazlı mantıkla ilgili sayfaları ve önbellek tag'lerini yeniden doğrulama (revalidation) işlemine tabi tutar. Bu sayede veritabanındaki değişikliklerin Next.js uygulamasına anlık olarak yansımasını sağlar.

**Nasıl yapar**: Fonksiyon, gelen HTTP POST isteğinin JSON gövdesini `SupabaseWebhookPayload` tipine dönüştürür. Önce `x-webhook-secret` başlığını kontrol ederek HMAC/Token doğrulaması yapar; eşleşmezse 401 Unauthorized yanıtı döner. Ardından payload'daki `table`, `type`, `record` ve `old_record` alanlarını çıkarır. `record` veya `old_record` mevcutsa `activeRecord` olarak kullanılır; ikisi de yoksa revalidation yapmadan yanıt döner. PS-042 kararı gereği, `inventory_movements` ve `product_prices` tablolarındaki değişimler keşif (discovery) tag'lerini tetiklemez. `products` tablosunda UPDATE işlemi yapılıyorsa ve hem `record` hem `old_record` mevcutsa `hasDiscoverySensitiveChange` fonksiyonuyla alan-bazlı karşılaştırma yapılarak sadece duyarlı alanlardaki (status, family_id, category_id, subcategory_id, deleted_at) değişikliklerde keşif tag'leri tetiklenir. Tablo tipine göre `revalidatePath` ve `revalidateTag` çağrıları yapılarak ilgili sayfa yolları ve önbellek etiketleri yeniden doğrulanır. Her tablo için farklı mantık uygulanır: `products` tablosunda ürün sayfası, kategori sayfası ve keşif tag'leri; `categories` tablosunda kategori sayfası ve keşif tag'leri; `inventory_movements` tablosunda ürün ve kategori sayfaları ile `variantStockTag` etiketi; `product_families` tablosunda aile etiketi ve keşif tag'leri; `product_prices` tablosunda ise aile kanonik PDP yolu yeniden doğrulanır. İşlem sonunda yeniden doğrulanan yolları, tag'leri ve zaman damgasını içeren JSON yanıtı döner.

**Parametreler**:
- request: NextRequest — Gelen webhook HTTP istek nesnesi. Gövdesinde Supabase'den gelen `SupabaseWebhookPayload` yapısında veri taşır ve `x-webhook-secret` başlığını içerir.

**Dönüş**: NextResponse — Başarılı olduğunda `{ revalidated: boolean, event: { table: string, type: string }, revalidatedPaths: string[], revalidatedTags: string[], discoveryComparisonSkipped: boolean, timestamp: string }` yapısında JSON yanıtı döner. Doğrulama hatası durumunda 401, sunucu hatası durumunda 500 HTTP durum koduyla hata yanıtı döner.

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
- **params**: (record: Record<string, unknown>, oldRecord: Record<string, unknown>)
- **ic_degiskenler**: 
  - `PRODUCT_DISCOVERY_SENSITIVE_FIELDS` — Outer scope sabiti: Hassas keşif alanlarının listesi (as_expression ile referans alınır)
- **Dönüş**: boolean

### [N2_NASIL] AST Pointer: src/app/api/webhook/supabase/route.ts::POST
- **params**: (request: NextRequest)
- **ic_degiskenler**:
  - `payload` — request.json() ile parse edilen Supabase webhook payload'u, `SupabaseWebhookPayload` tipine assert edilir
  - `webhookSecret` — request.headers.get('x-webhook-secret') ile alınan HMAC secret header değeri
  - `expectedSecret` — process.env.SUPABASE_WEBHOOK_SECRET'dan gelen beklenen secret değeri
  - `table` — payload'tan destructuring ile alınan tablo adı (payload.table)
  - `type` — payload'tan destructuring ile alınan event tipi (payload.type)
  - `record` — payload'tan destructuring ile alınan yeni kayıt (payload.record)
  - `old_record` — payload'tan destructuring ile alınan eski kayıt (payload.old_record)
  - `activeRecord` — record || old_record değerini alan değişken, mevcut kaydı temsil eder
  - `tenantId` — activeRecord.tenant_id alanından cast edilen kiracı ID'si (string | undefined)
  - `revalidatedPaths` — Revalidate edilen yolların toplandığı string array
  - `revalidatedTags` — Revalidate edilen tag'lerin toplandığı string array
  - `discoveryComparisonSkipped` — PS-042: products UPDATE'inde old_record yoksa alan-bazlı karşılaştırmanın atlandığını belirten boolean flag
  - `shouldRevalidateDiscovery` — Keşif tag'lerinin tetiklenip tetiklenmeyeceğini belirleyen boolean değişken (varsayılan true)
  - `productSlug` — activeRecord.slug alanından cast edilen ürün slug'ı (products tablosunda kullanılır)
  - `categoryId` — activeRecord.category_id alanından cast edilen kategori ID'si (products tablosunda kullanılır)
  - `category` — supabase.from('categories') sorgusundan dönen kategori verisi (products tablosunda kategori yolu revalidate için)
  - `categorySlug` — activeRecord.slug alanından cast edilen kategori slug'ı (categories tablosunda kullanılır)
  - `productId` — activeRecord.product_id alanından cast edilen ürün ID'si (inventory_movements ve product_prices tablolarında kullanılır)
  - `product` — supabase.from('products') sorgusundan dönen ürün verisi (inventory_movements tablosunda ürün ve kategori yolları revalidate için)
  - `familySlug` — activeRecord.slug alanından cast edilen aile slug'ı (product_families tablosunda kullanılır)
  - `family` — supabase.from('product_families') sorgusundan dönen aile verisi (product_prices tablosunda aile PDP yolu revalidate için)
  - `error` — try-catch bloğunda yakalanan hata nesnesi
  - `errorMsg` — error instanceof Error kontrolünden sonra error.message veya String(error) değeri
- **Dönüş**: NextResponse (JSON response döner: { revalidated, event, revalidatedPaths, revalidatedTags, discoveryComparisonSkipped, timestamp } veya error durumunda { error })

---

## NODE ID STANDARD

  file: src\app\api\webhook\supabase\route.ts
  function: src\app\api\webhook\supabase\route.ts::hasDiscoverySensitiveChange
  function: src\app\api\webhook\supabase\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST
  export: hasDiscoverySensitiveChange