---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminDashboardPage.tsx
skeleton_hash: 07e1183ef19058d5
entity_hashes:
  func:AdminDashboardPage: d9f200a1ae3a63e1
  overview: 558644615f3ac259
  style_tokens: 12dd6d905c26f46b
generated_at: 2026-05-28T22:38:56Z
---

## Genel Bakış
Bu modül, VentHub HVAC sisteminin yönetici paneline ait ana giriş sayfasını oluşturan React bileşenini barındırmaktadır. Yöneticilerin platformdaki tüm yönetim işlevlerine ve verilere erişmesini sağlayan ilk karşılaşılan arayüz olarak görev yapar.

## Fonksiyon Grupları
### Yönetici Paneli Ana Sayfa Bileşeni
Modüldeki tek işlev grubu olarak, yönetici paneline ait tüm içerikleri, gezinme öğelerini ve panele özel özellikleri bir araya getirerek kullanıcıya sunar.
- AdminDashboardPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı admin kontrol paneli sayfasının doğru çalışması için uygulama mimarisinin ve çalışma zamanı ortamının tüm temel entegrasyon koşullarını karşılaması zorunludur, aksi takdirde modül işlevini yerine getiremez.

[Aksiyom 1]: Eğer bu TSX türündeki React bileşenini işleyebilecek uygun sürümde bir React çalışma zamanı ortamı yoksa, bileşen ekrana hiç çizilemez ve modül tamamen işlevsiz kalır.
[Aksiyom 2]: Eğer bu modüle erişimi yalnızca yetkili admin rolüne sahip kullanıcılarla sınırlayacak bir uygulama seviyesi yetkilendirme katmanı (router koruması veya üst bileşen doğrulaması) yoksa, yetkisiz kullanıcılar hassas admin paneline erişebilir, sistem güvenliği ihlal edilir.
[Aksiyom 3]: Eğer modülün kullanması gereken tüm dahili/harici bağımlılıklar projeye dahil edilmemiş ve çalışır durumda değilse, modül derleme veya çalışma zamanı hatası verir.
[Aksiyom 4]: Modülün iç işleyişine ait domain-specific kurallar, eşik değerleri ve kabul kriterleri, modülün fonksiyon gövdesi sağlanmadığı için bilinmiyor, bu konuda ek özel aksiyom tanımlanamaz.

---

## FONKSİYON DETAYLARI

### AdminDashboardPage
**Ne yapar**: VentHub HVAC sisteminin yönetici paneline ait ana gösterim sayfası bileşenidir. Sadece yetkilendirilmiş yönetici hesaplarına açık olan bu sayfa, sistemdeki tüm HVAC cihazlarının genel durumunu, işlem istatistiklerini, son kullanıcı hareketlerini ve yöneticiye özel erişim modüllerini tek bir konsolide arayüzde sunar. Yetkisiz erişim girişimlerini engelleyerek kullanıcıları doğru rotalara yönlendiren güvenlikli bir rota bileşeni olarak görev görür.
**Nasıl yapar**: React tabanlı fonksiyonel bileşen mimarisi ile geliştirilmiştir. Sayfa ilk yüklendiğinde yerel kimlik doğrulama servisi üzerinden kullanıcının yönetici yetkisine sahip olup olmadığını kontrol eder, yetkisiz tespit edildiğinde otomatik olarak giriş sayfasına yönlendirme tetikler. Sistem genelindeki verileri ilgili API servisleri üzerinden çekerek, sayfa içinde kullandığı alt bileşenlere (istatistik kartları, aktif cihaz listesi, işlem kaydı arayüzü vb.) iletir. Responsive tasarım prensiplerine uygun olarak farklı ekran boyutlarında arayüz düzenini dinamik olarak ayarlar.
**Parametreler**: Bu fonksiyonel bileşen herhangi bir harici parametre almaz, tüm ihtiyaç duyduğu verileri React Context API ve yerel state yapıları üzerinden yönetir.
**Dönüş**: React.FC tipi React fonksiyonel bileşeni döndürür. Bu dönüş değeri, uygulamanın yönlendirme sistemi tarafından yönetici paneli için tanımlanan rota eşleştiğinde ekrana render edilmek üzere kullanılır.

---

## INTERFACES

### DashboardChartData
- `date: string`
- `orders: number`
- `returns: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminDashboardPage.tsx::AdminDashboardPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, arayüz metinlerini yerelleştirmek için kullanılır
  - `ordersCount` — Toplam sipariş sayısını saklayan state değişkeni
  - `setOrdersCount` — ordersCount state'ini güncelleyen setter fonksiyonu
  - `salesTotal` — Toplam satış tutarını saklayan state değişkeni
  - `setSalesTotal` — salesTotal state'ini güncelleyen setter fonksiyonu
  - `pendingReturns` - Beklemedeki iade sayısını saklayan state değişkeni
  - `setPendingReturns` — pendingReturns state'ini güncelleyen setter fonksiyonu
  - `pendingShipments` — Gönderilmesi gereken bekleyen sipariş sayısını saklayan state değişkeni
  - `setPendingShipments` — pendingShipments state'ini güncelleyen setter fonksiyonu
  - `loading` — Veri yükleme durumunu saklayan state değişkeni
  - `setLoading` — loading state'ini güncelleyen setter fonksiyonu
  - `error` — Oluşan hataların mesajını saklayan state değişkeni
  - `setError` — error state'ini güncelleyen setter fonksiyonu
  - `recentOrders` — Son 5 siparişi DbOrder tipinde saklayan state dizisi
  - `setRecentOrders` — recentOrders state'ini güncelleyen setter fonksiyonu
  - `chartData` — Satış grafiği için kullanılan DashboardChartData tipinde veri dizisini saklayan state değişkeni
  - `setChartData` — chartData state'ini güncelleyen setter fonksiyonu
  - `tiedCapital` — Stokta bağlı kalan toplam sermaye tutarını saklayan state değişkeni
  - `setTiedCapital` — tiedCapital state'ini güncelleyen setter fonksiyonu
  - `alarmCount` — Düşük stok eşiğine ulaşan ürün sayısını saklayan state değişkeni
  - `setAlarmCount` — alarmCount state'ini güncelleyen setter fonksiyonu
  - `loadKPIs` — Tüm panel metriklerini veritabanından çeken useCallback ile sarmalanmış async fonksiyon
- **Dönüş**: Yönetici paneli arayüzünü oluşturan JSX elementleri

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminDashboardPage.tsx::loadKPIs
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` — Yükleme durumunu güncellemek için kullanılan state setter'ı
  - `setError` — Hata mesajını güncellemek için kullanılan state setter'ı
  - `ensureSessionFresh` — Kullanıcı oturumunun geçerliliğini kontrol eden yardımcı fonksiyon
  - `ordersData` — Supabase'den çekilen sipariş verilerini saklayan değişken
  - `oCount` - Çekilen toplam sipariş sayısını saklayan değişken
  - `oErr` — Sipariş verisi çekerken oluşan hatayı saklayan değişken
  - `supabase` — Veritabanı işlemleri için kullanılan Supabase istemcisi
  - `setOrdersCount` — Toplam sipariş sayısı state'ini güncelleyen setter
  - `setSalesTotal` — Toplam satış tutarı state'ini güncelleyen setter
  - `setRecentOrders` — Son siparişler listesi state'ini güncelleyen setter
  - `setChartData` — Grafik verisi state'ini güncelleyen setter
  - `returnsRes` — İade verileri sorgusundan dönen Supabase yanıtı
  - `shipRes` — Bekleyen gönderi verileri sorgusundan dönen Supabase yanıtı
  - `productsRes` — Ürün stok verileri sorgusundan dönen Supabase yanıtı
  - `setPendingReturns` — Bekleyen iade sayısı state'ini güncelleyen setter
  - `setPendingShipments` — Bekleyen gönderi sayısı state'ini güncelleyen setter
  - `rawProducts` — Tip dönüşümü yapılmış ürün verilerini saklayan dizi
  - `capital` — Stoktaki toplam bağlı sermayeyi hesaplamak için kullanılan geçici değişken
  - `alarms` — Düşük stok alarmı sayısını hesaplamak için kullanılan geçici değişken
  - `i` — Ürün dizisi üzerinde döngü yapmak için kullanılan sayaç değişkeni
  - `p` — Döngüdeki mevcut ürün nesnesini saklayan değişken
  - `stockQty` — Mevcut ürünün stok miktarını tip kontrolü yaparak saklayan değişken
  - `purchasePrice` — Mevcut ürünün alış fiyatını tip kontrolü yaparak saklayan değişken
  - `lowStockThreshold` — Mevcut ürünün düşük stok eşik değerini tip kontrolü yaparak saklayan değişken
  - `setTiedCapital` — Bağlı sermaye state'ini güncelleyen setter
  - `setAlarmCount` — Stok alarmı sayısı state'ini güncelleyen setter
  - `err` — Try bloğunda oluşan hatayı yakalayan değişken
- **Dönüş**: async Promise<void> (geri dönüş değeri yok, yan etki olarak state'leri günceller)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminDashboardPage.tsx::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loadKPIs` — Bileşen ilk render edildiğinde metrikleri çekmek için çağrılan KPI yükleme fonksiyonu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\views\admin\AdminDashboardPage.tsx
  function: src\views\admin\AdminDashboardPage.tsx::AdminDashboardPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminDashboardPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-red-50`, `bg-surface-deep/40`, `border-white/5`, `text-red-500`, `text-slate-500`, `text-sm`
- **Layout:** `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `lg:grid-cols-2`, `lg:grid-cols-4`, `md:grid-cols-2`, `md:grid-cols-3`, `p-4`, `p-8`
- **Varyant/Responsive:** `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-black`, `glass-card`, `mb-8`, `rounded-xl`, `space-y-10`, `tracking-widest`, `uppercase`