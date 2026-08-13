---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CategoryMasterView.tsx
skeleton_hash: 12f7702a5e8c3d9e
entity_hashes:
  func:CategoryMasterView: cd0cf7095117dcee
  func:renderView: 7ee81c09fd482844
  overview: 7988138c42a591a9
  style_tokens: a9eeb190f981b67b
generated_at: 2026-08-13T08:56:27Z
---

## Genel Bakış
CategoryMasterView, VentHub HVAC uygulamasında ürün kategorilerinin yönetimini ve görüntülenmesini sağlayan üst düzey React bileşenidir. Başlangıç verileri (kategori bilgisi, aileler, sayfalama) alarak, mevcut duruma göre farklı alt bileşenleri (ızgara, landing, vitrin) dinamik olarak render eden ana sayfa yapısını yönetir.

## Fonksiyon Grupları
### Ana Bileşen Yapısı
Modülün temel giriş noktasını ve state yönetimini tanımlar; başlatma verilerini alır ve üst düzey bileşen işlevselliğini sağlar.
- `CategoryMasterView`

### Görünüm Render Mantığı
İç duruma veya prop değerlerine bağlı olarak hangi alt bileşenin (CategoryGridView, CategoryLandingView vb.) görüntüleneceğine karar veren koşullu render mantığını barındırır.
- `renderView`

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### CategoryMasterView

**Ne yapar**: CategoryMasterView, HVAC sistemleri için kategori yönetimi arayüzünü görüntüleyen bir React fonksiyonel bileşenidir. Kategori listeleme, sayfalama ve filtreleme gibi işlemleri kullanıcıya sunar.

**Nasıl yapar**: Bileşen, CategoryMasterViewProps arayüzünden türetilmiş props'ları kabul eder. Sayfalama mantığı için page ve size parametrelerini kullanır. Families dizisi varsayılan olarak boş dizi, total sıfır, page bir olarak başlatılır. Bileşen, React.FC<CategoryMasterViewProps> tipini döndürür.

**Parametreler**:
- `initialCategory`: any — Başlangıç kategori verisini temsil eder. Bileşen ilk yüklendiğinde görüntülenecek varsayılan kategoriyi belirtir.
- `families`: Array — Kategori ailelerinin listesini tutar. Varsayılan değer boş bir dizidir (`[]`). Bu dizi, kategorilerin hiyerarşik yapısını veya gruplamasını gösterir.
- `total`: number — Toplam kategori sayısını belirtir. Sayfalama bileşeninde toplam kayıt sayısını göstermek için kullanılır. Varsayılan değer `0`'dır.
- `page`: number — Mevcut sayfa numarasını gösterir. Sayfalama kontrollerinde aktif sayfayı belirler. Varsayılan değer `1`'dir.
- `pageSize`: number — Sayfa başına düşen kategori sayısını belirter. Sayfalama aralığını kontrol eder.

**Dönüş**: `React.FC<CategoryMasterViewProps>` — Fonksiyonel React bileşeni döndürür. CategoryMasterViewProps tipindeki tüm özellikleri kabul eden bir bileşen yapısıdır.

### renderView
**Ne yapar**: Bu fonksiyon, `CategoryMasterView` bileşeninin iç mantığını veya belirli bir durum için görünüm oluşturmayı gerçekleştiren yardımcı bir iç fonksiyondur.
**Nasıl yapar**: Fonksiyonun dönüş tipi ve detaylı iç mantığı paylaşılmamıştır. Muhtemelen, `CategoryMasterView` bileşeninin içinde调用 edilen ve JSX döndüren veya belirli bir mantıksal kararı uygulayan bir yardımcı fonksiyondur.
**Parametreler**: Fonksiyon tanımında parametre belirtilmemiştir.
**Dönüş**: Fonksiyonun dönüş tipi ve döndürdüğü değer hakkında bilgi verilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../components/ui/Pagination::Pagination
- import: ../hooks/useCategoryGateway::useCategoryGateway
- import: ../hooks/useCategoryViewModel::useCategoryViewModel
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

### [N1_NASIL] AST Pointer: CategoryMasterView.tsx::CategoryMasterView
- **params**: (`initialCategory`, `families = []`, `total = 0`, `page = 1`, `pageSize = 24`, `initialSubCategories`)
- **ic_degiskenler**:
  - `rawCategory` — `useCategoryGateway` hookundan dönen ham kategori nesnesi; `wrapCategory` ile sarılır
  - `rawParentCategory` — `useCategoryGateway` hookundan dönen üst kategori nesnesi; `wrapCategory` ile sarılır
  - `rawSubCategories` — `useCategoryGateway` hookundan dönen alt kategoriler dizisi; view bileşenlerine doğrudan aktarılır
  - `loading` — `useCategoryGateway` hookundan dönen yükleme durumu boolean'ı; `ProductsDiscoveryView` ve `CategoryGridView`'e aktarılır
  - `filters` — `useCategoryGateway` hookundan dönen filtre state nesnesi; `catSearch`, `selectedBrands`, `sortBy` alanlarını içerir
  - `updateFilters` — `useCategoryGateway` hookundan dönen filtre güncelleme callback'i; `CategoryGridView`'e `onUpdateFilters` prop'u olarak verilir
  - `wrapCategory` — `useCategoryViewModel` hookundan dönen kategori sarmalama fonksiyonu; `useMemo` içinde `rawCategory` ve `rawParentCategory`'i sarar
  - `category` — `useMemo` ile `wrapCategory(rawCategory)` sonucu; `displayMode`, `raw`, `parentId` alanlarına erişilir
  - `parentCategory` — `useMemo` ile `wrapCategory(rawParentCategory)` sonucu; optional zincirleme `parentCategory?.raw` ile erişilir
  - `availableBrands` — `useMemo` ile `families` dizisinden `brand_name` alanlarının benzersiz değerlerinden oluşan dizi; `CategoryGridView`'e aktarılır
  - `visibleFamilies` — `useMemo` callback'i tarafından filtrelenip sıralanan aile listesi; tüm görünüm bileşenlerine aktarılır
  - `pagination` — `<Pagination>` JSX elementi; `React.Suspense` ile sarılmıştır, `page`, `pageSize`, `total` prop'ları bağlanır
- **Dönüş**: JSX — `<div className="min-h-screen">` içine sarılmış `React.Suspense` ile `renderView()` ve koşullu `pagination`

---

### [N2_NASIL] AST Pointer: CategoryMasterView.tsx::visibleFamilies (useMemo callback)
- **params**: yok
- **ic_degiskenler**:
  - `query` — `filters.catSearch` değerinin `.trim().toLocaleLowerCase()` ile normalize edilmiş hali; boşluklu arama sorgusu
  - `list` — başlangıçta `families` parametresine eşitlenen, ardından sorgu ve marka filtresiyle daraltılan geçici aile listesi
  - `sorted` — `list` dizisinin shallow kopyası (`[...list]`); `filters.sortBy` değerine göre sıralanır
- **Dönüş**: `FamilyListItem[]` — filtrelenmiş ve sıralanmış aile dizisi

---

### [N3_NASIL] AST Pointer: CategoryMasterView.tsx::visibleFamilies filter callback (f =>)
- **params**: (`f: FamilyListItem`)
- **ic_degiskenler**: yok
- **Dönüş**: `boolean` — `f.name`, `f.brand_name`, `f.series_code` alanlarının `query` ile eşleşip eşleşmediği

---

### [N4_NASIL] AST Pointer: CategoryMasterView.tsx::renderView
- **params**: yok
- **ic_degiskenler**: yok (dış scope'daki `category`, `rawSubCategories`, `parentCategory`, `visibleFamilies`, `availableBrands`, `filters`, `updateFilters`, `loading` değişkenlerine closure ile erişir)
- **Dönüş**: `JSX.Element | null` — `category.displayMode` değerine göre `CategoryShowcaseView`, `CategoryLandingView`, `CategorySeriesView` veya `CategoryGridView` bileşenlerinden birini döner

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
- **Yardımcı Sınıflar:** `animate-spin`, `py-10`, `rounded-full`