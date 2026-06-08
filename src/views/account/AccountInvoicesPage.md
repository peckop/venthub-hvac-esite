---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountInvoicesPage.tsx
skeleton_hash: 878e58c2d29a64de
entity_hashes:
  func:AccountInvoicesPage: a5eec2500a7d38b0
  overview: d0d3eb909783a960
  style_tokens: e9dde5d26cd429fb
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformu hesap yönetimi içinde yer alan bir React sayfa bileşenidir. Temel sorumluluğu, kullanıcının fatura profillerini (bireysel veya kurumsal) yönetmek için gerekli olan tüm kullanıcı arayüzü ve iş mantığını sunmaktır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni ve İş Akışı Yönetimi
Modülün tek bileşeni olan bu yapı, fatura profillerinin yaşam döngüsünü (CRUD) ve durum yöneticiliğini tek bir yerde merkezi olarak yönetir. Veri yükleme, form gösterme, kullanıcı eylemlerini işleme ve ilgili API çağrılarını koordine eder.
- AccountInvoicesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Verilen fonksiyon imzası `AccountInvoicesPage()` olarak tanımlanmıştır; parametre, default değer veya modül sabiti bulunmamaktadır. Fonksiyon gövdesine erişim olmadığından, mimari varsayımlar üretilememektedir.

---

## FONKSİYON DETAYLARI

### AccountInvoicesPage
**Ne yapar**: Kullanıcının fatura profillerini listeleme, oluşturma, düzenleme, silme ve varsayılan olarak belirleme işlemlerini yöneten React bileşenidir. Bu bileşen, kullanıcının fatura bilgilerini tutarlı ve düzenli bir şekilde yönetmesini sağlayan bir arayüz sunar.
**Nasıl yapar**: `useAuth` hook'u ile mevcut kullanıcı bilgisini, `useI18n` hook'u ile çeviri fonksiyonlarını alır. `useState` hook'ları ile fatura profilleri listesi, yükleme/saklama durumları ve form alanları için durum yönetimi sağlar. `useEffect` ve `useCallback` kullanarak bileşen yüklendiğinde profilleri otomatik olarak çeker. Form gönderiminde (`handleSubmit`) zorunlu alanları doğrular, profile türüne (`individual` veya `corporate`) göre uygun veri yapısını oluşturur ve supabase istemcisi aracılığıyla CRUD işlemlerini gerçekleştirir. Hata yönetimi için `toast` bildirimleri kullanır.
**Parametreler**:
- Bu bileşen doğrudan props almaz. İçinde `useAuth()` ve `useI18n()` hook'larını kullanarak gerekli bağımlılıkları sağlar.
**Dönüş**: JSX.Element — İki ana bölümden oluşan bir arayüz döndürür: Sol tarafta profil oluşturma/düzenleme formu, sağ tarafta ise fatura profillerinin kartlar halinde listelendiği bir bölüm.

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
  - `user` — useAuth() hook'undan alınan kullanıcı bilgisi
  - `t` — useI18n() hook'undan alınan çeviri fonksiyonu
  - `items` — useState ile oluşturulan InvoiceProfile[] dizisi, fatura profillerini tutar
  - `loading` — useState ile oluşturulan boolean, yükleme durumunu takip eder
  - `saving` — useState ile oluşturulan boolean, kaydetme durumunu takip eder
  - `editingId` — useState ile oluşturulan string|null, düzenlenecek profilin ID'sini tutar
  - `profileType` — useState ile oluşturulan InvoiceProfileType, profil tipini tutar (individual/corporate)
  - `firstName` — useState ile oluşturulan string, bireysel profil için ad alanı
  - `lastName` — useState ile oluşturulan string, bireysel profil için soyad alanı
  - `companyName` — useState ile oluşturulan string, kurumsal profil için firma adı
  - `taxNumber` — useState ile oluşturulan string, vergi numarası (TCKN/VKN)
  - `taxOffice` — useState ile oluşturulan string, vergi dairesi
  - `city` — useState ile oluşturulan string, il
  - `district` — useState ile oluşturulan string, ilçe
  - `addressLine` — useState ile oluşturulan string, adres detayı
  - `isDefault` — useState ile oluşturulan boolean, varsayılan profil durumu
  - `load` — useCallback ile oluşturulan async fonksiyon, fatura profillerini yükler
  - `resetForm` — useCallback ile oluşturulan fonksiyon, form alanlarını sıfırlar
  - `startEdit` — useCallback ile oluşturulan fonksiyon, profili düzenleme moduna alır
  - `handleSubmit` — useCallback ile oluşturulan async fonksiyon, form gönderimini işler
  - `handleDelete` — useCallback ile oluşturulan async fonksiyon, profili siler
  - `handleMakeDefault` — useCallback ile oluşturulan async fonksiyon, profili varsayılan yapar
- **Dönüş**: JSX (React component)

### [N2_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — listInvoiceProfiles(supabaseBrowserClient) ile yüklenen fatura profilleri dizisi
- **Dönüş**: Promise<void>

### [N3_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N4_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::startEdit
- **params**: `(p: InvoiceProfile)`
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N5_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleSubmit
- **params**: `(e: React.FormEvent)`
- **ic_degiskenler**:
  - `payload` — API'ye gönderilecek fatura profili verisi (object), user.id ve form alanlarından oluşur
- **Dönüş**: Promise<void>

### [N6_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleDelete
- **params**: `(id: string)`
- **ic_degiskenler**: (yok)
- **Dönüş**: Promise<void>

### [N7_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleMakeDefault
- **params**: `(id: string)`
- **ic_degiskenler**: (yok)
- **Dönüş**: Promise<void>

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