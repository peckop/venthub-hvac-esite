---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\design-system\tokens.js
skeleton_hash: 49c7465326318d5b
generated_at: 2026-05-27T04:43:17Z
---

## Genel Bakış  
Bu dosya, **tasarım sisteminin temel yapı taşlarını** (design tokens) tanımlayan tamamen statik bir yapılandırma dosyasıdır. İçerisinde fonksiyon, sınıf veya yan etkili kod bulunmaz; yalnızca `zIndex`, `maxWidth`, `borderRadius`, `fontSize` ve `boxShadow` gibi görsel tutarlılık için gerekli sabit nesneler tanımlanır ve dışa aktarılır. Böylece proje genelinde tek bir doğruluk kaynağı (single source of truth) sağlanır.

## Fonksiyon Grupları  
### Sabit Tanımlar  
Bu grup, UI bileşenlerinin tutarlı bir şekilde stil almasını sağlayan temel tasarım tokenlarını içerir.  
- `zIndex`  
- `maxWidth`  
- `borderRadius`  
- `fontSize`  
- `boxShadow`  

Bu sabitler, uygulamanın farklı bölümlerinde aynı görsel değerlerin tekrar kullanılmasını ve sürdürülmesini kolaylaştırır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, tasarım sisteminin statik token değerlerini dışa aktaran bir JavaScript nesnesi olarak tanımlanmıştır; bu nedenle aşağıdaki sabitlerin tanımlı ve doğru yapılandırılmış olması gerekir.

**Aksiyom 1**: Eğer `zIndex` nesnesi tanımlı değilse, katman sıralaması belirlenemez ve UI bileşenlerinin üst‑alt ilişkileri hatalı olur.  
**Aksiyom 2**: Eğer `maxWidth` nesnesi tanımlı değilse, genişlik sınırlamaları uygulanamaz ve responsive tasarım bozulur.  
**Aksiyom 3**: Eğer `borderRadius` nesnesi tanımlı değilse, köşe yuvarlatma stilleri tutarsız olur ve tasarım bütünlüğü kaybolur.  
**Aksiyom 4**: Eğer `fontSize` nesnesi tanımlı değilse, tipografi ölçeklendirmesi yapılamaz; metinler beklenen boyutta render edilmez.  
**Aksıyon 5**: Eğer `boxShadow` nesnesi tanımlı değilse, gölge efektleri uygulanamaz ve UI derinlik algısı eksik olur.  
**Aksiyom 6**: Eğer `height` nesnesi tanımlı değilse, sabit yükseklik değerleri kullanılamaz; bileşenlerin dikey boyutlandırması belirsiz olur.  
**Aksiyom 7**: Eğer `minHeight` nesnesi tanımlı değilse, minimum yükseklik kısıtlamaları uygulanamaz; içerik taşması riski artar.  
**Aksiyom 8**: Eğer `maxHeight` nesnesi tanımlı değilse, maksimum yükseklik sınırları yok olur; layout overflow hataları ortaya çıkabilir.  
**Aksiyom 9**: Eğer `width` nesnesi tanımlı değilse, sabit genişlik değerleri kullanılamaz; bileşenlerin yatay boyutu belirsiz kalır.  
**Aksiyom 10**: Eğer `minWidth` nesnesi tanımlı değilse, minimum genişlik kısıtlamaları eksik olur; UI elemanları çok dar görünebilir.  
**Aksiyom 11**: Eğer `transitionDuration` nesnesi tanımlı değilse, geçiş süreleri belirlenemez; animasyonların tutarlılığı bozulur.  
**Aksiyom 12**: Eğer `transitionTimingFunction` nesnesi tanımlı değilse, geçiş zamanlama fonksiyonları eksik olur; animasyonların hissiyatı tutarsızlaşır.  
**Aksiyom 13**: Eğer `blur` nesnesi tanımlı değilse, bulanıklaştırma efektleri uygulanamaz; görsel hiyerarşi kaybolur.  
**Aksiyom 14**: Eğer `transitionProperty` nesnesi tanımlı değilse, hangi CSS özelliklerinin geçişe dahil edileceği belirlenemez; istenmeyen stil değişiklikleri aniden gerçekleşir.  

*Domain‑specific kural*: Bu sabitlerin her biri, tasarım sisteminin **declarative** doğasına uygun olarak, sabit (immutable) değerler içermelidir; değerlerin runtime’da değiştirilmesi tasarım tutarlılığını bozar. (Değerlerin kendisi hakkında bilgi eksik olduğundan “bilinmiyor” olarak işaretlenmiştir.)

---



---

## SABİTLER
- **zIndex** (object) — `{
  'raised':   '10',
  'dropdown': '50',
  'sticky':   '90',
  'modal':    '...`
- **maxWidth** (object) — `{
  'page':    '100rem',     // 1600px
  'content': '56.25rem',   // 900px
  ...`
- **borderRadius** (object) — `{
  'hvac-sm':  '0.375rem',  // 6px
  'hvac-md':  '1rem',      // 16px
  'hva...`
- **fontSize** (object) — `{
  'display': ['var(--font-size-display)', { lineHeight: '1.1' }],
  '7px': ...`
- **boxShadow** (object) — `{
  // Mevcut korunanlar
  'hvac':                  '0 4px 6px -1px rgba(30,6...`
- **height** (object) — `{
  'hvac-input':   '40px',   // 5×8
  'hvac-thumb':   '72px',   // 9×8
  'hv...`
- **minHeight** (object) — `{
  'hvac-input':   '40px',
  'hvac-card':    '160px',  // 20×8
  'hvac-panel...`
- **maxHeight** (object) — `{
  'hvac-menu':    '300px',
  'hvac-panel':   '480px',  // 60×8
  'hvac-moda...`
- **width** (object) — `{
  'hvac-menu':    '360px',  // 45×8 (toast, küçük panel)
  'hvac-modal':   ...`
- **minWidth** (object) — `{
  'hvac-btn':     '120px',  // 15×8
  'hvac-menu':    '140px',
  'hvac-sele...`
- **transitionDuration** (object) — `{
  'hvac-fast':   '150ms',
  'hvac-normal': '250ms',
  'hvac-slow':   '600ms...`
- **transitionTimingFunction** (object) — `{
  'hvac-ease':   'cubic-bezier(0.16, 1, 0.3, 1)',
  'hvac-spring': 'cubic-b...`
- **blur** (object) — `{
  '80':  '80px',
  '100': '100px',
  '120': '120px',
  '150': '150px',
  '2...`
- **transitionProperty** (object) — `{
  'opacity-transform':           'opacity, transform',
  'opacity-only':   ...`

---

## AST POINTERS

---

## NODE ID STANDARD

  file: src\design-system\tokens.js

---

## DISA AKTARILANLAR (EXPORTS)
  export: blur
  export: borderRadius
  export: boxShadow
  export: fontSize
  export: height
  export: maxHeight
  export: maxWidth
  export: minHeight
  export: minWidth
  export: transitionDuration
  export: transitionProperty
  export: transitionTimingFunction
  export: width
  export: zIndex