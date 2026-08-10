---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\destek\hesaplayicilar\hrv\page.tsx
skeleton_hash: 13bcdfaec4698e95
entity_hashes:
  func:Page: 3f2298054a9d2ba4
  overview: 92457a7c21ad9373
  style_tokens: 9144ece4bffe7964
generated_at: 2026-06-19T20:46:14Z
---

## Genel Bakış
Bu modül, HRV (Heat Recovery Ventilation — Isı Geri Kazanımlı Havalandırma) hesaplayıcısının kullanıcı arayüzünü sunan tek bir sayfa bileşeninden oluşur. Modül, dil parametreli bir Next.js sayfa rotası olarak yapılandırılmıştır ve yüklenme sırasında animasyonlu bir spinner ile Suspense sarmalayıcısı kullanır.

## Fonksiyon Grupları
### Sayfa Rendersi
Tek bir üst seviye sayfa bileşeni tanımlar; dil desteğiyle birlikte HRV hesaplayıcının tüm giriş ve çıktı arayüzünü Suspense içinde sunar.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Modül sadece bir React sayfa bileşeni (`Page`) içermekte ve fonksiyon gövdesinde herhangi bir mantıksal iş kuralı, koşul kontrolü veya veri doğrulama içeriği bulunmamaktadır. Sayfa, UI rendering yaptığı varsayılmakta ancak girdi doğrulama, hesaplama mantığı veya hata yönetimi gibi çıkarılabilecek mimari varsayımlar içermemektedir. Fonksiyon imzası boş olup default değer veya parametre tanımı bulunmamaktadır. Bu nedenle, modülün doğru çalışması için zorunlu olan koşullar belirlenememiştir.

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Sayfa düzeyinde bir React bileşenidir ve ana sayfa içeriğini Suspense sarıcısı ile birlikte sunar. Asenkron yüklemeler sırasında kullanıcıya yükleme animasyonu göstererek kesintisiz bir deneyim sağlar.

**Nasıl yapar**: Fonksiyon, React Suspense bileşenini kullanarak `PageComponent`'i sarmalar. Suspense bileşeni, `PageComponent` içindeki asenkron işlemler (örneğin veri çekme) henüz tamamlanmamışken `fallback` prop'u aracılığıyla bir yükleme göstergesi (spinner) render eder. Bu spinner, tam ekran yüksekliğinde (min-h-screen) ve ortalı şekilde görüntülenen, dönen bir yuvarlak animasyonlu yükleme ikonudur. Suspense mekanizması sayesinde asenkron içerik hazır olduğunda fallback otomatik olarak ana bileşenle değiştirilir.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almamaktadır. Sıfır argümanlı bir React fonksiyonel bileşenidir.

**Dönüş**: JSX elementi döndürür. Suspense ile sarılmış `PageComponent` bileşenini veya yükleme sırasında fallback olarak animasyonlu bir spinner div'ini render eder. Doğrudan return ifadesi ile JSX ağacı dışa aktarılır.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../../views/calculators/HRVCalcPage::PageComponent
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\[lang]\destek\hesaplayicilar\hrv\page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde herhangi bir değişken bildirimi veya ataması yoktur)
- **Dönüş**: `return` ifadesi ile bir JSX (`<Suspense>`) bileşeni döndürülür. Bileşen, asıl sayfa içeriğinin (`PageComponent`) yüklenmesini beklerken bir yükleme animasyonu (fallback) gösterir.

---

## NODE ID STANDARD

  file: src\app\[lang]\destek\hesaplayicilar\hrv\page.tsx
  function: src\app\[lang]\destek\hesaplayicilar\hrv\page.tsx::Page

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