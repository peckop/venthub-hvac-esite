---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\healthz\index.ts
skeleton_hash: 2f2f8d8c33239d20
generated_at: 2026-05-24T10:44:48Z
---

## Genel Bakış  
Bu modül, Supabase fonksiyonları içinde basit bir sağlık kontrolü (health‑check) endpoint’i sağlar. Tek bir HTTP işleyici fonksiyonu, gelen isteği alır, veritabanına hafif bir sorgu göndererek bağlantının durumunu test eder ve buna göre 200 veya 503 yanıtı döndürür.

## Fonksiyon Grupları  
### Sağlık Kontrolü İşleyicisi  
Bu grup, hizmetin çalışır durumda olup olmadığını belirleyen tek işlevi içerir.  
- healthz_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modülün çalışması için bir **Request** nesnesi sağlanması gerekir.

**Aksiyom 1**: Eğer `healthz_handler` fonksiyonuna bir **Request** argümanı verilmezse, fonksiyon çalıştırılırken bir **TypeError** fırlatılır.

---

## FONKSIYON DETAYLARI

### healthz_handler
**Ne yapar**: HTTP isteklerini alarak servis sağlık kontrolü gerçekleştirir; isteğe bağlı olarak hafif bir veritabanı sorgusu yapar ve hizmetin erişilebilirliğini 200 OK ya da 503 Service Unavailable durum kodlarıyla bildirir.  

**Nasıl yapar**: Gelen `Request` nesnesini inceler, konfigürasyona göre bir DB bağlantısı kurar ve basit bir SELECT ya da ping sorgusu çalıştırır. Sorgu başarılıysa `Response` nesnesi 200 durum kodu ve “OK” mesajı içerir; hata oluşursa 503 durum kodu ve hata açıklaması döndürülür.  

**Parametreler**:
- req: Request — HTTP isteğini temsil eden nesne; metod, başlıklar ve isteğe bağlı gövde içerir.  

**Dönüş**: Response — HTTP yanıtını temsil eden nesne; durum kodu, başlıklar ve yanıt gövdesi içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\healthz\index.ts::healthz_handler
- **params**: (req)
- **ic_degiskenler**:
  - `headers` — HTTP yanıt başlıklarını tutan `Record<string,string>` nesnesi; `Content-Type` ve `Cache-Control` ayarlarını içerir.
  - `supabaseUrl` — `SUPABASE_URL` ortam değişkeninin değeri; bulunamazsa boş string.
  - `serviceKey` — `SUPABASE_SERVICE_ROLE_KEY` ortam değişkeninin değeri; bulunamazsa boş string.
  - `release` — `SENTRY_RELEASE` veya `RELEASE` ortam değişkenlerinden alınan sürüm bilgisi; bulunamazsa boş string.
  - `commit` — `GITHUB_SHA`, `COMMIT_SHA` veya `VITE_COMMIT_SHA` ortam değişkenlerinden alınan commit hash’i; bulunamazsa boş string.
  - `resp` — Supabase REST/RPC çağrısının `fetch` sonucu; `await` ile alınır, yanıtın `ok` olup olmadığı kontrol edilir.
  - `sentryCaptureException` — Dinamik olarak `../_shared/sentry.ts` modülünden içe aktarılan fonksiyon; hata yakalandığında Sentry’ye rapor gönderir.
- **Dönüş**: `Response` nesnesi.  
  - `OPTIONS` isteği için 200 durum kodu ve `headers`.  
  - `GET`/`HEAD` dışındaki metodlar için 405 ve hata mesajı.  
  - Supabase bağlantısı başarılıysa 200 ve `{ok:true, db:'ok', release, commit, time}` JSON’u.  
  - Supabase bağlantısı yoksa 200 ve `{ok:true, release, commit, time}` JSON’u.  
  - Hata durumunda (catch) 503 ve `{ok:false, error:'unhealthy'}` JSON’u.

---

## NODE ID STANDARD

  file: supabase\functions\healthz\index.ts
  function: supabase\functions\healthz\index.ts::healthz_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: healthz_handler