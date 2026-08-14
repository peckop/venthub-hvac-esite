---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\_shared\cors.ts
skeleton_hash: da1773f021d66452
entity_hashes:
  func:getCorsHeaders: a5294397cf162f0a
  overview: 26144dafbf658355
generated_at: 2026-08-14T12:38:34Z
---

## Genel Bakış
Bu modül, Supabase edge fonksiyonları için merkezi bir CORS (Cross-Origin Resource Sharing) politika motoru işlevi görür. Temel sorumluluğu, gelen HTTP isteklerinin kaynak adresini (Origin) analiz ederek, yalnızca güvenli ve izinli ortamların (geliştirme ve belirli bir üretim alanı) API'ye erişmesini sağlayacak uygun HTTP başlıklarını oluşturmaktır. Bu sayede, farklı kaynaklardan gelen çapraz kaynak talepleri kontrollü ve güvenli bir şekilde yönetilir.

## Fonksiyon Grupları
### CORS Politika Uygulaması
Gelen isteklerin kaynak adresine göre dinamik ve güvenli erişim kontrol başlıkları üretir. Bu, API'lerin hem yerel geliştirme hem de üretim ortamlarında sorunsuz çalışmasını sağlarken, izin verilmeyen kaynaklardan gelen istekleri engeller.
- getCorsHeaders

---

## AXIOMS – Mimari Varsayımlar

Bu modül, HTTP istekleri için CORS (Cross-Origin Resource Sharing) başlıklarını döndüren bir paylaşımlı yardımcı modüldür.

[Aksiyom 1]: Eğer `req` parametresi geçerli bir `Request` nesnesi olarak sağlanmazsa, isteğin Origin header'ı okunamaz ve uygun CORS başlıkları üretilemez.

[Aksiyom 2]: Eğer istek `Origin` header'ı içermiyorsa (örn: same-origin istekler), fonksiyonun nasıl bir davranış sergileceği fonksiyon gövdesine bağlıdır ve bu durum modülün kendi kapsamı dışındadır.

[Aksiyom 3]: Eğer fonksiyon döndürdüğü header'lar HTTP yanıtına eklenmezse, tarayıcı kaynaklar arası istekleri engelleyecektir (CORS politikası ihlali).

---

## FONKSİYON DETAYLARI

### getCorsHeaders
**Ne yapar**: Bu fonksiyon, istemciden gelen HTTP isteğinin (`Request`) `Origin` başlığına göre, Cross-Origin Resource Sharing (CORS) politikasına uygun yanıt başlıklarını döndürür. Temel amacı, isteği yapan kaynağın (origin) güvenli olup olmadığını belirleyip, yalnızca izin verilen kaynaklara (localhost, Vercel) erişim izni veren bir dizi HTTP başlığı üretmektir.

**Nasıl yapar**: Fonksiyon, gelen isteğin `Origin` başlığını okur. Bu başlığın `http://localhost:` ile başlayıp başlamadığını (lokal geliştirme ortamı) veya `.vercel.app` ile bitip bitmediğini (Vercel üretim ortamı) kontrol ederek `allowed` adlı bir boolean değişken belirler. Eğer kaynak izinliyse, yanıt `Access-Control-Allow-Origin` başlığının değerini isteğin kendi `Origin` değeri olarak ayarlar; izinli değilse, `https://venthub-hvac-esite.vercel.app` varsayılan güvenli adresini kullanır. Ardından, tarayıcının önbellek zehirlenmesini önlemek için `Vary: Origin` başlığını ve preflight isteklerinin süresini belirten `Access-Control-Max-Age: 86400` (24 saat) başlığını da ekleyerek başlık nesnesini döndürür.

**Parametreler**:
- `req`: `Request` — Bu parametre, istemciden gelen ve CORS kararını vermek için ihtiyaç duyulan tüm bilgileri (özellikle `Origin` başlığını) içeren standart Web API Request nesnesidir. Fonksiyon, bu nesnenin `headers` özelliğinden faydalanır.

**Dönüş**: Fonksiyon, bir nesne döndürür. Bu nesne, tarayıcı ve sunucu arasındaki跨-origin iletişimi için gerekli HTTP başlıklarını (`Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`, `Access-Control-Max-Age`, `Vary`) anahtar-değer çiftleri olarak içerir. Döndürülen nesnenin yapısı, fonksiyon gövdesindeki return ifadesiyle belirlenmiştir ve belirli bir interface veya type ile zorunlu olarak ilişkilendirilmemiştir, ancak yapısı sabittir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: _shared/cors.ts::getCorsHeaders
- **params**: `req: Request` — HTTP isteği nesnesi, istemciden gelen başlıkları okumak için kullanılır
- **ic_degiskenler**:
  - `origin` — `req.headers.get('Origin')` ile isteğin geldiği origin adresi alınır; değer yoksa boş string (`''`) kullanılır
  - `isLocal` — `origin.startsWith('http://localhost:')` ile origin'in yerel geliştirme sunucusu olup olmadığı kontrol edilir
  - `isVercel` — `origin.endsWith('.vercel.app')` ile origin'in Vercel deployed bir domain olup olmadığı kontrol edilir
  - `allowed` — `isLocal || isVercel` boolean değeri; origin izin verilen listede ise `true` olur
- **Dönüş**: CORS başlıkları içeren nesne — `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`, `Access-Control-Max-Age` ve `Vary` başlıklarını barındırır; `allowed` `true` ise actual origin, değilse sabit `https://venthub-hvac-esite.vercel.app` adresi `Allow-Origin` değerine yazılır

---

## NODE ID STANDARD

  file: supabase\functions\_shared\cors.ts
  function: supabase\functions\_shared\cors.ts::getCorsHeaders

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCorsHeaders