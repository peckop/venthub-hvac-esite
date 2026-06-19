---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\ReviewSummary.tsx
skeleton_hash: acffea334634549f
entity_hashes:
  func:ReviewSummary: 5797ed029cce22ed
  overview: 34cecab9410c7f0c
  style_tokens: e50d4f5a19398e9d
generated_at: 2026-06-19T09:04:41Z
---

## Genel Bakış
Bu modül, sipariş tamamlama (checkout) sürecinin son aşamasında yer alan bir bileşendir. Ödeme sayfasına geçmeden önce müşteri, teslimat ve fatura bilgilerini bir arada göstererek kullanıcının tüm detayları gözden geçirmesini ve doğruluğunu teyit etmesini sağlar.

## Fonksiyon Grupları
### Özet Görünüm Bileşeni
Siparişin onay öncesindeki tüm kritik bilgileri —müşteri detayları, teslimat adresi, fatura adresi ve fatura türü— tek bir düzenli arayüzde sunarak kullanıcının son kontrol yapmasına olanak tanır.
- ReviewSummary

---

## AXIOMS – Mimari Varsayımlar
Bu modül, sipariş onay sayfasında müşteri, teslimat ve fatura bilgilerini göstererek kullanıcının siparişini gözden geçirmesini sağlar.

[Aksiyom 1]: Eğer `customer` prop'u (müşteri bilgileri) sağlanmazsa, bileşen müşteri bilgilerini gösteremez ve hata oluşur veya eksik veri gösterir.
[Aksiyom 2]: Eğer `shipping` prop'u (teslimat adresi bilgileri) sağlanmazsa, bileşen teslimat adresini gösteremez ve hata oluşur veya eksik veri gösterir.
[Aksiyom 3]: Eğer `billing` prop'u (fatura adresi bilgileri) sağlanmazsa, bileşen fatura adresini gösteremez ve hata oluşur veya eksik veri gösterir.
[Aksiyom 4

---

## FONKSİYON DETAYLARI

### ReviewSummary

**Ne yapar**: Checkout (sipariş tamamlama) sürecinin son aşamasında, müşterinin sipariş özetini görüntülemesini sağlayan React bileşenidir. Müşteri, kargo, fatura bilgilerini ve fatura türünü bir arada göstererek sipariş onayı öncesi tüm detayların kontrol edilmesini sağlar.

**Nasıl yapar**: Fonksiyonel bir React bileşeni olarak çalışır ve props aracılığı ile siparişle ilgili tüm bilgileri alır. sameAsShipping bayrağı sayesinde fatura adresinin kargo adresiyle aynı olup olmadığını kontrol ederek gerekli durumlarda fatura adresi bölümünü gereksiz yere tekrar göstermez. Tüm bilgileri düzenli bir özeti formatında kullanıcıya sunar.

**Parametreler**:
- `customer` — Siparişi veren müşterinin kişisel bilgilerini içeren nesne
- `shipping` — Kargo adresi ve teslimat bilgilerini içeren nesne
- `billing` — Fatura adresi ve ödeme ile ilişkili bilgileri içeren nesne
- `sameAsShipping` — Fatura adresinin kargo adresi ile aynı olup olmadığını belirten boolean değer
- `invoiceType` — Fatura türünü (bireysel/kurumsal vb.) belirten değer
- `in` — Parametre listesi bu noktada kesilmiş, ek parametreler mevcut olabilir

**Dönüş**: `React.FC<ReviewSummaryProps>` — ReviewSummaryProps tipinde prop alan ve JSX döndüren fonksiyonel React bileşeni

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: react::React

---

## INTERFACES

### ReviewSummaryProps
- `customer: CheckoutCustomerInfo`
- `shipping: CheckoutAddressInfo`
- `billing: CheckoutAddressInfo`
- `sameAsShipping: boolean`
- `invoiceType: InvoiceType`
- `invoiceInfo: CheckoutInvoiceInfo`
- `onEditPersonal: () => void`
- `onEditShipping: () => void`
- `onEditBilling: () => void`
- `onEditInvoice: () => void`

---

## TYPE ALIASES

### InvoiceType
```typescript
type InvoiceType = 'individual' | 'corporate'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/checkout/ReviewSummary.tsx::ReviewSummary
- **params**: (customer, shipping, billing, sameAsShipping, invoiceType, invoiceInfo, onEditPersonal, onEditShipping, onEditBilling, onEditInvoice)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, UI metinlerini uluslararası dilde göstermek için kullanılır
- **Dönüş**: JSX elementi (React component) — Sipariş özetini gösteren düzenli bir JSX yapısı döner. Kişisel bilgiler, teslimat adresi, fatura adresi (şayet farklıysa) ve fatura bilgilerini içeren dört kart gösterir. Her kartta düzenleme butonu ve ilgili bilgileri visible olarak render eder.

### Notlar:
- `shipping` ve `billing` objelerinde `fullAddress || full_address` ve `postalCode || postal_code` gibi alternatif property erişimleri yapılır (farklı API yanıt formatlarına uyum için)
- `sameAsShipping` değişkeni `false` olduğunda fatura adresi kartı render edilir
- `invoiceInfo` objesinin `tckn`, `companyName`, `vkn`, `taxOffice`, `eInvoice` property'leri fatura türüne göre farklı şekilde gösterilir

---

## NODE ID STANDARD

  file: src\views\checkout\ReviewSummary.tsx
  function: src\views\checkout\ReviewSummary.tsx::ReviewSummary

---

## DISA AKTARILANLAR (EXPORTS)
  export: InvoiceType
  export: ReviewSummary
  export: ReviewSummaryProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white/90`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-xl`, `text-xs`
- **Layout:** `flex`, `gap-4`, `grid`, `grid-cols-1`, `items-center`, `justify-between`, `md:grid-cols-2`, `p-4`
- **Varyant/Responsive:** `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-medium`, `font-semibold`, `hover:underline`, `mb-2`, `rounded-lg`, `space-y-6`, `whitespace-pre-line`