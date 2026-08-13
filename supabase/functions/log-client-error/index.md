---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\log-client-error\index.ts
skeleton_hash: 60f03cb097186ff2
entity_hashes:
  func:log-client-error_handler: cec12c49f3b9435f
  overview: 4c2fb15476c4ecf3
generated_at: 2026-08-13T07:40:32Z
---

## Genel Bakış
Bu modül, istemci uygulamalarında oluşan hataları merkezi olarak toplayan ve kaydeden bir Supabase Edge Function'dur. Gelen HTTP isteklerinden hata verisini çıkarır, doğrular ve kalıcı bir şekilde depolar, ardından sonucu istemciye bildirir.

## Fonksiyon Grupları
### Hata İşleme ve Yanıt Oluşturma
Gelen hata raporunu işleyen tek işleyici; istek gövdesindeki veriyi doğrulayıp veritabanına yazar ve uygun HTTP yanıtını döndürerek sürecin tamamını yönetir.
- log_client_error_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, istemci hatalarını toplayan bir Supabase Edge Function olup, HTTP istek-tabanlı bir işleyici yapısına sahiptir.

**[Aksiyom 1]**: Eğer geçerli bir `Request` nesnesi fonksiyona sağlanmazsa, işleyici işlevsiz kalır ve uygun hata yanıtı dönmez.

**[Aksiyom 2]**: Eğer `clientErrorSchema` tanımlı değilse veya modülün çalıştırılabilir ortamında mevcut değilse, istek gövdesinin doğrulanması başarısız olur.

**[Aksiyom 3]**: Eğer istek gövdesi (`req.body`) okunamaz veya_PARSE_edilemezse (örn: geçersiz JSON), hata kaydı gerçekleştirilemez.

**[Aksiyom 4]**: Eğer `clientErrorSchema` çağrısı (`(call)`) başarısız olursa (geçersiz hata verisi yapısı), modül kalıcı depolamaya yazma işleminden önce reddeder.

**[Aksiyom 5]**: Eğer kalıcı depolama (Supabase veritabanı) erişilebilir durumda değilse veya yazma işlemi başarısız olursa, istemciye hata durumu bildirilir.

**[Aksiyom 6]**: Eğer istek CORS politikalarını ihlal ediyorsa (örn: izin verilmeyen Origin), işlenmeden önce reddedilebilir — bu durum Supabase Edge Function ortamına bağlıdır.

**[Aksiyom 7]**: Eğer `req` nesnesinde HTTP metodu işleyici tarafından desteklenmiyorsa (örn: OPTIONS dışında bir yöntem), uygun HTTP durum kodu ile yanıt dönülür.

---

## FONKSİYON DETAYLARI

### log-client-error_handler

**Ne yapar**: Client tarafında oluşan hataların sunucu tarafında loglanmasını sağlayan bir Supabase Edge Function handler'ıdır. HTTP isteklerini alır, hata bilgilerini işler ve uygun HTTP yanıtını döndürür.

**Nasıl yapar**: Bu fonksiyon, bir HTTP Request nesnesini parametre olarak alarak çalışır. Adından anlaşılacağı üzere, client tarafındaki uygulama hatalarını yakalayıp sunucu tarafında merkezi olarak loglamak için kullanılır. Supabase Edge Functions yapısı içerisinde bir request handler olarak tanımlanmıştır.

**Parametreler**:
- `req`: Request — İşlenecek olan HTTP istek nesnesi. Client tarafından gönderilen hata bilgilerini ve gerekli header/body verilerini içerir.

**Dönüş**: `Response` — İşlem sonucuna göre bir HTTP yanıt nesnesi döndürür. Başarılı logging işlemi veya hata durumuna uygun status kodu ve mesaj içerebilir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://esm.sh/@supabase/supabase-js@2::createClient
- import: https://esm.sh/zod@3.23.8::z

---

## SABİTLER
- **clientErrorSchema** (call) — `z.object({
  msg: z.string().default(''),
  stack: z.string().default(''),...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/log-client-error/index.ts::log-client-error_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `corsHeaders` — CORS başlıklarını istekten elde eden fonksiyonun dönüş değeri
  - `cors` — CORS başlıkları nesnesi, istek için erişim izinlerini tanımlar
  - `requestId` — Benzersiz istek tanımlayıcısı, crypto.randomUUID() veya Date.now() ile üretilir
  - `supabaseUrl` — Deno ortam değişkeninden alınan Supabase proje URL'i
  - `serviceRoleKey` — Deno ortam değişkeninden alınan Supabase servis rol anahtarı
  - `allowedOrigins` — ALLOWED_ORIGINS ortam değişkeninden split edilerek oluşturulan izin verilen origin listesi
  - `originHeader` — İstekten alınan 'origin' başlık değeri
  - `originToCheck` — Kontrol edilecek origin, önce header'dan, yoksa referer'dan alınır
  - `requireAuth` — REQUIRE_AUTH ortam değişkeninden okunan boolean değer, kimlik doğrulama zorunluluğunu belirler
  - `supabase` — createClient ile oluşturulan Supabase istemcisi
  - `authHeader` — İstekten alınan authorization başlık değeri
  - `accessToken` — authHeader'dan slice ile çıkarılan Bearer token
  - `authData` — supabase.auth.getUser çağrısının dönüşündeki data nesnesi
  - `authErr` — supabase.auth.getUser çağrısının dönüşündeki error nesnesi
  - `rawBody` — req.json() ile parse edilen ham istek gövdesi
  - `parsed` — clientErrorSchema.safeParse ile doğrulanmış veri
  - `payload` — parsed.data'dan gelen doğrulanmış hata verisi
  - `mask` — PII маскировlama için iç fonksiyon, email ve uzun string'leri maskeler
  - `firstLine` — payload.stack'in ilk satırı, hata izini temsil eder
  - `urlObj` — payload.url'den oluşturulmaya çalışılan URL nesnesi
  - `_path` — urlObj pathname değeri, istek yolunu temsil eder
  - `signature` — Hata gruplandırma için imza, msg, firstLine ve _path'in maskelenmiş birleşimidir
  - `groupId` — error_groups tablosundan upsert ile elde edilen grup ID'si
  - `groupPayload` — error_groups tablosuna upsert edilecek nesne
  - `upsertRow` — error_groups upsert çağrısının dönüşündeki satır verisi
  - `q` — signature ile error_groups tablosundan ID sorgulama sonucu
  - `dedupSeconds` — DEDUP_SECONDS ortam değişkeninden okunan saniye cinsinden dedup penceresi
  - `since` — dedupSeconds kullanılarak hesaplanan ISO tarih stringi
  - `recent` — client_errors tablosundan son dedupSeconds içindeki aynı gruba ait hatalar
  - `row` — client_errors tablosuna insert edilecek satır verisi
  - `error` — client_errors insert çağrısının dönüşündeki hata nesnesi
  - `msg` — error nesnesinden çıkarılan hata mesajı stringi
  - `level` — payload.level değerinden alınan hata seviyesi stringi
  - `env` — payload.env değerinden alınan ortam bilgisi stringi
  - `notifyEnabled` — SLACK_WEBHOOK_URL ortam değişkeninin varlığını kontrol eden boolean
  - `isCritical` — level'ın 'fatal' veya 'error' olup olmadığını belirleyen boolean
  - `shortMsg` — payload.msg'nin ilk 200 karakteri, Slack bildirimi için kısaltılmış mesaj
  - `fields` — Slack bildirimi için alanlar dizisi (signature, level, env, URL, request-id)
- **Dönüş**: `Response` — HTTP yanıt nesnesi, farklı durumlarda değişik status kodları ile döner

---

## NODE ID STANDARD

  file: supabase\functions\log-client-error\index.ts
  function: supabase\functions\log-client-error\index.ts::log-client-error_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: log-client-error_handler