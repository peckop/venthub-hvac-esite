---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\InvoiceProfileModal.tsx
skeleton_hash: 66ab891d3cd337d9
entity_hashes:
  func:InvoiceProfileModal: de25b37c1a2260e8
  overview: 9a64ef3b1c56eb7b
  style_tokens: 7ba01f3f33eb1def
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış
Bu modül, ödeme sürecinin fatura bilgileri adımında kullanılan bir React modal bileşenidir. Kullanıcının kayıtlı fatura profillerini bir listeden görüntülemesini ve tercih ettiği profili seçerek ödeme akışına devam etmesini sağlar.

## Fonksiyon Grupları
### Fatura Profili Seçim Bileşeni
Ödeme sayfasında fatura profillerinin listelenmesi ve seçilmesini yöneten modal penceresini sunar. Bileşen, görünürlük kontrolü, profil listesinin sunulması, profil seçiminde callback tetiklenmesi ve pencerenin kapatılması gibi işlemleri tek bir kapsamlı bileşen içinde üstlenir.
- InvoiceProfileModal

---

## AXIOMS – Mimari Varsayımlar
Bu React modal bileşeni, fatura profillerinin görüntülenmesi ve seçilmesi için prop'lara bağımlıdır.

[Aksiyom 1]: Eğer `open` prop'u (boolean) yoksa, modal'ın görünürlük durumu belirsiz olur ve bileşen kendi başına açılamaz veya kapatılamaz.
[Aksiyom 2]: Eğer `onClose` prop'u (fonksiyon) yoksa, modal penceresi kullanıcı tarafından kapatılamaz ve kullanım akışı engellenir.
[Aksiyom 3]: Eğer `profiles` prop'u (dizi) yoksa veya boşsa, modal içinde gösterilecek fatura profili bulunamaz ve listing/hiyerarşi görünümü boş kalır.
[Aksiyom 4]: Eğer `onSelect` prop'u (fonksiyon) yoksa, kullanıcının listeden bir fatura profili seçmesi sonrası ödeme akışı başlatılamaz veya profil bilgisi üst bileşenlere iletilmez.

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

### [N1_NASIL] AST Pointer: src/views/checkout/InvoiceProfileModal.tsx::InvoiceProfileModal
- **params**: `open` — modalin açık/kapalı durumunu kontrol eden boolean; `onClose` — modalı kapatan callback fonksiyonu; `profiles` — fatura profil listesi (InvoiceProfile[]); `onSelect` — profil seçildiğinde çağrılan callback fonksiyonu
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('checkout.invoice.noProfile')` gibi çağrılarla localized string döndürür
- **Dönüş**: JSX elementi (modal dialog JSX'i) veya `null` (`open` false ise)

### [N2_NASIL] AST Pointer: src/views/checkout/InvoiceProfileModal.tsx::(p) => (...)
- **params**: `p` — döngüdeki tek bir fatura profil objesi (InvoiceProfile); `profiles.map()` içinde her eleman için çağrılır
- **ic_degiskenler**: (yok)
- **Erişilen alanlar**: `p.id` — profil benzersiz kimliği, button key olarak kullanılır; `p.profile_type` — bireysel/kurumsal ayrımı (`'individual'` olup olmadığı kontrol edilir); `p.first_name` — bireysel profil için ad; `p.last_name` — bireysel profil için soyad; `p.company_name` — kurumsal profil için şirket adı; `p.is_default` — varsayılan profil olup olmadığı, true ise "Varsayılan" badge gösterir; `p.tax_office` — vergi dairesi adı; `p.tax_number` — vergi numarası; `p.address_line` — adres satırı; `p.district` — ilçe; `p.city` — il
- **Dönüş**: JSX elementi (seçilebilir buton)

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