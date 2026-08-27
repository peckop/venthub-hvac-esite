---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminErrorGroupsPage.tsx
skeleton_hash: 683dee81511b7798
entity_hashes:
  func:AdminErrorGroupsPage: 8cf21adc3f3ff52a
  overview: cea17ff09b28a9db
  style_tokens: a7fe3ab3ca0c1259
generated_at: 2026-08-27T07:43:49Z
---

## Genel Bakış
Bu modül, yönetici panelinde hata gruplarını görüntülemek ve yönetmek için kullanılan bir React sayfa bileşenidir. Hata gruplarının listelenmesi, filtrelenmesi, durum güncellenmesi, sorumlu atanması ve toplu işlem yapılması gibi hata yönetim görevlerini tek bir arayüzde sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni ve Durum Yönetimi
Ana sayfa bileşenini oluşturarak hata gruplarının listelenmesi, sıralanması, seçilmesi ve bireysel/toplu işlemlerin koordinasyonunu sağlar.
- AdminErrorGroupsPage

## Bağımlılıklar ve Mimari Notlar
- Modül, bir hata verisi kaynağına (API veya veri katmanı) bağımlıdır; bu kaynak olmadan hata grupları listelenemez.
- Toplu işlem desteği, kullanıcı seçimi yapılmış kayıtlar üzerinde çalışır; seçim yoksa toplu durum değişikliği uygulanamaz.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminErrorGroupsPage
**Ne yapar**: Hata grupları listesini gösteren admin sayfasını render eder. DataTableKit bileşenine göç edilmiş olan bu sayfa, server-mode yapısıyla verileri sunucudan yönetilen tablo formatında sunar.

**Nasıl yapar**: Bileşen, sayfa yapısını iki temel katmandan oluşturur: bir başlık bölümü ve bir Suspense zarfı içindeki ana içerik bölümü. `useSearchParams` hook'u kullanılarak URL parametreleri okunduğundan, React 18'in Suspense gerekliliği gereği bu hook'u tüketen içerik `<Suspense>` bileşeni içine yerleştirilmiştir. Sayfanın tüm veri yönetimi, URL senkronizasyonu ve filtre state'i işlemleri `ErrorGroupsTableBody` alt bileşeni tarafından `useAdminTable` custom hook'u aracılığıyla gerçekleştirilir. Bu mimari ayrım, sayfa yüklenme durumlarında uygun fallback gösterimini mümkün kılar.

**Parametreler**:
Bu bileşen `React.FC` tipi ile tanımlanmıştır ve herhangi bir props almamaktadır. Bileşen içindeki tüm state yönetimi URL parametreleri ve alt bileşenler aracılığıyla yürütülür.

**Dönüş**: `React.FC` — Hata gruplarını DataTableKit tablosu formatında gösteren, Suspense ile sarılmış bir React sayfa bileşeni döner.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./ErrorGroupsTableBody::ErrorGroupsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminErrorGroupsPage.tsx::AdminErrorGroupsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan çıkarılan çeviri fonksiyonu. `t('admin.titles.errorGroups')` ve `t('admin.errorGroups.subtitle')` çağrılarında kullanılıyor.
- **Dönüş**: JSX elementi (React.ReactNode) — bir `div` kapsayıcısı içinde `AdminPageHeader` ve `Suspense` ile sarılmış `ErrorGroupsTableBody` bileşenlerini render eder.

---

## NODE ID STANDARD

  file: src\views\admin\AdminErrorGroupsPage.tsx
  function: src\views\admin\AdminErrorGroupsPage.tsx::AdminErrorGroupsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminErrorGroupsPage

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
- **Yardımcı Sınıflar:** `pb-20`, `space-y-4`