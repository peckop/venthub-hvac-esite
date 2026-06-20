---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\kullanim-kosullari\page.tsx
skeleton_hash: 3d46a45450b5913b
entity_hashes:
  func:Page: 851f6a31795db41b
  func:generateStaticParams: 42ae72125a484b5f
  overview: 5231a61d2c38b252
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:46:33Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının "Kullanım Koşulları" yasal sayfasını sunmakla sorumludur. Next.js'in statik sayfa oluşturma altyapısını kullanarak, farklı dil sürümleri için statik parametreler üretir ve sayfa içeriğini render eder. Modül, yasal içeriği sunmaya odaklanan, veri bağımlılığı olmayan bir statik sayfa yapısına sahiptir.

## Fonksiyon Grupları
### Statik Sayfa Üretimi
Next.js'in statik site oluşturma (SSG) sürecini yönetir; sayfanın verschiedenen dil sürümleri için gerekli statik parametreleri üretir.
- generateStaticParams

### Sayfa Renderlama
Kullanım Koşulları sayfasının React bileşenini oluşturur ve sunucu tarafından render edilen HTML içeriğini tarayıcıya iletir.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, çok dilli (i18n) bir Next.js sayfasıdır. Aksiyonlar fonksiyon imzalarından ve dosya yolu yapısından çıkarılmıştır.

---

[Aksiyom 1]: Eğer `generateStaticParams()` fonksiyonu `{ lang: string }` formatında bir dizi döndürmezse, statik sayfa oluşturma (build) aşamasında hata oluşur ve sayfalar önceden derlenemez.

[Aksiyom 2]: Eğer `Page` bileşenine geçirilen `params` promise'i `{ lang: string }` yapısında çözümlenmezse (resolve/reject olursa), bileşen geçerli dil parametresine erişemez ve sayfa içeriği doğru dille gösterilemez.

[Aksiyom 3]: Eğer `lang` parametresi uygulamanın desteklediği dil listesinde (örn: 'tr', 'en') yer almıyorsa, sayfa geçersiz bir dil ile oluşturulur veya 404 hatası döndürülür.

[Aksiyom 4]: Eğer `Page` bileşeni geçerli bir JSX/React elementi (`React.ReactNode`) döndürmezse veya `undefined`/`null` döndürse, tarayıcıda boş sayfa veya React hata sınırı (error boundary) tetiklenir.

---

## FONKSİYON DETAYLARI

### generateStaticParams

**Ne yapar**: Bu fonksiyon, Next.js'in statik Site Oluşturma (Static Site Generation) mekanizması için desteklenen dil parametrelerini tanımlar. Yalnızca 'tr' (Türkçe) ve 'en' (İngilizce) olmak üzere iki dil seçeneği için önceden oluşturulacak sayfa yollarını belirler.

**Nasıl yapar**: Fonksiyon asenkron (async) olarak tanımlanmıştır, ancak mevcut gövdesinde herhangi bir asenkron işlem gerçekleştirmemektedir. Doğrudan bir nesne dizisi döndürerek, Next.js'in build aşamasında `/tr/legal/kullanim-kosullari` ve `/en/legal/kullanim-kosullari` yollarını Statik Olarak Oluşturulmuş (SSG) sayfalar olarak işlemesini sağlar. Bu, Next.js App Router'da `generateStaticParams` adı verilen özel bir API'ye ait bir fonksiyondur.

**Parametreler**: Bu fonksiyon herhangi bir parametre almamaktadır.

**Dönüş**: `Array<{ lang: 'tr' | 'en' }>` — Sadece 'tr' veya 'en' değerlerini içeren `lang` anahtarına sahip nesnelerden oluşan bir dizi döndürür. Bu dizi, Next.js tarafından derleme aşamasında hangi parametrelerle sayfa oluşturacağını belirtmek için kullanılır.

### Page

**Ne yapar**: Next.js uygulamasının "Kullanım Koşulları" yasal sayfasını render eden üst düzey React bileşenidir. Bu fonksiyon, sayfa yapısının dış kabuğunu oluşturur ve asıl içeriği `<PageComponent />` bileşenine devreder.

**Nasıl yapar**: Fonksiyon, herhangi bir state yönetimi veya veri getirme işlemi yapmaksızın doğrudan `<PageComponent />` JSX bileşenini döndürür. Sayfanın tüm somut içeriği, sunucu tarafında veya istemci tarafında render edilen `PageComponent` içinde çözümlenir. Bu yapı, sayfa tanımlamasını basit tutarken bileşen sorumluluğunu ayrıştırma prensibine uygun bir mimari sunar.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almamaktadır. Next.js'in app router yapısı kapsamında otomatik olarak `<params>` ve `searchParams` gibi prop'lar dışarıdan enjekte edilebilir; ancak mevcut implementasyonda bu prop'lar açıkça tanımlanmamış ve doğrudan `PageComponent`'e aktarılmamıştır.

**Dönüş**: `JSX.Element` — `<PageComponent />` bileşeninin render çıktısı olarak geriye bir React JSX öğesi döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/legal/TermsOfUsePage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: app/[lang]/legal/kullanim-kosullari/page.tsx::generateStaticParams
- **params**: (parametre yok)
- **ic_degiskenler**: (değişken yok)
- **Dönüş**: `{ lang: string }[]` — Statik sayfa parametreleri listesi. Sadece 'tr' ve 'en' dilleri için nesne dizisi döndürür.

### [N2_NASIL] AST Pointer: app/[lang]/legal/kullanim-kosullari/page.tsx::Page
- **params**: (`{ params }: { params: Promise<{ lang: string }> }`)
- **ic_degiskenler**:
  - `lang` — Await edilmiş params objesinden çıkarılan dil kodu string'i
- **Dönüş**: JSX — `PageComponent` bileşenini `lang` prop'u ile render eder

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\kullanim-kosullari\page.tsx
  function: src\app\[lang]\legal\kullanim-kosullari\page.tsx::generateStaticParams
  function: src\app\[lang]\legal\kullanim-kosullari\page.tsx::Page

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