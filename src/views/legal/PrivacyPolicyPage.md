---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\PrivacyPolicyPage.tsx
skeleton_hash: 377e9cca9977bcde
entity_hashes:
  func:PrivacyPolicyPage: c82dbca369d2aee7
  func:t: 4b4dfa7ec1fe2176
  overview: 9b802c60549e6f19
  style_tokens: 06829f9d93bd4397
generated_at: 2026-06-19T20:51:01Z
---

## Genel Bakış
Bu modül, web uygulamasının yasal gereklilikler kapsamında yer alan gizlilik politikası sayfasını temsil eden bir React bileşenidir. Temel amacı, kullanıcıya gizlilik politikasına dair metinsel ve görsel içeriği sunmaktır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Bu grup, gizlilik politikası sayfasının tamamını oluşturan ve tarayıcıda render edilen ana React bileşenini ve ona destek olan bir yardımcı fonksiyonu içerir.
- PrivacyPolicyPage, t

---

## AXIOMS – Mimari Varsayımlar
Bu modül, gizlilik politikası sayfasının dil destekli içeriğini sunan bir React bileşenidir.

[Aksiyom 1]: Eğer `lang` parametresi sağlanmazsa, bileşen sayfayı doğru dilde gösteremez ve varsayılan veya eksik dil ile render edilerek hatalı içerik gösterebilir.

[Aksiyom 2]: Eğer `t` (çeviri) fonksiyonu调用edilmezse veya `t` fonksiyonu geçerli bir çeviri sağlayamazsa, bileşen metin içeriğini doğru şekilde gösteremez ve anahtarı (key) ham olarak ekrana basabilir.

---

## FONKSİYON DETAYLARI

### PrivacyPolicyPage
**Ne yapar**: Bu fonksiyon, bir React fonksiyonel bileşeni (React.FC) döndürür. Fonksiyonun spesifik işlevi ve içeriği kod içinde açıklanmadığı için yalnızca bir bileşen üretmekle sınırlı olduğu söylenebilir.  

**Nasıl yapar**: Fonksiyon, içinde tanımlı bir React bileşenini oluşturur ve bu bileşeni geri döndürür. İç mantığı ve render edilen JSX yapısı kodda belirtilmediği için detaylandırılamaz.  

**Parametreler**:
- (Parametre yok) — Fonksiyon hiçbir girdi almaz.

**Dönüş**: React.FC — Fonksiyon, bir React fonksiyonel bileşeni tipinde değer döndürür.

### t
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/PrivacyPolicyContent::PrivacyPolicyContentEn
- import: ./components/tr/PrivacyPolicyContent::PrivacyPolicyContentTr
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: views/legal/PrivacyPolicyPage.tsx::PrivacyPolicyPage
- **params**: `{ lang }` — sayfanın dilini belirleyen string parametresi ('en' veya 'tr')
- **ic_degiskenler**:
  - `dict` — `lang` değerine göre İngilizce (`en`) veya Türkçe (`tr`) sözlük nesnesini seçer;三元 оператор ile belirlenir
  - `t` — `getDictValue(dict, key)` çağrısını sarmalayan çeviri fonksiyonu; verilen anahtar ile sözlükten çeviriyi getirir
- **Dönüş**: JSX bileşeni — `max-w-4xl` genişliğinde merkezlenmiş, başlık (`legal.privacyTitle`), taslak uyarısı (`legal.draftWarning`), dil bazlı içerik (`PrivacyPolicyContentEn` veya `PrivacyPolicyContentTr`) ve feragatname (`legal.disclaimer`) içeren sayfa düzeni

---

### [N2_NASIL] AST Pointer: views/legal/PrivacyPolicyPage.tsx::t
- **params**: `(key: string)` — sözlükten çevrilecek anahtar kelime
- **ic_degiskenler**: yok
- **Dönüş**: `getDictValue(dict, key)` çağrısının dönüş değeri — sözlük nesnesindeki karşılık gelen çeviri stringi

---

## NODE ID STANDARD

  file: src\views\legal\PrivacyPolicyPage.tsx
  function: src\views\legal\PrivacyPolicyPage.tsx::PrivacyPolicyPage
  function: src\views\legal\PrivacyPolicyPage.tsx::t

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