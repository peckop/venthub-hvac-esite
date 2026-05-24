---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\KVKKPage.tsx
skeleton_hash: 1c341980847d22bc
generated_at: 2026-05-23T22:41:15Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yasal içerikler bölümünde yer alan KVKK (Kişisel Verilerin Korunması Kanunu) sayfasını oluşturan bir React bileşeni barındırır. Uygulama içi yönlendirme ile erişilen bu sayfa, kullanıcılara platformun kişisel verileri işleme süreçlerine ilişkin resmi yasal açıklamaları sunmak üzere tasarlanmıştır. Sadece temel sayfa yapısını içeren modül, statik yasal içeriği kullanıcı arayüzüne entegre etmekten sorumludur.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ana işlevi olarak KVKK sayfasının arayüzünü oluşturur, ilgili rota üzerinden erişildiğinde kullanıcılara yasal içeriği sunmak üzere yapılandırılmıştır.
- KVKKPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı view modülü, KVKK hukuki metinlerini son kullanıcılara sunmak üzere tasarlanmıştır; çalışması için ana uygulamanın React çalışma zamanı, yönlendirme altyapısı ve ortak UI bileşenlerinin erişilebilirliği zorunludur.

[Aksiyom 1]: Eğer ana uygulama tarafından sağlanan temel React çalışma zamanı ortamı yoksa, KVKKPage bileşeni hiçbir şekilde render edilemez, kullanıcı sayfaya erişemez.
[Aksiyom 2]: Eğer uygulama içi yönlendirme (routing) altyapısında bu bileşen için tanımlanmış erişim rotası yoksa, kullanıcı bu hukuki sayfaya doğrudan veya uygulama içi gezinme menüleri üzerinden erişemez.
[Aksiyom 3]: Eğer KVKKPage bileşeninin içeriğinde kullanması gereken KVKK ile ilgili hukuki metinleri barındıran statik/dinamik içerik kaynakları yoksa, sayfada eksik veya boş hukuki metinler gösterilir, 6698 sayılı KVKK kanunu gereği yasal yükümlülüklere uyumsuzluk oluşur.
[Aksiyom 4]: Eğer uygulama tarafından kullanılan ortak UI bileşeni altyapısı KVKKPage tarafından erişilebilir değilse, sayfa stilsiz veya parçalanmış arayüzle render edilir, hukuki metinlerin okunabilirliği tamamen kaybolur.

---

## FONKSIYON DETAYLARI

### KVKKPage
**Ne yapar**: VentHub HVAC projesinin yasal sayfalar grubu altında yer alan, KVKK (Kişisel Verilerin Korunması Kanunu) mevzuatına uygun kullanıcı bilgilendirme içeriklerini platform ziyaretçilerine sunan ana React bileşenidir. Projenin genel domainindeki yasal dokümanlar kategorisinde hizmet veren bu sayfa, platformun kişisel veri işleme süreçleri hakkında kullanıcıları aydınlatma temel görevini yerine getirir.
**Nasıl yapar**: React tabanlı proje mimarisinde fonksiyonel bileşen olarak tanımlanmış, proje kaynak kodlarının `src/views/legal` dizininde konumlanarak projenin rota yapısı üzerinden kullanıcı erişimine açılan bir sayfa bileşeni olarak çalışır. Hiçbir harici parametre almadan kendi bünyesinde tanımlı KVKK ile ilgili içerikleri ekrana render etmek üzere yapılandırılmıştır.
**Parametreler**:
Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: React.FC tipinde, React ekosistemiyle tam uyumlu çalışan bir fonksiyonel bileşen döndürür. Döndürülen bu bileşen, KVKK ile ilgili tüm yasal metinleri, bilgilendirme başlıklarını ve sayfa arayüz elemanlarını tarayıcıda kullanıcıya görüntülemek üzere tasarlanmıştır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\legal\KVKKPage.tsx::KVKKPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `React` — JSX elementlerini oluşturmak için kullanılan temel React kütüphanesi
  - `Link` — Next.js'den alınan istemci tarafı yönlendirme için kullanılan bağlantı bileşeni, Çerez Politikası sayfasına yönlendirmede kullanılır
  - `legalConfig` — Hukuki sayfalarda kullanılacak firma bilgileri, saklama süreleri ve iletişim verilerini içeren konfigürasyon nesnesi
    - `legalConfig.sellerTitle` — KVKK metninde veri sorumlusu olarak belirtilen şirket unvanı
    - `legalConfig.sellerAddress` — Şirketin fiziksel adresi, hem iletişim bilgilerinde hem de başvuru adresi olarak kullanılır
    - `legalConfig.sellerEmail` — Şirketin genel iletişim e-posta adresi
    - `legalConfig.sellerPhone` — Şirketin iletişim telefon numarası
    - `legalConfig.taxOffice` — Şirketin bağlı olduğu vergi dairesi ismi
    - `legalConfig.taxNumber` — Şirketin vergi numarası
    - `legalConfig.mersis` — Şirketin MERSİS numarası
    - `legalConfig.retentionOrders` — Sipariş ve faturalandırma kayıtlarının saklanma süresi
    - `legalConfig.retentionSupport` — Müşteri destek yazışmalarının saklanma süresi
    - `legalConfig.retentionMarketing` — Pazarlama izin ve kayıtlarının saklanma süresi
    - `legalConfig.retentionLogs` — Log ve güvenlik kayıtlarının saklanma süresi
    - `legalConfig.applicationEmail` — KVKK kapsamında ilgili kişilerin başvurularını iletebileceği özel e-posta adresi
    - `legalConfig.lastUpdated` — KVKK aydınlatma metninin son güncellenme tarihi
  - `Routes` — Uygulama içi rotaların tanımlandığı utility nesnesi
    - `Routes.legal.cerez()` — Çerez Politikası sayfasının rotasını döndüren fonksiyon, Link bileşeninin hedef adresi olarak kullanılır
- **Dönüş**: KVKK Aydınlatma Metni sayfasının tüm içeriğini içeren React JSX elementi

---

## NODE ID STANDARD

  file: src\views\legal\KVKKPage.tsx
  function: src\views\legal\KVKKPage.tsx::KVKKPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: KVKKPage