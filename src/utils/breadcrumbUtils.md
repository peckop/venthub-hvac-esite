---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-altyapi\src\utils\breadcrumbUtils.ts
skeleton_hash: 5c2f44456a2208c3
entity_hashes:
  func:buildCategoryBreadcrumb: 57eb6d8f024616e4
  overview: abeb057cc67ee6d6
generated_at: 2026-08-18T07:03:54Z
---

## Genel Bakış
Bu utility modülü, VentHub uygulamasının arayüzündeki navigasyon (gezinme) bileşenleri için gerekli "ekmek kırıntısı" (breadcrumb) verilerini üretmekle sorumludur. Temel amacı, kategori hiyerarşisini temsil eden veri nesnelerinden, kullanıcının konumunu gösteren standart ve tutarlı bir gezinme yolu (BreadcrumbItem listesi) oluşturmaktır. Modülün doğru çalışması, girdi olarak sağlanan DomainCategory nesnelerinin geçerliliği ve aralarındaki hiyerarşik ilişkiye bağlıdır.

## Fonksiyon Grupları
### Kategori Hiyerarşisinden Breadcrumb Üretimi
Verilen ana kategori, üst kategori ve ansayfa etiketi gibi parametreleri kullanarak, arayüzde doğrudan gösterilecek olan breadcrumb dizi yapısını (BreadcrumbItem[]) oluşturur. Fonksiyon, kategori nesnelerinin hiyerarşik bütünlüğünü koruyarak gezinme zincirini sıralı bir şekilde döndürür.
- buildCategoryBreadcrumb

---

## AXIOMS – Mimari Varsayımlar
Bu modül, DomainCategory nesnelerindenBreadcrumbItem[] listesi üretmek için tasarlanmıştır.

[Aksiyom 1]: Eğer `homeLabel` parametresi sağlanmazsa, ana sayfa breadcrumb öğesi üretilemez veya işlevsellik hata ile sonlanır.

[Aksiyom 2]: Eğer `lang` parametresi sağlanmazsa, etiketlerin doğru dilde çözümlenmesi mümkün olmaz.

[Aksiyom 3]: Eğer `category` null veya undefined ise,返回 edilen BreadcrumbItem[] dizisi sadece ana sayfa öğesinden (veya boş diziden) oluşur.

[Aksiyom 4]: Eğer `parentCategory` sağlanmazsa, breadcrumb zincirinde orta seviye kategori öğesi atlanır ve doğrudan kategoriye geçilir.

[Aksiyom 5]: Eğer `category` DomainCategory nesnesi olarak sağlanırsa, returned BreadcrumbItem[] dizisinde en az bir kategori öğesi bulunmalıdır.

[Aksiyom 6]: Eğer `category` bir üst kategoriye sahipse ve `parentCategory` parametresi sağlanmamışsa, üst kategori hiyerarşisi bilinmiyor olur.

---

## FONKSİYON DETAYLARI

### buildCategoryBreadcrumb
**Ne yapar**: Bu fonksiyon, bir kategori sayfası için navigasyon yolu (breadcrumb) öğelerini oluşturur. Sayfanın hiyerarşisindeki ana sayfa, varsa üst kategori ve mevcut kategoriyi temsil eden etiket ve bağlantı bilgilerini içeren bir dizi döndürür.

**Nasıl yapar**: Fonksiyon, boş bir `BreadcrumbItem` dizisi başlatır. Öncelikle ana sayfa öğesini ekler. Ardından, `parentCategory` parametresi verilmiş ve geçerli bir değerse, üst kategorinin görünür adını ve lokalize slug'ını kullanarak bir bağlantı oluşturur ve ekler. Son olarak, `category` parametresi geçerliyse, mevcut kategorinin görünür adını ekler ancak bu son öğe için bağlantı (`href`) `undefined` olarak ayarlanır, çünkü bu ziyaret edilen sayfadır. Fonksiyon son olarak oluşturulmuş breadcrumb öğeleri dizisini döndürür.

**Parametreler**:
- `category`: `DomainCategory | null | undefined` — Oluşturulan breadcrumb yolunun en sonundaki (aktif) kategoriyi temsil eder. Bu parametre geçerli bir `DomainCategory` nesnesi, `null` veya `undefined` olabilir; eğer geçerli bir nesne ise, breadcrumb'ın son öğesi olarak eklenir.
- `parentCategory`: `DomainCategory | null` (opsiyonel) — Aktif kategorinin bir üst seviyedeki kategorisini temsil eder. Bu parametre verilmiş ve `null` değilse, ana sayfa ile aktif kategori arasına eklenir. Varsayılan değeri `undefined`'dır.
- `homeLabel`: `string` (varsayılan: `'Ana Sayfa'`) — Ana sayfa öğesinin metin etiketidir. Farklı bir dil veya isimlendirme için değiştirilebilir.
- `lang`: `string` (varsayılan: `'tr'`) — İçerikteki dil belirtecidir. Üst kategorinin slug'ını (`getLocalizedCategorySlug` fonksiyonu kullanılarak) belirli bir dile göre lokalize etmek için kullanılır, böylece bağlantı doğru dildeki URL'yi üretir.

**Dönüş**: `BreadcrumbItem[]` — Her biri `label` (string) ve `href` (string | undefined) alanlarından oluşan bir nesne dizisidir. Dizideki ilk öğe genellikle ana sayfaya giden bağlantıdır, son öğe ise `href`'i `undefined` olan aktif sayfayı temsil eder.

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
- **params**: `category: DomainCategory | null | undefined` — gösterilecek kategori (son eleman), `parentCategory?: DomainCategory | null` — üst kategori (varsa orta eleman), `homeLabel = 'Ana Sayfa'` — ana sayfa etiketi, `lang = 'tr'` — dil kodu
- **ic_degiskenler**:
  - `items: BreadcrumbItem[]` — breadcrumb öğelerini tutan dizi; ilk eleman olarak `homeLabel` etiketi ve `'/'` href'i ile başlar
- **Dönüş**: `BreadcrumbItem[]` — kategori breadcrumb zinciri dizisi (ana sayfa → üst kategori → kategori sıralamasında)

**Kullanılan API çağrıları:**
- `getCategoryDisplayName(parentCategory)` — parentCategory'nin insan-okunabilir gösterim adını döndürür
- `getCategoryDisplayName(category)` — category'nin insan-okunabilir gösterim adını döndürür
- `getLocalizedCategorySlug(parentCategory, lang)` — parentCategory'nin dil-sekme karşılığını döndürür
- `Routes.category(slug)` — kategori sayfası rotasını slug ile birleştirerek tam href oluşturur

**Not:** `category` elemanının `href` değeri `undefined` olarak ayarlanmıştır — bu, breadcrumb'daki son (aktif) elemanın tıklanabilir olmadığını belirtir.

---

## NODE ID STANDARD

  file: src\utils\breadcrumbUtils.ts
  function: src\utils\breadcrumbUtils.ts::buildCategoryBreadcrumb

---

## DISA AKTARILANLAR (EXPORTS)
  export: buildCategoryBreadcrumb