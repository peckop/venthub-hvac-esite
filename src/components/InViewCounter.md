---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\InViewCounter.tsx
skeleton_hash: 9c5b62f840a3b577
entity_hashes:
  func:InViewCounter: 223b6183b16e2873
  overview: 61076e120659900f
  style_tokens: 2ef2cd2897b38d9e
generated_at: 2026-05-28T22:36:00Z
---

## Genel Bakış
Bu modül, sayfa içinde görünebildiği anda bir sayıyı belirli bir süre içinde artırarak gösteren bir React bileşeni sağlar. Kullanıcıya dinamik bir sayaç deneyimi sunmak için görüntülendiğinde animasyonlu bir sayım işlemi gerçekleştirir.

## Fonksiyon Grupları
### Ana Bileşen
Bileşenin temel işlevini ve görüntülendiğinde sayaç animasyonunu yöneten tek işlevi içerir.
- InViewCounter

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer **label** prop’u sağlanmazsa, bileşen gerekli metni gösteremeyeceği için render hatası veya boş bir görüntü oluşur.  
[Aksiyom 2]: Eğer **to** prop’u sağlanmazsa, sayım hedefi belirlenemediği için bileşen saymaya başlayamaz ve hiçbir değer göstermez.  
[Aksiyom 3]: Eğer **to** prop’u sayısal bir değer değilse (örneğin string, null), sayım mantığı beklenmedik sonuçlar üretebilir veya çalışma zamanında hata fırlatabilir.  
[Aksiyom 4]: Eğer **suffix** prop’u sağlanmazsa, varsayılan olarak boş string (`''`) kullanılır; bu durumda sayının sonuna hiçbir ek metin eklenmez.  
[Aksiyom 5]: Eğer **durationMs** prop’u sağlanmazsa, varsayılan olarak 1200 ms kullanılır; bu değer sayım animasyonunun toplam süresini belirler.  
[Aksiyom 6]: Eğer **durationMs** sıfır veya negatif bir değerse, animasyon süresi geçersiz olur ve sayım aniden tamamlanabilir veya hiç görünmeyebilir.  
[Aksiyom 7]: Bileşen, React’in `useState` ve `useEffect` hook’larına bağımlıdır; bu hook’ların desteklenmeyen bir ortamda (örneğin klasik bir JavaScript dosyasında) kullanılması beklenmedik hatalar veroor.  
[Aksiyom 8]: Bileşenin içindeki zamanlayıcı (örneğin `setInterval` veya `requestAnimationFrame`) bileşenun unmount edilmesiyle temizlenmezse, bellek sızıntısı veya eski state güncellemeleri yaşanabilir.  

Bu varsayımlar, modülün fonksiyon imzalarından ve tipik React davranışlarından türetilmiştir; başka bir belge ya da yorumdan çıkarılmamıştır.

---

## FONKSİYON DETAYLARI

### InViewCounter
**Ne yapar**: Görünür alana girdiğinde sayısal değeri belirtilen sürede animasyonlu olarak artan bir sayaç bileşeni render eder.  
**Nasıl yapar**: `IntersectionObserver` kullanarak bileşenin viewport içinde görünürlüğünü izler; görünür olduğunda `setInterval` veya `requestAnimationFrame` üzerinden 0’dan `to` değerine kadar artan sayıyı hesaplar ve `label` ile `suffix` ekleyerek ekrana yazar.  
**Parametreler**:
- label: string — Sayı önüne eklenecek metin (örn. “Toplam: ”).  
- to: number — Sayaç hedef değeri; animasyon bu sayıya ulaşınca durur.  
- suffix: string — Sayı sonuna eklenecek metin (örn. “ kişi”). Varsayılan boş string.  
- durationMs: number — Animasyonun tamamlanması için geçen milisaniye süresi. Varsayılan 1200 ms.  
**Dönüş**: React.FC<CounterProps> — `label`, `to`, `suffix` ve `durationMs` props’larını kabul eden ve animasyonlu sayaç gösteren bir React fonksiyonel bileşeni.

---

## INTERFACES

### CounterProps
- `label: string`
- `to: number`
- `suffix?: string`
- `durationMs?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/InViewCounter.tsx::InViewCounter
- **params**: label, to, suffix = '', durationMs = 1200
- **ic_degiskenler**:
  - `ref` — useRef to hold DOM element reference for IntersectionObserver.
  - `value` — state variable for current displayed count.
  - `setValue` — setter for `value` state.
  - `started` — boolean flag indicating animation has started.
  - `setStarted` — setter for `started`.
  - `shouldAnimate` — flag indicating whether animation should run (respects reduced‑motion preferences).
  - `setShouldAnimate` — setter for `shouldAnimate`.
- **Dönüş**: JSX element (React.FC<CounterProps>)

### [N2_NASIL] AST Pointer: src/components/InViewCounter.tsx::useEffect_reducedMotion
- **params**: (yok)
- **ic_degiskenler**:
  - `rm` — MediaQueryList for prefers‑reduced‑motion media query.
  - `coarse` — MediaQueryList for pointer:coarse media query.
  - `update` — function that updates `shouldAnimate` based on match results.
- **Dönüş**: cleanup function (void)

### [N3_NASIL] AST Pointer: src/components/InViewCounter.tsx::cleanup_reducedMotion
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N4_NASIL] AST Pointer: src/components/InViewCounter.tsx::useEffect_intersectionObserver
- **params**: (yok)
- **ic_degiskenler**:
  - `el` — DOM element from `ref.current`.
  - `io` — IntersectionObserver instance observing the element.
- **Dönüş**: cleanup function (void)

### [N5_NASIL] AST Pointer: src/components/InViewCounter.tsx::cleanup_intersectionObserver
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N6_NASIL] AST Pointer: src/components/InViewCounter.tsx::intersectionObserverCallback
- **params**: entries
- **ic_degiskenler**:
  - `e` — individual IntersectionObserverEntry from the entries list.
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src/components/InViewCounter.tsx::intersectionObserverEntryArrow
- **params**: e
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src/components/InViewCounter.tsx::useEffect_animationFrame
- **params**: (yok)
- **ic_degiskenler**:
  - `raf` — requestAnimationFrame ID.
  - `t0` — start timestamp from `performance.now()`.
  - `animate` — recursive animation function that updates the displayed value.
- **Dönüş**: cleanup function (void)

### [N9_NASIL] AST Pointer: src/components/InViewCounter.tsx::cleanup_animationFrame
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N10_NASIL] AST Pointer: src/components/InViewCounter.tsx::animateFunction
- **params**: t
- **ic_degiskenler**:
  - `p` — progress ratio (0‑1) based on elapsed time over `durationMs`.
  - `eased` — eased value using easeOutCubic formula.
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\InViewCounter.tsx
  function: src\components\InViewCounter.tsx::InViewCounter

---

## DISA AKTARILANLAR (EXPORTS)
  export: InViewCounter

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `border-light-gray`, `text-4xl`, `text-center`, `text-primary-navy`, `text-steel-gray`
- **Layout:** `p-6`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `border`, `font-bold`, `mt-1`, `rounded-2xl`, `tabular-nums`