---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminLogisticsPage.tsx
skeleton_hash: 9f9079228d1f2880
entity_hashes:
  func:AdminLogisticsPage: 5503bc8a0114509c
  overview: a32062894d2b0cbb
  style_tokens: ed7e03291afa4b48
generated_at: 2026-05-29T18:57:32Z
---

## Genel Bakış
AdminLogisticsPage, VentHub HVAC projesinin yönetici panelinde lojistik süreçlerin yönetimini sağlayan bir React sayfa bileşenidir. Tek başına modülün tüm sorumluluğunu üstlenen bu bileşen, admin arayüzünde lojistik verilerinin görüntülenmesi ve yönetilmesi için bir arayüz sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Yönetici arayüzündeki lojistik yönetim sayfasının tamamını temsil eden tek bileşendir. Admin panelinde lojistik modülünün görünüm ve etkileşim mantığını barındırır.
- AdminLogisticsPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesi verilmediğinden, sadece fonksiyon imzasından çıkarılabilecek minimal varsayımlar tanımlanabilir.

[Aksiyom 1]: Eğer React runtime veya JSX transformasyonu yoksa, bileşen render edilemez.

[Aksiyom 2]: Eğer bu bileşen çağrıldığında bir React Component dönmüyorsa, üst bileşenin render ağacı kırılır.

[Aksiyom 3]: Fonksiyon imzasında parametre almadığından, bileşen dışarıdan prop ile beslenemez; bağımlılıklarını kendi içinde veya global state üzerinden çözmelidir.

[Aksiyom 4]: AdminLogisticsPage(), bir React sayfa bileşeni olarak tanımlandığından, çağrılmadan önce React ortamının (React, ReactDOM, Router vb.) hazır olması gerekir; eğer bu bağımlılıklar sağlanmamışsa bileşen hata fırlatır.

> **Not:** Fonksiyon gövdesi (body) paylaşılmadığı için, modülün iç işleyişine, state yönetimine, API çağrılarına veya conditional render mantığına dair aksiyom üretmek mümkün değildir. Daha kapsamlı mimari varsayımlar için fonksiyon gövdesi gereklidir.

---

## FONKSİYON DETAYLARI

### AdminLogisticsPage
**Ne yapar**: VentHub HVAC projesinin yönetici paneline ait lojistik yönetimi sayfası bileşenidir. Sistem üzerindeki tüm lojistik süreçlerinin görüntülenmesi, takibi ve yönetimi için yetkili yönetici kullanıcılara özel ana arayüzü sunar. Sadece yönetici seviyesindeki erişim haklarına sahip kullanıcıların ulaşabileceği bir içerik sunumu sağlar.
**Nasıl yapar**: Kaynak kodunun bulunduğu C:\Users\alize\venthub-hvac\src\views\admin\AdminLogisticsPage.tsx dosyası içerisinde tanımlı React tabanlı bir sayfa bileşeni olarak çalışır. İçerisinde lojistik yönetimi için gereken alt bileşenleri, ilgili veri akışlarını ve erişim kontrolü mantığını barındırarak, belirtilen genel domain kapsamında lojistik operasyonlarını yönetme imkanı tanır.
**Parametreler**: Fonksiyona geçirilmesi tanımlanmış herhangi bir parametre bulunmamaktadır.
**Dönüş**: Dönüş tipi hakkında resmi bir tanım bulunmamaktadır, React tabanlı sayfa bileşeni olması nedeniyle kullanıcıya görüntülenmek üzere JSX formatında arayüz elementleri döndürmesi beklenir.

---

## INTERFACES

### LogisticsRow
- `id: string`
- `order_number: string`
- `customer_name: string`
- `created_at: string`
- `carrier: string`
- `tracking_number: string`
- `saved: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::AdminLogisticsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu, UI metinleri için kullanılır
  - `canWrite` — useRole() hook'undan gelen rol kontrol fonksiyonu, yazma izni sorgulanır
  - `hasWriteAccess` — canWrite('logistics') çağrısının sonucu, lojistik modülünde yazma izni olup olmadığını boolean olarak tutar
  - `dragScrollRef` — useDragScroll<HTMLDivElement>() hook'undan dönen ref, sürükleme ile yatay kaydırma için tablo div'ine bağlanır
  - `rows` / `setRows` — useState<LogisticsRow[]>([]) ile oluşturulan sipariş satırları dizisi ve setter'ı, bekleyen siparişleri tutar
  - `loading` / `setLoading` — useState(true) ile oluşturulan yükleme durumu boolean'ı ve setter'ı
  - `saving` / `setSaving` — useState(false) ile oluşturulan kaydetme durumu boolean'ı ve setter'ı, toplu gönderim sırasında true olur
  - `globalCarrier` / `setGlobalCarrier` — useState('Yurtiçi') ile oluşturulan global kargo taşıyıcı adı string'i ve setter'ı, "Tümüne Uygula" için kullanılır
  - `fetchPendingOrders` — useCallback ile sarılmış asenkron fonksiyon, veritabanından bekleyen siparişleri çeker
  - `pathname` — usePathname() hook'undan gelen mevcut URL yolu, sayfa değişikliğinde veri yenileme tetikler
- **ic_fonksiyonlar**:
  - `fetchPendingOrders` — asenkron useCallback fonksiyonu
  - `updateRow` — tek bir satırın kargo veya takip numarasını güncelleyen fonksiyon
  - `applyGlobalCarrier` — tüm kaydedilmemiş satırlara seçili global kargo taşıyıcısını uygular
  - `generateTrackingUrl` — taşıyıcı adı ve takip numarasına göre kargo sorgulama URL'i üretir
  - `handleBulkSubmit` — asenkron fonksiyon, tüm hazırlanan siparişleri toplu olarak sunucuya gönderir
- **Dönüş**: JSX (React bileşeni)

---

### [N2_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::fetchPendingOrders
- **params**: (parametre yok — useCallback闭包)
- **ic_degiskenler**:
  - `data` — supabase.from('view_admin_orders').select() çağrısından dönen satırlar dizisi, ham veri tutar
  - `error` — supabase select çağrısından dönen hata nesnesi, varsa fırlatılır
- **Dönüş**: Promise<void> — state'leri (rows, loading) günceller, dönüş değeri yok

---

### [N3_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::map_transform_callback (fetchPendingOrders içindeki data.map)
- **params**: `r` — supabase'den gelen tek bir sipariş satırı (ham veri objesi)
- **ic_degiskenler**: (yok — inline transform)
- **Dönüş**: LogisticsRow objesi — { id, order_number, customer_name, created_at, carrier, tracking_number, saved }

---

### [N4_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — fetchPendingOrders() çağırarak yan etki oluşturur

---

### [N5_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::updateRow
- **params**: `id` (string) — güncellenecek satırın benzersiz kimliği, `field` ('carrier' | 'tracking_number') — güncellenecek alan adı, `val` (string) — yeni değer
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — setRows ile state'i günceller, ilgili satırın alanını değiştirir ve saved flag'ini false yapar

---

### [N6_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::applyGlobalCarrier
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — setRows ile globalCarrier değerini kaydedilmemiş tüm satırlara uygular ve toast.success gösterir

---

### [N7_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::generateTrackingUrl
- **params**: `carrier` (string) — kargo taşıyıcı adı (ör. "Yurtiçi", "Aras"), `tracking` (string) — kargo takip numarası
- **ic_degiskenler**:
  - `c` — carrier değerinin küçük harfe çevrilmiş hali, taşıyıcı adı eşleştirmede kullanılır
- **Dönüş**: string | null — taşyıcıya uygun kargo sorgulama URL'i veya eşleşme yoksa null

---

### [N8_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::handleBulkSubmit
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `targets` — rows dizisinden filtrelenmiş, takip numarası dolu ve henüz kaydedilmemiş satırlar dizisi, toplu gönderim adayları
  - `errCount` — hata sayacı, her başarısız satır güncellemesinde bir artar
  - `results` — Promise.all ile tüm supabase fonksiyon çağrılarının sonuçlarının dizisi, her eleman { id, ok } formatında
- **Dönüş**: Promise<void> — state'leri (rows, saving) günceller, toast bildirimleri gösterir

---

### [N9_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::handleBulkSubmit_inner_callback (Promise.all içindeki async)
- **params**: `row` — targets dizisinden gelen tek bir LogisticsRow objesi
- **ic_degiskenler**:
  - `turl` — generateTrackingUrl(row.carrier, row.tracking_number) çağrısından dönen kargo takip URL'i, supabase fonksiyonuna gönderilir
  - `fnErr` — supabase.functions.invoke('admin-update-shipping') çağrısından dönen hata nesnesi, yoksa succeeded demektir
- **Dönüş**: { id: string, ok: boolean } — satır kimliği ve başarılı olup olmadığı

---

### [N10_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::setRows_callback_in_handleBulkSubmit
- **params**: `prev` — güncellenmemiş önceki rows dizisi
- **ic_degiskenler**:
  - `res` — results.find(x => x.id === r.id) ile bulunan, mevcut satırın sonuç kaydı { id, ok } veya undefined
- **Dönüş**: LogisticsRow[] — güncellenmiş satırlar dizisi, başarılı olanların saved alanı true yapılır, bulunamayanlar aynen döner

---

### [N11_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::setRows_inner_callback (handleBulkSubmit setRows içindeki r.map callback)
- **params**: `r` —prev dizisindeki tek bir LogisticsRow objesi
- **ic_degiskenler**:
  - `res` — results.find(x => x.id === r.id) ile bulunan sonuç kaydı { id, ok } veya undefined
- **Dönüş**: LogisticsRow — güncellenmiş satır objesi, ok ise saved:true yapılır, res.ok false ise errCount artırılır, res yoksa aynı satır döner

---

### [N12_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::table_map_callback (JSX içindeki rows.map)
- **params**: `row` (LogisticsRow) — render edilecek tek bir sipariş satırı, `idx` (number) — satırın dizideki indeksi, animasyon gecikmesi için kullanılır
- **ic_degiskenler**: (yok — inline JSX transform)
- **Dönüş**: JSX tr elementi — sipariş numarası, müşteri adı, kargo taşıyıcı select'i, takip numarası input'u ve durum göstergesini içeren tablo satırı

---

## NODE ID STANDARD

  file: src\views\admin\AdminLogisticsPage.tsx
  function: src\views\admin\AdminLogisticsPage.tsx::AdminLogisticsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminLogisticsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500/10`, `bg-cyan-500/5`, `bg-emerald-400/10`, `bg-emerald-500/3`, `bg-surface-deep/20`, `bg-white/2`, `bg-white/20`, `bg-white/5`, `border-b`, `border-collapse`, `border-cyan-500/20`, `border-emerald-400/20`, `border-t`, `border-white/10`, `border-white/5`
- **Layout:** `absolute`, `backdrop-blur-xl`, `block`, `bottom-0`, `custom-scrollbar`, `flex`, `flex-1`, `flex-col`, `gap-1.5`, `gap-4`, `gap-6`, `h-12`, `h-64`, `inline-flex`, `items-center`
- **Varyant/Responsive:** `:`, `active:`, `disabled:`, `focus:`, `group-hover/submit:`, `group-hover:`, `hover:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `!bg-surface-deep/60`, `!font-mono`, `!py-2`, `!rounded-xl`, `!text-xs`, `$`, `${adminButtonPrimaryClass`, `${adminCardClass`, `${adminInputClass`, `${adminSelectClass`, `${adminTableCellClass`, `${adminTableHeadCellClass`, `-mr-32`, `-mt-32`, `:`