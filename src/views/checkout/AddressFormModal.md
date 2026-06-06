---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\AddressFormModal.tsx
skeleton_hash: 36cea506afbf6d87
entity_hashes:
  func:AddressFormModal: 22dcfc4163aec036
  func:handleSave: 51987ec8847e1d2c
  overview: e2728fdf3d977a4e
  style_tokens: 4fa16246087d5121
generated_at: 2026-06-06T21:58:14Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının ödeme adımında sipariş sürecini tamamlamak için kullanılan bir React modal bileşenidir. Kullanıcıların mevcut adres bilgilerini düzenlemesine veya yeni adres eklemesine olanak tanır. Formdan gelen verileri işleyerek üst bileşene iletir ve modal penceresinin akışını yönetir.

## Fonksiyon Grupları
### Ana Bileşen Yapısı
Modal penceresinin temel iskeletini ve form alanlarını oluşturarak kullanıcı arayüzünü sunar. Adres düzenleme veya oluşturma durumuna göre formu dinamik olarak render eder.
- AddressFormModal

### Form Gönderim Yönetimi
Kullanıcının formu göndermesiyle tetiklenen asenkron süreçten sorumludur. Giriş doğrulamasını yapar, verileri hazırlar ve üst bileşene geri çağırma fonksiyonları aracılığıyla aktarır.
- handleSave

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari varsayımlar, verilen fonksiyon imzalarına dayalı olarak çıkarılmıştır.

**[Aksiyom 1]:** Eğer `onClose` callback'i sağlanmazsa, modal penceresinin kullanıcı tarafından kapatılması mümkün olmaz ve kullanıcı arayüzünde takılma durumu oluşur.

**[Aksiyom 2]:** Eğer `onSaved` callback'i sağlanmazsa, adres başarıyla kaydedildikten sonra üst katman (örn: sipariş formu) güncel adres bilgisini alamaz ve veri tutarsızlığı oluşur.

**[Aksiyom 3]:** Eğer `t` fonksiyonu sağlanmazsa, modal içindeki metinler ve hata mesajları çevrilmemiş olarak gösterilir veya çeviri hatası oluşur.

**[Aksiyom 4]:** Eğer `address` parametresi `null` veya `undefined` olarak geçilirse, bileşen "yeni adres oluşturma" modunda çalışmalıdır; aksi takdirde düzenlenecek veri olmadığından form boş veya hatalı başlangıç değerleriyle render edilir.

**[Aksiyom 5]:** Eğer `handleSave` fonksiyonu `React.FormEvent` yerine farklı bir event tipi ile çağrılırsa, form gönderimi sırasında beklenmeyen davranışlar oluşur (preventDefault çağrılamayabilir).

**[Aksiyom 6]:** Eğer `handleSave` çağrıldığında form alanlarında zorunlu alanlar boş bırakılmışsa, kaydetme işlemi gerçekleşmemeli ve kullanıcıya hata bildirilmelidir; aksi takdirde eksik veri ile adres kaydı oluşur.

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

### [N1_NASIL] AST Pointer: src/views/checkout/AddressFormModal.tsx::AddressFormModal (Component Body)
- **params**: `address` — düzenlenecek mevcut adres nesnesi (UserAddress | undefined), `onClose` — modal kapatma callback fonksiyonu, `onSaved` — adres kaydedildikten sonra çağrılan callback fonksiyonu, `t` — i18n çeviri fonksiyonu
- **ic_degiskenler**:
  - `saving` — form kaydetme işleminin devam edip etmediğini tutan boolean state, true iken buton disabled olur ve "..." gösterir
  - `setSaving` — saving state'ini güncelleyen setter fonksiyonu
  - `form` — form alanlarının tüm değerlerini tutan state nesnesi (label, full_name, phone, address_line, city, district, postal_code, is_default_shipping, is_default_billing), address prop'u varsa mevcut değerlerle, yoksa boş/varsayılan değerlerle doldurulur
  - `setForm` — form state'ini güncelleyen setter fonksiyonu, her input change olayında spread ile güncellenir
  - `handleSave` — form submit handler'ı, nested async fonksiyon olarak tanımlanır (N2 olarak ayrıca incelenir)
- **Dönüş**: JSX — fixed overlay üzerinde modal form (adres oluşturma/düzenleme formu)

### [N2_NASIL] AST Pointer: src/views/checkout/AddressFormModal.tsx::handleSave (iç fonksiyon)
- **params**: `e` — React.FormEvent, form submit olay nesnesi
- **ic_degiskenler**:
  - `e` parametresi — `e.preventDefault()` ile varsayılan form submit davranışı engellenir
  - `address` — üst scope'tan gelen prop, varsa güncelleme (updateAddress), yoksa oluşturma (createAddress) yapılır
  - `form` — üst scope'tan gelen form state'i, tüm alanları (label, full_name, phone, address_line, city, district, postal_code, is_default_shipping, is_default_billing) API çağrılarına parametre olarak geçilir
  - `address.id` — address mevcutsa, updateAddress çağrısında adresin benzersiz tanımlayıcısı olarak kullanılır
  - `newAddressPayload: DbUserAddressInsert` — yeni adres oluşturma için API'ye gönderilecek veri nesnesi, user_id boş string olarak atanır (servis tarafında override edilir), address_type ise is_default_shipping'e göre 'shipping' veya 'billing' olarak belirlenir, form alanlarının tamamı bu nesneye kopyalanır
  - `t` — üst scope'tan gelen çeviri fonksiyonu, success ve error toast mesajları için kullanılır
  - `onSaved` — üst scope'tan gelen callback, başarılı kayıt sonrası çağrılır
  - `onClose` — üst scope'tan gelen callback, başarılı kayıt sonrası modal'ı kapatır
  - `setSaving` — üst scope'tan gelen state setter, try bloğunun başında true, finally bloğunda false olarak ayarlanır
- **Dönüş**: yok (void) — yan etkiler: updateAddress veya createAddress API çağrısı, toast.success/toast.error bildirim gösterimi, onSaved() ve onClose() callback çağrısı, setSaving ile loading durumu yönetimi

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