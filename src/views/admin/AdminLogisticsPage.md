---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminLogisticsPage.tsx
skeleton_hash: ee142e6a3a93a46f
entity_hashes:
  func:AdminLogisticsPage: 3a990bf647e4d474
  overview: 47027fdc5498e419
  style_tokens: ed7e03291afa4b48
generated_at: 2026-06-14T13:28:36Z
---

## Genel Bakış
AdminLogisticsPage, VentHub HVAC yönetici panelinde lojistik süreçlerin merkezi olarak yönetildiği React bileşenidir. Sipariş takibi, stok yönetimi ve teslimat süreçleri gibi lojistik operasyonların görüntülenmesi ve kontrolü için yönetici arayüzü sunar. Yetkili kullanıcılar için tek sayfalık bir yönetim paneli olarak tasarlanmıştır.

## Fonksiyon Grupları
### Yönetim Sayfası Bileşeni
Lojistik verilerinin sunumunu ve yönetici etkileşimini tek bir bileşen üzerinde yoğunlaştıran ana React bileşenidir.
- AdminLogisticsPage

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### AdminLogisticsPage

**Ne yapar**: Admin panelindeki lojistik yönetimi sayfasını render eden React fonksiyonel bileşenidir. Kargo bekleyen siparişleri listeler, kargo firması ve takip numaraları girilmesini sağlar ve toplu olarak kargo güncelleme işlemlerini Supabase Edge Function üzerinden gerçekleştirir.

**Nasıl yapar**:

Bileşen, ilk olarak `useI18n()` hook'u ile çoklu dil desteği (`t` fonksiyonu), `useRole()` hook'u ile yetkilendirme bilgisi (`canWrite`), `useDragScroll()` hook'u ile sürükleerek yatay kaydırma desteği ve `usePathname()` ile mevcut URL yolunu alır. `canWrite('logistics')` çağrısı ile kullanıcının lojistik alanında yazma yetkisi olup olmadığı kontrol edilir; bu yetki, tablodaki form elemanlarının devre dışı bırakılması ve toplu gönderim butonunun koşullu render edilmesi için kullanılır.

`fetchPendingOrders` fonksiyonu (`useCallback` ile sarılmıştır) `supabase.from('view_admin_orders')` üzerinden durumu `'confirmed'` veya `'processing'` olan ve henüz kargoya verilmemiş (`shipped_at` null) siparişleri çeker. Önce `ensureSessionFresh()` ile oturum tazeliği sağlanır, ardından `LogisticsRow` dizisine dönüştürülerek state'e yazılır. Hata durumunda `toast.error` ile kullanıcıya bildirim gönderilir.

`updateRow` fonksiyonu, belirli bir satırın `carrier` veya `tracking_number` alanını günceller ve o satırın `saved` durumunu `false` yaparak değişiklik olduğunu işaretler. `applyGlobalCarrier` fonksiyonu ise henüz kaydedilmemiş (`saved === false`) tüm satırlara seçili global kargo firmasını uygular.

`generateTrackingUrl` fonksiyonu kargo firması adına göre ilgili kargo firmanın takip URL'ini oluşturur. Desteklenen firmalar: Yurtiçi Kargo, Aras Kargo, MNG Kargo ve PTT'dir. Tanınmayan firma için `null` döner.

`handleBulkSubmit` fonksiyonu (`async`), takip numarası girilmiş ancak henüz kaydedilmemiş satırları filtreler. `mutateWithAudit` ile denetim (audit) korumalı bir güncelleme işlemi başlatır; bu fonksiyon yetki kontrolü (`canWrite`) yapar ve `admin-update-shipping` Edge Function'ını her satır için ayrı ayrı `Promise.all` ile paralel olarak çağırır. Her satır için kargo firması, takip numarası, oluşturulan takip URL'i ve e-posta gönderim seçeneği (`send_email: true`) gönderilir. İşlem sonucuna göre satırlar `saved: true` olarak işaretlenir veya hata sayacı artırılır; toplu sonuç kullanıcıya toast ile bildirilir. `AdminPermissionError` yakalandığında özel bir yetkinlik hatası mesajı gösterilir.

Render kısmında, üst kısımda sayfa başlığı ve yenileme butonu; orta kısımda global kargo firması seçimi ve "Tümüne Uygula" butonu; ana kısımda ise siparişlerin tablo görünümü yer alır. Tabloda her satır için sipariş numarası, müşteri adı, kargo firması select'i, takip numarası input'u ve durum göstergesi (kaydedildiyse yeşil onay, değilse "Ready" yazısı) bulunur. Alt kısımda hazır sipariş sayısı ve toplu gönderim butonu sticky olarak sabitlenmiştir. `loading` durumunda `AdminSkeleton`, boş durumda `AdminEmptyState` bileşenleri render edilir. `dragScrollRef` tabloya atanarak mobil cihazlarda sürükleme ile yatay kaydırma desteği sağlanır.

**Parametreler**:

Bileşen parametre almamaktadır (React fonksiyonel bileşeni olarak props'suz tanımlanmıştır).

**Dönüş**: `JSX.Element` — Lojistik yönetim sayfasının tamamını oluşturan React JSX yapısı döndürür. Sayfa, sipariş tablosu, kargo firması seçim paneli, durum göstergeleri ve toplu gönderim butonundan oluşan bir admin paneli arayüzüdür.

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

### [N1_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::AdminLogisticsPage
- **params**: (parametre yok — React fonksiyon bileşeni)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu, tüm UI metinleri için kullanılır
  - `canWrite` — useRole hook'undan dönen yetki kontrol fonksiyonu, belirli alanlar için yazma izni sorgulanır
  - `hasWriteAccess` — canWrite('logistics') çağrısının boolean sonucu, lojistik alanı için yazma izni olup olmadığını tutar
  - `dragScrollRef` — useDragScroll hook'undan dönen ref, sürükleme ile yatay kaydırma yapılan div'e atanır
  - `rows` / `setRows` — useState<LogisticsRow[]>: bekleyen siparişlerin dizisi, her satır order_number, carrier, tracking_number, saved alanlarını içerir
  - `loading` / `setLoading` — useState<boolean>: veri yükleme durumu, true iken skeleton gösterilir
  - `saving` / `setSaving` — useState<boolean>: toplu kaydetme işlemi sırasında true olur, butonları devre dışı bırakır
  - `globalCarrier` / `setGlobalCarrier` — useState<string>: tüm satırlara uygulanacak varsayılan taşıyıcı adı, varsayılan 'Yurtiçi'
  - `fetchPendingOrders` — useCallback ile sarılmış async fonksiyon, Supabase'den confirmed/processing durumunda ve henüz shipped_at=null olan siparişleri çeker
  - `pathname` — usePathname hook'undan dönen mevcut URL yolu, sayfa değiştiğinde fetch tetiklenmesi için efekt bağımlılığında kullanılır
  - `useEffect` — [fetchPendingOrders, pathname] bağımlılıklarıyla, pathname değiştiğinde veya ilk yüklemede fetchPendingOrders çağrısı yapan efekt
  - `updateRow` — bir satırın carrier veya tracking_number alanını güncelleyen fonksiyon, satır bulunamazsa dokunulmaz, güncellenen satırın saved'i false yapılır
  - `applyGlobalCarrier` — kaydedilmemiş tüm satırlara globalCarrier değerini uygular,成功 toast gösterir
  - `generateTrackingUrl` — taşıyıcı adına göre takip sorgulama URL'i üreten fonksiyon, desteklenmeyen taşıyıcı için null döner
  - `handleBulkSubmit` — toplu gönderi güncelleme fonksiyonu, tracking_number dolu ve kaydedilmemiş satırları filtreleyerek mutateWithAudit üzerinden edge function çağrısı yapar
- **Dönüş**: JSX — admin lojistik yönetim sayfası layout'u (başlık, global taşıyıcı seçimi, sipariş tablosu, toplu gönder butonu)

---

### [N2_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::fetchPendingOrders
- **params**: (parametre yok — useCallback closure)
- **ic_degiskenler**:
  - `data` — supabase.from('view_admin_orders').select(...).in(...).is(...).order(...) sorgusundan dönen satır dizisi, her satır id, order_number, customer_name, created_at, carrier, tracking_number alanlarını içerir
  - `error` — supabase sorgusundan dönen hata nesnesi, null değilse fırlatılır
  - `err` — try-catch yakaladığı bilinmeyen hata, Error instance ise message'i toast'a eklenir
- **Dönüş**: void (async fonksiyon, return yok; yan etki olarak rows state'ini günceller ve loading state'ini yönetir)

---

### [N3_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::useEffect_callback
- **params**: (parametre yok — arrow fonksiyon)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — fetchPendingOrders() çağırarak yan etki üretir; pathname değiştiğinde veya ilk mount'ta tetiklenir

---

### [N4_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::updateRow
- **params**: `id: string` — güncellenecek satırın benzersiz kimliği, `field: 'carrier' | 'tracking_number'` — güncellenecek alan adı, `val: string` — atanacak yeni değer
- **ic_degiskenler**: (yok — doğrudan setRows çağrısı içinde map yapar)
- **Dönüş**: void — setRows ile state'i günceller; eşleşen satırın ilgili alanını val yapar ve saved'i false'a çeker

---

### [N5_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::applyGlobalCarrier
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — sadece setRows ve toast çağrısı)
- **Dönüş**: void — kaydedilmemiş (saved === false) tüm satırların carrier alanını globalCarrier değerine set eder, success toast gösterir

---

### [N6_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::generateTrackingUrl
- **params**: `carrier: string` — kargo firması adı (Yurtiçi, Aras, MNG, PTT vb.), `tracking: string` — kargo takip numarası
- **ic_degiskenler**:
  - `c` — carrier parametresinin küçük harfe çevrilmiş hali, kargo firması adı eşleştirmesi için kullanılır (includes kontrolü)
- **Dönüş**: `string | null` — desteklenen firmalar (yurtici, aras, mng, ptt) için tam takip URL'i; desteklenmeyen firma için null

---

### [N7_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::handleBulkSubmit
- **params**: (parametre yok — async arrow fonksiyon)
- **ic_degiskenler**:
  - `targets` — rows içinden tracking_number boş olmayan ve saved === false olan satırların filtrelenmiş dizisi, toplu güncellenecek siparişler
  - `errCount` — hata sayacı, Promise.all sonuçları içinde ok === false olan satır sayısını tutar
  - `results` — mutateWithAudit fonksiyonundan dönen dizi, her eleman {id, ok} şeklindedir
  - `e` — try-catch'te yakalanan hata, AdminPermissionError ise izin hatası toast'u gösterilir
- **Dönüş**: void — yan etki olarak rows state'ini günceller (saved=true yapar), hata/success toast gösterir, saving state'ini yönetir

---

### [N8_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::mutateWithAudit_fn_callback
- **params**: (parametre yok — mutateWithAudit'ın fn özelliğine verilen async arrow fonksiyon)
- **ic_degiskenler**: (yok — sadece Promise.all içinde map çağrısı)
- **Dönüş**: `{id: string, ok: boolean}[]` — her hedef satır için sonuç dizisi

---

### [N9_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::PromiseAll_map_callback
- **params**: `row` — targets dizisindeki tek bir LogisticsRow nesnesi (id, carrier, tracking_number alanları kullanılır)
- **ic_degiskenler**:
  - `turl` — generateTrackingUrl(row.carrier, row.tracking_number) çağrısından dönen takip URL'i veya null
  - `fnErr` — supabase.functions.invoke('admin-update-shipping') çağrısından dönen hata nesnesi, null değilse ok:false üretir
- **Dönüş**: `{id: string, ok: boolean}` — satır kimliği ve başarı durumu; edge function'a order_id, carrier, tracking_number, tracking_url, send_email gönderilir

---

### [N10_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::handleBulkSubmit_setRows_callback
- **params**: `prev` — önceki rows dizisi (React useState updater)
- **ic_degiskenler**:
  - `res` — results.find(x => x.id === r.id) ile bulunan, mevcut satırın ID'sine eşleşen sonuç nesnesi, bulunamazsa undefined
- **Dönüş**: LogisticsRow[] — güncellenmiş satır dizisi; res.ok ise satırın saved alanı true yapılır, false ise errCount artırılır

---

### [N11_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::rows_map_render_callback
- **params**: `row` — LogisticsRow nesnesi (id, order_number, customer_name, carrier, tracking_number, saved alanları), `idx` — satırın dizideki indeksi, animation delay hesaplaması için kullanılır
- **ic_degiskenler**: (yok — JSX içinde doğrudan row alanlarına erişilir)
- **Dönüş**: JSX `<tr>` elementi — sipariş numarası, müşteri adı, taşıyıcı select'i, takip numarası input'u ve durum göstergesini içeren tablo satırı

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