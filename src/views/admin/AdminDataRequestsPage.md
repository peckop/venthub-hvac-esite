---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminDataRequestsPage.tsx
skeleton_hash: 12d6e79a377d0c88
entity_hashes:
  func:AdminDataRequestsPage: e1dd1f73cd03951d
  overview: 7c61120601772da7
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-27T06:51:24Z
---

## Genel Bakış
Bu modül, admin panelinde veri taleplerinin görüntülendiği sayfa bileşenini tanımlar. React fonksiyonel bileşeni olarak implemente edilmiş tek bir dışa aktarılan bileşen içerir.

## Fonksiyon Grupları

### Sayfa Bileşeni
Admin kullanıcılarına yönelik veri talepleri sayfasını render eden ana bileşendir. Modülün tek fonksiyonu olup tüm sayfa sorumluluğunu tek başına üstlenir.
- AdminDataRequestsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Yalnızca fonksiyon imzası (`AdminDataRequestsPage() -> React.FC`) mevcut olup, fonksiyon gövdesi sağlanmamıştır. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebilir. Gövde verilmediğinden herhangi bir varsayım çıkarımı yapılamaz.

---

## FONKSİYON DETAYLARI

### AdminDataRequestsPage

**Ne yapar**: KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında veri sahiplerinin yaptığı taleplerin kaydedildiği ve izlendiği defterin yönetici arayüzünü oluşturan React bileşenidir. T063 kodlu prosedüre karşılık gelir. Cetvel `legal-compliance-standard.md §3.4`'e atıfla, prosedürün elle işletilmesinin meşru olduğunu ancak süre ve sonuç ispat yükünün kuruluşun üzerinde olduğunu vurgular. Yani "30 gün içinde yanıtladık" demek yetmez; bunun gösterilebilir, kanıtlanabilir olması gerekir. Bu bileşen, o ispatı üreten defterin kullanıcıya görünür yüzüdür.

**Nasıl yapar**: Bileşen, başvuru kanalından (kayıtlı e-posta gibi) gelen veri sahibi taleplerinin listelenmesi, durum takibi ve ispat kayıtlarının tutulması için gerekli arayüzü render eden bir React fonksiyonel bileşeni olarak çalışır. Docstring'te belirtilen kapsam dışında bileşenin iç mantığına dair ek bilgi verilen kaynakta mevcut değildir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz. React fonksiyonel bileşeni olarak props tanımı verilen kaynakta belirtilmemiştir.

**Dönüş**: `React.FC` — React fonksiyonel bileşeni (Functional Component) döndürür. Bu bileşen, KVKK veri sahibi talep defterinin yönetici paneli ekranını render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./AdminDataRequestsTableBody::AdminDataRequestsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminDataRequestsPage.tsx::AdminDataRequestsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.dataRequests.title')` ve `t('admin.dataRequests.subtitle')` çağrılarıyla sayfa başlığı ve alt açıklaması için yerelleştirilmiş metinler elde edilir
- **Dönüş**: JSX — bir `<div>` içinde `<AdminPageHeader>` (title ve description prop'ları ile) ve `<Suspense>` ile sarılmış `<AdminDataRequestsTableBody />` bileşenlerini render eder; `<Suspense>` yüklenme sırasında `<AdminSkeleton variant="table" count={6} rows={6} />` fallback'ını gösterir

---

## NODE ID STANDARD

  file: src\views\admin\AdminDataRequestsPage.tsx
  function: src\views\admin\AdminDataRequestsPage.tsx::AdminDataRequestsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminDataRequestsPage

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