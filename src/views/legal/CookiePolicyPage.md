---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\CookiePolicyPage.tsx
skeleton_hash: c394dcb4ff6f133c
entity_hashes:
  func:CookiePolicyPage: 39fe3c926a47f80a
  func:t: dfce546a71d7f2c2
  overview: 96d79391266869b9
  style_tokens: 06829f9d93bd4397
generated_at: 2026-06-16T11:53:15Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin çerez politikası sayfasını sunan statik bir React bileşenidir. Temel amacı, kullanıcıları çerez kullanımı konusunda yasal olarak bilgilendirmek ve uygulamanın gizlilik yükümlülüklerini yerine getirmesine katkıda bulunmaktır. Modül, karmaşık bir iş mantığına sahip olmayıp salt görüntüleme odaklıdır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün temel ve tek bileşenidir; çerez politikasının tüm statik içeriğini ve yapısını kullanıcı arayüzünde render etmekten sorumludur.
- CookiePolicyPage

### Yardımcı Fonksiyonlar
Sayfa içindeki metinlerin çoklu dil desteği için çevrilmesini sağlayan basit bir yardımcı fonksiyondur.
- t

---

## AXIOMS – Mimari Varsayımlar
Bu modül, dil parametresine bağımlı bir gösterim bileşeni olduğu için temel mimari varsayımlar aşağıdadır.

[Aksiyom 1]: Eğer `lang` parametresi bileşene geçirilmezse, sayfa içeriği hangi dilde render edileceği belirsiz olacağından, `t()` fonksiyonu doğru çevirileri döndüremeyebilir ve sayfa eksik veya hatalı içerik gösterebilir.

[Aksiyom 2]: Eğer `t()` çeviri fonksiyonu çağrılmadan önce modül bağlamında tanımlı değilse veya bu bileşenin erişim alanında bulunmuyorsa, çerez politikası metinleri görüntülenemeyebilir ve bileşen render hata ile karşılaşabilir.

[Aksiyom 3]: Eğer `lang` geçerli bir dil kodu (örneğin `"tr"`, `"en"`) içermiyorsa, `t()` fonksiyonu ilgili dil dosyasındaki anahtarları bulamayacağından, sayfa內容u çevrilmemiş ham anahtar metinleri veya boş değerler döndürebilir.

---

**Not:** Bu bileşen salt bir "sunum (presentation)" bileşeni olduğundan, fonksiyon imzasından çıkarılabilecek mimari bağımlılıklar sınırlıdır. Bileşenin hangi spesifik çerez politikası metinlerini gösterdiği, hangi dil dosyalarına eriştiği ve hangi UI kütüphanesini kullandığı docstring'lerden veya kod gövdesinden çıkarılamadığı için bu konularda aksiyom üretilmemiştir.

---

## FONKSİYON DETAYLARI

### CookiePolicyPage
**Ne yapar**: Bu fonksiyon, belirli bir dil seçeneğine (`lang`) göre bir "Çerez Politikası" sayfasını oluşturan ve döndüren bir React fonksiyonel bileşenidir. Sayfa, kullanıcının tercih ettiği dilde (Türkçe veya İngilizce) hukuki içeriği, başlık ve uyarılarla birlikte sunar.

**Nasıl yapar**: Fonksiyon, `lang` prop değerini kullanarak içinde bir `t` adlı tercüme fonksiyonu ve sözlük nesnesi (`dict`) oluşturur. `t` fonksiyonu, `getDictValue` yardımcı fonksiyonunu çağırarak verilen anahtar (`key`) karşılığındaki çeviri metnini sözlükten getirir. Return ifadesinde, sayfa yapısını (başlık, uyarı kutusu, içerik ve sorumluluk reddi) JSX ile döndürür. İçerik bölümü, `lang` değerine bağlı olarak `CookiePolicyContentEn` veya `CookiePolicyContentTr` bileşenlerinden birini koşullu olarak render eder.

**Parametreler**:
- lang: string — Sayfanın gösterileceği dili belirten ISO dil kodu (örn: 'en', 'tr'). Bu değer, içeriğin ve tercümelerin dil seçiminin temelini oluşturur.

**Dönüş**: `React.FC<{ lang: string }>` tipinde bir React fonksiyonel bileşeni. Bu bileşen, dil ayarına göre düzenlenmiş tam HTML yapısını (başlık, uyarılar, yasal metin) içeren JSX'i döndürür.

### t
**Ne yapar**: Bu fonksiyon, `CookiePolicyPage` bileşeni içinde tanımlı bir yardımcı (helper) fonksiyondur. Görevi, verilen bir anahtar (`key`) ile çeviri sözlüğünden karşılık gelen metni getirmektir.

**Nasıl yapar**: Fonksiyon, üst kapsamda (`CookiePolicyPage` içinde) tanımlanan `dict` (sözlük) nesnesini闭包 (closure) aracılığıyla erişir ve `getDictValue(dict, key)` çağrısı yaparak ilgili çeviri metnini üretir. `getDictValue` fonksiyonunun内部实现 detayı verilmemiş olup, sözlük hiyerarşisinden noktalı notasyonla (`'legal.cookiePolicyTitle'` gibi) bir değeri almaktadır.

**Parametreler**:
- key: string — Çeviri sözlüğünde aranacak metnin anahtarı. Noktalı notasyonla (örn: `'legal.draftWarning'`) belirtilmiştir.

**Dönüş**: Verilen dokümanda belirtilen dönüş tipi "void veya bilinmiyor" olarak geçmektedir. Ancak kullanım amacına ve `getDictValue` çağrısına dayanarak, fonksiyonun `string` veya `string | undefined` gibi bir metin değeri döndürdüğü açıktır.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/CookiePolicyContent::CookiePolicyContentEn
- import: ./components/tr/CookiePolicyContent::CookiePolicyContentTr
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointers: `src/views/legal/CookiePolicyPage.tsx`::CookiePolicyPage
- **params**: `({ lang })` — dil kodu ('en' veya 'tr') taşıyan prop objesi
- **ic_degiskenler**:
  - `dict` — `lang` değerine göre `en` veya `tr` sözlük nesnesini seçer; `t()` fonksiyonuna kaynak olarak kullanılır
  - `t` — çeviri yardımcısı fonksiyon; verilen key ile `getDictValue(dict, key)` çağırarak yerelleştirilmiş metin döndürür
- **Dönüş**: JSX — `lang` değerine göre İngilizce veya Türkçe içerikli cookie policy sayfasını render eden React bileşeni
- **Notlar**:
  - `t()` çağrıları: `'legal.cookiePolicyTitle'`, `'legal.draftWarning'`, `'legal.disclaimer'`
  - `CookiePolicyContentEn` ve `CookiePolicyContentTr` bileşenleri `lang` prop'u ile koşullu olarak render edilir

---

### [N2_NASIL] AST Pointers: `src/views/legal/CookiePolicyPage.tsx`::t (CookiePolicyPage içinde inner function)
- **params**: `(key: string)` — çeviri sözlüğünden istenen anahtar
- **ic_degiskenler**: (yok)
- **Dönüş**: `getDictValue(dict, key)` sonucu — `dict` outer closure'dan referans ile alınan sözlükten key'e karşılık gelen localized string

---

## NODE ID STANDARD

  file: src\views\legal\CookiePolicyPage.tsx
  function: src\views\legal\CookiePolicyPage.tsx::CookiePolicyPage
  function: src\views\legal\CookiePolicyPage.tsx::t

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