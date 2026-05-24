---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx
skeleton_hash: ed993728dcffbd9f
generated_at: 2026-05-23T22:36:32Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin hesap yönetimi alanında yer alan yönetici özelinde stok yönetimi sayfa bileşenidir. Sistemdeki yetkili admin kullanıcılarının stok verilerine erişip yönetebilmesi için tasarlanmış arayüzün ana giriş noktasıdır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve temel bileşeni olarak yönetici stok yönetimi arayüzünü tüm işlevleriyle birlikte sunar, sayfanın temel işleyişinden ve kullanıcıya sunulmasından sorumludur.
- AdminStockPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı yönetici (admin) stok yönetimi sayfa modülünün sorunsuz derlenmesi, çalıştırılması ve amaçlandığı gibi kullanılması için yetkilendirme sistemi, frontend yönlendirme (routing) altyapısı, bağımlı React kütüphanesi, proje özel servisleri ve arka uç veri kaynaklarının erişilebilir ve uyumlu olması zorunludur.

[Aksiyom 1]: Eğer sisteme giriş yapmış kullanıcının bu sayfaya erişim hakkı veren admin yetkisi yoksa, kullanıcı sayfaya erişemez, yetkisiz erişim hatası ile karşılaşır ya da güvenlik amaçlı olarak ana sayfaya yönlendirilir.
[Aksiyom 2]: Eğer projenin frontend routing sistemi bu sayfa için tanımlı path üzerinden erişim imkanı sunmuyorsa, kullanıcı sayfaya ulaşamaz, 404 bulunamadı hatası ile karşılaşır.
[Aksiyom 3]: Eğer modülün import ettiği React kütüphanesi, projeye özel temel UI bileşenleri ve stok yönetimi servisleri proje içinde bulunmuyorsa, modül derleme aşamasında hata verir ya da çalışma zamanında (runtime) kesintiye uğrar.
[Aksiyom 4]: Eğer bu sayfanın kullandığı arka uç stok veri servisi erişilemez durumdaysa, sayfada stok verileri yüklenemez, kullanıcıya yüklenememe hatası gösterilir ya da boş bir görünüm sunulur.
[Aksiyom 5]: Eğer admin kullanıcısının stok üzerinde ekleme, silme, düzenleme gibi işlem yapma yetkileri arka uç tarafından tanımlanmamışsa, sayfadaki ilgili işlem butonları çalışmaz, kullanıcıya yetki eksikliği hatası döndürülür.

---

## FONKSIYON DETAYLARI

### AdminStockPage
**Ne yapar**: VentHub HVAC projesinin admin paneline ait stok yönetimi sayfa bileşenidir. Sadece hesap yetkisine sahip admin kullanıcıların erişebileceği bu bileşen, sistemdeki tüm stok verilerinin görüntülenmesi, yönetilmesi ve stok işlemlerinin yürütülmesi için ana arayüz görevi görür.
**Nasıl yapar**: Proje kaynak kodunda src/views/account dizini altında konumlandırılmış React tabanlı bir TypeScript (TSX) bileşeni olarak çalışır. Kendi bünyesinde stok yönetimi ile ilgili alt bileşenleri, durum yönetimi mantığını ve yetki kontrollerini barındırarak kullanıcının erişim haklarını doğrular, stokla ilgili tüm işlevleri tek bir sayfa üzerinden kullanıcıya sunar.
**Parametreler**: Bu fonksiyona herhangi bir dış parametre aktarılmaz. Bileşen olarak çalışması için ihtiyaç duyduğu tüm bağlılıkları ve verileri uygulamanın genel bağlamından, state yönetim sisteminden ve yetki servislerinden temin eder.
**Dönüş**: Fonksiyon için açıkça tanımlanmış bir dönüş tipi belirtilmemiştir. Ancak bir React sayfa bileşeni olma niteliği gereği, uygulama tarafından ekran üzerinde render edilmek üzere geçerli bir React node'u döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::AdminStockPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth hook'tan gelen oturum açmış kullanıcı nesnesi, yetki kontrolünde kullanılır
  - `loading` — useAuth hook'tan gelen kimlik doğrulama yükleme durumu, yönlendirme kontrolünde kullanılır
  - `router` — Next.js useRouter hook'tan gelen yönlendirme nesnesi, giriş sayfasına yönlendirme için kullanılır
  - `all` — Tüm ürünleri tutan Product tipi durum değişkeni, stok listeleme ve filtrelemede kullanılır
  - `setAll` — all durumunu güncelleyen setter fonksiyonu, stok veya eşik değişikliklerinde güncelleme için kullanılır
  - `q` - Arama sorgusunu tutan string durum değişkeni, ürün filtrelemede kullanılır
  - `setQ` — q durumunu güncelleyen setter fonksiyonu, arama input onChange olayında kullanılır
  - `saving` — Şu anda güncellenmekte olan ürün ID'sini tutan string|null durumu, butonları devre dışı bırakmak için kullanılır
  - `setSaving` — saving durumunu güncelleyen setter fonksiyonu, işlem başında ve sonunda durumu ayarlar
  - `tempQty` — Ürün ID'lerine göre geçici stok miktarlarını tutan Record<string, number|''> durumu, manuel stok girişinde kullanılır
  - `setTempQty` — tempQty durumunu güncelleyen setter fonksiyonu, stok input onChange olayında kullanılır
  - `tempThreshold` — Ürün ID'lerine göre geçici düşük stok eşiklerini tutan Record<string, number|''> durumu, manuel eşik girişinde kullanılır
  - `setTempThreshold` — tempThreshold durumunu güncelleyen setter fonksiyonu, eşik input onChange olayında kullanılır
  - `isAdmin` — Kullanıcının admin yetkisine sahip olup olmadığını tutan boolean durumu, erişim kontrolünde kullanılır
  - `setIsAdmin` — isAdmin durumunu güncelleyen setter fonksiyonu, admin kontrolü sonucunda ayarlanır
  - `filtered` — Arama sorgusuna göre filtrelenmiş ürün listesi, tabloya yazdırılmak için useMemo ile üretilir
- **Dönüş**: JSX React elementi (stok yönetim sayfası arayüzü)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::auth_redirect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loading` — useAuth'tan gelen yükleme durumu, yönlendirme koşulunda kontrol edilir
  - `user` — useAuth'tan gelen kullanıcı nesnesi, oturum açılıp açılmadığını kontrol etmek için kullanılır
  - `router.push` — Next.js yönlendirme metodu, girişsiz kullanıcıları login sayfasına yönlendirir
  - `Routes.auth.login` — Tanımlı rota nesnesi, login sayfası URL'sini oluşturmak için kullanılır
- **Dönüş**: void

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::set_admin_status_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth'tan gelen kullanıcı nesnesi, admin yetkisini kontrol etmek için checkAdminAccess'a gönderilir
  - `checkAdminAccess` — Admin yetkisi kontrolü yapan yardımcı fonksiyon, kullanıcı nesnesiyle çağrılır
  - `setIsAdmin` — isAdmin durumunu güncelleyen setter, kontrol sonucunu saklar
- **Dönüş**: void

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::load_products_effect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — Bileşenin hala monte olup olmadığını takip eden bayrak, bellek sızıntısını önlemek için kullanılır
  - `load` - Ürünleri veritabanından çeken async iç fonksiyon, etki içinde çağrılır
- **Dönüş**: Temizleme fonksiyonu (() => void), bileşen unmount olduğunda mounted bayrağını false yapar

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::load_products_async
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — Bileşenin monte durumunu kontrol eden bayrak, veri geldikten sonra durumu güncellemek için kontrol edilir
  - `data` — Supabase'den dönen ürün listesi, all durumuna kaydedilmek için kullanılır
  - `error` — Supabase sorgusu sırasında oluşan hata nesnesi, try/catch içinde yakalanır
  - `supabase.from().select().order()` — Supabase sorgu zinciri, ürünleri isimle sıralı olarak çeker
  - `setAll` — all ürün listesi durumunu güncelleyen setter, gelen verileri saklar
- **Dönüş**: Promise<void>

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::filter_products_usememo_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `q` — Arama sorgusu, trim ve küçük harfe çevrilerek filtrelemede kullanılır
  - `all` — Tüm ürünlerin ham listesi, filtreleme işlemi için kaynak olarak kullanılır
  - `t` — İşlenmiş arama metni, tüm filtreleme kontrollerinde kullanılır
  - `p.name, p.sku, p.brand` — Ürünlerin filtrelemede kullanılan metinsel alanları, arama terimiyle eşleştirilir
- **Dönüş**: Filtrelenmiş Product[] listesi

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::adjust
- **params**: (p: Product, delta: number)
- **ic_degiskenler**:
  - `p` — Stok miktarı güncellenecek ürün nesnesi, mevcut stok miktarını almak için kullanılır
  - `delta` — Stok miktarına eklenecek/çıkarılacak değer (+1/-1), artırma/azaltma işlemlerinde kullanılır
  - `p.id` — Güncellenecek ürünün benzersiz ID'si, veritabanı sorgusunda eşleştirme için kullanılır
  - `p.stock_qty` — Ürünün mevcut stok miktarı, yeni miktarı hesaplamak için kullanılır
  - `newQty` - Hesaplanan yeni stok miktarı, minimum 0 olarak sınırlanır
  - `setSaving` — İşlem sırasında saving durumunu ayarlayan setter, işlem başlangıcında p.id, sonunda null atanır
  - `error` — Supabase güncelleme sorgusunda oluşan hata, yakalanıp loglanır
  - `supabase.from().update().eq()` — Supabase stok güncelleme sorgusu, ürünün stok miktarını veritabanında günceller
  - `setAll` — Tüm ürünler listesini yerel olarak güncelleyen setter, değişikliği arayüze yansıtır
- **Dönüş**: Promise<void>

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::setQty
- **params**: (_productId: string, qty: number)
- **ic_degiskenler**:
  - `_productId` — Stok miktarı ayarlanacak ürünün ID'si, veritabanı eşleştirmesi ve durum güncellemelerinde kullanılır
  - `qty` — Kullanıcının girdiği yeni stok miktarı, doğrulanıp kaydedilir
  - `newQty` — Sınırlanmış yeni stok miktarı, minimum 0 olarak ayarlanır
  - `setSaving` — İşlem sürecinde saving durumunu yöneten setter
  - `error` — Supabase sorgusunda oluşan hata, loglanır
  - `supabase.from().update().eq()` — Stok miktarını veritabanında güncelleyen sorgu
  - `setAll` — Yerel ürün listesini güncelleyen setter, değişikliği arayüze yansıtır
  - `setTempQty` — Geçici stok girişini sıfırlayan setter, kayıt sonrası inputu temizler
- **Dönüş**: Promise<void>

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::setThreshold
- **params**: (_productId: string, threshold: number | null)
- **ic_degiskenler**:
  - `_productId` — Düşük stok eşiği güncellenecek ürünün ID'si
  - `threshold` — Kullanıcının girdiği yeni eşik değeri, null ise varsayılan kullanılacak anlamına gelir
  - `newThreshold` — Doğrulanmış yeni eşik değeri, sadece 0 veya üstü sayılar kabul edilir
  - `setSaving` — İşlem sürecinde saving durumunu yöneten setter
  - `error` — Veritabanı güncellemesinde oluşan hata
  - `supabase.from().update().eq()` — Eşik değerini veritabanında güncelleyen sorgu
  - `setAll` — Yerel ürün listesini güncelleyen setter
  - `setTempThreshold` — Geçici eşik girişini sıfırlayan setter, kayıt sonrası inputu temizler
- **Dönüş**: Promise<void>

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx::map_product_row_callback
- **params**: (p: Product)
- **ic_degiskenler**:
  - `p` — Tabloya yazdırılacak ürün nesnesi, tüm alanları arayüzde gösterilir
  - `p.id` — Ürünün benzersiz ID'si, React listesi key'i ve tüm durum erişimlerinde kullanılır
  - `p.stock_qty, p.low_stock_threshold` — Ürünün stok ve eşik değerleri, arayüzde gösterilir ve renklendirme için kullanılır
  - `qty` — Tür kontrolünden geçmiş stok miktarı, arayüzde gösterilir
  - `threshold` — Tür kontrolünden geçmiş eşik değeri, arayüzde gösterilir
  - `tempQty[p.id], tempThreshold[p.id]` — Ürüne ait geçici giriş değerleri, inputlarda kullanılır
  - `tempQty_val, tempThreshold_val` - Geçici değerlerin varsayılan boş string ile yedeklenmiş halleri, input değerleri olarak kullanılır
  - `saving` — İşlemdeki ürün ID'si, butonların devre dışı bırakılması için kontrol edilir
  - `adjust, setQty, setThreshold` - Stok ve eşik güncelleme fonksiyonları, buton onClick olaylarında çağrılır
  - `setTempQty, setTempThreshold` — Geçici durumları güncelleyen setterler, input onChange olaylarında kullanılır
- **Dönüş**: JSX React elementi (tek ürün tablo satırı)

---

## NODE ID STANDARD

  file: src\views\account\AdminStockPage.tsx
  function: src\views\account\AdminStockPage.tsx::AdminStockPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminStockPage