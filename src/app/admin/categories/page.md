---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\categories\page.tsx
skeleton_hash: a52e9b8539fa4dbd
generated_at: 2026-05-23T21:47:45Z
---

## Genel Bakış

Bu modül, yönetim panelindeki kategoriler sayfasının giriş noktasını tanımlar. Tek bir React bileşeni aracılığıyla sayfanın görüntülenmesini sağlar; sayfa içeriğini dinamik olarak başka bir bileşenden yükleyerek kullanıcıya sunar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Admin kategorileri sayfasının tamamını render eden ana bileşendir. Dinamik import yöntemiyle alt bileşeni çağırır ve JSX çıktısını döndürür.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Admin panelinde kategoriler bölümünün ana sayfa bileşenini döndürür. Kullanıcıların kategorileri görüntülemesi, yönetmesi ve düzenlemesi için oluşturulmuş üst düzey bir React bileşenidir.
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanmıştır ve doğrudan `<AdminCategoriesPage />` JSX elementini döndürür. Bu bileşen, admin kategoriler sayfasının tüm alt bileşenlerini, state yönetimini ve kullanıcı etkileşimlerini içeren kapsayıcı bir yapıdır.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `JSX.Element` — `<AdminCategoriesPage />` bileşenini döndürür. Bu bileşen, kategorilerle ilgili tüm CRUD işlemlerini ve listelemeyi sağlayan admin sayfasını temsil eder.

---

## SABİTLER
- **AdminCategoriesPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminCategoriesPage'),
  { ss...`

---

## AST POINTERS

### [N1_Page] AST Pointer: src/app/admin/categories/page.tsx::Page
- **params**: yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `<AdminCategoriesPage />` JSX elemanı (React bileşeni) — Admin kategorileri sayfasını render eder.

---

## NODE ID STANDARD

  file: src\app\admin\categories\page.tsx
  function: src\app\admin\categories\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page