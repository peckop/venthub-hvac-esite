---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\components\admin\data-table\DataTableHead.tsx
skeleton_hash: 18d160687b03df34
entity_hashes:
  func:DataTableHead: 761128fdd91393a8
  overview: ec0d58126eb09163
  style_tokens: 2e8cae3f9553f7ee
generated_at: 2026-08-27T04:11:19Z
---

## Genel Bakış
Bu modül, veri tablolarının başlık satırını oluşturan bir React bileşenidir. Bileşen, sütun başlıklarını ve sıralama durumunu yöneterek tablonun düzenini sağlar. Ayrıca, performans için dış bağımlılıkları dinamik olarak yükler.

## Fonksiyon Grupları
### Tablo Başlık Bileşeni
Tablonun başlık satırını oluşturarak sütun tanımlarını ve sıralama parametrelerini işler.
- DataTableHead

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi sağlanmadığından (yalnızca imza `DataTableHead(props: DataTableHeadProps<T>) -> ReactNode` mevcut), davranışsal varsayımlar çıkarılamaz. Aksiyomlar yalnızca fonksiyon gövdesinden türetilir.

---

## FONKSİYON DETAYLARI

### DataTableHead
**Ne yapar**: Veri tablosunun başlık satırını (`<thead>`) oluşturur. Her sütun için `aria-sort` erişilebilirlik özelliğini destekleyen sıralanabilir başlıklar sunar. Seçim (checkbox) ve genişletme sütunlarını koşullu olarak render eder.

**Nasıl yapar**: Props'tan gerekli değerleri çıkararak başlar. `compact` prop'una göre hücre dolgu (padding) sınıfı belirler. Ardından `<thead>` içinde bir `<tr>` oluşturur. `selectable` true ise, tüm satırları seçip kaldırmak için bir checkbox (`<input type="checkbox">`) ekler; bu checkbox'ın `checked` durumu `allSelected` prop'undan, `onChange` olayı `onToggleAll` prop'undan gelir. `expandable` true ise, genişletme satırları için görünür içeriği olmayan (`aria-hidden="true"`) boş bir `<th>` ekler. Sonrasında `columns` dizisini döngüye alır; her sütun için `visibleKeys` kümesinde bulunup bulunmadığını kontrol eder, bulunmuyorsa o sütunu atlar. Görünür sütunlar için sıralama durumunu hesaplar: `sort?.key` ile eşleşen sütun aktif kabul edilir ve `sort?.dir` değerine göre `aria-sort` niteliği `'ascending'` veya `'descending'` olarak atanır; eşleşmeyen sıralanabilir sütunlara `'none'` atanır; sıralanamayan sütunlarda `aria-sort` tanımsız kalır. Hizalama sınıfı `col.align` değerine göre belirlenir (`'right'` için `text-right`, `'center'` için `text-center`, diğerleri için `text-left`). Sıralanabilir sütunlar için bir `<button>` oluşturulur; butona tıklama olayı `onToggleSort(col.key)` çağrısını tetikler. Aktif sütunda sıralama yönüne göre yukarı (`▲`) veya aşağı (`▼`) ok simgesi gösterilir. Sıralanamayan sütunlar için doğrudan `col.header` metni render edilir. Son olarak, `col.headerHint` tanımlıysa bir `<InfoTooltip>` bileşeni eklenir; bu tooltip butonun kardeşi olarak konumlandırılmıştır çünkü iç içe `<button>` geçersiz HTML oluştururdu.

**Parametreler**:
- props: `DataTableHeadProps<T>` — Bileşenin tüm yapılandırma özelliklerini içeren nesne. Aşağıdaki alt alanları içerir:
  - columns: `Column<T>[]` — Tablo sütun tanımlarını içeren dizi. Her sütun `key`, `header`, `sortable`, `align`, `headerClassName`, `headerHint` gibi alanlara sahiptir.
  - visibleKeys: `Set<string>` — Görünür sütun anahtarlarını tutan küme. Bu kümede bulunmayan sütunlar başlık satırında gösterilmez.
  - sort: `{ key: string; dir: 'asc' | 'desc' } | undefined` — Mevcut sıralama durumu. Hangi sütunun hangi yönde sıralandığını belirtir; tanımsız ise sıralama yapılmamıştır.
  - onToggleSort: `(key: string) => void` — Sıralama başlığına tıklandığında çağrılan geri çağırım fonksiyonu. Tıklanan sütunun anahtarını parametre olarak alır.
  - selectable: `boolean` — Satır seçimi için checkbox sütunu gösterilip gösterilmeyeceğini belirler.
  - allSelected: `boolean` — Tüm satırların seçili olup olmadığını belirtir; checkbox'ın `checked` durumunu kontrol eder.
  - onToggleAll: `() => void` — "Tümünü seç/kaldır" checkbox'ı değiştirildiğinde çağrılan geri çağırım fonksiyonu.
  - expandable: `boolean` — Genişletme satırları için boş sütun gösterilip gösterilmeyeceğini belirler.
  - selectAllLabel: `string` — "Tümünü seç" checkbox'ı için erişilebilirlik etiketi (`aria-label`).
  - compact: `boolean` — Kompakt görünüm için daraltılmış dolgu (padding) kullanılıp kullanılmayacağını belirler.

**Dönüş**: `ReactNode` — Oluşturulan `<thead>` HTML elementini ve içindeki tüm alt bileşenleri içeren React düğümü.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminTableHeadCellClass
- import: ../InfoTooltip::InfoTooltip
- import: ./types::type { AdminColumn }
- import: @/hooks/useAdminTable::type { SortState }
- import: react::type { ReactNode }

---

## INTERFACES

### DataTableHeadProps
- `columns: AdminColumn<T>[]`
- `visibleKeys: Set<string>`
- `sort: SortState | null`
- `onToggleSort: (key: string) => void`
- `selectable: boolean`
- `allSelected: boolean`
- `onToggleAll: () => void`
- `expandable: boolean`
- `selectAllLabel: string`
- `compact: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/data-table/DataTableHead.tsx::DataTableHead
- **params**: `props: DataTableHeadProps<T>` — bileşenin tüm konfigürasyonunu taşır
- **ic_degiskenler**:
  - `columns` — props'tan destructure edilen, tablo sütun tanımlarını içeren dizi
  - `visibleKeys` — props'tan destructure edilen, görünür sütun anahtarlarını tutan Set
  - `sort` — props'tan destructure edilen, mevcut sıralama durumu (key ve dir içeren nesne veya undefined)
  - `onToggleSort` — props'tan destructure edilen, sütun sıralamasını değiştiren callback fonksiyon
  - `selectable` — props'tan destructure edilen, satır seçimi açık mı (boolean)
  - `allSelected` — props'tan destructure edilen, tüm satırlar seçili mi (boolean)
  - `onToggleAll` — props'tan destructure edilen, tüm satırları seçme/seçimi kaldırma callback'i
  - `expandable` — props'tan destructure edilen, satır genişletme özelliği açık mı (boolean)
  - `selectAllLabel` — props'tan destructure edilen, "tümünü seç" checkbox'ının aria-label metni
  - `compact` — props'tan destructure edilen, kompakt görünüm modu (boolean)
  - `pad` — compact true ise `'px-2 py-2'`, değilse boş string — hücre iç dolgu sınıfı
  - `col` — columns.map callback parametresi, her bir sütun tanımı nesnesi
  - `active` — `sort?.key === col.key` sonucu, bu sütunun aktif sıralama sütunu olup olmadığını belirten boolean
  - `ariaSort` — col.sortable true ise aktiflik durumuna göre `'ascending'` | `'descending'` | `'none'`, değilse undefined — ARIA sıralama attribute değeri
  - `alignClass` — `col.align` değerine göre `'text-right'` | `'text-center'` | `'text-left'` — hücre hizalama CSS sınıfı
- **Dönüş**: `ReactNode` — `<thead>` elementi; içinde sıralanabilir başlık butonları, checkbox, genişletme hücresi ve InfoTooltip bileşenlerini barındıran tablo başlık satırı render eder

---

## NODE ID STANDARD

  file: src\components\admin\data-table\DataTableHead.tsx
  function: src\components\admin\data-table\DataTableHead.tsx::DataTableHead

---

## DISA AKTARILANLAR (EXPORTS)
  export: DataTableHead

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface`, `bg-admin-surface-2`, `border-admin-border`, `hover:text-admin-accent`, `text-admin-accent`, `text-center`
- **Layout:** `flex-row-reverse`, `gap-2`, `h-4`, `inline-flex`, `items-center`, `w-10`, `w-4`, `w-8`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminTableHeadCellClass`, `${alignClass`, `${col.headerClassName`, `${pad`, `:`, `===`, `col.align`, `focus-visible:ring-admin-accent/30`, `focus-visible:ring-offset-0`, `right`, `rounded-md`, `transition-colors`