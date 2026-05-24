---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx
skeleton_hash: fbf72c5fdd275dd9
generated_at: 2026-05-23T22:38:50Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun yönetici panelinde yer alan iadeler yönetimi sayfa bileşenidir. Sadece yetkili admin kullanıcıların erişebildiği bu modül, platformdaki tüm iade işlemlerini tek merkezden görüntüleme ve yönetme imkanı sunan temel arayüz katmanını oluşturur. React tabanlı bir sayfa bileşeni olarak tasarlanmış, özel olarak admin kullanıcı deneyimini desteklemek üzere yapılandırılmıştır.

## Fonksiyon Grupları
### Ana Sayfa Giriş Bileşeni
Modülün tek giriş noktası olarak, admin iadeler sayfasının tüm arayüz yapısını ve temel çalışma mantığını yönetir. Sayfanın kullanıcılara sunulmasından ve sayfa içindeki temel iş akışlarının düzenlenmesinden sorumludur.
- AdminReturnsPage

---

## AXIOMS – Mimari Varsayımlar
VentHub HVAC platformunun admin paneli bünyesinde yer alan bu React bileşeni, iade işlemlerinin yönetilmesi için tasarlanmıştır; çalışması için platformun tüm ortak admin altyapılarının, React çalışma zamanının ve ilgili veri servislerinin erişilebilir ve uyumlu olması zorunludur.

[Aksiyom 1]: Eğer bu bileşeni çalıştıracak React 16.8+ çalışma zamanı (React hooks desteği dahil) mevcut değilse, bileşen hiç yüklenemez ve admin kullanıcısına boş bir sayfa gösterilir.
[Aksiyom 2]: Eğer sayfa yüklenmeden önce platformun admin kimlik doğrulama servisi geçerli, yetkili bir oturumu doğrulayamazsa, yetkisiz erişim engellenemez ya da kullanıcı hatalı şekilde yetkisi olmayan bir alanda kalır.
[Aksiyom 3]: Eğer platformun iade kayıtlarını sunan backend API'si sayfa yükleme anında erişilebilir değilse, hiçbir iade verisi listelenemez ve adminler hiçbir iade işlemini gerçekleştiremez.
[Aksiyom 4]: Eğer admin paneline ait ortak layout bileşenleri (kenar çubuğu, üst menü, ortak yetkilendirme kontrolleri) bu sayfaya entegre edilemezse, AdminReturnsPage diğer admin sayfalarıyla tutarsız bir kullanıcı deneyimi sunar.
[Aksiyom 5]: Eğer platformun state yönetim servisi, iade verilerini saklayacak ve sayfa içi işlemlere (durum güncelleme, iade onaylama/reddetme vb.) uygun yapıda değilse, sayfanın tüm temel işlevleri devre dışı kalır.

---

## FONKSIYON DETAYLARI

### AdminReturnsPage
**Ne yapar**: VentHub HVAC projesinin yönetici arayüzü bünyesinde yer alan iadeler yönetim sayfasını oluşturan ana bileşendir. Sadece yetkili yönetici kullanıcıların erişebildiği bu sayfa, sistemdeki tüm ürün iade süreçlerinin görüntülenmesi ve yönetilmesi için gereken kullanıcı arayüzünü sunar.
**Nasıl yapar**: Proje kod yapısında `C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx` dosyası içerisinde tanımlanarak çalışır. Yönetici paneli rotalandırma sistemi üzerinden çağrılır, erişim öncesi yönetici yetkisi kontrollerinden geçtikten sonra sayfaya ait tüm arayüz ve işlevsel içeriği ekrana render eder.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz
**Dönüş**: Resmi tanımında dönüş tipi void veya bilinmiyor olarak belirtilmiş, uydurma bilgi eklenmemiştir. React bileşeni yapısı gereği ekrana basılacak JSX içeriğini döndürmesi beklenir ancak mevcut tip tanımında dönüş türü net olarak tanımlanmamıştır.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_001_auth_redirect
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loading` — Oturum yükleme durumu, yetki kontrolünde kullanılır
  - `user` - Oturum açmış yönetici kullanıcı nesnesi, erişim yetkisi kontrolü için kullanılır
  - `router` - Next.js yönlendirme nesnesi, giriş sayfasına yönlendirme için kullanılır
  - `Routes.auth.login` - Giriş sayfası rotasını oluşturan utility fonksiyonu
- **Dönüş**: void (girişsiz kullanıcıyı giriş sayfasına yönlendirir)

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_002_url_status_parser
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` - Tarayıcı window nesnesi, URL sorgu parametrelerini okumak için kullanılır
  - `params` - URLSearchParams nesnesi, sayfa URL'sindeki sorgu parametrelerini ayrıştırmak için kullanılır
  - `stParam` - URL'den alınan status sorgu parametresi değeri, çoklu durum filtresi ayarlamak için kullanılır
  - `next` - Yeni durum filtresi nesnesi, mevcut filtreyi kopyalayıp güncellemek için kullanılır
  - `statusFilter` - Mevcut aktif durum filtreleri nesnesi, URL'den gelen parametrelerle güncellenir
  - `setStatusFilter` - Durum filtresini state'e kaydetmek için kullanılan setState fonksiyonu
- **Dönüş**: void (sunucu tarafında çalışırsa erken dönüş, URL'den gelen duruma göre filtreyi günceller)

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_003_load_returns
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` - Oturum açmış kullanıcı, yetki kontrolü için kullanılır
  - `setIsLoading` - Yükleme durumu state'ini güncellemek için kullanılan setState fonksiyonu
  - `supabase` - Supabase istemci nesnesi, veritabanı işlemleri ve oturum kontrolü için kullanılır
  - `data` - Supabase'den dönen iade kayıtları, sipariş bilgileriyle birleştirilmiş şekilde alınır
  - `error` - Supabase sorgusu sırasında oluşan hata nesnesi
  - `ReturnRow` - Veritabanından gelen iade satırı tipi, tip güvenliği için tanımlanır
  - `returnRows` - Ham iade kayıtları dizisi, veritabanından gelen verinin tipli hali
  - `mapped` - Birleştirilmiş ve tiplenmiş iade kayıtları, state'e kaydedilmek üzere işlenir
  - `setReturns` - İade listesini state'e kaydeden setState fonksiyonu
  - `console.error` - Hata günlüğü için kullanılan konsol fonksiyonu
  - `toast.error` - Kullanıcıya hata bildirimi göstermek için kullanılan toast kütüphanesi fonksiyonu
  - `_t` - Çeviri fonksiyonu, hata mesajını yerelleştirmek için kullanılır
- **Dönüş**: Promise<void> (tüm iade kayıtlarını veritabanından çeker, state'i günceller)

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_004_return_mapper
- **params**: `item` — Ham iade kaydı nesnesi, veritabanından gelen tipli satır
- **ic_degiskenler**:
  - `item.id` — İade kaydının benzersiz kimliği
  - `item.order_id` — İlişkili siparişin kimliği
  - `item.user_id` — İadeyi oluşturan müşterinin kimliği
  - `item.reason` — İade sebebi
  - `item.description` — İade için ek açıklama (opsiyonel)
  - `item.status` — İadenin mevcut durumu
  - `item.created_at` — İadenin oluşturulma tarihi
  - `item.updated_at` — İadenin son güncellenme tarihi
  - `item.venthub_orders?.order_number` — İlişkili siparişin sipariş numarası (opsiyonel)
  - `item.venthub_orders?.customer_name` — Müşterinin tam adı (opsiyonel)
  - `item.venthub_orders?.customer_email` — Müşterinin e-posta adresi (opsiyonel)
  - `item.venthub_orders?.total_amount` — Siparişin toplam tutarı (opsiyonel)
- **Dönüş**: ReturnWithOrder tipi, işlenmiş iade nesnesi

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_005_refresh_returns
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loadReturns` — Tüm iade kayıtlarını yeniden yükleyen fonksiyon
- **Dönüş**: void (iade listesini yeniler)

---

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_006_apply_filters
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `returns` — Tüm ham iade kayıtları dizisi, filtreleme işlemine tabi tutulur
  - `statusFilter` — Aktif durum filtreleri nesnesi, hangi durumdaki iadelerin gösterileceğini belirtir
  - `anyStatus` — Hiçbir durum filtresi aktif mi diye kontrol eden boolean değer
  - `filtered` — Filtrelenmiş iade listesi, tüm filtreler uygulandıktan sonra state'e kaydedilir
  - `searchQuery` — Kullanıcının girdiği arama metni, metin tabanlı filtreleme için kullanılır
  - `query` — Küçük harfe çevrilmiş arama metni, büyük/küçük harf duyarsız arama için kullanılır
  - `setFilteredReturns` — Filtrelenmiş iade listesini state'e kaydeden setState fonksiyonu
- **Dönüş**: void (durum ve arama filtrelerini uygular, filtrelenmiş listeyi kaydeder)

---

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_007_search_predicate
- **params**: `r` — Filtrelenecek iade kaydı nesnesi
- **ic_degiskenler**:
  - `r.order_number` — İadeye ait sipariş numarası, arama içinde kontrol edilir
  - `r.customer_name` — Müşterinin adı, arama içinde kontrol edilir
  - `r.customer_email` — Müşterinin e-posta adresi, arama içinde kontrol edilir
  - `r.reason` — İade sebebi, arama içinde kontrol edilir
  - `query` — Küçük harfe çevrilmiş arama metni, tüm alanlarda arama yapmak için kullanılır
- **Dönüş**: boolean (arama metni iade kaydında geçiyorsa true döner)

---

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_008_sort_returns
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `filteredReturns` — Filtrelenmiş iade listesi, sıralama işlemine tabi tutulur
  - `arr` — Filtrelenmiş listenin kopyası, orijinal state değiştirilmeden sıralanır
  - `sortDir` — Sıralama yönü (asc/desc), sıralama yönünü belirler
  - `sortKey` — Hangi alana göre sıralama yapılacağını belirten anahtar
  - `dir` — Sıralama katsayısı (1/-1), ascend/descend kontrolü için kullanılır
  - `ao` — Karşılaştırılan ilk iadenin sipariş kimliği/numarası
  - `bo` — Karşılaştırılan ikinci iadenin sipariş kimliği/numarası
- **Dönüş**: ReturnWithOrder[] — Sıralanmış iade listesi

---

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_009_sort_compare
- **params**: `a` — Karşılaştırılacak ilk iade kaydı, `b` — Karşılaştırılacak ikinci iade kaydı
- **ic_degiskenler**:
  - `sortDir` — Sıralama yönü (asc/desc)
  - `sortKey` — Hangi alana göre sıralama yapılacağı
  - `dir` — Sıralama katsayısı (1/-1)
  - `a.order_number` — İlk iadenin sipariş numarası
  - `b.order_number` — İkinci iadenin sipariş numarası
  - `a.order_id` — İlk iadenin sipariş kimliği (numara yoksa kullanılır)
  - `b.order_id` — İkinci iadenin sipariş kimliği (numara yoksa kullanılır)
  - `a.customer_name` — İlk iadenin müşteri adı
  - `b.customer_name` — İkinci iadenin müşteri adı
  - `a.reason` — İlk iadenin iade sebebi
  - `b.reason` — İkinci iadenin iade sebebi
  - `a.status` — İlk iadenin durumu
  - `b.status` — İkinci iadenin durumu
  - `a.total_amount` — İlk iadenin sipariş tutarı
  - `b.total_amount` — İkinci iadenin sipariş tutarı
  - `a.created_at` — İlk iadenin oluşturulma tarihi
  - `b.created_at` — İkinci iadenin oluşturulma tarihi
- **Dönüş**: number — Sıralama sonucu (-1, 0, 1)

---

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::toggleSort
- **params**: `key: SortKey` — Sıralanacak alan anahtarı
- **ic_degiskenler**:
  - `sortKey` — Mevcut aktif sıralama alanı
  - `setSortDir` — Sıralama yönünü güncelleyen setState fonksiyonu
  - `setSortKey` — Sıralama alanını güncelleyen setState fonksiyonu
- **Dönüş**: void (sıralama alanını ve yönünü günceller)

---

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::sortIndicator
- **params**: `key: SortKey` — Sıralama göstergesi gösterilecek alan anahtarı
- **ic_degiskenler**:
  - `sortKey` — Mevcut aktif sıralama alanı
  - `sortDir` — Mevcut sıralama yönü
- **Dönüş**: string — Sıralama yönünü gösteren sembol (▲/▼) veya boş string

---

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_010_handle_status_update
- **params**: `returnId: string` — Güncellenecek iadenin kimliği, `newStatus: string` — İadenin yeni durumu
- **ic_degiskenler**:
  - `hasWriteAccess` — Kullanıcının durum değiştirme yetkisi var mı kontrolü
  - `returns` — Tüm iade kayıtları listesi, güncellenecek iadeyi bulmak için kullanılır
  - `returnItem` — Güncellenecek iade nesnesi, listeden bulunur
  - `setUpdatingStatus` — Durum güncelleme yükleme durumunu state'e kaydeden setState
  - `oldStatus` — İadenin eski durumu, denetim günlüğü ve bildirimlerde kullanılır
  - `supabase` — Supabase istemci nesnesi, veritabanı güncellemesi için kullanılır
  - `error` — Veritabanı işlemi sırasında oluşan hata
  - `logAdminAction` — Denetim günlüğü kaydetmek için içe aktarılan audit servisi fonksiyonu
  - `setReturns` — İade listesini yerel olarak güncellemek için kullanılan setState
  - `syncOrderFromReturn` — İade durum değişikliğini sipariş tablosuna senkronize eden servis fonksiyonu
  - `toast.success` — Kullanıcıya başarı bildirimi gösteren toast fonksiyonu
  - `_t` — Çeviri fonksiyonu, bildirim mesajlarını yerelleştirir
  - `getStatusLabel` — Durum etiketini döndüren yardımcı fonksiyon
  - `refundErr` — Mock iade işlemi sırasında oluşan hata
  - `invokeError` — E-posta bildirimi fonksiyonu çağrısında oluşan hata
  - `emailError` — E-posta gönderimi sırasında oluşan hata
- **Dönüş**: Promise<void> — İade durumunu günceller, tüm senkronizasyon ve bildirim işlemlerini çalıştırır

---

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_011_returns_state_mapper
- **params**: `prev` — Önceki iade listesi state'i
- **ic_degiskenler**:
  - `r.id` — Dolaşılan iadenin kimliği, güncellenecek iadeyi eşleştirmek için kullanılır
  - `returnId` — Güncellenecek iadenin kimliği
  - `newStatus` — İadenin yeni durumu
- **Dönüş**: ReturnWithOrder[] — Güncellenmiş iade listesi

---

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::getStatusLabel
- **params**: `status: string` — Durum kodu
- **ic_degiskenler**:
  - `_t` — Çeviri fonksiyonu, durum etiketini yerelleştirir
- **Dönüş**: string — Yerelleştirilmiş durum etiketi

---

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::getStatusIcon
- **params**: `status: string` — Durum kodu
- **ic_degiskenler**:
  - `Clock` — Lucide icon kütüphanesinden saat ikonu, talep edilen durumlar için kullanılır
  - `CheckCircle` — Tamamlandı/onaylandı durumları için yeşil tik ikonu
  - `XCircle` — Reddedilen/iptal edilen durumlar için çarpı ikonu
  - `Truck` — Taşıma sırasındaki durumlar için kamyon ikonu
  - `Package` — Teslim alınan durumlar için paket ikonu
  - `RefreshCw` — Bilinmeyen durumlar için yenileme ikonu
- **Dönüş**: JSX.Element — Duruma göre renklendirilmiş ikon öğesi

---

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::getStatusColor
- **params**: `status: string` — Durum kodu
- **ic_degiskenler**:
  - Tailwind CSS arka plan/metin/kenarlık renk sınıfları, duruma göre atanır
- **Dönüş**: string — Duruma özel Tailwind CSS sınıfları birleşimi

---

### [N17_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::exportCsv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `header` — CSV dosyasının başlık satırı, çevrilmiş sütun isimleri
  - `lines` — CSV dosyasının veri satırları, tüm iade kayıtları işlenerek oluşturulur
  - `filteredReturns` — Dışa aktarılacak filtrelenmiş iade listesi
  - `r.order_number` — İadeye ait sipariş numarası, CSV'de formatlanır
  - `r.order_id` — Sipariş numarası yoksa kullanılan sipariş kimliği
  - `r.customer_name` — Müşteri adı, CSV'ye eklenir
  - `r.customer_email` — Müşteri e-postası, CSV'ye eklenir
  - `r.reason` — İade sebebi, CSV'ye eklenir
  - `r.status` — İade durumu, CSV'de etikete çevrilir
  - `getStatusLabel` — Durum etiketini döndüren yardımcı fonksiyon
  - `formatDateTime` — Tarihi yerel formatta stringe çeviren yardımcı fonksiyon
  - `lang` - Kullanıcının aktif dili, formatlama işlemlerinde kullanılır
  - `r.total_amount` — Sipariş tutarı, CSV'de para birimi formatında gösterilir
  - `formatCurrency` — Tutarı para birimi formatına çeviren yardımcı fonksiyon
  - `bom` — UTF-8 BOM karakteri, Excel'de doğru Türkçe karakter gösterimi için kullanılır
  - `csv` — Birleştirilmiş CSV metni
  - `blob` — CSV dosyasını temsil eden Blob nesnesi
  - `url` — Blob için oluşturulan geçici URL
  - `a` - İndirme işlemi için oluşturulmuş geçici <a> HTML öğesi
- **Dönüş**: void — İade listesini CSV dosyası olarak indirilmeye sunar

---

### [N18_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_012_csv_row_mapper
- **params**: `r` — İşlenecek iade kaydı
- **ic_degiskenler**: Tüm exportCsv içindeki alanlarla aynı, CSV satırı oluşturmak için kullanılır
- **Dönüş**: string — Tek bir CSV veri satırı

---

### [N19_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::exportXls
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `rowsHtml` — Excel dosyasının tablo satırları, tüm iade kayıtları için HTML satırları oluşturulur
  - `filteredReturns` — Dışa aktarılacak filtrelenmiş iade listesi
  - `orderNo` — Formatlanmış sipariş numarası, tabloya eklenir
  - `amount` — Formatlanmış sipariş tutarı, tabloya eklenir
  - `table` — Tüm HTML yapısını içeren Excel dosyası metni
  - `blob` — Excel dosyasını temsil eden Blob nesnesi
  - `url` — Blob için geçici indirme URL'si
  - `a` — İndirme işlemi için geçici <a> öğesi
- **Dönüş**: void — İade listesini Excel dosyası olarak indirilmeye sunar

---

### [N20_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_013_xls_row_mapper
- **params**: `r` — İşlenecek iade kaydı
- **ic_degiskenler**: Tüm exportXls içindeki alanlarla aynı, Excel tablo satırı oluşturmak için kullanılır
- **Dönüş**: string — Tek bir HTML <tr> satırı

---

### [N21_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_014_status_filter_mapper
- **params**: `o` — Durum filtresi seçeneği nesnesi
- **ic_degiskenler**:
  - `o.value` — Durum kodu
  - `o.label` — Durum etiketi
  - `statusFilter[o.value]` — Durum filtresinin aktif olup olmadığı
  - `setStatusFilter` — Durum filtresini güncelleyen setState fonksiyonu
- **Dönüş**: Filtre seçeneği nesnesi, UI'de kullanılmak üzere işlenmiş halde

---

### [N22_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_015_table_row_renderer
- **params**: `returnItem` — Tabloya yazılacak iade kaydı, `index` — Satırın listedeki indeksi
- **ic_degiskenler**:
  - `orderNo` — Formatlanmış sipariş numarası, tabloda gösterilir
  - `returnItem.id` — İadenin benzersiz kimliği, React listesi key'i olarak kullanılır
  - `visibleCols.order` — Sipariş sütununun görünürlük durumu
  - `router.push` — Sipariş detay sayfasına yönlendirmek için kullanılan router fonksiyonu
  - `formatCurrency` — Tutarı para birimi formatına çeviren yardımcı
  - `visibleCols.customer` — Müşteri sütununun görünürlüğü
  - `visibleCols.reason` — İade sebebi sütununun görünürlüğü
  - `visibleCols.status` — Durum sütununun görünürlüğü
  - `getStatusColor` — Duruma göre renk sınıflarını döndüren yardımcı
  - `getStatusIcon` — Duruma göre ikon döndüren yardımcı
  - `getStatusLabel` — Duruma göre etiket döndüren yardımcı
  - `visibleCols.date` — Tarih sütununun görünürlüğü
  - `formatDate` — Tarihi gün/ay/yıl formatına çeviren yardımcı
  - `formatTime` — Saati yerel formata çeviren yardımcı
  - `hasWriteAccess` — Kullanıcının durum değiştirme yetkisi var mı
  - `nextStatuses[returnItem.status]` — Mevcut durumdan geçilebilecek yeni durumlar listesi
  - `handleStatusUpdate` — Durum güncelleme fonksiyonu, buton tıklamasında çağrılır
  - `updatingStatus` — Şu anda güncellenmekte olan iadenin kimliği, loading durumu için kullanılır
- **Dönüş**: JSX.Element — Tablo satırı öğesi

---

### [N23_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx::anon_016_status_button_renderer
- **params**: `status` — Butonun temsil ettiği yeni durum kodu
- **ic_degiskenler**:
  - `returnItem.id` — İadenin kimliği, durum güncellemede kullanılır
  - `handleStatusUpdate` — Durum güncelleme fonksiyonu, tıklama sırasında çağrılır
  - `updatingStatus` — Güncellenmekte olan iadenin kimliği, buton devre dışı bırakmak için kullanılır
  - `_t` — Çeviri fonksiyonu, buton başlığını yerelleştirir
  - `getStatusLabel` — Durum etiketini döndüren yardımcı
  - `ChevronRight` — Lucide sağ ok ikonu, butonda gösterilir
- **Dönüş**: JSX.Element — Durum değiştirme butonu öğesi

---

## NODE ID STANDARD

  file: src\views\admin\AdminReturnsPage.tsx
  function: src\views\admin\AdminReturnsPage.tsx::AdminReturnsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminReturnsPage