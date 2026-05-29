---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountInvoicesPage.tsx
skeleton_hash: 33cc8de774e90e04
entity_hashes:
  func:AccountInvoicesPage: 8b46a7e878bbb3d8
  overview: 9517d7199843f54f
  style_tokens: e9dde5d26cd429fb
generated_at: 2026-05-29T18:52:06Z
---

## Genel Bakış
VentHub HVAC platformundaki kullanıcı hesapları modülünde yer alan fatura yönetim sayfasını oluşturan React bileşenidir. Bu bileşen, kullanıcının hesabına ait faturaları güvenli bir şekilde görüntülemesini ve yönetmesini sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tüm arayüzünü ve iş mantığını tek bir merkezi bileşen içinde barındırarak kullanıcıya fatura listesini sunar.
- AccountInvoicesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen fonksiyon gövdesi (implementation) bulunmadığından, yalnızca fonksiyon imzasından yola çıkılarak可靠 (güvenilir) bir mimari varsayım üretilememektedir.

Mevcut bilgiler:
- `AccountInvoicesPage()` — parametresiz, default değer içermeyen bir React bileşen imzası.

---

**Sonuç:** Fonksiyon gövdesi sağlanmadığı için aksiyom üretilememektedir. Mimari varsayımların çıkarılabilmesi için modülün implementasyon kodunun (fonksiyon gövdesinin) sunulması gerekmektedir.

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
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen kullanici bilgisi, fatura profilleri ile iliskili kullanici ID'sini saglar
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu, UI metinlerini çevirmek icin kullanilir
  - `items` — useState<InvoiceProfile[]>([]) ile olusturulan, kullanici fatura profillerinin listesini tutan state dizisi
  - `loading` — useState(true) ile olusturulan, veri yukleme durumunu takip eden boolean state
  - `saving` — useState(false) ile olusturulan, form gonderim islemi sirasindaki durumu takip eden boolean state
  - `editingId` — useState<string | null>(null) ile olusturulan, duzenlenen fatura profilinin ID'sini tutan state (null ise yeni olusturma modu)
  - `profileType` — useState<InvoiceProfileType>('individual') ile olusturulan, fatura profil tipi state'i (bireysel veya kurumsal)
  - `firstName` — useState('') ile olusturulan, bireysel profil icin ad bilgisini tutan state
  - `lastName` — useState('') ile olusturulan, bireysel profil icin soyad bilgisini tutan state
  - `companyName` — useState('') ile olusturulan, kurumsal profil icin firma unvani bilgisini tutan state
  - `taxNumber` — useState('') ile olusturulan, vergi numarasi (TCKN/VKN) bilgisini tutan state
  - `taxOffice` — useState('') ile olusturulan, vergi dairesi bilgisini tutan state
  - `city` — useState('') ile olusturulan, il bilgisini tutan state
  - `district` — useState('') ile olusturulan, ilce bilgisini tutan state
  - `addressLine` — useState('') ile olusturulan, adres detayini tutan state
  - `isDefault` — useState(false) ile olusturulan, profilin varsayilan olup olmadigini tutan boolean state
  - `load` — useCallback ile olusturulan, fatura profillerini yukleyen async fonksiyon
  - `resetForm` — form state'lerini sifirlayan fonksiyon
  - `startEdit` — mevcut bir profili duzenleme moduna geciren fonksiyon
  - `handleSubmit` — form gonderim islemini yoneten async fonksiyon
  - `handleDelete` — profil silme islemini yoneten async fonksiyon
  - `handleMakeDefault` — profili varsayilan yapma islemini yoneten async fonksiyon
- **Dönüş**: JSX (React elementi - fatura yonetim sayfasi)

### [N2_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — listInvoiceProfiles() API cagrisindan donen fatura profilleri dizisi
- **Dönüş**: Promise<void> (yukleme tamamlandiktan sonra item state'ini gunceller)

### [N3_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**: (degisken yok - sadece state setter cagrilari)
- **Dönüş**: void (tum form state'lerini varsayilan degerlere sifirlar)

### [N4_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::startEdit
- **params**: `(p: InvoiceProfile)` — duzenlenecek fatura profilinin tam verisi
- **ic_degiskenler**: (degisken yok - sadece state setter cagrilari)
- **Dönüş**: void (form alanlarini profil verileri ile doldurur ve sayfayi yukari kaydirir)

### [N5_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleSubmit
- **params**: `(e: React.FormEvent)` — form gonderim olayi
- **ic_degiskenler**:
  - `payload` — API'ye gonderilecek fatura profil verileri objesi, tum form alanlarini ve user_id, country gibi ek alanlari icerir
- **Dönüş**: Promise<void> (form gonderim islemini yonetir, basari/hata durumlarina gore toast mesaji gosterir)

### [N6_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleDelete
- **params**: `(id: string)` — silinecek fatura profilinin ID'si
- **ic_degiskenler**: (degisken yok - sadece API cagrisi ve state guncelleme)
- **Dönüş**: Promise<void> (profil silme islemini yonetir, onay dialogu gosterir, basari/hata durumlarina gore toast mesaji gosterir)

### [N7_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleMakeDefault
- **params**: `(id: string)` — varsayilan yapilacak fatura profilinin ID'si
- **ic_degiskenler**: (degisken yok - sadece API cagrisi ve state guncelleme)
- **Dönüş**: Promise<void> (profili varsayilan yapma islemini yonetir, basari/hata durumlarina gore toast mesaji gosterir)

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