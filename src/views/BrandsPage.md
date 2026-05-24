---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx
skeleton_hash: 43e21e1befc50fa8
generated_at: 2026-05-23T22:38:56Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin kullanıcı arayüzü katmanında yer alan markalar sayfasını oluşturan React bileşenini barındırmaktadır. Platformda listelenen tüm HVAC markalarını son kullanıcılara sunan bu sayfa, projenin görünürlük katmanındaki ana gezinme rotalarından birini oluşturur.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün temel sorumluluğu olan markalar sayfasını tüm yapısıyla hayata geçiren tek ana React bileşenini barındırır.
- BrandsPage

---

## AXIOMS – Mimari Varsayımlar
Venthub HVAC projesinin marka listeleme görünümü olan bu React bileşeni modülünün doğru çalışması, ana uygulamanın yönlendirme, derleme, veri sağlama ve yetkilendirme altyapılarının eksiksiz çalışmasına bağlıdır.

[Aksiyom 1]: Eğer ana uygulama yönlendirme (routing) mekanizmasında BrandsPage için tanımlı rota yoksa, kullanıcılar bu marka listeleme sayfasına hiçbir şekilde erişemez, sayfa hiç görüntülenmez.
[Aksiyom 2]: Eğer modülün marka verilerini çekeceği backend API hizmetine ağ veya sunucu tarafında erişilemiyorsa, sayfada hiçbir marka kaydı listelenmez, kullanıcıya boş bir arayüz veya çalışma zamanı hatası gösterilir.
[Aksiyom 3]: Eğer modülün import ettiği proje içi ortak UI bileşenleri (navigasyon, yükleme göstergesi, kart vb.) derleme zamanında erişilemez veya hatalıysa, modül derlenemez, uygulama paketleme süreci başarısız olur veya tarayıcıda çalışma zamanında hata fırlatır.
[Aksiyom 4]: Eğer modülün çalıştığı React çalışma zamanı ortamı, bu bileşenin çalışması için gerekli temel React özelliklerini desteklemiyorsa, BrandsPage bileşeni tarayıcıda doğru şekilde monte edilemez, kullanıcıya boş veya hatalı bir arayüz sunulur.
[Aksiyom 5]: Eğer uygulamadaki genel yetkilendirme sağlayıcısı (Auth Provider) bu BrandsPage'i kapsamıyorsa, modül kullanıcı erişim haklarını kontrol edemez, ya yetkisiz kullanıcılar marka listesine erişebilir ya da yetkili kullanıcılar dahi sayfaya erişememektedir.

---

## FONKSIYON DETAYLARI

### BrandsPage
**Ne yapar**: Venthub HVAC projesinin "Markalar" olarak adlandırılan premium markalar sayfasını oluşturan ana React bileşenidir. Platformdaki tüm HVAC markalarını kullanıcılara sunan bu sayfa bileşeni, modern kullanıcı deneyimi standartlarına uygun şekilde tasarlanmıştır.
**Nasıl yapar**: Uluslararasılaştırma (i18n), erişilebilirlik (A11y) ve performans odaklı iyileştirmelerle modernize edilmiş şekilde çalışır. React'in fonksiyonel bileşen yapısı üzerine inşa edilen bileşen, sayfanın tüm görünüm ve işlevselliğini standartlara uygun olarak yönetir.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: React.FC türünde, markalar sayfasının tüm içerik, görünüm ve işlevselliğini barındıran bir React fonksiyonel bileşeni döndürür. Bu döndürülen bileşen, projenin ilgili rotasında çağrılarak tarayıcıda kullanıcıya sunulmak üzere render edilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx::BrandsPage
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, tüm sayfa metinlerini lokalize etmek için kullanılır
  - `brands` — import edilen HVAC_BRANDS sabitinden atanan marka listesi, grid'de tüm markaları listelemek için kullanılır
  - `heroBadgeRef` — useScrollAnimation tarafından döndürülen, hero bölümündeki rozet div'ine atanan DOM referansı, scroll ile animasyon tetiklemek için kullanılır
  - `heroBadgeVisible` — useScrollAnimation tarafından döndürülen boolean state, hero rozetinin görünür olup olmadığını belirtir, animasyon sınıfı oluşturmak için kullanılır
  - `brandsGridRef` — useScrollAnimation tarafından döndürülen, markalar grid'i div'ine atanan DOM referansı, scroll ile grid animasyonunu tetiklemek için kullanılır
  - `brandsGridVisible` — useScrollAnimation tarafından döndürülen boolean state, markalar grid'inin görünür olup olmadığını belirtir, tüm kart animasyonları için kullanılır
- **Dönüş**: Tam markalar sayfası içeren JSX React elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx::(word, i) => h1 başlığı map callback'i
- **params**: word, i
- **ic_degiskenler**: 
  - `word` — ana başlık metnini oluşturan tek kelime, 3. kelimeye özel stil vermek için kontrol edilir
  - `i` — map fonksiyonundaki kelime indeksi, React fragment için benzersiz key olarak kullanılır ve 3. indeks özel stil uygulamak için kontrol edilir
- **Dönüş**: 3. kelimeyi kalın ve italik olarak biçimlendirilmiş React Fragment elementi, h1 başlığının parçasını oluşturur

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx::(brand, index) => brands grid map callback'i
- **params**: brand, index
- **ic_degiskenler**: 
  - `brand` — grid'de işlenen tek marka nesnesi, tüm marka özelliklerine erişmek için kullanılır
  - `index` — map fonksiyonundaki marka sırası indeksi, scroll animasyonunda sıralı gecikme (stagger) vermek için kullanılır
  - `brand.slug` — markanın URL dostu benzersiz kimliği, Link bileşeninin hedef adresinde ve ana div'in key değeri olarak kullanılır
  - `brand.name` — markanın genel görünen adı, kart başlığında ve BrandIcon ikon bileşeninde kullanılır
  - `brand.country` — markanın menşei ülkesi, kartın sağ üstünde küçük metin olarak gösterilir
  - `brand.specialty` — markanın uzmanlık alanı, kart ortasında vurgulu renkte gösterilir
  - `brand.description` — marka hakkında kısa açıklama metni, kartın alt kısmında 3 satırla sınırlı olarak gösterilir
- **Dönüş**: Tüm marka bilgilerini içeren, tıklanınca marka detay sayfasına yönlendiren grid kartı JSX elementi

---

## NODE ID STANDARD

  file: src\views\BrandsPage.tsx
  function: src\views\BrandsPage.tsx::BrandsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: BrandsPage