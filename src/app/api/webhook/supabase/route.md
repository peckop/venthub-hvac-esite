---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\api\webhook\supabase\route.ts
skeleton_hash: 3fb60d8dc42d092a
entity_hashes:
  func:POST: 17511211b7d3cb76
  overview: f1a5a31fe18cb8c0
generated_at: 2026-05-28T22:35:25Z
---

## Genel Bakış
Bu modül, Supabase veritabanından gelen webhook olaylarını (INSERT, UPDATE, DELETE) HMAC ile doğrulayarak, Next.js uygulamasının önbelleğini (cache) ilgili sayfalar ve veriler için anlık olarak tetikler ve yeniler. Temel amacı, veritabanındaki değişikliklerin kullanıcı arayüzünde hemen görünür olmasını sağlamaktır.

## Fonksiyon Grupları
### HTTP Metodları ve Olay İşleme
Gelen webhook isteklerini karşılayan ve doğrulama, veri analizi ile önbellek yenileme adımlarını sırasıyla gerçekleştiren ana işleyici.
- POST

---



---

## FONKSİYON DETAYLARI

### POST
**Ne yapar**: Supabase webhook olaylarını alır, yetkilendirme doğruluğunu kontrol eder ve etkilenen sayfaların / etiketlerin Next.js önbelleklerini yeniden doğrulayarak içeriğin güncel kalmasını sağlar. Bu fonksiyon, Supabase veritabanındaki `products`, `categories` ve `inventory_movements` tablolarındaki değişiklikleri dinleyerek ilgili sayfaların yeniden render edilmesini tetikler.

**Nasıl yapar**: Fonksiyon首先 istek gövdesinden JSON payload'ı çıkarır ve `x-webhook-secret` başlığını `SUPABASE_WEBHOOK_SECRET` ortam değişkeniyle karşılaştırarak HMAC/Token tabanlı bir yetkilendirme doğrulaması yapar. Yetkilendirme başarısız olursa 401 döner. Ardından payload içindeki `table`, `type`, `record` ve `old_record` alanlarını analiz eder. `products` tablosu için ürün slug'ına göre hem Türkçe hem İngilizce ürün detay sayfalarını, hem de `products-discovery` ve `home-data` etiketlerini yeniden doğrular; ayrıca ürünün ait olduğu kategori sayfasını da yeniler. `categories` tablosu için kategori slug'ına göre ilgili dildeki kategori sayfalarını ve listings etiketlerini yeniler. `inventory_movements` tablosu için önce `product_id` üzerinden products tablosuna, ardından `category_id` üzerinden categories tablosuna ilişkisel sorgular yaparak etkilenen tüm ürün ve kategori sayfalarını yeniden doğrular. İşlem sonunda yeniden doğrulanan yolları ve etiketleri JSON olarak döner.

**Parametreler**:
- `request`: `NextRequest` — Gelen HTTP POST isteği. Supabase webhook tarafından tetiklenir. Gövdesinde `SupabaseWebhookPayload` tipinde JSON veri taşır ve `x-webhook-secret` başlığını içerir.

**Dönüş**: `NextResponse` — Üç farklı durumda yanıt döner:
- Başarılı webhook işlenmesinde: `200` durum koduyla `{ revalidated: true, event: { table, type }, revalidatedPaths: string[], revalidatedTags: string[], timestamp: string }` nesnesi.
- Kayıt bulunamaması durumunda: `200` durum koduyla `{ revalidated: false, message: 'No record found in payload' }`.
- Yetkilendirme hatasında: `401` durum koduyla `{ error: 'Unauthorized' }`.
- Sunucu hatasında: `500` durum koduyla `{ error: string }` (hata mesajı ile birlikte).

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

### [N1_NASIL] AST Pointer: `src/app/api/webhook/supabase/route.ts`::POST
- **params**: `request: NextRequest` — gelen HTTP webhook isteği, JSON payload ve header'lar içerir
- **ic_degiskenler**:
  - `payload` — Supabase'den gelen webhook JSON body'si, `type`, `table`, `record`, `old_record` alanlarını içerir
  - `webhookSecret` — `request.headers.get('x-webhook-secret')` ile okunan istek header'ındaki secret değeri
  - `expectedSecret` — `process.env.SUPABASE_WEBHOOK_SECRET` ortam değişkeninden gelen beklenen secret, HMAC/token doğrulaması için kullanılır
  - `table` — payload'tan destructure edilen tablo adı (`'products'`, `'categories'`, `'inventory_movements'` olabilir)
  - `type` — payload'tan destructure edilen event tipi (INSERT, UPDATE, DELETE vb.)
  - `record` — payload'tan destructure edilen yeni kaydı temsil eder, INSERT/UPDATE durumunda dolu olur
  - `old_record` — payload'tan destructure edilen eski kaydı temsil eder, DELETE/UPDATE durumunda dolu olur
  - `activeRecord` — `record || old_record` mantıksal birleşimi; hangisi varsa onu kullanır, subsequent lookup'larda ürün/kategori bilgileri buradan okunur
  - `revalidatedPaths` — `string[]` dizisi, yeniden doğrulanan URL path'lerini toplar ve yanıt döner
  - `revalidatedTags` — `string[]` dizisi, yeniden doğrulanan cache tag'lerini toplar ve yanıt döner
  - `productSlug` — `activeRecord.slug` (`products` tablosunda), ürün detay sayfalarının yeniden doğrulanmasında kullanılır
  - `categoryId` — `activeRecord.category_id` (`products` tablosunda), ürünün ait olduğu kategoriyi bulmak için kullanılır
  - `category` — `supabase.from('categories').select('slug').eq('id', categoryId).single()` sorgusundan dönen kategori kaydı, `category.slug` ile kategori path'i yeniden doğrulanır
  - `categorySlug` — `activeRecord.slug` (`categories` tablosunda), kategori sayfalarının yeniden doğrulanmasında kullanılır
  - `productId` — `activeRecord.product_id` (`inventory_movements` tablosunda), stok hareketinin ait olduğu ürün ID'si
  - `product` — `supabase.from('products').select('slug, category_id').eq('id', productId).single()` sorgusundan dönen ürün kaydı; `product.slug` ile ürün sayfası, `product.category_id` ile ilgili kategori sayfası yeniden doğrulanır
  - `errorMsg` — catch bloğunda `error instanceof Error ? error.message : String(error)` dönüşümü ile elde edilen hata mesajı metni
  - `error` — try-catch yakalanan hata nesnesi
- **Dönüş**: `NextResponse.json(...)` — webhook başarıyla işlendiğinde `{ revalidated: true, event, revalidatedPaths, revalidatedTags, timestamp }` nesnesi; yetkisiz erişimde 401; payload'ta kayıt yoksa `{ revalidated: false, message }` döner; hata durumunda 500 ile `{ error: errorMsg }` döner. Yan etki olarak `revalidatePath` ve `revalidateTag` çağrılarıyla Next.js cache'ini invalid eder.

---

## NODE ID STANDARD

  file: src\app\api\webhook\supabase\route.ts
  function: src\app\api\webhook\supabase\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST