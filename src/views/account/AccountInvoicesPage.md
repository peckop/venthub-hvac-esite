---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountInvoicesPage.tsx
skeleton_hash: c201e08c34ac72bd
entity_hashes:
  func:AccountInvoicesPage: a5eec2500a7d38b0
  overview: 576f219848353dfb
  style_tokens: e9dde5d26cd429fb
generated_at: 2026-06-07T12:13:05Z
---

## Genel Bakış
VentHub HVAC platformu hesap yönetimi içinde yer alan fatura profillerini yönetmeye yarayan bir React sayfa bileşenidir. Bireysel veya kurumsal fatura profillerinin listelenmesi, oluşturulması, düzenlenmesi, silinmesi ve varsayılan olarak ayarlanması gibi tüm CRUD işlemlerini tek bir merkezi bileşen üzerinde yönetir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Fatura profillerinin tüm kullanıcı arayüzünü ve iş mantığını barındıran, veri yükleme, form işleme ve API etkileşimlerini yöneten ana bileşendirir.
- AccountInvoicesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Verilen bilgilerde yalnızca fonksiyon imzası (`AccountInvoicesPage()`) ve genel bir kullanım açıklaması bulunmaktadır. Mimari varsayımlar (aksyomlar), **modülün fonksiyon gövdesindeki (implementasyon) mantıksal akış ve bağımlılıklardan** üretilir. Fonksiyon gövdesi paylaşılmadığı için, bu modül için geçerli ve doğru bir aksiyom üretilememektedir.

**Bilinmeyen Kritik Detaylar:**
*   bileşenin hangi **state'leri** yönettiği (ör. fatura listesi, yükleme durumu, hata durumu)
*   hangi **API çağrılarına** bağımlı olduğu
*   props olarak hangi verileri beklediği
*   koşullu rendered (render mantığı) elemanları
*   olay işleyicilerinin (event handlers) başarısızlık senaryoları

Bu detaylar olmadan, modülün çalışma varsayımlarını **bilinmiyor** olarak belirtmek en doğru yaklaşımdır.

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

### [N1_NASIL] AST Pointer: `src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage`
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — `useAuth()` hook'undan dönen kimlik doğrulanmış kullanıcı nesnesi; `user.id` payload içinde kullanılır
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; buton metinleri için `t('common.cancel')`, `t('common.update')`, `t('common.save')` çağrılır
  - `items` / `setItems` — `useState<InvoiceProfile[]>` ile oluşturulan fatura profilleri dizisi; API'den yüklenen profiller burada tutulur, JSX'te `.map()` ile listelenir
  - `loading` / `setLoading` — `useState(true)` ile oluşturulan yüklenme durumu bayrağı; true iken Loader2 spinner, false iken içerik gösterilir
  - `saving` / `setSaving` — `useState(false)` ile oluşturulan kaydetme durumu bayrağı; true iken submit butonu `disabled` ve Loader2 spinner gösterir
  - `editingId` / `setEditingId` — `useState<string | null>` ile oluşturulan düzenleme modu; null ise yeni profil, değer varsa mevcut profili düzenleme modunda olduğunu belirtir
  - `profileType` / `setProfileType` — `useState<InvoiceProfileType>('individual')` ile oluşturulan profil tipi seçimi; `'individual'` bireysel, `'corporate'` kurumsal form alanlarını kontrol eder
  - `firstName` / `setFirstName` — `useState('')` ile oluşturulan bireysel profil adı alanı
  - `lastName` / `setLastName` — `useState('')` ile oluşturulan bireysel profil soyadı alanı
  - `companyName` / `setCompanyName` — `useState('')` ile oluşturulan kurumsal profil firma ünvanı alanı
  - `taxNumber` / `setTaxNumber` — `useState('')` ile oluşturulan TCKN/VKN alanı
  - `taxOffice` / `setTaxOffice` — `useState('')` ile oluşturulan vergi dairesi alanı
  - `city` / `setCity` — `useState('')` ile oluşturulan il alanı
  - `district` / `setDistrict` — `useState('')` ile oluşturulan ilçe alanı
  - `addressLine` / `setAddressLine` — `useState('')` ile oluşturulan adres detayı alanı
  - `isDefault` / `setIsDefault` — `useState(false)` ile oluşturulan varsayılan profil checkbox durumu
- **Dönüş**: JSX — iki bölüm (sol: form, sağ: profil listesi) içeren React bileşeni

---

### [N2_NASIL] AST Pointer: `src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage::load`
- **params**: (parametre yok — `useCallback` ile sarılmış)
- **ic_degiskenler**:
  - `data` — `listInvoiceProfiles(supabaseBrowserClient)` çağrısından dönen fatura profilleri dizisi; `as InvoiceProfile[]` ile tip dönüştürülüp `setItems` ile state'e yazılır
- **Dönüş**: `Promise<void>` — API'den veri çekip state'i günceller; hata olursa `toast.error` ile bildirim gösterir

---

### [N3_NASIL] AST Pointer: `src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage::resetForm`
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — tüm form state'ini varsayılan değerlerine sıfırlar: `editingId`→null, `profileType`→'individual', tüm string alanlar→'', `isDefault`→false

---

### [N4_NASIL] AST Pointer: `src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage::startEdit`
- **params**: `p: InvoiceProfile` — düzenlenecek mevcut fatura profili nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: void — `p` nesnesinin tüm alanlarını form state'ine aktarır, ardından `window.scrollTo({ top: 0, behavior: 'smooth' })` ile sayfayı yukarı kaydırır

---

### [N5_NASIL] AST Pointer: `src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage::handleSubmit`
- **params**: `e: React.FormEvent` — form submit olay nesnesi; `e.preventDefault()` ile varsayılan submit davranışı engellenir
- **ic_degiskenler**:
  - `payload` — API'ye gönderilecek fatura profili veri nesnesi; `user.id`, `profileType`, `firstName`, `lastName`, `companyName`, `taxNumber`, `taxOffice`, `city`, `district`, `addressLine`, `isDefault` ve sabit `country: 'TR'` değerlerini içerir; `profileType`'a göre `first_name`/`last_name` veya `company_name` alanları `null` olarak ayarlanır
- **Dönüş**: `Promise<void>` — zorunlu alan kontrolünden sonra `editingId` varsa `updateInvoiceProfile`, yoksa `createInvoiceProfile` ile API çağrısı yapar; ardından `resetForm()` ve `load()` ile formu sıfırlar ve listeyi yeniler

---

### [N6_NASIL] AST Pointer: `src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage::handleDelete`
- **params**: `id: string` — silinecek fatura profilinin benzersiz tanımlayıcısı
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<void>` — `confirm` ile onay aldıktan sonra `deleteInvoiceProfile(supabaseBrowserClient, id)` ile silme işlemi yapar, ardından `load()` ile listeyi yeniler

---

### [N7_NASIL] AST Pointer: `src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage::handleMakeDefault`
- **params**: `id: string` — varsayılan yapılacak fatura profilinin benzersiz tanımlayıcısı
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<void>` — `setDefaultInvoiceProfile(supabaseBrowserClient, id)` ile API çağrısı yapar, ardından `load()` ile listeyi yeniler

---

### [N8_NASIL] AST Pointer: `src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage::(map_callback)`
- **params**: `p: InvoiceProfile` — `items.map()` döngüsündeki mevcut fatura profili nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: `JSX.Element` — profil kartı JSX'i; `p.id` key olarak, `p.profile_type` ile ikon/rengi, `p.first_name`/`p.last_name`/`p.company_name` ile başlığı, `p.tax_office`/`p.tax_number` ile vergi bilgisini, `p.address_line`/`p.district`/`p.city` ile adres bilgisini, `p.is_default` ile varsayılan durum rozetini/gösterir; `startEdit(p)`, `handleDelete(p.id)`, `handleMakeDefault(p.id)` çağrıları butonlara bağlanmıştır

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