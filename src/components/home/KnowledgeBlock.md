---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\home\KnowledgeBlock.tsx
skeleton_hash: c9bbc4a9af1dd4b8
entity_hashes:
  func:KnowledgeBlock: 7e6b19d8803336cc
  overview: 2af91bd05b5de4f2
  style_tokens: 45bee56ab9c18ab4
generated_at: 2026-08-27T08:27:33Z
---

## Genel Bakış
KnowledgeBlock, ana sayfada yer alan bilgi/içerik bloğunu oluşturan bir React bileşenidir. Çoklu dil desteği, istatistik verileri ve tıklama geri çağırma fonksiyonu gibi dışsal girdileri alarak kullanıcıya bilgi sunar.

## Fonksiyon Grupları

### Ana Bileşen
Ana sayfadaki bilgi bloğunun render edilmesinden sorumludur. Çeviri sözlüğü, istatistik/tecrübe verileri, dil bilgisi ve teklif tıklama geri çağırması gibi dışsal bağımlılıkları alarak arayüzü oluşturur.
- KnowledgeBlock

## Bağımlılıklar
- **Dış bağımlılıklar**: `dictionary` (i18n sözlüğü), `finalCtaDict` (son CTA sözlüğü), `statsExperience` (istatistik verileri), `lang` (dil), `onQuoteClick` (dışsal tıklama geri çağırması) — tümü üst bileşen tarafından sağlanır.
- **İç/dinamik bağımlılıklar**: Kaynakta belirtilmemiştir.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### KnowledgeBlock
**Ne yapar**: Ana sayfa (home) üzerinde bilgi bloğu bileşenini oluşturan bir React fonksiyonel bileşenidir. Kullanıcıya bilgi içeriği sunan bir bölümü render eder.

**Nasıl yapar**: Destructuring yöntemiyle aldığı properties'leri kullanarak bileşenin görünümünü ve davranışını oluşturur. `dictionary` parametresi `t` adıyla yeniden adlandırılarak bileşen içinde metin/içerik kaynağı olarak kullanılır. `onQuoteClick` callback'i aracılığıyla alıntı tıklama olaylarını üst bileşene iletir. Bileşen `React.FC<KnowledgeBlockProps>` tipinde tanımlanmıştır; bu, `KnowledgeBlockProps` arayüzü ile tanımlanmış properties'leri kabul eden bir fonksiyonel bileşen olduğunu gösterir.

**Parametreler**:
- dictionary: t — Bileşen içinde kullanılacak metin/içerik değerlerini içeren sözlük nesnesi. Destructuring sırasında `t` adıyla yeniden adlandırılır.
- finalCtaDict — Son çağrı (Call to Action) bölümüne ait metin ve içerik değerlerini barındıran sözlük nesnesi.
- statsExperience — İstatistiksel deneyim verilerini içeren nesne; muhtemelen sayısal bilgiler veya deneyim metrikleri içerir.
- lang — Geçerli dil bilgisini temsil eden değer; çoklu dil desteği için kullanılır.
- onQuoteClick — Kullanıcı bir alıntıya tıkladığında çağrılan callback fonksiyonu.

**Dönüş**: `React.FC<KnowledgeBlockProps>` — `KnowledgeBlockProps` tipinde properties alan ve bir React elementi (JSX) döndüren fonksiyonel bileşen.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/KnowledgeBlock.tsx::KnowledgeBlock
- **params**: `{ dictionary: t, finalCtaDict, statsExperience, lang, onQuoteClick }`
- **ic_degiskenler**:
  - `t` — dictionary prop'unun kısaltması; `t.eyebrow`, `t.headingPrefix`, `t.headingAccent`, `t.subtitle`, `t.items`, `t.cta`, `t.statsPipelineLabel`, `t.statsOptimization` alanlarına erişilir
  - `finalCtaDict` — CTA buton metinlerini taşıyan nesne; `finalCtaDict.primaryCta` ve `finalCtaDict.secondaryCta` alanlarına erişilir
  - `statsExperience` — istatistik bölümünde gösterilen deneyim metni, doğrudan JSX içinde render edilir
  - `lang` — dil kodu; `localizedHref(item.href, lang)` çağrısına ikinci argüman olarak geçilir
  - `onQuoteClick` — tıklama olayı handler'ı; `ClientLeadButton` bileşenine `onQuoteClick` prop'u olarak aktarılır
  - `knowledgeItems` — modül seviyesinde tanımlı sabit dizi; `.map()` ile dönülerek kartlar oluşturulur
  - `item` — `knowledgeItems.map()` callback parametresi; `item.id`, `item.href`, `item.icon` alanlarına erişilir
  - `index` — `knowledgeItems.map()` callback parametresi; `index % 3` ile gecikme sınıfı seçilir, `String(index + 1).padStart(2, '0')` ile iki haneli sıra numarası oluşturulur
  - `delayClass` — `['delay-0', 'delay-100', 'delay-200'][index % 3]` ifadesiyle hesaplanan animasyon gecikme CSS sınıfı
  - `localizedHref` — `../../utils/routes` modülünden import edilen fonksiyon; `item.href` ve `lang` parametreleriyle çağrılır, `Link` bileşeninin `href` prop'una atanır
  - `ClientLeadButton` — `./ClientLeadButton` modülünden import edilen bileşen; `primaryCta` ve `onQuoteClick` prop'ları ile kullanılır
  - `Routes` — `../../utils/routes` modülünden import edilir; fonksiyon gövdesinde doğrudan kullanılmaz
  - `Link` — `next/link` modülünden import edilen bileşen; bilgi kartları ve WhatsApp CTA bağlantısı için kullanılır
  - `React` — `react` modülünden import edilir; JSX dönüşü için gereklidir
- **Dönüş**: JSX (React element) — `<section>` kök elemanı ile KnowledgeBlock bileşeninin tam UI çıktısı

### [N2_NASIL] AST Pointer: src/components/home/KnowledgeBlock.tsx::knowledgeItems.map callback
- **params**: `(item, index)`
- **ic_degiskenler**:
  - `item` — `knowledgeItems` dizisindeki tekil bilgi öğesi; `item.id` (key ve `t.items[item.id]` erişimi için), `item.href` (`localizedHref` çağrısında), `item.icon` (ikon render'ında) kullanılır
  - `index` — dizi indeksi; `index % 3` ile `delayClass` seçilir, `String(index + 1).padStart(2, '0')` ile sıralı numara oluşturulur
  - `delayClass` — `['delay-0', 'delay-100', 'delay-200'][index % 3]` ifadesinden elde edilen CSS sınıfı; animasyon gecikme süresini belirler
  - `t` — üst kapsamdan erişilen dictionary nesnesi; `t.items[item.id]?.title`, `t.items[item.id]?.description`, `t.cta` alanlarına erişilir
  - `lang` — üst kapsamdan erişilen dil kodu; `localizedHref(item.href, lang)` çağrısında kullanılır
  - `localizedHref` — üst kapsamdan erişilen fonksiyon; `item.href` ve `lang` ile birlikte `Link` bileşeninin `href` prop'unu üretir
- **Dönüş**: JSX (React element) — tek bir bilgi kartı (`<div>` içinde `Link` ve alt elemanları)

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