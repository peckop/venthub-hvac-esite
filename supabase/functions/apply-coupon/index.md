---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\supabase\functions\apply-coupon\index.ts
skeleton_hash: 17910a863d285283
entity_hashes:
  func:apply-coupon_handler: a399f5149250ae7f
  func:buildCors: 317be5b9cff201e9
  overview: ffd2f02daad367fc
generated_at: 2026-08-25T07:33:26Z
---

## Genel Bakış

Bu modül, Supabase Edge Function altyapısı üzerinde çalışan bir kupon uygulama servisidir. Gelen HTTP isteklerini karşılayarak kupon uygulama işlemini gerçekleştirir ve istemci tarafı erişim politikasını yönetir.

## Fonksiyon Grupları

### CORS Yapılandırması
İstemcilerden gelen isteklerin tarayıcı güvenlik politikalarına uygun şekilde yanıtlanabilmesi için gerekli CORS başlıklarını oluşturur.
- buildCors

### Ana İşlem Handler'ı
Servisin giriş noktasıdır. Gelen HTTP isteklerini işleyerek kupon uygulama mantığını çalıştırır ve istemciye uygun yanıtı döndürür. Deno sunucusu tarafından çağrılır.
- apply-coupon_handler

## Bağımlılıklar

**Dış Bağımlılıklar:**
- Deno çalışma zamanı (serve fonksiyonu aracılığıyla)
- Supabase platformu (Edge Function altyapısı)

**İç Bağımlılıklar:**
- apply-coupon_handler, CORS başlıklarını oluşturmak için buildCors fonksiyonunu çağırır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarılabilecek sınırlı varsayımlar mevcuttur.

**[Aksiyom 1]**: Eğer `buildCors` fonksiyonuna geçerli bir `Request` nesnesi sağlanmazsa, CORS header'ları oluşturulamaz ve tarayıcı tabanlı istemciler bu fonksiyona erişemez.

**[Aksiyom 2]**: Eğer `apply-coupon_handler` fonksiyonuna geçerli bir `Request` nesnesi sağlanmazsa, kupon uygulama işlemi gerçekleştirilemez ve bir `Response` üretilmez.

**[Aksiyom 3]**: Eğer bu modül Deno runtime ortamında (`@serve(Deno.serve)` decorator'ü) çalıştırılmazsa, fonksiyon çağrılamaz.

---

**Not**: Fonksiyon gövdeleri (iç mantık, veritabanı bağlantıları, eşik değerleri, hata yönetimi vb.) sağlanmadığından, bu modülün işlevsel davranışına ilişkin daha detaylı aksiyomlar belirlenememiştir. Detaylı aksiyomlar için fonksiyon gövdesi kodu gereklidir.

---

## FONKSİYON DETAYLARI

### buildCors
**Ne yapar**: Gelen HTTP isteğinin kaynağını (origin) kontrol ederek, CORS (Cross-Origin Resource Sharing) politikasına uygun başlıkları ve isteğin izin verilip verilmediğini gösteren bir `ok` durumunu döndürür.
**Nasıl yapar**: Fonksiyon, isteğin `origin` başlığını alır. Ardından `ALLOWED_ORIGINS` ortam değişkenini okuyarak virgülle ayrılmış izin verilen origin listesini oluşturur. Eğer bu liste boşsa tüm originlere izin verilir; doluysa gelen origin'in bu listede olup olmadığı kontrol edilir. Sonuç olarak, `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers` ve `Access-Control-Allow-Methods` başlıklarını içeren bir nesne ile birlikte isteğin geçerli olup olmadığını belirten `ok` değerini döndürür.
**Parametreler**:
- req: Request — CORS başlıklarının oluşturulması için kontrol edilecek gelen HTTP isteği nesnesi.
**Dönüş**: `{ headers: Record<string, string>, ok: boolean }` — `headers` alanı, CORS yanıt başlıklarını; `ok` alanı ise isteğin izin verilen bir kaynaktan gelip gelmediğini gösterir.

### apply-coupon_handler
**Ne yapar**: `@serve(Deno.serve)` dekoratörü ile tanımlanmış, bir HTTP isteğini işleyerek yanıt döndüren ana işleyici fonksiyondur. Görevi, kupon uygulama mantığını yürütmektir.
**Nasıl yapar**: Fonksiyonun gövdesi verilen kaynakta yer almadığı için iç mantığı bilinmiyor. Ancak `@serve(Deno.serve)` dekoratörü, bu fonksiyonun Deno'nun yerleşik HTTP sunucusu tarafından bir istek işleyici (handler) olarak kaydedilmesini sağlar. Fonksiyon, bir `Request` nesnesi alıp bir `Response` nesnesi döndürecek şekilde tasarlanmıştır.
**Parametreler**:
- req: Request — Fonksiyon tarafından işlenecek gelen HTTP isteği nesnesi.
**Dönüş**: Response — Fonksiyonun işlediği isteğe karşılık olarak döndürülen HTTP yanıt nesnesi.

---

## İTHALATLAR (IMPORTS)
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## TYPE ALIASES

### CouponRow
```typescript
type CouponRow = {
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_order_amount: number | null
  valid_from: string | null
  valid_until: string | null
  is_acti
```

### ApplyCouponReq
```typescript
type ApplyCouponReq = {
  code: string
  subtotal: number
}
```

### ApplyCouponResp
```typescript
type ApplyCouponResp = {
  valid: boolean
  reason?: string
  discount_amount?: number
  final_total?: number
  normalized_code?: string
  details?: string
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/apply-coupon/index.ts::buildCors
- **params**: `req: Request` — gelen HTTP isteği
- **ic_degiskenler**:
  - `origin` — `req.headers.get('origin')` sonucu; boş string fallback ile CORS kaynak başlığı
  - `allowed` — `Deno.env.get('ALLOWED_ORIGINS')` ortam değişkeninin virgülle ayrılmış, trimlenmiş, boş olmayan değerler dizisi
  - `ok` — `allowed` dizisi boşsa true; değilse `origin` değerinin `allowed` dizisinde bulunup bulunmadığı boolean'ı
  - `headers` — CORS yanıt başlıklarını içeren nesne: `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`
- **Dönüş**: `{ headers, ok }` — CORS başlıkları ve origin doğrulama sonucu

### [N2_NASIL] AST Pointer: supabase/functions/apply-coupon/index.ts::apply-coupon_handler
- **params**: `req: Request` — gelen HTTP isteği
- **ic_degiskenler**:
  - `requestId` — `crypto.randomUUID()` varsa onu, yoksa `String(Date.now())` ile oluşturulan benzersiz istek tanımlayıcısı
  - `cors` — `buildCors(req)` çağrısının dönüşü; `{ headers, ok }` nesnesi
  - `ct` — `req.headers.get('content-type')` sonucu, `.toLowerCase()` ile küçük harfe dönüştürülmüş content-type değeri
  - `max` — `Deno.env.get('MAX_BODY_KB')` ortam değişkeninden parseInt ile parse edilen, 1024 ile çarpılarak bayta dönüştürülen maksimum gövde boyutu (varsayılan 100KB)
  - `cl` — `req.headers.get('content-length')` sonucu parseInt ile sayıya dönüştürülmüş istek gövdesi uzunluğu
  - `SUPABASE_URL` — `Deno.env.get('SUPABASE_URL')` ortam değişkeni
  - `SUPABASE_SERVICE_ROLE_KEY` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ortam değişkeni
  - `supabase` — `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` ile oluşturulan Supabase istemcisi
  - `forwarded` — `req.headers.get('x-forwarded-for')` sonucu; proxy zincirindeki IP adresleri
  - `ip` — `x-real-ip`, `cf-connecting-ip` veya `forwarded` başlıklarından çıkarılan istemci IP adresi; bulunamazsa `'unknown'`
  - `key` — rate limiting için `` `coupon:${ip}` `` formatında anahtar
  - `checkRateLimit` — `../_shared/rate_limit.ts` modülünden dinamik import edilen rate limit kontrol fonksiyonu
  - `rateLimitHeaders` — `../_shared/rate_limit.ts` modülünden dinamik import edilen rate limit başlık üreten fonksiyon
  - `result` — `checkRateLimit` fonksiyonunun dönüşü; `result.allowed`, `result.remaining`, `result.resetAt` alanlarını içerir
  - `rl` — `rateLimitHeaders` fonksiyonundan dönen rate limit yanıt başlıkları
  - `body` — `req.json()` ile parse edilen istek gövdesi; `ApplyCouponReq` tipinde cast edilmiş
  - `code` — `body?.code` alanının `String()` ile dönüştürülüp `.trim()` edilmiş kupon kodu
  - `subtotal` — `body?.subtotal` alanının `Number()` ile dönüştürülmüş sipariş ara toplamı
  - `data` — Supabase `coupons` tablosundan dönen sorgu sonucu veri
  - `error` — Supabase sorgusundan dönen hata nesnesi
  - `row` — `data` değişkeninin `CouponRow | null` tipinde cast edilmiş hali; kupon satırı
  - `now` — `Date.now()` ile elde edilen mevcut zaman damgası (milisaniye)
  - `startsOk` — `row.valid_from` yoksa true; varsa `new Date(row.valid_from).getTime() <= now` kontrolü
  - `endsOk` — `row.valid_until` yoksa true; varsa `new Date(row.valid_until).getTime() > now` kontrolü
  - `activeOk` — `row.is_active` alanının boolean dönüşümü
  - `limitOk` — `row.usage_limit` null ise true; değilse `row.used_count < row.usage_limit` kontrolü
  - `minOk` — `row.minimum_order_amount` null ise true; değilse `subtotal >= row.minimum_order_amount` kontrolü
  - `discount` — hesaplanan indirim miktarı; `discount_type` `'percentage'` ise `(subtotal * discount_value) / 100`, değilse `discount_value` doğrudan kullanılır; subtotal'ı aşamaz
  - `finalTotal` — `(subtotal - discount).toFixed(2)` ile hesaplanan iki ondalıklı nihai tutar
  - `resp` — başarılı yanıt nesnesi: `{ valid: true, discount_amount, final_total, normalized_code }` (`ApplyCouponResp` tipinde)
  - `_e` — `catch` bloğunda yakalanan hata nesnesi
  - `msg` — `_e` Error ise `.message`, değilse `String(_e)` ile elde edilen hata mesajı
- **Dönüş**: `Response` — durum kodu ve JSON gövdesi içeren HTTP yanıtı

---

## NODE ID STANDARD

  file: index.ts
  function: index.ts::buildCors
  function: index.ts::apply-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: apply-coupon_handler
  export: buildCors