---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\product.service.ts
skeleton_hash: 44d049374770bbaa
entity_hashes:
  func:adminSearchProducts: 8d062d9b98a5adbd
  func:fetchProductBy: 801cc0baf830919f
  func:ftsSearchProducts: 2d2acfc324285ae7
  func:getAllProducts: 529357e38ec51dc2
  func:getFeaturedProducts: 79e292f5a34dc62d
  func:getProductById: 2d0a26638de6eace
  func:getProductBySlug: 5e7ce05912b5ca46
  func:getProductBySlugOrId: 1944ae3f26e18e06
  func:getProducts: 6f20be4e19e0cc52
  func:getProductsByCategory: 91be89ee35103378
  func:getProductsBySubcategory: fee1338964a6294e
  func:getProductsEnriched: d722af217df6b114
  func:getSearchSuggestions: c869859ad564f520
  func:searchProducts: 21df141aa66cf1d1
  overview: 92f56a383d3f3250
generated_at: 2026-06-08T10:09:34Z
---

## Genel Bakış
VentHub HVAC projesindeki tüm ürün verilerine erişimi sağlayan merkezi servis modülüdür. Son kullanıcı arayüzleri ve yönetici paneli için ürün listeleme, detay getirme, arama ve filtreleme fonksiyonlarını kapsar. Farklı veri hazırlama ve erişim kalıplarını (zenginleştirilmiş listeler, toplu arama, esnek tanımlayıcı erişimi) destekleyerek veri katmanı için tek bir erişim noktası oluşturur.

## Fonksiyon Grupları
### Tekil Ürün Erişimi
Tek bir ürünün detaylarını, ID, slug veya her ikisiyle de esnek bir şekilde getirir. Temel veri çekme işlemini merkezileştirerek farklı tanımlayıcı türleriyle çalışmayı destekler.
- fetchProductBy, getProductById, getProductBySlug, getProductBySlugOrId

### Toplu Ürün Listeleme ve Kategorik Filtreleme
Ürünleri toplu olarak, belirli kategorilere veya alt kategorilere göre, öne çıkanlar olarak veya zenginleştirilmiş ek bilgilerle birlikte listeler. Farklı kullanım senaryolarına (ana sayfa, kategori sayfaları, özel listeler) uygun veri kümeleri sağlar.
- getProducts, getAllProducts, getProductsByCategory, getProductsBySubcategory, getFeaturedProducts, getProductsEnriched

### Arama ve Öneri İşlevleri
Son kullanıcılar için metin tabanlı arama yapar ve otomatik arama önerileri sunar. Tam metin arama ve daha basit arama sorguları için farklı fonksiyonlar sağlar.
- searchProducts, getSearchSuggestions, ftsSearchProducts

### Yönetici Paneli İşlevleri
Yönetici arayüzleri için gelişmiş ve filtrelenmiş ürün araması sağlar. Sayfalama (limit/offset) ve kategori bazlı filtreleme gibi ek özellikler sunarak büyük veri setlerinde etkin arama yapmayı destekler.
- adminSearchProducts

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase üzerinden ürün verilerine erişim sağlayan bir veri erişim katmanıdır. Aşağıdaki mimari varsayımlar modülün doğru çalışması için zorunludur:

[Aksiyom 1]: Eğer `supabase` parametresi (SupabaseClient<Database>) geçerli bir Supabase istemcisi değilse, tüm fonksiyonlar veritabanı bağlantısı hatası ile karşılaşır.

[Aksiyom 2]: Eğer veritabanında `products` tablosu yoksa, hiçbir ürün sorgusu çalışamaz.

[Aksiyom 3]: Eğer `products` tablosunda `id` sütunu yoksa, `getProductById` fonksiyonu çalışamaz.

[Aksiyom 4]: Eğer `products` tablosunda `slug` sütunu yoksa, `getProductBySlug` ve `getProductBySlugOrId` fonksiyonları çalışamaz.

[Aksiyom 5]: Eğer `slug` sütunu için benzersizlik (unique) kısıtlaması yoksa, `getProductBySlug` birden fazla sonuç döndürebilir veya beklenmeyen davranış oluşur.

[Aksiyom 6]: Eğer `products` tablosunda `category_id` sütunu yoksa, `getProductsByCategory` ve `adminSearchProducts` filtreleme fonksiyonları çalışamaz.

[Aksiyom 7]: Eğer `products` tablosunda `subcategory_id` sütunu yoksa, `getProductsBySubcategory` fonksiyonu çalışamaz.

[Aksiyom 8]: Eğer `categories` veya `subcategories` tabloları ile referans bütünlüğü (foreign key) tanımlı değilse, JOIN tabanlı sorgular (örn. enriched_products) hata verir.

[Aksiyom 9]: Eğer `GetProductsParams` tipi geçerli bir nesne yapısına sahip değilse, `getProductsEnriched` fonksiyonu parametre hatası ile karşılaşır.

[Aksiyom 10]: Eğer `throwOnError` parametresi `true` olarak ayarlandığında ve istenen ürün mevcut değilse, `fetchProductBy` fonksiyonu bir hata fırlatmalıdır; aksi halde调用çı beklenmeyen bir undefined/alınmayan sonuç ile karşılaşır.

[Aksiyom 11]: Eğer `ftsSearchProducts` fonksiyonu çağrıldığında Full-Text Search (FTS) indeksi veritabanında tanımlı değilse, arama sorgusu başarısız olur.

[Aksiyom 12]: Eğer `featured` veya benzeri bir alan (ürünün öne çıkarılmasını belirten) `products` tablosunda tanımlı değilse, `getFeaturedProducts` fonksiyonu boş sonuç döndürür veya hata verir.

[Aksiyom 13]: Eğer `q` parametresi boş string (`""`) olarak verilirse, `getSearchSuggestions`, `ftsSearchProducts`, `searchProducts` ve `adminSearchProducts` fonksiyonları boş sonuç kümesi döndürmelidir; aksi halde beklenmeyen tüm kayıtların dönmesi riski oluşur.

[Aksiyom 14]: Eğer `limit` parametresi 0 veya negatif bir değer olarak verilirse, sorgu beklenmeyen sonuçlar döndürebilir veya Supabase tarafında hata oluşabilir.

[Aksiyom 15]: Eğer `fetchProductBy` fonksiyonuna `column` parametresi olarak `'id'` veya `'slug'` dışı bir değer verilse (tip sistemi bypass edilirse), veritabanı sorgusu hata verir.

[Aksiyom 16]: Eğer `categoryId` parametresi `adminSearchProducts` fonksiy

---

## FONKSİYON DETAYLARI

### getProductsEnriched
**Ne yapar**: Zenginleştirilmiş (enriched) ürün listesini çoklu filtre vearama kriterlerine göre getirir. Ana sayfa, ürün listeleme veyaarama sonuçları için merkezi fonksiyondur.
**Nasıl yapar**: Öncelikle verilen `categoryIds` içindeki slug değerlerini (UUID formatında olmayanları) veritabanından sorgulayarak gerçek ID'lere dönüştürür. Ardından `get_products_enriched` RPC fonksiyonunu çağırarak filtrelenmiş, sıralanmış ve limitlenmiş bir ürün listesi talep eder. RPC çağrısı başarısız olursa, bir hata durumu yönetimi ile doğrudan `products` tablosuna fallback (yedek) sorgulama yapar; bu fallback sorgusu kategori filtresi varsa onu da dikkate alır. Sonuç olarak, veritabanından gelen `DbProduct` nesnelerini `Product` arayüzüne dönüştürerek UI'a uygun hale getirir.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci bağlantısı.
- params: GetProductsParams — Filtreleme, sayfalama vearama parametrelerini içeren nesne. Varsayılan değer `{}`'dir.
**Dönüş**: Promise<Product[]> — Zenginleştirilmiş ve UI formatına dönüştürülmüş ürün listesi.

### getSearchSuggestions
**Ne yapar**: Kullanıcınınarama çubuğuna girdiği kısmi metne (query) göre hızlıarama önerileri sunar.
**Nasıl yapar**: Supabase üzerindeki `get_search_suggestions` RPC fonksiyonunu çağırır. Fonksiyon, verilenarama sorgusu (`q`) ve istenen maksomat sonuç sayısı (`limit`) ile çalıştırılır. RPC çağrısında hata oluşursa boş bir dizi döndürerek arayüzün bozulmasını engeller.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci bağlantısı.
- q: string — Kullanıcının girdiği partialarama metni (ör: "klim").
- limit: number — Döndürülecek maksomat öneri sayısı. Varsayılan olarak 6'dır.
**Dönüş**: Promise<SearchSuggestion[]> — Oluşturulmuşarama önerileri listesi.

### ftsSearchProducts
**Ne yapar**: Tam metin arama (Full-Text Search) kullanarak ürünleri hızlı ve etkili şekilde arar.
**Nasıl yapar**: `fts_search_products` RPC fonksiyonunu çağırarak veritabanı düzeyinde optimize edilmiş bir tam metin araması yapar. Arama sorgusu (`q`), sonuç limiti (`limit`) ve opsiyonel olarak kategori filtresi (`filters.category_id`) gönderilir. RPC çağrısı bir hata ile sonuçlanırsa bu hatayı fırlatır (throw error).
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci bağlantısı.
- q: string — Aranacak anahtar kelimeler veya cümle.
- limit: number — Döndürülecek maksomat sonuç sayısı. Varsayılan olarak 20'dir.
- filters?: { category_id?: string } — Opsiyonel filtre nesnesi. Sağlanırsa sadece belirtilen kategorideki ürünler aranır.
**Dönüş**: Promise<FtsProductResult[]> — Tam metin arama sonuçlarını içeren ürün listesi.

### getProducts
**Ne yapar**: Belirli bir alt kategorideki aktif ürünleri getirir.
**Nasıl yapar**: `products` tablosundan, verilen `subcategory_id` ve `status='active'` koşullarına uyan ürünleri çeker. Sonuçları `is_featured` (azalan) ve `name` (artan) sıralamasıyla sıralar. Hata oluşursa fırlatır. Verileri `DbProduct[]` tipinden `Product[]` UI formatına dönüştürerek döndürür.
**Parametreler**:
- subcategoryId: string — Ürünlerin getirileceği alt kategori ID'si.
- supabase: SupabaseClient — Varsayılan olarak defaultClient kullanılır.
**Dönüş**: Promise<Product[]> — Alt kategorideki aktif ürünlerin listesi.

### getAllProducts
**Ne yapar**: Veritabanındaki tüm aktif (`status='active'`) ürünleri getirir.
**Nasıl yapar**: `products` tablosundan durumu `'active'` olan tüm kayıtları seçer. Sonuçlar önce `is_featured` (öne çıkan) değerine göre azalan, ardından `name`'e göre artan sırada sıralanır. Hata oluşursa hatayı fırlatır.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci bağlantısı.
**Dönüş**: Promise<Product[]> — Tüm aktif ürünlerin listesi.

### getProductsByCategory
**Ne yapar**: Belirli bir kategoriye (`category_id`) ait aktif ürünleri getirir.
**Nasıl yapar**: `products` tablosunda `category_id` veya `subcategory_id` alanının verilen `categoryId` değerine eşit olduğu ve `status`'ün `'active'` olduğu kayıtları filtreler. Bu sayede hem doğrudan kategorideki hem de o kategorinin altındaki alt kategorilerdeki ürünler listelenir. Sonuçlar önce `is_featured`'a göre azalan, ardından `name`'e göre artan sırada sıralanır. Hata oluşursa hatayı fırlatır.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci bağlantısı.
- categoryId: string — Ürünlerin getirileceği kategorinin ID'si.
**Dönüş**: Promise<Product[]> — Belirtilen kategorideki ve alt kategorilerindeki aktif ürünler.

### getProductsBySubcategory
**Ne yapar**: Belirli bir alt kategoriye (`subcategory_id`) ait aktif ürünleri getirir.
**Nasıl yapar**: `products` tablosundan doğrudan sorgulama yapar. Filtreleri: `subcategory_id` eşitliği ve `status`'ün `'active'` olması şeklindedir. Sonuçlar önce `is_featured` (öne çıkan) değerine göre azalan, ardından `name`'e göre artan sırada sıralanır. Hata oluşursa hatayı fırlatır.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci bağlantısı.
- subcategoryId: string — Ürünlerin getirileceği alt kategorinin ID'si.
**Dönüş**: Promise<Product[]> — Belirtilen alt kategorideki aktif ürünler.

### fetchProductBy
**Ne yapar**: Belirli bir sütun (`id` veya `slug`) ve değer eşleşmesine göre tek bir ürünü getirir. Temel getirme fonksiyonudur.
**Nasıl yapar**: `products` tablosunda verilen sütuna (`column`) ve değere (`value`) göre sorgulama yapar. `maybeSingle()` kullanarak tek kayıt döndürür. Hata oluşursa `throwOnError` parametresine göre ya hatayı fırlatır ya da `null` döndürür. Bulunan ham veritabanı nesnesini (`DbProduct`) `Product` arayüzüne dönüştürür.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci bağlantısı.
- column: 'id' | 'slug' — Aramanın yapılacağı sütun adı.
- value: string — Aranacak değer (bir ID veya slug).
- throwOnError: boolean — Hata oluşursa fırlatılıp fırlatılmayacağı. Varsayılan `false`'dur.
**Dönüş**: Promise<Product | null> — Eşleşen ürün varsa `Product` nesnesi, yoksa `null`.

### getProductById
**Ne yapar**: Verilen ID'ye sahip ürünü getirir.
**Nasıl yapar**: `fetchProductBy` fonksiyonunu `'id'` sütunu ve `throwOnError=true` parametreleriyle çağırarak hata yönetimi yapar.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci bağlantısı.
- id: string — Aranan ürünün UUID'si.
**Dönüş**: Promise<Product | null> — Bulunan ürün veya bulunamazsa `null`.

### getProductBySlugOrId
**Ne yapar**: Verilen bir tanımlayıcının (`identifier`) bir UUID (ID) mi yoksa bir slug mı olduğunu algılayarak uygun sorgulamayı yapar.
**Nasıl yapar**: Girilen `identifier` değerinin UUID formatında olup olmadığını bir正则表达式 ile kontrol eder. Eğer UUID formatındaysa `fetchProductBy`'i `'id'` sütunuyla, değilse `'slug'` sütunuyla çağırır. Bu çağrıda `throwOnError` `false` olarak ayarlanmıştır, yani hata durumunda sessizce `null` döner.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci bağlantısı.
- identifier: string — Ürünü temsil eden bir ID (UUID) veya slug.
**Dönüş**: Promise<Product | null> — Eşleşen ürün veya bulunamazsa `null`.

### getProductBySlug
**Ne yapar**: Verilen URL slug'ı ile veritabanından tek bir ürünü getirir.
**Nasıl yapar**: Fonksiyon, `fetchProductBy` yardımcı fonksiyonunu çağırarak `slug` alanına göre ve `false` parametresiyle (muhtemelen aktif olmayan ürünler de dahil) sorgulama yapar.
**Parametreler**:
- `supabase`: SupabaseClient<Database> — Supabase istemcisi örneği, veritabanı bağlantısını ve RPC çağrılarını yönetir.
- `slug`: string — Ürünün benzersiz URL parçası (örnek: "daikin-ftx35a").
**Dönüş**: `Promise<Product | null>` — Bulunan ürün nesnesi veya eşleşme yoksa `null`.

### getFeaturedProducts
**Ne yapar**: Öne çıkan (is_featured=true) ve aktif (status='active') ürünleri, en fazla 6 adet olacak şekilde listeler.
**Nasıl yapar**: Supabase üzerinden `products` tablosunu belirli sütunlar için sorgular, filtreler uygular ve limit koyar. Sonuçları `toUIProductList` fonksiyonuyla arayüz formatına dönüştürür.
**Parametreler**:
- `supabase`: SupabaseClient<Database> — Supabase istemcisi örneği.
**Dönüş**: `Promise<Product[]>` — UI formatına dönüştürülmüş öne çıkan ürün listesi.

### searchProducts
**Ne yapar**: Aktif ürünler arasında (status='active'), verilen arama sorgusuna göre ürün adı, marka, SKU, model kodu veya açıklamada eşleşmeleri arar.
**Nasıl yapar**: Supabase tablo sorgusunda `.or()` filtresi kullanarak bigaçlı (case-insensitive) eşleşme araması yapar ve sonuçları `toUIProductList` fonksiyonuyla dönüştürür.
**Parametreler**:
- `supabase`: SupabaseClient<Database> — Supabase istemcisi örneği.
- `query`: string — Arama terimi.
**Dönüş**: `Promise<Product[]>` — Eşleşen aktif ürünlerin UI formatında listesi.

### adminSearchProducts
**Ne yapar**: Yönetici paneli için gelişmiş ürün araması yapar. Farklı parametrelerle (arama terimi, sayfalama, opsiyonel kategori filtresi) RPC fonksiyonunu çağırarak sonuçları döndürür.
**Nasıl yapar**: Belirtilen parametreleri `admin_search_products` adlı PostgreSQL fonksiyonuna RPC olarak gönderir. Bu fonksiyon sunucu tarafında karmaşık arama mantığını çalıştırır.
**Parametreler**:
- `supabase`: SupabaseClient<Database> — Supabase istemcisi örneği.
- `q`: string — Arama terimi.
- `limit`: number — Sayfa başına sonuç sayısı (varsayılan: 50).
- `offset`: number — Sonuçların kaydırma miktarı, sayfalama için kullanılır (varsayılan: 0).
- `categoryId`: string | undefined — Opsiyonel. Belirli bir kategoriye ait ürünleri filtrelemek için kategori ID'si.
**Dönüş**: `Promise<DbAdminSearchResult[]>` — Veritabanı seviyesinde ham formatlanmış arama sonuçları listesi.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/product.service.ts::getProductsEnriched
- **params**: `(supabase: SupabaseClient<Database>, params: GetProductsParams = {})`
- **ic_degiskenler**:
  - `resolvedCategoryIds` — params.categoryIds değerini tutar; slug ise UUID'ye dönüştürülerek güncellenir
  - `potentialSlugs` — resolvedCategoryIds içinde UUID formatına uymayan elemanları filtreler (slug olarak kabul edilenler)
  - `categories` — supabase'den çekilen kategori verisi (id ve slug alanları)
  - `slugToIdMap` — slug → id eşlemesi yapan Map nesnesi
  - `data` — rpc('get_products_enriched') çağrısının başarı sonucu
  - `error` — rpc çağrısının hata sonucu
  - `fallbackData` — rpc hatası durumunda products tablosundan fallback olarak çekilen veri (iki farklı sorguda kullanılır)
  - `enrichedProducts` — rpc sonucu veriye null değerler eklenmiş (meta_description, meta_title, purchase_price, is_category_manual) nihai ürün listesi
- **Dönüş**: `Promise<Product[]>` — enriched veya fallback ürün listesi; hata durumunda boş/fallback liste döner, exception fırlatmaz

### [N2_NASIL] AST Pointer: src/lib/services/product.service.ts::getSearchSuggestions
- **params**: `(supabase: SupabaseClient<Database>, q: string, limit: number = 6)`
- **ic_degiskenler**:
  - `data` — rpc('get_search_suggestions') çağrısının başarı sonucu
  - `error` — rpc çağrısının hata sonucu
- **Dönüş**: `Promise<SearchSuggestion[]>` — arama önerileri listesi; hata durumunda boş dizi döner

### [N3_NASIL] AST Pointer: src/lib/services/product.service.ts::ftsSearchProducts
- **params**: `(supabase: SupabaseClient<Database>, q: string, limit = 20, filters?: { category_id?: string })`
- **ic_degiskenler**:
  - `payload` — rpc çağrısı için parametre nesnesi (p_q, p_limit, p_filters)
  - `data` — rpc('fts_search_products') çağrısının başarı sonucu
  - `error` — rpc çağrısının hata sonucu
- **Dönüş**: `Promise<FtsProductResult[]>` — full-text search sonuçları; hata durumunda exception fırlatır

### [N4_NASIL] AST Pointer: src/lib/services/product.service.ts::getProducts
- **params**: `(supabase: SupabaseClient<Database>, limit?: number)`
- **ic_degiskenler**:
  - `query` — supabase.from('products').select() ile oluşturulmuş zincir sorgu nesnesi; status='active', is_featured ve name sıralaması içerir; opsiyonel limit eklenir
  - `data` — query'nin execute edilmesi sonucu dönen veri
  - `error` — sorgu hata sonucu
- **Dönüş**: `Promise<Product[]>` — aktif ürünler listesi; hata durumunda exception fırlatır

### [N5_NASIL] AST Pointer: src/lib/services/product.service.ts::getAllProducts
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `data` — products tablosundan status='active' filtresi ile çekilen tüm veriler
  - `error` — sorgu hata sonucu
- **Dönüş**: `Promise<Product[]>` — tüm aktif ürünler; hata durumunda exception fırlatır

### [N6_NASIL] AST Pointer: src/lib/services/product.service.ts::getProductsByCategory
- **params**: `(supabase: SupabaseClient<Database>, categoryId: string)`
- **ic_degiskenler**:
  - `data` — category_id veya subcategory_id eşleşen aktif ürünler
  - `error` — sorgu hata sonucu
- **Dönüş**: `Promise<Product[]>` — belirtilen kategoriye ait ürünler; hata durumunda exception fırlatır

### [N7_NASIL] AST Pointer: src/lib/services/product.service.ts::getProductsBySubcategory
- **params**: `(supabase: SupabaseClient<Database>, subcategoryId: string)`
- **ic_degiskenler**:
  - `data` — subcategory_id eşleşen aktif ürünler
  - `error` — sorgu hata sonucu
- **Dönüş**: `Promise<Product[]>` — belirtilen alt kategoriye ait ürünler; hata durumunda exception fırlatır

### [N8_NASIL] AST Pointer: src/lib/services/product.service.ts::fetchProductBy
- **params**: `(supabase: SupabaseClient<Database>, column: 'id' | 'slug', value: string, throwOnError = false)`
- **ic_degiskenler**:
  - `query` — products tablosunda belirtilen column=value eşleşmesi ile tek kayıt sorgusu; maybeSingle() kullanılır
  - `data` — sorgu sonucu bulunan ürün kaydı
  - `error` — sorgu hata sonucu
- **Dönüş**: `Promise<Product | null>` — bulunan ürün veya null; throwOnError true ise hata durumunda exception fırlatır

### [N9_NASIL] AST Pointer: src/lib/services/product.service.ts::getProductById
- **params**: `(supabase: SupabaseClient<Database>, id: string)`
- **ic_degiskenler**: (yok — doğrudan fetchProductBy çağrısı)
- **Dönüş**: `Promise<Product | null>` — fetchProductBy('id', id, true) çağrısı; hata durumunda exception fırlatır

### [N10_NASIL] AST Pointer: src/lib/services/product.service.ts::getProductBySlugOrId
- **params**: `(supabase: SupabaseClient<Database>, identifier: string)`
- **ic_degiskenler**:
  - `isUuid` — identifier'ın UUID formatında olup olmadığını test eden regex eşleşme sonucu (boolean)
- **Dönüş**: `Promise<Product | null>` — identifier UUID ise id ile, değilse slug ile fetchProductBy çağrısı; hata durumunda null döner

### [N11_NASIL] AST Pointer: src/lib/services/product.service.ts::getProductBySlug
- **params**: `(supabase: SupabaseClient<Database>, slug: string)`
- **ic_degiskenler**: (yok — doğrudan fetchProductBy çağrısı)
- **Dönüş**: `Promise<Product | null>` — fetchProductBy('slug', slug, false) çağrısı; hata durumunda null döner

### [N12_NASIL] AST Pointer: src/lib/services/product.service.ts::getFeaturedProducts
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `data` — is_featured=true ve status='active' filtreli, limit 6 ürünler
  - `error` — sorgu hata sonucu
- **Dönüş**: `Promise<Product[]>` — öne çıkan ürünler (maksimum 6); hata durumunda exception fırlatır

### [N13_NASIL] AST Pointer: src/lib/services/product.service.ts::searchProducts
- **params**: `(supabase: SupabaseClient<Database>, query: string)`
- **ic_degiskenler**:
  - `data` — products tablosunda name, brand, sku, model_code, description alanlarında ilike ile arama yapılan aktif ürünler
  - `error` — sorgu hata sonucu
- **Dönüş**: `Promise<Product[]>` — arama sonuçları (maksimum 20); hata durumunda exception fırlatır

### [N14_NASIL] AST Pointer: src/lib/services/product.service.ts::adminSearchProducts
- **params**: `(supabase: SupabaseClient<Database>, q: string, limit = 50, offset = 0, categoryId?: string)`
- **ic_degiskenler**:
  - `payload` — rpc çağrısı için parametre nesnesi; p_q, p_limit, p_offset içerir; opsiyonel p_category_id eklenir
  - `data` — rpc('admin_search_products') çağrısının başarı sonucu
  - `error` — rpc çağrısının hata sonucu
- **Dönüş**: `Promise<DbAdminSearchResult[]>` — admin arama sonuçları; hata durumunda exception fırlatır

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    product_service_ts__adminSearchProducts["adminSearchProducts"]
    product_service_ts__fetchProductBy["fetchProductBy"]
    product_service_ts__ftsSearchProducts["ftsSearchProducts"]
    product_service_ts__getAllProducts["getAllProducts"]
    product_service_ts__getFeaturedProducts["getFeaturedProducts"]
    product_service_ts__getProductById["getProductById"]
    product_service_ts__getProductBySlug["getProductBySlug"]
    product_service_ts__getProductBySlugOrId["getProductBySlugOrId"]
    product_service_ts__getProducts["getProducts"]
    product_service_ts__getProductsByCategory["getProductsByCategory"]
    product_service_ts__getProductsBySubcategory["getProductsBySubcategory"]
    product_service_ts__getProductsEnriched["getProductsEnriched"]
    product_service_ts__getSearchSuggestions["getSearchSuggestions"]
    product_service_ts__searchProducts["searchProducts"]
    product_service_ts__getProductBySlugOrId --> product_service_ts__fetchProductBy
    product_service_ts__getProductById --> product_service_ts__fetchProductBy
    product_service_ts__getProductBySlug --> product_service_ts__fetchProductBy
```

## NODE ID STANDARD

  file: src\lib\services\product.service.ts
  function: src\lib\services\product.service.ts::getProductsEnriched
  function: src\lib\services\product.service.ts::getSearchSuggestions
  function: src\lib\services\product.service.ts::ftsSearchProducts
  function: src\lib\services\product.service.ts::getProducts
  function: src\lib\services\product.service.ts::getAllProducts
  function: src\lib\services\product.service.ts::getProductsByCategory
  function: src\lib\services\product.service.ts::getProductsBySubcategory
  function: src\lib\services\product.service.ts::fetchProductBy
  function: src\lib\services\product.service.ts::getProductById
  function: src\lib\services\product.service.ts::getProductBySlugOrId
  function: src\lib\services\product.service.ts::getProductBySlug
  function: src\lib\services\product.service.ts::getFeaturedProducts
  function: src\lib\services\product.service.ts::searchProducts
  function: src\lib\services\product.service.ts::adminSearchProducts

---

## DISA AKTARILANLAR (EXPORTS)
  export: adminSearchProducts
  export: fetchProductBy
  export: ftsSearchProducts
  export: getAllProducts
  export: getFeaturedProducts
  export: getProductById
  export: getProductBySlug
  export: getProductBySlugOrId
  export: getProducts
  export: getProductsByCategory
  export: getProductsBySubcategory
  export: getProductsEnriched
  export: getSearchSuggestions
  export: searchProducts