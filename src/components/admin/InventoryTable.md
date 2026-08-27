---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\InventoryTable.tsx
skeleton_hash: 471ba8f68e9e2696
entity_hashes:
  func:InlineTextCell: 5304bf2790be654c
  func:InventoryTable: 47104fbf154e4f0b
  overview: b60b77faa900de78
  style_tokens: 08a203db630b73af
generated_at: 2026-08-27T08:06:24Z
---

## Genel Bakış
Bu modül, yönetim panelinde envanter verilerini tablo formatında gösteren ve tablo içindeki metin hücresi bileşenini sağlayan bir React bileşenidir. Yüklenme, hata ve boş veri durumlarını yöneterek kullanıcıya kesintisiz bir deneyim sunar ve satır seçimleri ile sütun görünürlüğü üzerinden etkileşim imkanı sağlar.

## Fonksiyon Grupları
### Hücre Bileşenleri
Tablo içindeki metin hücresini, istenen genişlik, etiket ve yer tutucu ile render eder.
- InlineTextCell

### Veri Görselleştirme ve Tablo Yapısı
Gelen envanter satırlarını ve görünür sütun tanımlarını alarak tablo başlıklarını, satır satırlarını ve hücre düzenini oluşturur.
- InventoryTable

### Durum Yönetimi ve Koşullu Gösterim
Yüklenme süreci, hata oluşumu veya verinin hiç bulunmaması gibi durumları kontrol ederek uygun arayüz mesajlarını veya göstergelerini render eder.
- InventoryTable

### Etkileşim Koordinasyonu
Kullanıcı tarafından yapılan satır seçimlerini ve sütun görünürlük tercihlerini üst bileşenlere iletmek üzere yönetir.
- InventoryTable

---

## AXIOMS – Mimari Varsayımlar

**[Aksiyom 1]**: Eğer `table` prop'u sağlanmazsa, `InventoryTable` bileşeni tablo verisini render edemez.

**[Aksiyom 2]**: Eğer `hasWriteAccess` prop'u sağlanmazsa, bileşen yazma izni durumunu belirleyemez ve düzenleme tetikleyicilerinin görünürlüğü/erişilebilirliği bilinmiyor.

**[Aksiyom 3]**: Eğer `onUpdateLocation` callback'i sağlanmazsa, konum güncelleme işlemi tetiklenemez.

**[Aksiyom 4]**: Eğer `onUpdateSupplier` callback'i sağlanmazsa, tedarikçi güncelleme işlemi tetiklenemez.

**[Aksiyom 5]**: Eğer `InlineTextCell` bileşenine `value` prop'u sağlanmazsa, hücre içeriği gösterilemez; sağlanan `placeholder` değeri yoksa `'-'` kullanılır.

**[Aksiyom 6]**: Eğer `InlineTextCell` bileşenine `widthClass` prop'u sağlanmazsa, hücre genişleme sınıfı bilinmiyor.

**[Aksiyom 7]**: Eğer `InlineTextCell` bileşenine `ariaLabel` prop'u sağlanmazsa, ekran okuyucu etiketi bilinmiyor.

---

## FONKSİYON DETAYLARI

### InlineTextCell
**Ne yapar**: Satır içi metin düzenleme hücresi olarak kullanılan bir React bileşenidir. Verilen değeri görüntüler ve kullanıcıya düzenleme imkanı sunar.
**Nasıl yapar**: Gövde verilmediği için iç mantığı bilinmiyor.
**Parametreler**:
- value: string — Görüntülenecek veya düzenlenecek mevcut metin değeri
- widthClass: string — Hücre genişliğini belirleyen CSS sınıfı
- ariaLabel: string — Erişilebilirlik için ekran okuyucu etiketi
- placeholder: string — Değer boşken gösterilecek yer tutucu metin (varsayılan: '-')
- extraSpanClass: string — Ek CSS sınıfı (opsiyonel)
**Dönüş**: React.FC<InlineTextCellProps> — InlineTextCellProps arayüzüne uygun props alan bir React fonksiyonel bileşeni döndürür.

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
- import: ../../hooks/useAdminTable::type { UseAdminTableResult }
- import: ../../types/inventory::type { InventoryRow }
- import: ./AdminEmptyState::AdminEmptyState
- import: ./data-table/DataTableKit::DataTableKit
- import: ./data-table/types::type { AdminColumn }
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::Pencil
- import: lucide-react::SearchX
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: react::useState

---

## INTERFACES

### InventoryTableProps
- `table: UseAdminTableResult<InventoryRowWithCategory>`
- `hasWriteAccess: boolean`
- `onUpdateLocation: (productId: string, val: string) => Promise<void>`
- `onUpdateSupplier: (productId: string, val: string) => Promise<void>`
- `onSelectRow?: (row: InventoryRowWithCategory) => void`

### InlineTextCellProps
- `value: string`
- `widthClass: string`
- `ariaLabel?: string`
- `placeholder?: string`
- `extraSpanClass?: string`
- `onSave: (val: string) => Promise<void>`

---

## TYPE ALIASES

### InventoryRowWithCategory
```typescript
type InventoryRowWithCategory = InventoryRow & {
  category_id?: string | null
  low_stock_threshold?: number | null
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/InventoryTable.tsx::InlineTextCell
- **params**: `value`, `widthClass`, `ariaLabel`, `placeholder` (varsayılan: `'-'`), `extraSpanClass` (varsayılan: `''`), `onSave`
- **ic_degiskenler**:
  - `editing` — `useState(false)` ile başlatılan boolean; düzenleme modunun açık/kapalı durumunu tutar
  - `setEditing` — `editing` durumunu güncelleyen setter fonksiyonu
  - `draft` — `useState(value)` ile başlatılan string; düzenleme sırasında kullanıcının yazdığı geçici değeri tutar
  - `setDraft` — `draft` değerini güncelleyen setter fonksiyonu
  - `inputRef` — `useRef<HTMLInputElement>(null)` ile oluşturulan referans; düzenleme modundayken input'a odaklanmak için kullanılır
  - `commit` — `useCallback` ile oluşturulan async fonksiyon; `draft` değerini `value`'dan farklıysa `onSave` fonksiyonuna gönderir, hata durumunda `draft`'ı orijinal `value`'ya sıfırlar
- **Dönüş**: JSX elementi — `editing` true ise input elementi, false ise tıklanabilir buton elementi döner

### [N2_NASIL] AST Pointer: src/components/admin/InventoryTable.tsx::InventoryTable
- **params**: `table`, `hasWriteAccess`, `onUpdateLocation`, `onUpdateSupplier`, `onSelectRow`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan alınan çeviri fonksiyonu; tablo başlıkları, durum etiketleri ve metinler için kullanılır
  - `statusBadge` — `useCallback` ile oluşturulan fonksiyon; `InventoryRowWithCategory` parametresi alır, `r.available_stock` ve `r.low_stock_threshold` değerlerine göre durum badge'i (depleted/critical/reserved/available) döndürür
  - `net` — `statusBadge` içindeki `r.available_stock` değeri; mevcut stok miktarını tutar
  - `th` — `statusBadge` içindeki `r.low_stock_threshold ?? 5` değeri; düşük stok eşiğini tutar, yoksa 5 kullanılır
  - `base` — `statusBadge` içindeki CSS sınıf string'i; badge'in temel stilini tanımlar
  - `columns` — `useMemo` ile oluşturulan `AdminColumn<InventoryRowWithCategory>[]` dizisi; tablo sütunlarını (name, physical, reserved, available, threshold, location, supplier, abc, days, status, detail) tanımlar
  - `isWarning` — `columns` içindeki days sütununda kullanılan boolean; `r.days_until_empty` 7 veya altındaysa true olur
- **Dönüş**: `DataTableKit` JSX elementi — `columns`, `table`, `rowId`, `persistKey`, `hasWriteAccess`, `totalLabel`, `emptyState`, `filterEmptyState`, `columnsButtonLabel` props'ları ile render edilir

---

## NODE ID STANDARD

  file: src\components\admin\InventoryTable.tsx
  function: src\components\admin\InventoryTable.tsx::InlineTextCell
  function: src\components\admin\InventoryTable.tsx::InventoryTable

---

## DISA AKTARILANLAR (EXPORTS)
  export: InlineTextCell
  export: InventoryTable

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-bg`, `bg-admin-danger-weak`, `bg-admin-success-weak`, `bg-admin-surface-2`, `bg-admin-surface-3`, `bg-admin-warning-weak`, `border-2`, `border-admin-accent/30`, `border-admin-border`, `border-admin-danger/30`, `border-admin-success/30`, `border-admin-warning/30`, `group-hover/btn:text-admin-accent`, `group-hover:text-admin-accent`
- **Layout:** `block`, `flex`, `flex-col`, `flex-shrink-0`, `gap-1.5`, `h-6`, `inline-block`, `inline-flex`, `items-center`, `justify-center`, `relative`, `shadow-admin-sm`, `w-6`, `zoom-in`
- **Varyant/Responsive:** `:`, `focus-visible:`, `group-hover/btn:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminSupplierMaxWidthClass`, `${base`, `${extraSpanClass`, `${widthClass`, `:`, `===`, `A`, `B`, `animate-in`, `animate-pulse`, `border`, `duration-300`, `fade-in`, `focus-visible:outline-none`