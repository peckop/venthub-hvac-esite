---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\audit-logs\page.tsx
skeleton_hash: 1404f0f7591f51a4
entity_hashes:
  func:Page: 2750e5b95f2055b0
  overview: c697ddf7c92cfa4f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-06T21:54:00Z
---

## Genel Bakış
Yönetim panelindeki denetim kayıtları sayfasının giriş noktasıdır. Tek bir sarmalayıcı bileşen içeren bu modül, dinamik import ile asıl sayfa bileşenini yükler ve Next.js yönlendirme yapısının parçası olarak çalışır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Root bileşeni tanımlar ve dinamik yükleme ile asıl sayfa içeriğini render eder. Yönetim panelinin `/admin/audit-logs` rotasına karşılık gelir.
- Page

---



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
- **AdminAuditLogsPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminAuditLogPage'),
  { ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/audit-logs/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (değişken yok — doğrudan JSX döner)
- **Dönüş**: JSX element — `AdminAuditLogsPage` bileşenini render eder; bu bileşen `next/dynamic` ile dinamik olarak import edilmiş olup istemci tarafında懒 yüklenir (loading durumunda fallback gösterir)

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