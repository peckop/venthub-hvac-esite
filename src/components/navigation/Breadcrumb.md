---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\Breadcrumb.tsx
skeleton_hash: 2d7ad05f4cfd2258
generated_at: 2026-05-23T22:14:14Z
---

## Genel Bakış
Breadcrumb bileşeni, uygulamanın navigasyon hiyerarşisini gösteren bir yol çubuğu oluşturan yeniden kullanılabilir bir React öğesidir. Öğe listesi, görsel varyantı ve ekstra sınıf adı gibi props alır ve bu bilgilere göre uygun şekilde biçimlendirilmiş bir breadcrumb çubuğu döndürür.

## Fonksiyon Grupları
### Temel Renderleme
Bileşenin ana işlevi, alınan öğeleri sıralı bir şekilde göstererek kullanıcıya geçerli konumun yolunu sunmaktır.
- Breadcrumb

---

## AXIOMS – Mimari Varsayımlar
Breadcrumb bileşeni, `items` prop'ının mevcut olmasını ve `variant` ile `className` prop'larının belirtilmediği takdirde varsayılan değerleri kullanmasını gerektirir.

[Aksiyom 1]: Eğer `items` prop'u sağlanmazsa, bileşen gerekli veri olmadan render edilmeye çalışacak ve hata veya boş çıktı üretmeye neden olabilir.  
[Aksiyom 2]: Eğer `variant` prop'u sağlanmazsa, varsayılan olarak `'white'` değeri kullanılır.  
[Aksiyom 3]: Eğer `className` prop'u sağlanmazsa, varsayılan olarak boş string (`''`) değeri kullanılır.

---

## FONKSIYON DETAYLARI

### Breadcrumb
**Ne yapar**: Breadcrumb (ekmek kırıntısı) navigasyon bileşeni, kullanıcının mevcut sayfadaki konumunu hiyerarşik bir şekilde gösterir ve geçmişe dönük bağlantılar sunar.

**Nasıl yapar**: `items` prop olarak gelen etiket ve opsiyonel link listesini iterate ederek her bir öğeyi bir `<li>` (veya benzeri) öğesi içinde render eder; son öğe genellikle aktif durumda ve bağlantısız olarak gösterilir. `variant` prop’u bileşenin stil teması (ör. 'white' veya 'dark') belirlerken, `className` prop’u ekstra CSS sınıfları eklemeye olanak tanır.

**Parametreler**:
- items: Array<{label: string; href?: string}> — Breadcrumb’ın gösterileceği etiket ve opsiyonel URL çiftlerinin dizisi; son eleman genellikle `href` olmadan sadece etiket içerir.
- variant: string — Bileşenin görsel varyantını tanımlar; varsayılan değer `'white'` olup, tema değişiklikleri için farklı string değerler alabilir.
- className: string — Bileşene ek CSS sınıfları eklemek için kullanılan isteğe bağlı string; varsayılan değer boş string ('').

**Dönüş**: React.FC<BreadcrumbProps> — Breadcrumb bileşenini render eden bir fonksiyonel React bileşeni döndürür; bu bileşen JSX olarak hiyerarşik navigasyon yapısını üretir.

---

## INTERFACES

### BreadcrumbItem
- `label: string`
- `href?: string`
- `icon?: React.ReactNode`

### BreadcrumbProps
- `items: BreadcrumbItem[]`
- `variant?: 'white' | 'transparent' | 'dark'`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/Breadcrumb.tsx::Breadcrumb
- **params**: items, variant, className
- **ic_degiskenler**: 
  - `bgClasses` — object mapping variant to background CSS classes (`bg-white border-b`, `bg-transparent`, `bg-primary-navy/10`).
  - `textClasses` — object mapping variant to text CSS class objects (link, current, separator styles).
  - `styles` — selected text class object based on the `variant` prop.
  - `jsonLd` — LD+json schema object representing a BreadcrumbList for SEO.
- **Dönüş**: JSX.Element (returns `<nav>` with breadcrumb markup or `null` when items empty)

### [N2_NASIL] AST Pointer: src/components/navigation/Breadcrumb.tsx::<anonymous> (items.map callback for jsonLd)
- **params**: item, index
- **ic_degiskenler**: yok
- **Dönüş**: Object (a ListItem object with `@type`, `position`, `name`, and conditional `item` URL)

### [N3_NASIL] AST Pointer: src/components/navigation/Breadcrumb.tsx::<anonymous> (items.map callback for rendering)
- **params**: item, index
- **ic_degiskenler**:
  - `isLast` — boolean true when the item is the last element in the `items` array.
  - `isFirst` — boolean true when the item is the first element in the `items` array.
- **Dönüş**: JSX.Element (`<li>` containing either a separator, a Home icon, and either a `<span>` or `<Link>` for the breadcrumb item)

---

## NODE ID STANDARD

  file: src\components\navigation\Breadcrumb.tsx
  function: src\components\navigation\Breadcrumb.tsx::Breadcrumb

---

## DISA AKTARILANLAR (EXPORTS)
  export: Breadcrumb
  export: BreadcrumbItem