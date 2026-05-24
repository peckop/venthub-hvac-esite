---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\products\page.tsx
skeleton_hash: 1d95369f5f63b92b
generated_at: 2026-05-23T21:48:13Z
---

## Genel Bakış
Bu modül, yönetim panelindeki ürün listesi sayfasının giriş noktasıdır. Next.js App Router yapısında bir sayfa bileşeni olarak `AdminProductsPage` bileşenini dinamik olarak içe aktarır ve render eder. Sayfa, ürünlerin görüntülenmesi ve yönetilmesi için gerekli UI'yi sağlar.

## Fonksiyon Grupları
### Sayfa Render ve Layout
Sayfanın oluşturulması ve temel düzenin sağlanması sorumluluğunu taşır. Tek bir fonksiyon aracılığıyla admin ürün sayfasının tüm JSX yapısını üretir.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Admin ürünler sayfasının ana bileşenini temsil eder. Uygulamanın yönlendirme yapısında (`admin/products` rotası) ilgili sayfanın görüntülenmesini sağlamak için giriş noktası olarak görev yapar.

**Nasıl yapar**: Herhangi bir parametre veya karmaşık mantık içermez. Doğrudan `<AdminProductsPage />` JSX elementini döndürerek tüm görsel ve durumsal sorumluluğu alt bileşene devreder. Bu sayede modüler bir yapı sağlanır ve sayfa, gerektiğinde tembel yükleme (lazy loading) için uygun hale gelir.

**Parametreler**:
- Parametre almaz.

**Dönüş**: `<AdminProductsPage />` – Admin ürünler sayfasını temsil eden React JSX elemanı. Dönüş tipi `JSX.Element` olarak değerlendirilir.

---

## SABİTLER
- **AdminProductsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminProductsPage'),
  { ssr:...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\products\page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**:
  (yok)
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\app\admin\products\page.tsx
  function: src\app\admin\products\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page