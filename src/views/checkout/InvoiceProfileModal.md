---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\InvoiceProfileModal.tsx
skeleton_hash: 439cb76d859bcc9d
entity_hashes:
  func:InvoiceProfileModal: de25b37c1a2260e8
  overview: d09efa61e0a59dfc
  style_tokens: 7ba01f3f33eb1def
generated_at: 2026-06-06T21:58:29Z
---

## Genel Bakış
Bu modül, ödeme sürecinin fatura bilgileri adımında kullanılan bir React modal bileşenidir. Kullanıcının kayıtlı fatura profillerini listeden görüntülemesini ve tercih ettiği profili seçerek ödeme akışına devam etmesini sağlar.

## Fonksiyon Grupları
### Modal Bileşeni
Ödeme sayfasında fatura profili seçimini yöneten modal penceresini sunar. Görünürlük kontrolü, profil listesinin sunulması, profil seçilmesi ve pencerenin kapatılması gibi tüm işlemleri tek bir bileşen içinde üstlenir.
- InvoiceProfileModal

---

## AXIOMS – Mimari Varsayımlar
Bu React modal bileşeni, fatura profillerinin görüntülenmesi ve seçilmesi için prop'lara bağımlı çalışır. Aşağıda, bileşenin doğru çalışması için gereken mimari varsayımlar listelenmektedir.

[Aksiyom 1]: Eğer `open` prop'u boolean (true/false) olarak sağlanmazsa, modal'ın görünürlük durumu belirsiz olur ve bileşen açılıp kapatılamaz.
[Aksiyom 2]: Eğer `profiles` prop'u (fatura profilleri listesi) boş bir dizi veya tanımsız değilse, bileşen içeriği doğru şekilde gösterilir; aksi halde "profil bulunamadı" durumu oluşur.
[Aksiyom 3]: Eğer `onClose` callback fonksiyonu sağlanmazsa, modal'ın kapatılması (X butonu veya dışarı tıklama ile) parent bileşene bildirilemez ve akış kilitlenebilir.
[Aksiyom 4]: Eğer `onSelect` callback fonksiyonu sağlanmazsa, kullanıcı bir profil seçtiğinde bu seçim parent bileşene iletilemez ve ödeme akışı devam ettirilemez.
[Aksiyom 5]: Eğer `profiles` içindeki her bir profil nesnesi `id` ve display için gereken alanları (ör. name, tax_id vb.) içermiyorsa, bileşen bu profilleri doğru şekilde listeleyemez veya seçemez.
[Aksiyom 6]: Eğer `open` prop'u `true` iken modal render edilmezse, bileşen görünmez durumda olsa bile React tarafından mount edilmez ve kapanma mantığı bozulabilir.
[Aksiyom 7]: Eğer bileşen, fatura profili seçim akışı dışında (ör. farklı bir modal) kullanılırsa, `onSelect` beklenen veri yapısını sağlamayabilir ve downstream hatalar oluşur.

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

### [N1_NASIL] AST Pointer: InvoiceProfileModal.tsx::InvoiceProfileModal
- **params**: `open, onClose, profiles, onSelect`
- **ic_degiskenler**: `t` — useI18n hook'undan alınan çeviri fonksiyonu
- **Dönüş**: React JSX elementi veya null

### [N2_NASIL] AST Pointer: InvoiceProfileModal.tsx::(p => ...)
- **params**: `p` — profiles dizisindeki bir fatura profil nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: React JSX button elementi

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