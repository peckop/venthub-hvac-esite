---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\BackToTopButton.tsx
skeleton_hash: fc970852e5b16423
entity_hashes:
  func:BackToTopButton: c8f2538093a58334
  func:handleScrollToTop: 94e0754193bc122d
  overview: cab9522d3717ffc4
  style_tokens: b29c0a49231e465f
generated_at: 2026-06-19T20:47:06Z
---

## Genel Bakış
BackToTopButton bileşeni, sayfa kaydırma konumuna göre görünürlüğü kontrol edilen ve kullanıcı tıklamasıyla sayfanın en üstüne yumuşak geçiş sağlayan bir React fonksiyonel bileşenidir. Kullanıcı deneyimini iyileştirmek için sabit konumda yer alan, minimal bir navigasyon yardımcısıdır.

## Fonksiyon Grupları
### Bileşen ve Etkileşim
Butonun görünümünü, görünür olma durumunu ve kullanıcı tıklamasını yöneten ana React bileşenidir.
- BackToTopButton, handleScrollToTop

---

## AXIOMS – Mimari Varsayımlar
Bu modül için verilen fonksiyon gövdesi bulunamadığından, mimari varsayımlar üretilememektedir.

---

## FONKSİYON DETAYLARI

### BackToTopButton
**Ne yapar**: Sayfanın en altına kaydırıldığında kullanıcıyı sayfanın en üstüne götüren bir “Back to Top” (yukarı dön) butonu sağlayan bir React fonksiyonel bileşeni oluşturur.  

**Nasıl yapar**: Fonksiyon, bir React functional component (`React.FC`) döndürür; bileşen içinde muhtemelen bir buton/render elemanı tanımlanır ve tıklama olayıyla sayfa kaydırma davranışı tetiklenir. (İç mantık koddan elde edilemediği için genel bir açıklama verilmiştir.)  

**Parametreler**:
- *Yok* — Fonksiyon parametre almaz.

**Dönüş**: `React.FC` — Oluşturulan “Back to Top” butonunu temsil eden bir React functional component.

### handleScrollToTop

**Ne yapar**: Sayfanın en üstüne yumuşak bir şekilde kaydırma işlemi gerçekleştirir. Kullanıcı sayfayı aşağı kaydırdığında görünen "Back to Top" butonuna tıklandığında çağrılır ve pencereyi sayfanın başlangıç konumuna (0,0) geri taşır.

**Nasıl yapar**: `window.scrollTo()` veya `window.scroll()` metodu ile `behavior: 'smooth'` seçeneği kullanarak animasyonlu bir kaydırma efekti oluşturur. Bu sayede kullanıcı deneyimi için ani bir geçiş yerine yumuşak bir geçiş sağlanır.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `void` — Fonksiyon herhangi bir değer döndürmez, sadece pencere konumunu değiştirir.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useScrollThrottle::useScrollThrottle
- import: ../i18n/I18nProvider::useI18n
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/BackToTopButton.tsx::BackToTopButton
- **params**: (yok)
- **ic_degiskenler**:
    - `t` — `useI18n` hook'undan dönen çeviri fonksiyonu, bileşen içindeki metinlerin lokalizasyonu için kullanılır.
    - `visible` — `useScrollThrottle` hook'undan dönen boolean değer, sayfanın belirli bir scroll pozisyonunda olup olmadığını belirtir (butonun görünürlüğünü kontrol eder).
    - `handleScrollToTop` — Sayfayı en üste kaydıran ve odaklayan iç callback fonksiyonu.
- **Dönüş**: JSX Element (React.FC bileşeni)

### [N2_NASIL] AST Pointer: src/components/BackToTopButton.tsx::handleScrollToTop
- **params**: (yok)
- **ic_degiskenler**:
    - `isReduced` — Kullanıcının "prefers-reduced-motion" tercihini kontrol eden boolean değişken. `true` ise animasyon devre dışı, `false` ise smooth scroll kullanılır.
    - `mainContent` — DOM'daki `id="main-content"` olan HTML elementine referans. Odak yönetiminde kullanılır (erişilebilirlik için).
- **Dönüş**: void

---

## NODE ID STANDARD

  file: src\components\BackToTopButton.tsx
  function: src\components\BackToTopButton.tsx::BackToTopButton
  function: src\components\BackToTopButton.tsx::handleScrollToTop

---

## DISA AKTARILANLAR (EXPORTS)
  export: BackToTopButton

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `border-white/20`, `hover:bg-secondary-blue`, `text-white`
- **Layout:** `p-3`, `shadow-lg`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `border`, `duration-300`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy`, `invisible`, `opacity-0`, `opacity-100`, `pointer-events-none`, `rounded-full`, `scale-100`, `scale-75`