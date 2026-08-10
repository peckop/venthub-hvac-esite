---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\design-system\tokens.js
skeleton_hash: e9e8335ba0e85e39
entity_hashes:
  overview: 604c676f787fff08
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış  
Bu modül, tasarım sisteminin temel yapı taşlarını (design tokens) tanımlayan tamamen statik bir yapılandırma dosyasıdır. İçerisinde fonksiyon, sınıf veya yan etkili kod bulunmaz; yalnızca `zIndex`, `maxWidth`, `borderRadius`, `fontSize`, `boxShadow`, `height`, `width`, `transitionDuration` ve `blur` gibi görsel tutarlılık için gerekli sabit nesneler tanımlanır ve dışa aktarılır.  

## Fonksiyon Grupları  
Bu dosyada herhangi bir fonksiyon bulunmamaktadır. Modül, üst düzey (top-level) sabit tanımlamalarından oluşmaktadır ve yalnızca nesne dışa aktarımı yapmaktadır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, tasarım sisteminin temel yapı taşlarını (design tokens) tanımlayan tamamen statik bir yapılandırma dosyasıdır. Dolayısıyla, modülün doğru çalışması için aşağıdaki temel varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `zIndex` nesnesi tanımlı değilse veya gerekli seviyeleri (ör. 'modal', 'sticky', 'dropdown') içermiyorsa, uygulamadaki katman sıralaması (layering) tutarsız olur ve bazı UI bileşenleri (ör. menüler, modallar) beklenmedik şekilde arka planda kalabilir.
[Aksiyom 2]: Eğer `fontSize` nesnesi tanımlı değilse veya tüm gerekli tipografik seviyeleri içermiyorsa, tipografi hiyerarşisi bozulur ve metin boyutları tutarsız bir hale gelir.
[Aksiyom 3]: Eğer `height` ve `width` gibi boyut nesneleri (min/max varyasyonları dahil) tanımlı değilse, bileşenler için standart bir ölçüm sistemi bulunmaz ve yerleşim (layout) tutarsızlıkları oluşur.
[Aksiyom 4]: Eğer `transitionDuration` ve `transitionTimingFunction` nesneleri tanımlı değilse veya yetersiz ise, uygulama genelinde animasyon ve geçiş süreleri ile eğrileri tutarsız olur, bu da kullanıcı deneyimini olumsuz etkiler.
[Aksiyom 5]: Eğer `boxShadow` ve `blur` nesneleri tanımlı değilse veya yetersiz varyantlara sahipse, derinlik ve vurgulama efektleri için tutarlı bir stil kuralı oluşturulamaz.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **zIndex** (object) — `{
  'raised':   '10',
  'dropdown': '50',
  'sticky':   '90',
  'modal': ...`
- **maxWidth** (object) — `{
  'page':    '100rem',     // 1600px
  'content': '56.25rem',   // 900px...`
- **borderRadius** (object) — `{
  'hvac-sm':  '0.375rem',  // 6px
  'hvac-md':  '1rem',      // 16px
  '...`
- **fontSize** (object) — `{
  'display': ['var(--font-size-display)', { lineHeight: '1.1' }],
  '7px'...`
- **boxShadow** (object) — `{
  // Mevcut korunanlar
  'hvac':                  '0 4px 6px -1px rgba(30...`
- **height** (object) — `{
  'hvac-input':   '40px',   // 5×8
  'hvac-thumb':   '72px',   // 9×8
  ...`
- **minHeight** (object) — `{
  'hvac-input':   '40px',
  'hvac-card':    '160px',  // 20×8
  'hvac-pa...`
- **maxHeight** (object) — `{
  'hvac-menu':    '300px',
  'hvac-panel':   '480px',  // 60×8
  'hvac-m...`
- **width** (object) — `{
  'hvac-menu':    '360px',  // 45×8 (toast, küçük panel)
  'hvac-modal': ...`
- **minWidth** (object) — `{
  'hvac-btn':     '120px',  // 15×8
  'hvac-menu':    '140px',
  'hvac-s...`
- **transitionDuration** (object) — `{
  'hvac-fast':   '150ms',
  'hvac-normal': '250ms',
  'hvac-slow':   '60...`
- **transitionTimingFunction** (object) — `{
  'hvac-ease':   'cubic-bezier(0.16, 1, 0.3, 1)',
  'hvac-spring': 'cubic...`
- **blur** (object) — `{
  '80':  '80px',
  '100': '100px',
  '120': '120px',
  '150': '150px',...`
- **transitionProperty** (object) — `{
  'opacity-transform':           'opacity, transform',
  'opacity-only': ...`

---

## AST POINTERS

Bu dosya (`tokens.js`) **fonksiyon içermemektedir**. Dosya yalnızca dışa aktarılan (export edilen) sabit tasarım token nesnelerinden oluşmaktadır:

| Sabit | Tür | Açıklama |
|---|---|---|
| `zIndex` | object | Z-index katman değerleri |
| `maxWidth` | object | Maksimum genişlik değerleri |
| `borderRadius` | object | Köşe yuvarlaklığı değerleri |
| `fontSize` | object | Yazı tipi boyutu değerleri |
| `boxShadow` | object | Kutu gölgesi değerleri |
| `height` | object | Yükseklik değerleri |
| `minHeight` | object | Minimum yükseklik değerleri |
| `maxHeight` | object | Maksimum yükseklik değerleri |
| `width` | object | Genişlik değerleri |
| `minWidth` | object | Minimum genişlik değerleri |
| `transitionDuration` | object | Geçiş süresi değerleri |
| `transitionTimingFunction` | object | Geçiş zamanlama fonksiyonu değerleri |
| `blur` | object | Bulanıklık değerleri |
| `transitionProperty` | object | Geçiş özelliği değerleri |

**Fonksiyon gövdesi:** `(yok)`
**AST Pointer üretilecek fonksiyon bulunmamaktadır.**

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