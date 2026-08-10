---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminLogisticsPage.tsx
skeleton_hash: 6b068c68f2787d80
entity_hashes:
  func:AdminLogisticsPage: 2871b566ee0ce6bc
  overview: 4c991985914ec49b
  style_tokens: 5e9d7754f938f018
generated_at: 2026-06-19T20:49:07Z
---

## Genel Bakış
AdminLogisticsPage modülü, VentHub HVAC yönetici panelinde lojistik süreçlerin merkezi olarak yönetildiği React bileşenidir. Sipariş takibi, stok yönetimi ve teslimat süreçleri gibi lojistik operasyonların görüntülenmesi ve kontrolü için yönetici arayüzü sunar. Modül, useI18n, useRole, useDragScroll ve usePathname gibi hook'lara ve Supabase Edge Function'a bağımlıdır; dinamik yükleme içermez ve mimari olarak lojistik yönetiminin tek erişim noktası olarak kritik öneme sahiptir.

## Fonksiyon Grupları
### Lojistik Yönetim Bileşeni
Lojistik verilerinin sunumunu, filtrelenmesini ve kargo güncelleme işlemlerini tek bir bileşen üzerinde yoğunlaştıran ana React bileşenidir.
- AdminLogisticsPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesine dayalı çıkarılabilen özel bir mimari aksiyom tanımlanmamıştır.

[Not: Verilen fonksiyon imzası (`AdminLogisticsPage()`) parametresizdir ve modülün bir React bileşeni olduğu dış dokümandan anlaşılmaktadır. Ancak, mimari varsayımlar **yalnızca fonksiyon gövdesinden** üretilmelidir. Fonksiyon gövdesinin içeriği sağlanmadığı için, bu modüle özgü somut bir koşul (örn: bağımlılıklar, state yapısı, render prerequisite) tespit edilememiştir.]

---

## FONKSİYON DETAYLARI

### AdminLogisticsPage

**Ne yapar**: Admin panelinde lojistik yönetim sayfasını render eden React fonksiyonel bileşenidir. Sayfa başlığını, alt başlığını ve lojistik veri tablosunu kullanıcıya sunar. Bu bileşen, admin panelinin lojistik yönetim arayüzünün üst seviye konteynerıdır.

**Nasıl yapar**: `useI18n()` hook'u ile çoklu dil desteği sağlar ve `t` fonksiyonu aracılığıyla çeviri anahtarlarından yerelleştirilmiş metinleri çeker. Sayfa yapısını bir `<div>` konteyneri içinde sıralı olarak oluşturur: önce `<header>` bölümünde başlık ve alt başlık yer alır, ardından `React.Suspense` bileşeni ile sarılmış `AdminLogisticsTableBody` tablosu render edilir. `Suspense` bileşeni, tablonun lazy loading (tembel yükleme) ile yüklendiğini belirtir ve henüz hazır olmadığında `AdminSkeleton` bileşenini `table` varyantında 10 satır ve 5 sütun olacak şekilde fallback olarak gösterir.

**Parametreler**:

Bu fonksiyon parametre almamaktadır. Props'sız (stateless) bir fonksiyonel React bileşenidir.

**Dönüş**: `JSX.Element` tipinde React bileşeni döndürür. Lojistik yönetiminin tam sayfa düzenini (header ve Suspense ile sarılmış tablo gövdesi) içeren bir JSX yapısı 반환 eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./AdminLogisticsTableBody::AdminLogisticsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/admin/AdminLogisticsPage.tsx`::AdminLogisticsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile elde edilen çeviri fonksiyonu; `t('admin.logistics.title')` ve `t('admin.logistics.subtitle')` çağrılarıyla sayfa başlığını ve alt başlığını çok dilli olarak render eder
- **Dönüş**: JSX element döndürür — `<div>` sarmalayıcı içinde `<header>` (başlık + alt başlık) ve `<Suspense>` sarılı `<AdminLogisticsTableBody />` bileşenini içeren tam sayfa görünümü

**Yan etkiler**: `useI18n()` hook'u ile bağlam bağlamında dil bağlamına erişir; `<Suspense fallback={<AdminSkeleton variant="table" count={10} rows={5} />}>` ile asenkron yükleme sırasında 10 satırlık iskelet tablo gösterir; `<AdminLogisticsTableBody />` asenkron olarak yüklenen lojistik tablo gövdesini render eder.

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