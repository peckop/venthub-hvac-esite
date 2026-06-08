---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useScrollThrottle.tsx
skeleton_hash: 5184d4b744012e60
entity_hashes:
  func:useScrollThrottle: 8c5a736c0985619d
  overview: 780bbb29a8b9d01e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:33Z
---

## Genel Bakış
Bu modül, React uygulamalarında kaydırma (scroll) olaylarının çok sık tetiklenmesini önlemek için tasarlanmış bir throttle mekanizması sunar. `useScrollThrottle` hook'u, yapılandırılabilir eşik değerleri ve süre parametreleri ile olayları filtreleyerek performansı artırır ve gereksiz hesaplama yükünü azaltır.

## Fonksiyon Grupları
### Kaydırma Olayı Kısıtlama Hook'u
Modülün tek ve temel bileşeni olup, kaydırma olaylarını belirli bir süre aralığında veya eşik değeri aşıldığında tetiklenecek şekilde sınırlar.
- useScrollThrottle

---

## AXIOMS – Mimari Varsayımlar

Bu hook, React fonksiyonel bileşenleri veya diğer hook'lar içinde çalışacak şekilde tasarlanmıştır ve kaydırma olaylarını kısıtlamak için geçerli parametreler gerektirir.

**[Aksiyom 1]:** Eğer `useScrollThrottle` React hooks kurallarına uygun olarak (üst seviyede, koşullu çağrılmadan) çağrılmazsa, React kancalar kuralları ihlal edilir ve bileşen beklenmeyen davranış gösterir.

**[Aksiyom 2]:** Eğer `thresholdOrOptions` parametresi geçerli bir `number` veya `ScrollThrottleOptions` nesnesi formatında sağlanmazsa, kaydırma eşik değerlendirmesi veya yapılandırma okuma hatası oluşur.

**[Aksiyom 3]:** Eğer `throttleMsParam` parametresi pozitif bir sayısal değer olarak sağlanmazsa (0 veya negatif olursa), throttling mekanizması beklenen şekilde çalışmayı durdurur veya sonsuz tetikleme döngüsüne neden olur.

**[Aksiyom 4]:** Eğer调用 bu hook bileşen içinde bir `scroll` event listener'ı bağlanacak uygun bir DOM elementine (veya `window`) erişim sağlayamazsa, kaydırma olayları dinlenemez ve hook işlevsiz kalır.

**[Aksiyom 5]:** Eğer hook bileşen_UNMOUNT olduğunda scroll event listener temizlenmezse (cleanup fonksiyonu ile), bellek sızıntısı ve hala aktif olan eski listener'ların gereksiz çalışmasına yol açar.

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

### [N1_NASIL] AST Pointer: src/hooks/useScrollThrottle.tsx::useScrollThrottle
- **params**: (thresholdOrOptions: number | ScrollThrottleOptions = 100, throttleMsParam: number = 16)
- **ic_degiskenler**:
  - `showAt` — Sticky header'ın gösterilmeye başlanacağı scroll eşiği. thresholdOrOptions number ise o değer, obje ise thresholdOrOptions.showAt, yoksa 100.
  - `hideBelow` — Sticky header'ın gizleneceği scroll eşiği. showAt değerinden 40px daha aşağısı veya belirtilen değer.
  - `throttleMs` — Scroll eventinin ne sıklıkla işleneceği (milisaniye cinsinden).
  - `initialDelayMs` — Sayfa ilk yüklendiğinde sticky header'ın görünmesi için gecikme süresi (milisaniye).
  - `syncKey` — Senkronizasyon anahtarı, değiştiğinde scroll konumunu yeniden değerlendirir.
  - `isScrolled` — Sticky header'ın görünür olup olmadığını tutan state değişkeni. Başlangıçta false.
  - `tickingRef` — requestAnimationFrame ile scroll işlenirken tekrar girişi engellemek için kullanılan ref. Başlangıçta false.
  - `timeoutRef` — Throttle için kullanılan setTimeout ref'i. Başlangıçta null.
  - `initialTimerRef` — İlk gecikme için kullanılan setTimeout ref'i. Başlangıçta null.
  - `hasMountedRef` — Hook'un ilk kez mount edilip edilmediğini takip eden ref. Başlangıçta false.
  - `lastAboveRef` — Bir önceki örneklemede scroll'un showAt'in üzerinde olup olmadığını tutan ref. Başlangıçta false.
  - `lastBelowRef` — Bir önceki örneklemede scroll'un hideBelow'ın altında olup olmadığını tutan ref. Başlangıçta true.
  - `handleScroll` — Scroll olayını işleyen useCallback fonksiyonu. isScrolled, showAt, hideBelow'ye bağımlı.
  - `throttledScroll` — handleScroll'u throttle eden useCallback fonksiyonu. handleScroll ve throttleMs'ye bağımlı.
  - `initialScrollTop` — useEffect içinde window.scrollY'nin ilk değeri. Sayfa ilk yüklendiğinde mevcut scroll konumunu tutar.
- **Dönüş**: `isScrolled` (boolean) — Sticky header'ın görünür olup olmadığı.

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