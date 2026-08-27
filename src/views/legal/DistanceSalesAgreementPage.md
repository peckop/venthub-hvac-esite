---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\DistanceSalesAgreementPage.tsx
skeleton_hash: 7c698e88182f6399
entity_hashes:
  func:DistanceSalesAgreementPage: de11566081e661c0
  func:t: d9b8bfb5c1688ab1
  overview: 33b5ec86d4ecfb63
  style_tokens: 06829f9d93bd4397
generated_at: 2026-08-27T07:34:32Z
---

## Genel Bakış
Bu modül, VentHup platformunda "Uzaktan Satış Sözleşmesi" sayfasını render eden bir React bileşenidir. Bileşen, sözleşme metnini dil ayarlarına göre sunar ve satıcı bilgileri gibi dinamik verileri yasal konfigürasyon nesnesinden alarak kullanıcıya gösterir. Sayfa içeriğinin çoklu dil desteğiyle görüntülenmesini sağlayan bir çeviri fonksiyonu içerir.

## Fonksiyon Grupları
### UI Rendering
Sayfanın tüm düzenini ve içeriğini oluşturarak kullanıcıya Uzaktan Satış Sözleşmesi metnini ve ilgili hukuki bilgileri sunar.
- DistanceSalesAgreementPage

### Yardımcı Fonksiyonlar
Çeviri anahtarlarını mevcut dile göre doğru metin karşılıklarına dönüştürerek sayfa içeriğinin çoklu dil desteğiyle render edilmesini sağlar.
- t

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### DistanceSalesAgreementPage
**Ne yapar**: Mesafeli Satış Sözleşmesi sayfasını render eden ana React bileşenidir. Kullanıcının tercih ettiği dile göre (Türkçe veya İngilizce) uygun sözleşme içeriğini ve sayfa düzenini sunar.

**Nasıl yapar**: Fonksiyon, bir `lang` prop'u alır ve bu değere bağlı olarak bir sözlük (`dict`) seçer. Sayfa içinde `t` adında yerel bir çeviri fonksiyonu tanımlayarak statik metinleri (başlık, uyarı notu, feragatname) ilgili dilden çeker. Sayfanın ana yapısını JSX ile oluşturur, ardından `lang` değişkeninin `'en'` olup olmadığına koşul olarak bakarak, İngilizce veya Türkçe sözleşme bileşenini (`DistanceSalesAgreementContentEn` veya `DistanceSalesAgreementContentTr`) render eder.

**Parametreler**:
- `lang`: `string` — Sayfanın görüntüleneceği dil kodunu belirtir. Beklenen değerler `'tr'` (Türkçe) veya `'en'` (İngilizce)'dir.

**Dönüş**: `React.FC<{ lang: string }>` — Belirtilen dile uygun HTML yapısını içeren bir React Functional Component.

### t

**Ne yapar**: Verilen bir `key` parametresi aracılığıyla, aktif dile ait sözlükten karşılık gelen çeviri değerini getirir. Bileşenin içinde tanımlanmış bir yardımcı çeviri fonksiyonudur.

**Nasıl yapar**: Fonksiyon, dış bileşenin `lang` parametresine göre seçilmiş olan `dict` sözlük nesnesini kullanır. `getDictValue` fonksiyonuna bu sözlüğü ve aranacak `key` değerini ileterek sonucu döndürür. Dil seçimi bileşen seviyesinde yapılır: `lang === 'en'` ise İngilizce (`en`) sözlüğü, aksi halde Türkçe (`tr`) sözlüğü atanır.

**Parametreler**:
- key: string — Sözlükten getirilecek değerin nokta notasyonuyla belirtilen anahtar yolu (örneğin `'legal.distanceSalesTitle'`, `'legal.draftWarning'`, `'legal.disclaimer'`)

**Dönüş**: `getDictValue` fonksiyonunun dönüş tipine bağlıdır; kaynakta açıkça belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/DistanceSalesAgreementContent::DistanceSalesAgreementContentEn
- import: ./components/tr/DistanceSalesAgreementContent::DistanceSalesAgreementContentTr
- import: @/config/legal::isLegalContentReady
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/DistanceSalesAgreementPage.tsx::DistanceSalesAgreementPage
- **params**: `{ lang }` — bileşen prop'u; sayfa dilini belirtir (`'en'` veya `'tr'`)
- **ic_degiskenler**:
  - `dict` — `lang === 'en'` koşulu sağlanırsa `en` sözlüğü, sağlanmazsa `tr` sözlüğü atanır; çeviri anahtarlarının çözümlenmesinde kullanılır
  - `t` — `(key: string) => getDictValue(dict, key)` şeklinde tanımlanan arrow function; `dict` sözlüğünde `key` ile eşleşen değeri döndürür
- **Dönüş**: JSX element — `div` kök elemanı içinde şu alt yapıyı içerir:
  - `h1` başlığı: `t('legal.distanceSalesTitle')` çağrısıyla metin
  - Koşullu uyarı bloğu: `!isLegalContentReady()` true ise sarı arka planlı `div` içinde `t('legal.draftWarning')` metni
  - İçerik alanı: `lang === 'en'` ise `<DistanceSalesAgreementContentEn lang={lang} />`, değilse `<DistanceSalesAgreementContentTr lang={lang} />` bileşeni render edilir
  - `p` paragrafı: `t('legal.disclaimer')` çağrısıyla metin

### [N2_NASIL] AST Pointer: src/views/legal/DistanceSalesAgreementPage.tsx::t
- **params**: `key: string` — sözlükte aranacak çeviri anahtarı
- **ic_degiskenler**: yok
- **Dönüş**: `getDictValue(dict, key)` fonksiyonunun dönüş değeri — `dict` kapsam dışındaki değişkenden gelir, `key` parametresiyle birlikte `getDictValue`'ya aktarılır

---

## NODE ID STANDARD

  file: src\views\legal\DistanceSalesAgreementPage.tsx
  function: src\views\legal\DistanceSalesAgreementPage.tsx::DistanceSalesAgreementPage
  function: src\views\legal\DistanceSalesAgreementPage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: DistanceSalesAgreementPage

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