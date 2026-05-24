---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\KnowledgeBlock.tsx
skeleton_hash: eb2f6a9da217d8e6
generated_at: 2026-05-23T22:06:53Z
---

## Genel Bakış
KnowledgeBlock, ana sayfada bilgi kartlarını gösteren yeniden kullanılabilir bir React bileşenidir. Çeviri sözlüğü, deneyim istatistikleri ve çağrı‑eylem butonu gibi verileri alarak kullanıcıya özelleştirilmiş bir içerik bloğu sunar.

## Fonksiyon Grupları
### Ana Bileşen
Bileşenin render mantığını ve prop'larıyla etkileşimini yönetir.
- KnowledgeBlock

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### KnowledgeBlock
**Ne yapar**: KnowledgeBlock bileşeni, verilen çeviri fonksiyonu, final CTA verileri, istatistik ve deneyim bilgileri ve quote tıklama olayını işleyen callback ile bir bilgi bloğu render eder.  
**Nasıl yapar**: Props olarak alınan dictionary (t) ile metinleri yerelleştirir, finalCtaDict ve statsExperience verilerini kullanarak ilgili bölümleri doldurur ve onQuoteClick fonksiyonunu quote öğelerine bağlayarak kullanıcı etkileşimini yönetir.  
**Parametreler**:  
- dictionary: t — Çeviri fonksiyonu, component içindeki metinleri yerelleştirmek için kullanılır.  
- finalCtaDict: — Final çağrı-eylem (CTA) verileri, genellikle buton metni, link ve benzeri içerikleri içerir.  
- statsExperience: — İstatistik ve deneyim verileri, bileşenin içinde gösterilecek sayısal veya metinsel bilgileri taşır.  
- onQuoteClick: — Quote öğelerine tıklandığında çağrılacak callback fonksiyonu, genellikle quote detayını göstermek veya başka bir eylem tetiklemek için kullanılır.  
**Dönüş**: React.FC<KnowledgeBlockProps> — Render edilen KnowledgeBlock bileşenini döndürür, JSX elementi olarak kullanıma hazır.

---

## INTERFACES

### KnowledgeItem
- `id: 'guides' | 'calculators' | 'support'`
- `href: string`
- `icon: React.ReactNode`

### KnowledgeBlockProps
- `dictionary: {`
- `finalCtaDict: {`
- `statsExperience: string`
- `onQuoteClick?: () => void`

---

## SABİTLER
- **knowledgeItems** (array) — `[
  { 
    id: 'guides', 
    href: Routes.destek.home(),
    icon: (
      <...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/KnowledgeBlock.tsx::KnowledgeBlock
- **params**: dictionary: t (renamed), finalCtaDict, statsExperience, onQuoteClick
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (React.FC<KnowledgeBlockProps>)

### [N2_NASIL] AST Pointer: src/components/home/KnowledgeBlock.tsx::map callback
- **params**: item, index
- **ic_degiskenler**:
  - `delayClass` — string containing animation delay class (e.g., 'delay-0', 'delay-100', 'delay-200') derived from `index % 3`
- **Dönüş**: JSX element (Link component wrapping a knowledge item)

---

## NODE ID STANDARD

  file: src\components\home\KnowledgeBlock.tsx
  function: src\components\home\KnowledgeBlock.tsx::KnowledgeBlock

---

## DISA AKTARILANLAR (EXPORTS)
  export: KnowledgeBlock