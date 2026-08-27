---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\views\knowledge\HubPage.tsx
skeleton_hash: ce053a964570b0f6
entity_hashes:
  func:HubPage: ae5a0ef5e997bc98
  overview: 811b30842f3209b4
  style_tokens: 8d8885134f307444
generated_at: 2026-08-27T04:26:54Z
---

## Genel Bakış
Bu modül, VentHub projesinin "Bilgi Merkezi" ana sayfasını oluşturan temel React

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca imza ve modül sabitlerinden çıkarım yapılabilir.

[Aksiyom 1]: Eğer `TOPIC_SLUGS` sabiti tanımlı değilse, HubPage bileşeni bu sabite erişemez ve bilgi merkezi sayfasının konu yapılandırması eksik kalır.

[Aksiyom 2]: Eğer `TAGS` sabiti tanımlı değilse, HubPage bileşeni bu sabite erişemez ve etiket/arama filtreleme işlevselliği çalışamaz.

[Aksiyom 3]: Eğer `HubPage` fonksiyonu bir React.FC döndürmezse, bileşen olarak kullanılamaz ve sayfa render edilemez.

[Aksiyom 4]: Eğer React kütüphanesi mevcut değilse, `HubPage` bileşeni çalışamaz çünkü bağımlılık sağlanamaz.

**Not:** Fonksiyon gövdesi sağlanmadığı için, `TOPIC_SLUGS` ve `TAGS` sabitlerinin nasıl kullanıldığı, hangi alt bileşenlerin render edildiği ve sayfa yapısının detayları bilinmiyor. Daha kesin aksiyomlar için fonksiyon gövdesi gereklidir.

---

## FONKSİYON DETAYLARI

### HubPage
**Ne yapar**: Bu fonksiyon, bir React fonksiyonel bileşeni (Functional Component) olarak tanımlanmıştır ve muhtemelen bilgi merkezi veya bilgi sayfası görünümünü temsil eden bir kullanıcı arayüzü bileşeni döndürür. Dosya yolu `views/knowledge` dizinini işaret ettiğinden, bilgi yönetimi veya dokümantasyonla ilgili bir sayfanın ana gövdesini oluşturur.

**Nasıl yapar**: HubPage, herhangi bir parametre almadan React.FC tipini döndüren bir oklar fonksiyonudur (`def` anahtar kelimesiyle değil, geleneksel `function` veya `const` sözdizimiyle değil; mevcut tanım Python benzeri bir söz diziminde verilmiştir). Gerçek uygulamada JSX/TSX sözdizimi kullanarak bir React bileşeni render eder.

**Parametreler**: Fonksiyon herhangi bir parametre almaz. (Props kullanımı durumunda, alt bileşenler veya çağıran üst bileşen üzerinden props iletilebilir, ancak mevcut tanıma göre parametre seti boştur.)

**Dönüş**: `React.FC` — React tarafından render edilebilen bir fonksiyonel bileşen döndürür. Dönen bileşen, `hub page` olarak adlandırılan sayfanın görsel ve yapısal içeriğini taşır.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/Seo::Seo
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/case::foldForSearch
- import: framer-motion::AnimatePresence
- import: framer-motion::motion
- import: lucide-react::ArrowRight
- import: lucide-react::BookOpen
- import: lucide-react::Calculator
- import: lucide-react::Clock
- import: lucide-react::Search
- import: lucide-react::Settings
- import: next/image::Image
- import: next/link::Link
- import: react::React
- import: react::useMemo
- import: react::useState

---

## TYPE ALIASES

### TopicSlug
```typescript
type TopicSlug = typeof TOPIC_SLUGS[number]
```

---

## SABİTLER
- **TOPIC_SLUGS** (as_expression) — `['hava-perdesi', 'jet-fan', 'hrv'] as const`
- **TAGS** (array) — `[
  { key: 'all', labelKey: 'knowledge.tags.all' },
  { key: 'hava-perdesi'...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: views/knowledge/HubPage.tsx::HubPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu; metinleri dile göre çözümlemek için kullanılır
  - `lang` — useI18n() hook'undan dönen mevcut dil kodu; foldForSearch aramalarında normalize işlemi için kullanılır
  - `Routes` — useLocalizedRoutes() hook'undan dönen yönlendirme nesnesi; Link bileşenlerinde href üretmek için kullanılır
  - `q` — useState('') ile yönetilen arama sorgusu; input.value'ya bağlıdır
  - `setQ` — q state'ini güncelleyen setter fonksiyonu; input onChange olayında e.target.value ile çağrılır
  - `activeTag` — useState<TopicSlug | 'all'>('all') ile yönetilen aktif etiket; filtre butonlarıyla değiştirilir
  - `setActiveTag` — activeTag state'ini güncelleyen setter fonksiyonu; TAGS.map içindeki buton onClick'inde tag.key ile çağrılır
  - `topics` — useMemo ile TOPIC_SLUGS.map sonucu hesaplanan konu listesi; her eleman {slug, title, summary, time, category} nesnesi taşır
  - `filtered` — useMemo ile topics.filter sonucu hesaplanan filtrelenmiş konu listesi; q ve activeTag değişiminde yeniden hesaplanır
- **Dönüş**: JSX (React.FC) — tam sayfa yapısı: Seo, Hero bölümü, filtre butonları, konu kartları grid'i, araçlar/planlama bölümü, destek banner'ı

### [N2_NASIL] AST Pointer: views/knowledge/HubPage.tsx::useMemo_topics_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `TOPIC_SLUGS` — dış sabit; tüm konu slug'larını içeren dizi, map ile dönülür
  - `t` — dış scope'dan gelen çeviri fonksiyonu; title, summary, time, category alanları için kullanılır
- **Dönüş**: dizi — her eleman {slug, title, summary, time, category} nesnesi

### [N3_NASIL] AST Pointer: views/knowledge/HubPage.tsx::topics_map_callback
- **params**: `slug`
- **ic_degiskenler**:
  - `categoryKey` — slug değerine göre belirlenen kategori anahtarı; 'hava-perdesi' ise 'comfort', 'jet-fan' ise 'safety', diğerleri 'efficiency'
  - `t` — dış scope'dan gelen çeviri fonksiyonu; `knowledge.topics.${slug}.title`, `knowledge.topics.${slug}.summary`, `knowledge.hub.readTime`, `knowledge.hub.categories.${categoryKey}` anahtarlarını çözümlemek için kullanılır
- **Dönüş**: nesne — {slug, title: string, summary: string, time: string, category: string}

### [N4_NASIL] AST Pointer: views/knowledge/HubPage.tsx::useMemo_filtered_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `text` — foldForSearch(q.trim(), lang) ile hesaplanan normalize edilmiş arama sorgusu; boş string ise filtreleme atlanır
  - `q` — dış scope'dan gelen arama sorgusu state'i; trim() ile boşlukları temizlenir
  - `lang` — dış scope'dan gelen dil kodu; foldForSearch'a ikinci argüman olarak geçilir
  - `topics` — dış scope'dan gelen konu listesi; filter ile dönülür
  - `activeTag` — dış scope'dan gelen aktif etiket; 'all' ise tüm etiketler geçer, değilse slug eşleşmesi gerekir
  - `foldForSearch` — dış scope'dan import edilen arama normalizasyon fonksiyonu; metinleri küçük harfe ve aksansız forma dönüştürür
- **Dönüş**: dizi — filtrelenmiş topic nesneleri

### [N5_NASIL] AST Pointer: views/knowledge/HubPage.tsx::filtered_filter_callback
- **params**: `tpc`
- **ic_degiskenler**:
  - `matchesText` — boolean; text boşsa true, değilse foldForSearch(`${tpc.title} ${tpc.summary}`, lang) sonucunun text'i içerip içermediğini kontrol eder
  - `matchesTag` — boolean; activeTag 'all' ise true, değilse tpc.slug === activeTag eşleşmesini kontrol eder
  - `text` — dış scope'dan gelen normalize edilmiş arama sorgusu
  - `activeTag` — dış scope'dan gelen aktif etiket
  - `lang` — dış scope'dan gelen dil kodu
  - `foldForSearch` — dış scope'dan gelen normalizasyon fonksiyonu; tpc.title ve tpc.summary birleşimini normalize etmek için kullanılır
- **Dönüş**: boolean — matchesText && matchesTag

### [N6_NASIL] AST Pointer: views/knowledge/HubPage.tsx::title_split_map_callback
- **params**: `part`, `i`
- **ic_degiskenler**: yok
- **Dönüş**: JSX (React.Fragment) — part metni, i === 0 ise virgül ve <br /> eklenir

### [N7_NASIL] AST Pointer: views/knowledge/HubPage.tsx::TAGS_map_callback
- **params**: `tag`
- **ic_degiskenler**:
  - `setActiveTag` — dış scope'dan gelen state setter; buton onClick'inde tag.key ile çağrılır
  - `activeTag` — dış scope'dan gelen aktif etiket; tag.key ile eşleşiyorsa farklı stil uygulanır
  - `t` — dış scope'dan gelen çeviri fonksiyonu; tag.labelKey ile aria-label ve buton metni için kullanılır
- **Dönüş**: JSX (button) — aktif etikete göre stil değişen filtre butonu

### [N8_NASIL] AST Pointer: views/knowledge/HubPage.tsx::filtered_map_callback
- **params**: `topic`, `i`
- **ic_degiskenler**:
  - `Routes` — dış scope'dan gelen yönlendirme nesnesi; Routes.destek.konular(topic.slug) ile Link href'i üretilir
  - `t` — dış scope'dan gelen çeviri fonksiyonu; 'knowledge.hub.readStart' anahtarını çözümlemek için kullanılır
  - `topic.slug` — konu benzersiz tanımlayıcısı; motion key ve Link href'inde kullanılır
  - `topic.category` — konu kategori etiketi; kart üst kısmında gösterilir
  - `topic.time` — okuma süresi bilgisi; Clock ikonu yanında gösterilir
  - `topic.title` — konu başlığı; h2 içinde gösterilir
  - `topic.summary` — konu özeti; p içinde 3 satırla sınırlı gösterilir
  - `i` — dizi indeksi; motion transition delay hesaplamasında i * 0.05 olarak kullanılır
- **Dönüş**: JSX (motion.div > Link) — animasyonlu konu kartı

---

## NODE ID STANDARD

  file: src\views\knowledge\HubPage.tsx
  function: src\views\knowledge\HubPage.tsx::HubPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: HubPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-3xl`, `tracking-hvac-loose`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500`, `bg-cyan-50`, `bg-cyan-500`, `bg-cyan-500/10`, `bg-cyan-500/20`, `bg-gradient-to-b`, `bg-slate-200/50`, `bg-slate-400`, `bg-slate-50`, `bg-slate-900`, `bg-slate-950`, `bg-transparent`, `bg-white`, `bg-white/5`, `border-cyan-500/20`
- **Layout:** `absolute`, `backdrop-blur-xl`, `block`, `flex`, `flex-wrap`, `from-slate-950/80`, `gap-12`, `gap-2`, `gap-3`, `gap-4`, `gap-8`, `grid`, `h-1.5`, `h-64`, `h-full`
- **Varyant/Responsive:** `:`, `focus-visible:`, `group-focus-within:`, `group-hover:`, `hover:`, `lg:`, `md:`, `placeholder:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `===`, `activeTag`, `animate-pulse`, `blur-100`, `blur-2xl`, `border`, `duration-500`, `focus-visible:ring-0`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `grayscale`