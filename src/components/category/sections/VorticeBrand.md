---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\VorticeBrand.tsx
skeleton_hash: 94eed6a8060e5ab3
entity_hashes:
  func:VorticeBrand: a8d2715dd40c7de5
  overview: 07ac1657460cc044
  style_tokens: 751231d1b5ff9e5b
generated_at: 2026-05-28T22:35:48Z
---

## Genel Bakış
Bu modül, Vortice markasıyla ilgili ürün veya bilgi bölümünü gösteren bir React bileşeni tanımlar. Bileşen, sayfa içinde marka özetini, görsellerini ve bağlantılarını düzenler.

## Fonksiyon Grupları
### Ana Bileşen Tanımı
Bu grup, modülün tek işlevini içerir ve kullanıcı arayüzünde Vortice marka bölümünü oluşturur.
- VorticeBrand

---

## AXIOMS – Mimari Varsayımlar
Bu modül, props almayan bir React fonksiyon bileşeni olarak tasarlanmıştır.

[Aksiyom 1]: Eğer `VorticeBrand` fonksiyonuna prop geçilirse, bileşenin render çıktısı ve davranışı garantilenmez.

---

## FONKSİYON DETAYLARI

### VorticeBrand
**Ne yapar**: Vortice markasının 70 yıllık İtalyan mühendisliği ve güvenilirlik hikayesini gösteren bir bölüm bileşeni render eder.  
**Nasıl yapar**: Fonksiyon, JSX ile bir `<section>` (veya benzeri kapsayıcı) döndürerek başlık, açıklama ve görsel öğeleri yerleştirir; dışarıdan prop almaz ve kendi iç durumunu yönetmez.  
**Parametreler**: Yok  
**Dönüş**: `React.FC` türünde bir fonksiyon bileşeni; render edildiğinde Vortice marka hikayesi bölümüyle ilgili JSX döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/VorticeBrand.tsx::VorticeBrand
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `sectionRef` — ref to the section element for scroll animation
  - `isVisible` — boolean indicating whether the section is in viewport for animation
  - `highlights` — array of objects containing icon, value, label, description for stats
  - `scrollAnimationClasses` — object with animation class names (slideRight, slideLeft, fadeUp, fadeIn) used for scroll‑based animations
  - `VentImage` — component used to display the hero image
  - `Award`, `Globe`, `Clock`, `Shield`, `Star` — icon components from lucide‑react used in highlights and badge UI
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/category/sections/VorticeBrand.tsx::<anonymous>
- **params**: `item`, `index`
- **ic_degiskenler**:
  - `item` — each element of highlights array containing icon, value, label, description
  - `index` — numeric index of the current highlight in the map iteration
  - `Icon` — React component extracted from item.icon (e.g., Clock, Globe) used to render the icon
  - `scrollAnimationClasses` — animation class helper used to get fadeUp class based on visibility
  - `isVisible` — boolean from outer scope indicating visibility, used to conditionally apply fadeUp animation
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\category\sections\VorticeBrand.tsx
  function: src\components\category\sections\VorticeBrand.tsx::VorticeBrand

---

## DISA AKTARILANLAR (EXPORTS)
  export: VorticeBrand

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-b`, `bg-gradient-to-t`, `bg-green-500`, `bg-red-500`, `bg-white`, `bg-white/10`, `bg-white/5`, `border-t`, `border-white/10`, `from-black/70`, `from-slate-900`, `hover:bg-white/10`, `md:text-4xl`, `sm:text-3xl`, `sm:text-base`
- **Layout:** `absolute`, `backdrop-blur-sm`, `bottom-0`, `flex`, `flex-wrap`, `from-black/70`, `from-slate-900`, `gap-1.5`, `gap-2`, `gap-8`, `grid`, `grid-cols-4`, `h-5`, `h-auto`, `hidden`
- **Varyant/Responsive:** `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${scrollAnimationClasses.fadeIn(isVisible`, `${scrollAnimationClasses.fadeUp(isVisible`, `border`, `font-bold`, `font-medium`, `inset-0`, `lg:px-8`, `mb-1`, `mb-4`, `mb-6`, `mt-8`, `mx-auto`, `opacity-5`, `pt-6`, `px-3`