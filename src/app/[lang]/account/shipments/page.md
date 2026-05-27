---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\account\shipments\page.tsx
skeleton_hash: ec39e9ffa86e6b02
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: d9c0633b70be8b36
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-27T17:59:43Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun kullanıcı hesap bölümündeki sevkiyatlar (shipments) sayfasını oluşturan Next.js sayfa bileşenidir. Kullanıcıların kendi hesaplarına ait tüm sevkiyat bilgilerini görüntüleyebileceği sayfa düzeyinde kullanıcı arayüzünü oluşturur. Platformun yönlendirme yapısıyla uyumlu çalışarak, hesap altındaki sevkiyatlar rotasında otomatik olarak yüklenen ana bileşen görevi görür.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sevkiyatlar sayfasının tüm görsel ve işlevsel yapısını inşa eden, alt bileşenler ve durum yönetimi araçlarından faydalanarak kullanıcıya bilgi sunumunu sağlayan ana girişi barındırır.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Uygulamanın `src/app/account/shipments/page.tsx` yolunda tanımlı shipments sayfasının ana bileşenini render eder. Sayfanın giriş noktası olarak işlev görür ve kullanıcı arayüzünün yüklenmesini sağlar.
**Nasıl yapar**: Doğrudan `<PageComponent />` JSX ifadesini döndürerek `PageComponent` bileşenini çağırır. Herhangi bir state yönetimi veya iş mantığı içermez, yalnızca bir sarmalayıcı (wrapper) görevi üstlenir.
**Parametreler**: Parametre almaz.
**Dönüş**: `<PageComponent />` — Sayfanın kullanıcı arayüzünü oluşturan React JSX bileşeni.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\account\shipments\page.tsx::Page
- **params**: yok (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: JSX (PageComponent bileşeni)

---

## NODE ID STANDARD

  file: src\app\account\shipments\page.tsx
  function: src\app\account\shipments\page.tsx::Page

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
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)