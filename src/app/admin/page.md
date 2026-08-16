---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\page.tsx
skeleton_hash: 2e439699c68b18a2
entity_hashes:
  func:Loading: 657ee72781ec51d8
  func:Page: e310741650765783
  overview: 5b1a16aab3aba293
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-19T20:46:51Z
---

## Genel Bakış
Bu modül, Next.js App Router yapısında admin panelinin `/admin` rotasını karşılayan sayfa bileşenidir. Yüklenme durumları için bir fallback bileşeni ve asıl sayfa yapısını render eden ana bileşeni içerir. Dinamik import ile `AdminDashboardPage` modülünü çağırarak yönetim arayüzünü sunar.

## Fonksiyon Grupları
### Sayfa Bileşenleri
Admin sayfasının temel yapısını oluşturan React bileşenlerini barındırır. Yüklenme sürecinde kullanıcıya geçerli bir arayüz sunarken, ana sayfa içeriğini render eder.
- Loading, Page

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Loading

**Ne yapar**: Loading bileşeni, bir sayfa veya veri yüklenirken kullanıcıya gösterilmek üzere geçici bir yükleme durumu UI'ı (arayüzü) sunar. Next.js uygulamalarında bu tür bileşenler, bir rota segmenti yüklenirken veya asenkron veri çekme işlemleri devam ederken kullanıcı deneyimini iyileştirmek amacıyla kullanılır.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşenidir. Gövdesinde veya dönüş değerinde, genellikle bir loading spinner, skeleton screen veya "Yükleniyor..." gibi basit bir metin içeren JSX yapısı döndürür. Fonksiyonun docstring'i ve dönüş tipi hakkında detaylı bilgi verilmemiştir, bu nedenle iç mantığı hakkında kesin bir yorum yapılamaz.

**Parametreler**: Bu fonksiyona ait herhangi bir parametre belirtilmemiştir.

**Dönüş**: Fonksiyonun dönüş tipi belirtilmemiştir (void veya bilinmiyor olarak not edilmiştir). React bileşeni olması beklenildiği için, JSX.Element veya React.ReactElement türünde bir dönüş yapması kuvvetle muhtemeldir, ancak bu bilgi doğrulanamamıştır.

### Page
**Ne yapar**: Bu fonksiyon, Next.js App Router yapısında admin sayfasının ana giriş noktasıdır. `<AdminDashboardPage />` bileşenini render ederek admin panosunu görüntüler.

**Nasıl yapar**: Herhangi bir parametre almaz; doğrudan `return <AdminDashboardPage />` ifadesiyle JSX öğesini döndürür. Sayfanın sunucu veya istemci tarafında render edilmesini sağlar.

**Parametreler**:
- Fonksiyon parametre almaz.

**Dönüş**: `JSX.Element` türünde bir React bileşeni döndürür. Özel olarak `<AdminDashboardPage />` değerini döner.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: next/dynamic::nextDynamic

---

## SABİTLER
- **AdminDashboardPage** (call) — `nextDynamic(
  () => import('../../views/admin/AdminDashboardPage'),
  { ss...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: admin/page.tsx::Loading
- **params**: (yok)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan destructuring ile alınan çeviri fonksiyonu; `admin.common.loading` key'ini kullanarak yükleme metnini lokalize eder
- **Dönüş**: JSX `<div>` — animasyonlu pulse efektli, slate-400 renkli, ortalanmış yükleme göstergesi; `t('admin.common.loading')` çevirisi ile doldurulur

### [N2_NASIL] AST Pointer: admin/page.tsx::Page
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX `<AdminDashboardPage />` — admin dashboard sayfasını doğrudan render eder; bu bileşen dosya içi sabit olarak import edilmiş ve doğrudan çağrılmaktadır

---

## NODE ID STANDARD

  file: src\app\admin\page.tsx
  function: src\app\admin\page.tsx::Loading
  function: src\app\admin\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Loading
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-center`, `text-slate-400`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`