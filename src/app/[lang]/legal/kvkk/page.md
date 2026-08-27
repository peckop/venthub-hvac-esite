---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\app\[lang]\legal\kvkk\page.tsx
skeleton_hash: bb212cc11d3dd91d
entity_hashes:
  func:Page: 851f6a31795db41b
  func:generateStaticParams: 42ae72125a484b5f
  overview: 5fe3924512d7505c
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T06:53:24Z
---

## Genel Bakış
Bu modül, Next.js App Router yapısında `[lang]` dinamik segmenti altında yer alan KVKK (Kişisel Verilerin Korunması Kanunu) yasal sayfasını tanımlar. Çoklu dil desteğiyle statik olarak üretilecek yasal içerik sayfasının yapılandırmasını ve render mantığını içerir.

## Fonksiyon Grupları

### Statik Üretim Yapılandırması
Desteklenen diller için statik sayfa yollarını tanımlar; Next.js'in derleme aşamasında hangi dil varyantlarının oluşturulacağını belirler.
- generateStaticParams

### Sayfa Bileşeni
KVKK yasal sayfasının içeriğini render eder; URL'den gelen dil parametresine göre uygun dili kullanarak sayfayı görüntüler.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Next.js App Router yapısında `[lang]` dinamik segmenti altında yer alan bir KVKK yasal sayfasıdır. Fonksiyon gövdeleri verilmediğinden, yalnızca imzalardan çıkarılabilecek varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `generateStaticParams()` fonksiyonu yoksa veya boş bir dizi döndürüyorsa, statik sayfa üretimi gerçekleşmez ve sayfa istek üzerine render edilir.

[Aksiyom 2]: Eğer `params` içinde `lang` değeri yoksa, sayfa bileşeni çalışamaz çünkü `lang` parametresi zorunlu olarak tanımlanmıştır.

[Aksiyom 3]: Eğer `params` bir Promise olarak çözümlenmezse (await edilmezse), `lang` değerine erişilemez çünkü `params` tipi `Promise<{ lang: string }>` olarak tanımlanmıştır.

[Aksiyom 4]: Eğer `generateStaticParams()` tarafından döndürülen `lang` değerleri ile uygulama genelinde desteklenen diller arasında uyumsuzluk varsa, bazı diller için 404 hatası oluşur. Desteklenen dillerin listesi bilinmiyor.

---

## FONKSİYON DETAYLARI

### generateStaticParams
**Ne yapar**: Bu fonksiyon, statik olarak oluşturulacak sayfa yollarının parametrelerini tanımlar. İki farklı dil için (`tr` ve `en`) statik sayfa üretilmesini sağlar.

**Nasıl yapar**: Async bir fonksiyon olarak tanımlanmıştır. Gövdesinde doğrudan bir dizi döndürür. Bu dizi, her biri `lang` alanına sahip iki nesneden oluşur: biri Türkçe (`'tr'`), diğeri İngilizce (`'en'`) değeri taşır. Next.js'in statik site üretim sürecinde bu fonksiyon çağrılarak hangi dil yollarının önceden oluşturulacağı belirlenir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `Array<{ lang: string }>` — Her elemanı `lang` anahtarına sahip nesne olan bir dizi döndürür. Dizi iki eleman içerir: `{ lang: 'tr' }` ve `{ lang: 'en' }`.

### Page
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/legal/KVKKPage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/legal/kvkk/page.tsx::generateStaticParams
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `[{ lang: 'tr' }, { lang: 'en' }]` — statik olarak oluşturulacak dil parametrelerini içeren array; her eleman `lang` anahtarına sahip nesne

### [N2_NASIL] AST Pointer: src/app/[lang]/legal/kvkk/page.tsx::Page
- **params**: `params` — Promise<{ lang: string }> tipinde; Next.js dynamic route segmentinden gelen ve `lang` bilgisini içeren Promise nesnesi
- **ic_degiskenler**:
  - `lang` — `await params` ile Promise çözümlendikten sonra destructuring ile elde edilen dil kodu string değeri; `PageComponent` bileşenine prop olarak aktarılır
- **Dönüş**: `<PageComponent lang={lang} />` — `../../../../views/legal/KVKKPage` yolundan import edilen `PageComponent` bileşenine `lang` prop'u geçirilerek oluşturulan JSX elementi

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\kvkk\page.tsx
  function: src\app\[lang]\legal\kvkk\page.tsx::generateStaticParams
  function: src\app\[lang]\legal\kvkk\page.tsx::Page

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