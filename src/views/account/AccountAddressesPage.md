---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx
skeleton_hash: 394b402a26fb5307
entity_hashes:
  func:AccountAddressesPage: 75c0fb5d7175a123
  overview: 4b1d634aa140bb3a
  style_tokens: 20e5949307a3284f
generated_at: 2026-05-29T18:51:43Z
---

## Genel Bakış
Kullanıcının hesap adreslerini görüntülemesini ve yönetmesini sağlayan bir sayfa bileşeni. Adres ekleme, düzenleme, silme ve varsayılan belirleme gibi temel adres yönetim işlemlerini tek bir bileşen içerisinde sunar.

## Fonksiyon Grupları
### Adres Sayfası Yönetimi
Tüm adres yönetim arayüzünü ve iş mantığını içeren ana bileşen. Veri çekme, form yönetimi ve kullanıcı etkileşimlerini merkezi olarak ele alır.
- AccountAddressesPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül, kullanıcının kayıtlı adreslerini görüntüleyip yönetmesini sağlayan bir sayfa bileşenidir.

[Aksiyom 1]: Eğer `emptyForm` sabiti (boş form yapısı) tanımlı değilse, yeni adres eklenirken form alanları başlatılamaz ve kullanıcı form dolduramaz.
[Aksiyom 2]: Eğer bileşen, kullanıcının adreslerini almak için dış bir API servisine veya veri kaynağına erişemiyorsa, adres listesi boş görüntülenir veya bileşen hata verir.
[Aksiyom 3]: Eğer bileşen, kullanıcı oturum açmamış veya kimlik doğrulaması yapılmamış durumdaysa, kullanıcıya ait adresler yüklenemez ve sayfa hata durumuna geçer.

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

### [N1_NASIL] AST Pointer: AccountAddressesPage.tsx::AccountAddressesPage
- **params**: (yok)
- **ic_degiskenler**:
  - `emptyForm` — Import edilen, formun başlangıç değerlerini tutan sabit nesne
- **Dönüş**: yok (JSX return eder, fonksiyon imzası yok olarak belirtilmiş)

### [N2_NASIL] AST Pointer: AccountAddressesPage.tsx::AnonymousFunction_0 (loadAddresses)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — listAddresses() API çağrısının dönüş değeri, kullanıcı adreslerinin listesi
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: AccountAddressesPage.tsx::startEdit
- **params**: `(a: UserAddress)` — Düzenlenecek adres objesi
- **ic_degiskenler**:
  - `a` — Parametre olarak gelen UserAddress objesi, tüm adres alanlarını içerir
  - `a.id` — Adresin benzersiz kimliği
  - `a.label` — Adres etiketi (ör: "Ev", "İş")
  - `a.full_name` — Adres sahibinin tam adı
  - `a.phone` — Telefon numarası
  - `a.address_line` — Adres satırı
  - `a.city` — Şehir
  - `a.district` — İlçe
  - `a.postal_code` — Posta kodu
  - `a.country` — Ülke kodu
  - `a.is_default_shipping` — Varsayılan teslimat adresi mi
  - `a.is_default_billing` — Varsayılan fatura adresi mi
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: AccountAddressesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: AccountAddressesPage.tsx::handleSubmit
- **params**: `(e: React.FormEvent)` — Form submit olay nesnesi
- **ic_degiskenler**:
  - `e` — Form submit olayı, preventDefault() ile varsayılan davranış engellenir
  - `form` — Form state'inden gelen mevcut form verisi
  - `form.address_line` — Adres satırı (zorunlu alan kontrolü yapılır)
  - `form.city` — Şehir (zorunlu alan kontrolü yapılır)
  - `form.district` — İlçe (zorunlu alan kontrolü yapılır)
  - `form.id` — Düzenleme modunda ise mevcut adresin ID'si
  - `isEditing` — Düzenleme modunda olup olmadığı (form.id varsa true)
  - `user` — Kimlik doğrulanmış kullanıcı objesi
  - `user.id` — Kullanıcının benzersiz kimliği
  - `form.label` — Adres etiketi
  - `form.full_name` — Tam ad
  - `form.phone` — Telefon
  - `form.postal_code` — Posta kodu
  - `form.country` — Ülke
  - `form.is_default_shipping` — Varsayılan teslimat adresi bayrağı
  - `form.is_default_billing` — Varsayılan fatura adresi bayrağı
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: AccountAddressesPage.tsx::handleDelete
- **params**: `(id: string)` — Silinecek adresin ID'si
- **ic_degiskenler**:
  - `id` — Silinecek adresin benzersiz kimliği
  - `form` — Form state'inden gelen mevcut form verisi
  - `form.id` — Mevcut formda düzenlenecek adresin ID'si (silinen adres ile aynı ise form sıfırlanır)
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: AccountAddressesPage.tsx::makeDefault
- **params**: `(id: string, kind: 'shipping' | 'billing')` — Adres ID'si ve adres türü
- **ic_degiskenler**:
  - `id` — Varsayılan yapılacak adresin benzersiz kimliği
  - `kind` — Adres türü ('shipping' veya 'billing')
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: AccountAddressesPage.tsx::AnonymousJSXFunction (addressCard)
- **params**: `(a)` — UserAddress objesi (JSX içinde kullanılır)
- **ic_degiskenler**:
  - `a` — Adres objesi, tüm alanları JSX içinde erişilir
  - `a.id` — Adresin benzersiz kimliği (butonlarda key ve onClick için kullanılır)
  - `a.label` — Adres etiketi (gösterilir)
  - `a.full_name` — Tam ad (gösterilir)
  - `a.address_line` — Adres satırı (gösterilir)
  - `a.district` — İlçe (gösterilir)
  - `a.city` — Şehir (gösterilir)
  - `a.postal_code` — Posta kodu (gösterilir)
  - `a.phone` — Telefon (gösterilir)
  - `a.is_default_shipping` — Varsayılan teslimat adresi mi (badge gösterilir veya buton)
  - `a.is_default_billing` — Varsayılan fatura adresi mi (badge gösterilir veya buton)
- **Dönüş**: JSX (adres kartı)

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