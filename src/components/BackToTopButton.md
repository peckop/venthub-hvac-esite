---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\BackToTopButton.tsx
skeleton_hash: 7805843109ba355b
generated_at: 2026-05-23T21:56:49Z
---

## Genel Bakış
`BackToTopButton` bileşeni, sayfa içinde kullanıcıyı en üst konuma hızlıca taşıyan bir düğme sunar. Kullanıcı kaydırma yaptığında görünür hâle gelir ve tıklandığında sayfa tepesine sorunsuz bir kaydırma gerçekleştirir.

## Fonksiyon Grupları
### UI Render ve Etkileşim
Bu grup, butonun görsel olarak render edilmesi, görünürlük kontrolü ve tıklama olayını yönetmekle sorumludur.  
- BackToTopButton

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### BackToTopButton
**Ne yapar**: Sayfanın üstüne hızlıca kaydırarak kullanıcı deneyimini iyileştirir.  
**Nasıl yapar**: `useEffect` ile pencere kaydırma olayını izler, belirli bir eşik değeri aşınca butonu görünür yapar; tıklandığında `window.scrollTo({top:0, behavior:'smooth'})` çağrılır.  
**Parametreler**: Yok  
**Dönüş**: `React.FC` türünde bir bileşen döndürür; JSX olarak render edilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/BackToTopButton.tsx::BackToTopButton
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `visible` — state controlling button visibility (boolean)
  - `setVisible` — setter for visible state
  - `pos` — state object `{bottom:number, right:number}` for button position
  - `setPos` — setter for `pos` state
  - `t` — translation function from `useI18n` used to get localized string for `aria-label`
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/BackToTopButton.tsx::useEffect_onScroll
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onScroll` — scroll event handler that updates `visible` state based on `scrollY`
- **Dönüş**: cleanup function (returns void)

### [N3_NASIL] AST Pointer: src/components/BackToTopButton.tsx::onScroll_handler
- **params**: _e: Event
- **ic_degiskenler**:
  - `y` — number representing current vertical scroll position (`window.scrollY` or `document.documentElement.scrollTop`)
- **Dönüş**: void

### [N4_NASIL] AST Pointer: src/components/BackToTopButton.tsx::useEffect_computePos
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `computePos` — function that recalculates button position based on the language‑switcher element
  - `id` — interval ID returned by `setInterval` for periodic position updates
- **Dönüş**: cleanup function (returns void)

### [N5_NASIL] AST Pointer: src/components/BackToTopButton.tsx::computePos
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `el` — `HTMLElement | null` referencing the element with id `'language-switcher'`
  - `rect` — `DOMRect` of the language‑switcher element (from `getBoundingClientRect`)
  - `bottomFromViewport` — number, distance from bottom of viewport to element bottom, clamped at minimum 16px
  - `rightToLeftEdge` — number, horizontal space from element left edge to right window edge
- **Dönüş**: void

### [N6_NASIL] AST Pointer: src/components/BackToTopButton.tsx::useEffect_cleanup
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

---

## NODE ID STANDARD

  file: src\components\BackToTopButton.tsx
  function: src\components\BackToTopButton.tsx::BackToTopButton

---

## DISA AKTARILANLAR (EXPORTS)
  export: BackToTopButton