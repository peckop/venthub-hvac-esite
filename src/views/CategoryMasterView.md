---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\CategoryMasterView.tsx
skeleton_hash: 2ba2756418f59327
entity_hashes:
  func:CategoryMasterView: cd0cf7095117dcee
  func:renderView: 7ee81c09fd482844
  overview: 7aa0fc84461a069a
  style_tokens: a9eeb190f981b67b
generated_at: 2026-08-25T07:29:35Z
---

## Genel Bakış

CategoryMasterView, kategori yönetimine ait ana görünümü sunan bir React bileşenidir. Bileşen, başlangıç kategorisi, aile listesi, toplam kayıt sayısı ve sayfalama bilgileri gibi özellikleri alarak kategori ana ekranını oluşturur. Görünümün oluşturulması `renderView` fonksiyonu aracılığıyla gerçekleştirilir.

## Fonksiyon Grupları

### Bileşen ve Görünüm Yönetimi
Ana bileşenin tanımlanması ve görünümün render edilmesiyle ilgilenir. `CategoryMasterView` bileşeni dışarıdan aldığı proplarla yapılandırılır; `renderView` ise bileşenin kullanıcı arayüzünü oluşturan alt fonksiyondur.
- CategoryMasterView, renderView

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `initialCategory` prop'u sağlanmazsa, bileşen undefined bir kategori değeriyle çalışır; hangi alt görünümün (`CategoryGridView`, `CategoryLandingView`, `CategorySeriesView`, `CategoryShowcaseView`, `ProductsDiscoveryView`) render edileceği belirlenemez.

[Aksiyom 2]: Eğer `families` prop'u sağlanmazsa, boş bir dizi (`[]`) ile çalışılır.

[Aksiyom 3]: Eğer `total` prop'u sağlanmazsa, `0` değeri kullanılır.

[Aksiyom 4]: Eğer `page` prop'u sağlanmazsa, `1` değeri kullanılır.

[Aksiyom 5]: `pageSize` prop'u için varsayılan değer bilinmiyor; sağlanmazsa davranışı fonksiyon gövdesine bağlıdır.

[Aksiyom 6]: `renderView()` fonksiyonu parametre almaz; hangi alt görünümün çağrılacağı karar mantığı fonksiyon gövdesinde tanımlıdır ancak gövde verilmediğinden bu karar kriterleri bilinmiyor.

---

## FONKSİYON DETAYLARI

### CategoryMasterView
**Ne yapar**: Kategori yönetim ekranını görüntüleyen bir React bileşenidir. Kategori verilerini, aile listesini, sayfalama bilgilerini ve başlangıç kategori değerini alarak ilgili arayüzü render eder.

**Nasıl yapar**: Bileşen, aldığı props değerlerini kullanarak kategori master görünümünü oluşturur. `families` parametresine varsayılan olarak boş dizi, `total` ve `page` parametrelerine sırasıyla 0 ve 1 varsayılan değerleri atanmıştır. Bileşen `React.FC<CategoryMasterViewProps>` tipinde bir fonksiyonel bileşen olarak tanımlanmıştır.

**Parametreler**:
- initialCategory: bilinmiyor — Başlangıçta görüntülenecek kategori verisi. Tip bilgisi kaynakta belirtilmemiştir.
- families: bilinmiyor (varsayılan: []) — Kategorilere ait aile listesi. Varsayılan değeri boş dizidir. Tip bilgisi kaynakta belirtilmemiştir.
- total: bilinmiyor (varsayılan: 0) — Toplam kayıt sayısı. Varsayılan değeri 0'dır. Tip bilgisi kaynakta belirtilmemiştir.
- page: bilinmiyor (varsayılan: 1) — Mevcut sayfa numarası. Varsayılan değeri 1'dir. Tip bilgisi kaynakta belirtilmemiştir.
- pageSize: bilinmiyor — Sayfa başına gösterilecek kayıt sayısı. Varsayılan değeri kaynakta kesilmiş olup bilinmemektedir. Tip bilgisi kaynakta belirtilmemiştir.

**Dönüş**: `React.FC<CategoryMasterViewProps>` — `CategoryMasterViewProps` tipinde props alan bir React fonksiyonel bileşeni döndürür.

### renderView
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../components/ui/Pagination::Pagination
- import: ../hooks/useCategoryGateway::useCategoryGateway
- import: ../hooks/useCategoryViewModel::useCategoryViewModel
- import: ../i18n/I18nProvider::useI18n
- import: ../i18n/sort::compareText
- import: ../lib/type-converters::type { DomainCategory }
- import: ../types/ui-models::type { FamilyListItem }
- import: next/dynamic::dynamic
- import: react::React
- import: react::useMemo

---

## INTERFACES

### CategoryMasterViewProps
- `initialCategory?: DomainCategory | null`
- `families?: FamilyListItem[]`
- `total?: number`
- `page?: number`
- `pageSize?: number`
- `initialSubCategories?: DomainCategory[]`

---

## SABİTLER
- **CategoryGridView** (call) — `dynamic(() => import('./category/CategoryGridView'))`
- **CategoryLandingView** (call) — `dynamic(() => import('./category/CategoryLandingView'))`
- **CategorySeriesView** (call) — `dynamic(() => import('./category/CategorySeriesView'))`
- **CategoryShowcaseView** (call) — `dynamic(() => import('./category/CategoryShowcaseView'))`
- **ProductsDiscoveryView** (call) — `dynamic(() => import('./ProductsDiscoveryView'))`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/CategoryMasterView.tsx::CategoryMasterView
- **params**: `initialCategory`, `families = []`, `total = 0`, `page = 1`, `pageSize = 24`, `initialSubCategories`
- **ic_degiskenler**:
  - `lang` — useI18n() hook'undan gelen aktif dil kodu; sıralama ve metin karşılaştırmalarında kullanılır
  - `rawCategory` — useCategoryGateway'den dönen ham kategori nesnesi; ViewModel'e sarılmadan önceki hali
  - `rawParentCategory` — useCategoryGateway'den dönen ham üst kategori nesnesi; breadcrumb ve geri navigasyon için
  - `rawSubCategories` — useCategoryGateway'den dönen ham alt kategori dizisi; Grid ve Landing görünümlerine prop olarak geçilir
  - `loading` — useCategoryGateway'den dönen yükleme durumu boolean'ı; skeleton/fallback gösterimini kontrol eder
  - `filters` — useCategoryGateway'den dönen filtre durumu nesnesi (catSearch, selectedBrands, sortBy alanlarını içerir)
  - `updateFilters` — useCategoryGateway'den dönen filtre güncelleme fonksiyonu; CategoryGridView'e onUpdateFilters prop'u olarak geçilir
  - `wrapCategory` — useCategoryViewModel'den dönen kategori sarma fonksiyonu; ham kategori nesnesini UI katmanı modeline dönüştürür
  - `category` — useMemo ile wrapCategory(rawCategory) sonucu oluşan sarılmış kategori; displayMode ve parentId gibi UI alanlarına erişim sağlar
  - `parentCategory` — useMemo ile wrapCategory(rawParentCategory) sonucu oluşan sarılmış üst kategori; Landing ve Series görünümlerine prop olarak geçilir
  - `availableBrands` — useMemo ile families dizisinden çıkarılan benzersiz marka adları Set'i (string[]); CategoryGridView'e prop olarak geçilir
  - `visibleFamilies` — useMemo ile filtrelenmiş ve sıralanmış aile listesi; tüm görünümlere families prop'u olarak geçilir
  - `pagination` — Pagination bileşeni JSX'i; page, pageSize, total prop'larıyla oluşturulur
- **Dönüş**: React.FC<CategoryMasterViewProps> — JSX elementi (div içinde renderView() ve koşullu pagination)

### [N2_NASIL] AST Pointer: src/views/CategoryMasterView.tsx::renderView
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `category` — üst scope'tan closure ile erişilen sarılmış kategori; displayMode ve parentId kontrolü yapılır
  - `rawSubCategories` — üst scope'tan closure ile erişilen ham alt kategori dizisi; CategoryShowcaseView ve CategoryGridView'e prop olarak geçilir
  - `parentCategory` — üst scope'tan closure ile erişilen sarılmış üst kategori; .raw özelliği Landing ve Series görünümlerine prop olarak geçilir
  - `visibleFamilies` — üst scope'tan closure ile erişilen filtrelenmiş aile listesi; Landing, Series ve Grid görünümlerine families prop'u olarak geçilir
  - `availableBrands` — üst scope'tan closure ile erişilen benzersiz marka listesi; sadece CategoryGridView'e prop olarak geçilir
  - `filters` — üst scope'tan closure ile erişilen filtre durumu nesnesi; sadece CategoryGridView'e prop olarak geçilir
  - `updateFilters` — üst scope'tan closure ile erişilen filtre güncelleme fonksiyonu; sadece CategoryGridView'e onUpdateFilters prop'u olarak geçilir
  - `loading` — üst scope'tan closure ile erişilen yükleme durumu; sadece CategoryGridView'e prop olarak geçilir
- **Dönüş**: JSX elementi veya null — category yoksa null döner; displayMode değerine göre CategoryShowcaseView, CategoryLandingView, CategorySeriesView veya CategoryGridView render eder

### [N3_NASIL] AST Pointer: src/views/CategoryMasterView.tsx::visibleFamilies (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `query` — filters.catSearch.trim().toLocaleLowerCase() sonucu; aile adı, marka adı ve seri kodu üzerinde arama yapmak için kullanılır
  - `list` — families dizisinin referansı; query varsa name, brand_name, series_code alanlarında filtrelenir; selectedBrands varsa brand_name üzerinde filtrelenir
  - `sorted` — list dizisinin spread ile kopyası; sortBy 'variants' ise variant_count'a göre azalan, değilse compareText ile isme göre sıralanır
- **Dönüş**: FamilyListItem[] — filtrelenmiş ve sıralanmış aile listesi

### [N4_NASIL] AST Pointer: src/views/CategoryMasterView.tsx::visibleFamilies filter callback
- **params**: `f` — FamilyListItem nesnesi
- **ic_degiskenler**:
  - `f.name` — aile adı; toLocaleLowerCase() ile küçük harfe dönüştürülüp query ile includes kontrolü yapılır
  - `f.brand_name` — marka adı (nullable); nullish coalescing ile boş string'e düşürülüp toLocaleLowerCase() ile query kontrolü yapılır
  - `f.series_code` — seri kodu (nullable); nullish coalescing ile boş string'e düşürülüp toLocaleLowerCase() ile query kontrolü yapılır
- **Dönüş**: boolean — üç alandan herhangi biri query'yi içeriyorsa true

---

## NODE ID STANDARD

  file: CategoryMasterView.tsx
  function: CategoryMasterView.tsx::CategoryMasterView
  function: CategoryMasterView.tsx::renderView

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
- **Yardımcı Sınıflar:** `animate-spin`, `py-10`, `rounded-full`