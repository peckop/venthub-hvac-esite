---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\TermsOfUsePage.tsx
skeleton_hash: 030d91eb108c27ac
entity_hashes:
  func:TermsOfUsePage: c46efeb3b2b3ab6b
  func:t: 429ceff97c59b722
  overview: 83f5e8529a5aed52
  style_tokens: 06829f9d93bd4397
generated_at: 2026-06-19T20:51:45Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun Kullanım Şartları sayfasını oluşturan temel React bileşenini barındırır. Ziyaretçilerin platformun kullanım kurallarını ve yasal şartlarını okuyabileceği resmi bir sayfa sunar ve dil desteği sağlayarak farklı kullanıcılar için içerik gösterir.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün ana gövdesini oluşturur, Kullanım Şartları sayfasının tüm yapısını ve yasal metinleri render eder.
- TermsOfUsePage

### Çeviri Yardımcısı
Sayfa içindeki metinlerin farklı dillere göre çevrilmesini yönetir ve dil yapılandırmasına bağlı olarak uygun içeriği sağlar.
- t

---

## AXIOMS – Mimari Varsayımlar

Bu modül için tanımlanan mimari varsayımlar aşağıdadır:

**[Aksiyom 1]**: Eğer `lang` prop'u çağrılmazsa (yani `undefined` veya verilmezse), `t()` çeviri fonksiyonu geçerli bir dil bağlamı bulamaz ve sayfa içerikleri doğru dille render edilmez.

**[Aksiyom 2]**: Eğer `t()` çeviri fonksiyonu modül kapsaminda erişilebilir değilse (örn. imports/excope alınamamışsa), Kullanım Şartları sayfasındaki hiçbir metin anahtarı çözülemez ve sayfa boş veya hata içerikli render edilir.

**[Aksiyom 3]**: Eğer `lang` geçerli bir dil kodu değilse (örn. `"tr"`, `"en"` gibi tanımlı bir değer değilse), `t()` fonksiyonu eşleşen çeviri kümesini bulamaz ve varsayılan/fallback dil içeriği gösterilir veya `undefined` döner.

**[Aksiyom 4]**: Eğer bileşen yasal sayfa rotası altında (örn. `/legal/terms-of-use`) çağrılmazsa, kullanıcının beklediği yasal içerik sayfası sunulmaz ve platformun yasal sorumluluk bildirimleri görüntülenemez.

---

## FONKSİYON DETAYLARI

### TermsOfUsePage

**Ne yapar**: Kullanım koşulları sayfasını render eden React fonksiyonel bileşenidir. Dil parametresine göre İngilizce veya Türkçe içerik gösterir, uyarı kutusu ve yasal metinleri sayfada düzenli şekilde sunar.

**Nasıl yapar**: Fonksiyon, gelen `lang` prop'una göre sözlük nesnesini (tr veya en) seçer ve içinde tanımlı `t` yardımcı fonksiyonu ile çeviri anahtarlarını yerel metinlere dönüştürür. `lang === 'en'` koşuluna bağlı olarak `TermsOfUseContentEn` veya `TermsOfUseContentTr` bileşenini koşullu olarak render eder. Sayfa yapısı Tailwind CSS sınıfları ile stilize edilmiş bir container, başlık, sarı uyarı kutusu, beyaz kart içindeki içerik ve dipnot açıklamasından oluşur.

**Parametreler**:
- `lang: string` — Sayfanın hangi dilde gösterileceğini belirten dil kodu. `'en'` ise İngilizce, aksi halde Türkçe içerik yüklenir.

**Dönüş**: `React.FC<{ lang: string }>` — Lang prop'u alan bir React fonksiyonel bileşeni döndürür.

### t
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/TermsOfUseContent::TermsOfUseContentEn
- import: ./components/tr/TermsOfUseContent::TermsOfUseContentTr
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/TermsOfUsePage.tsx::TermsOfUsePage
- **params**: ({ lang })
- **ic_degiskenler**:
  - `dict` — Dil seçimine göre İngilizce veya Türkçe sözlük nesnesini depolar (lang === 'en' ? en : tr)
  - `t` — Sözlükten değer almak için kullanılan fonksiyon (getDictValue(dict, key) çağrısı yapar)
- **Dönüş**: JSX elementi (React bileşeni, div, h1 ve conditionally rendered TermsOfUseContentEn/Tr bileşenlerini içerir)

### [N2_NASIL] AST Pointer: src/views/legal/TermsOfUsePage.tsx::t
- **params**: (key: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: `getDictValue(dict, key)` çağrısının dönüş değeri (sözlükten alınan string değer)

---

## NODE ID STANDARD

  file: src\views\legal\TermsOfUsePage.tsx
  function: src\views\legal\TermsOfUsePage.tsx::TermsOfUsePage
  function: src\views\legal\TermsOfUsePage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: TermsOfUsePage

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