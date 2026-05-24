---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx
skeleton_hash: 622dd4d11cb43f53
generated_at: 2026-05-23T22:36:40Z
---

## Genel Bakış
Venthub HVAC projesinin kullanıcı hesap paneli bölümünde yer alan bir React görünüm modülüdür. Kullanıcıların kendi hesapları üzerinden eriştikleri belirli bir siparişin tüm detaylarını görüntülemesini sağlayan sipariş detay sayfasının temel yapısını oluşturur. Modül, tamamen bu sayfanın işleyişinden sorumlu ana bileşeni barındırır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sipariş detay sayfasının tüm arayüz düzenini, içerik yönetimini ve kullanıcıya sunulmasını üstlenen tek ana bileşendir, sayfanın çalışmasının temelini oluşturur.
- OrderDetailPage

---

## AXIOMS – Mimari Varsayımlar
OrderDetailPage, VentHub HVAC projesinin kullanıcı hesapları bölümündeki sipariş detaylarını görüntüleyen React view bileşenidir, doğru ve güvenli şekilde çalışması için yönlendirme, kimlik doğrulama, arka plan API servisleri ve ortak UI bileşeni bağımlılıklarının sorunsuz çalışması zorunludur.

[Aksiyom 1]: Eğer ana uygulamanın yönlendirme (routing) sistemi tarafından bu sayfaya erişim sırasında URL parametresi olarak sipariş kimliği (order ID) iletilmiyorsa, sipariş verisi çekilemez ve sayfa hata ekranıyla veya boş şekilde yüklenir.
[Aksiyom 2]: Eğer sipariş detayı verisini sunucudan çeken arka plan API servisi erişilemez veya geçerli veri dönmüyorsa, hiçbir sipariş detayı kullanıcıya gösterilemez ve kullanıcı sayfa üzerindeki hiçbir işlevi kullanamaz.
[Aksiyom 3]: Eğer kullanıcının ilgili siparişi görüntülemeye yetkisi olduğunu doğrulayan kimlik doğrulama/yetkilendirme sistemi çalışmıyorsa, ya yetkisiz kullanıcılar hassas sipariş verilerine erişir ya da yetkili kullanıcılar sayfaya erişim sağlayamaz.
[Aksiyom 4]: Eğer bu sayfanın bağımlı olduğu ortak proje UI bileşenleri (navigasyon çubuğu, buton, bilgi kartları vb.) projeye dahil edilmemiş veya çalışmıyorsa, sayfa düzgün şekilde render edilemez, kullanıcı arayüzü işlevsiz ve bozuk görünür.

---

## FONKSIYON DETAYLARI

### OrderDetailPage
**Ne yapar**: VentHub HVAC projesinin hesap yönetimi modülünde yer alan sipariş detayları sayfa bileşenidir. src/views/account/OrderDetailPage.tsx dosyası içinde tanımlanan bu bileşen, platformdaki kullanıcıların kendilerine ait siparişlerin tüm detaylarını görüntüleyebilmesini sağlayan arayüzü kullanıma sunar. Projenin genel domain yapısına uygun olarak hesaplar bölümündeki sipariş takibi akışının temel parçasını oluşturur.
**Nasıl yapar**: React tabanlı proje mimarisinde sayfa bileşeni olarak çalışan OrderDetailPage, projenin yönlendirme sistemi ile eşleşerek yalnızca sipariş detayları için tanımlanan rotada çağrılır. Sipariş detaylarını göstermek için gerekli tüm alt bileşenleri, kullanıcı arayüzü elemanlarını bir araya getirerek kullanıcıya sunacak şekilde dahili mantığını işletir, kaynak tipine uygun belge yapısı içinde sayfa işlevini yerine getirir.
**Parametreler**:
- Verilen kaynak belgede bu fonksiyon için herhangi bir giriş parametresi tanımlanmamıştır.
**Dönüş**: Kaynak belgede fonksiyonun dönüş tipi olarak void veya bilinmiyor olarak belirtilmiştir, fonksiyona ait ek dönüş değeri veya içeriğine dair herhangi bir detay paylaşılmamıştır.

---

## INTERFACES

### ShippingAddress
- `fullAddress?: string`
- `street?: string`
- `city?: string`
- `district?: string`
- `state?: string`
- `postalCode?: string`
- `postal_code?: string`

### OrderItem
- `id: string`
- `product_id?: string`
- `product_name: string`
- `quantity: number`
- `unit_price: number`
- `total_price: number`
- `product_image_url?: string | null`

### Order
- `id: string`
- `total_amount: number`
- `status: string`
- `payment_status?: string`
- `created_at: string`
- `customer_name: string`
- `customer_email: string`
- `shipping_address: unknown`
- `order_items: OrderItem[]`
- `order_number?: string`
- `is_demo?: boolean`
- `payment_data?: unknown`
- `conversation_id?: string`
- `carrier?: string`
- `tracking_number?: string`
- `tracking_url?: string`
- `shipped_at?: string`
- `delivered_at?: string`
- `shipping_method?: 'standard' | 'express' | string`
- `invoice_type?: string`
- `invoice_info?: unknown`
- `legal_consents?: unknown`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::auth_redirect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `authLoading` — Kullanıcı oturum yükleme durumu, yetkilendirme kontrolü için kullanılır
  - `user` - Oturum açmış kullanıcı nesnesi, yetkisiz erişimi engellemek için kontrol edilir
  - `router` - Next.js yönlendirme nesnesi, giriş sayfasına yönlendirme için kullanılır
  - `Routes.auth.login` - Giriş sayfası rota üreticisi, yönlendirme adresi oluşturmak için kullanılır
  - `id` - Mevcut siparişin ID'si, geri dönüş adresi parametresi olarak kullanılır
- **Dönüş**: void, yetkisiz kullanıcıları giriş sayfasına yönlendirir, koşul sağlanırsa erken return eder

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::useEffect_order_loader
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` - Oturumlu kullanıcı nesnesi, sipariş yükleme izni kontrolü için kullanılır
  - `id` - Detayı gösterilecek siparişin ID'si, sorgu koşulu olarak kullanılır
  - `setLoading` - Yükleme durumu state setter'ı, yükleme başlangıç/bitişinde güncellenir
  - `supabase` - Supabase veritabanı istemcisi, sipariş verisi çekmek için kullanılır
  - `orderData` - Veritabanından çekilen ham sipariş nesnesi, veri işlemede kullanılır
  - `orderError` - Sipariş sorgusu sırasında oluşan hata nesnesi, hata yakalamada kullanılır
  - `rawItems` - Ham sipariş kalemleri listesi, tiplendirme sonrası map işlemi için kullanılır
  - `mappedItems` - Tiplendirilip işlenmiş sipariş kalemleri listesi, sipariş nesnesine eklenir
  - `mappedOrder` - Uygulama tiplerine uygun işlenmiş sipariş nesnesi, state'e kaydedilir
  - `setOrder` - Sipariş state setter'ı, işlenmiş siparişi kaydetmek için kullanılır
  - `toast` - Bildirim gösterici utility, hata mesajı göstermek için kullanılır
  - `t` - Çeviri fonksiyonu, yerelleştirilmiş hata mesajı almak için kullanılır
  - `load` - İçinde tanımlanan async sipariş yükleme fonksiyonu, çağrılarak çalıştırılır
- **Dönüş**: void, sipariş yükleme sürecini başlatır

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::load_order
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` - Oturumlu kullanıcı nesnesi, yükleme izni kontrolü için kullanılır
  - `id` - Yüklenecek siparişin ID'si, veritabanı sorgu koşulu olarak kullanılır
  - `setLoading` - Yükleme state setter'ı, işlem süresince yükleme durumunu aktif eder
  - `supabase` - Supabase veritabanı istemcisi, ilişkisel sipariş verisi çekmek için kullanılır
  - `orderData` - Veritabanından çekilen ham sipariş ana verisi, işlenmek için kullanılır
  - `orderError` - Sorgu hatası nesnesi, hata fırlatmak için kullanılır
  - `rawItems` - Ham sipariş kalemleri listesi, tip dönüşümü sonrası işlenir
  - `mappedItems` - Uygulama tiplerine uygun işlenmiş sipariş kalemleri
  - `mappedOrder` - Tamamen işlenmiş sipariş nesnesi, state'e kaydedilir
  - `setOrder` - Sipariş state setter'ı, işlenmiş siparişi kaydeder
  - `console.error` - Hata loglama fonksiyonu, yükleme hatalarını kaydeder
  - `toast.error` - Hata bildirimi fonksiyonu, kullanıcıya hata gösterir
  - `t` - Çeviri fonksiyonu, yerelleştirilmiş hata mesajı alır
- **Dönüş**: Promise<void>, async olarak sipariş verisini yükleyip state'e kaydeder

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::map_order_item
- **params**: it (ham sipariş kalemi nesnesi)
- **ic_degiskenler**:
  - `unit` - Birim fiyat, sayıya dönüştürülmüş kalem fiyatı, toplam hesaplamada kullanılır
  - `qty` - Sipariş adedi, sayıya dönüştürülmüş miktar, toplam hesaplamada kullanılır
  - `it.price_at_time` - Ham verideki kalem birim fiyatı, dönüşüm için kullanılır
  - `it.quantity` - Ham verideki kalem miktarı, dönüşüm için kullanılır
- **Dönüş**: OrderItem tipi işlenmiş sipariş kalemi nesnesi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::copy_to_clipboard
- **params**: text?: string (kopyalanacak metin)
- **ic_degiskenler**:
  - `navigator.clipboard.writeText` - Tarayıcı panosuna yazma metodu, metni kopyalar
  - `toast.success` - Başarı bildirimi, kopyalama başarılı olursa gösterilir
  - `toast.error` - Hata bildirimi, kopyalama başarısız olursa gösterilir
  - `t` - Çeviri fonksiyonu, yerelleştirilmiş bildirim mesajları alır
- **Dönüş**: Promise<void>, async olarak metni panoya kopyalar

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::generate_proforma_pdf
- **params**: o: Order (PDF'i oluşturulacak sipariş nesnesi)
- **ic_degiskenler**:
  - `jsPDF` - Dinamik olarak yüklenen jsPDF kütüphanesi, PDF oluşturmak için kullanılır
  - `autoTable` - jsPDF eklentisi, PDF'de tablo oluşturmak için kullanılır
  - `doc` - Oluşturulan jsPDF belgesi nesnesi, tüm içerikler bu belgeye eklenir
  - `nf` - Para formatı için Intl.NumberFormat nesnesi, fiyatları yerel biçimde gösterir
  - `lang` - Uygulama dil kodu, format ayarları için kullanılır
  - `orderNo` - PDF'de kullanılacak sipariş numarası, sipariş verisinden üretilir
  - `head` - PDF tablosu başlık satırı, sipariş kalemleri tablosu için kullanılır
  - `body` - PDF tablosu içerik satırları, sipariş kalemlerinden üretilir
  - `after` - Son tablonun bittiği Y koordinatı, toplam tutarı yazmak için kullanılır
  - `formatDateTime` - Tarih formatlama fonksiyonu, sipariş tarihini biçimlendirir
  - `doc.save` - PDF'i indirme metodu, kullanıcıya belgeyi sunar
- **Dönüş**: Promise<void>, async olarak proforma fatura PDF'i oluşturur ve indirir

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::reorder_items
- **params**: o: Order (Tekrar sipariş edilecek sipariş nesnesi)
- **ic_degiskenler**:
  - `ids` - Sipariş kalemlerindeki geçerli ürün ID'leri listesi, ürün sorgusu için kullanılır
  - `names` - ID'si olmayan kalemlerin ürün isimleri listesi, alternatif sorgu için kullanılır
  - `productMap` - Çekilen ürünleri saklayan harita, ID/isime göre ürün erişimi sağlar
  - `supabase` - Supabase istemcisi, ürün verilerini çekmek için kullanılır
  - `added` - Sepete eklenen toplam ürün adedi, başarı mesajı için kullanılır
  - `addToCart` - Sepete ekleme fonksiyonu, ürünleri sepete ekler
  - `router.push` - Yönlendirme metodu, işlem başarılı olursa sepet sayfasına gönderir
  - `Routes.cart` - Sepet sayfası rota üreticisi, yönlendirme adresi oluşturur
  - `toast` - Bildirim fonksiyonları, işlem sonucunu kullanıcıya gösterir
- **Dönüş**: Promise<void>, async olarak eski siparişin ürünlerini sepete ekler, sepet sayfasına yönlendirir

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::get_status_classes
- **params**: status: string (Sipariş durumu metni)
- **ic_degiskenler**:
  - Durum metni, küçük harfe dönüştürülerek switch case'inde kontrol edilir
- **Dönüş**: string, duruma uygun Tailwind CSS renk sınıfları

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::get_status_text
- **params**: status: string (Ham sipariş durumu metni)
- **ic_degiskenler**:
  - `t` - Çeviri fonksiyonu, duruma göre yerelleştirilmiş metin döndürür
- **Dönüş**: string, yerelleştirilmiş sipariş durumu metni

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::render_step
- **params**: s (adım metni), idx (adım indeksi)
- **ic_degiskenler**:
  - `activeIdx` - Şu anki aktif adım indeksi, adımın tamamlanma durumunu belirler
  - `getStatusText` - Durum metnini çeviren fonksiyon, adım etiketi için kullanılır
  - `steps.length` - Toplam adım sayısı, son adımda ayırıcı çizgi çizmemek için kullanılır
- **Dönüş**: React.Fragment, sipariş takip adımı JSX elementi

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::render_tab_button
- **params**: tt (sekme ID'si)
- **ic_degiskenler**:
  - `setTab` - Aktif sekme state setter'ı, tıklanınca aktif sekmeyi değiştirir
  - `tab` - Şu anki aktif sekme ID'si, buton stillendirmesi için kullanılır
  - `t` - Çeviri fonksiyonu, sekme etiketlerini yerelleştirir
- **Dönüş**: JSX button elementi, sekme butonu render eder

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::render_shipping_address
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `order` - Mevcut sipariş nesnesi, kargo adresi verisi içinden alınır
  - `addr` - Tiplendirilmiş kargo adresi nesnesi, adres satırları oluşturmak için kullanılır
  - `line1` - Adresin ilk satırı, sokak bilgisi içerir
  - `line2` - Adresin ikinci satırı, şehir/ilçe bilgisi içerir
  - `line3` - Adresin üçüncü satırı, posta kodu bilgisi içerir
- **Dönüş**: JSX div elementi, formatlanmış kargo adresi render eder

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::render_order_item_row
- **params**: item (sipariş kalemi nesnesi)
- **ic_degiskenler**:
  - `Routes.legacyProduct` - Ürün detay sayfası rota üreticisi, link adresi oluşturur
  - `Link` - Next.js Link bileşeni, ürün sayfasına yönlendirme için kullanılır
  - `VentImage` - Özel resim bileşeni, ürün resmi gösterir
  - `formatPrice` - Fiyat formatlama fonksiyonu, kalem fiyatlarını biçimlendirir
  - `t` - Çeviri fonksiyonu, resim yok metnini yerelleştirir
- **Dönüş**: JSX tr elementi, sipariş kalemi tablo satırı render eder

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::render_invoice_info
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `order` - Mevcut sipariş nesnesi, fatura verisi içinden alınır
  - `info` - Ham fatura bilgisi nesnesi, fatura alanlarını okumak için kullanılır
  - `iv` - Fatura bilgisi getirici yardımcı fonksiyon, alan değerini formatlar
- **Dönüş**: JSX div elementi, fatura türüne göre fatura bilgilerini render eder

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::render_legal_consents
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `order` - Mevcut sipariş nesnesi, yasal onay verisi içinden alınır
  - `cons` - Tiplendirilmiş yasal onaylar nesnesi, onay durumlarını okur
  - `row` - Onay satırı oluşturan yardımcı fonksiyon, her onay için satır oluşturur
  - `formatDateTime` - Onay tarihi formatlama fonksiyonu, kabul zamanını biçimlendirir
  - `lang` - Uygulama dil kodu, tarih formatlaması için kullanılır
- **Dönüş**: JSX fragment, tüm yasal onayları render eder

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::render_consent_row
- **params**: label: string (onay etiketi), k: string (onay anahtarı)
- **ic_degiskenler**:
  - `cons` - Tüm yasal onayları içeren nesne, ilgili onay verisini alır
  - `c` - İlgili onayın detay nesnesi, kabul durumu ve zamanını içerir
  - `ok` - Onayın kabul edilip edilmediğini gösteren boolean
  - `ts` - Formatlanmış onay zamanı, kabul edilmişse gösterilir
  - `formatDateTime` - Tarih formatlama fonksiyonu, onay zamanını biçimlendirir
  - `lang` - Uygulama dil kodu, tarih formatlaması için kullanılır
- **Dönüş**: JSX div elementi, tek bir yasal onay satırı render eder

---

## NODE ID STANDARD

  file: src\views\account\OrderDetailPage.tsx
  function: src\views\account\OrderDetailPage.tsx::OrderDetailPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: OrderDetailPage