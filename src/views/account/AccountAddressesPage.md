---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx
skeleton_hash: 85bfbc2f18d6514d
entity_hashes:
  func:AccountAddressesPage: 75c0fb5d7175a123
  overview: b41befa640558dbe
  style_tokens: 20e5949307a3284f
generated_at: 2026-05-28T22:38:51Z
---

## Genel Bakış
`AccountAddressesPage` bileşeni, kullanıcının kayıtlı adreslerini görüntüleyen ve yönetmesine olanak tanıyan bir sayfa sunar. React ve TypeScript kullanılarak oluşturulmuş bu modül, adres listesi, ekleme ve düzenleme formları gibi UI öğelerini bir araya getirir.

## Fonksiyon Grupları
### Sayfa Render ve UI Yönetimi
Bu grup, sayfanın temel görünümünü oluşturur, adres verilerini alır ve UI bileşenlerini (liste, form, butonlar vb.) render eder.  
- AccountAddressesPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AccountAddressesPage
**Ne yapar**: Kullanıcının adreslerini listeleyen, yeni adres eklemeye ve mevcut adresleri düzenlemeye, silmeye ve varsayılan olarak işaretlemeye yarayan bir sayfa bileşeni.  
**Nasıl yapar**: React hook’ları (`useState`, `useEffect`, `useCallback`, `useMemo`) ile veri akışını yönetir, API servislerini (`listAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`) çağırır, UI durumlarını (`loading`, `saving`, `form`) günceller ve toast bildirimleriyle kullanıcıyı bilgilendirir.  
**Parametreler**: *Yok*  
**Dönüş**: `void` (React bileşeni JSX döndürür)

---

## INTERFACES

### FormState
- `id?: string`
- `label?: string | null`
- `full_name?: string | null`
- `phone?: string | null`
- `address_line: string`
- `city: string`
- `district: string`
- `postal_code?: string | null`
- `country?: string`
- `is_default_shipping?: boolean | null`
- `is_default_billing?: boolean | null`

---

## SABİTLER
- **emptyForm** (object) — `{
  label: '',
  full_name: '',
  phone: '',
  address_line: '',
  city:...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::\<anonymous_loadAddresses>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — `listAddresses()` API çağrısından dönen adres listesi; `setItems` ile UI’ya aktarılır.
  - `e` — `try…catch` bloğunda yakalanan hata nesnesi; konsola loglanır ve toast ile kullanıcıya bildirilir.
- **Dönüş**: `Promise<void>` (asenkron, UI yan etkileri)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::startEdit
- **params**: `a: UserAddress`
- **ic_degiskenler**:
  - `a` — Düzenlenmek istenen adres nesnesi; alanları `setForm` ile form durumuna kopyalanır.
  - `setForm` — Form state’ini güncelleyen React setter fonksiyonu.
  - `window.scrollTo` — Mobilde formun görünür olmasını sağlamak için sayfayı kaydırır.
- **Dönüş**: `void`

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `emptyForm` — Boş form şablonu (sabit obje) ; `setForm` ile form state’i sıfırlanır.
  - `setForm` — Form state’ini güncelleyen React setter fonksiyonu.
- **Dönüş**: `void`

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::handleSubmit
- **params**: `e: React.FormEvent`
- **ic_degiskenler**:
  - `e` — Form submit olayı; `preventDefault()` ile sayfa yenilenmesi engellenir.
  - `form` — Form state nesnesi; alanları API çağrısına gönderilir.
  - `user` — Oturum açmış kullanıcı bilgisi; yoksa hata fırlatılır.
  - `isEditing` — Formun düzenleme modunda olup olmadığını gösteren boolean.
  - `setSaving` — “Kaydetme” yükleme durumunu yöneten React setter fonksiyonu.
  - `updateAddress` — Mevcut adresi güncelleyen API fonksiyonu.
  - `createAddress` — Yeni adres oluşturmak için kullanılan API fonksiyonu.
  - `toast` — Başarı / hata bildirimleri için `react-hot-toast` arayüzü.
  - `t` — Çeviri fonksiyonu (`useI18n`); mesajları yerelleştirir.
  - `resetForm` — İşlem sonrası formu temizler.
  - `refresh` — Adres listesini yeniden yükleyen fonksiyon (muhtemelen `listAddresses` çağrısı).
- **Dönüş**: `Promise<void>`

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::handleDelete
- **params**: `id: string`
- **ic_degiskenler**:
  - `id` — Silinecek adresin benzersiz kimliği.
  - `confirm` — Tarayıcı onay penceresi; kullanıcı onay vermezse işlem iptal olur.
  - `t` — Çeviri fonksiyonu; onay mesajı ve toast metinleri için kullanılır.
  - `deleteAddress` — Adresi veritabanından kaldıran API fonksiyonu.
  - `toast` — Başarı / hata bildirimleri.
  - `refresh` — Adres listesini güncellemek için tekrar veri çekme fonksiyonu.
  - `form` — Mevcut form state’i; silinen adres formda ise form temizlenir.
  - `resetForm` — Formu sıfırlar.
  - `e` — `catch` bloğunda yakalanan hata nesnesi.
- **Dönüş**: `Promise<void>`

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::makeDefault
- **params**: `id: string`, `kind: 'shipping' | 'billing'`
- **ic_degiskenler**:
  - `id` — Varsayılan olarak ayarlanacak adresin kimliği.
  - `kind` — `'shipping'` veya `'billing'`; hangi adres tipinin varsayılan olacağını belirler.
  - `setDefaultAddress` — Seçilen adresi varsayılan yapan API fonksiyonu.
  - `toast` — İşlem sonucunu kullanıcıya bildiren toast.
  - `t` — Çeviri fonksiyonu; toast mesajlarını yerelleştirir.
  - `refresh` — Varsayılan değişikliği sonrası adres listesini yeniden yükler.
  - `e` — `catch` bloğunda yakalanan hata nesnesi.
- **Dönüş**: `Promise<void>`

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::renderAddressItem
- **params**: `a: UserAddress`
- **ic_degiskenler**:
  - `a` — Listeden gelen tek bir adres nesnesi; tüm UI alanları (`a.id`, `a.label`, `a.full_name`, `a.address_line`, `a.city`, `a.district`, `a.postal_code`, `a.phone`, `a.is_default_shipping`, `a.is_default_billing`) render edilir.
  - `startEdit` — Düzenleme butonuna tıklandığında `a` ile `startEdit` fonksiyonunu çağırır.
  - `handleDelete` — Silme butonuna tıklandığında `a.id` ile `handleDelete` fonksiyonunu çağırır.
  - `makeDefault` — Varsayılan butonlarına tıklandığında `a.id` ve ilgili `'shipping'`/`'billing'` türü ile `makeDefault` fonksiyonunu çağırır.
  - `t` — Çeviri fonksiyonu; UI metinlerini yerelleştirir.
  - `MapPin`, `Edit2`, `Trash2`, `Truck`, `CreditCard`, `CheckCircle` — İkon bileşenleri (görsel amaçlı, fonksiyonel etkisi yok).
- **Dönüş**: `JSX.Element` (React bileşeni)

---

## NODE ID STANDARD

  file: src\views\account\AccountAddressesPage.tsx
  function: src\views\account\AccountAddressesPage.tsx::AccountAddressesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountAddressesPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-50`, `bg-gradient-to-r`, `bg-green-50`, `bg-primary-navy`, `bg-primary-navy/5`, `bg-slate-50`, `bg-slate-50/80`, `bg-white`, `border-b`, `border-blue-200`, `border-green-200`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-slate-300`
- **Layout:** `absolute`, `block`, `col-span-2`, `flex`, `flex-1`, `flex-col`, `from-slate-200`, `gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `gap-8`, `grid`, `grid-cols-1`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `focus:`, `group-hover:`, `hover:`, `lg:`, `md:`, `peer-checked:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `border`, `break-words`, `cursor-pointer`, `disabled:cursor-not-allowed`, `disabled:opacity-60`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/20`, `focus-visible:ring-primary-navy/50`, `focus-visible:ring-slate-200`, `focus:underline`, `font-bold`, `font-medium`, `group`