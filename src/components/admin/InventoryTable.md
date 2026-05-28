---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx
skeleton_hash: b542cdd2cde6050b
entity_hashes:
  func:InventoryTable: 056840a2667ef544
  overview: 998a56ed5857e9c5
  style_tokens: 4bf1cdbb52b9f224
generated_at: 2026-05-28T22:35:36Z
---

## Genel Bakış
`InventoryTable` bileşeni, yönetim panelinde envanter verilerini tablo biçiminde gösteren bir React komponentidir. Gelen veri (satırlar, yükleme durumu, hata bilgisi vb.) ve kullanıcı etkileşimleri (seçim, görünür sütunlar) üzerinden tabloyu oluşturur, durumları yönetir ve UI güncellemelerini gerçekleştirir.

## Fonksiyon Grupları
### UI Render ve Layout
Tablonun başlık, satır ve hücre yapılarını oluşturur; Material‑UI ya da benzeri bir tablo kütüphanesi kullanarak görsel düzeni üretir.  
- InventoryTable

### Veri ve Durum Yönetimi
Gelen `rows`, `loading`, `error` gibi prop’ları değerlendirir, boş veri, yükleme spinner’ı veya hata mesajı gibi durumları koşullu olarak render eder.  
- InventoryTable (durum kontrolü içinde)

### Kullanıcı Etkileşimi ve Seçim
`selected` ve `visibleCols` prop’larını kullanarak satır seçimini, çoklu seçim davranışını ve hangi sütunların gösterileceğini yönetir; ilgili callback’leri tetikleyerek dış bileşenle iletişimi sağlar.  
- InventoryTable (seçim ve görünürlük mantığı içinde)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `rows` sağlanmazsa, tablo veri kaynağı olmadan render edilir ve boş bir tablo gösterilir.  
**Aksiyom 2**: Eğer `loading` değeri `true` değilse, yükleme göstergesi (spinner) gösterilmez ve tablo içeriği doğrudan render edilir.  
**Aksiyom 3**: Eğer `error` değeri `null`/`undefined` değilse, hata mesajı gösterilir ve tablo verileri gösterilmez.  
**Aksiyom 4**: Eğer `selected` sağlanmazsa, hiçbir satırın seçili olduğu varsayılmaz; seçili satır listesi boş kabul edilir.  
**Aksiyom 5**: Eğer `visibleCols` sağlanmazsa, tüm tanımlı sütunlar varsayılan olarak görünür kabul edilir.  
**Aksiyom 6**: Eğer `den` (yani `InventoryTableProps`) eksik ya da tip olarak uyumsuzsa, bileşen çalışmaz ve bir tip hatası (runtime exception) fırlatılır.  

*Domain‑specific not:* Bu aksiyomlar, fonksiyon imzasındaki parametrelerin varlığı ve tip uyumluluğu üzerine kuruludur; değerlerin kesin tipleri ve sınırları (ör. `rows` uzunluğu, `visibleCols` maksimum sayısı) belgelenmemiştir, bu yüzden “bilinmiyor” olarak bırakılmıştır.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::InventoryTable
- **params**: (rows, loading, error, selected, visibleCols, density, sortKey, sortDir, groupByCategory, groupedRows, onSort, onSelect, onUpdateLocation, onUpdateSupplier, hasWriteAccess, thresholdMap, defaultThreshold, effectiveThreshold)
- **ic_degiskenler**:
  - `dragScrollRef` — `useDragScroll` hookundan gelen ref, tablo kaydırma davranışını yönetir.
  - `headPad` — `density` değerine göre başlık hücreleri için uygulanacak padding sınıfı (`'px-2 py-2'` veya `''`).
  - `cellPad` — `density` değerine göre veri hücreleri için uygulanacak padding sınıfı (`'px-2 py-2'` veya `''`).
  - `sortIndicator` — `(key: SortKey) => string` tipinde iç fonksiyon; verilen sütun anahtarının sıralama yönünü gösteren ok işareti döndürür.
  - `statusBadge` — `(r: InventoryRow) => JSX.Element` tipinde iç fonksiyon; stok durumuna göre renkli bir badge JSX’i üretir.
  - `TableRow` — `({ r }: { r: InventoryRow }) => JSX.Element` tipinde iç bileşen; tek bir envanter satırını render eder.
- **Dönüş**: JSX.Element (React bileşeni)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::sortIndicator
- **params**: (key)
- **ic_degiskenler**: *yok*
- **Dönüş**: string (sıralama yönünü gösteren `'▲'` veya `'▼'` karakteri, eşleşmezse boş string)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::statusBadge
- **params**: (r)
- **ic_degiskenler**:
  - `net` — `r.available_stock`; mevcut kullanılabilir stok miktarı.
  - `th` — `effectiveThreshold(r.product_id)`; ürün için hesaplanan eşik değeri (varsa).
  - `base` — Badge için ortak CSS sınıflarını içeren temel stil stringi.
- **Dönüş**: JSX.Element (stok durumuna göre renkli bir `<span>` badge)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx::TableRow
- **params**: ({ r })
- **ic_degiskenler**: *yok* (tüm kullanılan değerler dışarıdan gelen `r` ve üst bileşenin props/const’larından elde edilir)
- **Dönüş**: JSX.Element (bir `<tr>` satırı ve içinde koşullu `<td>` hücreleri)

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