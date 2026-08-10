---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx
skeleton_hash: a679c2496167ab09
entity_hashes:
  func:AdminErrorGroupsPage: 8cf21adc3f3ff52a
  overview: 74c77915b531bc1a
  style_tokens: a7fe3ab3ca0c1259
generated_at: 2026-06-19T20:48:41Z
---

## Genel Bakış
Bu modül, yönetici panelindeki hata gruplarını görüntülemek ve yönetmek için kullanılan bir React sayfasıdır. Hata gruplarının filtrelenmesi, sıralanması, bireysel veya toplu olarak durum güncellenmesi, sorumlu atanması ve not eklenmesi gibi işlemleri tek bir arayüzden sunar. Modül, hata yönetim sürecini verimli hale getirmek için toplu işlem desteği ve detaylı hata kaydı yükleme imkânı sağlar.

## Fonksiyon Grupları
### Sayfa Yapısı ve Liste Yönetimi
Ana bileşeni oluşturarak sayfanın temel yapısını kurar ve hata gruplarının sıralama ile seçim durumlarını yönetir.
- AdminErrorGroupsPage, toggleSort, toggleSelect

### Bireysel Hata Grubu İşlemleri
Belirli bir hata grubu üzerinde durum değişikliği, sorumlu atama, not güncelleme ve detaylı hata kayıtlarını yükleme gibi operasyonları gerçekleştirir.
- updateStatus, updateAssignedTo, updateNotes, loadLatestClientErrors

### Toplu İşlemler
Birden fazla seçili hata grubuna aynı anda durum değişikliği uygulayarak verimli toplu yönetim sağlar.
- bulkApplyStatus

---

## AXIOMS – Mimari Varsayımlar

Bu modül, yönetici panelinde hata gruplarını yönetmek için kullanılan bir React sayfa bileşenidir. Aşağıdaki varsayımlar, yalnızca fonksiyon imzalarından türetilmiştir.

**[Aksiyom 1]:** Eğer `loadLatestClientErrors` fonksiyonu çalıştırılacaksa, modülün erişebileceği bir hata verisi kaynağı (API endpoint veya benzeri bir veri katmanı) mevcut olmalıdır.
Eğer veri kaynağı yoksa, hata grupları listelenemez ve sayfa boş veya hatalı durumda kalır.

**[Aksiyom 2]:** Eğer `bulkApplyStatus` fonksiyonu çağrılacaksa, en az bir hata kaydının seçili (`toggleSelect` aracılığıyla) olması gerekir.
Eğer seçili hata kaydı yoksa, toplu durum güncellemesi hedeflenemeyebilir (davranış implementasyona bağlıdır — bilinmiyor).

**[Aksiyom 3]:** Eğer `updateStatus`, `updateAssignedTo` veya `updateNotes` fonksiyonları çalıştırılacaksa, hedef hata kaydının geçerli bir tanımlayıcıya (ID) sahip olması gerekir.
Eğer geçerli bir hata kaydı tanımlayıcısı yoksa, güncelleme işlemi başarısız olur veya beklenmeyen davranışa neden olur.

**[Aksiyom 4]:** Eğer `toggleSort` fonksiyonu çalıştırılacaksa, sıralanabilir alanların (alan adları/tanımlayıcıları) bilinmesi gerekir.
Eğer sıralanabilir alan tanımları bilinmiyorsa, sıralama işlevi uygulanamaz.

**[Aksiyom 5]:** Modül, bileşen düzeyinde state yönetimi gerektirir — seçim durumu (`toggleSelect`), sıralama durumu (`toggleSort`) ve muhtemelen filtre durumu için.
Eğer state yönetimi doğru kurulmazsa, kullanıcı arayüzündeki durum tutarsızlıkları oluşur.

**[Aksiyom 6]:** Modülün bir React sayfası (`React.FC`) olarak çalışabilmesi için React ortamının ve ilgili routing altyapısının erişilebilir olması gerekir.
Eğer React ortamı veya routing altyapısı yoksa, bileşen render edilemez.

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
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./ErrorGroupsTableBody::ErrorGroupsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminErrorGroupsPage.tsx::AdminErrorGroupsPage
- **params**: parametre yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan elde edilen çevirme fonksiyonu, JSX içinde `t('admin.titles.errorGroups')` ve `t('admin.errorGroups.subtitle')` çağrılarıyla kullanılır
- **Dönüş**: JSX elemanı döndürür; `<div>` sarmalayıcısı içinde `<header>` ve `<Suspense>` ile sarılmış `<ErrorGroupsTableBody />` bileşenini içeren bir React bileşeni yapısı

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