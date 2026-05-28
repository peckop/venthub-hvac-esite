---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\InvoiceProfileModal.tsx
skeleton_hash: d8ff7f27fe67b7db
entity_hashes:
  func:InvoiceProfileModal: de25b37c1a2260e8
  overview: 720b77fe25ff7933
  style_tokens: 7ba01f3f33eb1def
generated_at: 2026-05-28T22:40:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ödeme sürecinin fatura adımında kullanılan bir React modal bileşenidir. Kullanıcıların kayıtlı fatura profillerini görüntülemesi ve birini seçerek ödeme akışına devam etmesini sağlar.

## Fonksiyon Grupları
### Ana Modal Yönetim Bileşeni
Modalın tüm temel işlevlerini yerine getiren, dışarıdan alınan girdilerle çalışan tek bileşendir. Görünürlük durumunu kontrol eder, profil listesini sunar ve kullanıcının seçimini veya kapatma işlemini üst bileşene iletir.
- InvoiceProfileModal

---

## AXIOMS – Mimari Varsayımlar
Bu React modal bileşeni, fatura profillerinin görüntülenmesi ve seçilmesi için prop'lara bağımlı olarak çalışır. Bağımsız durum yönetimi yoktur.

[Aksiyom 1]: Eğer `open` prop'u `true` değilse, modal bileşeni kullanıcıya görünür şekilde render edilmez (veya DOM'da yer almaz).

[Aksiyom 2]: Eğer `onClose` prop'u bir fonksiyon değilse (veya verilmemişse), modal kapatma işlemi (X butonu, backdrop tıklama, Escape tuşu) üst bileşene iletilemez ve hata oluşur.

[Aksiyom 3]: Eğer `profiles` prop'u bir dizi (Array) olarak verilmemişse, bileşen fatura profillerini listeleme işlemini yürütemez ve hata oluşur.

[Aksiyom 4]: Eğer `onSelect` prop'u bir fonksiyon değilse (veya verilmemişse), kullanıcının bir fatura profili seçmesi durumunda seçim sonucu üst bileşene iletilemez ve hata oluşur.

[Aksiyom 5]: Eğer `open` prop'u `true` iken `onClose` prop'u çağrılmadan bileşenin unmount edilmesi isteniyorsa, üst bileşenin `open` prop'unu `false` yaparak bileşeni kontrollü şekilde kapatması gerekir, aksi takdirde modal durumu üst bileşenle senkronize kalmaz.

[Aksiyom 6]: Eğer `profiles` prop'u boş bir dizi (`[]`) olarak verilmişse, bileşen "kayıtlı profil bulunmamaktadır" veya benzeri durumu göstermelidir; profilsiz durum için ayrık bir UI dalı gereklidir (bu durumda `onSelect` tetiklenemez).

---

## FONKSİYON DETAYLARI

### InvoiceProfileModal

**Ne yapar**: Fatura profillerini listeleyen ve kullanıcının bir profil seçmesine olanak tanıyan modal bileşenidir. Bu bileşen, fatura oluştururken veya düzenlerken kullanıcının mevcut profiller arasından seçim yapmasını sağlar.

**Nasıl yapar**: `open` prop'unu kontrol ederek modalın görünürlüğünü yönetir. `profiles` prop'u ile gelen profil listesini modal içinde render eder ve her bir profil için seçim yapılabilir alanlar oluşturur. Kullanıcı bir profil seçtiğinde `onSelect` fonksiyonunu çağırarak seçilen profili üst bileşene iletir. `onClose` fonksiyonu ile modal kapatılabilir.

**Parametreler**:
- `open` : `boolean` — Modalın açık veya kapalı durumunu belirler, true değerinde modal görüntülenir
- `onClose` : `() => void` — Modal kapatılmak istendiğinde çağrılan geri çağırım fonksiyonu
- `profiles` : `InvoiceProfile[]` — Modalda gösterilecek fatura profillerinin dizisi
- `onSelect` : `(profile: InvoiceProfile) => void` — Kullanıcı bir profil seçtiğinde çağrılan ve seçilen profil objesini parametre olarak alan fonksiyon

**Dönüş**: `React.FC<InvoiceProfileModalProps>` — React fonksiyonel bileşeni döner, modal yapısını ve profil seçim arayüzünü render eder

---

## INTERFACES

### InvoiceProfileModalProps
- `open: boolean`
- `onClose: () => void`
- `profiles: InvoiceProfile[]`
- `onSelect: (p: InvoiceProfile) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\InvoiceProfileModal.tsx::({ open, onClose, profiles, onSelect })
- **params**: open, onClose, profiles, onSelect
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan alınan çeviri fonksiyonu
- **Dönüş**: null veya React elementi (JSX)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\InvoiceProfileModal.tsx::(p) => (...)
- **params**: p
- **ic_degiskenler**: (yok)
- **Dönüş**: React elementi (JSX)

---

## NODE ID STANDARD

  file: src\views\checkout\InvoiceProfileModal.tsx
  function: src\views\checkout\InvoiceProfileModal.tsx::InvoiceProfileModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: InvoiceProfileModal

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50`, `bg-blue-50`, `bg-green-50`, `bg-slate-50`, `bg-slate-50/50`, `bg-slate-900/60`, `bg-white`, `border-b`, `border-green-100`, `border-slate-100`, `border-slate-200`, `border-t`, `hover:bg-slate-100`, `hover:bg-white`, `hover:border-primary-navy/40`
- **Layout:** `absolute`, `backdrop-blur-md`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `gap-1`, `gap-3`, `gap-4`, `h-10`, `hover:shadow-md`, `inline-flex`, `items-center`, `items-start`
- **Varyant/Responsive:** `:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${p.profile_type`, `:`, `===`, `border`, `font-black`, `font-bold`, `group`, `individual`, `inset-0`, `italic`, `mb-1`, `mb-2`, `px-2`, `px-8`, `py-0.5`