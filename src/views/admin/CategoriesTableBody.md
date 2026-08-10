---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\CategoriesTableBody.tsx
skeleton_hash: 097ab28f4c3c8803
entity_hashes:
  func:CategoriesTableBody: d50fe77bdbd7da87
  func:categoriesFetcher: c2a94f9401915640
  overview: 22cea1905ba0d279
  style_tokens: fc380c343feea254
generated_at: 2026-06-19T20:49:57Z
---

## Genel Bakış
Bu modül, admin panelindeki kategoriler tablosunun gövde bölümünü render eden React bileşeni ve bu bileşenin ihtiyaç duyduğu verileri Supabase veritabanından asenkron olarak çeken veri getirici fonksiyonunu içerir. Modül, veri erişimi ve sunum katmanlarını tek bir dosyada birleştirerek kategori yönetimi arayüzünün temel parçasını oluşturur.

## Fonksiyon Grupları
### Veri Erişimi
Bu grup, Supabase veritabanından kategori kayıtlarını çekmek için kullanılan asenkron veri getirici mantığını içerir. Fonksiyon, filtreleme ve sayfalama parametrelerini işleyerek tutarlı bir veri yapısı döndürür.
- categoriesFetcher

### Görsel Bileşen
Bu grup, çekilen kategori verilerini bir tablo gövdesi içinde kullanıcıya sunan React fonksiyonel bileşenini kapsar. Bileşen, gelen veriyi satırlar ve hücreler halinde düzenleyerek admin arayüzünün interaktif bir parçasını oluşturur.
- CategoriesTableBody

---

## AXIOMS – Mimari Varsayımlar
Bu modül için, veri erişim ve sunum katmanlarının doğru entegrasyonu temel bir varsayımdır.

[Aksiyom 1]: Eğer `categoriesFetcher` fonksiyonuna geçirilen `supabase` parametresi, geçerli ve aktif bir Supabase veritabanı bağlantısı içermiyorsa, fonksiyon asenkron veri getirme işlemini başlatamaz veya bir hata fırlatır.
[Aksiyom 2]: Eğer `categoriesFetcher` fonksiyonuna geçirilen `_params` (FetchParams) parametresi, modülün beklediği filtreleme ve sayfalama bilgilerini içermiyorsa (örneğin, `undefined` veya geçersiz bir yapıdaysa), veritabanı sorgusu tutarsız sonuçlar döndürür veya başarıyla tamamlanamaz.
[Aksiyom 3]: Eğer `CATEGORY_SELECT` sabiti (veritabanı sorgusunda seçilecek alanları belirtir) boş bir string ise veya `categories` tablosunda karşılığı olmayan alan adlarını içeriyorsa, `categoriesFetcher` fonksiyonu geçerli bir veri yapısı (`DbCategory`) üretemez ve hata oluşur.
[Aksiyom 4]: Eğer `CategoriesTableBody` React bileşeni, `categoriesFetcher` tarafından döndürülen verileri alamazsa (örneğin, veri yükleme durumu henüz tamamlanmadıysa veya bir hata oluştuysa), bileşen kendi içinde tanı

---

## FONKSİYON DETAYLARI

### categoriesFetcher
**Ne yapar**: Supabase veritabanından kategorileri sıralı olarak çekip, standart bir fetch sonucu formatında döndürür. Admin panelinde kategori tablosunun veri kaynağı olarak kullanılır.

**Nasıl yapar**: Fonksiyon önce `ensureSessionFresh()` çağrısı ile kullanıcı oturumunun geçerli ve taze olduğundan emin olur. Ardından Supabase istemcisi aracılığıyla `categories` tablosuna sorgu gönderir. `CATEGORY_SELECT` sabiti ile tanımlı belirli alanları seçer ve iki aşamalı sıralama uygular: önce `sort_order` alanına göre artan, ardından `name` alanına göre artan sırada. Sorgu hatası oluşursa异常 fırlatır; başarılı olursa verileri `DbCategory[]` tipine dönüştürerek, `totalMatched` değerini satır sayısı olarak ayarlar.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase istemcisi örneği; `Database` generic parametresi ile veritabanı şeması tip güvenliği sağlar
- `_params`: `FetchParams` — Fetch parametreleri nesnesi; bu fonksiyonda kullanılmadığı için `_` öneki ile işaretlenmiştir

**Dönüş**: `Promise<FetchResult<DbCategory>>` — Asenkron bir Promise döndürür; `rows` alanı `DbCategory[]` tipinde kategorileri, `totalMatched` alanı ise toplam kategori sayısını (sayı) içerir

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

### [N1_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::categoriesFetcher
- **params**: `(supabase: SupabaseClient<Database>, _params: FetchParams)`
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen ham veri (DbCategory[] veya null)
  - `error` — Supabase sorgusu sırasında oluşabilecek hata nesnesi
  - `rows` — data'nın DbCategory[] tipine cast edilmiş hali; null ise boş dizi
- **Dönüş**: `Promise<FetchResult<DbCategory>>` — `{ rows, totalMatched }` objesi

---

### [N2_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody
- **params**: `(parametre yok)`
- **ic_degiskenler**:
  - `supabaseBrowserClient` — modülden import edilen Supabase browser client örneği, tüm CRUD操作larında kullanılır
  - `hasWriteAccess` — kullanıcının yazma izni olup olmadığını belirten boolean (dışarıdan gelir)
  - `t` — i18n çeviri fonksiyonu
  - `router` — `useRouter()` hook'undan gelen Next.js yönlendirme nesnesi
  - `table` — admin tablo hook'undan gelen tablo yönetimi nesnesi (fetchAllForExport, reload, selection, allRows, fetchAllForExport metodları)
  - `editingId` — şu anda düzenlenen kategorinin ID'si (setEditingId ile yönetilir)
  - `isModalOpen` — modalın açık olup olmadığını tutan boolean state (setIsModalOpen)
  - `query` — arama sorgusu stringi (setQuery ile yönetilir)
  - `activeStatuses` — filtrelenen aktif durum değerleri dizisi (setFilter ile yönetilir)
  - `categoryNameMap` — kategori ID -> isim eşlemesi yapan Map nesnesi, parent isim gösteriminde kullanılır
  - `val` — EditableCell'den gelen yeni isim/sıralama değeri
  - `r` — DbCategory tipinde tekil satır verisi (tüm callbacklerde döngü veya parametre olarak gelir)
  - `ids` — tablo seçimindeki seçili kategori ID'leri dizisi
  - `isActive` — toplu durum güncellemesinde hedef aktiflik değeri (true/false)
  - `featured` — toplu öne çıkma güncellemesinde hedef değer
  - `num` — sıralama düzenlemesinde string'den parse edilmiş sayısal değer
  - `is` — catch bloğundaki hata nesnesi
  - `cols` — CSV dışa aktarımında kullanılacak sütun adları dizisi
  - `header` — CSV dosyasının ilk satırı (sütun adları birleşik)
  - `lines` — her satırı CSV formatına dönüştürülmüş veri dizisi
  - `csv` — BOM karakteri ile başlayan tam CSV içeriği stringi
  - `blob` — CSV verisinden oluşturulan Blob nesnesi
  - `url` — Blob için oluşturulan Object URL
  - `a` — indirme tetiklemek için oluşturulan geçici `<a>` DOM elemanı
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` — Supabase depolama URL'i, görsel yüklemelerinde kullanılır
  - `adminTableActionClass` — aksiyon butonları için ortak CSS sınıfı
  - `adminTableActionDangerClass` — tehlikeli aksiyon butonları için CSS sınıfı
- **Dönüş**: `React.FC` — JSX ile admin kategorileri tablosunu render eden React bileşeni

---

### [N3_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (saveName callback)
- **params**: `(r: DbCategory, raw: string | number)`
- **ic_degiskenler**:
  - `val` — raw değerinin trim edilmiş string hali, boş veya aynı isimse işlem yapılmaz
  - `error` — mutateWithAudit fn içindeki Supabase update işleminde oluşabilecek hata
- **Dönüş**: `Promise<void>` — Toast bildirimi ve tabloyu yeniden yükleme (yan etki)

---

### [N4_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (saveSortOrder callback)
- **params**: `(r: DbCategory, raw: string | number)`
- **ic_degiskenler**:
  - `num` — raw değerinin parseInt ile parse edilmiş tam sayı hali; NaN veya aynı sıralama ise iptal
  - `error` — mutateWithAudit fn içindeki Supabase update işleminde oluşabilecek hata
- **Dönüş**: `Promise<void>` — Toast bildirimi ve tabloyu yeniden yükleme (yan etki)

---

### [N5_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (removeCategory callback)
- **params**: `(r: DbCategory)`
- **ic_degiskenler**:
  - `error` — mutateWithAudit fn içindeki Supabase delete işleminde oluşabilecek hata
- **Dönüş**: `Promise<void>` — Onay dialogu, silme işlemi, Toast bildirimi (yan etki)

---

### [N6_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (handleExportCsv callback)
- **params**: `(parametre yok)`
- **ic_degiskenler**:
  - `rows` — `table.fetchAllForExport()` ile gelen tüm satırlar dizisi
  - `cols` — CSV sütun başlıkları: `['id', 'name', 'slug', 'parent_id', 'is_active', 'sort_order', 'description']`
  - `header` — virgülle birleştirilmiş sütun başlık satırı
  - `lines` — her satırın CSV formatına dönüştürülmüş hali (tırnak escape'li)
  - `csv` — BOM (`\ufeff`) ile başlayan tam CSV içeriği
  - `blob` — CSV stringinden oluşturulan Blob (text/csv charset utf-8)
  - `url` — Blob için URL.createObjectURL ile oluşturulan URL
  - `a` — document.createElement('a') ile oluşturulan geçici indirme linki DOM elemanı
- **Dönüş**: `Promise<void>` — CSV dosyasını tarayıcıda indirme tetikler (yan etki)

---

### [N7_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (bulkSetStatus callback)
- **params**: `(status: string)`
- **ic_degiskenler**:
  - `ids` — `table.selection.selectedIds` ile gelen seçili kategori ID'leri dizisi
  - `isActive` — status === 'active' kontrolünden türetilen boolean değer
  - `error` — mutateWithAudit fn içindeki Supabase update işleminde oluşabilecek hata
- **Dönüş**: `Promise<void>` — Toplu aktif/pasif durum güncelleme (yan etki)

---

### [N8_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (bulkSetFeatured callback)
- **params**: `(featured: boolean)`
- **ic_degiskenler**:
  - `ids` — `table.selection.selectedIds` ile gelen seçili kategori ID'leri dizisi
  - `error` — mutateWithAudit fn içindeki Supabase update işleminde oluşabilecek hata
- **Dönüş**: `Promise<void>` — Toplu öne çıkma durumu güncelleme (yan etki)

---

### [N9_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (bulkDelete callback)
- **params**: `(parametre yok)`
- **ic_degiskenler**:
  - `ids` — `table.selection.selectedIds` ile gelen seçili kategori ID'leri dizisi
  - `error` — mutateWithAudit fn içindeki Supabase delete işleminde oluşabilecek hata
- **Dönüş**: `Promise<void>` — Toplu silme onayı ve işleme (yan etki)

---

### [N10_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (statusFilterItems getter)
- **params**: `(parametre yok)`
- **ic_degiskenler**: (yok — inline map)
- **Dönüş**: Array — aktif/pasif durum filtre seçenekleri dizisi; her eleman `{ key, label, active, onToggle }` formatında

---

### [N11_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (parentFilterOptions getter)
- **params**: `(parametre yok)`
- **ic_degiskenler**: (yok)
- **Dönüş**: Array — tüm üst kategorilerin `{ value, label }` formatında options dizisi; ilk eleman "Tümü" seçeneği

---

### [N12_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (handleClearFilters callback)
- **params**: `(parametre yok)`
- **ic_degiskenler**: (yok)
- **Dönüş**: `void` — query'yi boş stringe, parent_id ve is_active filtrelerini boş dizilere set eder

---

### [N13_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (columns definition)
- **params**: `(parametre yok)`
- **ic_degiskenler**:
  - `r` — her cell render fonksiyonuna giren DbCategory tipinde satır verisi
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` — VentImage src oluşturma için Supabase storage URL'i
  - `categoryNameMap` — parent_id'den kategori adına karşılık gelen Map erişimi
- **Dönüş**: Array — tablo sütun tanımları dizisi; her biri `{ key, header, sortable, hideable, align, cell, defaultHidden }` formatında

---

### [N14_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (handlePriceAdjustment stub)
- **params**: `(parametre yok)`
- **ic_degiskenler**: (yok)
- **Dönüş**: `void` — her zaman toast.error ile "Categories do not support price adjustments" mesajı gösterir

---

### [N15_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::CategoriesTableBody (handleReload callback)
- **params**: `(parametre yok)`
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<void>` — `table.reload()` çağırarak tabloyu yeniden yükler

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