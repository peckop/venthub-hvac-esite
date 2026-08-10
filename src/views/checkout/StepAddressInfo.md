---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\StepAddressInfo.tsx
skeleton_hash: db11764911d1f16c
entity_hashes:
  func:StepAddressInfo: d5b5813fe5d1d5af
  overview: 4a44d69bf10e19a2
  style_tokens: 7a84088359f41f22
generated_at: 2026-06-19T20:50:27Z
---

## Genel Bakış
Bu modül, ödeme sürecinin (checkout) adres bilgisi adımını yöneten bir React bileşenidir. Kullanıcının teslimat ve fatura adresi bilgilerini girebilmesi için gerekli form arayüzünü sağlar ve bu verilerin üst bileşen tarafından kontrol edilen state’lerle senkronize edilmesini yönetir. Bileşen, dışarıdan gelen adres nesnelerine ve bunları güncelleyebilmek için setter fonksiyonlarına bağımlıdır.

## Fonksiyon Grupları
### Adres Formu Bileşeni (Ana İş Birimi)
Ödeme adımında kullanıcıya sunulan adres giriş formunun ana konteynerıdır. Tüm form alanlarını ve ilgili mantığı bir arada barındırır.
- StepAddressInfo

### Üst Bileşenle Entegrasyon ve Durum Yönetimi
Üst bileşenden gelen adres durum nesnelerini (shippingAddress, billingAddress) form alanlarına bağlar ve kullanıcının girişleriyle bu durumları günceller. Bu grup, veri akışının giriş ve çıkış noktalarını yönetir.
- shippingAddress, setShippingAddress, billingAddress, setBillingAddress (setBi) prop'ları ile etkileşim.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, üst bileşenden kontrol edilen state/prop çiftlerine bağımlı bir React form bileşenidir.

[Aksiyom 1]: Eğer `shippingAddress` prop'u verilmemişse, teslimat adresi formu doğru başlatılamaz ve boş/hatalı değerlerle doldurulabilir.
[Aksiyom 2]: Eğer `setShippingAddress` fonksiyonu verilmemişse, teslimat adresi formu güncellenemez ve kullanıcı değişiklikleri kaydedilmez.
[Aksiyom 3]: Eğer `billingAddress` prop'u verilmemişse, fatura adresi formu doğru başlatılamaz ve boş/hatalı değerlerle doldurulabilir.
[Aksiyom 4]: Eğer `setBillingAddress` fonksiyonu verilmemişse, fatura adresi formu güncellenemez ve kullanıcı değişiklikleri kaydedilmez.
[Aksiyom 5]: Eğer üst bileşen tarafından kontrol edilen state'ler (shippingAddress/billingAddress) ile form alanları eşzamanlı güncellenmezse, form verileri üst bileşen ile tutarsız hale gelir.

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

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: @/types/ui-models::type { UserAddress }
- import: lucide-react::MapPin
- import: next/link::Link
- import: react::React

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

### [N1_NASIL] AST Pointer: src/views/checkout/StepAddressInfo.tsx::StepAddressInfo
- **params**: `{ shippingAddress, setShippingAddress, billingAddress, setBillingAddress, ... }` — destructured React component props (imza kesik/bozuk, tam liste çıkarılamaz; kesin olarak `shippingAddress`, `setShippingAddress`, `billingAddress`, `setBillingAddress` mevcut)
- **ic_degiskenler**: Tam gövde sağlanmadığı için çıkarılamaz
- **Dönüş**: `React.FC<StepAddressInfoProps>` — JSX döndüren fonksiyonel bileşen

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