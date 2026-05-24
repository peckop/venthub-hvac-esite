---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\audit-logs\page.tsx
skeleton_hash: 64b1cdb0fece9d6a
generated_at: 2026-05-23T21:47:43Z
---

## Genel Bakış
Bu modül, yönetim panelindeki denetim kayıtları sayfasını oluşturan bir React bileşeni içerir. Tek bir `Page` fonksiyonu, görünüm katmanını dinamik olarak yükleyerek kullanıcıya sistemdeki tüm denetim olaylarını listeler.

## Fonksiyon Grupları
### Sayfa Bileşeni ve Dinamik Yükleme
Sayfanın root bileşenini tanımlar; görsel katmanı dinamik import ile getirir ve JSX olarak döndürür. Next.js sayfa yönlendirmesinin başlangıç noktasıdır.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Uygulamanın yönetici denetim günlüğü (audit log) sayfasını temsil eden bir React bileşenidir. Kullanıcıya denetim kayıtlarını listeleyen arayüzü sunar.
**Nasıl yapar**: Dönüş değeri olarak `<AdminAuditLogsPage />` JSX ögesini döndürür. Bu bileşen, audit log verilerini görüntülemek ve yönetmek için gerekli tüm alt bileşenleri ve mantığı içerir.
**Parametreler**: Herhangi bir parametre almaz.
**Dönüş**: `React.JSX.Element` — `AdminAuditLogsPage` adlı React bileşeninin render edilmiş halini döndürür.

---

## SABİTLER
- **AdminAuditLogsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminAuditLogPage'),
  { ssr:...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/audit-logs/page.tsx::Page
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `<AdminAuditLogsPage />` (JSX)

---

## NODE ID STANDARD

  file: src\app\admin\audit-logs\page.tsx
  function: src\app\admin\audit-logs\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page