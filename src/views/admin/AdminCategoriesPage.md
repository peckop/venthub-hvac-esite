---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminCategoriesPage.tsx
skeleton_hash: f1e2f4d7f509cc69
entity_hashes:
  func:AdminCategoriesPage: 2946cca3392b7941
  overview: a42b51d530c2f063
  style_tokens: 5e9d7754f938f018
generated_at: 2026-06-19T20:48:48Z
---

## Genel Bakış
AdminCategoriesPage, VentHub HVAC yönetim panelinde kategori yönetimi için kullanılan ana React sayfasıdır. Sayfa, kategorilerin listelenmesi, eklenmesi, düzenlenmesi, silinmesi ve tasarım ayarlarının yönetilmesi gibi tüm kategori CRUD işlemlerini tek bir arayüzde sunar. Bileşen, veri yükleme ve silme gibi asenkron işlemleri, kullanıcının eylemlerini işleyen iç işlevlerle entegre eder.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Kategori yönetim arayüzünün tüm yapısını ve işlevsel akışını tanımlayan, dışa aktarılan ana React bileşenidir.
- AdminCategoriesPage

### Veri Yönetim İşlemleri
Kategori verilerinin sunucudan yüklenmesi ve belirli bir kategorinin sistemden kalıcı olarak silinmesi gibi asenkron veri işlemlerini yönetir.
- load, remove

### Eylem İşleyicileri
Yeni kategori oluşturma, mevcut kategoriyi düzenleme formunu açma ve kategorinin tasarım sayfasına yönlendirme gibi kullanıcı etkileşimlerini yönetir.
- handleCreate, handleEdit, handleDesign

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminCategoriesPage
**Ne yapar**: Kategori yönetim sayfasını render eder. Bu bileşen, DataTableKit bileşen setine göç edilmiş bir CLIENT-mode CRUD sayfası olarak işlev gösterir ve kullanıcılara kategori verilerini görüntüleme, oluşturma, düzenleme ve silme işlemleri için arayüz sunar.

**Nasıl yapar**: Bileşen, sayfa yapısını oluşturmak için başlık alanını ve Suspense ile sarılmış bir area'yı birleştirir. Veri yönetimi, URL state'i ve seçim state'i gibi tüm kritik durumları `CategoriesTableBody` alt bileşenine delege eder; bu alt bileşen kendi içinde `useAdminTable` custom hook'unu kullanarak CRUD işlemlerini yürütür. `useSearchParams` hook'u,_CLAUDE.md_ belgesindeki Kural 5 ve K2'ye uygun olarak mutlaka bir `<Suspense>` bileseni icinde sarilmalidir; bu sayede search parametreleri asenkron olarak yüklendiğinde bile bileşen ağacı bozulmaz ve uygun fallback gösterilebilir.

**Parametreler**:
- Bu bileşen herhangi bir props almaz; bağımsız bir üst düzey sayfa bileşenidir.

**Dönüş**: `React.FC` — Return type olarak belirtilen React.FunctionComponent, bileşenin props almayan (veya boş props alan) fonksiyonel bir React bileşeni olduğunu ve JSX döndürdüğünü belirtir.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./CategoriesTableBody::CategoriesTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminCategoriesPage.tsx::AdminCategoriesPage
- **params**: () — parametre yok (React fonksiyonel bileşeni)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile elde edilen çeviri fonksiyonu; `t('admin.titles.categories')` ve `t('admin.categories.subtitle')` çağrılarıyla UI metinlerini uluslararası dil destekli olarak render eder
- **Dönüş**: JSX — `<div>` sarmalayıcısı içinde `<header>` (başlık + alt başlık) ve `<Suspense>` sarmalayıcısı içinde `<CategoriesTableBody />` bileşeninden oluşan ReactElement
- **Yan Etkiler / Bileşen Kullanımları**:
  - `adminSectionTitleClass` — import edilmiş CSS class sabiti, `<h1>` elementine `className` olarak uygulanır
  - `adminSubtitleClass` — import edilmiş CSS class sabiti, `<p>` elementine `className` olarak uygulanır
  - `Suspense` — React Suspense sınırı; `fallback` prop'u ile `AdminSkeleton` bileşeni (`variant="table" count={7} rows={6}` parametreleriyle) gösterilir
  - `AdminSkeleton` — Suspense fallback'inde yüklenme durumunda tablo iskeleti render eder
  - `CategoriesTableBody` — Suspense içinde lazy yüklenen kategori tablosu gövde bileşeni

---

## NODE ID STANDARD

  file: src\views\admin\AdminCategoriesPage.tsx
  function: src\views\admin\AdminCategoriesPage.tsx::AdminCategoriesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminCategoriesPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `pb-20`, `space-y-6`