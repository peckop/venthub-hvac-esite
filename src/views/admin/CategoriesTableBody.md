---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\CategoriesTableBody.tsx
skeleton_hash: 2754d1b4a8314f44
entity_hashes:
  func:CategoriesTableBody: d50fe77bdbd7da87
  func:categoriesFetcher: c2a94f9401915640
  overview: 59e24a4d4621dc2a
  style_tokens: ebc7df49d9d6094c
generated_at: 2026-08-25T07:56:27Z
---

## Genel Bakış
Bu modül, admin panelinde kategorilerin bir tablo içinde listelenmesinden sorumlu bir React bileşenidir. Supabase veritabanından kategori verilerini çeker ve tablo satırları olarak görüntüler.

## Fonksiyon Grupları

### Veri Çekme
Supabase veritabanından kategori kayıtlarını asenkron olarak sorgular ve tablo bileşeninin kullanacağı formatta sonuç döndürür.
- categoriesFetcher

### Bileşen
Admin arayüzünde kategorilerin tablo gövdesi olarak render edilmesini sağlayan ana React bileşenidir. Veri çekme fonksiyonunu kullanarak kategori listesini alır ve satır satır görüntüler.
- CategoriesTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül, `CATEGORY_SELECT` sabitini ve `categoriesFetcher` fonksiyonunu kullanarak bir admin kategori tablosu bileşeni sağlar.

[Aksiyom 1]: Eğer `supabase` parametresi olarak geçerli bir `SupabaseClient<Database>` örneği sağlanmazsa, `categoriesFetcher` fonksiyonu veritabanı sorgularını gerçekleştiremez ve veri çekme işlemi başarısız olur.

[Aksiyom 2]: Eğer `CATEGORY_SELECT` sabiti tanımlı değilse, veritabanı sorgusunda hangi alanların seçileceği belirlenemez ve sorgu düzgün oluşturulamaz.

[Aksiyom 3]: Eğer `FetchParams` ve `FetchResult<DbCategory>` tipleri modül kapsamında tanımlı veya içe aktarılmış değilse, fonksiyonun tip uyumsuzluğu nedeniyle derleme hatası vermesi beklenir.

[Aksiyom 4]: Eğer `CategoriesTableBody` bileşeni bir React ortamında (React ve gerekli bağımlılıklar yüklenmiş) kullanılmazsa, bileşen düzgün şekilde oluşturulamaz ve render edilemez.

---

## FONKSİYON DETAYLARI

### categoriesFetcher
**Ne yapar**: Supabase veritabanındaki `categories` tablosundan tüm kategori kayıtlarını çeker ve belirli bir sıralama düzeninde döndürür. Veri çekme işlemi öncesinde oturumun güncel olduğunu garanti altına alır.

**Nasıl yapar**: Fonksiyon önce `ensureSessionFresh()` fonksiyonunu çağırarak kullanıcının oturum bilgisinin taze ve geçerli olmasını sağlar. Ardından Supabase istemcisi üzerinden `categories` tablosuna sorgu gönderir. Sorguda `CATEGORY_SELECT` sabiti ile belirtilen alanlar seçilir. Sonuçlar önce `sort_order` alanına göre artan (ascending), ardından `name` alanına göre artan (ascending) olacak şekilde iki aşamalı olarak sıralanır. Sorgu sırasında bir hata oluşursa bu hata fırlatılır (throw). Hata yoksa gelen veri `DbCategory` tipine dönüştürülür; veri null ise boş dizi kullanılır. Sonuç olarak `rows` (kayıt listesi) ve `totalMatched` (toplam eşleşen kayıt sayısı) alanlarını içeren bir nesne döndürülür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Veritabanı işlemleri için kullanılan Supabase istemci nesnesi. `Database` generic tipi ile veritabanı şeması tanımlanır.
- `_params`: `FetchParams` — Fonksiyon imzası gereği alınan parametre nesnesi. Alt çizgi (_) ön eki ile işaretli olduğundan fonksiyon gövdesinde kullanılmaz; yoksayılır.

**Dönüş**: `Promise<FetchResult<DbCategory>>` — Asenkron bir Promise döndürür. Promise çözüldüğünde `FetchResult<DbCategory>` tipinde bir nesne elde edilir. Bu nesne `rows` (tipi `DbCategory[]` olan kategori kayıtları dizisi) ve `totalMatched` (tipi `number` olan toplam kayıt sayısı) alanlarını içerir.

### CategoriesTableBody
**Ne yapar**: Kategorilerin görüntülendiği tablonun gövde kısmını oluşturan bir React fonksiyonel bileşenidir. Bileşenin dönüş tipi `React.FC` (React Function Component) olarak tanımlıdır.

**Nasıl yapar**: Kaynakta bu fonksiyonun gövdesi ve docstring bilgisi verilmemiştir. Uygulama detayları bilinmemektedir.

**Parametreler**: Kaynakta parametre tanımı verilmemiştir.

**Dönüş**: `React.FC` — React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/EditableCell::EditableCell
- import: ../../components/admin/ExportMenu::ExportMenu
- import: ../../components/admin/categories/CategoryFormModal::CategoryFormModal
- import: ../../components/admin/data-table/BulkBar::BulkBar
- import: ../../components/admin/data-table/BulkBar::type BulkAction
- import: ../../components/admin/data-table/DataTableKit::DataTableKit
- import: ../../components/admin/data-table/types::type { AdminColumn }
- import: ../../components/admin/overlay/ConfirmProvider::useConfirm
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

### [N1_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::categoriesFetcher
- **params**: `supabase` — SupabaseClient<Database> tipinde veritabanı istemcisi, `_params` — FetchParams tipinde sayfalama/filtre parametreleri (kullanılmıyor)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen kategori kayıtları dizisi
  - `error` — Supabase sorgusunda oluşabilecek hata nesnesi
  - `rows` — `data`'nın DbCategory[] tipine cast edilmiş hali, boş dizi fallback ile
- **Dönüş**: `{ rows: DbCategory[], totalMatched: number }` — kategori satırları ve toplam eşleşme sayısı

### [N2_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::openCreate
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `setEditingId(null)` ve `setIsModalOpen(true)` çağırarak modal açma yan etkisi

### [N3_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::openEdit
- **params**: `r` — DbCategory tipinde düzenlenen kategori nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `setEditingId(r.id)` ve `setIsModalOpen(true)` çağırarak düzenleme modalını açma yan etkisi

### [N4_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::saveName
- **params**: `r` — DbCategory tipinde güncellenecek kategori, `raw` — string | number tipinde yeni isim değeri
- **ic_degiskenler**:
  - `val` — `raw`'ın String'e çevrilip trim edilmiş hali
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok — kategori ismini güncelleme, toast bildirimi gösterme ve tabloyu yeniden yükleme yan etkileri

### [N5_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::saveName.fn
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — Supabase update sorgusundan dönen hata nesnesi
- **Dönüş**: yok — `mutateWithAudit` içinde çağrılan kategori ismi güncelleme fonksiyonu

### [N6_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::saveSortOrder
- **params**: `r` — DbCategory tipinde güncellenecek kategori, `raw` — string | number tipinde yeni sıralama değeri
- **ic_degiskenler**:
  - `num` — `raw`'ın parseInt ile sayıya çevrilmiş hali
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok — kategori sıralama değerini güncelleme, toast bildirimi gösterme ve tabloyu yeniden yükleme yan etkileri

### [N7_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::saveSortOrder.fn
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — Supabase update sorgusundan dönen hata nesnesi
- **Dönüş**: yok — `mutateWithAudit` içinde çağrılan sıralama güncelleme fonksiyonu

### [N8_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::removeCategory
- **params**: `r` — DbCategory tipinde silinecek kategori
- **ic_degiskenler**:
  - `ok` — onay dialogundan dönen boolean değer
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok — kategori silme, toast bildirimi gösterme ve tabloyu yeniden yükleme yan etkileri

### [N9_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::removeCategory.fn
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — Supabase delete sorgusundan dönen hata nesnesi
- **Dönüş**: yok — `mutateWithAudit` içinde çağrılan kategori silme fonksiyonu

### [N10_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::exportToCSV
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `rows` — `table.fetchAllForExport()` ile alınan tüm kategori satırları
  - `cols` — CSV başlık sütun adları dizisi
  - `header` — virgülle birleştirilmiş sütun başlık satırı
  - `lines` — her satırı CSV formatına dönüştüren map sonucu
  - `csv` — BOM karakteri eklenmiş tam CSV metni
  - `blob` — CSV verisini içeren Blob nesnesi
  - `url` — Blob için.createObjectURL ile oluşturulan URL
  - `a` — indirme tetiklemek için oluşturulan `<a>` elementi
- **Dönüş**: yok — dosya indirme yan etkisi (categories.csv)

### [N11_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::exportToCSV.rowMapper
- **params**: `r` — DbCategory tipinde dışa aktarılacak kategori satırı
- **ic_degiskenler**: (yok — dizi elemanları doğrudan return içinde)
- **Dönüş**: string — virgülle ayrılmış tek CSV satırı

### [N12_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::bulkStatusChange
- **params**: `status` — string tipinde hedef durum ('active' veya 'inactive')
- **ic_degiskenler**:
  - `ids` — `table.selection.selectedIds` ile seçili kategori ID'leri
  - `isActive` — `status === 'active'` sonucu boolean
  - `ok` — onay dialogundan dönen boolean değer
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok — toplu durum güncelleme, seçim temizleme ve tabloyu yeniden yükleme yan etkileri

### [N13_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::bulkStatusChange.fn
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — Supabase update sorgusundan dönen hata nesnesi
- **Dönüş**: yok — `mutateWithAudit` içinde çağrılan toplu durum güncelleme fonksiyonu

### [N14_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::bulkFeatureToggle
- **params**: `featured` — boolean tipinde öne çıkarma durumu
- **ic_degiskenler**:
  - `ids` — `table.selection.selectedIds` ile seçili kategori ID'leri
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok — toplu öne çıkarma güncelleme, seçim temizleme ve tabloyu yeniden yükleme yan etkileri

### [N15_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::bulkFeatureToggle.fn
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — Supabase update sorgusundan dönen hata nesnesi
- **Dönüş**: yok — `mutateWithAudit` içinde çağrılan toplu öne çıkarma güncelleme fonksiyonu

### [N16_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::bulkDelete
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ids` — `table.selection.selectedIds` ile seçili kategori ID'leri
  - `ok` — onay dialogundan dönen boolean değer
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok — toplu kategori silme, seçim temizleme ve tabloyu yeniden yükleme yan etkileri

### [N17_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::bulkDelete.fn
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — Supabase delete sorgusundan dönen hata nesnesi
- **Dönüş**: yok — `mutateWithAudit` içinde çağrılan toplu silme fonksiyonu

### [N18_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::bulkActions
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — doğrudan dizi döndürülür)
- **Dönüş**: `{ key: string, label: string, tone: string, onRun: () => void }[]` — toplu işlem menü öğeleri dizisi

### [N19_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::statusFilters
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — doğrudan map sonucu döndürülür)
- **Dönüş**: `{ key: string, label: string, active: boolean, onToggle: () => void }[]` — durum filtre öğeleri dizisi

### [N20_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::statusFilters.itemMapper
- **params**: `s` — `{ key: string, label: string }` tipinde durum filtresi kaynağı
- **ic_degiskenler**:
  - `next` — toggle sonrası aktif durumlar dizisi
- **Dönüş**: `{ key: string, label: string, active: boolean, onToggle: () => void }` — filtre öğesi

### [N21_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::statusFilters.itemMapper.onToggle
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `next` — mevcut `activeStatuses` dizisinin toggle edilmiş hali
- **Dönüş**: yok — `setFilter('is_active', next)` çağırarak filtre güncelleme yan etkisi

### [N22_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::parentOptions
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — doğrudan dizi döndürülür)
- **Dönüş**: `{ value: string, label: string }[]` — üst kategori filtre seçenekleri

### [N23_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::resetFilters
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — arama sorgusunu ve filtreleri sıfırlama yan etkisi

### [N24_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::columns
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — doğrudan dizi döndürülür)
- **Dönüş**: Column[] — tablo sütun tanımları dizisi

### [N25_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::columns.imageCell
- **params**: `r` — DbCategory tipinde satır verisi
- **ic_degiskenler**: (yok — JSX doğrudan return edilir)
- **Dönüş**: JSX.Element — kategori görseli veya "resim yok" placeholder'ı

### [N26_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::columns.nameCell
- **params**: `r` — DbCategory tipinde satır verisi
- **ic_degiskenler**: (yok — JSX doğrudan return edilir)
- **Dönüş**: JSX.Element — kategori adı, düzenlenebilir hücre ve öne çıkan rozeti

### [N27_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::columns.sortOrderCell
- **params**: `r` — DbCategory tipinde satır verisi
- **ic_degiskenler**: (yok — JSX doğrudan return edilir)
- **Dönüş**: JSX.Element — sıralama değeri, düzenlenebilir hücre veya salt okunur metin

### [N28_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::columns.slugCell
- **params**: `r` — DbCategory tipinde satır verisi
- **ic_degiskenler**: (yok — JSX doğrudan return edilir)
- **Dönüş**: JSX.Element — kategori slug'ı kod bloğu içinde

### [N29_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::columns.parentCell
- **params**: `r` — DbCategory tipinde satır verisi
- **ic_degiskenler**: (yok — JSX doğrudan return edilir)
- **Dönüş**: JSX.Element — üst kategori adı veya "yok" placeholder'ı

### [N30_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::columns.descriptionCell
- **params**: `r` — DbCategory tipinde satır verisi
- **ic_degiskenler**: (yok — JSX doğrudan return edilir)
- **Dönüş**: JSX.Element — kategori açıklaması veya "yok" placeholder'ı

### [N31_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::columns.actionsCell
- **params**: `r` — DbCategory tipinde satır verisi
- **ic_degiskenler**: (yok — JSX doğrudan return edilir)
- **Dönüş**: JSX.Element — tasarım, düzenleme ve silme aksiyon butonları

### [N32_NASIL] AST Pointer: src/views/admin/CategoriesTableBody.tsx::handleModalClose
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `table.reload()` çağırarak tabloyu yeniden yükleme yan etkisi

---

## NODE ID STANDARD

  file: CategoriesTableBody.tsx
  function: CategoriesTableBody.tsx::categoriesFetcher
  function: CategoriesTableBody.tsx::CategoriesTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoriesTableBody
  export: categoriesFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-accent-weak`, `bg-admin-surface`, `bg-admin-surface-2`, `bg-admin-surface-3`, `border-admin-accent/30`, `border-admin-border`, `group-hover:border-admin-accent/30`, `group-hover:border-admin-border`, `group-hover:text-admin-accent`, `hover:bg-admin-accent`, `hover:text-admin-accent-fg`, `text-admin-accent`, `text-admin-fg`, `text-admin-fg-muted`
- **Layout:** `flex`, `flex-col`, `gap-1.5`, `gap-2`, `h-1`, `h-12`, `h-full`, `h-px`, `inline-block`, `items-center`, `justify-center`, `justify-end`, `line-clamp-1`, `max-w-200px`, `overflow-hidden`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminButtonPrimaryClass`, `${adminTableActionClass`, `:`, `border`, `duration-300`, `duration-500`, `duration-700`, `font-mono`, `font-semibold`, `group`, `group-hover:rotate-90`, `group-hover:scale-110`, `italic`, `mt-1`