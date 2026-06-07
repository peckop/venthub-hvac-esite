---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\AddressFormModal.tsx
skeleton_hash: 3ba5f5925140cd7c
entity_hashes:
  func:AddressFormModal: 22dcfc4163aec036
  func:handleSave: 51987ec8847e1d2c
  overview: d6c90c44e9a5f962
  style_tokens: 4fa16246087d5121
generated_at: 2026-06-07T12:14:49Z
---

## Genel Bakış
Bu modül, ödeme sürecinin bir parçası olarak kullanıcıların adres bilgilerini girip düzenlemelerini sağlayan bir modal form bileşenidir. Mevcut bir adresi düzenleme veya yeni bir adres oluşturma senaryolarını destekler; form verilerini işleyerek üst bileşene iletir ve modal'ın akışını kontrol eder.

## Fonksiyon Grupları
### Ana Bileşen ve Arayüz
Modal'ın genel yapısını, form alanlarını ve modal penceresinin açılma/kapanma mekanizmasını oluşturarak kullanıcı arayüzünü yönetir.
- AddressFormModal

### Form İşleme ve Veri Akışı
Kullanıcının formu göndermesiyle tetiklenen veri doğrulama, hazırlama ve üst bileşene geri bildirim gönderme süreçlerini yönetir.
- handleSave

---



---

## FONKSİYON DETAYLARI

### AddressFormModal
**Ne yapar**: VentHub HVAC sisteminin ödeme adımında kullanılan, adres ekleme veya mevcut adresi düzenleme işlemleri için tasarlanmış bir React modal bileşenidir. Kullanıcıların adres bilgilerini girmesine, işlemi iptal etmesine veya girdiği bilgileri kaydetmesine olanak tanır.
**Nasıl yapar**: Props olarak aldığı mevcut adres nesnesini form alanlarına önceden yükleyerek kullanıcı dostu bir düzenleme deneyimi sunar. Form içeren bir modal penceresini kullanıcı arayüzüne render eder, iletilen callback fonksiyonları aracılığıyla üst bileşenlerle iletişim kurarak kapatma ve kaydetme aksiyonlarını sorunsuz bir şekilde yönetir.
**Parametreler**:
- name: address — Kullanıcının düzenlemek üzere seçtiği mevcut adres nesnesi, yeni adres ekleme sürecinde boş değer alabilir, adres yapısını tanımlayan özel bir tiptedir
- name: onClose — Modal penceresinin kapatılma isteğini üst bileşene iletmek için kullanılan callback fonksiyonu
- name: onSaved — Adres bilgileri başarıyla kaydedildikten sonra üst bileşendeki ödeme akışını sürdürmek için çağrılan callback fonksiyonu
- name: t — Çoklu dil desteği için kullanılan çeviri fonksiyonu, modal içindeki tüm arayüz metinlerini aktif dile göre çeker
**Dönüş**: React.FC<AddressFormModalProps> tipinde, adres formunu içeren modal bileşenini kullanıcı arayüzüne render eder.

### handleSave
**Ne yapar**: Adres formunun gönderim ve kaydetme sürecini yöneten yerel işleyici fonksiyonudur. Formdaki kullanıcı tarafından girilen adres bilgilerinin işlenerek kaydedilmesini sağlar.
**Nasıl yapar**: Formun varsayılan HTML gönderim davranışını engelleyerek gereksiz sayfa yenilenmesini önler, form üzerindeki girilen bilgileri doğrular ve geçerliyse kaydetme sürecini başlatır. İşlem başarılı olduktan sonra modalın kapanması için gerekli aksiyonları tetikler.
**Parametreler**:
- name: e — type: React.FormEvent — Adres formunun gönderim olayını taşıyan olay nesnesi, form davranışını kontrol etmek için kullanılır
**Dönüş**: Herhangi bir değer döndürmez, sadece form gönderim sürecini yönetir ve ilgili aksiyonları tetikler.

---

## INTERFACES

### AddressFormModalProps
- `address: UserAddress | null`
- `onClose: () => void`
- `onSaved: () => void`
- `t: (key: string) => string`

---

## NODE ID STANDARD

  file: src\views\checkout\AddressFormModal.tsx
  function: src\views\checkout\AddressFormModal.tsx::AddressFormModal
  function: src\views\checkout\AddressFormModal.tsx::handleSave

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddressFormModal

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/40`, `bg-primary-navy`, `bg-white`, `border-b`, `border-t`, `hover:bg-secondary-blue`, `hover:text-primary-navy`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-white`, `text-xs`
- **Layout:** `block`, `fixed`, `flex`, `flex-wrap`, `gap-2`, `gap-4`, `grid`, `grid-cols-2`, `items-center`, `justify-between`, `justify-center`, `justify-end`, `max-w-lg`, `min-h-20`, `overflow-hidden`
- **Varyant/Responsive:** `disabled:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `disabled:opacity-50`, `font-medium`, `font-semibold`, `inset-0`, `mb-1`, `pt-2`, `pt-4`, `px-3`, `px-5`, `px-6`, `py-2`, `py-4`, `rounded-2xl`, `rounded-lg`