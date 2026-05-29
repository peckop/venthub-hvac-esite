---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\AddressFormModal.tsx
skeleton_hash: 7754993243b50714
entity_hashes:
  func:AddressFormModal: 22dcfc4163aec036
  func:handleSave: 51987ec8847e1d2c
  overview: cddc87ce3d0ec431
  style_tokens: 4fa16246087d5121
generated_at: 2026-05-29T19:01:52Z
---

## Genel Bakış
Bu modül, sipariş tamamlama (checkout) sürecinde kullanıcıların adres bilgilerini girmesini veya düzenlemesini sağlayan bir React modal bileşenidir. Temel olarak, bir form aracılığıyla adres verilerinin toplanmasını ve kaydedilmesini yönetir.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Modülün dış arayüzünü ve temel yapısını oluşturur, gerekli prop'ları (mevcut adres verisi, kapatma ve kaydetme sonrası çağrılacak fonksiyonlar, çeviri nesnesi) alarak modal penceresinin ana iskeletini kurar.
- AddressFormModal

### Form Veri İşleme
Formun gönderilmesi olayını ele alır, kullanıcı tarafından girilen adres verilerini işler ve modülün sunduğu geri çağırma fonksiyonları aracılığıyla verileri üst katmana iletir.
- handleSave

---

## AXIOMS – Mimari Varsayımlar
Bu modül, sipariş tamamlama akışında adres formunu yöneten bir React modal bileşenidir. Aşağıda, bileşenin doğru çalışması için gerekli olan mimari varsayımlar listelenmektedir.

[Aksiyom 1]: Eğer `address` prop'u verilmezse, modal bileşeni varsayılan olarak yeni bir adres oluşturma modunda başlatılamaz.

[Aksiyom 2]: Eğer `onClose` fonksiyonu verilmezse, modal kapatılamaz ve kullanıcı arayüzünde takılmalara neden olur.

[Aksiyom 3]: Eğer `onSaved` fonksiyonu verilmezse, adres başarıyla kaydedildikten sonra ana uygulama güncellenemez.

[Aksiyom 4]: Eğer `t` (çeviri) fonksiyonu verilmezse, modal içindeki metinler çevrilemez.

[Aksiyom 5]: Eğer `handleSave` fonksiyonu geçerli bir `React.FormEvent` nesnesi alamazsa, form gönderimi sırasında hata oluşur ve adres kaydedilemez.

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

### [N1_NASIL] AST Pointer: src/views/checkout/AddressFormModal.tsx::AddressFormModal
- **params**: (address, onClose, onSaved, t)
- **ic_degiskenler**:
  - `saving` — Boolean state değişkeni, kayıt işleminin devam edip etmediğini kontrol eder
  - `form` — Adres formundaki tüm alanları tutan state nesnesi (label, full_name, phone, address_line, city, district, postal_code, is_default_shipping, is_default_billing)
  - `address?.label` — Var olan adresin etiketi (form başlatılırken kullanılır)
  - `address?.full_name` — Var olan adresin tam adı (form başlatılırken kullanılır)
  - `address?.phone` — Var olan adresin telefonu (form başlatılırken kullanılır)
  - `address?.address_line` — Var olan adresin açık adresi (form başlatılırken kullanılır)
  - `address?.city` — Var olan adresin şehri (form başlatılırken kullanılır)
  - `address?.district` — Var olan adresin ilçesi (form başlatılırken kullanılır)
  - `address?.postal_code` — Var olan adresin posta kodu (form başlatılırken kullanılır)
  - `address?.is_default_shipping` — Var olan adresin varsayılan kargo adresi olup olmadığı (form başlatılırken kullanılır)
  - `address?.is_default_billing` — Var olan adresin varsayılan fatura adresi olup olmadığı (form başlatılırken kullanılır)
  - `handleSave` — Form gönderildiğinde çağrılan asenkron fonksiyon
- **Dönüş**: JSX element (modal form)

### [N2_NASIL] AST Pointer: src/views/checkout/AddressFormModal.tsx::handleSave
- **params**: (e: React.FormEvent)
- **ic_degiskenler**:
  - `saving` — State değişkeni, kayıt işlemini devre dışı bırakmak için true yapılır
  - `address` — Prop'tan gelen adres nesnesi, var olup olmadığı kontrol edilir ve `id` özelliği kullanılır
  - `form.label` — Form nesnesinden gelen etiket alanı
  - `form.full_name` — Form nesnesinden gelen tam ad alanı
  - `form.phone` — Form nesnesinden gelen telefon alanı
  - `form.address_line` — Form nesnesinden gelen açık adres alanı
  - `form.city` — Form nesnesinden gelen şehir alanı
  - `form.district` — Form nesnesinden gelen ilçe alanı
  - `form.postal_code` — Form nesnesinden gelen posta kodu alanı
  - `form.is_default_shipping` — Form nesnesinden gelen varsayılan kargo adresi alanı
  - `form.is_default_billing` — Form nesnesinden gelen varsayılan fatura adresi alanı
  - `t('checkout.saved.updated')` — Başarılı kayıt sonrası gösterilen başarı mesajı
  - `t('checkout.saved.updateError')` — Hata durumunda gösterilen hata mesajı
  - `onSaved` — Başarılı kayıt sonrası çağrılan callback fonksiyonu
  - `onClose` — Başarılı kayıt sonrası modalı kapatan fonksiyon
- **Dönüş**: void (dönüş değeri yok, yan etkiler: state güncelleme, toast gösterme, modal kapatma)

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