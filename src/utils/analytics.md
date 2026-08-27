---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\utils\analytics.ts
skeleton_hash: 2744449f19164fdb
entity_hashes:
  func:trackEvent: 561450afbdac10ee
  overview: 34daeb673bd862b6
generated_at: 2026-08-27T08:37:13Z
---

## Genel Bakış

Bu modül, uygulama genelinde olay takibi (event tracking) için kullanılan bir yardımcı araçtır. Dış dünyaya yalnızca tek bir fonksiyon sunar ve analitik verilerin merkezi bir noktadan iletilmesini sağlar.

## Fonksiyon Grupları

### Olay Takibi
Uygulama içinde gerçekleşen kullanıcı eylemlerini veya sistem olaylarını ad ve parametre bilgisiyle birlikte kaydeder.
- trackEvent

## Bağımlılıklar

Modülün dış bağımlılıkları verilen kaynak bilgiden tespit edilememiştir. Dinamik veya lazy yüklenen bir alt modül bilgisi de mevcut değildir. Mimari açıdan bu modül, uygulamanın analitik altyapısının giriş noktasıdır; diğer modüller olay takibi gerektiğinde bu modülü çağırır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediği için `trackEvent` fonksiyonunun doğru çalışması için hangi koşulların var olması gerektiğini belirleyecek bilgi bulunmamaktadır. Yalnızca fonksiyon imzası (`name: string, params: Record<string, unknown>`) mevcuttur; bu imza tek başına bir aksiyom üretmek için yeterli değildir.

---

## FONKSİYON DETAYLARI

### trackEvent
**Ne yapar**: Analitik olaylarını güvenli bir şekilde takip eder. GA4 (`gtag`) veya GTM (`dataLayer`) sistemlerine olay gönderir; her ikisi de mevcut değilse sessizce başarısız olur veya geliştirme/hata ayıklama modlarında konsola log düşer. Analitik rızası olmayan kullanıcılar için hiçbir veri gönderilmez — rızası olmayan kullanıcı da "rıza vermemiş" sayılır (opt-in); sessiz kabul yoktur.

**Nasıl yapar**: Fonksiyon öncelikle sunucu tarafı render (SSR) ortamında olup olmadığını kontrol eder; `window` tanımlı değilse hemen çıkar. Ardından `hasConsent('analytics')` fonksiyonu ile analitik rızası kontrolü yapar; rıza yoksa olay gönderilmez, yalnızca `window.DEBUG_ANALYTICS` true ise konsola uyarı logu düşer. Rıza mevcutsa, öncelikle `window.gtag` fonksiyonu aranır; bulunursa GA4 formatında (`gtag('event', name, params)`) olay gönderilir. `gtag` yoksa `window.dataLayer` array olup olmadığı kontrol edilir; uygunsa GTM formatında (`dataLayer.push({ event: name, ...params })`) gönderilir. Her iki durumda da `delivered` değişkeni true yapılır. `window.DEBUG_ANALYTICS` true olduğunda tüm olaylar konsola loglanır. Geliştirme ortamında (`process.env.NODE_ENV === 'development'`) GA/GTM mevcut değilse ve debug açıksa, `analytics:dev-fallback` etiketiyle ek log düşülür. Tüm işlem bir `try-catch` bloğu içinde sarılıdır; oluşan hatalar yutularak uygulama çökmesi önlenir.

**Parametreler**:
- `name`: `string` — Takip edilecek olayın adı (örneğin `'add_to_cart'`).
- `params`: `Record<string, unknown>` — Olay için ek parametreler ve meta veriler. Varsayılan değeri boş bir objedir (`{}`).

**Dönüş**: `void` — Fonksiyon herhangi bir değer döndürmez.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/consent::hasConsent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/analytics.ts::trackEvent
- **params**:
  - `name` — gönderilecek analitik olayın adı (string)
  - `params` — olayla birlikte gönderilecek ek parametreler; varsayılan değeri boş nesne `{}` (Record<string, unknown>)
- **ic_degiskenler**:
  - `delivered` — olayın GA/GTM sistemine başarıyla iletilip iletilmediğini izleyen boolean bayrak; başlangıçta `false`, `window.gtag` veya `window.dataLayer` üzerinden gönderim başarılıysa `true` yapılır
- **Dönüş**: yok (void)

**Yan etkiler ve davranış:**
- `typeof window === 'undefined' ise` fonksiyon sessizce çıkar (SSR koruması).
- `hasConsent('analytics')` çağrısı ile rıza kontrolü yapılır; rıza yoksa (`!hasConsent('analytics')`) hiçbir veri gönderilmez ve fonksiyondan çıkılır. Karar verilmemiş kullanıcı da rıza vermemiş sayılır (opt-in modeli).
- Rıza reddedildiğinde ve `window.DEBUG_ANALYTICS` truthy ise `console.warn('[analytics:blocked-no-consent]', name)` ile uyarı basılır.
- `window.gtag` bir fonksiyon ise `window.gtag('event', name, params)` çağrısı yapılır ve `delivered` `true` olur.
- `window.gtag` yoksa ve `window.dataLayer` bir dizi ise `window.dataLayer.push({ event: name, ...params })` ile olay gönderilir ve `delivered` `true` olur.
- `window.DEBUG_ANALYTICS` truthy ise her durumda `console.warn('[analytics]', name, params)` ile debug logu basılır.
- `delivered` hâlâ `false` ise ve `process.env.NODE_ENV === 'development'` ise ve `window.DEBUG_ANALYTICS` truthy ise `console.warn('[analytics:dev-fallback]', name, params)` ile geliştirme ortamı uyarısı basılır.
- Tüm gövde `try-catch` ile sarılıdır; oluşan hatalar yutulur (uygulama çökmesi engellenir).

---

## NODE ID STANDARD

  file: src\utils\analytics.ts
  function: src\utils\analytics.ts::trackEvent

---

## DISA AKTARILANLAR (EXPORTS)
  export: trackEvent