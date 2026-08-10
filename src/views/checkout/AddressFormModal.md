---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\AddressFormModal.tsx
skeleton_hash: 3cfbdf84abb3aa03
entity_hashes:
  func:AddressFormModal: 22dcfc4163aec036
  func:handleSave: 51987ec8847e1d2c
  overview: d6c90c44e9a5f962
  style_tokens: 4fa16246087d5121
generated_at: 2026-06-19T20:50:27Z
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

## AXIOMS – Mimari Varsayımlar

Bu modül, ödeme sürecindeki adres formu modalıdır ve aşağıdaki mimari varsayımlara dayanır:

[Aksiyom 1]: Eğer `onClose` callback'i sağlanmamışsa, modal'ın kullanıcı tarafından kapanması mümkün olmaz.

[Aksiyom 2]: Eğer `onSaved` callback'i sağlanmamışsa, form kaydedildikten sonra üst bileşene bilgi iletilemez ve güncelleme akışı bozulur.

[Aksiyom 3]: Eğer `address` prop'u `undefined` veya `null` ise, modal "yeni adres oluşturma" modunda; aksi halde "mevcut adresi düzenleme" modunda çalışır.

[Aksiyom 4]: Eğer `handleSave` fonksiyonu form doğrulamasını geçemezse, form verileri üst bileşene iletilmez ve modal açık kalır.

[Aksiyom 5]: Eğer `t` (çeviri fonksiyonu) sağlanmamışsa, form alanlarının etiketleri ve hata mesajları gösterilemez.

[Aksiyom 6]: Eğer modal başarıyla kaydedildikten sonra `onSaved` çağrılırsa, sağlanan adres verisi üst bileşen tarafından işlenebilir olmalıdır.

[Aksiyom 7]: Eğer form alanları zorunlu alanları içermiyorsa (örn: sokak, şehir, posta kodu), `handleSave` geçerli bir submit gerçekleştiremez.

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

## İTHALATLAR (IMPORTS)
- import: ../../lib/services/address.service::createAddress
- import: ../../lib/services/address.service::updateAddress
- import: ../../lib/supabase/client::supabaseBrowserClient
- import: ../../types/db-rows::type { DbUserAddressInsert }
- import: @/types/ui-models::type { UserAddress }
- import: react::React
- import: react::useState
- import: sonner::toast

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
- **params**:
  - `address` — Mevcut adres bilgisi (UserAddress tipinde, undefined ise yeni adres oluşturulacak)
  - `onClose` — Modal'ı kapatma callback fonksiyonu
  - `onSaved` — Adres başarıyla kaydedildikten sonra çağrılacak callback fonksiyonu
  - `t` —Uluslararasılaştırma (i18n) çeviri fonksiyonu
- **ic_degiskenler**:
  - `saving` — useState boolean; kaydetme işleminin devam edip etmediğini tutar, true iken buton devre dışıdır
  - `setSaving` — saving state setter'ı; handleSave içinde true/false olarak ayarlanır
  - `form` — useState objesi; tüm form alanlarının başlangıç değerlerini address prop'undan veya boş değerlerden oluşturur
    - `form.label` — Adres etiketi (Ev, İş vb.), address?.label'den veya boş stringden başlatılır
    - `form.full_name` — Adres sahibinin tam adı, address?.full_name'den veya boş stringden başlatılır
    - `form.phone` — Telefon numarası, address?.phone'dan veya boş stringden başlatılır
    - `form.address_line` — Açık adres metni (sokak, bina, daire), address?.address_line'dan veya boş stringden başlatılır
    - `form.city` — Şehir adı, address?.city'den veya boş stringden başlatılır
    - `form.district` — İlçe adı, address?.district'ten veya boş stringden başlatılır
    - `form.postal_code` — Posta kodu, address?.postal_code'dan veya boş stringden başlatılır
    - `form.is_default_shipping` — Varsayılan gönderim adresi olup olmadığını belirtir boolean, address?.is_default_shipping'den veya false'dan başlatılır
    - `form.is_default_billing` — Varsayılan fatura adresi olup olmadığını belirtir boolean, address?.is_default_billing'den veya false'dan başlatılır
  - `setForm` — form state setter'ı; her input change handler'da spread ile güncellenir
  - `handleSave` — Form gönderim handler'ı; async fonksiyon, addrée göre create veya update yapar
  - `newAddressPayload` — DbUserAddressInsert tipinde obje; address yoksa oluşturulan yeni adres verisi, user_id boş stringdir (servis tarafından override edilir), address_type form.is_default_shipping'a göre 'shipping' veya 'billing' olarak belirlenir, diğer alanlar form state'inden kopyalanır
- **Dönüş**: JSX — Sabit pozisyonlu modal overlay, içinde adres formu barındıran beyaz kart. Form alanları: label input, address_line textarea, city/district grid, postal_code input, is_default_shipping/is_default_billing checkbox'ları, submit butonu. saving true iken buton disabled ve '...' gösterir.

### [N2_NASIL] AST Pointer: src/views/checkout/AddressFormModal.tsx::handleSave
- **params**:
  - `e` — React.FormEvent; form submit event'i, preventDefault ile varsayılan davranış engellenir
- **ic_degiskenler**:
  - `newAddressPayload` — DbUserAddressInsert tipinde obje; sadece address prop'u falsy (undefined) olduğunda oluşturulur. Alanları:
    - `newAddressPayload.user_id` — Boş string (''); servis katmanında gerçek kullanıcı ID'si ile override edilir
    - `newAddressPayload.address_type` — form.is_default_shipping true ise 'shipping', aksi halde 'billing' olarak ternary ile belirlenir
    - `newAddressPayload.label` — form.label değerinden kopyalanır
    - `newAddressPayload.full_name` — form.full_name değerinden kopyalanır
    - `newAddressPayload.phone` — form.phone değerinden kopyalanır
    - `newAddressPayload.address_line` — form.address_line değerinden kopyalanır
    - `newAddressPayload.city` — form.city değerinden kopyalanır
    - `newAddressPayload.district` — form.district değerinden kopyalanır
    - `newAddressPayload.postal_code` — form.postal_code değerinden kopyalanır
    - `newAddressPayload.is_default_shipping` — form.is_default_shipping değerinden kopyalanır
    - `newAddressPayload.is_default_billing` — form.is_default_billing değerinden kopyalanır
- **Yan Etkileri / Çağrılar**:
  - `setSaving(true)` — Kaydetme başladı, buton devre dışı bırakılır
  - `updateAddress(supabaseBrowserClient, address.id, {...})` — address prop'u mevcutsa çağrılır, form alanlarını payload olarak gönderir
  - `toast.success(t('checkout.saved.updated'))` — Güncelleme başarılı bildirimi
  - `createAddress(supabaseBrowserClient, newAddressPayload)` — address prop'u yoksa çağrılır, yeni adres oluşturur
  - `toast.success(t('account.addresses.toasts.created') || 'Address created')` — Oluşturma başarılı bildirimi
  - `onSaved()` — Başarılı kayıt sonrası üst bileşeni bilgilendirir
  - `onClose()` — Modal'ı kapatır
  - `console.error(e)` — Catch bloğunda hatayı konsola yazar
  - `toast.error(...)` — Hata durumunda kullanıcıya hata bildirimi gösterir; message, address varsa 'checkout.saved.updateError', yoksa 'account.addresses.toasts.saveError' veya fallback 'Error while saving'
  - `setSaving(false)` — Finally bloğunda kaydetme durumu sıfırlanır
- **Dönüş**: yok (void)

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