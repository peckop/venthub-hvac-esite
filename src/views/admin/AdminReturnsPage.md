---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx
skeleton_hash: 665af8b2e6937d88
entity_hashes:
  func:AdminReturnsPage: 5655af1a631450c5
  overview: 3de87dcfabc35e1e
  style_tokens: 91f3132d3b13a047
generated_at: 2026-05-29T18:59:59Z
---

## Genel Bakış
VentHub HVAC platformunun yönetici panelinde yer alan iade yönetim sayfasıdır. Kimlik doğrulaması ve admin rolü kontrolü yapıldıktan sonra, platform üzerindeki tüm iade işlemlerinin listelenmesi, duruma göre filtrelenmesi ve iade onaylama/reddetme/bilgi isteme gibi yönetimsel işlemlerin gerçekleştirilmesini sağlar.

## Fonksiyon Grupları
### Admin İade Sayfası Bileşeni
Tek bileşen yapısında, iade yönetimi ile ilgili tüm arayüzü ve iş mantığını barındırır. Kullanıcı kimlik ve rol kontrolü, iade listesinin gösterimi, durum bazlı filtreleme ile iade sobrelemelerinin (onaylama, reddetme, bilgi isteme) tetiklenmesini yönetir.
- AdminReturnsPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC admin panelindeki iade yönetim sayfası için temel mimari varsayımlar.

[Aksiyom 1]: Eğer kullanıcı admin yetkisine sahip değilse veya kimlik doğrulaması geçerli değilse, iade yönetimi sayfasına erişim sağlanamaz.

[Aksiyom 2]: Eğer iade verileri (returns) API'den başarıyla retrieve edilemezse, sayfa düzgün görüntülenemez.

[Aksiyom 3]: Eğer React bileşen hiyerarşisinde geçerli bir router context mevcut değilse, sayfa yönlendirmeleri çalışmaz.

---

**Not:** Fonksiyon gövdesi (implementation body) paylaşılmadığı için, detaylı akış varsayımları üretilememiştir. Yukarıdaki aksiyomlar, modülün dosya yapısından (.tsx) ve eski doküman bağlamından türetilen genel yapısal gereksinimlerdir. Detaylı aksiyon bazlı aksiyomlar için fonksiyon gövdesi gereklidir.

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

### [N1_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::AuthGuard
- **params**: () — parametre yok
- **ic_degiskenler**: (yok — sadece hook'lardan gelen `loading`, `user` ve `router` kullanılır)
- **Dönüş**: yok (yan etki: `router.replace()` ile login sayfasına yönlendirme)

---

### [N2_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::ParseUrlStatusParam
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `params` — `URLSearchParams` nesnesi, `window.location.search`'ten oluşturulur, URL sorgu parametrelerini okumak için
  - `stParam` — URL'deki `status` parametresinin string değeri (virgülle ayrılmış durum listesi), `null` olabilir
  - `next` — `statusFilter`'in shallow copy'si, tüm değerleri önce `false`'a set edilip ardından URL'deki durumlar `true` olarak işaretlenir
  - `k` — `Object.keys(next).forEach` döngüsünün iterasyon değişkeni, her bir durum anahtarını temsil eder
  - `s` — `stParam.split(',')` döngüsünün iterasyon değişkeni, her bir durum stringini temsil eder
  - `key` — `s.trim()` ile elde edilen, boşlukları temizlenmiş durum anahtarı
- **Dönüş**: yok (yan etki: `setStatusFilter(next)` ile state güncellenir)

---

### [N3_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::LoadReturns
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen raw satır dizisi (ilişkisel `venthub_orders` join'li)
  - `error` — Supabase sorgu sonucu hata nesnesi, `null` olabilir
  - `returnRows` — `ReturnRow[]` tipinde normalize edilmiş iade kayıtları dizisi, `data || []` fallback'li
  - `mapped` — `ReturnWithOrder[]` tipinde, `returnRows.map()` ile dönüştürülmüş nesne dizisi; her eleman `item.id`, `item.order_id`, `item.user_id`, `item.reason`, `item.description`, `item.status`, `item.created_at`, `item.updated_at`, `item.venthub_orders?.order_number`, `item.venthub_orders?.customer_name`, `item.venthub_orders?.customer_email`, `item.venthub_orders?.total_amount` alanlarını içerir
- **Dönüş**: yok (yan etki: `setReturns(mapped)`, `setIsLoading()`, `toast.error()`, `console.error()`)

---

### [N4_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::MapReturnItem
- **params**: `item` — tek bir `ReturnRow` nesnesi, Supabase'den gelen iade satırı
- **ic_degiskenler**: (yok — doğrudan `item` özelliklerinden harita oluşturulur)
- **Dönüş**: `{ id, order_id, user_id, reason, description, status, created_at, updated_at, order_number, customer_name, customer_email, total_amount }` — `ReturnWithOrder` tipinde nesne

---

### [N5_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::EffectLoadReturns
- **params**: () — parametre yok
- **ic_degiskenler**: (yok — sadece `loadReturns()` çağrısı)
- **Dönüş**: yok (yan etki: `loadReturns()` fonksiyonunu çağırır)

---

### [N6_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::ApplyFilters
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `filtered` — filtreleme sürecinde kullanılan geçici dizi, başlangıçta `returns` dizisinin referansı, ardından filtrelenmiş hali
  - `anyStatus` — `Object.values(statusFilter).some(Boolean)` sonucu, herhangi bir durum filtresinin aktif olup olmadığını belirten boolean
  - `query` — `searchQuery.toLowerCase()` ile oluşturulmuş küçük harfli arama metni
- **Dönüş**: yok (yan etki: `setFilteredReturns(filtered)` ile state güncellenir)

---

### [N7_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::SearchFilterPredicate
- **params**: `r` — tek bir `ReturnWithOrder` nesnesi, filtrelenecek iade kaydı
- **ic_degiskenler**: (yok — doğrudan `r.order_number`, `r.customer_name`, `r.customer_email`, `r.reason` ve outer scope `query` kullanılır)
- **Dönüş**: `boolean` — kayıt arama sorgusuyla eşleşiyor mu

---

### [N8_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::SortReturns
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `arr` — `filteredReturns` dizisinin shallow copy'si (`[...filteredReturns]`), sıralama işlemi orijinal diziyi bozmaması için kopya üzerinde yapılır
  - `dir` — sıralama yönü çarpanı, `sortDir === 'asc'` ise `1`, aksi halde `-1`
  - `ao` — `a` elemanının sıralama değeri, `a.order_number` varsa onu aksi halde `a.order_id`'yi kullanır
  - `bo` — `b` elemanının sıralama değeri, `b.order_number` varsa onu aksi halde `b.order_id`'yi kullanır
- **Dönüş**: `ReturnWithOrder[]` — sıralanmış dizi

---

### [N9_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::CompareFn
- **params**: `a` — sıralanacak birinci `ReturnWithOrder` nesnesi, `b` — sıralanacak ikinci `ReturnWithOrder` nesnesi
- **ic_degiskenler**:
  - `dir` — sıralama yönü çarpanı, `sortDir === 'asc'` ise `1`, aksi halde `-1`
  - `ao` — `a` elemanının sıralama değeri (sadece `case 'order'` bloğunda), `a.order_number` varsa onu aksi halde `a.order_id` kullanır
  - `bo` — `b` elemanının sıralama değeri (sadece `case 'order'` bloğunda), `b.order_number` varsa onu aksi halde `b.order_id` kullanır
- **Dönüş**: `number` — negatif, sıfır veya pozitif karşılaştırma sonucu

---

### [N10_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::ToggleSort
- **params**: `key: SortKey` — sıralanacak sütunun anahtarı
- **ic_degiskenler**: (yok — doğrudan `sortKey`, `sortDir`, `setSortKey`, `setSortDir` kullanılır)
- **Dönüş**: yok (yan etki: `setSortDir()` ve/veya `setSortKey()` ile state güncellenir)

---

### [N11_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::SortIndicator
- **params**: `key: SortKey` — sıralama göstergesi istenen sütunun anahtarı
- **ic_degiskenler**: (yok — doğrudan `sortKey` ve `sortDir` kullanılır)
- **Dönüş**: `string` — sıralama yönüne göre `'▲'`, `'▼'` veya boş string `''`

---

### [N12_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::HandleStatusUpdate
- **params**: `returnId: string` — güncellenecek iadenin UUID'si, `newStatus: string` — hedef durum stringi
- **ic_degiskenler**:
  - `returnItem` — `returns.find(r => r.id === returnId)` ile bulunan iade kaydı nesnesi, bulunamazsa `undefined`
  - `oldStatus` — `returnItem.status`'ten alınan güncelleme öncesi eski durum stringi
  - `error` — Supabase `.update()` sorgusundan dönen hata nesnesi
  - `logAdminAction` — `await import('../../lib/audit')` ile dinamik import edilen audit loglama fonksiyonu
  - `refundErr` — `supabase.functions.invoke('refund-order-mock')` sonucu hata nesnesi
  - `invokeError` — `supabase.functions.invoke('return-status-notification')` sonucu hata nesnesi
  - `emailError` — e-posta bildirim try-catch bloğundaki yakalanan hata nesnesi
- **Dönüş**: yok (yan etki: `supabase.from().update()`, `setReturns()` state güncellemesi, `syncOrderFromReturn()` orders tablosu senkronizasyonu, `toast.success()`/`toast.error()` bildirimleri, `supabase.functions.invoke()` ile mock refund ve e-posta bildirimi)

---

### [N13_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::SetReturnsMapFn
- **params**: `prev` — mevcut `returns` state dizisi (callback'in parametresi)
- **ic_degiskenler**: (yok — doğrudan `prev.map()`, `r.id`, `returnId`, `newStatus` kullanılır)
- **Dönüş**: `ReturnWithOrder[]` — güncellenmiş iade kayıtları dizisi

---

### [N14_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::GetStatusLabel
- **params**: `status: string` — durum anahtarı
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — `_t()` ile çevrilmiş durum etiketi, çeviri bulunamazsa orijinal `status` stringi

---

### [N15_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::GetStatusIcon
- **params**: `status: string` — durum anahtarı
- **ic_degiskenler**: (yok — doğrudan `Clock`, `CheckCircle`, `XCircle`, `Truck`, `Package`, `RefreshCw` icon bileşenleri kullanılır)
- **Dönüş**: `JSX.Element` — duruma karşılık gelen lucide-react icon bileşeni

---

### [N16_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::GetStatusColor
- **params**: `status: string` — durum anahtarı
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — Tailwind CSS renk class'ları (bg, text, border) birleştirilmiş string

---

### [N17_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::ExportCsv
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `header` — `string[]` tipinde CSV sütun başlıkları dizisi, `_t()` ile çevrilmiş 7 başlık
  - `lines` — `filteredReturns.map()` ile oluşturulmuş CSV satır stringleri dizisi, her satır virgülle ayrılmış ve tırnak işaretleri escape edilmiş
  - `bom` — UTF-8 BOM karakteri (`'\ufeff'`), Excel'in doğru kodlamayı tanıması için
  - `csv` — tüm satırları newline ile birleştirilmiş tam CSV stringi
  - `blob` — `Blob` nesnesi, CSV içeriğini `text/csv;charset=utf-8;` MIME tipiyle paketler
  - `url` — `URL.createObjectURL(blob)` ile oluşturulan geçici dosya URL'i
  - `a` — `document.createElement('a')` ile oluşturulan DOM anchor elementi, indirme tetikleyicisi
- **Dönüş**: yok (yan etki: dosya indirme tetiklenir, geçici URL `revokeObjectURL` ile serbest bırakılır)

---

### [N18_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::ExportCsvMapFn
- **params**: `r` — tek bir `ReturnWithOrder` nesnesi
- **ic_degiskenler**: (yok — doğrudan `r.order_number`, `r.order_id`, `r.customer_name`, `r.customer_email`, `r.reason`, `r.status`, `r.created_at`, `r.total_amount` kullanılır)
- **Dönüş**: `string` — virgülle ayrılmış ve escape edilmiş CSV satır stringi

---

### [N19_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::ExportXls
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `rowsHtml` — `filteredReturns.map()` ile oluşturulmuş HTML `<tr>` satırlarının birleştirilmiş stringi
  - `orderNo` — formate edilmiş sipariş numarası, `r.order_number` varsa `#` + ilk tire sonrası kısım, yoksa `#` + `order_id` son 8 karakteri
  - `amount` — `formatCurrency()` ile formatlanmış para birimi stringi veya boş string
  - `table` — tam HTML döküman stringi, `<table>` yapısı ve tüm satırları içerir
  - `blob` — `Blob` nesnesi, HTML tablosunu `application/vnd.ms-excel` MIME tipiyle paketler
  - `url` — `URL.createObjectURL(blob)` ile oluşturulan geçici dosya URL'i
  - `a` — `document.createElement('a')` ile oluşturulan DOM anchor elementi
- **Dönüş**: yok (yan etki: dosya indirme tetiklenir, geçici URL `revokeObjectURL` ile serbest bırakılır)

---

### [N20_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::ExportXlsMapFn
- **params**: `r` — tek bir `ReturnWithOrder` nesnesi
- **ic_degiskenler**:
  - `orderNo` — formate edilmiş sipariş numarası, `r.order_number` varsa `#` + split ile alınan kısım, yoksa `#` + `r.order_id.slice(-8).toUpperCase()`
  - `amount` — `typeof r.total_amount === 'number'` kontrolü sonrası `formatCurrency()` ile formatlanmış string veya boş string
- **Dönüş**: `string` — HTML `<tr>` satır stringi

---

### [N21_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::StatusFilterToggleFn
- **params**: `o` — `{ value: string, label: string }` tipinde durum filtre seçeneği nesnesi
- **ic_degiskenler**: (yok — doğrudan `statusFilter` ve `setStatusFilter` kullanılır)
- **Dönüş**: `{ key: string, label: string, active: boolean, onToggle: () => void }` — filtre butonu için yapılandırılmış nesne

---

### [N22_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::RenderReturnRow
- **params**: `returnItem` — `ReturnWithOrder` tipinde tek bir iade kaydı, `index` — `number` tipinde dizin sırası
- **ic_degiskenler**:
  - `orderNo` — formate edilmiş sipariş numarası, `returnItem.order_number` varsa `#` + ilk tire sonrası kısım, yoksa `#` + `returnItem.order_id.slice(-8).toUpperCase()`
- **Dönüş**: `JSX.Element` — `<tr>` HTML tablo satırı bileşeni

---

### [N23_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::StatusActionButton
- **params**: `status` — `string` tipinde hedef durum anahtarı
- **ic_degiskenler**: (yok — outer scope `returnItem`, `handleStatusUpdate`, `updatingStatus`, `getStatusLabel` kullanılır)
- **Dönüş**: `JSX.Element` — durum güncelleme butonu bileşeni

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