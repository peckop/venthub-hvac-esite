---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx
skeleton_hash: f49acc31b2df272a
generated_at: 2026-05-23T22:39:09Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda kullanılan marka detay sayfasını oluşturan React bileşenini barındırır. Props üzerinden iletilen marka kısaltmasını (slug) alarak ilgili markanın tüm bilgilerini kullanıcılara sunmak üzere tasarlanmıştır. Platform içindeki diğer sayfa bileşenleriyle entegre çalışarak marka özel içeriklerin görüntülenmesini sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek sorumluluğunu üstlenen ana fonksiyon, gelen marka slug parametresini işleyerek marka detay sayfasının tüm görünüm ve işlevselliğini yönetir.
- BrandDetailPage

---

## AXIOMS – Mimari Varsayımlar
Bu marka detay görüntüleme sayfası modülünün doğru çalışması için dışarıdan sağlanan girdi prop'u ve dahili sabit nesnesinin eksiksiz, erişilebilir ve geçerli olmasına dayanan aksiyomlar aşağıda listelenmiştir.

[Aksiyom 1]: Eğer bileşene `initialBrandSlug` prop'u, `BRAND_DETAILS` nesnesinde tanımlı geçerli bir marka slug değeri olarak sağlanmazsa, ilgili markanın detay verisi çekilemez ve sayfa hatalı veya boş şekilde render edilir.
[Aksiyom 2]: Eğer modülün eriştiği `BRAND_DETAILS` sabit nesnesi modül tarafından erişilebilir durumda değilse, veya nesne marka slug'larını anahtar olarak barındıracak yapıda değilse, hiçbir marka detay verisi yüklenemez ve kullanıcıya hiçbir içerik gösterilemez.

---

## FONKSIYON DETAYLARI

### BrandDetailPage
**Ne yapar**: VentHub HVAC platformunun marka detay görüntüleme sayfasını oluşturan ana React bileşenidir. Belirli bir markanın tüm özelliklerinin, ürünlerinin ve platformdaki ilgili içeriklerinin kullanıcıya sunulduğu sayfanın temel giriş noktası olarak görev alır. Sadece ilgili markanın sayfasının oluşturulmasını sağlamakla kalmaz, sayfa boyunca kullanılacak marka tanımlayıcısının tüm alt bileşenlere iletilmesini de sağlayan temel yapıdır.
**Nasıl yapar**: React ekosistemine uygun olarak fonksiyonel bileşen (FC) olarak tanımlanmıştır, aldığı başlangıç marka slug değeri ile hangi markanın detaylarının yükleneceğini belirler. Props yapısını BrandDetailPageProps tip tanımı ile doğrulayarak tür güvenliği sağlar, proje içindeki diğer alt bileşenlerle entegre çalışarak tam bir marka detay deneyimi sunar.
**Parametreler**:
- name: initialBrandSlug — type: string — Üst rota bileşeni veya üst katman bileşenleri tarafından iletilen, detayları görüntülenecek markanın benzersiz kısa adresi (slug) değeridir. Sayfanın yükleyeceği markayı tanımlayan tek zorunlu parametredir.
**Dönüş**: React.FC<BrandDetailPageProps> türünde render edilmeye hazır bir React fonksiyonel bileşeni döndürür. Döndürülen bu bileşen, marka detay sayfasının tüm kullanıcı arayüzü öğelerini, veri yükleme işlevlerini ve kullanıcı etkileşimlerini barındırır.

---

## INTERFACES

### BrandDetailPageProps
- `initialBrandSlug?: string`

---

## SABİTLER
- **BRAND_DETAILS** (object) — `{
  vortice: {
    founded: 1954,
    headquarters: 'Tribiano, İtalya',
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx::BrandDetailPage
- **params**: [initialBrandSlug]
- **ic_degiskenler**:
  - `t` — i18n çeviri fonksiyonu, tüm çeviri metinlerini almak için kullanılır
  - `params` — Next.js useParams ile alınan route parametreleri, URL'den slug değerini çekmek için kullanılır
  - `slug` — Birleştirilmiş marka kimliği, initialBrandSlug veya params.slug'dan gelir, marka eşleştirmesi için kullanılır
  - `heroIconRef` — Scroll animasyonu için ana sayfadaki marka ikonu div'ine atanan ref
  - `heroIconVisible` — Marka ikonunun görünürlük durumu, scroll animasyonunu tetiklemek için kullanılır
  - `heroTitleRef` — Scroll animasyonu için ana başlık h1 elementine atanan ref
  - `heroTitleVisible` — Ana başlığın görünürlük durumu, scroll animasyonunu tetiklemek için kullanılır
  - `heroMetaRef` — Scroll animasyonu için menşe/kuruluş/uzmanlık bilgilerini içeren div'e atanan ref
  - `heroMetaVisible` — Meta bilgisinin görünürlük durumu, scroll animasyonunu tetiklemek için kullanılır
  - `brand` — HVAC_BRANDS listesinden slug ile eşleşen marka nesnesi, tüm sayfa içeriğini oluşturmak için kullanılır
  - `detail` — BRAND_DETAILS nesnesinden markaya ait özel detaylar, hikaye ve istatistikler için kullanılır
  - `products` - Markaya ait ürünleri saklayan state dizisi
  - `setProducts` — Ürün listesi state'ini güncelleyen setState fonksiyonu
  - `loading` — Ürün yükleme durumunu saklayan state, yüklenme animasyonunu göstermek için kullanılır
  - `setLoading` — Yükleme durumu state'ini güncelleyen setState fonksiyonu
  - `breadcrumbItems` — Ekmek kırıntısı navigasyonunun öğelerini içeren dizi, Breadcrumb bileşenine aktarılır
- **Dönüş**: JSX (React DOM elementi, marka detay sayfası arayüzü)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx::loadProducts (useEffect içi)
- **params**: (yok)
- **ic_degiskenler**:
  - `brand` — Ebeveyn kapsamdan alınan marka nesnesi, ürünleri marka adına göre filtrelemek için kullanılır
  - `setLoading` — Yükleme durumunu güncelleyen setState fonksiyonu
  - `getProductsEnriched` — Supabase'den zenginleştirilmiş ürün verilerini getiren API fonksiyonu
  - `data` — API'den dönen ürün listesi, state'e aktarılmak için saklanır
  - `setProducts` — Ürün listesi state'ini güncelleyen setState fonksiyonu
  - `e` — API çağrısı sırasında yakalanan hata nesnesi
  - `console.error` — Tarayıcı konsoluna hata yazdıran yerleşik fonksiyon
- **Dönüş**: void (async fonksiyon, sadece yan etki oluşturur, değer döndürmez)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx::loadProducts (bağımsız)
- **params**: (yok)
- **ic_degiskenler**:
  - `brand` — Kapsamdan alınan marka nesnesi, ürün filtreleme için kullanılır
  - `setLoading` — Yükleme durumunu güncelleyen setState fonksiyonu
  - `getProductsEnriched` — Ürün verilerini getiren API fonksiyonu
  - `data` — API'den dönen ürün listesi
  - `setProducts` — Ürün listesi state'ini güncelleyen fonksiyon
  - `e` — Yakalanan hata nesnesi
  - `console.error` — Hata konsoluna yazdıran yerleşik fonksiyon
- **Dönüş**: void

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx::statMapCallback
- **params**: [stat, i]
- **ic_degiskenler**:
  - `stat` - Map edilen istatistik nesnesi
  - `i` — İstatistiğin dizi içindeki indeksi, React anahtarı olarak kullanılır
  - `stat.label` — İstatistik etiket metni, ekranda gösterilir
  - `stat.value` — İstatistik değer metni, ekranda gösterilir
- **Dönüş**: JSX div elementi (kurumsal özet bölümündeki istatistik satırı arayüzü)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx::productMapCallback
- **params**: [product]
- **ic_degiskenler**:
  - `product` — Map edilen ürün nesnesi
  - `product.id` — Ürün benzersiz kimliği, React anahtarı olarak kullanılır
  - `product.slug` — Ürün URL slug'ı, ürün detay sayfası bağlantısı için kullanılır
  - `product.name` — Ürün adı, ürün kartında gösterilir
  - `product.image_url` — Ürün görseli adresi, VentImage bileşenine aktarılır
  - `product.sku` — Ürün stok kodu, ürün kartında gösterilir
  - `t` — i18n çeviri fonksiyonu, ürün kartı aria-label metni için kullanılır
- **Dönüş**: JSX Link bileşeni (ürün kartı arayüzü)

---

## NODE ID STANDARD

  file: src\views\BrandDetailPage.tsx
  function: src\views\BrandDetailPage.tsx::BrandDetailPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: BrandDetailPage
  export: BrandDetailPageProps