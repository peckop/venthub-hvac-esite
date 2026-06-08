---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx
skeleton_hash: cc11ccdacafb6929
entity_hashes:
  func:PaymentSuccessPage: 1b3614ca0faf5f01
  overview: 5dba2dbd22d22660
  style_tokens: dcab201fde8662b7
generated_at: 2026-06-08T10:10:59Z
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

### [N1_NASIL] AST Pointer: src/views/PaymentSuccessPage.tsx::PaymentSuccessPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `searchParams` — URL arama parametrelerini tutan hook, useSearchParams() ile alınır
  - `t` — useI18n hookundan gelen çeviri fonksiyonu
  - `lang` — useI18n hookundan gelen dil kodu
  - `clearCart` — useCart hookundan gelen sepeti temizleme fonksiyonu
  - `status` — Sayfanın durumunu tutan state değişkeni ('loading', 'success', 'error')
  - `paymentInfo` — Ödeme bilgilerini tutan state değişkeni (conversationId, token, errorMessage)
  - `orderSummary` — Sipariş özetini tutan state değişkeni (amount, items, createdAt)
- **Dönüş**: JSX element (React.FC)

### [N2_NASIL] AST Pointer: src/views/PaymentSuccessPage.tsx::fetchOrderDetails
- **params**: (oid?: string)
- **ic_degiskenler**:
  - `data` — Supabase'den gelen sipariş verisi (total_amount, created_at, venthub_order_items alanları)
  - `error` — Supabase sorgusu sırasında oluşan hata nesnesi
  - `items` — data.venthub_order_items içindeki sipariş kalemleri dizisi
  - `count` — items dizisindeki tüm kalemlerin quantity değerlerinin toplamı
- **Dönüş**: void (asenkron, state güncelleme yan etkisi var)

### [N3_NASIL] AST Pointer: src/views/PaymentSuccessPage.tsx::verify
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — iyzico-callback fonksiyonundan gelen yanıt verisi (token dalında)
  - `error` — iyzico-callback fonksiyonu çağrısında oluşan hata nesnesi (token dalında)
  - `msg` — Ödeme hata mesajı, data?.iyzico?.errorMessage veya fallback mesaj (token dalında)
  - `data` — venthub_orders tablosundan sorgulanan sipariş durumu (orderId dalında)
  - `error` — venthub_orders sorgusu sırasında oluşan hata nesnesi (orderId dalında)
  - `err` — catch bloğunda yakalanan hata nesnesi, message özelliği
- **Dönüş**: void (asenkron, state güncelleme ve yan etkiler)

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