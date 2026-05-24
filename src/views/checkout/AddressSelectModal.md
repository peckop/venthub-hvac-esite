---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\AddressSelectModal.tsx
skeleton_hash: 7ffe6fa0c3a11b7d
generated_at: 2026-05-23T22:40:01Z
---

## Genel Bakış
VentHub HVAC platformunun ödeme (checkout) akışında yer alan bu React modülü, kullanıcıların ödeme sürecinde kayıtlı fatura veya teslimat adreslerini seçmesi için açılan bir modal pencere bileşenidir. Modal, adres seçiminin yanı sıra mevcut adreslerde düzenleme ve silme işlemlerini de destekleyerek tüm adres yönetimi işlemlerini tek bir arayüzde toplar, ödeme akışının kesintisiz ilerlemesini sağlar.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Modülün temelini oluşturan, tüm adres seçim ve yönetim işlevlerini bir araya getirerek kullanıcıya etkileşimli arayüz sunan ana React bileşenidir.
- AddressSelectModal

### Temel Modal Kontrol Parametreleri
Modal penceresinin temel çalışma mantığını yöneten, arayüzün başlığını ve pencerenin kapanma işlemini kontrol eden yapılandırma ve callback parametreleridir.
- title, onClose

### Adres Yönetim İşlevleri
Kullanıcıların kayıtlı adres listesine erişmesini, bir adresi ödeme için seçmesini, mevcut adresleri düzenlemesini veya silmesini sağlayan tüm adres odaklı işlem parametreleridir.
- addresses, onPick, onEdit, onDel

---

## AXIOMS – Mimari Varsayımlar
React tabanlı bu adres seçim modalı bileşeni, ödeme akışında kullanıcının mevcut adreslerini listeleyerek seçim, düzenleme ve silme işlemleri yapmasını sağlamak için tasarlanmıştır, çalışması için kendisine iletilen tüm prop'ların eksiksiz ve geçerli biçimde iletilmesi zorunludur.

[Aksiyom 1]: Eğer addresses (kullanıcının mevcut adres listesi) prop'u geçerli bir dizi olarak iletilmezse, modalda hiçbir adres listelenmez, kullanıcı adres seçme, düzenleme veya silme işlemlerini gerçekleştiremez.
[Aksiyom 2]: Eğer title (modal başlığı) prop'u iletilmezse, modalın amacına uygun başlık gösterilemez, kullanıcı modülün işlevini anlayamaz.
[Aksiyom 3]: Eğer onClose (modal kapatma tetikleyicisi) prop'u iletilmezse, kullanıcı modali kapatamaz, uygulama ekran akışı tıkanır.
[Aksiyom 4]: Eğer onPick (adres seçim onayı tetikleyicisi) prop'u iletilmezse, kullanıcı seçtiği adresi onaylayıp ödeme akışına ilerleyemez, adres seçme süreci tamamlanamaz.
[Aksiyom 5]: Eğer onEdit (adres düzenleme tetikleyicisi) prop'u iletilmezse, modal üzerinden mevcut adresleri düzenleme işlevi çalışmaz, kullanıcı adres bilgilerini güncelleyemez.
[Aksiyom 6]: Eğer onDel (adres silme tetikleyicisi) prop'u iletilmezse, modal üzerinden adres silme işlevi kullanılamaz, kayıtlı gereksiz adresler sistemden kaldırılamaz.

---

## FONKSIYON DETAYLARI

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

### [N1_NASIL] AST Pointer: src\views\checkout\AddressSelectModal.tsx::AddressSelectModal
- **params**: title, addresses, onClose, onPick, onEdit, onDelete, t
- **ic_degiskenler**:
  - `title` — Modal penceresinin üst kısmında gösterilen başlık metni prop'u
  - `addresses` — Kullanıcının kayıtlı tüm adreslerini içeren UserAddress tipinde dizi prop'u
  - `onClose` — Modalı kapatma butonuna tıklandığında tetiklenen callback fonksiyonu
  - `onPick` — Kullanıcı bir adresi kullanmak için seçtiğinde tetiklenen, seçilen adresi ileten callback
  - `onEdit` — Kullanıcı bir adresi düzenlemek istediğinde tetiklenen, düzenlenecek adresi ileten callback
  - `onDelete` — Kullanıcı bir adresi silmek istediğinde tetiklenen, silinecek adresin ID'sini ileten callback
  - `t` — Uluslararasılaştırma (i18n) çeviri fonksiyonu, anahtar bazında çevrilmiş metin döndürür
- **Dönüş**: Modal arayüzünü temsil eden React JSX elementi

### [N2_NASIL] AST Pointer: src\views\checkout\AddressSelectModal.tsx::addressMapCallback
- **params**: a
- **ic_degiskenler**:
  - `a` — addresses dizisindeki döngüde işlenen mevcut UserAddress nesnesi
  - `a.id` — Adresin benzersiz kimliği, JSX listesi anahtarı olarak kullanılır
  - `a.label` — Adresin kullanıcı tarafından atanan özel etiketi
  - `a.is_default_shipping` — Adresin varsayılan kargo adresi olup olmadığını belirten boolean değer
  - `a.full_address` — Adresin tam metin olarak tutulmuş hali, kartta görüntülenir
  - `t` — Üst modal fonksiyonundan devralınan çeviri fonksiyonu
  - `onEdit` — Üst fonksiyondan devralınan adres düzenleme tetikleyicisi, mevcut adresi parametre olarak iletir
  - `onDelete` — Üst fonksiyondan devralınan adres silme tetikleyicisi, mevcut adresin ID'sini parametre olarak iletir
  - `onPick` — Üst fonksiyondan devralınan adres seçme tetikleyicisi, mevcut adresi parametre olarak iletir
- **Dönüş**: Tek bir adres kartını temsil eden React JSX elementi

---

## NODE ID STANDARD

  file: src\views\checkout\AddressSelectModal.tsx
  function: src\views\checkout\AddressSelectModal.tsx::AddressSelectModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddressSelectModal