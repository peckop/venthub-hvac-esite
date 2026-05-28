---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\AddressSelectModal.tsx
skeleton_hash: 7ffe6fa0c3a11b7d
entity_hashes:
  func:AddressSelectModal: adfcf435f03c2db9
  overview: cd2d8adfb0ea97a4
  style_tokens: bb1c826648f8a0de
generated_at: 2026-05-28T22:40:06Z
---

## Genel Bakış
VentHub HVAC platformunun ödeme (checkout) sürecinde yer alan bu React modülü, kullanıcıların kayıtlı adreslerini listelediği ve birini seçerek ödeme işlemini başlattığı bir modal pencere bileşenidir. Modal, aynı zamanda mevcut adreslerin düzenlenmesi ve silinmesi gibi temel adres yönetimi fonksiyonlarını da tek bir arayüzde sunarak ödeme akışını basitleştirir.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Tüm adres seçim ve yönetim mantığını içinde barındıran, kullanıcıya açılan etkileşimli arayüzün temelini oluşturan ana React bileşenidir.
- AddressSelectModal

### Temel Kontrol ve Yapılandırma
Modal penceresinin görünümünü ve temel kullanım akışını kontrol eden parametrelerdir. Başlık ayarı ve pencerenin kapatılma işlemi bu gruba girer.
- title, onClose

### Adres Listesi ve Yönetim İşlevleri
Kullanıcının mevcut adreslerine erişmesini, birini seçmesini, düzenlemesini veya silmesini sağlayan tüm işlevsel parametrelerdir.
- addresses, onPick, onEdit, onDel

---

## AXIOMS – Mimari Varsayımlar

[Genel varsayım] AddressSelectModal, parametre olarak verilen bir dizi adres içerisinden seçim yapılmasını sağlayan React bileşenidir. Tüm parametreler zorunludur; hiçbirinin default değeri tanımlanmamıştır.

[Aksiyom 1]: Eğer `addresses` parametresi bir dizi (Array) olarak sağlanmazsa, bileşen adres listesini render edemez ve seçim sunamaz — bileşen hata verir veya boş bir modal gösterir.

[Aksiyom 2]: Eğer `onPick` parametresi bir fonksiyon (callback) olarak sağlanmazsa, kullanıcı bir adres seçtiğinde seçilen adres üst bileşene iletilemez — seçim işlevsiz kalır.

[Aksiyom 3]: Eğer `onClose` parametresi bir fonksiyon (callback) olarak sağlanmazsa, modal kapatma işlemi tetiklendiğinde bileşenin kapanma sinyali üst bileşene ulaştırılamaz — modal kapanmaz veya hata oluşur.

[Aksiyom 4]: Eğer `onEdit` parametresi bir fonksiyon (callback) olarak sağlanmazsa, kullanıcı bir adresi düzenlemek istediğinde düzenleme işlemi başlatılamaz — düzenle butonu işlevsiz kalır.

[Aksiyom 5]: Eğer `onDel` parametresi bir fonksiyon (callback) olarak sağlanmazsa, kullanıcı bir adresi silmek istediğinde silme işlemi tetiklenemez — sil butonu işlevsiz kalır.

[Aksiyom 6]: Eğer `title` parametresi bir string olarak sağlanmazsa, modal penceresinin başlık alanı anlamsız veya boş görünür — kullanıcı modalın amacını bilemeyebilir.

[Aksiyom 7]: Eğer `addresses` dizisi boş bir dizi (`[]`) olarak sağlanırsa, modal açık kalır ancak seçim yapılabilecek herhangi bir adres listelenmez — kullanıcı mevcut bir adres yoksa yeni adres eklemeye yönlendirilmelidir (bileşen dışındaki bir sorumluluk).

---

## FONKSİYON DETAYLARI

### AddressSelectModal
**Ne yapar**: VentHub HVAC projesinin ödeme (checkout) sürecinde kullanılan, kullanıcının kayıtlı adreslerini listeleyip sipariş için bir adres seçmesi, mevcut adreslerini düzenlemesi veya silmesi işlemlerini gerçekleştirmesine olanak tanıyan React modal bileşenidir. Kullanıcı deneyimini ödeme adımında adres seçimi sürecini sadeleştirerek hızlandırmak için tasarlanmıştır.
**Nasıl yapar**: Kendisine prop olarak iletilen tüm metadataları ve aksiyon fonksiyonlarını kullanarak tam işlevli bir modal arayüzü oluşturur. Listelenen her adres için seç, düzenle ve sil aksiyon butonlarını render eder, kullanıcının herhangi bir aksiyonu tetiklemesi durumunda üst bileşenden alınan ilgili geri çağırım fonksiyonunu çalıştırır. Modalın kapanma işlemini de üst bileşenden gelen onClose fonksiyonu üzerinden yöneterek uygulama state'i ile uyumlu çalışır.
**Parametreler**:
- title: string — Modalın üst kısmında kullanıcıya gösterilecek başlık metni, genellikle "Teslimat Adresi Seçin" veya "Kayıtlı Adresleriniz" gibi kullanıcıyı aksiyona yönlendiren ifadeler alır
- addresses: Address[] — Kullanıcıya listelenecek tüm kayıtlı adresleri içeren nesne dizisi, her bir adres nesnesi adresin tüm detaylarını ve benzersiz kimliğini barındırır
- onClose: () => void — Modalın kapatma butonuna tıklandığında veya modal dışı alana basıldığında tetiklenen, modalı ekrandan kaldıran üst bileşen kaynaklı geri çağırım fonksiyonu
- onPick: (selectedAddress: Address) => void — Kullanıcı bir adresi sipariş için seçtiğinde tetiklenen, seçilen tam adres nesnesini üst bileşene ileten geri çağırım fonksiyonu
- onEdit: (targetAddressId: string) => void — Kullanıcı mevcut bir adresi düzenlemek istediğinde tetiklenen, düzenlenecek adresin benzersiz kimliğini üst bileşene ileten geri çağırım fonksiyonu
- onDel: (targetAddressId: string) => void — Kullanıcı mevcut bir adresi silmek istediğinde tetiklenen, silinecek adresin benzersiz kimliğini üst bileşene ileten geri çağırım fonksiyonu
**Dönüş**: React.FC<AddressSelectModalProps> — Adres seçim, düzenleme ve silme işlemleri için tamamen etkileşimli bir modal arayüzü sunan React fonksiyonel bileşeni döndürür. Tüm tür denetimleri AddressSelectModalProps türü üzerinden gerçekleştirilen bu bileşen, projenin ödeme akışında kullanılmak üzere özel olarak geliştirilmiştir.

---

## INTERFACES

### AddressSelectModalProps
- `title: string`
- `addresses: UserAddress[]`
- `onClose: () => void`
- `onPick: (a: UserAddress) => void`
- `onEdit: (a: UserAddress) => void`
- `onDelete: (id: string) => void`
- `t: (key: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `AddressSelectModal.tsx`::AddressSelectModal
- **params**: (`title`, `addresses`, `onClose`, `onPick`, `onEdit`, `onDelete`, `t`)
- **ic_degiskenler**:
  - Fonksiyon gövdesi saf JSX render fonksiyonudur; iç değişken tanımlanmamıştır. Tüm parametreler doğrudan JSX içinde kullanılır.
- **Parametre Kullanımları**:
  - `title` — Modal başlık metni; `{title}` olarak `<div>` içinde render edilir
  - `addresses` — `UserAddress[]` dizisi; `addresses.length === 0` boşluk kontrolü ve `addresses.map((a) => ...)` iterasyonu ile listelenir
  - `onClose` — Kapatma callback'i; `<button onClick={onClose}>` olarak bağlanır
  - `onPick` — Seçim callback'i; `() => onPick(a)` arrow ile her address için bağlanır
  - `onEdit` — Düzenleme callback'i; `() => onEdit(a)` arrow ile her address için bağlanır
  - `onDelete` — Silme callback'i; `() => onDelete(a.id)` arrow ile address ID gönderilerek bağlanır
  - `t` — i18n çeviri fonksiyonu; `t('checkout.saved.close')`, `t('checkout.saved.address')`, `t('checkout.saved.default')`, `t('checkout.saved.edit')`, `t('checkout.saved.delete')`, `t('checkout.saved.use')` çağrılır
- **Dönüş**: `JSX.Element` — modal overlay + dialog JSX yapısı

---

### [N2_NASIL] AST Pointer: `AddressSelectModal.tsx`::`(a) => (...)` *(inline `.map()` callback)*
- **params**: (`a`)
- **ic_degiskenler**:
  - Fonksiyon gövdesi saf JSX render callback'idir; iç değişken tanımlanmamıştır.
- **Parametre Kullanımları**:
  - `a` — `UserAddress` nesnesi; aşağıdaki özellikleri erişilir:
    - `a.id` — `key={a.id}` olarak React key ve `onDelete(a.id)` olarak silme handler'ına argument olarak gönderilir
    - `a.label` — Adres etiketi; `a.label || t('checkout.saved.address')` ile fallback'li render edilir
    - `a.is_default_shipping` — Varsayılan kargo adresi flag'i; `{a.is_default_shipping && <span>...` ile koşullu render
    - `a.full_address` — Tam adres metni; `{a.full_address}` olarak `whitespace-pre-line` ile render edilir
  - Kapsam dışından: `onEdit`, `onDelete`, `onPick`, `t` — kapanış tarafından yakalanır
- **Dönüş**: `JSX.Element` — tek bir adres kartı (`<div>`) JSX'i

---

## NODE ID STANDARD

  file: src\views\checkout\AddressSelectModal.tsx
  function: src\views\checkout\AddressSelectModal.tsx::AddressSelectModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddressSelectModal

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/40`, `bg-white`, `border-b`, `hover:bg-gray-50`, `text-industrial-gray`, `text-primary-navy`, `text-red-600`, `text-sm`, `text-steel-gray`, `text-xs`
- **Layout:** `fixed`, `flex`, `gap-2`, `gap-4`, `grid`, `grid-cols-1`, `hover:shadow-sm`, `items-center`, `justify-between`, `justify-center`, `max-h-80vh`, `max-w-2xl`, `overflow-hidden`, `overflow-y-auto`, `p-3`
- **Varyant/Responsive:** `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-medium`, `font-semibold`, `hover:underline`, `inset-0`, `ml-1`, `mt-1`, `mt-3`, `px-3`, `px-5`, `py-1.5`, `py-4`, `rounded-2xl`, `rounded-full`, `rounded-lg`