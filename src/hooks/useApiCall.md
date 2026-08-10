---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useApiCall.ts
skeleton_hash: 67bf426da710b5dd
entity_hashes:
  func:useApiCall: ad3857eabf77c233
  overview: 73b0eea2296f391a
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu modül, React uygulamalarında API çağrılarını merkezi ve yeniden kullanılabilir bir şekilde yönetmek için özel bir hook sunar. Temel amacı, tüm HTTP istekleri için tutarlı bir durum yönetim döngüsü (yükleniyor, başarı, hata) sağlamak ve temel istek yapılandırmalarını merkezileştirmektir.

## Fonksiyon Grupları
### API Çağrı Orkestrasyonu ve Durum Yönetimi
Bu grup, tek bir hook ile asenkron API çağrılarının başlatılmasını, yürütülmesini ve sonuçlarının (başarı veya hata) izlenmesini sağlar. Hook, çağrı sürecinde otomatik olarak durum güncellemeleri yaparak bileşenlere stabil bir veri akışı sunar.
- useApiCall

### Özelleştirilebilir İstek Yapılandırması
Bu grup, varsayılan istek davranışlarının opsiyonel parametrelerle genişletilmesine ve özelleştirilmesine olanak tanır. Uygulama genelindeki ortak yapılandırma ihtiyaçlarını (örn. kimlik doğrulama, zaman aşımları) tek bir noktadan tanımlamayı kolaylaştırır.
- useApiCall

---

## AXIOMS – Mimari Varsayımlar

Bu hook, React bileşenleri içinde asenkron API çağrılarını yönetmek için kullanılır. Doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `useApiCall` bir React bileşeni hook bağlamı dışında (örn:普通 bir fonksiyon, sınıf metodu) çağrılırsa, "Invalid hook call" hatası oluşur.

[Aksiyom 2]: Eğer geçerli bir API endpoint'e erişim (ağ bağlantısı) yoksa, tüm API çağrıları başarısızlık durumuna (`error` dolu, `data` boş) geçer.

[Aksiyom 3]: Eğer `defaultOptions` parametresi olarak geçilen `UseApiCallOptions` yapısı geçerli bir istek yapılandırması (örn: geçerli URL, uygun method) içermiyorsa, istek gönderimi başarısız olur veya beklenmeyen davranış oluşur.

[Aksiyom 4]: Eğer hook'un bağlandığı React bileşeni bileşen ağacından kaldırılırsa (unmount), devam eden asenkron API isteklerinin sonuçları state güncellemesine yol açmaz (memory leak veya "Can't perform a React state update on an unmounted component" uyarısı oluşmaz).

---

## FONKSİYON DETAYLARI

### useApiCall
**Ne yapar**: Asenkron API çağrıları için `loading`, `data` ve `error` durumlarını yöneten özel bir React hook'u oluşturur. API çağrılarının yürütülmesi sırasında otomatik olarak durum yönetimi sağlar ve başarı/hata senaryoları için toast bildirimleri sunar.

**Nasıl yapar**: `useState` ile `ApiCallState<T>` tipinde bir durum nesnesi oluşturur. Bu durum nesnesi `data`, `loading` ve `error` alanlarını içerir. Hook, çağrıcıya `execute` ve `reset` adlı iki方法 döndürür. `execute` çağrıldığında önce `loading: true` ayarlanır, ardından verilen asenkron fonksiyon çalıştırılır. Fonksiyon başarıyla tamamlanırsa `data` güncellenir ve opsiyonel bir başarı mesajı toast ile gösterilir. Hata durumunda ise `error` state'e yazılır ve hata mesajı toast ile bildirilir. Varsayılan seçenekler, çağrı bazında gelen seçeneklerle birleştirilerek her çağrı için özelleştirme imkanı tanır.

**Parametreler**:
- `defaultOptions`: `UseApiCallOptions | undefined` — Tüm execute çağrılarına uygulanacak varsayılan ayarlar. `showToast`, `successMessage` ve `errorMessage` özelliklerini içerebilir. Tanımlanmazsa herhangi bir varsayılan toast ayarı uygulanmaz.

**Dönüş**: `{ data: T | null, loading: boolean, error: Error | null, execute: (apiFunc: () => Promise<T>, options?: UseApiCallOptions) => Promise<T | null>, reset: () => void }` — Mevcut durumu (`data`, `loading`, `error`) ve iki methods (`execute`, `reset`) içeren bir nesne. `data` başarılı çağrı sonucunu, `loading` devam eden bir işlem olup olmadığını, `error` ise son hatayı temsil eder.

---

## İTHALATLAR (IMPORTS)
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
- **params**: `defaultOptions` (可选, 类型 `UseApiCallOptions`)
- **ic_degiskenler**:
  - `state` — 由 `useState` 创建的React状态，存储API调用的数据、加载和错误状态。
  - `execute` — 由 `useCallback` 创建的异步函数，用于执行API调用并更新状态。
  - `reset` — 由 `useCallback` 创建的函数，用于将状态重置为初始值。
- **Dönüş**: 返回一个对象，包含扩展的 `state` 属性 (`data`, `loading`, `error`) 以及 `execute` 和 `reset` 方法。

### [N2_NASIL] AST Pointer: src/hooks/useApiCall.ts::execute
- **params**: `apiFunc` (类型 `() => Promise<T>`), `options` (可选, 类型 `UseApiCallOptions`)
- **ic_degiskenler**:
  - `mergedOptions` — 将 `defaultOptions`（来自外部作用域）与 `options` 合并后的最终选项对象。
  - `result` — `apiFunc` 执行成功时返回的异步结果。
  - `err` — `try...catch` 语句捕获的原始错误对象。
  - `error` — 经过类型检查和包装后的 `Error` 实例。
- **Dönüş**: 返回 `Promise<T | null>`。成功时返回 `result`，失败时返回 `null`。

### [N3_NASIL] AST Pointer: src/hooks/useApiCall.ts::reset
- **params**: (无)
- **ic_degiskenler**: (无)
- **Dönüş**: 无（函数通过调用 `setState` 产生副作用，重置状态）。

---

## NODE ID STANDARD

  file: src\hooks\useApiCall.ts
  function: src\hooks\useApiCall.ts::useApiCall

---

## DISA AKTARILANLAR (EXPORTS)
  export: useApiCall