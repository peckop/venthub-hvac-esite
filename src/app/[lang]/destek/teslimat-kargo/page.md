---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\destek\teslimat-kargo\page.tsx
skeleton_hash: be5a4a7e70d89475
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: eeb2664f8ef21a75
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T08:57:36Z
---

## Genel Bakış
Bu modül, destek sayfası yapısı içinde "teslimat ve kargo" konusuna adanmış, tek bir sayfa bileşeninden oluşan basit bir yapıdır. Sayfanın asıl içeriği ve kullanıcı arayüzü, Page bileşeni tarafından iç içe bir başka bileşene (`PageComponent`) devredilmiştir; bu da modülün temel sorumluluğunun sayfa yapısını tanımlamak ve doğru bileşene yönlendirmek olduğunu gösterir.

## Fonksiyon Grupları
### Sayfa Yönlendirme ve Yapı
Bu grup, modülün temel sayfa rotasını tanımlayan ve içeriği ilgili bileşene yönlendiren yapısal bileşeni içerir. Modülün tek işlevi, doğru sayfa arayüzünü başlatmaktır.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Bu fonksiyon, `/destek/teslimat-kargo` rotasında sunulacak sayfanın üst düzey React bileşenini döndürür. Next.js App Router yapısında bir sayfa tanımlayıcısı olarak görev yapar ve sayfanın tüm görünümünü `PageComponent` bileşenine devreder.

**Nasıl yapar**: Fonksiyon, herhangi bir mantık veya veri işleme gerçekleştirmeden doğrudan `PageComponent` bileşenini render eder. Tüm sayfa içeriği, layout yapısı ve işlevsellik tamamen `PageComponent` içinde tanımlıdır. Bu fonksiyon yalnızca sayfa dosyası (page.tsx) için gerekli olan default export yapısını sağlar.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almamaktadır.

**Dönüş**: `JSX.Element` — `PageComponent` bileşeninin render edilmiş JSX yapısını döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/destek/teslimat-kargo/page.tsx::Page
- **params**: (yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde hiçbir değişken tanımlanmamış veya kullanılmamıştır)
- **Dönüş**: JSX (`<PageComponent />`) — import edilen `PageComponent` bileşenini doğrudan render eder

---

## NODE ID STANDARD

  file: src\app\[lang]\destek\teslimat-kargo\page.tsx
  function: src\app\[lang]\destek\teslimat-kargo\page.tsx::Page

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