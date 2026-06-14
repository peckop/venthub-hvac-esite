---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountInvoicesPage.tsx
skeleton_hash: 0ecef47af2b4eb9d
entity_hashes:
  func:AccountInvoicesPage: f5f2f51606b21a99
  overview: d0d3eb909783a960
  style_tokens: e9dde5d26cd429fb
generated_at: 2026-06-14T17:22:32Z
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

**Ne yapar**: Kullanıcının fatura profil bilgilerini (bireysel veya kurumsal) yönetmeye yarayan React sayfa bileşenidir. Profilleri listeleme, oluşturma, düzenleme, silme ve varsayılan olarak ayarlama işlemlerini tek bir sayfada sunar. İki ana bölümden oluşur: sol tarafta form alanı, sağ tarafta profil kartlarının listesi yer alır.

**Nasıl yapar**: Bileşen, `useAuth` hook'u ile oturumdaki kullanıcıyı, `useI18n` hook'u ile çeviri fonksiyonunu (`t`) alır. `useState` ile hem profil listesi (`items`) hem de form alanı için çok sayıda state yönetimi yapar. Profil tipi (`individual` / `corporate`) seçimine göre form alanları dinamik olarak değişir — bireysel profilde `firstName` ve `lastName`, kurumsal profilde `companyName` alanları gösterilir. Veri işlemleri Supabase istemci üzerinden `listInvoiceProfiles`, `createInvoiceProfile`, `updateInvoiceProfile`, `deleteInvoiceProfile` ve `setDefaultInvoiceProfile` fonksiyonlarıyla gerçekleşir. Her işlem sonrası `load` callback'i çağrılıp liste yenilenir. Bileşen yüklenme aşamasında `useEffect` ile `load` fonksiyonunu otomatik olarak çağırarak mevcut profilleri yükler.

**Parametreler**:
- Bu bileşen dışarıdan parametre almaz. İç state yönetimi şu değişkenleri kapsar:
  - `editingId: string | null` — Düzenlenmekte olan profilin ID'si. `null` ise yeni profil oluşturma modundadır.
  - `profileType: InvoiceProfileType` — Profil tipi, `'individual'` veya `'corporate'` değerlerini alır.
  - `firstName: string` — Bireysel profil için ad alanı.
  - `lastName: string` — Bireysel profil için soyad alanı.
  - `companyName: string` — Kurumsal profil için şirket adı alanı.
  - `taxNumber: string` — TCKN (bireysel) veya VKN (kurumsal) numarası.
  - `taxOffice: string` — Vergi dairesi bilgisi.
  - `city: string` — Şehir bilgisi.
  - `district: string` — İlçe bilgisi.
  - `addressLine: string` — Açık adres satırı.
  - `isDefault: boolean` — Profilin varsayılan fatura profili olarak işaretlenip işaretlenmediği.
  - `loading: boolean` — Verilerin arka planda yüklenip yüklenmediği durumu takip eder.
  - `saving: boolean` — Form gönderim işleminin devam edip etmediği durumu takip eder.
  - `items: InvoiceProfile[]` — Sunucudan yüklenen fatura profillerinin listesi.

**Dönüş**: JSX element döndürür (`JSX.Element`). Sol tarafta form, sağ tarafta profil kartları olmak üzere iki sütunlu responsive bir düzen (layout) render eder. `loading` durumunda merkezi bir spinner, `items` boşsa dashed kenarlıklı bir boş durum mesajı gösterir.

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
- **params**: (yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen mevcut kullanıcı nesnesi, user.id ile API çağrılarında kullanılır
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu, tüm metin gösterimlerinde kullanılır
  - `items` — mevcut fatura profilleri listesi, useState ile yönetilir (InvoiceProfile[])
  - `loading` — sayfa yükleme durumu bayrağı (boolean), true iken loader gösterilir
  - `saving` — form kaydetme durumu bayrağı (boolean), true iken buton disabled olur
  - `editingId` — düzenlenen profilin ID'si veya null (yeni profil modu)
  - `profileType` — fatura profil tipi: 'individual' veya 'corporate' (InvoiceProfileType)
  - `firstName` — bireysel profil için ad alanı
  - `lastName` — bireysel profil için soyad alanı
  - `companyName` — kurumsal profil için şirket adı alanı
  - `taxNumber` — vergi numarası (TCKN veya VKN)
  - `taxOffice` — vergi dairesi bilgisi
  - `city` — il bilgisi
  - `district` — ilçe bilgisi
  - `addressLine` — açık adres satırı
  - `isDefault` — bu profilin varsayılan fatura profülü olup olmadığı (boolean)
  - `load` — useCallback ile sarılı asenkron fonksiyon, fatura profillerini API'den yükler
  - `resetForm` — form alanlarını varsayılan değerlerine sıfırlayan fonksiyon
  - `startEdit` — var olan bir profili düzenleme modunda açan fonksiyon, parametre olarak InvoiceProfile alır
  - `handleSubmit` — form submit handler, profil oluşturur veya günceller
  - `handleDelete` — belirli bir profilin silinmesini onaylayıp gerçekleştiren fonksiyon
  - `handleMakeDefault` — bir profili varsayılan olarak ayarlayan fonksiyon
  - `p` — items.map callback'inde her bir döngü elemanı (InvoiceProfile), JSX'te kart olarak render edilir
- **Dönüş**: JSX (React bileşeni)

### [N2_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::load (useCallback async inner)
- **params**: (yok — useCallback ile sarılmış)
- **ic_degiskenler**:
  - `data` — listInvoiceProfiles(supabaseBrowserClient) çağrısının dönüş değeri, fatura profilleri listesi
- **Dönüş**: void (asenkron, state'leri yan etki olarak günceller: loading, items)

### [N3_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::resetForm
- **params**: (yok)
- **ic_degiskenler**: (yok — sadece state setter'larını çağırır)
- **Dönüş**: void (tüm form state'lerini sıfırlar: editingId, profileType, firstName, lastName, companyName, taxNumber, taxOffice, city, district, addressLine, isDefault)

### [N4_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::startEdit
- **params**: `(p: InvoiceProfile)` — düzenlenecek fatura profili nesnesi
- **ic_degiskenler**: (yok — doğrudan state setter'ları ve p'nin alanlarını kullanır)
  - `p.id` — profile ait benzersiz tanımlayıcı, editingId'ye atanır
  - `p.profile_type` — profil tipi (individual/corporate), profileType'a atanır
  - `p.first_name` — ad, firstName'a atanır
  - `p.last_name` — soyad, lastName'a atanır
  - `p.company_name` — şirket adı, companyName'a atanır
  - `p.tax_number` — vergi numarası, taxNumber'a atanır
  - `p.tax_office` — vergi dairesi, taxOffice'a atanır
  - `p.city` — il, city'ye atanır
  - `p.district` — ilçe, district'e atanır
  - `p.address_line` — adres, addressLine'a atanır
  - `p.is_default` — varsayılan mı, isDefault'a atanır
- **Dönüş**: void (form alanlarını doldurur ve sayfayı yukarı kaydırır)

### [N5_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleSubmit
- **params**: `(e: React.FormEvent)` — form submit olay nesnesi
- **ic_degiskenler**:
  - `user` — useAuth'tan gelen kullanıcı, user.id payload'ta kullanılır; null ise hata fırlatılır
  - `payload` — API'ye gönderilen fatura profili veri nesnesi, şu alanları içerir: user_id (user.id), profile_type, first_name, last_name, company_name, tax_number, tax_office, city, district, address_line, is_default, country ('TR' sabit)
  - `editingId` — mevcut düzenleme modu durumu, varsa güncelleme yoksa oluşturma yapılır
  - `addressLine` — validasyon kontrolü: boşsa hata verir
  - `city` — validasyon kontrolü: boşsa hata verir
  - `district` — validasyon kontrolü: boşsa hata verir
  - `taxNumber` — validasyon kontrolü: boşsa hata verir
  - `profileType` — payload'ta individual/corporate durumuna göre first_name/last_name veya company_name set edilir
  - `firstName` — individual modda payload'a yazılır
  - `lastName` — individual modda payload'a yazılır
  - `companyName` — corporate modda payload'a yazılır
  - `taxOffice` — payload'a yazılır
  - `isDefault` — payload'a yazılır
- **Dönüş**: void (API çağrısı + toast bildirimleri + form sıfırlama + listeyi yeniden yükleme)

### [N6_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleDelete
- **params**: `(id: string)` — silinecek fatura profilinin ID'si
- **ic_degiskenler**:
  - `id` — deleteInvoiceProfile API çağrısına传递 edilen profil ID'si
- **Dönüş**: void (onay dialogu + API silme + toast + listeyi yeniden yükleme)

### [N7_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleMakeDefault
- **params**: `(id: string)` — varsayılan yapılacak fatura profilinin ID'si
- **ic_degiskenler**:
  - `id` — setDefaultInvoiceProfile API çağrısına传递 edilen profil ID'si
- **Dönüş**: void (API çağrısı + toast + listeyi yeniden yükleme)

### [N8_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::items.map callback
- **params**: `(p)` — items dizisindeki her bir InvoiceProfile elemanı
- **ic_degiskenler**:
  - `p.id` — elemanın benzersiz tanımlayıcısı, key ve handleDelete/handleMakeDefault/startEdit argümanı olarak kullanılır
  - `p.profile_type` — individual/corporate kontrolü ile ikon ve renk belirlenir; JSX'te card içeriği koşullu render edilir
  - `p.first_name` — bireysel profilde ad alanı, `${p.first_name} ${p.last_name}` birleşimi olarak gösterilir
  - `p.last_name` — bireysel profilde soyad alanı
  - `p.company_name` — kurumsal profilde şirket adı olarak gösterilir
  - `p.tax_office` — vergi dairesi, `p.tax_office / p.tax_number` formatında gösterilir
  - `p.tax_number` — vergi numarası
  - `p.address_line` — açık adres, kart içinde truncated olarak gösterilir
  - `p.district` — ilçe, `p.district/p.city` formatında gösterilir
  - `p.city` — il
  - `p.is_default` — true ise yeşil "Varsayılan" badge, false ise "Varsayılan Yap" butonu gösterilir
- **Dönüş**: JSX (her eleman için bir fatura profil kartı)

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