---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx
skeleton_hash: 082d9c9b95cc1a84
entity_hashes:
  func:InventoryTable: 056840a2667ef544
  overview: 163a93a3c7286734
  style_tokens: 4bf1cdbb52b9f224
generated_at: 2026-06-08T10:08:37Z
---

## Genel Bakış
InventoryTable, yönetim panelinde envanter verilerini tablo formatında gösteren bir React bileşenidir. Gelen satır verileri, yükleme ve hata durumları ile seçili satır ve görünür sütun bilgilerini işleyerek kullanıcıya etkileşimli bir tablo sunar.

## Fonksiyon Grupları
### UI Render ve Tablo Oluşturma
Bileşen, gelen verilere göre tablo başlıklarını, satırlarını ve hücre yapısını oluşturarak görsel düzeni üretir.
- InventoryTable

### Durum Yönetimi ve Koşullu Renderlama
Yükleme, hata ve boş veri durumlarını kontrol ederek uygun gösterge veya mesajları tablo ile birlikte veya yerine render eder.
- InventoryTable (iç mantıkta)

### Etkileşim ve Seçim Yönetimi
Kullanıcının satır seçimini ve sütun görünürlüğünü yönetir; ilgili callback fonksiyonlarını kullanarak üst bileşenlerle durum paylaşımını sağlar.
- InventoryTable (prop kullanımında)

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmemiştir; yalnızca fonksiyon imzası temelinde sınırlı aksiyomlar üretilebilir.

**[Aksiyom 1]:** Eğer `rows` prop'u undefined veya null olarak sağlanırsa, tablonun veri satırları gösterilemeyeceği veya boş duruma geçeceği varsayılır.

**[Aksiyom 2]:** Eğer `loading` prop'u true olarak sağlanırsa, tablonun veri yüklenme sürecinde olduğunu ve muhtemelen bir yüklenme göstergesi sunacağı varsayılır.

**[Aksiyom 3]:** Eğer `error` prop'u truthy bir değer olarak sağlanırsa, tablonun hata durumunu gösterdiği ve veri göstermeyi askıya alabileceği varsayılır.

**[Aksiyom 4]:** Eğer `visibleCols` prop'u boş bir dizi olarak sağlanırsa, tabloda hiçbir sütunun görüntülenmeyeceği varsayılır.

**[Aksiyom 5]:** `den` prop'unun rolü ve türü fonksiyon imzasından net olarak anlaşılamamaktadır — davranışı belirsizdir.

---

## FONKSİYON DETAYLARI

### InventoryTable
**Ne yapar**: Kullanıcı arayüzünde envanter verilerini tablo biçiminde gösterir. Tablo, ürün bilgileri, stok durumları, konum ve tedarikçi gibi alanları dinamik olarak görüntüler ve sıralama, seçme, güncelleme gibi etkileşimleri destekler.  
**Nasıl yapar**:  
- `useDragScroll` ile yatay kaydırma desteği eklenir.  
- `density` parametresiyle hücre ve başlık boşlukları ayarlanır.  
- `sortIndicator` fonksiyonu, geçerli sıralama anahtarına göre ok işaretini döndürür.  
- `statusBadge` fonksiyonu, stok miktarına ve eşik değerine göre renkli durum etiketleri üretir.  
- `TableRow` bileşeni, her satır için görünür sütunları kontrol eder, hücreleri biçimlendirir ve tıklama olaylarını yönlendirir.  
- Tablo başlıkları, sıralama fonksiyonunu tetikleyen butonlar içerir ve açıklama balonları (`InfoTooltip`) sunar.  
- Yükleme, hata ve boş veri durumları için uygun yer tutucu, hata mesajı veya boşluk bileşenleri gösterilir.  
- `groupByCategory` aktifse, satırlar kategori başlıklarıyla gruplanır; aksi halde tek bir liste halinde gösterilir.  
**Parametreler**:
- rows: InventoryRow[] — Gösterilecek envanter satırları dizisi  
- loading: LoadState — Yükleme durumunu belirten enum (Loading, Success, Error)  
- error: string | null — Hata mesajı, varsa  
- selected: InventoryRow | null — Şu an seçili olan satır  
- visibleCols: { [key: string]: boolean } — Görünür sütunları tanımlayan nesne  
- density: 'compact' | 'comfortable' — Hücre boşluk yoğunluğu  
- sortKey: SortKey — Şu anki sıralama anahtarı  
- sortDir: 'asc' | 'desc' — Sıralama yönü  
- groupByCategory: boolean — Kategorilere göre grupla  
- groupedRows: GroupedInventoryRow[] — Kategorilere ayrılmış satırlar  
- onSort: (key: SortKey) => void — Sıralama değiştiğinde çağrılan fonksiyon  
- onSelect: (row: InventoryRow) => void — Satır seçildiğinde çağrılan fonksiyon  
- onUpdateLocation: (productId: string, location: string) => void — Konum güncellendiğinde çağrılan fonksiyon  
- onUpdateSupplier: (productId: string, supplier: string) => void — Tedarikçi güncellendiğinde çağrılan fonksiyon  
- hasWriteAccess: boolean — Yazma izni olup olmadığını belirler  
- thresholdMap: { [productId: string]: number } — Ürün bazlı eşik değerleri  
- defaultThreshold: number | null — Varsayılan eşik değeri  
- effectiveThreshold: (productId: string) => number | null — Ürün için geçerli eşik değerini döndürür  
**Dönüş**: void (React bileşeni, JSX döndürür)

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

### [N1_NASIL] AST Pointer: InventoryTable.tsx::InventoryTable
- **params**: (rows, loading, error, selected, visibleCols, density, sortKey, sortDir, groupByCategory, groupedRows, onSort, onSelect, onUpdateLocation, onUpdateSupplier, hasWriteAccess, thresholdMap, defaultThreshold, effectiveThreshold)
- **ic_degiskenler**:
  - `dragScrollRef` — useDragScroll hook'unun oluşturduğu DOM referansı, sürükleme ile yatay kaydırma için kullanılır
  - `headPad` — density 'compact' ise 'px-2 py-2', değilse boş string; tablo başlık hücreleri için padding belirler
  - `cellPad` — density 'compact' ise 'px-2 py-2', değilse boş string; tablo veri hücreleri için padding belirler
  - `sortIndicator` — SortKey parametresi alan iç fonksiyon, sıralama yönüne göre ok karakteri (▲/▼) döndürür
  - `statusBadge` — InventoryRow parametresi alan iç fonksiyon, stok durumuna göre JSX badge döndürür
  - `TableRow` — InventoryRow parametresi alan React bileşeni, tek bir tablo satırını render eder
- **Dönüş**: JSX (div > table yapısı, dragScrollRef ile sarmalanmış)

### [N2_NASIL] AST Pointer: InventoryTable.tsx::sortIndicator
- **params**: (key: SortKey)
- **ic_degiskenler**:
  - (yok — parametre ve closure değişkenleri kullanır)
- **Dönüş**: string (empty, '▲', veya '▼')

### [N3_NASIL] AST Pointer: InventoryTable.tsx::statusBadge
- **params**: (r: InventoryRow)
- **ic_degiskenler**:
  - `net` — r.available_stock değerini temsil eder, mevcut stok miktarı
  - `th` — effectiveThreshold(r.product_id) çağrısıyla elde edilen eşik değeri, null veya number olabilir
  - `base` — ortak CSS sınıf dizisi, tüm badge varyantları için temel stil tanımlar
- **Dönüş**: JSX (span elementi, duruma göre farklı CSS sınıfları ve metin)

### [N4_NASIL] AST Pointer: InventoryTable.tsx::TableRow
- **params**: ({ r }: { r: InventoryRow })
- **ic_degiskenler**:
  - (yok — sadece parametre r kullanılır, dış kapsamdaki visibleCols, selected, cellPad, onSelect, vb. kullanılır)
- **Dönüş**: JSX (tr elementi, ürün verisini gösteren satır)

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
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `shadow-glow-sm`, `tracking-hvac-normal`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500/10`, `bg-blue-500/10`, `bg-cyan-400`, `bg-cyan-500/5`, `bg-emerald-500/10`, `bg-rose-500/10`, `bg-slate-500/10`, `bg-transparent`, `bg-white/2`, `border-amber-500/20`, `border-b`, `border-b-0`, `border-blue-500/20`, `border-emerald-500/20`, `border-rose-500/20`
- **Layout:** `backdrop-blur-xl`, `block`, `flex`, `flex-col`, `gap-1`, `gap-3`, `h-4`, `h-6`, `inline-flex`, `items-center`, `justify-center`, `justify-end`, `max-w-120px`, `min-w-1000px`, `overflow-x-auto`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:`, `last:` önekleri
- **Yardımcı Sınıflar:** `${base`, `${density`, `${r.abc_class`, `${r.days_until_empty`, `7`, `:`, `<=`, `===`, `A`, `B`, `animate-pulse`, `border`, `compact`, `content-auto-table`, `cursor-pointer`