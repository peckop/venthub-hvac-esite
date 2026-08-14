---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\_shared\cors.ts
skeleton_hash: f5323f7621d54120
entity_hashes:
  func:getCorsHeaders: 73642dabf029645c
  overview: 8eaad34e6f15ad7c
generated_at: 2026-08-14T13:19:43Z
---

## Genel Bakış
Bu modül, Supabase edge function'ları arasında paylaşılan CORS (Cross-Origin Resource Sharing) yönetimi sağlar. Farklı kaynaklardan gelen HTTP istekleri için uygun erişim başlıklarını oluşturarak, API'lerin güvenli bir şekilde çapraz kaynak taleplerine izin vermesini mümkün kılar.

## Fonksiyon Grupları
### CORS Başlık Yönetimi
HTTP isteklerine göre CORS politikalarını uygulayan başlık setini oluşturur. Bu başlıklar, isteklerin hangi kaynaklardan gelmesine izin verileceğini ve hangi HTTP metodlarının kullanılabileceğini belirler.
- getCorsHeaders

---

## AXIOMS – Mimari Varsayımlar
Bu modül, HTTP istekleri için CORS başlıkları döndüren bir fonksiyon içerir. Aşağıda, fonksiyonun doğru çalışması için gerekli temel mimari varsayımlar listelen

---

## FONKSİYON DETAYLARI

### getCorsHeaders

**Ne yapar**: HTTP isteklerine yanıt olarak Cross-Origin Resource Sharing (CORS) politika başlıklarını dinamik olarak oluşturur. Fonksiyon, gelen isteğin kaynak adresine (Origin) göre izin verilen domain listesini belirler ve standart CORS başlıklarını içeren bir nesne döndürür. Bu sayede frontend uygulamaları farklı bir domain'den API isteklerini güvenli bir şekilde gerçekleştirebilir.

**Nasıl yapar**: Fonksiyon, HTTP isteğinin `Origin` başlığını çıkararak başlar. Bu değeri kullanarak üç temel kontrol gerçekleştirir: kaynağın `localhost` ile başlayıp başlamadığını (geliştirme ortamı), `.vercel.app` ile bitip bitmediğini (Vercel deployment ortamı), ve her iki koşulun da sağlanıp sağlanmadığını kontrol eder. Kaynak izin listesinde yer alıyorsa, `Access-Control-Allow-Origin` başlığını isteğin kendi Origin değeriyle döndürür; aksi halde_prodüksiyon URL'ini (`https://venthub-hvac-esite.vercel.app`) kullanır. Ek olarak, izin verilen HTTP yöntemlerini, başlıkları ve preflight isteklerinin önbellek süresini (86400 saniye) ayarlar.

**Parametreler**:
- `req: Request` — CORS başlıklarının çıkarılacağı HTTP istek nesnesi. Standart Fetch API Request nesnesi olup, `headers` özelliği üzerinden HTTP başlıklarına erişim sağlar

**Dönüş**: `Record<string, string>` — Dört anahtar-değer çiftinden oluşan CORS başlık nesnesi döndürür:
- `Access-Control-Allow-Origin`: İzin verilen kaynak domain (dinamik veya sabit prodüksiyon URL'i)
- `Access-Control-Allow-Headers`: İzin verilen istek başlıkları listesi (authorization, x-client-info, apikey, content-type)
- `Access-Control-Allow-Methods`: İzin verilen HTTP yöntemleri (POST, GET, OPTIONS, PUT, DELETE)
- `Access-Control-Max-Age`: Preflight isteklerinin tarayıcı tarafından önbelleğe alınma süresi (saniye cinsinden 86400)

---

## AST POINTERS

### [N1_NASIL] AST Pointer: _shared/cors.ts::getCorsHeaders
- **params**: (req: Request)
- **ic_degiskenler**:
  - `origin` — Request'ten alınan Origin header değeri; mevcut değilse boş string kullanılır
  - `isLocal` — origin'in `http://localhost:` ile başlayıp başlamadığını kontrol eder;本地 geliştirme ortamı tespiti için kullanılır
  - `isVercel` — origin'in `.vercel.app` ile bitip bitmediğini kontrol eder; Vercel deploy ortamı tespiti için kullanılır
  - `allowed` — isLocal veya isVercel değerlerinin OR mantığı ile sonuçlanan布尔 değişken; istek yapan origin'in izinli olup olmadığını belirler
- **Dönüş**: `{ 'Access-Control-Allow-Origin': string, 'Access-Control-Allow-Headers': string, 'Access-Control-Allow-Methods': string, 'Access-Control-Max-Age': string }` — CORS header nesnesi döndürür; allowed true ise gelen origin'e izin verir, false ise sabit Vercel URL'ine izin verir

---

## NODE ID STANDARD

  file: supabase\functions\_shared\cors.ts
  function: supabase\functions\_shared\cors.ts::getCorsHeaders

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCorsHeaders