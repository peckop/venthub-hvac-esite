---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx
skeleton_hash: 51959c03f2b8ee36
entity_hashes:
  func:HubPage: ae5a0ef5e997bc98
  overview: 92f1bd1bc9a0b472
  style_tokens: 8d8885134f307444
generated_at: 2026-05-27T18:31:03Z
---

## Genel Bakış
Bu modül, Bilgi Merkezi sayfasının ana arayüzünü oluşturan React bileşenini içerir. Kullanıcıya bilgi kaynaklarına erişim sağlayan merkezi sayfanın yapısını ve düzenini tanımlar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Bilgi Merkezi sayfasının görsel yapısını ve içerik düzenini tanımlar.
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

### [N1_NASIL] AST Pointer: src\views\knowledge\HubPage.tsx::HubPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook’inden dönen çeviri fonksiyonu, metinleri yerelleştirmek için kullanılır.
  - `q` — Arama kutusundaki kullanıcı girdisini tutan state değişkeni.
  - `setQ` — `q` state’ini güncelleyen set fonksiyonu.
  - `activeTag` — Seçili etiket (veya `'all'`) değerini tutan state değişkeni.
  - `setActiveTag` — `activeTag` state’ini güncelleyen set fonksiyonu.
  - `topics` — `TOPIC_SLUGS` listesinden oluşturulan, her bir konu için başlık, özet, okuma süresi ve kategori bilgilerini içeren dizi. `useMemo` ile `t` bağımlılığına göre memoize edilir.
  - `filtered` — `q` ve `activeTag` değerlerine göre `topics` dizisini filtreleyen dizi. `useMemo` ile `q`, `topics`, `activeTag` bağımlılıklarına göre memoize edilir.
- **Dönüş**: React element ağacı (JSX) döner; bileşen render edildiğinde UI oluşturur ve yan etkisi yoktur (state ve memoizasyonlar aracılığıyla UI güncellenir).

### [N2_NASIL] AST Pointer: src\views\knowledge\HubPage.tsx::(TOPIC_SLUGS.map callback)
- **params**: `slug`
- **ic_degiskenler**:
  - `categoryKey` — `slug` değerine göre `'comfort'`, `'safety'` veya `'efficiency'` stringi atanır; kategori çevirisi için kullanılır.
- **Dönüş**: `{ slug, title, summary, time, category }` nesnesi döner; `title`, `summary`, `time` ve `category` değerleri `t` çeviri fonksiyonu ile oluşturulur.

### [N3_NASIL] AST Pointer: src\views\knowledge\HubPage.tsx::(filtered useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `text` — `q` değerinin boşlukları temizlenmiş ve küçük harfe dönüştürülmüş hali.
- **Dönüş**: `topics.filter` çağrısının sonucu olan, arama metni ve seçili etiket koşullarını sağlayan konu nesnelerinin dizisi.

### [N4_NASIL] AST Pointer: src\views\knowledge\HubPage.tsx::(topics.filter callback)
- **params**: `tpc`
- **ic_degiskenler**:
  - `matchesText` — `text` boş ise `true`, aksi takdirde `tpc.title` ve `tpc.summary` birleştirilip `text` içinde bulunuyorsa `true`.
  - `matchesTag` — `activeTag` `'all'` ise `true`, aksi takdirde `tpc.slug` ile `activeTag` eşleşiyorsa `true`.
- **Dönüş**: `matchesText && matchesTag` boolean ifadesi; filtreleme sonucunu belirler.

### [N5_NASIL] AST Pointer: src\views\knowledge\HubPage.tsx::(title split map callback)
- **params**: `part, i`
- **ic_degiskenler**: (hiçbiri)
- **Dönüş**: `React.Fragment` içinde `part` ve koşullu virgül/`<br/>` öğeleri döner; başlık metnini parçalar ve formatlar.

### [N6_NASIL] AST Pointer: src\views\knowledge\HubPage.tsx::(TAGS.map callback)
- **params**: `tag`
- **ic_degiskenler**:
  - `tag.key` — Etiketin benzersiz anahtarı, `setActiveTag` çağrısında kullanılır.
  - `tag.labelKey` — Çeviri dosyasındaki etiket etiketi anahtarı, `t` ile çevrilir.
- **Dönüş**: `<button>` JSX öğesi döner; tıklanınca `activeTag` güncellenir ve etiket adı gösterilir.

### [N7_NASIL] AST Pointer: src\views\knowledge\HubPage.tsx::(filtered.map callback)
- **params**: `topic, i`
- **ic_degiskenler**:
  - `topic.slug` — Konu sayfasına yönlendirme URL’si için kullanılır.
  - `topic.category` — Konu kategorisi etiketi.
  - `topic.time` — Okuma süresi etiketi.
  - `topic.title` — Konu başlığı.
  - `topic.summary` — Konu özeti.
- **Dönüş**: `<motion.div>` içinde `<Link>` JSX öğesi döner; konu kartını ve animasyonlarını oluşturur.

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