---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\app\sitemap.ts
skeleton_hash: 9092ed88ff68599a
entity_hashes:
  func:sitemap: c0b328c7136de117
  overview: 5da40d79a2cf8381
generated_at: 2026-08-27T06:54:02Z
---

## Genel Bakış
Bu modül, Next.js uygulaması için arama motoru dostu site haritasını dinamik olarak üretir. Statik sayfalar, kategoriler, markalar ve ürünler dahil tüm içerik türlerinin URL'lerini toplayarak, çoklu dil desteğiyle yapılandırılmış bir site haritası döndürür. Her URL için dil alternatifleri, güncellenme tarihleri ve öncelik seviyeleri gibi SEO metadata bilgileri içerir.

## Fonksiyon Grupları
### Site Haritası Oluşturma
Uygulamanın tüm sayfa rotalarını tarayarak arama motorları için geçerli bir site haritası yapısı hazırlar. Supabase veritabanına erişerek dinamik içerik URL'lerini çeker ve statik rotalarla birleştirir.
- sitemap

---

## AXIOMS – Mimari Varsayımlar

Fonksiyon gövdesi sunulmadığı için yalnızca imza tabanlı varsayımlar üretilebilir.

[Aksiyom 1]: Eğer `sitemap` fonksiyonu parametre almıyorsa, tüm gerekli veriler (statik sayfalar, kategoriler, markalar, ürünler) fonksiyon gövdesi içinde sabit olarak tanımlanmış ya da harici bir kaynaktan (veritabanı, API, dosya sistemi) çekilerek elde ediliyor olmalıdır. Aksi takderde site haritası eksik veya boş döner.

[Aksiyom 2]: Eğer fonksiyon `async` olarak tanımlıysa, gövde içinde en az bir asenkron işlem (veri çekme, dosya okuma vb.) gerçekleşiyordur. Bu asenkron kaynağa erişim sağlanamıyorsa, fonksiyon hata ile sonlanır veya boş bir site haritası döner.

[Aksiyom 3]: Eğer dönüş tipi `MetadataRoute.Sitemap` ise, döndürülen her elemanın bu tipin gerektirdiği alanları (örneğin `url`) içermesi gerekir. Eksik alan içeren elemanlar, Next.js site haritası oluşturucusu tarafından geçersiz sayılır.

[Aksiyom 4]: Fonksiyon gövdesi sunulmadığı için, dokümanda belirtilen Türkçe/İngilizce çoklu dil desteği, kategori/ürün/marka URL toplama mantığı ve statik sayfa listesi gibi davranışlar doğrulanamaz. Bu bilgiler yalnızca doküman açıklamasına dayanır ve fonksiyon gövdesiyle teyit edilmemiştir.

---

## FONKSİYON DETAYLARI

### sitemap
**Ne yapar**: Next.js uygulamasının tüm kamu sayfaları için bir `MetadataRoute.Sitemap` dizisi oluşturur. Statik sayfalar, kategoriler, alt kategoriler, markalar ve ürün ailelerini kapsayan URL'leri iki dil (Türkçe ve İngilizce) için üretir ve arama motorlarına sunulacak eksiksiz bir site haritası döndürür.

**Nasıl yapar**: Fonksiyon, veritabanından kategorileri, ürün ailesi slug'larını ve kategori başına ürün sayılarını paralel olarak (`Promise.all`) çeker. Ürün sayısı sıfır olan kategoriler ve ebeveyni bulunamayan alt kategoriler sitemap'ten dışlanır; böylece kırık URL üretilmesi engellenir. Ardından beş grup halinde rota oluşturulur: (1) statik rotalar (anasayfa, ürünler, iletişim vb.), (2) üst kategori rotaları, (3) alt kategori rotaları (`/[lang]/category/[parentSlug]/[subSlug]` yapısıyla), (4) marka rotaları ve (5) ürün ailesi rotaları. Her rota için `lastModified`, `changefreq`, `priority` ve `alternates.languages` alanları tanımlanır. Ürün rotalarında varyant URL'leri ASLA sitemap'e eklenmez; varyantlar `?sku=` parametresiyle aynı aile sayfasında seçilir ve kanonik adres daima aile slug'ıdır. Son olarak tüm rotalar birleştirilerek tek bir dizi olarak döndürülür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `Promise<MetadataRoute.Sitemap>` — Next.js'in `MetadataRoute.Sitemap` tipinde bir dizi döndürür. Her eleman; `url` (tam URL), `lastModified` (son değişiklik tarihi), `changefreq` (değişiklik sıklığı), `priority` (sayfa önceliği, 0.0–1.0 arası) ve `alternates.languages` (Türkçe ve İngilizce karşılıkları) alanlarını içerir. Toplam beş rotanın birleşimidir: statik rotalar (`priority: 1.0` anasayfa, diğerleri `0.8`), kategori rotaları (`0.7`), alt kategori rotaları (`0.65`), marka rotaları (`0.6`) ve ürün ailesi rotaları (`0.9`).

---

## İTHALATLAR (IMPORTS)
- import: ../config/siteUrl::SITE_URL
- import: ../data/brands::HVAC_BRANDS
- import: ../lib/services/category.service::getCategories
- import: ../lib/services/family.service::getAllFamilySlugs
- import: ../lib/supabase/static::supabaseStaticClient
- import: ../utils/categoryHelpers::getLocalizedCategorySlug
- import: ../utils/routes::Routes
- import: next::MetadataRoute

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/sitemap.ts::sitemap
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `baseUrl` — `SITE_URL` importundan gelen site kök URL'si; tüm URL'lerin başına eklenir
  - `locales` — `['tr', 'en']` sabit dizisi; her rota için iki dilde URL üretilmesini sağlar
  - `categories` — `getCategories(supabaseStaticClient)` çağrısından dönen kategori listesi; hata durumunda `.catch(() => [])` ile boş diziye düşer
  - `familySlugs` — `getAllFamilySlugs(supabaseStaticClient)` çağrısından dönen ürün ailesi slug listesi; hata durumunda `.catch(() => [])` ile boş diziye düşer
  - `countRes` — `supabaseStaticClient.rpc('get_category_counts')` çağrısından dönen yanıt nesnesi; `.data` alanında kategori başına ürün sayılarını içerir
  - `categoryCountMap` — `Map<string, number>` tipinde; kategori ID'sini (`row.category_id`) ürün sayısıyla (`row.product_count ?? 0`) eşler
  - `row` — `countRes.data ?? []` dizisinin her elemanı; `row.category_id` ve `row.product_count` alanlarına erişilir
  - `categoriesWithProducts` — `categories` dizisinden, `categoryCountMap`'te ürün sayısı 0'dan büyük olanların filtrelenmiş hali; sitemap'e yalnızca ürünü olan kategoriler yazılır
  - `cat` — filtreleme ve map işlemleri sırasında kullanılan tekil kategori nesnesi; `cat.id`, `cat.parent_id`, `cat.updated_at` alanlarına erişilir
  - `categoriesById` — `Map` yapısı; `categories` dizisinden `cat.id` → `cat` eşlemesiyle oluşturulur; alt kategorilerin ebeveynine erişmek için kullanılır
  - `subCategoriesWithProducts` — `categoriesWithProducts` dizisinden, `cat.parent_id` değeri var olan ve `categoriesById` Map'inde bulunan alt kategorilerin filtrelenmiş hali; kırık ebeveyn referansları hariç tutulur
  - `staticRoutesList` — `''`, `'/products'`, `'/brands'`, `'/contact'`, `'/about'`, `'/destek/merkez'`, `'/cart'`, `'/legal/kvkk'`, `'/legal/gizlilik-politikasi'`, `'/legal/cerez-politikasi'` yollarını içeren sabit dizi
  - `staticRoutes` — `MetadataRoute.Sitemap` tipinde; `locales.flatMap` ile her dil ve her statik rota için URL, `lastModified`, `changefreq: 'daily'`, `priority` (ana sayfa 1.0, diğerleri 0.8) ve `alternates.languages` içeren nesneler dizisi
  - `lang` — `locales.flatMap` içindeki döngü değişkeni; `'tr'` veya `'en'` değerini alır
  - `route` — `staticRoutesList.map` içindeki döngü değişkeni; tekil statik rota yolunu temsil eder
  - `categoryRoutes` — `MetadataRoute.Sitemap` tipinde; `locales.flatMap` ile her dil ve her `categoriesWithProducts` elemanı için `Routes.category(getLocalizedCategorySlug(cat, lang))` kullanılarak üretilen URL'ler; `lastModified: new Date(cat.updated_at || new Date())`, `changefreq: 'weekly'`, `priority: 0.7` ve `alternates.languages` içerir
  - `subCategoryRoutes` — `MetadataRoute.Sitemap` tipinde; `locales.flatMap` ile her dil ve her `subCategoriesWithProducts` elemanı için `Routes.category(getLocalizedCategorySlug(parent, lang), getLocalizedCategorySlug(cat, lang))` kullanılarak üretilen URL'ler; `lastModified: new Date(cat.updated_at || new Date())`, `changefreq: 'weekly'`, `priority: 0.65` ve `alternates.languages` içerir
  - `parent` — `categoriesById.get(cat.parent_id!)` ile elde edilen ebeveyn kategori nesnesi; `getLocalizedCategorySlug(parent, lang)` çağrılarıyla alt kategori URL'inde kullanılır
  - `brandRoutes` — `MetadataRoute.Sitemap` tipinde; `locales.flatMap` ile her dil ve her `HVAC_BRANDS` elemanı için `Routes.brand(brand.slug)` kullanılarak üretilen URL'ler; `lastModified: new Date()`, `changefreq: 'weekly'`, `priority: 0.6` ve `alternates.languages` içerir
  - `brand` — `HVAC_BRANDS.map` içindeki döngü değişkeni; `brand.slug` alanına erişilir
  - `productRoutes` — `MetadataRoute.Sitemap` tipinde; `locales.flatMap` ile her dil ve `familySlugs` içinde `f.slug` değeri dolu olanlar için `Routes.product(f.slug)` kullanılarak üretilen URL'ler; `lastModified: new Date()`, `changefreq: 'daily'`, `priority: 0.9` ve `alternates.languages` içerir. Varyant URL'leri ASLA sitemap'e girmez; varyant `?sku=` ile aynı aile sayfasında seçilir
  - `f` — `familySlugs.filter(...).map` içindeki döngü değişkeni; `f.slug` alanına erişilir
- **Dönüş**: `Promise<MetadataRoute.Sitemap>` — `staticRoutes`, `categoryRoutes`, `subCategoryRoutes`, `brandRoutes`, `productRoutes` dizilerinin spread ile birleştirilmiş hali

---

## NODE ID STANDARD

  file: src\app\sitemap.ts
  function: src\app\sitemap.ts::sitemap

---

## DISA AKTARILANLAR (EXPORTS)
  export: sitemap