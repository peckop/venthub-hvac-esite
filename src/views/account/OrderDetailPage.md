---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx
skeleton_hash: 673be00e9d2490b5
entity_hashes:
  func:OrderDetailPage: 9d9093210e07827e
  overview: bc0630e1d37a5249
  style_tokens: 2d7ff3d6e2a546ab
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
Bu modül, kullanıcının hesap panelinden erişebildiği tek bir siparişin tüm detaylarını gösteren bir React sayfa bileşenidir. Sipariş özeti, ürünler, ödeme bilgileri ve teslimat durumu gibi bilgileri düzenli bir arayüzde sunarak kullanıcıya siparişinin tamamını tek bir sayfada inceleme imkânı sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Tek bir bileşenden oluşan modülün tamamını temsil eder; sipariş verisini alır, sayfa düzenini oluşturur ve ilgili alt bileşenleri bir araya getirerek sipariş detay sayfasını kullanıcıya render eder.
- OrderDetailPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi (implementation body) sağlanmadığından, yalnızca fonksiyon imzasından çıkarılabilecek mimari varsayımlar aşağıda sunulmuştur.

[Aksiyom 1]: Eğer OrderDetailPage bileşeni bir sipariş detay sayfası olarak render edilecekse, ilgili siparişin benzersiz tanımlayıcısı (ID) bir yol parametresi (URL param) veya state aracılığıyla sağlanmalıdır. Böyle bir tanımlayıcı yoksa, hangi siparişin detayının gösterileceği belirsiz olur ve bileşen anlamlı bir içerik üretemez.

[Aksiyom 2]: Eğer OrderDetailPage bileşeni sipariş verilerini bir API'den çekiyorsa, bu istek gerçekleştirilmeden önce ilgili sipariş tanımlayıcısının mevcut ve geçerli bir değer aldığından emin olunmalıdır. Geçersiz veya eksik bir tanımlayıcı ile istek gönderilmeye çalışılırsa, hata yönetimi mekanizması devreye girmeli veya kullanıcıya uygun bir geri bildirim sunulmalıdır.

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

### [N1_NASIL] AST Pointer: OrderDetailPage::authGuardEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `authLoading` — authentication durumu yükleniyor mu (outer scope'tan gelir)
  - `user` — mevcut kullanıcı nesnesi (outer scope'tan gelir)
  - `router` — Next.js router instance (outer scope'tan gelir)
  - `id` — URL'den gelen sipariş ID'si (outer scope'tan gelir)
- **Dönüş**: yok (yan etki: router.push ile yönlendirme yapar)

### [N2_NASIL] AST Pointer: OrderDetailPage::orderLoadEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — mevcut kullanıcı nesnesi (outer scope'tan gelir)
  - `id` — URL'den gelen sipariş ID'si (outer scope'tan gelir)
  - `load` — asenkron sipariş yükleme fonksiyonu (içeride tanımlı)
- **Dönüş**: yok (yan etki: load fonksiyonunu çağırır)

### [N3_NASIL] AST Pointer: OrderDetailPage::loadOrder
- **params**: (parametre yok, closure'dan user ve id kullanır)
- **ic_degiskenler**:
  - `user` — mevcut kullanıcı nesnesi (outer scope'tan gelir)
  - `id` — URL'den gelen sipariş ID'si (outer scope'tan gelir)
  - `orderData` — supabase'den dönen sipariş verisi (data)
  - `orderError` — supabase sorgu hatası (error)
  - `rawItems` — ham sipariş kalemleri dizisi (Record<string, unknown>[] tipinde)
  - `mappedItems` — dönüştürülmüş OrderItem dizisi
  - `mappedOrder` — tam Order nesnesi
- **Dönüş**: yok (yan etki: setOrder ile state günceller)

### [N4_NASIL] AST Pointer: OrderDetailPage::mapRawItemToOrderItem
- **params**: `it` — ham sipariş kalemi (Record<string, unknown> tipinde)
- **ic_degiskenler**:
  - `unit` — birim fiyat (it.price_at_time'dan Number ile dönüştürülür)
  - `qty` — miktar (it.quantity'dan Number ile dönüştürülür)
- **Dönüş**: OrderItem nesnesi (id, product_id, product_name, quantity, unit_price, total_price, product_image_url alanlarını içerir)

### [N5_NASIL] AST Pointer: OrderDetailPage::copyToClipboard
- **params**: `text` — kopyalanacak metin (opsiyonel string)
- **ic_degiskenler**: yok
- **Dönüş**: yok (yan etki: navigator.clipboard.writeText ile panoya yazar, toast gösterir)

### [N6_NASIL] AST Pointer: OrderDetailPage::generateProformaPDF
- **params**: `o` — PDF oluşturulacak Order nesnesi
- **ic_degiskenler**:
  - `jsPDF` — jsPDF sınıfı (dynamic import ile yüklenir)
  - `autoTable` — jspdf-autotable fonksiyonu (dynamic import ile yüklenir)
  - `doc` — jsPDF doküman instance'ı (A4 formatında, pt birimi)
  - `nf` — Intl.NumberFormat instance'ı (para birimi formatlama için)
  - `orderNo` — proforma numarası (o.order_number'dan türetilir veya ID'den üretilir)
  - `head` — tablo başlık satırı (t() ile çevrilmiş sütun isimleri)
  - `body` — tablo gövde satırları (o.order_items'dan map ile dönüştürülür)
  - `after` — tablonun bittiği Y koordinatı (doc.lastAutoTable.finalY)
- **Dönüş**: yok (yan etki: PDF dosyası indirir)

### [N7_NASIL] AST Pointer: OrderDetailPage::reorderItems
- **params**: `o` — yeniden sipariş edilecek Order nesnesi
- **ic_degiskenler**:
  - `ids` — benzersiz product_id'ler dizisi (o.order_items'dan filtrelenmiş)
  - `names` — benzersiz product_name'ler dizisi (product_id olmayan kalemlerden)
  - `productMap` — ürün ID/name -> Product eşlemesi (Record<string, Product>)
  - `data` — supabase'den dönen ürün verisi
  - `error` — supabase sorgu hatası
  - `added` — sepete eklenen toplam ürün miktarı
  - `prod` — mevcut ürün nesnesi (Product | undefined)
- **Dönüş**: yok (yan etki: addToCart ile sepete ekler, router.push ile sepete yönlendirir)

### [N8_NASIL] AST Pointer: OrderDetailPage::getStatusColorClass
- **params**: `status` — sipariş durum metni (string)
- **ic_degiskenler**: yok
- **Dönüş**: string (Tailwind CSS class adı, duruma göre renk)

### [N9_NASIL] AST Pointer: OrderDetailPage::getStatusText
- **params**: `status` — sipariş durum metni (string)
- **ic_degiskenler**: yok
- **Dönüş**: string (çevrilmiş durum metni, t() ile)

### [N10_NASIL] AST Pointer: OrderDetailPage::renderStepIndicator
- **params**: `s` — adım durumu (string), `idx` — adım indeksi (number)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (adım gösterge bileşeni)

### [N11_NASIL] AST Pointer: OrderDetailPage::renderTabButton
- **params**: `tt` — tab adı (string)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (tab butonu bileşeni)

### [N12_NASIL] AST Pointer: OrderDetailPage::renderShippingAddress
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `addr` — shipping_address nesnesi (order.shipping_address'ten ShippingAddress'e cast)
  - `line1` — adres satırı 1 (addr.fullAddress veya addr.street)
  - `line2` — adres satırı 2 (il/ilçe, virgülle birleştirilmiş)
  - `line3` — posta kodu (addr.postalCode veya addr.postal_code)
- **Dönüş**: JSX.Element (adres gösterim bileşeni)

### [N13_NASIL] AST Pointer: OrderDetailPage::renderOrderItemRow
- **params**: `item` — sipariş kalemi (OrderItem tipinde)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (tablo satırı bileşeni)

### [N14_NASIL] AST Pointer: OrderDetailPage::renderInvoiceInfo
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `info` — fatura bilgileri nesnesi (order.invoice_info'tan Record<string, unknown>'a cast)
  - `iv` — yardımcı fonksiyon, bilgi değerini string'e çevirir veya '-' döner
- **Dönüş**: JSX.Element (fatura bilgisi gösterim bileşeni)

### [N15_NASIL] AST Pointer: OrderDetailPage::renderLegalConsents
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `cons` — yasal onay nesnesi (order.legal_consents'tan Record<string, {accepted?: boolean; ts?: string | null}> 'a cast)
  - `row` — yardımcı fonksiyon, her onay satırını JSX'e dönüştürür
- **Dönüş**: JSX.Element (yasal onay gösterim bileşeni)

### [N16_NASIL] AST Pointer: OrderDetailPage::renderConsentRow
- **params**: `label` — onay etiketi (string), `k` — onay anahtarı (string)
- **ic_degiskenler**:
  - `cons` — yasal onay nesnesi (outer scope'tan gelir)
  - `c` — belirli bir onay nesnesi (cons?.[k])
  - `ok` — onay durumu boolean (c?.accepted)
  - `ts` — onay zaman damgası (c?.ts, formatDateTime ile formatlanmış veya '-')
- **Dönüş**: JSX.Element (tek bir onay satırı gösterim bileşeni)

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