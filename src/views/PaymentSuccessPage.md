---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx
skeleton_hash: c07ee8d1ff5cc59e
entity_hashes:
  func:PaymentSuccessPage: 1b3614ca0faf5f01
  overview: ca5e4f6b72a3747d
  style_tokens: dcab201fde8662b7
generated_at: 2026-06-19T20:51:27Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda ödeme işleminin başarıyla tamamlanmasının ardından kullanıcıya gösterilen onay sayfasını oluşturur. Tek bir React bileşeni aracılığıyla, ödeme başarılı durumunu kullanıcıya iletir ve olası ileri adımlar için yönlendirme seçenekleri sunar. Modül, React ve React Router (useSearchParams) ve uluslararasılaştırma (i18n) kütüphanelerine bağımlıdır ve sayfa, uygulamanın ödeme akışının son aşamasında yer alır.

## Fonksiyon Grupları
### Ödeme Sonrası Görünüm
Bu grup, ödeme sürecinin sonunda kullanıcıya başarı mesajı ve durum bildirimini sunan sayfa düzeyindeki görünümü yönetir. Tüm sayfa arayüzü ve temel etkileşimler tek bileşen tarafından kontrol edilir.
- PaymentSuccessPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen bilgiler (fonksiyon gövdesi içeriği) yetersiz olduğundan, yalnızca fonksiyon imzasından türetilebilecek minimum aksiyomlar aşağıdadır:

---

[Aksiyom 1]: Eğer React ortamı (React kütüphanesi) yoksa, bileşen derlenemez/executed edilemez olur.

[Aksiyom 2]: Eğer bileşen çağrılmadan önce ödeme başarı durumu (payment success state)_Global state'de veya context'te) set edilmemişse, sayfa yanlış bilgi gösterebilir veya boş kalır olur.

[Aksiyom 3]: Eğer bileşen React Router veya benzeri bir yönlendirme sistemi içinde render edilmemişse, navigasyon但tonları (örn: "anasayfaya dön", "siparişleri gör") çalışmaz olur.

---

**Not:** Fonksiyon gövdesi içeriği paylaşılmadığı için, component'in hangi context/state'i tükettiği, hangi alt bileşenleri render ettiği ve hangi servislere bağımlı olduğu **bilinmiyor** olarak belirlenmiştir.

---

## FONKSİYON DETAYLARI

### PaymentSuccessPage

**Ne yapar**: PaymentSuccessPage, ödeme işleminin başarılı bir şekilde tamamlanmasını gösteren bir React sayfa bileşenidir. Kullanıcının ödeme sürecini tamamlamasının ardından yönlendirildiği onay sayfasını render eder.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni (FC) olarak tanımlanmıştır ve JSX ile render edilecek bir React elementi döndürür. Sayfa bileşeni olarak ödeme başarılı durumunu kullanıcıya sunar.

**Parametreler**: Bu bileşen herhangi bir prop almaz.

**Dönüş**: `React.FC` — Render edilecek bir React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useCartHook::useCart
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
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
- **params**: ()
- **ic_degiskenler**:
  - `searchParams` — Next.js useSearchParams hook'undan URL arama parametrelerini alır
  - `t` — useI18n hook'undan çeviri fonksiyonu
  - `lang` — useI18n hook'undan mevcut dil kodu
  - `Routes` — useLocalizedRoutes hook'undan lokalize edilmiş rota nesnesi
  - `clearCart` — useCart hook'undan sepeti temizleme fonksiyonu
  - `status` — useState hook'undan yükleme durumu: 'loading', 'success' veya 'error'
  - `paymentInfo` — useState hook'undan ödeme bilgileri nesnesi (conversationId, token, errorMessage)
  - `orderSummary` — useState hook'undan sipariş özeti (amount, items, createdAt)
  - `conversationId` — searchParams.get('conversationId') ile URL'den alınan konuşma ID'si
  - `token` — searchParams.get('token') ile URL'den alınan token
  - `errorMessage` — searchParams.get('errorMessage') ile URL'den alınan hata mesajı
  - `orderId` — searchParams.get('orderId') ile URL'den alınan sipariş ID'si
  - `statusParam` — searchParams.get('status') ile URL'den alınan durum parametresi
  - `fetchOrderDetails` — iç fonksiyon: Supabase'den sipariş detaylarını çeken async fonksiyon
  - `verify` — iç fonksiyon: Ödeme doğrulamasını yapan async fonksiyon
  - `data` — supabase.from('venthub_orders').select() çağrısından dönen veri
  - `error` — supabase.from('venthub_orders').select() çağrısından dönen hata
  - `items` — data.venthub_order_items'dan sipariş kalemleri dizisi
  - `count` — items dizisinin quantity değerlerinin toplamı (ürün adedi)
  - `e` — catch bloğundan yakalanan hata nesnesi
  - `err` — e değişkeninin message özelliği için tip dönüşümü
  - `msg` — data?.iyzico?.errorMessage veya t('payment.failedGeneric') hata mesajı
- **Dönüş**: React.FC (JSX elementi - duruma göre farklı JSX döndürür)

### [N2_NASIL] AST Pointer: src/views/PaymentSuccessPage.tsx::PaymentSuccessPage::fetchOrderDetails
- **params**: `oid?: string` — Sipariş ID'si, opsiyonel parametre
- **ic_degiskenler**:
  - `data` — Supabase'den dönen sipariş verisi (total_amount, created_at, venthub_order_items)
  - `error` — Supabase sorgusundan dönen hata nesnesi
  - `items` — data.venthub_order_items'dan sipariş kalemleri dizisi
  - `count` — items dizisinin quantity değerlerinin toplamı
- **Dönüş**: void (doğrudan state güncelleme yapar)

### [N3_NASIL] AST Pointer: src/views/PaymentSuccessPage.tsx::PaymentSuccessPage::verify
- **params**: ()
- **ic_degiskenler**:
  - `conversationId` — üst kapsamdan gelen konuşma ID'si
  - `token` — üst kapsamdan gelen token
  - `errorMessage` — üst kapsamdan gelen hata mesajı
  - `orderId` — üst kapsamdan gelen sipariş ID'si
  - `statusParam` — üst kapsamdan gelen durum parametresi
  - `data` — Supabase fonksiyon çağrısından dönen veri
  - `error` — Supabase fonksiyon çağrısından dönen hata
  - `e` — catch bloğundan yakalanan genel hata nesnesi
  - `err` — e değişkeninin message özelliği için tip dönüşümü
  - `msg` — data?.iyzico?.errorMessage veya t('payment.failedGeneric') hata mesajı
- **Dönüş**: void (doğrudan state güncelleme ve localStorage işlemleri yapar)

---

## NODE ID STANDARD

  file: src\views\PaymentSuccessPage.tsx
  function: src\views\PaymentSuccessPage.tsx::PaymentSuccessPage

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