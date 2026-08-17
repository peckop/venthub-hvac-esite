---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\admin\purchasing\PurchasingTableBody.tsx
skeleton_hash: 7d0d4ced1c2687a3
entity_hashes:
  func:PurchasingTableBody: 10eccfe22d93ec03
  func:purchasingFetcher: 4f3c5d644184676d
  overview: e454d7750c0fb8eb
  style_tokens: fbefabc584f01f12
generated_at: 2026-08-17T11:05:56Z
---

## Genel Bakış

Bu modül, admin panelindeki satın alma (purchasing) sayfasının tablo gövdesini oluşturur. Supabase üzerinden satın alma siparişi verilerini çekip, tablo formatında kullanıcıya sunan bir bileşen ve onun veri çekme mantığını içerir.

## Fonksiyon Grupları

### Veriçekme (Data Fetching)
Satın alma siparişlerinin Supabase veritabanından çekilmesinden sorumludur. Sayfalama, filtreleme ve sıralama parametrelerini alarak uygun veri kümesini döndürür.
- purchasingFetcher

### Görsel Sunum (UI Rendering)
Çekilen verileri tablo satırları olarak render eder. Kullanıcı arayüzünde satın alma siparişlerinin gövde kısmını oluşturur ve gerekli bileşenleri bir araya getirir.
- PurchasingTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayımlar, verilen fonksiyon imzaları ve modül sabitleri temel alınarak belirlenmiştir.

[Aksiyom 1]: Eğer `purchasingFetcher` fonksiyonuna geçerli bir `SupabaseClient<Database>` nesnesi (`supabase` parametresi) sağlanmazsa, veritabanı bağlantısı kurulamaz ve fonksiyon hata verir veya hiç çalışmaz.

[Aksiyom 2]: Eğer `purchasingFetcher` fonksiyonuna `FetchParams` formatında geçerli parametreler (`params` parametresi) verilmezse, fetch isteği hatalı formatta olur ve beklenmedik hatalar veya hatalı/eksik veri dönüşüne

---

## FONKSİYON DETAYLARI

### purchasingFetcher

**Ne yapar**: Satın alma siparişlerini (purchase orders) Supabase veritabanından filtrelenmiş, sıralanmış ve sayfalılmış şekilde çeken asenkron veri getirici fonksiyondur. Tedarikçi adı ile metin araması, durum bazlı filtreleme, çoklu sıralama ve sayfalama işlemlerini tek bir çağrıda gerçekleştirilerek tablo verisini hazırlar.

**Nasıl yapar**: Fonksiyon önce `ensureSessionFresh()` çağrısı ile oturumun geçerliliğini garanti altına alır. Ardından `purchase_orders` tablosunu `suppliers` (tedarikçi adı) ve `purchase_order_items` (sipariş kalemleri) ilişkili tablolarıyla birlikte `select` ile sorgular. `params.filters.status` dizisindeki durum değerlerine göre `eq` veya `in` filtresi uygular. Eğer `params.query` metin araması parametresi doluysa, ayrı bir sorguyla `suppliers` tablosunda isim eşleşmesi yapar ve bulunan tedarikçi ID'lerini ana sorguya `in` filtresi olarak ekler — hiçbir eşleşme bulunamazsa boş döner. Sıralama parametreye göre `status` veya `created_at` alanına yapılır, belirtilmemişse `created_at` azalan sırayla varsayılır. `range` ile sayfalama uygulanarak veri çekilir. Son olarak sipariş kalemlerindeki `product_id`'ler benzersiz küme로 toplanır ve `products` tablosundan `id`, `name`, `sku` alanları getirilerek bir harita (`Map`) oluşturulur. Her sipariş satırı, `PoAdminRow` yapısına dönüştürülür; tedarikçi adı `suppliers.name`'den, ürün adı ve SKU'su ise haritadan alınarak `EMPTY_DASH` ile varsayılan değerler tamamlanır.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Tip güvenli Supabase istemcisi; Database generic'i ile veritabanı şeması bilgisini taşır ve tablo/sütun isimlerinin derleme zamanında doğrulanmasını sağlar
- `params`: `FetchParams` — Getirme işlemini kontrol eden parametre nesnesi; içinde `filters` (durum filtresi dizisi), `query` (tedarikçi adı arama terimi), `sort` (sıralama alanı ve yönü: `{ key: 'status' | 'created_at', dir: 'asc' | 'desc' }`) ve `page` / `pageSize` (sayfalama bilgileri) alanlarını barındırır

**Dönüş**: `Promise<FetchResult<PoAdminRow>>` — Asenkron olarak `rows` (dönüştürülmüş sipariş satırları dizisi, her biri tedarikçi adı ve zenginleştirilmiş kalemlerle) ve `totalMatched` (toplam eşleşen kayıt sayısı, sayfalama bilgisi için gerekli) alanlarını içeren nesne döner.

### PurchasingTableBody
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../../components/admin/AdminToolbar::AdminToolbar
- import: ../../../components/admin/data-table/DataTableKit::DataTableKit
- import: ../../../components/admin/data-table/FacetedFilter::FacetedFilter
- import: ../../../components/admin/data-table/types::type { AdminColumn, DataTableFacet }
- import: ../../../components/admin/purchasing/CreatePurchaseOrderPanel::CreatePurchaseOrderPanel
- import: ../../../hooks/useAdminTable::type FetchParams
- import: ../../../hooks/useAdminTable::type FetchResult
- import: ../../../hooks/useAdminTable::useAdminTable
- import: ../../../hooks/useRole::useRole
- import: ../../../i18n/datetime::formatDate
- import: ../../../lib/ensureSessionFresh::ensureSessionFresh
- import: ../../../types/database.types::type { Database }
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/utils/adminUi::adminTableActionPrimaryClass
- import: @supabase/supabase-js::type { SupabaseClient }
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### PoAdminRow extends PurchaseOrderRow
- `supplier_name: string`
- `items: (PurchaseOrderItemRow & { product_name: string; product_sku: string })[]`

### ReceiptDraft
Kabul formu taslağı — satır başına miktar + isteğe bağlı fatura maliyeti.
- `documentNo: string`
- `note: string`
- `qty: Record<string, string>`
- `unitCost: Record<string, string>`

---

## SABİTLER
- **STATUS_VALUES** (as_expression) — `['draft', 'ordered', 'partially_received', 'received', 'closed', 'cancelled']...`
- **inputClass** (str) — `'h-9 rounded-admin-md bg-admin-surface border border-admin-border px-3 text-s...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::purchasingFetcher
- **params**: `(supabase: SupabaseClient<Database>, params: FetchParams)`
- **ic_degiskenler**:
  - `query` — Supabase sorgu nesnesi, purchase_orders tablosunu select eder, ilişkili suppliers ve purchase_order_items verilerini çeker
  - `statuses` — params.filters.status dizisinden filtrelenen ve STATUS_VALUES ile uyumlu statü dizisi
  - `term` — params.query trim edilmiş arama terimi, tedarikçi adı araması için kullanılır
  - `supplierMatches` — suppliers tablosunda ilike ile eşleşen tedarikçi kayıtları (id alanları)
  - `supplierError` — supplier sorgusu hata nesnesi
  - `ids` — eşleşen tedarikçilerin id dizisi
  - `ascending` — params.sort.dir değerine göre sıralama yönü (true ise ascending)
  - `offset` — sayfalama için hesaplanan offset değeri
  - `data` — purchase_orders tablosundan dönen ham veri dizisi
  - `error` — ana sorgu hata nesnesi
  - `count` — toplam eşleşen satır sayısı
  - `orders` — data ?? [] fallback ile purchase_orders dizisi
  - `totalMatched` — toplam eşleşen satır sayısı, count sayısal ise count aksi halde orders.length
  - `productIds` — tüm siparişlerdeki benzersiz product_id'lerin dizisi
  - `products` — products tablosundan id, name, sku alanlarıyla çekilen ürün dizisi
  - `productError` — products sorgusu hata nesnesi
  - `productMap` — products verisinden Map<id, product> oluşturulmuş harita
  - `rows` — PoAdminRow[] dizisi, orders.map ile supplier_name ve items bilgileri eklenmiş nihai satırlar
- **Dönüş**: `Promise<FetchResult<PoAdminRow>>` — { rows, totalMatched } nesnesi

### [N2_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::PurchasingTableBody
- **params**: `(parametre yok)`
- **ic_degiskenler**:
  - `hasWriteAccess` — kullanıcının yazma izni olup olmadığını belirleyen boolean değer
  - `facetCounts` — purchase_orders tablosundaki durum bazlı sayım nesnesi (Record<string, number>)
  - `setFacetCounts` — facetCounts state güncelleme fonksiyonu
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu
  - `lang` — mevcut dil kodu
  - `table` — tablo verileri ve state management için nesne (reload, filtering, filtering.setFilter metodları)
  - `statusLabel` — status değerine göre çevrilmiş etiket dönen fonksiyon
  - `statusBadgeClass` — status değerine göre Tailwind CSS class dönen fonksiyon
  - `statusIcon` — status değerine göre React icon dönen fonksiyon
  - `closeNoteFor` — close notu girilmesi gereken sipariş id'si veya null
  - `setCloseNoteFor` — closeNoteFor state güncelleme fonksiyonu
  - `closeNote` — close notu input değeri
  - `setCloseNote` — closeNote state güncelleme fonksiyonu
  - `updatingId` — şu anda güncellenen sipariş id'si veya null
  - `setUpdatingId` — updatingId state güncelleme fonksiyonu
  - `receiptDrafts` — her sipariş için mal teslim alma draft bilgileri nesnesi
  - `setReceiptDrafts` — receiptDrafts state güncelleme fonksiyonu
  - `receipts` — her sipariş için processed_goods_receipts listesi
  - `setReceipts` — receipts state güncelleme fonksiyonu
  - `emptyReceiptDraft` — boş mal teslim alma draft yapısı
  - `handleTransition` — sipariş durumu geçişi yapan async fonksiyon, toast bildirimleri ve tablo yenileme yanı etkileri
  - `submitReceipt` — mal teslim alma formunu submit eden async fonksiyon, processGoodsReceipt API çağrısı yapar
  - `loadReceipts` — belirli bir siparişin mal teslim alma kayıtlarını yükleyen async fonksiyon
  - `formatDate` — tarih formatlama yardımcı fonksiyonu
- **Dönüş**: `React.FC` — React Fonksiyonel Bileşeni

### [N3_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::useEffect (facetCounts yükleme)
- **params**: `() => void`
- **ic_degiskenler**:
  - `data` — purchase_orders tablosundan status alanıyla çekilen veri dizisi
  - `error` — Supabase sorgusu hata nesnesi
  - `counts` — her status için sayım tutan Record<string, number> nesnesi
  - `row` — data dizisi içindeki her bir purchase_order nesnesi (for döngüsünde)
- **Dönüş**: yok — void, side effect olarak facetCounts state'ini günceller

### [N4_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::handleTransition
- **params**: `(row: PoAdminRow, next: string, noteForClose?: string)`
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu (useEffect içinde, bileşen bağlamından erişim)
  - `hasWriteAccess` — yazma izni boolean değeri
  - `toast` — sonner toast bildirim fonksiyonu
  - `setUpdatingId` — updatingId state güncelleme fonksiyonu
  - `setPurchaseOrderStatus` — Supabase üzerinden sipariş durumu güncelleme API fonksiyonu
  - `supabaseBrowserClient` — tarayıcı tarafı Supabase istemcisi
  - `setCloseNoteFor` — closeNoteFor state güncelleme fonksiyonu
  - `setCloseNote` — closeNote state güncelleme fonksiyonu
  - `table.reload` — tabloyu yeniden yükleyen fonksiyon
- **Dönüş**: yok — void, side effect olarak toast bildirimleri ve tablo yenileme yapar

### [N5_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::submitReceipt
- **params**: `(row: PoAdminRow)`
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu
  - `hasWriteAccess` — yazma izni boolean değeri
  - `toast` — sonner toast bildirim fonksiyonu
  - `draft` — receiptDrafts[row.id] veya emptyReceiptDraft
  - `lines` — row.items.map ile işlenmiş ve filtrelenmiş mal teslim alma satırları dizisi
  - `item` — row.items içindeki her bir purchase_order_item nesnesi
  - `qty` — draft.qty[item.id] değerinden Number ile dönüştürülmüş tam sayı
  - `rawCost` — draft.unitCost[item.id] değerinin trim edilmiş hali
  - `unitCost` — rawCost boş değilse Number ile dönüştürülmüş maliyet
  - `setUpdatingId` — updatingId state güncelleme fonksiyonu
  - `processGoodsReceipt` — mal teslim alma işlemini yapan Supabase API fonksiyonu
  - `supabaseBrowserClient` — tarayıcı tarafı Supabase istemcisi
  - `result` — processGoodsReceipt fonksiyonu sonucu (success, error, received_units, processed_count)
  - `listGoodsReceipts` — siparişin mal teslim alma kayıtlarını getiren API fonksiyonu
  - `setReceiptDrafts` — receiptDrafts state güncelleme fonksiyonu
  - `setReceipts` — receipts state güncelleme fonksiyonu
  - `table.reload` — tabloyu yeniden yükleyen fonksiyon
- **Dönüş**: yok — void, side effect olarak toast bildirimleri ve state güncellemeleri yapar

### [N6_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::loadReceipts
- **params**: `(poId: string)`
- **ic_degiskenler**:
  - `listGoodsReceipts` — siparişin mal teslim alma kayıtlarını getiren API fonksiyonu
  - `supabaseBrowserClient` — tarayıcı tarafı Supabase istemcisi
  - `list` — listGoodsReceipts sonucu dönen mal teslim alma kayıtları dizisi
  - `setReceipts` — receipts state güncelleme fonksiyonu
- **Dönüş**: yok — void, side effect olarak receipts state'ini günceller

### [N7_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::renderDetail (row parametreli)
- **params**: `(row: PoAdminRow)`
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu
  - `hasWriteAccess` — yazma izni boolean değeri
  - `draft` — receiptDrafts[row.id] veya emptyReceiptDraft
  - `receivable` — hasWriteAccess ve row.status ordered/partially_received ise true
  - `poReceipts` — receipts[row.id] veya boş dizi
  - `item` — row.items içindeki her bir purchase_order_item nesnesi
  - `remaining` — item.qty_ordered - item.qty_received hesaplaması
  - `inputClass` — input elementleri için CSS class sabiti
  - `adminTableActionPrimaryClass` — ana buton CSS class sabiti
  - `emptyReceiptDraft` — boş mal teslim alma draft yapısı
  - `formatDate` — tarih formatlama yardımcı fonksiyonu
  - `lang` — mevcut dil kodu
  - `EMPTY_DASH` — boş/gösterilmeyen değer yerine kullanılan tire sabiti
  - `r` — poReceipts dizisindeki her bir mal teslim alma kaydı
  - `noteText` — r.note varsa [EMPTY_DASH, r.note] birleşimi
- **Dönüş**: `React.ReactNode` — JSX markup, sipariş detay görünümü

### [N8_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::statusBadgeClass
- **params**: `(status: string)`
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — Tailwind CSS class string'i, status değerine göre renklendirme

### [N9_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::statusIcon
- **params**: `(status: string)`
- **ic_degiskenler**: (yok)
- **Dönüş**: `React.ReactNode` — status değerine göre ikon bileşeni

### [N10_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::getColumns
- **params**: `() => Column<PoAdminRow>[]` (return type inferred from usage)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu
  - `hasWriteAccess` — yazma izni boolean değeri
  - `closeNoteFor` — close notu girilmesi gereken sipariş id'si veya null
  - `closeNote` — close notu input değeri
  - `setCloseNote` — closeNote state güncelleme fonksiyonu
  - `updatingId` — şu anda güncellenen sipariş id'si veya null
  - `handleTransition` — sipariş durumu geçişi yapan fonksiyon
  - `adminTableActionPrimaryClass` — ana buton CSS class sabiti
  - `inputClass` — input elementleri için CSS class sabiti
  - `EMPTY_DASH` — boş değer yerine kullanılan tire sabiti
  - `formatDate` — tarih formatlama yardımcı fonksiyonu
  - `lang` — mevcut dil kodu
  - `statusBadgeClass` — status badge CSS class fonksiyonu
  - `statusIcon` — status ikon fonksiyonu
  - `statusLabel` — status etiketi fonksiyonu
  - `allowedNextPoStatuses` — mevcut duruma göre izin verilen bir sonraki durumları dönen fonksiyon
  - `isManualPoTransitionAllowed` — manuel durum geçişine izin verilip verilmediğini kontrol eden fonksiyon
  - `toast` — sonner toast bildirim fonksiyonu
- **Dönüş**: `Column<PoAdminRow>[]` — tablo sütun tanımları dizisi

### [N11_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::getFacets
- **params**: `() => Facet[]` (return type inferred from usage)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu
  - `STATUS_VALUES` — izin verilen tüm durum değerleri dizisi
  - `statusLabel` — status etiketi fonksiyonu
  - `facetCounts` — her durum için sayım nesnesi
- **Dönüş**: `Facet[]` — facet filtre tanımları dizisi, status facet'ini içerir

---

## NODE ID STANDARD

  file: src\views\admin\purchasing\PurchasingTableBody.tsx
  function: src\views\admin\purchasing\PurchasingTableBody.tsx::purchasingFetcher
  function: src\views\admin\purchasing\PurchasingTableBody.tsx::PurchasingTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: PurchasingTableBody
  export: purchasingFetcher

---

## BILEŞIM (CONTAINS)
  contains: PurchaseOrderRow

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface`, `border-admin-border`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-success`, `text-admin-warning`, `text-sm`, `text-xs`
- **Layout:** `!h-7`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-0.5`, `gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `inline-flex`, `items-center`, `items-end`, `justify-end`, `max-w-4xl`
- **Varyant/Responsive:** `disabled:` önekleri
- **Yardımcı Sınıflar:** `!px-3`, `!px-4`, `${adminTableActionPrimaryClass`, `${inputClass`, `${statusBadgeClass(r.status`, `border`, `disabled:opacity-50`, `font-bold`, `font-semibold`, `mb-2`, `mt-0.5`, `mx-auto`, `px-3`, `py-1`, `py-4`