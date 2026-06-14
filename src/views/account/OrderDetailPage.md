---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx
skeleton_hash: 5bdff96bddcc93df
entity_hashes:
  func:OrderDetailPage: 5e57eb0eff35cc51
  overview: bc0630e1d37a5249
  style_tokens: 2d7ff3d6e2a546ab
generated_at: 2026-06-14T17:25:21Z
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
**Ne yapar**: Bu fonksiyon, kullanıcının belirli bir siparişinin detaylarını görüntülemek için kullanılan React bileşenidir. Siparişin genel bilgilerini, ürünlerini, kargo durumunu ve fatura bilgilerini sekmeli bir arayüzde sunar.

**Nasıl yapar**: 
- URL arama parametrelerinden sipariş ID'sini alır (useSearchParams).
- Kimlik doğrulama durumunu kontrol eder ve giriş yapılmamışsa yönlendirir (useAuth).
- Supabase veritabanından sipariş verisini ve ilişkili sipariş kalemlerini tek bir sorguyla çeker (relational query).
- Ham verileri `Order` ve `OrderItem` tiplerine dönüştürür.
- Sipariş durumuna göre renkli etiketler ve ilerleme çubuğu oluşturur.
- PDF fatura oluşturmak için jspdf ve jspdf-autotable kütüphanelerini dinamik olarak import eder.
- "Yeniden Sipariş" işlevi, mevcut sipariş ürünlerini sepete eklemek için veritabanından ürün bilgilerini çeker.
- Dil ve para birimi formatı için useI18n ve formatCurrency/formatDateTime yardımcı fonksiyonlarını kullanır.
- Sekmeli arayüz (overview, items, shipping, invoice) için aktif sekmeyi state ile yönetir.

**Parametreler**:
Bu bir React bileşen fonksiyonu olduğu için doğrudan parametre almaz. Ancak şu hook'ları kullanarak iç bağımlılıkları çözer:
- `useSearchParams()`: URL'den `id` parametresini alır.
- `useAuth()`: Kullanıcı oturum durumunu ve bilgilerini getirir.
- `useRouter()`: Sayfa yönlendirmeleri için.
- `useI18n()`: Çoklu dil desteği için çeviri ve dil bilgisi.
- `useCart()`: Sepet ekleme işlevi için.

**Dönüş**: JSX yapısı döndürür (React.ReactNode). Yüklenme durumunda animasyonlu bir spinner, sipariş yüklendiğinde ise detaylı siparişsayfasını render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useCartHook::useCart
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDateTime
- import: ../../i18n/format::formatCurrency
- import: ../../utils/routes::Routes
- import: @/components/ui/VentImage::VentImage
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/ui-models::type { Product }
- import: next/link::Link
- import: next/navigation::useRouter
- import: next/navigation::useSearchParams
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

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

### [N1_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::auth_check
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `authLoading` — useAuth hook'undan gelen, kimlik doğrulama durumunun yüklenip yüklenmediğini belirten boolean.
  - `user` — useAuth hook'undan gelen, oturum açmış kullanıcı nesnesi (null olabilir).
  - `id` — useSearchParams'den alınan, URL'deki sipariş ID parametresi.
  - `router` — useRouter hook'undan gelen Next.js router nesnesi, yönlendirme için kullanılır.
- **Dönüş**: yok (side-effect: kullanıcı giriş yapmamışsa `router.push` ile yönlendirme yapar ve fonksiyonu return ile sonlandırır).

### [N2_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::loadOrder
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen, oturum açmış kullanıcı nesnesi.
  - `id` — useSearchParams'den alınan, URL'deki sipariş ID parametresi.
  - `setLoading` — useState hook'undan gelen, loading durumunu güncelleyen setter.
  - `orderData` — supabase.from('venthub_orders').select().eq('id', id).single() sorgusundan dönen, sipariş ana verilerini ve ilişkili kalemleri içeren nesne.
  - `orderError` — supabase sorgusundan dönen hata nesnesi (null olabilir).
  - `rawItems` — orderData.venthub_order_items alanının Record<string, unknown>[] tipinde ham verisi, varsayılan boş dizi.
  - `mappedItems` — rawItems dizisinin her bir elemanını OrderItem[] formatına dönüştüren map işlemi sonucu oluşan dizi.
  - `unit` — Bir sipariş kaleminin (it) price_at_time alanının Number tipine çevrilmiş değeri, 0 varsayılır.
  - `qty` — Bir sipariş kaleminin (it) quantity alanının Number tipine çevrilmiş değeri, 0 varsayılır.
  - `mappedOrder` — Sipariş verilerini ve dönüştürülmüş kalemleri Order arayüzüne uygun hale getiren nesne.
  - `setOrder` — useState hook'undan gelen, Order tipindeki state'i güncelleyen setter.
  - `t` — i18n çeviri fonksiyonu.
  - `e` — catch bloğunda yakalanan hata nesnesi.
- **Dönüş**: yok (side-effect: supabase'den sipariş çeker, state'i günceller, hata durumunda toast gösterir).

### [N3_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::mapOrderItem
- **params**: `(it: Record<string, unknown>)`
- **ic_degiskenler**:
  - `unit` — it.price_at_time alanının Number tipine çevrilmiş değeri, 0 varsayılır.
  - `qty` — it.quantity alanının Number tipine çevrilmiş değeri, 0 varsayılır.
- **Dönüş**: `Object` (OrderItem formatında: id, product_id, product_name, quantity, unit_price, total_price, product_image_url).

### [N4_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::copyToClipboard
- **params**: `(text?: string)`
- **ic_degiskenler**: yok
- **Dönüş**: `Promise<void>` (side-effect: text varsa navigator.clipboard.writeText ile panoya yazar, başarılı/hatasız toast gösterir).

### [N5_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::generatePdf
- **params**: `(o: Order)`
- **ic_degiskenler**:
  - `jsPDF` — Promise.all ile dinamik import edilen jsPDF modülü.
  - `autoTable` — Promise.all ile dinamik import edilen jspdf-autotable modülü.
  - `doc` — jsPDF kütüphanesinden oluşturulan PDF doküman nesnesi.
  - `nf` — Intl.NumberFormat ile oluşturulmuş, dil ve para birimi formatlayıcı.
  - `orderNo` — o.order_number varsa onun ikinci parçası ('-' karakterinden sonraki), yoksa o.id'nin son 8 karakteri büyük harfle.
  - `head` — autoTable için tablo başlık satırı dizisi.
  - `body` — o.order_items dizisinin her bir elemanını autoTable formatına (product_name, quantity, unit_price, total_price) dönüştüren map işlemi sonucu oluşan dizi.
  - `after` — autoTable'ın çizdiği tablonun bitiş Y koordinatı (doc.lastAutoTable.finalY).
  - `lang` — useTranslation hook'undan gelen mevcut dil kodu.
  - `t` — i18n çeviri fonksiyonu.
  - `formatDateTime` — Tarihleri belirli bir dile göre formatlayan yardımcı fonksiyon.
  - `e` — catch bloğunda yakalanan hata nesnesi.
- **Dönüş**: `Promise<void>` (side-effect: jspdf ve jspdf-autotable kütüphanelerini dinamik import eder, proforma PDF'i oluşturur ve `doc.save` ile indirir).

### [N6_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::reorderItems
- **params**: `(o: Order)`
- **ic_degiskenler**:
  - `ids` — o.order_items dizisinden product_id'leri toplayıp benzersiz ve tanımlı olanları (string) tutan Set, ardından diziye dönüştürülmüş hali.
  - `names` — o.order_items dizisinden product_id'si olmayıp product_name'i olan ürünlerin adlarını benzersiz tutan Set, ardından diziye dönüştürülmüş hali.
  - `productMap` — Ürünleri ID'ye ve isme göre eşleştiren Record<string, Product> sözlüğü.
  - `data` — supabase.from('products').select() sorgusundan delen ürünlerin verisi.
  - `error` — supabase sorgusundan dönen hata nesnesi (null olabilir).
  - `added` — Sepete eklenen toplam ürün sayacısı, başlangıçta 0.
  - `it` — o.order_items dizisinin her bir elemanı (sipariş kalemi).
  - `prod` — it.product_id veya it.product_name ile productMap'ten bulunan Ürün nesnesi (Product veya undefined).
  - `addToCart` — useCart hook'undan gelen, ürünü sepete ekleyen fonksiyon.
  - `router` — useRouter hook'undan gelen Next.js router nesnesi.
  - `t` — i18n çeviri fonksiyonu.
  - `e` — catch bloğunda yakalanan hata nesnesi.
- **Dönüş**: `Promise<void>` (side-effect: siparişteki ürünleri supabase'den çeker, bulunabilenleri sepete ekler, başarılı/hatasız toast gösterir ve sepet sayfasına yönlendirir).

### [N7_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::getStatusBadgeClass
- **params**: `(status: string)`
- **ic_degiskenler**: yok
- **Dönüş**: `string` (Tailwind CSS renk class'ları içeren, duruma göre arka plan ve metin rengi belirleyen dize).

### [N8_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::getStatusText
- **params**: `(status: string)`
- **ic_degiskenler**:
  - `t` — i18n çeviri fonksiyonu.
- **Dönüş**: `string` (Duruma karşılık gelen çevrilmiş metin).

### [N9_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::renderStep
- **params**: `(s: string, idx: number)`
- **ic_degiskenler**:
  - `getStatusText` — Durum string'ini çevrilmiş metne dönüştüren N8_NASIL pointer'ındaki fonksiyon.
  - `steps` — Sipariş durumu adımlarını (s, pending, shipped, delivered vb.) içeren dizi.
  - `activeIdx` — Siparişin mevcut durumunun steps dizisindeki indeksi.
- **Dönüş**: `JSX.Element` (Sipariş durumu adımını gösteren React bileşeni).

### [N10_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::renderTabButton
- **params**: `(tt: string)`
- **ic_degiskenler**:
  - `setTab` — useState hook'undan gelen, aktif sekme state'ini güncelleyen setter.
  - `tab` — Aktif sekmenin adını tutan state.
  - `t` — i18n çeviri fonksiyonu.
- **Dönüş**: `JSX.Element` (Tek bir sekme butonunu gösteren React bileşeni).

### [N11_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::renderShippingAddress
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `order` — OrderDetailPage bileşeninin state'indeki sipariş nesnesi.
  - `addr` — order.shipping_address alanının ShippingAddress tipine cast edilmiş hali.
  - `line1` — Tam adres satırı (fullAddress veya street).
  - `line2` - İl ve ilçe/distrik bilgisi (city, district veya state).
  - `line3` — Posta kodu.
- **Dönüş**: `JSX.Element` (Siparişin kargo adresini gösteren React bileşeni).

### [N12_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::renderOrderItem
- **params**: `(item: OrderItem)`
- **ic_degiskenler**:
  - `formatPrice` — Fiyatları formatlayan yardımcı fonksiyon.
  - `t` — i18n çeviri fonksiyonu.
  - `Routes` — Next.js Link'leri için rota nesnesi.
- **Dönüş**: `JSX.Element` (Tek bir sipariş kalemini tablo satırı olarak gösteren React bileşeni).

### [N13_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::renderInvoiceInfo
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `order` — OrderDetailPage bileşeninin state'indeki sipariş nesnesi.
  - `info` — order.invoice_info alanının Record<string, unknown> tipine cast edilmiş hali.
  - `iv` — info sözlüğünden belirli bir anahtarın (k) değerini güvenli bir şekilde String'e çevirip veya '-' döndüren yardımcı fonksiyon.
  - `t` — i18n çeviri fonksiyonu.
- **Dönüş**: `JSX.Element` (Siparişin fatura bilgilerini (bireysel/kurumsal) gösteren React bileşeni).

### [N14_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::renderLegalConsents
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `order` — OrderDetailPage bileşeninin state'indeki sipariş nesnesi.
  - `cons` — order.legal_consents alanının Record<string, { accepted?: boolean; ts?: string | null }> tipine cast edilmiş hali.
  - `row` — Belirli bir yasal onay satırını (label ve anahtar ile) render eden iç fonksiyon (N15_NASIL pointer'ı).
  - `t` — i18n çeviri fonksiyonu.
  - `formatDateTime` — Tarihleri belirli bir dile göre formatlayan yardımcı fonksiyon.
- **Dönüş**: `JSX.Element` (Siparişin yasal onay durumlarını (KVKK, mesafeli satış vb.) gösteren React bileşeni).

### [N15_NASIL] AST Pointer: src\views\account\OrderDetailPage.tsx::renderConsentRow
- **params**: `(label: string, k: string)`
- **ic_degiskenler**:
  - `cons` — N14_NASIL pointer'ındaki yasal onay sözlüğü.
  - `c` — cons[k] değerinden gelen belirli bir onay nesnesi.
  - `ok` — c.accepted değerinin boolean karşılığı.
  - `ts` — c.ts tarih damgasının formatlanmış hali veya '-'
  - `t` — i18n çeviri fonksiyonu.
  - `formatDateTime` — Tarihleri belirli bir dile göre formatlayan yardımcı fonksiyon.
- **Dönüş**: `JSX.Element` (Tek bir yasal onay durumunu (etiket, onay durumu ve zaman damgası) gösteren React bileşeni).

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