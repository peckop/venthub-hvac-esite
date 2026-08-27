---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\utils\applicationUi.tsx
skeleton_hash: 568adad80ba80501
entity_hashes:
  func:accentOverlayClass: d8ef037541c09389
  func:iconFor: 8ef77854d85af42b
  overview: bbb9266e1effc225
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T08:37:16Z
---

## Genel Bakış

Bu modül, uygulama arayüzünde kullanılan ikon ve renk vurgusu (accent) ile ilgili yardımcı fonksiyonları içerir. `utils` klasöründe konumlanan modül, UI bileşenlerinin ikon ve stil ihtiyaçlarını karşılayan küçük bir yardımcı katman sunar.

## Fonksiyon Grupları

### İkon Yardımcıları
Uygulama ikonlarının belirli bir boyuta göre elde edilmesini sağlar.
- iconFor

### Stil Yardımcıları
Uygulama accent rengine göre CSS sınıf adının belirlenmesini sağlar.
- accentOverlayClass

## Bağımlılıklar

**Dış Bağımlılıklar:**
- `ApplicationIcon` tipi (ikon tanımları için)
- `ApplicationAccent` tipi (renk vurgusu tanımları için)

Bu iki tip muhtemelen başka bir modülden import edilmektedir; ancak kaynakta bu bilgi doğrulanamaz.

**İç Bağımlılıklar:**
- Modülde tanımlı iki fonksiyon birbirini çağırmaz; bağımsız çalışırlar.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri verilmediğinden, yalnızca imzalardan çıkarılabilen bağımlılık temelli varsayımlar tanımlanabilir.

**[Aksiyom 1]**: Eğer `ApplicationIcon` tipi tanımlı değilse, `iconFor` fonksiyonu çağrılamaz.

**[Aksiyom 2]**: Eğer `ApplicationAccent` tipi tanımlı değilse, `accentOverlayClass` fonksiyonu çağrılamaz.

**[Aksiyom 3]**: Eğer `Svg` sabiti mevcut değilse, bu modüldeki SVG tabanlı ikon işleme gerçekleştirilemez.

---

## FONKSİYON DETAYLARI

### iconFor
**Ne yapar**: Verilen `ApplicationIcon` tipindeki ikon adına karşılık gelen SVG bileşenini belirtilen boyutla birlikte döndüren bir ikon çözümleme fonksiyonudur. Eşleşen bir ikon bulunamazsa `null` değerini döndürür.

**Nasıl yapar**: Fonksiyon, `icon` parametresi üzerinde bir `switch` ifadesi kullanarak her bir ikon adını (`'building'`, `'wind'`, `'layers'`, `'factory'`) kontrol eder. Eşleşen durumda, `Svg` nesnesi üzerindeki ilgili metodu (örneğin `Svg.building`) çağırarak `size` parametresini argüman olarak iletir ve dönen SVG bileşenini döndürür. Hiçbir durum eşleşmezse `default` dalı çalışır ve `null` döndürülür.

**Parametreler**:
- icon: `ApplicationIcon` — Çözümlenecek ikonun adını temsil eder. `'building'`, `'wind'`, `'layers'`, `'factory'` gibi değerler alabilir.
- size: `number` — SVG ikonunun piksel cinsinden boyutunu belirtir. Parametre verilmezse varsayılan olarak `18` değerini alır.

**Dönüş**: Eşleşen ikon durumunda ilgili `Svg` metodunun dönüş değeri (SVG bileşeni), eşleşme bulunamazsa `null`.

### accentOverlayClass
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../config/applications::type { ApplicationAccent, ApplicationIcon }
- import: react::React

---

## SABİTLER
- **Svg** (object) — `{
  building: (size: number) => (
    <svg width={size} height={size} viewB...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/applicationUi.tsx::iconFor
- **params**: `icon: ApplicationIcon`, `size: number` (varsayılan değer: 18)
- **ic_degiskenler**:
  - `icon` — switch-case kontrolü yapılan parametre; hangi SVG ikonunun döndürüleceğini belirler ('building', 'wind', 'layers', 'factory')
  - `size` — SVG ikonunun genişlik ve yükseklik değeri; `Svg` objesinin ilgili metoduna argüman olarak geçilir
  - `Svg` — modül seviyesinde tanımlı sabit obje; her bir ikon için `size` parametresiyle çağrılan metodlar içerir (`Svg.building`, `Svg.wind`, `Svg.layers`, `Svg.factory`)
- **Dönüş**: `Svg.building(size)` | `Svg.wind(size)` | `Svg.layers(size)` | `Svg.factory(size)` (JSX element) veya `null` (eşleşme bulunamazsa)

### [N2_NASIL] AST Pointer: src/utils/applicationUi.tsx::accentOverlayClass
- **params**: `accent: ApplicationAccent`
- **ic_degiskenler**:
  - `accent` — switch-case kontrolü yapılan parametre; hangi Tailwind CSS gradient class'ının döndürüleceğini belirler ('blue', 'navy', 'emerald', 'gray')
- **Dönüş**: string — Tailwind CSS class değeri: eşleşen `accent` değerine göre `'from-secondary-blue/10'` | `'from-primary-navy/10'` | `'from-emerald-500/10'` | `'from-gray-400/10'` veya varsayılan olarak `'from-gray-300/10'`

---

## NODE ID STANDARD

  file: src\utils\applicationUi.tsx
  function: src\utils\applicationUi.tsx::iconFor
  function: src\utils\applicationUi.tsx::accentOverlayClass

---

## DISA AKTARILANLAR (EXPORTS)
  export: accentOverlayClass
  export: iconFor

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