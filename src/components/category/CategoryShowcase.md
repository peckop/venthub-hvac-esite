---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\CategoryShowcase.tsx
skeleton_hash: bba0312a82b87d24
generated_at: 2026-05-23T21:58:31Z
---

## Genel Bakış
Bu modül, bir kategori ve onun alt kategorilerini görsel olarak sergilemek için kullanılan bir React bileşenidir. `CategoryShowcase` fonksiyonu, verilen kategori bilgilerini alarak kullanıcı arayüzünde kategori kartı ve alt kategori listesi gibi öğeleri renderlar.

## Fonksiyon Grupları
### Ana Bileşen
Kategori gösterimini oluşturan ve dışarıdan gelen verileri UI elemanlarına dönüştüren temel işlevi yerine getirir.
- CategoryShowcase

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için gerekli props sağlanmalıdır.

[Aksiyom 1]: Eğer `category` prop'u sağlanmazsa, bileşen kategori bilgilerini render edemez ve hata veya boş görüntü oluşabilir.  
[Aksiyom 2]: Eğer `subCategories` prop'u sağlanmazsa, alt kategori listesi gösterilemez veya boş liste gibi davranabilir.  
[Aksiyom 3]: Eğer `parentCategory` prop'u sağlanmazsa, üst kategori navigasyonu veya breadcrumb gösterilemez.

---

## FONKSIYON DETAYLARI

### CategoryShowcase
**Ne yapar**: Verilen kategori, onun alt kategorileri ve üst kategori bilgilerini alarak bu verileri kullanıcı arayüzünde görsel bir vitrin olarak render eder.  
**Nasıl yapar**: Props olarak gelen `category`, `subCategories` ve `parentCategory` nesnelerini destructure eder; ardından kategori başlığını, görselini ve açıklamasını gösterir, `subCategories` listesini harita ederek her bir alt kategori için bir kart veya bağlantı oluşturur ve eğer `parentCategory` mevcutsa ona yönlendiren bir geri bağlantı ekler. Sonuç olarak JSX döndürerek React bileşeni olarak işlev görür.  
**Parametreler**:
- category: object — Gösterilecek ana kategorinin verilerini içerir (id, ad, görsel, açıklama gibi alanlar).
- subCategories: array — Ana kategoriye ait alt kategorilerin listesi; her eleman genellikle bir kategori nesnesidir ve UI içinde kart veya bağlantı olarak render edilir.
- parentCategory: object | null — Eğer kategori bir hiyerarşinin parçasıysa üst kategori bilgilerini taşır; null değeri üst kategori yoktur anlamına gelir ve bu durumda geri bağlantı gösterilmez.
**Dönüş**: React.FC — JSX elementi döndüren bir fonksiyonel React bileşeni; render çıktısı kategori vitrini olarak ekrana basılır.

---

## INTERFACES

### CategoryShowcaseProps
- `category: DomainCategory`
- `subCategories: DomainCategory[]`
- `parentCategory?: DomainCategory | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/CategoryShowcase.tsx::RenderSubCategoryLink
- **params**: (sub)
- **ic_degiskenler**:
  - `sub` — subCategory object containing `id`, `slug`, `image_url`, and `description` used to build the link URL, image source, alt text, heading, and description.
  - `category` — parent category object from component props; its `slug` is combined with `sub.slug` to generate the route via `Routes.category`.
  - `t` — translation function (e.g., from `useTranslation`) used to retrieve the localized label for the inspect series call‑to‑action.
  - `process` — global Node.js `process` object; accesses `process.env.NEXT_PUBLIC_SUPABASE_URL` to construct the base URL for Supabase storage image paths.
  - `Routes` — utility module providing the `category(slug, subSlug)` function that returns the correct Next.js route path.
  - `getCategoryDisplayName` — helper that returns a human‑readable display name for a category/subcategory; used for the image `alt` attribute and the heading `<h3>`.
  - `getCategoryIcon` — helper that returns an icon component when a subcategory lacks an image; receives the subcategory `slug` and size/className props.
  - `VentImage` — custom image component that renders the product image with proper styling and hover effects.
  - `ArrowRight` — icon component indicating navigation, animated on hover.
- **Dönüş**: JSX.Element (a `<Link>` wrapping a card that displays the subcategory image, title, description, and a navigation arrow)

### [N2_NASIL] AST Pointer: src/components/category/CategoryShowcase.tsx::RenderFeatureItem
- **params**: (feature, i)
- **ic_degiskenler**:
  - `feature` — object with `title` and `desc` strings describing a feature; used to render the heading `<h3>` and paragraph `<p>`.
  - `i` — numeric index of the feature in the list; used as the React `key` prop for the outer `<div>`.
  - `CheckCircle2` — icon component (from `lucide-react`) displayed inside a colored circle to visually indicate a checked/validated feature.
- **Dönüş**: JSX.Element (a `<div>` card showing an icon, feature title, and description)

---

## NODE ID STANDARD

  file: src\components\category\CategoryShowcase.tsx
  function: src\components\category\CategoryShowcase.tsx::CategoryShowcase

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryShowcase