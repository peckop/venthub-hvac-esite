---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\InvoiceProfileModal.tsx
skeleton_hash: d8ff7f27fe67b7db
generated_at: 2026-05-23T22:40:16Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ödeme sürecinin fatura adımında kullanılan bir React modal bileşenidir. Kullanıcıların kayıtlı mevcut fatura profillerini görüntülemesi ve işleme devam etmek için bir profil seçmesi amacıyla tasarlanmıştır. Tüm çalışma mantığını üst bileşenden aldığı girdiler üzerinden yürütür, kendi bağımsız durum yönetimi bulunmaz.

## Fonksiyon Grupları
### Ana Modal Yönetim Bileşeni
Modalın tüm temel işlevlerini yerine getiren tek ana bileşendir. Açılma/kapanma durumunu yönetir, gelen fatura profillerini kullanıcıya sunar ve kullanıcının yaptığı seçim veya kapatma işlemini üst bileşene iletir.
- InvoiceProfileModal

---

## AXIOMS – Mimari Varsayımlar
Bu React modal bileşeni, fatura profili seçimi işlemleri için tasarlanmıştır, çalışması için parent bileşen tarafından zorunlu tüm prop'ların eksiksiz olarak iletilmesi zorunludur.

[Aksiyom 1]: Eğer `open` boolean görünürlük kontrolü prop'u iletilmezse, modalın açılıp kapanma durumu yönetilemez, arayüz kullanıcıya asla açılmaz veya kontrolsüz bir şekilde kalıcı olarak görünür kalır.
[Aksiyom 2]: Eğer `onClose` modal kapatma callback fonksiyonu iletilmezse, kullanıcının modalı kapatma aksiyonu tetiklenemez, arayüz akışı tıkanır.
[Aksiyom 3]: Eğer `profiles` seçilebilir fatura profilleri listesi iletilmez veya boş geçilirse, kullanıcıya seçim yapabileceği herhangi bir fatura profili gösterilemez, ödeme akışındaki profil seçimi adımı tamamlanamaz.
[Aksiyom 4]: Eğer `onSelect` profil seçimi sonrası çalıştırılacak parent callback fonksiyonu iletilmezse, kullanıcının seçtiği fatura profili üst bileşene iletilemez, seçim işlemi hiçbir işlevsel sonuca ulaşmaz.

---

## FONKSIYON DETAYLARI

### InvoiceProfileModal
**Ne yapar**: Venthub HVAC projesinin ödeme adımında kullanılan, kullanıcının kayıtlı fatura profillerini görüntülemesi ve birini seçmesi için açılan modal React bileşenidir. Sipariş sürecinde fatura detaylarının belirlenmesi aşamasında kullanılır, kullanıcının seçim yapmasını veya modalı kapatmasını sağlar.
**Nasıl yapar**: React fonksiyonel bileşeni olarak çalışır, open prop'u aracılığıyla görünürlük durumunu merkezi olarak yönetir. Gelen profiles listesini modal içeriğinde kullanıcıya sunar, kullanıcının bir profil seçmesi durumunda onSelect geri çağırımını tetikleyerek seçilen veriyi üst bileşene iletir. Kullanıcının modalı kapatma isteği durumunda ise onClose fonksiyonunu çağırarak modalın gizlenmesini tetikler.
**Parametreler**:
- open: boolean — Modalin ekranda görünür olup olmama durumunu kontrol eden boolean değerdir, true olduğunda modal görüntülenir, false olduğunda gizlenir.
- onClose: () => void — Kullanıcı tarafından modalın kapatılması istendiğinde tetiklenen boş dönüşlü geri çağırma fonksiyonudur, üst bileşende open durumunu false yaparak modalın kapanmasını sağlar.
- profiles: Array<InvoiceProfile> — Kullanıcıya listelenecek tüm kayıtlı fatura profillerini içeren dizidir, her elemanı fatura için gerekli olan adres, vergi numarası, unvan gibi detayları barındıran nesnelerdir.
- onSelect: (selectedProfile: InvoiceProfile) => void — Kullanıcı listeden bir fatura profili seçtiğinde tetiklenen, seçilen profili parametre olarak alan geri çağırma fonksiyonudur, seçilen profilin siparişe eklenmesi için üst bileşene veri iletilmesini sağlar.
**Dönüş**: React.FC<InvoiceProfileModalProps> — Verilen prop türlerini tip güvenli bir şekilde kullanan React fonksiyonel bileşeni döndürür, bu bileşen fatura profili seçim arayüzünü sayfa DOM'una ekleyerek kullanıcı ile etkileşim sağlar.

---

## INTERFACES

### InvoiceProfileModalProps
- `open: boolean`
- `onClose: () => void`
- `profiles: InvoiceProfile[]`
- `onSelect: (p: InvoiceProfile) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\InvoiceProfileModal.tsx::InvoiceProfileModal
- **params**: open (modalın açık kalma durumunu tutan boolean), onClose (modalı kapatmak için tetiklenen callback fonksiyonu), profiles (listelenecek fatura profilleri dizisi), onSelect (profil seçildiğinde tetiklenen callback fonksiyonu)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, arayüz metinlerini çevirmek için kullanılır
  - `e` — modal arka plan tuş basma olayında yakalanan event nesnesi, Escape tuşu ile kapatma işlevinde kullanılır
  - `p` — profiles.map döngüsünde her bir fatura profili için atanan döngü değişkeni
- **Dönüş**: open koşulu sağlanmazsa null, aksi takdirde fatura profili seçim modalını içeren React JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\InvoiceProfileModal.tsx::profiles.map_callback
- **params**: p (tekil InvoiceProfile tipinde fatura profili nesnesi)
- **ic_degiskenler**:
  - `p.id` — profilin benzersiz kimliği, React liste öğesi için key niteliğinde kullanılır
  - `p.profile_type` — profilin bireysel/kurumsal olduğunu belirten alan, ikon ve arka plan rengi seçimi için kullanılır
  - `p.first_name` — bireysel profilin sahibinin adı, profil başlığını oluşturmak için kullanılır
  - `p.last_name` — bireysel profilin sahibinin soyadı, profil başlığını oluşturmak için kullanılır
  - `p.company_name` — kurumsal profilin şirket adı, profil başlığını göstermek için kullanılır
  - `p.is_default` — profilin varsayılan olup olmadığını belirten boolean, varsayılan etiketini göstermek için kullanılır
  - `p.tax_office` — profilin kayıtlı olduğu vergi dairesi, vergi bilgileri satırında gösterilir
  - `p.tax_number` — profilin vergi numarası, vergi bilgileri satırında gösterilir
  - `p.address_line` — profilin açık adres satırı, tam adres metnini oluşturmak için kullanılır
  - `p.district` — profilin bulunduğu ilçe, tam adres metnini oluşturmak için kullanılır
  - `p.city` — profilin bulunduğu şehir, tam adres metnini oluşturmak için kullanılır
- **Dönüş**: Her bir fatura profili için oluşturulan tıklanabilir profil kartı buton elementi, React listesine eklenmek üzere döndürülür

---

## NODE ID STANDARD

  file: src\views\checkout\InvoiceProfileModal.tsx
  function: src\views\checkout\InvoiceProfileModal.tsx::InvoiceProfileModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: InvoiceProfileModal