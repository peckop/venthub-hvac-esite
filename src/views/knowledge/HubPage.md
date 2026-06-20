---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx
skeleton_hash: ad8e775969d61ec4
entity_hashes:
  func:HubPage: ae5a0ef5e997bc98
  overview: 8c0dd30f100fc26b
  style_tokens: 8d8885134f307444
generated_at: 2026-06-19T20:51:24Z
---

## Genel Bakış
Bu modül, VentHub projesinin "Bilgi Merkezi" ana sayfasını oluşturan temel React bileşenini tanımlar. Modül, sayfanın tüm kullanıcı arayüzünü, yapısını ve temel düzenini render eden tek bir ana bileşenden oluşur. Bağımsız bir görünüm modülüdür ve içeriği dinamik olarak yüklenmez.

## Fonksiyon Grupları
### Sayfa Bileşeni
Bilgi Merkezi ana sayfasının tüm görsel yapısını, düzenini ve temel içeriğini oluşturan, bağımsız çalışan bir React fonksiyonel bileşenini tanımlar.
- HubPage

**Dış Bağımlılıklar:** React kütüphanesine bağımlıdır. Kullanım yerine göre, stil tanımları veya alt bileşenler gibi bazı iç bağımlılıkları olabilir, ancak modül tek başına çalışacak şekilde yapılandırılmıştır. Lazy yükleme veya dinamik modül içeriği bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bilgi merkezi ana sayfasını render eden bağımsız bir React bileşenidir.

**[Aksiyom 1]**: Eğer `TOPIC_SLUGS` sabiti modül kapsaminda tanımlı veya import edilmemişse, sayfadaki konu listeleme işlevi çalışamaz ve bileşen hata verir.

**[Aksiyom 2]**: Eğer `TAGS` sabiti modül kapsamında tanımlı veya import edilmemişse, etiket tabanlı içerik gösterimi veya filtreleme işlevi çalışmaz.

**[Aksiyom 3]**: Eğer bileşen props almadığı halde dışarıdan veri bağımlılığı varsa (örn: context, global state) ve bu veri kaynağı mevcut değilse, sayfa eksik veya hatalı içerik gösterir.

**[Aksiyom 4]**: Eğer `TOPIC_SLUGS` veya `TAGS` boş bir dizi/nesne olarak tanımlanmışsa, sayfa teknik olarak çalışır ancak kullanıcılara gösterilecek konu veya etiket içeriği bulunmaz.

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

### [N1_NASIL] AST Pointer: src/views/knowledge/HubPage.tsx::HubPage
- **params**: ()
- **ic_degiskenler**:
  - `t` — useI18n hookundan gelen çeviri fonksiyonu, UI metinlerini çevirir
  - `Routes` — useLocalizedRoutes hookundan gelen yerelleştirilmiş rota nesnesi, navigasyon bağlantıları oluşturur
  - `q` — useState hook'u ile oluşturulan arama sorgusu state'i
  - `setQ` — q state'ini güncellemek için setter fonksiyonu
  - `activeTag` — useState hook'u ile oluşturulan aktif etiket state'i, TopicSlug veya 'all' tutar
  - `setActiveTag` — activeTag state'ini güncellemek için setter fonksiyonu
  - `topics` — useMemo ile hesaplanan konular dizisi, her konu için slug, title, summary, time ve category tutar
  - `filtered` — useMemo ile hesaplanan filtrelenmiş konular dizisi, arama sorgusu ve etikete göre filtreler
- **Dönüş**: JSX elementi (tam sayfa bileşeni)

### [N2_NASIL] AST Pointer: src/views/knowledge/HubPage.tsx::topics.map callback
- **params**: `(slug)` — Topik slug'u (string)
- **ic_degiskenler**:
  - `categoryKey` — slug'a göre belirlenen kategori anahtarı ('comfort', 'safety' veya 'efficiency')
- **Dönüş**: `{ slug, title, summary, time, category }` nesnesi

### [N3_NASIL] AST Pointer: src/views/knowledge/HubPage.tsx::slugToTopic
- **params**: `(slug)` — Topik slug'u (string)
- **ic_degiskenler**:
  - `categoryKey` — slug'a göre belirlenen kategori anahtarı ('comfort', 'safety' veya 'efficiency')
- **Dönüş**: `{ slug, title, summary, time, category }` nesnesi

### [N4_NASIL] AST Pointer: src/views/knowledge/HubPage.tsx::filtered.topicsFilter
- **params**: ()
- **ic_degiskenler**:
  - `text` — q state'inin trimlenmiş ve küçük harfe dönüştürülmüş hali
- **Dönüş**: topics.filter() sonucu, filtrelenmiş konular dizisi

### [N5_NASIL] AST Pointer: src/views/knowledge/HubPage.tsx::topicFilterCallback
- **params**: `(tpc)` — Tek bir konu nesnesi
- **ic_degiskenler**:
  - `matchesText` — konunun title ve summary'sinin text ile eşleşip eşleşmediğini tutan boolean
  - `matchesTag` — konunun slug'ının activeTag ile eşleşip eşleşmediğini tutan boolean
- **Dönüş**: `matchesText && matchesTag` boolean değeri

### [N6_NASIL] AST Pointer: src/views/knowledge/HubPage.tsx::titleSplitter
- **params**: `(part, i)` — part: Virgülle bölünmüş başlık parçası (string), i: indeks (number)
- **ic_degiskenler**: (yok)
- **Dönüş**: React.Fragment elementi, parçayı ve virgülü/boşluk/enter'i gösterir

### [N7_NASIL] AST Pointer: src/views/knowledge/HubPage.tsx::tagButtonRenderer
- **params**: `(tag)` — TAGS dizisindeki tek bir etiket nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: button JSX elementi, etiket için filtreleme butonu

### [N8_NASIL] AST Pointer: src/views/knowledge/HubPage.tsx::topicCardRenderer
- **params**: `(topic, i)` — topic: Tek bir konu nesnesi, i: indeks (number)
- **ic_degiskenler**: (yok)
- **Dönüş**: motion.div JSX elementi, animasyonlu konu kartı

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