---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\InventoryTableBody.tsx
skeleton_hash: f2557216870b1ae3
entity_hashes:
  func:InventoryTableBody: 751f8b64856cb902
  func:inventoryFetcher: 5268213a578e9446
  overview: fe533ff3e631069f
  style_tokens: 7f2f4a5d5c74fdfb
generated_at: 2026-06-19T20:50:13Z
---

## Genel Bakış
Bu modül, admin panelindeki envanter yönetimi tablosunun gövde (body) kısmını oluşturmakla sorumludur. Supabase veritabanından asenkron olarak envanter verilerini çeken bir işlev ile bu verileri React tablo satırları olarak render eden bir bileşen içermektedir.

## Fonksiyon Grupları
### Veri Çekme İşlemleri
Supabase istemcisi kullanarak envanter verilerini asenkron olarak çeken, sıralama/filtreleme ve sayfalama parametrelerini işleyen, ayrıca ürün kategorileriyle eşleştirme yapan işlev.
- inventoryFetcher

### Tablo Gövdesi Bileşeni
Çekilen envanter verilerini kullanarak admin tablosunun satırlarını oluşturan ve React bileşeni olarak döndüren ana bileşen.
- InventoryTableBody

## Dış Bağımlılıklar
- **Supabase Client**: Dinamik olarak yüklenen ve veritabanı bağlantısını sağlayan temel dış bağımlılık.
- **products tablosu**: Envanter verileriyle ilişkili ürün kategorilerini eşleştirmek için kullanılır.

## Mimari Önem
Bu modül, veri fetching ve UI render'ını tek bir dosyada birleştiren kompakt bir yapıya sahiptir. Hem veri erişim katmanını hem de sunum katmanını barındırması, modüler mimari açısından bir ayrıştırma fırsatı olarak değerlendirilebilir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel mimari varsayımlar, fonksiyon imzaları ve modülün genel yapısına dayanmaktadır. Fonksiyon gövdesine erişim olmadığı için bu varsayımlar sadece arayüz sözleşmelerinden türetilmiştir.

**[Aksiyom 1]:** `inventoryFetcher` fonksiyonu asenkron olarak çalıştırılmalıdır (await veya .then ile ele alınmalıdır). Eğer fonksiyonun döndürdüğü Promise düzgün bir şekilde ele alınmazsa, FetchResult sonucu kaybolur ve çağrı yapan kod için hata oluşur.

**[Aksiyom 2]:** `inventoryFetcher` fonksiyonu çağrılırken `supabase` parametresi, geçerli ve yapılandırılmış bir `SupabaseClient` nesnesi olmalıdır. Eğer geçerli bir Supabase istemcisi sağlanmazsa, veritabanı bağlantısı kurulamaz ve istek başarısız olur.

**[Aksiyom 3]:** `inventoryFetcher` fonksiyonu çağrılırken `params` parametresi, `FetchParams` tipinde geçerli bir nesne olmalıdır. Eğer params parametresi geçersiz, null veya eksik alanlar içeriyorsa, veritabanı isteği hata ile sonuçlanır.

**[Aksiyom 4]:** `inventoryFetcher` fonksiyonunun başarısı, veritabanının `InventoryRowWithCategory` yapısına uygun veri döndürmesine bağlıdır. Eğer veritabanı şeması veya verisi bu yapıyla uyumsuzsa, fonksiyon tip hata üretir veya geçersiz veri döndürür.

**[Aksiyom 5]:** `InventoryTableBody` bir React fonksiyonel bileşenidir (React.FC). Eğer bu bileşen React bileşen bağlamı (örneğin bir JSX ifadesi) dışında kullanılmaya çalışılırsa, React hatası oluşur veya bileşen render edile

---

## FONKSİYON DETAYLARI

### inventoryFetcher
**Ne yapar**: Bu fonksiyon, veritabanından stok envanteri verilerini (ürün ismi, stok miktarları, konum, tedarikçi) çeker, verilen parametrelere göre sıralar, filtreler ve sayfalandırarak döndürür. Ana veri kaynağı `inventory_velocity` görünümüdür; eksik kategori ve düşük stok eşik bilgisi ise `products` tablosundan tamamlanır.

**Nasıl yapar**: Fonksiyon, `params` nesnesindeki sıralama, arama ve filtreleme kriterlerini kullanarak Supabase'e dinamik bir sorgu (`query`) oluşturur. Önce `inventory_velocity` tablosundan temel alan veriyi çeker. Sonra, çekilen ürünlerin `category_id` ve `low_stock_threshold` bilgilerini almak için `products` tablosuna ikinci bir sorgu daha göndererek bu verileri bir harita (`categoryMap`, `thresholdMap`) olarak eşler. Elde edilen verileri `InventoryRowWithCategory` türünde bir diziye dönüştürür, kategori filtresini uygular ve son olarak istenen sayfadaki (`page`) verileri keserek döndürür.

**Parametreler**:
- supabase: `SupabaseClient<Database>` — Veritabanı istemcisi. Veritabanı şemasını (`Database`) temsil eden generic bir tür ile tanımlıdır.
- params: `FetchParams` — Veri çekme, sıralama ve filtreleme parametrelerini içeren nesne.
  - `page`: `number` — İstenen sayfa numarası (1'den başlar).
  - `pageSize`: `number` — Sayfa başına düşen kayıt sayısı.
  - `query`: `string` — Ürün adı üzerinde yapılacak kısmi arama metni.
  - `sort`: `object | undefined` — Sıralama kriterlerini belirtir.
    - `key`: `string` — Sıralanacak alan adı (ör: 'name', 'physical'). Geçersiz bir anahtar gelirse varsayılan olarak 'name' kullanılır.
    - `dir`: `'asc' | 'desc'` — Sıralama yönü.
  - `filters`: `object` — Uygulanacak filtreleri içerir.
    - `category`: `string[] | undefined` — Filtrelenecek kategori ID'si dizisi. İlk elemanı kullanılır.

**Dönüş**: `Promise<FetchResult<InventoryRowWithCategory>>` — Sayfalanmış satırları ve toplam eşleşen kayıt sayısını içeren bir Promise. `FetchResult` yapısı `{ rows: InventoryRowWithCategory[], totalMatched: number }` şeklindedir. `InventoryRowWithCategory`, `inventory_velocity` görünümündeki alanlara ek olarak `category_id` ve `low_stock_threshold` alanlarını da içerir.

### InventoryTableBody
**Ne yapar**: React uygulamasında envanter tablosunun gövde (satır) kısmını render eden bir bileşen fonksiyonu.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni (`React.FC`) olarak tanımlanmıştır. Belirli bir mantık veya durum yönetimi verilmediği için, bileşenin büyük olasılıkla envanter verilerini (muhtemelen `inventoryFetcher` kullanarak) alıp tablo satırlarını oluşturduğu varsayılabilir. Ancak, fonksiyon gövdesi verilmediği için iç travailme detaylanamaz.

**Parametreler**: Fonksiyon herhangi bir parametre almaz.

**Dönüş**: `React.FC` — React tarafından işlevsel bir bileşen olarak değerlendirilen, JSX döndüren bir fonksiyon.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/ExportMenu::ExportMenu
- import: ../../components/admin/InventoryTable::InventoryTable
- import: ../../hooks/useAdminTable::type FetchParams
- import: ../../hooks/useAdminTable::type FetchResult
- import: ../../hooks/useAdminTable::useAdminTable
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ../../types/inventory::type { InventoryRow }
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
type InventoryRowWithCategory = InventoryRow & {
  category_id?: string | null
  low_stock_threshold?: number | null
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::inventoryFetcher
- **params**:
  - `supabase` — Supabase istemcisi, veritabanı sorguları için kullanılır
  - `params` — FetchParams nesnesi, sıralama/sayfalama/filtreleme parametrelerini içerir
- **ic_degiskenler**:
  - `query` — Supabase sorgu nesnesi, `inventory_velocity` view'inden veri çekmek için zincirlenir
  - `sortKey` — Sıralama için kullanılacak alan adı, `params.sort.key` değerinden gelir; `undefined` ise `'name'` kullanılır
  - `ascending` — Boolean, sıralama yönünü belirtir; `params.sort.dir === 'asc'` değerine eşittir
  - `colMap` — Record<string, string>, UI tarafındaki sıralama anahtarlarını veritabanı sütun isimlerine eşler (`name→name`, `physical→physical_stock`, `reserved→reserved_stock`, `available→available_stock`, `location→warehouse_location`, `supplier→supplier_name`)
  - `col` — colMap'ten çözülen gerçek veritabanı sütun adı; bulunamazsa sıralama `name` sütununa yapılır
  - `like` — Arama filtresi deseni, `params.query` değerini `%...%` formatına sarar
  - `data` — Supabase sorgusunun döndürdüğü satır verisi dizisi
  - `error` — Supabase sorgusu sırasında oluşabilecek hata nesnesi; varsa fırlatılır
  - `items` — `data`'nın null-safe karşılığı; `data || []` ifadesinden elde edilir
  - `productIds` — items dizisindeki her satırın `product_id` alanını string'e çevirip boolean filtresiyle boş olmayanları tutan dizi
  - `categoryMap` — Record<string, string>, ürün ID'si → category_id eşleme haritası; products tablosundan doldurulur
  - `thresholdMap` — Record<string, number>, ürün ID'si → low_stock_threshold eşleme haritası; products tablosundan doldurulur
  - `productsData` — products tablosundan çekilen kategori ve eşik değerleri içeren veri dizisi
  - `rows` — InventoryRowWithCategory[] tipinde, view verisi ile products tablosundan gelen category_id ve low_stock_threshold birleştirilmiş tam satır dizisi
  - `categoryFilter` — `params.filters.category?.[0]` değerinden gelen kategori filtre ID'si; yoksa undefined
  - `filteredRows` — Kategori filtresi uygulanmış satır dizisi; filtre yoksa `rows` ile aynı
  - `totalMatched` — Filtreleme sonrası toplam eşleşen satır sayısı
  - `offset` — Sayfalama için başlangıç indeksi, `(params.page - 1) * params.pageSize` hesaplanır
  - `paginatedRows` — `filteredRows` dizisinin mevcut sayfaya ait dilimi, `slice(offset, offset + params.pageSize)` ile elde edilir
- **Dönüş**: `{ rows: InventoryRowWithCategory[], totalMatched: number }` — Sayfalanmış satır dizisi ve toplam eşleşme sayısı

---

### [N2_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody
- **params**: (parametre yok — React bileşen)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, tüm UI metinlerinin uluslararasılaştırılmasını sağlar
  - `canWrite` — `useRole()` hook'undan gelen yetkilendirme kontrol fonksiyonu
  - `hasWriteAccess` — Boolean, `canWrite('inventory')` çağrısının sonucu; envanter üzerinde yazma yetkisi olup olmadığını belirler
  - `categories` — `useState<Category[]>([])` state'i, kategori filtresi için tüm kategorileri tutar
  - `table` — `useAdminTable<InventoryRowWithCategory>()` hook'undan dönen tablo yönetimi nesnesi; `filtering`, `rows`, `totalMatched`, `reload()`, `fetchAllForExport()` gibi üyeleri barındırır
  - `handleUpdateLocation` — `useCallback` ile sarılmış asenkron fonksiyon, belirli bir ürünün depo konumunu günceller; `mutateWithAudit` ile audit log oluşturur
  - `handleUpdateSupplier` — `useCallback` ile sarılmış asenkron fonksiyon, belirli bir ürünün tedarikçisini günceller; `mutateWithAudit` ile audit log oluşturur
  - `categoryOptions` — `useMemo` ile hesaplanmış seçenekler dizisi, `categories` state'ini `{value, label}` formatına dönüştürür
  - `exportCsv` — `useCallback` ile sarılmış asenkron fonksiyon, tablodaki tüm veriyi CSV formatına dönüştürüp tarayıcıda indirme tetikler
  - `allRows` — `exportCsv` içinde `table.fetchAllForExport()` ile çekilen tüm satırlar (sayfalama olmadan tam veri)
  - `cols` — CSV sütun başlıklarının çevrilmiş isimleri dizisi
  - `header` — CSV dosyasının ilk satırı, sütun başlıklarını virgülle birleştirir
  - `lines` — Her satırı CSV formatına dönüştürülmüş dizgi dizisi; string değerleri tırnak ile sarıp escape eder
  - `csv` — Tam CSV dosya içeriği; BOM (`\uFEFF`) ile başlar, header ve lines birleştirilir
  - `blob` — CSV içeriğinden oluşturulan Blob nesnesi, `text/csv;charset=utf-8;` MIME tipi ile
  - `url` — `URL.createObjectURL(blob)` ile oluşturulmuş tarayıcı içi dosya URL'i
  - `a` — `document.createElement('a')` ile oluşturulan gizli HTML anchor elemanı, indirme işlemini tetikler
- **Dönüş**: JSX (`<div>` içinde `<AdminToolbar>` ve `<InventoryTable>` bileşenleri)

---

### [N3_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::useEffect(categories-fetch)
- **params**: (callback içinde parametre yok)
- **ic_degiskenler**:
  - `active` — Boolean flag, bileşen unmount olduktan sonra state güncellemesini engeller; cleanup'ta `false` yapılır
  - `data` — `supabaseBrowserClient.from('categories').select('id, name')` sorgusundan dönen kategori dizisi
- **Dönüş**: Cleanup fonksiyonu döndürür — `active`'yi `false` yaparak unmount sonrası state güncellemesini iptal eder

---

### [N4_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::useEffect(categories-fetch)::async-inner
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase'den çekilen kategori verisi (`id, name` alanları ile)
- **Dönüş**: void — `setCategories(data)` ile state'i günceller

---

### [N5_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::useEffect(cleanup)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — `active` flag'ini `false` yaparak bileşen unmount sonrası async aktualizasyonları devre dışı bırakır

---

### [N6_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::handleUpdateLocation
- **params**:
  - `productId` — string, güncellenecek ürünün benzersiz tanımlayıcısı
  - `val` — string, atanacak yeni depo konumu değeri
- **ic_degiskenler**:
  - `row` — `table.rows.find()` ile bulunan mevcut satır nesnesi; ürünün güncel verisini temsil eder
  - `before` — `{ warehouse_location: row?.warehouse_location || null }` — güncelleme öncesi depo konumu değeri (audit log için)
  - `after` — `{ warehouse_location: val || null }` — güncelleme sonrası depo konumu değeri (audit log için)
  - `error` — Supabase update sorgusundan dönen hata nesnesi
  - `e` — try-catch yakalanan hata nesnesi; `AdminPermissionError`, `Error` veya bilinmeyen tür olabilir
  - `msg` — Kullanıcıya gösterilecek hata mesajı; yetki hatası, bilinen hata veya genel hata mesajı olarak koşullu belirlenir
- **Dönüş**: void — Yan etkiler: `mutateWithAudit` ile veritabanını günceller, `toast.success`/`toast.error` ile bildirim gösterir, `table.reload()` ile tabloyu yeniler

---

### [N7_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::handleUpdateLocation::mutateWithAudit-fn
- **params**: (parametre yok — mutateWithAudit callback'i)
- **ic_degiskenler**:
  - `error` — `supabaseBrowserClient.from('products').update()` sorgusundan dönen hata nesnesi
- **Dönüş**: void — `error` varsa fırlatır, yoksa sessizce tamamlanır

---

### [N8_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::handleUpdateSupplier
- **params**:
  - `productId` — string, güncellenecek ürünün benzersiz tanımlayıcısı
  - `val` — string, atanacak yeni tedarikçi adı değeri
- **ic_degiskenler**:
  - `row` — `table.rows.find()` ile bulunan mevcut satır nesnesi; ürünün güncel verisini temsil eder
  - `before` — `{ supplier_name: row?.supplier_name || null }` — güncelleme öncesi tedarikçi adı (audit log için)
  - `after` — `{ supplier_name: val || null }` — güncelleme sonrası tedarikçi adı (audit log için)
  - `error` — Supabase update sorgusundan dönen hata nesnesi
  - `e` — try-catch yakalanan hata nesnesi; `AdminPermissionError`, `Error` veya bilinmeyen tür olabilir
  - `msg` — Kullanıcıya gösterilecek hata mesajı; yetki hatası, bilinen hata veya genel hata mesajı olarak koşullu belirlenir
- **Dönüş**: void — Yan etkiler: `mutateWithAudit` ile veritabanını günceller, `toast.success`/`toast.error` ile bildirim gösterir, `table.reload()` ile tabloyu yeniler

---

### [N9_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::handleUpdateSupplier::mutateWithAudit-fn
- **params**: (parametre yok — mutateWithAudit callback'i)
- **ic_degiskenler**:
  - `error` — `supabaseBrowserClient.from('products').update()` sorgusundan dönen hata nesnesi
- **Dönüş**: void — `error` varsa fırlatır, yoksa sessizce tamamlanır

---

### [N10_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::categoryOptions::mapper
- **params**:
  - `c` — Category nesnesi, `id` ve `name` alanlarını içerir
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ value: string, label: string }` — Select bileşeni için seçenek nesnesi

---

### [N11_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::exportCsv
- **params**: (parametre yok — useCallback callback'i)
- **ic_degiskenler**:
  - `allRows` — `table.fetchAllForExport()` ile çekilen tüm envanter satırları (sayfalama olmadan tam veri seti)
  - `cols` — CSV sütun başlıklarının çevrilmiş metinleri dizisi: ürün adı, fiziksel stok, rezerve stok, mevcut stok, eşik değeri, konum, tedarikçi
  - `header` — Sütun başlıklarının virgülle birleştirilmiş tek satırlık string'i
  - `lines` — Her satırın CSV formatına dönüştürülmüş hali; string değerler çift tırnak ile sarılıp escape edilir, sayısal değerler olduğu gibi yazılır
  - `csv` — Tam CSV dosya içeriği; Unicode BOM (`\uFEFF`) ile başlar, header ve lines `\n` ile birleştirilir
  - `blob` — CSV içeriğinden oluşturulan Blob nesnesi, `text/csv;charset=utf-8;` MIME tipi ile
  - `url` — `URL.createObjectURL(blob)` ile oluşturulmuş tarayıcı içi dosya URL'i
  - `a` — `document.createElement('a')` ile oluşturulan gizli anchor elemanı; `href` ve `download` attribute'ları ayarlanıp programatik olarak `click()` ile tetiklenir; indirme adı `inventory_YYYY-MM-DD.csv` formatındadır
- **Dönüş**: void — Yan etkiler: tarayıcıda CSV dosyası indirme dialogu açtırır, ardından URL nesnesini serbest bırakır

---

### [N12_NASIL] AST Pointer: `src/views/admin/InventoryTableBody.tsx`::InventoryTableBody::exportCsv::row-mapper
- **params**:
  - `r` — InventoryRowWithCategory nesnesi, tek bir envanter satırını temsil eder
- **ic_degiskenler**: (yok — inline ifadeler kullanılır)
- **Dönüş**: string — Virgülle ayrılmış CSV satırı; `name`, `physical_stock`, `reserved_stock`, `available_stock`, `low_stock_threshold` (varsayılan 5), `warehouse_location`, `supplier_name` alanlarını içerir

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
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `space-y-4`