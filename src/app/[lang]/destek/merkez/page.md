---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\destek\merkez\page.tsx
skeleton_hash: d9eb9bbb94564e0d
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: 77d1db6b23de9b07
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T08:57:36Z
---

## Genel Bakış
Bu modül, destek merkezi sayfasının kök bileşenini tanımlar. Tek bir `Page` fonksiyonu aracılığıyla sayfanın tüm kullanıcı arayüzü yapısını oluşturur ve Next.js'in sayfa yönlendirme mekanizması tarafından doğrudan render edilir.

## Fonksiyon Grupları
### Sayfa Oluşturma
Destek merkezi rotasının üst düzey render işlemini yönetir; alt bileşenleri bir araya getirerek sayfanın tamamını döndürür.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Next.js uygulamasında `/[lang]/destek/merkez` rotasını temsil eden sayfa bileşenidir. Kullanıcılar bu rotaya yönlendirildiğinde destek merkezi sayfasını görüntüleyebilir. Bileşen, temel bir sarmalayıcı (wrapper) görevi üstlenerek ana sayfa içeriğini sunar.

**Nasıl yapar**: Fonksiyon, doğrudan `PageComponent` bileşenini render ederek çalışır. Herhangi bir veri çekme, durum yönetimi veya koşullu renderlama işlemi içermez. Next.js'in sayfa yönlendirme mekanizması tarafından otomatik olarak çağrılır ve sayfa yapısının en üst katmanını oluşturur.Uluslararası dil parametresi (`[lang]`) Next.js'in dynamic route özelliği tarafından otomatik olarak işlenir.

**Parametreler**:
- Fonksiyon herhangi bir parametre almamaktadır

**Dönüş**: `<PageComponent />` JSX bileşeni döndürür. Bu bileşen, destek merkezi sayfasının tüm içeriğini barındıran ana bileşendir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/destek/merkez/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde hiçbir iç değişken yok)
- **Dönüş**: `<PageComponent />` JSX elemanını döndürür — import edilen `HubPage` view component'ini render eder

---

## NODE ID STANDARD

  file: src\app\[lang]\destek\merkez\page.tsx
  function: src\app\[lang]\destek\merkez\page.tsx::Page

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