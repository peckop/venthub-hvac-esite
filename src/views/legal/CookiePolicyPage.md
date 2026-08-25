---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\legal\CookiePolicyPage.tsx
skeleton_hash: d81d7d3340723c36
entity_hashes:
  func:CookiePolicyPage: 39fe3c926a47f80a
  func:t: 3df1611ede2c4a10
  overview: 090c864bfdb77cc7
  style_tokens: 06829f9d93bd4397
generated_at: 2026-08-25T07:47:15Z
---

## Genel Bakış
Bu modül, çerez politikası sayfasını görüntüleyen bir React bileşenidir. Kullanıcının seçtiği dile göre sayfa içeriğini çevirmek için bir çeviri yardımcısı içerir. Modül, yasal/zorunlu bilgilendirme sayfalarından biri olarak uygulamanın yasal uyumluluk katmanında yer alır.

## Fonksiyon Grupları

### Sayfa Bileşeni
Çerez politikası sayfasının tamamını render eder. Dışarıdan `lang` parametresi alır ve bu dile uygun içeriği kullanıcıya sunar.
- CookiePolicyPage

### Çeviri Yardımcısı
Verilen bir anahtar (`key`) karşılığında o anki dile ait çevrilmiş metni döndürür. Sayfa bileşeni tarafından içerik metinlerini elde etmek için kullanılır.
- t

## Bağımlılıklar
- **Dış bağımlılıklar:** React kütüphanesi; muhtemelen bir uluslararasılaştırma (i18n) çözümü `t` fonksiyonunun arkasında yer alır.
- **İç bağımlılıklar:** Belirtilmemiş. Modülün `views/legal` dizininde konumlanması, uygulamanın yasal sayfalar grubuna ait olduğunu gösterir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarım yapılabilmektedir. Modülün doğru çalışması için gerekli koşulları belirleyecek yeterli bilgi bulunmamaktadır.

[Aksiyom 1]: Eğer `lang` prop'u sağlanmazsa, bileşen hangi dili kullanacağını bilemez; davranış bilinmiyor.

[Aksiyom 2]: Eğer `t` fonksiyonu mevcut değilse, bileşen metinleri gösteremez; davranış bilinmiyor.

[Aksiyom 3]: Eğer `t` fonksiyonuna verilen `key` değerleri için karşılık gelen çeviri metinleri yoksa, bileşen ne gösterir bilinmiyor.

---

## FONKSİYON DETAYLARI

### CookiePolicyPage
**Ne yapar**: Çerez politikası sayfasını render eden React fonksiyonel bileşenidir. Kullanıcının dil tercihine göre Türkçe veya İngilizce içerik gösterir ve yasal içerik hazır değilse uyarı mesajı görüntüler.
**Nasıl yapar**: Bileşen, `lang` parametresine göre uygun dil sözlüğünü (`en` veya `tr`) seçer ve çeviri fonksiyonu `t`'yi oluşturur. Sayfa başlığı, taslak uyarısı, çerez politikası içeriği ve sorumluluk reddi bölümlerini sırasıyla render eder. `isLegalContentReady()` fonksiyonu false döndürüğünde sarı renkli uyarı kutusu gösterilir. Dil seçimine göre `CookiePolicyContentEn` veya `CookiePolicyContentTr` bileşeni conditional rendering ile görüntülenir.
**Parametreler**:
- lang: string — Sayfanın görüntüleneceği dili belirten parametre. 'en' veya 'tr' değerlerinden birini alır.
**Dönüş**: React.FC<{ lang: string }> — `lang` prop'u alan bir React fonksiyonel bileşeni döndürür.

### t
**Ne yapar**: Dil sözlüğünden anahtar-değer eşleştirmesi yaparak çeviri metnini döndüren yardımcı fonksiyondur. Bileşen içinde tanımlı bir closure'dır ve dışarıdan erişilemez.
**Nasıl yapar**: `lang` parametresine göre seçilen sözlük (`dict`) ve verilen `key` parametresi ile `getDictValue` fonksiyonunu çağırır. Bu fonksiyon, sözlük yapısı içinde ilgili anahtara karşılık gelen çeviri metnini bulup döndürür.
**Parametreler**:
- key: string — Sözlükten getirilecek çeviri metninin anahtarı. Nokta notasyonu ile iç içe geçmiş anahtarları destekler (örneğin: 'legal.cookieTitle').
**Dönüş**: Bilinmiyor — Kaynak kodda dönüş tipi açıkça belirtilmemiştir. `getDictValue` fonksiyonunun dönüş tipine bağlıdır.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/CookiePolicyContent::CookiePolicyContentEn
- import: ./components/tr/CookiePolicyContent::CookiePolicyContentTr
- import: @/config/legal::isLegalContentReady
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/CookiePolicyPage.tsx::CookiePolicyPage
- **params**: ({ lang }) (lang: string)
- **ic_degiskenler**:
  - `dict` — `lang` parametresinin değerine göre `en` veya `tr` sözlük nesnesini seçer.
  - `t` — `getDictValue` fonksiyonunu, seçilen `dict` sözlüğü ile birlikte kullanarak verilen `key` parametresine karşılık gelen çeviri değerini döndüren bir fonksiyon.
- **Dönüş**: JSX elementi (bir `div` kapsayıcısı) döndürür.

### [N2_NASIL] AST Pointer: src/views/legal/CookiePolicyPage.tsx::t
- **params**: (key: string)
- **ic_degiskenler**: yok
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: CookiePolicyPage.tsx
  function: CookiePolicyPage.tsx::CookiePolicyPage
  function: CookiePolicyPage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: CookiePolicyPage

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