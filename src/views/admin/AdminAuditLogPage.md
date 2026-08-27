---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminAuditLogPage.tsx
skeleton_hash: d7bee2efa3bc394b
entity_hashes:
  func:AdminAuditLogPage: 8228aa5d40a8a979
  overview: a246254b15a03f7e
  style_tokens: a7fe3ab3ca0c1259
generated_at: 2026-08-27T07:10:42Z
---

## Genel Bakış
VentHub HVAC uygulamasının yönetici panelindeki denetim günlüğü sayfasını sunan React bileşenidir. Sistem üzerinde gerçekleştirilen kullanıcı ve sistem aktivitelerinin kayıtlarını yetkili yöneticilere görüntüleme arayüzü sağlar. Veri sunucu tarafında (server-mode) sorgulanır ve DataTableKit aracılığıyla tablo biçiminde gösterilir.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün tek sorumluluğu olan yönetici denetim günlüğü sayfasının kullanıcı arayüzünü ve sayfa düzeyindeki işlevselliği tanımlar. Sayfa bir başlık ve Suspense ile sarılmış bir içerik bölgesi içerir; veri yönetimi ve filtreleme AuditLogTableBody bileşeni ile useAdminTable özel kancası üzerinden gerçekleştirilir.
- AdminAuditLogPage

## Bağımlılıklar
**İç bağımlılıklar:** AuditLogTableBody bileşeni sayfanın ana içerik bölümünü oluşturur ve useAdminTable kancası üzerinden veri akışını yönetir.

**Dış bağımlılıklar:** DataTableKit (tablo sunumu), useSearchParams (URL parametreleri), Suspense (yükleme durumu yönetimi) modülün kullandığı dış bağımlılıklardır.

**Mimari not:** Suspense sarmalama yapısı, yükleme durumlarının doğru işlenmesini sağlayacak şekilde uygulanmıştır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanamaz.

**Gerekçe:** Fonksiyon gövdesi verilmemiştir; yalnızca fonksiyon imzası (`AdminAuditLogPage() -> React.FC`) mevcuttur. Mimari varsayımlar yalnızca fonksiyon gövdesindeki mantıksal akış, koşul kontrolleri ve bağımlılıklardan türetilebilir. Gövde mevcut olmadığından modülün çalışması için hangi koşulların gerekli olduğu belirlenememektedir.

---

## FONKSİYON DETAYLARI

### AdminAuditLogPage
**Ne yapar**: Bu fonksiyon, uygulamanın admin denetim kayıtları sayfasını.render eder. Denetim kayıtlarını (admin_audit_log) DataTableKit kullanarak server-mode'da gösteren bir sayfa oluşturur.

**Nasıl yapar**: Sayfa, bir başlık ve Suspense bileşeni içerir. Veri, URL parametreleri ve filtre durumu AuditLogTableBody bileşeni tarafından useAdminTable özel kancasıyla yönetilir. useSearchParams kancası Suspense ile sarılmıştır, bu da CLAUDE.md kuralı 5 / K2'ye uygun şekilde yükleme durumlarının doğru işlenmesini sağlar.

**Parametreler**: Bu fonksiyon parametre almaz.

**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Bu bileşen, denetim kayıtları sayfasının tamamını temsil eder ve Suspense ile sarılmış bir yapıda veri yüklemeyi yönetir.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./AuditLogTableBody::AuditLogTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminAuditLogPage.tsx::AdminAuditLogPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.titles.audit')` ve `t('admin.audit.subtitle')` çağrılarıyla sayfa başlığı ve alt başlık metinlerini yerelleştirir
- **Dönüş**: JSX — bir `<div>` kapsayıcısı içinde `AdminPageHeader` bileşeni (`title` ve `description` prop'ları ile) ve `Suspense` ile sarılmış `AuditLogTableBody` bileşeni; `Suspense`'ın `fallback` prop'unda `AdminSkeleton` (`variant="table"`, `count={5}`, `rows={6}`) kullanılır

---

## NODE ID STANDARD

  file: src\views\admin\AdminAuditLogPage.tsx
  function: src\views\admin\AdminAuditLogPage.tsx::AdminAuditLogPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminAuditLogPage

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