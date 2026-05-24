---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\returns\page.tsx
skeleton_hash: efb4e684e247b5a7
generated_at: 2026-05-23T21:48:17Z
---

## Genel Bakış
Bu modül, yönetim panelindeki iade (returns) sayfasının rota bileşenini tanımlar. Tek bir fonksiyon olan `Page`, `AdminReturnsPage` bileşenini dinamik olarak yükleyip render ederek sayfanın görüntülenmesini sağlar. Modülün kendisi durum yönetimi veya veri çekme işlemi içermez; bu sorumluluklar harici bileşene bırakılmıştır.

## Fonksiyon Grupları
### Sayfa Bileşeni (Page Component)
Bu grup, iade sayfasının giriş noktası olarak görev yapan ana bileşeni içerir. Sayfa yönlendirme ve alt bileşen yükleme işlemini üstlenir.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, yönetici panelindeki iade/return sayfasının ana görünümünü oluşturan `AdminReturnsPage` React bileşenini döndürür.
**Nasıl yapar**: Herhangi bir bağımlılık veya durum yönetimi olmaksızın, doğrudan `<AdminReturnsPage />` JSX elemanını döndürerek çalışır.
**Parametreler**: Parametre almaz.
**Dönüş**: `<AdminReturnsPage />` — iade işlemleriyle ilgili yönetim arayüzünü sağlayan React bileşeni.

---

## SABİTLER
- **AdminReturnsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminReturnsPage'),
  { ssr: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/returns/page.tsx::Page
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `<AdminReturnsPage />` — `dynamic` import ile yüklenen `AdminReturnsPage` bileşenini render eder. Yan etki yok, sadece JSX döndürür.

---

## NODE ID STANDARD

  file: src\app\admin\returns\page.tsx
  function: src\app\admin\returns\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page