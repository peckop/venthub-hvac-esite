---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx
skeleton_hash: a56a35773cb7c54e
entity_hashes:
  func:AdminInventoryReportPage: d037654ecb70b8e0
  overview: 56c65fe409f6c493
  style_tokens: 23d781c8192db1b8
generated_at: 2026-05-28T22:39:07Z
---

## Genel Bakış
Bu modül, VentHub HVAC sistem yöneticilerine yönelik geliştirilmiş bir React sayfasıdır. Amacı, sistemdeki envanter ve stok durumuna dair raporları yetkili kullanıcıların hizmetine sunmaktır. Sayfa, yönetici arayüzünün bir parçası olarak işlev görür ve temel olarak veri görüntüleme odaklıdır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Bu modülün tek ve ana bileşenidir. Yönetici panelindeki envanter raporları ekranının tüm yapısını, düzenini ve içerik akışını oluşturur.
- AdminInventoryReportPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı admin envanter raporu görüntüleme sayfası modülünün sorunsuz çalışması için frontend çalışma zamanı ortamının, yetkilendirme mekanizmalarının ve veri erişim katmanının erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer proje içerisinde React istemci çalışma zamanı ortamı mevcut değilse, bu sayfa modülü hiçbir şekilde render edilemez, kullanıcıya boş bir ekran sunulur.
[Aksiyom 2]: Eğer bu admin sayfasına özgü yetkilendirme kontrol mekanizması modül tarafından erişilebilir durumda değilse, sayfa erişim kontrolü çalışmaz, ya yetkisiz kullanıcılar hassas envanter verilerine erişir ya da yetkili kullanıcılar sayfaya giremez, net iş akışı bilinmiyor.
[Aksiyom 3]: Eğer envanter rapor verisini sağlayan arka uç veri kaynağına modül tarafından erişilemiyorsa, sayfa üzerindeki tüm rapor içeriği görüntülenemez, kullanıcıya hiçbir envanter verisi sunulamaz.
[Aksiyom 4]: Eğer modülün bağımlı olduğu ortak admin layout ve navigasyon bileşenleri proje içerisinde mevcut değilse, sayfa standart admin arayüzü şeması olmadan render edilir, site içi gezinme ve sayfa yapısı bozulur.

---

## FONKSİYON DETAYLARI

### AdminInventoryReportPage
**Ne yapar**: VentHub HVAC projesinin admin arayüzünde yer alan envanter raporları sayfasını oluşturan ana bileşendir. Yalnızca admin yetkisine sahip kullanıcıların erişebildiği bu sayfa, projenin envanter verilerini raporlamak amacıyla geliştirilmiştir.
**Nasıl yapar**: Projenin `C:\Users\alize\venthub-hvac\src\views\admin\` dizininde konumlanan bir React sayfa bileşeni olarak çalışır, admin özel arayüz bileşenleri mimarisine entegre şekilde sistemde yer alır. Sadece yetkili admin kullanıcılarının erişim kontrollerini geçtikten sonra uygulamada yüklenen bir yapıdadır.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almamaktadır.
**Dönüş**: Tanımda belirtilmiş olduğu üzere dönüş tipi void veya bilinmiyordur, verilen kaynak bilgileri kapsamında kesin dönüş değeri ve tipi hakkında ek bilgi bulunmamaktadır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::async_loadData
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` — Yükleme durumunu güncellemek için kullanılan state setter fonksiyonu
  - `ensureSessionFresh` — Kullanıcı oturumunun geçerliliğini kontrol eden API fonksiyonu
  - `supabase` - Veritabanı bağlantı nesnesi
  - `query` - Supabase sorgu nesnesi, stok hareketleri için oluşturulur
  - `dateRange?.from` - Tarih aralığı başlangıç değeri, sorguda filtreleme için kullanılır
  - `dateRange?.to` - Tarih aralığı bitiş değeri, sorguda filtreleme için kullanılır
  - `endOfDay` - Tarihin son saatini döndüren yardımcı fonksiyon
  - `movements` - Veritabanından çekilen stok hareketleri listesi
  - `movementsError` - Veritabanı sorgusu sırasında oluşan hata nesnesi
  - `setMovementsData` - Stok hareketleri verisini state'e kaydeden setter fonksiyonu
  - `err` - Try bloğunda yakalanan genel hata nesnesi
  - `console.error` - Hata mesajını konsola yazdıran yerleşik fonksiyon
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::component_mount_trigger
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loadData` - Veri yükleme fonksiyonu, void olarak çağrılır
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::calculate_stats
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `tIn` - Toplam giriş stok miktarı sayacı
  - `tOut` - Toplam çıkış stok miktarı sayacı
  - `reasonMap` - Stok hareketi sebeplerine göre toplam miktarları tutan nesne
  - `productSales` - Ürün bazlı çıkış miktarlarını tutan nesne
  - `trendMap` - Günlük giriş/çıkış trend verisini tutan nesne
  - `term` - Arama sorgusunun temizlenmiş hali, filtreleme için kullanılır
  - `searchQuery` - Kullanıcının girdiği arama metni state'i
  - `filtered` - Arama terimine göre filtrelenmiş stok hareketleri listesi
  - `movementsData` - Tüm stok hareketleri tutan ana state verisi
  - `dateRange?.from` - Seçilen tarih aralığının başlangıcı
  - `dateRange?.to` - Seçilen tarih aralığının bitişi
  - `eachDayOfInterval` - İki tarih arasındaki tüm günleri döndüren tarih yardımcı fonksiyonu
  - `days` - Tarih aralığındaki tüm günlerin listesi
  - `setStats` - Hesaplanan toplam istatistikleri state'e kaydeden setter
  - `rData` - Pasta grafiği için formatlanmış sebep bazlı veri listesi
  - `setReasonData` - Sebep verisini state'e kaydeden setter
  - `sortedProds` - En çok satılan ilk 8 ürünün sıralanmış listesi
  - `setTopProducts` - En çok satılan ürünler verisini state'e kaydeden setter
  - `setTrendData` - Günlük trend verisini state'e kaydeden setter
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::init_trendmap_entry
- **params**: d
- **ic_degiskenler**:
  - `k` - Trend anahtarı olarak kullanılan formatlanmış tarih stringi (yyyy-MM-dd)
  - `format` - Tarih formatlamak için kullanılan yardımcı fonksiyon
  - `trendMap[k]` - İlgili gün için boş trend verisi nesnesi, sıfırlanan giriş/çıkış değerleriyle oluşturulur
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::process_movement_entry
- **params**: m
- **ic_degiskenler**:
  - `dateKey` - Hareketin ait olduğu günün anahtar stringi (yyyy-MM-dd)
  - `format` - Tarih formatlama yardımcı fonksiyonu
  - `deltaAbs` - Stok değişimi miktarının mutlak değeri
  - `tIn` - Toplam giriş stok sayacı, pozitif delta durumunda artırılır
  - `tOut` - Toplam çıkış stok sayacı, negatif delta durumunda artırılır
  - `trendMap[dateKey]` - İlgili günün trend verisi, giriş/çıkış değerleri güncellenir
  - `reasonMap[m.reason as string]` - İlgili hareket sebebinin toplam miktarı artırılır
  - `productSales[pname]` - İlgili ürünün çıkış miktarı, satış veya manuel çıkış durumunda artırılır
  - `pname` - Ürün ismi, ürün nesnesinden alınır veya ürün ID'si kullanılır
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::format_top_product_entry
- **params**: p
- **ic_degiskenler**:
  - `name` - Grafik için kısaltılmış ürün ismi, 15 karakterden uzunsa sonuna ... eklenir
  - `substring` - String kesme işlemi için yerleşik fonksiyon
  - `amount` - Ürünün toplam çıkış miktarı
- **Dönüş**: { name: string, amount: number }

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::export_csv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `movementsData` - CSV'ye dönüştürülecek tüm stok hareketleri verisi
  - `header` - CSV dosyasının başlık satırı
  - `csvRows` - Tüm stok hareketlerinin CSV formatına dönüştürülmüş satırları
  - `csvString` - Birleştirilmiş tam CSV içeriği, BOM etiketi eklenmiş
  - `blob` - CSV verisinden oluşturulan Blob nesnesi
  - `url` - Blob nesnesi için oluşturulan önizleme URL'i
  - `a` - İndirme işlemi için oluşturulan geçici <a> DOM elementi
  - `document.createElement` - DOM elementi oluşturmak için yerleşik fonksiyon
  - `a.href` - İndirme linkinin URL değeri
  - `a.download` - İndirilecek dosyanın adı
  - `a.click` - İndirme işlemini tetikleyen fonksiyon
  - `URL.revokeObjectURL` - Kullanılan URL'i bellek temizliği için iptal eden fonksiyon
- **Dönüş**: (movementsData boşsa erken return, aksi takdirde yok)

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::format_csv_row
- **params**: m
- **ic_degiskenler**:
  - `m.id` - Stok hareketinin ID'si
  - `format` - Tarih formatlama yardımcı fonksiyonu
  - `m.created_at` - Hareketin oluşturulma tarihi
  - `m.products` - İlişkili ürün nesnesi
  - `m.product_id` - Ürün ID'si
  - `m.delta` - Stok değişim miktarı
  - `m.reason` - Hareketin sebebi
  - `map` - CSV değerlerini tırnak içine almak için kullanılan dizi metodu
  - `join` - CSV sütunlarını birleştirmek için kullanılan string metodu
- **Dönüş**: string (tek bir CSV satırı)

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::filter_movements_by_search
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `term` - Temizlenmiş arama terimi
  - `searchQuery` - Ham arama sorgusu state'i
  - `movementsData` - Filtrelenecek tüm stok hareketleri
  - `filter` - Dizi filtreleme metodu, ürün ismi veya ID'si arama terimini içeren hareketleri seçer
- **Dönüş**: Array (filtrelenmiş stok hareketleri listesi)

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::render_positive_delta_row
- **params**: m
- **ic_degiskenler**:
  - `m.id` - Tablo satırı anahtarı olarak kullanılan stok hareketi ID'si
  - `adminTableCellClass` - Tablo hücreleri için ortak CSS classı
  - `format` - Tarih formatlama yardımcı fonksiyonu
  - `m.created_at` - Hareketin oluşturulma tarihi, tabloda gösterilir
  - `m.products` - İlişkili ürün nesnesi, ürün ismi için kullanılır
  - `m.product_id` - Yedek olarak kullanılan ürün ID'si
  - `m.delta` - Pozitif stok değişim miktarı, yeşil renkte gösterilir
- **Dönüş**: JSX (pozitif stok değişimi için tablo satırı elementi)

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx::render_negative_delta_row
- **params**: m
- **ic_degiskenler**:
  - `m.id` - Tablo satırı anahtarı olarak kullanılan stok hareketi ID'si
  - `adminTableCellClass` - Tablo hücreleri için ortak CSS classı
  - `format` - Tarih formatlama yardımcı fonksiyonu
  - `m.created_at` - Hareketin oluşturulma tarihi, tabloda gösterilir
  - `m.products` - İlişkili ürün nesnesi, ürün ismi için kullanılır
  - `m.product_id` - Yedek olarak kullanılan ürün ID'si
  - `m.delta` - Negatif stok değişim miktarı, kırmızı renkte gösterilir
- **Dönüş**: JSX (negatif stok değişimi için tablo satırı elementi)

---

## NODE ID STANDARD

  file: src\views\admin\AdminInventoryReportPage.tsx
  function: src\views\admin\AdminInventoryReportPage.tsx::AdminInventoryReportPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminInventoryReportPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-emerald-400/10`, `bg-emerald-500/5`, `bg-rose-400/10`, `bg-rose-500/5`, `bg-slate-100`, `bg-slate-200`, `bg-slate-50`, `border-b`, `border-emerald-100/10`, `border-emerald-400/20`, `border-emerald-500/10`, `border-l-4`, `border-l-emerald-500`, `border-l-indigo-500`, `border-l-rose-500`
- **Layout:** `absolute`, `flex`, `flex-col`, `gap-2`, `gap-4`, `gap-6`, `grid`, `grid-cols-1`, `h-4`, `h-5`, `h-72`, `h-8`, `h-80`, `h-full`, `items-center`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `!px-4`, `!py-2.5`, `!rounded-2xl`, `!rounded-3xl`, `!rounded-xl`, `${adminButtonSecondaryClass`, `${adminCardClass`, `${stats.net`, `0`, `:`, `<`, `>`, `animate-in`, `animate-pulse`, `border`