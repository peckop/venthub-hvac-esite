---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountInvoicesPage.tsx
skeleton_hash: 1c5506a1b8bb1d08
entity_hashes:
  func:AccountInvoicesPage: 8b46a7e878bbb3d8
  overview: e1ec5a6be4856954
  style_tokens: e9dde5d26cd429fb
generated_at: 2026-05-28T22:39:12Z
---

## Genel Bakış
VentHub HVAC platformunun kullanıcı hesapları bölümünde yer alan faturalar sayfasını uygulayan React tabanlı bir bileşendir. Kullanıcının hesabına ait faturaları güvenli bir şekilde görüntülemesini ve yönetmesini sağlayan, hesap sayfaları mimarisinin ana giriş noktasıdır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tüm arayüzünü, durum yönetimini ve iş mantığını tek bir merkezi bileşen içinde barındırır, harici bağımlılıklar ve rota parametreleri ile etkileşime geçerek fatura listesini sunar.
- AccountInvoicesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen fonksiyon gövdesi (implementation) bulunmadığından, yalnızca fonksiyon imzasından çıkarılabilen minimal aksiyomlar tanımlanmıştır.

**[Aksiyom 1]:** Eğer React component mount ortamı (React runtime) yoksa, `AccountInvoicesPage` bileşeni render edilemez.

**[Aksiyom 2]:** Eğer `AccountInvoicesPage` bir React Functional Component olarak çalışıyor ve parametre almıyorsa, props bağımsız çalışması beklenir — ancak iç bağımlılıklar (context, hook, servis çağrısı vb.) bilinmiyor.

**[Aksiyom 3]:** Eğer bu bir sayfa (page) bileşeni ise ve modülde modül sabitleri (CONSTANTS) tanımlanmamışsa, sayfa içeriği dinamik olarak dış kaynaklardan (API, context, store) sağlanmalıdır — statik veri kaynağı bilinmiyor.

---

> **Not:** Bu modül için yalnızca bileşen imzası (`AccountInvoicesPage()`) verilmiştir. Fonksiyon gövdesi, hook kullanımı, prop tanımları, context tüketimi veya servis bağımlılıkları gibi detaylar kodda mevcut olmadığı için, daha spesifik mimari varsayımlar (örn: authentication zorunluluğu, veri kaynağı, route yapısı) **bilinmiyor** durumdadır. Detaylı aksiyon üretmek için bileşen gövdesinin incelenmesi gereklidir.

---

## FONKSİYON DETAYLARI

### AccountInvoicesPage
**Ne yapar**: Fatura profillerinin (bireysel veya kurumsal) yönetilmesini sağlayan React bileşenidir. Kullanıcının mevcut fatura profillerini listelemesini, yeni profil oluşturmasını, mevcut profilleri düzenlemesini, silmesini ve varsayılan profil olarak belirlemesini sağlar.

**Nasıl yapar**: `useAuth` ve `useI18n` hook'larından kullanıcı ve dil bilgisini alır. `useState` ile profil listesi, yükleme durumu, kaydetme durumu ve form alanları için state yönetimi yapar. Sayfa yüklendiğinde `useEffect` ile `load` fonksiyonu çağrılıp `listInvoiceProfiles` API'sinden profil listesi çekilir. Form gönderildiğinde `handleSubmit` fonksiyonu, mevcut `editingId` değerine göre `createInvoiceProfile` veya `updateInvoiceProfile` API'lerinden birini çağırarak CRUD işlemlerini yürütür. Silme ve varsayılan yapma işlemleri için `handleDelete` ve `handleMakeDefault` fonksiyonları ilgili API'leri çağırıp listeyi yeniden yükler.

**Parametreler**:
Bu bileşen parametre almaz (props'suz fonksiyon bileşeni).

**Dönüş**: JSX formatında, iki bölümlü responsive bir arayüz döndürür. Sol tarafta (mobilde üstte) profil oluşturma/düzenleme formu, sağ tarafta (mobilde altta) mevcut profillerin grid görünümünü içerir.

---

## TYPE ALIASES

### InvoiceProfileType
```typescript
type InvoiceProfileType = 'individual' | 'corporate'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage
- **params**: ()
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen kullanıcı nesnesi, API çağrılarında user.id olarak kullanılır
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu, buton metinleri için kullanılır
  - `items` — fatura profilleri listesi (InvoiceProfile[]), API'den yüklenen profil verilerini tutar
  - `loading` — yükleme durumu (boolean), true iken loader gösterilir
  - `saving` — kaydetme durumu (boolean), true iken form butonları devre dışıdır
  - `editingId` — düzenlenen profilin ID'si (string | null), null ise yeni profil oluşturuluyordur
  - `profileType` — fatura profil türü: 'individual' veya 'corporate', form alanlarını koşullu gösterir
  - `firstName` — bireysel profil için ad alanı
  - `lastName` — bireysel profil için soyad alanı
  - `companyName` — kurumsal profil için firma ünvanı alanı
  - `taxNumber` — TCKN (bireysel) veya VKN (kurumsal) vergi numarası
  - `taxOffice` — vergi dairesi adı
  - `city` — il adı
  - `district` — ilçe adı
  - `addressLine` — adres detayı metni
  - `isDefault` — bu profilin varsayılan profil olup olmadığı (boolean)
  - `load` — useCallback ile tanımlanan, fatura profillerini API'den yükleyen fonksiyon
  - `resetForm` — tüm form state'lerini başlangıç değerlerine sıfırlayan fonksiyon
  - `startEdit` — verilen profili form alanlarına doldurarak düzenleme modunu başlatan fonksiyon
  - `handleSubmit` — form submit handler'ı, profil oluşturur veya günceller
  - `handleDelete` — verilen ID ile profili silen fonksiyon
  - `handleMakeDefault` — verilen profili varsayılan yapan fonksiyon
- **Dönüş**: JSX (React component)

### [N2_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::load
- **params**: ()
- **ic_degiskenler**:
  - `data` — listInvoiceProfiles() async API çağrısından dönen fatura profilleri dizisi
- **Dönüş**: Promise<void>, items state'ini günceller ve loading state'ini yönetir

### [N3_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::resetForm
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: yok — editingId, profileType, firstName, lastName, companyName, taxNumber, taxOffice, city, district, addressLine, isDefault state'lerini başlangıç değerlerine sıfırlar

### [N4_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::startEdit
- **params**: `p` — düzenlenecek InvoiceProfile nesnesi (p.id, p.profile_type, p.first_name, p.last_name, p.company_name, p.tax_number, p.tax_office, p.city, p.district, p.address_line, p.is_default alanlarını okur)
- **ic_degiskenler**: yok
- **Dönüş**: yok — editingId, profileType, firstName, lastName, companyName, taxNumber, taxOffice, city, district, addressLine, isDefault state'lerini p değerleriyle doldurur ve sayfayı yukarı kaydırır

### [N5_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleSubmit
- **params**: `e` — React.FormEvent (form submit event nesnesi)
- **ic_degiskenler**:
  - `payload` — API'ye gönderilecek fatura profil veri nesnesi: { user_id: user.id, profile_type: profileType, first_name, last_name, company_name, tax_number: taxNumber, tax_office: taxOffice, city, district, address_line: addressLine, is_default: isDefault, country: 'TR' }
- **Dönüş**: Promise<void> — editingId varsa updateInvoiceProfile(editingId, payload), yoksa createInvoiceProfile(payload) çağırır; başarı sonrası resetForm() ve load() çağırır

### [N6_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleDelete
- **params**: `id` — silinecek profilin string ID'si
- **ic_degiskenler**: yok
- **Dönüş**: Promise<void> — confirm dialog'u onaylarsa deleteInvoiceProfile(id) çağırır ve load() ile listeyi yeniler

### [N7_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleMakeDefault
- **params**: `id` — varsayılan yapılacak profilin string ID'si
- **ic_degiskenler**: yok
- **Dönüş**: Promise<void> — setDefaultInvoiceProfile(id) çağırır ve load() ile listeyi yeniler

### [N8_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::items.map callback
- **params**: `p` — mevcut iterasyondaki InvoiceProfile nesnesi (p.id, p.profile_type, p.first_name, p.last_name, p.company_name, p.tax_office, p.tax_number, p.address_line, p.district, p.city, p.is_default alanlarını JSX içinde kullanır)
- **ic_degiskenler**: yok
- **Dönüş**: JSX — profil kartı render eder; startEdit(p), handleDelete(p.id), handleMakeDefault(p.id) callback'lerini bağlar

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