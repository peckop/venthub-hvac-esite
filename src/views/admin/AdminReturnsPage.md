---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx
skeleton_hash: 1437f3c058eff81b
entity_hashes:
  func:AdminReturnsPage: 5655af1a631450c5
  overview: 0c7281fdb8054389
  style_tokens: 91f3132d3b13a047
generated_at: 2026-06-08T10:11:00Z
---

## Genel Bakış
VentHub HVAC admin panelindeki iade yönetimi sayfasıdır. Kullanıcı kimlik doğrulaması ve admin rol kontrolü yapıldıktan sonra, tüm iade işlemlerinin listelenmesi, duruma göre filtrelenmesi ve iade onaylama/reddetme/bilgi isteme gibi yönetimsel işlemlerin tetiklenmesini sağlar.

## Fonksiyon Grupları
### Admin İade Yönetimi Sayfası Bileşeni
Tek bileşen yapısında iade yönetimi ile ilgili tüm arayüz ve iş mantığını barındırır. Kullanıcı erişim kontrolü, iade verilerinin getirilmesi ve manipülasyonu ile arayüz durum yönetimi bu bileşen içinde koordine edilir.
- AdminReturnsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmemiş olup, doğru çalışması için zorunlu koşulları belirleyen bir mimari varsayım listesi oluşturulamamıştır.

---

## FONKSİYON DETAYLARI

### AdminReturnsPage
**Ne yapar**: Yönetici panelinde iade (return) taleplerini yönetmek için kullanılan ana sayfa bileşenidir. Tüm iade kayıtlarını listeler, filtreler, sıralar ve durumlarını günceller.
**Nasıl yapar**: Bileşen, kimlik doğrulama ve yetkilendirme kontrollerini yaparak başlar. Supabase veritabanından iadeleri ve ilişkili sipariş bilgilerini çeker. Kullanıcı arayüzünde durum bazlı çoklu filtre, arama, sıralama ve sütun görünürlüğü kontrolü sunar. Durum güncelleme işlemlerinde denetim günlüğü (audit log) yazar, sipariş tablosuyla senkronizasyon sağlar, mock geri ödeme çağrısı yapar ve müşteriye e-posta bildirimi gönderir.
**Parametreler**:
- Yok
**Dönüş**: JSX.Element — Oluşturulan React bileşeninin JSX yapısını döndürür.

---

## INTERFACES

### ReturnWithOrder
- `id: string`
- `order_id: string`
- `user_id: string`
- `reason: string`
- `description?: string | null`
- `status: string`
- `created_at: string`
- `updated_at: string`
- `order_number?: string`
- `customer_name?: string`
- `customer_email?: string`
- `total_amount?: number`

---

## TYPE ALIASES

### SortKey
```typescript
type SortKey = 'order' | 'customer' | 'reason' | 'status' | 'date' | 'amount'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AdminReturnsPage.tsx::authGuardEffect
- **params**: (yok — useEffect callback)
- **ic_degiskenler**:
  - `loading` — auth durumu yükleniyor mu
  - `user` — oturum açmış kullanıcı objesi
  - `router` — Next.js router, login sayfasına yönlendirme için
- **Dönüş**: yok (yan etki: router.replace ile login'e yönlendirme)

### [N2_NASIL] AST Pointer: AdminReturnsPage.tsx::urlParamsSyncEffect
- **params**: (yok — useEffect callback)
- **ic_degiskenler**:
  - `window` — tarayıcı ortam kontrolü (typeof kontrolü)
  - `params` — `new URLSearchParams(window.location.search)` — URL query string parametreleri
  - `stParam` — `params.get('status')` — URL'den alınan status parametresi
  - `next` — `{ ...statusFilter }` — status filtresinin kopyası, manipüle edilecek
  - `s` — split sonrası her bir status değeri
  - `key` — `s.trim()` — boşlukları temizlenmiş status anahtarı
- **Dönüş**: yok (yan etki: setStatusFilter ile state güncelleme)

### [N3_NASIL] AST Pointer: AdminReturnsPage.tsx::loadReturns
- **params**: (yok — async callback)
- **ic_degiskenler**:
  - `user` — oturum kontrolü, yoksa erken çıkış
  - `supabase` — Supabase browser client, DB ve auth istekleri için
  - `data` — `supabase.from('venthub_returns').select(...)` sonucu ham veri
  - `error` — Supabase sorgu hatası
  - `returnRows` — `data || []` — ReturnRow[] tipinde mapped veri, joinlenmiş iade kayıtları
  - `item` — `returnRows.map` iterasyonundaki her bir iade satırı
  - `mapped` — `returnRows.map(...)` ile ReturnWithOrder[] formatına dönüştürülmüş dizi
- **Dönüş**: yok (yan etki: setReturns(mapped) ile state güncelleme)

### [N4_NASIL] AST Pointer: AdminReturnsPage.tsx::mapReturnItem
- **params**: `item` — ReturnRow tipinde tek bir iade kaydı
- **ic_degiskenler**:
  - `item.id` — iade ID'si
  - `item.order_id` — sipariş ID'si
  - `item.user_id` — kullanıcı ID'si
  - `item.reason` — iade nedeni
  - `item.description` — iade açıklaması (nullable)
  - `item.status` — iade durumu
  - `item.created_at` — oluşturma tarihi
  - `item.updated_at` — güncelleme tarihi
  - `item.venthub_orders?.order_number` — ilişkili sipariş numarası (optional chain)
  - `item.venthub_orders?.customer_name` — müşteri adı (nullable)
  - `item.venthub_orders?.customer_email` — müşteri emaili (nullable)
  - `item.venthub_orders?.total_amount` — sipariş tutarı (number)
- **Dönüş**: `{ id, order_id, user_id, reason, description, status, created_at, updated_at, order_number, customer_name, customer_email, total_amount }` — ReturnWithOrder objesi

### [N5_NASIL] AST Pointer: AdminReturnsPage.tsx::handleRefresh
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: loadReturns() çağrısı ile verileri yeniden yükler)

### [N6_NASIL] AST Pointer: AdminReturnsPage.tsx::applyFilters
- **params**: (yok)
- **ic_degiskenler**:
  - `filtered` — `returns` dizisinin kopyası, filtreleme sonrası güncellenir
  - `statusFilter` — `{ [key: string]: boolean }` — hangi durumların aktif olduğu
  - `searchQuery` — kullanıcı arama metni
  - `query` — `searchQuery.toLowerCase()` — küçük harfe çevrilmiş arama terimi
- **Dönüş**: yok (yan etki: setFilteredReturns(filtered) ile state güncelleme)

### [N7_NASIL] AST Pointer: AdminReturnsPage.tsx::searchFilterPredicate
- **params**: `r` — ReturnWithOrder tipinde iade objesi
- **ic_degiskenler**:
  - `query` — `searchQuery.toLowerCase()` — küçük harfe çevrilmiş arama terimi (dışarıdan closure)
- **Dönüş**: `boolean` — iadenin arama kriterine uyup uymadığı

### [N8_NASIL] AST Pointer: AdminReturnsPage.tsx::getSortedReturns
- **params**: (yok)
- **ic_degiskenler**:
  - `arr` — `[...filteredReturns]` — filtrelenmiş iadelerin kopyası, sıralanacak
  - `sortDir` — `'asc' | 'desc'` — sıralama yönü
  - `sortKey` — `'order' | 'customer' | 'reason' | 'status' | 'amount' | 'date'` — hangi alana göre sıralama
  - `a`, `b` — sıralama karşılaştırmasında kullanılan iki iade objesi
  - `dir` — `sortDir === 'asc' ? 1 : -1` — sıralama çarpanı
  - `ao` — `a.order_number ? a.order_number : a.order_id` — a için sıralama değeri (order case)
  - `bo` — `b.order_number ? b.order_number : b.order_id` — b için sıralama değeri (order case)
- **Dönüş**: `ReturnWithOrder[]` — sıralanmış iade dizisi

### [N9_NASIL] AST Pointer: AdminReturnsPage.tsx::sortComparator
- **params**: `a`, `b` — ReturnWithOrder tipinde sıralanacak iki iade objesi
- **ic_degiskenler**:
  - `sortDir` — sıralama yönü closure'dan gelir
  - `sortKey` — hangi alana göre sıralanacağı closure'dan gelir
  - `dir` — `sortDir === 'asc' ? 1 : -1` — sıralama çarpanı
  - `ao` — a.order_number veya a.order_id fallback
  - `bo` — b.order_number veya b.order_id fallback
- **Dönüş**: `number` — negatif/sıfır/pozitif sıralama sonucu

### [N10_NASIL] AST Pointer: AdminReturnsPage.tsx::toggleSort
- **params**: `key` — SortKey tipinde sıralama alanı
- **ic_degiskenler**: (yok — state setter'ları doğrudan kullanılır)
- **Dönüş**: yok (yan etki: setSortKey ve setSortDir ile sıralama state güncelleme)

### [N11_NASIL] AST Pointer: AdminReturnsPage.tsx::sortIndicator
- **params**: `key` — SortKey tipinde sıralama alanı
- **ic_degiskenler**:
  - `sortKey` — mevcut aktif sıralama alanı (closure'dan)
  - `sortDir` — sıralama yönü (closure'dan)
- **Dönüş**: `string` — `'▲'`, `'▼'` veya boş string

### [N12_NASIL] AST Pointer: AdminReturnsPage.tsx::handleStatusUpdate
- **params**: `returnId` — string, güncellenecek iade ID'si; `newStatus` — string, hedef durum
- **ic_degiskenler**:
  - `hasWriteAccess` — yazma izni var mı kontrolü
  - `returns` — mevcut iade dizisi (closure'dan)
  - `returnItem` — `returns.find(r => r.id === returnId)` — güncellenecek iade objesi
  - `oldStatus` — `returnItem.status` — güncelleme öncesi eski durum
  - `supabase` — Supabase client
  - `data` / `error` — supabase.from('venthub_returns').update() sonuçları
  - `logAdminAction` — `await import('../../lib/audit')` ile dinamik import edilen audit log fonksiyonu
  - `syncOrderFromReturn` — orders tablosuna sync fonksiyonu (closure'dan)
  - `refundErr` — mock refund fonksiyonu hatası
  - `invokeError` — email notification fonksiyonu hatası
  - `emailError` — email notification try-catch hatası
- **Dönüş**: yok (yan etki: state güncelleme, DB update, audit log, refund fonksiyonu çağrısı, email bildirim)

### [N13_NASIL] AST Pointer: AdminReturnsPage.tsx::updateReturnsState
- **params**: `prev` — mevcut returns state dizisi (setState updater fonksiyonu)
- **ic_degiskenler**:
  - `r` — prev dizisindeki her bir iade objesi
  - `returnId` — güncellenecek iade ID'si (closure'dan)
  - `newStatus` — yeni durum değeri (closure'dan)
- **Dönüş**: `ReturnWithOrder[]` — güncellenmiş iade dizisi

### [N14_NASIL] AST Pointer: AdminReturnsPage.tsx::getStatusLabel
- **params**: `status` — string, iade durumu
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — iade durumu için lokalize edilmiş etiket metni

### [N15_NASIL] AST Pointer: AdminReturnsPage.tsx::getStatusIcon
- **params**: `status` — string, iade durumu
- **ic_degiskenler**: (yok — switch-case içinde React elementleri döndürülür)
- **Dönüş**: `JSX.Element` — duruma karşılık gelen lucide-react ikonu

### [N16_NASIL] AST Pointer: AdminReturnsPage.tsx::getStatusColor
- **params**: `status` — string, iade durumu
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — Tailwind CSS renk class'ları (bg, text, border)

### [N17_NASIL] AST Pointer: AdminReturnsPage.tsx::exportCsv
- **params**: (yok)
- **ic_degiskenler**:
  - `header` — `string[]` — CSV başlık satırı, `_t()` ile lokalize edilmiş
  - `filteredReturns` — dışa aktarılacak filtrelenmiş iade dizisi (closure'dan)
  - `r` — filteredReturns.map iterasyonundaki her bir iade
  - `lines` — `string[]` — her iade için CSV satır dizisi
  - `bom` — `'\ufeff'` — UTF-8 BOM karakteri
  - `csv` — `string` — birleştirilmiş tüm CSV içeriği
  - `blob` — `Blob` — CSV dosyası blob nesnesi
  - `url` — `URL.createObjectURL(blob)` — blob URL
  - `a` — `document.createElement('a')` — indirme tetikleyici link elementi
- **Dönüş**: yok (yan etki: CSV dosyası indirme)

### [N18_NASIL] AST Pointer: AdminReturnsPage.tsx::csvRowMapper
- **params**: `r` — ReturnWithOrder tipinde iade objesi
- **ic_degiskenler**:
  - `query` — arama sorgusu closure'dan
  - `r.order_number` — sipariş numarası
  - `r.customer_name` — müşteri adı
  - `r.customer_email` — müşteri emaili
  - `r.reason` — iade nedeni
  - `r.status` — iade durumu
  - `r.created_at` — oluşturma tarihi
  - `r.total_amount` — sipariş tutarı
- **Dönüş**: `string` — virgülle ayrılmış CSV satır string'i

### [N19_NASIL] AST Pointer: AdminReturnsPage.tsx::exportXls
- **params**: (yok)
- **ic_degiskenler**:
  - `filteredReturns` — dışa aktarılacak filtrelenmiş iade dizisi (closure'dan)
  - `r` — filteredReturns.map iterasyonundaki her bir iade
  - `orderNo` — formatlanmış sipariş numarası
  - `amount` — formatlanmış tutar
  - `rowsHtml` — `string` — birleştirilmiş HTML tablo satırları
  - `table` — `string` — tam HTML tablo yapısı
  - `blob` — `Blob` — XLS dosyası blob nesnesi
  - `url` — blob URL
  - `a` — `document.createElement('a')` — indirme tetikleyici link elementi
- **Dönüş**: yok (yan etki: XLS dosyası indirme)

### [N20_NASIL] AST Pointer: AdminReturnsPage.tsx::xlsRowMapper
- **params**: `r` — ReturnWithOrder tipinde iade objesi
- **ic_degiskenler**:
  - `r.order_number` — sipariş numarası
  - `r.order_id` — sipariş ID'si (fallback)
  - `orderNo` — formatlanmış sipariş numarası (örn: #1234)
  - `r.total_amount` — sipariş tutarı
  - `amount` — formatlanmış tutar
  - `r.customer_name` — müşteri adı
  - `r.customer_email` — müşteri emaili
  - `r.reason` — iade nedeni
  - `r.status` — iade durumu
  - `r.created_at` — oluşturma tarihi
- **Dönüş**: `string` — HTML `<tr>` bloğu

### [N21_NASIL] AST Pointer: AdminReturnsPage.tsx::columnMenuMapper
- **params**: `o` — ColumnsMenu bileşeninden gelen column option objesi
- **ic_degiskenler**:
  - `o.value` — sütun değeri
  - `o.label` — sütun etiketi
  - `statusFilter` — mevcut durum filtresi durumu (closure'dan)
- **Dönüş**: `{ key, label, active, onToggle }` — ColumnsMenu bileşen formatında sütun objesi

### [N22_NASIL] AST Pointer: AdminReturnsPage.tsx::renderTableRow
- **params**: `returnItem` — ReturnWithOrder tipinde iade objesi; `index` — number, satır indeksi
- **ic_degiskenler**:
  - `returnItem.order_number` — sipariş numarası
  - `returnItem.order_id` — sipariş ID'si (fallback)
  - `orderNo` — formatlanmış sipariş numarası
  - `returnItem.total_amount` — sipariş tutarı
  - `returnItem.customer_name` — müşteri adı
  - `returnItem.customer_email` — müşteri emaili
  - `returnItem.reason` — iade nedeni
  - `returnItem.description` — iade açıklaması
  - `returnItem.status` — iade durumu
  - `returnItem.created_at` — oluşturma tarihi
  - `returnItem.id` — iade ID'si
  - `visibleCols` — görünür sütun ayarları (closure'dan)
  - `hasWriteAccess` — yazma izni (closure'dan)
  - `updatingStatus` — şu anda güncellenen iade ID'si (closure'dan)
  - `nextStatuses` — her durum için bir sonraki olası durumlar (closure'dan)
  - `router` — Next.js router (closure'dan)
  - `density` — tablo yoğunluk modu (closure'dan)
  - `lang` — dil ayarı (closure'dan)
- **Dönüş**: `JSX.Element` — `<tr>` tablo satırı

### [N23_NASIL] AST Pointer: AdminReturnsPage.tsx::renderStatusButton
- **params**: `status` — string, bir sonraki durum değeri
- **ic_degiskenler**:
  - `returnItem` — RenderTableRow'den gelen iade objesi (closure'dan)
  - `updatingStatus` — şu anda güncellenen iade ID'si (closure'dan)
  - `handleStatusUpdate` — durum güncelleme fonksiyonu (closure'dan)
- **Dönüş**: `JSX.Element` — durum değiştirme但onu

---

## NODE ID STANDARD

  file: src\views\admin\AdminReturnsPage.tsx
  function: src\views\admin\AdminReturnsPage.tsx::AdminReturnsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminReturnsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-surface-deep/20`, `bg-white/10`, `border-b`, `border-collapse`, `border-current`, `border-t-transparent`, `border-white/5`, `hover:bg-white/2`, `hover:text-cyan-300`, `hover:text-cyan-400`, `max-md:text-xs`, `text-blue-600`, `text-cyan-400`, `text-gray-400`, `text-gray-600`
- **Layout:** `!h-7`, `custom-scrollbar`, `flex`, `flex-col`, `gap-0.5`, `gap-1`, `gap-1.5`, `gap-2`, `gap-4`, `h-3`, `h-px`, `inline-block`, `inline-flex`, `items-center`, `justify-between`
- **Varyant/Responsive:** `:`, `disabled:`, `group-hover/row:`, `hover:`, `max-md:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `!px-3`, `${adminCardClass`, `${adminTableActionPrimaryClass`, `${adminTableCellClass`, `${adminTableHeadCellClass`, `${cellPad`, `${density`, `${getStatusColor(returnItem.status`, `${headPad`, `:`, `===`, `align-middle`, `animate-in`, `animate-spin`, `border`