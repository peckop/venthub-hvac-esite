---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\vh-categories\src\views\admin\CategoriesTableBody.tsx
skeleton_hash: 57eb02aeb43bb975
entity_hashes:
  func:CategoriesTableBody: d50fe77bdbd7da87
  func:categoriesFetcher: c2a94f9401915640
  overview: 22cea1905ba0d279
  style_tokens: fc380c343feea254
generated_at: 2026-06-17T19:22:14Z
---

## Genel Bakış
Bu modül, admin panelindeki kategoriler tablosunun gövde bölümünü oluşturan bir React bileşeni ve bu bileşenin ihtiyaç duyduğu verileri Supabase veritabanından asenkron olarak çeken bir veri getirici fonksiyonunu içerir. Modül, veri erişimi ve sunum mantığını tek bir dosyada birleştirerek kategori yönetim arayüzünün temel parçasını oluşturur.

## Fonksiyon Grupları
### Veri Erişimi
Bu grup, Supabase veritabanından kategoriler tablosuna ait kayıtları filtreleme ve sayfalama parametrelerine göre çeken asenkron mantığı kapsar.
- categoriesFetcher

### Görsel Bileşen
Bu grup, çekilen kategori verilerini bir tablo gövdesi içinde satır satır düzenleyerek kullanıcıya sunan React fonksiyonel bileşenini içerir.
- CategoriesTableBody

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### categoriesFetcher

**Ne yapar**: Supabase veritabanındaki `categories` tablosundan tüm kategorileri çeker ve sıralı olarak döndürür. Fonksiyon, veritabanından kategori listesini almak için kullanılır ve sonuçları `sort_order` ve `name` alanlarına göre artan sırayla düzenler.

**Nasıl yapar**: Fonksiyon önce `ensureSessionFresh()` çağrısıyla kullanıcının oturumunun taze olup olmadığını kontrol eder ve gerekirse yeniler. Ardından `supabase.from('categories')` ile `categories` tablosuna bağlanır, `CATEGORY_SELECT` sabitinin tanımladığı alanları seçer, sonuçları önce `sort_order` sonra `name` alanına göre artan sırada sıralar. Sorgu sonucunda bir hata oluşursa bu hatayı fırlatır (throw). Başarılı olursa veriyi `DbCategory[]` tipine dönüştürür veya boş dizi kullanarak `{ rows, totalMatched }` formatında sonuç nesnesini döndürür. Bu fonksiyon genellikle React Query veya benzeri veri çekme kütüphaneleri ile birlikte `useFetch` gibi bir wrapper içinde kullanılır.

**Parametreler**:
- supabase: `SupabaseClient<Database>` — Tip güvenli Supabase istemcisi. `Database` generic parametresi, veritabanı şemasının tüm tabloları ve tipleri hakkında TypeScript'e bilgi vererek güvenli sorgular yazılmasını sağlar.
- _params: `FetchParams` — Sayfalama, filtreleme veya sıralama parametrelerini içeren nesne. Parametre adındaki `_` ön ek, bu fonksiyonun içinde bu parametreyi kullanmadığını belirtir; yani tüm kategoriler tek seferde çekilmektedir.

**Dönüş**: `Promise<FetchResult<DbCategory>>` — Asenkron olarak çözülen bir nesne döndürür. `FetchResult<DbCategory>` yapısı iki alan içerir: `rows` (çekilen kategori satırlarının `DbCategory` dizisi) ve `totalMatched` (toplam eşleşen kayıt sayısı, burada rows.length değerine eşittir).

### CategoriesTableBody
**Ne yapar**: React uygulamasında bir kategori tablosunun gövdesini (satırlarını) oluşturan ve verileri asenkron olarak işleyen bir fonksiyonel bileşendir.
**Nasıl yapar**: Bileşen, `categoriesFetcher` fonksiyonunu bir veri çekme mekanizmasıyla (muhtemelen bir `useSWR` veya benzeri kütüphane) bağlayarak kategori listesini alır. Gelen `DbCategory[]` dizisi üzerinde bir haritalama (mapping) işlemi uygular ve her bir kategori için tablo satırı (`<tr>`) bileşenlerini oluşturarak JSX olarak render eder.
**Parametreler**: Bu fonksiyon bir React FC (Functional Component) olduğu için dışarıdan parametre almaz.
**Dönüş**: `React.FC` — Kategori verisini satırlar olarak gösteren bir `JSX.Element` (tablo gövdesi `<tbody>` veya satırlar dizisi).

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/BulkActionToolbar::BulkActionToolbar
- import: ../../components/admin/EditableCell::EditableCell
- import: ../../components/admin/ExportMenu::ExportMenu
- import: ../../components/admin/categories/CategoryFormModal::CategoryFormModal
- import: ../../components/admin/data-table/DataTableKit::DataTableKit
- import: ../../components/admin/data-table/types::type { AdminColumn }
- import: ../../hooks/useAdminTable::type FetchParams
- import: ../../hooks/useAdminTable::type FetchResult
- import: ../../hooks/useAdminTable::useAdminTable
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/ensureSessionFresh::ensureSessionFresh
- import: ../../types/database.types::type { Database }
- import: ../../types/db-rows::type { DbCategory }
- import: @/components/ui/VentImage::VentImage
- import: @/lib/admin/mutateWithAudit::AdminPermissionError
- import: @/lib/admin/mutateWithAudit::mutateWithAudit
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @supabase/supabase-js::type { SupabaseClient }
- import: lucide-react::Layout
- import: lucide-react::Plus
- import: lucide-react::SearchX
- import: lucide-react::Tags
- import: next/navigation::useRouter
- import: react::React
- import: react::useCallback
- import: react::useMemo
- import: react::useState
- import: sonner::toast

---

## SABİTLER
- **CATEGORY_SELECT** (str) — `'id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_titl...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoriesTableBody.tsx::categoriesFetcher
- **params**: (supabase: SupabaseClient<Database>, _params: FetchParams)
- **ic_degiskenler**:
  - `data` — Supabase'den dönen kategori verisi
  - `error` — Supabase sorgusu sırasında oluşabilecek hata
  - `rows` — Ham veriden dönüştürülmüş DbCategory dizisi
- **Dönüş**: Promise<FetchResult<DbCategory>> (satırlar ve toplam eşleşme sayısı)

### [N2_NASIL] AST Pointer: CategoriesTableBody.tsx::onNew
- **params**: ()
- **ic_degiskenler**:
  - `setEditingId` — Düzenleme modunda olan kategorinin ID'sini null'a ayarlar
  - `setIsModalOpen` — Modal penceresini açmak için state setter
- **Dönüş**: yok (yan etki: modal açar)

### [N3_NASIL] AST Pointer: CategoriesTableBody.tsx::openEdit
- **params**: (r: DbCategory)
- **ic_degiskenler**:
  - `setEditingId` — Düzenleme modunda olan kategorinin ID'sini r.id'ye ayarlar
  - `setIsModalOpen` — Modal penceresini açmak için state setter
- **Dönüş**: yok (yan etki: modal açar)

### [N4_NASIL] AST Pointer: CategoriesTableBody.tsx::saveName
- **params**: (r: DbCategory, raw: string | number)
- **ic_degiskenler**:
  - `val` — Düzeltilmiş ve kırpılmış isim değeri
  - `supabaseBrowserClient` — Supabase istemcisi (outer scope'tan)
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `table` — Tablo instance'ı (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
- **Dönüş**: Promise<void> (yan etki: veritabanını günceller, toast gösterir)

### [N5_NASIL] AST Pointer: CategoriesTableBody.tsx::saveName.fn
- **params**: ()
- **ic_degiskenler**:
  - `error` — Supabase güncelleme hatası
- **Dönüş**: Promise<void> (yan etki: kategori ismini günceller)

### [N6_NASIL] AST Pointer: CategoriesTableBody.tsx::saveSortOrder
- **params**: (r: DbCategory, raw: string | number)
- **ic_degiskenler**:
  - `num` — String'den parse edilmiş sıralama numarası
  - `supabaseBrowserClient` — Supabase istemcisi (outer scope'tan)
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `table` — Tablo instance'ı (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
- **Dönüş**: Promise<void> (yan etki: veritabanını günceller, toast gösterir)

### [N7_NASIL] AST Pointer: CategoriesTableBody.tsx::saveSortOrder.fn
- **params**: ()
- **ic_degiskenler**:
  - `error` — Supabase güncelleme hatası
- **Dönüş**: Promise<void> (yan etki: sıralama numarasını günceller)

### [N8_NASIL] AST Pointer: CategoriesTableBody.tsx::removeCategory
- **params**: (r: DbCategory)
- **ic_degiskenler**:
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `supabaseBrowserClient` — Supabase istemcisi (outer scope'tan)
  - `table` — Tablo instance'ı (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
- **Dönüş**: Promise<void> (yan etki: kategoriyi siler, toast gösterir)

### [N9_NASIL] AST Pointer: CategoriesTableBody.tsx::removeCategory.fn
- **params**: ()
- **ic_degiskenler**:
  - `error` — Supabase silme hatası
- **Dönüş**: Promise<void> (yan etki: kategoriyi siler)

### [N10_NASIL] AST Pointer: CategoriesTableBody.tsx::handleExport
- **params**: ()
- **ic_degiskenler**:
  - `rows` — Dışa aktarılacak tüm satırlar
  - `cols` — CSV sütun başlıkları dizisi
  - `header` — Virgülle ayrılmış başlık satırı
  - `lines` — Her satırı CSV formatına dönüştürülmüş dizi
  - `csv` — Tam CSV içeriği (BOM karakterli)
  - `blob` — CSV içeriğinden oluşturulan Blob nesnesi
  - `url` — Blob için oluşturulan geçici URL
  - `a` — Dosya indirmek için oluşturulan geçici <a> elementi
- **Dönüş**: Promise<void> (yan etki: CSV dosyası indirir)

### [N11_NASIL] AST Pointer: CategoriesTableBody.tsx::formatRowForCsv
- **params**: (r: DbCategory)
- **ic_degiskenler**: yok
- **Dönüş**: string (virgülle ayrılmış CSV satırı)

### [N12_NASIL] AST Pointer: CategoriesTableBody.tsx::bulkUpdateStatus
- **params**: (status: string)
- **ic_degiskenler**:
  - `ids` — Seçili satırların ID'leri
  - `isActive` — Durum değerini boolean'a dönüştürür
  - `supabaseBrowserClient` — Supabase istemcisi (outer scope'tan)
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `table` — Tablo instance'ı (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
- **Dönüş**: Promise<void> (yan etki: toplu durum günceller)

### [N13_NASIL] AST Pointer: CategoriesTableBody.tsx::bulkUpdateStatus.fn
- **params**: ()
- **ic_degiskenler**:
  - `error` — Supabase güncelleme hatası
- **Dönüş**: Promise<void> (yan etki: toplu durum günceller)

### [N14_NASIL] AST Pointer: CategoriesTableBody.tsx::bulkUpdateFeatured
- **params**: (featured: boolean)
- **ic_degiskenler**:
  - `ids` — Seçili satırların ID'leri
  - `supabaseBrowserClient` — Supabase istemcisi (outer scope'tan)
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `table` — Tablo instance'ı (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
- **Dönüş**: Promise<void> (yan etki: toplu öne çıkan günceller)

### [N15_NASIL] AST Pointer: CategoriesTableBody.tsx::bulkUpdateFeatured.fn
- **params**: ()
- **ic_degiskenler**:
  - `error` — Supabase güncelleme hatası
- **Dönüş**: Promise<void> (yan etki: toplu öne çıkan günceller)

### [N16_NASIL] AST Pointer: CategoriesTableBody.tsx::bulkDelete
- **params**: ()
- **ic_degiskenler**:
  - `ids` — Seçili satırların ID'leri
  - `supabaseBrowserClient` — Supabase istemcisi (outer scope'tan)
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `table` — Tablo instance'ı (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
- **Dönüş**: Promise<void> (yan etki: toplu silme işlemi yapar)

### [N17_NASIL] AST Pointer: CategoriesTableBody.tsx::bulkDelete.fn
- **params**: ()
- **ic_degiskenler**:
  - `error` — Supabase silme hatası
- **Dönüş**: Promise<void> (yan etki: toplu silme işlemi yapar)

### [N18_NASIL] AST Pointer: CategoriesTableBody.tsx::getStatusFilters
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: Array<{key: string, label: string}> (durum filtre seçenekleri)

### [N19_NASIL] AST Pointer: CategoriesTableBody.tsx::mapStatusFilter
- **params**: (s: {key: string, label: string})
- **ic_degiskenler**:
  - `activeStatuses` — Aktif filtre değerleri dizisi (outer scope'tan)
  - `setFilter` — Filtre state setter (outer scope'tan)
- **Dönüş**: {key: string, label: string, active: boolean, onToggle: () => void}

### [N20_NASIL] AST Pointer: CategoriesTableBody.tsx::toggleStatusFilter
- **params**: ()
- **ic_degiskenler**:
  - `activeStatuses` — Aktif filtre değerleri dizisi (outer scope'tan)
  - `setFilter` — Filtre state setter (outer scope'tan)
  - `s` — Mevcut durum filtresi (outer scope'tan)
- **Dönüş**: yok (yan etki: filtre state'ini günceller)

### [N21_NASIL] AST Pointer: CategoriesTableBody.tsx::getParentFilterOptions
- **params**: ()
- **ic_degiskenler**:
  - `table` — Tablo instance'ı (outer scope'tan)
- **Dönüş**: Array<{value: string, label: string}> (üst kategori filtre seçenekleri)

### [N22_NASIL] AST Pointer: CategoriesTableBody.tsx::resetFilters
- **params**: ()
- **ic_degiskenler**:
  - `setQuery` — Arama sorgusu state setter (outer scope'tan)
  - `setFilter` — Filtre state setter (outer scope'tan)
- **Dönüş**: yok (yan etki: tüm filtreleri sıfırlar)

### [N23_NASIL] AST Pointer: CategoriesTableBody.tsx::getColumns
- **params**: ()
- **ic_degiskenler**:
  - `t` — Çeviri fonksiyonu (outer scope'tan)
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `saveName` — İsim kaydetme fonksiyonu (outer scope'tan)
  - `saveSortOrder` — Sıralama kaydetme fonksiyonu (outer scope'tan)
  - `openEdit` — Düzenleme açma fonksiyonu (outer scope'tan)
  - `removeCategory` — Kategori silme fonksiyonu (outer scope'tan)
  - `router` — Next.js router (outer scope'tan)
  - `categoryNameMap` — Kategori ID'den isme haritası (outer scope'tan)
- **Dönüş**: Array<ColumnDef> (tablo sütun tanımları)

### [N24_NASIL] AST Pointer: CategoriesTableBody.tsx::getColumns.imageCell
- **params**: (r: DbCategory)
- **ic_degiskenler**:
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` — Supabase URL'i (outer scope'tan)
- **Dönüş**: JSX.Element (görsel hücresi)

### [N25_NASIL] AST Pointer: CategoriesTableBody.tsx::getColumns.nameCell
- **params**: (r: DbCategory)
- **ic_degiskenler**:
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
  - `saveName` — İsim kaydetme fonksiyonu (outer scope'tan)
- **Dönüş**: JSX.Element (isim hücresi)

### [N26_NASIL] AST Pointer: CategoriesTableBody.tsx::getColumns.sortOrderCell
- **params**: (r: DbCategory)
- **ic_degiskenler**:
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
  - `saveSortOrder` — Sıralama kaydetme fonksiyonu (outer scope'tan)
- **Dönüş**: JSX.Element (sıralama hücresi)

### [N27_NASIL] AST Pointer: CategoriesTableBody.tsx::getColumns.slugCell
- **params**: (r: DbCategory)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (slug hücresi)

### [N28_NASIL] AST Pointer: CategoriesTableBody.tsx::getColumns.parentCell
- **params**: (r: DbCategory)
- **ic_degiskenler**:
  - `categoryNameMap` — Kategori ID'den isme haritası (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
- **Dönüş**: JSX.Element (üst kategori hücresi)

### [N29_NASIL] AST Pointer: CategoriesTableBody.tsx::getColumns.descriptionCell
- **params**: (r: DbCategory)
- **ic_degiskenler**:
  - `t` — Çeviri fonksiyonu (outer scope'tan)
- **Dönüş**: JSX.Element (açıklama hücresi)

### [N30_NASIL] AST Pointer: CategoriesTableBody.tsx::getColumns.actionsCell
- **params**: (r: DbCategory)
- **ic_degiskenler**:
  - `hasWriteAccess` — Yazma izni flag'i (outer scope'tan)
  - `t` — Çeviri fonksiyonu (outer scope'tan)
  - `router` — Next.js router (outer scope'tan)
  - `openEdit` — Düzenleme açma fonksiyonu (outer scope'tan)
  - `removeCategory` — Kategori silme fonksiyonu (outer scope'tan)
- **Dönüş**: JSX.Element (aksiyon hücreleri)

### [N31_NASIL] AST Pointer: CategoriesTableBody.tsx::onPriceAdjustError
- **params**: ()
- **ic_degiskenler**:
  - `toast` — Toast bildirim fonksiyonu (outer scope'tan)
- **Dönüş**: yok (yan etki: hata toast'u gösterir)

### [N32_NASIL] AST Pointer: CategoriesTableBody.tsx::onTableReload
- **params**: ()
- **ic_degiskenler**:
  - `table` — Tablo instance'ı (outer scope'tan)
- **Dönüş**: yok (yan etki: tabloyu yeniden yükler)

---

## NODE ID STANDARD

  file: src\views\admin\CategoriesTableBody.tsx
  function: src\views\admin\CategoriesTableBody.tsx::categoriesFetcher
  function: src\views\admin\CategoriesTableBody.tsx::CategoriesTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoriesTableBody
  export: categoriesFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-snug`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-indigo-500/10`, `bg-slate-700`, `bg-white/5`, `border-indigo-500/20`, `border-white/5`, `group-hover:border-cyan-400/30`, `group-hover:border-white/10`, `group-hover:text-cyan-400`, `group-hover:text-cyan-400/60`, `hover:bg-indigo-500`, `hover:text-white`, `text-center`, `text-cyan-400`, `text-indigo-400`
- **Layout:** `flex`, `flex-col`, `gap-1.5`, `gap-2`, `h-1`, `h-12`, `h-full`, `h-px`, `inline-block`, `items-center`, `justify-center`, `justify-end`, `line-clamp-1`, `max-w-200px`, `overflow-hidden`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminButtonPrimaryClass`, `${adminTableActionClass`, `:`, `border`, `duration-300`, `duration-500`, `duration-700`, `font-black`, `font-mono`, `glass`, `group`, `group-hover:rotate-90`, `group-hover:scale-110`, `italic`