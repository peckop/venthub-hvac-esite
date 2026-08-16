---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\views\admin\CategoriesTableBody.tsx
skeleton_hash: ade322d276d3ca4e
entity_hashes:
  func:CategoriesTableBody: d50fe77bdbd7da87
  func:categoriesFetcher: c2a94f9401915640
  overview: e8914144c0390be2
  style_tokens: fc380c343feea254
generated_at: 2026-08-15T15:13:57Z
---

## Genel Bakış
Bu modül, admin panelindeki kategoriler tablosunun verilerini getiren ve sunan iki temel parçadan oluşur: asenkron veri çekme fonksiyonu ve bu veriyi tablo gövdesi olarak render eden React bileşeni. Modül, veritabanı ile arayüz arasındaki köprüyü kurarak kategori yönetim arayüzünün işlevsel temelini sağlar.

## Fonksiyon Grupları
### Veri Getirme
Bu grup, Supabase veritabanından kategori kayıtlarını asenkron olarak çeken ve istenen formata dönüştüren fonksiyonu içerir. Fonksiyon, filtreleme parametrelerini işleyerek tutarlı bir veri yapısı döndürür.
- categoriesFetcher

### Arayüz Bileşeni
Bu grup, getirilen verileri bir tablo gövdesi içinde düzenleyerek kullanıcıya sunan React fonksiyonel bileşenini kapsar. Bileşen, veriyi satırlar halinde göstererek admin panelinin etkileşimli bir parçasını oluşturur.
- CategoriesTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase üzerinden kategori verilerini çekip admin panelinde tablo olarak gösteren bir veri getirici ve sunum bileşeni içerir.

---

**[Aksiyom 1]:** Eğer `categoriesFetcher` fonksiyonuna geçerli bir SupabaseClient bağlantısı (`supabase`) sağlanmazsa, veritabanı sorgusu başarısız olur ve kategori verileri getirilemez.

**[Aksiyom 2]:** Eğer Supabase veritabanında `DbCategory` yapısına karşılık gelen kategori tablosu (ilgili alanlar ve şema) yoksa veya `CATEGORY_SELECT` sabitinde belirtilen alan adları tabloda mevcut değilse, `categoriesFetcher` fonksiyonu geçersiz veya eksik veri döndürür.

**[Aksiyom 3]:** Eğer `_params` (FetchParams) parametresi geçersiz veya eksik değerler içeriyorsa (örn: geçersiz sayfalama, filtre parametreleri), `categoriesFetcher` fonksiyonu beklenen `FetchResult<DbCategory>` yapısını doğru üretemez.

**[Aksiyom 4]:** Eğer `CategoriesTableBody` bileşeni, verilerini sağlamak için `categoriesFetcher` fonksiyonunu çağıran bir üst bileşen veya context tarafından sarmalanmazsa, bileşen veriye erişemez ve boş/hatalı bir tablo render eder.

**[Aksiyom 5]:** Eğer `CATEGORY_SELECT` sabiti (str) değiştirilir veya silinirse, Supabase sorgusunda seçilecek alanlar tanımsız olacağından `categoriesFetcher` fonksiyonu beklenen alanları içermeyen veri döndürür.

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

### [N1_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::categoriesFetcher
- **params**: `(supabase: SupabaseClient<Database>, _params: FetchParams)`
- **ic_degiskenler**:
  - `data` — Supabase'den dönen ham kategori satırları (DbCategory[])
  - `error` — Supabase sorgusundaki hata nesnesi, varsa throw edilir
  - `rows` — data'nın DbCategory[] olarak cast edilmiş hali, null ise boş dizi
  - `totalMatched` — toplam satır sayısı (rows.length)
- **Dönüş**: `{ rows, totalMatched: rows.length }` — `Promise<FetchResult<DbCategory>>`
- **Yan etkiler**: `ensureSessionFresh()` çağırarak oturum yeniler; `categories` tablosundan sıralı veri çeker

---

### [N2_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::openAdd (anonim callback)
- **params**: `()` — parametre yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (void)
- **Yan etkiler**: `setEditingId(null)` ve `isModalOpen(true)` state'lerini ayarlayarak modal açar

---

### [N3_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::openEdit (anonim callback)
- **params**: `(r: DbCategory)` — düzenlenecek kategori satırı
- **ic_degiskenler**: yok
- **Dönüş**: yok (void)
- **Yan etkiler**: `setEditingId(r.id)` ve `setIsModalOpen(true)` ile düzenleme modunda modal açar

---

### [N4_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::saveName (anonim async callback)
- **params**: `(r: DbCategory, raw: string | number)` — satır ve yeni ad değeri
- **ic_degiskenler**:
  - `val` — raw değerinin trim edilmiş string hali
  - `e` — try/catch yakalanan hata nesnesi (AdminPermissionError veya Error)
- **Dönüş**: yok (void); hata durumunda throw eder
- **Yan etkiler**: `mutateWithAudit` ile audit loglu isim günceller, `toast.success/error` gösterir, `table.reload()` çağırarak tabloyu yeniler

---

### [N5_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::saveSortOrder (anonim async callback)
- **params**: `(r: DbCategory, raw: string | number)` — satır ve yeni sıralama değeri
- **ic_degiskenler**:
  - `num` — raw değerinin parseInt ile ondalık tamsayıya dönüştürülmüş hali
  - `e` — try/catch yakalanan hata nesnesi
- **Dönüş**: yok (void); hata durumunda throw eder
- **Yan etkiler**: `mutateWithAudit` ile audit loglu sıralama günceller, `toast.success/error` gösterir, `table.reload()` çağırır

---

### [N6_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::removeCategory (anonim async callback)
- **params**: `(r: DbCategory)` — silinecek kategori satırı
- **ic_degiskenler**:
  - `ok` — confirm dialog'unun onay sonucu (boolean)
  - `e` — try/catch yakalanan hata nesnesi
- **Dönüş**: yok (void)
- **Yan etkiler**: `hasWriteAccess` kontrolü yapar, `confirm` dialogu gösterir, `mutateWithAudit` ile silme işlemi yapar, `toast.success/error` gösterir, `table.reload()` çağırır

---

### [N7_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::exportCSV (anonim async callback)
- **params**: `()` — parametre yok
- **ic_degiskenler**:
  - `rows` — `table.fetchAllForExport()` ile çekilen tüm satırlar
  - `cols` — CSV sütun başlıkları dizisi (`['id', 'name', 'slug', ...]`)
  - `header` — virgülle birleştirilmiş sütun başlık satırı
  - `lines` — her satırın CSV formatına dönüştürülmüş hali (map ile üretilir)
  - `csv` — BOM (\ufeff) ve tüm satırları birleştiren tam CSV string
  - `blob` — CSV içeriğinden oluşturulan Blob nesnesi
  - `url` — blob için oluşturulmuş object URL
  - `a` — dosya indirmek için oluşturulan `<a>` DOM elementi
- **Dönüş**: yok (void)
- **Yan etkiler**: `document.createElement('a')` ile DOM'a enjekte edip `a.click()` ile dosya indirme tetikler, `URL.revokeObjectURL` ile URL'i temizler

---

### [N8_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::bulkStatusChange (anonim async callback)
- **params**: `(status: string)` — hedef durum ('active' veya diğer)
- **ic_degiskenler**:
  - `ids` — `table.selection.selectedIds` ile seçili satır ID'leri dizisi
  - `isActive` — status === 'active' sonucu boolean
  - `ok` — confirm dialog onay sonucu
  - `e` — try/catch yakalanan hata nesnesi
- **Dönüş**: yok (void)
- **Yan etkiler**: `mutateWithAudit` ile toplu aktif/pasif durum günceller, `table.selection.clear()` ile seçimi temizler, `table.reload()` çağırır, toast gösterir

---

### [N9_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::bulkFeaturedChange (anonim async callback)
- **params**: `(featured: boolean)` — öne çıkan durumu
- **ic_degiskenler**:
  - `ids` — `table.selection.selectedIds` ile seçili satır ID'leri dizisi
  - `e` — try/catch yakalanan hata nesnesi
- **Dönüş**: yok (void)
- **Yan etkiler**: `mutateWithAudit` ile toplu is_featured günceller, `table.selection.clear()` ve `table.reload()` çağırır, toast gösterir

---

### [N10_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::bulkDelete (anonim async callback)
- **params**: `()` — parametre yok
- **ic_degiskenler**:
  - `ids` — `table.selection.selectedIds` ile seçili satır ID'leri dizisi
  - `ok` — confirm dialog onay sonucu
  - `e` — try/catch yakalanan hata nesnesi
- **Dönüş**: yok (void)
- **Yan etkiler**: `confirm` dialogu ile silme onayı alır, `mutateWithAudit` ile toplu silme yapar, `table.selection.clear()` ve `table.reload()` çağırır, toast gösterir

---

### [N11_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::statusFilterItems (anonim callback)
- **params**: `()` — parametre yok
- **ic_degiskenler**:
  - `activeStatuses` — filtrede aktif olan durum stringleri dizisi (dış scope'tan)
  - `s` — map içinde her bir durum objesi `{ key: string, label: string }`
  - `next` — toggle sonrası güncellenmiş aktif durumlar dizisi
- **Dönüş**: `{ key, label, active, onToggle }[]` — toolbar'a verilen filtre butonları
- **Yan etkiler**: `setFilter('is_active', next)` ile filtre state'ini günceller

---

### [N12_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::parentFilterOptions (anonim callback)
- **params**: `()` — parametre yok
- **ic_degiskenler**: yok (inline mapping)
- **Dönüş**: `{ value: string, label: string }[]` — üst kategori filtre seçenekleri
- **Yan etkiler**: `table.allRows`'ı `!c.parent_id` ile filtreleyip üst kategorileri option listesine dönüştürür

---

### [N13_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::clearFilters (anonim callback)
- **params**: `()` — parametre yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (void)
- **Yan etkiler**: `setQuery('')`, `setFilter('parent_id', [])`, `setFilter('is_active', [])` ile tüm filtreleri sıfırlar

---

### [N14_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::columns (anonim callback)
- **params**: `()` — parametre yok
- **ic_degiskenler**:
  - `r` — her hücrede render edilen DbCategory satırı (map callback parametresi)
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` — Supabase storage URL'i (image sütunu için)
  - `categoryNameMap` — kategori ID → isim eşlemesi Map nesnesi (parent sütunu için)
- **Dönüş**: sütun tanımları dizisi (table columns config)
- **Yan etkiler**: `router.push` ile navigasyon tetikler (design butonu), `openEdit(r)` ve `removeCategory(r)` callback'lerini bağlar

---

### [N15_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::imageCellRenderer (anonim callback)
- **params**: `(r)` — DbCategory satırı
- **ic_degiskenler**: yok (inline JSX)
- **Dönüş**: JSX.Element — kategori görsel hücresi
- **Yan etkiler**: yok

---

### [N16_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::nameCellRenderer (anonim callback)
- **params**: `(r)` — DbCategory satırı
- **ic_degiskenler**: yok (inline JSX)
- **Dönüş**: JSX.Element — kategori adı hücresi (EditableCell veya span)
- **Yan etkiler**: `saveName(r, val)` çağırarak isim kaydeder

---

### [N17_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::sortOrderCellRenderer (anonim callback)
- **params**: `(r)` — DbCategory satırı
- **ic_degiskenler**: yok (inline JSX)
- **Dönüş**: JSX.Element — sıralama hücresi (EditableCell veya span)
- **Yan etkiler**: `saveSortOrder(r, val)` çağırarak sıralama kaydeder

---

### [N18_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::slugCellRenderer (anonim callback)
- **params**: `(r)` — DbCategory satırı
- **ic_degiskenler**: yok (inline JSX)
- **Dönüş**: JSX.Element — slug hücresi (code elementi)
- **Yan etkiler**: yok

---

### [N19_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::parentCellRenderer (anonim callback)
- **params**: `(r)` — DbCategory satırı
- **ic_degiskenler**: yok (inline JSX)
- **Dönüş**: JSX.Element — üst kategori adı hücresi
- **Yan etkiler**: `categoryNameMap.get(r.parent_id)` ile üst kategori ismini çeker

---

### [N20_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::descriptionCellRenderer (anonim callback)
- **params**: `(r)` — DbCategory satırı
- **ic_degiskenler**: yok (inline JSX)
- **Dönüş**: JSX.Element — açıklama hücreesi
- **Yan etkiler**: yok

---

### [N21_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::actionsCellRenderer (anonim callback)
- **params**: `(r)` — DbCategory satırı
- **ic_degiskenler**: yok (inline JSX)
- **Dönüş**: JSX.Element — aksiyon butonları hücresi (tasarım, düzenle, sil)
- **Yan etkiler**: `router.push`, `openEdit(r)`, `removeCategory(r)` çağırır

---

### [N22_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::onPriceAdjustClick (anonim callback)
- **params**: `()` — parametre yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (void)
- **Yan etkiler**: `toast.error('Categories do not support price adjustments')` gösterir

---

### [N23_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx`::onTableActionComplete (anonim callback)
- **params**: `()` — parametre yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (void)
- **Yan etkiler**: `void table.reload()` ile tabloyu yeniler

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