---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminReturnsPage.tsx
skeleton_hash: 2d15100808a47a98
entity_hashes:
  func:AdminReturnsPage: cbbe5a033114e25a
  overview: 39146c10068c54db
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-27T07:21:18Z
---

## Genel Bakış
Bu modül, VentHub HVAC admin panelinde iade yönetimi sayfasını oluşturan tek bir React bileşeninden oluşur. Bileşen, iade kayıtlarının görüntülenmesi ve yönetimine ilişkin arayüz ile iş mantığını tek bir yapıda barındırır. Eski dokümana göre Supabase veritabanına bağımlı olup kimlik doğrulama ve yetkilendirme kontrolleri içerir.

## Fonksiyon Grupları
### Admin İade Yönetimi Sayfası Bileşeni
Tek bileşen yapısında iade yönetimi ile ilgili tüm arayüz ve iş mantığını barındırır. Kullanıcı erişim kontrolü, iade verilerinin getirilmesi ve manipülasyonu ile arayüz durum yönetimi bu bileşen içinde koordine edilir.
- AdminReturnsPage

---

**Not:** Fonksiyon gövdesi verilmediğinden, bileşenin iç yapısı, kullandığı alt bileşenler, hook'lar, durum değişkenleri ve dış servis çağrılarına ilişkin ayrıntılı mimari çıkarım yapılamamıştır. Detaylı analiz için AdminReturnsPage bileşeninin kaynak koduna ihtiyaç vardır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminReturnsPage

**Ne yapar**: Admin panelinde iade yönetim sayfasını render eden üst düzey React bileşenidir. Sayfa yapısını oluşturarak başlık alanını ve Suspense ile sarılmış ana içerik bölgesini sunar, böylece iade işlemleri için CRUD (Oluştur, Oku, Güncelle, Sil) işlemlerinin yürütüldüğü bir arayüz sağlar.

**Nasıl yapar**: Fonksiyon, sayfa başlığını doğrudan render eder ve ana içeriği `React.Suspense` bileşeni ile sarmalar. Suspense sarımı, `useSearchParams` hook'unun useAdminTable tarafından tüketilmesi sırasında oluşabilecek asenkron yüklemeleri handle etmek için gereklidir (CLAUDE.md Kural 5 / K2). Veri yönetimi, URL senkronizasyonu ve filtreleme state'i gibi tüm mantıksal sorumluluklar `ReturnsTableBody` bileşenine (useAdminTable hook'u ile) devredilmiştir; bileşenin kendisi sadece yapısal iskeleti sunar. Bu ayrım, sayfa sorumluluğunu ve veri akışını net bir şekilde böler.

**Parametreler**:
Bu bileşen parametre almaz.

**Dönüş**: `React.FC` — Fonksiyonel React bileşeni döndürür; Suspense ile sarılmış bir sayfa yapısı (başlık + ReturnsTableBody) içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./ReturnsTableBody::ReturnsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::AdminReturnsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destruct edilen çeviri fonksiyonu; `t('admin.titles.returns')` ve `t('admin.returns.subtitle')` çağrılarıyla sayfa başlığı ve alt başlık metinlerini yerelleştirir
- **Dönüş**: JSX element — `className="space-y-6 pb-20"` ile sarılmış bir `<div>`; içinde `AdminPageHeader` bileşeni (title ve description prop'ları `t()` ile çevrilmiş değerler alır) ve `fallback` olarak `AdminSkeleton` (variant="table", count=7, rows=6) kullanılan `<Suspense>` sargısı içinde `<ReturnsTableBody />` bileşeni render edilir.

---

## NODE ID STANDARD

  file: src\views\admin\AdminReturnsPage.tsx
  function: src\views\admin\AdminReturnsPage.tsx::AdminReturnsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminReturnsPage

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