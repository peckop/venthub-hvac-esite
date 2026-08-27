---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\supabase\functions\_shared\cors.ts
skeleton_hash: 77b5503d4a2f1053
entity_hashes:
  func:getCorsHeaders: 73642dabf029645c
  overview: 8eaad34e6f15ad7c
generated_at: 2026-08-27T07:09:10Z
---

## Genel Bakış
Bu modül, Cross-Origin Resource Sharing (CORS) politikalarını uygulamak için gerekli HTTP başlıklarını yönetir. Modül, gelen isteklere göre uygun CORS başlıklarını oluşturarak çapraz kaynak erişimlerini kontrol eder. Tek bir fonksiyonla bu sorumluluğu yerine getirir.

## Fonksiyon Grupları
### CORS Başlık Üretimi
Bu grup, gelen HTTP isteğini analiz ederek tarayıcının çapraz kaynak isteklerini kabul etmesi için gerekli başlıkları üretir.
- getCorsHeaders

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, `getCorsHeaders` fonksiyonunun çalışma mantığı bilinmemektedir. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebilir.

---

## FONKSİYON DETAYLARI

### getCorsHeaders
**Ne yapar**: Gelen HTTP isteğinin `Origin` başlığını kontrol ederek uygun CORS (Cross-Origin Resource Sharing) başlıklarını oluşturan ve döndüren bir fonksiyondur. İzin verilen kaynaklardan gelen isteklerde gerçek origin kullanılırken, diğer kaynaklardan gelen istekler için varsayılan bir Vercel domain adresi atanır.

**Nasıl yapar**: Fonksiyon öncelikle isteğin `Origin` başlığını okur; başlık yoksa boş string kullanır. Ardından bu origin'in `http://localhost:` ile başlayıp başlamadığını (`isLocal`) ve `.vercel.app` ile bitip bitmediğini (`isVercel`) kontrol eder. Bu iki koşuldan herhangi biri sağlanırsa origin izinli kabul edilir ve `Access-Control-Allow-Origin` olarak gerçek origin değeri atanır; sağlanmazsa sabit değer `https://venthub-hvac-esite.vercel.app` kullanılır. Ayrıca sabit CORS başlıkları olarak `authorization, x-client-info, apikey, content-type` izin verilen başlıklar, `POST, GET, OPTIONS, PUT, DELETE` izin verilen HTTP metodları ve `86400` saniye (24 saat) önbellek süresi tanımlanır.

**Parametreler**:
- `req`: `Request` — CORS başlıklarının belirlenmesi için kullanılan gelen HTTP isteği nesnesi. Fonksiyon bu nesnenin `headers` özelliğinden `Origin` başlığını okur.

**Dönüş**: Dört anahtar-değer çiftinden oluşan bir nesne döndürür. Bu nesne; `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods` ve `Access-Control-Max-Age` CORS başlıklarını içerir. Dönüş tipi kod üzerinde açıkça belirtilmemiştir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/_shared/cors.ts::getCorsHeaders
- **params**:
  - `req` — Request nesnesi; tarayıcıdan gelen HTTP isteğini temsil eder
- **ic_degiskenler**:
  - `origin` — `req.headers.get('Origin')` ile alınan istek kaynağının Origin header değeri; header yoksa boş string atanır
  - `isLocal` — `origin` değişkeninin `http://localhost:` ile başlayıp başlamadığını kontrol eden boolean; yerel geliştirme ortamından gelen istekleri belirler
  - `isVercel` — `origin` değişkeninin `.vercel.app` ile bitip bitmediğini kontrol eden boolean; Vercel üzerindeki deployment'lardan gelen istekleri belirler
  - `allowed` — `isLocal` veya `isVercel` değerlerinden herhangi biri true ise true olan boolean; istek kaynağının izin verilen bir origin olup olmadığını belirler
- **Dönüş**: Obje — CORS header'larını içeren bir nesne döndürür:
  - `Access-Control-Allow-Origin` — `allowed` true ise gelen `origin` değeri, false ise sabit `'https://venthub-hvac-esite.vercel.app'` atanır
  - `Access-Control-Allow-Headers` — sabit değer: `'authorization, x-client-info, apikey, content-type'`
  - `Access-Control-Allow-Methods` — sabit değer: `'POST, GET, OPTIONS, PUT, DELETE'`
  - `Access-Control-Max-Age` — sabit değer: `'86400'`

---

## NODE ID STANDARD

  file: supabase\functions\_shared\cors.ts
  function: supabase\functions\_shared\cors.ts::getCorsHeaders

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCorsHeaders