---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\data-table\DataTableKit.tsx
skeleton_hash: d01d6fc893236a10
entity_hashes:
  func:DataTableKit: 9d029f93373fe873
  overview: b868e3edab37a5c7
  style_tokens: db6fc579bfa7b43f
generated_at: 2026-08-27T08:09:45Z
---

## Genel Bakış
DataTableKit, admin panelinde kullanılan bir veri tablosu bileşenidir. Generic bir yapıya sahip olup, farklı veri tipleriyle çalışabilecek şekilde tasarlanmıştır. Bileşen, aldığı proplar aracılığıyla yapılandırılabilir bir veri tablosu arayüzü sunar.

## Fonksiyon Grupları

### Ana Bileşen
Veri tablosunun ana render sorumluluğunu üstlenir. Generic tip parametresi sayesinde farklı veri yapılarıyla uyumlu çalışabilir şekilde tasarlanmıştır.
- DataTableKit

## Bağımlılıklar

**İç Bağımlılıklar:** Kaynakta başka fonksiyon tanımlanmadığından, modül içi fonksiyon çağrısı bulunmamaktadır.

**Dış Bağımlılıklar:** DataTableKitProps tipi, bileşenin kabul ettiği propları tanımlayan bir arayüzdür. Bu tipin neler içerdiği mevcut kaynak bilgisinden bilinmemektedir.

**Mimari Not:** Bileşen, `admin/data-table` dizin yapısı altında konumlandığından, admin modülüne ait veri tablosu işlevselliğini modüler bir şekilde sunan bir kit parçası olarak değerlendirilebilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, fonksiyon gövdesinden türetilen özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### DataTableKit
**Ne yapar**: Genel amaçlı bir veri tablosu bileşeni kitidir. Tablonun başlık kısmını, satırlarını, seçim (checkbox) mekanizmasını, satır genişletme (expand) işlevini, yoğunluk (density) ayarını, kolon görünürlük yönetimini, sayfalama bileşenini, hata ve boş durum ekranlarını tek bir bütünleşik yapı altında sunar. Generic `T` tip parametresi sayesinde farklı veri türleriyle kullanılabilir.

**Nasıl yapar**: Bileşen önce `props` değerlerini destruct eder. `useI18n` hook'u ile uluslararasılaştırma desteği sağlar; etiketler için `??` operatörüyle prop'tan gelen değer yoksa sözlükten (`t()`) varsayılanı alır. Kolon görünürlüğü ve yoğunluk ayarları `persistKey` ile `localStorage`'a yüklenir ve kaydedilir (`loadColumnVisibility`, `saveColumnVisibility`, `loadDensity`, `saveDensity`). `useMemo` ile görünür kolon anahtarları ve kolon toggle listesi hesaplanır. `hasReadAccess === false` olduğunda `accessDeniedState` render edilerek erişim engeli gösterilir. Tablo gövdesinde dört durum ele alınır: yükleme sırasında iskelet (skeleton), filtre aktifken boş durum, filtresiz boş durum ve normal satır listesi. Her satırda seçim checkbox'ı, genişletme butonu ve görünür kolon hücreleri render edilir. `rowHref` verilmişse ilk görünür kolonun içeriği `Link` bileşeniyle sarılır. Genişletilen satırlar için `renderExpandedRow` fonksiyonu çağrılır. Sayfalama, tablonun altında `DataTablePagination` bileşeniyle gösterilir (admin-standard.md §3/4 kuralı). Bileşenin üst kısmında `toolbarSlot`, alt kısmında `bulkBarSlot` prop olarak yerleştirilir.

**Parametreler**:
- `props`: `DataTableKitProps<T>` — Bileşenin tüm yapılandırma ve davranışlarını tanımlayan props nesnesi. Aşağıdaki alt alanları içerir:
  - `columns`: `Column<T>[]` (varsayım — tipte açıkça belirtilmemiş ama `columns` dizisi üzerinde `.key`, `.header`, `.hideable`, `.defaultHidden`, `.cell`, `.align`, `.cellClassName` alanlarına erişiliyor) — Tablonun kolon tanımları dizisi.
  - `table`: (tipi açıkça belirtilmemiş) — Tablo durumunu ve aksiyonlarını içeren nesne. `table.pagination` (`page`, `pageCount`, `setPage`), `table.sorting` (`sort`, `toggleSort`), `table.selection` (`allSelected`, `toggleAll`, `isSelected`, `toggle`), `table.filtering` (`hasActiveFilters`), `table.rows`, `table.totalMatched`, `table.isLoading`, `table.error` alanlarına sahiptir.
  - `rowId`: `(row: T) => string` (varsayım — kullanımından çıkarılıyor) — Her satır için benzersiz kimlik üreten fonksiyon.
  - `persistKey`: `string` — Kolon görünürlüğü ve yoğunluk ayarının `localStorage`'da saklanacağı anahtar.
  - `hasWriteAccess`: `boolean` — Yazma yetkisi olup olmadığını belirtir; `true` ise satır seçim checkbox'ları gösterilir.
  - `hasReadAccess`: `boolean` — Okuma yetkisi olup olmadığını belirtir; `false` olduğunda `accessDeniedState` render edilir. Varsayılan değeri `true`.
  - `emptyState`: `ReactNode` — Filtre aktif değilken ve tabloda satır yokken gösterilecek bileşen.
  - `filterEmptyState`: `ReactNode` — Filtre aktifken ve tabloda satır yokken gösterilecek bileşen.
  - `accessDeniedState`: `ReactNode` — Okuma yetkisi yokken gösterilecek bileşen.
  - `errorLabel`: `string` — Tablo hata durumunda gösterilecek metin; verilmezse sözlükten `admin.dataTable.states.error` anahtarıyla alınır.
  - `rowHref`: `(row: T) => string` (varsayım — `Link` bileşenine `href` olarak veriliyor) — Satırın ilk görünür kolonunu bağlantıya dönüştüren fonksiyon.
  - `onRowClick`: `(row: T) => void` (varsayım — kullanımından çıkarılıyor) — Satıra tıklandığında çağrılan fonksiyon; verildiğinde satır `cursor-pointer` ve `role="button"` ile erişilebilir hale gelir, Enter ve Space tuşlarıyla tetiklenebilir.
  - `renderExpandedRow`: `(row: T) => ReactNode` (varsayım — kullanımından çıkarılıyor) — Genişletilen satır için içerik üreten fonksiyon; verildiğinde expand butonu gösterilir.
  - `toolbarSlot`: `ReactNode` — Tablonun üstüne yerleştirilecek özel araç çubuğu içeriği.
  - `bulkBarSlot`: `ReactNode` — Tablonun altına yerleştirilecek toplu işlem çubuğu içeriği.
  - `columnsButtonLabel`: `string` — Kolon menüsü butonunun etiketi.
  - `selectAllLabel`: `string` — "Tümünü seç" checkbox etiketi; verilmezse sözlükten `admin.dataTable.labels.selectAll` anahtarıyla alınır.
  - `rowSelectLabel`: `string` — Satır seçim checkbox etiketi; verilmezse sözlükten `admin.dataTable.labels.rowSelect` anahtarıyla alınır.
  - `expandLabel`: `string` — Satır genişletme butonu etiketi; verilmezse sözlükten `admin.dataTable.labels.expand` anahtarıyla alınır.
  - `totalLabel`: `string` — Toplam kayıt sayısı etiketi; verilmezse sözlükten `admin.dataTable.pagination.total` anahtarıyla alınır.
  - `renderPageLabel`: `(page: number) => string` (varsayım — `DataTablePagination`'a prop olarak geçiliyor) — Sayfa numarası etiketini üreten fonksiyon.

**Dönüş**: `ReactNode` — Tablo kitinin tamamını içeren JSX ağacı. Okuma yetkisi yoksa `accessDeniedState` döner; aksi halde araç çubuğu, tablo (başlık, gövde, satırlar), sayfalama ve toplu işlem çubuğunu içeren bir `div` döner.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminTableCellClass
- import: ../../../utils/adminUi::adminTableContainerClass
- import: ../AdminSkeleton::AdminSkeleton
- import: ../ColumnsMenu::ColumnsMenu
- import: ../ColumnsMenu::type ColumnToggle
- import: ./DataTableHead::DataTableHead
- import: ./DataTablePagination::DataTablePagination
- import: ./persist::loadColumnVisibility
- import: ./persist::loadDensity
- import: ./persist::saveColumnVisibility
- import: ./persist::saveDensity
- import: ./types::type { AdminColumn }
- import: @/hooks/useAdminTable::type { UseAdminTableResult }
- import: @/i18n/I18nProvider::useI18n
- import: @/types/admin-shared::type { Density }
- import: lucide-react::ChevronRight
- import: next/link::Link
- import: react::Fragment
- import: react::type { ReactNode }
- import: react::useEffect
- import: react::useMemo
- import: react::useState

---

## INTERFACES

### DataTableKitProps
- `columns: AdminColumn<T>[]`
- `table: UseAdminTableResult<T>`
- `rowId: (r: T) => string`
- `persistKey: string`
- `hasWriteAccess: boolean`
- `hasReadAccess?: boolean`
- `emptyState: ReactNode`
- `filterEmptyState: ReactNode`
- `accessDeniedState?: ReactNode`
- `errorLabel?: ReactNode`
- `rowHref?: (row: T) => string`
- `onRowClick?: (row: T) => void`
- `renderExpandedRow?: (row: T) => ReactNode`
- `toolbarSlot?: ReactNode`
- `bulkBarSlot?: ReactNode`
- `columnsButtonLabel?: string`
- `selectAllLabel?: string`
- `rowSelectLabel?: string`
- `expandLabel?: string`
- `totalLabel?: ReactNode`
- `renderPageLabel?: (page: number, pageCount: number) => ReactNode`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::DataTableKit
- **params**: `props: DataTableKitProps<T>`
- **ic_degiskenler**:
  - `columns` — props'tan destruct edilen, tablo sütun tanımlarını içeren dizi
  - `table` — UseAdminTableResult tipinde, tablonun tüm durumunu (sayfalama, sıralama, seçim, filtreleme, yükleme, hata) yöneten nesne
  - `rowId` — her satır verisinden benzersiz bir string ID çıkaran fonksiyon
  - `persistKey` — sütun görünürlüğü ve yoğunluk ayarlarını localStorage'da saklamak için kullanılan anahtar string
  - `hasWriteAccess` — yazma yetkisi olup olmadığını belirten boolean; satır seçilebilirliğini (`selectable`) belirler
  - `hasReadAccess` — okuma yetkisi; varsayılanı `true`; `false` ise `accessDeniedState` gösterilir
  - `emptyState` — tablo satır içermezken ve filtre aktif değilken gösterilecek ReactNode
  - `filterEmptyState` — filtre aktifken sonuç yokken gösterilecek ReactNode
  - `accessDeniedState` — okuma yetkisi yokken gösterilecek ReactNode
  - `errorLabel` — tablo hata durumundayken gösterilecek metin; yoksa `t('admin.dataTable.states.error')` kullanılır
  - `rowHref` — satır verisinden link URL'si üreten fonksiyon; ilk görünür sütundaki hücre içeriğini `<Link>` ile sarar
  - `onRowClick` — satıra tıklandığında çağrılan fonksiyon; varsa satır `cursor-pointer` ve `role="button"` olur
  - `renderExpandedRow` — genişletilmiş satırı render eden fonksiyon; varsa her satırda genişletme butonu gösterilir
  - `toolbarSlot` — tablonun üstüne yerleştirilen araç çubuğu ReactNode'u
  - `bulkBarSlot` — tablonun altına yerleştirilen toplu işlem çubuğu ReactNode'u
  - `columnsButtonLabel` — ColumnsMenu bileşenindeki buton etiketi
  - `selectAllLabel` — tüm satırları seç checkbox'ının aria-label'ı; yoksa `t('admin.dataTable.labels.selectAll')` kullanılır
  - `rowSelectLabel` — tek satır seç checkbox'ının aria-label'ı; yoksa `t('admin.dataTable.labels.rowSelect')` kullanılır
  - `expandLabel` — genişletme butonunun aria-label'ı; yoksa `t('admin.dataTable.labels.expand')` kullanılır
  - `totalLabel` — toplam kayıt sayısı etiketi; yoksa `t('admin.dataTable.pagination.total')` kullanılır
  - `renderPageLabel` — sayfalama bileşenine geçirilen sayfa etiketi render fonksiyonu
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `defaultVisibility` — useMemo ile hesaplanan, her `hideable` sütun için varsayılan görünürlük haritası (`c.defaultHidden` tersi)
  - `visibleCols` — state; sütun anahtarlarından boolean görünürlük haritası; başlangıç değeri `loadColumnVisibility(persistKey, defaultVisibility)` ile yüklenir
  - `setVisibleCols` — `visibleCols` state setter fonksiyonu
  - `density` — state; tablo yoğunluğu (`Density` tipi); başlangıç değeri `loadDensity(persistKey)` ile yüklenir
  - `setDensity` — `density` state setter fonksiyonu
  - `visibleKeys` — useMemo ile hesaplanan `Set<string>`; `hideable` olmayan sütunlar her zaman dahil, `hideable` olanlar `visibleCols[c.key] !== false` koşulunu sağlıyorsa dahil
  - `visibleColumns` — useMemo ile hesaplanan, `visibleKeys` set'inde bulunan anahtarlara sahip sütunların filtrelenmiş dizisi
  - `columnToggles` — useMemo ile hesaplanan `ColumnToggle[]`; her `hideable` sütun için `key`, `label`, `checked` ve `onChange` içeren nesneler dizisi
  - `expanded` — state; genişletilmiş satır ID'lerini tutan `Set<string>`
  - `setExpanded` — `expanded` state setter fonksiyonu
  - `toggleExpand` — verilen `id` string'ini `expanded` set'inde ekleyip çıkaran fonksiyon
  - `selectable` — `hasWriteAccess` değerine eşit boolean; satır seçme checkbox'larının gösterilip gösterilmeyeceğini belirler
  - `expandable` — `typeof renderExpandedRow === 'function'` sonucu boolean; genişletme butonunun gösterilip gösterilmeyeceğini belirler
  - `colSpan` — `visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)` formülüyle hesaplanan tablo colspan değeri
  - `cellPad` — yoğunluk `compact` ise `'px-2 py-2'`, değilse boş string; hücre padding sınıfı
  - `firstVisibleKey` — `visibleColumns[0]?.key`; rowHref varsa ilk görünür sütundaki hücre içeriğini link yapmak için kullanılır
  - `page` — `table.pagination.page`; mevcut sayfa numarası
  - `pageCount` — `table.pagination.pageCount`; toplam sayfa sayısı
  - `setPage` — `table.pagination.setPage`; sayfa değiştirme fonksiyonu
- **Dönüş**: `ReactNode`

### [N2_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::defaultVisibility (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `d` — `Record<string, boolean>` tipinde boş nesne; `hideable` sütunların varsayılan görünürlüğünü toplar
  - `c` — `columns` dizisi üzerinde iterasyon yapılan her sütun nesnesi; `c.hideable` ve `c.defaultHidden` alanlarına erişilir
- **Dönüş**: `Record<string, boolean>` — sütun anahtarlarından varsayılan görünürlük haritası

### [N3_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::saveColumnVisibility (useEffect callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `persistKey` — dış scope'dan yakalanan, localStorage anahtarı
  - `visibleCols` — dış scope'dan yakalanan, mevcut sütun görünürlük haritası
- **Dönüş**: yok — yan etki: `saveColumnVisibility(persistKey, visibleCols)` çağrısı yapar

### [N4_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::saveDensity (useEffect callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `persistKey` — dış scope'dan yakalanan, localStorage anahtarı
  - `density` — dış scope'dan yakalanan, mevcut yoğunluk değeri
- **Dönüş**: yok — yan etki: `saveDensity(persistKey, density)` çağrısı yapar

### [N5_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::visibleKeys (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `s` — `Set<string>` tipinde boş küme; görünür sütun anahtarlarını toplar
  - `c` — `columns` dizisi üzerinde iterasyon yapılan her sütun nesnesi; `c.hideable`, `c.key` ve `visibleCols[c.key]` erişimi yapılır
- **Dönüş**: `Set<string>` — görünür sütun anahtarları kümesi

### [N6_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::columnToggles (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `columns` — dış scope'dan yakalanan sütun tanımları dizisi; `.filter((c) => c.hideable)` ile sadece gizlenebilir sütunlar alınır
  - `c` — filtrelenmiş sütunlar üzerinde map iterasyonu yapılan her sütun nesnesi; `c.key`, `c.header`, `visibleCols[c.key]` erişimi yapılır
  - `v` — onChange callback parametresi; yeni boolean görünürlük değeri
  - `prev` — setVisibleCols updater fonksiyonu parametresi; önceki görünürlük haritası
- **Dönüş**: `ColumnToggle[]` — her gizlenebilir sütun için `key`, `label`, `checked`, `onChange` içeren nesneler dizisi

### [N7_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::toggleExpand
- **params**: `id: string`
- **ic_degiskenler**:
  - `id` — genişletme durumu değiştirilecek satırın benzersiz ID'si
  - `prev` — setExpanded updater fonksiyonu parametresi; önceki genişletilmiş ID'ler set'i
  - `next` — `new Set(prev)` ile oluşturulan klon set; üzerinde ekleme/çıkarma yapılır
- **Dönüş**: yok — yan etki: `setExpanded` çağrısı ile `expanded` state güncellenir

### [N8_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::toggleExpand (setExpanded updater)
- **params**: `prev`
- **ic_degiskenler**:
  - `prev` — mevcut genişletilmiş ID'ler set'i
  - `next` — `new Set(prev)` ile oluşturulan klon set
  - `id` — dış scope'dan yakalanan, genişletme durumu değiştirilecek satır ID'si
- **Dönüş**: `Set<string>` — güncellenmiş genişletilmiş ID'ler set'i

### [N9_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::table.rows.map callback
- **params**: `row`
- **ic_degiskenler**:
  - `row` — tablo satır verisi; `rowId`, `col.cell`, `onRowClick`, `renderExpandedRow`, `rowHref` fonksiyonlarına geçirilir
  - `id` — `rowId(row)` sonucu; satırın benzersiz string ID'si
  - `selected` — `table.selection.isSelected(id)` sonucu; satırın seçili olup olmadığını belirten boolean
  - `isExpanded` — `expanded.has(id)` sonucu; satırın genişletilmiş olup olmadığını belirten boolean
  - `clickable` — `typeof onRowClick === 'function'` sonucu; satırın tıklanabilir olup olmadığını belirten boolean
- **Dönüş**: `ReactNode` — Fragment içinde satır tr elementi ve genişletilmiş satır (varsa)

### [N10_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::onKeyDown (satır klavye olayı)
- **params**: `e`
- **ic_degiskenler**:
  - `e` — klavye olayı nesnesi; `e.key` kontrol edilir, `e.preventDefault()` çağrılır
  - `row` — dış scope'dan yakalanan satır verisi; `onRowClick(row)` çağrısına geçirilir
- **Dönüş**: yok — yan etki: Enter veya Space tuşunda `onRowClick(row)` çağrısı yapar

### [N11_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::checkbox onClick
- **params**: `e`
- **ic_degiskenler**:
  - `e` — MouseEvent nesnesi; `e.stopPropagation()` ve `e.shiftKey` kullanılır
  - `id` — dış scope'dan yakalanan satır ID'si; `table.selection.toggle` çağrısına geçirilir
- **Dönüş**: yok — yan etki: `e.stopPropagation()` çağrısı yapar ve `table.selection.toggle(id, { shiftKey: e.shiftKey })` çağrısı ile satır seçim durumunu değiştirir

### [N12_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::expand button onClick
- **params**: `e`
- **ic_degiskenler**:
  - `e` — MouseEvent nesnesi; `e.stopPropagation()` kullanılır
  - `id` — dış scope'dan yakalanan satır ID'si; `toggleExpand(id)` çağrısına geçirilir
- **Dönüş**: yok — yan etki: `e.stopPropagation()` çağrısı yapar ve `toggleExpand(id)` ile genişletme durumunu değiştirir

### [N13_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::visibleColumns.map callback
- **params**: `col`
- **ic_degiskenler**:
  - `col` — görünür sütun nesnesi; `col.align`, `col.key`, `col.cell`, `col.cellClassName` alanlarına erişilir
  - `alignClass` — `col.align` değerine göre `'text-right'`, `'text-center'` veya `'text-left'` CSS sınıfı
  - `rendered` — `col.cell(row)` sonucu; hücrenin render edilmiş içeriği
  - `content` — `rowHref` varsa ve `col.key === firstVisibleKey` ise `<Link>` ile sarılmış `rendered`, değilse `rendered`
  - `row` — dış scope'dan yakalanan satır verisi; `col.cell` ve `rowHref` fonksiyonlarına geçirilir
  - `rowHref` — dış scope'dan yakalanan satır link fonksiyonu; `rowHref(row)` çağrısı yapılır
  - `firstVisibleKey` — dış scope'dan yakalanan ilk görünür sütun anahtarı; link sarmalama koşulunda kullanılır
- **Dönüş**: `ReactNode` — `<td>` elementi; sınıf adları `adminTableCellClass`, `cellPad`, `alignClass`, `col.cellClassName` birleşiminden oluşur

---

## NODE ID STANDARD

  file: src\components\admin\data-table\DataTableKit.tsx
  function: src\components\admin\data-table\DataTableKit.tsx::DataTableKit

---

## DISA AKTARILANLAR (EXPORTS)
  export: DataTableKit
  export: DataTableKitProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-danger`, `bg-admin-danger-weak`, `bg-admin-surface-2`, `border-admin-border`, `border-b`, `hover:bg-admin-surface-2`, `hover:text-admin-accent`, `hover:text-admin-fg`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg-muted`, `text-center`, `text-xs`
- **Layout:** `block`, `custom-scrollbar`, `flex`, `flex-wrap`, `gap-2`, `gap-3`, `h-1.5`, `h-4`, `h-6`, `items-center`, `justify-between`, `justify-center`, `justify-end`, `overflow-x-auto`, `p-0`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminTableCellClass`, `${alignClass`, `${cellPad`, `${clickable`, `${col.cellClassName`, `:`, `content-auto-table`, `cursor-pointer`, `divide-admin-border`, `divide-y`, `duration-300`, `focus-visible:ring-admin-accent/30`, `focus-visible:ring-offset-0`, `font-bold`