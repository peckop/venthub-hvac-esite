---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx
skeleton_hash: 6a35ab6f5cca3044
entity_hashes:
  func:AccountAddressesPage: 8a10c2ba61747811
  overview: cfdfd55850a3c6f9
  style_tokens: 20e5949307a3284f
generated_at: 2026-06-14T17:21:46Z
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
**Ne yapar**: Kullanıcının hesap ayarları içindeki adres yönetimi sayfasını render eden React fonksiyonel bileşenidir. Kullanıcının tüm adreslerini listeler, yeni adres oluşturabilir, mevcut adresleri düzenleyebilir, silebilir ve varsayılan gönderim/fatura adresini belirleyebilir.

**Nasıl yapar**: Fonksiyon, React hooks kullanarak durum yönetimi ve yaşam döngüsü yönetimini sağlar. `useState` ile form durumu, yüklenme durumu ve adres listesi için state'ler oluşturur. `useEffect` ile bileşen yüklendiğinde ve `refresh` callback'i değiştiğinde otomatik olarak adresleri yükler. `useMemo` ile formun düzenleme modunda olup olmadığını hesaplar. Asenkron fonksiyonlar (`refresh`, `handleSubmit`, `handleDelete`, `makeDefault`) Supabase veritabanı istemcisi ile iletişim kurarak CRUD işlemlerini yönetir. `useI18n` hook'u ile uluslararasılaştırma, `useAuth` hook'u ile kimlik doğrulama yapılır. Bileşen, responsive bir form ve adres kartları listesini JSX ile render eder.

**Parametreler**: Yok

**Dönüş**: `JSX.Element` - Sayfanın tamamını temsil eden React bileşen yapısı. Bileşen, adres formu (düzenleme/yeni oluşturma) ve adres listesi bölümlerinden oluşan bir layout döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/ui-models::type { UserAddress }
- import: lucide-react::CheckCircle
- import: lucide-react::CreditCard
- import: lucide-react::Edit2
- import: lucide-react::Loader2
- import: lucide-react::MapPin
- import: lucide-react::Plus
- import: lucide-react::Trash2
- import: lucide-react::Truck
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useState
- import: sonner::toast

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

### [N1_NASIL] AST Pointer: AccountAddressesPage.tsx::loadAddresses (anonymous async)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading(true)` — loading state'i true yapar, spinner gösterir
  - `data` — `listAddresses(supabaseBrowserClient)` çağrısından dönen `UserAddress[]` dizisi, kullanıcının tüm adresleri
  - `setItems(data)` — adres listesini React state'e yazar, listeyi render eder
  - `e` — catch bloğunda yakalanan hata nesnesi
  - `console.error(e)` — hatayı konsola yazdırır
  - `toast.error(...)` — kullanıcıya hata toast mesajı gösterir, `t('account.addresses.toasts.loadError')` çeviri anahtarı
  - `setLoading(false)` — finally bloğunda loading'i kapatır
- **Dönüş**: yok (state setter'ları ve side effect'ler tetiklenir)

---

### [N2_NASIL] AST Pointer: AccountAddressesPage.tsx::startEdit
- **params**: `(a: UserAddress)` — düzenlenecek mevcut adres nesnesi
- **ic_degiskenler**:
  - `setForm({...})` — form state'ini `a` parametresinden gelen değerlerle doldurur
  - `a.id` — adresin benzersiz kimliği, formun `id` alanına yazılır
  - `a.label` — adres etiketi (ör. "Ev", "İş"), boşsa boş string fallback
  - `a.full_name` — alıcı tam adı, fallback boş string
  - `a.phone` — telefon numarası, fallback boş string
  - `a.address_line` — ana adres satırı (sokak, bina, daire), fallback boş string
  - `a.city` — şehir adı, fallback boş string
  - `a.district` — ilçe adı, fallback boş string
  - `a.postal_code` — posta kodu, fallback boş string
  - `a.country` — ülke kodu, fallback `'TR'`
  - `a.is_default_shipping` — varsayılan kargo adresi mi, `?? false` ile fallback
  - `a.is_default_billing` — varsayılan fatura adresi mi, `?? false` ile fallback
  - `window.scrollTo({ top: 0, behavior: 'smooth' })` — mobilde form alanına kaydırır
- **Dönüş**: yok (form state'i güncellenir, scroll tetiklenir)

---

### [N3_NASIL] AST Pointer: AccountAddressesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `emptyForm` — modül seviyesinde tanımlı sabit boş form nesnesi
  - `setForm({ ...emptyForm })` — form state'ini `emptyForm`'un sığ kopyasıyla sıfırlar
- **Dönüş**: yok (form state'i sıfırlanır)

---

### [N4_NASIL] AST Pointer: AccountAddressesPage.tsx::handleSubmit
- **params**: `(e: React.FormEvent)` — form submit olay nesnesi
- **ic_degiskenler**:
  - `e.preventDefault()` — formun varsayılan sayfa yenileme davranışını engeller
  - `form.address_line` — form alanları doğrulanır, zorunlu alan
  - `form.city` — form alanları doğrulanır, zorunlu alan
  - `form.district` — form alanları doğrulanır, zorunlu alan
  - `t('account.addresses.toasts.requiredFields')` — zorunlu alan hatası için çeviri mesajı
  - `user` — `useAuth` hook'undan gelen kimlik doğrulanmış kullanıcı nesnesi, null ise `throw`
  - `user.id` — kullanıcının benzersiz kimliği, yeni adres oluştururken `user_id` olarak gönderilir
  - `setSaving(true)` — kaydetme yüklenme durumunu aktif eder
  - `isEditing` — boolean state, düzenleme modunda olup olmadığını belirler
  - `form.id` — mevcut formun düzenlenecek adres kimliği, düzenleme modunda kullanılır
  - `form.label` — adres etiketi
  - `form.full_name` — alıcı tam adı
  - `form.phone` — telefon numarası
  - `form.address_line` — ana adres satırı
  - `form.city` — şehir
  - `form.district` — ilçe
  - `form.postal_code` — posta kodu
  - `form.country` — ülke kodu
  - `form.is_default_shipping` — varsayılan kargo adresi flag'i
  - `form_is_default_billing` — varsayılan fatura adresi flag'i
  - `updateAddress(supabaseBrowserClient, form.id, {...})` — mevcut adresi günceller, düzenleme modunda çağrılır
  - `createAddress(supabaseBrowserClient, {...})` — yeni adres oluşturur, oluşturma modunda çağrılır
  - `address_type` — `form.is_default_shipping` değerine göre `'shipping'` veya `'billing'` olarak belirlenir
  - `street_address` — `form.address_line`'ın kopyası olarak harita alanı olarak da gönderilir
  - `is_default_shipping || false` — oluşturmada fallback ile `false` zorlanır
  - `is_default_billing || false` — oluşturmada fallback ile `false` zorlanır
  - `resetForm()` — başarılı kayıt sonrası formu sıfırlar
  - `refresh()` — adres listesini yeniden yükler
  - `e` — catch bloğunda yakalanan hata nesnesi
  - `console.error(e)` — hatayı konsola yazar
  - `toast.error(...)` — kullanıcıya hata mesajı gösterir
  - `setSaving(false)` — finally bloğunda kaydetme durumunu kapatır
  - `toast.success(...)` — başarılı güncelleme/oluşturma mesajı gösterir
- **Dönüş**: yok (API çağrıları, state güncellemeleri ve toast mesajları tetiklenir)

---

### [N5_NASIL] AST Pointer: AccountAddressesPage.tsx::handleDelete
- **params**: `(id: string)` — silinecek adresin benzersiz kimliği
- **ic_degiskenler**:
  - `confirm(t('account.addresses.toasts.confirmDelete') as string)` — tarayıcı onay dialogu, kullanıcı silme işlemini onaylamalı
  - `deleteAddress(supabaseBrowserClient, id)` — API çağrısı ile adresi siler
  - `refresh()` — silme sonrası adres listesini yeniden yükler
  - `form.id` — şu an düzenlenen adresin kimliği, silinen adresle eşleşiyorsa formu sıfırlar
  - `resetForm()` — silinen adres düzenlemeye açıksa formu temizler
  - `e` — catch bloğunda yakalanan hata nesnesi
  - `console.error(e)` — hatayı konsola yazar
  - `toast.error(...)` — kullanıcıya hata mesajı gösterir
  - `toast.success(...)` — başarılı silme mesajı gösterir
- **Dönüş**: yok (API çağrısı, state güncelleme ve toast mesajları tetiklenir)

---

### [N6_NASIL] AST Pointer: AccountAddressesPage.tsx::makeDefault
- **params**: `(id: string, kind: 'shipping' | 'billing')` — adres kimliği ve tür ('shipping' veya 'billing')
- **ic_degiskenler**:
  - `setDefaultAddress(supabaseBrowserClient, kind, id)` — API çağrısı ile belirtilen adresi belirtilen türde varsayılan yapar
  - `kind` — `'shipping'` veya `'billing'`, hangi kategoride varsayılan yapılacağını belirler
  - `t('account.addresses.toasts.defaultSetShipping')` — kargo varsayılan başarı mesajı çevirisi
  - `t('account.addresses.toasts.defaultSetBilling')` — fatura varsayılan başarı mesajı çevirisi
  - `kind === 'shipping' ? ... : ...` — ternary ile uygun başarı toast mesajı seçilir
  - `refresh()` — değişiklik sonrası adres listesini yeniden yükler
  - `e` — catch bloğunda yakalanan hata nesnesi
  - `console.error(e)` — hatayı konsola yazar
  - `toast.error(...)` — kullanıcıya hata mesajı gösterir
  - `toast.success(...)` — başarılı güncelleme mesajı gösterir
- **Dönüş**: yok (API çağrısı, state güncelleme ve toast mesajları tetiklenir)

---

### [N7_NASIL] AST Pointer: AccountAddressesPage.tsx::renderAddressCard (arrow function)
- **params**: `(a: UserAddress)` — render edilecek adres nesnesi
- **ic_degiskenler**:
  - `a.id` — adres kimliği, React `key` prop'u olarak kullanılır; `startEdit`, `handleDelete`, `makeDefault` çağrılarında parametre olarak geçirilir
  - `a.label` — adres etiketi, başlık olarak gösterilir; boşsa `t('account.addresses.unregistered')` çevirisi fallback kullanılır
  - `a.full_name` — alıcı tam adı, koşullu olarak (`a.full_name &&`) render edilir
  - `a.address_line` — ana adres satırı, satır aralığıyla (`whitespace-pre-line`) gösterilir
  - `a.district` — ilçe adı, `t('account.addresses.cityLine')` çevirisi içinde template ile yerleştirilir
  - `a.city` — şehir adı, `t('account.addresses.cityLine')` çevirisi içinde template ile yerleştirilir
  - `a.postal_code` — posta kodu, boşsa boş string fallback ile `t('account.addresses.cityLine')` içinde gösterilir
  - `a.phone` — telefon numarası, koşullu olarak (`a.phone &&`) render edilir
  - `a.is_default_shipping` — boolean, true ise yeşil "Varsayılan" badge'i, false ise "Varsayılan Yap" butonu render edilir
  - `a.is_default_billing` — boolean, true ise mavi "Varsayılan" badge'i, false ise "Varsayılan Yap" butonu render edilir
  - `startEdit(a)` — düzenle butonu `onClick` handler'ı, adresi form alanına yükler
  - `handleDelete(a.id)` — sil butonu `onClick` handler'ı, adresi siler
  - `makeDefault(a.id, 'shipping')` — kargo "Varsayılan Yap" butonu `onClick` handler'ı
  - `makeDefault(a.id, 'billing')` — fatura "Varsayılan Yap" butonu `onClick` handler'ı
  - `t('account.addresses.shipping')` — kargo etiketi çevirisi
  - `t('account.addresses.billing')` — fatura etiketi çevirisi
  - `t('account.addresses.defaultTag')` — "Varsayılan" badge metni çevirisi
  - `t('account.addresses.makeDefault')` — "Varsayılan Yap" buton metni çevirisi
  - `t('admin.ui.edit')` — düzenle butonu `title` tooltip çevirisi
  - `t('admin.ui.delete')` — sil butonu `title` tooltip çevirisi
- **Dönüş**: JSX (`div` elemanı) — tek bir adres kartının render edilmiş görünümü

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