---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\TermsOfUsePage.tsx
skeleton_hash: 557194aebc9e8cb9
entity_hashes:
  func:TermsOfUsePage: c46efeb3b2b3ab6b
  func:t: 4865c1bb87148feb
  overview: 1eca5015b00de8ab
  style_tokens: 06829f9d93bd4397
generated_at: 2026-08-27T07:36:08Z
---

## Genel Bakış

Bu modül, VentHub HVAC platformunun Kullanım Şartları sayfasını oluşturan bir React bileşenidir. Sayfa, ziyaretçilere platformun kullanım kurallarını ve yasal şartlarını sunar. Dil desteği sağlanarak farklı dillerde içerik gösterimi amaçlanır; bu amaçla `lang` prop'u üzerinden bir çeviri yardımcısı kullanılır.

## Fonksiyon Grupları

### Sayfa Bileşeni
Modülün ana gövdesini oluşturur; Kullanım Şartları sayfasının yapısını ve yasal metinleri render eder. `lang` prop'unu alarak dil bağlamını belirler ve çeviri fonksiyonunu çalıştırır.
- TermsOfUsePage

### Çeviri Yardımcısı
Sayfa içindeki metinlerin ilgili dile göre çevrilmesini sağlar. Verilen bir anahtar karşılığında uygun dildeki içeriği döndürür.
- t

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri verilmediğinden, davranışsal aksiyom üretilememektedir.

[Aksiyom 1]: Eğer `lang` prop'u sağlanmazsa, sonucun ne olacağı bilinmiyor; fonksiyon gövdesinde default değer tanımı görünmemektedir.

[Aksiyom 2]: Eğer `t` fonksiyonuna geçersiz bir `key` verilirse, sonucun ne olacağı bilinmiyor; fonksiyon gövdesi verilmemiştir.

[Aksiyom 3]: Eğer dil desteği mekanizması çalışmazsa, sayfanın nasıl davranacağı bilinmiyor; `t` fonksiyonunun fallback davranışı fonksiyon gövdesinden çıkarılamamaktadır.

---

## FONKSİYON DETAYLARI

### TermsOfUsePage

**Ne yapar**: Kullanım koşulları sayfasını render eden React fonksiyonel bileşenidir. Dil parametresine göre İngilizce veya Türkçe içerik gösterir, uyarı kutusu ve yasal metinleri sayfada düzenli şekilde sunar.

**Nasıl yapar**: Fonksiyon, gelen `lang` prop'una göre sözlük nesnesini (tr veya en) seçer ve içinde tanımlı `t` yardımcı fonksiyonu ile çeviri anahtarlarını yerel metinlere dönüştürür. `lang === 'en'` koşuluna bağlı olarak `TermsOfUseContentEn` veya `TermsOfUseContentTr` bileşenini koşullu olarak render eder. Sayfa yapısı Tailwind CSS sınıfları ile stilize edilmiş bir container, başlık, sarı uyarı kutusu, beyaz kart içindeki içerik ve dipnot açıklamasından oluşur.

**Parametreler**:
- `lang: string` — Sayfanın hangi dilde gösterileceğini belirten dil kodu. `'en'` ise İngilizce, aksi halde Türkçe içerik yüklenir.

**Dönüş**: `React.FC<{ lang: string }>` — Lang prop'u alan bir React fonksiyonel bileşeni döndürür.

### t

**Ne yapar**: Verilen bir anahtar (key) değeri kullanarak, önceden belirlenmiş bir sözlük (dictionary) yapısı içerisinden karşılık gelen çeviri metnini getiren bir çeviri yardımcısı fonksiyonudur. Bileşen içinde yerel olarak tanımlanmış olup, sayfa genelinde metinlerin dile göre dinamik olarak yüklenmesini sağlar.

**Nasıl yapar**: Fonksiyon, kapsayan bileşenin kapsamındaki `dict` değişkenine erişir. Bu `dict` değişkeni, bileşenin aldığı `lang` prop'una bağlı olarak ya `en` ya da `tr` sözlük nesnesine atanmış durumdadır. `t` fonksiyonu çağrıldığında, aldığı `key` parametresini ve mevcut `dict` nesnesini `getDictValue` fonksiyonuna aktararak, ilgili anahtarın sözlükteki karşılığını döndürür. Bu mekanizma sayesinde `lang` prop'u `'en'` olduğunda İngilizce, `'tr'` olduğunda Türkçe metinler elde edilir.

**Parametreler**:
- `key`: `string` — Sözlükten getirilecek çeviri değerinin anahtarı. Nokta notasyonuyla hiyerarşik erişim sağlayan bir yapıda olabilir (örneğin `'legal.termsTitle'`, `'legal.draftWarning'`, `'legal.disclaimer'` gibi).

**Dönüş**: `getDictValue` fonksiyonunun dönüş tipi kaynak kodda belirtilmemiştir; bu nedenle kesin dönüş tipi bilinmiyor. Kullanım bağlamından, verilen anahtara karşılık gelen çeviri metnini (muhtemelen `string` türünde) döndürdüğü anlaşılmaktadır, ancak bu bir çıkarımdır ve kesin değildir.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/TermsOfUseContent::TermsOfUseContentEn
- import: ./components/tr/TermsOfUseContent::TermsOfUseContentTr
- import: @/config/legal::isLegalContentReady
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/TermsOfUsePage.tsx::TermsOfUsePage
- **params**: `lang` — sayfanın dilini belirten string parametre
- **ic_degiskenler**:
  - `dict` — `lang` parametresinin değerine göre `en` veya `tr` sözlük nesnesini seçen değişken
  - `t` — `key` parametresiyle sözlükten değer almak için kullanılan fonksiyon; gövdesi `getDictValue(dict, key)` çağrısını yapar
- **Dönüş**: JSX elementi — `div` kök elemanı içeren bir React bileşeni

### [N2_NASIL] AST Pointer: src/views/legal/TermsOfUsePage.tsx::t
- **params**: `key` — sözlükte aranacak anahtar string
- **ic_degiskenler**: yok
- **Dönüş**: `getDictValue(dict, key)` fonksiyonunun dönüş değeri (bilinmiyor)

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