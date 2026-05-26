---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\KnowledgeBlock.tsx
skeleton_hash: 6f7ef05f64566f7e
generated_at: 2026-05-26T11:44:16Z
---

## Genel Bakış
KnowledgeBlock, ana sayfada bilgi kartlarını görüntüleyen, yeniden kullanılabilir bir React bileşenidir. Çeviri sözlüğü, deneyim istatistikleri ve çağrı-eylem butonu gibi verileri prop olarak alır ve kullanıcıya özelleştirilmiş bir içerik bloğu sunar.

## Fonksiyon Grupları
### Ana Bileşen
Bileşenin render mantığını ve prop’larla etkileşimini yönetir.
- KnowledgeBlock

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### KnowledgeBlock
**Ne yapar**: VentHub HVAC projesinin ana sayfasında kullanılan, kullanıcılara sektör deneyimi istatistiklerini ve harekete geçme çağrılarını sunan React bilgi bloğu bileşenidir. Kullanıcıların teklif alma sürecine başlamasını sağlayan tıklama olayını yönetir, arayüzdeki tüm metinleri dinamik olarak kendisine aktarılan sözlüklerden çekerek görüntüler.
**Nasıl yapar**: Tanımlı tipteki propsları alarak içerdiği metin ve veri kaynaklarını yapılandırır, sektör deneyimi verisini kullanıcı arayüzüne yansıtır. Kullanıcı teklif alma butonuna tıkladığında kendisine aktarılan geri çağırma fonksiyonunu tetikleyerek ilgili akışı başlatır, React.FC yapısı ile tip güvenliği sağlar.
**Parametreler**:
- dictionary: t — Bileşen içerisinde kullanılacak tüm arayüz metinlerini barındıran, çok dilli destek sağlayan ana sözlük objesidir
- finalCtaDict: Bilgi bloğunun sonunda yer alan harekete geçme çağrısı (CTA) bölümündeki metinleri içeren özel sözlük yapısıdır
- statsExperience: Kullanıcılara gösterilecek şirketin sektör deneyimini, başarı istatistiklerini içeren veri objesidir
- onQuoteClick: Kullanıcı teklif alma butonuna tıkladığında tetiklenmesi gereken işlevleri yürüten callback fonksiyonudur
**Dönüş**: KnowledgeBlockProps tipinde tanımlanmış, tüm metin, veri ve kullanıcı etkileşimlerini entegre etmiş, ana sayfada kullanılmak üzere yapılandırılmış React bileşeni döndürür.

---

## INTERFACES

### KnowledgeItem
- `id: 'guides' | 'calculators' | 'support'`
- `href: string`
- `icon: React.ReactNode`

### KnowledgeBlockProps
- `dictionary: {`
- `finalCtaDict: {`
- `statsExperience: string`
- `onQuoteClick?: () => void`

---

## SABİTLER
- **knowledgeItems** (array) — `[
  { 
    id: 'guides', 
    href: Routes.destek.home(),
    icon: (
  ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/KnowledgeBlock.tsx::KnowledgeBlock
- **params**: ({ dictionary: t, finalCtaDict, statsExperience, onQuoteClick })
- **ic_degiskenler**:
  - `t` — çeviri nesnesi, `t.eyebrow`, `t.subtitle`, `t.items`, `t.cta` gibi alanları içerir.
  - `finalCtaDict` — CTA (call‑to‑action) metinlerini tutan nesne; `finalCtaDict.primaryCta` ve `finalCtaDict.secondaryCta` kullanılır.
  - `statsExperience` — istatistik metni, alt bölümde gösterilir.
  - `onQuoteClick` — butona tıklandığında tetiklenen callback fonksiyonu, `ClientLeadButton` bileşenine prop olarak aktarılır.
  - `knowledgeItems` — dışarıdan import edilen sabit dizi; her öğe `{id, href, icon}` alanlarına sahiptir ve `map` içinde iterasyon yapılır.
  - `item` — `knowledgeItems.map` içinde her bir öğeyi temsil eder; `item.id`, `item.href`, `item.icon` alanları kullanılır.
  - `index` — `knowledgeItems.map` içinde öğenin sırasını gösterir; `index` ile gecikme sınıfı ve numaralandırma yapılır.
  - `delayClass` — `['delay-0','delay-100','delay-200'][index % 3]` ifadesiyle oluşturulan gecikme CSS sınıfı, öğenin animasyon gecikmesini belirler.
- **Dönüş**: React element (`<section>...</section>`) – bileşen render eder, yan etkisi yoktur.  

### [N2_NASIL] AST Pointer: src/components/home/KnowledgeBlock.tsx::(item, index) => { … }
- **params**: (item, index)
- **ic_degiskenler**:
  - `item` — `knowledgeItems` dizisinden gelen tek bir öğe; `item.id`, `item.href`, `item.icon` alanları kullanılır.
  - `index` — öğenin dizideki konumu; `index` ile `delayClass` ve numaralandırma (`0{index + 1}`) oluşturulur.
  - `delayClass` — `['delay-0','delay-100','delay-200'][index % 3]` ifadesiyle elde edilen CSS sınıfı, animasyon gecikmesini ayarlar.
- **Dönüş**: React element (`<div key={item.id}>...</div>`) – her `knowledgeItem` için bir kart render eder.

---

## NODE ID STANDARD

  file: src\components\home\KnowledgeBlock.tsx
  function: src\components\home\KnowledgeBlock.tsx::KnowledgeBlock

---

## DISA AKTARILANLAR (EXPORTS)
  export: KnowledgeBlock