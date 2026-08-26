---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\quotes\AdminQuotesPage.tsx
skeleton_hash: 1a87f71a21feb147
entity_hashes:
  func:AdminQuotesPage: 8f282793cec53879
  overview: ed62e4d1f35d7caa
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-25T07:30:46Z
---

## Genel Bakış

Bu modül, yönetici panelinde tekliflerin (quotes) yönetimine ilişkin sayfa bileşenini tanımlar. Tek bir bileşen fonksiyonu içerir ve React fonksiyonel bileşeni olarak uygulanmıştır. Modül, admin kullanıcılarına teklif verilerini görüntüleme ve yönetme arayüzü sunar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Ana sayfa bileşenini oluşturur; admin teklifler sayfasının tüm görünüm ve davranışını tek bir fonksiyonel bileşen altında toplar.
- AdminQuotesPage

## Notlar

- Modül yalnızca tek bir dışa aktarılan bileşen içerdiğinden, iç fonksiyonlar arası çağrı ilişkisi bulunmamaktadır.
- Dış bağımlılıklar ve dinamik yüklenen alt modüller hakkında kaynakta bilgi yer almamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminQuotesPage
**Ne yapar**: Teklif kuyruğu yönetim sayfasını oluşturur. T067-VH (cetvel Q7) kapsamında tanımlanmış bu sayfa, admin panelindeki teklif listeleme ve yönetim arayüzünü sunar. Sayfa yapısı başlık bileşeni ve veri yüklemesini yöneten bir `Suspense` sarmalayıcıdan oluşur.

**Nasıl yapar**: Sayfa bileşeni, üst düzeyde bir başlık ve ardından `<Suspense>` ile sarılmış bir içerik alanı render eder. `Suspense` ile sarma işlemi, `useSearchParams` tüketicisinin asenkron veri yükleme sırasında kullanıcıya kesintisiz bir deneyim sunmasını sağlar; bu uygulama CLAUDE.md Kural 5 ve K2 kurallarına uygun şekilde gerçekleştirilir. Veri yönetimi, URL parametreleri ve filtre durumu doğrudan bu bileşende tutulmaz; bu sorumluluk alt bileşen olan `QuotesTableBody`'ye devredilir. `QuotesTableBody` bileşeni, `useAdminTable` kancasını kullanarak tablo verisini, sıralama ve filtreleme gibi yönetim mantığını kendi bünyesinde barındırır.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `React.FC` — React fonksiyonel bileşen döndürür. Dönen bileşen, teklif kuyruğu sayfasının tamamını; başlık bölümünü ve `Suspense` ile sarılmış tablo gövdesini içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../../i18n/I18nProvider::useI18n
- import: ../../../utils/adminUi::adminSectionTitleClass
- import: ../../../utils/adminUi::adminSubtitleClass
- import: ./QuotesTableBody::QuotesTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/quotes/AdminQuotesPage.tsx::AdminQuotesPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile alınan çeviri fonksiyonu; JSX içinde `t('quotes.admin.title')` ve `t('quotes.admin.subtitle')` çağrılarıyla metinleri yerelleştirir
- **Dönüş**: JSX elementi — `<div className="space-y-6 pb-20">` kök elemanı içinde `<header>` (başlıkta `adminSectionTitleClass` ile `t('quotes.admin.title')`, alt başlıkta `adminSubtitleClass` ile `t('quotes.admin.subtitle')`) ve `<Suspense>` (yedek içerik olarak `AdminSkeleton` bileşenine `variant="table"`, `count={6}`, `rows={6}` props'ları iletilir) içinde `QuotesTableBody` bileşenini render eder

---

## NODE ID STANDARD

  file: AdminQuotesPage.tsx
  function: AdminQuotesPage.tsx::AdminQuotesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminQuotesPage

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