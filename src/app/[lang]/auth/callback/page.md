---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\app\[lang]\auth\callback\page.tsx
skeleton_hash: a9d8249ac59fd741
entity_hashes:
  func:Page: 9c08060caeb88969
  overview: 87f123706b8e2f74
  style_tokens: 9144ece4bffe7964
generated_at: 2026-08-27T06:52:45Z
---

## Genel Bakış
Bu modül, çok dilli bir uygulama yapısında kimlik doğrulama sağlayıcısından gelen callback isteklerini karşılayan sayfa bileşenini içerir. `[lang]` dinamik rotası sayesinde farklı diller için aynı callback akışı sunulur. Modül, gerçek iş mantığını barındıran `PageComponent` bileşenini ithal edip render ederek bir sarmalayıcı görevi görür.

## Fonksiyon Grupları
### Callback Sayfa Sarmalayıcı
Kimlik doğrulama callback sayfasını render eden, parametre almayan ve doğrudan `PageComponent` bileşenini döndüren tek bir bileşenden oluşur. Tüm callback işleme mantığı views katmanındaki `PageComponent` bileşenine devredilmiştir.
- Page

## Bağımlılıklar
- **İç bağımlılık**: Yok; modül tek bir fonksiyondan oluşur ve kendi içinde başka fonksiyon çağırmaz.
- **Dış bağımlılık**: `PageComponent` bileşeni, `../../../../views/AuthCallbackPage` yolundan ithal edilir. Bu bileşen, callback sürecinin asıl iş mantığını (token işleme, yönlendirme vb.) gerçekleştirir.
- **Dinamik/lazy yükleme**: Kaynakta bu yönde bir bilgi bulunmuyor.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, bir sayfa bileşenini (PageComponent) React'ın `Suspense` mekanizması ile sararak, bileşen yüklenirken bir yükleme göstergesi (spinner) gösteren bir sayfa kabuğu oluşturur. Asıl sayfa içeriği yüklenene kadar kullanıcıya görsel bir geri bildirim sağlar.

**Nasıl yapar**: Fonksiyon, `PageComponent` bileşenini `<Suspense>` bileşeni ile çevreler. `Suspense` bileşeninin `fallback` prop'una, sayfanın tamamını kaplayan (`min-h-screen`) ve içinde ortalanmış bir yükleme animasyonu (spinner) bulunan bir `<div>` atanmıştır. Bu animasyon, Tailwind CSS sınıfları (`animate-spin`, `rounded-full`, `border-b-2`, `border-primary-navy`) ile stilize edilmiştir. `PageComponent` yüklenene kadar bu fallback içeriği gösterilir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Fonksiyon, bir JSX elementi döndürür. Bu element, `PageComponent`'i saran bir `Suspense` bileşenidir.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/AuthCallbackPage::PageComponent
- import: react::React
- import: react::Suspense

---

## NODE ID STANDARD

  file: src\app\[lang]\auth\callback\page.tsx
  function: src\app\[lang]\auth\callback\page.tsx::Page

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
- **Renkler:** `border-b-2`, `border-primary-navy`
- **Layout:** `flex`, `h-12`, `items-center`, `justify-center`, `min-h-screen`, `w-12`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-spin`, `rounded-full`