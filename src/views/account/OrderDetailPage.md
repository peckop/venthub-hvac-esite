---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx
skeleton_hash: 622dd4d11cb43f53
entity_hashes:
  func:OrderDetailPage: 9d9093210e07827e
  overview: 77f78a571695c8af
  style_tokens: 2d7ff3d6e2a546ab
generated_at: 2026-05-29T18:54:36Z
---

## Genel Bakış
Bu modül, kullanıcının tek bir siparişin tüm detaylarını görüntülemesini sağlayan bir React sayfa bileşenini içermektedir. Sipariş özeti, sipariş edilen ürünlerin listesi, ödeme ve teslimat bilgileri gibi unsurları düzenli bir arayüzde bir araya getirerek kullanıcıya sunmak temel sorumluluğudur.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve ana bileşenidir; tüm sayfa yapısını, alt bileşenleri ve gerekli veri akışını yöneterek sipariş detay sayfasını render eder.
- OrderDetailPage

---



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

### [N1_NASIL] AST Pointer: OrderDetailPage.tsx::useEffect_authGuard
- **params**: (parametre yok)
- **ic_degiskenler**: (useEffect callback içindeki anonymous arrow function)
- **Dönüş**: yok (useEffect side-effect, erişim yoksa login sayfasına yönlendirir)

### [N2_NASIL] AST Pointer: OrderDetailPage.tsx::useEffect_loadOrder
- **params**: (parametre yok)
- **ic_degiskenler**: (useEffect callback içindeki anonymous arrow function)
- **Dönüş**: yok (useEffect side-effect, sipariş verisini yükler ve `setOrder` ile state'i günceller)

### [N3_NASIL] AST Pointer: OrderDetailPage.tsx::load (useEffect içinde tanımlı)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `orderData` — supabase'den dönen sipariş ana verileri ve ilişkisel order_items (destructuring ile `data` ve `error` ayrıştırılır, `orderData` sipariş bilgilerini içerir)
  - `orderError` — supabase sorgusundan dönen hata nesnesi, null ise sorgu başarılıdır
  - `rawItems` — `orderData.venthub_order_items` değerinin `Record<string, unknown>[]` olarak cast edilmiş ham hali
  - `mappedItems` — `rawItems` dizisinin `.map()` ile `OrderItem[]` tipine dönüştürülmüş hali; her eleman için `id`, `product_id`, `product_name`, `quantity`, `unit_price`, `total_price`, `product_image_url` alanları çıkarılır
  - `unit` — her bir sipariş kaleminin `it.price_at_time` değerinin Number'a çevrilmiş birim fiyatı, `|| 0` ile varsayılan
  - `qty` — her bir sipariş kaleminin `it.quantity` değerinin Number'a çevrilmiş miktarı, `|| 0` ile varsayılan
  - `mappedOrder` — `Order` tipinde tam sipariş nesnesi; `orderData` alanlarından ve `mappedItems`'den oluşur, eksik alanlar `|| undefined` ile doldurulur
- **Dönüş**: yok (async function, `setOrder(mappedOrder)` ile state'i güncüler, `setLoading(false)` ile loading durumunu kapatır)

### [N4_NASIL] AST Pointer: OrderDetailPage.tsx::rawItems.map callback (it)
- **params**: `it` — `Record<string, unknown>` tipinde tek bir ham sipariş kalemi nesnesi
- **ic_degiskenler**:
  - `unit` — `it.price_at_time` değerinin Number'a çevrilmiş birim fiyatı
  - `qty` — `it.quantity` değerinin Number'a çevrilmiş miktarı
- **Dönüş**: `OrderItem` nesnesi — `{ id, product_id, product_name, quantity, unit_price, total_price, product_image_url }`

### [N5_NASIL] AST Pointer: OrderDetailPage.tsx::handleCopyToClipboard
- **params**: `text` — `string | undefined`, panoya kopyalanacak metin
- **ic_degiskenler**: (yok, tek satırlık try-catch bloğu)
- **Dönüş**: Promise<void> — `navigator.clipboard.writeText` ile metni panoya yazar, başarı/hata toast gösterir

### [N6_NASIL] AST Pointer: OrderDetailPage.tsx::handleDownloadProforma
- **params**: `o` — `Order` tipinde sipariş nesnesi
- **ic_degiskenler**:
  - `jsPDF` — dinamik import ile yüklenen `jspdf` modülünün default export'u (PDF oluşturma sınıfı)
  - `autoTable` — dinamik import ile yüklenen `jspdf-autotable` modülünün default export'u (tablo ekleme fonksiyonu)
  - `doc` — `jsPDF` instance'ı, A4 boyutunda `pt` birimiyle oluşturulmuş PDF dokümanı
  - `nf` — `Intl.NumberFormat` instance'ı, dil ayarına göre TRY para birimi formatlayıcı
  - `orderNo` — sipariş numarası; `o.order_number` varsa `'-'` ile split edilip ikinci eleman, yoksa `o.id`'nin son 8 karakteri büyük harfe çevrilmiş
  - `head` — autoTable için tablo başlık satırı dizisi: `[['Ürün', 'Adet', 'Birim Fiyat', 'Toplam']]` formunda i18n çeviri anahtarları ile
  - `body` — `o.order_items` dizisinin `.map()` ile tablo satırlarına dönüştürülmüş hali; her satır `[product_name, quantity, unit_price, total_price]` formatında string değerler
  - `after` — autoTable'ın `lastAutoTable.finalY` değerinden hesaplanan tablonun bitiş Y koordinatı, `|| 100` ile varsayılan
- **Dönüş**: Promise<void> — `doc.save()` ile PDF dosyasını indirir, hata olursa toast gösterir

### [N7_NASIL] AST Pointer: OrderDetailPage.tsx::handleReorder
- **params**: `o` — `Order` tipinde sipariş nesnesi
- **ic_degiskenler**:
  - `ids` — `o.order_items` dizisinden `product_id` değerlerinin `Set` ile benzersizleştirilip `string[]`'e dönüştürülmüş hali; `undefined` olanlar filtrelenir
  - `names` — `product_id`'si olmayan ama `product_name`'i olan sipariş kalemlerinden benzersiz ürün isimleri dizisi
  - `productMap` — `Record<string, Product>` tipinde; ürün ID'si veya adına göre `Product` nesnelerini eşleyen harita
  - `data` — supabase'den dönen `products` tablosu verisi (ID ile sorgulamada)
  - `error` — supabase sorgusundan dönen hata nesnesi (ID ile sorgulamada)
  - `data` — supabase'den dönen `products` tablosu verisi (isim ile sorgulamada)
  - `error` — supabase sorgusundan dönen hata nesnesi (isim ile sorgulamada)
  - `added` — sepete eklenen toplam ürün adedi sayacı, başlangıçta 0
  - `prod` — döngü içinde her sipariş kalemi için bulunan `Product` nesnesi veya `undefined`
  - `it` — `o.order_items` dizisindeki her bir sipariş kalemi (`OrderItem`)
- **Dönüş**: Promise<void> — sepette ürün varsa `addToCart` ile ekler ve `/cart` sayfasına yönlendirir, yoksa hata toast'u gösterir

### [N8_NASIL] AST Pointer: OrderDetailPage.tsx::getStatusColorClass
- **params**: `status` — `string` tipinde sipariş durumu değeri
- **ic_degiskenler**: (yok, switch-case bloğu)
- **Dönüş**: `string` — Tailwind CSS renk sınıfı (ör: `'bg-yellow-100 text-yellow-800'`)

### [N9_NASIL] AST Pointer: OrderDetailPage.tsx::getStatusText
- **params**: `status` — `string` tipinde sipariş durumu değeri
- **ic_degiskenler**: (yok, switch-case bloğu)
- **Dönüş**: `string` — i18n çeviri ile insan-okunabilir sipariş durumu metni (ör: `'Sipariş Alındı'`, `'Kargoya Verildi'`)

### [N10_NASIL] AST Pointer: OrderDetailPage.tsx::renderStep (JSX callback)
- **params**: `s` — adım durumu string'i (sipariş durumu), `idx` — adım indeksi (number)
- **ic_degiskenler**: (yok, doğrudan JSX döndürür)
- **Dönüş**: `React.Fragment` — sipariş takip adımını gösteren JSX; adım numarası, durum metni ve bağlayıcı çizgi

### [N11_NASIL] AST Pointer: OrderDetailPage.tsx::renderTabButton (JSX callback)
- **params**: `tt` — tab anahtarı string'i (ör: `'overview'`, `'items'`, `'shipping'`, `'invoice'`)
- **ic_degiskenler**: (yok, doğrudan JSX döndürür)
- **Dönüş**: `JSX.Element` — tab seçme butonu; aktif/pasif duruma göre stil değişir, tıklanınca `setTab(tt)` çağırır

### [N12_NASIL] AST Pointer: OrderDetailPage.tsx::renderShippingAddress (JSX callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `addr` — `order.shipping_address` değerinin `ShippingAddress` tipine cast edilmiş hali
  - `line1` — `addr.fullAddress` veya `addr.street` değerinden oluşan birinci adres satırı
  - `line2` — `addr.city` ve `addr.district || addr.state` değerlerinin `', '` ile birleştirilmiş ikinci adres satırı
  - `line3` — `addr.postalCode || addr.postal_code` değerinden oluşan posta kodu satırı
- **Dönüş**: `JSX.Element` — adres bilgilerini `<p>` etiketleri içinde gösteren div

### [N13_NASIL] AST Pointer: OrderDetailPage.tsx::renderOrderItemRow (JSX callback)
- **params**: `item` — `OrderItem` tipinde tek bir sipariş kalemi
- **ic_degiskenler**: (yok, doğrudan JSX döndürür; `item.product_id`, `item.product_name`, `item.product_image_url`, `item.quantity`, `item.unit_price`, `item.total_price` erişimleri)
- **Dönüş**: `JSX.Element` — `<tr>` satırı; ürün adı (link veya düz metin), görsel (`VentImage` veya placeholder), adet, birim fiyat, toplam fiyat

### [N14_NASIL] AST Pointer: OrderDetailPage.tsx::renderInvoiceInfo (JSX callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `info` — `order.invoice_info` değerinin `Record<string, unknown>` tipine cast edilmiş hali, `{}` ile fallback
  - `iv` — helper fonksiyon; verilen key ile `info` nesnesinden string değer çeker, yoksa `'-'` döner
- **Dönüş**: `JSX.Element` — fatura bilgilerini gösteren div; kurumsal ise şirket adı/VKN/vergi dairesi, bireysel ise TCKN

### [N15_NASIL] AST Pointer: OrderDetailPage.tsx::renderLegalConsents (JSX callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `cons` — `order.legal_consents` değerinin `Record<string, { accepted?: boolean; ts?: string | null }>` tipine cast edilmiş hali
  - `row` — iç helper fonksiyon; `(label: string, k: string)` alır, yasal onay durumunu JSX olarak döndürür
    - `c` — `cons?.[k]` ile çekilen tek bir yasal onay nesnesi (`{ accepted, ts }`)
    - `ok` — `c?.accepted` değerinin boolean'a çevrilmiş hali
    - `ts` — `c?.ts` varsa `formatDateTime` ile formatlanmış zaman damgası, yoksa `'-'`
- **Dönüş**: `JSX.Element` — KVKK, Mesafeli Satış, Ön Bilgilendirme, Sipariş Onayı, Pazarlama İzni onaylarının herbirini gösteren Fragment

### [N16_NASIL] AST Pointer: OrderDetailPage.tsx::renderLegalConsentRow (label helper)
- **params**: `label` — `string` (gösterilecek etiket metni, ör: `'KVKK'`), `k` — `string` (legal_consents nesnesindeki key, ör: `'kvkk'`)
- **ic_degiskenler**:
  - `c` — `cons?.

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