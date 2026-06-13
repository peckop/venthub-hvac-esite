---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\data-table\DataTableKit.tsx
skeleton_hash: bf0ca86b6ef331f9
entity_hashes:
  func:DataTableKit: b347880aa55601d4
  overview: d2067d408f32c534
  style_tokens: 9dee7412768159f1
generated_at: 2026-06-13T15:00:37Z
---

## Genel Bakış

DataTableKit, admin panelinde kullanılan modüler ve özelleştirilebilir bir tablo bileşenidir. Veri tablolarını tutarlı bir şekilde göstermek için gerekli tüm alt bileşenleri (başlıklar, satırlar, filtreler vb.) bir araya getirerek tek bir entegre arayüz sunar.

## Fonksiyon Grupları

### Ana Bileşen
- **DataTableKit** — Modülün tek ve ana ihracatıdır. Veri, sütun tanımları ve çeşitli konfigürasyon opsiyonlarını alarak eksiksiz bir veri tablosu render eder. Tüm tablo mantığını ve yapılandırma yönetimini üst düzeyde koordine eder.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari varsayımlar, yalnızca sağlanan fonksiyon imzasından çıkarılabilen minimum gereksinimleri içermektedir. `DataTableKitProps<T>` tipinin内部 yapısı bilinmediği için, prop-zorunluluk aksiyomları üretilememiştir.

**[Aksiyom 1]**: Eğer `DataTableKitProps<T>` tipi tanımlı ve erişilebilir değilse, bu modül TypeScript derleme aşamasında hata verir ve hiçbir şekilde kullanılamaz.

**[Aksiyom 2]**: Eğer generic tip parametresi `T` çağrı noktasında doğru bir şekilde belirtilmemişse veya `T`'nin karşılık geldiği veri yapısı uygun değilse, bileşen beklenmeyen veri tipleriyle karşılaşır ve runtime hataları oluşur.

**[Aksiyom 3]**: Eğer `props` parametresi olarak `undefined` veya `null` geçilirse (React bileşen çağrım kurallarının ihlali), bileşen render sırasında hata verir.

---

> **Not:** `DataTableKitProps<T>` tip tanımı, modül sabitleri ve fonksiyon gövdesi sağlandığında, sütun tanımları, veri kaynakları, sayfalama eşik değerleri, filtreme zorunlulukları gibi detaylı mimari varsayımlar eklenebilir.

---

## FONKSİYON DETAYLARI

### DataTableKit
**Ne yapar**: Yönetici panelinde kullanılan gelişmiş veri tablosu bileşenidir. Generik bir yapı ile çalışarak her türlü veri türü için tekrar kullanılabilir bir tablo sunar. Kolon görünürlüğü, satır yoğunluğu, sayfalama, sıralama, filtreleme, çoklu seçim ve satır genişletme gibi özellikleri tek bir bileşende merkezi olarak yönetir.

**Nasıl yapar**: Bileşen, `useMemo` ile kolon görünürlük durumlarını hesaplar ve `useState` ileVisible kolonları, yoğunluk ayarını ve genişletilmiş satır durumlarını tutar. `persistKey` prop'u ile `loadColumnVisibility`, `saveColumnVisibility`, `loadDensity` ve `saveDensity` fonksiyonlarını kullanarak kullanıcı tercihlerini localStorage'a kaydeder. `useEffect` hook'ları ile bu durumlar değiştiğinde otomatik kayıt işlemi gerçekleşir. Bileşen, `hasReadAccess` false ise erişim reddedildi durumunu gösterir, ardından `table` objesinden pagination, sorting, selection ve filtering durumlarını kullanarak tabloyu render eder. Kolon genişletme mantığı, `expanded` state'indeki bir Set yapısı ile satır bazlı olarak yönetilir.

**Parametreler**:
- props: `DataTableKitProps<T>` — Tablo bileşeninin tüm konfigürasyon ve veri ihtiyaçlarını içeren ana props nesnesi. Generik `T` tipi, tablodaki satır verilerinin tipini temsil eder.

**DataTableKitProps<T> Detayı**:
- columns: `Column<T>[]` — Tabloda gösterilecek kolon tanımları dizisi. Her kolon `key`, `header`, `cell` render fonksiyonu, `hideable`, `defaultHidden`, `align` ve `cellClassName` gibi özelliklere sahiptir.
- table: `UseTableReturn<T>` — Tablonun tüm durumlarını (satırlar, pagination, sorting, selection, filtering, isLoading, error, totalMatched) içeren_HOOK benzeri bir döndürme sonucu.
- rowId: `(row: T) => string` — Her satır için benzersiz bir ID üretmek için kullanılan fonksiyon.
- persistKey: `string` — Kolon görünürlüğü ve yoğunluk ayarlarının localStorage'da saklanacağı benzersiz anahtar.
- hasWriteAccess: `boolean` — Kullanıcının yazma yetkisi olup olmadığını belirtir. true ise satır seçimi aktif olur.
- hasReadAccess: `boolean = true` — Kullanıcının okuma yetkisi olup olmadığını belirtir. false ise tablo yerine erişim reddedildi durumu gösterilir.
- emptyState: `ReactNode` — Tabloda veri olduğunda filtre sonucu boşsa gösterilecek durum bileşeni.
- filterEmptyState: `ReactNode` — Aktif filtreler olduğunda sonuç bulunamadığında gösterilecek durum bileşeni.
- accessDeniedState: `ReactNode` — Okuma yetkisi olmadığında gösterilecek durum bileşeni.
- errorLabel: `string` — Tablodaki hata durumu için gösterilecek etiket metni.
- rowHref: `(row: T) => string` — Satır tıklandığında gidilecek URL'yi döndüren fonksiyon. Belirtildiğinde ilk görünür kolon link haline gelir.
- onRowClick: `(row: T) => void` — Satır tıklandığında tetiklenen geri çağırma fonksiyonu.
- renderExpandedRow: `(row: T) => ReactNode` — Genişletme durumunda satır altında gösterilecek içeriği üreten fonksiyon.
- toolbarSlot: `ReactNode` — Tablonun üst kısmına yerleştirilecek araç çubuğu slotu.
- bulkBarSlot: `ReactNode` — Toplu işlem için seçili satırlarla gösterilecek alt bar slotu.
- columnsButtonLabel: `string` — Kolon ayarları menüsü butonunun etiketi.
- selectAllLabel: `string = 'Tümünü seç'` — Tümünü seç onay kutusunun erişilebilirlik etiketi.
- rowSelectLabel: `string = 'Satırı seç'` — Satır seçim onay kutusunun erişilebilirlik etiketi.
- expandLabel: `string = 'Satır detayını aç/kapat'` — Genişletme butonunun erişilebilirlik etiketi.
- totalLabel: `string` — Toplam kayıt sayısının yanına gösterilecek etiket.
- renderPageLabel: `(page: number, pageCount: number) => string` — Sayfalama göstergesi için özel format fonksiyonu.

**Dönüş**: `ReactNode` — Render edilmiş tam bir tablo bileşeni döndürür. Tablo, araç çubuğu, üst bilgi çubuğu, tablo başlığı, satırlar ve toplu işlem barından oluşur.

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
- **params**: (props: DataTableKitProps<T>)
- **ic_degiskenler**:
  - `columns` — props'tan gelen kolon tanımları dizisi
  - `table` — useAdminTable hook'undan gelen tablo state ve metodları
  - `rowId` — satır benzersiz ID'sini oluşturan fonksiyon
  - `persistKey` — localStorage anahtarı için benzersiz key
  - `hasWriteAccess` — yazma yetkisi boolean
  - `hasReadAccess` — okuma yetkisi boolean (varsayılan: true)
  - `emptyState` — veri yokken gösterilecek JSX
  - `filterEmptyState` — filtre sonucu boşsa gösterilecek JSX
  - `accessDeniedState` — yetki yokken gösterilecek JSX
  - `errorLabel` — hata mesajı etiketi
  - `rowHref` — satır için URL oluşturan fonksiyon
  - `onRowClick` — satır tıklama handler'ı
  - `renderExpandedRow` — genişletilmiş satır içeriği render fonksiyonu
  - `toolbarSlot` — toolbar slot'u JSX
  - `bulkBarSlot` — toplu işlem bar slot'u JSX
  - `columnsButtonLabel` — kolon menüsü buton etiketi
  - `selectAllLabel` — tümünü seç etiketi (varsayılan: 'Tümünü seç')
  - `rowSelectLabel` — satır seç etiketi (varsayılan: 'Satırı seç')
  - `expandLabel` — genişletme butonu etiketi (varsayılan: 'Satır detayını aç/kapat')
  - `totalLabel` — toplam etiketi
  - `renderPageLabel` — sayfa numarası render fonksiyonu
  - `defaultVisibility` — useMemo ile hesaplanan varsayılan kolon görünürlük haritası
  - `visibleCols` — useState ile yönetilen görünür kolon haritası
  - `density` — useState ile yönetilen tablo yoğunluk modu
  - `visibleKeys` — useMemo ile hesaplanan görünür kolon anahtarları seti
  - `visibleColumns` — useMemo ile filtrelenen görünür kolonlar dizisi
  - `columnToggles` — useMemo ile oluşturulan kolon açma/kapama toggle'ları dizisi
  - `expanded` — useState ile yönetilen genişletilmiş satır ID'leri seti
  - `selectable` — hasWriteAccess değerine eşit boolean
  - `expandable` — renderExpandedRow fonksiyon olup olmadığı boolean
  - `colSpan` — tablo sütun genişliği hesaplaması
  - `cellPad` — yoğunluğa göre hücre padding class'ı
  - `firstVisibleKey` — ilk görünür kolonun anahtarı
  - `page` — mevcut sayfa numarası
  - `pageCount` — toplam sayfa sayısı
  - `setPage` — sayfa değiştirme fonksiyonu
  - `id` — her satır için rowId(row) ile hesaplanan benzersiz ID
  - `selected` — satırın seçili olup olmadığı boolean
  - `isExpanded` — satırın genişletilmiş olup olmadığı boolean
  - `clickable` — onRowClick fonksiyon olup olmadığı boolean
- **Dönüş**: ReactNode

### [N2_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::defaultVisibility_useMemo
- **params**: ()
- **ic_degiskenler**:
  - `d` — Record<string, boolean> tipinde boş harita, görünür kolon haritası
- **Dönüş**: Record<string, boolean>

### [N3_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::useEffect_saveColumnVisibility
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::useEffect_saveDensity
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::visibleKeys_useMemo
- **params**: ()
- **ic_degiskenler**:
  - `s` — Set<string> tipinde boş set, görünür kolon anahtarları
- **Dönüş**: Set<string>

### [N6_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::visibleColumns_useMemo
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: columns dizisinin filtrelenmiş hali

### [N7_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::columnToggles_useMemo
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: ColumnToggle[] dizisi

### [N8_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::columnToggles_map
- **params**: (c: Column)
- **ic_degiskenler**: yok
- **Dönüş**: ColumnToggle objesi

### [N9_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::toggleExpand
- **params**: (id: string)
- **ic_degiskenler**:
  - `prev` — mevcut expanded set'inin öncesi
  - `next` — güncellenmiş expanded set'i
- **Dönüş**: void

### [N10_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::table_rows_map
- **params**: (row)
- **ic_degiskenler**:
  - `id` — rowId(row) ile hesaplanan benzersiz satır ID'si
  - `selected` — table.selection.isSelected(id) ile hesaplanan seçim durumu
  - `isExpanded` — expanded.has(id) ile hesaplanan genişletme durumu
  - `clickable` — typeof onRowClick === 'function' kontrolü
  - `alignClass` — col.align değerine göre hizalama CSS class'ı
  - `rendered` — col.cell(row) ile render edilen hücre içeriği
  - `content` — rowHref ve ilk görünür kolon kontrolüne göre Link ile sarılmış veya doğrudan içerik
- **Dönüş**: Fragment içinde tr elementi

### [N11_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::onKeyDown_handler
- **params**: (e)
- **ic_degiskenler**: yok
- **Dönüş**: yok

### [N12_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::checkbox_onClick_handler
- **params**: (e)
- **ic_degiskenler**: yok
- **Dönüş**: yok

### [N13_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::expandButton_onClick_handler
- **params**: (e)
- **ic_degiskenler**: yok
- **Dönüş**: yok

### [N14_NASIL] AST Pointer: src/components/admin/data-table/DataTableKit.tsx::visibleColumns_map
- **params**: (col)
- **ic_degiskenler**:
  - `alignClass` — col.align değerine göre hizalama CSS class'ı
  - `rendered` — col.cell(row) ile render edilen hücre içeriği
  - `content` — rowHref ve ilk görünür kolon kontrolüne göre Link ile sarılmış veya doğrudan içerik
- **Dönüş**: td elementi

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
- **Renkler:** `bg-cyan-400/10`, `bg-cyan-400/5`, `bg-rose-500`, `bg-rose-500/10`, `bg-white/1`, `bg-white/5`, `border-b`, `border-white/10`, `border-white/5`, `hover:bg-white/2`, `hover:bg-white/5`, `hover:text-cyan-400`, `hover:text-slate-200`, `hover:text-white`, `text-center`
- **Layout:** `block`, `custom-scrollbar`, `flex`, `gap-2`, `h-1.5`, `h-4`, `h-6`, `h-8`, `items-center`, `justify-between`, `justify-center`, `overflow-x-auto`, `p-0`, `p-4`, `w-1.5`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminTableCellClass`, `${alignClass`, `${cellPad`, `${clickable`, `${col.cellClassName`, `:`, `border`, `content-auto-table`, `cursor-pointer`, `disabled:cursor-not-allowed`, `disabled:opacity-30`, `divide-white/5`, `divide-y`, `duration-300`