---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\webhook-events\page.tsx
skeleton_hash: 64ca1a86eba5b3eb
generated_at: 2026-05-23T21:48:23Z
---

## Genel Bakış
`src/app/admin/webhook-events/page.tsx` dosyası, yönetim panelinde webhook olaylarının listelenip görüntülendiği sayfanın giriş bileşenini tanımlar. Tek bir React fonksiyonel bileşeni (`Page`) dışa aktarır. Bu bileşen, tüm sayfa yapısını ve mantığını içeren bir alt bileşeni (`AdminWebhookEventsPage`) render eder.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Bu grup, webhook olayları sayfasını oluşturan tek fonksiyondan oluşur. Sayfanın dışa açık noktası olarak React ağacına eklenir ve alt bileşeni tetikleyerek kullanıcı arayüzünün sunulmasını sağlar.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Admin arayüzünde webhook olaylarının listelendiği sayfayı oluşturan React bileşenini döndürür.
**Nasıl yapar**: Herhangi bir parametre almadan, `AdminWebhookEventsPage` adlı JSX bileşenini doğrudan döndürür. Bu yapısıyla bir routing/template fonksiyonu görevi görür.
**Parametreler**: Yok.
**Dönüş**: `<AdminWebhookEventsPage />` — Webhook olaylarının yönetildiği ana sayfa bileşeni.

---

## SABİTLER
- **AdminWebhookEventsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminWebhookEventsPage'),
  {...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/webhook-events/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: React JSX element (AdminWebhookEventsPage bileşeni render edilir)

---

## NODE ID STANDARD

  file: src\app\admin\webhook-events\page.tsx
  function: src\app\admin\webhook-events\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page