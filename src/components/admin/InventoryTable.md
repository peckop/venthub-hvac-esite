---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryTable.tsx
skeleton_hash: d63c221ac89c815d
entity_hashes:
  func:InventoryTable: 5588b8e97a6e44fb
  overview: 0718ce22af046921
  style_tokens: 4bf1cdbb52b9f224
generated_at: 2026-06-16T10:18:09Z
---

## Genel Bakış
InventoryTable, yönetim panelinde envanter verilerini düzenli bir tablo formatında sergileyen React bileşenidir. Yüklenme, hata ve boş veri durumlarını akıllıca yöneterek kullanıcıya kesintisiz bir deneyim sunar ve satır seçimleri ile sütun görünürlüğü üzerinden etkileşim imkanı sağlar.

## Fonksiyon Grupları
### Veri Görselleştirme ve Tablo Yapısı
Gelen envanter satırlarını ve görünür sütun tanımlarını alarak tablo başlıklarını, satır satırlarını ve hücre düzenini oluşturur. Temel render sorumluluğu bu grup tarafından üstlenilir.
- InventoryTable

### Durum Yönetimi ve Koşullu Gösterim
Yüklenme süreci, hata oluşumu veya verinin hiç bulunmaması gibi durumları kontrol ederek uygun arayüz mesajlarını veya göstergelerini tablonun önüne veya yerine render eder.
- InventoryTable

### Etkileşim Koordinasyonu
Kullanıcı tarafından yapılan satır seçimlerini ve sütun görünürlük tercihlerini üst bileşenlere iletmek üzere yönetir; bu sayede tablonun durumu uygulama geneliyle senkronize kalır.
- InventoryTable

---

## AXIOMS – Mimari Varsayımlar
Bu bir React bileşeni (InventoryTable) olup, belirli prop'ların varlığı ve tipleri üzerine kuruludur. Aşağıdaki aksiyomlar, fonksiyon imzasından çıkarılmıştır.

[Aksiyom 1]: Eğer `rows` prop'u verilmemiş veya `undefined` ise, bileşen tabloyu hiçbir satır göstermeden render eder veya `loading`/`error` durumuna göre davranır.
[Aksiyom 2]: Eğer `loading` prop'u `true` değilse (veya `undefined` ise), bileşen yükleme göstergesini render etmez.
[Aksiyom 3]: Eğer `error` prop'u `undefined` veya `null` ise, bileşen hata mesajını göstermez.
[Aksiyom 4]: Eğer `selected` prop'u bir `Set` veya `Array` içermiyorsa (veya `undefined` ise), bileşen hiçbir satırı seçili olarak işaretleyemez.
[Aksiyom 5]: Eğer `visibleCols` prop'u geçerli bir sütun listesi içermiyorsa (veya `undefined` ise), bileşen tüm potansiyel sütunları (veri yapısından çıkarılarak) veya hiçbirini gösteremeyebilir.
[Aksiyom 6]: Eğer `den` prop'u `InventoryTableProps` arayüzüne uymayan bir değer ise, TypeScript çalışma zamanında hata verebilir veya bileşen beklenmedik davranış sergileyebilir.

---

## FONKSİYON DETAYLARI

### InventoryTable
**Ne yapar**: Envanter tablosunu gösteren ana React bileşenidir. Stok verilerini, sıralama, gruplama, durum gösterimi ve düzenleme yetkisine göre düzenlenebilir hücrelerle birlikte sunar.
**Nasıl yapar**: `InventoryTableProps` aracılığıyla aldığı parametreleri kullanarak, tablonun başlığını ve gövdesini oluşturur. `useI18n` hook'u ile uluslararasılaştırma sağlar. `useDragScroll` hook'u ile yatay sürükleme yeteneği ekler. `density` parametresine göre sıkışık veya normal yoğunlukta hücre dolguları ayarlar. `sortIndicator` ve `statusBadge` yardımcı fonksiyonlarını kullanarak sıralama göstergeleri ve durum rozetleri oluşturur. `visibleCols` parametresine göre hangi sütunların görüneceğini belirler. `hasWriteAccess` durumuna göre düzenlenebilir hücreleri (`EditableCell`) veya salt okunur metinleri gösterir. `groupByCategory` ve `groupedRows` kullanarak kategorilere göre gruplanmış satırlar veya düz satırlar gösterir. Yüklenme durumunda `AdminSkeleton`, hata durumunda hata mesajı, boş durumda `AdminEmptyState` gösterir.
**Parametreler**:
- rows: `InventoryRow[]` — Görüntülenecek envanter satırları dizisi.
- loading: `LoadState` — Veri yükleme durumunu belirten enum değeri (ör. `LoadState.Loading`).
- error: `string` — Hata durumunda gösterilecek hata mesajı.
- selected: `InventoryRow | null` — Seçili satır nesnesi; seçili satırın vurgulanmasını sağlar.
- visibleCols: `Record<string, boolean>` — Hangi sütunların görüneceğini belirten bir nesne (ör. `{ name: true, physical: false }`).
- density: `'compact' | 'normal'` — Hücre yoğunluğu; sıkışık modda daha az dolgu uygulanır.
- sortKey: `SortKey` — Aktif sıralama sütununu belirten anahtar.
- sortDir: `'asc' | 'desc'` — Sıralama yönü (artan veya azalan).
- groupByCategory: `boolean` — Kategorilere göre gruplama yapılsın mı?
- groupedRows: `GroupedRows[]` — Kategorilere göre gruplanmış satırlar dizisi; her grup bir `_c_id`, `name` ve `items` içerir.
- onSort: `(key: SortKey) => void` — Sütun başlığına tıklandığında çağrılan sıralama işlevi.
- onSelect: `(row: InventoryRow) => void` — Satır seçildiğinde çağrılan işlev.
- onUpdateLocation: `(productId: string, value: string) => void` — Depo konumu düzenlendiğinde çağrılan işlev.
- onUpdateSupplier: `(productId: string, value: string) => void` — Tedarikçi adı düzenlendiğinde çağrılan işlev.
- hasWriteAccess: `boolean` — Kullanıcının yazma yetkisi olup olmadığını belirtir; düzenleme hücrelerinin etkinliğini kontrol eder.
- thresholdMap: `Record<string, number>` — Ürün kimliğine göre eşik değerlerini eşleyen harita.
- defaultThreshold: `number` — Eşik haritasında bulunmayan ürünler için varsayılan eşik değeri.
- effectiveThreshold: `(productId: string) => number | null` — Ürün için geçerli eşik değerini hesaplayan fonksiyon; ürün kimliğini alır ve eşik değerini veya null döndürür.
**Dönüş**: `JSX.Element` — Envanter tablosunu içeren React bileşeni (bir `<div>` ve içinde `<table>` yapısı).

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useDragScroll::useDragScroll
- import: ../../types/inventory::Density
- import: ../../types/inventory::InventoryRow
- import: ../../types/inventory::LoadState
- import: ../../types/inventory::SortKey
- import: ../../types/inventory::VisibleCols
- import: ../../utils/adminUi::adminTableCellClass
- import: ../../utils/adminUi::adminTableHeadCellClass
- import: ./AdminEmptyState::AdminEmptyState
- import: ./AdminSkeleton::AdminSkeleton
- import: ./EditableCell::EditableCell
- import: ./InfoTooltip::InfoTooltip
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::SearchX
- import: react::React

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
- **params**: rows, loading, error, selected, visibleCols, density, sortKey, sortDir, groupByCategory, groupedRows, onSort, onSelect, onUpdateLocation, onUpdateSupplier, hasWriteAccess, thresholdMap, defaultThreshold, effectiveThreshold
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, metinleri dil için kullanılır
  - `dragScrollRef` — useDragScroll hook'undan gelen ref, sürükleme ile yatay kaydırma için kullanılır
  - `headPad` — density compact ise tablo başlık hücresi için padding className'i
  - `cellPad` — density compact ise tablo gövde hücresi için padding className'i
  - `sortIndicator` — iç fonksiyon, sortKey ve sortDir'e göre sıralama göstergesi döndürür
  - `statusBadge` — iç fonksiyon, InventoryRow'a göre durum rozeti döndürür
  - `TableRow` — iç bileşen, tek bir tablo satırını render eder
- **Dönüş**: JSX element (tablo yapısı)

### [N2_NASIL] AST Pointer: InventoryTable.tsx::sortIndicator
- **params**: key
- **ic_degiskenler**: (yok)
- **Dönüş**: string (sıralama göstergesi karakteri veya boş string)

### [N3_NASIL] AST Pointer: InventoryTable.tsx::statusBadge
- **params**: r
- **ic_degiskenler**:
  - `net` — Ürünün mevcut stok miktarı (r.available_stock)
  - `th` — Ürün için eşik değeri (effectiveThreshold fonksiyonu ile hesaplanır)
  - `base` — Rozet için ortak CSS className'i
- **Dönüş**: JSX element (span içinde durum rozeti)

### [N4_NASIL] AST Pointer: InventoryTable.tsx::TableRow
- **params**: r
- **ic_degiskenler**: (yok, sadece parametre ve closure değişkenleri kullanılır)
- **Dönüş**: JSX element (tr içinde tek satır)

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