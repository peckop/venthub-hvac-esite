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
generated_at: 2026-06-19T20:48:21Z
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