---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useApiCall.ts
skeleton_hash: e87790cb401d3b4b
entity_hashes:
  func:useApiCall: 42a6f8dca553808c
  overview: 345d6974057e4bc1
generated_at: 2026-08-27T08:34:17Z
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

## NODE ID STANDARD

  file: src\hooks\useApiCall.ts
  function: src\hooks\useApiCall.ts::useApiCall

---

## DISA AKTARILANLAR (EXPORTS)
  export: useApiCall