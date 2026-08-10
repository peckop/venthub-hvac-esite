---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\breadcrumbUtils.ts
skeleton_hash: e98f8f14c33e5a6b
entity_hashes:
  func:buildCategoryBreadcrumb: 75f26731c077f8ae
  overview: f70a9db5a198b67e
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış
Bu utility modülü, VentHub HVAC uygulamasının kullanıcı arayüzü gezinme bileşenleri için gerekli ekmek kırıntısı (breadcrumb) verilerini üretmek üzere tasarlanmıştır. Modülün temel amacı kategori hiyerarşilerinden yola çıkarak standartlaştırılmış gezinme öğeleri listeleri oluşturmak, uygulama içi gezinme deneyimini desteklemektir.

## Fonksiyon Grupları
### Kategori Tabanlı Ekmek Kırıntısı Üretimi
Verilen ana kategori, isteğe bağlı üst kategori ve anasayfa etiketi bilgilerini birleştirerek, arayüz tarafından doğrudan kullanılabilecek standart ekmek kırıntısı öğeleri dizisi oluşturur.
- buildCategoryBreadcrumb

---

## AXIOMS – Mimari Varsayımlar
Bu modül, domain kategori nesnelerinden ekmek kırıntısı (breadcrumb) listeleri oluşturmak üzere tasarlanmış bir yardımcı modüldür, doğru çalışması yalnızca girdi parametrelerinin belirtilen türlere uygunluğu ve kategori nesneleri arasındaki hiyerarşik bütünlüğe bağlıdır.

[Aksiyom 1]: Eğer category parametresi DomainCategory, null veya undefined türleri dışında bir türde gönderilirse, breadcrumb oluşturma işlemi başarısız olur veya çalışma zamanı hatası meydana gelir.
[Aksiyom 2]: Eğer dolu gönderilen parentCategory nesnesi ile category nesnesi arasındaki hiyerarşik ilişki geçerli değilse, oluşturulan breadcrumb zinciri yanlış sıralı veya mantıksız olur.
[Aksiyom 3]: Eğer homeLabel parametresi string türünde okunabilir bir değer olarak sağlanmazsa, breadcrumb zincirinin başlangıç (ana sayfa) öğesi eksik veya kullanıcı tarafından okunamaz hale gelir.
[Aksiyom 4]: Eğer gönderilen DomainCategory nesneleri hiyerarşik ilişki kurmak için gereken temel kimlik ve görünüm özelliklerini içermiyorsa, üretilen breadcrumb listesi eksik veya yanlış öğeler barındırır.

---

## FONKSİYON DETAYLARI

### buildCategoryBreadcrumb
**Ne yapar**: Kategori sayfaları için gezinme amacıyla kullanılacak breadcrumb (ekmek kırıntısı) öğeleri listesi oluşturan bir yardımcı fonksiyondur. Web sitesi içi gezinme deneyimini iyileştirmek amacıyla kullanıcının o anda bulunduğu kategori hiyerarşisini net bir şekilde görmesini sağlayan, kullanılmaya hazır navigasyon öğeleri üretir. Null veya undefined olabilecek kategori verilerini de güvenli bir şekilde işleyerek uygulama içi hataların önüne geçer.
**Nasıl yapar**: İletilen tüm parametreleri sırayla işleyerek breadcrumb dizisini yapılandırır. İlk olarak en başa anasayfa etiketini kullanarak anasayfa navigasyon öğesini ekler, sonrasında mevcut kategorinin varsa geçerli üst kategorisini diziye ekler, en son olarak da içinde bulunulan mevcut kategoriyi ekleyerek tam kategori hiyerarşisini sıralı bir şekilde oluşturur. Geçersiz (null/undefined) kategori verileri ile karşılaşması durumunda sadece var olan geçerli öğeleri diziye ekleyerek çalışmaya devam eder.
**Parametreler**:
- name: category, type: DomainCategory | null | undefined — Kullanıcının o anda bulunduğu mevcut kategori nesnesi, null veya undefined değerlerini de alabilir
- name: parentCategory, type: DomainCategory | null | undefined — Mevcut kategorinin hiyerarşideki bir üst kategori nesnesi, opsiyonel olarak iletilir ve null değerini alabilir
- name: homeLabel, type: any — Breadcrumb listesinin en başında yer alacak anasayfa öğesinin görünen etiketi olarak kullanılacak değer
**Dönüş**: BreadcrumbItem[] — Kullanılmaya hazır, sıralanmış navigasyon öğeleri dizisi. Tüm geçersiz veri durumlarında bile sadece var olan geçerli öğeleri içeren veya gerektiğinde boş bir dizi olarak güvenli bir şekilde döndürülür.

---

## İTHALATLAR (IMPORTS)
- import: ../components/navigation/Breadcrumb::type { BreadcrumbItem }
- import: ../lib/type-converters::DomainCategory
- import: ../utils/routes::Routes
- import: ./categoryHelpers::getCategoryDisplayName

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\breadcrumbUtils.ts::buildCategoryBreadcrumb
- **params**: category (DomainCategory | null | undefined), parentCategory? (DomainCategory | null), homeLabel (string, varsayılan değer: 'Ana Sayfa')
- **ic_degiskenler**:
  - `items` — BreadcrumbItem türünde dizi, tüm breadcrumb öğelerini toplamak için oluşturulan ana dizi, ilk elemanı ana sayfa öğesi olarak başlatılır
  - `homeLabel` — Fonksiyona parametre olarak gelen ana sayfa görünür etiketi, ilk breadcrumb öğesinin `label` alanına atanır
  - `parentCategory` — Üst kategori nesnesi, varlığı kontrol edilerek mevcutsa items dizisine üst kategori breadcrumb öğesi eklenir; içinden `parentCategory.slug` özelliğine erişilerek rota oluşturulur
  - `getCategoryDisplayName(parentCategory)` — Üst kategorinin kullanıcıya gösterilecek adını almak için çağrılan kategori yardımcı fonksiyonunun çıktısı, üst kategori breadcrumb öğesinin `label` alanına atanır
  - `Routes.category(parentCategory.slug)` — Üst kategori için yönlendirme rotası oluşturmak için çağrılan Routes yardımcısının çıktısı, üst kategori breadcrumb öğesinin `href` alanına atanır
  - `category` — Mevcut kategori nesnesi, varlığı kontrol edilerek mevcutsa son breadcrumb öğesi olarak items dizisine eklenir
  - `getCategoryDisplayName(category)` — Mevcut kategorinin kullanıcıya gösterilecek adını almak için çağrılan kategori yardımcı fonksiyonunun çıktısı, son breadcrumb öğesinin `label` alanına atanır
- **Dönüş**: BreadcrumbItem[] türünde, tam olarak oluşturulmuş breadcrumb öğeleri dizisi

---

## NODE ID STANDARD

  file: src\utils\breadcrumbUtils.ts
  function: src\utils\breadcrumbUtils.ts::buildCategoryBreadcrumb

---

## DISA AKTARILANLAR (EXPORTS)
  export: buildCategoryBreadcrumb