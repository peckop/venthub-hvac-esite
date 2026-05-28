---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx
skeleton_hash: fbf72c5fdd275dd9
entity_hashes:
  func:AdminReturnsPage: 5655af1a631450c5
  overview: 82c5d1f5beb81ee1
  style_tokens: 91f3132d3b13a047
generated_at: 2026-05-28T22:39:43Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun yönetici panelindeki iadeler yönetim sayfasıdır. Tek bir React bileşeni olarak, admin kullanıcıların platformdaki tüm iade işlemlerini görüntüleyip yönetebileceği temel arayüzü sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve ana bileşeni olarak, admin iadeler sayfasının tüm arayüzünü ve iş mantığını barındırır.
- AdminReturnsPage

---

## AXIOMS – Mimari Varsayımlar
VentHub HVAC platformunun admin panelindeki iade yönetim sayfası için temel mimari varsayımlar.

[Aksiyom 1]: Eğer kullanıcı kimlik doğrulamasından geçmemişse (`isAuthenticated` false), `/login` sayfasına yönlendirme yapılır ve bileşen rendersız kalır.

[Aksiyom 2]: Eğer kullanıcı `admin` rolüne sahip değilse (`user.role !== 'admin'`), `/dashboard` sayfasına yönlendirme yapılır ve bileşen rendersız kalır.

[Aksiyom 3]: Eğer `useReturns` hook'u geçerli `returns` dizisi döndürmüyorsa (null/undefined), sayfa istatistikleri ve iade listesi görüntülenemez.

[Aksiyom 4]: Eğer `useReturns` hook'u `loading` durumunu true olarak döndürmüyorsa, yükleme göstergesi gösterilmez ve veri anlık yüklenir.

[Aksiyom 5]: Eğer `ReturnStatus` enum değerleri (PENDING, APPROVED, REJECTED, INFO_REQUESTED, COMPLETED) tanımlı değilse, durum filtreleme ve gruplama çalışamaz.

[Aksiyom 6]: Eğer `approveReturn`, `rejectReturn` veya `requestReturnInfo` fonksiyonları useReturns hook所提供lanmıyorsa, iade onaylama/reddetme/bilgi isteme işlemleri gerçekleştirilemez.

[Aksiyom 7]: Eğer `formatDate` yardımcı fonksiyonu tanımlı değilse, iade tarihleri okunabilir formatta gösterilemez.

[Aksiyom 8]: Eğer `getStatusInfo` helper fonksiyonu tanımlı değilse, iade durumları için etiket ve stil bilgileri üretilemez.

[Aksiyom 9]: Eğer `getStatusCounts` fonksiyonu tanımlı değilse, her durum kategorisi için sayaç değerleri hesaplanamaz ve istatistik kartları gösterilemez.

[Aksiyom 10]: Eğer `toast` (react-hot-toast) kütüphanesi yüklü değilse, işlem bildirimleri kullanıcıya gösterilemez.

[Aksiyom 11]: Eğer `useNavigate` hook'u mevcut değilse, oturum açmamış veya yetkisiz kullanıcılar için yönlendirme yapılamaz.

[Aksiyom 12]: Eğer `selectedReturn` state'i null olarak başlamıyorsa, iade detay modalı başlangıçta açık olur.

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

### [N1_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::authGuard
- **params**: () — React useEffect callback, parametre yok
- **ic_degiskenler**: (local değişken yok, state'ler dışarıdan)
  - `loading` — useAuth'tan gelen yükleme durumu, true ise henüz hazır değil
  - `user` — useAuth'tan gelen oturum kullanıcı nesnesi, null ise giriş yapılmamış
  - `router` — useRouter hook'undan gelen Next.js router, sayfa yönlendirme için
- **Dönüş**: yok — useEffect side-effect; user yoksa `router.replace(Routes.auth.login())` ile login sayfasına yönlendirir

### [N2_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::readUrlStatusFilter
- **params**: () — React useEffect callback, parametre yok
- **ic_degiskenler**:
  - `params` — `new URLSearchParams(window.location.search)` — URL query string'inden parametreleri parse eder
  - `stParam` — `params.get('status')` — URL'den `status` parametre değerini alır, virgülle ayrılmış durum listesi beklenir
  - `next` — `Object.keys(next).forEach(...)` ile sıfırlanan `{ ...statusFilter }` kopyası, URL'deki durumları aktif yapmak için kullanılır
- **Dönüş**: yok — URL parametrelerini okuyup `setStatusFilter(next)` ile state'i günceller

### [N3_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::loadReturns
- **params**: () — async callback, parametre yok
- **ic_degiskenler**:
  - `user` — useAuth'tan gelen kullanıcı nesnesi, null ise fonksiyon erken döner
  - `data` — `supabase.from('venthub_returns').select(...)` sorgusundan dönen satır verisi (ReturnRow[])
  - `error` — Supabase sorgusundan dönen hata nesnesi, null değilse throw edilir
  - `returnRows` — `data || []` ile elde edilen ReturnRow dizisi, tipi `ReturnRow[]`
  - `mapped` — `returnRows.map(...)` ile `ReturnWithOrder[]` tipine dönüştürülmüş dizi; `venthub_orders` iç içe tablodaki alanları (order_number, customer_name, customer_email, total_amount) düz objeye indirger
- **Dönüş**: yok — `setReturns(mapped)` ile returns state'ini günceller; hata durumunda `toast.error` gösterir; finally'de `setIsLoading(false)` çağırır

### [N4_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::mapReturnRow
- **params**: `(item: ReturnRow)` — tek bir iade satırı
- **ic_degiskenler**:
  - `item` — ReturnRow tipinde Supabase satırı; `venthub_orders` inner join nesnesi innererir
- **Dönüş**: `ReturnWithOrder` objesi — item'in tüm alanlarını + `venthub_orders.order_number`, `venthub_orders.customer_name`, `venthub_orders.customer_email`, `venthub_orders.total_amount` alanlarını düz objeye indirger

### [N5_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::triggerLoadReturns
- **params**: () — React useEffect callback, parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `loadReturns()` çağırarak iade verilerini yükler

### [N6_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::filterReturns
- **params**: () — useMemo callback, parametre yok
- **ic_degiskenler**:
  - `filtered` — `returns` dizisinin kopyası, filtreleme zincirinin başlangıç dizisi
  - `anyStatus` — `Object.values(statusFilter).some(Boolean)` — herhangi bir durum filtresi aktif mi kontrol eder
  - `query` — `searchQuery.toLowerCase()` — arama metninin küçük harf versiyonu, case-insensitive arama için
- **Dönüş**: yok — `setFilteredReturns(filtered)` ile filtrelenmiş iade listesini state'e yazar

### [N7_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::searchFilterCallback
- **params**: `(r: ReturnWithOrder)` — filter() içinde her bir iade satırı
- **ic_degiskenler**:
  - `r` — ReturnWithOrder objesi; `order_number`, `customer_name`, `customer_email`, `reason` alanları kontrol edilir
  - `query` — dış scope'tan gelen küçük harf arama metni
- **Dönüş**: `boolean` — arama sorgusu ile eşleşiyorsa true

### [N8_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::sortedReturns
- **params**: () — useMemo callback, parametre yok
- **ic_degiskenler**:
  - `arr` — `filteredReturns` dizisinin shallow kopyası (`[...filteredReturns]`), sıralama dizisi
  - `sortKey` — hangi sütuna göre sıralama yapılacağını belirten anahtar ('order'|'customer'|'reason'|'status'|'amount'|'date')
  - `sortDir` — sıralama yönü ('asc' veya 'desc')
- **Dönüş**: `ReturnWithOrder[]` — sıralanmış iade dizisi

### [N9_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::sortComparator
- **params**: `(a: ReturnWithOrder, b: ReturnWithOrder)` — Array.sort() karşılaştırma fonksiyonu
- **ic_degiskenler**:
  - `a` — karşılaştırmada sol taraftaki iade objesi
  - `b` — karşılaştırmada sağ taraftaki iade objesi
  - `dir` — `sortDir === 'asc' ? 1 : -1` — sıralama yön çarpanı
  - `ao` — `a.order_number ? a.order_number : a.order_id` — order_numarator fallback'i
  - `bo` — `b.order_number ? b.order_number : b.order_id` — order_numarator fallback'i
- **Dönüş**: `number` — localeCompare veya numeric karşılaştırma sonucu (dir ile çarpılmış)

### [N10_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::toggleSort
- **params**: `(key: SortKey)` — sıralanacak sütun anahtarı
- **ic_degiskenler**:
  - `key` — SortKey tipinde, hangi sütuna tıklandığını belirtir
- **Dönüş**: yok — `setSortDir` ve/veya `setSortKey` state setter'larını çağırarak sıralama yönünü ve anahtarını günceller

### [N11_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::sortIndicator
- **params**: `(key: SortKey)` — sütun anahtarı
- **ic_degiskenler**:
  - `key` — SortKey tipinde, sütun identifikasyonu
- **Dönüş**: `string` — aktif sütun ise `'▲'` veya `'▼'`, değilse boş string `''`

### [N12_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::handleStatusUpdate
- **params**: `(returnId: string, newStatus: string)` — güncellenecek iade ID'si ve hedef durum
- **ic_degiskenler**:
  - `returnId` — string, güncellenecek iade kaydının primary key'i
  - `newStatus` — string, hedef durum (requested, approved, rejected, in_transit, received, refunded, cancelled)
  - `hasWriteAccess` — boolean, kullanıcının yazma yetkisi varsa true
  - `returnItem` — `returns.find(r => r.id === returnId)` ile bulunan ReturnWithOrder nesnesi, güncellenen kaydın güncel hali
  - `oldStatus` — `returnItem.status` — güncelleme öncesi durum, audit log için saklanır
  - `data` — Supabase update sorgusu sonucu (kullanılmıyor ama destructure edilmiş)
  - `error` — Supabase update hatası
- **Dönüş**: yok — çoklu yan etki: Supabase'de status günceller, audit log yazar, `setReturns` ile local state günceller, `syncOrderFromReturn` ile orders tablosunu senkronize eder, `toast.success` gösterir, refunded ise `refund-order-mock` edge function çağırır, `return-status-notification` edge function ile müşteriye e-posta gönderir

### [N13_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::statusUpdateLocalMap
- **params**: `(prev: ReturnWithOrder[])` — setReturns'in functional updater'ı
- **ic_degiskenler**:
  - `prev` — mevcut returns state dizisi
  - `returnId` — dış scope'tan gelen güncellenen iade ID'si
  - `newStatus` - dış scope'tan gelen yeni durum
- **Dönüş**: `ReturnWithOrder[]` — `returnId` eşleşen elemanın status ve updated_at alanlarını güncellenmiş, diğerleri değişmemiş dizi

### [N14_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::getStatusLabel
- **params**: `(status: string)` — durum kodu stringi
- **ic_degiskenler**:
  - `status` — iade durumunu temsil eden string (requested, approved, rejected, in_transit, received, refunded, cancelled)
- **Dönüş**: `string` — `_t()` i18n fonksiyonu ile çevrilmiş durum etiketi, çeviri bulunamazsa ham status stringi döner

### [N15_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::getStatusIcon
- **params**: `(status: string)` — durum kodu stringi
- **ic_degiskenler**:
  - `status` — iade durumunu temsil eden string
- **Dönüş**: `JSX.Element` — duruma göre lucide-react icon bileşeni (Clock, CheckCircle, XCircle, Truck, Package, RefreshCw) ve uygun renk class'ı

### [N16_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::getStatusColor
- **params**: `(status: string)` — durum kodu stringi
- **ic_degiskenler**:
  - `status` — iade durumunu temsil eden string
- **Dönüş**: `string` — Tailwind CSS renk class'ları (bg, text, border) ile badge stil stringi

### [N17_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::exportCsv
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `header` — `string[]` — CSV sütun başlıkları, `_t()` ile çevrilmiş (order, customer, email, reason, status, date, amount)
  - `lines` — `filteredReturns.map(...)` ile üretilen CSV satırları dizisi
  - `bom` — `'\ufeff'` — UTF-8 BOM karakteri, Excel uyumluluğu için
  - `csv` — `[header.join(','), ...lines].join('\n')` — birleştirilmiş CSV içeriği
  - `blob` — `new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })` — tarayıcı Blob nesnesi
  - `url` — `URL.createObjectURL(blob)` — Blob için geçici URL
  - `a` — `document.createElement('a')` — DOM'a eklenen gizli anchor elementi
- **Dönüş**: yok — dosya indirme tetikler; `a.click()` ile CSV dosyası indirilir, `URL.revokeObjectURL(url)` ile URL serbest bırakılır

### [N18_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::csvRowMapper
- **params**: `(r: ReturnWithOrder)` — filteredReturns map callback'inde tek bir iade satırı
- **ic_degiskenler**:
  - `r` — ReturnWithOrder objesi
- **Dönüş**: `string[]` — 7 elemanlı dizi: order_number (prefixed), customer_name, customer_email, reason, status label, created_at formatlanmış, total_amount formatlanmış; her eleman `"` ile sarılmış ve escape edilmiş

### [N19_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::exportXls
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `rowsHtml` — `filteredReturns.map(...)` ile üretilen HTML `<tr>` satırları stringi
  - `table` — tam HTML dokümanı stringi, `<table>` ile Excel'e aktarılabilir format
  - `blob` — `new Blob([table], { type: 'application/vnd.ms-excel' })` — Excel format blob
  - `url` — `URL.createObjectURL(blob)` — Blob için geçici URL
  - `a` — `document.createElement('a')` — gizli anchor elementi
- **Dönüş**: yok — `.xls` dosyası indirilir

### [N20_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::xlsRowMapper
- **params**: `(r: ReturnWithOrder)` — filteredReturns map callback'inde tek bir iade satırı
- **ic_degiskenler**:
  - `r` — ReturnWithOrder objesi
  - `orderNo` — `r.order_number ? '#' + r.order_number.split('-')[1] : '#' + r.order_id.slice(-8).toUpperCase()` — formatlanmış sipariş numarası
  - `amount` — `typeof r.total_amount === 'number' ? formatCurrency(Number(r.total_amount), lang) : ''` — formatlanmış tutar
- **Dönüş**: `string` — HTML `<tr>` satırı içeren string, 7 `<td>` hücresi (orderNo, customer_name, customer_email, reason, status label, created_at, amount)

### [N21_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::statusFilterToggle
- **params**: `(o: { value: string; label: string })` — durum filtre seçeneği objesi
- **ic_degiskenler**:
  - `o` — `{ value, label }` yapısında durum filtre seçeneği
- **Dönüş**: `object` — `{ key, label, active, onToggle }` objesi; `active` mevcut filtre durumunu, `onToggle` tıklama handler'ını içerir

### [N22_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::renderTableRow
- **params**: `(returnItem: ReturnWithOrder, index: number)` — tablo satırı render callback'i
- **ic_degiskenler**:
  - `returnItem` — ReturnWithOrder objesi, render edilen iade kaydı
  - `index` — number, dizi index'i, animasyon gecikmesi için kullanılır (`animationDelay: ${index * 50}ms`)
  - `orderNo` — `returnItem.order_number ? '#' + returnItem.order_number.split('-')[1] : '#' + returnItem.order_id.slice(-8).toUpperCase()` — formatlanmış sipariş numarası
  - `hasWriteAccess` — boolean, kullanıcı yazma yetkisine sahipse butonları gösterir
  - `visibleCols` — object, hangi sütunların görünür olduğunu belirten flag objesi (order, customer, reason, status, date)
  - `density` — string, tablo yoğunluk modu ('compact' veya diğer)
  - `updatingStatus` — string|null, şu an status güncellenen iade ID'si (spinner gösterimi için)
  - `lang` — string, mevcut dil kodu, formatDate/formatTime/formatCurrency için
- **Dönüş**: `JSX.Element` — `<tr>` elementi, iade verisinin tüm sütunları ve status değiştirme butonlarını içerir

### [N23_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::renderStatusActionButtons
- **params**: `(status: string)` — iade mevcut durum stringi
- **ic_degiskenler**:
  - `status` — string, mevcut iade durumu
  - `nextStatuses` — obje, her durum için geçilebilecek sonraki durumlar dizisi (dış scope'tan)
  - `returnItem` — ReturnWithOrder, dış scope'tan gelen iade objesi
  - `updatingStatus` — string|null, spinner durumu için
- **Dönüş**: `JSX.Element[]` — `nextStatuses[status]?.map(...)` ile üretilen durum değiştirme butonları dizisi; her buton `handleStatusUpdate` çağırır, spinner veya label+ChevronRight gösterir

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