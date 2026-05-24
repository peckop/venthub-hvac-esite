---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\HomePage.tsx
skeleton_hash: 70b0198d89a0a975
generated_at: 2026-05-23T22:40:51Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ana sayfa görünümünü oluşturan React bileşenini barındırır. Ana sayfa için gerekli kategori ve ürün verileri ile bağımlılık enjeksiyonu nesnesini giriş olarak alır, kullanıcıların platformdaki içerikleri keşfedebildiği ana arayüzü kullanıma sunar. Modül tamamen ana sayfa görünümünün oluşturulması sorumluluğuna odaklanmıştır.

## Fonksiyon Grupları
### Ana Sayfa Temel Bileşeni
Modülün tek giriş noktası olarak çalışan bu grup, ana sayfa arayüzünün tüm render ve temel yapılandırma işlemlerini yerine getirir. Gelen önceden yüklenmiş kategori ve ürün verilerini kullanarak sayfanın sorunsuz çalışmasını sağlar.
- HomePage

---

## AXIOMS – Mimari Varsayımlar
HomePage ana sayfa bileşeninin sorunsuz çalışması ve tüm görüntüleme/işleme özelliklerini devreye alması için giriş prop'larının ve bağımlılık enjeksiyonu nesnesinin tanımlı, uygun formatta olması zorunludur.

[Aksiyom 1]: Eğer di bağımlılık enjeksiyonu nesnesi yoksa ya da bileşenin ihtiyaç duyduğu servisleri barındırmıyorsa, HomePage tüm veri işleme ve sayfa yükleme süreçlerini çalıştıramaz, kullanıcıya boş veya hata içeren bir sayfa gösterilir.
[Aksiyom 2]: Eğer initialCategories prop'u dizi formatında değilse, varsayılan kategori listesi doğru şekilde işlenemez, kullanıcıya kategoriler gösterilemez.
[Aksiyom 3]: Eğer rawCategories prop'u dizi formatında değilse, işlenmemiş kategori verileri dönüştürülemez, kategori filtreleme, sıralama gibi ek özellikler devre dışı kalır.
[Aksiyom 4]: Eğer initialProducts prop'u dizi formatında değilse, ana sayfada gösterilecek ürünler listesi oluşturulamaz, ana ürün galerisi boş kalır.

---

## FONKSIYON DETAYLARI

### HomePage
**Ne yapar**: VentHub HVAC projesinin ana giriş sayfası olarak görev yapan bir React fonksiyonel bileşenidir. Kendiisine aktarılan kategori ve ürün verilerini kullanarak ana sayfa arayüzünü oluşturur, sayfanın ihtiyaç duyduğu tüm veri ve bağımlılık entegrasyonunu yönetir. Uygulama içindeki ana rota üzerinden çağrıldığında kullanıcıya ilk karşılaşılan arayüzü sunar.
**Nasıl yapar**: Varsayılan olarak boş dizi atanmış kategori ve ürün verileri ile bağımlılık nesnesini prop olarak alır. Aldığı tüm verileri ana sayfa bileşeni içinde kullanılan alt bileşenlere ileterek dinamik içerik oluşturulmasını sağlar. Hiçbir başlangıç verisi gelmediğinde dahi varsayılan değerleri sayesinde hata vermeden çalışacak şekilde yapılandırılmıştır.
**Parametreler**:
- initialCategories: array — Varsayılan değeri boş dizi olan, ana sayfada ilk yükleme anında gösterilecek hazırlanmış kategori listesini taşıyan parametre, sayfanın içeriklerinin temel verilerinden birini sağlar
- rawCategories: array — Varsayılan değeri boş dizi olan, herhangi bir işlemden geçmemiş ham kategori kayıtlarını taşıyan parametre, bileşen içindeki veri işleme süreçlerinde kullanılmak üzere ham veriyi iletir
- initialProducts: array — Varsayılan değeri boş dizi olan, ana sayfada ilk yükleme sırasında gösterilecek başlangıç ürün listesini taşıyan parametre, sayfanın ürün gösterim akışı için temel girdi verisini sunar
- di: any — Bileşenin ihtiyaç duyduğu tüm harici servisleri, yardımcı fonksiyonları ve bağımlılıkları içeren bağımlılık enjeksiyonu nesnesi, bileşenin test edilebilirliğini ve bağımsızlığını artırmak için kullanılır
**Dönüş**: React.FC<HomePageProps> — Proje içerisinde tanımlanmış HomePageProps tipinde prop'ları kabul eden bir React fonksiyonel bileşeni döndürür. Bu dönüş değeri, ana sayfa arayüzünün uygulamanın yönlendirme sistemi ve React çalışma mantığı ile uyumlu olarak kullanılmasını sağlar.

---

## INTERFACES

### HomePageProps
- `initialCategories?: CategoryViewModelLite[]`
- `rawCategories?: DomainCategory[]`
- `initialProducts?: Product[]`
- `dictionary: typeof import('../i18n/dictionaries/tr').tr.home`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\HomePage.tsx::HomePage
- **params**: initialCategories (varsayılan boş dizi), rawCategories (varsayılan boş dizi), initialProducts (varsayılan boş dizi), dictionary (tüm metin/çeviri verilerini içeren sözlük objesi)
- **ic_degiskenler**:
  - `ScrollObserver` — sayfa kaydırma olaylarını izleyen temel bileşen
  - `HomePageClientWrapper` — ana sayfanın istemci taraflı işlemlerini yöneten sarmalayıcı bileşen
  - `HomeSinevizyon` — ana sayfanın açılış görselleştirme bileşeni
  - `GuidedCategoryDiscovery` — kategoriler arası gezinmeyi sağlayan bileşen, prop olarak fonksiyonun `initialCategories` parametresini alır
  - `RevealSection` — içeriği görünür olduğunda animasyonla ortaya çıkaran sarmalayıcı bileşen
  - `CinematicProductShowcase` — ürünleri sinematik bir şekilde sunan bileşen
  - `dictionary.applicationSolutions` — ApplicationSolutions bileşenine iletilen metin sözlüğü, ana sözlükten erişilen alt bölüm
  - `dictionary.trustProof` — TrustProofSection bileşenine iletilen güven kanıtları metin sözlüğü
  - `dictionary.hero.trustStrip` — TrustProofSection bileşenine iletilen güven şeridi metin sözlüğü
  - `FeaturedCommercialBlocks` — öne çıkan ticari ürün bloklarını gösteren bileşen, prop olarak fonksiyonun `initialProducts` ve `rawCategories` parametrelerini alır
  - `dictionary.strategicBrands` — StrategicBrands bileşenine iletilen stratejik markalar metin sözlüğü
  - `dictionary.knowledge` — KnowledgeBlock bileşenine iletilen bilgi bloğu metin sözlüğü
  - `dictionary.finalCta` — KnowledgeBlock bileşenine iletilen son çağrı metinleri sözlüğü
  - `dictionary.stats?.yearsExperience` — KnowledgeBlock bileşenine iletilen yıllık deneyim istatistiği, opsiyonel erişimle ana sözlükten alınır
- **Dönüş**: React.ReactElement, ana sayfanın tüm bölümlerini içeren tam arayüz JSX elementi

---

## NODE ID STANDARD

  file: src\views\HomePage.tsx
  function: src\views\HomePage.tsx::HomePage

---

## DISA AKTARILANLAR (EXPORTS)
  export: HomePage