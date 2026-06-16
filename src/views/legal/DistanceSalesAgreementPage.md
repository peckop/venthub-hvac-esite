---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\DistanceSalesAgreementPage.tsx
skeleton_hash: 3d9da3206aa6168d
entity_hashes:
  func:DistanceSalesAgreementPage: de11566081e661c0
  func:t: 281688e1734ee99d
  overview: 2a142a6874192776
  style_tokens: 06829f9d93bd4397
generated_at: 2026-06-16T11:53:30Z
---

## Genel Bakış
Bu modül, VentHup platformunda yasal gereklilikler kapsamında "Uzaktan Satış Sözleşmesi" sayfasını render eden bağımsız bir React bileşenidir. Bileşen, sözleşmenin standart metnini dil ayarlarına göre sunar ve dinamik verileri (satıcı unvanı, web sitesi adresi, satıcı adresi gibi) proje genelinde paylaşılan yasal konfigürasyon nesnesinden alarak kullanıcılara ilgili hukuki metni gösterir.

## Fonksiyon Grupları
### UI Rendering
Sayfanın tüm düzenini ve içeriğini oluşturarak kullanıcıya Uzaktan Satış Sözleşmesi metnini ve ilgili hukuki bilgileri sunar.
- DistanceSalesAgreementPage

### Yardımcı Fonksiyonlar
Çeviri anahtarlarını mevcut dile göre doğru metin karşılıklarına dönüştürerek sayfa içeriğinin çoklu dil desteğiyle render edilmesini sağlar.
- t

---

## AXIOMS – Mimari Varsayımlar

Bu modül, dil-destekli bir yasal sözleşme sayfa görünümü sunan minimal bir React bileşenidir.

**[Aksiyom 1 - Dil Bağımlılığı]:** Eğer `lang` parametresi sağlanmazsa veya geçerli bir dil kodu içermiyorsa, sözleşme metni hedef dilde görüntülenemez.

**[Aksiyom 2 - Çeviri Fonksiyonu]:** Eğer `t(key)` fonksiyonu çağrılmadan önce modül bağlamında tanımlanmamışsa (bağımlılık olarak enjekte edilmemişse), çeviri beklenmeyen şekilde başarısız olur.

**[Aksiyom 3 - Parametre Gerekliliği]:** Eğer `lang` parametresi opsiyonel olarak işaretlenmemişse (fonksiyon imzasında default değer verilmemiştir), bileşen çağrısında bu parametre zorunludur; aksi halde TypeScript derleme hatası oluşur.

---

**Not:** Bu modül sadece UI renderlama yaptığı ve fonksiyon gövdesinde durum yönetimi, API çağrısı veya hesaplama mantığı içermediği için, modül içi ek mimari varsayımlar belirlenememiştir. Tüm işlevsellik `lang` parametresine ve dışarıdan sağlanan `t` çeviri fonksiyonuna bağlıdır.

---

## FONKSİYON DETAYLARI

### DistanceSalesAgreementPage
**Ne yapar**: Mesafeli Satış Sözleşmesi sayfasını render eden ana React bileşenidir. Kullanıcının tercih ettiği dile göre (Türkçe veya İngilizce) uygun sözleşme içeriğini ve sayfa düzenini sunar.

**Nasıl yapar**: Fonksiyon, bir `lang` prop'u alır ve bu değere bağlı olarak bir sözlük (`dict`) seçer. Sayfa içinde `t` adında yerel bir çeviri fonksiyonu tanımlayarak statik metinleri (başlık, uyarı notu, feragatname) ilgili dilden çeker. Sayfanın ana yapısını JSX ile oluşturur, ardından `lang` değişkeninin `'en'` olup olmadığına koşul olarak bakarak, İngilizce veya Türkçe sözleşme bileşenini (`DistanceSalesAgreementContentEn` veya `DistanceSalesAgreementContentTr`) render eder.

**Parametreler**:
- `lang`: `string` — Sayfanın görüntüleneceği dil kodunu belirtir. Beklenen değerler `'tr'` (Türkçe) veya `'en'` (İngilizce)'dir.

**Dönüş**: `React.FC<{ lang: string }>` — Belirtilen dile uygun HTML yapısını içeren bir React Functional Component.

### t
**Ne yapar**: Sayfa içindeki statik metinlerin (başlık, uyarı, feragatname) çevrilmesini sağlayan bir yardımcı fonksiyondur.

**Nasıl yapar**: Dış fonksiyon (`DistanceSalesAgreementPage`) tarafından tanımlanan bir inner function'dır. Çalıştığı bağlamda (`DistanceSalesAgreementPage`'in kapanma alanı) zaten tanımlı olan `dict` (sözlük) nesnesine erişir. Verilen anahtar (`key`) ile `getDictValue` yardımcı fonksiyonunu kullanarak sözlükten ilgili çeviri metnini alır ve döndürür.

**Parametreler**:
- `key`: `string` — Çevrilecek metnin sözlük içindeki noktanotation ile belirtilen yolu (örn: `'legal.distanceSalesTitle'`).

**Dönüş**: `string` — Verilen anahtara karşılık gelen, seçili dile ait çevrilmiş metin.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/DistanceSalesAgreementContent::DistanceSalesAgreementContentEn
- import: ./components/tr/DistanceSalesAgreementContent::DistanceSalesAgreementContentTr
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/DistanceSalesAgreementPage.tsx::DistanceSalesAgreementPage
- **params**: `{ lang }` — dil bilgisi ('en' veya 'tr')
- **ic_degiskenler**:
  - `dict` — lang parametresine göre İngilizce veya Türkçe sözlük nesnesini tutar (en veya tr)
  - `t` — getDictValue fonksiyonunu dict ile bağlayan çeviri fonksiyonu; verilen key'e karşılık gelen sözlük değerini döndürür
- **Dönüş**: JSX — Dil seçimine göre başlık, uyarı, mesafeli satış sözleşmesi içeriği ve feragatname gösteren React bileşeni

### [N2_NASIL] AST Pointer: src/views/legal/DistanceSalesAgreementPage.tsx::t
- **params**: `key: string` — sözlükte aranacak çeviri anahtarı (ör. 'legal.distanceSalesTitle')
- **ic_degiskenler**: (yok)
- **Dönüş**: string — `getDictValue(dict, key)` çağrısıyla elde edilen sözlük değeri

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