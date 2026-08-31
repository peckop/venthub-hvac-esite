---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-rec89\src\views\category\CategoryGridView.tsx
skeleton_hash: 779bc62c6812e5b9
entity_hashes:
  func:CategoryGridView: 18fcb701e0fde17c
  overview: e762b27fc914865e
  style_tokens: 7655619e3195e611
generated_at: 2026-08-30T19:07:13Z
---

## Genel Bakış
Bu modül, bir kategori sayfasının ana ızgara görünümünü oluşturan tek bir React fonksiyonel bileşenidir. Bileşen, dışarıdan aldığı kategori, üst kategori, alt kategoriler ve mevcut marka bilgilerini kullanarak sayfanın temel yapısını ve içeriğini render eder.

## Fonksiyon Grupları
### Ana Bileşen
Sayfanın tüm ızgara düzenini ve temel yapısını oluşturan merkezi bileşendir. Kullanıcıya kategori bilgilerini, alt kategorileri ve mevcut markaları görsel olarak sunar.
- CategoryGridView

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca fonksiyon imzasından aksiyom üretilememektedir. İmzada yer alan `category`, `parentCategory`, `subCategories`, `availableBrands` ve kesilmiş görünen `famil` prop'larının bileşen içinde nasıl kullanıldığı, hangi koşulların kritik olduğu veya hangi hata durumlarının oluşabileceği fonksiyon gövdesi olmadan belirlenemez.

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### CategoryGridView
**Ne yapar**: Kategori verilerini görsel bir ızgara (grid) yapısında görüntülemek için kullanılan bir React fonksiyonel bileşenidir. Üst kategori, alt kategoriler ve mevcut markalar gibi kategoriyle ilişkili verileri alarak bir görünüm sunar.

**Nasıl yapar**: Bileşen, aldığı props parametreleri aracılığıyla kategori hiyerarşisi ve ilişkili marka bilgilerini alır. Fonksiyonel bileşen yapısında tanımlanmış olup `CategoryGridViewProps` tipindeki props nesnesini destructure ederek kullanır. Bileşenin iç render mantığı verilen kaynak kodda belirtilmemiştir.

**Parametreler**:
- category: `CategoryGridViewProps["category"]` — Görüntülenecek ana kategori bilgisi. Kaynak kodda tip tanımı verilmemiştir.
- parentCategory: `CategoryGridViewProps["parentCategory"]` — Ana kategorinin üst (parent) kategori bilgisi. Kaynak kodda tip tanımı verilmemiştir.
- subCategories: `CategoryGridViewProps["subCategories"]` — Ana kategorinin alt kategorilerini içeren koleksiyon. Kaynak kodda tip tanımı verilmemiştir.
- availableBrands: `CategoryGridViewProps["availableBrands"]` — Kategoriyle ilişkili mevcut markaların listesi. Kaynak kodda tip tanımı verilmemiştir.
- famil: `CategoryGridViewProps["famil"]` — Kaynak kodda bu parametrenin tam adı kesilmiş görünmektedir; aile (family) ile ilişkili bir veri olması beklenir ancak kesin işlevi kaynak kodda belirtilmemiştir. Tip tanımı verilmemiştir.

**Dönüş**: `React.FC<CategoryGridViewProps>` — `CategoryGridViewProps` tipinde props alan bir React fonksiyonel bileşeni döndürür. Bu tip, bileşenin kabul ettiği tüm propların tip tanımlarını içerir ancak kaynak kodda `CategoryGridViewProps` tipinin kendisi tanımlanmamıştır.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/category/CategoryFilters::CategoryFiltersComponent
- import: ../../components/layout/PageShell::PageShell
- import: ../../components/products/FamilyCard::FamilyCard
- import: ../../hooks/useCategoryGateway::type { CategoryFilters }
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/type-converters::type { DomainCategory }
- import: @/types/ui-models::type { FamilyListItem }
- import: lucide-react::Grid
- import: lucide-react::List
- import: react::React

---

## INTERFACES

### CategoryGridViewProps
- `category: DomainCategory`
- `parentCategory?: DomainCategory | null`
- `subCategories: DomainCategory[]`
- `availableBrands: string[]`
- `families: FamilyListItem[]`
- `filters: CategoryFilters`
- `onUpdateFilters: (updates: Partial<CategoryFilters>) => void`
- `loading?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/category/CategoryGridView.tsx::CategoryGridView
- **params**:
  - `category` — DomainCategory türünde, mevcut kategori bilgisi; CategoryFiltersComponent'e prop olarak geçilir
  - `parentCategory` — üst kategori bilgisi; CategoryFiltersComponent'e prop olarak geçilir
  - `subCategories` — alt kategori listesi; CategoryFiltersComponent'e prop olarak geçilir
  - `availableBrands` — mevcut marka listesi; CategoryFiltersComponent'e prop olarak geçilir
  - `families` — FamilyListItem dizisi; FamilyCard bileşenlerini oluşturmak için `map` ile döngüye alınır, uzunluğu `t('category.family.count')` çeviri çağrısında `count` olarak kullanılır, boşsa "ürün bulunamadı" mesajı gösterilir
  - `filters` — CategoryFilters türünde, mevcut filre durumu; `filters.viewMode` görünüm modunu ('grid'/'list') belirler, `filters.sortBy` sıralama kriterini tutar, buton ve select bileşenlerinde aktif durumu kontrol etmek için okunur
  - `onUpdateFilters` — filtre güncelleme fonksiyonu; görünüm modu butonlarına tıklandığında `{ viewMode: 'grid' }` veya `{ viewMode: 'list' }` objesiyle, sıralama select'i değiştiğinde `{ sortBy: e.target.value }` objesiyle çağrılır
  - `loading` — yükleme durumu boolean'ı; `families.length === 0 && !loading` koşulunda "ürün bulunamadı" mesajının gösterilip gösterilmeyeceğini kontrol eder
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; aile sayısı metni (`category.family.count`), görünüm buton başlıkları (`category.view.grid`, `category.view.list`), sıralama etiketi (`category.sort.title`), sıralama seçenekleri (`category.sort.name`, `category.sort.variantCount`) ve boş durum mesajı (`category.noProductsFound`) için kullanılır
  - `family` — `families.map` döngüsünde her bir FamilyListItem öğesi; `family.id` FamilyCard'a `key` prop'u olarak, `family` kendisi `family` prop'u olarak geçilir
  - `e` — select onChange olayındaki event nesnesi; `e.target.value` ile seçilen sıralama değeri okunur ve `onUpdateFilters({ sortBy: e.target.value })` çağrısında kullanılır
- **Dönüş**: JSX elementi — PageShell ile sarılmış, sol tarafta CategoryFiltersComponent içeren aside, sağ tarafta toolbar (aile sayısı, görünüm modu butonları, sıralama select'i) ve FamilyCard grid/listesi içeren main bölümünden oluşan React bileşeni

---

## NODE ID STANDARD

  file: src\views\category\CategoryGridView.tsx
  function: src\views\category\CategoryGridView.tsx::CategoryGridView

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryGridView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-white`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `hover:text-slate-600`, `text-center`, `text-slate-400`, `text-slate-500`, `text-slate-700`, `text-sm`, `text-white`
- **Layout:** `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `gap-12`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `items-center`, `items-start`, `justify-between`, `lg:flex-row`, `lg:w-80`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `lg:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `${filters.viewMode`, `:`, `===`, `border`, `focus-visible:ring-primary-ocean/20`, `font-bold`, `font-medium`, `list`, `mb-10`, `pb-6`, `pl-4`, `pr-10`, `py-2.5`, `py-32`, `rounded-lg`