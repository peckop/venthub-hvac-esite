---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\app\[lang]\legal\on-bilgilendirme-formu\page.tsx
skeleton_hash: fb6641ae7be2819b
entity_hashes:
  func:Page: 851f6a31795db41b
  func:generateStaticParams: 42ae72125a484b5f
  overview: c6e80b9884dd71c2
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:23:59Z
---

## Genel Bakış
Bu modül, Next.js App Router yapısında "ön bilgilendirme formu" adlı yasal sayfayı sunan bir sayfa bileşenidir. Çoklu dil desteği sağlar; `lang` parametresi aracılığıyla hangi dilde içerik gösterileceğini belirler. Statik site üretiminde hangi dillerin önceden oluşturulacağını tanımlar.

## Fonksiyon Grupları

### Statik Üretim Yapılandırması
Next.js'in statik sayfa oluşturma sürecinde hangi dil yollarının derleme anında üretileceğini belirler. Bu fonksiyon, desteklenen dillerin listesini döndürerek her dil için ayrı bir statik sayfa oluşturulmasını sağlar.
- generateStaticParams

### Sayfa Bileşeni
URL'den gelen `lang` parametresini alarak ön bilgilendirme formu sayfasını render eder. Kullanıcının dil tercihine göre uygun içeriği sunar.
- Page

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### generateStaticParams
**Ne yapar**: Next.js'in statik site oluşturma (SSG) sürecinde hangi dil parametreleri için sayfa oluşturulacağını belirten asenkron bir fonksiyondur. Bu fonksiyon, Türkçe (`tr`) ve İngilizce (`en`) olmak üzere iki farklı dil için statik sayfa üretileceğini tanımlar.

**Nasıl yapar**: Fonksiyon herhangi bir işlem yapmaksızın sabit bir dizi döndürür. Dizi içinde her bir eleman bir `lang` alanına sahip nesnelerden oluşur. Next.js framework'ü, bu fonksiyonun dönüş değerini kullanarak belirtilen her dil için ayrı bir statik sayfa dosyası oluşturur.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `Array<{ lang: string }>` — İki elemanlı bir dizi döndürür: `{ lang: 'tr' }` ve `{ lang: 'en' }`. Her eleman, oluşturulacak statik sayfanın dil parametresini temsil eder.

### Page
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/legal/PreInformationPage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/legal/on-bilgilendirme-formu/page.tsx::generateStaticParams
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `[{ lang: 'tr' }, { lang: 'en' }]` — iki elemanlı statik parametre dizisi; her eleman `lang` anahtarına sahip nesne

### [N2_NASIL] AST Pointer: src/app/[lang]/legal/on-bilgilendirme-formu/page.tsx::Page
- **params**: `params` — `Promise<{ lang: string }>` tipinde, dil bilgisini içeren Promise nesnesi
- **ic_degiskenler**:
  - `lang` — `await params` ile çözümlenerek elde edilen dil değeri (`params.lang`)
- **Dönüş**: `<PageComponent lang={lang} />` — `PageComponent` bileşeni, `lang` prop'u ile render edilir

---

## NODE ID STANDARD

  file: page.tsx
  function: page.tsx::generateStaticParams
  function: page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page
  export: generateStaticParams

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)