---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx
skeleton_hash: b542cdd2cde6050b
generated_at: 2026-05-23T21:54:53Z
---

## Genel Bakış
`InventoryTable` bileşeni, yönetim panelindeki envanter verilerini tablo biçiminde sunar; veri yükleme, hata durumu, satır seçimi ve sütun görünürlüğü gibi durumları yöneterek kullanıcıya dinamik ve etkileşimli bir tablo deneyimi sağlar. Props aracılığıyla dışarıdan gelen veri, yükleme bayrağı, hata bilgisi, seçili satırlar ve görünür sütun listesi alınır ve bu bilgilere göre tablo içeriği, yükleme göstergeleri, hata mesajları ve seçili öğelerin vurgulanması render edilir.

## Fonksiyon Grupları
### Veri ve Durum İşleme
Bileşen, gelen `rows`, `loading` ve `error` verilerini işleyerek tabloya gösterilecek içeriği hazırlar ve yükleme veya hata durumlarında uygun yedek görüntüler sunar.  
- InventoryTable

### Görünüm ve Sütun Yönetimi
`visibleCols` prop’u kullanılarak hangi sütunların görüneceği belirlenir; bu sayede sadece seçilen sütunların başlıkları ve hücreleri render edilerek gereksiz gösterimlerden kaçınılır.  
- InventoryTable

### Seçim ve Etkileşim
Kullanıcının satır seçimi yapabilmesi için `selected` durumu takip edilir; seçili satırlar vurgulanarak görsel geri bildirim sağlanır ve seçimin dışarıya iletilmesi sağlanır.  
- InventoryTable

### Başlık ve Hücre Oluşturma
Tablo başlıkları ve her bir satırın hücreleri, gelen veri ve görünür sütun bilgilerine göre dinamik olarak üretilir; bu sayede veri yapısındaki değişikliklere uygun bir gösterim elde edilir.  
- InventoryTable

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer **rows** prop'u verilmezse, tablo içinde gösterilecek veri bulunamadığından boş bir tablo veya hata durumu ortaya çıkar.  
[Aksiyom 2]: Eğer **loading** prop'u `true` ise, bileşen veri yükleniyor göstergesi (spinner, skeleton vb.) render eder; `false` ise bu gösterge gösterilmez.  
[Aksiyom 3]: Eğer **error** prop'u dolu bir değer (null/undefined dışında) içeriyorsa, bileşen hata mesajını kullanıcıya gösterir; boşsa hata gösterimi yapılmaz.  
[Aksiyom 4]: Eğer **selected** prop'u verilmezse veya `undefined` ise, hiçbir satır seçili değil kabul edilir ve seçim stilini uygulanmaz.  
[Aksiyom 5]: Eğer **visibleCols** prop'u verilmezse, hangi sütunların görüneceği belirlenemez; bu durumda bileşen varsayılan davranışını (tüm sütunları göster veya hiçbirini göster) bilmediği için bu konuda bir varsayım yapılamaz (bilinmiyor).  
[Aksiyom 6]: Eğer **den** prop'u (`InventoryTableProps` tipi) eksik veya geçersizse, bileşen beklenen yapıyı alamaz ve prop kullanımında çalışma zamanı hatası yaşayabilir.

---

## FONKSIYON DETAYLARI

### InventoryTable
**Ne yapar**: InventoryTable adlı React bileşeni, envanter verilerini tablo formatında görüntüler.  
**Nasıl yapar**: rows, loading, error, selected, visibleCols ve den props'larını kullanarak tabloyu render eder; yükleme ve hata durumlarını kontrol eder, seçili satırları vurgular ve görünür sütunları filtreler.  
**Parametreler**:
- rows: any — Envanter satırlarının listesi (tipi belirsiz)  
- loading: boolean — Veri yükleme durumunu gösterir  
- error: any — Olası hata nesnesi veya mesajı  
- selected: any — Seçili satır(lar)ın kimlikleri veya verileri  
- visibleCols: any — Görünür olacak sütunların listesi veya tanımları  
- den: InventoryTableProps — Bileşenin ekstra özelliklerini taşıyan tip tanımlı props nesnesi  
**Dönüş**: void — Bileşen JSX döndürür ancak TypeScript'te dönüş tipi açıkça belirtilmemiş (void veya bilinmiyor olarak belirtildi).

---

## INTERFACES

### InventoryTableProps
- `rows: InventoryRow[]`
- `loading: LoadState`
- `error: string`
- `selected: InventoryRow | null`
- `visibleCols: VisibleCols`
- `density: Density`
- `sortKey: SortKey`
- `sortDir: 'asc' | 'desc'`
- `groupByCategory: boolean`
- `groupedRows: { _c_id: string | null; name: string; items: InventoryRow[] }[]`
- `onSort: (key: SortKey) => void`
- `onSelect: (r: InventoryRow) => void`
- `onUpdateLocation: (_productId: string, val: string) => Promise<void>`
- `onUpdateSupplier: (_productId: string, val: string) => Promise<void>`
- `hasWriteAccess: boolean`
- `thresholdMap: Record<string, number | null>`
- `defaultThreshold: number | null`
- `effectiveThreshold: (_productId: string) => number | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::InventoryTable
- **params**: rows, loading, error, selected, visibleCols, density, sortKey, sortDir, groupByCategory, groupedRows, onSort, onSelect, onUpdateLocation, onUpdateSupplier, hasWriteAccess, thresholdMap, defaultThreshold, effectiveThreshold
- **ic_degiskenler**:
  - `dragScrollRef` — ref returned by `useDragScroll<HTMLDivElement>()`, attached to the outer div to enable horizontal drag scrolling.
  - `headPad` — Tailwind class string for table header padding; `'px-2 py-2'` when `density === 'compact'`, otherwise empty string.
  - `cellPad` — Tailwind class string for table cell padding; same logic as `headPad`.
  - `sortIndicator` — function that returns a visual sort indicator (`'▲'`, `'▼'`, or `''`) based on the current `sortKey` and `sortDir`.
  - `statusBadge` — function that returns a badge `<span>` indicating stock status (Tükendi, Kriti̇k, Rezervli, Uygun) for a given inventory row.
  - `TableRow` — component that renders a single `<tr>` for an inventory row, conditionally rendering cells according to `visibleCols` and row data.
- **Dönüş**: JSX element (the complete table UI wrapped in a scrollable `<div>`).

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::sortIndicator
- **params**: key: SortKey
- **ic_degiskenler**: (yok) — uses outer `sortKey` and `sortDir` only.
- **Dönüş**: string — `''` if `key !== sortKey`; otherwise `'▲'` when `sortDir === 'asc'`, else `'▼'`.

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::statusBadge
- **params**: r: InventoryRow
- **ic_degiskenler**:
  - `net` — `r.available_stock`, the available stock quantity for the row.
  - `th` — `effectiveThreshold(r.product_id)`, the threshold value for the product (may be `null`).
  - `base` — shared Tailwind class string `"px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm transition-all"` applied to all badge variants.
- **Dönüş**: JSX `<span>` element representing the stock status badge (with appropriate background/text colors and optional pulse animation).

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::TableRow
- **params**: { r }: { r: InventoryRow }
- **ic_degiskenler**: (yok) — accesses `r`, `visibleCols`, `hasWriteAccess`, `thresholdMap`, `defaultThreshold`, `onSelect`, `onUpdateLocation`, `onUpdateSupplier`, etc., from the outer scope.
- **Dönüş**: JSX `<tr>` element representing a table row with interactive cells (name, stock numbers, location, supplier, ABC class, days until empty, status badge).

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::groupedRows mapper
- **params**: g (group object with `_c_id`, `name`, `items`)
- **ic_degiskenler**: (yok) — uses `g`, `density`, and the `TableRow` component from outer scope.
- **Dönüş**: `React.Fragment` containing a group header `<tr>` (with category name and item count) followed by `<TableRow>` elements for each item in `g.items`.

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::rows mapper
- **params**: r: InventoryRow
- **ic_degiskenler**: (yok) — uses `r` and the `TableRow` component from outer scope.
- **Dönüş**: JSX `TableRow` element for the given inventory row.

---

## NODE ID STANDARD

  file: src\components\admin\InventoryTable.tsx
  function: src\components\admin\InventoryTable.tsx::InventoryTable

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryTable

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** `shadow-[0_0_10px_rgba(34,211,238,0.5)]`
- **height:** (yok)
- **width:** `max-w-[120px]`, `min-w-[1000px]`
- **spacing:** (yok)
- **diğer:** `tracking-[0.2em]`, `tracking-[0.3em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500/10`, `bg-blue-500/10`, `bg-cyan-400`, `bg-cyan-500/[0.05]`, `bg-emerald-500/10`, `bg-rose-500/10`, `bg-slate-500/10`, `bg-transparent`, `bg-white/[0.02]`, `border-amber-500/20`, `border-b`, `border-b-0`, `border-blue-500/20`, `border-emerald-500/20`, `border-rose-500/20`
- **Layout:** `backdrop-blur-xl`, `block`, `flex`, `flex-col`, `gap-1`, `gap-3`, `group-hover:text-cyan-400`, `h-4`, `h-6`, `inline-flex`, `items-center`, `justify-center`, `justify-end`, `overflow-x-auto`, `p-0`
- **Responsive:** (yok)
