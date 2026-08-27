---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\account\AccountInvoicesPage.tsx
skeleton_hash: 89f17dadafaa44e6
entity_hashes:
  func:AccountInvoicesPage: f5f2f51606b21a99
  overview: d0d3eb909783a960
  style_tokens: e9dde5d26cd429fb
generated_at: 2026-08-27T07:10:05Z
---

## Genel Bakış
Bu modül, hesaba ait faturaların görüntülendiği sayfa bileşenini içerir. `src/views/account` dizininde yer alan bir görünüm (view) katmanı bileşenidir. Modül tek bir ana bileşenden oluşur.

## Fonksiyon Grupları

### Sayfa Bileşeni
Hesap faturaları sayfasının tamamını oluşturan ve sunan ana bileşendir. Bu modülde tanımlı tek fonksiyondur.
- AccountInvoicesPage

## Bağımlılıklar ve Mimari Notlar
- Modül hakkında eski doküman (SSOT referansı) bulunmamaktadır.
- Verilen kaynakta iç/dış bağımlılıklar, dinamik yüklenen modüller veya fonksiyonlar arası çağrı ilişkilerine dair bilgi yer almamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AccountInvoicesPage
**Ne yapar**: Kullanıcının fatura profillerini görüntülemesini, oluşturmasını, düzenlemesini, silmesini ve varsayılan olarak işaretlemesini sağlayan bir React sayfa bileşenidir. Bireysel ve kurumsal olmak üzere iki türde fatura profili destekler.

**Nasıl yapar**: Bileşen, sayfa yüklendiğinde `useEffect` ile `load` fonksiyonunu tetikleyerek Supabase veritabanından kullanıcının fatura profillerini çeker. Sol tarafta bir form alanı, sağ tarafta ise mevcut profillerin listesi olmak üzere iki sütunlu bir düzen sunar. Form, `profileType` durumuna göre bireysel (ad-soyad) veya kurumsal (şirket adı) alanları koşullu olarak render eder. `handleSubmit` fonksiyonu form gönderiminde zorunlu alanları kontrol eder, ardından `editingId` durumuna göre güncelleme (`updateInvoiceProfile`) veya oluşturma (`createInvoiceProfile`) işlemi gerçekleştirir. Her başarılı işlem sonrası form sıfırlanır ve liste yeniden yüklenir. Kartlar üzerinde düzenleme, silme ve varsayılan yapma butonları bulunur; düzenleme başlatıldığında `startEdit` fonksiyonu form alanlarını seçili profilin verileriyle doldurur ve sayfanın üstüne kaydırır.

**Parametreler**:
- Bu fonksiyon parametre almaz (React fonksiyonel bileşeni, props tanımlanmamış).

**Dönüş**: JSX.Element — Sayfanın tamamını oluşturan React bileşen ağacını döndürür. Bileşen; form bölümünü (profil türü seçimi, bireysel/kurumsal alanlar, vergi bilgileri, adres, varsayılan işaretleme, kaydet/güncelle butonu) ve profil listesi bölümünü (yükleme göstergesi, boş durum mesajı veya profil kartları ızgarası) içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/ui-models::type { InvoiceProfile }
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## TYPE ALIASES

### InvoiceProfileType
```typescript
type InvoiceProfileType = 'individual' | 'corporate'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — `useAuth()` hook'undan dönen kullanıcı nesnesi; `handleSubmit` içinde `user.id` olarak erişilir
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; tüm metinlerde kullanılır
  - `items` / `setItems` — `useState<InvoiceProfile[]>([])` ile tanımlı; fatura profilleri listesini tutar, `load` içinde `setItems(data)` ile güncellenir
  - `loading` / `setLoading` — `useState(true)` ile tanımlı; veri yükleme durumunu kontrol eder, `load` içinde açılıp kapanır
  - `saving` / `setSaving` — `useState(false)` ile tanımlı; form kaydetme işlemi sırasında butonu devre dışı bırakır
  - `editingId` / `setEditingId` — `useState<string | null>(null)` ile tanımlı; düzenlenen profilin ID'sini tutar, null ise yeni profil oluşturuluyor demektir
  - `profileType` / `setProfileType` — `useState<InvoiceProfileType>('individual')` ile tanımlı; profil tipi ('individual' veya 'corporate')
  - `firstName` / `setFirstName` — `useState('')` ile tanımlı; bireysel profil için ad
  - `lastName` / `setLastName` — `useState('')` ile tanımlı; bireysel profil için soyad
  - `companyName` / `setCompanyName` — `useState('')` ile tanımlı; kurumsal profil için şirket adı
  - `taxNumber` / `setTaxNumber` — `useState('')` ile tanımlı; vergi numarası (TCKN veya VKN)
  - `taxOffice` / `setTaxOffice` — `useState('')` ile tanımlı; vergi dairesi
  - `city` / `setCity` — `useState('')` ile tanımlı; şehir
  - `district` / `setDistrict` — `useState('')` ile tanımlı; ilçe
  - `addressLine` / `setAddressLine` — `useState('')` ile tanımlı; adres satırı
  - `isDefault` / `setIsDefault` — `useState(false)` ile tanımlı; varsayılan profil olup olmadığını belirler
  - `load` — `useCallback` ile tanımlı async fonksiyon; `listInvoiceProfiles` çağırarak profilleri yükler, `items`'a atar
  - `resetForm` — form state'lerini başlangıç değerlerine sıfırlar
  - `startEdit` — `InvoiceProfile` parametresi alır; profil bilgilerini form state'lerine yükler ve sayfanın başına kaydırır
  - `handleSubmit` — `React.FormEvent` parametresi alır; form doğrulama yapar, `createInvoiceProfile` veya `updateInvoiceProfile` çağırır
  - `handleDelete` — `id: string` parametresi alır; onay sonrası `deleteInvoiceProfile` çağırır
  - `handleMakeDefault` — `id: string` parametresi alır; `setDefaultInvoiceProfile` çağırır
- **Dönüş**: JSX elementi — iki sütunlu layout: sol tarafta profil listesi, sağ tarafta form

### [N2_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — `listInvoiceProfiles(supabaseBrowserClient)` sonucu dönen profil dizisi; `InvoiceProfile[]` olarak cast edilip `setItems` ile state'e aktarılır
  - `e` — `catch` bloğunda yakalanan hata; `console.error` ile loglanır
- **Dönüş**: yok (async void)

### [N3_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — sadece setState çağrıları ile form state'leri sıfırlanır)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::startEdit
- **params**: `p` — `InvoiceProfile` tipinde; düzenlenen profil nesnesi
- **ic_degiskenler**: (yok — `p` alanları doğrudan setState'lere aktarılır)
  - `p.id` — `setEditingId` ile editingId state'ine atanır
  - `p.profile_type` — `InvoiceProfileType` olarak cast edilip `setProfileType` ile atanır
  - `p.first_name` — `|| ''` ile null-safe, `setFirstName` ile atanır
  - `p.last_name` — `|| ''` ile null-safe, `setLastName` ile atanır
  - `p.company_name` — `|| ''` ile null-safe, `setCompanyName` ile atanır
  - `p.tax_number` — `|| ''` ile null-safe, `setTaxNumber` ile atanır
  - `p.tax_office` — `|| ''` ile null-safe, `setTaxOffice` ile atanır
  - `p.city` — `setCity` ile atanır
  - `p.district` — `setDistrict` ile atanır
  - `p.address_line` — `setAddressLine` ile atanır
  - `p.is_default` — `setIsDefault` ile atanır
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleSubmit
- **params**: `e` — `React.FormEvent`; form submit olayı
- **ic_degiskenler**:
  - `payload` — API'ye gönderilecek profil verisi objesi; şu alanları içerir:
    - `user_id` — `user.id`'den alınır
    - `profile_type` — `profileType` state'inden
    - `first_name` — profil tipi 'individual' ise `firstName`, değilse `null`
    - `last_name` — profil tipi 'individual' ise `lastName`, değilse `null`
    - `company_name` — profil tipi 'corporate' ise `companyName`, değilse `null`
    - `tax_number` — `taxNumber` state'inden
    - `tax_office` — `taxOffice` state'inden
    - `city` — `city` state'inden
    - `district` — `district` state'inden
    - `address_line` — `addressLine` state'inden
    - `is_default` — `isDefault` state'inden
    - `country` — sabit değer `'TR'`
  - `e` — `catch` bloğunda yakalanan hata; `console.error` ile loglanır
- **Dönüş**: yok (async void)

### [N6_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleDelete
- **params**: `id` — `string`; silinecek profilin ID'si
- **ic_degiskenler**:
  - `e` — `catch` bloğunda yakalanan hata; `console.error` ile loglanır
- **Dönüş**: yok (async void)

### [N7_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleMakeDefault
- **params**: `id` — `string`; varsayılan yapılacak profilin ID'si
- **ic_degiskenler**:
  - `e` — `catch` bloğunda yakalanan hata; `console.error` ile loglanır
- **Dönüş**: yok (async void)

---

## NODE ID STANDARD

  file: src\views\account\AccountInvoicesPage.tsx
  function: src\views\account\AccountInvoicesPage.tsx::AccountInvoicesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountInvoicesPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50`, `bg-blue-50`, `bg-green-50`, `bg-primary-navy`, `bg-primary-navy/5`, `bg-slate-100/80`, `bg-slate-50`, `bg-white`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `border-slate-200/50`, `border-slate-200/60`, `border-t`
- **Layout:** `flex`, `flex-1`, `flex-2`, `flex-col`, `gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-8`, `grid`, `grid-cols-1`, `grid-cols-2`, `h-10`, `h-12`, `h-24`
- **Varyant/Responsive:** `:`, `disabled:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${p.profile_type`, `${profileType`, `:`, `===`, `animate-spin`, `border`, `corporate`, `cursor-pointer`, `disabled:opacity-50`, `font-black`, `font-bold`, `font-medium`, `group`, `individual`, `lg:order-last`