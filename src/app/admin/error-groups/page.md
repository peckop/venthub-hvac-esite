---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\error-groups\page.tsx
skeleton_hash: 17706649c0ccf0e3
generated_at: 2026-05-23T21:47:52Z
---

## Genel Bakış
`Page` fonksiyonu, yönetim panelindeki hata grupları sayfasının ana bileşenini oluşturur. Bu bileşen, ilgili alt görünümleri çağırarak hata gruplarının listelenmesini ve yönetilmesini sağlayan bir arayüz sunar.

## Fonksiyon Grupları
### Sayfa Render ve UI Oluşturma
Sayfanın temel yapısını kurar, gerekli layout ve içeriği birleştirerek son kullanıcıya eksiksiz bir yönetim ekranı sunar.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Hata grupları yönetim sayfası için ana bileşeni döndürür. Bu sayfa, admin panelinde hata gruplarının listelenmesi ve yönetilmesi işlevlerini üstlenen AdminErrorGroupsPage bileşenini render eder.
**Nasıl yapar**: Fonksiyon parametre almaz ve doğrudan `<AdminErrorGroupsPage />` JSX ifadesini döndürür. Bu yapı, React'in bileşen hiyerarşisinde ilgili sayfanın içeriğini oluşturmasını sağlar.
**Parametreler**: Bu fonksiyon parametre almaz.
**Dönüş**: React JSX elementi: `<AdminErrorGroupsPage />`. Çağrıldığında, admin hata grupları sayfasını temsil eden AdminErrorGroupsPage bileşeninin bir örneğini döndürür.

---

## SABİTLER
- **AdminErrorGroupsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminErrorGroupsPage'),
  { s...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\error-groups\page.tsx::Page
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\app\admin\error-groups\page.tsx
  function: src\app\admin\error-groups\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page