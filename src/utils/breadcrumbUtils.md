---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\utils\breadcrumbUtils.ts
skeleton_hash: 6026df992f74657c
entity_hashes:
  func:buildCategoryBreadcrumb: 57eb6d8f024616e4
  overview: abeb057cc67ee6d6
generated_at: 2026-08-27T13:26:32Z
---

## Genel Bakış
Bu yardımcı modül, kullanıcı arayüzünde kullanılan ekmek kırıntısı (breadcrumb) gezinme bileşenlerinin verisini üretmekle sorumludur. Kategori hiyerarşisinden yola çıkarak standartlaştırılmış bir gezinme öğeleri dizisi oluşturur ve uygulama içi gezinme deneyimini destekler.

## Fonksiyon Grupları

### Kategori Tabanlı Ekmek Kırıntısı Üretimi
Verilen kategori, isteğe bağlı üst kategori, anasayfa etiketi ve dil bilgisini birleştirerek arayüz tarafından doğrudan kullanılabilecek bir ekmek kırıntısı öğeleri listesi üretir. Girdi olarak null veya undefined değerler alabilir; bu durumda üretim buna göre şekillenir.
- buildCategoryBreadcrumb

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imzadan çıkarılabilecek varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `homeLabel` parametresi sağlanmazsa, fonksiyonun nasıl bir değer kullanacağı bilinmiyor; bu durumda üretilen `BreadcrumbItem[]` dizisinin ilk elemanının içeriği belirsiz olur.

[Aksiyom 2]: Eğer `lang` parametresi sağlanmazsa, fonksiyonun dil bazlı bir işlem yapıp yapmadığı bilinmiyor; bu durumda üretilen ekmek kırıntısı öğelerinin dilsel içeriği belirsiz olur.

[Aksiyom 3]: Eğer `category` parametresi `null` veya `undefined` ise, fonksiyonun boş bir dizi mi döndürdüğü yoksa hata mı fırlattığı bilinmiyor.

[Aksiyom 4]: Eğer `parentCategory` parametresi verilmezse veya `null` ise, fonksiyonun üst kategori olmadan tek seviyeli bir ekmek kırıntısı mı ürettiği bilinmiyor.

[Aksiyom 5]: `DomainCategory` tipinin hangi alanları içerdiği bu imzadan belirlenememektedir; fonksiyonun bu tipten hangi özellikleri okuduğu bilinmiyor.

---

## FONKSİYON DETAYLARI

### buildCategoryBreadcrumb
**Ne yapar**: Kategori sayfaları için breadcrumb (sayfa yolu) öğeleri listesi oluşturur. Ana sayfadan başlayarak varsa üst kategori ve mevcut kategori olmak üzere hiyerarşik bir navigasyon yapısı üretir.

**Nasıl yapar**: Fonksiyon öncelikle ana sayfa öğesini içeren bir dizi başlatır. Ardından `parentCategory` parametresi tanımlıysa, bu üst kategorinin görünen adını ve aktif dile göre yerelleştirilmiş slug'ını kullanarak bir href içeren öğe ekler. Son olarak `category` parametresi tanımlıysa, bu kategorinin görünen adıyla birlikte `href` değeri `undefined` olan bir öğe ekler; çünkü breadcrumb'daki son öğe tıklanabilir olmamalıdır. Fonksiyon, `getCategoryDisplayName` ve `getLocalizedCategorySlug` yardımcı fonksiyonlarını kullanarak kategori bilgilerini uygun biçime dönüştürür.

**Parametreler**:
- category: DomainCategory | null | undefined — Breadcrumb'da gösterilecek ana kategori nesnesi. Null veya undefined olabilir; bu durumda son kategori öğesi eklenmez.
- parentCategory: DomainCategory | null — Ana kategorinin üst kategorisi. Tanımlıysa breadcrumb'a bir üst kategori öğesi olarak eklenir ve tıklanabilir bağlantı (href) içerir.
- homeLabel: string — Ana sayfa öğesinin görünen metni. Varsayılan değeri `'Ana Sayfa'`dır.
- lang: string — Aktif dil kodu. Üst kategori bağlantısının URL'inde kullanılacak yerelleştirilmiş slug bu dile göre üretilir. Varsayılan değeri `'tr'`dir.

**Dönüş**: BreadcrumbItem[] — Her biri `label` ve `href` alanlarına sahip breadcrumb öğelerinden oluşan bir dizi. Dizideki son öğenin `href` değeri `undefined` olarak ayarlanır; diğer öğeler geçerli URL'lere sahiptir.

---

## İTHALATLAR (IMPORTS)
- import: ../components/navigation/Breadcrumb::type { BreadcrumbItem }
- import: ../lib/type-converters::DomainCategory
- import: ../utils/routes::Routes
- import: ./categoryHelpers::getCategoryDisplayName
- import: ./categoryHelpers::getLocalizedCategorySlug

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/breadcrumbUtils.ts::buildCategoryBreadcrumb
- **params**:
  - `category` — DomainCategory | null | undefined; breadcrumb oluşturulacak kategori
  - `parentCategory` — DomainCategory | null | undefined (opsiyonel); üst kategori
  - `homeLabel` — string (varsayılan `'Ana Sayfa'`); ana sayfa etiketi
  - `lang` — string (varsayılan `'tr'`); dil kodu, slug yerelleştirmede kullanılır
- **ic_degiskenler**:
  - `items` — BreadcrumbItem[] dizisi; başlangıçta `homeLabel` ve `'/'` href'li tek elemanla başlatılır, ardından parentCategory ve category varsa push ile genişletilir
- **Dönüş**: `BreadcrumbItem[]` — breadcrumb öğeleri dizisi; ilk eleman daima ana sayfa, parentCategory varsa ikinci eleman üst kategori, category varsa üçüncü eleman mevcut kategori (href'siz, son öğe olarak)

---

## NODE ID STANDARD

  file: src\utils\breadcrumbUtils.ts
  function: src\utils\breadcrumbUtils.ts::buildCategoryBreadcrumb

---

## DISA AKTARILANLAR (EXPORTS)
  export: buildCategoryBreadcrumb