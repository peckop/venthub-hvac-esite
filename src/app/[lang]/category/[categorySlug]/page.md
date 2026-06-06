---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\category\[categorySlug]\page.tsx
skeleton_hash: fbd6725e7fce4452
entity_hashes:
  func:Page: 83982c2082601bcb
  func:generateMetadata: bff06976b3e638cc
  func:generateStaticParams: 5124c4ce610dd009
  overview: e47cdadb5c23e6e0
  style_tokens: e37a0cb8a67ff36f
generated_at: 2026-06-06T19:24:22Z
---

## Genel Bakış
Bu modül, Next.js App Router yapısında dinamik kategori sayfalarını sunar. URL'deki `categorySlug` parametresine göre sayfa içeriğini, SEO meta bilgilerini ve statik üretim parametrelerini yönetir. Modül, hem sunucu taraflı veri çekme hem de istemci tarafı arayüz sunma sorumluluğunu taşır.

## Fonksiyon Grupları

### Statik Üretim Yapılandırması
Uygulama derleme aşamasında hangi kategori slug'larının önceden üretileceğini belirleyerek statik site oluşturma sürecini yönetir.
- `generateStaticParams`

### SEO Meta Bilgisi Oluşturma
Dinamik kategori sayfasının tarayıcı ve arama motorları için başlık, açıklama gibi meta bilgilerini üretir.
- `generateMetadata`

### Sayfa Bileşeni
Kategori sayfasının ana React bileşenini oluşturarak kullanıcının gördüğü arayüzü render eder.
- `Page`

---



---

## FONKSİYON DETAYLARI

### generateStaticParams
**Ne yapar**: Bu fonksiyon, Next.js'in statik site oluşturma (SSG) süreci için dinamik rotaların önceden oluşturulacak tüm olası parametrelerinin listesini üretir. Temel amacı, derleme zamanında (build time) hangi dil ve kategori kombinasyonları için HTML dosyası oluşturulacağını belirlemektir.
**Nasıl yapar**: Fonksiyon, Supabase veritabanından aktif (`is_active` alanı true olan) tüm kategorilerin `slug` alanını çeker. Gelen her bir kategori nesnesi için, varsayılan olarak Türkçe (`tr`) ve İngilizce (`en`) olmak üzere iki ayrı dil parametresi oluşturur. Bu sayede her kategori slug'ı için iki farklı URL yolu (örn: `/tr/category/xxx` ve `/en/category/xxx`) önceden derlenebilir hale gelir.
**Parametreler**:
- Fonksiyon parametre almaz.
**Dönüş**: `{ lang: string, categorySlug: string }` nesnelerinden oluşan bir dizi. Her bir nesne, oluşturulacak bir sayfanın dinamik parametrelerini temsil eder.

### generateMetadata
**Ne yapar**: Bu fonksiyon, belirli bir kategori sayfası için SEO (Arama Motoru Optimizasyonu) ve sosyal paylaşım (Open Graph) amaçlı HTML `<head>` bölümündeki meta etiketlerinin dinamik içeriğini üretir. Sayfanın arama motorlarındaki görünürlüğünü ve sosyal medyada paylaşım appearance'ını belirler.
**Nasıl yapar**: Fonksiyon, URL'den gelen `categorySlug` parametresini alır ve önbelleklenmiş bir veri çekme fonksiyonu olan `getCachedCategoryData` ile ilgili kategori verisini sunucu tarafında (SSR) getirir. Kategori bulunamazsa, varsayılan bir "Kategori Bulunamadı" başlığı döndürür. Kategori mevcutsa, kategori adını ve açıklamasını kullanarak dinamik bir `title`, `description`, `canonical` URL ve `openGraph` nesnesi (başlık, açıklama, URL, site adı, görsel, dil, tür bilgileri dahil) oluşturur. Görsel için öncelikle kategorinin kendi `image_url` alanını, eğer bu boşsa varsayılan bir görsel yolunu kullanır.
**Parametreler**:
- name: params — Sayfanın dinamik parametrelerini içeren bir nesne.
- type: `Promise<{ categorySlug: string }>` — Parametreler asenkron olarak çözümlenir, bu yüzden bir Promise'tır.
- description: URL yolundan gelen `categorySlug` bilgisini taşır. Bu değer, kategori verisini çekmek ve SEO etiketlerini buna göre oluşturmak için kullanılır.
**Dönüş**: `Metadata` tipinde bir nesne. Bu nesne, Next.js tarafından otomatik olarak HTML `<head>` bölümüne meta etiketleri olarak enjekte edilir.

### Page
**Ne yapar**: Bu fonksiyon, bir kategori sayfasının ana React bileşenidir. Sunucu tarafında (SSR) tüm gerekli verileri çeker, yapılandırılmış veri (JSON-LD) oluşturur ve istemci tarafına (client) bir React bileşeni ile birlikte gönderilmek üzere sayfa içeriğini render eder.
**Nasıl yapar**: Fonksiyon, `categorySlug` parametresini alır ve önbellek mekanizmasıyla kategori verisini çeker. Kategori mevcutsa, o kategorinin alt kategorilerini (`parent_id` eşleşmesi ile) ve ardından bu kategori ile tüm alt kategorilerine ait ürünleri `getProductsEnriched` fonksiyonu ile çeker. Verileri, Google'ın zengin sonuçlar için tanımladığı `CollectionPage` tipinde bir JSON-LD yapısına dönüştürerek sayfaya ekler. Son olarak, verileri `PageComponent` bileşenine başlangıç (initial) prop'ları olarak aktarır ve bir `React.Suspense` sınırı içinde render eder; böylece veri yüklenirken bir fallback UI gösterilir.
**Parametreler**:
- name: params — Sayfanın dinamik parametrelerini içeren bir nesne.
- type: `Promise<{ categorySlug: string }>` — Parametreler asenkron olarak çözümlenir.
- description: URL yolundan gelen `categorySlug` bilgisini taşır. Bu değer, kategori verisi, alt kategoriler ve ürünlerin çekilmesi için temel giriş parametresidir.
**Dönüş**: JSX elemanı (React.ReactNode). Sayfanın render edilecek tam HTML yapısını temsil eder. İçeriğinde bir `<script>` etiketi (JSON-LD için) ve bir Suspense içinde sarmalanmış ana sayfa bileşeni (`PageComponent`) bulunur.

---

## SABİTLER
- **_getCachedSupabaseData** (call) — `cache((id: string) => {

  return supabase.from('categories').select('*').eq(...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/category/[categorySlug]/page.tsx::generateStaticParams
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase'den gelen aktif kategorilerin verisi (sadece slug alanlarını içerir)
  - `categoriesList` — `data` veya boş dizi olarak cast edilmiş, her elemanın `slug` alanı olan dizi
  - `c` — flatMap içinde döngü değişkeni, her kategoriyi temsil eder
- **Dönüş**: `{ lang: string, categorySlug: string }[]` — Her kategori için Türkçe ve İngilizce dil kodlu nesnelerden oluşan dizi

### [N2_NASIL] AST Pointer: src/app/[lang]/category/[categorySlug]/page.tsx::generateMetadata
- **params**: `{ params: Promise<{ categorySlug: string }> }` — URL parametrelerini içeren promise
- **ic_degiskenler**:
  - `categorySlug` — await edilmiş params'dan çıkarılmış kategori slug'ı
  - `category` — getCachedCategoryData ile getirilmiş kategori verisi (DomainCategory tipinde veya null)
- **Dönüş**: SEO metadata nesnesi (title, description, alternates, openGraph alanlarını içerir)

### [N3_NASIL] AST Pointer: src/app/[lang]/category/[categorySlug]/page.tsx::Page
- **params**: `{ params: Promise<{ categorySlug: string }> }` — URL parametrelerini içeren promise
- **ic_degiskenler**:
  - `categorySlug` — await edilmiş params'dan çıkarılmış kategori slug'ı
  - `category` — getCachedCategoryData ile getirilmiş kategori verisi (DomainCategory tipinde veya null)
  - `products` — Başlangıçta boş dizi, category varsa getProductsEnriched ile doldurulacak DomainProduct dizisi
  - `subCategories` — Başlangıçta boş dizi, category varsa Supabase'den çekilen alt kategorilerin dönüştürülmüş hali (DomainCategory dizisi)
  - `subsData` — Supabase'den gelen ham alt kategori verisi (DbCategory dizisi)
  - `categoriesArray` — `subsData` veya boş dizi olarak cast edilmiş DbCategory dizisi
  - `s` — map içinde döngü değişkeni, her alt kategoriyi temsil eder (DbCategory tipinde)
  - `categoryIds` — Ana kategori ID'si ve tüm alt kategori ID'lerini içeren dizi
  - `jsonLd` — Schema.org CollectionPage yapısında JSON-LD verisi
  - `prod` — products filtreleme ve map işleminde döngü değişkeni
  - `index` — products map işleminde pozisyon indeksi
- **Dönüş**: JSX elementi (script etiketi ve React.Suspense ile sarılmış PageComponent)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    page_tsx__Page["Page"]
    page_tsx__generateMetadata["generateMetadata"]
    page_tsx__generateStaticParams["generateStaticParams"]
```

## NODE ID STANDARD

  file: src\app\[lang]\category\[categorySlug]\page.tsx
  function: src\app\[lang]\category\[categorySlug]\page.tsx::generateStaticParams
  function: src\app\[lang]\category\[categorySlug]\page.tsx::generateMetadata
  function: src\app\[lang]\category\[categorySlug]\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page
  export: generateMetadata
  export: generateStaticParams

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-center`, `text-slate-500`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `container`, `mx-auto`, `px-4`, `py-12`