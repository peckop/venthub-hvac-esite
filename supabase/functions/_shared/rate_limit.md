---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\supabase\functions\_shared\rate_limit.ts
skeleton_hash: ab4c12eebd37adf1
entity_hashes:
  func:checkRateLimit: eb2ddca9002ea24b
  func:rateLimitHeaders: 8e57db019805fbe0
  overview: 2d23853bbec3dccf
generated_at: 2026-08-27T07:09:15Z
---

## Genel Bakış
Bu modül, API isteklerinin hız sınırlaması (rate limit) kontrolünü yapar ve sonuç bilgilerini HTTP yanıt başlıklarına dönüştürür. Supabase tabanlı bir harici rate limiting servisiyle iletişim kurarak istek limitlerini denetler.

## Fonksiyon Grupları
### Rate Limit Kontrolü
Belirtilen anahtar için hız sınırlaması durumunu harici bir servisten sorgular. Opsiyonel olarak limit sayısı ve zaman penceresi belirtilebilir.
- checkRateLimit

### HTTP Başlık Oluşturma
Rate limit sonucundaki limit, kalan hak ve sıfırlanma zamanı bilgilerini HTTP yanıt başlıklarına uygun formata çevirir.
- rateLimitHeaders

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### checkRateLimit
**Ne yapar**: Belirli bir anahtar (key) için istek oran sınırlaması (rate limit) kontrolü yapan asenkron bir fonksiyondur. Supabase veritabanında tanımlı bir RPC fonksiyonunu çağırarak isteğin izin verilip verilmediğini, kalan istek hakkını ve sıfırlanma zamanını döndürür.

**Nasıl yapar**: Fonksiyon öncelikle `limit` ve `windowSec` değerlerini belirler. Bu değerler ya doğrudan `opts` parametresinden ya da ortam değişkenlerinden (`RATE_LIMIT_PER_MINUTE` ve `RATE_LIMIT_WINDOW_SEC`) okunur; her ikisi de yoksa varsayılan olarak 60 kullanılır. Geçersiz (sonlu olmayan veya sıfır/negatif) değerler tespit edilirse 60'a sıfırlanır. Ardından Supabase'in `/rest/v1/rpc/bump_rate_limit` endpoint'ine POST isteği gönderilir. İstek gövdesinde `p_key`, `p_limit` ve `p_window_seconds` alanları yer alır. `serviceRoleKey` hem `Authorization` başlığında hem de `apikey` başlığında gönderilir; `Prefer: return=representation` ile yanıtın temsilî veri olarak dönmesi istenir. Yanıt başarısız olursa hata fırlatılır. Yanıt JSON'u ayrıştırılamazsa boş dizi varsayılır; dizi geçerli değilse veya boşsa, `allowed: true`, `remaining: limit-1` ve `reset_at` olarak şu anki zamandan `windowSec` saniye sonrasını içeren varsayılan bir nesne kullanılır. Sonuç, `allowed` (boolean), `remaining` (number) ve `resetAt` (string) alanlarını içeren bir nesneye dönüştürülerek `limit` ve `windowSec` değerleriyle birlikte döndürülür.

**Parametreler**:
- key: string — Rate limit kontrolünün yapılacağı benzersiz anahtar (örneğin kullanıcı kimliği veya IP adresi)
- fetchBase: string — Supabase API'sinin temel URL'si (örneğin `https://xxx.supabase.co`)
- serviceRoleKey: string — Supabase service role anahtarı; yetkilendirme ve kimlik doğrulama için kullanılır
- opts?: { limit?: number; windowSec?: number } — İsteğe bağlı ayarlar nesnesi. `limit`: pencere başına izin verilen maksimum istek sayısı. `windowSec`: rate limit penceresinin saniye cinsinden süresi

**Dönüş**: `{ result: RateLimitResult, limit: number, windowSec: number }` — `result` alanı `allowed` (boolean), `remaining` (number) ve `resetAt` (string) özelliklerini içerir. `limit` ve `windowSec` ise kullanılan nihai değerleri yansıtır.

### rateLimitHeaders
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## TYPE ALIASES

### RateLimitResult
```typescript
type RateLimitResult = { allowed: boolean; remaining: number; resetAt: string }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/_shared/rate_limit.ts::checkRateLimit
- **params**: `key: string`, `fetchBase: string`, `serviceRoleKey: string`, `opts?: { limit?: number; windowSec?: number }`
- **ic_degiskenler**:
  - `limit` — `opts?.limit` değeri varsa onu kullanır; yoksa `Deno.env.get('RATE_LIMIT_PER_MINUTE')` ortam değişkenini okur; o da yoksa 60 varsayılır. Sonuç `Number()` ile sayıya dönüştürülür. `Number.isFinite` kontrolü başarısız olursa veya değer 0'dan küçük/eşitse 60'a sıfırlanır.
  - `windowSec` — `opts?.windowSec` değeri varsa onu kullanır; yoksa `Deno.env.get('RATE_LIMIT_WINDOW_SEC')` ortam değişkenini okur; o da yoksa 60 varsayılır. Sonuç `Number()` ile sayıya dönüştürülür. `Number.isFinite` kontrolü başarısız olursa veya değer 0'dan küçük/eşitse 60'a sıfırlanır.
  - `body` — Supabase RPC endpoint'ine POST olarak gönderilecek JSON gövdesi. `p_key`, `p_limit`, `p_window_seconds` alanlarını içerir; `Record<string, unknown>` tipindedir.
  - `resp` — `fetchBase/rest/v1/rpc/bump_rate_limit` adresine POST isteği yapılarak elde edilen `Response` nesnesi. `Authorization` ve `apikey` başlıklarında `serviceRoleKey`, `Content-Type` olarak `application/json`, `Prefer` olarak `return=representation` gönderilir.
  - `data` — `resp.json()` ile ayrıştırılan yanıt gövdesi. `.catch(()=> [])` ile hata durumunda boş dizi döner. `Array<{ allowed: boolean; remaining: number; reset_at: string }>` tipindedir.
  - `row` — `data` dizisinin ilk elemanı (`data[0]`). Dizi değilse veya ilk eleman yoksa varsayılan değer kullanılır: `{ allowed: true, remaining: limit-1, reset_at: şu anki zaman + windowSec saniye }`.
  - `result` — `RateLimitResult` tipinde nesne. `row.allowed` boolean'a, `row.remaining` sayıya (0 fallback ile), `row.reset_at` string'e dönüştürülerek atanır.
- **Dönüş**: `{ result: RateLimitResult, limit: number, windowSec: number }` — rate limit sonucu, kullanılan limit değeri ve pencere süresi. Hata durumunda `Error` fırlatır (`rate_limit_rpc_failed:{durum kodu}`).

### [N2_NASIL] AST Pointer: supabase/functions/_shared/rate_limit.ts::rateLimitHeaders
- **params**: `limit: number`, `remaining: number`, `resetAt: string`
- **ic_degiskenler**:
  - *(yok — doğrudan return ifadesi içinde hesaplamalar yapılır)*
- **Dönüş**: `Record<string, string>` — üç HTTP başlığı içeren nesne:
  - `RateLimit-Limit` — `limit` değerinin string hali
  - `RateLimit-Remaining` — `remaining` ile `Math.max(0, remaining)` arasındaki minimum (negatifse 0'a düşürülür), string hali
  - `RateLimit-Reset` — `resetAt` tarihinden şu anki zaman çıkarılıp 1000'e bölünerek saniye cinsinden kalan süre hesaplanır; `Math.ceil` ile yukarı yuvarlanır; `Math.max(1, ...)` ile en az 1 saniye garanti edilir; string hali

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