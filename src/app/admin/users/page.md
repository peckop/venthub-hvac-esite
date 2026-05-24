---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\users\page.tsx
skeleton_hash: a1d1d34ac76683eb
generated_at: 2026-05-23T21:48:21Z
---

## Genel Bakış
Bu modül, yönetim panelindeki kullanıcı yönetimi bölümünün Next.js App Router üzerindeki giriş noktasıdır. Tek bir React bileşeni olan `Page` fonksiyonu, dinamik olarak yüklediği `AdminUsersPage` görünümünü render ederek kullanıcı listeleme ve yönetim arayüzünü tarayıcıya taşır.

## Fonksiyon Grupları
### Sayfa Bileşeni (Route Entry Point)
Bu grup, sayfanın route handler'ı olarak görev yapar. Modülün tek dışa aktarımı olan `Page` fonksiyonu, ilgili UI bileşenini yükleyip render ederek kullanıcı yönetimi işlevselliğini sunar.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır. (Fonksiyon gövdesi analiz edilemediğinden herhangi bir varsayım üretilememiştir.)

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Admin kullanıcı yönetimi sayfasını temsil eden `AdminUsersPage` bileşenini döndürür.
**Nasıl yapar**: Parametre almayan bir React fonksiyonel bileşeni olarak tanımlanmıştır. Doğrudan `<AdminUsersPage />` JSX ifadesini döndürerek ilgili sayfayı render eder.
**Parametreler**: Yok.
**Dönüş**: `<AdminUsersPage />` — Admin kullanıcı yönetimi sayfasının React JSX öğesi.

---

## SABİTLER
- **AdminUsersPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminUsersPage'),
  { ssr: fa...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\users\page.tsx::Page
- **params**: yok
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (AdminUsersPage bileşeni)

---

## NODE ID STANDARD

  file: src\app\admin\users\page.tsx
  function: src\app\admin\users\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page