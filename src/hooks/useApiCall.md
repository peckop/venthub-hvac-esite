---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-altyapi\src\hooks\useApiCall.ts
skeleton_hash: 192db5af395b7535
entity_hashes:
  func:useApiCall: 42a6f8dca553808c
  overview: 345d6974057e4bc1
generated_at: 2026-08-18T06:47:34Z
---

## Genel Bakış
Bu modül, React uygulamalarında tüm API çağrılarını merkezi olarak yöneten, yeniden kullanılabilir bir hook sunar. Temel amacı, asenkron isteklerin başlatılmasını, yürütülmesini ve sonuçlarının (yükleniyor, başarı, hata) izlenmesini tek bir yapı ile sağlamaktır. Bu sayede bileşenler arasında tutarlı bir veri akışı ve yapılandırma yönetimi elde edilir.

## Fonksiyon Grupları
### Merkezi API İstek Orkestrasyonu
Bu grup, hook'un ana sorumluluğunu ve temel yaşam döngüsünü tanımlar. Tek bir `useApiCall` fonksiyonu, verilen bir API çağrısını başlatır, sürecin durumunu (yükleniyor, başarı, hata) otomatik olarak yönetir ve bileşene sonuçları (veri veya hata) sunar. Fonksiyon, component yaşam döngüsüyle entegre çalışarak performans ve bellek sızıntısı sorunlarını önler.

### Özelleştirilebilir Yapılandırma Katmanı
Bu grup, hook'un esnekliğini ve genişletilebilirliğini sağlayan ayarlar boyutunu kapsar. `defaultOptions` parametresi aracılığıyla, tüm istekler için varsayılan başlıklar, zaman aşımları, oturum yönetimi veya özel işleyiciler tanımlanabilir. Bu yapı, farklı API uç noktaları veya ortam koşulları için aynı hook'u kişiselleştirmeye olanak tanır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React bileşen/içinde API çağrılarını yönetmek için merkezi bir hook sunar. Aşağıdaki mimari varsayımlar fonksiyon imzası ve modül yapısına dayanır:

**[Aksiyom 1]**: Eğer `useApiCall` bir React hook olarak kullanılmıyorsa (React bileşeni veya başka bir hook içinde çağrılmıyorsa), React hooks kurallarını ihlal ederek beklenmeyen davranışlara yol açar.

**[Aksiyom 2]**: Eğer `defaultOptions` parametresi sağlanmıyorsa, hook internally tanımlı varsayılan UseApiCallOptions değerleriyle çalışmalıdır; aksi halde API çağrıları yapılandırma eksikliğinden başarısız olur.

**[Aksiyom 3]**: Eğer hook çağrıldığında döndürülen nesne/singleton (bilinmiyor) üzerinden API istek fonksiyonları调用 edilmiyorsa, hiçbir HTTP isteği başlatılamaz.

**[Aksiyom 4]**: Eğer hook'un döndürdüğü durum yönetimi (yükleniyor/başarı/hata) bileşen tarafından readonly olarak ele alınmıyorsa, durum tutarsızlığı ve gereksiz yeniden render'lar oluşur.

**[Aksiyom 5]**: Eğer hook'un çalışması için gerekli olan React bağlamı (Context Provider, HTTP istemcisi vb.) mevcut değilse (bilinmiyor - modül içinde tanımlanmamış), hook çalışmayı başlatamaz.

---

> **Not**: `UseApiCallOptions` tipinin iç yapısı ve hook'un dönüş tipi imza dosyasında açıkça tanımlanmadığından, bu yapılar hakkında kesin aksiyom üretilememiştir. Eski dokümanın tanım bölgesi kesildiğinden, hook'un spesifik dönüş yapısı ve geri çağırma mekanizmaları hakkında `bilinmiyor` olarak işaretlenmiştir.

---

## FONKSİYON DETAYLARI

### useApiCall

**Ne yapar**: Asenkron API çağrıları için yüklenme (loading), veri (data) ve hata (error) durumlarını yöneten özel bir React hook'u oluşturur. API çağrılarının standart bir şekilde yürütülmesini sağlar ve başarı/hata senaryoları için yerleşik toast bildirimleri sunar.

**Nasıl yapar**: React'in `useState` hook'u ile `ApiCallState<T>` tipinde bir durum (state) yönetimi kurar. `useCallback` ile `execute` ve `reset` fonksiyonlarını memoize ederek gereksiz yeniden oluşturmaları önler. `useI18n()` hook'undan `t` çeviri fonksiyonunu alarak çok dilli hata mesajları destekler. `execute` fonksiyonu çağrıldığında önce `loading: true` durumuna geçer, ardından verilen `apiFunc` promise'ini bekler. Başarılı olursa sonucu state'e kaydeder ve `showToast` ile `successMessage` seçenekleri aktifse `toast.success` ile bildirim gösterir. Hata oluşursa hatayı `Error` nesnesine dönüştürerek state'e kaydeder ve `toast.error` ile hata bildirimini tetikler. Seçeneklerdeki `showToast` değeri `false` olmadığında hata toast'u gösterilir; bu değerin `undefined` olması da toast gösterimi anlamına gelir.

**Parametreler**:
- `defaultOptions`: `UseApiCallOptions | undefined` — Tüm execute çağrılarına uygulanacak varsayılan toast bildirim ayarlarını içerir. `showToast`, `successMessage` ve `errorMessage` gibi seçenekleri tanımlar. Belirtilmezse hiçbir varsayılan ayar uygulanmaz.

**Dönüş**: `{
        ...state,
        execute,
        reset,
    }` —currentState'in (`data`, `loading`, `error` alanları) yayıldığı, `execute` ve `reset` metodlarını içeren bir nesne döndürür. `execute` metodu `Promise<T | null>` değerine resolve olur; başarı durumunda `T` tipinde sonucu, hata durumunda `null` döner.

**İç Bileşenler**:

#### execute

**Ne yapar**: Verilen asenkron API fonksiyonunu yürütür, durum yönetimi yapar ve bildirimleri tetikler.

**Nasıl yapar**: Gelen `apiFunc` ve `options` parametrelerindeki seçenekleri `defaultOptions` ile birleştirerek öncelik sırası belirler (çağrı seçenekleri üstüne yazar). Promise'i `await` ile bekler, başarı/hata durumlarını yönetir. Hata yakalandığında `err` değerinin `Error` instance olup olmadığını kontrol eder; değilse `String(err)` ile yeni bir `Error` nesnesi oluşturur. Hata mesajı için sırasıyla `errorMessage`, orijinal hata mesajı ve `t('common.errorGeneric')` çevirisi arasından ilk tanımlı olanı kullanır.

**Parametreler**:
- `apiFunc`: `() => Promise<T>` — Çalıştırılacak asenkron API fonksiyonu. Parametresiz bir fonksiyon olmalıdır ve `Promise<T>` tipinde sonuç döndürmelidir.
- `options`: `UseApiCallOptions | undefined` — Bu çağrıya özel seçenekler. `defaultOptions` değerlerini üzerine yazar.

**Dönüş**: `Promise<T | null>` — Başarılı ise `T` tipinde sonuç, hata durumunda `null` döner.

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

### [N1_NASIL] AST Pointer: `src/hooks/useApiCall.ts`::`useApiCall`
- **params**: `defaultOptions?: UseApiCallOptions` — tüm API çağrılarına uygulanacak varsayılan ayarlar
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, hata mesajlarında `t('common.errorGeneric')` olarak kullanılır
  - `state` — `ApiCallState<T>` tipinde state nesnesi, `data`, `loading`, `error` alanlarını tutar
  - `setState` — `state`'i güncellemek için React setter fonksiyonu
  - `execute` — `useCallback` ile sarılmış async API çağrısı fonksiyonu, `state` ve `defaultOptions`'a bağımlı
  - `reset` — `useCallback` ile sarılmış state sıfırlama fonksiyonu, bağımlılığı yok
- **Dönüş**: `{ ...state, execute, reset }` — spread edilmiş `{ data, loading, error }` + `execute` fonksiyonu + `reset` fonksiyonu

---

### [N2_NASIL] AST Pointer: `src/hooks/useApiCall.ts`::`useApiCall.execute`
- **params**: `apiFunc: () => Promise<T>` — çağrılacak asenkron API fonksiyonu; `options?: UseApiCallOptions` — bu çağrıya özgü opsiyonel ayarlar
- **ic_degiskenler**:
  - `mergedOptions` — `{ ...defaultOptions, ...options }` spread ile birleştirilmiş nesne, caller options override eder
  - `result` — `await apiFunc()` çağrısının başarılı dönüş değeri tipi `T`
  - `err` — `catch` bloğu tarafından yakalanan hata, tipi `unknown`
  - `error` — `err instanceof Error` kontrolü ile elde edilen `Error` nesnesi, `err` Error değilse `new Error(String(err))` ile oluşturulur
- **Yan etkileri**: `setState` çağrısı ile `loading` ve `error`/`data` state'ini günceller; `mergedOptions.showToast` true ve `successMessage` varsa `toast.success()`; hata durumunda `toast.error()` çağırır
- **Dönüş**: `Promise<T | null>` — başarılı ise `result` (T), hata ise `null`

---

### [N3_NASIL] AST Pointer: `src/hooks/useApiCall.ts`::`useApiCall.reset`
- **params**: yok
- **ic_degiskenler**: yok
- **Yan etkileri**: `setState` çağrısı ile state'i `{ data: null, loading: false, error: null }` değerine sıfırlar
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\useApiCall.ts
  function: src\hooks\useApiCall.ts::useApiCall

---

## DISA AKTARILANLAR (EXPORTS)
  export: useApiCall