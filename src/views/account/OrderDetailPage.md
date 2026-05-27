---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx
skeleton_hash: 622dd4d11cb43f53
entity_hashes:
  func:OrderDetailPage: 86e76b4c00c9f2fc
  overview: 91762eaa328b7587
  style_tokens: 2d7ff3d6e2a546ab
generated_at: 2026-05-27T18:30:40Z
---

## Genel Bakış
Bu modül, kullanıcının bir siparişin tüm detaylarını görüntülemesini sağlayan sayfa bileşenini tanımlar. Sipariş özeti, ürün listesi, teslimat bilgileri ve sipariş durumu gibi temel bilgilerin tek bir ekranda sunulmasından sorumludur.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sipariş detay sayfasının tamamını oluşturan ve ilgili tüm alt bileşenleri bir araya getiren ana fonksiyondur.
- OrderDetailPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer **React Router** (veya benzeri bir yönlendirme bağlamı) mevcut değilse, `OrderDetailPage` bileşeni doğru URL parametrelerine erişemez ve sayfa içeriği render edilemez.

**Aksiyom 2**: Eğer **global state/store** (ör. Redux, Context API) içinde sipariş detay verisi (`orderDetail`) bulunmuyorsa, `OrderDetailPage` ya bir **yükleme (loading) göstergesi** gösterir ya da **veri bulunamadı** hatası üretir.

**Aksiyom 3**: Eğer **kullanıcı oturum bilgisi** (auth context) sağlanmamışsa, `OrderDetailPage` erişim kontrolü nedeniyle yönlendirme (redirect) yapar veya yetkisiz erişim mesajı gösterir.

**Aksiyom 4**: Eğer **stil/tema sağlayıcısı** (ThemeProvider vb.) eksikse, `OrderDetailPage` stil sınıflarını bulamaz ve varsayılan (fallback) stil ile render olur; bu da UI tutarsızlığına yol açar.

**Aksiyom 5**: Eğer **harici API çağrısı** (ör. sipariş detaylarını getiren endpoint) başarısız olursa, `OrderDetailPage` hata durumunu yakalar ve kullanıcıya **hata mesajı** gösterir; aksi takdirde sayfa boş kalır.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::anonymousRedirectEffect
- **params**: (none)
- **ic_degiskenler**:
  - `authLoading` — auth hook‑dan gelen yükleme durumu, yönlendirme kararını etkiler
  - `user` — oturum açmış kullanıcı nesnesi, yoksa yönlendirme yapılır
  - `router` — Next.js router, `router.push` ile login sayfasına yönlendirme yapılır
  - `id` — URL parametresi, yönlendirme URL’sine eklenir
- **Dönüş**: yok (yan etki: olası yönlendirme)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::loadEffectWrapper
- **params**: (none)
- **ic_degiskenler**:
  - `load` — iç tanımlı async fonksiyon, sipariş verisini çeker
  - `user` — oturum açmış kullanıcı, yoksa fonksiyon erken döner
  - `id` — sipariş kimliği, yoksa fonksiyon erken döner
- **Dönüş**: yok (yan etki: `load` fonksiyonunun çalıştırılması)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::load
- **params**: (none)
- **ic_degiskenler**:
  - `user` — oturum açmış kullanıcı, müşteri adı/eposta fallback’inde kullanılır
  - `id` — sipariş kimliği, sorgu filtresi
  - `setLoading` — state setter, yükleme durumunu yönetir
  - `supabase` — veritabanı client, `venthub_orders` ve `products` tablolarına sorgu yapar
  - `orderData` — sorgudan dönen sipariş kaydı, alanları haritalanır
  - `orderError` — sorgu hatası, fırlatılırsa yakalanır
  - `rawItems` — `orderData.venthub_order_items` dizisi, tip güvenliği için `Record<string, unknown>[]`
  - `mappedItems` — `OrderItem[]` tipinde, fiyat ve miktar hesaplamaları yapılır
  - `mappedOrder` — `Order` nesnesi, UI state’e aktarılır
  - `setOrder` — state setter, `mappedOrder`’ı kaydeder
  - `toast` — UI toast bildirimi, hata ve başarı mesajları gösterir
  - `t` — i18n çeviri fonksiyonu, hata mesajı çevirisi
- **Dönüş**: yok (yan etki: `setOrder`, `setLoading`, toast bildirimleri)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::itemMapper
- **params**: `it`
- **ic_degiskenler**:
  - `unit` — `it.price_at_time` değerinin sayısal hâli, varsayılan 0
  - `qty` — `it.quantity` değerinin sayısal hâli, varsayılan 0
- **Dönüş**: `OrderItem` nesnesi (id, product_id, product_name, quantity, unit_price, total_price, product_image_url)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::copyToClipboard
- **params**: `text?` (opsiyonel string)
- **ic_degiskenler**:
  - `text` — kopyalanacak metin, yoksa fonksiyon erken döner
  - `navigator.clipboard.writeText` — tarayıcı API’si, metni panoya yazar
  - `toast` — başarı/başarısızlık toast’ları
  - `t` — i18n çeviri fonksiyonu, mesaj çevirileri
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::generatePdf
- **params**: `o: Order`
- **ic_degiskenler**:
  - `jsPDF` — dinamik import edilen PDF sınıfı
  - `autoTable` — PDF içinde tablo oluşturmak için kütüphane
  - `doc` — yeni PDF belgesi, `jsPDF` örneği
  - `nf` — para birimi formatlayıcı (`Intl.NumberFormat`)
  - `orderNo` — sipariş numarası ya da ID’den türetilen kod
  - `head` — tablo başlıkları, i18n çevirileriyle doldurulur
  - `body` — sipariş kalemlerinden oluşturulan tablo satırları
  - `after` — tablo sonrasındaki Y koordinatı
  - `t` — i18n çeviri fonksiyonu
  - `formatDateTime` — tarih‑saat formatlayıcı
  - `toast` — hata toast’ı
- **Dönüş**: yok (yan etki: PDF dosyasını indirme)

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::reorder
- **params**: `o: Order`
- **ic_degiskenler**:
  - `ids` — ürün‑id’leri listesi (tekil)
  - `names` — ürün‑adları listesi (tekil, id’si olmayanlar)
  - `productMap` — `Record<string, Product>`; id veya ad → Product nesnesi
  - `supabase` — veritabanı client, `products` tablosundan veri çeker
  - `data` / `error` — sorgu sonuçları
  - `added` — sepete eklenen toplam miktar
  - `it` — döngüdeki sipariş kalemi
  - `prod` — bulunmuş `Product` nesnesi
  - `addToCart` — sepet ekleme fonksiyonu (dışarıdan import)
  - `router` — yönlendirme, sepet sayfasına gitmek için
  - `toast` — başarı/başarısızlık toast’ları
  - `t` — i18n çeviri fonksiyonu
- **Dönüş**: yok (yan etki: sepet güncellemesi, toast, yönlendirme)

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::statusColor
- **params**: `status: string`
- **ic_degiskenler**:
  - `status` — sipariş durumu, küçük harfe dönüştürülür
- **Dönüş**: CSS sınıfı string (renk‑arka plan kombinasyonu)

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::statusText
- **params**: `status: string`
- **ic_degiskenler**:
  - `status` — sipariş durumu, küçük harfe dönüştürülür
  - `t` — i18n çeviri fonksiyonu, durum metinlerini döndürür
- **Dönüş**: Çevirilmiş durum metni string

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::stepRenderer
- **params**: `s, idx`
- **ic_degiskenler**:
  - `s` — adım etiketi (status string)
  - `idx` — adım indeksi
  - `activeIdx` — mevcut aktif adım indeksi (component state)
  - `getStatusText` — dışarıdan gelen fonksiyon, `s` için metin döndürür
  - `steps` — adım dizisi (component state)
- **Dönüş**: JSX fragment (step göstergesi)

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::tabButtonRenderer
- **params**: `tt`
- **ic_degiskenler**:
  - `tt` — sekme anahtarı (`overview`, `items`, `shipping`, `invoice`)
  - `tab` — seçili sekme (component state)
  - `setTab` — sekme değiştirici
  - `t` — i18n çeviri fonksiyonu, sekme başlıklarını döndürür
- **Dönüş**: JSX button elementi

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::addressRenderer
- **params**: (none)
- **ic_degiskenler**:
  - `order` — component state, sipariş nesnesi
  - `addr` — `order.shipping_address` cast edilmiş `ShippingAddress`
  - `line1` — adresin birinci satırı (fullAddress veya street)
  - `line2` — şehir ve ilçe/state birleşimi
  - `line3` — posta kodu
- **Dönüş**: JSX `<div>` içinde adres satırları

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::orderItemRow
- **params**: `item`
- **ic_degiskenler**:
  - `item` — `OrderItem` nesnesi
  - `Routes` — URL helper, ürün detay linki üretir
  - `VentImage` — resim komponenti
  - `t` — i18n çeviri (no‑image metni)
  - `formatPrice` — fiyat formatlayıcı
- **Dönüş**: JSX `<tr>` satırı

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::invoiceInfoRenderer
- **params**: (none)
- **ic_degiskenler**:
  - `order` — component state
  - `info` — `order.invoice_info` cast edilmiş `Record<string, unknown>`
  - `iv` — yardımcı fonksiyon, bilgi alanını string’e çevirir veya `-` döndürür
  - `t` — i18n çeviri (alan etiketleri)
- **Dönüş**: JSX `<div>` içinde fatura bilgileri

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::legalConsentsRenderer
- **params**: (none)
- **ic_degiskenler**:
  - `order` — component state
  - `cons` — `order.legal_consents` cast edilmiş `Record<string, {accepted?: boolean; ts?: string | null}>`
  - `row` — iç fonksiyon, her bir onay satırını üretir (label, k)
  - `lang` — i18n dil kodu, tarih formatlamada kullanılır
  - `formatDateTime` — tarih‑saat formatlayıcı
  - `t` — i18n çeviri (toast mesajları)
- **Dönüş**: JSX fragment içinde onay satırları

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx::legalConsentRow
- **params**: `label: string, k: string`
- **ic_degiskenler**:
  - `cons` — dışarıdan kapanış (legalConsentsRenderer) erişilen onay nesnesi
  - `c` — `cons?.[k]` ilgili onay kaydı
  - `ok` — onayın kabul edilip edilmediği (boolean)
  - `ts` — onay zaman damgası, `formatDateTime` ile formatlanır
  - `lang` — dil kodu, tarih formatlamada kullanılır
- **Dönüş**: JSX `<div>` satırı (onay durumu gösterimi)

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