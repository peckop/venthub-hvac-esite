---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx
skeleton_hash: 6fe726e89ba95c44
entity_hashes:
  func:AccountAddressesPage: c3066b52b6395a25
  overview: fbf2bafbca772acf
  style_tokens: 20e5949307a3284f
generated_at: 2026-06-07T12:12:05Z
---

## Genel Bakış
Bu modül, kullanıcının hesap adreslerini görüntülemesini ve yönetmesini sağlayan tek bir React sayfa bileşeninden oluşur. Adres listeleme, ekleme, düzenleme, silme ve varsayılan adres belirleme gibi tüm temel adres yönetim işlemlerini tek bir bileşen içinde merkezi olarak sunar.

## Fonksiyon Grupları
### Adres Sayfası Yönetimi
Kullanıcının tüm adreslerini listeleme, yeni adres oluşturma, mevcut adresleri düzenleme ve silme, ayrıca bir adresi varsayılan olarak belirleme gibi temel CRUD işlemlerini ve ilgili arayüz durumlarını yöneten ana bileşen.
- AccountAddressesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kullanıcının hesap adreslerini görüntülemesini ve yönetmesini sağlayan bağımsız bir React sayfa bileşenidir.

[Aksiyom 1]: Eğer bileşen dışarıdan prop almıyorsa (fonksiyon imzası parametresiz), tüm adres verileri ve işlevsellik modül içinden (API çağrıları, context, store) sağlanmalıdır.

[Aksiyom 2]: Eğer `emptyForm` sabiti tanımlı değilse veya boş/bozuk bir nesne ise, yeni adres formu başlatılamaz ve form bileşeni beklenmeyen duruma düşer.

[Aksiyom 3]: Eğer `emptyForm` nesnesi undefined veya null ise, form bileşeninin initial state'i tanımsız olacağından, form alanlarıcontrolled bileşenlerde hata oluşur veya boş gösterilir.

[Aksiyom 4]: Eğer bu sayfa modülü bir hesap alt sayfası olarak çalışıyorsa, kullanıcı kimlik bilgilerinin (auth token vb.) üst seviye bir context/provider tarafından sağlanıyor olması gerekir; aksi halde API çağrıları başarısız olur.

---

## FONKSİYON DETAYLARI

### AccountAddressesPage

**Ne yapar**: Kullanıcının hesap adreslerini listeleme, ekleme, düzenleme, silme ve varsayılan olarak ayarlama işlemlerini yöneten ana React bileşenidir. Sayfa; sol tarafta adres listesini, sağ tarafta ise adres formunu (mobilde üstte) gösteren dual-panel bir arayüz sunar.

**Nasıl yapar**: `useAuth` hook'uyla oturum açmış kullanıcıyı, `useI18n` hook'uyla çeviri fonksiyonunu alır. Adres verileri `listAddresses` API'si üzerinden Supabase'den çekilir. Form durumu `useState` ile yönetilir, düzenleme modu `isEditing` memo'su ile belirlenir. CRUD işlemleri (`createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`) asenkron olarak yürütülür ve her işlem sonrası `refresh` fonksiyonu ile liste yenilenir. Bileşen, mobilde formun üstte, masaüstünde sağda olduğu responsive bir layout kullanır.

**Parametreler**:
- Bu bileşen herhangi bir prop almaz (props'suz fonksiyonel bileşen)

**Dönüş**: `JSX.Element` — Kullanıcı adreslerini yönetmeye yarayan tam sayfa arayüzü döndürür.

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

### [N1_NASIL] AST Pointer: src/views/account/AccountAddressesPage.tsx::AccountAddressesPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — listAddresses API çağrısından dönen UserAddress listesi
  - `e` — try-catch yapısında yakalanan hata nesnesi
- **Dönüş**: JSX (React bileşeni)

### [N2_NASIL] AST Pointer: src/views/account/AccountAddressesPage.tsx::startEdit
- **params**: `a` — UserAddress tipinde, düzenlenecek adres nesnesi
- **ic_degiskenler**:
  - `a.id` — adresin benzersiz tanımlayıcısı
  - `a.label` — adres etiketi (ör: "Ev", "İş")
  - `a.full_name` — tam ad
  - `a.phone` — telefon numarası
  - `a.address_line` — adres satırı
  - `a.city` — şehir
  - `a.district` — ilçe
  - `a.postal_code` — posta kodu
  - `a.country` — ülke kodu
  - `a.is_default_shipping` — varsayılan kargo adresi mi
  - `a.is_default_billing` — varsayılan fatura adresi mi
- **Dönüş**: void (yan etki: form state'ini günceller, sayfayı yukarı kaydırır)

### [N3_NASIL] AST Pointer: src/views/account/AccountAddressesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (yan etki: form state'ini emptyForm ile sıfırlar)

### [N4_NASIL] AST Pointer: src/views/account/AccountAddressesPage.tsx::handleSubmit
- **params**: `e` — React.FormEvent, form submit olayı
- **ic_degiskenler**:
  - `form.address_line` — formdaki adres satırı değeri
  - `form.city` — formdaki şehir değeri
  - `form.district` — formdaki ilçe değeri
  - `user` — useAuth hook'tan gelen kullanıcı nesnesi
  - `isEditing` — düzenleme modunda olup olmadığını belirleyen boolean state
  - `form.id` — düzenleme modunda ise mevcut adresin ID'si
  - `form.label` — formdaki etiket değeri
  - `form.full_name` — formdaki tam ad değeri
  - `form.phone` — formdaki telefon değeri
  - `form.postal_code` — formdaki posta kodu değeri
  - `form.country` — formdaki ülke kodu değeri
  - `form.is_default_shipping` — formdaki kargo varsayılanı durumu
  - `form.is_default_billing` — formdaki fatura varsayılanı durumu
  - `e.preventDefault()` — form submit varsayılan davranışını engeller
  - `user.id` — kullanıcının benzersiz tanımlayıcısı
  - `setSaving` — kaydetme durumunu güncelleyen state setter
  - `resetForm` — formu sıfırlayan fonksiyon
  - `refresh` — adres listesini yenileyen fonksiyon
  - `console.error(e)` — hata durumunda konsola log yazar
- **Dönüş**: void (yan etki: form submit eder, API çağrısı yapar, toast bildirimleri gösterir)

### [N5_NASIL] AST Pointer: src/views/account/AccountAddressesPage.tsx::handleDelete
- **params**: `id` — string, silinecek adresin benzersiz tanımlayıcısı
- **ic_degiskenler**:
  - `confirm(...)` — silme onayı için browser onay dialogu
  - `form.id` — form state'indeki mevcut adres ID'si
  - `refresh` — adres listesini yenileyen fonksiyon
  - `resetForm` — formu sıfırlayan fonksiyon
  - `console.error(e)` — hata durumunda konsola log yazar
- **Dönüş**: void (yan etki: adres siler, toast bildirimi gösterir)

### [N6_NASIL] AST Pointer: src/views/account/AccountAddressesPage.tsx::makeDefault
- **params**: 
  - `id` — string, varsayılan yapılacak adresin benzersiz tanımlayıcısı
  - `kind` — 'shipping' | 'billing', adres türü
- **ic_degiskenler**:
  - `kind === 'shipping'` — kargo türü kontrolü
  - `kind === 'billing'` — fatura türü kontrolü
  - `refresh` — adres listesini yenileyen fonksiyon
  - `console.error(e)` — hata durumunda konsola log yazar
- **Dönüş**: void (yan etki: varsayılan adresi belirler, toast bildirimi gösterir)

### [N7_NASIL] AST Pointer: src/views/account/AccountAddressesPage.tsx::(a) => (JSX)
- **params**: `a` — UserAddress tipinde, render edilecek adres nesnesi
- **ic_degiskenler**:
  - `a.id` — adresin benzersiz tanımlayıcısı (key olarak kullanılır)
  - `a.label` — adres etiketi (gösterim için)
  - `a.full_name` — tam ad (gösterim için)
  - `a.address_line` — adres satırı (gösterim için)
  - `a.district` — ilçe (gösterim için)
  - `a.city` — şehir (gösterim için)
  - `a.postal_code` — posta kodu (gösterim için)
  - `a.phone` — telefon numarası (gösterim için)
  - `a.is_default_shipping` — kargo varsayılan durumu (badge gösterimi için)
  - `a.is_default_billing` — fatura varsayılan durumu (badge gösterimi için)
  - `startEdit(a)` — düzenleme butonu onClick handler'ı
  - `handleDelete(a.id)` — silme butonu onClick handler'ı
  - `makeDefault(a.id, 'shipping')` — kargo varsayılan yapma butonu handler'ı
  - `makeDefault(a.id, 'billing')` — fatura varsayılan yapma butonu handler'ı
  - `t(...)` — i18n çeviri fonksiyonu
- **Dönüş**: JSX (React bileşeni)

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