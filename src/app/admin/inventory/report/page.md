---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\inventory\report\page.tsx
skeleton_hash: a90c7fedc66c4a2a
generated_at: 2026-05-23T21:47:57Z
---

## Genel Bakış
Bu modül, yönetim panelindeki envanter rapor sayfasının ana giriş noktasını oluşturur. `InventoryReportPage` adlı tek bileşen, sayfanın tüm yapısını kapsayan üst düzey bir view bileşenini dinamik olarak yükler ve render eder. Böylece envanter raporlarının liste, grafik ve filtreleme gibi alt bileşenleri tek bir sayfada birleşir.

## Fonksiyon Grupları
### Sayfa Render ve Bileşen Yönlendirme
Bu grup, rapor sayfasının kök bileşenini tanımlar ve asıl görünüm katmanına (view) yönlendirme yaparak sayfa içeriğini kullanıcıya sunar.  
- InventoryReportPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### InventoryReportPage
**Ne yapar**: Bu fonksiyon, admin panelinde envanter rapor sayfasını görüntülemek için kullanılan bir React fonksiyonel bileşenidir. Sayfa, kullanıcıya envanter raporlarını listeleyip yönetme imkanı sunar.
**Nasıl yapar**: Herhangi bir parametre almaz ve doğrudan `AdminInventoryReportPage` bileşenini döndürür. Bu sayede admin envanter rapor sayfasının modüler bir şekilde oluşturulmasını sağlar.
**Parametreler**:
- (parametre yok)
**Dönüş**: JSX.Element — `AdminInventoryReportPage` adlı alt bileşeni döndürür. Bu bileşen, envanter raporlarına ait tüm kullanıcı arayüzü öğelerini içerir.

---

## SABİTLER
- **AdminInventoryReportPage** (call) — `dynamic(
  () => import('../../../../views/admin/AdminInventoryReportPage'),...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/inventory/report/page.tsx::InventoryReportPage
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (AdminInventoryReportPage bileşenini döndürür)

---

## NODE ID STANDARD

  file: src\app\admin\inventory\report\page.tsx
  function: src\app\admin\inventory\report\page.tsx::InventoryReportPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryReportPage