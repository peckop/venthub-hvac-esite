---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\_shared\cors.ts
skeleton_hash: 1151b66ec188024e
entity_hashes:
  func:getCorsHeaders: 1360a70a0a4d6694
  overview: 8eaad34e6f15ad7c
generated_at: 2026-05-30T21:17:01Z
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

**Ne yapar**: HTTP isteğinin `Origin` başlığını kontrol ederek, istemcinin kaynak (origin) adresinin yerel geliştirme ortamı (`localhost`) veya Vercel deploy ortamı (`.vercel.app`) olup olmadığını belirler. Bu kontrole göre tarayıcılar tarafından uygulanacak olan CORS (Cross-Origin Resource Sharing) yanıt başlıklarını döndürür. Fonksiyon, güvenli olmayan kaynaklardan gelen istekleri engelleyerek yalnızca izin verilen ortamların API'ye erişmesini sağlar.

**Nasıl yapar**: Önce istek nesnesinin `Origin` başlığını okur, bulunamazsa boş bir dize kullanır. Ardından bu değeri iki koşul için test eder: `http://localhost:` ile başlayıp başlamadığını ve `.vercel.app` ile bitip bitmediğini kontrol eder. Koşullardan herhangi biri sağlanırsa istek kabul edilir ve istemcinin kendi `Origin` değeri `Access-Control-Allow-Origin` başlığına yazılır. Aksi halde varsayılan ve tek izinli üretim adresi olan `https://venthub-hvac-esite.vercel.app` kullanılır. Son olarak, izin verilen başlık türleri, HTTP metodları ve önbellek süresi (`86400` saniye = 24 saat) sabit değerler olarak ayarlanan standart bir CORS başlık nesnesi döndürülür.

**Parametreler**:
- `req`: `Request` — Tarayıcı veya istemciden gelen HTTP istek nesnesi. Bu nesne üzerindeki `headers` alanından `Origin` değeri okunarak isteğin kaynak adresi tespit edilir. Cloudflare Workers veya benzeri edge ortamlarında standart `Request` arayüzüne sahiptir.

**Dönüş**: `{ [key: string]: string }` — Tarayıcı tarafından işlenecek CORS başlıklarını içeren bir nesne. İçerik şu başlıklardan oluşur:
- `Access-Control-Allow-Origin`: İzin verilen kaynak adresi (istemci origin'i veya varsayılan üretim URL'i).
- `Access-Control-Allow-Headers`: İzin verilen özel istek başlıkları: `authorization`, `x-client-info`, `apikey`, `content-type`.
- `Access-Control-Allow-Methods`: İzin verilen HTTP metodları: `POST`, `GET`, `OPTIONS`, `PUT`, `DELETE`.
- `Access-Control-Max-Age`: Preflight isteklerinin tarayıcı tarafından kaç saniye önbelleğe alınacağı (86400 saniye).

---

## AST POINTERS

### [N1_NASIL] AST Pointer: _shared/cors.ts::getCorsHeaders
- **params**: (req: Request)
- **ic_degiskenler**:
  - `origin` — Request nesnesinin 'Origin' başlığını alır, eğer başlık yoksa boş dize kullanır
  - `isLocal` — origin değerinin 'http://localhost:' ile başlayıp başlamadığını kontrol eder
  - `isVercel` — origin değerinin '.vercel.app' ile bitip bitmediğini kontrol eder
  - `allowed` — isLocal veya isVercel durumlarından herhangi biri doğruysa true olan mantıksal değişken
- **Dönüş**: CORS başlıklarını içeren nesne (Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Max-Age anahtarlarını içerir)

---

## NODE ID STANDARD

  file: supabase\functions\_shared\cors.ts
  function: supabase\functions\_shared\cors.ts::getCorsHeaders

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCorsHeaders