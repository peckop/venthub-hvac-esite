---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx
skeleton_hash: a60542cfa74c3cf9
entity_hashes:
  func:AdminReturnsPage: 5655af1a631450c5
  overview: 7cb8623e788cd775
  style_tokens: 91f3132d3b13a047
generated_at: 2026-06-06T21:58:03Z
---

## Genel Bakış
VentHub HVAC admin panelindeki iade yönetim sayfasıdır. Kullanıcı kimlik doğrulaması ve admin rol kontrolü yapıldıktan sonra, tüm iade işlemlerinin listelenmesi, duruma göre filtrelenmesi ve iade onaylama/reddetme/bilgi isteme gibi yönetimsel işlemlerin tetiklenmesini sağlar.

## Fonksiyon Grupları
### Admin İade Sayfası Bileşeni
Tek bileşen yapısında iade yönetimi ile ilgili tüm arayüz ve iş mantığını barındırır. Kullanıcı erişim kontrolü, iade verilerinin getirilmesi ve manipülasyonu ile arayüz durum yönetimi bu bileşen içinde koordine edilir.
- AdminReturnsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmemiş olup, yalnızca imza bilgisine dayalı mimari varsayımlar tanımlanmıştır.

**[Aksiyom 1]**: `AdminReturnsPage()` bileşeni parametresiz olarak tanımlanmıştır. Eğer bileşenin ihtiyaç duyduğu veriler (iade listesi, kullanıcı bilgisi vb.) props olarak sağlanmıyorsa, bu verilerin React Context, global state yönetimi veya içsel veri çekme (fetch/hook) mekanizması ile elde edilmesi gerekir.

**[Aksiyom 2]**: Bileşen React bileşen mimarisi üzerine kuruludur. Eğer React çalışma zamanı (runtime) veya JSX derleyici ortamu yoksa, bileşen doğru şekilde render edilemez.

**[Aksiyom 3]**: Bileşen admin paneli kapsamında çalıştığından, kimlik doğrulama ve yetkilendirme bilgilerinin bileşen dışında (örn: rota koruyucu, higher-order component, veya context) sağlanması gerekir. Eğer bu kontroller bileşen içine yerleşik değilse ve dış mekanizma da sağlanmıyorsa, yetkisiz erişim riski oluşur.

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

### [N1_NASIL] AST Pointer: AdminReturnsPage.tsx::useAuthRedirectEffect
- **params**: () — anonim arrow fonksiyon, parametre yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — erken return ile `router.replace` çağrısı yapar; kullanıcı yoksa login sayfasına yönlendirir

---

### [N2_NASIL] AST Pointer: AdminReturnsPage.tsx::useStatusFromUrlEffect
- **params**: () — anonim arrow fonksiyon, parametre yok
- **ic_degiskenler**:
  - `params` — `URLSearchParams` nesnesi, `window.location.search`'den oluşturulur, URL query string parametrelerini okumak için kullanılır
  - `stParam` — `params.get('status')` ile elde edilen string, URL'deki `status` parametresinin değerini tutar (virgülle ayrılmış durum listesi)
  - `next` — `statusFilter` nesnesinin shallow kopyası; tüm değerleri false'a set edildikten sonra URL'deki durumlar true yapılır
  - `k` — `Object.keys(next)` iterasyonundaki mevcut anahtar
  - `s` — `stParam.split(',')` iterasyonundaki tek bir durum string'i
  - `key` — `s.trim()` ile elde edilmiş, temizlenmiş durum anahtarı
- **Dönüş**: yok — `setStatusFilter(next)` ile state güncellenir (yan etki)

---

### [N3_NASIL] AST Pointer: AdminReturnsPage.tsx::loadReturns
- **params**: () — anonim async arrow fonksiyon, parametre yok
- **ic_degiskenler**:
  - `data` — `supabase.from('venthub_returns').select(...)` çağrısının başarı durumunda dönen satır dizisi
  - `error` — Supabase select çağrısının hata nesnesi;truthy ise throw edilir
  - `returnRows` — `data || []` ifadesinden türeyen `ReturnRow[]` tipinde dizi; ham Supabase satırlarını tutar
  - `mapped` — `returnRows.map(item => ...)` ile elde edilen `ReturnWithOrder[]` tipinde dizi; ham veriyi düzleştirilmiş forma dönüştürür, `venthub_orders` nested nesnesinin alanlarını üst seviyeye taşır
- **Dönüş**: yok — `setReturns(mapped)` ile state güncellenir (yan etki)

---

### [N4_NASIL] AST Pointer: AdminReturnsPage.tsx::returnMapFn
- **params**: `item` — `ReturnRow` tipinde tek bir iade satırı nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: `ReturnWithOrder` tipinde nesne — `item`'in tüm alanlarını ve `item.venthub_orders?.order_number`, `item.venthub_orders?.customer_name`, `item.venthub_orders?.customer_email`, `item.venthub_orders?.total_amount` alanlarını düzleştirilmiş şekilde döndürür

---

### [N5_NASIL] AST Pointer: AdminReturnsPage.tsx::handleRefresh
- **params**: () — anonim arrow fonksiyon, parametre yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `loadReturns()` çağrısı ile verileri yeniler

---

### [N6_NASIL] AST Pointer: AdminReturnsPage.tsx::applyFilters
- **params**: () — anonim arrow fonksiyon, parametre yok
- **ic_degiskenler**:
  - `filtered` — `returns` state'inin kopyası; filtreleme操作ları bu dizi üzerinde yapılır
  - `anyStatus` — `Object.values(statusFilter).some(Boolean)` sonucu; herhangi bir durum filtresi aktif mi kontrolü
  - `query` — `searchQuery.toLowerCase()` ile oluşturulmuş küçük harfli arama metni
- **Dönüş**: yok — `setFilteredReturns(filtered)` ile state güncellenir (yan etki)

---

### [N7_NASIL] AST Pointer: AdminReturnsPage.tsx::searchFilterPredicate
- **params**: `r` — `ReturnWithOrder` tipinde iade nesnesi
- **ic_degiskenler**:
  - `query` — üst kapsamdan gelen küçük harfli arama string'i
- **Dönüş**: `boolean` — `r.order_number`, `r.customer_name`, `r.customer_email`, `r.reason` alanlarından herhangi birinin `query`'yi içerip içermediğini döndürür

---

### [N8_NASIL] AST Pointer: AdminReturnsPage.tsx::sortedReturns
- **params**: () — anonim arrow fonksiyon, parametre yok
- **ic_degiskenler**:
  - `arr` — `filteredReturns` dizisinin shallow kopyası (`[...filteredReturns]`); sıralama bu kopya üzerinde yapılır
  - `dir` — sıralama yönü; `sortDir === 'asc'` ise `1`, değilse `-1` (carpan)
  - `ao` — sıralama anahtarı `order` durumunda, `a.order_number` varsa onu, yoksa `a.order_id`'yi tutar
  - `bo` — sıralama anahtarı `order` durumunda, `b.order_number` varsa onu, yoksa `b.order_id`'yi tutar
- **Dönüş**: `ReturnWithOrder[]` — sıralanmış iade dizisi

---

### [N9_NASIL] AST Pointer: AdminReturnsPage.tsx::sortComparator
- **params**: `a`, `b` — her ikisi de `ReturnWithOrder` tipinde iade nesneleri
- **ic_degiskenler**:
  - `dir` — sıralama yönü carpanı (`asc` ise `1`, `desc` ise `-1`)
  - `ao` — `order` sıralamasında `a` için kullanılan sipariş numarası/ID'si (order_number tercih edilir)
  - `bo` — `order` sıralamasında `b` için kullanılan sipariş numarası/ID'si (order_number tercih edilir)
- **Dönüş**: `number` — `localeCompare` veya aritmetik fark ile sıralama skoru

---

### [N10_NASIL] AST Pointer: AdminReturnsPage.tsx::toggleSort
- **params**: `key: SortKey` — sıralanacak sütun anahtarı
- **ic_degiskenler**: yok
- **Dönüş**: yok — `setSortDir` ve/veya `setSortKey` ile state güncellenir; aynı tuşa tekrar basılırsa yön terslenir, farklı tuşa basılırsa yeni sütun seçilir

---

### [N11_NASIL] AST Pointer: AdminReturnsPage.tsx::sortIndicator
- **params**: `key: SortKey` — göstergesi istenen sütun anahtarı
- **ic_degiskenler**: yok
- **Dönüş**: `string` — aktif sıralama sütunu ise `'▲'` veya `'▼'`, değilse boş string `''`

---

### [N12_NASIL] AST Pointer: AdminReturnsPage.tsx::handleStatusUpdate
- **params**: `returnId: string` — güncellenecek iadenin ID'si, `newStatus: string` — hedef durum
- **ic_degiskenler**:
  - `returnItem` — `returns.find(r => r.id === returnId)` ile bulunan `ReturnWithOrder` nesnesi; güncellenen kaydın mevcut verilerini tutar
  - `oldStatus` — `returnItem.status`, güncelleme öncesi mevcut durum string'i; audit log ve bildirim için kullanılır
  - `error` — Supabase update çağrısının hata nesnesi
- **Dönüş**: yok — Supabase'de durum güncellenir, audit log yazılır, local state güncellenir, sipariş senkronizasyonu yapılır, mock refund çağrılır, müşteriye e-posta bildirimi gönderilir (yan etkiler)

---

### [N13_NASIL] AST Pointer: AdminReturnsPage.tsx::statusUpdateStateMapper
- **params**: `prev` — `ReturnWithOrder[]` tipinde mevcut returns state dizisi
- **ic_degiskenler**: yok
- **Dönüş**: `ReturnWithOrder[]` — `returnId` eşleşen elemanın `status` ve `updated_at` alanları güncellenmiş yeni dizi; `updated_at` `new Date().toISOString()` ile set edilir

---

### [N14_NASIL] AST Pointer: AdminReturnsPage.tsx::getStatusLabel
- **params**: `status: string` — durum anahtarı
- **ic_degiskenler**: yok
- **Dönüş**: `string` — `_t(\`admin.returns.statusLabels.${status}\`)` ile uluslararasılaştırılmış durum etiketi; çeviri bulunamazsa ham `status` string'ini döndürür

---

### [N15_NASIL] AST Pointer: AdminReturnsPage.tsx::getStatusIcon
- **params**: `status: string` — durum anahtarı
- **ic_degiskenler**: yok
- **Dönüş**: `JSX.Element` — duruma karşılık gelen lucide-react ikon bileşeni (`Clock`, `CheckCircle`, `XCircle`, `Truck`, `Package`, `RefreshCw`) ve uygun renk class'ı

---

### [N16_NASIL] AST Pointer: AdminReturnsPage.tsx::getStatusColor
- **params**: `status: string` — durum anahtarı
- **ic_degiskenler**: yok
- **Dönüş**: `string` — Tailwind CSS renk class string'i (bg, text, border); duruma göre amber, emerald, rose, cyan, violet, slate tonları

---

### [N17_NASIL] AST Pointer: AdminReturnsPage.tsx::exportCsv
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `header` — `string[]` tipinde CSV sütun başlıkları dizisi; `_t()` ile uluslararasılaştırılmış
  - `lines` — `filteredReturns.map(r => [...])` ile üretilen CSV satır stringleri dizisi
  - `bom` — `'\ufeff'` UTF-8 BOM karakteri; Excel uyumluluğu için
  - `csv` — tüm satırları `\n` ile birleştirilmiş tam CSV string'i
  - `blob` — CSV verisinden oluşturulmuş `Blob` nesnesi; `text/csv;charset=utf-8` MIME tipi
  - `url` — `URL.createObjectURL(blob)` ile elde edilen geçici dosya URL'i
  - `a` — `document.createElement('a')` ile oluşturulmuş DOM `<a>` elementi; indirme tetikleyicisi
- **Dönüş**: yok — tarayıcıda CSV dosyası indirme tetiklenir (yan etki)

---

### [N18_NASIL] AST Pointer: AdminReturnsPage.tsx::csvRowMapper
- **params**: `r` — `ReturnWithOrder` tipinde iade nesnesi
- **ic_degiskenler**: yok (dahili `orderNo` hesaplaması: `r.order_number` varsa `r.order_number.split('-')[1]`, yoksa `r.order_id.slice(-8).toUpperCase()`)
- **Dönüş**: `string` — tek bir CSV satırı; virgülle ayrılmış, çift tırnak ile escape edilmiş alanlar

---

### [N19_NASIL] AST Pointer: AdminReturnsPage.tsx::exportXls
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `rowsHtml` — `filteredReturns.map(r => {...})` ile üretilen HTML `<tr>` satırlarının birleştirilmiş string'i
  - `table` — tam HTML doküman string'i; UTF-8 charset, tablo başlıkları `_t()` ile uluslararasılaştırılmış
  - `blob` — HTML tablosundan oluşturulmuş `Blob` nesnesi; `application/vnd.ms-excel` MIME tipi
  - `url` — `URL.createObjectURL(blob)` ile elde edilen geçici dosya URL'i
  - `a` — `document.createElement('a')` ile oluşturulmuş DOM `<a>` elementi; indirme tetikleyicisi
- **Dönüş**: yok — tarayıcıda XLS dosyası indirme tetiklenir (yan etki)

---

### [N20_NASIL] AST Pointer: AdminReturnsPage.tsx::xlsRowMapper
- **params**: `r` — `ReturnWithOrder` tipinde iade nesnesi
- **ic_degiskenler**:
  - `orderNo` — formatlanmış sipariş numarası string'i; `r.order_number` varsa `#${r.order_number.split('-')[1]}`, yoksa `#${r.order_id.slice(-8).toUpperCase()}`
  - `amount` — formatlanmış tutar string'i; `r.total_amount` number ise `formatCurrency(...)` çağrısı, değilse boş string
- **Dönüş**: `string` — tek bir HTML `<tr>` satırı; `<td>` içinde sırasıyla orderNo, customer_name, customer_email, reason, status label, created_at, amount

---

### [N21_NASIL] AST Pointer: AdminReturnsPage.tsx::statusFilterToggleMapper
- **params**: `o` — `{ value: string; label: string }` tipinde durum seçeneği nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: `{ key: string; label: string; active: boolean; onToggle: () => void }` nesnesi — `active`, `statusFilter[o.value]` boolean'ını; `onToggle`, ilgili durum filtresini tersleyen callback'i barındırır

---

### [N22_NASIL] AST Pointer: AdminReturnsPage.tsx::renderTableRow
- **params**: `returnItem` — `ReturnWithOrder` tipinde iade nesnesi, `index` — `number` tipinde sıralama indeksi (animasyon gecikmesi için)
- **ic_degiskenler**:
  - `orderNo` — formatlanmış sipariş numarası string'i; `returnItem.order_number` varsa `#${returnItem.order_number.split('-')[1]}`, yoksa `#${returnItem.order_id.slice(-8).toUpperCase()}`
- **Dönüş**: `JSX.Element` — tablonun tek bir `<tr>` satırı; visibleCols kontrolü ile sütun görünürlüğü, formatCurrency/formatDate/formatTime ile hücre değerleri, handleStatusUpdate ile durum değiştirme butonları, hasWriteAccess ile yazma izni kontrolü, updatingStatus ile spinner gösterimi

---

### [N23_NASIL] AST Pointer: AdminReturnsPage.tsx::renderStatusActionButtons
- **params**: `status` — `string` tipinde hedef durum anahtarı
- **ic_degiskenler**: yok
- **Dönüş**: `JSX.Element` — durum değiştirme butonu; `handleStatusUpdate(returnItem.id, status)` onClick handler'ı, `updatingStatus === returnItem.id` ile yükleme durumu kontrolü, `getStatusLabel(status)` ile buton metni, `ChevronRight` ikonu

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