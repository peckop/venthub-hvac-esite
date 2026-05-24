---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\BeforeAfterSlider.tsx
skeleton_hash: 98863d9789f4629d
generated_at: 2026-05-23T21:55:17Z
---

## Genel Bakış
`BeforeAfterSlider` bileşeni, iki görseli (ön ve arka) yan yana yerleştirerek kullanıcıya bir kaydırıcı üzerinden karşılaştırma imkanı sunar. Kullanıcı kaydırıcıyı sürükleyerek “before” ve “after” görüntülerinin görünür kısmını dinamik olarak ayarlar ve bu sayede görsel farkları etkileşimli şekilde inceleyebilir.

## Fonksiyon Grupları
### Slider Görüntüleme ve Etkileşim
Bu grup, kaydırıcıyı render eder, görselleri konumlandırır ve kullanıcı sürükleme hareketlerini işleyerek görüntülerin görünürlüğünü ayarlar.  
- BeforeAfterSlider

---

## AXIOMS – Mimari Varsayımlar
Bu modül, gerekli görüntü özelliklerinin sağlandığını ve alt özelliğinin belirtilmediği durumda varsayılan değeri kullanacağını varsayar.

[Aksiyom 1]: Eğer `beforeSrc` prop'u sağlanmazsa, bileşen "before" görüntüsünü render edemez ve görüntü eksikliği olur.  
[Aksiyom 2]: Eğer `afterSrc` prop'u sağlanmazsa, bileşen "after" görüntüsünü render edemez ve görüntü eksikliği olur.  
[Aksiyom 3]: Eğer `alt` prop'u sağlanmazsa, bileşen varsayılan değer `'before-after'` kullanır.

---

## FONKSIYON DETAYLARI

### BeforeAfterSlider
**Ne yapar**: İki görseli (önce ve sonra) yan yana göstererek kullanıcıya sürükleyebileceği bir bölücüyle karşılaştırma imkanı sunar.  
**Nasıl yapar**: `beforeSrc` ve `afterSrc` ile sağlanan görselleri bir konteyner `<div>` içinde yerleştirir, üstte bir tutamaç (handle) ekleyerek kullanıcının sürükleyerek bir görselin diğerinin üzerindeki kısmını göstermesini sağlar; `alt` özelliği her iki görsele de erişilebilirlik metni olarak uygulanır.  
**Parametreler**:
- beforeSrc: string — Gösterilecek "önce" görselinin URL veya yerel yol.  
- afterSrc: string — Gösterilecek "sonra" görselinin URL veya yerel yol.  
- alt: string — Her iki görsele de varsayılan olarak 'before-after' olan erişilebilirlik açıklaması; kullanıcı tarafından özelleştirilebilir.  
**Dönüş**: React.FC<BeforeAfterSliderProps> türünde bir fonksiyon bileşeni; JSX elementi olarak render edilir ve bir önce/sonra karşılaştırma sliderı döndürür.

---

## INTERFACES

### BeforeAfterSliderProps
- `beforeSrc: string`
- `afterSrc: string`
- `alt?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/BeforeAfterSlider.tsx::BeforeAfterSlider
- **params**: beforeSrc, afterSrc, alt
- **ic_degiskenler**:
  - `pos` — current slider position percentage (0‑100) that determines the width of the before‑image overlay.
  - `setPos` — state setter function used to update `pos` when the range input changes.
- **Dönüş**: JSX element (React component output) – renders the before/after slider UI.

---

## NODE ID STANDARD

  file: src\components\BeforeAfterSlider.tsx
  function: src\components\BeforeAfterSlider.tsx::BeforeAfterSlider

---

## DISA AKTARILANLAR (EXPORTS)
  export: BeforeAfterSlider