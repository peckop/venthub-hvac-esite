---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\AddressFormModal.tsx
skeleton_hash: 68b343d716579a22
entity_hashes:
  func:AddressFormModal: 22dcfc4163aec036
  func:handleSave: 51987ec8847e1d2c
  overview: 6dca8320898d8077
  style_tokens: 4fa16246087d5121
generated_at: 2026-06-06T08:46:37Z
---

## Genel Bakış
Bu modül, sipariş tamamlama sürecinde kullanıcıların adres bilgilerini girmesini veya düzenlemesini sağlayan bir React modal bileşenidir. Kullanıcıdan alınan form verilerini işleyerek üst katmana iletir ve modal penceresinin kapatılmasını yönetir.

## Fonksiyon Grupları
### Ana Bileşen Yapısı
Modal penceresinin dış arayüzünü ve temel iskeletini oluşturur. Adres düzenleme veya yeni adres oluşturma durumuna göre form alanlarını render eder.
- AddressFormModal

### Form Gönderim Yönetimi
Formun gönderilmesi sırasında tetiklenir, kullanıcı girişlerini doğrular ve gerekli geri çağırma fonksiyonları aracılığıyla verileri üst bileşene aktarır.
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

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\checkout\AddressFormModal.tsx::AddressFormModal
- **params**: `(address, onClose, onSaved, t)` — Bileşenin props'ları. `address` mevcut adres nesnesi (yeni ise null), `onClose` modal kapatma fonksiyonu, `onSaved` kayıt sonrası tetiklenecek fonksiyon, `t` çeviri fonksiyonu.
- **ic_degiskenler**:
  - `saving` — `useState<boolean>`: Formun kaydetme işlemi yapıldığını belirten yükleme durumu (loading) flag'i. Başlangıç değeri `false`.
  - `form` — `useState<DbUserAddressInsert>`: Form alanlarının tüm değerlerini tutan state nesnesi. Alanlar: `label`, `full_name`, `phone`, `address_line`, `city`, `district`, `postal_code`, `is_default_shipping`, `is_default_billing`. Başlangıç değerleri `address` prop'undan gelir, yoksa boş string/false.
- **Dönüş**: `JSX.Element` — Adres formu içeren modal JSX'ini döndürür.

### [N2_NASIL] AST Pointer: src\views\checkout\AddressFormModal.tsx::handleSave
- **params**: `(e: React.FormEvent)` — Formun submit olayı.
- **ic_degiskenler**:
  - `setSaving` — `saving` state'ini güncelleyen fonksiyon. Kaydetme işlemi başlarken `true`, bittiğinde (`finally`) `false` yapılır.
  - `form` — Üst kapsamda tanımlı form state nesnesi, tüm adres alanlarını içerir.
  - `address` — Üst kapsamdan gelen mevcut adres prop'u, varsa `true` (güncelleme), yoksa `false` (oluşturma) dalı çalışır.
  - `newAddressPayload` — `DbUserAddressInsert` tipinde nesne: Yeni adres oluşturulurken `createAddress` servisine gönderilen veri paketi. `user_id` boş string olarak atanır (servis tarafından üzerine yazılır), `address_type` `is_default_shipping` değerine göre `'shipping'` veya `'billing'` olur, diğer alanlar `form` state'inden kopyalanır.
  - `updateAddress` — `../../lib/services/address.service` modülünden import edilen asenkron fonksiyon. `address.id` ve güncellenen alanları alır, adresi veritabanında günceller.
  - `createAddress` — `../../lib/services/address.service` modülünden import edilen asenkron fonksiyon. `newAddressPayload` nesnesini alır, yeni adres oluşturur.
  - `toast` — `sonner` kütüphanesinden import edilen bildirim fonksiyonu. Başarı/hata durumlarında kullanıcıya bildirim gösterir.
  - `e.preventDefault()` — Formun varsayılan submit (sayfa yenileme) davranışını engeller.
- **Dönüş**: `Promise<void>` — Asenkron bir form gönderimi; belirgin dönüş değeri yoktur. Yan etkileri: `updateAddress`/`createAddress` servis çağrıları, `toast` bildirimleri, `onSaved()` ve `onClose()` fonksiyon çağrısı.

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