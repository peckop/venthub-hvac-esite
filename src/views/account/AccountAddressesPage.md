---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx
skeleton_hash: 4c2211bf85ba07b7
entity_hashes:
  func:AccountAddressesPage: 75c0fb5d7175a123
  overview: 1f8e4efb1355258a
  style_tokens: 20e5949307a3284f
generated_at: 2026-06-06T21:56:44Z
---

## Genel Bakış
Kullanıcının hesap adreslerini görüntülemesini ve yönetmesini sağlayan bir React bileşeni sayfasıdır. Adres ekleme, düzenleme, silme ve varsayılan belirleme gibi temel adres yönetim işlemlerini tek bir bileşen içinde sunar.

## Fonksiyon Grupları
### Adres Sayfası Yönetimi
Kullanıcının tüm adreslerini listeleme, yeni adres oluşturma, mevcut adresleri düzenleme ve silme, ayrıca bir adresi varsayılan olarak belirleme gibi temel CRUD işlemlerini ve ilgili UI durumlarını yöneten ana bileşen.
- AccountAddressesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kullanıcının hesap adreslerini görüntülemesini ve yönetmesini sağlayan React sayfa bileşenidir.

[Aksiyom 1]: Eğer `emptyForm` sabiti (boş form yapısı) tanımlı değilse veya geçerli bir nesne yapısına sahip değilse, adres ekleme/düzenleme formu başlatılamaz.

[Aksiyom 2]: Eğer kullanıcı oturum açmamışsa veya yetkilendirme bilgisi yoksa, hesap adresleri sayfasına erişim sağlanamaz.

[Aksiyom 3]: Eğer adres verileri API'den başarıyla çekilemezse, kullanıcıya boş liste veya hata durumu gösterilir.

[Aksiyom 4]: Eğer form gönderilirken zorunlu alanlar boş bırakılırsa, form gönderimi engellenir.

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

### [N1_NASIL] AST Pointer: AccountAddressesPage.tsx::loadAddresses
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` — State setter, yükleme durumunu true yapar
  - `listAddresses` — API çağrısı, tüm adresleri getirir
  - `setItems` — State setter, gelen adres verisini items state'ine atar
  - `toast` — Toast notification nesnesi
  - `t` — Çeviri fonksiyonu
  - `e` — Catch bloğunda yakalanan hata nesnesi
  - `data` — listAddresses() dönüş değeri, adres listesi
- **Dönüş**: Promise<void> (async fonksiyon)

### [N2_NASIL] AST Pointer: AccountAddressesPage.tsx::startEdit
- **params**: (a: UserAddress)
- **ic_degiskenler**:
  - `setForm` — State setter, form verilerini günceller
  - `a` — Parametre, düzenlenecek UserAddress nesnesi
  - `a.id` — Adresin benzersiz kimliği
  - `a.label` — Adres etiketi
  - `a.full_name` — Tam ad bilgisi
  - `a.phone` — Telefon numarası
  - `a.address_line` — Adres satırı
  - `a.city` — Şehir
  - `a.district` — İlçe
  - `a.postal_code` — Posta kodu
  - `a.country` — Ülke kodu
  - `a.is_default_shipping` — Varsayılan teslimat adresi mi
  - `a.is_default_billing` — Varsayılan fatura adresi mi
  - `window` — Pencere nesnesi (scrollTo için)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: AccountAddressesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setForm` — State setter, formu sıfırlar
  - `emptyForm` — Boş form nesnesi sabiti
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: AccountAddressesPage.tsx::handleSubmit
- **params**: (e: React.FormEvent)
- **ic_degiskenler**:
  - `e` — Form submit event nesnesi
  - `form` — Form state'i, adres verilerini içerir
  - `form.address_line` — Adres satırı (doğrulama için kontrol)
  - `form.city` — Şehir (doğrulama için kontrol)
  - `form.district` — İlçe (doğrulama için kontrol)
  - `form.id` — Düzenleme modunda adres kimliği
  - `t` — Çeviri fonksiyonu
  - `toast` — Toast notification nesnesi
  - `user` — Auth context'ten kullanıcı nesnesi
  - `user.id` — Kullanıcı kimliği
  - `isEditing` — Düzenleme modu state'i
  - `updateAddress` — API çağrısı, adresi günceller
  - `createAddress` — API çağrısı, yeni adres oluşturur
  - `resetForm` — Form sıfırlama fonksiyonu
  - `refresh` — Verileri yenileme fonksiyonu
  - `setSaving` — State setter, kaydetme durumunu yönetir
- **Dönüş**: Promise<void> (async fonksiyon)

### [N5_NASIL] AST Pointer: AccountAddressesPage.tsx::handleDelete
- **params**: (id: string)
- **ic_degiskenler**:
  - `id` — Parametre, silinecek adres kimliği
  - `t` — Çeviri fonksiyonu
  - `confirm` — Kullanıcı onay dialog fonksiyonu
  - `deleteAddress` — API çağrısı, adresi siler
  - `toast` — Toast notification nesnesi
  - `refresh` — Verileri yenileme fonksiyonu
  - `form` — Form state'i
  - `form.id` — Mevcut formdaki adres kimliği
  - `resetForm` — Form sıfırlama fonksiyonu
- **Dönüş**: Promise<void> (async fonksiyon)

### [N6_NASIL] AST Pointer: AccountAddressesPage.tsx::makeDefault
- **params**: (id: string, kind: 'shipping' | 'billing')
- **ic_degiskenler**:
  - `id` — Parametre, varsayılan yapılacak adres kimliği
  - `kind` — Parametre, adres türü (shipping veya billing)
  - `setDefaultAddress` — API çağrısı, varsayılan adresi ayarlar
  - `t` — Çeviri fonksiyonu
  - `toast` — Toast notification nesnesi
  - `refresh` — Verileri yenileme fonksiyonu
- **Dönüş**: Promise<void> (async fonksiyon)

### [N7_NASIL] AST Pointer: AccountAddressesPage.tsx::renderAddressCard
- **params**: (a: UserAddress)
- **ic_degiskenler**:
  - `a` — Parametre, render edilecek UserAddress nesnesi
  - `a.id` — Adres kimliği (key ve butonlar için)
  - `a.label` — Adres etiketi (görünen ad)
  - `a.full_name` — Tam ad
  - `a.address_line` — Adres satırı
  - `a.district` — İlçe
  - `a.city` — Şehir
  - `a.postal_code` — Posta kodu
  - `a.phone` — Telefon
  - `a.is_default_shipping` — Varsayılan teslimat adresi durumu
  - `a.is_default_billing` — Varsayılan fatura adresi durumu
  - `t` — Çeviri fonksiyonu
  - `startEdit` — Düzenleme başlatma fonksiyonu
  - `handleDelete` — Silme işlemini tetikler
  - `makeDefault` — Varsayılan yapma fonksiyonu
  - `MapPin` — Lucide ikonu
  - `Edit2` — Lucide ikonu
  - `Trash2` — Lucide ikonu
  - `Truck` — Lucide ikonu
  - `CheckCircle` — Lucide ikonu
  - `CreditCard` — Lucide ikonu
- **Dönüş**: JSX Element (React component)

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