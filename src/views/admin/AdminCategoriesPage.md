---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminCategoriesPage.tsx
skeleton_hash: d6db22928db51fe1
entity_hashes:
  func:AdminCategoriesPage: 2946cca3392b7941
  overview: d8f09a59729b2ede
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-27T07:11:03Z
---

## Genel Bakış
AdminCategoriesPage, VentHub HVAC yönetim panelinde kategori yönetimi için kullanılan ana React sayfasıdır. Bileşen, kategorilerin listelenmesi, eklenmesi, düzenlenmesi, silinmesi ve tasarım ayarlarının yönetilmesi gibi tüm kategori CRUD işlemlerini tek bir arayüzde sunar. DataTableKit bileşen setine göç edilmiş bir CLIENT-mode CRUD sayfası olarak işlev gösterir ve kritik durum yönetimini alt bileşenlere delege eder.

## Fonksiyon Grupları

### Ana Sayfa Bileşeni
Kategori yönetim arayüzünün tüm yapısını ve işlevsel akışını tanımlayan, dışa aktarılan ana React bileşenidir. Sayfa yapısını oluşturmak için başlık alanını ve Suspense ile sarılmış bir area'yı birleştirir; veri yönetimi, URL state'i ve seçim state'i gibi kritik durumları `CategoriesTableBody` alt bileşenine delege eder.
- AdminCategoriesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından (yalnızca `AdminCategoriesPage() -> React.FC` imzası mevcut), gövdeden çıkarılabilecek mimari varsayım üretilememektedir. Eski dokümanda yer alan açıklamalar docstring/belge niteliğinde olduğundan aksiyom kaynağı olarak kullanılmamıştır.

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
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./CategoriesTableBody::CategoriesTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminCategoriesPage.tsx::AdminCategoriesPage
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.titles.categories')` ve `t('admin.categories.subtitle')` çağrılarıyla sayfa başlığı ve alt başlık metinlerini yerelleştirmek için kullanılır
- **Dönüş**: JSX — `className="space-y-6 pb-20"` ile bir `<div>` içinde; `AdminPageHeader` bileşeni (`title` ve `description` prop'ları `t()` ile üretilir) ve `AdminSkeleton` fallback'li (`variant="table"`, `count={7}`, `rows={6}`) `<Suspense>` ile sarmalanmış `CategoriesTableBody` bileşeni döndürür

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