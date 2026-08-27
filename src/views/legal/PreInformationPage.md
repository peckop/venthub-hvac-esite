---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\PreInformationPage.tsx
skeleton_hash: d16b7efe3e99f5d5
entity_hashes:
  func:PreInformationPage: 6c512329d936b02b
  func:t: 2bb1be01cf9cad91
  overview: 69f1477845d0e283
  style_tokens: 06829f9d93bd4397
generated_at: 2026-08-27T07:35:37Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının yasal ön bilgilendirme sayfasını sunan tek sayfalık bir React bileşeni tanımlar. Çok dilli destek sağlayarak `lang` prop'una bağlı olarak uygun sözlük nesnesini seçer ve dil bazlı çeviri fonksiyonu aracılığıyla metinlerin gösterilmesini yönetir. Sayfa başlığı, sarı uyarı kutusu ve dile göre içerik bileşeni (`PreInformationContentEn` veya `PreInformationContentTr`) gibi alt bileşenleri render eder.

## Fonksiyon Grupları
### Sayfa Bileşeni
Ana React bileşenini oluşturarak sayfanın tamamını render eder. `lang` prop'unu alır, sözlük nesnesini seçer ve çeviri fonksiyonunu tanımlar.
- PreInformationPage

### Yardımcı Fonksiyonlar
Çeviri anahtarlarını kullanarak dile uygun metin erişimi sağlayan yardımcı fonksiyonu barındırır. `PreInformationPage` bileşeni içinde tanımlanır ve kullanılır.
- t

## Bağımlılıklar ve Mimari Notlar
- **İç bağımlılık**: `t` fonksiyonu, `PreInformationPage` bileşeni içinde tanımlanır ve bileşenin render sürecinde kullanılır.
- **Dış bağımlılık**: Dil bazlı içerik bileşenleri (`PreInformationContentEn`, `PreInformationContentTr`) harici modüllerden içe aktarılır.
- **Dinamik/lazy yükleme**: Kaynakta bu yönde bir bilgi bulunmamaktadır.
- **Mimari önem**: Bu modül, yasal uyumluluk gereği ön bilgilendirme içeriğini sunan statik bir sayfa bileşenidir; uygulamanın yasal sayfaları arasında yer alır.

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `lang` prop'u sağlanmazsa, bileşen hangi dile ait metinleri göstereceğini bilemez ve dil bazlı içerik gösterimi gerçekleşmez.

[Aksiyom 2]: Eğer `t` fonksiyonuna geçerli bir `key` değeri sağlanmazsa, ilgili çeviri metnine erişilemez.

[Aksiyom 3]: Eğer `lang` prop'u ile uyumlu çeviri verileri mevcut değilse, `t` fonksiyonu istenen metni döndüremez.

---

## FONKSİYON DETAYLARI

### PreInformationPage
**Ne yapar**: VentHub HVAC uygulamasının yasal bilgilendirme sayfasını render eden React bileşenidir. Kullanıcıya dil seçimine göre (Türkçe/İngilizce) ön bilgi içeriğini sunar.

**Nasıl yapar**: Fonksiyon, bir React functional component olarak tanımlanmıştır ve `lang` prop'unu alır. Önce `lang` değerine bağlı olarak sözlük nesnesini (`dict`) seçer. Ardından bu sözlük üzerinden `t` adlı bir çeviri fonksiyonu oluşturur. JSX içinde; sayfa başlığı, sarı uyarı kutusu, dil bazlı içerik bileşeni (`PreInformationContentEn` veya `PreInformationContentTr`) ve sorumluluk reddi metnini render eder. Tüm metinler `t()` fonksiyonu ile sözlükten dinamik olarak çekilir.

**Parametreler**:
- lang: string — Sayfanın görüntüleneceği dil kodu. 'en' ise İngilizce içeriği, başka bir değer (örn: 'tr') ise Türkçe içeriği gösterir.

**Dönüş**: React.FC<{ lang: string }> tipinde, lang prop'unu alan bir React functional component döndürür.

### t
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/PreInformationContent::PreInformationContentEn
- import: ./components/tr/PreInformationContent::PreInformationContentTr
- import: @/config/legal::isLegalContentReady
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/PreInformationPage.tsx::PreInformationPage
- **params**: `lang` (string)
- **ic_degiskenler**:
  - `dict` — `lang` parametresinin değerine göre (`'en'` ise `en`, değilse `tr`) seçilen dil sözlüğü nesnesi.
  - `t` — `key` parametresi alarak `getDictValue(dict, key)` çağrısı yapan ve sözlükten değer döndüren fonksiyon.
- **Dönüş**: `React.FC<{ lang: string }>` (bir React bileşeni döndürür)

### [N2_NASIL] AST Pointer: src/views/legal/PreInformationPage.tsx::t
- **params**: `key` (string)
- **ic_degiskenler**: yok
- **Dönüş**: `getDictValue(dict, key)` fonksiyonunun dönüş değeri (sözlükten alınan değer)

---

## NODE ID STANDARD

  file: src\views\legal\PreInformationPage.tsx
  function: src\views\legal\PreInformationPage.tsx::PreInformationPage
  function: src\views\legal\PreInformationPage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: PreInformationPage

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