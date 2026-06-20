---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\destek\hesaplayicilar\kanal\page.tsx
skeleton_hash: 4ea5d13616ae5681
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: b10dad1d55a83f15
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:46:14Z
---

## Genel Bakış
Bu modül, kanal hesaplayıcı sayfasının dil destekli ana giriş noktasıdır. Tek bir React bileşeni (`Page`) aracılığıyla kullanıcıya kanal hesaplama arayüzünü sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Sayfanın tüm kullanıcı arayüzünü ve hesaplama formunu oluşturarak bir React bileşeni olarak sunar.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel aksiyomlar aşağıdadır. Fonksiyon gövdesi detaylı biçimde sunulmadığı için, mevcut bilgiye dayalı minimum varsayımlar belirlenmiştir.

**[Aksiyom 1]**: Eğer `Page()` bileşeni geçerli bir React JSX yapısı (ReactElement) döndürmezse, React render hatası oluşur ve sayfa görüntülenemez.

**[Aksiyom 2]**: Eğer bu bileşen Next.js App Router yapısı içinde (`[lang]` segmentli bir yolda) kullanılmak üzere tanımlanmışsa ve bileşen içinden dil parametresi (`params.lang`) erişimi gerekiyorsa, ancak fonksiyon imzasında bu parametre tanımlanmamışsa, dil parametresine erişilemez ve sayfa doğru dilden içerik gösteremez.

**[Aksiyom 3]**: Eğer `Page()` fonksiyonu side-effect (veri çekme, state yönetimi) gerektiren bir sayfa ise, ancak fonksiyon imzasında `async` tanımlanmamışsa, sunucu taraflı veri çekme (server-side data fetching) yapılamaz.

> **Not**: Fonksiyon gövdesi tam olarak sunulmadığı için, bileşenin hangi alt bileşenleri render ettiği, hangi hesaplama mantığını içerdiği ve hangi state'leri yönettiği belirsizdir. Bu aksiyomlar yalnızca mevcut fonksiyon imzası ve modül yapısına dayalı minimum varsayımlardır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, bir Next.js sayfa bileşenidir ve tarayıcıda render edilecek olan sayfanın kök bileşenini döndürür. Kanal hesaplayıcı sayfasının giriş noktasını oluşturur.

**Nasıl yapar**: Fonksiyon herhangi bir mantıksal işlem yapmaz, doğrudan `PageComponent` bileşenini döndürür. Bu yapı, sayfa bileşenini sarmalayan bir wrapper (sarmalayıcı) görevi görür. Gerçek sayfa içeriği ve mantığı `PageComponent` içinde yer alır.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `JSX.Element` — `PageComponent` bileşeninin render ettiği JSX yapısını döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../../views/calculators/DuctCalcPage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/destek/hesaplayicilar/kanal/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde hiç değişken tanımlanmamış)
- **Dönüş**: `<PageComponent />` JSX elemanı — import edilen `DuctCalcPage` view'ını render eder; sayfa içeriği tamamen `PageComponent` bileşenine aktarılır

---

## NODE ID STANDARD

  file: src\app\[lang]\destek\hesaplayicilar\kanal\page.tsx
  function: src\app\[lang]\destek\hesaplayicilar\kanal\page.tsx::Page

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