---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\hooks\useApiCall.ts
skeleton_hash: 95b8fea9a8f314c7
entity_hashes:
  func:useApiCall: 42a6f8dca553808c
  overview: 345d6974057e4bc1
generated_at: 2026-08-25T07:27:01Z
---

## Genel Bakış

Bu modül, API çağrılarını yönetmek için kullanılan bir React hook'u tanımlar. Modül, `useApiCall` adında tek bir fonksiyon içerir ve opsiyonel bir yapılandırma parametresi alır.

## Fonksiyon Grupları

### API Çağrı Yönetimi
API çağrılarını gerçekleştirmek ve yönetmek için kullanılan ana hook fonksiyonunu içerir. Fonksiyon, isteğe bağlı `UseApiCallOptions` parametresi aracılığıyla davranışını yapılandırma imkanı sunar.
- useApiCall

## Notlar

Modül hakkında sağlanan bilgi sınırlıdır. Fonksiyonun döndürdüğü değer, desteklediği HTTP metodları, hata yönetimi mekanizması, yükleme durumu takibi gibi detaylar kaynakta belirtilmemiştir. Bu nedenle fonksiyonun tam yetenekleri bilinmemektedir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Modüle ait fonksiyon gövdesi sağlanmamıştır. Yalnızca fonksiyon imzası (`def useApiCall(defaultOptions?: UseApiCallOptions)`) mevcuttur ve mimari varsayımlar yalnızca fonksiyon gövdesinden türetilir. İmzadan, docstring'lerden veya değişken isimlerinden aksiyom çıkarılmaz.

---

## FONKSİYON DETAYLARI

### useApiCall
**Ne yapar**: Asenkron API çağrıları için yükleme (loading), veri (data) ve hata (error) durumlarını yöneten özel bir React hook'udur. API çağrılarının yürütülmesini standart bir şekilde ele alır; başarılı ve hata senaryoları için yerleşik toast bildirimleri sağlar.

**Nasıl yapar**: `useState` ile `data`, `loading` ve `error` durumlarını izler. `useI18n()` hook'u aracılığıyla uluslararasılaştırma desteği alır. `useCallback` ile memoize edilmiş `execute` ve `reset` fonksiyonları tanımlar. `execute` fonksiyonu çağrıldığında önce `loading` durumunu `true` yapar ve `error` durumunu sıfırlar, ardından verilen asenkron fonksiyonu çalıştırır. Başarılı olursa sonucu `data`'ya kaydeder ve `mergedOptions.showToast` ile `mergedOptions.successMessage` tanımlıysa başarı toast'ı gösterir. Hata durumunda, hata bir `Error` nesnesi değilse `String(err)` ile `Error` nesnesine dönüştürülür, `error` durumuna kaydedilir ve `mergedOptions.showToast` `false` değilse hata toast'ı gösterilir. Hata mesajı olarak önce `mergedOptions.errorMessage`, ardından `error.message`, en son olarak `t('common.errorGeneric')` kullanılır. `reset` fonksiyonu tüm durumları başlangıç değerlerine sıfırlar. `defaultOptions` ve `options` birleştirilerek (spread ile) `mergedOptions` oluşturulur; bu sayede çağrı bazlı seçenekler varsayılan seçeneklerin üzerine yazılabilir.

**Parametreler**:
- `defaultOptions`: `UseApiCallOptions` (opsiyonel) — Tüm `execute` çağrılarına uygulanacak varsayılan toast mesajı ayarları. `showToast`, `successMessage` ve `errorMessage` alanlarını içerebilir.

**Dönüş**: `{ data: T | null, loading: boolean, error: Error | null, execute: (apiFunc: () => Promise<T>, options?: UseApiCallOptions) => Promise<T | null>, reset: () => void }` — Mevcut durumu (`data`, `loading`, `error`), API çağrılarını yürütmek için `execute` metodunu ve durumu sıfırlamak için `reset` metodunu içeren bir nesne döndürür. `data` generic tip `T` veya `null` olabilir; `error` bir `Error` nesnesi veya `null` olabilir. `execute` fonksiyonu, verilen asenkron fonksiyonu çalıştırır ve başarılı olursa `T` tipinde sonuç, hata durumunda `null` döndürür. `options` parametresi, bu belirli çağrı için `defaultOptions` üzerine yazılabilir seçenekler sunar.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/I18nProvider::useI18n
- import: react::useCallback
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### ApiCallState
- `data: T | null`
- `loading: boolean`
- `error: Error | null`

### UseApiCallOptions
- `showToast?: boolean`
- `successMessage?: string`
- `errorMessage?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useApiCall.ts::useApiCall
- **params**: `defaultOptions?: UseApiCallOptions` — opsiyonel, API çağrıları için varsayılan seçenekler (showToast, successMessage, errorMessage vb.)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; hata mesajı fallback'inde kullanılır
  - `state` — `useState<ApiCallState<T>>` ile tutulan durum nesnesi; `data` (T | null), `loading` (boolean), `error` (Error | null) alanlarını içerir
  - `setState` — `state` durumunu güncelleyen setter fonksiyonu
  - `execute` — `useCallback` ile sarılmış async fonksiyon; bir API fonksiyonunu çağırır, sonucu state'e yazar, toast bildirimi gösterir
  - `reset` — `useCallback` ile sarılmış fonksiyon; state'i başlangıç değerine sıfırlar
- **Dönüş**: `{ data, loading, error, execute, reset }` — state alanları ile `execute` ve `reset` fonksiyonlarını içeren nesne

---

### [N2_NASIL] AST Pointer: src/hooks/useApiCall.ts::execute (useApiCall içindeki useCallback)
- **params**: `apiFunc: () => Promise<T>` — çağrılacak async API fonksiyonu; `options?: UseApiCallOptions` — bu çağrıya özel opsiyonlar
- **ic_degiskenler**:
  - `mergedOptions` — `{ ...defaultOptions, ...options }` ile oluşturulan birleşik seçenekler nesnesi; dış scope'daki `defaultOptions` ile parametre `options` birleştirilir
  - `result` — `await apiFunc()` sonucu dönen değer (tip: T); başarılı durumda state.data'ya atanır ve return edilir
  - `err` — catch bloğunda yakalanan hata (tip: unknown)
  - `error` — `err` değerinden türetilen Error nesnesi; `err instanceof Error` kontrolü yapılır, değilse `new Error(String(err))` ile dönüştürülür; state.error'a atanır
  - `setState` — dış scope'dan erişilen state setter; loading/error/data güncellemelerinde kullanılır
  - `defaultOptions` — dış scope'dan erişilen varsayılan seçenekler parametresi
  - `t` — dış scope'dan erişilen çeviri fonksiyonu; `mergedOptions.errorMessage` yoksa `t('common.errorGeneric')` ile genel hata mesajı alınır
  - `toast` — `sonner` kütüphanesinden import edilen bildirim aracı; `toast.success()` ve `toast.error()` çağrılarıyla kullanılır
- **Dönüş**: `Promise<T | null>` — başarılıysa `result` (T), hata durumunda `null`

---

### [N3_NASIL] AST Pointer: src/hooks/useApiCall.ts::reset (useApiCall içindeki useCallback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setState` — dış scope'dan erişilen state setter; `{ data: null, loading: false, error: null }` ile state'i başlangıç değerine sıfırlar
- **Dönüş**: yok (void)

---

## NODE ID STANDARD

  file: useApiCall.ts
  function: useApiCall.ts::useApiCall

---

## DISA AKTARILANLAR (EXPORTS)
  export: useApiCall