---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\utils\breadcrumbUtils.ts
skeleton_hash: 03fbc248c3a1c477
entity_hashes:
  func:buildCategoryBreadcrumb: 57eb6d8f024616e4
  overview: abeb057cc67ee6d6
generated_at: 2026-08-27T08:37:50Z
---

## Genel Bakış
Bu modül, kullanıcı arayüzünde gezinme bileşenleri için ekmek kırıntısı (breadcrumb) verileri üreten bir yardımcı modüldür. Temel amacı, verilen kategori hiyerarşilerinden standartlaştırılmış bir gezinme öğeleri listesi oluşturmaktır. Modül, uygulama içi gezinme deneyimini destekleyen tek bir temel fonksiyon içerir.

## Fonksiyon Grupları
### Kategori Tabanlı Ekmek Kırıntısı Üretimi
Verilen ana kategori, isteğe bağlı üst kategori ve anasayfa etiketi bilgilerini birleştirerek, arayüz tarafından doğrudan kullanılabilecek standart ekmek kırıntısı öğeleri dizisi oluşturur.
- buildCategoryBreadcrumb

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imzadan çıkarılabilecek varsayımlar belirtilebilir. Gövde bilinmediği için davranışsal aksiyom üretilemez.

[Aksiyom 1]: Eğer `category` parametresi `null` veya `undefined` ise, fonksiyonun nasıl bir `BreadcrumbItem[]` ürettiği bilinmiyor (gövde mevcut değil).

[Aksiyom 2]: Eğer `parentCategory` parametresi verilmezse veya `null` ise, breadcrumb dizisinde üst kategori öğesinin yer alıp almadığı bilinmiyor.

[Aksiyom 3]: Eğer `homeLabel` parametresi verilmezse, fonksiyon çağrılamaz — bu parametre zorunludur ve default değeri yoktur.

[Aksiyom 4]: Eğer `lang` parametresi verilmezse, fonksiyon çağrılamaz — bu parametre zorunludur ve default değeri yoktur.

[Aksiyom 5]: Eğer `DomainCategory` tipi beklenen yapıda verilmezse, breadcrumb öğelerinin nasıl oluşturulduğu bilinmiyor — `DomainCategory` alanları ve `BreadcrumbItem` yapısı gövdeden çıkarılamaz.

---

## FONKSİYON DETAYLARI

### buildCategoryBreadcrumb
**Ne yapar**: Kategori sayfaları için breadcrumb (ekmek kırıntısı navigasyonu) öğeleri dizisi oluşturur. Ana sayfadan başlayarak varsa üst kategori ve mevcut kategori olmak üzere hiyerarşik bir navigasyon yolu üretir.

**Nasıl yapar**: Fonksiyon öncelikle bir `items` dizisi oluşturur ve ilk eleman olarak ana sayfa bağlantısını (`href: '/'`) ekler. Ardından `parentCategory` parametresi tanımlı ve truthy ise, üst kategorinin görünen adını `getCategoryDisplayName` fonksiyonuyla alır ve yerelleştirilmiş slug'ını `getLocalizedCategorySlug` fonksiyonuyla elde ederek `Routes.category` üzerinden üst kategori linkini üretir. Son olarak `category` parametresi truthy ise, mevcut kategorinin görünen adını ekler; ancak bu son eleman olduğundan `href` değeri `undefined` olarak atanır — bu sayede breadcrumb'ın son öğesi tıklanamaz bir metin olarak görüntülenir.

**Parametreler**:
- `category`: `DomainCategory | null | undefined` — Breadcrumb'da son öğe olarak gösterilecek mevcut kategori nesnesi. `null` veya `undefined` olduğunda son kategori öğesi breadcrumb'a eklenmez.
- `parentCategory`: `DomainCategory | null` (opsiyonel) — Mevcut kategorinin üst kategorisi. Tanımlı ve truthy olduğunda breadcrumb'a ara öğe olarak eklenir; üst kategori linki aktif dile göre yerelleştirilmiş slug ile üretilir.
- `homeLabel`: `string` (varsayılan: `'Ana Sayfa'`) — Breadcrumb'ın ilk elemanı olan ana sayfa öğesinin görünen etiket metni.
- `lang`: `string` (varsayılan: `'tr'`) — Aktif dil kodu. Üst kategori linki bu dilin görünen slug'ıyla üretilir; `getLocalizedCategorySlug` fonksiyonuna iletilir.

**Dönüş**: `BreadcrumbItem[]` — Her biri `label` (görünen metin) ve `href` (hedef URL, son elemanda `undefined`) alanlarından oluşan breadcrumb öğeleri dizisi. Dizi en az bir eleman (ana sayfa) içerir; `parentCategory` ve `category` parametrelerinin durumuna göre en fazla üç elemana ulaşır.

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
  - `category: DomainCategory | null | undefined` — breadcrumb'da gösterilecek kategori nesnesi; null veya undefined olabilir
  - `parentCategory?: DomainCategory | null` — üst kategori nesnesi; opsiyonel, null olabilir
  - `homeLabel = 'Ana Sayfa'` — breadcrumb'ın ilk elemanı olan ana sayfa etiketi; varsayılan değeri `'Ana Sayfa'`
  - `lang = 'tr'` — dil kodu; kategori slug'ı oluşturulurken kullanılır, varsayılan `'tr'`
- **ic_degiskenler**:
  - `items: BreadcrumbItem[]` — breadcrumb öğelerini tutan dizi; başlangıçta `{ label: homeLabel, href: '/' }` elemanıyla başlatılır; `parentCategory` truthy ise `getCategoryDisplayName(parentCategory)` etiketi ve `Routes.category(getLocalizedCategorySlug(parentCategory, lang))` href'i ile ikinci eleman eklenir; `category` truthy ise `getCategoryDisplayName(category)` etiketi ve `href: undefined` ile üçüncü eleman eklenir
- **Dönüş**: `BreadcrumbItem[]` — breadcrumb öğeleri dizisi; en az bir eleman (ana sayfa), en fazla üç eleman (ana sayfa + üst kategori + kategori) içerir

---

## NODE ID STANDARD

  file: src\utils\breadcrumbUtils.ts
  function: src\utils\breadcrumbUtils.ts::buildCategoryBreadcrumb

---

## DISA AKTARILANLAR (EXPORTS)
  export: buildCategoryBreadcrumb