---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\PaymentSuccessPage.tsx
skeleton_hash: 1bec43a9d884913e
entity_hashes:
  func:PaymentSuccessPage: 1b3614ca0faf5f01
  overview: af5b78ab3c363714
  style_tokens: dcab201fde8662b7
generated_at: 2026-08-25T07:29:55Z
---

## Genel Bakış
PaymentSuccessPage modülü, ödeme işlemi başarıyla tamamlandığında kullanıcıya gösterilen sayfa bileşenini içerir. Modül, tek bir React fonksiyonel bileşeninden oluşur.

## Fonksiyon Grupları

### Sayfa Bileşeni
Ödeme başarı durumunu kullanıcıya sunan ana bileşeni tanımlar.
- PaymentSuccessPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediğinden (yalnızca imza `PaymentSuccessPage() -> React.FC` mevcut), modül sabitleri bulunmadığından ve eski doküman olmadığından, fonksiyon gövdesinden türetilebilecek mimari varsayım üretilememektedir.

---

## FONKSİYON DETAYLARI

### PaymentSuccessPage
**Ne yapar**: `React.FC` tipinde bir React fonksiyonel bileşeni döndüren bir üst düzey fonksiyondur. Fonksiyon adı, ödeme başarılı sayfası bileşeni olduğunu ima etmektedir ancak docstring boş bırakıldığı için kesin işlevi kaynakta belirtilmemiştir.

**Nasıl yapar**: Kaynakta bu fonksiyonun iç mantığına dair herhangi bir bilgi verilmemiştir. Docstring alanı boş olduğundan uygulama detayları bilinmemektedir.

**Parametreler**:
- Kaynakta herhangi bir parametre tanımı belirtilmemiştir.

**Dönüş**: `React.FC` — React fonksiyonel bileşen tipinde bir değer döndürür. `React.FC`, React kütüphanesinde fonksiyonel bileşen tanımlamak için kullanılan genel tip ipucudur.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useCartHook::useCart
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../i18n/currency::SYSTEM_CURRENCY
- import: ../i18n/datetime::formatDateTime
- import: ../i18n/format::formatCurrency
- import: ../lib/errorReporter::reportError
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::AlertCircle
- import: lucide-react::CheckCircle
- import: lucide-react::Loader
- import: lucide-react::ShieldCheck
- import: next/link::Link
- import: next/navigation::useSearchParams
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## TYPE ALIASES

### PaymentInfo
```typescript
type PaymentInfo = { conversationId?: string; token?: string; errorMessage?: string }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/PaymentSuccessPage.tsx::PaymentSuccessPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `searchParams` — `useSearchParams()` hook'undan dönen URL arama parametreleri nesnesi; `conversationId`, `token`, `errorMessage`, `orderId`, `status` gibi query string değerlerini okumak için kullanılır
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; UI metinlerini yerelleştirmek için kullanılır
  - `lang` — `useI18n()` hook'undan dönen dil kodu; tarih/saat ve para birimi formatlamasına iletilir
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen yönlendirme fonksiyonları nesnesi; `Routes.checkout()`, `Routes.cart()`, `Routes.account.orderDetail()` gibi metotlarla sayfa bağlantıları oluşturulur
  - `clearCart` — `useCart()` hook'undan dönen sepet temizleme fonksiyonu; ödeme başarıyla doğrulandığında `{ silent: true }` argümanıyla çağrılır
  - `status` — `useState<'loading' | 'success' | 'error'>('loading')` ile tutulan ödeme doğrulama durumu; bileşenin hangi JSX bloğunu render edeceğini belirler
  - `setStatus` — `status` state'ini güncelleyen setter fonksiyonu; `'loading'`, `'success'` veya `'error'` değerlerine set edilir
  - `paymentInfo` — `useState<PaymentInfo | null>(null)` ile tutulan ödeme bilgisi nesnesi; `conversationId`, `token` veya `errorMessage` alanlarını içerir
  - `setPaymentInfo` — `paymentInfo` state'ini güncelleyen setter fonksiyonu; başarılı durumda `{ conversationId, token }`, hata durumunda `{ errorMessage }` atanır
  - `orderSummary` — `useState<{ amount?: number, items?: number, createdAt?: string }>({})` ile tutulan sipariş özeti; veritabanından çekilen toplam tutar, kalem sayısı ve oluşturulma tarihini barındırır
  - `setOrderSummary` — `orderSummary` state'ini güncelleyen setter fonksiyonu; `fetchOrderDetails` içinde veritabanı sonucundan beslenir
- **Dönüş**: JSX elementi — `status` değerine göre üç farklı görünüm döndürür: `'loading'` durumunda yükleme spinner'ı, `'error'` durumunda hata mesajı ve yeniden deneme bağlantıları, `'success'` durumunda sipariş özeti ve sipariş detay bağlantısı

### [N2_NASIL] AST Pointer: src/views/PaymentSuccessPage.tsx::useEffect callback (anonim)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `conversationId` — `searchParams?.get('conversationId')` ile URL'den okunan ödeme konuşma tanımlayıcısı; `undefined` ise atanır, `verify` içinde `paymentInfo.conversationId` olarak kullanılır
  - `token` — `searchParams?.get('token')` ile URL'den okunan iyzico ödeme token'ı; `undefined` ise atanır, `verify` içinde iyzico callback fonksiyonuna gönderilir
  - `errorMessage` — `searchParams?.get('errorMessage')` ile URL'den okunan hata mesajı; `undefined` ise atanır, `verify` içinde hata durumunda kullanıcıya gösterilir
  - `orderId` — `searchParams?.get('orderId')` ile URL'den okunan sipariş tanımlayıcısı; `undefined` ise atanır, `verify` içinde veritabanı sorgusu ve callback tetikleme için kullanılır
  - `statusParam` — `searchParams?.get('status')` ile URL'den okunan durum parametresi; `'success'` değeri varsa doğrudan başarı kabul edilir
  - `fetchOrderDetails` — `oid` parametresiyle çağrılan async iç fonksiyon; `venthub_orders` tablosundan `total_amount`, `created_at` ve ilişkili `venthub_order_items(quantity)` verilerini çekip `setOrderSummary` ile state'i günceller
  - `verify` — async iç fonksiyon; ödeme doğrulama akışını yürütür (statusParam kontrolü → token doğrulama → orderId ile veritabanı kontrolü → hata işleme)
- **Dönüş**: yok — yan etki odaklıdır; `status` ve `paymentInfo` state'lerini günceller, sepeti temizler, localStorage anahtarlarını yönetir, toast bildirimleri gösterir

### [N3_NASIL] AST Pointer: src/views/PaymentSuccessPage.tsx::fetchOrderDetails
- **params**: `oid` — opsiyonel string; sipariş ID'si, `undefined` ise fonksiyon erken döner
- **ic_degiskenler**:
  - `data` — `supabase.from('venthub_orders').select(...).eq('id', oid).maybeSingle()` sorgusundan dönen satır; `total_amount`, `created_at` ve `venthub_order_items` alanlarını içerir
  - `error` — Supabase sorgusundan dönen hata nesnesi; `null` ise sorgu başarılı
  - `items` — `data.venthub_order_items` alanından alınan sipariş kalemleri dizisi; her eleman `quantity` alanını içerir
  - `count` — `items` dizisinin `reduce` ile hesaplanan toplam kalem sayısı; `items` dizi değilse `undefined` olur
- **Dönüş**: yok (Promise<void>) — yan etki olarak `setOrderSummary` ile `{ amount, createdAt, items }` state'ini günceller

### [N4_NASIL] AST Pointer: src/views/PaymentSuccessPage.tsx::verify
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — `supabase.functions.invoke('iyzico-callback', ...)` çağrısından dönen yanıt verisi; `data.status` ve `data.iyzico?.errorMessage` / `data.iyzico?.conversationId` alanları okunur
  - `error` — `supabase.functions.invoke` çağrısından dönen hata nesnesi; `error.message` ile hata mesajı alınır
  - `msg` — `data?.iyzico?.errorMessage` veya `t('payment.failedGeneric')` ile belirlenen hata mesajı string'i; `setPaymentInfo` ve `toast.error`'a iletilir
  - `e` — `catch` bloğunda yakalanan `unknown` tipinde hata; `reportError`'a iletilir
  - `err` — `e` değerinin `{ message?: string }` tipine cast edilmiş hali; `err?.message` ile hata mesajı çıkarılır
- **Dönüş**: yok (Promise<void>) — yan etki olarak `setStatus` ile durum güncellenir, `setPaymentInfo` ile ödeme bilgisi atanır, `clearCart({ silent: true })` ile sepet temizlenir, localStorage anahtarları yönetilir (`venthub-cart`, `venthub-cart-version`, `venthub-cart-owner`, `vh_pending_order` silinir; `vh_last_order_status` ve `vh_clear_server_cart_once` set edilir), `toast.success` veya `toast.error` ile bildirim gösterilir, `fetchOrderDetails` ile sipariş detayları çekilir

---

## NODE ID STANDARD

  file: PaymentSuccessPage.tsx
  function: PaymentSuccessPage.tsx::PaymentSuccessPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: PaymentSuccessPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-100`, `bg-light-gray`, `bg-primary-navy`, `bg-red-100`, `bg-success-green/10`, `bg-white`, `border-2`, `border-primary-navy`, `hover:bg-primary-navy`, `hover:bg-secondary-blue`, `hover:text-white`, `text-2xl`, `text-center`, `text-industrial-gray`, `text-left`
- **Layout:** `block`, `flex`, `gap-3`, `grid`, `grid-cols-1`, `h-16`, `items-center`, `justify-between`, `justify-center`, `max-w-md`, `min-h-screen`, `p-8`, `shadow-lg`, `w-16`, `w-full`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `font-bold`, `font-medium`, `font-semibold`, `mb-4`, `mb-6`, `mb-8`, `mx-auto`, `px-6`, `py-3`, `rounded-full`, `rounded-lg`, `rounded-xl`, `space-x-2`, `space-y-3`