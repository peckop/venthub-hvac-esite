---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx
skeleton_hash: db798fd9cd69ba82
entity_hashes:
  func:OrderDetailPage: 9d9093210e07827e
  overview: 9e1c669269632790
  style_tokens: 2d7ff3d6e2a546ab
generated_at: 2026-06-06T21:57:41Z
---

## Genel Bakış
Bu modül, kullanıcının tek bir siparişin tüm detaylarını görüntülemesini sağlayan bir React sayfa bileşenini içermektedir. Sipariş özeti, sipariş edilen ürünlerin listesi, ödeme ve teslimat bilgileri gibi unsurları düzenli bir arayüzde bir araya getirerek kullanıcıya sunmak temel sorumluluğudur.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve ana bileşenidir; tüm sayfa yapısını, alt bileşenleri ve gerekli veri akışını yöneterek sipariş detay sayfasını render eder.
- OrderDetailPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca fonksiyon imzasından çıkarılabilecek mimari varsayımlar aşağıda sunulmuştur.

[Aksiyom 1]: Eğer `OrderDetailPage` bileşeni çağrıldığında React ortamı (React, ReactDOM) mevcut değilse, bileşen render edilemez ve uygulama hata verir.

[Aksiyom 2]: Eğer bileşen `views/account/` yolunda yer alıyorsa ve fonksiyon imzası `OrderDetailPage()` şeklinde parametresiz tanımlıysa, bileşenin sipariş detay bilgilerini kendi içinden (örn. route params, context veya API çağrısı ile) edinmesi gerekir; aksi halde görüntülenecek sipariş verisi bilinmez.

[Aksiyom 3]: Eğer bileşen bir React functional component olarak tanımlıysa ve imzasında parametre (props) belirtilmemişse, bileşen dışarıdan prop almamaktadır; bu durumda bileşen bağımsız çalışmak zorundadır (örn. kendi içinde `useParams()`, `useContext()` veya doğrudan API çağrısı kullanıyordur).

[Aksiyom 4]: Eğer bileşen sayfa seviyesinde bir view bileşeni ise ve modül sabitleri tanımlı değilse, bileşenin使用的 tüm sabit değerler (API endpoint'leri, route path'leri vb.) ya fonksiyon gövdesinde inline olarak tanımlıdır ya da üst modüllerden sağlanır.

[Aksiyom 5]: Eğer bileşen modül sığası `(skeleton_hash: 622dd4d11cb43f53)` ile ilişkilendirilmişse ve bu modül için tanımlı bir stil token'ı `(2d7ff3d6e2a546ab)` mevcutsa, bileşenin görünümü bu stil token'ına uygun olmalıdır; aksi halde tasarım tutarsızlığı oluşur.

---

**Not:** Fonksiyon gövdesi (implementasyon detayı) sağlanmadığı için, bileşenin içerdiği alt bileşenler, state yönetimi, API çağrıları ve hata yönetimi gibi konularda kesin aksiyom üretilememiştir.

---

## FONKSİYON DETAYLARI

### OrderDetailPage
**Ne yapar**: Kullanıcının sipariş detaylarını gösteren bir sayfa komponenti. Kimlik doğrulama, sipariş verisinin yüklenmesi, sekme yönetimi ve PDF fatura oluşturma gibi işlemleri gerçekleştirir.  

**Nasıl yapar**:  
- URL parametresinden `id` alır, kimlik doğrulama durumunu kontrol eder; doğrulanmamışsa giriş sayfasına yönlendirir.  
- `useEffect` içinde Supabase üzerinden sipariş ve ilgili ürün kalemlerini tek sorguda çeker, veriyi tip güvenli nesnelere dönüştürür ve `order` durumuna kaydeder.  
- Yükleme, kopyalama, PDF oluşturma ve yeniden sipariş (reorder) gibi yardımcı fonksiyonları tanımlar.  
- Sekme (`overview`, `items`, `shipping`, `invoice`) seçimine göre farklı UI bölümlerini render eder.  

**Parametreler**:  
- *yok* — Bu bir React fonksiyon komponentidir, dışarıdan parametre almaz.  

**Dönüş**:  
- `void` – UI render eder, doğrudan bir değer döndürmez.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::authRedirectCallback
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::loadEffect
- **params**: ()
- **ic_degiskenler**: 
  - `load` — asenkron veri yükleme fonksiyonu, çağrılarak çalıştırılır
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::load
- **params**: ()
- **ic_degiskenler**: 
  - `orderData` — supabase sorgusundan dönen sipariş verisi
  - `orderError` — supabase sorgusundan dönen hata nesnesi
  - `rawItems` — sipariş kalemlerinin ham verisi, Record dizisi olarak
  - `mappedItems` — ham verilerin OrderItem[] dizisine dönüştürülmüş hali
  - `mappedOrder` — sipariş verisinin Order arayüzüne dönüştürülmüş hali
  - `e` — catch bloğunda yakalanan hata
- **Dönüş**: yok (async fonksiyon, promise döndürür)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::mapOrderItem
- **params**: (it: Record<string, unknown>)
- **ic_degiskenler**: 
  - `unit` — birim fiyat, it.price_at_time'dan Number ile dönüştürülür
  - `qty` — miktar, it.quantity'dan Number ile dönüştürülür
- **Dönüş**: OrderItem nesnesi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::copyToClipboard
- **params**: (text?: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::generateProformaPDF
- **params**: (o: Order)
- **ic_degiskenler**: 
  - `jsPDF` — jsPDF kütüphanesinin asenkron olarak import edilmiş hali
  - `autoTable` — jspdf-autotable eklentisinin asenkron olarak import edilmiş hali
  - `doc` — jsPDF doküman nesnesi
  - `nf` — Intl.NumberFormat nesnesi para formatı için
  - `orderNo` — sipariş numarası, o.order_number'dan çıkarılır veya o.id'den üretilir
  - `head` — tablo başlık satırı dizisi
  - `body` — tablo gövde satırları dizisi
  - `after` — tablonun son Y koordinatı
  - `e` — catch bloğunda yakalanan hata
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::reorder
- **params**: (o: Order)
- **ic_degiskenler**: 
  - `ids` — sipariş kalemlerindeki benzersiz product_id dizisi
  - `names` — product_id olmayan kalemlerdeki benzersiz ürün adları dizisi
  - `productMap` — ürün id veya adına göre ürün nesnelerini eşleyen harita
  - `data` — supabase sorgusundan dönen ürün verisi
  - `error` — supabase sorgusundan dönen hata nesnesi
  - `prod` — bulunulan ürün nesnesi
  - `added` — sepete eklenen toplam ürün miktarı
  - `e` — catch bloğunda yakalanan hata
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::getStatusColorClass
- **params**: (status: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: string (CSS sınıf adı)

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::getStatusText
- **params**: (status: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: string (durum metni)

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::renderStep
- **params**: (s: string, idx: number)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::renderTabButton
- **params**: (tt: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::renderShippingAddress
- **params**: ()
- **ic_degiskenler**: 
  - `addr` — order.shipping_address'ın ShippingAddress türüne cast edilmiş hali
  - `line1` — adresin birinci satırı, fullAddress veya street
  - `line2` — ikinci satır, city ve district virgülle birleştirilmiş
  - `line3` — posta kodu
- **Dönüş**: JSX element

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::renderOrderItemRow
- **params**: (item: OrderItem)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (tr)

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::renderInvoiceInfo
- **params**: ()
- **ic_degiskenler**: 
  - `info` — order.invoice_info nesnesinin Record<string, unknown> türüne cast edilmiş hali
  - `iv` — invoice_info'dan belirli bir anahtarın değerini string olarak döndüren yardımcı fonksiyon
- **Dönüş**: JSX element

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::renderLegalConsents
- **params**: ()
- **ic_degiskenler**: 
  - `cons` — order.legal_consents nesnesinin Record<string, { accepted?: boolean; ts?: string | null }> türüne cast edilmiş hali
  - `row` — yasal onay satırını oluşturan yardımcı fonksiyon
- **Dönüş**: JSX element

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hbac\src\views\account\OrderDetailPage.tsx::renderConsentRow
- **params**: (label: string, k: string)
- **ic_degiskenler**: 
  - `c` — cons[k] değerinden alınan nesne
  - `ok` — c.accepted boolean değeri
  - `ts` — c.ts zaman damgasının formatlanmış hali
- **Dönüş**: JSX element

---

## NODE ID STANDARD

  file: src\views\account\OrderDetailPage.tsx
  function: src\views\account\OrderDetailPage.tsx::OrderDetailPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: OrderDetailPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-clean-white`, `bg-green-100`, `bg-orange-100`, `bg-orange-100/80`, `bg-primary-navy`, `bg-primary-navy/5`, `bg-slate-100`, `bg-slate-100/80`, `bg-slate-200`, `bg-slate-50`, `bg-slate-50/80`, `bg-white`, `border-b`, `border-b-2`, `border-gray-100`
- **Layout:** `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `gap-6`, `grid`, `grid-cols-1`, `h-1`, `h-10`, `h-12`, `h-6`
- **Varyant/Responsive:** `:`, `focus-visible:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${activeIdx`, `${getStatusColor(order.status`, `${idx`, `${ok`, `${tab`, `1`, `:`, `<=`, `===`, `>=`, `activeIdx`, `animate-spin`, `border`, `break-all`, `divide-slate-100`