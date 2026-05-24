---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\_shared\rate_limit.ts
skeleton_hash: d2e039f95972e4b1
generated_at: 2026-05-24T10:45:21Z
---

## Genel Bakış
Bu modül, sunucusuz fonksiyonlara gelen isteklerin belirli bir zaman dilimi içinde izin verilen eşiği aşmasını engelleyen bir hız sınırlama sistemi sağlar. Her istemci için benzersiz bir anahtar ve Supabase servis rolü anahtarı kullanarak güvenli bir şekilde sınır kontrolü yapar. Kontrol sonucu, istemci tarafında yorumlanabilmesi için standart HTTP başlıklarına dönüştürülür.

## Fonksiyon Grupları
### Hız Sınırı Karar Mekanizması
İstek anahtarını ve hizmet konfigürasyonunu kullanarak Supabase üzerinde ilgili kaydı sorgular ve isteğin geçerli zaman penceresinde kabul edilip edilmeyeceğine karar verir.
- checkRateLimit

### Yanıt Başlıkları Üreticisi
Hız sınırı kontrolü sonucunda elde edilen limit, kalan hak ve sıfırlanma zamanı bilgilerini standart HTTP başlık formatına dönüştürür.
- rateLimitHeaders

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `key` boş bir string ise, `checkRateLimit` işlevi geçerli bir istemci kimliği sağlayamadığı için sınır kontrolü yapılamaz.  
[Aksiyom 2]: Eğer `fetchBase` boş bir string ise, Supabase endpointine ulaşılmadığı için istek gönderilemez ve fonksiyon hataya yol açar.  
[Aksiyom 3]: Eğer `serviceRoleKey` boş bir string ise, Supabase servisiyle yetkisiz erişim denemesi yapıldığı için işlem yetkisiz reddedilir.  
[Aksiyom 4]: Eğer `opts` nesnesi sağlanıyorsa ve `opts.limit` tanımlıysa, bu değer sıfır veya negatif bir sayı ise, sınırlama mantığı anlamını yitirir ve geçersiz bir sınır değeri kabul edilir.  
[Aksiyom 5]: Eğer `opts` nesnesi sağlanıyorsa ve `opts.windowSec` tanımlıysa, bu değer sıfır veya negatif bir sayı ise, zaman penceresinin geçerli bir süre olmadığı için sınırlama kontrolü doğru çalışmaz.  
[Aksiyom 6]: Eğer `rateLimitHeaders` fonksiyonuna `limit` parametresi negatif bir sayı geçerse, başlıkta bildirilen izin verilen istek sayısı anlamsız olur.  
[Aksiyom 7]: Eğer `rateLimitHeaders` fonksiyonuna `remaining` parametresi negatif bir sayı geçerse, kalan hak değeri mantıksız olur ve istemciye yanlış bilgi iletilir.  
[Aksiyom 8]: Eğer `rateLimitHeaders` fonksiyonuna `resetAt` parametresi geçerli bir tarih‑saat stringi (ISO 8601 vb.) değilse, başlıkta sıfırlanma zamanı bilgisi istemci tarafından çözülemez.  
[Aksiyom 9]: Eğer `rateLimitHeaders` fonksiyonuna `remaining` değeri `limit` değerinden büyükse, kalan hak izin verilen sınırı aşmış olur; bu durum sistem tutarsızlığını gösterir ve başlık bilgisi güvenilir değildir.

---

---

## FONKSIYON DETAYLARI

### checkRateLimit
**Ne yapar**: Belirtilen anahtar (`key`) için, verilen temel URL (`fetchBase`) ve servis rolü anahtarı (`serviceRoleKey`) kullanarak, bir rate limit kontrolü gerçekleştirir. Bu kontrol, isteğin geçerli limit içinde olup olmadığını belirler ve kalan izinli istek sayısını döndürür.  
**Nasıl yapar**: Fonksiyon, `fetchBase` üzerinden bir HTTP isteği göndererek ilgili servisden rate limit bilgilerini alır. Gelen yanıtın içinde limit, pencere süresi ve kalan istek sayısı bulunur. Opsiyonel `opts` parametresi ile limit ve pencere süresi üzerine geçersiz kılma (override) yapılabilir. İstek başarılı ise, `result` alanı `true` olarak işaretlenir; aksi takdirde `false` döner.  
**Parametreler**:
- key: string — Rate limit kontrolü yapılacak benzersiz anahtar (örneğin kullanıcı ID veya IP adresi).
- fetchBase: string — Rate limit bilgilerini almak için kullanılan temel API URL’si.
- serviceRoleKey: string — API’ye erişim için kullanılan servis rolü anahtarı.
- opts?: { limit?: number; windowSec?: number } — Opsiyonel yapılandırma nesnesi; `limit` ile maksimum istek sayısı, `windowSec` ile pencere süresi (saniye cinsinden) belirlenebilir.
**Dönüş**: `{ result, limit, windowSec }` — `result` (boolean) istek limit içinde olup olmadığını gösterir; `limit` (number) geçerli limit değeri; `windowSec` (number) geçerli pencere süresi.

### rateLimitHeaders
**Ne yapar**: Rate limit ile ilgili bilgileri HTTP yanıt başlıklarına ekler. Bu başlıklar, istemcinin kalan istek sayısı, limit ve reset zamanını bilmesini sağlar.  
**Nasıl yapar**: Fonksiyon, `limit`, `remaining` ve `resetAt` parametrelerini alarak, uygun başlık adlarını (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) oluşturur ve bunları yanıt nesnesine ekler. Başlıkların formatı, standart rate limit uygulamalarına uygun olarak belirlenir.  
**Parametreler**:
- limit: number — Günlük veya periyodik maksimum istek sayısı.
- remaining: number — Şu anda kalan izinli istek sayısı.
- resetAt: string — Limitin sıfırlanacağı zaman dilimini ISO 8601 formatında gösterir.  
**Dönüş**: `void` — Fonksiyon yanıt başlıklarını günceller, doğrudan bir değer döndürmez.

---

## TYPE ALIASES

### RateLimitResult
```typescript
type RateLimitResult = { allowed: boolean; remaining: number; resetAt: string }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/_shared/rate_limit.ts::checkRateLimit
- **params**: key: string, fetchBase: string, serviceRoleKey: string, opts?: { limit?: number; windowSec?: number }
- **ic_degiskenler**:
  - `limit` — number derived from opts?.limit or env var RATE_LIMIT_PER_MINUTE (default 60), clamped to minimum 1
  - `windowSec` — number derived from opts?.windowSec or env var RATE_LIMIT_WINDOW_SEC (default 60), clamped to minimum 1
  - `body` — RPC payload object { p_key: key, p_limit: limit, p_window_seconds: windowSec } sent to the Supabase function
  - `resp` — Response from fetch to the bump_rate_limit RPC endpoint
  - `data` — parsed JSON array from resp.json(); fallback to empty array on error
  - `row` — first element of data if present, otherwise a fallback object with allowed true, remaining limit-1, reset_at set to now+windowSec seconds
  - `result` — RateLimitResult object containing allowed (boolean), remaining (number), resetAt (ISO string) extracted from row
- **Dönüş**: { result: RateLimitResult, limit: number, windowSec: number }

### [N2_NASIL] AST Pointer: supabase/functions/_shared/rate_limit.ts::rateLimitHeaders
- **params**: limit: number, remaining: number, resetAt: string
- **ic_degiskenler**: - (yok)
- **Dönüş**: Record<string,string> containing RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset headers

---

## NODE ID STANDARD

  file: supabase\functions\_shared\rate_limit.ts
  function: supabase\functions\_shared\rate_limit.ts::checkRateLimit
  function: supabase\functions\_shared\rate_limit.ts::rateLimitHeaders

---

## DISA AKTARILANLAR (EXPORTS)
  export: RateLimitResult
  export: checkRateLimit
  export: rateLimitHeaders