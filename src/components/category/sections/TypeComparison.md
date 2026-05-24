---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\TypeComparison.tsx
skeleton_hash: e64ca2d20ec08be2
generated_at: 2026-05-23T22:02:21Z
---

## Genel Bakış
Bu modül, kategori bölümlerinde farklı türleri karşılaştırmak amacıyla kullanılan bir React bileşeni tanımlar. Kullanıcıya tür seçimi ve sihirbaz açma gibi etkileşimler sunar.

## Fonksiyon Grupları
### Ana Bileşen
Bileşen, ekranda karşılaştırma görünümünü oluşturur ve dışarıdan gelen onOpenWizard ve onSelectType geri çağrılarını tetikler.
- TypeComparison

---

## AXIOMS – Mimari Varsayımlar
Bu modül, `onOpenWizard` ve `onSelectType` prop'larının fonksiyon olarak sağlandığını varsayar.

[Aksiyom 1]: Eğer `onOpenWizard` prop'u sağlanmazsa veya `undefined` ise, component içinde bu fonksiyon çağrıldığında hata oluşur.  
[Aksiyom 2]: Eğer `onSelectType` prop'u sağlanmazsa veya `undefined` ise, component içinde bu fonksiyon çağrıldığında hata oluşur.  
[Aksiyom 3]: Eğer `onOpenWizard` prop'u bir fonksiyon değilse, çağrıldığında `TypeError` oluşur.  
[Aksiyom 4]: Eğer `onSelectType` prop'u bir fonksiyon değilse, çağrıldığında `TypeError` oluşur.

---

## FONKSIYON DETAYLARI

### TypeComparison
**Ne yapar**: Elektrikli sistemler ile ortam havalı sistemlerini yan yana göstererek kullanıcıların fayda, maliyet ve verimlilik açısından karşılaştırmasını sağlar; ayrıca karşılaştırma sonucunda hâlâ kararsız kalan kullanıcılar için bir sihirbaz (wizard) açarak daha detaylı yönlendirme yapar.  
**Nasıl yapar**: Bileşen, `onSelectType` fonksiyonunu kullanarak kullanıcının bir sistem türü seçtiğinde bu seçimi üst componente iletir; `onOpenWizard` fonksiyonu ise kullanıcı henüz bir karar veremediyse sihirbazı tetiklemek için çağrılır. Görsel karşılaştırma kartları, fayda tabloları ve bir “Wizard aç” butonu üzerinden bu akış gerçekleştirilir.  
**Parametreler**:
- onOpenWizard: kullanıcı henüz bir sistem türü seçmediğinde sihirbazı açmak için çağrılan callback fonksiyonu  
- onSelectType: kullanıcı bir sistem türü (elektrikli veya ortam havalı) seçtiğinde bu seçimi üst componente iletmek için kullanılan callback fonksiyonu  
**Dönüş**: `React.FC<TypeComparisonProps>` – bir React fonksiyon bileşeni olarak, JSX döndürerek karşılaştırma arayüzünü ve gerekli etkileşimleri render eder.

---

## INTERFACES

### TypeComparisonProps
- `onOpenWizard: () => void`
- `onSelectType: (type: 'elektrikli' | 'ortam') => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::TypeComparison
- **params**: onOpenWizard, onSelectType
- **ic_degiskenler**:
  - `sectionRef` — reference to the section element used for scroll‑animation hook
  - `isVisible` — boolean flag indicating whether the section is currently visible in the viewport
  - `hoveredType` — holds the currently hovered type identifier ('elektrikli' | 'ortam' | null)
  - `setHoveredType` — state setter function to update `hoveredType`
  - `types` — array of configuration objects for each type, containing title, subtitle, icon, color classes, benefits, bestFor, and notFor lists
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::map callback (type) => ...
- **params**: type
- **ic_degiskenler**:
  - `Icon` — React component icon extracted from `type.icon`
  - `isHovered` — boolean indicating if this type is currently hovered (`hoveredType === type.id`)
- **Dönüş**: JSX.Element

### [N3_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::benefits.map callback (benefit, i) => ...
- **params**: benefit, i
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element

### [N4_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::bestFor.map callback (item, i) => ...
- **params**: item, i
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element

### [N5_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::notFor.map callback (item, i) => ...
- **params**: item, i
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\category\sections\TypeComparison.tsx
  function: src\components\category\sections\TypeComparison.tsx::TypeComparison

---

## DISA AKTARILANLAR (EXPORTS)
  export: TypeComparison