---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t137\src\components\admin\data-table\DataTableKit.tsx
skeleton_hash: 2b9fd167ab8ad383
entity_hashes:
  func:DataTableKit: 9d029f93373fe873
  overview: b868e3edab37a5c7
  style_tokens: db6fc579bfa7b43f
generated_at: 2026-08-26T18:39:44Z
---

## Genel Bakış
DataTableKit, admin panelinde kullanılan generic bir veri tablosu bileşenidir. Farklı veri tipleriyle çalışabilecek şekilde tasarlanmış olup, aldığı proplar aracılığıyla yapılandırılabilir bir veri tablosu arayüzü sunar. Bileşen, veri tablosunun yönetim mantığını tek bir "kit" altında birleştiren üst düzey bir React fonksiyonudur.

## Fonksiyon Grupları

### Ana Bileşen
Veri tablosunun ana render sorumluluğunu üstlenir. Generic tip parametresi sayesinde farklı veri yapılarıyla uyumlu çalışabilir şekilde tasarlanmış olup, kolon görünürlüğü ve yoğunluk gibi ayarları yönetir.
- DataTableKit

## Bağımlılıklar

**İç Bağımlılıklar:** Modülde yalnızca tek bir fonksiyon tanımlı olduğundan, modül içi fonksiyon çağrısı bulunmamaktadır. Bileşenin alt bileşenleri veya yardımcı araçları dışarıdan import edip etmediği mevcut kaynak bilgisinden bilinmemektedir.

**Dış Bağımlılıklar:** DataTableKitProps tipi, bileşenin kabul ettiği propları tanımlayan bir arayüzdür. Bu tipin hangi alanları içerdiği mevcut kaynak bilgisinden bilinmemektedir.

**Mimari Not:** Bileşen, `admin/data-table` dizin yapısı altında konumlandığından, admin modülüne ait veri tablosu işlevselliğini modüler bir şekilde sunan bir kit parçası olarak değerlendirilebilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmediğinden, `DataTableKit` bileşeninin çalışma mantığı, koşulları ve bağımlılıkları hakkında fonksiyon gövdesine dayalı bir varsayım üretilememektedir. Mevcut bilgi yalnızca fonksiyon imzasından (`props: DataTableKitProps<T> -> ReactNode`) ibaret olup, bu da genel TypeScript/React sözleşme bilgisidir; modül özelinde bir aksiyom niteliği taşımaz.

---

## FONKSİYON DETAYLARI

### DataTableKit
**Ne yapar**: Genel amaçlı bir veri tablosu bileşenidir. Kolon görünürlüğü, yoğunluk (density), satır seçimi, satır genişletme, sıralama, sayfalama ve filtreleme gibi masaüstü uygulamalarına özgü tablo özelliklerini tek bir bileşen altında birleştirir. Kolon görünürlüğü ve yoğunluk tercihlerini `persistKey` aracılığıyla yerel depolamada (localStorage) kalıcı hale getirir. Okuma yetkisi yoksa `accessDeniedState` görüntüler; yazma yetkisi varsa satır seçimi (checkbox) ve toplu işlem çubuğu (bulk bar) etkinleşir.

**Nasıl yapar**: Bileşen generic bir yapıya sahiptir (`<T>`) ve `DataTableKitProps<T>` tipinde props alır. İlk olarak `useI18n()` hook'u ile uluslararasılaştırma fonksiyonunu (`t`) alır. Kolon görünürlüğü, `columns` dizisindeki `hideable` ve `defaultHidden` alanlarına göre bir varsayılan harita oluşturur ve `loadColumnVisibility` fonksiyonuyla (persistKey kullanarak) localStorage'dan yükler; değişikliklerde `saveColumnVisibility` ile kaydeder. Yoğunluk (density) aynı şekilde `loadDensity`/`saveDensity` fonksiyonlarıyla yönetilir. Görünür kolonlar, `hideable` olmayanlar her zaman dahil edilerek ve `visibleCols` haritasına göre filtrelenerek hesaplanır. `columnToggles` dizisi, her gizlenebilir kolon için bir toggle nesnesi (key, label, checked, onChange) üretir ve `ColumnsMenu` bileşenine aktarılır. Genişletilebilir satırlar için `expanded` adında bir `Set<string>` tutulur; `toggleExpand` fonksiyonu satır kimliğini bu sete ekler veya çıkarır. `selectable` durumu `hasWriteAccess` prop'una, `expandable` durumu `renderExpandedRow` prop'unun bir fonksiyon olup olmadığına bağlıdır. `colSpan` değeri görünür kolon sayısı + seçilebilirlik sütunu + genişletme sütunu olarak hesaplanır. Yoğunluk `compact` ise hücre padding'i daraltılır. `hasReadAccess === false` olduğunda bileşen erken dönüş yaparak `accessDeniedState` render eder. Tablo gövdesinde üç durum ele alınır: yükleme sırasında iskelet (skeleton) gösterilir, satır yoksa aktif filtrelere göre `filterEmptyState` veya `emptyState` gösterilir, satır varsa her satır için seçim checkbox'ı, genişletme butonu ve görünür kolon hücreleri render edilir. İlk görünür kolondaki hücre, `rowHref` tanımlıysa bir `Link` bileşeniyle sarılır. Genişletilmiş satırlar, `renderExpandedRow` fonksiyonu çağrılarak ayrı bir `<tr>` içinde gösterilir. Sayfalama, tablonun altında `DataTablePagination` bileşeniyle render edilir (admin-standard.md §3/4 kuralına uygun olarak). Bileşen, `toolbarSlot` ve `bulkBarSlot` slot prop'larıyla üst ve alt kısımlara özel içerik eklenmesine olanak tanır. Erişilebilirlik için tıklanabilir satırlara `role="button"`, `tabIndex={0}` ve klavye olayları (`Enter`, `Space`) eklenir; checkbox'lara ve genişletme butonlarına `aria-label` atanır.

**Parametreler**:
- props: `DataTableKitProps<T>` — Bileşenin tüm yapılandırma ve davranışlarını tanımlayan props nesnesi. Aşağıdaki alt alanları içerir:
  - columns: `Column<T>[]` — Tablonun kolon tanımları dizisi. Her kolon `key`, `header`, `cell`, `hideable`, `defaultHidden`, `align`, `cellClassName` gibi alanlar içerir.
  - table: `TableState<T>` — Tablonun tüm durumunu (sayfalama, sıralama, seçim, filtreleme, yükleme durumu, satırlar, hata, toplam eşleşme sayısı) içeren nesne.
  - rowId: `(row: T) => string` — Her satır için benzersiz bir kimlik döndüren fonksiyon.
  - persistKey: `string` — Kolon görünürlüğü ve yoğunluk tercihlerinin yerel depolamada saklanması için kullanılan benzersiz anahtar.
  - hasWriteAccess: `boolean` — Yazma yetkisi olup olmadığını belirtir. `true` olduğunda satır seçimi (checkbox) ve toplu işlem çubuğu etkinleşir.
  - hasReadAccess: `boolean` — Okuma yetkisi olup olmadığını belirtir. Varsayılan değeri `true`'dur. `false` olduğunda bileşen `accessDeniedState` görüntüler ve tabloyu render etmez.
  - emptyState: `ReactNode` — Tabloda hiç satır olmadığında ve aktif filtre yokken gösterilecek içerik.
  - filterEmptyState: `ReactNode` — Tabloda hiç satır olmadığında ve aktif filtreler varken gösterilecek içerik.
  - accessDeniedState: `ReactNode` — Okuma yetkisi olmadığında gösterilecek içerik.
  - errorLabel: `string` — Tablo hata durumunda gösterilecek metin. Tanımlanmamışsa `t('admin.dataTable.states.error')` kullanılır.
  - rowHref: `((row: T) => string) | undefined` — Her satır için bir bağlantı (link) URL'i döndüren fonksiyon. Tanımlıysa ilk görünür kolonun hücresi bir `Link` bileşeniyle sarılır.
  - onRowClick: `((row: T) => void) | undefined` — Satıra tıklandığında çağrılan fonksiyon. Tanımlıysa satırlar tıklanabilir hale gelir (cursor-pointer, role="button", klavye desteği).
  - renderExpandedRow: `((row: T) => ReactNode) | undefined` — Genişletilmiş satır içeriğini render eden fonksiyon. Tanımlıysa her satırda genişletme butonu (chevron) görünür.
  - toolbarSlot: `ReactNode` — Tablonun üst kısmına yerleştirilecek özel araç çubuğu içeriği.
  - bulkBarSlot: `ReactNode` — Tablonun alt kısmına yerleştirilecek toplu işlem çubuğu içeriği.
  - columnsButtonLabel: `string` — Kolon menüsü butonunun etiketi.
  - selectAllLabel: `string` — "Tümünü seç" checkbox'ının erişilebilirlik etiketi. Tanımlanmamışsa `t('admin.dataTable.labels.selectAll')` kullanılır.
  - rowSelectLabel: `string` — Satır seçim checkbox'ının erişilebilirlik etiketi. Tanımlanmamışsa `t('admin.dataTable.labels.rowSelect')` kullanılır.
  - expandLabel: `string` — Genişletme butonunun erişilebilirlik etiketi. Tanımlanmamışsa `t('admin.dataTable.labels.expand')` kullanılır.
  - totalLabel: `string` — Toplam kayıt sayısı etiketi. Tanımlanmamışsa `t('admin.dataTable.pagination.total')` kullanılır.
  - renderPageLabel: `(page: number) => string` — Sayfa numarası için erişilebilirlik etiketi üreten fonksiyon. `DataTablePagination` bileşenine aktarılır.

**Dönüş**: `ReactNode` — Tam veri tablosu arayüzünü (toolbar, hata mesajı, toplam bilgisi, kolon menüsü, tablo başlığı, tablo gövdesi, sayfalama, toplu işlem çubuğu) içeren bir React bileşen ağacı döndürür. Okuma yetkisi yoksa `accessDeniedState` döndürür.

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