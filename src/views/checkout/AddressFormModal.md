---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\AddressFormModal.tsx
skeleton_hash: dbb4f3205dcd696a
entity_hashes:
  func:AddressFormModal: 22dcfc4163aec036
  func:handleSave: 51987ec8847e1d2c
  overview: 6d8dac3b90fdee5f
  style_tokens: 4fa16246087d5121
generated_at: 2026-05-28T22:39:51Z
---

## Genel Bakış
Bu modül, sipariş tamamlama (checkout) akışında kullanılan bir React modal bileşenidir. Kullanıcıların yeni adres eklemesi veya mevcut adreslerini düzenlemesi için açılan form penceresinin tüm temel işlevlerini yönetir. Dışarıdan alınan veriler ve geri çağırma fonksiyonları aracılığıyla ana uygulama akışıyla entegre çalışır.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Modülün ana giriş noktası olarak çalışır, dışarıdan gelen adres verisi, modal kapatma ve adres kaydedilmesi sonrası tetiklenecek geri çağırımları alarak modalın temel çalışma altyapısını kurar.
- AddressFormModal

### Form İşlem Yöneticileri
Formun gönderim ve kaydetme sürecini yönetir, form olayını yakalayarak adres verilerinin işlenmesini ve kaydedilmesini sağlar, işlem sonrası ilgili geri çağırımları tetikler.
- handleSave

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı adres formu modal bileşeni, dışarıdan alınan tüm prop'ların eksiksiz ve çalışır durumda olmasını, form işleyicisinin gerektirdiği event nesnesinin erişilebilir olmasını varsayar.

[Aksiyom 1]: Eğer onClose prop'u yoksa, modal bileşeni kapatılamaz, kullanıcı işlemini sonlandırmak için gerekli kapatma aksiyonu tetiklenemez olur.
[Aksiyom 2]: Eğer onSaved prop'u yoksa, adres başarılı bir şekilde kaydedildikten sonra üst katman bileşenlere kayıt durumu bildirilemez, adres yönetimiyle ilgili state'ler güncellenemez olur.
[Aksiyom 3]: Eğer t (çeviri) prop'u yoksa, modal içindeki arayüz metinleri işlenemez, kullanıcıya bozuk veya eksik metinler gösterilir olur.
[Aksiyom 4]: Eğer address prop'u yoksa, form üzerinde mevcut adresi düzenleme işlemi yapılamaz, kullanıcıya varsayılan olarak boş bir adres formu sunulur olur.
[Aksiyom 5]: Eğer handleSave fonksiyonuna gönderilen React.FormEvent nesnesi eksik veya erişilemez olursa, formun varsayılan gönderim davranışı engellenemez, sayfa yenilenir ve adres kayıt işlemi başarısız olur.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\AddressFormModal.tsx::AddressFormModal
- **params**: address, onClose, onSaved, t
- **ic_degiskenler**:
  - `saving` — Adres kaydetme işleminin devam edip etmediğini takip eden boolean state değişkeni
  - `setSaving` — `saving` state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `form` — Formun tüm alan değerlerini tutan state nesnesi, mevcut adres verileriyle varsayılan olarak doldurulur
  - `setForm` — `form` state nesnesini güncellemek için kullanılan React state setter fonksiyonu
  - `handleSave` - Form gönderildiğinde adres güncelleme işlemini yöneten içeride tanımlanan async fonksiyon
- **Dönüş**: Adres düzenleme modalı ve formunu içeren React JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\AddressFormModal.tsx::handleSave
- **params**: e: React.FormEvent
- **ic_degiskenler**:
  - `e.preventDefault` — Formun varsayılan sayfa yenileme davranışını engellemek için çağrılan olay metodu
  - `address` — Bileşene dışarıdan aktarılan mevcut adres nesnesi, boşluk kontrolü yapılıp güncellemede adres kimliği olarak kullanılır
  - `setSaving` — Kaydetme durumu state'ini güncellemek için kullanılan setter fonksiyonu
  - `updateAddress` — Supabase entegrasyonu ile veritabanında adresi güncellemek için çağrılan API fonksiyonu
  - `form.label, form.full_name, form.phone, form.address_line, form.city, form.district, form.postal_code, form.is_default_shipping, form.is_default_billing` — Formdaki güncel kullanıcı giriş değerleri, adres güncelleme verisi olarak gönderilir
  - `toast.success` — İşlem başarısı durumunda kullanıcıya bildirim göstermek için kullanılan toast kütüphanesi metodu
  - `t` — Çoklu dil çevirisi yapmak için kullanılan çeviri fonksiyonu, tüm metinleri çevirmek için kullanılır
  - `onSaved` — Adres başarıyla güncellendikten sonra ana bileşene haber vermek için çağrılan callback fonksiyonu
  - `onClose` — İşlem sonrası modal penceresini kapatmak için çağrılan callback fonksiyonu
  - `console.error` - Hata durumunda konsola hata detaylarını loglamak için kullanılan metod
  - `toast.error` — Hata durumunda kullanıcıya hata bildirimi göstermek için kullanılan toast kütüphanesi metodu
- **Dönüş**: yok

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