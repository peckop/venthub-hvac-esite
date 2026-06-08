---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\account\shipments\page.tsx
skeleton_hash: f252b5d33929db96
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: 196d231af4e46298
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T08:57:36Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun kullanıcı hesap sayfası altındaki sevkiyatlar (shipments) bölümünü görüntüleyen, dil parametresini destekleyen Next.js sayfa bileşenidir. Kullanıcıların kendilerine ait sevkiyat bilgilerine erişebileceği ana sayfa olarak işlev görür ve uygulamanın yönlendirme yapısına uyumlu şekilde, hesap altındaki sevkiyatlar rotasında otomatik yüklenir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sevkiyatlar sayfasının tüm görsel yapısını oluşturan ana giriş noktası. Alt bileşenleri kullanarak kullanıcı arayüzünü sunar ve herhangi bir iş mantığı barındırmaz.
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

### [N1_NASIL] AST Pointer: src/app/[lang]/account/shipments/page.tsx::Page
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\app\[lang]\account\shipments\page.tsx
  function: src\app\[lang]\account\shipments\page.tsx::Page

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