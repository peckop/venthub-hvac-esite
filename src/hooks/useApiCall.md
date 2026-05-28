---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useApiCall.ts
skeleton_hash: 00770ccd49233591
entity_hashes:
  func:useApiCall: ad3857eabf77c233
  overview: 0635a829e467e31a
generated_at: 2026-05-28T22:37:51Z
---

## Genel Bakış
Bu modül, React uygulamalarında API çağrılarını merkezi ve standart bir şekilde yönetmek için tasarlanmış bir hook sunar. Tüm HTTP isteklerinin durumunu takip etmeyi, hata yönetimi sağlamayı ve istek yapılandırmalarını opsiyonel parametrelerle özelleştirmeyi amaçlar.

## Fonksiyon Grupları
### Merkezi API Çağrı Orkestrasyonu
Bu grup, uygulama genelindeki tüm API etkileşimlerini başlatan, izleyen ve sonlandıran temel işlevi barındırır. Hook, istek ömrü boyunca yüklenme, başarı ve hata durumlarını yöneterek bileşenlere tutarlı bir veri akışı sağlar.
- useApiCall

### Özelleştirilebilir İstek Yapılandırması
Bu grup, varsayılan API davranışını ve istek parametrelerini uygulama ihtiyaçlarına göre ayarlama imkanı sunar. Hook'a iletilen opsiyonel yapılandırma seçenekleri, kimlik doğrulama, zaman aşımları veya özel başlıklar gibi parametrelerin merkezi olarak belirlenmesine olanak tanır.
- useApiCall

---

## AXIOMS – Mimari Varsayımlar
Bu hook, VentHub HVAC projesi içinde API çağrılarını merkezi olarak yönetmek ve stand

---

## FONKSİYON DETAYLARI

### useApiCall
**Ne yapar**: Asenkron API çağrıları için `loading`, `data` ve `error` durumlarını yöneten özel bir React hook'u oluşturur. API çağrılarının yürütülmesi sırasında otomatik olarak durum yönetimi sağlar ve başarı/hata senaryoları için toast bildirimleri sunar.

**Nasıl yapar**: `useState` ile `ApiCallState<T>` tipinde bir durum nesnesi oluşturur. Bu durum nesnesi `data`, `loading` ve `error` alanlarını içerir. Hook, çağrıcıya `execute` ve `reset` adlı iki方法 döndürür. `execute` çağrıldığında önce `loading: true` ayarlanır, ardından verilen asenkron fonksiyon çalıştırılır. Fonksiyon başarıyla tamamlanırsa `data` güncellenir ve opsiyonel bir başarı mesajı toast ile gösterilir. Hata durumunda ise `error` state'e yazılır ve hata mesajı toast ile bildirilir. Varsayılan seçenekler, çağrı bazında gelen seçeneklerle birleştirilerek her çağrı için özelleştirme imkanı tanır.

**Parametreler**:
- `defaultOptions`: `UseApiCallOptions | undefined` — Tüm execute çağrılarına uygulanacak varsayılan ayarlar. `showToast`, `successMessage` ve `errorMessage` özelliklerini içerebilir. Tanımlanmazsa herhangi bir varsayılan toast ayarı uygulanmaz.

**Dönüş**: `{ data: T | null, loading: boolean, error: Error | null, execute: (apiFunc: () => Promise<T>, options?: UseApiCallOptions) => Promise<T | null>, reset: () => void }` — Mevcut durumu (`data`, `loading`, `error`) ve iki methods (`execute`, `reset`) içeren bir nesne. `data` başarılı çağrı sonucunu, `loading` devam eden bir işlem olup olmadığını, `error` ise son hatayı temsil eder.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useApiCall.ts::useApiCall
- **params**: (defaultOptions?: UseApiCallOptions)
- **ic_degiskenler**:
  - `state` — useApiCall hook'unun state'i, ApiCallState<T> tipinde, data, loading ve error değerlerini tutar
  - `setState` — state'i güncellemek için kullanılan setter fonksiyonu
  - `execute` — useCallback ile sarılmış, API çağrısını yöneten async fonksiyon
  - `reset` — useCallback ile sarılmış, state'i sıfırlayan fonksiyon
- **Dönüş**: `{ ...state, execute, reset }` nesnesi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useApiCall.ts::execute
- **params**: (apiFunc: () => Promise<T>, options?: UseApiCallOptions)
- **ic_degiskenler**:
  - `mergedOptions` — defaultOptions ve options'un birleşimi, spread operatörü ile oluşturulmuş
  - `result` — apiFunc() çağrısının başarıyla döndürdüğü değer
  - `error` — catch bloğunda yakalanan hata nesnesi, Error instancesi veya string'den oluşturulmuş
- **Dönüş**: Promise<T | null>, başarıda result, hata durumunda null

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useApiCall.ts::reset
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (state'i sıfırlar, setState çağrısı yapar)

---

## NODE ID STANDARD

  file: src\hooks\useApiCall.ts
  function: src\hooks\useApiCall.ts::useApiCall

---

## DISA AKTARILANLAR (EXPORTS)
  export: useApiCall