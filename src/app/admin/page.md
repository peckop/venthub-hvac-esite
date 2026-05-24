---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\page.tsx
skeleton_hash: abafacd2feb2ac3d
generated_at: 2026-05-23T21:48:12Z
---

## Genel Bakış
Bu modül, yönetim panelinin ana sayfasını oluşturan React bileşenini tanımlar. Sayfanın temel düzenini sağlar ve ilgili alt bileşenleri bir araya getirerek kullanıcılara yönetim işlevlerine erişim imkanı sunar.

## Fonksiyon Grupları
### Sayfa Render Grubu
Bu grup, admin panosunun ana sayfasını render ederek kullanıcı arayüzünü sunmaktan sorumludur.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, uygulamanın admin paneli sayfasını oluşturan bir React bileşenidir. Next.js App Router yapısında bir sayfa bileşeni olarak görev yapar ve /admin yoluna karşılık gelir.

**Nasıl yapar**: Hiçbir props veya parametre almaz; doğrudan `<AdminDashboardPage />` bileşenini döndürerek admin panosunun görüntülenmesini sağlar. Fonksiyonun gövdesi yalnızca bu dönüşten ibarettir.

**Parametreler**:
- Parametre almaz.

**Dönüş**: `JSX.Element` — Uygulamanın admin gösterge panelini temsil eden bir React elemanı döndürür.

---

## SABİTLER
- **AdminDashboardPage** (call) — `dynamic(
  () => import('../../views/admin/AdminDashboardPage'),
  { ssr: f...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element (`<AdminDashboardPage />` bileşenini döndürür)

---

## NODE ID STANDARD

  file: src\app\admin\page.tsx
  function: src\app\admin\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page