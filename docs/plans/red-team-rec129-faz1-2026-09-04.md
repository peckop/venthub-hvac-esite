# Red Team Mimari Denetim Raporu: REC-129 Faz 1 — Kabuk (renk değişkenleri + logo + header/footer)

> **Rol:** bağımsız red-team denetçisi (A2). Amaç planı ÇÜRÜTMEK, onaylamak değil.
> **Kod yazılmadı/değiştirilmedi/silinmedi.** Salt okuma + ölçüm.

## 1. Giriş ve Metodoloji

**Denetlenen plan:** [rec129-faz1-kabuk-plani-2026-09-04.md](rec129-faz1-kabuk-plani-2026-09-04.md)
**Depo/dal:** `C:/tmp/vh-urun-rec89` · `urun/rec94-teklif-modu-tutarliligi` @ `17be76e1`
**Tarih:** 2026-09-04

**Ölçülen kaynaklar:** [src/index.css](../../src/index.css) (688 satır, tamamı tarandı) ·
[tailwind.config.js](../../tailwind.config.js) · [src/design-system/tokens.js](../../src/design-system/tokens.js) ·
[eslint.config.cjs](../../eslint.config.cjs) · [vitest.config.ts](../../vitest.config.ts) ·
[vitest.setup.ts](../../vitest.setup.ts) · [src/utils/testA11y.tsx](../../src/utils/testA11y.tsx) ·
[src/__tests__/conformance/tailwind-token-sinif-gecerliligi.test.ts](../../src/__tests__/conformance/tailwind-token-sinif-gecerliligi.test.ts) ·
[src/components/navigation/NavBrand.tsx](../../src/components/navigation/NavBrand.tsx) ·
[public/favicon.svg](../../public/favicon.svg) · HEX taşıyan 21 `.tsx` + 4 `.ts` dosyasının tamamı ·
WCAG kontrast hesabı (hedef paletin dört rengi, programatik).

**Kapsam ayrımı (çakışma önleme):** bu rapor **renk / token / kabuk** eksenindedir.
`products/3d/**`, `navigation/**` ve `StickyHeader.tsx`'in *teklif-modu* boyutu paralel
denetçidedir; burada yalnız **renk kaynağı** yönüyle değinildi.

**Özet hüküm:** planın **ölçüm disiplini iyi** (134/50 sayıları doğrulandı, 21 HEX dosyası
doğrulandı) — ama **üç temel iddiası ölçümle çöküyor**: (a) tek renk SSOT'u yok, en az **beş**
kaynak var; (b) depoda VentHub marka işareti **VAR**, yani "Faz 1 bloke" gerekçesi dayanaksız;
(c) kilitli paletin iki rengi **WCAG AA'yı geçmiyor** ve planın önerdiği a11y kapısı bunu
**yapısal olarak göremez**. Sonuç: **BLOK**.

---

## 2. Detaylı Teknik Analiz ve Çürütmeler

### 2.1. ÇÜRÜTÜLDÜ — "Renk SSOT'u index.css:275-290" yanlış: en az BEŞ paralel renk kaynağı var

* **Bulgu:** Plan tek bir HSL bloğunu SSOT ilan ediyor ve "değerleri çevir, 134+50 dosya döner"
  kaldıracını buna dayandırıyor. Ölçüm beş ayrı tanım noktası gösteriyor:

  | # | Kaynak | Kanıt |
  |---|---|---|
  | 1 | `:root` HSL bloğu (planın gördüğü tek yer) | [index.css:274-296](../../src/index.css#L274) |
  | 2 | `Legacy Variables` HEX bloğu (plan biliyor) | [index.css:298-312](../../src/index.css#L298) |
  | 3 | **`.light` sınıfı — aynı 12 token'ı YENİDEN tanımlar** | [index.css:328-341](../../src/index.css#L328) |
  | 4 | **`[data-admin-theme]` / `[data-admin-theme='dark']` — 24×2 renk token'ı** | [index.css:381-431](../../src/index.css#L381) |
  | 5 | **`tailwind.config.js` "Korunan renkler" — SABİT HAM HEX** | [tailwind.config.js:76-79](../../tailwind.config.js#L76) |
  | + | `@media (prefers-contrast: more)` içinde 2 token override | [index.css:502-506](../../src/index.css#L502) |

* **En sert alt-bulgu:** planın "kapalı karar" diye yazdığı **uyarı amberi `#F59E0B`
  ZATEN VAR** — ama index.css'te değil, Tailwind config'inde ham HEX olarak:
  `'warning-orange': '#F59E0B'` ([tailwind.config.js:77](../../tailwind.config.js#L77)).
  Yanında `'gold-accent': '#D97706'` var — hedef kiremit `#D95D0E`'ye **çok yakın bir beşinci
  turuncu**. Bu dördü `src` içinde **20 `.tsx` dosyasında** tüketiliyor, **19'u admin DIŞI**
  (ölçüm: `grep -rl 'success-green\|warning-orange\|gold-accent\|silver-accent' src --include=*.tsx`).
  Yani "yalnız arayüz uyarısı" sınırı daha yazılmadan 19 yerde delinmiş durumda.
* **Kabuğun kendisi de bu kaynaktan besleniyor:** header'ın sepet tutarı
  `text-success-green` ([StickyHeader.tsx:272](../../src/components/StickyHeader.tsx#L272)),
  "Hızlı Sipariş" `tone="warning"` → `hover:text-warning-orange`
  ([NavActionButton.tsx:25-26](../../src/components/navigation/NavActionButton.tsx#L25)).
  Faz 1b "tek lacivert bant + kiremit tek sıcak nokta" hükmü bu iki rengi hiç saymıyor.
* **Tailwind ↔ HSL bağı doğru:** `'primary-navy': 'hsl(var(--primary-navy) / <alpha-value>)'`
  ([tailwind.config.js:39](../../tailwind.config.js#L39)) — yani token sınıfları gerçekten CSS
  custom property'den okuyor. Planın bu kısmı **ayakta**. Çöken kısım "**tek**" iddiası.
* **Hangi kural:** CLAUDE.md #8 (design token / SSOT) · plan §2 "Merkezî bulgu".
* **Risk Derecesi: Kritik** — plan §3.1'in tanımı ("iki blok arasında değer çakışması kalmaz")
  gerçek işin **beşte birini** kapsıyor. Bu tanımla iş "bitmiş" ilan edilir, palet çoğul kalır.

---

### 2.2. AYAKTA — "134 / 50" sayıları doğru, şişkin değil

* **Bulgu:** Şüphe haklıydı ama ölçüm planı doğruluyor.
  `grep -rl primary-navy src` = **266** (132'si `.md` companion). Kod-only
  (`.tsx`+`.ts`+`.css`) = **134** (133 tsx + 1 css). `secondary-blue`: toplam 89, 39'u `.md`,
  kod-only = **50** (49 tsx + 1 css). Planın yazdığı sayılar **tam olarak kod sayılarıdır**.
* **Tek uyarı (Düşük):** 133 tsx'in bir kısmı **admin** yüzeyi, yani URUN şeridi değil.
  Plan "134 dosyanın görünümünü tek hamlede çevirir" derken bu **şerit sınırını** saymıyor
  — §3.2'de admin'e dokunmamayı doğru şekilde taahhüt ederken §2'de admin'i kaldıraç
  sayısına dahil ediyor. İç tutarsızlık, ama zararsız.
* **Risk Derecesi: Düşük** (bu iddia çürütülemedi).

---

### 2.3. ÇÜRÜTÜLDÜ — "21 gömülü HEX / 10'u müşteri yüzeyi" dağılımı yanlış; HEX'lerin çoğu MEŞRU

* **Bulgu A — aritmetik tutmuyor.** 21 dosya doğru; dağılım değil.
  Ölçülen: **7 = 3D** (`products/3d/**`) · **5 = admin** (plan "4" diyor;
  [AbcPieChart](../../src/components/admin/dashboard/AbcPieChart.tsx),
  [ActivityHeatmap](../../src/components/admin/dashboard/ActivityHeatmap.tsx),
  [SalesChart](../../src/components/admin/dashboard/SalesChart.tsx),
  [InventoryQrLabel](../../src/components/admin/InventoryQrLabel.tsx),
  [AdminInventoryReportPage](../../src/views/admin/AdminInventoryReportPage.tsx))
  · **9 = kalan** (plan "10" diyor ama kendi listesinde de **9 ad** sayıyor). 7+5+9=21.
* **Bulgu B — `.ts` dosyaları hiç sayılmamış.** 4 `.ts` dosyası daha HEX taşıyor; biri
  doğrudan müşteri yüzeyi konfigürasyonu:
  [orbitalCarouselConfig.ts:86-103](../../src/config/orbitalCarouselConfig.ts#L86)
  (`glowColor: '#22d3ee'`, `backgroundColor: '#020617'`, radial-gradient içinde 3 HEX).
  `--include=*.tsx` süzgeci evreni yanlış kurmuş.
* **Bulgu C — "9 müşteri yüzeyi"nin 4'ü aslında R3F/3D.** `@react-three` import eden dosyalar:
  [BentPlaneGeometry.tsx:22](../../src/components/products/BentPlaneGeometry.tsx#L22)
  (`new Color('#22d3ee')`), [BlueprintCanvas.tsx:112](../../src/components/products/BlueprintCanvas.tsx#L112)
  (`<meshBasicMaterial color="#0066ff">`), [InfiniteProductsShowcase.tsx:191-228](../../src/components/products/InfiniteProductsShowcase.tsx#L191),
  [OrbitalProductsShowcase.tsx:76-132](../../src/components/products/OrbitalProductsShowcase.tsx#L76).
  Bunlar `className` kabul etmez — WebGL materyal/`<color attach="background">` değerleridir.
  Token'a çekmenin tek yolu runtime `getComputedStyle` okuması; bu, SSR'da yok, ilk-boya
  yarışı yaratır ve 3D cetveliyle (CLAUDE.md #9) ayrı bir tartışmadır. Gerçek "düz DOM
  müşteri yüzeyi" sayısı **5**: HomeSinevizyon, HVACIcons, AirCurtainCalcPage,
  JetFanCalcPage, LoginPage.
* **Bulgu D — "0 gömülü HEX" ölçütü İMKANSIZ ve YANLIŞ.**
  [LoginPage.tsx:201-213](../../src/views/LoginPage.tsx#L201) → `#4285F4 · #34A853 · #FBBC05 ·
  #EA4335`. Bunlar **Google "G" logosunun marka renkleridir**. Token'a çekmek = üçüncü taraf
  marka kimliğini VentHub paletiyle bozmak; Google marka kılavuzu bunu yasaklar. Bu HEX'ler
  **doğru** ve kalmalıdır. Aynı sınıf: [HVACIcons.tsx](../../src/components/HVACIcons.tsx)
  içindeki teknik şema renkleri (`#10B981` yeşil / `#EF4444` kırmızı / `#F59E0B` amber =
  durum kodlaması, kategorik palet).
* **Bulgu E — ve bu ZATEN yazılı bir karar.** Depoda konu hakkında **mevcut cetvel var** ve
  plan onu hiç anmıyor: [eslint.config.cjs:47-51](../../eslint.config.cjs#L47) —
  > *"HEX-in-JSX yasağı (design-token kuralı / cetvel #8) … **YALNIZ admin yüzeyinde error:
  > 3D materyal renkleri (R3F) ve storefront KAPSAM DIŞI.** Chart dosyaları (Recharts) Faz 2
  > token-göçüne kadar karantinalı."*

  Yani proje daha önce ölçüp karar vermiş: storefront ve R3F, HEX yasağının **dışında**.
  Plan bu kararı **geri çeviriyor** ama ne kaynak gösteriyor ne de gerekçe veriyor; kendi
  KAYNAK/CETVEL tablosunda `eslint.config.cjs` **yok**. Kural 1'in "yöneten cetveli beyan et"
  şartı, mevcut cetveli **atlayarak** karşılanmış görünüyor.
* **Hangi kural:** CLAUDE.md #1 (KAYNAK/CETVEL beyanı) · #8 (design token) · #9 (3D).
* **Risk Derecesi: Kritik** — kabul ölçütü 1 bugünkü hâliyle ya asla yeşile dönmez
  (Google logosu) ya da yeşile dönmek için **görünür bir marka hatası** işlenir.

---

### 2.4. ÇÜRÜTÜLDÜ — "Depoda VentHub logosu YOK" yanlış; ölçüm dosya-adı vekiline dayanıyor

* **Bulgu:** Planın kanıtı `find public src -iname '*logo*'`. Bu **dosya adı** arar, **marka
  işareti** değil — klasik vekil-kanıt. Gerçek marka işareti iki yerde, ikisi de canlıda:

  1. **Ekrandaki logo:** [NavBrand.tsx:18-22](../../src/components/navigation/NavBrand.tsx#L18) —
     `rounded-2xl bg-gradient-to-br from-primary-navy via-primary-navy to-secondary-blue`
     zemin üzerinde **"VH"** kilit işareti + marka adı. Her sayfanın header'ında render edilir.
  2. **Sekme/tarayıcı logosu:** [public/favicon.svg](../../public/favicon.svg) — 64×64,
     `#0f172a → #2563eb` gradyanlı yuvarlak kare üzerinde **"VH"** wordmark.
     Ayrıca `public/favicon.ico` mevcut.
* **Sonucu iki katmanlı:**
  - **Plan §4'ün ana önerisi ("Faz 1 ikiye ayrılır, çünkü logo BLOKE") dayanağını
    kaybediyor.** Logo bloke değil; **var** ve **token tüketiyor**. §3.3 palet değerlerini
    çevirdiği anda NavBrand logosu — Design'dan hiçbir şey gelmese bile — **kendiliğinden
    değişir**. Yani logo Faz 1b'nin *çıktısı* değil, Faz 1b'nin *yan etkisi*.
  - **favicon.svg gözden kaçan altıncı renk kaynağıdır:** `#2563eb` (hsl 221 83% 53%) hedef
    palette yok, `--primary-navy`'ye de eşit değil. Palet çevrildiğinde sekme ikonu **eski
    markada kalır** — planın §2'de "10 dosya için" saydığı sızıntının tam örneği, ama
    listesinde yok. `public/**` ESLint `ignores`'ında ([eslint.config.cjs:126](../../eslint.config.cjs#L126)),
    yani hiçbir kapı da görmez.
* **Hangi kural:** A1/A4 (kanıt + kod kazanır) · CLAUDE.md #8.
* **Risk Derecesi: Yüksek** — planın **en somut önerisi** (kendi ifadesiyle) yanlış bir
  absans ölçümüne dayanıyor. Design turu beklenmeden çok daha fazlası yapılabilir.

---

### 2.5. ÇÜRÜTÜLDÜ (iki yönlü) — "Faz 1a görsel-nötr" hem GEREKSİZ karamsar hem de kabul ölçütüyle ÇELİŞİK

Bu maddede plan aynı anda iki yönden yanılıyor.

**(a) §3.1 sanıldığından çok daha ucuz — legacy blok neredeyse ÖLÜ.**

`var(--X)` tüketicileri ölçüldü (tüm `src`):

| Değişken | `var(--…)` eşleşmesi |
|---|---|
| `--navy-900` | **1** (yalnız index.css'in kendisi) |
| `--navy-800 / -700 / -600 / -500` | **0** |
| `--cyan-400 / --cyan-500 / --cyan-glow` | **0** |
| `--amber-400` | **0** |
| `--text-primary` | **1** (index.css) |
| `--glass-bg / -border / -hover` | **0** |

Tek gerçek tüketici: [index.css:479-480](../../src/index.css#L479) — `select option { background-color: var(--navy-900) }`.
Yani plan §2'nin "sitenin **iki farklı laciverti** aynı anda göstermesi" korkusu **ölçümle
düşüyor**: ikinci palet hiçbir yerde çizilmiyor. `--navy-900` (#0A0F1E) ile `--surface-deep`
(224 52% 8% → **#0A0F1F**) arasındaki fark **1/255 mavi** — gözle ayırt edilemez.
§3.1 bir "sızıntı kanalı kapatma" değil, **ölü kod temizliğidir**; kaldıraç iddiası abartılı.

**(b) Buna karşılık §3.2, Faz 1a'yı görsel-nötr olmaktan ÇIKARIYOR.**

Plan §7 madde 4: *"Faz 1a müşteriye görünen değişiklik üretmiyor — preview'da **fark yok**."*
Ama Faz 1a'ya **§3.2 (gömülü HEX → token)** de dahil. Ölçülmüş değerler:

| Kaynak | HEX | Karşılık aday token | Token'ın HEX'i | Aynı mı? |
|---|---|---|---|---|
| [HomeSinevizyon.tsx:127](../../src/components/home/HomeSinevizyon.tsx#L127) | `#38BDF8` | `--brand-cyan` | `#2AC9E5` | **HAYIR** |
| [BlueprintCanvas.tsx:112](../../src/components/products/BlueprintCanvas.tsx#L112) | `#0066ff` | — | — | **HAYIR** |
| [OrbitalProductsShowcase.tsx:76](../../src/components/products/OrbitalProductsShowcase.tsx#L76) | `#0891c2` sınıfı cyan | `--brand-cyan` | `#2AC9E5` | **HAYIR** |
| [AirCurtainCalcPage.tsx:228](../../src/views/calculators/AirCurtainCalcPage.tsx#L228) | `#0EA5E9` | `--secondary-blue` | `#0281C5` | **HAYIR** |
| legacy `--cyan-400` | `#22D3EE` (188 86% 53) | `--brand-cyan` (189 78% 53) | doygunlukta **8 puan** fark | **HAYIR** |
| legacy `--amber-400` | `#FBBF24` (43 96% 56) | HSL blokta amber **YOK** | — | eşlenemez |

Yani ya (i) HEX'ler mevcut token'lara çekilir → **piksel değişir, "fark yok" ölçütü yalan
olur**; ya da (ii) her HEX için birebir yeni token açılır → **palet 6 kaynaktan 30 token'a
çıkar**, "tek palet" amacı ters döner. Plan bu ikilemi hiç kurmuyor.

* **Statik kapı körlüğü (A5):** "preview'da fark yok" hiçbir otomatik kapıyla ölçülmüyor;
  `tsc`/`lint`/`vitest` renk değerini görmez. Depoda görsel regresyon (screenshot diff) kapısı
  **yok** — `e2e/` altında yalnız `admin-smoke`, `checkout-smoke`, `reflow` var.
* **Hangi kural:** A5 · CLAUDE.md #1 (ölçülmemiş kabul ölçütü).
* **Risk Derecesi: Yüksek** — kabul ölçütü 4 tanım gereği doğrulanamaz; iyimser okumayla
  "kimse bakmadı" diye yeşil sayılır.

---

### 2.6. ÇÜRÜTÜLDÜ — `INV-PALET-SINIR-1` statik bir kaynak taramasıyla ÖLÇÜLEMEZ

* **Bulgu:** Plan §6, "kiremit **yalnız** logo + ana eylemde" kuralını bir kapının ölçmesini
  öngörüyor. Depodaki en yakın örnek gate'in kendi yazılı kapsam sınırı bunun mümkün
  olmadığını gösteriyor:
  [tailwind-token-sinif-gecerliligi.test.ts:31-34](../../src/__tests__/conformance/tailwind-token-sinif-gecerliligi.test.ts#L31) —
  > *"bu kapı yalnız `className` ATAMALARINI okur … `cn()`/`clsx()` içine gömülü dizeler de
  > şimdilik görülmez (**bilinen boşluk**)."*

  Yani mevcut tarayıcı, sınıfın hangi **bileşende** ve hangi **rolde** kullanıldığını değil,
  metinde geçip geçmediğini bilir.
* **Neden ölçülemez:** "ana eylem" **semantik** bir kavramdır — kaynakta işaretli değil.
  Kiremit sınıfını taşıyan `<button>`'un birincil CTA mı, ikincil bir bağlantı mı, yoksa
  bir rozet mi olduğunu AST bilmiyor. Üstelik sınıf çoğu yerde dolaylı üretiliyor:
  `toneClasses[tone]` ([NavActionButton.tsx:22-26](../../src/components/navigation/NavActionButton.tsx#L22)) —
  kaynak metninde `text-warning-orange` var, ama **hangi çağıranın** onu aldığı ancak
  çağrı-grafiği veya runtime ile bilinir. Planın "**bu sınırı kapı ölçer, insan hatırlamaz**"
  cümlesi bugün karşılıksızdır.
* **Ölçülebilir alternatif (bkz. §3):** kuralı *renk* üzerinden değil, **rol token'ı**
  üzerinden yazmak — `--accent-primary-action` gibi tek amaçlı bir token tanımlayıp
  "kiremit HSL'i **yalnız** bu token'da geçer" invaryantını ölçmek. O, saf metin taramasıyla
  **ayırt edici** olur (metin-taraması-yorumla-tatmin-olur tuzağından çıkar).
* **`INV-PALET-TEKLIK-1` ise ölçülebilir** — ama planın tanımıyla değil: "ikinci bir HEX bloğu"
  değil, §2.1'deki **beş** kaynağın tamamı (`.light`, `[data-admin-theme]`, tailwind config
  ham HEX'leri, `public/favicon.svg`) sayılmalı; aksi hâlde kapı yeşil yanarken palet çoğul kalır.
* **Hangi kural:** CLAUDE.md #8 · A5 (statik kapı runtime'ı görmez).
* **Risk Derecesi: Yüksek** — plan, tutulamayacak bir kapı sözü veriyor; söz "kapı var" diye
  kayda geçerse kural insana kalır ve sessizce çürür.

---

### 2.7. KISMEN ÇÜRÜTÜLDÜ — Kural 8 çelişkisi: legacy blok ihlal DEĞİL, ama Tailwind config ham HEX'i tartışmalı

* **Bulgu:** Şüphe "mevcut legacy HEX bloğu zaten kural 8 ihlali mi?" idi. Ölçüm: **hayır.**
  Kural 8'in mekanik karşılığı `hexJsxRestrictions` ve o yalnız **JSX/obje literal**lerini,
  yalnız **admin** dosyalarında error olarak okur ([eslint.config.cjs:52-63, 155-163](../../eslint.config.cjs#L52)).
  CSS dosyaları bu kuralın kapsamında değil; ayrıca `--navy-900` **bir custom property'dir**
  — kuralın "renkleri CSS custom property üzerinden ver" ifadesinin tam olarak istediği şey.
  Yani plan §2'nin *"Bu, kural 8 ihlalinin bugüne kadar sessiz duran bedelidir"* cümlesi
  legacy blok için **yanlış atıf**tır.
* **Gerçek kural-8 gerilimi başka yerde:** `tailwind.config.js:76-79`'daki dört **ham HEX**
  (`#10B981`, `#F59E0B`, `#D97706`, `#9CA3AF`) — token katmanının kendisinde, tema-bağımsız,
  19 müşteri-yüzeyi dosyasında tüketilen renkler. Bunlar `.light`/`.dark`/`prefers-contrast`
  ile **dönmez**; admin katmanı için aynı sorun daha önce ölçülüp
  [index.css:355-362](../../src/index.css#L355) ile çözülmüş, storefront için çözülmemiş.
  Plan bu kalemi hiç görmüyor.
* **`tailwindcss/no-arbitrary-value: "error"`** global olarak açık
  ([eslint.config.cjs:76](../../eslint.config.cjs#L76)) — arbitrary değer tarafında plan ile
  çelişki **yok**.
* **Risk Derecesi: Orta** — plan yanlış hedefi "ihlal" ilan edip gerçek ihlali atlıyor;
  iş bittiğinde kural 8 açığı yerinde kalır.

---

### 2.8. ÇÜRÜTÜLDÜ — "a11y axe yeşil" kabul ölçütü YAPISAL SAHTE-YEŞİL; üstelik kilitli palet AA'yı GEÇMİYOR

Bu maddedeki iki bulgu birbirini besliyor ve raporun en ağır kalemi.

**(a) Kilitli palet, WCAG 2.2 AA'yı geçmiyor.** Programatik kontrast ölçümü (WCAG relative
luminance):

| Ön plan | Zemin | Oran | AA normal metin (4.5:1) | AA UI/büyük (3:1) |
|---|---|---|---|---|
| **kiremit `#D95D0E`** | beyaz | **3.80** | ❌ **DÜŞER** | ✓ |
| **turkuaz `#0088B0`** | beyaz | **4.08** | ❌ **DÜŞER** | ✓ |
| **amber `#F59E0B`** | beyaz | **2.15** | ❌ **DÜŞER** | ❌ **DÜŞER** |
| lacivert `#1A2B4A` | beyaz | 14.11 | ✓ | ✓ |
| kiremit `#D95D0E` | lacivert `#1A2B4A` | **3.71** | ❌ **DÜŞER** | ✓ |
| **bugünkü** `--primary-navy` `#1E3FAE` | beyaz | **8.83** | ✓ | ✓ |

Sonuç net: plan §3.3 "kiremit yalnız **ana eylem**" diyor. Ana eylem = beyaz yazılı birincil
CTA. Bugün o buton `primary-navy` zemininde **8.83:1**; kiremide geçince **3.80:1** olur —
yani **AA'dan düşen bir gerileme**. Aynı şekilde "aydınlık gövde" üzerinde turkuaz bağlantı
metni 4.08 ile AA'nın altındadır. Bunlar "tartışılmaz kapalı kararlar" olarak yazılmış;
**ölçülmeden** kapatılmışlar.

**(b) Planın kapısı bunu göremez — iki bağımsız sebeple.**

1. **Testlerde CSS hiç yüklenmiyor.** `environment: "jsdom"`
   ([vitest.config.ts:21](../../vitest.config.ts#L21)); `setupFiles: ['vitest.setup.ts',
   'vitest-setup.tsx']` ([vitest.config.ts:22](../../vitest.config.ts#L22)) ve
   [vitest.setup.ts](../../vitest.setup.ts) içinde `index.css` **import edilmiyor**
   (ölçüm: `grep -n css vitest.setup.ts vitest-setup.tsx` → **boş**). Tailwind sınıfları ve
   `--primary-navy` gibi custom property'ler jsdom'da **hiç tanımlı değil**;
   `getComputedStyle` renk için varsayılan döner.
2. **axe-core'un `color-contrast` kuralı jsdom'da zaten koşmaz** — layout/canvas gerektirir,
   sonuç "incomplete" olur ve `toHaveNoViolations` bunu **ihlal saymaz**.
   Koşum yolu: [testA11y.tsx:12-15](../../src/utils/testA11y.tsx#L12) → `axe(container)`
   üzerinden, hiçbir stylesheet olmadan.

Yani planın kabul ölçütü 3 ("a11y axe yeşil; kontrast **sayı** olarak raporda") — birinci
yarısı **her koşulda yeşil yanar**, ikinci yarısını üretecek hiçbir otomatik kaynak yok.
Kontrast sayısı **elle** yazılacaktır; ve elle yazılan sayı bir kapı değildir.
Bu, tam olarak `merge-canlida-calistigini-kanitlamaz` / `ayirt-etmeyen-gosterge` sınıfı bir
vekil kanıttır.

* **Hangi kural:** A5 (statik kapı runtime'ı görmez) · CLAUDE.md #8 (a11y `focus-visible` /
  kontrast) · WCAG 2.2 SC 1.4.3 / 1.4.11.
* **Risk Derecesi: Kritik** — müşteri yüzeyinde erişilebilirlik gerilemesi, "yeşil kapı"
  raporuyla birlikte iner.

---

### 2.9. Ek — planın kendi kanıt linkleri kırık (A3)

* **Bulgu:** Plan `[index.css:275-290](src/index.css#L275-L290)` yazıyor. Dosya
  `docs/plans/` altında olduğundan bu göreli yol `docs/plans/src/index.css`'e çözülür —
  **tıklanamaz**. Doğrusu `../../src/index.css#L275`. Aynı hata §1 tablosundaki tüm
  satırlarda ve §2/§5 atıflarında tekrarlıyor.
* **Hangi kural:** plan-challenger A3.
* **Risk Derecesi: Düşük** (biçimsel) — ama bir sonraki okuyucunun kanıtı **doğrulamamasına**
  yol açar; bu raporun bulgularının yarısı, kanıt doğrulanmadığı için ayakta kalmıştı.

---

## 3. Stratejik Öneriler ve Aksiyon Planı

Öneriler **kalıcı katman** (cetvel + INV kapısı) biçiminde; hand-patch önerilmiyor.

### Ö1 — Palet envanterini ÖNCE tamamla, sonra "tek kaynak" de *(§2.1, §2.4)*
`INV-PALET-TEKLIK-1`'in evreni **altı** kaynağı kapsamalı: `:root` · `.light` ·
`[data-admin-theme]{,='dark'}` · `@media (prefers-contrast: more)` · `tailwind.config.js`
`colors` altındaki **ham HEX** girdileri · `public/*.svg` (favicon). Kapı, "renk-benzeri
literal (`#rrggbb` / `H S% L%`) tanımlayan yer sayısı = beyan edilen liste" biçiminde
**SAYIM** yapsın (dize varlığı değil — `ayirt-etmeyen-gosterge` dersi).
`public/**` ESLint `ignores`'ında olduğu için favicon ayağı **conformance testiyle**
ölçülmeli, lint'le değil.

### Ö2 — "0 gömülü HEX" ölçütünü, MEŞRU HEX sınıflarını tanıyan bir cetvelle değiştir *(§2.3)*
Yeni cetvel (`docs/standards/marka-token-eslemesi-standard.md` — plan bunu zaten teslimatına
almış) **izinli HEX sınıflarını** açıkça saysın:
(1) üçüncü-taraf marka renkleri (Google G, Vortice) — **token'a çekilmez**;
(2) R3F/WebGL materyal ve `<color attach>` değerleri — CLAUDE.md #9 kapsamı, ayrı karar;
(3) veri görselleştirme kategorik paleti (Recharts) — ESLint'te zaten karantinalı;
(4) teknik şema/durum kodlaması (HVACIcons).
Kabul ölçütü "0" değil, **"izinli sınıf dışında 0, hariç tutulanlar ad ad listeli"** olsun.
Ve **`.ts` dosyaları evrene dahil edilsin** (`orbitalCarouselConfig.ts`).
Ayrıca: bu cetvel `eslint.config.cjs:47-51`'deki mevcut kararla **açıkça hesaplaşsın** —
storefront'u kapsama almak bir *değişiklik*tir, gerekçesi yazılmalı (kural 1).

### Ö3 — Kontrastı KAPALI KARARIN ÖNÜNE al; palet Recep'e ölçümle geri gitsin *(§2.8a)*
Kiremit `#D95D0E` beyaz yazıyla **3.80:1** — birincil CTA olarak AA'yı geçmiyor.
Üç seçenek ölçülüp Recep'e **karar sorusu** olarak gitmeli (tercih, olgu değil):
(a) kiremit yalnız **logo + ikon/kenarlık** (≥3:1 UI bileşeni yeter), CTA lacivert kalır;
(b) CTA metni koyu lacivert olur (kiremit zemin + `#1A2B4A` yazı → 3.71, yine düşer → elenir);
(c) kiremidin luminansı düşürülür (ör. `#B34A0B` civarı) → 4.5:1'e çıkar, marka tonu kayar.
Bu **geri-alınamaz olmayan ama görünür** bir marka kararıdır; plan bunu "tartışılmaz" diye
kapatamaz çünkü kapatan taraf ölçmemiş.

### Ö4 — Kontrast için GERÇEK kapı: jsdom değil, Playwright *(§2.8b)*
Depoda zaten `playwright.config.ts` + `e2e/reflow.e2e.ts` var ve `reflow` testi
**"ölçülemedi ≠ geçti"** enstrüman kanıtı desenini uyguluyor
([reflow.e2e.ts:15-20](../../e2e/reflow.e2e.ts#L15)) — kopyalanacak doğru şablon budur.
Yeni kapı `INV-PALET-KONTRAST-1`, gerçek tarayıcıda `@axe-core/playwright` ile
**`color-contrast` kuralını açıkça** koştursun ve enstrüman kanıtı taşısın (bilerek
düşük-kontrastlı bir eleman enjekte et; araç onu **göremezse** test KIRMIZI).
`vitest`+`jsdom` axe'i kontrast için **kabul ölçütü olarak yazılmasın** — bugünkü hâliyle
sahte-yeşildir.

### Ö5 — `INV-PALET-SINIR-1`'i renk yerine ROL TOKEN'ı üzerinden ölç *(§2.6)*
Kaynakta `--accent-cta` ve `--accent-warning` gibi **tek amaçlı rol token'ları** tanımla;
invaryant: *"kiremit HSL üçlüsü yalnız `--accent-cta` tanımında geçer; `--accent-cta`
sınıfı yalnız `<beyan edilen bileşen listesi>` içinde kullanılır."* Böylece kural
`className` metin taramasıyla **ayırt edici** olur. `toneClasses[tone]` gibi dolaylı
üretimler için kapı, **bileşen beyaz listesi** üzerinden ölçsün (kim `tone="primary"`
geçiyor) — yoksa `cn()` boşluğu bu kapıyı da yutar.

### Ö6 — Faz 1a/1b ayrımını YENİDEN kur *(§2.4, §2.5)*
Logo bloke değil; bloke olan **Design'ın yeni logosu**dur. Ayrım şöyle daha dürüst:
- **Faz 1a (bugün, gerçekten düşük riskli):** ölü legacy değişkenlerin **silinmesi**
  (`--navy-800…500`, `--cyan-*`, `--amber-400`, `--glass-*`, `--text-secondary/-muted` →
  ölçülen tüketici sayısı **0**), `--navy-900`/`--text-primary`'nin `select option`'da HSL
  karşılığına çevrilmesi (fark 1/255, ölçüldü), tailwind ham HEX'lerinin HSL token'a
  taşınması, cetvelin yazımı. **Bu paket gerçekten görsel-nötr ve savunulabilir.**
- **§3.2 (gömülü HEX) Faz 1a'dan ÇIKARILSIN** — görsel-nötr değil (§2.5b), üstelik hedef
  palet belli olmadan yapılırsa **iki kez** yapılır.
- **Faz 1b:** palet değerleri + kabuk + NavBrand + **favicon.svg** (unutulmuştu) + logo.

### Ö7 — Faz 1a'nın "fark yok" iddiasına ölçülebilir bir karşılık ver
Görsel regresyon kapısı yoksa "preview'da fark yok" **kabul ölçütü olamaz**. En ucuz
dürüst biçim: Faz 1a'yı **yalnız ölü-kod silmeye** daraltmak (Ö6) ve ölçütü
*"silinen her değişkenin `var(--X)` tüketici sayısı = 0, testte SAYIyla kanıtlı"*
yapmak. Bu, statik olarak ölçülebilir ve ayırt edicidir.

---

## 4. Sonuç

### Genel risk: **BLOK**

Plan iyi ölçülmüş bir çekirdek (§2.2 doğrulandı) etrafında **dört yanlış temel** taşıyor:

| # | İddia | Hüküm | Risk |
|---|---|---|---|
| 2.1 | Renk SSOT'u tek blok | **ÇÜRÜK** — en az 5, favicon ile 6 kaynak | Kritik |
| 2.3 | 21 HEX / 10'u müşteri / hedef "0" | **ÇÜRÜK** — dağılım yanlış, `.ts` atlanmış, "0" imkansız (Google logosu), mevcut cetvel atlanmış | Kritik |
| 2.4 | Depoda VentHub logosu yok → Faz 1 bloke | **ÇÜRÜK** — NavBrand + favicon.svg canlıda | Yüksek |
| 2.8 | a11y axe yeşil = kontrast güvencesi | **ÇÜRÜK** — jsdom'da CSS yok + color-contrast koşmaz; **üstelik palet AA'yı geçmiyor (3.80 / 4.08 / 2.15)** | Kritik |
| 2.5 | Faz 1a görsel-nötr | **ÇELİŞİK** — §3.2 dahil olduğu sürece nötr değil | Yüksek |
| 2.6 | Kiremit sınırını kapı ölçer | **ÇÜRÜK** — statik tarama semantik rolü bilmez | Yüksek |
| 2.7 | Legacy blok = kural 8 ihlali | **YANLIŞ ATIF** — gerçek ihlal tailwind config'te | Orta |
| 2.2 | 134 / 50 | **AYAKTA** | Düşük |
| 2.9 | Kanıt linkleri | **KIRIK (A3)** | Düşük |

**BLOK gerekçesi tek cümleyle:** plan, **erişilebilirlik gerilemesi taşıyan** bir paleti
"tartışılmaz kapalı karar" olarak alıp, o gerilemeyi **yapısal olarak göremeyecek** bir kapıyı
("axe yeşil") kabul ölçütü yazıyor. Bu birleşim, kusurun kapıdan **yeşil** geçmesini garanti
eder — projenin daha önce bedelini ödediği tam desen.

**Bloğu kaldırmak için gereken minimum (KOŞULLU'ya geçiş şartları):**
1. **Ö3** — kiremit/turkuaz/amber kontrast ölçümleri Recep'e karar sorusu olarak gitsin,
   palet ölçümle onaylansın veya düzeltilsin. *(BLOĞUN ASIL SEBEBİ — bu olmadan diğerleri anlamsız.)*
2. **Ö4** — kontrast kapısı Playwright'a taşınsın, jsdom axe kabul ölçütünden çıkarılsın.
3. **Ö2** — "0 gömülü HEX" ölçütü izinli-sınıf cetveliyle değiştirilsin, `eslint.config.cjs`
   KAYNAK/CETVEL bloğuna eklensin ve mevcut kararla hesaplaşılsın (kural 1).
4. **Ö1 + Ö6** — palet envanteri altı kaynağa genişletilsin; Faz 1a **yalnız ölü-kod +
   cetvel**e daraltılsın; favicon.svg Faz 1b kapsamına yazılsın; "logo YOK" ifadesi düzeltilsin.
5. **Ö5** — `INV-PALET-SINIR-1` rol-token'ı üzerinden yeniden tanımlansın veya
   "bugün ölçülemez, insan kuralı" diye **dürüstçe** yazılsın.

§5'teki sıra hükmü (teklif-modu paketi önce iner) **ayakta** — bu rapor onu çürütmedi;
Ö6'daki daraltma o hükmü daha da güçlendirir, çünkü daraltılmış Faz 1a `StickyHeader`'a
hiç dokunmaz ve iki paket **paralel** ilerleyebilir.
