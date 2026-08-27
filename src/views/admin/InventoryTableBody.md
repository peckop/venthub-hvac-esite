---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\InventoryTableBody.tsx
skeleton_hash: 1a01958156534ad6
entity_hashes:
  func:InventoryTableBody: 751f8b64856cb902
  func:inventoryFetcher: 2816ec0b9cfd463b
  overview: 89c09305c9229a1c
  style_tokens: 60b2c39b995b8118
generated_at: 2026-08-27T07:26:22Z
---

## Genel Bakış
Bu modül, admin panelindeki envanter yönetimi tablosunun gövde kısmını oluşturmaktan sorumludur. Supabase veritabanından asenkron olarak envanter verilerini çeken bir fonksiyon ile bu verileri tablo satırları olarak render eden bir React bileşeni içerir.

## Fonksiyon Grupları
### Veri Çekme İşlemleri
Supabase istemcisi aracılığıyla envanter verilerini asenkron olarak çeken, sıralama ve sayfalama parametrelerini işleyen fonksiyon.
- inventoryFetcher

### Tablo Gövdesi Bileşeni
Çekilen envanter verilerini kullanarak admin tablosunun satırlarını oluşturan ana React bileşeni.
- InventoryTableBody

## Dış Bağımlılıklar
- **Supabase Client**: Veritabanı bağlantısını sağlayan dış bağımlılık.

## Mimari Önem
Bu modül, veri çekme ve kullanıcı arayüzü render işlemlerini tek bir dosyada birleştiren kompakt bir yapıya sahiptir. Hem veri erişim katmanını hem de sunum katmanını barındırması, modüler mimari açısından bir ayrıştırma fırsatı olarak değerlendirilebilir.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### inventoryFetcher
**Ne yapar**: Supabase veritabanındaki `inventory_velocity` görünümünden envanter verilerini çeker, sıralama ve arama filtrelerini uygular, ardından `products` ve `inventory_summary` tablolarından eksik alanları eşleştirerek zenginleştirilmiş satırlar üretir. Kategori filtresi ve sayfalama uygulandıktan sonra sonuç kümesini döndürür.

**Nasıl yapar**: İlk olarak `inventory_velocity` görünümünden `product_id`, `name`, `physical_stock`, `reserved_stock`, `available_stock`, `warehouse_location` ve `supplier_name` alanlarını seçen bir sorgu oluşturur. Sıralama için `params.sort` parametresindeki `key` değerini bir `colMap` sözlüğü aracılığıyla gerçek veritabanı sütun adlarına dönüştürür; eşleşen bir sütun bulunamazsa varsayılan olarak `name` alanına göre artan sıralama uygular. `params.query` doluysa `name` alanında `%query%` deseniyle `ilike` filtresi ekler. Sorgu çalıştırıldıktan sonra elde edilen `product_id` değerleri toplanır ve bu kimliklerle eş zamanlı olarak iki ek sorgu çalıştırılır: `products` tablosundan `category_id` ve `low_stock_threshold`, `inventory_summary` görünümünden ise `daily_velocity`, `days_until_empty` ve `abc_class` bilgileri çekilir. Her iki sorgunun sonuçları birer harita (`categoryMap`, `thresholdMap`, `velocityMap`) yapısına dönüştürülür. Orijinal satırlar bu haritalarla birleştirilerek `InventoryRowWithCategory` tipinde nesneler oluşturulur; `abc_class` değeri yalnızca `'A'`, `'B'` veya `'C'` ise kabul edilir, aksi halde `null` atanır. Son olarak `params.filters.category` dizisinin ilk elemanı varsa satırlar bu kategoriye göre filtrelenir, toplam eşleşen kayıt sayısı hesaplanır ve `params.page` ile `params.pageSize` kullanılarak dilimleme yapılır.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase veritabanı istemcisi; sorguların yürütülmesi için kullanılır.
- `params`: `FetchParams` — Sıralama (`sort.key`, `sort.dir`), arama sorgusu (`query`), filtreler (`filters.category`) ve sayfalama (`page`, `pageSize`) bilgilerini içeren parametre nesnesi.

**Dönüş**: `Promise<FetchResult<InventoryRowWithCategory>` — Asenkron olarak çözülen bir Promise döner. Çözüldüğünde iki alan içeren bir nesne üretir: `rows` alanı, sayfalanmış `InventoryRowWithCategory` dizisini; `totalMatched` alanı ise kategori filtresi uygulandıktan sonra toplam eşleşen kayıt sayısını (`number`) içerir. `InventoryRowWithCategory` satırları şu alanları taşır: `product_id` (string), `name` (string), `physical_stock` (number), `reserved_stock` (number), `available_stock` (number), `warehouse_location` (string veya null), `supplier_name` (string veya null), `category_id` (string veya null), `low_stock_threshold` (number veya null), `daily_velocity` (number veya undefined), `days_until_empty` (number veya undefined), `abc_class` (`'A' | 'B' | 'C'` veya undefined).

### InventoryTableBody
**Ne yapar**: React uygulamasında envanter tablosunun gövde (satır) kısmını render eden bir bileşen fonksiyonu.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni (`React.FC`) olarak tanımlanmıştır. Belirli bir mantık veya durum yönetimi verilmediği için, bileşenin büyük olasılıkla envanter verilerini (muhtemelen `inventoryFetcher` kullanarak) alıp tablo satırlarını oluşturduğu varsayılabilir. Ancak, fonksiyon gövdesi verilmediği için iç travailme detaylanamaz.

**Parametreler**: Fonksiyon herhangi bir parametre almaz.

**Dönüş**: `React.FC` — React tarafından işlevsel bir bileşen olarak değerlendirilen, JSX döndüren bir fonksiyon.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/ExportMenu::ExportMenu
- import: ../../components/admin/InventoryCsvImport::InventoryCsvImport
- import: ../../components/admin/InventoryDetailDrawer::InventoryDetailDrawer
- import: ../../components/admin/InventoryTable::InventoryTable
- import: ../../hooks/useAdminTable::type FetchParams
- import: ../../hooks/useAdminTable::type FetchResult
- import: ../../hooks/useAdminTable::useAdminTable
- import: ../../hooks/useInventoryDetail::useInventoryDetail
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ../../types/inventory::type { InventoryRow }
- import: @/lib/admin/mutateWithAudit::AdminPermissionError
- import: @/lib/admin/mutateWithAudit::mutateWithAudit
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/database.types::type { Database }
- import: @supabase/supabase-js::type { SupabaseClient }
- import: lucide-react::FileUp
- import: react::React
- import: react::useCallback
- import: react::useMemo
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### Category
- `id: string`
- `name: string`

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

### [N1_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::inventoryFetcher
- **params**: `supabase` — SupabaseClient<Database> tipinde istemci; `params` — FetchParams tipinde sayfalama, filtreleme ve sıralama bilgisi
- **ic_degiskenler**:
  - `query` — Supabase sorgu nesnesi; `inventory_velocity` tablosundan belirli sütunları seçer
  - `sortKey` — `params.sort?.key` değerinden türetilen sıralama anahtarı; yoksa `'name'` varsayılır
  - `ascending` — `params.sort?.dir === 'asc'` koşuluyla belirlenen sıralama yönü (boolean)
  - `colMap` — frontend sıralama anahtarlarını veritabanı sütun adlarına eşleyen sözlük (`name→name`, `physical→physical_stock`, `reserved→reserved_stock`, `available→available_stock`, `location→warehouse_location`, `supplier→supplier_name`)
  - `col` — `colMap[sortKey]` ile eşleştirilen veritabanı sütun adı; eşleşme yoksa varsayılan `'name'` sıralaması uygulanır
  - `like` — `params.query` değerinden türetilen `%...%` desenli arama filtresi
  - `data` — sorgu sonucu gelen satırlar dizisi
  - `error` — sorgu hatası; varsa throw edilir
  - `items` — `data || []` ile null-safe hale getirilmiş satır dizisi
  - `productIds` — `items` içindeki her satırdan `product_id` alanının string karşılığı; boş değerler filtrelenir
  - `categoryMap` — `products` tablosundan çekilen `id→category_id` eşleme sözlüğü
  - `thresholdMap` — `products` tablosundan çekilen `id→low_stock_threshold` eşleme sözlüğü
  - `velocityMap` — `inventory_summary` görünümünden çekilen `product_id→{daily, days, abc}` eşleme sözlüğü; `abc_class` yalnızca `'A'`, `'B'`, `'C'` ise kabul edilir, diğerleri `null` atanır
  - `productsData` — `products` tablosundan `id, category_id, low_stock_threshold` alanlarıyla çekilen veri
  - `summaryData` — `inventory_summary` görünümünden `product_id, daily_velocity, days_until_empty, abc_class` alanlarıyla çekilen veri
  - `p` — `productsData.forEach` içindeki tekil ürün nesnesi
  - `v` — `summaryData.forEach` içindeki tekil velocity nesnesi
  - `pid` — `v.product_id`; yoksa return ile atlanır
  - `abc` — `v.abc_class` değeri
  - `rows` — `items.map` ile oluşturulan `InventoryRowWithCategory` dizisi; her satırda `categoryMap`, `thresholdMap` ve `velocityMap` eşleştirmeleri yapılır
  - `r` — `items.map` içindeki ham satır
  - `item` — `r as Record<string, unknown>` ile tip dönüşümü yapılmış satır
  - `pId` — `item.product_id`'nin string karşılığı
  - `vel` — `velocityMap[pId]` ile eşleştirilen velocity verisi
  - `categoryFilter` — `params.filters.category?.[0]` ile alınan kategori filtre değeri
  - `filteredRows` — `categoryFilter` varsa `rows`'u kategoriye göre filtreler; yoksa tüm `rows`
  - `totalMatched` — `filteredRows.length`; toplam eşleşen satır sayısı
  - `offset` — `(params.page - 1) * params.pageSize` ile hesaplanan sayfa ofseti
  - `paginatedRows` — `filteredRows.slice(offset, offset + params.pageSize)` ile sayfalanmış satırlar
- **Dönüş**: `Promise<FetchResult<InventoryRowWithCategory>>` — `{ rows: paginatedRows, totalMatched }`

### [N2_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::InventoryTableBody
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan alınan çeviri fonksiyonu
  - `canWrite` — `useRole()` hook'undan alınan yetki kontrol fonksiyonu
  - `hasWriteAccess` — `canWrite('inventory')` sonucu; envanter kaynağına yazma yetkisi (boolean)
  - `categories` — `useState<Category[]>([])` ile yönetilen kategori listesi state'i
  - `setCategories` — kategori listesi state setter fonksiyonu
  - `csvImportOpen` — `useState(false)` ile yönetilen CSV içe aktarma modalı açık/kapalı durumu
  - `setCsvImportOpen` — CSV import modalı durumu setter fonksiyonu
  - `active` — useEffect cleanup fonksiyonu için bayrak; bileşen unmount olduğunda `false` yapılır
  - `table` — `useAdminTable<InventoryRowWithCategory>` hook'u; `resource: 'inventory'`, `rowId: (r) => r.product_id`, `fetcher: inventoryFetcher`, `pageSize: PAGE_SIZE`, `syncUrl: true` ile yapılandırılmıştır
  - `detail` — `useInventoryDetail` hook'u; stok detay çekmecesi mantığını yönetir; `hasWriteAccess`, `rows: table.rows`, `onMutated: table.reload` parametreleriyle çağrılır
  - `handleUpdateLocation` — `useCallback` ile sarılmış async fonksiyon; `productId` ve `val` parametreleriyle `products` tablosundaki `warehouse_location` alanını günceller; `mutateWithAudit` ile denetim kaydı tutar; başarılıysa `toast.success` gösterir ve `table.reload()` çağırır; hata durumunda `AdminPermissionError` veya genel hata mesajı gösterir
  - `handleUpdateSupplier` — `useCallback` ile sarılmış async fonksiyon; `productId` ve `val` parametreleriyle `products` tablosundaki `supplier_name` alanını günceller; `mutateWithAudit` ile denetim kaydı tutar; başarılıysa `toast.success` gösterir ve `table.reload()` çağırır; hata durumunda `AdminPermissionError` veya genel hata mesajı gösterir
  - `categoryOptions` — `useMemo` ile hesaplanan; `categories` dizisini `{value: c.id, label: c.name}` formatına dönüştüren seçenek listesi
  - `exportCsv` — `useCallback` ile sarılmış async fonksiyon; `table.fetchAllForExport()` ile tüm satırları çeker, CSV formatında BOM'lu UTF-8 dosyası oluşturur ve tarayıcı üzerinden indirir
- **Dönüş**: JSX.Element — AdminToolbar, InventoryTable, InventoryDetailDrawer ve koşullu InventoryCsvImport bileşenlerini içeren div

### [N3_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::useEffect_async
- **params**: yok
- **ic_degiskenler**:
  - `active` — useEffect scope'unda tanımlanan boolean bayrak; cleanup fonksiyonu tarafından `false` yapılır
  - `data` — `supabaseBrowserClient.from('categories').select('id, name').order('name')` sorgusundan dönen kategori verisi
- **Dönüş**: yok — yan etki: `setCategories(data)` ile kategori state'ini günceller

### [N4_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::useEffect_cleanup
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `active = false` ataması yapar; bileşen unmount olduğunda async işlemi iptal eder

### [N5_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::handleUpdateLocation
- **params**: `productId` — güncellenecek ürünün ID'si (string); `val` — yeni konum değeri (string)
- **ic_degiskenler**:
  - `row` — `table.rows.find((r) => r.product_id === productId)` ile bulunan mevcut satır
  - `before` — `{ warehouse_location: row?.warehouse_location || null }` ile oluşturulan güncelleme öncesi durum nesnesi
  - `after` — `{ warehouse_location: val || null }` ile oluşturulan güncelleme sonrası durum nesnesi
  - `error` — `supabaseBrowserClient.from('products').update(...).eq('id', productId)` sorgusundan dönen hata
  - `e` — `catch` bloğunda yakalanan hata nesnesi
  - `msg` — `AdminPermissionError` ise yetki hatası mesajı, `Error` ise `e.message`, diğer durumlarda genel hata mesajı
- **Dönüş**: `Promise<void>` — yan etki: veritabanında `warehouse_location` günceller, audit kaydı oluşturur, toast gösterir, tabloyu yeniler

### [N6_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::handleUpdateLocation_fn
- **params**: yok
- **ic_degiskenler**:
  - `error` — `supabaseBrowserClient.from('products').update({ warehouse_location: val || null }).eq('id', productId)` sorgusundan dönen hata; varsa throw edilir
- **Dönüş**: yok — yan etki: `products` tablosunda `warehouse_location` alanını günceller

### [N7_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::handleUpdateSupplier
- **params**: `productId` — güncellenecek ürünün ID'si (string); `val` — yeni tedarikçi adı (string)
- **ic_degiskenler**:
  - `row` — `table.rows.find((r) => r.product_id === productId)` ile bulunan mevcut satır
  - `before` — `{ supplier_name: row?.supplier_name || null }` ile oluşturulan güncelleme öncesi durum nesnesi
  - `after` — `{ supplier_name: val || null }` ile oluşturulan güncelleme sonrası durum nesnesi
  - `error` — `supabaseBrowserClient.from('products').update(...).eq('id', productId)` sorgusundan dönen hata
  - `e` — `catch` bloğunda yakalanan hata nesnesi
  - `msg` — `AdminPermissionError` ise yetki hatası mesajı, `Error` ise `e.message`, diğer durumlarda genel hata mesajı
- **Dönüş**: `Promise<void>` — yan etki: veritabanında `supplier_name` günceller, audit kaydı oluşturur, toast gösterir, tabloyu yeniler

### [N8_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::handleUpdateSupplier_fn
- **params**: yok
- **ic_degiskenler**:
  - `error` — `supabaseBrowserClient.from('products').update({ supplier_name: val || null }).eq('id', productId)` sorgusundan dönen hata; varsa throw edilir
- **Dönüş**: yok — yan etki: `products` tablosunda `supplier_name` alanını günceller

### [N9_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::categoryOptions_memo
- **params**: yok
- **ic_degiskenler**: yok — `categories` dizisi useMemo bağımlılığı olarak kullanılır
- **Dönüş**: `Array<{ value: string, label: string }>` — kategori listesini select seçeneklerine dönüştürür

### [N10_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::categoryOptions_map
- **params**: `c` — tekil kategori nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: `{ value: c.id, label: c.name }` — select option nesnesi

### [N11_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::exportCsv
- **params**: yok
- **ic_degiskenler**:
  - `allRows` — `table.fetchAllForExport()` ile çekilen tüm envanter satırları
  - `cols` — `t()` ile çevrilmiş 7 sütun başlığı dizisi (ürün, fiziksel, rezerve, kullanılabilir, eşik, konum, tedarikçi)
  - `header` — `cols.join(',')` ile oluşturulan CSV başlık satırı
  - `lines` — `allRows.map` ile oluşturulan CSV satırları dizisi; her satırda `name` ve `warehouse_location` ve `supplier_name` çift tırnak içinde escape edilir, `low_stock_threshold` null ise `5` kullanılır
  - `r` — `allRows.map` içindeki tekil satır
  - `csv` — BOM (`\uFEFF`) + header + lines ile oluşturulan tam CSV içeriği
  - `blob` — `new Blob([csv], { type: 'text/csv;charset=utf-8;' })` ile oluşturulan dosya blob'u
  - `url` — `URL.createObjectURL(blob)` ile oluşturulan geçici object URL
  - `a` — `document.createElement('a')` ile oluşturulan indirme linki; `href=url`, `download=inventory_YYYY-MM-DD.csv` olarak ayarlanır
- **Dönüş**: `Promise<void>` — yan etki: tarayıcıda CSV dosyası indirme tetikler, `URL.revokeObjectURL(url)` ile bellek temizliği yapar

### [N12_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::exportCsv_map
- **params**: `r` — tekil envanter satırı
- **ic_degiskenler**: yok
- **Dönüş**: `string` — virgülle ayrılmış CSV satırı; `name` ve `warehouse_location` ve `supplier_name` çift tırnak içinde escape edilmiş, `low_stock_threshold` null ise `5` kullanılmış

---

## NODE ID STANDARD

  file: src\views\admin\InventoryTableBody.tsx
  function: src\views\admin\InventoryTableBody.tsx::inventoryFetcher
  function: src\views\admin\InventoryTableBody.tsx::InventoryTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryTableBody
  export: inventoryFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `hover:bg-admin-accent-hover`, `text-admin-accent-fg`, `text-xs`
- **Layout:** `flex`, `gap-2`, `h-12`, `items-center`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `font-semibold`, `px-6`, `rounded-admin-lg`, `space-y-4`, `transition-colors`