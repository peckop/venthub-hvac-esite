# Storefront Tasarım Cetveli (Storefront Design Standard)

> **SSOT.** Müşteri-yüzü storefront'un görsel KOMPOZİSYON kuralları. Token *değerleri* burada değil —
> değer SSOT'u `src/design-system/tokens.js` (boyut/gölge/süre) + `src/index.css` (renk CSS değişkenleri,
> HSL). Bu cetvel o değerlerin **nasıl birleştirileceğini** sabitler; değer çakışırsa token SSOT kazanır.
> **Kapsam:** `src/` eksi admin (→ `admin-standard.md`), eksi 3D sahne (→ `3d-webgl-standard.md`).
> v1.0 · 2026-08-13 — hava-perdeleri onarımı (#486/#487) + drift ölçümü sonrası ilk sürüm.
> Zorlama planı: §4 (INV-9 ratchet → screenshot taraması → PageKit). Bkz. `standard-plus-enforcing-test-is-control` deseni.

---

## 1. Niçin: token VAR, kompozisyon YOK

Design-token altyapısı kurulu (tokens.js + CSS değişkenleri + "arbitrary yasak" kuralı), ama hiçbir
kural iki sayfanın **aynı dili konuşmasını** zorlamıyor. Ölçüm (2026-08-13, admin hariç `src/`):

| Eksen | Ölçülen drift |
|---|---|
| Konteyner | `max-w-7xl` **49×** vs token `max-w-page` **36×** — iki farklı sayfa genişliği (1280 vs 1600px) |
| Gri | **ÜÇ aile:** ham `slate-*` **1116×** + token `steel/industrial-gray` **592×** + ham `gray-*` **252×** |
| Yarıçap | ham `rounded-2xl/3xl` **194×** vs token `rounded-hvac-*` **50×** — token 1'e 4 kaybediyor |
| Vurgu | `navy` 373× / `cyan` 177× / ham `blue-*` 90× / ham `indigo-*` 15× |
| Ağırlık | `font-black` 150× vs `font-extralight` 22× — rol tanımı yok |
| Ritim | 7 farklı `py-*` bölüm değeri aktif (8→32) — bölüm ölçeği yok |

Sorun standart *yokluğu* değil; token **değer** tanımlıyor, **kompozisyon** tanımlanmamış + hiçbir
kapı zorlamıyor. Bu cetvel kompozisyonu tanımlar; §4 kapıları zorlar.

---

## 2. Değişmezler (İHLAL ETME)

### 2.1 Konteyner: tek sayfa genişliği

- **Kanonik dış konteyner = `max-w-page`** (100rem/1600px) + `mx-auto` + kenar boşluğu
  (`px-4 sm:px-6 lg:px-8` deseni). Her üst-seviye bölüm aynı konteynerde hizalanır.
- Okuma kolonu (uzun metin) = `max-w-content` (900px) veya `max-w-prose` (65ch). Modal = `max-w-modal`.
- ❌ `max-w-7xl` (ve diğer ham `max-w-*xl`) **yeni kodda yasak** — LEGACY, ratchet ile eritilecek.
  *Gerekçe (karar):* token zaten `page`'i tanımlıyor; iki genişliğin karışımı bitişik sayfalarda
  görünür hiza kırığı yaratıyor. 1600px geniş vitrin (3D/hero) için bilinçli seçimdi — korunuyor.

### 2.2 Gri: TEK aile = tema-farkındalı token

- Ham Tailwind grileri (`slate-*`, `gray-*`, `zinc-*`, `neutral-*`) **yeni kodda yasak.**
  *Gerekçe (karar):* tema `darkMode: 'selector'` + CSS değişkeni ile dönüyor (`index.css` light/dark
  blokları aynı değişkeni yeniden tanımlar); ham `slate-600` temayla **dönmez** → dark-mode kırığı.
  Üstelik üç ailenin ton eğrileri farklı (slate mavi-gri, gray nötr) → yan yana kirli görünüm.
- **Rol → token eşlemesi:**

| Rol | Token |
|---|---|
| Başlık / güçlü metin | `text-industrial-gray` |
| Gövde / ikincil metin | `text-steel-gray` |
| Soluk / caption | `text-steel-gray/70` (alpha modifier) |
| Açık yüzey / ayraç | `light-gray`, `clean-white` |
| Koyu yüzey katmanları | `surface-deep → darker → darkest / midnight / navy / navy-mid` |

- Yüzey derinliği `surface-*` merdiveniyle kurulur; keyfî `bg-slate-900/xx` katmanlama yasak.

### 2.3 Vurgu hiyerarşisi

- **Birincil marka = `primary-navy`** · etkileşim/ikincil = `secondary-blue` · enerji/glow = `brand-cyan`.
- Semantik sabitler: `success-green` / `warning-orange` / `italian-red` (Vortice) / `vortice-green` —
  yalnız kendi anlamında.
- ❌ Ham `blue-*`, `indigo-*`, `cyan-*`, `sky-*` yeni kodda yasak; ❌ HEX renk yasak
  (CLAUDE.md kural 8 — CSS custom property HSL).

### 2.4 Köşe yarıçapı: `rounded-hvac-*` skalası

| Rol | Token |
|---|---|
| Buton / input / chip | `rounded-hvac-sm` (6px) |
| Kart | `rounded-hvac-md` (16px) |
| Panel / bölüm bloğu | `rounded-hvac-lg` (24px) |
| Hero / modal / büyük yüzey | `rounded-hvac-xl` (32px) ve üstü |

- ❌ Ham `rounded-xl/2xl/3xl` yeni kodda yasak — LEGACY, ratchet.

### 2.5 Tipografi rolleri (ağırlık disiplini)

| Rol | Kural |
|---|---|
| Display (hero başlık) | `text-display` + `font-black` + sıkı tracking — `font-black` **yalnız burada** |
| H1 / H2 | `font-bold` |
| H3 / kart başlığı | `font-semibold` |
| Gövde | `font-normal` |
| Eyebrow / teknik etiket | `uppercase` + `tracking-hvac-*` + `font-medium` |
| Display alt-başlık | `font-extralight`/`font-light` — **yalnız display eşliğinde** |

- Satır yüksekliği token'dan (`leading-hvac-*`); gövde satır uzunluğu ≤ `max-w-prose`.

### 2.6 Dikey ritim: üç bölüm rolü

- **Kompakt** = `py-12` · **Standart** = `py-16 md:py-24` · **Hero/vitrin** = `py-24 md:py-32`.
- Ara/keyfî değer (`py-14`, `py-[72px]` vb.) yasak. PageKit `<Section>` geldiğinde bu üçlü prop olur
  (`density="compact|standard|hero"`); o güne dek sınıflar elle bu üçlüden seçilir.

### 2.7 Görsel kuralları (VentImage dersi — #486/#487)

- Ham `<img>` **yasak**; storefront görseli `<VentImage>` ile (istisna gerekçeli `next/image`).
- **Foto** (ürün/lifestyle/ambiyans) = `object-cover` — kırpılabilir içerik.
- **Metin/etiket taşıyan teknik diyagram** = `object-contain` + sabit oranlı konteyner
  (`aspect-4/3` vb.) — kırpma metni keser, `cover` YASAK. (Hava-perdeleri dersi: diyagramın
  sağ yarısı kırpılmıştı.)
- `fill` modunda parent `relative` + boyutlu olmalı; `fill`'siz modda `width`/`height` **zorunlu** (CLS, kural 10).
- `sizes` gerçek yerleşime göre verilir (varsayılana bırakma).
- **Dış hotlink YASAK:** görsel kaynağı = Supabase Storage veya `/public`. DB `image_url` alanları
  üçüncü-taraf URL taşıyamaz (ölü Unsplash URL dersi). 3D GLB CDN whitelist'i AYRI ve korunur (kural 9).
- `fallbackType` bağlama göre doğru seçilir (`product`/`category`/`brand`) — hepsine `generic` verme.

### 2.8 Gölge / elevasyon

- Katman derinliği `elevation-1..5` merdiveni; marka gölgeleri `hvac-*`/`glow-*` token'ları.
- ❌ Yeni serbest `shadow-[...]` yasak (kural 8'in uzantısı); yeni ihtiyaç → tokens.js'e ekle.

### 2.9 Erişilebilirlik ve performans (mevcut kuralların teyidi)

- Odak: `focus-visible:` (hover-only affordance yasak) · metin kontrastı AA.
- Below-the-fold ağır bölümlere `.content-auto` · her görselde boyut (CLS) · animasyon süre/easing
  yalnız token'dan (`duration-hvac-*`, `ease-hvac-*`).

---

## 3. Serbestlik alanları (cetvel BUNLARA karışmaz)

Cetvel sayfanın **dilini** sabitler, **hikâyesini** değil. Sayfa başına serbest:

- Hero art-direction (görsel, kompozisyon, 3D sahne, gradient kurgusu — renkler §2.2/§2.3'ten olmak kaydıyla)
- Bölüm sayısı, sırası, anlatı kurgusu; grid/split/asimetrik yerleşim seçimi
- İllüstrasyon, ikonografi, mikro-animasyon (süreler token'dan)
- Kategoriye özel vurgu yoğunluğu (ör. endüstriyel sayfada koyu `surface-*` ağırlığı)

Kural: serbestlik **token değerleriyle** kurulur; serbestlik alanı hiçbir zaman §2'yi delme izni değildir.

---

## 4. Zorlama katmanları (yol haritası)

1. **INV-9 stil-conformance testi (ratchet):** §5 baseline sayımları; yeni kod sayacı **artıramaz**,
   göç dalgaları düşürür (i18n INV-5 ratchet deseni). Statik tarama gotcha'ları →
   `conformance-test-static-scan-gotchas` (import.meta.glob, tam-literal kök glob, stale-guard).
2. **Rota × breakpoint screenshot taraması (Playwright):** storefront rotaları × {mobil/tablet/desktop}
   görüntü envanteri → başlangıç görsel skoru + regresyon yakalama (statik kapıların göremediği
   kırpma/CLS/hiza sınıfı için; hava-perdeleri hatalarının hiçbirini statik kapı görmemişti).
3. **PageKit primitifleri + maestro göçü:** `Section` / `SectionHeader` / `FigureImage` —
   cetvel kuralları primitife gömülür (admin kit deseninin storefront'a uygulanışı), sayfalar
   maestro dalgalarıyla göçer. **Sıra: fiyat motorundan SONRA** (Recep önceliklendirmesi).

---

## 5. Ratchet baseline (2026-08-13, admin hariç `src/`)

INV-9 için başlangıç tavanları — hedef hepsinde **0**:

| Sayaç (LEGACY desen) | Baseline |
|---|---|
| `max-w-7xl` | 49 |
| Ham gri (`slate-*` + `gray-*` vb.) | ~1368 (slate 1116 + gray 252) |
| Ham `rounded-xl/2xl/3xl` | 194+ |
| Ham vurgu (`blue-*` 90 + `indigo-*` 15) | 105 |
| Display dışı `font-black` | ≤150 (rol ayrımı INV-9 yazılırken netleşir) |
| Ham `<img>` | INV-9 yazılırken sayılır |
| Bölüm ölçeği dışı `py-*` | INV-9 yazılırken sayılır |

> Sayaçların kesin regex/glob tanımı INV-9 testinin kendisinde yaşar (test = ikinci SSOT yarısı);
> buradaki sayılar ilk ölçümün kaydıdır, test yazılırken yeniden ölçülüp sabitlenir.

---

## 6. Karar kayıtları (kısa gerekçe)

- **Konteyner = `max-w-page` (7xl değil):** token SSOT'ta bilinçli tanımlı (1600px geniş vitrin);
  iki genişlik karışımı ölçülen en görünür hiza kırığı.
- **Gri = token ailesi (slate değil, çoğunlukta olmasına rağmen):** tek tema-farkındalı aday —
  ham Tailwind grisi dark-mode selector'da dönmüyor; çoğunluğu seçmek tema kırığını kanonikleştirirdi.
- **Yarıçap/gölge/süre = mevcut `hvac-*`/`elevation-*` token'ları:** yeni skala icat edilmedi;
  cetvel var olan token'a rol atar (standart-önce, yeniden-yazma değil).
- **Görsel kuralı primitifte zorlanır (sayfada değil):** sayfa-seviyesi fix'in yetmediği
  VentImage kırpma dersi — kural paylaşılan primitife gömülmeli (→ FigureImage/PageKit).
