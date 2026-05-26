---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\design-system\tokens.js
skeleton_hash: bc38de88ce673b9c
generated_at: 2026-05-26T11:43:03Z
---

## Genel Bakış

Bu modül, Venture Home HVAC projesinin **tasarım sisteminin temel yapı taşlarını (design tokens)** tanımlayan tamamen statik ve bildirime dayalı (declarative) bir yapılandırma dosyasıdır. Herhangi bir fonksiyon tanımı, iş mantığı, ortam değişkeni kullanımı veya harici API/veritabanı sorgusu içermez. Dosyanın tek sorumluluğu, kullanıcı arayüzünün görsel tutarlılığını sağlamak için gerekli olan en düşük seviyeli tasarım kararlarını — `zIndex` (katman sıralaması), `maxWidth` (maksimum genişlik sınırları), `borderRadius` (köşe yuvarlaklık değerleri), `fontSize` (yazı tipi boyut skalası) ve `boxShadow` (gölge/yükseklik efektleri) — merkezi bir yerde sabit değerler olarak tutmak ve dışa aktarmaktır. Bu yapısıyla, projedeki diğer tüm UI bileşenleri için **tek bir doğruluk kaynağı (single source of truth)** görevi görür.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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
}`
- **boxShadow** (object) — `{
  'hvac': '0 4px 6px -1px rgba(30, 64, 175, 0.1), 0 2px 4px -1px rgba(30, 6...`

---

## AST POINTERS

---

## NODE ID STANDARD

  file: src\design-system\tokens.js

---

## DISA AKTARILANLAR (EXPORTS)
  export: borderRadius
  export: boxShadow
  export: fontSize
  export: maxWidth
  export: zIndex