---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\KnowledgeBlock.tsx
skeleton_hash: a8dd331c5690f78a
entity_hashes:
  func:KnowledgeBlock: 6d00cfd06aa7a00e
  overview: 558d6d867468cadc
  style_tokens: 45bee56ab9c18ab4
generated_at: 2026-06-14T21:14:41Z
---

## Genel Bakış
Bu modül, ana sayfada bilgi birikimi ve deneyim istatistiklerini sergileyen React bileşenini içerir. Kullanıcıya yerelleştirilmiş içerikler sunarak, teklif alma sürecini başlatan bir eylem çağrısı (CTA) görüntüler.

## Fonksiyon Grupları
### Ana Bileşen
Bilgi bloğu, istatistik verileri ve son eylem çağrısını içeren arayüzü oluşturur ve kullanıcı etkileşimlerini yönetir.
- KnowledgeBlock

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### KnowledgeBlock
**Ne yapar**: `KnowledgeBlock` bir React fonksiyonel bileşenidir ve "Bilgi Bloğu" adı verilen bir kullanıcı arayüzü bileşenini oluşturur. Bu bileşen, çeviri sözlüğü, çağrı eylem metinleri, istatistik/deneyim verileri ve bir teklif butonu tıklama işleyicisi alarak ilgili içeriği görüntüler.

**Nasıl yapar**: Bileşen, kendisine iletilen propları (dictionary, finalCtaDict, statsExperience, onQuoteClick) kullanarak bir bilgi bloğu render eder. İç mantığı verilen kod parçacığında detaylandırılmamıştır; ancak tipik olarak bu propları uygun JSX elementlerine dönüştürür ve bir React bileşeni olarak döndürür.

**Parametreler**:
- `dictionary`: object (props içinde `t` olarak aliaslanmış) — Çeviri anahtarlarını içeren sözlük nesnesi. Uygulamanın dil desteği için kullanılır.
- `finalCtaDict`: object — Son çağrı eylemi (Call to Action) metinlerini ve yapılandırmasını içeren sözlük.
- `statsExperience`: any — Görüntülenecek istatistik veya deneyim verileri. Türü belirtilmemiştir.
- `onQuoteClick`: function — Kullanıcının teklif butonuna tıklaması durumunda tetiklenecek geri çağırım fonksiyonu.

**Dönüş**: `React.FC<KnowledgeBlockProps>` — Bileşenin kendisi bir React fonksiyonel bileşenidir; bu tür, bileşenin `KnowledgeBlockProps` tipinde proplar almasını sağlar. Kullanıldığında bir `JSX.Element` döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../utils/routes::Routes
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
- **params**:
  - `t` — dictionary alias, çeviri metinlerini içeren obje (parametre adı: dictionary)
  - `finalCtaDict` — son CTA buton metinlerini içeren obje (primaryCta, secondaryCta alanları)
  - `statsExperience` — istatistik alanında gösterilecek deneyim metni
  - `onQuoteClick` — teklif butonu tıklama callback fonksiyonu
- **ic_degiskenler**: (fonksiyon gövdesinde değişken tanımı bulunmamaktadır)
- **Dönüş**: JSX elementi (React bileşeni) — section, grid layout, final action layer içeren yapı

### [N2_NASIL] AST Pointer: src/components/home/KnowledgeBlock.tsx::(item, index) => {} (knowledgeItems.map callback)
- **params**:
  - `item` — knowledgeItems dizisinin elemanı; id, href, icon alanlarını içerir
  - `index` — dizideki sıra numarası (0‑based)
- **ic_degiskenler**:
  - `delayClass` — `['delay-0', 'delay-100', 'delay-200'][index % 3]` ifadesiyle hesaplanan gecikme CSS sınıfı
- **Dönüş**: JSX elementi — div wrapper içinde Link (numara, icon, başlık, açıklama, CTA)

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