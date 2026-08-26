---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\purchasing\PurchasingTableBody.tsx
skeleton_hash: 950726f00b86c4aa
entity_hashes:
  func:PurchasingTableBody: 10eccfe22d93ec03
  func:purchasingFetcher: 4f3c5d644184676d
  overview: e454d7750c0fb8eb
  style_tokens: fbefabc584f01f12
generated_at: 2026-08-25T08:48:21Z
---

## Genel Bakış
Bu modül, admin panelinde satın alma siparişlerinin listelendiği tablonun gövde bölümünü oluşturan React bileşenini ve ilgili veri çekme fonksiyonunu içerir. Supabase veritabanından `PoAdminRow` tipinde satın alma kayıtlarını asenkron olarak çeker ve tablo satırları olarak görüntüler.

## Fonksiyon Grupları

### Veri Çekme
Supabase veritabanından satın alma siparişi satırlarını, sağlanan parametreler doğrultusunda asenkron olarak sorgular ve sonuçları döndürür.
- purchasingFetcher

### Bileşen
Satın alma tablosunun gövde kısmını render eden React bileşenidir; çekilen veriyi tablo satırları olarak kullanıcıya sunar.
- PurchasingTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarılabilecek varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `supabase` parametresi olarak geçerli bir `SupabaseClient<Database>` nesnesi yoksa, `purchasingFetcher` fonksiyonu veritabanı bağlantısı kuramaz ve veri çekme işlemi gerçekleştirilemez.

[Aksiyom 2]: Eğer `params` parametresi olarak geçerli bir `FetchParams` nesnesi yoksa, `purchasingFetcher` fonksiyonu hangi verilerin çekileceğini belirleyemez.

[Aksiyom 3]: Eğer `PoAdminRow` tipi tanımlı değilse, `purchasingFetcher` fonksiyonunun dönüş tipi `FetchResult<PoAdminRow>` oluşturulamaz.

[Aksiyom 4]: Eğer `FetchResult` generic tipi tanımlı değilse, `purchasingFetcher` fonksiyonunun dönüş değeri tip güvenli biçimde ifade edilemez.

[Aksiyom 5]: Eğer `STATUS_VALUES` sabiti tanımlı değilse, satın alma sipareşlerinin durum değerleri belirlenemez.

[Aksiyom 6]: Eğer `Database` tipi tanımlı değilse, `SupabaseClient<Database>` generic yapısı doğru şekilde oluşturulamaz.

---

## FONKSİYON DETAYLARI

### purchasingFetcher
**Ne yapar**: Satın alma siparişlerini (purchase orders) Supabase veritabanından sayfalı, filtreli ve sıralı şekilde çeker. Tedarikçi adı ve sipariş kalemleriyle birlikte döndürür. Ürün katalog bilgilerini (ad ve SKU) ekleyerek `PoAdminRow` formatında sonuç üretir.

**Nasıl yapar**: Fonksiyon öncelikle `ensureSessionFresh()` çağırarak oturumun güncel olduğundan emin olur. Ardından `purchase_orders` tablosundan tedarikçi adı (`suppliers(name)`) ve sipariş kalemleri (`purchase_order_items(*)`) ile birlikte toplam sayım (`count: 'exact'`) yapacak şekilde bir sorgu oluşturur. Durum filtresi uygulanacaksa, `STATUS_VALUES` sabit dizisiyle eşleşen değerler tekli (`eq`) veya çoklu (`in`) olarak filtreye eklenir. Arama terimi varsa, önce `suppliers` tablosunda tedarikçi adı üzerinde büyük-küçük harf duyarsız arama (`ilike`) yapılır; eşleşen tedarikçi bulunamazsa boş sonuç döner, bulunursa sorgu bu tedarikçi ID'lerine daraltılır. Sıralama parametresine göre `status` veya `created_at` alanına göre artan/azalan sıralama uygulanır; sıralama belirtilmemişse `created_at` azalan olarak varsayılır. Sayfalama hesaplanarak `range` ile veri çekilir. Çekilen sipariş kalemlerindeki benzersiz `product_id` değerleri toplanır ve `products` tablosundan yalnızca kimlik alanları (`id, name, sku`) çekilir — katalog fiyat alanları bu modülde okunmaz bile. Ürün bilgileri bir `Map` yapısına dönüştürülerek her sipariş kalemine `product_name` ve `product_sku` eklenir ve `PoAdminRow` dizisi olarak döndürülür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase istemci örneği. Veritabanı sorguları bu istemci üzerinden yapılır.
- `params`: `FetchParams` — Sayfalama (`page`, `pageSize`), filtreleme (`filters.status`, `query`) ve sıralama (`sort.key`, `sort.dir`) bilgilerini içeren parametre nesnesi.

**Dönüş**: `Promise<FetchResult<PoAdminRow>>` — Asenkron olarak çözülen, `rows` (sipariş satırları dizisi) ve `totalMatched` (filtreye uyan toplam kayıt sayısı) alanlarını içeren sonuç nesnesi. `rows` dizisi, her biri `supplier_name`, `items` (ürün adı ve SKU bilgisi eklenmiş kalemler) alanlarını taşıyan `PoAdminRow` nesnelerinden oluşur.

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
- **params**: `supabase` — Supabase istemcisi (Database tipi ile), `params` — FetchParams tipinde filtreleme, sayfalama ve sıralama parametreleri
- **ic_degiskenler**:
  - `query` — Supabase sorgu nesnesi; purchase_orders tablosundan tedarikçi adı ve kalemlerle birlikte veri çeker
  - `statuses` — STATUS_VALUES dizisinden filtrelenmiş geçerli durum değerleri
  - `term` — Arama terimi; params.query'den alınır, boşlukları temizlenmiş
  - `supplierMatches` — Tedarikçi adına göre ilike araması sonucu eşleşen tedarikçi kayıtları
  - `supplierError` — Tedarikçi arama sorgusunda oluşan hata
  - `ids` — Eşleşen tedarikçilerin id dizisi
  - `ascending` — Sıralama yönü; params.sort.dir === 'asc' ise true
  - `offset` — Sayfalama ofseti; (params.page - 1) * params.pageSize
  - `data` — Sorgu sonucu gelen sipariş verileri
  - `error` — Sipariş sorgusunda oluşan hata
  - `count` — Toplam eşleşen kayıt sayısı (exact count)
  - `orders` — data ?? []; boşsa boş dizi
  - `totalMatched` — count sayısal ise count, değilse orders.length
  - `productIds` — Tüm sipariş kalemlerinden çıkarılan benzersiz ürün ID'leri
  - `products` — Ürün tablosundan çekilen id, name, sku alanları
  - `productError` — Ürün sorgusunda oluşan hata
  - `productMap` — Ürün ID'si ile ürün nesnesini eşleyen Map
  - `rows` — PoAdminRow tipinde sonuç satırları; tedarikçi adı ve ürün bilgileri eklenmiş
- **Dönüş**: `FetchResult<PoAdminRow>` — { rows: PoAdminRow[], totalMatched: number }

### [N2_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::PurchasingTableBody
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `facetCounts` — Durum bazlı kayıt sayılarını tutan nesne (Record<string, number>)
  - `setFacetCounts` — facetCounts state'ini güncelleyen setter fonksiyonu
  - `closeNoteFor` — Kapatma notu istenen siparişin ID'si; null ise kapatma notu formu gösterilmez
  - `setCloseNoteFor` — closeNoteFor state'ini güncelleyen setter fonksiyonu
  - `closeNote` — Kapatma notu metni
  - `setCloseNote` — closeNote state'ini güncelleyen setter fonksiyonu
  - `updatingId` — İşlem yapılan siparişin ID'si; butonları devre dışı bırakmak için kullanılır
  - `setUpdatingId` — updatingId state'ini güncelleyen setter fonksiyonu
  - `receiptDrafts` — Her sipariş ID'si için mal kabul formu taslaklarını tutan nesne
  - `setReceiptDrafts` — receiptDrafts state'ini güncelleyen setter fonksiyonu
  - `receipts` — Her sipariş ID'si için mal kabul kayıtlarını tutan nesne
  - `setReceipts` — receipts state'ini güncelleyen setter fonksiyonu
  - `hasWriteAccess` — Kullanıcının yazma erişimi olup olmadığını gösteren boolean
  - `t` — i18n çeviri fonksiyonu
  - `lang` — Geçerli dil kodu
  - `table` — Tablo nesnesi; reload, filtering gibi metodlar içerir
  - `emptyReceiptDraft` — Boş mal kabul taslağı şablonu
  - `inputClass` — Ortak input CSS sınıfı
  - `EMPTY_DASH` — Boş değerler için gösterilen tire karakteri
  - `statusBadgeClass` — Durum değerine göre CSS sınıfı döndüren fonksiyon
  - `statusIcon` — Durum değerine göre React ikonu döndüren fonksiyon
  - `handleTransition` — Durum geçişi yapan async fonksiyon
  - `submitReceipt` — Mal kabul kaydı gönderen async fonksiyon
  - `loadReceipts` — Belirli bir siparişin mal kabul kayıtlarını yükleyen async fonksiyon
  - `renderDetail` — Sipariş detay görünümünü render eden fonksiyon
  - `columns` — Tablo sütun tanımlarını döndüren fonksiyon
  - `facets` — Filtre facet tanımlarını döndüren fonksiyon
  - `onCreateSuccess` — Yeni sipariş oluşturulduktan sonra tetiklenen callback
- **Dönüş**: `React.FC` — Satın alma tablosu gövde bileşeni

### [N3_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::useEffect_facetCounts_loader
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — purchase_orders tablosundan çekilen status alanları
  - `error` — Sorgu hatası
  - `counts` — Her status değerinden kaç adet olduğunu tutan nesne
  - `row` — data dizisindeki her bir satır; row.status alanına erişilir
  - `err` — Yakalanan hata; console.warn ile loglanır
- **Dönüş**: yok (yan etki: setFacetCounts çağırır)

### [N4_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::statusBadgeClass
- **params**: `status` — Durum değeri string olarak
- **ic_degiskenler**: yok (switch-case ile doğrudan dönüş)
- **Dönüş**: `string` — Duruma karşılık gelen CSS sınıfı

### [N5_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::statusIcon
- **params**: `status` — Durum değeri string olarak
- **ic_degiskenler**: yok (switch-case ile doğrudan dönüş)
- **Dönüş**: `React.ReactNode` — Duruma karşılık gelen ikon bileşeni

### [N6_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::handleTransition
- **params**: `row` — PoAdminRow tipinde sipariş satırı, `next` — Hedef durum string olarak, `noteForClose` — (opsiyonel) Kapatma notu
- **ic_degiskenler**: yok (doğrudan parametreleri ve state'leri kullanır)
- **Dönüş**: yok (yan etki: setPurchaseOrderStatus çağırır, toast gösterir, table.reload çağırır)

### [N7_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::submitReceipt
- **params**: `row` — PoAdminRow tipinde sipariş satırı
- **ic_degiskenler**:
  - `draft` — receiptDrafts[row.id] veya emptyReceiptDraft; form verilerini tutar
  - `lines` — Geçerli kalemlerden oluşan dizi; her eleman { product_id, qty, unit_cost } içerir
  - `result` — processGoodsReceipt dönüş değeri; success, error, received_units, processed_count alanları
  - `list` — listGoodsReceipts dönüş değeri; güncellenmiş mal kabul kayıtları
  - `err` — Yakalanan hata; console.warn ile loglanır
- **Dönüş**: yok (yan etki: processGoodsReceipt çağırır, toast gösterir, receiptDrafts ve receipts state'lerini günceller, table.reload çağırır)

### [N8_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::submitReceipt_mapItem
- **params**: `item` — Sipariş kalemi nesnesi
- **ic_degiskenler**:
  - `qty` — draft.qty[item.id] değerinden sayıya çevrilmiş miktar
  - `rawCost` — draft.unitCost[item.id] değerinin trimlenmiş hali
  - `unitCost` — rawCost boşsa undefined, değilse sayıya çevrilmiş birim maliyet
- **Dönüş**: `{ product_id, qty, unit_cost }` veya `null` (geçersiz değerlerde)

### [N9_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::loadReceipts
- **params**: `poId` — Sipariş ID'si string olarak
- **ic_degiskenler**:
  - `list` — listGoodsReceipts dönüş değeri; mal kabul kayıtları dizisi
  - `err` — Yakalanan hata; console.warn ile loglanır
- **Dönüş**: yok (yan etki: setReceipts çağırır)

### [N10_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::renderDetail
- **params**: `row` — PoAdminRow tipinde sipariş satırı
- **ic_degiskenler**:
  - `draft` — receiptDrafts[row.id] veya emptyReceiptDraft; form verilerini tutar
  - `receivable` — hasWriteAccess ve durum 'ordered' veya 'partially_received' ise true
  - `poReceipts` — receipts[row.id] veya boş dizi; mevcut mal kabul kayıtları
  - `remaining` — item.qty_ordered - item.qty_received; kalan miktar (map callback'inde)
  - `noteText` — r.note varsa EMPTY_DASH ile birleştirilmiş not metni, yoksa null
- **Dönüş**: `JSX.Element` — Sipariş detay görünümü

### [N11_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::renderDetail_mapItem
- **params**: `item` — Sipariş kalemi nesnesi
- **ic_degiskenler**:
  - `remaining` — item.qty_ordered - item.qty_received; kalan miktar
- **Dönüş**: `JSX.Element` — Kalem detay kartı

### [N12_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::columns
- **params**: (parametre yok)
- **ic_degiskenler**: yok (doğrudan sütun tanımları dizisi döndürür)
- **Dönüş**: `Array` — Tablo sütun tanımları (key, header, cell, sortable, hideable alanları)

### [N13_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::columns_cell_supplier
- **params**: `r` — PoAdminRow tipinde satır verisi
- **ic_degiskenler**:
  - `shortId` — r.id'nin son 8 karakterinin büyük harfli '#' ön ekli hali
- **Dönüş**: `JSX.Element` — Tedarikçi adı ve kısa ID gösterimi

### [N14_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::columns_cell_lines
- **params**: `r` — PoAdminRow tipinde satır verisi
- **ic_degiskenler**: yok (doğrudan r.items ve r.currency kullanılır)
- **Dönüş**: `JSX.Element` — İlk ürün adı, ek kalem sayısı ve para birimi gösterimi

### [N15_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::columns_cell_status
- **params**: `r` — PoAdminRow tipinde satır verisi
- **ic_degiskenler**: yok (statusBadgeClass, statusIcon, statusLabel fonksiyonları kullanılır)
- **Dönüş**: `JSX.Element` — Durum badge'i

### [N16_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::columns_cell_expected
- **params**: `r` — PoAdminRow tipinde satır verisi
- **ic_degiskenler**: yok (r.expected_at ve formatDate kullanılır)
- **Dönüş**: `JSX.Element` — Beklenen tarih gösterimi

### [N17_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::columns_cell_created_at
- **params**: `r` — PoAdminRow tipinde satır verisi
- **ic_degiskenler**: yok (formatDate kullanılır)
- **Dönüş**: `JSX.Element` — Oluşturma tarihi gösterimi

### [N18_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::columns_cell_actions
- **params**: `r` — PoAdminRow tipinde satır verisi
- **ic_degiskenler**:
  - `manualTargets` — allowedNextPoStatuses ve isManualPoTransitionAllowed ile filtrelenmiş elle yapılabilir durum geçişleri
- **Dönüş**: `JSX.Element` — Durum geçiş butonları veya kapatma notu formu

### [N19_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::facets
- **params**: (parametre yok)
- **ic_degiskenler**: yok (STATUS_VALUES ve facetCounts kullanılır)
- **Dönüş**: `Array` — Filtre facet tanımları (key, label, options)

### [N20_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::facets_mapValue
- **params**: `value` — STATUS_VALUES dizisindeki bir durum değeri
- **ic_degiskenler**: yok (statusLabel ve facetCounts[value] kullanılır)
- **Dönüş**: `{ value, label, count }` — Facet seçeneği nesnesi

### [N21_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::onCreateSuccess
- **params**: (parametre yok)
- **ic_degiskenler**: yok (setShowCreate ve table.reload çağırır)
- **Dönüş**: yok (yan etki: formu kapatır ve tabloyu yeniler)

### [N22_NASIL] AST Pointer: src/views/admin/purchasing/PurchasingTableBody.tsx::filterRenderCallback
- **params**: `facet` — Filtre facet nesnesi
- **ic_degiskenler**: yok (FacetedFilter bileşenine props geçilir)
- **Dönüş**: `JSX.Element` — FacetedFilter bileşeni

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