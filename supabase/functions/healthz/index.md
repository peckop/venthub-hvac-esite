---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\healthz\index.ts
skeleton_hash: 2f2f8d8c33239d20
generated_at: 2026-05-24T07:31:59Z
---

## Genel Bakış
Bu modül, Supabase fonksiyonlarında sağlık kontrolü (health check) endpoint'ini uygular. Tek bir HTTP işleyici fonksiyonu üzerinden gelen istekleri değerlendirerek hizmetin çalışır durumda olup olmadığını bildiren bir yanıt döndürür.

## Fonksiyon Grupları
### Sağlık Kontrolü İşleyicisi
Bu grup, hizmetin durumunu kontrol eden ve istemciye basit bir sağlık yanıtı veren işlevi içerir.
- healthz_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modülün çalışması için bir Request nesnesi sağlanması gerekir.

[Aksiyom 1]: Eğer healthz_handler fonksiyonuna bir Request argümanı verilmezse, fonksiyon çalıştırılırken bir istisna (TypeError) fırlatılır.
[Aksiyom 2]: Eğer sağlanan Request nesnesi .method veya .url gibi gerekli özellikleri içermezse, fonksiyon bu özelliklere erişmeye çalıştığında undefined değer alır ve sağlık kontrolü mantığı hatalı sonuç üretebilir.

---

## FONKSIYON DETAYLARI

### healthz_handler
**Ne yapar**: Sağlık kontrolü endpoint’i olarak çalışır; veritabanı bağlantısının durumunu hafif bir sorgulama ile kontrol eder ve bu duruma göre HTTP 200 (sağlıklı) veya 503 (hizmet kullanılamıyor) yanıtı döndürür.  
**Nasıl yapar**: Fonksiyon, gelen `Request` nesnesini alır; isteğin bağlamında gerekirse veritabanına hızlı bir bağlantı testi yapar (örnek: basit SELECT 1 sorgusu). Test başarılıysa `Response` nesnesi ile status 200 döndürülür, başarısızsa status 503 ve isteğe bağlı bir hata mesajı eklenir.  
**Parametreler**:
- req: Request — İşlenecek HTTP isteği; başlıklar, yöntem ve URL gibi bilgileri içerir.  
**Dönüş**: Response — HTTP yanıtı; veritabanı bağlantısı sağlıysa status 200, aksi takdirde status 503 ve opsiyonel bir hata açıklaması içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\healthz\index.ts::healthz_handler
- **params**: req — incoming HTTP request object (Deno Request)
- **ic_degiskenler**:
  - `headers` — object holding HTTP response headers (Content-Type, Cache-Control)
  - `supabaseUrl` — string from env SUPABASE_URL (empty string if unset)
  - `serviceKey` — string from env SUPABASE_SERVICE_ROLE_KEY (empty string if unset)
  - `release` — string from env SENTRY_RELEASE or RELEASE (empty string if unset)
  - `commit` — string from env GITHUB_SHA or COMMIT_SHA or VITE_COMMIT_SHA (empty string if unset)
  - `resp` — Response object from fetch to Supabase RPC now endpoint
  - `_e` — caught error object (unknown type) from try block
  - `sentryCaptureException` — function imported from ../_shared/sentry.ts used to capture exception
- **Dönüş**: Response (Promise<Response>)

---

## NODE ID STANDARD

  file: supabase\functions\healthz\index.ts
  function: supabase\functions\healthz\index.ts::healthz_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: healthz_handler