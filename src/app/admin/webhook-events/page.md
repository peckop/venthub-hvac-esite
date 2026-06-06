---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\webhook-events\page.tsx
skeleton_hash: fad447b6edb0cff9
entity_hashes:
  func:Page: 03bf0c7eea267025
  overview: c697ddf7c92cfa4f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-06T21:54:19Z
---

## Genel Bakış
Bu modül, yönetim panelindeki webhook olayları sayfasını sunan bir React giriş noktasıdır. Tek bir bileşeni (`Page`) dışa aktararak, sayfanın asıl içeriğini dinamik olarak yüklenen `AdminWebhookEventsPage` alt bileşenine devreder.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün dışa açık tek bileşenini tanımlar. Bu bileşen, Next.js App Router yapısında ilgili rotaya bağlanır ve kullanıcıya sayfa arayüzünü sunar.
- Page

---



---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Admin panelindeki webhook olayları sayfasını render eder. Bu fonksiyon, Next.js App Router yapısında `/admin/webhook-events` rotasının sayfa bileşenini tanımlar ve tarayıcıda webhook olaylarının görüntülenmesini sağlar.

**Nasıl yapar**: Fonksiyon, içeriğinde herhangi bir mantık veya state yönetimi barındırmaz. Doğrudan `AdminWebhookEventsPage` adlı alt bileşeni return ederek sayfa yapısının render edilmesini tetikler. Bu basit yapı, sayfa yüklemesi ve yönlendirme işlemlerinin Next.js tarafından otomatik olarak yönetilmesini sağlar.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz

**Dönüş**: JSX Element — `AdminWebhookEventsPage` componentinin render edeceği arayüz unsurunu döndürür. Return edilen değer, React tarafından işlenerek tarayıcıda webhook olayları yönetim arayüzü olarak görüntülenir.

---

## SABİTLER
- **AdminWebhookEventsPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminWebhookEventsPage'),...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/webhook-events/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde hiçbir değişken tanımlanmamış)
- **Dis Bilesenler**: `AdminWebhookEventsPage` — import edilmiş React bileşeni, fonksiyon içinde `<AdminWebhookEventsPage />` şeklinde JSX olarak render ediliyor
- **Dönüş**: JSX Element (`<AdminWebhookEventsPage />`) — bir sonraki React bileşeninin render edeceği UI yapısını döndürüyor

---

## NODE ID STANDARD

  file: src\app\admin\webhook-events\page.tsx
  function: src\app\admin\webhook-events\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-center`, `text-slate-400`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`