---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\PreInformationPage.tsx
skeleton_hash: cbb37270fce40d75
entity_hashes:
  func:PreInformationPage: 6c512329d936b02b
  func:t: 82e524c2f79ad389
  overview: a88c970a8f2231d2
  style_tokens: 06829f9d93bd4397
generated_at: 2026-06-19T20:50:49Z
---

## Genel Bakış
Bu modül, kullanıcıya yasal ön bilgilendirme içeriğini sunan tek sayfalık bir React bileşenini tanımlar. Modül, çok dilli destek sağlayarak dil bazlı metinlerin gösterilmesini yönetir ve basit bir bilgilendirme sayfası sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Ana React bileşenini oluşturarak sayfanın tamamını render eder.
- PreInformationPage

### Yardımcı Fonksiyonlar
Çeviri ve metin erişimi için kullanılan yardımcı fonksiyonları barındırır.
- t

---

## AXIOMS – Mimari Varsayımlar
Bu modül için, fonksiyon gövdesi paylaşılmadığından, yalnızca imza bilgisinden çıkarılabilecek minimum varsayımlar aşağıdadır.

[Aksiyom 1]: Eğer `lang` prop'u bileşene iletilmezse, bileşen düzgün render edilemeyebilir veya varsayılan/boş bir dil değeri ile çalışabilir.

[Aksiyom 2]: Eğer `t(key: string)` çeviri fonksiyonu çalışması için gerekli çeviri sözlüğü/JSON dosyası yüklenmemişse veya `lang` ile uyumlu çeviri anahtarı (`key`) bulunamazsa, çevrilmemiş ham anahtar dizesi veya boş bir değer dönebilir.

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
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/PreInformationPage.tsx::PreInformationPage
- **params**: `({ lang })` — dil kodu ('en' veya 'tr') taşıyan React props nesnesi
- **ic_degiskenler**:
  - `dict` — `lang === 'en'` koşuluna göre `en` ya da `tr` sözlük nesnesini seçer; çeviri anahtarlarının çözülmesinde kullanılır
  - `t` — `getDictValue(dict, key)` partial uygulamasıyla oluşturulan çeviri fonksiyonu; JSX içinde `t('legal.preInformationTitle')`, `t('legal.draftWarning')`, `t('legal.disclaimer')` çağrılarıyla metinlerin dil bazlı değerlerini döndürür
- **Kosullu Dal**: `lang === 'en'` olduğunda `<PreInformationContentEn lang={lang} />`, aksi halde `<PreInformationContentTr lang={lang} />` render edilir
- **Dönüş**: JSX (`<div>` üst öğeli React elemanı) — sayfa yapısını, uyarı kutusunu, içerik bileşenini ve feragatname metnini döndürür

### [N2_NASIL] src/views/legal/PreInformationPage.tsx::t
- **params**: `key: string` — sözlükte çözülecek çeviri anahtarı (ör. `'legal.preInformationTitle'`)
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: `getDictValue(dict, key)` sonucu — seçili sözlükteki karşılık gelen çeviri string değeri

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