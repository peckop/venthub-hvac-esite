---
domain: general
source_type: doc
namespace_type: module
source_path: src/app/api/webhook/supabase/route.ts
generated_at: 2026-05-28T07:31:00Z
---

## Genel Bakış
Supabase Webhook Route Handler'ı, veritabanında meydana gelen `INSERT`, `UPDATE` ve `DELETE` olaylarını HMAC doğrulaması ile güvenli bir şekilde yakalayarak, Edge-CDN üzerindeki Next.js `unstable_cache` ve `revalidatePath` önbelleklerini anlık olarak tetikleyen dinamik bir API uç noktasıdır.

## Fonksiyon Grupları
### HTTP Metotları
İstekleri karşılayan ve işleyen ana HTTP handler'ı.
- POST

---

## AXIOMS – Mimari Varsayımlar
Bu API rotasının çalışması için Supabase veritabanı tetikleyicilerinin ve çevresel HMAC anahtarının tanımlı olması gerekir.

[Aksiyom 1]: `SUPABASE_WEBHOOK_SECRET` çevresel değişkeni tanımlı olmalıdır, aksi takdirde gelen istekler 401 yetkisiz hatasıyla reddedilir.
[Aksiyom 2]: Tetiklenen olaylar `products`, `categories` veya `inventory_movements` tablolarına ait olmalıdır, aksi takdirde herhangi bir cache geçersiz kılma tetiklenmez.
[Aksiyom 3]: İsteklerin başlığında `x-webhook-secret` doğrulaması bulunmalıdır, aksi takdirde güvenlik bypass riski oluşur.

---

## FONKSİYON DETAYLARI

### POST
**Ne yapar**: Supabase veritabanından gelen webhook payload'unu doğrular ve ilgili tablolar için path/tag revalidation işlemlerini gerçekleştirir.  
**Nasıl yapar**: 
- Gelen HMAC imzasını (`x-webhook-secret`) doğrular.
- Payload içindeki `table` ve `type` parametrelerini analiz eder.
- `products` tablosu için: Dil bazlı ürün yollarını ve `products-discovery` / `home-data` etiketlerini revalidate eder.
- `categories` tablosu için: Kategori yollarını ve `home-data` etiketlerini revalidate eder.
- `inventory_movements` tablosu için: Stok hareketine bağlı ürün ve kategori yollarını revalidate eder.
**Dönüş**: Revalidate edilen yolların ve etiketlerin listesini içeren JSON yanıtı.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/api/webhook/supabase/route.ts::POST
- **params**:
  - `request` — Gelen NextRequest nesnesi.
- **ic_degiskenler**:
  - `payload` — Supabase tetikleyici payload'u.
  - `webhookSecret` — İstek başlığından alınan HMAC sırrı.
  - `expectedSecret` — Sunucuda tanımlı beklenen webhook sırrı.
- **Dönüş**: NextResponse

---

## NODE ID STANDARD

  file: src\app\api\webhook\supabase\route.ts
  function: src\app\api\webhook\supabase\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST
  export: dynamic = 'force-dynamic'
