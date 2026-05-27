---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\StepAddressInfo.tsx
skeleton_hash: 61818ab3eba26faa
entity_hashes:
  func:StepAddressInfo: d5b5813fe5d1d5af
  overview: f4c7e4e155655b30
  style_tokens: 7a84088359f41f22
generated_at: 2026-05-27T18:30:58Z
---

## Genel Bakış
Bu modül, ödeme sürecinin adres bilgisi adımını yöneten bir React bileşenidir. Kullanıcının teslimat ve fatura adresi bilgilerini girebilmesi için gerekli form arayüzünü ve veri akışını sağlar.

## Fonksiyon Grupları

### Adres Bilgisi Arayüzü
Ödeme akışı sırasında teslimat ve fatura adresi verilerinin kullanıcıya sunulmasını ve bu verilerin güncellenmesini sağlayan ana bileşendir.
- StepAddressInfo

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### StepAddressInfo
**Ne yapar**: Bir ödeme adımında (checkout) kullanıcıdan teslimat ve fatura adres bilgilerini toplamak için kullanılan bir React fonksiyonel bileşenidir. Kullanıcının adres verilerini girmesine ve bu verilerin üst bileşen tarafından yönetilen state’lerle senkronize edilmesine olanak tanır.

**Nasıl yapar**: Bileşen, dışarıdan aldığı `shippingAddress`, `setShippingAddress`, `billingAddress` ve `setBillingAddress` prop’larını kullanarak adres form alanlarını render eder. Her bir alandaki değişiklik ilgili state setter fonksiyonu aracılığıyla üst bileşenin state’ine yansıtılır. İç yapısı ve form elemanlarının detayları mevcut kod parçasında tam olarak görülememekle birlikte, genellikle iki ayrı adres bölümü (teslimat ve fatura) içerir.

**Parametreler**:
- `shippingAddress`: `object` (type) — Kullanıcının teslimat adresini temsil eden state değeri. Alanlar (ör. sokak, şehir, posta kodu) içeren bir nesne olduğu varsayılır.
- `setShippingAddress`: `React.Dispatch<React.SetStateAction<object>>` — `shippingAddress` state’ini güncellemek için kullanılan setter fonksiyonudur.
- `billingAddress`: `object` — Kullanıcının fatura adresini temsil eden state değeri. `shippingAddress` ile benzer yapıda olduğu varsayılır.
- `setBillingAddress`: (kodda `setBi` olarak kısaltılmıştır) `React.Dispatch<React.SetStateAction<object>>` — `billingAddress` state’ini güncellemek için kullanılan setter fonksiyonudur.

**Dönüş**: `React.FC<StepAddressInfoProps>` — Bileşen, bir React fonksiyonel bileşeni (Functional Component) olarak tanımlanmıştır. Bu nedenle dönüş değeri, JSX formatında bir kullanıcı arayüzü öğesidir (React.ReactNode). Props’ları `StepAddressInfoProps` arayüzü ile tipleştirilmiştir.

---

## INTERFACES

### StepAddressInfoProps
- `shippingAddress: CheckoutAddressInfo`
- `setShippingAddress: (a: CheckoutAddressInfo) => void`
- `billingAddress: CheckoutAddressInfo`
- `setBillingAddress: (a: CheckoutAddressInfo) => void`
- `sameAsShipping: boolean`
- `setSameAsShipping: (v: boolean) => void`
- `shippingMethod: 'standard' | 'express'`
- `setShippingMethod: (v: 'standard' | 'express') => void`
- `invoiceType: 'individual' | 'corporate'`
- `setInvoiceType: (v: 'individual' | 'corporate') => void`
- `invoiceInfo: CheckoutInvoiceInfo`
- `setInvoiceInfo: (v: CheckoutInvoiceInfo) => void`
- `legalConsents: CheckoutLegalConsents`
- `setLegalConsents: (v: CheckoutLegalConsents) => void`
- `savedAddresses: UserAddress[]`
- `onOpenAddressModal: (target: 'shipping' | 'billing') => void`
- `onOpenInvoiceModal: () => void`
- `t: (key: string) => string`
- `tf: (key: string, fallback: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\StepAddressInfo.tsx::anonymous_1
- **params**: (e)
- **ic_degiskenler**:
  - `e` — olay nesnesi, `e.target.value` üzerinden girilen metin alınır
  - `v` — `e.target.value` içindeki sadece rakamları tutan ve ilk 10 karaktere kesilen string
  - `shippingAddress` — dışarıdan gelen state nesnesi, mevcut adres bilgilerini içerir
  - `setShippingAddress` — React state güncelleme fonksiyonu, yeni `postalCode` değeriyle state’i günceller
- **Dönüş**: yok (callback olarak kullanılan anonim fonksiyon, bir değer döndürmez)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\StepAddressInfo.tsx::anonymous_2
- **params**: (e)
- **ic_degiskenler**:
  - `e` — olay nesnesi, `e.target.value` üzerinden girilen metin alınır
  - `v` — `e.target.value` içindeki sadece rakamları tutan ve ilk 10 karaktere kesilen string
  - `billingAddress` — dışarıdan gelen state nesnesi, mevcut fatura adresi bilgilerini içerir
  - `setBillingAddress` — React state güncelleme fonksiyonu, yeni `postalCode` değeriyle state’i günceller
- **Dönüş**: yok (callback olarak kullanılan anonim fonksiyon, bir değer döndürmez)

---

## NODE ID STANDARD

  file: src\views\checkout\StepAddressInfo.tsx
  function: src\views\checkout\StepAddressInfo.tsx::StepAddressInfo

---

## DISA AKTARILANLAR (EXPORTS)
  export: StepAddressInfo

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-50`, `border-light-gray`, `border-primary-navy`, `border-slate-200`, `focus-visible:border-primary-navy`, `hover:text-secondary-blue`, `placeholder:text-slate-400`, `text-industrial-gray`, `text-lg`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-white`, `text-xl`
- **Layout:** `block`, `flex`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `grid`, `grid-cols-1`, `h-10`, `items-center`, `items-start`, `justify-between`, `justify-end`, `md:col-span-2`, `md:grid-cols-2`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `md:`, `placeholder:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${shippingMethod`, `-mt-2`, `:`, `===`, `border`, `cursor-pointer`, `express`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `focus-visible:ring-primary-navy/20`, `font-medium`, `font-semibold`, `hover:underline`, `mb-2`