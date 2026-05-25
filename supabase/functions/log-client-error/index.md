---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\log-client-error\index.ts
skeleton_hash: 9f88485c49506986
generated_at: 2026-05-25T09:15:00Z
---

## Genel Bakış
Bu modül, istemci tarafında oluşan hataları merkezi bir uç noktada toplamak ve kaydetmek için kullanılan bir Supabase Edge Function'dur. Gelen HTTP isteğindeki hata verisini ayrıştırır, geçerliliğini denetler, sisteme kaydeder ve sonuç olarak uygun bir HTTP yanıtı döndürür.

## Fonksiyon Grupları
### Hata Kaydı ve HTTP Yanıt Yönetimi
Gelen hata bildirimini işleyen tek bir işleyici; istek gövdesinden veriyi çıkarır, doğrular, kalıcı depolamaya yazar ve CORS başlıkları dahil uygun bir yanıt oluşturur.
- log-client-error_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `req` parametresi sağlanmazsa, fonksiyon çağrısı TypeError ile başarısız olur.  
[Aksiyom 2]: Eğer `req` değeri `null` veya `undefined` ise, fonksiyon bir hata fırlatır ve hata kaydı ya da yanıt üretilemez.

---

---

## FONKSIYON DETAYLARI

### log-client-error_handler
**Ne yapar**: Bu fonksiyon, istemci tarafında oluşan hataları kaydetmek için gelen HTTP isteğini ele alır. İstemci uygulamasından gönderilen hata verilerini almak ve işlemek üzere tasarlanmıştır.
**Nasıl yapar**: Fonksiyon, `req` parametresi üzerinden gelen isteği kabul eder ve işleyerek bir `Response` nesnesi döner. İstek içeriğini analiz ederek uygun bir yanıt oluşturur.
**Parametreler**:
- req: Request — Gelen HTTP isteği nesnesidir.
**Dönüş**: Response — İşlem sonucunda oluşturulan HTTP yanıt nesnesidir.

---

## SABİTLER
- **clientErrorSchema** (call) — `z.object({
  msg: z.string().default(''),
  stack: z.string().default(''),...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\log-client-error\index.ts::log-client-error_handler
- **params**: (req: Request) — Gelen HTTP isteği nesnesi
- **ic_degiskenler**:
  - `requestId` — İsteği takip etmek için üretilen benzersiz kimlik, tüm response header'larına eklenir
  - `cors` — CORS politikalarını tanımlayan header nesnesi, izin verilen origin, header ve methodları içerir
  - `supabaseUrl` — Supabase proje URL'si, ortam değişkeninden alınır
  - `serviceRoleKey` — Supabase servis rolü yetki anahtarı, ortam değişkeninden alınır
  - `allowedOrigins` — İsteğe izin verilen origin listesi, ortam değişkeninden virgülle ayrılmış şekilde işlenir
  - `originHeader` — İsteğin origin header değerini, origin kontrolü için kullanılır
  - `originToCheck` — Doğrulanacak origin değeri, origin header yoksa referer URL'sinden çıkarılır
  - `ref` — İsteğin referer header değeri, origin header eksikse origin çıkarmak için kullanılır
  - `requireAuth` — Kimlik doğrulama zorunluluğunu belirten bayrak, ortam değişkeninden alınır, varsayılan true
  - `supabase` — Oluşturulan Supabase istemcisi, tüm veritabanı ve kimlik doğrulama işlemleri için kullanılır
  - `authHeader` — İsteğin authorization header değeri, kullanıcı doğrulamak için kullanılır
  - `accessToken` — Bearer token'dan çıkarılan erişim anahtarı, Supabase kullanıcı doğrulaması için gönderilir
  - `authData` — Supabase'den dönen kullanıcı doğrulama verisi, token geçerliliğini kontrol etmek için kullanılır
  - `authErr` — Kullanıcı doğrulama sırasında oluşan hata nesnesi
  - `rawBody` — İsteğin ham JSON gövdesi, parse başarısız olursa null döner
  - `parsed` — Zod şemasıyla doğrulanmış istek verisi, başarı durumu ve işlenmiş veriyi içerir
  - `payload` — Doğrulama sonrası geçerli hata verisi, tüm istemci hata detaylarını barındırır
  - `mask` — PII verilerini (e-posta, uzun tokenler) maskelemek için kullanılan iç yardımcı fonksiyon
  - `firstLine` — Hata stack izininin ilk satırı, hata grubu imzası oluşturmak için kullanılır
  - `urlObj` — İstekten gelen URL'den oluşturulan URL nesnesi, pathname çıkarmak için kullanılır
  - `_path` — URL'den çıkarılan pathname, hata grubu imzası oluşturulurken kullanılır
  - `signature` — Hata grubunu benzersiz tanımlayan imza, mesaj, stack ilk satırı ve path'ten oluşturulur
  - `groupId` - Hatanın ait olduğu hata grubu kayıt kimliği, veritabanı upsert sonrası alınır
  - `groupPayload` — `error_groups` tablosuna eklenecek hata grubu verisi, tüm grup metriklerini içerir
  - `upsertRow` — `error_groups` tablosuna upsert işlemi sonrası dönen kayıt verisi, grup kimliği almak için kullanılır
  - `q` — Upsert sonrası grup kimliği alınamazsa imzaya göre yapılan sorgudan dönen kayıt verisi
  - `dedupSeconds` — Yinelenen hata kayıtlarını engellemek için bekleme süresi, ortam değişkeninden alınır, varsayılan 5 saniye
  - `since` — Son eklenen hataları sorgulamak için zaman aralığı başlangıcı, dedup süresine göre hesaplanır
  - `recent` — Dedup süresi içinde aynı gruba ait kayıt olup olmadığını kontrol etmek için dönen veritabanı sonucu
  - `row` — `client_errors` tablosuna eklenecek bireysel hata kaydı, tüm hata detaylarını içerir
  - `error` — `client_errors` tablosuna ekleme sırasında oluşan hata nesnesi
  - `level` — Hata seviyesi, Slack bildirimi gönderim koşulunu kontrol etmek için kullanılır
  - `env` — Hatanın oluştuğu ortam değeri, Slack bildiriminde kullanılır
  - `notifyEnabled` — Slack bildirimlerinin etkin olup olmadığını belirten bayrak, webhook URL varlığına göre ayarlanır
  - `isCritical` — Hata seviyesinin kritik olup olmadığını kontrol eden bayrak (fatal/error)
  - `slackNotify` — Slack'e bildirim göndermek için import edilen yardımcı fonksiyon
  - `shortMsg` — Slack bildiriminde kullanılacak kısaltılmış hata mesajı, ilk 200 karakteri alınır
  - `fields` — Slack bildirimine eklenen ek detay alanları, imza, seviye, ortam gibi bilgileri içerir
  - `_e` — Dış try-catch bloğunda yakalanan genel hata nesnesi, fonksiyonun genel hatasını loglamak için kullanılır
  - `msg` — Yakalanan hatanın kullanıcıya dönülecek mesajı, log ve cevap olarak kullanılır
- **Dönüş**: HTTP Response nesnesi, tüm isteklere uygun durum kodu ve header'larla döner

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\log-client-error\index.ts::mask
- **params**: (s: string) — Maskeleme işlemi uygulanacak girdi metni
- **ic_degiskenler**: (yok)
- **Dönüş**: PII verileri masklenmiş, uzunluğu kırpılmış string değeri

---

## NODE ID STANDARD

  file: supabase\functions\log-client-error\index.ts
  function: supabase\functions\log-client-error\index.ts::log-client-error_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: log-client-error_handler