---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx
skeleton_hash: b3a95bf57068fc98
generated_at: 2026-05-23T22:30:58Z
---

## Genel Bakış
Bu modül, React projelerinde kullanılmak üzere tasarlanmış, kaydırma (scroll) işlemlerinin tetiklediği sık olayları sınırlayarak uygulama performansını artıran özel bir hook içerir. Kullanıcılara kısıtlama süresi ve kaydırma eşikleri gibi yapılandırılabilir seçenekler sunarak farklı kullanım senaryolarına esnek şekilde uyum sağlar.

## Fonksiyon Grupları
### Scroll Olayı Kısıtlama (Throttling) Hook'u
Modülün tüm temel sorumluluğunu üstlenen ana işlevdir, gelen yapılandırma seçeneklerine göre kaydırma dinleyicisini yönetir ve olayları belirtilen süreyle kısıtlayarak gereksiz işlem yükünü ortadan kaldırır.
- useScrollThrottle

---

## AXIOMS – Mimari Varsayımlar
Bu React scroll throttling hook'u, çalıştığı ortamda tarayıcı olay sistemi, React hook yaşam döngüleri ve geçirilen parametrelerin tip-değer uyumluluğu varsayımlarına dayanır; bu koşullar sağlanmadığı takdirde hook beklenen şekilde çalışmaz.

[Aksiyom 1]: Eğer hook'un çalıştığı ortamda `window` nesnesinin `addEventListener`/`removeEventListener` metotları ve `scroll` olay tetikleme mekanizması yoksa, scroll hareketleri asla algılanamaz, hook hiç çalışmaz.
[Aksiyom 2]: Eğer ilk parametre olarak geçirilen `thresholdOrOptions`, ne sayı ne de geçerli `ScrollThrottleOptions` tipinde bir nesne ise, scroll tetikleme eşiği ve ayarları doğru hesaplanamaz, beklenmedik zamanlarda tetikleme veya hiç tetiklememe sorunu oluşur.
[Aksiyom 3]: Eğer ikinci parametre olarak geçirilen `throttleMsParam` pozitif bir sayı değilse, scroll eventlerinin belirtilen süreyle kısıtlanması (throttling) sağlanamaz, gereğinden fazla tetikleme olur veya mekanizma tamamen devre dışı kalır.
[Aksiyom 4]: Eğer hook'un çalıştığı React ortamında `useEffect`, `useCallback` gibi temel yaşam döngüsü hook'ları erişilemez veya hatalı çalışıyorsa, component unmount olduğunda scroll event dinleyicisi temizlenemez, bellek sızıntısı oluşur ve birden fazla aynı dinleyici eklenerek throttle mekanizması bozulur.
[Aksiyom 5]: Eğer tarayıcı olmayan ortamlarda (SSR gibi) `window` nesnesinin varlığını kontrol eden ön koşullar olmadan hook çalıştırılırsa, çalışma ortamında hata fırlatılır, uygulama akışı durur.

---

## FONKSIYON DETAYLARI

### useScrollThrottle
**Ne yapar**: Tarayıcı üzerinde gerçekleşen scroll (kaydırma) olaylarını throttle (hız sınırlama) mekanizmasıyla yöneten özel React hook'udur. Aşırı sık tetiklenen scroll olaylarının yol açtığı gereksiz işlem yükünü ve performans düşüklüğünü önlemek amacıyla geliştirilmiştir, belirtilen ayarlara göre sadece izin verilen zaman aralıklarında ilgili scroll tetiklemelerinin çalışmasını sağlar.
**Nasıl yapar**: React hook yaşam döngüsüne entegre olarak çalışır, bileşen ilk yüklendiğinde tarayıcının scroll olaylarını dinleyen dinleyiciyi tanımlar, bileşen sayfadan ayrıldığında (unmount olduğunda) bellek sızıntısını önlemek için bu dinleyiciyi temizler. Gelen tüm scroll tetiklemelerini throttleMsParam ile belirtilen milisaniye aralığına sıkıştırarak aynı süre içinde birden fazla kez çalışmasını engeller. İlk parametre olarak sayı tipinde eşik değeri aldığında doğrudan bu piksel eşik değerine göre tetikleme koşulunu oluşturur, ScrollThrottleOptions nesnesi aldığında gelişmiş özelleştirme ayarlarını kullanarak özel throttle davranışı sergiler.
**Parametreler**:
- name: thresholdOrOptions, type: number | ScrollThrottleOptions — Scroll tetiklemesinin devreye gireceği piksel cinsinden eşik değeri ya da throttle davranışını özelleştirmek için kullanılan gelişmiş ayarları içeren ScrollThrottleOptions türünde nesnedir
- name: throttleMsParam, type: number — Scroll olayları arasında uygulanacak minimum bekleme süresi, milisaniye cinsinden tanımlanır, bu süre dolmadan yeni bir scroll tetiklemesinin çalışmasını engelleyen temel sınır değeridir
**Dönüş**: Tanımında açık bir dönüş tipi belirtilmemiştir, özel React hook olarak scroll olaylarını yönetmek için gerekli tüm yan etkileri çalıştırır, harici olarak tüketilebilecek bir değer döndürmez, davranışı void tipe uyumludur.

---

## TYPE ALIASES

### ScrollThrottleOptions
Scroll event'lerini throttle ederek optimize eden hook. Histerezis (showAt/hideBelow) ve ilk gösterim için kısa gecikme destekler. Kullanım: - useScrollThrottle(100, 16) → eski uyumlu; showAt=100, hideBelow=60 - useScrollThrottle({ showAt: 120, hideBelow: 80, throttleMs: 16, initialDelayMs: 180 })
```typescript
type ScrollThrottleOptions = {
  showAt?: number
  hideBelow?: number
  throttleMs?: number
  initialDelayMs?: number
  syncKey?: unknown
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx::useScrollThrottle
- **params**: thresholdOrOptions: number | ScrollThrottleOptions, throttleMsParam: number
- **ic_degiskenler**:
  - `showAt` — scroll konumunun üzerine çıkıldığında scroll durumunu aktifleştirmek için kullanılan eşik değeri
  - `hideBelow` — scroll konumunun altına düşüldüğünde scroll durumunu devre dışı bırakmak için histerezis amaçlı eşik değeri
  - `throttleMs` — scroll eventlerini sınırlandırmak için kullanılan throttling gecikme süresi
  - `initialDelayMs` — ilk komponent mountunda durum ayarlaması için bekleme süresi
  - `syncKey` — senkronizasyon tetikleyicisi olarak kullanılan opsiyonel anahtar
  - `isScrolled` — scroll durumunu tutan React state değeri, kullanıcının showAt eşğini geçip geçmediğini belirtir
  - `setIsScrolled` — isScrolled state'ini güncellemek için React state setter fonksiyonu
  - `tickingRef` — requestAnimationFrame ile işlem devam ederken tekrar tetiklenmesini önlemek için kullanılan ref
  - `timeoutRef` — throttle mekanizmasındaki aktif timeout'u saklamak için kullanılan ref
  - `initialTimerRef` — ilk gecikmeli durum ayarı için aktif timeout'u saklayan ref
  - `hasMountedRef` — komponentin ilk kez mount olup olmadığını izleyen ref
  - `lastAboveRef` — bir önceki scroll ölçümünde showAt eşği geçilmiş miydi diye saklayan ref
  - `lastBelowRef` — bir önceki scroll ölçümünde hideBelow eşğinin altında mıydı diye saklayan ref
  - `handleScroll` — scroll eventini işleyen, useCallback ile sarmalanmış ana işleyici fonksiyonu
  - `throttledScroll` — handleScroll'u throttle süresi ile sınırlayan ara fonksiyon
- **Dönüş**: boolean (isScrolled)

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx::handleScroll
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `tickingRef` — işlem devam ederken tekrar tetiklenmeyi engelleyen ref
  - `requestAnimationFrame` — tarayıcının repaint döngüsüne göre işlem planlamak için kullanılan API
  - `window` — tarayıcı window nesnesi
  - `scrollTop` — mevcut dikey scroll konumu (window.scrollY değeri)
  - `isScrolled` — mevcut scroll state değeri
  - `setIsScrolled` — scroll state'ini güncelleyen setter fonksiyonu
  - `lastAboveRef` — önceki ölçümde showAt eşği geçilmiş mi saklayan ref
  - `lastBelowRef` — önceki ölçümde hideBelow altında mıydı saklayan ref
  - `showAt` — scroll aktifleştirme eşği
  - `hideBelow` — scroll devre dışı bırakma eşği
  - `nowAbove` — mevcut scroll konumunun showAt'tan büyük olup olmadığı kontrolü
  - `nowBelow` — mevcut scroll konumunun hideBelow'dan küçük olup olmadığı kontrolü
- **Dönüş**: void

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx::handleScroll_duplicate1
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `tickingRef` — işlem devam ederken tekrar tetiklenmeyi engelleyen ref
  - `window` — tarayıcı window nesnesi
  - `scrollTop` — mevcut dikey scroll konumu
  - `isScrolled` — mevcut scroll state değeri
  - `setIsScrolled` — scroll state'ini güncelleyen setter fonksiyonu
  - `lastAboveRef` — önceki ölçümde showAt eşği geçilmiş mi saklayan ref
  - `lastBelowRef` — önceki ölçümde hideBelow altında mıydı saklayan ref
  - `showAt` — scroll aktifleştirme eşği
  - `hideBelow` — scroll devre dışı bırakma eşği
  - `nowAbove` — mevcut scroll konumunun showAt'tan büyük olup olmadığı kontrolü
  - `nowBelow` — mevcut scroll konumunun hideBelow'dan küçük olup olmadığı kontrolü
- **Dönüş**: void

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx::handleScroll_duplicate2
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `tickingRef` — işlem devam ederken tekrar tetiklenmeyi engelleyen ref
  - `window` — tarayıcı window nesnesi
  - `scrollTop` — mevcut dikey scroll konumu
  - `isScrolled` — mevcut scroll state değeri
  - `setIsScrolled` — scroll state'ini güncelleyen setter fonksiyonu
  - `lastAboveRef` — önceki ölçümde showAt eşği geçilmiş mi saklayan ref
  - `lastBelowRef` — önceki ölçümde hideBelow altında mıydı saklayan ref
  - `showAt` — scroll aktifleştirme eşği
  - `hideBelow` — scroll devre dışı bırakma eşği
  - `nowAbove` — mevcut scroll konumunun showAt'tan büyük olup olmadığı kontrolü
  - `nowBelow` — mevcut scroll konumunun hideBelow'dan küçük olup olmadığı kontrolü
- **Dönüş**: void

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx::throttledScroll
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timeoutRef` — aktif throttle timeout'unu saklayan ref
  - `clearTimeout` — mevcut timeout'u iptal etmek için kullanılan API
  - `setTimeout` — belirli süre sonra işlem planlamak için kullanılan API
  - `handleScroll` — ana scroll işleyici fonksiyonu
  - `throttleMs` — throttle gecikme süresi
- **Dönüş**: void

---

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — tarayıcı window nesnesi
  - `initialScrollTop` — useEffect tetiklendiğindeki ilk dikey scroll konumu
  - `initialTimerRef` — ilk gecikmeli işlem için saklanan timeout ref'i
  - `clearTimeout` — mevcut timeout'u iptal etmek için API
  - `hasMountedRef` — komponentin ilk mount olup olmadığını izleyen ref
  - `showAt` — scroll aktifleştirme eşği
  - `initialDelayMs` — ilk gecikme süresi
  - `setIsScrolled` — scroll state'ini güncelleyen setter fonksiyonu
  - `throttledScroll` — throttlenmiş scroll işleyici fonksiyonu
  - `addEventListener` — window üzerine scroll event listener'ı eklemek için API
  - `syncKey` — senkronizasyon tetikleyici anahtarı
- **Dönüş**: cleanup fonksiyonu (void dönen temizlik fonksiyonu)

---

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx::initialTimer_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — tarayıcı window nesnesi
  - `window.scrollY` — mevcut dikey scroll konumu
  - `showAt` — scroll aktifleştirme eşği
  - `setIsScrolled` — scroll state'ini güncelleyen setter fonksiyonu
- **Dönüş**: void

---

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx::useEffect_cleanup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — tarayıcı window nesnesi
  - `removeEventListener` — scroll event listener'ını kaldırmak için API
  - `throttledScroll` — kaldırılacak olan scroll işleyici fonksiyonu
  - `timeoutRef` — saklanan throttle timeout ref'i
  - `clearTimeout` — mevcut timeout'u iptal etmek için API
  - `initialTimerRef` — saklanan ilk zamanlayıcı timeout ref'i
- **Dönüş**: void

---

## NODE ID STANDARD

  file: src\hooks\useScrollThrottle.tsx
  function: src\hooks\useScrollThrottle.tsx::useScrollThrottle

---

## DISA AKTARILANLAR (EXPORTS)
  export: ScrollThrottleOptions
  export: useScrollThrottle