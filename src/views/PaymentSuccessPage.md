---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx
skeleton_hash: cc90da8797868667
entity_hashes:
  func:PaymentSuccessPage: 1b3614ca0faf5f01
  overview: 4aae9a09925cda46
  style_tokens: dcab201fde8662b7
generated_at: 2026-05-28T22:40:35Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda kullanıcıların ödeme işlemini başarıyla tamamlamasının ardından gösterilen sonuç sayfasını oluşturur. Tek bir React bileşeni üzerinden kullanıcıya durum bildirimi, olası sipariş özeti ve navigasyon seçenekleri sunar.

## Fonksiyon Grupları
### Ödeme Sonrası Görünüm
Bu grup, ödeme tamamlandıktan sonra kullanıcıya başarı mesajı ileten ve ana sayfa veya profil gibi alanlara yönlendirmeler sunan ana sayfa bileşenini içerir. Tüm sayfa işlevselliği ve kullanıcı arayüzü tek bir bileşen tarafından yönetilir.
- PaymentSuccessPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

NOT: Verilen fonksiyon imzası `PaymentSuccessPage()` olup, parametre veya prop tanımı içermemektedir. Eski doküman, modülün bir "başarı sayfası" olduğunu belirtmekte; bu nedenle modülün çalışması için gerekli verilerin (örn: sipariş ID, ödeme durumu, başarı mesajı) bir React Prop, Context veya Global State aracılığıyla sağlanması gerektiği doğal bir gerekliliktir. Ancak, bu mekanizmanın varlığı ve yapısı (hangi prop'ların geldiğine dair) mevcut fonksiyon imzasından anlaşılamadığından, somut bir aksiyom oluşturulamamaktadır.

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

### [N1_NASIL] AST Pointer: src\views\PaymentSuccessPage.tsx::PaymentSuccessPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `searchParams` — URL'deki query parametrelerini (conversationId, token, orderId vb.) erişmek için useSearchParams hook'undan alınan nesne
  - `t` — Çeviri fonksiyonu, useI18n hook'undan alınan metin çeviri nesnesi
  - `lang` — Geçerli dil kodu, useI18n hook'undan alınan dil belirleyici
  - `clearCart` — Sepeti temizleyen fonksiyon, useCart hook'undan alınan sepet yöneticisi
  - `status` — Ödeme durumunu tutan state: 'loading' | 'success' | 'error'
  - `paymentInfo` — Ödeme bilgilerini tutan state (conversationId, token, errorMessage)
  - `orderSummary` — Sipariş özetini tutan state (tutar, ürün sayısı, oluşturulma tarihi)
  - `conversationId` — searchParams'den alınan conversationId parametresi
  - `token` — searchParams'den alınan token parametresi
  - `errorMessage` — searchParams'den alınan hata mesajı parametresi
  - `orderId` — searchParams'den alınan sipariş ID parametresi
  - `statusParam` — searchParams'den alınan status parametresi
- **Dönüş**: React.FC (Component, JSX döndürür)

### [N2_NASIL] AST Pointer: src\views\PaymentSuccessPage.tsx::fetchOrderDetails
- **params**: (oid?: string)
- **ic_degiskenler**:
  - `data` — Supabase'den gelen sipariş verisi (total_amount, created_at, venthub_order_items)
  - `error` — Supabase sorgusundaki hata nesnesi
  - `items` — Sipariş kalemleri dizisi (venthub_order_items)
  - `count` — Toplam ürün adedi (kalemlerin quantity değerlerinin toplamı)
- **Dönüş**: void (sadece orderSummary state'ini günceller)

### [N3_NASIL] AST Pointer: src\views\PaymentSuccessPage.tsx::verify
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `msg` — Hata mesajı (data?.iyzico?.errorMessage veya çeviriden gelen fallback mesaj)
  - `err` — Try-catch'ten yakalanan hata nesnesi (message özellikli)
- **Dönüş**: void (status, paymentInfo state'lerini günceller, clearCart çağırır, localStorage temizler)

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