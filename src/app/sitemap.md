---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\sitemap.ts
skeleton_hash: b03af8c8b5a74eba
entity_hashes:
  func:sitemap: 6471d8775000e352
  overview: 9af1926cebf28d0e
generated_at: 2026-06-07T12:01:58Z
---

## Genel Bakış
Bu modül, Next.js uygulaması için arama motoru dostu site haritasını dinamik olarak üretir. Statik sayfalar, kategoriler, markalar ve ürünler olmak üzere tüm içerik türlerinin URL'lerini toplayarak, Türkçe ve İngilizce çoklu dil desteğiyle yapılandırılmış bir site haritası döndürür.

## Fonksiyon Grupları
### Site Haritası Oluşturma
Uygulamanın tüm sayfa rotalarını (statik sayfalar, kategoriler, markalar, ürünler) tarayarak arama motorları için geçerli bir site haritası yapısı hazırlar.
- sitemap

---

## AXIOMS – Mimari Varsayımlar

Bu modül için minimum aksiyom tanımlanabilir. `sitemap()` fonksiyonu parametresizdir ve modül sabiti bulunmamaktadır. Fonksiyon gövdesi sunulmadığı için yalnızca imza tabanlı çıkarımlar yapılabilir:

[Aksiyom 1]: Eğer fonksiyonun döndüğü veri yapısı arama motoru tarafından okunamaz formatta ise, site haritası geçersiz olur.

[Aksiyom 2]: Eğer Next.js router yapılandırmasında tanımlı rotalar değiştirilir ancak fonksiyon bu değişiklikleri yansıtmazsa, site haritası eksik veya tutarsız URL'ler içerir.

[Aksiyom 3]: Eğer fonksiyon çağrıldığında içeriğe erişim sağlanamazsa (veritabanı, API, dosya sistemi vb.), site haritası boş veya hatalı döner.

---

**Not:** Fonksiyon gövdesi detaylı olarak sunulmadığından, bağımlılıklar, dönüş tipi yapısı ve iş mantığı hakkında kesin aksiyom türetilmemiştir. Daha kesin aksiyonlar için `sitemap()` gövdesinin tam kodu gereklidir.

---

## FONKSİYON DETAYLARI

### sitemap

**Ne yapar**: Bu fonksiyon, web sitesinin tüm sayfalarını içeren bir site haritası (sitemap) oluşturur. Arama motorlarının siteyi doğru bir şekilde indekslemesini sağlamak için statik sayfaları, kategori sayfalarını, marka sayfalarını ve ürün sayfalarını tek bir çatı altında toplar. Her URL için dil alternatifleri, güncellenme tarihleri ve öncelik seviyeleri dahil olmak üzere SEO dostu metadata bilgileri üretir.

**Nasıl yapar**: Fonksiyon çalıştırıldığında öncelikle Supabase üzerinden tüm kategorileri ve ürünleri paralel olarak getirir. Ardından dört aşamalı bir süreç izler: önce tanımlı statik rotaları (anasayfa, ürünler, markalar, iletişim vb.) her iki dil için oluşturur; ardından veritabanından gelen kategori rotalarını, sabit olarak tanımlı HVAC_BRANDS dizisinden marka rotalarını ve sadece `slug` değeri olan ürünleri filtreleyerek ürün rotalarını üretir. Her bir rota nesnesi için `alternates.languages` alanında Türkçe ve İngilizce URL karşılıkları tanımlanır. Son olarak tüm bu dizi birleştirilip döndürülür. Veri çekme işlemlerinde hata oluşursa boş dizi döner (`catch(() => [])`), böylece hatalı veriler sitemap üretimini bozmaz.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almaz. Tüm yapılandırma değerleri fonksiyon gövdesi içinde tanımlıdır:

- `SITE_URL`: `string` — Sitemap'teki tüm URL'lerin oluşturulmasında kullanılan temel site adresi (base URL). Modül düzeyinde tanımlı bir sabittir.
- `locales`: `string[]` — Desteklenen dil kodlarının dizisi. Fonksiyon içinde `['tr', 'en']` olarak sabit tanımlanmıştır ve her rotanın her iki dil varyantını üretmek için kullanılır.
- `supabaseStaticClient`: `object` — Veritabanı istekleri için kullanılan statik Supabase istemcisi. `getCategories` ve `getAllProducts` fonksiyonlarına argüman olarak geçilir.
- `staticRoutesList`: `string[]` — Sitemap'e dahil edilecek statik sayfa yollarının listesi. Anasayfa, ürünler, markalar, iletişim, hakkımızda, destek merkezi, sepet ve yasal sayfaları (KVKK, gizlilik politikası, çerez politikası) bu dizi içinde tanımlıdır.
- `HVAC_BRANDS`: `array` — Marka rotalarının oluşturulmasında kullanılan sabit marka listesi. Her bir marka nesnesinin `slug` alanı rota üretiminde referans olarak kullanılır.
- `Routes`: `object` — Uygulama genelinde tanımlı rota oluşturucu yardımcı fonksiyonları içeren nesne. `Routes.category()`, `Routes.brand()` ve `Routes.product()` metodları ile parametreli URL'ler üretilir.

**Dönüş**: `Promise<MetadataRoute.Sitemap>` — Asenkron bir şekilde, site haritası için gereken tüm URL nesnelerini içeren bir dizi döndürür. Her bir nesne şu alanları içerir:

- `url`: `string` — Sayfanın tam URL'i (dil kodu ve rota dahil).
- `lastModified`: `Date` — Sayfanın son güncellenme tarihi. Statik rotalar için güncel tarih, dinamik rotalar için veritabanındaki `updated_at` değeri kullanılır; bu alan yoksa güncel tarih fallback olarak atanır.
- `changefreq`: `string` — Arama motorlarına sayfanın güncellenme sıklığını bildirir. Statik rotalar için `daily`, kategori ve marka rotaları için `weekly`, ürün rotaları için `daily` olarak ayarlanmıştır.
- `priority`: `number` — Sayfanın göreli önceliğini belirtir. Anasayfa `1.0` ile en yüksek önceliğe sahiptir; ürün rotaları `0.9`, statik rotalar `0.8`, kategoriler `0.7` ve markalar `0.6` değerlerine sahiptir.
- `alternates.languages`: `Record<string, string>` — Her URL'in Türkçe (`tr`) ve İngilizce (`en`) karşılıklarını içeren dil haritası. Arama motorlarına alternatif dil sürümlerini bildirmek için kullanılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/sitemap.ts::sitemap
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `baseUrl` — SITE_URL sabitinden alınan site temel URL adresi
  - `locales` — Desteklenen dil kodlarının listesi: 'tr' ve 'en'
  - `categories` — getCategories ile çekilen tüm kategori dizisi; Promise.all ile products ile birlikte paralel yüklenir, hata durumunda boş diziye düşer
  - `products` — getAllProducts ile çekilen tüm ürün dizisi; Promise.all ile categories ile birlikte paralel yüklenir, hata durumunda boş diziye düşer
  - `staticRoutesList` — Statik sayfa rotalarının string dizisi ('', '/products', '/brands', '/contact', '/about', '/destek/merkez', '/cart', '/legal/kvkk', '/legal/gizlilik-politikasi', '/legal/cerez-politikasi')
  - `staticRoutes` — staticRoutesList ve locales üzerinden oluşturulan statik rota sitemap nesneleri dizisi; her dil için tüm statik rotaları URL, lastModified, changefreq, priority ve alternates alanlarıyla haritalar
  - `categoryRoutes` — categories ve locales üzerinden oluşturulan kategori rota sitemap nesneleri dizisi; her dil ve kategori için Routes.category(cat.slug) kullanarak URL oluşturur, cat.updated_at değerini lastModified olarak kullanır
  - `brandRoutes` — HVAC_BRANDS ve locales üzerinden oluşturulan marka rota sitemap nesneleri dizisi; her dil ve marka için Routes.brand(brand.slug) kullanarak URL oluşturur
  - `productRoutes` — products ve locales üzerinden oluşturulan ürün rota sitemap nesneleri dizisi; slug değeri olan ürünler (.filter((prod) => !!prod.slug)) ile oluşturulur, Routes.product(prod.slug!) kullanılarak URL üretilir, prod.updated_at lastModified olarak kullanılır
- **Dönüş**: `Promise<MetadataRoute.Sitemap>` — staticRoutes, categoryRoutes, brandRoutes ve productRoutes dizilerinin spread edilerek birleştirildiği toplam sitemap dizisi

---

## NODE ID STANDARD

  file: src\app\sitemap.ts
  function: src\app\sitemap.ts::sitemap

---

## DISA AKTARILANLAR (EXPORTS)
  export: sitemap