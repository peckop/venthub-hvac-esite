---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CategoryMasterView.tsx
skeleton_hash: 675d5fb17f81b1ea
entity_hashes:
  func:CategoryMasterView: 8d66cf8f4164e6f6
  func:renderView: 7ee81c09fd482844
  overview: 9cd4c9c276b969d6
  style_tokens: 196a053d563de9bf
generated_at: 2026-06-11T16:17:49Z
---

## Genel Bakış
CategoryMasterView, VentHub HVAC uygul

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayım, dış kaynaklardan gelen başlangıç verilerinin varlığı ve iç bileşenlerin doğru veri yapısıyla çağrılmasıdır.

[Aksiyom 1]: Eğer `initialCategory` parametresi (`{name: string, id: string}` yapısında bir nesne) sağlanmazsa, `CategoryMasterView` bileşeni ana kategori verisi olmadan başlatılır ve `renderView()` içindeki ilgili alt bileşenlere (`CategoryGridView`, `CategoryLandingView`) geçersiz veya eksik veri aktarımı riski oluşur.
[Aksiyom 2]: Eğer `initialProducts` parametresi (bir ürün nesneleri dizisi, `[{id: string, ...}, ...]` yapısında) sağlanmazsa, `CategorySeriesView` ve `CategoryShowcaseView` bileşenlerine gösterilecek ürün listesi传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递传递

---

## FONKSİYON DETAYLARI

### CategoryMasterView
**Ne yapar**: Bu fonksiyon, bir React bileşenidir ve bir kategori yönetimi arayüzünü (örneğin, bir kategorinin adını, alt kategorilerini ve ürünlerini düzenleyen bir sayfayı) oluşturur.
**Nasıl yapar**: Fonksiyon, bir React bileşeni (`React.FC`) döndürür. Bileşenin iç mantığı, dışarıdan gelen başlangıç verilerine (`initialCategory`, `initialProducts`, `initialSubCategories`) dayanarak ilgili kategori master sayfasının görünümünü ve işlevselliğini oluşturur.
**Parametreler**:
- `initialCategory`: `Category` (veya benzeri bir tip) — Bileşenin başlangıçta göstermesi ve düzenlemesi gereken kategori verisi.
- `initialProducts`: `Product[]` (veya benzeri bir dizi tipi) — Bu kategoriye ait başlangıç ürünleri listesi.
- `initialSubCategories`: `SubCategory[]` (veya benzeri bir dizi tipi) — Bu kategorinin alt kategorilerinin başlangıç listesi.
**Dönüş**: `React.FC<CategoryMasterViewProps>` tipinde bir React bileşeni. Bileşen, verilen props'lara göre render edilen bir JSX yapısı döndürür.

### renderView
**Ne yapar**: Bu fonksiyon, `CategoryMasterView` bileşeninin iç mantığını veya belirli bir durum için görünüm oluşturmayı gerçekleştiren yardımcı bir iç fonksiyondur.
**Nasıl yapar**: Fonksiyonun dönüş tipi ve detaylı iç mantığı paylaşılmamıştır. Muhtemelen, `CategoryMasterView` bileşeninin içinde调用 edilen ve JSX döndüren veya belirli bir mantıksal kararı uygulayan bir yardımcı fonksiyondur.
**Parametreler**: Fonksiyon tanımında parametre belirtilmemiştir.
**Dönüş**: Fonksiyonun dönüş tipi ve döndürdüğü değer hakkında bilgi verilmemiştir.

---

## INTERFACES

### CategoryMasterViewProps
- `initialCategory?: DomainCategory | null`
- `initialProducts?: DomainProduct[]`
- `initialSubCategories?: DomainCategory[]`

---

## SABİTLER
- **CategoryGridView** (call) — `dynamic(() => import('./category/CategoryGridView'), { ssr: false })`
- **CategoryLandingView** (call) — `dynamic(() => import('./category/CategoryLandingView'), { ssr: false })`
- **CategorySeriesView** (call) — `dynamic(() => import('./category/CategorySeriesView'), { ssr: false })`
- **CategoryShowcaseView** (call) — `dynamic(() => import('./category/CategoryShowcaseView'), { ssr: false })`
- **ProductsDiscoveryView** (call) — `dynamic(() => import('./ProductsDiscoveryView'), { ssr: false })`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryMasterView.tsx::CategoryMasterView
- **params**: `initialCategory, initialProducts, initialSubCategories`
- **ic_degiskenler**:
  - `rawCategory` — useCategoryGateway'den dönen ham kategori verisi, wrapCategory ile sarmalanmadan önce kullanılır
  - `rawParentCategory` — useCategoryGateway'den dönen ham üst kategori verisi, wrapCategory ile sarmalanmadan önce kullanılır
  - `rawSubCategories` — useCategoryGateway'den dönen ham alt kategoriler dizisi, view bileşenlerine doğrudan aktarılır
  - `products` — useCategoryGateway'den dönen ürün listesi, view bileşenlerine ve marka çıkarımına kullanılır
  - `loading` — useCategoryGateway'den dönen boolean yükleme durumu, ProductsDiscoveryView ve CategoryGridView'e aktarılır
  - `filters` — useCategoryGateway'den dönen filtre durum nesnesi, CategoryGridView'e aktarılır
  - `updateFilters` — useCategoryGateway'den dönen filtre güncelleme fonksiyonu, CategoryGridView'e onUpdateFilters olarak aktarılır
  - `wrapCategory` — useCategoryViewModel'den gelen fonksiyon, ham kategori verisini ViewModel formatına sarmalar
  - `category` — useMemo ile wrapCategory(rawCategory) sonucu, kategorinin ViewModel sarmalı; displayMode ve parentId erişimi ile hangi view'ın render edileceğini belirler
  - `parentCategory` — useMemo ile wrapCategory(rawParentCategory) sonucu, üst kategorinin ViewModel sarmalı; raw özelliği CategorySeriesView ve CategoryGridView'e aktarılır
  - `availableBrands` — useMemo ile products dizisinden p.brand değerlerinin benzersiz kümesi; CategoryGridView'e aktarılır
- **Dönüş**: JSX element (React.FC) — category yüklenmemişse ProductsDiscoveryView, aksi halde renderView() sonucunu Suspense ile saran div

### [N2_NASIL] AST Pointer: CategoryMasterView.tsx::renderView
- **params**: yok
- **ic_degiskenler**:
  - `category` — closure'dan erişilen ViewModel sarmalı; null ise null döner, displayMode alanına göre switch ile hangi view bileşeninin render edileceğini belirler, parentId alanı ile alt/ana kategori ayrımı yapar
  - `rawSubCategories` — closure'dan erişilen ham alt kategoriler dizisi; CategoryShowcaseView, CategoryLandingView ve CategoryGridView bileşenlerine subCategories prop'u olarak aktarılır
  - `parentCategory` — closure'dan erişilen üst kategori ViewModel sarmalı; optional zincirle ?.raw erişimi ile CategorySeriesView ve CategoryGridView'e parentCategory prop'u olarak aktarılır
  - `products` — closure'dan erişilen ürün listesi; CategoryLandingView, CategorySeriesView ve CategoryGridView'e products prop'u olarak aktarılır
  - `availableBrands` — closure'dan erişilen benzersiz marka listesi; CategoryGridView'e availableBrands prop'u olarak aktarılır
  - `filters` — closure'dan erişilen filtre durum nesnesi; CategoryGridView'e filters prop'u olarak aktarılır
  - `updateFilters` — closure'dan erişilen filtre güncelleme fonksiyonu; CategoryGridView'e onUpdateFilters prop'u olarak aktarılır
  - `loading` — closure'dan erişilen boolean yükleme durumu; CategoryGridView'e loading prop'u olarak aktarılır
- **Dönüş**: JSX element | null — category.displayMode değerine göre CategoryShowcaseView, CategoryLandingView, CategorySeriesView veya CategoryGridView bileşeninden birini döner; category null ise null döner

---

## NODE ID STANDARD

  file: src\views\CategoryMasterView.tsx
  function: src\views\CategoryMasterView.tsx::CategoryMasterView
  function: src\views\CategoryMasterView.tsx::renderView

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryMasterView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `border-b-2`, `border-primary-navy`
- **Layout:** `flex`, `h-8`, `items-center`, `justify-center`, `min-h-screen`, `w-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-spin`, `rounded-full`