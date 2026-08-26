---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\legal\PrivacyPolicyPage.tsx
skeleton_hash: fd756394efd70a1a
entity_hashes:
  func:PrivacyPolicyPage: c82dbca369d2aee7
  func:t: f826c9f8cb44ae84
  overview: 280fbf878bf55295
  style_tokens: 06829f9d93bd4397
generated_at: 2026-08-25T07:47:51Z
---

## Genel Bakış
Bu modül, bir gizlilik politikası sayfasını görüntülemek için kullanılan bir React bileşeni içerir. Bileşen, dil parametresi alarak sayfayı o dilde render eder. Ayrıca, metinleri çevirmek için bir yardımcı fonksiyon sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Gizlilik politikası sayfasının ana yapısını ve içeriğini oluşturur. Dil parametresine göre sayfayı render eder.
- PrivacyPolicyPage

### Çeviri Yardımcısı
Verilen anahtar kelimeye göre çevrilmiş metni döndürerek dil desteğini sağlar.
- t

---

## AXIOMS – Mimari Varsayımlar

Bu modül, gizlilik politikası sayfasını belirli bir dilde sunmak için `lang` parametresine ve çeviri fonksiyonuna bağımlıdır.

[Aksiyom 1]: Eğer `lang` parametresi sağlanmazsa, bileşen hangi dili kullanacağını bilemez ve sayfa içeriği gösterilemez.

[Aksiyom 2]: Eğer `t` fonksiyonu tanımlı değilse, çeviri anahtarları çözümlenemez ve sayfada metin içerik görüntülenemez.

---

## FONKSİYON DETAYLARI

### PrivacyPolicyPage
**Ne yapar**: Kullanıcının seçtiği dile göre gizlilik politikası sayfasını render eden bir React fonksiyonel bileşenidir. Sayfa başlığı, yasal içerik ve sorumluluk reddi beyanını görüntüler; ayrıca yasal içerik henüz hazır değilse kullanıcıyı bilgilendiren bir uyarı mesajı gösterir.

**Nasıl yapar**: Bileşen, `lang` parametresine bağlı olarak bir sözlük nesnesi (`en` veya `tr`) seçer ve bu sözlükten çeviri değerlerini almak için içinde `t` adında bir fonksiyon tanımlar. Sayfa yapısı olarak bir kapsayıcı `div` içinde başlık, koşullu uyarı alanı, dil bazlı içerik bileşeni ve sorumluluk reddi paragrafı yer alır. `isLegalContentReady()` fonksiyonu false döndürüğünde sarı renkli bir uyarı kutusu gösterilir. Ana içerik alanı, `lang` değeri `'en'` ise `PrivacyPolicyContentEn` bileşenini, aksi halde `PrivacyPolicyContentTr` bileşenini render eder.

**Parametreler**:
- lang: string — Sayfanın görüntüleneceği dili belirten parametre. `'en'` veya `'tr'` değerlerinden birini alır ve hangi sözlüğün kullanılacağını belirler.

**Dönüş**: JSX elementi döndüren bir React fonksiyonel bileşeni. Dönen yapı, gizlilik politikası sayfasının tam HTML/JSX yapısını içerir.

### t
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/PrivacyPolicyContent::PrivacyPolicyContentEn
- import: ./components/tr/PrivacyPolicyContent::PrivacyPolicyContentTr
- import: @/config/legal::isLegalContentReady
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/PrivacyPolicyPage.tsx::PrivacyPolicyPage
- **params**: `{lang}` — bileşen prop'u; sayfa dilini belirler
- **ic_degiskenler**:
  - `dict` — `lang === 'en'` koşulu sağlanırsa `en` sözlüğü, sağlanmazsa `tr` sözlüğü atanır; çeviri anahtarlarının çözümlemesinde kullanılır
  - `t` — `key` parametresi alan arrow function; `getDictValue(dict, key)` çağrısı yaparak sözlükten değer döndürür; JSX içinde `t('legal.privacyTitle')`, `t('legal.draftWarning')`, `t('legal.disclaimer')` çağrılarıyla kullanılır
- **Dönüş**: JSX elementi — `div` kök elemanı; içinde `h1` başlık, `isLegalContentReady()` false ise uyarı `div`'i, `lang` değerine göre `PrivacyPolicyContentEn` veya `PrivacyPolicyContentTr` bileşeni ve `p` sorumluluk reddi içerir

### [N2_NASIL] AST Pointer: src/views/legal/PrivacyPolicyPage.tsx::t
- **params**: `key: string` — sözlükte aranacak çeviri anahtarı
- **ic_degiskenler**: yok
- **Dönüş**: `getDictValue(dict, key)` fonksiyonunun dönüş değeri; `dict` kapsam dışındaki `PrivacyPolicyPage` fonksiyonu içinde tanımlanan sözlük değişkenidir

---

## NODE ID STANDARD

  file: PrivacyPolicyPage.tsx
  function: PrivacyPolicyPage.tsx::PrivacyPolicyPage
  function: PrivacyPolicyPage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: PrivacyPolicyPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `bg-yellow-50`, `border-light-gray`, `border-yellow-200`, `text-3xl`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-xs`, `text-yellow-800`
- **Layout:** `bg-yellow-50`, `border-yellow-200`, `max-w-4xl`, `max-w-prose`, `p-4`, `p-6`, `shadow-sm`, `text-yellow-800`
- **Varyant/Responsive:** `dark:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `dark:prose-invert`, `font-bold`, `lg:px-8`, `mb-6`, `mt-4`, `mx-auto`, `prose`, `px-4`, `py-10`, `rounded-lg`, `rounded-xl`, `sm:px-6`, `space-y-6`