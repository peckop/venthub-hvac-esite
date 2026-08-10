---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\Seo.tsx
skeleton_hash: 56de44a929f57db0
entity_hashes:
  func:Seo: efb90eeb61c051d0
  overview: c4b11b13e9e25b50
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:34Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinde web sayfalarının arama motoru optimizasyonu (SEO) ve sosyal medya paylaşım uyumluluğunu sağlamak için geliştirilmiş özel bir React bileşeni barındırır. Tüm proje sayfalarında ortak olarak kullanılarak dinamik şekilde gelen içeriklere uygun meta verileri yönetir, sitenin arama motorlarında doğru indekslenmesini ve sosyal medya platformlarında paylaşıldığında içeriğin istenen şekilde özetlenmesini destekler.

## Fonksiyon Grupları
### Merkezi SEO Meta Verisi Yönetimi
Projedeki tüm sayfalardan çağrılarak tüm SEO ve sosyal medya ile ilgili meta verilerini tek merkezden işleyen ana bileşendir. Kullanıcıdan aldığı sayfa başlığı, açıklaması, standart canonical bağlantı, Open Graph görseli ve içerik tipi gibi değerleri işleyerek ilgili tarayıcı ve platformlara sunar.
- Seo

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı SEO bileşeni, web sayfalarının arama motorları tarafından doğru dizine eklenmesi ve sosyal medya platformlarında doğru önizleme ile paylaşılması için gerekli meta verilerini üreterek sayfa head bölümüne enjekte eder. Doğru çalışması için tüm zorunlu props'ların eksiksiz iletilmesi ve bileşenin DOM head öğesine erişimi gereklidir.

[Aksiyom 1]: Eğer title prop'u bileşene iletilmezse, sayfanın temel başlık meta etiketi oluşturulamaz, arama motorları sayfayı başlıksız veya yanlış başlıkla dizine ekler.
[Aksiyom 2]: Eğer description prop'u iletilmezse, arama motoru sonuçlarında ve sosyal medya paylaşımlarında sayfaya ait açıklama metni görüntülenemez.
[Aksiyom 3]: Eğer canonical prop'u (orijinal sayfa URL'si) iletilmezse, arama motorları yinelenen içerik tespiti yaparak sayfanın sıralamasını düşürür, orijinal içeriği doğru tespit edemez.
[Aksiyom 4]: Eğer ogImage prop'u (sosyal medya önizleme görseli) iletilmezse, sosyal medya platformlarında paylaşım sırasında sayfaya ait görsel önizlemesi oluşturulamaz.
[Aksiyom 5]: Eğer ogType prop'u, sayfa içeriğinin türüne uygun olarak (ürün, makale vb.) varsayılan 'website' değerinden değiştirilmezse, içerik türüne özel arama motoru ve sosyal medya işlevleri kullanılamaz.
[Aksiyom 6]: Eğer bileşen uygulamanın DOM yapısındaki head öğesine erişemiyorsa, tüm meta etiketleri sayfaya enjekte edilemez, SEO entegrasyonu tamamen başarısız olur.

---

## FONKSİYON DETAYLARI

### Seo
**Ne yapar**: VentHub HVAC projesinin React tabanlı kod yapısında yer alan, sayfaların arama motorları ve sosyal medya platformlarıyla uyumlu olmasını sağlayan SEO odaklı bir React bileşenidir. Tüm standart meta etiketleri ile Open Graph protokolü gerektiren etiketleri tek bir yapıda oluşturarak, her sayfa için özel SEO yapılandırması yapılmasını kolaylaştırır. Sayfaların arama motoru sonuçlarında doğru şekilde listelenmesini, sosyal medyada paylaşıldığında içeriğine uygun başlık, açıklama ve görselle gösterilmesini sağlar.
**Nasıl yapar**: Props olarak aldığı SEO ile ilgili tüm değerleri işleyerek, ilgili meta etiketlerinin içerik alanlarına yerleştiren bir React fonksiyonel bileşeni olarak çalışır. `ogType` parametresi için varsayılan olarak 'website' değeri tanımlanmıştır, bu sayede kullanıcı tarafından özel bir içerik türü belirtilmese bile temel Open Graph yapısı eksiksiz oluşur. Tüm alınan prop değerlerini SeoProps tip şemasına uygun olarak işleyerek, sayfanın head bölümüne eklenecek tüm meta etiketlerini web standartlarına uygun şekilde yapılandırır.
**Parametreler**:
- title: SeoProps dahilinde tanımlı title alanı — Sayfanın ana başlığı, tarayıcı sekmesi başlığında ve arama motoru sonuçlarında görünen metin değeridir
- description: SeoProps dahilinde tanımlı description alanı — Sayfa içeriğini özetleyen açıklama metni, arama motoru sonuçlarında başlığın altında görüntülenir
- canonical: SeoProps dahilinde tanımlı canonical alanı — Sayfanın tekil standart URL'si, yinelenen içerik sorunlarını önlemek için arama motorlarına bildirilir
- ogImage: SeoProps dahilinde tanımlı ogImage alanı — Sosyal medya platformlarında sayfa paylaşıldığında gösterilecek Open Graph görselinin tam URL'sidir
- ogType: SeoProps dahilinde tanımlı ogType alanı, varsayılan değeri 'website' — Sayfanın içerik türünü Open Graph protokolüne göre bildiren değer, website, article, product gibi özel içerik türleri alabilir
**Dönüş**: React.FC<SeoProps> — Alınan tüm prop değerleriyle yapılandırılmış, sayfaya gerekli tüm SEO uyumlu meta etiketlerini ekleyen çalıştırılabilir React fonksiyonel bileşenini döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/config/siteUrl::SITE_URL
- import: next/navigation::usePathname
- import: react::React

---

## INTERFACES

### SeoProps
- `title?: string`
- `description?: string`
- `canonical?: string`
- `ogImage?: string`
- `ogType?: 'website' | 'product' | 'article'`
- `noIndex?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\Seo.tsx::Seo
- **params**: title, description, canonical, ogImage, ogType (varsayılan: 'website'), noIndex (varsayılan: false)
- **ic_degiskenler**:
  - `pathname` — Next.js `usePathname` hook'u ile alınan mevcut sayfanın yol değeri, canonical URL oluşturmak için kullanılır
  - `siteName` — Sabit 'VentHub' site adı, sayfa başlığı ve Open Graph etiketlerinde kullanılır
  - `fullTitle` — Özel başlık varsa `${title} | ${siteName}`, yoksa sadece `siteName` olarak oluşturulan nihai sayfa başlığı, tüm başlık etiketlerinde kullanılır
  - `defaultDesc` - Varsayılan site açıklaması, özel description girilmezse kullanılır
  - `finalDesc` - Özel description varsa onu, yoksa `defaultDesc`'ı kullanan nihai açıklama, meta description ve sosyal medya etiketlerinde kullanılır
  - `siteUrl` - Konfigürasyondan alınan `SITE_URL` sabitine atanan site kök URL'si, tüm mutlak URL'leri oluşturmak için kullanılır
  - `url` - Özel canonical URL varsa onu, yoksa `${siteUrl}${pathname}` ile oluşturulan nihai sayfa URL'si, canonical ve Open Graph URL etiketlerinde kullanılır
  - `image` - Özel sosyal medya görseli `ogImage` varsa onu, yoksa varsayılan `${siteUrl}/og-image.png` URL'sini kullanan sosyal medya görseli, Open Graph ve Twitter görsel etiketlerinde kullanılır
  - `usePathname` - Next.js'ten import edilen, mevcut sayfa path'ini almak için kullanılan hook
  - `SITE_URL` - Site konfigürasyonundan import edilen sabit kök URL değeri
- **Dönüş**: Tüm SEO, Open Graph ve Twitter meta etiketlerini içeren React JSX fragment'i, sayfanın head bölümüne eklenmek üzere arka arkaya HTML etiketleri grubu döndürür

---

## NODE ID STANDARD

  file: src\components\Seo.tsx
  function: src\components\Seo.tsx::Seo

---

## DISA AKTARILANLAR (EXPORTS)
  export: Seo

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