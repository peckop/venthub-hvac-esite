---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx
skeleton_hash: bd8655db740d4e93
generated_at: 2026-05-23T22:35:56Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kullanıcı hesapları bölümünde yer alan ana hesap özet sayfasını barındıran frontend bileşenidir. Uygulamanın hesap rotası altında yüklenerek kullanıcılara hesaplarıyla ilgili genel bilgilere erişim sağlayan ana arayüzü sunar. Hesap yönetimi işlevlerinin merkezinde yer alan bu sayfa, sadece hesap erişimi olan kullanıcılar tarafından görüntülenebilir.

## Fonksiyon Grupları
### Ana Hesap Özeti Bileşeni
Hesap genel bakış sayfasının tüm arayüzünü yönetmek ve kullanıcıya sunmakla sorumlu ana bileşendir, hesap bölümünün ana giriş noktası olarak görev alır.
- AccountOverviewPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül, kullanıcıların kişisel hesap bilgilerini görüntülemesine olanak tanıyan HVAC izleme platformunun frontend hesap özet sayfası bileşenidir, doğru çalışması için platformun frontend mimarisinin sağladığı tüm temel bağımlılıkların varlığı zorunludur.

[Aksiyom 1]: Eğer React.js çalışma zamanı ortamı proje içinde mevcut değilse, bu bileşen hiçbir şekilde render edilemez, uygulama başlatılamaz.
[Aksiyom 2]: Eğer kullanıcı kimlik doğrulama (authentication) mekanizması bu sayfada entegre edilmemişse, yetkisiz kullanıcılar hassas hesap verilerine erişebilir, veri güvenliği ihlal edilir.
[Aksiyom 3]: Eğer kullanıcı hesap verilerini sunan backend API servisleri erişilemez durumdaysa, sayfada hiçbir kullanıcıya özel hesap bilgisi görüntülenemez, boş veya hatalı bir ekran oluşur.
[Aksiyom 4]: Eğer uygulama içi yönlendirme (routing) yapılandırmasında bu sayfa için erişim rotu tanımlanmamışsa, kullanıcılar bu hesap özeti sayfasına hiçbir şekilde erişemez, yönlendirme yapılamaz.
[Aksiyom 5]: Eğer modülün bağımlı olduğu projenin ortak UI bileşenleri (ana şablon, hesap menüsü, navigasyon çubuğu vb.) proje içinde mevcut değilse, sayfa düzgün görüntülenemez, tasarım bozulur veya çalışma zamanı hatası alınır.

---

## FONKSIYON DETAYLARI

### AccountOverviewPage
**Ne yapar**: Venthub HVAC projesinin hesap yönetimi modülünün ana giriş sayfası bileşenidir. Kullanıcıların hesaplarına ait tüm özet bilgileri tek bir merkezi arayüz üzerinden görüntülemesini sağlar, platformun hesapla ilgili tüm işlemlere erişim noktası olarak çalışır. Kaynak kodunda `src\views\account\AccountOverviewPage.tsx` konumunda yer alan bu React bileşeni, genel kullanıcı domainine hitap eden hesap yönetimi işlevlerinin merkezinde yer alır.
**Nasıl yapar**: React tabanlı bir fonksiyonel sayfa bileşeni olarak uygulamanın yönlendirme mekanizması tarafından hesap genel görünümü rotası tetiklendiğinde otomatik olarak çağrılır. İçerisinde hesap özeti, bağlı HVAC cihazları, fatura bilgileri gibi hesapla ilgili alt bileşenleri birleştirerek bütünleşik bir görünüm oluşturur, oturum kontrolü yaparak yetkili olmayan erişimleri engelleyerek güvenli bir görünüm sunar.
**Parametreler**:
- Bu fonksiyona herhangi bir girdi parametresi aktarılmaz; React uygulamasının yönlendirme sistemi tarafından dahili olarak tetiklenir.
**Dönüş**: Kaynak kodunda return tipi olarak void veya bilinmiyor olarak işaretlenmiş olsa da, işlevsel olarak React JSX formatında hesap genel görünümünün kullanıcı arayüzünü döndürür. Bu döndürülen JSX yapısı tarayıcıda DOM elementlerine çevrilerek son kullanıcıya görüntülenir.

---

## INTERFACES

### OrderRecord
- `id: string`
- `created_at: string`
- `total_amount: number | string`
- `status: string`
- `order_number: string`

### ShipmentRecord extends OrderRecord
- `carrier: string | null`
- `tracking_number: string | null`
- `shipped_at: string | null`
- `delivered_at: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx::AccountOverviewPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — Bileşenin mount durumunu takip eden bayrak, unmount sonrası gereksiz state güncellemelerini engellemek için kullanılır
  - `load` — Bileşen yüklendiğinde adres ve sipariş verilerini yüklemek için çağrılan async iç fonksiyon
  - `user` — Oturum açmış mevcut kullanıcı nesnesi, verileri kullanıcının id'sine göre çekmek için kullanılır
  - `setLoading` - Yükleme durumunu güncelleyen state setter fonksiyonu
  - `setAddresses` - Kullanıcı adresleri state'ini güncelleyen setter fonksiyonu
  - `setOrders` - Kullanıcı siparişleri state'ini güncelleyen setter fonksiyonu
- **Dönüş**: Bileşen temizleme (cleanup) fonksiyonu, unmount olduğunda `mounted` bayrağını false olarak ayarlar

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` - Mevcut oturum açmış kullanıcı, kullanıcı verisi yoksa yükleme işlemini iptal etmek için kontrol edilir
  - `setLoading` - Yükleme başladığında true, bittiğinde false yapmak için kullanılan state setter
  - `listAddresses` - Kullanıcının kayıtlı adreslerini Supabase'den çeken API fonksiyonu
  - `addrData` - `listAddresses` çağrısından dönen adres listesi verisi
  - `setAddresses` - Çekilen adres verilerini state'e kaydetmek için kullanılan setter
  - `orderData` - Çekilen tüm sipariş verilerini tutan `ShipmentRecord[]` tipinde dizi
  - `supabase` - Veritabanı sorguları için kullanılan Supabase istemci nesnesi
  - `data` - İlk tam kapsamlı sipariş sorgusundan dönen başarılı sonuç verisi
  - `error` - İlk sipariş sorgusunda oluşan hata nesnesi, PGRST100 kodu kontrolü için kullanılır
  - `fallback` - İlk sorgu başarısız olursa çalışan yedek sınırlı kapsamlı sipariş sorgusunun sonucu
  - `e` - Genel blokta yakalanan tüm hataları tutan hata nesnesi
  - `setOrders` - İşlenmiş sipariş verilerini state'e kaydetmek için kullanılan setter
  - `mounted` - Bileşen hala mount durumunda ise state güncellemelerini yapmak için kontrol edilen bayrak
- **Dönüş**: Promise<void>, async fonksiyon olarak herhangi bir değer döndürmez

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx::fallbackOrderMapCallback
- **params**: d - Yedek sorgudan dönen ham kayıt nesnesi (`Record<string, unknown>` tipinde)
- **ic_degiskenler**:
  - `...d` - Orijinal kaydın tüm mevcut özellikleri yeni nesneye kopyalanır
  - `carrier` - Eksik alan olarak eklenen null değerli taşıyıcı bilgisi
  - `tracking_number` - Eksik alan olarak eklenen null değerli kargo takip numarası
  - `shipped_at` - Eksik alan olarak eklenen null değerli gönderim tarihi
  - `delivered_at` - Eksik alan olarak eklenen null değerli teslimat tarihi
- **Dönüş**: Tüm zorunlu alanlara sahip `ShipmentRecord` tipinde standartlaştırılmış sipariş nesnesi

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx::getShipStatus
- **params**: row - Durumu hesaplanacak sipariş nesnesi (`ShipmentRecord` tipinde, opsiyonel)
- **ic_degiskenler**:
  - `row.delivered_at` - Siparişin teslim edildiği tarih, teslimat kontrolü için kullanılır
  - `row.status` - Siparişin metin olarak durumu, durum doğrulaması için kullanılır
  - `row.shipped_at` - Siparişin gönderildiği tarih, kargoda kontrolü için kullanılır
  - `row.tracking_number` - Siparişin kargo takip numarası, gönderim kontrolü için kullanılır
- **Dönüş**: Siparişin genel durumu: `'delivered' | 'shipped' | 'preparing'`

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx::activeShipStatusBadge
- **params**: status - Gösterilecek sevkiyat durumu (`'delivered' | 'shipped' | 'preparing'`)
- **ic_degiskenler**:
  - `CheckCircle` - Teslim edildi durumu için kullanılan ikon bileşeni
  - `Truck` - Kargoda durumu için kullanılan ikon bileşeni
  - `Clock` - Hazırlanıyor durumu için kullanılan ikon bileşeni
- **Dönüş**: Duruma özel stil verilmiş JSX elementi, durum rozeti olarak kullanılır

---

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx::getActiveStepIndex
- **params**: status - Adım indeksi hesaplanacak sevkiyat durumu (`'delivered' | 'shipped' | 'preparing'`)
- **ic_degiskenler**: yok (sadece durum karşılaştırması yapılır)
- **Dönüş**: Sevkiyat adım sırasını belirten sayısal değer: 2 (teslim edildi), 1 (kargoda), 0 (hazırlanıyor)

---

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx::renderShipStep
- **params**: step - İşlenecek sevkiyat adımı nesnesi, idx - Adımın listedeki indeks numarası
- **ic_degiskenler**:
  - `active` - Adımın aktif olup olmadığını belirten bayrak, stillendirme için kullanılır
  - `StepIcon` - Adımda gösterilecek ikon bileşeni
  - `shipSteps` - Tüm sevkiyat adımlarının tutulduğu ana liste, son adım kontrolü için kullanılır
- **Dönüş**: Adımın render edilmiş JSX fragmenti

---

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx::renderOrderCard
- **params**: o - İşlenecek sipariş nesnesi
- **ic_degiskenler**:
  - `isDelivered` - Siparişin teslim edilip edilmediğini belirten bayrak, kart stillendirmesi için kullanılır
  - `code` - Kartta gösterilecek formatlanmış sipariş kodu
  - `o.id` - Siparişin benzersiz kimliği, yönlendirme ve anahtar değer olarak kullanılır
  - `o.order_number` - Siparişin resmi numarası, kod oluşturmak için kullanılır
  - `o.total_amount` - Siparişin toplam tutarı, para formatlaması için kullanılır
  - `o.created_at` - Siparişin oluşturulma tarihi, tarih formatlaması için kullanılır
  - `Package` - Sipariş kartında kullanılan ikon bileşeni
  - `Link` - Next.js yönlendirme bileşeni, sipariş detay sayfasına link vermek için kullanılır
  - `formatCurrency` - Para tutarını kullanıcı diline göre formatlayan fonksiyon
  - `lang` - Kullanıcının aktif dil kodu, formatlamalar için kullanılır
  - `Calendar` - Tarih göstergesi olarak kullanılan ikon bileşeni
  - `formatDate` - Tarihi kullanıcı diline göre formatlayan fonksiyon
  - `activeShipStatusBadge` - Sipariş durumu rozeti oluşturan fonksiyon
  - `getShipStatus` - Siparişin genel durumunu hesaplayan fonksiyon
  - `router` - Next.js yönlendirici nesnesi, buton tıklamasında yönlendirme için kullanılır
  - `ArrowRight` - Detay butonunda kullanılan ikon bileşeni
- **Dönüş**: Tek sipariş kartının render edilmiş JSX elementi

---

## NODE ID STANDARD

  file: src\views\account\AccountOverviewPage.tsx
  function: src\views\account\AccountOverviewPage.tsx::AccountOverviewPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountOverviewPage

---

## BILEŞIM (CONTAINS)
  contains: OrderRecord