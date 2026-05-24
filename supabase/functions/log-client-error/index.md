---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\log-client-error\index.ts
skeleton_hash: 1e58fde4da6828be
generated_at: 2026-05-24T10:45:26Z
---

## Genel Bakış
Bu modül, istemci tarafında meydana gelen hataların merkezi olarak kaydedilmesini sağlayan bir Supabase Edge Functions'tır. Gelen HTTP isteklerinden hata bilgilerini çıkarır, loglama işlemlerini gerçekleştirir ve CORS uyumlu güvenli yanıtlar döndürür.

## Fonksiyon Grupları
### Hata Kaydı ve HTTP Yanıt Yönetimi
Bu grup, istemciden gelen hata bildirimlerini işler, sistem günlüğüne kaydeder ve istemciye uygun, CORS başlıkları içeren HTTP yanıtı hazırlar.
- log-client-error_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `req` parametresi sağlanmazsa, fonksiyon çağrısı TypeError ile başarısız olur.  
[Aksiyom 2]: Eğer `req` değeri `null` veya `undefined` ise, fonksiyon bir hata fırlatır ve hata kaydı ya da yanıt üretilemez.

---

## FONKSIYON DETAYLARI

### log-client-error_handler
**Ne yapar**: Bu fonksiyon, istemci tarafında oluşan hataları kayıt altına almak için tasarlanmış bir HTTP istek işleyicisidir. Gelen istek üzerinden hata verilerini alır, işler ve kalıcı bir depolama alanına kaydeder, ardından işlem sonucunu belirten uygun bir yanıt döndürür.
**Nasıl yapar**: Öncelikle istemciden gelen HTTP isteğini alır ve isteğin gövdesinden gönderilen hata verilerini çıkarır. Çıkarılan verinin geçerliliğini kontrol ederek gerekli doğrulama adımlarını gerçekleştirir. Doğrulama başarılı olursa, hata kaydını depolamak için gerekli işlemleri tamamlar ve son olarak işlem sonucuna göre uygun bir HTTP yanıtı oluşturup döndürür.
**Parametreler**:
- req: Request — İstemciden gelen tam HTTP isteği nesnesi, hata verilerini ve ilgili meta bilgileri içerir.
**Dönüş**: Response — İşlem sonucunu temsil eden HTTP yanıt nesnesi. Başarılı kayıt durumunda 200 OK durum kodu ile işlem başarılı bilgisi içerir, geçersiz veri veya depolama hatası durumlarında uygun hata durum kodları ve hata açıklaması ile yanıt döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\log-client-error\index.ts::log-client-error_handler
- **params**: (req)
- **ic_degiskenler**:
  - `requestId` — `crypto.randomUUID()` veya zaman damgası ile oluşturulan istek kimliği.
  - `cors` — CORS başlıklarını içeren `Record<string,string>` nesnesi; tüm yanıtların `headers` alanına eklenir.
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alınan Supabase proje URL’si.
  - `serviceRoleKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan servis rol anahtarı.
  - `allowedOrigins` — `ALLOWED_ORIGINS` ortam değişkeninden virgülle ayrılmış ve temizlenmiş izin verilen origin listesi.
  - `originHeader` — İsteğin `origin` başlığının değeri.
  - `originToCheck` — `originHeader` veya `referer` başlığından türetilen kontrol edilecek origin.
  - `ref` — `referer` başlığının değeri; `originToCheck` oluşturulurken URL’den origin alınmak için kullanılır.
  - `requireAuth` — `REQUIRE_AUTH` ortam değişkenine göre kimlik doğrulamanın zorunlu olup olmadığını belirten boolean.
  - `supabase` — `createClient(supabaseUrl, serviceRoleKey)` ile oluşturulan Supabase istemcisi.
  - `authHeader` — `authorization`/`Authorization` başlığının değeri.
  - `accessToken` — `authHeader` içinden `Bearer ` önekini kaldırarak elde edilen erişim token’ı.
  - `authData` — `supabase.auth.getUser(accessToken)` çağrısının başarılı yanıtı (`data` alanı).
  - `authErr` — `supabase.auth.getUser` çağrısının hata yanıtı (`error` alanı).
  - `body` — `await req.json()` ile elde edilen ve `null` dönüşüne karşı yakalanan istek gövdesi.
  - `mask` — PII gizlemek için kullanılan, 4000 karaktere kadar kesen ve e‑posta/uzun dizileri maskeler bir fonksiyon.
  - `payload` — `body` nesnesinin `Record<string, unknown>` tipine dönüştürülmüş hali.
  - `firstLine` — `payload.stack` içindeki ilk satır (stack trace’in ilk satırı).
  - `urlObj` — `payload.url` değerinden oluşturulan `URL` nesnesi (başarısız olursa `null`).
  - `_path` — `urlObj?.pathname` değeri; URL’nin yol kısmı.
  - `signature` — `mask` uygulanmış mesaj, stack ilk satırı ve yolun birleştirilmesiyle oluşturulan grup imzası.
  - `groupPayload` — `signature` ve diğer maskelenmiş alanları içeren `error_groups` tablosu için upsert verisi.
  - `upsertRow` — Upsert işleminden dönen satır (id ve _count).
  - `groupId` — Hata grubunun kimliği (`string` veya `null`).
  - `q` — `signature` eşleşmesiyle grup id’si sorgulama sonucunda dönen veri.
  - `dedupSeconds` — `DEDUP_SECONDS` ortam değişkeninden okunan, aynı grup içinde tekrarları önlemek için kullanılan saniye değeri.
  - `since` — `dedupSeconds` kadar geriye dönük ISO zaman damgası.
  - `recent` — Aynı grup ve zaman aralığında daha önce kaydedilmiş `client_errors` satırları.
  - `row` — `client_errors` tablosuna eklenecek kayıt; maskelenmiş alanlar ve isteğe bağlı `grou_p_id`.
  - `error` — `supabase.from('client_errors').insert(row)` çağrısının hata nesnesi (varsa).
  - `msg` — `error` nesnesinden türetilen hata mesajı (log ve yanıt için).
  - `level` — `payload.level` değerinin küçük harfe dönüştürülmüş hali.
  - `env` — `payload.env` değeri.
  - `notifyEnabled` — `SLACK_WEBHOOK_URL` ortam değişkeninin boş olmaması durumunda `true`.
  - `isCritical` — `level` değeri `fatal` veya `error` ise `true`.
  - `slackNotify` — `../_shared/notify.ts` dosyasından dinamik olarak içe aktarılan Slack bildirim fonksiyonu.
  - `shortMsg` — `payload.msg` değerinin 200 karaktere kesilmiş hali (Slack mesajı için).
  - `fields` — Slack mesajında gösterilecek alanları tanımlayan nesne dizisi (Signature, Level, Env, URL, Request‑Id).
  - `_e` — dış `catch` bloğunda yakalanan hata nesnesi.
- **Dönüş**: `Response` (HTTP yanıtı; başarılı durumda 200/ok, hata durumlarında ilgili status kodları ve JSON gövde)

---

## NODE ID STANDARD

  file: supabase\functions\log-client-error\index.ts
  function: supabase\functions\log-client-error\index.ts::log-client-error_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: log-client-error_handler