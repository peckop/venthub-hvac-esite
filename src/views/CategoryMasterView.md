---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CategoryMasterView.tsx
skeleton_hash: 7323e52f356d71e6
entity_hashes:
  func:CategoryMasterView: 8d66cf8f4164e6f6
  func:renderView: 7ee81c09fd482844
  overview: 97eb92d3808ebe2e
  style_tokens: fca21e5c46ce3029
generated_at: 2026-05-28T22:40:07Z
---

## Genel Bakış
CategoryMasterView, VentHub HVAC platformunda kategori yönetimi için kullanılan ana React bileşenidir. Ana kategori, ürün ve alt kategori verilerini dışarıdan alarak, bu verileri yöneten ve görüntüleyen bir arayüz oluşturur.

## Fonksiyon Grupları
### Bileşen giriş ve başlatma
Ana bileşenin dış ortamdan aldığı başlangıç verilerini (ana kategori, ürünler, alt kategoriler) alarak kendi içinde işleyen ve yönetme arayüzünü başlatan temel yapıyı tanımlar.
- CategoryMasterView

### Görünüm oluşturma
Ana bileşen tarafından çağrılarak, kullanıcılara sunulacak olan nihai HTML ve arayüz yapısını oluşturan yardımcı render fonksiyonunu temsil eder.
- renderView

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon imzalarından çıkarılabilecek sınırlı mimari varsayımlar mevcuttur.

---

**[Aksiyom 1 - Bağımlılık Veri Kaynağı]:** Eğer `initialCategory`, `initialProducts` veya `initialSubCategories` parametreleri çağrıuciden sağlanmazsa, ilgili bileşen başlangıç verileri `undefined` olur ve görünümün beklenen veri yapısıyla çalışması garanti edilemez.

> **Not:** Fonksiyon imzasında bu üç parametre için herhangi bir default değer tanımlanmamıştır. Dolayısıyla bunların bileşen tarafından zorunlu olarak istendiği, ancak çağrı tarafında ne tür bir değer beklendiği (null mu, boş dizi mi, nesne mi) imzadan anlaşılamamaktadır.

---

**[Aksiyom 2 - renderView Parametresiz Çalışma]:** Eğer `renderView()` fonksiyonu çağrılmadan önce bileşenin iç durumu bozulursa, fonksiyon parametresiz olduğundan düzeltme mekanizması yoktur.

> **Not:** `renderView()` herhangi bir parametre almaz; dolayısıyla dışarıdan veri veya bağlam aktarımı yapılamaz.

---

**[Uyarı – Eksik Bilgi]:** Fonksiyon gövdesine erişim olmadığından, modülün hangi veri tiplerini beklediği, hangi koşullarda hangi çıktıyı ürettiği veya hangi durumlarda hata verdiği gibi kritik mimari varsayımlar **bilinmemektedir**. Tam aksiyon üretimi için fonksiyon gövdelerine erişim gereklidir.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryMasterView.tsx::CategoryMasterView
- **params**: `{ initialCategory, initialProducts, initialSubCategories }`
- **ic_degiskenler**:
  - `rawCategory` — `useCategoryGateway` hook'undan dönen ham kategori verisi; `wrapCategory` ile sarılır
  - `rawParentCategory` — `useCategoryGateway` hook'undan dönen üst kategori ham verisi; `wrapCategory` ile sarılır
  - `rawSubCategories` — `useCategoryGateway` hook'undan dönen alt kategoriler dizisi (ham); alt view bileşenlerine prop olarak doğrudan geçirilir
  - `products` — `useCategoryGateway` hook'undan dönen ürünler dizisi; view bileşenlerine prop olarak geçirilir
  - `loading` — `useCategoryGateway` hook'undan dönen yükleme durumu boolean'ı; early return ve CategoryGridView'e prop olarak kullanılır
  - `filters` — `useCategoryGateway` hook'undan dönen aktif filtreler objesi; CategoryGridView'e prop olarak geçirilir
  - `updateFilters` — `useCategoryGateway` hook'undan dönen filtre güncelleme fonksiyonu; CategoryGridView'in `onUpdateFilters` prop'una bağlanır
  - `wrapCategory` — `useCategoryViewModel` hook'undan dönen kategori sarmalama fonksiyonu; ham veriyi sunum katmanı formatına dönüştürür
  - `category` — `useMemo` ile `wrapCategory(rawCategory)` hesaplanan sunum katmanı kategorisi; `displayMode`, `raw`, `parentId` alanlarına erişilir
  - `parentCategory` — `useMemo` ile `wrapCategory(rawParentCategory)` hesaplanan üst kategori sunum katmanı objesi; optional chaining ile `?.raw` erişimi yapılır
  - `availableBrands` — `useMemo` ile `products` dizisinden `p.brand` değerlerinin benzersiz olarak filtrelenmesiyle oluşturulan marka listesi; CategoryGridView'e prop olarak geçirilir
  - `renderView` — inner arrow function; `category.displayMode` ve fallback koşullarına göre hangi view bileşeninin render edileceğini belirler
- **Cagri Iliskileri**:
  - `useCategoryGateway(initialCategory, initialProducts, initialSubCategories)` — Gateway hook'u çağrısı, 7 değer döndürür
  - `useCategoryViewModel()` — ViewModel hook'u çağrısı, `{ wrapCategory }` döndürür
  - `useMemo(() => wrapCategory(rawCategory), [rawCategory, wrapCategory])` — category useMemo memoizasyonu
  - `useMemo(() => wrapCategory(rawParentCategory), [rawParentCategory, wrapCategory])` — parentCategory useMemo memoizasyonu
  - `useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))), [products])` — availableBrands useMemo memoizasyonu
  - `renderView()` — inner fonksiyon çağrısı, JSX döndürür
- **Kosullu Donus**: `!category && !loading` ise `<ProductsDiscoveryView products={products} isLoading={loading} />` döner
- **Donus**: JSX — `<div className="min-h-screen">{renderView()}</div>`

---

### [N2_NASIL] AST Pointer: CategoryMasterView.tsx::renderView
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `category` — closure'dan erişilen sunum katmanı kategorisi; `displayMode` alanına göre switch ile hangi view'ın render edileceği belirlenir, `parentId` alanı fallback koşulunda kontrol edilir, `raw` alanı tüm view bileşenlerine prop olarak geçirilir
  - `rawSubCategories` — closure'dan erişilen ham alt kategoriler dizisi; CategoryShowcaseView, CategoryLandingView ve CategoryGridView'e prop olarak geçirilir, `length > 0` koşulu fallback dalında kontrol edilir
  - `products` — closure'dan erişilen ürünler dizisi; CategoryLandingView, CategorySeriesView ve CategoryGridView'e prop olarak geçirilir, `as DomainProduct[]` type assertion ile cast edilir
  - `parentCategory` — closure'dan erişilen üst kategori sunum katmanı objesi; optional chaining ile `?.raw` erişilerek CategorySeriesView ve CategoryGridView'e prop olarak geçirilir
  - `availableBrands` — closure'dan erişilen benzersiz marka listesi; sadece default dalındaki CategoryGridView'e prop olarak geçirilir
  - `filters` — closure'dan erişilen aktif filtreler objesi; sadece default dalındaki CategoryGridView'e prop olarak geçirilir
  - `updateFilters` — closure'dan erişilen filtre güncelleme fonksiyonu; sadece default dalındaki CategoryGridView'in `onUpdateFilters` prop'una bağlanır
  - `loading` — closure'dan erişilen yükleme durumu boolean'ı; sadece default dalındaki CategoryGridView'e prop olarak geçirilir
- **Cagri Iliskileri**:
  - `<CategoryShowcaseView category={category.raw} subCategories={rawSubCategories} />` — showcase displayMode dalında render edilir
  - `<CategoryLandingView category={category.raw} subCategories={rawSubCategories} products={products as DomainProduct[]} />` — landing displayMode dalında ve default fallback'te alt kategoriler mevcutsa render edilir
  - `<CategorySeriesView category={category.raw} parentCategory={parentCategory?.raw} products={products as DomainProduct[]} />` — series displayMode dalında ve default fallback'te `category.parentId` varsa render edilir
  - `<CategoryGridView category={category.raw} parentCategory={parentCategory?.raw} subCategories={rawSubCategories} availableBrands={availableBrands} products={products} filters={filters} onUpdateFilters={updateFilters} loading={loading} />` — default fallback dalının en son落 dalında render edilir
- **Donus**: `category` null ise `null`, aksi halde göreli `category.displayMode` veya fallback koşullarına göre JSX (CategoryShowcaseView | CategoryLandingView | CategorySeriesView | CategoryGridView)

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
- **Renkler:** (yok)
- **Layout:** `min-h-screen`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)