---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\BackToTopButton.tsx
skeleton_hash: 7805843109ba355b
entity_hashes:
  func:BackToTopButton: c8f2538093a58334
  overview: bde72dfa4c09c889
  style_tokens: 2d1270f1d895a080
generated_at: 2026-05-27T12:12:35Z
---

## Genel Bakış
`BackToTopButton` bileşeni, sayfa kaydırma konumuna göre görünür hâle gelen ve tıklandığında kullanıcıyı sayfanın en üstüne taşıyan bir React fonksiyonel bileşenidir. UI içinde sabit bir konumda yer alır ve kullanıcı deneyimini iyileştirmek için basit bir geri dönüş işlevi sunar.

## Fonksiyon Grupları
### UI Render ve Etkileşim
Bu grup, butonun görsel çıktısını üretir ve kullanıcı tıklamasını işleyerek sayfayı en üste kaydırır.  
- BackToTopButton   (bileşenin kendisi, render ve click handler içerir)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### BackToTopButton
**Ne yapar**: Sayfanın en altına kaydırıldığında kullanıcıyı sayfanın en üstüne götüren bir “Back to Top” (yukarı dön) butonu sağlayan bir React fonksiyonel bileşeni oluşturur.  

**Nasıl yapar**: Fonksiyon, bir React functional component (`React.FC`) döndürür; bileşen içinde muhtemelen bir buton/render elemanı tanımlanır ve tıklama olayıyla sayfa kaydırma davranışı tetiklenir. (İç mantık koddan elde edilemediği için genel bir açıklama verilmiştir.)  

**Parametreler**:
- *Yok* — Fonksiyon parametre almaz.

**Dönüş**: `React.FC` — Oluşturulan “Back to Top” butonunu temsil eden bir React functional component.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\BackToTopButton.tsx::BackToTopButton
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `visible` — `useState` ile oluşturulan, butonun görünür olup olmadığını tutan boolean değer.
  - `setVisible` — `visible` state'ini güncelleyen setter fonksiyonu.
  - `pos` — `{ bottom: number; right: number }` tipinde, butonun ekrandaki konumunu tutan nesne.
  - `setPos` — `pos` state'ini güncelleyen setter fonksiyonu.
  - `t` — `useI18n` hookundan gelen çeviri fonksiyonu, `t('common.backToTop')` ile metin çevirisi yapılır.
  - `onScroll` — kaydırma olayını dinleyen ve `visible` state'ini ayarlayan iç fonksiyon (aşağıda ayrı bir AST Pointer olarak listelenir).
  - `computePos` — butonun konumunu hesaplayan ve `pos` state'ini güncelleyen iç fonksiyon (aşağıda ayrı bir AST Pointer olarak listelenir).
  - `id` — `setInterval` tarafından döndürülen zamanlayıcı kimliği, temizleme sırasında `clearInterval` ile iptal edilir.
  - `GAP` — layout boşluğu için kullanılan sabit (dosyada tanımlı değil, dışarıdan sağlanır).
- **Dönüş**: React bileşeni (`React.FC`). Render edilen `<button>` elemanı, `visible` durumuna göre görünürlük ve konum stillerini ayarlar; tıklanınca sayfayı üstteki konuma yumuşak kaydırır.

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\BackToTopButton.tsx::onScroll
- **params**: `_e: Event`
- **ic_degiskenler**:
  - `y` — `window.scrollY` veya `document.documentElement.scrollTop` değerlerinden elde edilen mevcut dikey kaydırma konumu.
  - `setVisible` — dışarıdaki `BackToTopButton` bileşeninden gelen setter, `y > 400` olduğunda `visible` state'ini `true` yapar.
- **Dönüş**: `void` (state güncellemesi yapar, geri değer döndürmez).

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\BackToTopButton.tsx::computePos
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `el` — `document.getElementById('language-switcher')` ile elde edilen dil değiştirici DOM elemanı.
  - `rect` — `el.getBoundingClientRect()` ile alınan elemanın konum ve boyut bilgilerini içeren `DOMRect` nesnesi.
  - `bottomFromViewport` — viewport alt kenarı ile elemanın alt kenarı arasındaki boşluk; `Math.max(16, window.innerHeight - rect.bottom)` ile hesaplanır.
  - `rightToLeftEdge` — viewport sol kenarı ile elemanın sol kenarı arasındaki yatay mesafe; `window.innerWidth - rect.left` ile hesaplanır.
  - `setPos` — dışarıdaki `BackToTopButton` bileşeninden gelen setter, butonun `bottom` ve `right` konumlarını günceller.
  - `GAP` — yatay/vertical ek boşluk sabiti; konum hesaplamalarında eklenir.
- **Dönüş**: `void` (state güncellemesi yapar, geri değer döndürmez).

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\BackToTopButton.tsx::cleanupScrollEffect
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onScroll` — `useEffect` içinde tanımlı kaydırma dinleyicisi; bu temizleme fonksiyonunda `window.removeEventListener('scroll', onScroll)` ile kaldırılır.
- **Dönüş**: `void` (event listener'ı kaldırır).

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\BackToTopButton.tsx::cleanupResizeEffect
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `computePos` — `useEffect` içinde tanımlı konum hesaplama fonksiyonu; `window.removeEventListener('resize', computePos)` ile kaldırılır.
  - `id` — `setInterval` tarafından döndürülen zamanlayıcı kimliği; `clearInterval(id)` ile iptal edilir.
- **Dönüş**: `void` (resize listener'ı ve interval'i temizler).

---

## NODE ID STANDARD

  file: src\components\BackToTopButton.tsx
  function: src\components\BackToTopButton.tsx::BackToTopButton

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
- **Renkler:** `bg-primary-navy`, `border-white/20`, `text-white`
- **Layout:** `fixed`, `p-3`, `shadow-lg`, `z-40`
- **Responsive:** (yok)