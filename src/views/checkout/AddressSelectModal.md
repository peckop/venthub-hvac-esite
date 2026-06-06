---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\AddressSelectModal.tsx
skeleton_hash: 8a7fdbb5be0360d2
entity_hashes:
  func:AddressSelectModal: adfcf435f03c2db9
  overview: 55656091e9138090
  style_tokens: 0a79973eb6842aa3
generated_at: 2026-06-06T21:58:17Z
---

## Genel Bakış
Bu modül, ödeme (checkout) sürecinde kullanıcıların kayıtlı adreslerini görüntülediği, birini seçerek ödeme işlemini başlattığı ve adres yönetimi (düzenleme, silme) yaptığı bir modal pencere bileşenidir. Tüm adres seçim ve yönetim işlevlerini tek bir arayüzde toplayarak ödeme akışını basitleştirir.

## Fonksiyon Grupları
### Ana Bileşen
Tüm modal pencere mantığını ve kullanıcı etkileşimini yöneten temel React bileşenidir.
- AddressSelectModal

### Pencere Kontrolleri
Modal penceresinin görünümünü ve temel kullanım akışını belirleyen parametrelerdir.
- title, onClose

### Adres Verisi ve İşlevleri
Kullanıcının adreslerini gösteren veri ve bu adreslerle yapılan tüm seçim, düzenleme ve silme işlemlerini tetikleyen callback fonksiyonlarıdır.
- addresses, onPick, onEdit, onDel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için somut fonksiyon gövdesi mevcut değildir; yalnızca fonksiyon imzası ve eski doküman bilgisi verilmiştir. Dolayısıyla aşağıda, imza parametrelerine ve eski dokümanın genel bakış açıklamasına dayanan **kabul varsayımları** sunulmaktadır.

**[Aksiyom 1]:** Eğer `addresses` parametresi `undefined`, `null` veya boş dizi (`[]`) ise, modal üzerinde kullanıcıya gösterilecek adres listesi boş olur ve kullanıcının bir adres seçmesi (`onPick` çağrısı) mümkün değildir.

**[Aksiyom 2]:** Eğer `onPick` callback'i çağrılmadan modal kapatılırsa (`onClose` çağrısı ile), seçilmemiş bir adres durumu oluşur ve üst bileşenin bu durumu ele alması beklenir.

**[Aksiyom 3]:** Eğer `onEdit` callback'i çağrılmadan önce ilgili adresin geçerliliği (ör. silinmiş, sunucu tarafında kaldırılmış) düşmüşse, düzenleme akışında hata oluşabilir; bu durum modülün kendi içinde ele alınmaz.

**[Aksiyom 4]:** Eğer `onDel` callback'i çağrılarak bir adres silinirse, `addresses` listesinin güncellenmiş hali üst bileşen tarafından sağlanmalı ve modal listeyi yeniden render etmelidir. Liste dışarıdan güncellenmezse modal eski veriyi göstermeye devam eder.

**[Aksiyom 5]:** Eğer `title` parametresi boş string (`""`) veya `undefined` ise, modal başlığının nasıl render edileceği üst bileşenin sorumluluğundadır; modül içinde bir fallback başlık değeri tanımlı değildir.

**[Aksiyom 6]:** Eğer `onClose`, `onPick`, `onEdit` veya `onDel` callback'lerinden herhangi biri `undefined` olarak geçirilirse, ilgili butona tıklandığında zaman hatası (`is not a function`) oluşur; modül içinde callback varlık kontrolü yapılmaz.

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
- `onAddNew?: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AddressSelectModal.tsx::AddressSelectModal
- **params**: `{ title, addresses, onClose, onPick, onEdit, onDelete, t, onAddNew }`
- **ic_degiskenler**: Tanımlı iç değişken yok. Tüm kullanım parametreler üzerindendir.
- **Dönüş**: JSX Elemanı (React.FC<AddressSelectModalProps>).

### [N2_NASIL] AST Pointer: AddressSelectModal.tsx::(anonim map callback)
- **params**: `a` — `addresses` dizisindeki tek bir `UserAddress` nesnesi.
- **ic_degiskenler**:
  - `a.id` — Adresin benzersiz tanımlayıcısı, `key` prop'u ve `onDelete` çağrıları için kullanılır.
  - `a.label` — Kullanıcının tanımladığı adres etiketi. Yoksa `t('checkout.saved.address')` çevirisi ile değiştirilir.
  - `a.is_default_shipping` — Boole. Varsayılan nakliye adresi ise `true` döner ve "Varsayılan" etiketi gösterilir.
  - `a.full_address` — Adresin tamamı, satır atlama karakterleri ile formatlanmış metin.
- **Dönüş**: JSX Elemanı (Her bir adres kartı `<div>`).

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
- **Layout:** `fixed`, `flex`, `gap-2`, `gap-3`, `gap-4`, `grid`, `grid-cols-1`, `hover:shadow-sm`, `items-center`, `justify-between`, `justify-center`, `max-h-80vh`, `max-w-2xl`, `overflow-hidden`, `overflow-y-auto`
- **Varyant/Responsive:** `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-medium`, `font-semibold`, `hover:underline`, `inset-0`, `ml-1`, `mt-1`, `mt-3`, `px-3`, `px-5`, `py-1.5`, `py-4`, `rounded-2xl`, `rounded-full`, `rounded-lg`