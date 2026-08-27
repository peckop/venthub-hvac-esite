---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminLogisticsPage.tsx
skeleton_hash: 646f2359382abc14
entity_hashes:
  func:AdminLogisticsPage: d344f4347f39c68a
  overview: dbf543cfd48e7219
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-27T07:17:37Z
---

## Genel Bakış

AdminLogisticsPage, admin panelindeki lojistik yönetim sayfasını temsil eden bir React bileşenidir. `views/admin` klasöründe konumlanan bu modül, tek bir sayfa bileşeninden oluşur ve lojistik ile ilgili yönetim işlemlerinin gerçekleştirildiği arayüzü sunar.

## Fonksiyon Grupları

### Sayfa Bileşeni

AdminLogisticsPage, admin kullanıcısına lojistik yönetim arayüzünü render eden ana sayfa bileşenidir. Modülde tanımlı tek fonksiyondur ve sayfanın tüm görünüm ile etkileşiminden sorumludur.

- AdminLogisticsPage

## Bağımlılıklar ve Mimari Notlar

- Modülde yalnızca bir bileşen tanımlıdır; iç fonksiyon çağrısı veya alt bileşen ayrıştırması bu kaynakta görünmemektedir.
- Dış bağımlılıklar (örneğin kullanılan UI kitleri, routing katmanı, API servisleri) bu fonksiyon listesinde yer almadığından burada belirtilmemiştir.
- Dinamik veya lazy yüklenen bir alt modül bilgisi mevcut değildir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanamamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediğinden, yalnızca fonksiyon gövdesinden üretilebilen aksiyomlar çıkarılamamaktadır. Dosya adı (`AdminLogisticsPage.tsx`) ve fonksiyon adı (`AdminLogisticsPage`) üzerinden çıkarım yapılması kural gereği yasaktır.

---

## FONKSİYON DETAYLARI

### AdminLogisticsPage
**Ne yapar**: Admin panelinin lojistik yönetim sayfasını oluşturan bir React fonksiyonel bileşenidir. Sayfa başlığı, açıklama metni ve lojistik verilerini gösteren tabloyu içeren bir düzen sağlar.

**Nasıl yapar**: `useI18n()` hook'u aracılığıyla uluslararasılaştırma fonksiyonu `t`'yi alır. Sayfa yapısını oluştururken `AdminPageHeader` bileşenine `t('admin.logistics.title')` ve `t('admin.logistics.subtitle')` anahtarlarıyla çevrilmiş başlık ve açıklama metinlerini prop olarak aktarır. Lojistik tablosu için `AdminLogisticsTableBody` bileşenini kullanır ve React'ın `Suspense` bileşeni ile sararak asenkron yükleme sırasında `AdminSkeleton` fallback bileşenini gösterir; bu fallback bileşeni `variant="table"`, `count={10}` ve `rows={5}` prop'larıyla yapılandırılmıştır. Ana kapsayıcı `div` elemanı `space-y-6` ve `pb-20` CSS sınıflarıyla stilize edilmiştir.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: JSX.Element — Sayfanın arayüz yapısını tanımlayan JSX ağacını döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./AdminLogisticsTableBody::AdminLogisticsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::AdminLogisticsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile alınan çeviri fonksiyonu; `t('admin.logistics.title')` ve `t('admin.logistics.subtitle')` çağrılarıyla sayfa başlığı ve açıklamasının metinlerini getirir
- **Dönüş**: JSX element — üst seviyede `className="space-y-6 pb-20"` olan bir `<div>` kapsayıcısı; içinde `<AdminPageHeader>` (title ve description prop'ları `t()` ile beslenir) ve `<Suspense>` (fallback olarak `<AdminSkeleton variant="table" count={10} rows={5} />` kullanır) ile sarılmış `<AdminLogisticsTableBody />` bileşeni döndürülür

---

## NODE ID STANDARD

  file: src\views\admin\AdminLogisticsPage.tsx
  function: src\views\admin\AdminLogisticsPage.tsx::AdminLogisticsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminLogisticsPage

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