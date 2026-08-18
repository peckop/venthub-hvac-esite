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

1. ✅ **INV-9 stil-conformance testi (ratchet) — 2026-08-18'de YAZILDI ve CANLI**
   (`src/__tests__/conformance/storefront-style-ratchet.test.ts`; 7 ratchet + 2 sert kapı +
   bayatlık kilidi + vacuous-pass koruması; 10 sabotajla kanıtlandı). Ayrıntı → §5.
   Özgün tarif: §5 baseline sayımları; yeni kod sayacı **artıramaz**,
   göç dalgaları düşürür (i18n INV-5 ratchet deseni). Statik tarama gotcha'ları →
   `conformance-test-static-scan-gotchas` (import.meta.glob, tam-literal kök glob, stale-guard).
2. **Rota × breakpoint screenshot taraması (Playwright):** storefront rotaları × {mobil/tablet/desktop}
   görüntü envanteri → başlangıç görsel skoru + regresyon yakalama (statik kapıların göremediği
   kırpma/CLS/hiza sınıfı için; hava-perdeleri hatalarının hiçbirini statik kapı görmemişti).
3. **PageKit primitifleri + maestro göçü:** `Section` / `SectionHeader` / `FigureImage` —
   cetvel kuralları primitife gömülür (admin kit deseninin storefront'a uygulanışı), sayfalar
   maestro dalgalarıyla göçer. **Sıra: fiyat motorundan SONRA** (Recep önceliklendirmesi).

---

## 5. Ratchet baseline (admin hariç `src/`) — **CANLI: `INV-9`**

**Kapı yazıldı ve CANLI:** `src/__tests__/conformance/storefront-style-ratchet.test.ts`.
Tavanların **otoritesi artık testtir**, bu tablo değil — aşağısı okunabilir bir özettir.

| Sayaç (LEGACY desen) | 08-13 | **08-18 tavan** | Tür |
|---|---|---|---|
| `max-w-7xl` | 49 | **49** | ratchet |
| Ham gri (`slate-*` + `gray-*`) | 1396 | **1508** | ratchet |
| Ham `rounded-xl/2xl/3xl` | 378 | **391** | ratchet |
| Ham vurgu (`blue-*` + `indigo-*`) | 143 | **148** | ratchet |
| Display dışı `font-black` | 150 | **133** | ratchet |
| Keyfî `shadow-[...]` | — | **3** | ratchet |
| Keyfî `w/h/text/gap-[...]` | — | **6** | ratchet |
| Ham `<img>` | 0 | **0** | 🔒 sert kapı |
| Keyfî `p*-[...]` | 0 | **0** | 🔒 sert kapı |

> ⚠️ **08-13 sütunu ÜÇ satırda düzeltildi (2026-08-18).** Önceki tablo `rounded` için
> "194+", `blue` için 90 diyordu; aynı regex o commit'te koşulunca gerçek sayılar **378**
> ve **125** çıktı — yani baseline'ın kendisi yarım sayılmıştı. Sonuç: 08-18 ölçümü ilk
> bakışta "desen iki katına çıktı" gibi göründü, oysa gerçek sapma **~+132**. **Ders:**
> ölçüm YÖNTEMİ yazılmamış bir baseline, sonraki ölçümü yanlış alarma çevirir. Bu yüzden
> her sayacın regex'i ve kapsamı artık testin İÇİNDE yaşıyor (test = SSOT'un ikinci yarısı).

**Tavanlar niçin 08-13'e değil BUGÜNE sabitlendi:** geriye çekmek kapıyı doğuştan kırmızı
yapardı; kırmızı doğan kapı ya devre dışı bırakılır ya görmezden gelinir (bu depoda
`eslint` `warn` seviyesinin başına gelen tam buydu — fail-open). Ratchet geçmişi
cezalandırmaz, **geleceği kapatır**; sapmanın kaydı yukarıdaki tabloda duruyor.

**Bayatlık kilidi:** sayaç tavanın altına düşerse test **kırmızı yanar** ve tavanı
indirmeni ister. Bu bir regresyon değil ödüldür — ratchet ancak tek yönlü sıkışırsa
ratchet'tir, yoksa göç dalgasının kazandığı zemin sessizce geri verilebilir.

### 5.1 ÖLÇÜLEMEZ-STATİK (kapı bunları görmez — adıyla işaretli)

Statik tarama şu kuralları **yapısal olarak** göremez; "kapı yeşil" bunların uyulduğu
anlamına **gelmez**:

| Kural | Niçin statik ölçülemez | Nereye devredildi |
|---|---|---|
| §2.6 bölüm dikey ritmi (`py-12/16/24/32`) | İzinli-set dışı 365 isabetin değerleri `py-1/2/3` — buton/rozet dolgusu, bölüm dolgusu değil. Bir elemanın "bölüm" rolünde olduğu className'den bilinemez. Ham sayıyı ratchet yapmak 365 yanlış-KIRMIZI üretirdi. | §4.3 PageKit `<Section density>` primitifi (yapısal zorlama). Statik zorlanabilen dar dilim — keyfî `p*-[...]` — kapıya **alındı**. |
| §2.7 `object-cover` / `object-contain` ayrımı | Doğru seçim görselin **foto mu teknik diyagram mı** olduğuna bağlı; bu semantik bilgi kodda yok. (Hava-perdeleri kırpma hatası tam bu sınıftı.) | §4.2 Playwright görsel katmanı |
| §2.3 vurgu hiyerarşisi · §2.5 rol eşleşmesi · §2.1 konteynerin bağlamda doğruluğu | Hepsi "bu eleman hangi rolde" sorusunu gerektirir | §4.2 + kod incelemesi |
| Kırpma / CLS / hiza / görsel regresyon | Statik kapı bu sınıfı hiç göremez | §4.2 Playwright |

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
