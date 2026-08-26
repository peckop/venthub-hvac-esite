---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\hooks\useScrollThrottle.tsx
skeleton_hash: 76f0aa788753fa84
entity_hashes:
  func:useScrollThrottle: 8c5a736c0985619d
  overview: 780bbb29a8b9d01e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:27:31Z
---

## Genel Bakış
`useScrollThrottle`, React ortamında scroll olaylarını throttle (zaman kısıtlamalı) mekanizmasıyla işleyen bir custom hook'tur. Kullanıcı kaydırma sırasında belirli bir eşik değerini aşıp aşmadığını takip eder ve throttle süresiyle performans optimizasyonu sağlar. Parametre olarak hem basit bir eşik sayısal değeri hem de kapsamlı bir seçenekler nesnesi kabul ederek esnek bir yapı sunar.

## Fonksiyon Grupları

### Scroll Throttle Hook'u
Scroll olaylarını belirtilen throttle süresiyle sınırlayarak dinler; eşik değeri aşıldığında durum bilgisini günceller. İlk parametre olarak ya doğrudan bir eşik değeri ya da `ScrollThrottleOptions` tipinde bir yapılandırma nesnesi, ikinci parametre olarak ise throttle süresini (milisaniye) alır.
- useScrollThrottle

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imzadan çıkarım yapılabilir. Gövde bilgisi olmadan davranışsal aksiyom üretilemez.

[Aksiyom 1]: Eğer `thresholdOrOptions` parametresi verilmezse, fonksiyon çalışamaz — bu parametre zorunludur (varsayılan değer yok).

[Aksiyom 2]: Eğer `throttleMsParam` parametresi verilmezse, fonksiyon çalışamaz — bu parametre zorunludur (varsayılan değer yok).

[Aksiyom 3]: Eğer `thresholdOrOptions` parametresi ne `number` ne de `ScrollThrottleOptions` tipinde ise, beklenen davranış bilinmiyor — tip kontrolü fonksiyon gövdesinde nasıl ele alınıyor bilinmemektedir.

**Not:** `ScrollThrottleOptions` tipinin hangi alanları içerdiği, throttle mekanizmasının nasıl işlediği ve scroll eşik değerlerinin nasıl kullanıldığı fonksiyon gövdesi verilmediğinden bilinmemektedir.

---

## FONKSİYON DETAYLARI

### useScrollThrottle
**Ne yapar**: Kaynakta bu fonksiyonun görevine dair bir docstring veya açıklama bulunmamaktadır. Fonksiyon adından ("use" ön eki, "Scroll" ve "Throttle" terimleri) bir React hook'u olduğu ve kaydırma (scroll) olaylarıyla ilişkili bir throttle (kısıtlama/geciktirme) mekanizması içerdiği anlaşılmaktadır; ancak kaynakta bu bilgi doğrulanmamıştır.

**Nasıl yapar**: Kaynakta fonksiyonun iç mantığına dair herhangi bir açıklama veya docstring bulunmamaktadır. Uygulama detayları bilinmemektedir.

**Parametreler**:
- `thresholdOrOptions`: `number | ScrollThrottleOptions` — Bu parametre ya sayısal bir eşik değeri ya da `ScrollThrottleOptions` tipinde bir yapı nesnesi alır. `ScrollThrottleOptions` tipinin ne içerdiği kaynakta belirtilmemiştir.
- `throttleMsParam`: `number` — Throttle süresini milisaniye cinsinden belirten sayısal değer.

**Dönüş**: Kaynakta dönüş tipi açıkça belirtilmemiştir. Bilinmemektedir.

---

## İTHALATLAR (IMPORTS)
- import: react::useCallback
- import: react::useEffect
- import: react::useRef
- import: react::useState

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
- **params**:
  - `thresholdOrOptions` — `number | ScrollThrottleOptions` tipinde, varsayılan değeri `100`. Sayısal ise eşik değeri olarak kullanılır; obje ise `showAt`, `hideBelow`, `throttleMs`, `initialDelayMs`, `syncKey` alanlarından değer okunur.
  - `throttleMsParam` — `number` tipinde, varsayılan değeri `16`. `thresholdOrOptions` sayısal olduğunda throttle süresi olarak kullanılır.
- **ic_degiskenler**:
  - `showAt` — `thresholdOrOptions` sayısal ise doğrudan `thresholdOrOptions` değeri, obje ise `thresholdOrOptions.showAt ?? 100`. Scroll pozisyonu bu değeri aştığında gösterim tetiklenir.
  - `hideBelow` — `thresholdOrOptions` sayısal ise `Math.max(0, thresholdOrOptions - 40)`, obje ise `thresholdOrOptions.hideBelow ?? Math.max(0, (thresholdOrOptions.showAt ?? 100) - 40)`. Scroll pozisyonu bu değerin altına düştüğünde gizleme tetiklenir.
  - `throttleMs` — `thresholdOrOptions` sayısal ise `throttleMsParam`, obje ise `thresholdOrOptions.throttleMs ?? throttleMsParam`. Scroll olayının throttle süresi (milisaniye).
  - `initialDelayMs` — `thresholdOrOptions` sayısal ise `180`, obje ise `thresholdOrOptions.initialDelayMs ?? 180`. İlk yüklemede scroll durumunun ayarlanması için gecikme süresi.
  - `syncKey` — `thresholdOrOptions` sayısal ise `undefined`, obje ise `thresholdOrOptions.syncKey`. Değiştiğinde useEffect yeniden çalışır ve scroll konumuyla senkronizasyon sağlanır.
  - `isScrolled` — `useState(false)` ile oluşturulan state. Scroll durumunu tutar; `true` ise üst kısma yakın (sticky gösterim), `false` ise üst kısma uzak.
  - `setIsScrolled` — `isScrolled` state'ini güncelleyen setter fonksiyonu.
  - `tickingRef` — `useRef(false)` ile oluşturulan ref. `requestAnimationFrame` döngüsünde çakışmayı önlemek için kilit görevi görür; `true` iken yeni scroll işlenmez.
  - `timeoutRef` — `useRef<NodeJS.Timeout | null>(null)` ile oluşturulan ref. Throttle amaçlı `setTimeout` ID'sini tutar; yeni scroll geldiğinde önceki timeout temizlenir.
  - `initialTimerRef` — `useRef<NodeJS.Timeout | null>(null)` ile oluşturulan ref. İlk yüklemedeki gecikmeli `setTimeout` ID'sini tutar.
  - `hasMountedRef` — `useRef(false)` ile oluşturulan ref. İlk mount edilip edilmediğini takip eder; `true` olduktan sonraki useEffect çalıştırmalarında syncKey değişim senkronizasyonu yapılır.
  - `lastAboveRef` — `useRef(false)` ile oluşturulan ref. Bir önceki örneklemede scroll pozisyonunun `showAt` üstünde olup olmadığını tutar; histerezis doğrulaması için kullanılır.
  - `lastBelowRef` — `useRef(true)` ile oluşturulan ref. Bir önceki örneklemede scroll pozisyonunun `hideBelow` altında olup olmadığını tutar; histerezis doğrulaması için kullanılır.
  - `handleScroll` — `useCallback` ile sarılmış fonksiyon. Scroll pozisyonunu `requestAnimationFrame` içinde okur, `showAt` ve `hideBelow` eşiklerine göre histerezis mantığıyla `isScrolled` durumunu günceller. Bağımlılıkları: `[isScrolled, showAt, hideBelow]`.
  - `throttledScroll` — `useCallback` ile sarılmış fonksiyon. `handleScroll` fonksiyonunu `throttleMs` süresiyle throttle eder; önceki timeout'u temizleyip yenisini oluşturur. Bağımlılıkları: `[handleScroll, throttleMs]`.
- **Dönüş**: `isScrolled` (boolean) — scroll durumunu dışarıya bildirir.

### [N2_NASIL] AST Pointer: src/hooks/useScrollThrottle.tsx::handleScroll (useCallback)
- **params**: yok
- **ic_degiskenler**:
  - `scrollTop` — `window.scrollY` değeri. Mevcut dikey scroll pozisyonunu tutar.
  - `nowAbove` — `scrollTop > showAt` sonucu. Mevcut örneklemede scroll pozisyonunun `showAt` üstünde olup olmadığını gösterir.
  - `nowBelow` — `scrollTop < hideBelow` sonucu. Mevcut örneklemede scroll pozisyonunun `hideBelow` altında olup olmadığını gösterir.
- **Dönüş**: yok (void). Yan etki olarak `setIsScrolled`, `lastAboveRef.current`, `lastBelowRef.current`, `tickingRef.current` değerlerini günceller.

### [N3_NASIL] AST Pointer: src/hooks/useScrollThrottle.tsx::throttledScroll (useCallback)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (void). Yan etki olarak `timeoutRef.current`'e `setTimeout` ID'si atar ve `handleScroll` fonksiyonunu `throttleMs` gecikmeyle çalıştırır.

### [N4_NASIL] AST Pointer: src/hooks/useScrollThrottle.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**:
  - `initialScrollTop` — `window.scrollY` değeri. useEffect çalıştığında mevcut scroll pozisyonunu tutar.
- **Dönüş**: cleanup fonksiyonu — `window.removeEventListener('scroll', throttledScroll)` çağırır, `timeoutRef.current` ve `initialTimerRef.current` timeout'larını temizler.

### [N5_NASIL] AST Pointer: src/hooks/useScrollThrottle.tsx::initialTimerRef setTimeout callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (void). Yan etki olarak `window.scrollY > showAt` koşulu sağlanırsa `setIsScrolled(true)` çağırır.

### [N6_NASIL] AST Pointer: src/hooks/useScrollThrottle.tsx::useEffect cleanup
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (void). `window.removeEventListener('scroll', throttledScroll)` çağırır, `timeoutRef.current` ve `initialTimerRef.current` timeout'larını temizler.

---

## NODE ID STANDARD

  file: useScrollThrottle.tsx
  function: useScrollThrottle.tsx::useScrollThrottle

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