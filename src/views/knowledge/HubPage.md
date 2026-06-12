---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx
skeleton_hash: aaba60e429f09ad8
entity_hashes:
  func:HubPage: ae5a0ef5e997bc98
  overview: 71b37ce0d8e45326
  style_tokens: 8d8885134f307444
generated_at: 2026-06-08T10:11:02Z
---

## Genel Bakış
Bu modül, VentHub projesinin "Bilgi Merkezi" (Knowledge Hub) ana sayfasını oluşturan React bileşenini içermektedir. Modül, kullanıcıların bilgi kaynaklarına eriştiği merkezi bir arayüz sunar ve sayfanın yapısını, düzenini ve temel içeriğini tanımlar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Bilgi Merkezi ana sayfasının tüm görsel yapısını ve temel düzenini render eden ana React bileşenini tanımlar.
- HubPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### HubPage
**Ne yapar**: Bu fonksiyon, bir React fonksiyonel bileşeni (Functional Component) olarak tanımlanmıştır ve muhtemelen bilgi merkezi veya bilgi sayfası görünümünü temsil eden bir kullanıcı arayüzü bileşeni döndürür. Dosya yolu `views/knowledge` dizinini işaret ettiğinden, bilgi yönetimi veya dokümantasyonla ilgili bir sayfanın ana gövdesini oluşturur.

**Nasıl yapar**: HubPage, herhangi bir parametre almadan React.FC tipini döndüren bir oklar fonksiyonudur (`def` anahtar kelimesiyle değil, geleneksel `function` veya `const` sözdizimiyle değil; mevcut tanım Python benzeri bir söz diziminde verilmiştir). Gerçek uygulamada JSX/TSX sözdizimi kullanarak bir React bileşeni render eder.

**Parametreler**: Fonksiyon herhangi bir parametre almaz. (Props kullanımı durumunda, alt bileşenler veya çağıran üst bileşen üzerinden props iletilebilir, ancak mevcut tanıma göre parametre seti boştur.)

**Dönüş**: `React.FC` — React tarafından render edilebilen bir fonksiyonel bileşen döndürür. Dönen bileşen, `hub page` olarak adlandırılan sayfanın görsel ve yapısal içeriğini taşır.

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

### [N1_NASIL] AST Pointer: HubPage.tsx::HubPage (main component)
- **params**: (parametre yok — anonim arrow function olarak React.FC döner)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu, tüm UI metinlerini uluslararasılaştırır
  - `q` — useState ile yönetilen arama sorgusu state'i, kullanıcının yazdığı filtre metni
  - `setQ` — q state'ini güncelleyen setter fonksiyonu, input onChange'te çağrılır
  - `activeTag` — useState ile yönetilen aktif etiket filtresi state'i, TopicSlug veya 'all' tipinde
  - `setActiveTag` — activeTag state'ini güncelleyen setter fonksiyonu, tag butonlarına tıklanınca çağrılır
  - `topics` — useMemo ile hesaplanan konu dizisi, TOPIC_SLUGS üzerinde map yaparak her slug için title, summary, time, category içeren nesne üretir
  - `filtered` — useMemo ile hesaplanan filtrelenmiş konu dizisi, q ve activeTag'e göre topics'i filtreler
- **Dönüş**: JSX — tam sayfa layout'u (hero, arama barı, etiket navigasyonu, konu grid'i, araçlar bölümü, destek banner'ı)

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