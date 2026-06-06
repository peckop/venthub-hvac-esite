---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx
skeleton_hash: 2b14916b762ab73b
entity_hashes:
  func:PaymentSuccessPage: 1b3614ca0faf5f01
  overview: dac563423e58ee00
  style_tokens: dcab201fde8662b7
generated_at: 2026-06-06T21:58:56Z
---

## Genel Bakış
PaymentSuccessPage modülü, VentHub HVAC platformunda ödeme işleminin başarıyla tamamlanmasının ardından kullanıcıya gösterilen onay sayfasını oluşturur. Tek bir React bileşeni aracılığıyla, ödeme başarılı durumunu kullanıcıya iletir ve olası ileri adımlar için yönlendirme seçenekleri sunar.

## Fonksiyon Grupları
### Ödeme Sonrası Görünüm
Bu grup, ödeme sürecinin sonunda kullanıcıya başarı mesajı ve durum bildirimini sunan sayfa düzeyindeki görünümü yönetir. Tüm sayfa arayüzü ve temel etkileşimler tek bileşen tarafından kontrol edilir.
- PaymentSuccessPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### PaymentSuccessPage

**Ne yapar**: PaymentSuccessPage, ödeme işleminin başarılı bir şekilde tamamlanmasını gösteren bir React sayfa bileşenidir. Kullanıcının ödeme sürecini tamamlamasının ardından yönlendirildiği onay sayfasını render eder.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni (FC) olarak tanımlanmıştır ve JSX ile render edilecek bir React elementi döndürür. Sayfa bileşeni olarak ödeme başarılı durumunu kullanıcıya sunar.

**Parametreler**: Bu bileşen herhangi bir prop almaz.

**Dönüş**: `React.FC` — Render edilecek bir React fonksiyonel bileşeni döndürür.

---

## TYPE ALIASES

### PaymentInfo
```typescript
type PaymentInfo = { conversationId?: string; token?: string; errorMessage?: string }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: PaymentSuccessPage.tsx::PaymentSuccessPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `searchParams` — useSearchParams hook'unun döndürdüğü URL search parametreleri nesnesi
  - `t` — useI18n hook'unun döndürdüğü çeviri fonksiyonu
  - `lang` — useI18n hook'unun döndürdüğü dil kodu (örn: 'tr', 'en')
  - `clearCart` — useCart hook'unun döndürdüğü sepeti temizleme fonksiyonu
  - `status` — Ödeme durumunu tutan state ('loading', 'success', 'error')
  - `paymentInfo` — Ödeme bilgilerini tutan state (conversationId, token, errorMessage)
  - `orderSummary` — Sipariş özetini tutan state (amount, items, createdAt)
- **Dönüş**: React.FC (React fonksiyonel component JSX'i)

### [N2_NASIL] AST Pointer: PaymentSuccessPage.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `conversationId` — URL'den gelen conversationId parametresi
  - `token` — URL'den gelen token parametresi
  - `errorMessage` — URL'den gelen hata mesajı parametresi
  - `orderId` — URL'den gelen sipariş ID parametresi
  - `statusParam` — URL'den gelen status parametresi
- **Dönüş**: yok (useEffect side-effect callback)

### [N3_NASIL] AST Pointer: PaymentSuccessPage.tsx::fetchOrderDetails
- **params**: `(oid?: string)` — Sorgulanacak sipariş ID'si
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen sipariş verisi
  - `error` — Supabase sorgusundan dönen hata nesnesi
  - `items` — Sipariş kalemleri dizisi (data.venthub_order_items)
  - `count` — Tüm kalemlerin toplam adedi (items.reduce ile hesaplanır)
- **Dönüş**: yok (async void, state günceller)

### [N4_NASIL] AST Pointer: PaymentSuccessPage.tsx::verify
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase functions/DB sorgularından dönen veri
  - `error` — Supabase functions/DB sorgularından dönen hata
  - `msg` — Hata durumunda gösterilecek mesaj (data?.iyzico?.errorMessage veya fallback)
  - `err` — Catch bloğundaki error nesnesinin message özelliği
- **Dönüş**: yok (async void, state ve toast günceller)

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