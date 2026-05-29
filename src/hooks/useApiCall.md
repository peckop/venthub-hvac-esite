---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useApiCall.ts
skeleton_hash: 5c125e59a0aecf21
entity_hashes:
  func:useApiCall: ad3857eabf77c233
  overview: 301e3e9f7e67faae
generated_at: 2026-05-29T18:47:35Z
---

## Genel Bakış
Bu modül, React uygulamalarında API çağrılarını merkezi ve yeniden kullanılabilir bir şekilde yönetmek için özel bir hook sunar. Temel amacı, tüm HTTP istekleri için tutarlı bir durum yönetim döngüsü (yükleniyor, başarı, hata) sağlamak ve temel istek yapılandırmalarını merkezileştirmektir.

## Fonksiyon Grupları
### API Çağrı Orkestrasyonu ve Durum Yönetimi
Bu grup, tek bir hook ile asenkron API çağrılarının başlatılmasını, yürütülmesini ve sonuçlarının (başarı veya hata) izlenmesini sağlar. Hook, çağrı sürecinde otomatik olarak durum güncellemeleri yaparak bileşenlere stabilized bir veri akışı sunar.
- useApiCall

### Özelleştirilebilir İstek Yapılandırması
Bu grup, varsayılan istek davranışlarının opsiyonel parametrelerle genişletilmesine ve özelleştirilmesine olanak tanır. Uygulama genelindeki ortak yapılandırma ihtiyaçlarını (örn. kimlik doğrulama, zaman aşımları) tek bir noktadan tanımlamayı kolaylaştırır.
- useApiCall

---
*Bu hook, VentHub HVAC projesi içindeki tüm API çağrılarını standartlaştırmak ve merkezi olarak yönetmek temel mimari varsayımı üzerine kurulmuştur.*

---

## AXIOMS – Mimari Varsayımlar

Bu hook, API çağrılarını yönetmek için temel bir React hook yapısına ve opsiyonel bir yapılandırma nesnesine bağlıdır. Varsayımlar, fonksiyonun parametreleri ve React hook kuralları üzerine kuruludur.

**[Aksiyom 1]: Eğer `useApiCall` hook'u React fonksiyonel bileşeninin veya başka bir hook'un içinde invok edilmemişse, "Invalid hook call" hatası oluşur.**
Bu, React'ın hook kurallarına bağlılık varsayımıdır.

**[Aksiyom 2]: Eğer `defaultOptions` parametresi sağlanmazsa veya `null`/`undefined` olarak geçilirse, hook bir varsayılan (muhtemelen boş) yapılandırma nesnesi ile çalışır.**
Fonksiyon imzasındaki `?` işareti, parametrenin opsiyonel olduğunu belirtir.

**[Aksiyom 3]: Eğer `defaultOptions` içinde bir `url` (API endpoint adresi) veya bunu sağlayan bir `fetchConfig` bileşeni belirtilmemişse, hook'un bir HTTP isteği başlatması mümkün değildir.**
Hook, bir hedef olmadan API çağrısı yapamaz; bu durum isteği başlatamaz veya bir hata fırlatır.

**[Aksiyom 4]: Eğer `defaultOptions` içindeki `method` parametresi (`GET`, `POST`, `PUT`, `DELETE` vb.) geçerli bir HTTP method değilse, istek başarısız olur veya sunucu tarafından reddedilir.**
Geçersiz bir method ile yapılan istekler standart HTTP hataları (405 Method Not Allowed gibi) ile sonuçlanır.

**[Aksiyom 5]: Eğer `defaultOptions` içindeki `headers`, `body` veya diğer yapılandırma parametreleri, gönderilen isteğin türü (örn: `GET` isteğinde `body` olması) ile uyumsuzsa, istek hata ile sonuçlanır.**
İstek yapısının HTTP protokolü ile tutarlı olması bir zorunluluktur.

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

### [N1_NASIL] AST Pointer: src/hooks/useApiCall.ts::useApiCall
- **params**: `(defaultOptions?: UseApiCallOptions)` — Hook'a geçirilen varsayılan API çağrı seçenekleri
- **ic_degiskenler**:
  - `state` — useState ile yönetilen {data, loading, error} durum nesnesi, ApiCallState<T> tipinde
  - `execute` — useCallback ile sarılmış async fonksiyon, API çağrısı yapar ve state'i günceller
  - `reset` — useCallback ile sarılmış fonksiyon, state'i başlangıç değerine sıfırlar
- **Dönüş**: `{ ...state, execute, reset }` — state alanlarını (data, loading, error) ve iki metodu içeren nesne

### [N2_NASIL] AST Pointer: src/hooks/useApiCall.ts::execute
- **params**: `(apiFunc: () => Promise<T>, options?: UseApiCallOptions)` — Çalıştırılacak API fonksiyonu ve opsiyonel seçenekler
- **ic_degiskenler**:
  - `mergedOptions` — `{ ...defaultOptions, ...options }` ile birleştirilmiş seçenekler nesnesi; showToast, successMessage, errorMessage alanlarını içerir
  - `result` — `await apiFunc()` çağrısının başarılı sonucu, T tipinde
  - `error` — catch bloğunda yakalanan hata; `err instanceof Error ? err : new Error(String(err))` ile Error nesnesine dönüştürülmüş
- **Dönüş**: `Promise<T | null>` — Başarılıysa result, hatalıysa null döner

### [N3_NASIL] AST Pointer: src/hooks/useApiCall.ts::reset
- **params**: (parametre yok)
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: yok — Yan etki olarak state'i `{ data: null, loading: false, error: null }` değerine sıfırlar

---

## NODE ID STANDARD

  file: src\hooks\useApiCall.ts
  function: src\hooks\useApiCall.ts::useApiCall

---

## DISA AKTARILANLAR (EXPORTS)
  export: useApiCall