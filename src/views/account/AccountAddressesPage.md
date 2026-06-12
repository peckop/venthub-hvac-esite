---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx
skeleton_hash: 4e76e0a93f138f4e
entity_hashes:
  func:AccountAddressesPage: c3066b52b6395a25
  overview: cfdfd55850a3c6f9
  style_tokens: 20e5949307a3284f
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
Bu modül, kullanıcının hesap adreslerini görüntülemesini ve yönetmesini sağlayan tek bir React sayfa bileşeninden oluşur. Adres listeleme, ekleme, düzenleme, silme ve varsayılan adres belirleme gibi tüm temel adres yönetim işlemlerini tek bir bileşen içinde merkezi olarak sunar. Modül, bağımsız bir hesap alt sayfası olarak çalışır ve gerekli verileri içinden veya bağlamdan (context) sağlar.

## Fonksiyon Grupları
### Adres Sayfası Yönetimi
Kullanıcının tüm adreslerini listeleme, yeni adres oluşturma, mevcut adresleri değiştirme ve silme, ayrıca bir adresi varsayılan olarak belirleme gibi temel CRUD işlemlerini ve ilgili arayüz durumlarını yöneten ana bileşen.
- AccountAddressesPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Verilen modülde yalnızca `AccountAddressesPage()` fonksiyon imzası ve `emptyForm` sabiti bulunmaktadır. Fonksiyon gövdesine erişim olmadığı için, modülün doğru çalışması için gerekli mimari varsayımlar (bağımlılıklar, veri yapıları, API çağrıları vb.) belirlenememiştir. AXIOMS'lerin üretilebilmesi için fonksiyon gövdesi kodunun sağlanması gerekmektedir.

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

### [N1_NASIL] AST Pointer: AccountAddressesPage::(anonim-yukle)
- **params**: (parametre yok — anonim ok arrow function)
- **ic_degiskenler**:
  - `setLoading(true)` / `setLoading(false)` — yükleme durumunu açar/kapatır, async işlemler sırasında UI loading göstergesi kontrol edilir
  - `data` — `listAddresses(supabaseBrowserClient)` çağrısının dönüş değeri; kullanıcının adres listesi (`UserAddress[]`)
  - `setItems(data)` — adres listesini state'e yazar, liste render'da kullanılır
  - `e` — try-catch yakalama bloğu, hata nesnesi; `console.error` ile loglanır
  - `supabaseBrowserClient` — import edilmiş Supabase istemci singleton'ı, API çağrılarına iletilir
  - `t('account.addresses.toasts.loadError')` — i18n çeviri fonksiyonu; hata toast mesajı için lokalize metin döndürür
  - `toast.error(...)` — sonner kütüphanesi ile kullanıcıya hata bildirimi gösterir
- **Dönüş**: yok (state setter'ları ile yan etki: `items`, `loading` güncellenir)

### [N2_NASIL] AST Pointer: AccountAddressesPage::startEdit
- **params**: `a: UserAddress` — düzenlenecek mevcut adres nesnesi
- **ic_degiskenler**:
  - `setForm({...})` — form state'ini `a` nesnesinin alanlarıyla doldurur; şu alanlar kopyalanır:
    - `a.id` — adresin benzersiz kimliği, düzenleme modunda kullanılır (`isEditing` koşulunu tetikler)
    - `a.label` — adres etiketi (ör. "Ev", "İş"); boşsa boş string
    - `a.full_name` — alıcı tam adı; boşsa boş string
    - `a.phone` — telefon numarası; boşsa boş string
    - `a.address_line` — açık adres satırı; boşsa boş string
    - `a.city` — il/ad; boşsa boş string
    - `a.district` — ilçe; boşsa boş string
    - `a.postal_code` — posta kodu; boşsa boş string
    - `a.country` — ülke kodu; boşsa varsayılan `'TR'`
    - `a.is_default_shipping` — varsayılan teslimat adresi mi; `?? false` ile undefined false'a düşer
    - `a.is_default_billing` — varsayılan fatura adresi mi; `?? false` ile undefined false'a düşer
  - `window.scrollTo({ top: 0, behavior: 'smooth' })` — mobilde form alanına kaydırma; tarayıcı DOM API çağrısı
- **Dönüş**: yok (yan etki: `form` state güncellenir, sayfa kaydırılır)

### [N3_NASIL] AST Pointer: AccountAddressesPage::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setForm({ ...emptyForm })` — form state'ini `emptyForm` sabitinin浅拷贝'sı ile sıfırlar
  - `emptyForm` — import edilmiş boş form nesnesi sabiti; tüm form alanlarının varsayılan değerlerini içerir
- **Dönüş**: yok (yan etki: `form` state sıfırlanır)

### [N4_NASIL] AST Pointer: AccountAddressesPage::handleSubmit
- **params**: `e: React.FormEvent` — form submit olay nesnesi
- **ic_degiskenler**:
  - `e.preventDefault()` — varsayılan form submit davranışını engeller (sayfa yenilenmesini önler)
  - `form.address_line` — form state'inden address_line alanı; doğrulama kontrolü yapılır (boş olamaz)
  - `form.city` — form state'inden city alanı; doğrulama kontrolü yapılır (boş olamaz)
  - `form.district` — form state'inden district alanı; doğrulama kontrolü yapılır (boş olamaz)
  - `t('account.addresses.toasts.requiredFields')` — zorunlu alan hatası için lokalize mesaj
  - `toast.error(...)` — doğrulama hatası kullanıcıya gösterilir
  - `user` — `useAuth()` hook'undan gelen kimlik bilgisi; null ise hata fırlatılır
  - `user.id` — kimlik doğrulanmış kullanıcının ID'si; yeni adres oluşturmada `user_id` alanına yazılır
  - `setSaving(true)` / `setSaving(false)` — kaydetme durumunu açar/kapatır; buton loading durumu kontrol edilir
  - `isEditing` — boolean; true ise güncelleme, false ise oluşturma dalına girilir
  - `form.id` — form state'inden mevcut adres ID'si; düzenleme modunda `updateAddress` çağrısına iletilir
  - `form.label` — adres etiketi; hem güncelleme hem oluşturma çağrısına iletilir
  - `form.full_name` — alıcı tam adı; hem güncelleme hem oluşturma çağrısına iletilir
  - `form.phone` — telefon numarası; hem güncelleme hem oluşturma çağrısına iletilir
  - `form.address_line` — açık adres; hem `address_line` hem `street_address` olarak haritalanır
  - `form.city` — il/ad; API çağrısına iletilir
  - `form.district` — ilçe; API çağrısına iletilir
  - `form.postal_code` — posta kodu; API çağrısına iletilir
  - `form.country` — ülke kodu; API çağrısına iletilir
  - `form.is_default_shipping` — varsayılan teslimat adresi bayrağı; API çağrısına iletilir
  - `form.is_default_billing` — varsayılan fatura adresi bayrağı; API çağrısına iletilir
  - `updateAddress(supabaseBrowserClient, form.id, {...})` — güncelleme API çağrısı; mevcut adresi patch eder
  - `createAddress(supabaseBrowserClient, {...})` — oluşturma API çağrısı; yeni adres ekler; `address_type` alanı `form.is_default_shipping` değerine göre `'shipping'` veya `'billing'` olarak haritalanır
  - `supabaseBrowserClient` — Supabase istemci singleton'ı; API fonksiyonlarına iletilir
  - `t('account.addresses.toasts.updated')` — güncelleme başarı mesajı (lokalize)
  - `t('account.addresses.toasts.created')` — oluşturma başarı mesajı (lokalize)
  - `toast.success(...)` — başarı bildirimi gösterir
  - `resetForm()` — formu sıfırlar (N3_NASIL fonksiyonu)
  - `refresh()` — adres listesini yeniden çeker (N1_NASIL ile aynı mantık)
  - `e` — catch bloğu hata nesnesi; `console.error` ile loglanır
  - `t('account.addresses.toasts.saveError')` — kaydetme hatası için lokalize mesaj
  - `toast.error(...)` — hata bildirimi gösterir
- **Dönüş**: yok (yan etki: `form` sıfırlanır, `items` yenilenir, `saving` sıfırlanır)

### [N5_NASIL] AST Pointer: AccountAddressesPage::handleDelete
- **params**: `id: string` — silinecek adresin benzersiz kimliği
- **ic_degiskenler**:
  - `confirm(t('account.addresses.toasts.confirmDelete') as string)` — tarayıcı onay dialogu; kullanıcı silme işlemini onaylamalı, onaylamazsa fonksiyon erken return ile çıkar
  - `t('account.addresses.toasts.confirmDelete')` — silme onay mesajı için lokalize metin; `as string` ile type assert edilir
  - `deleteAddress(supabaseBrowserClient, id)` — silme API çağrısı; belirtilen adresi veritabanından siler
  - `supabaseBrowserClient` — Supabase istemci singleton'ı
  - `toast.success(t('account.addresses.toasts.deleted'))` — silme başarı mesajı
  - `refresh()` — adres listesini yeniden çeker
  - `form.id` — mevcut form state'indeki adres ID'si; silinen adres düzenlemekteyse form sıfırlanır
  - `resetForm()` — formu sıfırlar (silen adres formda açıksa)
  - `e` — catch bloğu hata nesnesi; `console.error` ile loglanır
  - `t('account.addresses.toasts.deleteError')` — silme hatası için lokalize mesaj
- **Dönüş**: yok (yan etki: `items` yenilenir, `form` koşullu sıfırlanır)

### [N6_NASIL] AST Pointer: AccountAddressesPage::makeDefault
- **params**: `id: string` — varsayılan yapılacak adresin ID'si; `kind: 'shipping' | 'billing'` — hangi türün varsayılan olacağı
- **ic_degiskenler**:
  - `setDefaultAddress(supabaseBrowserClient, kind, id)` — API çağrısı; belirtilen adresi belirtilen türde varsayılan yapar
  - `supabaseBrowserClient` — Supabase istemci singleton'ı
  - `toast.success(...)` — başarı bildirimi; `kind === 'shipping'` koşuluyla farklı lokalize mesaj gösterir
  - `t('account.addresses.toasts.defaultSetShipping')` — teslimat varsayılan ayarlama başarı mesajı
  - `t('account.addresses.toasts.defaultSetBilling')` — fatura varsayılan ayarlama başarı mesajı
  - `refresh()` — adres listesini yeniden çeker (varsayılan bayrakları güncellemek için)
  - `e` — catch bloğu hata nesnesi; `console.error` ile loglanır
  - `t('account.addresses.toasts.updateError')` — güncelleme hatası için lokalize mesaj
- **Dönüş**: yok (yan etki: `items` yenilenir)

### [N7_NASIL] AST Pointer: AccountAddressesPage::(anonim-render)
- **params**: `a` — `UserAddress` tipinde tek bir adres nesnesi; liste render'ında her eleman için çağrılır
- **ic_degiskenler**:
  - `a.id` — adresin benzersiz kimliği; React `key` prop'u olarak kullanılır ve buton onClick handler'larına iletilir
  - `a.label` — adres etiketi (ör. "Ev", "İş"); başlık olarak gösterilir, boşsa `t('account.addresses.unregistered')` fallback gösterilir
  - `a.full_name` — alıcı tam adı; koşullu olarak render edilir (boşsa gösterilmez)
  - `a.address_line` — açık adres satırı; ana adres gösterimi
  - `a.district` — ilçe adı; alt bilgi satırında gösterilir
  - `a.city` — il/ad; alt bilgi satırında gösterilir
  - `a.postal_code` — posta kodu; boşsa boş string fallback ile gösterilir
  - `a.phone` — telefon numarası; koşullu olarak render edilir (boşsa gösterilmez)
  - `a.is_default_shipping` — boolean; true ise yeşil "Varsayılan" badge gösterilir, false ise "Varsayılan Yap" butonu gösterilir
  - `a.is_default_billing` — boolean; true ise mavi "Varsayılan" badge gösterilir, false ise "Varsayılan Yap" butonu gösterilir
  - `t(...)` — i18n çeviri fonksiyonu; çok farklı lokalize metin anahtarı ile çağrılır (badge metinleri, buton başlıkları, etiket fallback'leri)
  - `startEdit(a)` — düzenle butonu onClick handler'ı; düzenlenecek adresi form state'e aktarır
  - `handleDelete(a.id)` — sil butonu onClick handler'ı; adres ID'si ile silme işlemini başlatır
  - `makeDefault(a.id, 'shipping')` — teslimat varsayılan yap butonu onClick handler'ı
  - `makeDefault(a.id, 'billing')` — fatura varsayılan yap butonu onClick handler'ı
- **Dönüş**: JSX — tek bir adres kartı (`<div>`) JSX elemanı döndürür;.address_card

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