---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx
skeleton_hash: bf7a2214ad8fa62d
entity_hashes:
  func:PaymentSuccessPage: 1b3614ca0faf5f01
  overview: 62010319ad4b4c49
  style_tokens: dcab201fde8662b7
generated_at: 2026-05-29T18:50:43Z
---

## Genel Bakış
PaymentSuccessPage modülü, VentHub HVAC platformunda ödeme işleminin başarıyla tamamlanmasının ardından kullanıcıya gösterilen onay sayfasını oluşturur. Tek bir React bileşeni aracılığıyla, ödeme başarılı durumunu kullanıcıya iletir ve olası ileri adımlar için yönlendirme seçenekleri sunar.

## Fonksiyon Grupları
### Ödeme Sonrası Görünüm
Bu grup, ödeme sürecinin sonunda kullanıcıya başarı mesajı ve durum bildirimini sunan, sayfa düzeyindeki görünümü yöneten temel bileşeni içerir. Tüm sayfa arayüzü ve temel etkileşim (örn: ana sayfaya dönme) tek bileşen tarafından kontrol edilir.
- PaymentSuccessPage

---



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