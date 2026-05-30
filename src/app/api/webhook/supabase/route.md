---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\api\webhook\supabase\route.ts
skeleton_hash: 3fb60d8dc42d092a
entity_hashes:
  func:POST: 419057af1299b48a
  overview: f1a5a31fe18cb8c0
generated_at: 2026-05-30T20:23:41Z
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
**Ne yapar**: Supabase veritabanında gerçekleşen değişiklikleri (INSERT, UPDATE, DELETE) bir webhook aracılığıyla alır ve Next.js uygulamasında ilgili sayfaların ve veri önbelleklerinin yeniden doğrulanmasını (revalidation) sağlar. Bu sayede, veritabanındaki güncellemeler kullanıcıya en kısa sürede yansır.

**Nasıl yapar**: Fonksiyon, istek gövdesinden gelen webhook payload'ını analiz eder. Önce `x-webhook-secret` header'ı ile bir HMAC gizli anahtar doğrulaması yaparak isteğin yetkili kaynaktan geldiğinden emin olur. Ardından payload içindeki `table` ve `record` bilgilerine göre belirlenen mantıkla, `products`, `categories` veya `inventory_movements` tablolarındaki değişikliklere karşılık gelen sayfa yollarını (`revalidatePath`) ve veri etiketlerini (`revalidateTag`) yeniden doğrular. İşlem başarılıysa yeniden doğrulanan yolların ve etiketlerin listesini içeren bir JSON yanıtı döner; bir hata oluşursa hata mesajı ile birlikte 500 durum kodu döner.

**Parametreler**:
- `request`: NextRequest — Supabase webhook'undan gelen HTTP isteği. Gövdesinde `table`, `type`, `record`, `old_record` alanlarını içeren JSON verisi ve `x-webhook-secret` başlığı barındırır.

**Dönüş**: `NextResponse` — Başarılıysa `{ revalidated: boolean, event: { table: string, type: string }, revalidatedPaths: string[], revalidatedTags: string[], timestamp: string }` yapısında bir JSON yanıtı ve 200 durum kodu döner. HMAC doğrulaması başarısız olursa `{ error: string }` ile 401,(payload'da aktif kayıt yoksa `{ revalidated: boolean, message: string }` ile 200, başka bir hata oluşursa `{ error: string }` ile 500 durum kodu döner.

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
- **params**: `request: NextRequest` — Next.js tarafından otomatik oluşturulan HTTP istek nesnesi
- **ic_degiskenler**:
  - `payload` — request.json() ile parse edilen Supabase webhook payload'u; `type`, `table`, `record`, `old_record` alanlarını içerir (SupabaseWebhookPayload tipinde)
  - `webhookSecret` — request header'ından okunan `x-webhook-secret` değeri, HMAC/Token doğrulaması için kullanılır
  - `expectedSecret` — `process.env.SUPABASE_WEBHOOK_SECRET` ortam değişkeninden okunan beklenen secret değeri, webhook'un güvenliğini doğrulamak için kullanılır
  - `table` — payload'dan destructure edilen tablo adı (örn: "products", "categories", "inventory_movements")
  - `type` — payload'dan destructure edilen event türü (INSERT, UPDATE, DELETE vb.)
  - `record` — payload'dan destructure edilen yeni kayıt verisi (INSERT/UPDATE durumunda mevcut)
  - `old_record` — payload'dan destructure edilen önceki kayıt verisi (UPDATE/DELETE durumunda mevcut)
  - `activeRecord` — record veya old_record'dan hangisi mevcutsa onu tutan değişken; payload'tan alınan geçerli kaydı temsil eder
  - `tenantId` — activeRecord.tenant_id alanından türetilen kiracı ID'si; kiracıya özel cache tag'lerini revalidate etmek için kullanılır
  - `revalidatedPaths` — string dizisi; fonksiyon süresince revalidate edilen tüm path'lerin toplandığı dizi, yanıt olarak döndürülür
  - `revalidatedTags` — string dizisi; fonksiyon süresince revalidate edilen tüm tag'lerin toplandığı dizi, yanıt olarak döndürülür
  - `productSlug` (products bloğu içinde) — activeRecord.slug alanından türetilen ürün slug'ı; ürün detay sayfalarının path revalidation'ı için kullanılır
  - `categoryId` — activeRecord.category_id alanından türetilen kategori ID'si; ürünün bağlı olduğu kategoriyi bulmak ve o kategorinin sayfalarını revalidate etmek için kullanılır
  - `category` — `supabase.from('categories').select('slug').eq('id', categoryId).single()` sorgusundan dönen kategori nesnesi; sadece `category?.slug` alanı kullanılır
  - `categorySlug` (categories bloğu içinde) — activeRecord.slug alanından türetilen kategori slug'ı; kategori sayfalarının path revalidation'ı için kullanılır
  - `productId` — activeRecord.product_id alanından türetilen ürün ID'si; stok hareketinin hangi ürüne ait olduğunu belirtir
  - `product` — `supabase.from('products').select('slug, category_id').eq('id', productId).single()` sorgusundan dönen ürün nesnesi; `product.slug` ve `product.category_id` alanları kullanılır
  - `productSlug` (inventory_movements bloğu içinde) — product.slug alanından türetilen ürün slug'ı; stok değişikliğinde ürün detay sayfalarının revalidation'ı için kullanılır
  - `category` (inventory_movements bloğu içinde, iç) — `supabase.from('categories').select('slug').eq('id', product.category_id).single()` sorgusundan dönen kategori nesnesi; ürünün bağlı olduğu kategorinin slug'ını almak için kullanılır
  - `errorMsg` — catch bloğunda error nesnesinden çıkarılan hata mesajı string'i; Error ise `error.message`, değilse `String(error)` kullanılır
- **Dönüş**: `NextResponse` —成功 durumunda `{ revalidated: true, event: { table, type }, revalidatedPaths, revalidatedTags, timestamp }` JSON'u (200); auth başarısızlığında `{ error: 'Unauthorized' }` (401); payload'ta kayıt yoksa `{ revalidated: false, message: 'No record found in payload' }` (200); hata yakalandığında `{ error: errorMsg }` (500)
- **Yan Etkiler**: `revalidatePath()` ve `revalidateTag()` çağrıları ile Next.js cache'ini invalidates eder; `console.warn` ve `console.error` ile loglama yapar; Supabase'den kategori/ürün sorgulaması yapar

---

## NODE ID STANDARD

  file: src\app\api\webhook\supabase\route.ts
  function: src\app\api\webhook\supabase\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST