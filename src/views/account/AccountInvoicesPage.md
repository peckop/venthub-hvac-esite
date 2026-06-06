---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountInvoicesPage.tsx
skeleton_hash: 3dfbf392dd983611
entity_hashes:
  func:AccountInvoicesPage: 8b46a7e878bbb3d8
  overview: 58abc9e06b96bcd5
  style_tokens: e9dde5d26cd429fb
generated_at: 2026-06-06T21:56:44Z
---

## Genel Bakış
VentHub HVAC platformundaki kullanıcı hesapları modülünde yer alan fatura yönetim sayfasını oluşturan React bileşenidir. Kullanıcıların fatura profillerini (bireysel veya kurumsal) güvenli bir şekilde listelemesini, oluşturmasını, düzenlemesini, silmesini ve varsayılan profil olarak belirlemesini sağlar. Tüm arayüz ve iş mantığı bu merkezi bileşen içinde yönetilir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tüm arayüzünü ve iş mantığını tek bir merkezi bileşen içinde barındırarak kullanıcıya fatura profillerinin yönetimini sunar.
- AccountInvoicesPage

---



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

### [N1_NASIL] AccountInvoicesPage
- **params**: (yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan alınan mevcut oturum kullanıcı nesnesi; `user.id` handleSubmit içinde `payload.user_id` olarak kullanılır
  - `t` — useI18n() hook'undan alınan çeviri fonksiyonu; buton metinleri `t('common.cancel')`, `t('common.update')`, `t('common.save')` olarak kullanılır
  - `items`, `setItems` — useState<InvoiceProfile[]>(); fatura profilleri listesi, `load` içinde `setItems(data as InvoiceProfile[])` ile doldurulur, JSX'te `items.map((p) => ...)` ile render edilir
  - `loading`, `setLoading` — useState(true); veri yüklenme durumu, `load` içinde true/false olarak ayarlanır, JSX'te spinner veya boş durum gösterimi için kontrol edilir
  - `saving`, `setSaving` — useState(false); form kaydetme/ Güncelleme sürecinde buton disable durumu için kullanılır, handleSubmit içinde true/false ayarlanır
  - `editingId`, `setEditingId` — useState<string | null>(null); düzenlenen profilin ID'si, null ise yeni profil oluşturuluyor demektir; `startEdit` ile `p.id` atanır, `resetForm` ile null'a sıfırlanır, `handleSubmit` içinde `if (editingId)` kontrolü ile güncelleme ya da oluşturma ayrımı yapılır
  - `profileType`, `setProfileType` — useState<InvoiceProfileType>('individual'); profil tipi ('individual' veya 'corporate'); formda bireysel/kurumsal seçimine göre input alanlarını değiştirir, `handleSubmit` payload'ında `first_name`, `last_name`, `company_name` değerlerini koşullu belirler
  - `firstName`, `setFirstName` — useState(''); bireysel profil için ad alanı; form input değerine bağlı state, `handleSubmit` payload'ında `profileType === 'individual' ? firstName : null` olarak gönderilir
  - `lastName`, `setLastName` — useState(''); bireysel profil için soyad alanı; `handleSubmit` payload'ında `profileType === 'individual' ? lastName : null` olarak gönderilir
  - `companyName`, `setCompanyName` — useState(''); kurumsal profil için firma ünvanı; `handleSubmit` payload'ında `profileType === 'corporate' ? companyName : null` olarak gönderilir
  - `taxNumber`, `setTaxNumber` — useState(''); vergi numarası/TCKN/VKN; form zorunlu alanı, `handleSubmit` içinde `!addressLine || !city || !district || !taxNumber` validasyon kontrolünde yer alır, payload'a doğrudan yazılır
  - `taxOffice`, `setTaxOffice` — useState(''); vergi dairesi; form alanı, payload'a `tax_office` olarak yazılır
  - `city`, `setCity` — useState(''); il; form zorunlu alanı, validasyon kontrolünde ve payload'da kullanılır
  - `district`, `setDistrict` — useState(''); ilçe; form zorunlu alanı, validasyon kontrolünde ve payload'da kullanılır
  - `addressLine`, `setAddressLine` — useState(''); adres detayı; form zorunlu alanı, validasyon kontrolünde ve payload'da `address_line` olarak kullanılır
  - `isDefault`, `setIsDefault` — useState(false); varsayılan profil işaret flag'i; checkbox ile toggle edilir, payload'a `is_default` olarak yazılır
- **Dönüş**: JSX (React Component — return bloğu ile UI render eder)

---

### [N2_NASIL] AccountInvoicesPage::load (useCallback)
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — `listInvoiceProfiles()` async çağrısının dönüş değeri; fatura profilleri dizisi, `data as InvoiceProfile[]` ile cast edilip `setItems` ile state'e yazılır
- **Dönüş**: void (async) — `setItems` ile state günceller, `setLoading` ile yükleme durumunu yönetir

---

### [N3_NASIL] AccountInvoicesPage::resetForm
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — tüm form state'lerini varsayılan değerlerine sıfırlar: `setEditingId(null)`, `setProfileType('individual')`, tüm input state'lerini boş string'e, `setIsDefault(false)`'a ayarlar

---

### [N4_NASIL] AccountInvoicesPage::startEdit
- **params**: (`p`: InvoiceProfile — düzenlenecek mevcut profil nesnesi, form alanlarını doldurmak için kullanılır)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — `p` nesnesindeki tüm alanları (`p.id`, `p.profile_type`, `p.first_name`, `p.last_name`, `p.company_name`, `p.tax_number`, `p.tax_office`, `p.city`, `p.district`, `p.address_line`, `p.is_default`) ilgili state'lere atar, `|| ''` fallback'leri ile null safety sağlar, `window.scrollTo({ top: 0, behavior: 'smooth' })` ile sayfayı yukarı kaydırır

---

### [N5_NASIL] AccountInvoicesPage::handleSubmit
- **params**: (`e`: React.FormEvent — form submit event, `e.preventDefault()` ile sayfa yenilenmesi engellenir)
- **ic_degiskenler**:
  - `payload` — `createInvoiceProfile` veya `updateInvoiceProfile` API'sine gönderilen veri nesnesi; `user.id`, `profileType`, koşullu `first_name`/`last_name`/`company_name`, `taxNumber`, `taxOffice`, `city`, `district`, `addressLine`, `isDefault` ve sabit `country: 'TR'` alanlarını içerir
- **Dönüş**: void (async) — validasyon başarısızsa `toast.error` ile hata gösterir, `editingId` varsa `updateInvoiceProfile(editingId, payload)` çağırır, yoksa `createInvoiceProfile(payload)` çağırır; başarı sonrası `resetForm()` ve `await load()` ile formu sıfırlar ve listeyi yeniler

---

### [N6_NASIL] AccountInvoicesPage::handleDelete
- **params**: (`id`: string — silinecek fatura profilinin benzersiz tanımlayıcısı)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (async) — `confirm()` ile kullanıcı onayı aldıktan sonra `deleteInvoiceProfile(id)` API çağrısını yapar; başarıyla `toast.success`, hata ile `toast.error` gösterir, ardından `await load()` ile listeyi yeniler

---

### [N7_NASIL] AccountInvoicesPage::handleMakeDefault
- **params**: (`id`: string — varsayılan yapılacak fatura profilinin benzersiz tanımlayıcısı)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (async) — `setDefaultInvoiceProfile(id)` API çağrısını yapar; başarıyla `toast.success`, hata ile `toast.error` gösterir, ardından `await load()` ile listeyi yeniler

---

### [N8_NASIL] AccountInvoicesPage::items.map callback
- **params**: (`p`: InvoiceProfile — `items` dizisi üzerindeki döngü elemanı, her bir fatura profilini temsil eder)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element — `p.id` ile key, `p.profile_type` ile ikon ve renk seçimi, `p.first_name`/`p.last_name`/`p.company_name` ile başlık gösterimi, `p.tax_office`/`p.tax_number` ile vergi bilgisi, `p.address_line`/`p.district`/`p.city` ile adres satırı, `p.is_default` ile varsayılan etiketi veya "Varsayılan Yap" butonu; `startEdit(p)` ile düzenleme, `handleDelete(p.id)` ile silme, `handleMakeDefault(p.id)` ile varsayılan yapma butonları bağlıdır

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