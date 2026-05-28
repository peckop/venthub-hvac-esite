---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\CategoriesShowcase.tsx
skeleton_hash: f358893d4842d0e3
entity_hashes:
  func:CategoriesShowcase: 7ceefb1e66be0555
  overview: 0e322bf2da6b6e91
  style_tokens: bfb925fbc086f215
generated_at: 2026-05-28T22:35:44Z
---

## Genel Bakış
Bu modül, bir kategorilerin görsel bir vitrini sunan bir React bileşeni tanımlar. Verilen kategori listesini alarak her birini uygun bir şekilde düzenler ve kullanıcıya gösterir.

## Fonksiyon Grupları
### Ana Bileşen
Bileşen, kategorileri alıp ekranda görsel bir şekilde listeleyen mantığı içerir.
- CategoriesShowcase

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### CategoriesShowcase
**Ne yapar**: Kategorileri görsel bir vitrinde gösteren bir React bileşeni render eder.  
**Nasıl yapar**: `categories` prop'ını alır, içindeki verileri işleyerek JSX öğeleri oluşturur ve bu öğeleri döndürür.  
**Parametreler**:
- categories: Array<any> — Gösterilecek kategorilerin listesi. Her öğenin yapısı projeye özgü olabilir.  
**Dönüş**: React.ReactNode — Bileşenin ekrana çıktısı olan JSX elementi.

---

## INTERFACES

### CategoriesShowcaseProps
- `categories: Category[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/CategoriesShowcase.tsx::CategoriesShowcase
- **params**: categories
- **ic_degiskenler**: 
  - `t` — translation function from `useI18n()` used to retrieve localized UI strings.
  - `mainCategories` — array of category objects that have no `parent_id` (top‑level categories).
  - `subCategories` — array of category objects that have a `parent_id` (child categories).
  - `getSubCategoryCount` — function that returns the number of sub‑categories for a given parent id.
  - `getPopularCategories` — function that returns up to four popular categories based on a predefined slug list.
- **Dönüş**: JSX element — the rendered `<section>` containing the showcase UI.

### [N2_NASIL] AST Pointer: src/components/CategoriesShowcase.tsx::getSubCategoryCount
- **params**: parentId
- **ic_degiskenler**: (none)
- **Dönüş**: number — count of sub‑category objects whose `parent_id` matches the supplied `parentId`.

### [N3_NASIL] AST Pointer: src/components/CategoriesShowcase.tsx::getPopularCategories
- **params**: (none)
- **ic_degiskenler**: (none)
- **Dönüş**: Array\<Category\> — up to four category objects whose `slug` is one of `['fans','heat-recovery-units','air-curtains','air-purifiers']`.

### [N4_NASIL] AST Pointer: src/components/CategoriesShowcase.tsx::PopularCategoryMapper
- **params**: category
- **ic_degiskenler**: (none)
- **Dönüş**: JSX.Element — a `<Link>` component that renders a popular category card, displaying the category icon, display name, description, and sub‑category count.

### [N5_NASIL] AST Pointer: src/components/CategoriesShowcase.tsx::MainCategoryMapper
- **params**: category
- **ic_degiskenler**: (none)
- **Dönüş**: JSX.Element — a `<Link>` component that renders a main category card, displaying the category icon, display name, and the variant (sub‑category) count.

---

## NODE ID STANDARD

  file: src\components\CategoriesShowcase.tsx
  function: src\components\CategoriesShowcase.tsx::CategoriesShowcase

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoriesShowcase

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-br`, `bg-primary-navy`, `bg-white`, `border-light-gray`, `from-air-blue`, `group-hover:text-primary-navy`, `group-hover:text-secondary-blue`, `hover:bg-secondary-blue`, `hover:border-secondary-blue`, `md:text-4xl`, `text-2xl`, `text-3xl`, `text-center`, `text-gold-accent`, `text-industrial-gray`
- **Layout:** `flex`, `flex-1`, `from-air-blue`, `gap-4`, `gap-6`, `grid`, `grid-cols-1`, `hover:shadow-hvac`, `hover:shadow-sm`, `inline-flex`, `items-center`, `justify-center`, `lg:grid-cols-4`, `max-w-3xl`, `max-w-7xl`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `duration-200`, `font-bold`, `font-medium`, `font-semibold`, `group`, `group-hover:scale-110`, `group-hover:translate-x-1`, `lg:px-8`, `mb-12`, `mb-16`, `mb-2`, `mb-3`, `mb-4`, `mb-8`