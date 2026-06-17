---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\InventoryTableBody.tsx
skeleton_hash: 230a26ce5ddeb33b
entity_hashes:
  func:InventoryTableBody: 751f8b64856cb902
  func:inventoryFetcher: c1e9c9c238ff9e93
  overview: 5953a3f5f4fb270b
  style_tokens: ba4dbfa6de03d007
generated_at: 2026-06-17T13:25:30Z
---

## Genel Bakış
Bu modül, admin panelindeki envanter yönetimi tablosunun gövde (body) kısmını oluşturmakla sorumludur. Asenkron veri çekme işlevi ile supabase veritabanından envanter verilerini getirir ve bu verileri React tablo satırları olarak render eden bir bileşen sunar.

## Fonksiyon Grupları
### Veri Çekme İşlemleri
Supabase istemcisi kullanarak envanter verilerini asenkron olarak çeken ve sayfalama/dilimleme parametrelerini işleyen işlev.
- inventoryFetcher

### Tablo Gövdesi Bileşeni
Çekilen envanter verilerini kullanarak admin tablosunun satırlarını oluşturan ve React bileşeni olarak döndüren ana bileşen.
- InventoryTableBody

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### inventoryFetcher
**Ne yapar**: Veritabanındaki `inventory_velocity` view'inden envanter verilerini çekerek sıralar, filtreler ve sayfalar. Ayrıca, view'da bulunan `product_id` referansıyla `products` tablosundan kategori bilgisini eşleştirir ve düzenlenmiş bir `InventoryRowWithCategory` dizisi ile toplam eşleşme sayısını döndürür.

**Nasıl yapar**: Fonksiyon, verilen `supabase` istemcisiyle `inventory_velocity` tablosuna bir sorgu başlatır. `params.sort` nesnesindeki anahtar ve yön bilgisini kullanarak dinamik bir sıralama uygular; eğer geçerli bir sıralama anahtarı yoksa varsayılan olarak `name` sütununu artan şekilde kullanır. `params.query` parametresi sağlanmışsa, `name` sütunu üzerinde büyük/küçük harf duyarsız bir `ILIKE` araması yapar. Sorgu çalıştırıldıktan sonra, elde edilen verilerin `product_id` değerleri toplanır ve `products` tablosundan bu ürünlere karşılık gelen `category_id` değerleri çekilerek bir eşleme haritası (`categoryMap`) oluşturulur. Ham veriler, `InventoryRowWithCategory` tipine dönüştürülür ve `category_id` alanı bu haritadan doldurulur. Ardından, `params.filters.category` parametresinde bir kategori filtresi varsa, sadece o kategoriye ait satırlar filtrelenir. Son olarak, toplam eşleşme sayısına göre `params.page` ve `params.pageSize` kullanılarak sayfalama yapılır ve `rows` ile `totalMatched` alanlarını içeren bir nesne döndürülür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase veritabanı bağlantısını sağlayan istemci nesnesi.
- `params`: `FetchParams` — Sorgu için gerekli parametreleri içeren nesne; şu alanları kullanır:
    - `sort?: { key: string; dir: 'asc' | 'desc' }` — Sıralama anahtarı ve yönü.
    - `query?: string` — İsim üzerinde yapılacak arama dizesi.
    - `filters?: { category?: string[] }` — Kategori filtresi için dizi.
    - `page: number` — İstenen sayfa numarası (1'den başlar).
    - `pageSize: number` — Sayfa başına satır sayısı.

**Dönüş**: `Promise<FetchResult<InventoryRowWithCategory>>` — Asenkron bir promise olarak, `rows` (mevcut sayfadaki satırlar dizisi) ve `totalMatched` (filtreleme sonrası toplam satır sayısı) alanlarını içeren bir nesne döndürür.

### InventoryTableBody
**Ne yapar**: React uygulamasında envanter tablosunun gövde (satır) kısmını render eden bir bileşen fonksiyonu.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni (`React.FC`) olarak tanımlanmıştır. Belirli bir mantık veya durum yönetimi verilmediği için, bileşenin büyük olasılıkla envanter verilerini (muhtemelen `inventoryFetcher` kullanarak) alıp tablo satırlarını oluşturduğu varsayılabilir. Ancak, fonksiyon gövdesi verilmediği için iç travailme detaylanamaz.

**Parametreler**: Fonksiyon herhangi bir parametre almaz.

**Dönüş**: `React.FC` — React tarafından işlevsel bir bileşen olarak değerlendirilen, JSX döndüren bir fonksiyon.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/InventoryTable::InventoryTable
- import: ../../hooks/useAdminTable::type FetchParams
- import: ../../hooks/useAdminTable::type FetchResult
- import: ../../hooks/useAdminTable::useAdminTable
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ../../types/inventory::Density
- import: ../../types/inventory::InventoryRow
- import: ../../types/inventory::LoadState
- import: ../../types/inventory::SortKey
- import: @/lib/admin/mutateWithAudit::AdminPermissionError
- import: @/lib/admin/mutateWithAudit::mutateWithAudit
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/database.types::type { Database }
- import: @supabase/supabase-js::type { SupabaseClient }
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
type InventoryRowWithCategory = InventoryRow & { category_id?: string | null }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::inventoryFetcher
- **params**: `supabase: SupabaseClient<Database>`, `params: FetchParams`
- **ic_degiskenler**:
  - `query` — Supabase sorgu oluşturucusu, başlangıçta 'inventory_velocity' tablosunu seçer, ardından sıralama ve arama filtreleri eklenir
  - `sortKey` — Sıralama anahtarı, params.sort?.key değerinden alınır, yoksa 'name' kullanılır
  - `ascending` — Sıralama yönü布尔値, params.sort?.dir === 'asc' kontrolünden elde edilir
  - `colMap` — Kullanıcı arayüzü sıralama anahtaronları ile veritabanı sütun adları arasındaki eşleme sözlüğü
  - `col` — Sıralama için kullanılacak veritabanı sütun adı, colMap sözlüğünden sortKey ile aranır
  - `like` — Arama filtresi için LIKE kalıbı, params.query değerinden '%{query}%' formatında oluşturulur
  - `data` — Supabase sorgusunun döndürdüğü ham veri dizisi
  - `error` — Supabase sorgusundaki hata nesnesi
  - `items` — data veya boş dizi, sorgu sonucu satırlar
  - `productIds` — items dizisinden ürün ID'lerinin string dizisi, boş olanlar filtrelenir
  - `categoryMap` — Ürün ID'lerinden kategori ID'lerine eşleme sözlüğü, products tablosundan doldurulur
  - `productsData` — products tablosundan çekilen ürün-kategori eşleştirme verisi
  - `rows` — InventoryRowWithCategory[] dizisi, items dizisi üzerinde dönüştürme yapılarak category_id eklenir
  - `categoryFilter` — Kategori filtresi değeri, params.filters.category[0]'den alınır
  - `filteredRows` — Kategori filtresi uygulanmış satırlar dizisi
  - `totalMatched` — Eşleşen toplam satır sayısı (filteredRows.length)
  - `offset` — Sayfalama için başlangıç indeksi, (params.page-1)*params.pageSize hesaplanır
  - `paginatedRows` — Mevcut sayfaya ait satırlar dizisi, filteredRows.slice ile elde edilir
- **Dönüş**: `{ rows: InventoryRowWithCategory[], totalMatched: number }`

### [N2_NASIL] AST Pointer: src/views/admin/InventoryTableBody.tsx::InventoryTableBody
- **params**: yok
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu
  - `canWrite` — useRole() hook'undan gelen yazma izni kontrol fonksiyonu
  - `hasWriteAccess` — Boolean, 'inventory' kaynağı için yazma izni durumu
  - `categories` — State değişkeni, kategori listesi tutar, başlangıçta boş dizi
  - `selectedRow` — State değişkeni, seçili satırı tutar, başlangıçta null
  - `active` — useEffect temizlik bayrağı, bileşen kaldırıldığında state güncellemesini önler
  - `rows` — useAdminTable hook'undan gelen mevcut satır verileri
  - `totalMatched` — useAdminTable hook'undan toplam eşleşen satır sayısı
  - `isLoading` — useAdminTable hook'undan yükleme durumu布尔値
  - `error` — useAdminTable hook'undan hata mesajı
  - `reload` — useAdminTable hook'undan verileri yeniden yükleme fonksiyonu
  - `pagination` — useAdminTable hook'undan sayfalama durumu ve kontrolleri
  - `sorting` — useAdminTable hook'undan sıralama durumu ve kontrolleri
  - `filtering` — useAdminTable hook'undan filtreleme durumu ve kontrolleri
  - `handleUpdateLocation` — useCallback ile oluşturulan, ürün konumunu güncelleyen asenkron fonksiyon
  - `handleUpdateSupplier` — useCallback ile oluşturulan, tedarikçi bilgisini güncelleyen asenkron fonksiyon
  - `categoryOptions` — useMemo ile hesaplanan, kategori seçenekleri dizisi (value-label formatında)
- **Dönüş**: React JSX elementi (AdminToolbar, InventoryTable ve sayfalama kontrollerini içeren div)

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
- **Renkler:** `bg-slate-900`, `border-t`, `border-white/5`, `hover:bg-slate-800`, `text-cyan-400`, `text-slate-400`, `text-slate-500`, `text-white`, `text-xs`
- **Layout:** `flex`, `gap-2`, `items-center`, `justify-between`
- **Varyant/Responsive:** `disabled:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `disabled:opacity-50`, `font-bold`, `pt-4`, `px-4`, `py-2`, `rounded-lg`, `space-y-4`, `tracking-widest`, `transition-colors`, `uppercase`