---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\category\CategoryFilters.tsx
skeleton_hash: 0b55a88598103948
entity_hashes:
  func:CategoryFilters: 420d76bf670f1cf8
  func:toggleBrand: 67afbe53ea415719
  overview: b617ffd977ae6c1c
  style_tokens: 85fd3dcc5d8fb2bc
generated_at: 2026-08-27T07:03:19Z
---

## Genel Bakış
`CategoryFilters` bileşeni, bir ürün kategorisi için filtreleme arayüzünü oluşturur. Kullanıcının marka seçimi gibi etkileşimlerini yönetmek için `toggleBrand` fonksiyonunu içerir ve bu fonksiyon bileşen içinde çağrılır.

## Fonksiyon Grupları
### UI Oluşturma
Bu grup, filtre panelinin görsel yapısını oluşturur ve gerekli props'ları alarak JSX döndürmekle sorumludur.
- CategoryFilters

### Etkileşim ve Durum Yönetimi
Kullanıcı eylemlerini yakalar, ilgili filtre durumunu günceller ve arayüzün yeniden render edilmesini tetikler.
- toggleBrand

*İlişki:* `CategoryFilters` içinde, marka seçimi olayına yanıt olarak `toggleBrand` çağrılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, davranışsal aksiyom üretilememektedir.

---

## FONKSİYON DETAYLARI

### CategoryFilters
**Ne yapar**: React bileşeni olarak kategori filtreleme arayüzünü oluşturur.  
**Nasıl yapar**: Gelen props (category, parentCategory, subCategories, availableBrands, filte) üzerinden filtre seçeneklerini render eder ve kullanıcı etkileşimlerini yönetir.  
**Parametreler**:
- category: unknown — seçili ana kategori
- parentCategory: unknown — üst kategori bilgisi
- subCategories: unknown — alt kategori listesi
- availableBrands: unknown — kullanılabilir marka listesi
- filte: unknown — filtreleme ile ilgili ek veri (isim hatalı olabilir)  
**Dönüş**: React.FC&lt;CategoryFiltersProps&gt; — bir fonksiyonel React bileşeni

### toggleBrand
**Ne yapar**: Belirtilen markayı filtreleme durumuna ekler veya kaldırır.  
**Nasıl yapar**: Çağrıldığı anda `brand` parametresiyle birlikte bir kapanış (closure) içinde `toggleBrand` fonksiyonunu çalıştırır.  
**Parametreler**:
- brand: string — filtreleme işlemi yapılacak marka adı  
**Dönüş**: Bilinmiyor — fonksiyonun dönüş tipi belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useCategoryGateway::type { CategoryFilters
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/type-converters::type { DomainCategory }
- import: ../../utils/categoryHelpers::getCategoryDisplayName
- import: ../../utils/categoryHelpers::getLocalizedCategorySlug
- import: lucide-react::Filter
- import: next/link::Link
- import: react::React

---

## INTERFACES

### CategoryFiltersProps
- `category: DomainCategory`
- `parentCategory?: DomainCategory | null`
- `subCategories: DomainCategory[]`
- `availableBrands: string[]`
- `filters: FilterState`
- `onUpdateFilters: (updates: Partial<FilterState>) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/CategoryFilters.tsx::CategoryFilters
- **params**: `category`, `parentCategory`, `subCategories`, `availableBrands`, `filters`, `onUpdateFilters`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `'category.filters'`, `'category.localSearchPlaceholder'`, `'category.subcategories'`, `'category.brands'` anahtarlarıyla metinleri yerelleştirir
  - `lang` — `useI18n()` hook'undan dönen dil kodu; `getLocalizedCategorySlug()` çağrılarında ikinci argüman olarak kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rotalar nesnesi; `Routes.category()` ile alt kategori bağlantılarının URL'lerini oluşturur
  - `toggleBrand` — içinde tanımlanan yardımcı fonksiyon; bir markanın `filters.selectedBrands` dizisindeki seçim durumunu tersine çevirir
- **Dönüş**: JSX (React element) — kategori filtre paneli arayüzü

### [N2_NASIL] AST Pointer: src/components/category/CategoryFilters.tsx::toggleBrand
- **params**: `brand` (string)
- **ic_degiskenler**:
  - `filters.selectedBrands` — dış kapsamdan erişilen seçili markalar dizisi; `brand` parametresinin dizide bulunup bulunmadığını kontrol eder
  - `onUpdateFilters` — dış kapsamdan erişilen filtre güncelleme fonksiyonu; güncellenmiş `selectedBrands` dizisi ile çağrılır
- **Dönüş**: yok (void)

---

## NODE ID STANDARD

  file: src\components\category\CategoryFilters.tsx
  function: src\components\category\CategoryFilters.tsx::CategoryFilters
  function: src\components\category\CategoryFilters.tsx::toggleBrand

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryFilters

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-slate-50`, `bg-white`, `border-b`, `border-slate-100`, `border-slate-200`, `border-slate-300`, `checked:bg-primary-ocean`, `checked:border-primary-ocean`, `focus-visible:border-primary-ocean`, `group-hover:text-slate-900`, `hover:bg-slate-50`, `hover:text-primary-navy`, `placeholder:text-slate-400`, `text-primary-ocean`, `text-slate-500`
- **Layout:** `absolute`, `block`, `custom-scrollbar`, `flex`, `gap-3`, `h-3`, `h-5`, `items-center`, `justify-center`, `max-h-48`, `overflow-y-auto`, `p-6`, `relative`, `shadow-sm`, `w-3`
- **Varyant/Responsive:** `checked:`, `focus-visible:`, `group-hover:`, `hover:`, `peer-checked:`, `placeholder:` önekleri
- **Yardımcı Sınıflar:** `appearance-none`, `border`, `cursor-pointer`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-ocean/20`, `font-black`, `font-bold`, `font-medium`, `group`, `mb-3`, `mb-6`, `mb-8`, `opacity-0`, `pb-4`