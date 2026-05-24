---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\movements\page.tsx
skeleton_hash: 137709aebfeddc36
generated_at: 2026-05-23T21:48:10Z
---

## Genel Bakış
Bu modül, yönetim panelindeki hareket (movements) sayfasının ana giriş bileşenini sağlar. `Page` adlı tek bir fonksiyon ile sayfanın yetkilendirme, veri çekme ve kullanıcı arayüzü oluşturma sorumluluklarını üstlenir.

## Fonksiyon Grupları
### Sayfa Render ve İşlevsellik
Hareket sayfasının bütünlüğünü sağlayan; gerekli verileri alıp kullanıcı arayüzünü oluşturan ana sorumluluk grubudur.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Uygulamanın movements (hareketler) sayfasını oluşturan React bileşenini döndürür.
**Nasıl yapar**: Hiçbir parametre almadan, admin paneli altındaki movements bölümüne ait bir sayfa bileşenini render eder. Bileşen, kullanıcıya hareketlerle ilgili verileri sunar.
**Parametreler**: Yok.
**Dönüş**: `<PageComponent />` – bir React bileşeni (JSX elemanı).

---

## SABİTLER
- **PageComponent** (call) — `dynamic(() => import('../../../views/admin/AdminMovementsPage'), {
  ssr: fa...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\movements\page.tsx::ArrowFunction
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX React element (loading spinner)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\movements\page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX React element (`<PageComponent />`).

---

## NODE ID STANDARD

  file: src\app\admin\movements\page.tsx
  function: src\app\admin\movements\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page