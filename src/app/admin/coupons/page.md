---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\coupons\page.tsx
skeleton_hash: b5364a7dcacd7105
generated_at: 2026-05-23T21:47:51Z
---

## Genel Bakış
Modül, yönetim panelinde kuponların listelendiği ve yönetildiği ana sayfa bileşenini tanımlar. Tek bir `Page` dışa aktarımı üzerinden sayfanın UI katmanı oluşturulur ve kupon verilerinin görsel sunumu alt bileşen aracılığıyla sağlanır.

## Fonksiyon Grupları
### UI Oluşturma ve Veri Sunumu
Kuponların tablo ya da kart biçiminde görüntülenmesi, filtrelenmesi ve sayfalanması gibi görsel işlevleri kapsar.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, admin kuponları yönetim sayfasını render eden bir React bileşenidir. Uygulamanın admin panelinde kuponları görüntüleme ve yönetme işlevini sağlayan `AdminCouponsPage` bileşenini döndürür.
**Nasıl yapar**: Fonksiyon herhangi bir parametre almaz ve doğrudan `AdminCouponsPage` bileşenini JSX olarak döndürür. Bu yapı, Next.js dosya tabanlı routing sistemi ile otomatik olarak sayfa olarak tanımlanır.
**Parametreler**: Yok.
**Dönüş**: JSX ögesi (`AdminCouponsPage` bileşeni). Döndürülen bileşen, sayfada kupon listesi, oluşturma ve düzenleme gibi işlemleri sağlar.

---

## SABİTLER
- **AdminCouponsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminCouponsPage'),
  { ssr: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/coupons/page.tsx::Page
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (`<AdminCouponsPage />`)

---

## NODE ID STANDARD

  file: src\app\admin\coupons\page.tsx
  function: src\app\admin\coupons\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page