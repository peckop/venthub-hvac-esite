---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminLogisticsPage.tsx
skeleton_hash: e5d3c48e4a8d4389
entity_hashes:
  func:AdminLogisticsPage: 5503bc8a0114509c
  overview: 9e734e9a0852443d
  style_tokens: ed7e03291afa4b48
generated_at: 2026-05-28T22:39:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yönetici arayüzünde yer alan lojistik işlemleri sayfasını oluşturan React bileşenidir. Sistemin lojistik modülünün yönetici tarafından erişilen ana giriş noktası olarak çalışır, tüm lojistikle ilgili yönetici işlemlerinin tek bir merkezde sunulmasını sağlar.

## Fonksiyon Grupları
### Ana Lojistik Sayfa Bileşeni
Yönetici arayüzündeki lojistik sayfasının tüm yapısını barındıran tek ana bileşendir, admin panelindeki lojistik modülünün temel çalışma noktası olarak görev görür.
- AdminLogisticsPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı admin paneli lojistik yönetim sayfası modülünün güvenli, erişilebilir ve tutarlı çalışması için uygulamanın yetkilendirme, yönlendirme, ortak UI bileşenleri ve backend iletişim altyapılarının tam olarak çalışır durumda olması zorunludur.

[Aksiyom 1]: Eğer kullanıcı rolleri bazlı yetkilendirme mekanizması yoksa, yetkisi olmayan普通 kullanıcılar bu yönetim sayfasına erişebilir, lojistik ve sistem verilerinin güvenliği ihlal olur.
[Aksiyom 2]: Eğer uygulama içi rota (routing) altyapısı bu sayfayı tanımlı admin rota adresi altında sunmuyorsa, yetkili admin kullanıcıları bile lojistik yönetim arayüzüne erişemez.
[Aksiyom 3]: Eğer sayfanın lojistik verilerini çekmek ve işlemek için kullandığı backend API servisleri erişilemez durumdaysa, sayfadaki tüm yönetim fonksiyonları devre dışı kalır, hiçbir işlem gerçekleştirilemez.
[Aksiyom 4]: Eğer uygulamanın diğer admin sayfalarıyla ortak kullanılan temel UI bileşenleri (kenar çubuğu, üst menü, izin kontrolü butonları vb.) bu sayfa ile entegre çalışmıyorsa, AdminLogisticsPage diğer admin arayüzleriyle tutarsız bir deneyim sunar, kullanıcı işlem yapamaz hale gelir.
[Aksiyom 5]: Eğer sayfada kullanıcı girdilerini temizleyen XSS gibi web güvenliği önlemleri uygulanmamışsa, kötü niyetli girdilerle admin hesabı ele geçirilebilir ya da sistemdeki lojistik veriler değiştirilebilir.

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

### [N1_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::AdminLogisticsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, metinleri çevirmek için kullanılır
  - `canWrite` — useRole hook'undan gelen yetki kontrol fonksiyonu, yazma izni olup olmadığını kontrol eder
  - `hasWriteAccess` — lojistik modülü için yazma izni olup olmadığını tutan boolean değer
  - `dragScrollRef` — sürükleyerek kaydırma işlevi için div elementine bağlanan ref nesnesi
  - `rows` — bekleyen siparişlerin tutulduğu state, LogisticsRow tipinde dizi
  - `setRows` — rows state'ini güncellemek için kullanılan setter fonksiyonu
  - `loading` — veri yükleme durumunu tutan state boolean'ı
  - `setLoading` — loading state'ini güncelleyen setter fonksiyonu
  - `saving` — toplu kaydetme işleminin durumunu tutan state boolean'ı
  - `setSaving` — saving state'ini güncelleyen setter fonksiyonu
  - `globalCarrier` — tüm siparişlere uygulanacak varsayılan kargo firmasını tutan state string'i
  - `setGlobalCarrier` — globalCarrier state'ini güncelleyen setter fonksiyonu
  - `fetchPendingOrders` — bekleyen siparişleri veritabanından çeken useCallback ile sarmalanmış async fonksiyon
  - `pathname` — Next.js usePathname hook'undan gelen mevcut sayfa yolu
  - `updateRow` — tek bir sipariş satırındaki alanı güncelleyen fonksiyon
  - `applyGlobalCarrier` — seçilen global kargo firmasını tüm kaydedilmemiş siparişlere uygulayan fonksiyon
  - `generateTrackingUrl` — kargo firması ve takip numarasına göre takip bağlantısı oluşturan fonksiyon
  - `handleBulkSubmit` — tüm kaydedilmemiş geçerli siparişlerin kargo bilgilerini toplu olarak kaydeden async fonksiyon
- **Dönüş**: Admin lojistik sayfasının JSX elementi

### [N2_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::fetchPendingOrders
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` — yükleme durumunu true'ya çeken state setter'ı
  - `ensureSessionFresh` — oturumun geçerliliğini kontrol eden async fonksiyon
  - `supabase` — Supabase istemcisi, veritabanı sorguları için kullanılır
  - `data` — Supabase sorgusundan dönen sipariş verileri
  - `error` — Sorgu sırasında oluşan hata nesnesi
  - `setRows` — işlenmiş sipariş verilerini rows state'ine kaydeden setter
  - `t` — Çeviri fonksiyonu, boş alanlar için varsayılan metinleri almak için kullanılır
  - `err` — Try bloğunda yakalanan hata nesnesi
  - `toast` — Kullanıcıya hata bildirimi gösteren toast fonksiyonu
- **Dönüş**: void (async)

### [N3_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fetchPendingOrders` — Sayfa yüklendiğinde veya yol değiştiğinde bekleyen siparişleri çeken fonksiyon
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::updateRow
- **params**: id: string, field: 'carrier' | 'tracking_number', val: string
- **ic_degiskenler**:
  - `setRows` — rows state'ini güncelleyen setter fonksiyonu
  - `prev` — Güncelleme öncesi mevcut rows state değeri
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::applyGlobalCarrier
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setRows` — Tüm kaydedilmemiş satırların kargo firmasını güncellemek için kullanılan state setter'ı
  - `prev` — Güncelleme öncesi mevcut rows state değeri
  - `globalCarrier` — Tüm satırlara uygulanacak seçili global kargo firması değeri
  - `toast` — İşlem başarılı olduğunda kullanıcıya bildirim gösteren fonksiyon
  - `t` — Bildirim metnini çevirmek için kullanılan çeviri fonksiyonu
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::generateTrackingUrl
- **params**: carrier: string, tracking: string
- **ic_degiskenler**:
  - `c` — Küçük harfe çevrilmiş kargo firması adı, firma kontrolü için kullanılır
- **Dönüş**: kargo takip bağlantısı string'i veya eşleşme olmazsa null

### [N7_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::handleBulkSubmit
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `rows` — Mevcut tüm sipariş satırlarını içeren state değeri
  - `targets` — Takip numarası girilmiş ve henüz kaydedilmemiş siparişlerin filtrelenmiş dizisi
  - `toast` — Kullanıcıya uyarı/bildirim gösteren fonksiyon
  - `t` — Bildirim metinlerini çevirmek için kullanılan çeviri fonksiyonu
  - `setSaving` — Kaydetme durumunu true'ya çeken state setter'ı
  - `errCount` — Kaydetme sırasında oluşan hataların sayısını tutan sayaç
  - `results` — Tüm siparişlerin kaydetme işlemlerinin sonuçlarını içeren dizi
  - `setRows` — Başarıyla kaydedilen siparişlerin durumunu güncellemek için kullanılan state setter'ı
  - `prev` — Güncelleme öncesi mevcut rows state değeri
  - `res` — Mevcut satırın kaydetme işlemi sonucu, sonuçlar dizisinden bulunur
- **Dönüş**: void (async)

### [N8_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::targets_map_async_callback
- **params**: row: LogisticsRow
- **ic_degiskenler**:
  - `turl` — Oluşturulan kargo takip bağlantısı
  - `generateTrackingUrl` — Takip bağlantısı oluşturan fonksiyon
  - `supabase` — Supabase Edge Function'ını çağırmak için kullanılan istemci
  - `fnErr` — Edge Function çağrısı sırasında oluşan hata nesnesi
- **Dönüş**: { id: string, ok: boolean } — Siparişin kayıt durumu

### [N9_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::setRows_map_callback
- **params**: r: LogisticsRow
- **ic_degiskenler**:
  - `res` — Mevcut satırın kayıt sonucu, sonuçlar dizisinden bulunur
  - `results` — Tüm siparişlerin kayıt sonuçlarını içeren dizi
  - `errCount` — Başarısız kayıtların sayısını artırmak için kullanılan sayaç
- **Dönüş**: Güncellenmiş LogisticsRow nesnesi (kaydedilmiş olarak işaretlenmiş)

### [N10_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::rows_map_jsx_callback
- **params**: row: LogisticsRow, idx: number
- **ic_degiskenler**:
  - `row.id` — Satırın benzersiz kimliği, React anahtarı olarak kullanılır
  - `row.saved` — Satırın kaydedilme durumu, satır stili ve girişlerin kilit durumu için kullanılır
  - `hasWriteAccess` — Kullanıcının yazma izni olup olmadığı, girişlerin aktiflik durumu için kullanılır
  - `saving` — Toplu kayıt işleminin devam edip etmediği, girişlerin kilit durumu için kullanılır
  - `updateRow` — Satırdaki kargo firması veya takip numarası değiştiğinde alanı güncelleyen fonksiyon
  - `t` — Tablodaki metinleri çevirmek için kullanılan çeviri fonksiyonu
  - `idx` — Satırın indeksi, animasyon gecikmesi hesaplamak için kullanılır
- **Dönüş**: <tr> JSX elementi, sipariş satırını temsil eder

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