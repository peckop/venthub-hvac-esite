---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\StepAddressInfo.tsx
skeleton_hash: 5d6517bcf8ccfc58
entity_hashes:
  func:StepAddressInfo: d5b5813fe5d1d5af
  overview: a2c2c2af4883e494
  style_tokens: 7a84088359f41f22
generated_at: 2026-06-08T10:11:02Z
---

## Genel Bakış
Bu modül, ödeme sürecinin (checkout) adres bilgisi adımını yöneten bir React bileşenidir. Kullanıcının teslimat ve fatura adresi bilgilerini girebilmesi için gerekli form arayüzünü sağlar ve bu verilerin üst bileşen tarafından kontrol edilen state’lerle senkronize edilmesini yönetir.

## Fonksiyon Grupları
### Adres Formu Yönetimi
Ödeme akışı sırasında teslimat ve fatura adresi verilerinin kullanıcıya sunulmasını ve bu verilerin güncellenmesini sağlayan ana bileşendir.
- StepAddressInfo

---

## AXIOMS – Mimari Varsayımlar

Bu modül, üst bileşenden kontrol edilen state/prop çiftlerine bağımlı bir React form bileşenidir.

[Aksiyom 1]: Eğer `setShippingAddress` fonksiyonu çağrılamaz (undefined veya non-function) yoksa, kullanıcının teslimat adresi bilgilerini günclemesi mümkün olmaz ve üst bileşenin state'i değişmez.

[Aksiyom 2]: Eğer `setBillingAddress` (imzada kesik olarak `setBi` görünen) fonksiyonu çağrılamaz yoksa, kullanıcının fatura adresi bilgilerini güncellemesi mümkün olmaz ve üst bileşenin state'i değişmez.

[Aksiyom 3]: Eğer `shippingAddress` objesi üst bileşen tarafından başlatılmamış (undefined/null) yoksa, form alanlarının varsayılan değerleri boş/görünmez olur ve kullanıcı mevcut bir adres bilgisiyle başlamaz.

[Aksiyom 4]: Eğer `billingAddress` objesi üst bileşen tarafından başlatılmamış (undefined/null) yoksa, form alanlarının varsayılan değerleri boş/görünmez olur ve kullanıcı mevcut bir adres bilgisiyle başlamaz.

[Aksiyom 5]: Eğer üst bileşen, `setShippingAddress` ve `setBillingAddress` setter'larını aynı state yönetim bağlamında (örn:同一 useCallback/useState) sağlamazsa, bileşen içinde yapılan adres güncellemeleri üst seviyeye yansımayabilir.

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

### [N1_NASIL] AST Pointer: `StepAddressInfo.tsx`::StepAddressInfo
- **params**:
  - `shippingAddress` — Kullanıcının seçtiği teslimat adresi nesnesi (CheckoutAddressInfo tipinde)
  - `setShippingAddress` — shippingAddress durumunu güncelleyen React state setter fonksiyonu
  - `billingAddress` — Kullanıcının seçtiği fatura adresi nesnesi (CheckoutAddressInfo tipinde)
  - `setBillingAddress` — billingAddress durumunu güncelleyen React state setter fonksiyonu
- **ic_degiskenler**: *(gövde verilmemiş — sadece imza bilgisi mevcut)*
- **Dönüş**: `React.FC<StepAddressInfoProps>` (JSX bileşeni)

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