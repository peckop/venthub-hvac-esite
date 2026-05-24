---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useApiCall.ts
skeleton_hash: 00770ccd49233591
generated_at: 2026-05-23T22:29:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin React tabanlı kod yapısında API çağrılarını yönetmek için özel bir hook sunuyor. Proje genelinde tüm API isteklerinde tutarlı bir iletişim standardı oluşturan bu modül, isteğe bağlı varsayılan ayarlarla farklı kullanım senaryolarına uyarlanabiliyor.

## Fonksiyon Grupları
### Merkezi API Çağrı Yönetimi
API isteklerinin durum takibi, hata yönetimi ve standartlaştırılmasını sağlayan ana işlevi barındıran bu grup, tüm uygulama genelindeki API iletişimlerini tek bir merkezden yönetme imkanı sunuyor. İsteğe bağlı yapılandırma seçenekleriyle özelleştirilebilen hook, bileşenlerin API ile güvenli ve tutarlı bir şekilde iletişim kurmasını kolaylaştırıyor.
- useApiCall

---

## AXIOMS – Mimari Varsayımlar
Bu React hook modülü, uygulama içindeki API çağrılarını state yönetimi ile birlikte yürütmek için tasarlanmıştır, çalışması için React altyapısı, TypeScript ortamı ve erişilebilir bir HTTP istemci bağımlılığı zorunludur.

[Aksiyom 1]: Eğer React 16.8 ve üzeri sürümle uyumlu, hook çalıştırmaya izin veren bir React bileşen ortamı yoksa, useApiCall hook'u hiç çalışmaz, tüm API çağrıları ve state yönetimi işlemleri başarısız olur.
[Aksiyom 2]: Eğer UseApiCallOptions tipi proje içinde geçerli olarak tanımlanmamışsa, TypeScript derleme süreci başarısız olur, modül projeye entegre edilemez.
[Aksiyom 3]: Eğer hook'un çağrılması sırasında API istekleri için gerekli kimlik doğrulama bilgileri, hedef API adresi gibi zorunlu konfigürasyonlar iletilmemişse, tüm API istekleri yetkisiz veya hatalı hedef nedeniyle başarısız olur.
[Aksiyom 4]: Eğer proje içinde HTTP istekleri göndermek için kullanılan temel API istemci kütüphanesi modül tarafından erişilebilir durumda değilse, hiçbir API çağrısı oluşturulamaz, modül tamamen işlevsiz kalır.

---

## FONKSIYON DETAYLARI

### useApiCall
**Ne yapar**: Asenkron API çağrıları için yükleme, gelen veri ve oluşan hata durumlarını yöneten özel bir React hook'tur. Proje genelinde API işlemlerini standartlaştırarak tutarlı bir yapı sunar, yerleşik toast bildirimleri ile tüm başarılı ve başarısız API çağrıları için kullanıcıya bildirim gönderilmesini sağlar. Tekrar kullanılabilir yapısı ile her API çağrısı için ayrı durum yönetimi yazma gereksinimini ortadan kaldırır.
**Nasıl yapar**: Kullanıcının ilettiği opsiyonel varsayılan ayarları alarak tüm API çağrılarına uygular, kendi içinde React state'leri kullanarak loading, data ve error durumlarını anlık olarak takip eder. Dışarıya sunduğu execute metodu ile API çağrısını tetikler, çağrı süresince state'leri güncelleyerek arayüzün doğru şekilde yeniden render edilmesini sağlar. Çağrının başarılı veya başarısız bitmesine göre ayarlanan toast mesajlarını gösterir, reset metodu ile tüm state'leri başlangıç değerlerine döndürerek yeni bir çağrı için hazır hale getirir.
**Parametreler**:
- name: defaultOptions — type: UseApiCallOptions — Tüm API yürütmelerinde uygulanacak toast mesajları ve diğer varsayılan ayarları içeren, isteğe bağlı olarak iletilen nesnedir.
**Dönüş**: İçerisinde mevcut durumun parçası olan API'den dönen veriyi tutan `data`, çağrının devam edip etmediğini belirten boolean `loading` ve çağrı sırasında oluşan hatayı tutan `error` alanlarını barındıran state nesnesi bulunur. Ayrıca API çağrısını tetiklemek için kullanılan `execute` metodu ve tüm state'leri sıfırlayarak hook'u başlangıç durumuna getiren `reset` metodunu içeren bir nesne döndürür.

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
- **params**: [defaultOptions?: UseApiCallOptions]
- **ic_degiskenler**:
  - `state` — API çağrısının durumunu tutan React state nesnesi; `data`, `loading`, `error` alanları içerir
  - `setState` - state nesnesini güncellemek için kullanılan useState tarafından döndürülen state setter fonksiyonu
  - `execute` - API fonksiyonunu çalıştırmak için useCallback ile sarmalanmış iç asenkron fonksiyon
  - `reset` - state'i başlangıç değerlerine döndürmek için useCallback ile sarmalanmış iç fonksiyon
- **Dönüş**: `{ ...state, execute, reset }` obje, tüm durum bilgileri ve kontrol fonksiyonları döndürülür

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useApiCall.ts::useApiCall::execute
- **params**: [apiFunc: () => Promise<T>, options?: UseApiCallOptions]
- **ic_degiskenler**:
  - `mergedOptions` - varsayılan ve çağrı sırasında verilen opsiyonları birleştiren konfigürasyon nesnesi
  - `prev` - setState fonksiyonu içinde kullanılan önceki state değeri
  - `result` - hedef API fonksiyonundan dönen başarı sonucu verisi
  - `err` - try bloğunda yakalanan ham hata nesnesi
  - `error` - standard Error nesnesine dönüştürülmüş, işlenebilir hata nesnesi
  - `toast.success` - react-hot-tostat kütüphanesinin başarı bildirimi göstermek için kullanılan fonksiyonu
  - `toast.error` - react-hot-toast kütüphanesinin hata bildirimi göstermek için kullanılan fonksiyonu
- **Dönüş**: Promise<T | null>

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useApiCall.ts::useApiCall::reset
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setState` - ana state'i başlangıç değerlerine sıfırlamak için kullanılan state setter fonksiyonu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\useApiCall.ts
  function: src\hooks\useApiCall.ts::useApiCall

---

## DISA AKTARILANLAR (EXPORTS)
  export: useApiCall