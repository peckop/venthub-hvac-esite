---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\admin\data-table\DataTableKit.tsx
skeleton_hash: f3b0ebf28a23834d
entity_hashes:
  func:DataTableKit: e714f69d9f2449b2
  overview: a2c088a7cccc7fb9
  style_tokens: 5a324826484cf67f
generated_at: 2026-08-25T07:26:28Z
---

## Genel Bakış
DataTableKit, admin panelinde kullanılan bir veri tablosu bileşenidir. Generic bir yapıya sahip olup, farklı veri tipleriyle çalışabilecek şekilde tasarlanmıştır. Bileşen, aldığı proplar aracılığıyla yapılandırılabilir bir veri tablosu arayüzü sunar.

## Fonksiyon Grupları

### Ana Bileşen
Veri tablosunun ana render sorumluluğunu üstlenir. Generic tip parametresi sayesinde farklı veri yapılarıyla uyumlu çalışabilir şekilde tasarlanmıştır.
- DataTableKit

## Bağımlılıklar

**İç Bağımlılıklar:** Verilen kaynakta başka fonksiyon tanımlanmadığından, modül içi fonksiyon çağrısı bulunmamaktadır. Bileşen, muhtemelen alt bileşenleri ve yardımcı araçları dışarıdan import ediyor olabilir ancak bu bilgi mevcut kaynakta yer almamaktadır.

**Dış Bağımlılıklar:** DataTableKitProps tipi, bileşenin kabul ettiği propları tanımlayan bir arayüzdür. Bu tipin neler içerdiği mevcut kaynak bilgisinden bilinmemektedir.

**Mimari Not:** Bileşen, `admin/data-table` dizin yapısı altında konumlandığından, admin modülüne ait veri tablosu işlevselliğini modüler bir şekilde sunan bir kit parçası olarak değerlendirilebilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediğinden, gövdeden çıkarım yapılabilecek bir koşul bulunmamaktadır. Yalnızca fonksiyon imzası (`DataTableKit(props: DataTableKitProps<T>) -> ReactNode`) mevcut olup, imza tek başına çalıştırılabilir bir aksiyom üretmez.

---

## FONKSİYON DETAYLARI

### DataTableKit
**Ne yapar**: Veri tablosu bileşeninin tüm yönetim mantığını tek bir "kit" (set) altında birleştiren üst düzey React fonksiyonudur. Kolon görünürlüğü, yoğunluk (density), satır genişletme, sayfalama, seçim, sıralama ve erişim denetimi gibi tablonun tüm durumlarını koordine eder; toolbar, toplu işlem çubuğu, tablo başlığı, satır gövdesi ve durum ekranlarını (boş, filtre boş, hata, yetki reddi) bir arada render eder.

**Nasıl yapar**: Props'tan gelen `table` nesnesi üzerinden sıralama (`table.sorting`), seçim (`table.selection`), sayfalama (`table.pagination`), filtreleme (`table.filtering`) ve yükleme durumu (`table.isLoading`) gibi alt modüllere erişir. Kolon görünürlüğü ve yoğunluk tercihleri `persistKey` ile `localStorage`'a yazılır ve okunur; `useEffect` bağımlılıkları sayesinde her değişiklikte otomatik kaydedilir. `useMemo` ile görünür kolon anahtarları ve kolon toggle listesi hesaplanır; `hideable` olmayan kolonlar her zaman görünürdür, `defaultHidden` olanlar varsayılan olarak gizlidir. Satır genişletme durumu `expanded` adlı bir `Set<string>` ile yönetilir; `toggleExpand` fonksiyonu bu seti günceller. `hasReadAccess === false` olduğunda bileşen erken dönüş yaparak `accessDeniedState` görüntüler. Tablo gövdesinde üç durum ele alınır: yükleme sırasında iskelet (skeleton), satır yokken boş durum (filtre aktifse `filterEmptyState`, değilse `emptyState`), ve satırlar varken satır haritalama. Her satırda seçim kutusu (`selectable`), genişletme butonu (`expandable`) ve görünür kolonlar sırayla render edilir. İlk görünür kolonun hücresi `rowHref` tanımlıysa bir `Link` bileşeniyle sarmalanır. Sayfalama kontrolleri `pageCount > 1` koşulunda gösterilir; `renderPageLabel` prop'u ile sayfa etiketi özelleştirilebilir. `ColumnsMenu` bileşeni kolon görünürlük anahtarlarını ve yoğunluk seçimini sunar. `useI18n` hook'u ile uluslararasılaştırma desteği sağlanır; i18n etiketleri (`selectAllLabel`, `rowSelectLabel`, `expandLabel`, `totalLabel`) prop olarak geçilmezse sözlükten (`t()`) varsayılan değerler alınır — bu, eski sürümdeki ham Türkçe dizgi sorununu çözmek için tasarlanmıştır.

**Parametreler**:
- props: DataTableKitProps\<T\> — Tablonun tüm yapılandırma ve davranış tanımlarını içeren tek props nesnesi. Aşağıdaki alanlar bu nesneden destruct edilir:
  - columns: ColumnDef\<T\>[] — Tablonun tanımlı kolon dizisi. Her kolon `key`, `header`, `cell`, `hideable`, `defaultHidden`, `align`, `cellClassName` gibi alanlar içerir.
  - table: TableState\<T\> — Tablonun tüm durum nesnesi. `rows`, `totalMatched`, `isLoading`, `error`, `pagination` (`page`, `pageCount`, `setPage`), `sorting` (`sort`, `toggleSort`), `selection` (`isSelected`, `toggle`, `allSelected`, `toggleAll`), `filtering` (`hasActiveFilters`) alt nesnelerini barındırır.
  - rowId: (row: T) => string — Her satırı benzersiz şekilde tanımlayan kimlik üreten fonksiyon.
  - persistKey: string — Kolon görünürlüğü ve yoğunluk tercihlerinin `localStorage`'da saklanacağı anahtar.
  - hasWriteAccess: boolean — Yazma yetkisi olup olmadığını belirtir; `true` olduğunda satır seçim kutuları ve toplu işlem desteği aktif olur.
  - hasReadAccess: boolean — Okuma yetkisi olup olmadığını belirtir; `false` olduğunda `accessDeniedState` gösterilir. Varsayılan değeri `true`'dur.
  - emptyState: ReactNode — Tabloda hiç satır yokken ve filtre aktif değilken gösterilecek bileşen.
  - filterEmptyState: ReactNode — Tabloda hiç satır yokken ve filtre aktifken gösterilecek bileşen.
  - accessDeniedState: ReactNode — Okuma yetkisi reddedildiğinde gösterilecek bileşen.
  - errorLabel: string — Tablo hata durumunda gösterilecek metin; geçilmezse sözlükten `admin.dataTable.states.error` anahtarıyla alınır.
  - rowHref: ((row: T) => string) | undefined — Satırın ilk görünür hücresini tıklanabilir bağlantıya dönüştüren fonksiyon; tanımlıysa `Link` bileşeniyle sarmalanır.
  - onRowClick: ((row: T) => void) | undefined — Satıra tıklandığında çağrılan fonksiyon; tanımlıysa satır `cursor-pointer` ve `role="button"` ile erişilebilir hale gelir, Enter ve Space tuşlarıyla tetiklenebilir.
  - renderExpandedRow: ((row: T) => ReactNode) | undefined — Genişletilmiş satırın içeriğini üreten fonksiyon; tanımlıysa her satırda genişletme butonu gösterilir.
  - toolbarSlot: ReactNode — Tablonun üstüne yerleştirilecek özel toolbar içeriği.
  - bulkBarSlot: ReactNode — Tablonun altına yerleştirilecek toplu işlem çubuğu içeriği.
  - columnsButtonLabel: string — Kolon menüsü butonunun etiketi.
  - selectAllLabel: string — Tablo başlığındaki "tümünü seç" onay kutusunun erişilebilirlik etiketi; geçilmezse sözlükten `admin.dataTable.labels.selectAll` anahtarıyla alınır.
  - rowSelectLabel: string — Her satırdaki seçim onay kutusunun erişilebilirlik etiketi; geçilmezse sözlükten `admin.dataTable.labels.rowSelect` anahtarıyla alınır.
  - expandLabel: string — Her satırdaki genişletme butonunun erişilebilirlik etiketi; geçilmezse sözlükten `admin.dataTable.labels.expand` anahtarıyla alınır.
  - totalLabel: string — Sayfalama alanında gösterilen toplam kayıt etiketi; geçilmezse sözlükten `admin.dataTable.pagination.total` anahtarıyla alınır.
  - renderPageLabel: ((page: number, pageCount: number) => ReactNode) | undefined — Sayfa göstergesini özel olarak biçimlendiren fonksiyon; geçilmezse `"{page} / {pageCount}"` biçimi kullanılır.

**Dönüş**: ReactNode — Tablonun tüm alt bileşenlerini (toolbar, tablo konteyneri, hata bandı, sayfalama, tablo başlığı, satırlar, toplu işlem çubuğu) içeren bir React ağacı döndürür. `hasReadAccess === false` olduğunda doğrudan `accessDeniedState` döndürülür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminTableCellClass
- import: ../../../utils/adminUi::adminTableContainerClass
- import: ../AdminSkeleton::AdminSkeleton
- import: ../ColumnsMenu::ColumnsMenu
- import: ../ColumnsMenu::type ColumnToggle
- import: ./DataTableHead::DataTableHead
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

  file: DataTableKit.tsx
  function: DataTableKit.tsx::DataTableKit

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
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-danger`, `bg-admin-danger-weak`, `bg-admin-surface`, `bg-admin-surface-2`, `border-admin-border`, `border-b`, `hover:bg-admin-surface-2`, `hover:text-admin-accent`, `hover:text-admin-fg`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg-muted`, `text-center`, `text-xs`
- **Layout:** `block`, `custom-scrollbar`, `flex`, `flex-wrap`, `gap-2`, `gap-3`, `h-1.5`, `h-4`, `h-6`, `h-8`, `items-center`, `justify-between`, `justify-center`, `justify-end`, `overflow-x-auto`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminTableCellClass`, `${alignClass`, `${cellPad`, `${clickable`, `${col.cellClassName`, `:`, `border`, `content-auto-table`, `cursor-pointer`, `disabled:cursor-not-allowed`, `disabled:opacity-30`, `divide-admin-border`, `divide-y`, `duration-300`