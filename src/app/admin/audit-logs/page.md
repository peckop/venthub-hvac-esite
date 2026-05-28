---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\audit-logs\page.tsx
skeleton_hash: 64b1cdb0fece9d6a
entity_hashes:
  func:Page: 2750e5b95f2055b0
  overview: 3abd4459140e249f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-05-27T17:58:33Z
---

## Genel Bakış
Bu modül, yönetim panelindeki denetim kayıtları (audit log) sayfasını sunan tek bir React bileşeni içerir. `Page` fonksiyonu, dinamik olarak yüklenecek `AdminAuditLogsPage` bileşenini render ederek kullanıcıya sistemdeki denetim olaylarını listeler ve yönetim arayüzünün giriş noktasıdır.

## Fonksiyon Grupları
### Sayfa Bileşeni ve Dinamik Yükleme
Sayfanın kök bileşenini tanımlar; dinamik import ile `AdminAuditLogsPage` bileşenini getirir ve JSX olarak döndürür. Next.js sayfa yönlendirmesinin başlangıç noktasıdır.  
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: `Page` fonksiyonu, admin panelindeki denetim günlükleri (audit logs) sayfasını oluşturan `AdminAuditLogsPage` bileşenini döndürür. Bu fonksiyon, Next.js sayfa bileşeni olarak kullanılmak üzere tasarlanmıştır ve uygulamanın `/admin/audit-logs` yoluna karşılık gelir.

**Nasıl yapar**: Fonksiyon, doğrudan `AdminAuditLogsPage` adlı React bileşenini JSX formatında döndürür. Kendi içinde herhangi bir veri işleme, state yönetimi veya yan etki içermez; yalnızca alt bileşeni render etmekle sorumlu, sarmalayıcı (wrapper) niteliğinde bir sayfa bileşenidir.

**Parametreler**:
- Parametre almaz.

**Dönüş**: `JSX.Element` – `AdminAuditLogsPage` bileşenini temsil eden React elemanı.

---

## SABİTLER
- **AdminAuditLogsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminAuditLogPage'),
  { ssr:...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\audit-logs\page.tsx::Page
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `return <AdminAuditLogsPage />` (JSX)

---

## NODE ID STANDARD

  file: src\app\admin\audit-logs\page.tsx
  function: src\app\admin\audit-logs\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
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