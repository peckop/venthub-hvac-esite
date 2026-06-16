---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\KnowledgeBlock.tsx
skeleton_hash: 9ccd30d03e330950
entity_hashes:
  func:KnowledgeBlock: 7e6b19d8803336cc
  overview: 2af91bd05b5de4f2
  style_tokens: 45bee56ab9c18ab4
generated_at: 2026-06-15T17:02:53Z
---

## Genel Bakış
Bu modül, ana sayfada bilgi birikimi ve deneyim istatistiklerini sergileyen bir React bileşenini tanımlar. Kullanıcıya yerelleştirilmiş içerikler sunarak, teklif alma sürecini başlatan bir eylem çağrısı (CTA) görüntüler.

## Fonksiyon Grupları
### Ana Bileşen
Bilgi bloğu, istatistik verileri ve son eylem çağrısını içeren arayüzü oluşturur ve kullanıcı etkileşimlerini yönetir.
- KnowledgeBlock

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React bileşeni olup, fonksiyon imzası ve modül sabitlerine dayalı mimari varsayımlar aşağıdadır:

**[Aksiyom 1]**: Eğer `dictionary: t` parametresi verilmezse veya geçerli bir çeviri nesnesi içermiyorsa, bileşenin UI metinleri doğru şekilde render edilemez.

**[Aksiyom 2]**: Eğer `lang` parametresi verilmezse, bileşen içeriği hangi dilde gösterileceğini bilemez ve yerelleştirme başarısız olur.

**[Aksiyom 3]**: Eğer `onQuoteClick` fonksiyonu verilmezse veya bir fonksiyon türünde değilse, teklif alma butonuna tıklama eylemi çalışmaz.

**[Aksiyom 4]**: Eğer `statsExperience` verisi verilmezse veya beklenen istatistik alanlarını içermiyorsa, deneyim istatistikleri bölümü eksik veya hatalı render edilir.

**[Aksiyom 5]**: Eğer `finalCtaDict` parametresi verilmezse veya geçerli bir sözlük nesnesi içermiyorsa, son eylem çağrısı (CTA) bölümü doğru içerik gösteremez.

**[Aksiyom 6]**: `knowledgeItems` modül sabiti (array) her zaman mevcut ve geçerli bir dizi olmalıdır; eğer bu sabit boş veya tanımsız olursa, bilgi bloğu içerikleri gösterilemez.

**[Aksiyom 7]**: Eğer `statsExperience` içindeki sayısal değerler `knowledgeItems` dizisindeki öğe sayısıyla uyumlu değilse (örn: dizi 4 elemanlı ama istatistik 3 elemanlı), render sırasında eşleşme hataları oluşur.

---

## FONKSİYON DETAYLARI

### KnowledgeBlock
**Ne yapar**: Bu fonksiyon, bir React bileşeni olan `KnowledgeBlock`'u tanımlar. Bileşen, HVAC领域的知识 içeriğini, istatistikleri ve bir çağrı (CTA) bölümünü göstererek kullanıcılara bilgilendirici bir blok sunar.

**Nasıl yapar**: Fonksiyon, bir `React.FC` (Functional Component) olarak tanımlanmıştır ve `KnowledgeBlockProps` arayüzüne uygun bir `dictionary` (yerelleştirme sözlüğü) alır. Bileşen, verilen props'ları kullanarak içeriği dilbilgisel ve istatistiksel olarak yapılandırır. `onQuoteClick` prop'u, kullanıcının bir teklif butonuna tıklaması durumunda çalışacak bir olay işleyicisini temsil eder. `lang` prop'u ise içeriğin hangi dilde gösterileceğini belirler.

**Parametreler**:
- `dictionary: t` — Bileşen içindeki tüm metinlerin, çevirilerin ve yerelleştirme dizelerinin tutulduğu sözlük nesnesi. Genellikle bir çeviri yardımcısı (i18n helper) tarafından sağlanır.
- `finalCtaDict` — Bileşenin alt kısmındaki çağrı (Call-to-Action) bölümü için gerekli metinleri ve yapılandırma bilgilerini içeren sözlük.
- `statsExperience` — Bileşende gösterilecek istatistiksel verileri (örneğin, tecrübe yılları, proje sayıları) temsil eden bir veri yapısı veya prop.
- `lang` — Bileşenin içeriğini hangi dilde sunacağını belirten dil kodu (örn: 'tr', 'en'). Bu değer, `dictionary` içeriğinin hangi dile ait olduğunu doğrulamak veya içeriği dinamik olarak değiştirmek için kullanılır.
- `onQuoteClick` — Kullanıcı teklif (quote) butonuna tıkladığında çağrılacak olan bir işlev (callback function). Genellikle bir form açma veya yönlendirme işlemi tetikler.

**Dönüş**: `React.FC<KnowledgeBlockProps>` tipinde bir React fonksiyonel bileşeni döndürür. Bu bileşen, `KnowledgeBlockProps` arayüzünde tanımlı tüm prop'ları alabilir ve React tarafından render edilebilir bir JSX (veya React elementi) içeriği üretir.

---

## İTHALATLAR (IMPORTS)
- import: ../../utils/routes::Routes
- import: ../../utils/routes::localizedHref
- import: ./ClientLeadButton::ClientLeadButton
- import: next/link::Link
- import: react::React

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
- `lang: string`
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

## NODE ID STANDARD

  file: src\components\home\KnowledgeBlock.tsx
  function: src\components\home\KnowledgeBlock.tsx::KnowledgeBlock

---

## DISA AKTARILANLAR (EXPORTS)
  export: KnowledgeBlock

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-xl`, `tracking-hvac-loose`, `tracking-hvac-normal`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-clip-text`, `bg-cyan-400/40`, `bg-cyan-500/10`, `bg-emerald-500`, `bg-gradient-to-r`, `bg-knowledge-radial`, `bg-slate-950`, `bg-white/2`, `bg-white/5`, `border-cyan-500/30`, `border-l-2`, `border-t`, `border-white/10`, `border-white/5`, `from-cyan-400`
- **Layout:** `absolute`, `backdrop-blur-3xl`, `backdrop-blur-md`, `bg-clip-text`, `block`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `from-cyan-400`, `from-cyan-600`, `gap-12`, `gap-3`, `gap-4`, `gap-6`
- **Varyant/Responsive:** `dark:`, `data-[in-view=true]:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${delayClass`, `-translate-x-4`, `animate-pulse`, `border`, `dark:prose-invert`, `data-[in-view=true]:opacity-100`, `data-[in-view=true]:translate-x-0`, `data-[in-view=true]:translate-y-0`, `delay-200`, `delay-300`, `duration-500`, `duration-700`, `ease-out`, `font-black`, `font-bold`