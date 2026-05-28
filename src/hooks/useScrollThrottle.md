---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx
skeleton_hash: b3a95bf57068fc98
entity_hashes:
  func:useScrollThrottle: 8c5a736c0985619d
  overview: cbc1c5af98f49080
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:37:49Z
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

## FONKSİYON DETAYLARI

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

## NODE ID STANDARD

  file: src\hooks\useScrollThrottle.tsx
  function: src\hooks\useScrollThrottle.tsx::useScrollThrottle

---

## DISA AKTARILANLAR (EXPORTS)
  export: ScrollThrottleOptions
  export: useScrollThrottle

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)