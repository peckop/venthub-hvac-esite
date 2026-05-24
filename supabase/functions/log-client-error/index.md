---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\log-client-error\index.ts
skeleton_hash: 1e58fde4da6828be
generated_at: 2026-05-24T07:46:01Z
---

## Genel Bakış
Bu modül, istemci tarafında oluşan hataları yakalayıp Supabase fonksiyonu üzerinden güvenli bir şekilde kaydeder ve istemciye uygun bir HTTP yanıtı döndürür. Tek bir işlev üzerinden hata bilgilerinin toplanması, loglanması ve yanıt üretimi işlemleri gerçekleştirilir.

## Fonksiyon Grupları
### Hata Günlüğü ve Yanıt Oluşturma
Bu grup, gelen istek üzerinden hata ayrıntılarını çıkararak bunları sistem günlüğüne ekler ve istemciye anlamlı bir yanıt hazırlar.
- log-client-error_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `req` parametresi sağlanmazsa, fonksiyon çalıştırılamaz (TypeError) olur.  
[Aksiyom 2]: Eğer `req` değeri `null` veya `undefined` ise, fonksiyon bir hata fırlatır ve hata kaydı yapılamaz.

---

## FONKSIYON DETAYLARI

### log-client-error_handler
**Ne yapar**: İstemci tarafı hatalarını kaydeder ve uygun bir HTTP yanıtı döndürür.  
**Nasıl yapar**: Gelen `Request` nesnesinden hata bilgilerini okur, iç logging mekanizmasıyla bu bilgileri kaydeder ve ardından bir `Response` nesnesi oluşturur.  
**Parametreler**:
- req: Request — İşlenecek gelen HTTP isteği; hata ayrıntılarını içerir.  
**Dönüş**: Response — İşlem sonucu olan HTTP yanıtı; genellikle durum kodu ve hata mesajı içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\log-client-error\index.ts::log-client-error_handler
- **params**: req: Request
- **ic_degiskenler**:
  - `requestId` — benzersiz istek kimliği; CORS header’ında ve Slack bildiriminde kullanılır
  - `cors` — CORS yanıt başlıklarını tanımlayan nesne; tüm yanıtlarda header olarak eklenir
  - `supabaseUrl` — Supabase proje URL’si; environment değişkeninden okunur ve Supabase istemcisi oluşturulurken kullanılır
  - `serviceRoleKey` — Supabase service role anahtarı; environment değişkeninden okunur ve Supabase istemcisi oluşturulurken kullanılır
  - `allowedOrigins` — izin verilen kaynakların virgülle ayrılmış listesi; environment değişkeninden okunur, boşluklar temizlenir ve CORS kontrolünde kullanılır
  - `originHeader` — isteğin Origin header değeri; CORS kısıtlaması kontrolünde kullanılır
  - `originToCheck` — kontrol edilecek kaynak; Origin header boşsa Referer’den türetilir ve `allowedOrigins` listesinde aranır
  - `ref` — isteğin Referer header değeri; Origin header yoksa bu değerden `originToCheck` türetilir
  - `requireAuth` — kimlik doğrulamanın zorunlu olup olmadığını belirleyen bayrak; environment değişkeninden okunur ve gerekirse JWT doğrulaması yapılır
  - `supabase` — Supabase istemcisi; `supabaseUrl` ve `serviceRoleKey` ile oluşturulur ve veritabanı işlemleri için kullanılır
  - `authHeader` — isteğin Authorization header değeri;Bearer token’ı ayıklamak için kullanılır
  - `accessToken` — Bearer öneki çıkarılmış JWT token; Supabase `auth.getUser` çağrısında kullanılır
  - `authData` — `supabase.auth.getUser` çağrısının yanıtındaki kullanıcı verisi; token geçerliyse bu nesne doludur
  - `authErr` — `supabase.auth.getUser` çağrısından oluşan hata; token geçersizse bu değişken doludur
  - `body` — isteğin JSON gövdesi; `req.json()` ile okunur ve geçerli bir nesne olup olmadığı kontrol edilir
  - `mask` — PII’yi maskelemek için kullanılan küçük işlev; e-posta ve uzun rastgele dizgeleri *** ile değiştirir
  - `payload` — `body` nesnesinin tip dönüşümü; hata mesajı, yığın, URL gibi alanlara erişim sağlar
  - `firstLine` — hata yığınının ilk satırı; hata grup imzası oluştururken kullanılır
  - `urlObj` — `payload.url` string’inin URL nesnesi; pathname çıkarmak için kullanılır (geçersizse null)
  - `_path` — `urlObj.pathname` değeri; hata grup imzasında URL kısmını temsil eder
  - `signature` — hata grubunu tanımlayan benzersiz string; mesaj, ilk yığın satırı ve URL path’inin kısıp maskeleme sonucu birleşimidir
  - `groupId` — `error_groups` tablosunda bulunan veya oluşturulan grup kimliği; hata kayıtları bu gruba bağlanır
  - `groupPayload` — `error_groups` tablosuna upsert edilecek veri nesnesi; signature, level, mesaj vb. içerir
  - `upsertRow` — upsert işleminin döndürdüğü satır; `id` ve `_count` alanlarını içerir
  - `q` — signature’a göre grup kimliğini getirmek için yapılan ikinci sorgu sonucu; upsert satır dönmezse grup kimliğini bulmak için kullanılır
  - `dedupSeconds` — kısa zaman içindeki tekrarlı hataları filtrelemek için kullanılan saniye değeri; environment değişkeninden okunur
  - `since` — deduplikasyon zaman penceresinin başlangıcı (ISO string); `dedupSeconds` kadar önceki zaman
  - `recent` — `client_errors` tablosunda belirtilen grupta ve zaman penceresindeki son kayıtlar; varsa yeni kayıt eklenmez
  - `row` — `client_errors` tablosuna eklenecek hata kaydı; zaman damgası, URL, mesaj, yığın, kullanıcı aracısı, sürüm, ortam, seviye ve ekstra alanları içerir
  - `error` — `supabase.from('client_errors').insert(row)` çağrısının döndürdüğü hata nesnesi; insert başarısızsa bu değişken doludur
  - `msg` — hata nesnesinden çıkarılan okunabilir hata mesajı; 500 yanıtının gövdesinde ve Slack bildiriminde kullanılır
  - `level` — `payload.level` değeri (küçük harfe çevrilmiş); Slack bildiriminde sadece ‘fatal’ veya ‘error’ seviyeleri için tetiklenir
  - `env` — `payload.env` değeri; Slack bildiriminde ortam bilgisi göstermek için kullanılır
  - `notifyEnabled` — Slack webhook URL’sinin tanımlı olup olmadığını gösteren bayrak; true ise bildirim gönderimi denenir
  - `isCritical` — `level` ‘fatal’ veya ‘error’ olduğunda true; sadece kritik seviyelerde Slack bildirimi gönderilir
  - `slackNotify` — `../_shared/notify.ts` modülünden içe aktarılan bildirim fonksiyonu; Slack’a mesaj göndermek için kullanılır
  - `shortMsg` — Slack mesajında gösterilecek kısaltılmış hata mesajı (ilk 200 karakter)
  - `fields` — Slack mesajına eklenecek alanlar (Signature, Level, Env, URL, Request‑Id) nesnelerinin dizisi
  - `_e` — dış try/catch bloğunda yakalanan genel hata; fonksiyonun beklenmedik hatalarını günlüğe ve Slack’a bildirir
  - `msg` (outer catch) — `_e` hatasından çıkarılan mesaj; 500 yanıtının gövdesinde ve Slack bildiriminde kullanılır
- **Dönüş**: Response (her durumda uygun HTTP yanıtı döner)

---

## NODE ID STANDARD

  file: supabase\functions\log-client-error\index.ts
  function: supabase\functions\log-client-error\index.ts::log-client-error_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: log-client-error_handler