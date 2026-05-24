---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\ProblemSection.tsx
skeleton_hash: afa107ed0ce1c9c5
generated_at: 2026-05-23T21:59:23Z
---

## Genel Bakış
Bu modül, kategori sayfasında sorunları listeleyen bir React bileşenini tanımlar. `ProblemSection` fonksiyonu, kullanıcıya sorunlarla ilgili bilgileri görsel olarak düzenli bir şekilde sunmak için gerekli JSX yapısını döndürür.

## Fonksiyon Grupları
### Bileşen Renderlama
Bu grup, kullanıcı arayüzünde sorun bölümünün oluşturulmasını ve görüntülenmesini sağlar.
- ProblemSection

---

## AXIOMS – Mimari Varsayımlar
ProblemSection bileşeni dışarıdan prop almayı beklemez.
[Aksiyom 1]: Eğer prop geçilmezse, bileşen hatasız çalışır.

---

## FONKSIYON DETAYLARI

### ProblemSection
**Ne yapar**: Kullanıcıya hava perdesi ihtiyacını hissettiren, "Problemi Tanı" bölümü olan bir empati bölümü render eder.  
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanır ve JSX döndürerek bölümü UI'ya ekler. İçerik, kullanıcıya problem farkındalığı yaratmak amacıyla metin ve görsel öğeler içerir.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: `React.FC` türünde bir fonksiyon döndürür; bu fonksiyon render edildiğinde ilgili bölümü gösteren JSX elemanını üretir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\category\sections\ProblemSection.tsx::ProblemSection
- **params**: (yok)
- **ic_degiskenler**:
  - `sectionRef` — ref for scroll animation, holds the HTMLElement reference returned by `useScrollAnimation`
  - `isVisible` — boolean flag indicating whether the section is currently visible in the viewport, provided by `useScrollAnimation`
  - `problems` — array of problem objects; each object contains `icon` (Lucide component), `title` (string), `stat` (string), `description` (string), `color` (text color class), and `bgColor` (background color class) used to render the cards
- **Dönüş**: JSX.Element (the rendered `<section>` component)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\category\sections\ProblemSection.tsx::(anonymous map callback)
- **params**: `problem` — object with `icon`, `title`, `stat`, `description`, `color`, `bgColor`; `index` — number representing the item's position in the `problems` array
- **ic_degiskenler**:
  - `Icon` — variable assigned from `problem.icon`, used as the Lucide icon component to render inside the card
- **Dönüş**: JSX.Element (the rendered `<div>` representing a problem card)

---

## NODE ID STANDARD

  file: src\components\category\sections\ProblemSection.tsx
  function: src\components\category\sections\ProblemSection.tsx::ProblemSection

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProblemSection