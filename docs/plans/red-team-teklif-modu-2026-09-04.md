# Red Team Mimari Denetim Raporu: Teklif Modu Tutarlılık Paketi (2026-09-04)

> **Bağımsız denetim (cetvel A2: üretici ≠ yargıç).** Hedef: planı ÇÜRÜTMEK.
> Kod yazılmadı/değiştirilmedi/silinmedi — bu belge tek çıktıdır.

## 1. Giriş ve Metodoloji

| | |
|---|---|
| **Denetlenen plan** | [teklif-modu-tutarlilik-paketi-2026-09-04.md](teklif-modu-tutarlilik-paketi-2026-09-04.md) |
| **Depo / taban** | `C:/tmp/vh-urun-rec89`, dal `urun/rec94-teklif-modu-tutarliligi`, HEAD `480352bd` (çalışma ağacı temiz; tek değişiklik = plan belgesinin kendisi) |
| **Cetvel** | [plan-challenger/SKILL.md](../../.claude/skills/plan-challenger/SKILL.md) — A1 kanıt zorunlu · A3 tıklanabilir göreli link · A4 kod kazanır · A5 statik kapı runtime'ı görmez |
| **Yardımcı cetveller** | [vaat-butunlugu-standard.md](../standards/vaat-butunlugu-standard.md) · [3d-webgl-standard.md](../standards/3d-webgl-standard.md) · `CLAUDE.md` Mutlak Kurallar |

**Fiilen koşulan ölçümler (hepsi bu depoda, bugün):**

- `grep -rln 'VentHubCanvas\|MegaMenu3DBackground\|ThreeDAuthority\|Category3DIcon\|@react-three' src` → **72** dosya (kod-only `--include='*.ts(x)'` → **39**)
- Her 3D bileşeninin **tüketici zinciri** (import + `dynamic()` + JSX çağrı yeri) tek tek izlendi
- `grep -rn 'quickOrder\|Hızlı Sipariş\|Quick Order' src supabase` → **3** isabet
- `npx vitest run src/__tests__/conformance/i18n-dead-key.test.ts` → **8/8 YEŞİL** (canlı koşuldu)
- `.github/workflows/*.yml` + `.husky/` içinde `knip` araması → **0 isabet**
- 3D kapıları okundu: `3d-single-canvas` · `3d-asset-validity` · `3d-csp` · `3d-model-recipe` · `3d-procedural-env`
- SSR ölçüm dosyası okundu: [tests/smoke/ssr-html.spec.ts](../../tests/smoke/ssr-html.spec.ts)
- Bayrak deseni ölçüldü: [checkout/page.tsx:21](../../src/app/[lang]/checkout/page.tsx#L21)

**Özet hüküm:** Planın *niyeti* ve *sınır çizme disiplini* (§2.4'ün pakete gömülmemesi) sağlam.
Ama **kabul ölçütü 1 ayırt edici değil** (sahte-yeşil sınıfı), **giriş noktası envanteri hem
fazla hem eksik sayıyor**, ve **asıl ayırt edici ölçüm dosyası plan kapsamının tamamen dışında.**

---

## 2. Detaylı Teknik Analiz ve Çürütmeler

### 2.1. Kabul ölçütü 1 AYIRT EDİCİ DEĞİL — bayrak açıkken de kapalıyken de "0" verir

* **Bulgu:** Plan §5.1: *"Müşteri yüzeyinde 3D giriş noktası sayısı **0** — erişilebilirlik
  ağacıyla ölçülür (ham HTML değil)."* Ölçtüm: 3D yüzey bileşenlerinin **hiçbirinde**
  `aria-*`, `role=` veya `alt=` yok. WebGL `<canvas>` erişilebilirlik ağacına kendiliğinden
  hiçbir düğüm katmaz. Yani erişilebilirlik ağacı, bayrak `true` iken de `false` iken de aynı
  şeyi görür: **hiçbir şey.** Ölçüt iki hâlde aynı değeri verdiği için bir ölçüm değildir.
* **Somut Kanıt:** `grep -n "aria-\|role=\|alt=" ` şu dört dosyada **sıfır satır** döndü:
  [OrbitalProductsShowcase.tsx](../../src/components/products/OrbitalProductsShowcase.tsx) ·
  [MegaMenu3DBackground.tsx](../../src/components/navigation/MegaMenu3DBackground.tsx) ·
  [Category3DIcon.tsx](../../src/components/products/Category3DIcon.tsx) ·
  [CategoryOrbitCarousel.tsx](../../src/components/products/CategoryOrbitCarousel.tsx).
  Tek istisna, erişilebilirlik ağacında **gerçekten** görünen PDP galeri düğmesidir:
  [ImageGallery.tsx:153](../../src/components/ImageGallery.tsx#L153) (`aria-label={t('common.view3D')}`).
* **Hangi Kural:** Bu deponun kendi dersi — [[ayirt-etmeyen-gosterge-olcum-degildir]]; ayrıca
  planın kendi §3 tablosunun *"Sabotaj (ayırt edici olmak zorunda)"* sütunu.
* **Risk Derecesi:** **Kritik** (sahte-yeşil: paket "kabul edildi" damgası alır, 6 yüzeyin
  4'ü ölçülmemiş kalır).

### 2.2. Asıl ayırt edici ölçüm dosyası plan kapsamının DIŞINDA — ve sessizce bayatlayacak

* **Bulgu:** Depoda, 3D yüzeylerin SSR'daki varlığını **sayıyla** ölçen bir dosya zaten var:
  `BAILOUT_TO_CLIENT_SIDE_RENDERING` sayacı. `/tr/products` için tavan **1** ve yorumu
  açıkça *"1 bailout bilinçli: CategoryOrbitCarousel (3D) kendi Suspense'inde ssr:false"*
  diyor; PDP için tavan **2** (*"galeri + 3D bloğu"*). Plan bu dosyayı hiç anmıyor.
  Dahası assertion `toBeLessThanOrEqual` — yani şerit kaldırıldığında sayaç 1→0 düşer,
  **kapı yeşil kalır** ve ratchet kurgu hâline gelir. Ölçütün ta kendisi burada duruyor
  ve plan onu ne kullanıyor ne de sıkıştırıyor.
* **Somut Kanıt:** [ssr-html.spec.ts:29](../../tests/smoke/ssr-html.spec.ts#L29) (`maxBailouts: 1`),
  [ssr-html.spec.ts:39](../../tests/smoke/ssr-html.spec.ts#L39) (`maxBailouts: 2`),
  [ssr-html.spec.ts:61](../../tests/smoke/ssr-html.spec.ts#L61) (`toBeLessThanOrEqual`).
* **Hangi Kural:** A5 (statik kapı runtime'ı görmez) + `rendering-cache-standard.md`.
* **Risk Derecesi:** **Yüksek** — düzeltmesi ucuz, atlanması pahalı.

### 2.3. Kabul ölçütü 1 ve 3'ün **hiçbir CI kapısı yok** (A5)

* **Bulgu:** §5.1 "erişilebilirlik ağacı", §5.3 "SSR HTML'de ölçülür" diyor. Ama SSR-HTML
  ölçümü `describe.skipIf(!SMOKE_BASE_URL)` ile korunuyor ve `SMOKE_BASE_URL` hiçbir
  workflow'da tanımlı değil → CI'da **atlanır**. Playwright koşusu ise yalnız
  `**/*.e2e.ts` (admin + checkout + reflow) çalıştırıyor; vitrin/3D yüzeyi kapsamda değil.
  Yani ikisi de **elle** ölçümdür; "kabul ölçütü yeşil" cümlesi CI'dan doğrulanamaz.
* **Somut Kanıt:** [ssr-html.spec.ts:45](../../tests/smoke/ssr-html.spec.ts#L45) ·
  [playwright.config.ts:15](../../playwright.config.ts#L15) (`testMatch: '**/*.e2e.ts'`) ·
  `grep -rn "SMOKE_BASE_URL" .github/workflows/` → 0 isabet.
* **Hangi Kural:** A5.
* **Risk Derecesi:** **Orta** (plan bunu açıkça yazarsa kabul edilebilir; şu an yazmıyor →
  okuyan "kapı var" sanır).

### 2.4. "Müşteri yüzeyinde 3D giriş noktası 6" — sayı hem FAZLA hem EKSİK

Envanteri tek tek izledim. Ölçülen tablo:

| # | Plan'ın adı | Gerçek kod noktası | Hüküm |
|---|---|---|---|
| 1 | PDP rozeti | [ProductDetailPageView.tsx:527](../../src/app/_components/ProductDetailPageView.tsx#L527) | **KOŞULLU** — yalnız `topicSlug === 'hava-perdesi'` iken basılıyor |
| 2 | galeri düğmesi | [ImageGallery.tsx:151](../../src/components/ImageGallery.tsx#L151) | canlı |
| 3 | otorite bloğu | [AuthorityRenderer.tsx:234](../../src/components/authority/AuthorityRenderer.tsx#L234) | **MÜŞTERİ YÜZEYİNDE ERİŞİLEMEZ** (aşağıda) |
| 4 | kategori paneli | [CategoryHubOverlay.tsx:15](../../src/components/navigation/CategoryHubOverlay.tsx#L15) | canlı |
| 5 | mega menü arkaplanı | [EliteMegaMenu.tsx:132](../../src/components/navigation/EliteMegaMenu.tsx#L132) | canlı; **yalnız masaüstü** (`MobileMegaMenu` 3D basmıyor) |
| 6 | /products orbital şerit | [ProductsDiscoveryView.tsx:95](../../src/views/ProductsDiscoveryView.tsx#L95) | canlı — ama **iki rotada** (aşağıda) |

**(a) 3 numara müşteri yüzeyinde yok.** `AuthorityRenderer`'ın 3D dalını müşteriye taşıyan
tek sarmalayıcı [CategoryAuthoritySection.tsx](../../src/components/category/CategoryAuthoritySection.tsx)'dır
ve o bileşenin **sıfır tüketicisi** var (`grep -rn "CategoryAuthoritySection" src --include='*.tsx'`
→ yalnız kendi dosyası). Bugün `AuthorityRenderer`'ı canlı çağıran tek yer **admin**:
[CategoryBuilderView.tsx:519](../../src/views/admin/CategoryBuilderView.tsx#L519).
**Sonuç:** tek küresel bayrak (`UC_BOYUT_MUSTERI_YUZEYINDE`) buraya uygulanırsa,
müşteride zaten görünmeyen bir yüzeyi kapatmış olmaz; kapattığı şey **admin'in 3D blok
önizlemesi** olur — yani bir *yetenek vaadi* değil, bir *editör aracı*. Plan bunu ayırt etmiyor.

**(b) 6 numara tek kod noktası ama iki rota.** `ProductsDiscoveryView` yalnız `/products`
sayfasında değil, kategori master görünümünde de render ediliyor:
[CategoryMasterView.tsx:130](../../src/views/CategoryMasterView.tsx#L130) (dinamik import
[satır 23](../../src/views/CategoryMasterView.tsx#L23)). §2.2'nin *"yerine kategori kartları"*
önerisi kategori rotasında **mükerrer kategori kartı** üretir (zaten alt-kategori kartları basan
bir sayfada ikinci bir kategori şeridi). Plan bu ikinci rotayı hiç saymamış.

* **Hangi Kural:** A4 (kod kazanır) + `vaat-butunlugu-standard.md` §2.
* **Risk Derecesi:** **Yüksek** — "hepsi kapandı" kabul ölçütü, yanlış kümeyi sayıyor
  ([[olcut-keskin-ama-evren-yanlis]] sınıfı).

### 2.5. §2.2'nin "sıfır yeni bileşen, mevcut kanıtlı desen" iddiası KANITSIZ

* **Bulgu:** Plan, orbital şeridin yerine *"mevcut kanıtlı desenle kategori kartları — sıfır
  yeni bileşen"* koyacağını söylüyor ama **hangi bileşen** olduğunu yazmıyor. Ölçtüm:
  `ProductsDiscoveryView`'ın bugün kullandığı tek kart bileşeni `FamilyCard`'dır
  ([satır 22](../../src/views/ProductsDiscoveryView.tsx#L22)) ve o bir **aile** kartıdır,
  kategori kartı değil. Kategori kartı deseni bu görünümde **yok**. `initialCategories`
  prop'u tanımlı ([satır 41](../../src/views/ProductsDiscoveryView.tsx#L41)) ama gövdede
  destructure bile edilmiyor ([satır 53-58](../../src/views/ProductsDiscoveryView.tsx#L53)) —
  yani "kategori kartı basacak veri zaten akıyor" varsayımı da ölçülmemiş.
* **Hangi Kural:** A1 (kanıt zorunlu) + `CLAUDE.md` #1 (plan kendisini yöneten cetveli söylemeli).
* **Risk Derecesi:** **Yüksek** — "sıfır yeni bileşen" iddiası PR'da çökerse paket büyür ve
  §4'teki "tek PR taşır" gerekçesi düşer.

### 2.6. Yeni bayrak: depoda KANITLI desen var, plan ona uymuyor ve **env mi sabit mi** demiyor

* **Bulgu:** Depoda ödeme için çalışan, ölçülmüş bir bayrak deseni var:
  `const ODEME_ACIK = process.env.NEXT_PUBLIC_ODEME_ACIK === '1'` — **tüketici dosyasının
  kendi içinde**, `src/config/` altında değil; ve açma prosedürü *"kod değişmez, Vercel'de
  env tanımlanır"* diye belgeli. Plan ise `src/config/features.ts` + `UC_BOYUT_MUSTERI_YUZEYINDE`
  diyor ama **sabit mi env-bağlı mı** söylemiyor. İki dal da tuzaklı:
  - **Sabit yazılırsa:** geri açma "tek satır kod değişikliği + PR + deploy" olur; ödeme
    bayrağının kanıtlı "kodsuz açma" davranışıyla çelişir; ayrıca planın §4 "Geri açma: tek
    satır" satırı bir **deploy** gerektirdiğini gizler.
  - **Env-bağlı yazılırsa:** tüm 6 tüketici **istemci** ağacında (`ProductDetailPageView`,
    `StickyHeader`, `EliteMegaMenu`, `AuthorityRenderer` hepsi `'use client'`), dolayısıyla
    `NEXT_PUBLIC_` öneki **zorunlu**. Öneksiz yazılırsa değer istemci demetinde `undefined`
    olur, bayrak sessizce hep aynı dala düşer ve **hiçbir kapı görmez** — depoda bu tuzağın
    yazılı kaydı zaten var: [siteUrl.ts:20](../../src/config/siteUrl.ts#L20).
  Ek: `src/config/index.ts` bir barrel'dır ([4 satır](../../src/config/index.ts)); yeni dosya
  oraya eklenirse mevcut desene uyar, eklenmezse desen çatallanır.
* **Somut Kanıt:** [checkout/page.tsx:16-21](../../src/app/[lang]/checkout/page.tsx#L16-L21) ·
  [siteUrl.ts:20](../../src/config/siteUrl.ts#L20) · [config/index.ts](../../src/config/index.ts)
* **Hangi Kural:** `CLAUDE.md` #4 (RSC/'use client' sınırı) + plan-challenger başlık 2.
* **Risk Derecesi:** **Yüksek** (env dalı seçilir ve önek unutulursa: sessiz, kapısız kusur).

### 2.7. Teklif modu SSOT'u ÇATALLANIYOR — planın kendi teşhisiyle çelişiyor

* **Bulgu:** Plan §0'da kusuru *"iki yüzeyin birbirinden habersiz konuşması"* diye teşhis
  ediyor. Depoda bu sınıfın çözümü zaten yazılı: teklif modu hükmü **tek** saf fonksiyonda
  yaşıyor ve dosyanın kendi yorumu şunu emrediyor: *"Yeni bir yüzey fiyat basacaksa kendi
  kuralını YAZMAZ, bunu çağırır."* Hüküm **veriden** gelir (`hide_price`). Plan ise 3D için
  veriye hiç bakmayan, elle çevrilen **ikinci bir küresel sabit** koyuyor. Yarın bir kategori
  `hide_price=false` olduğunda fiyat açılır ama 3D bayrağı elle çevrilene kadar kapalı kalır —
  yani plan, kapatmayı vaat ettiği sınıfın **yeni bir örneğini üretiyor.**
* **Somut Kanıt:** [quoteMode.ts:28-33](../../src/lib/pricing/quoteMode.ts#L28-L33)
  (*"aynı hüküm İKİ YÜZEYDE ayrı ayrı yazılırsa, biri düzeltilince diğeri sessizce eski
  davranışta kalır"*) · [quoteMode.ts:38](../../src/lib/pricing/quoteMode.ts#L38).
* **Hangi Kural:** `vaat-butunlugu-standard.md` §4.5 + `quote-standard.md`.
* **Risk Derecesi:** **Orta** — savunulabilir bir tercih (3D bir *yetenek*, fiyat değil), ama
  plan bu tercihi **açıkça gerekçelendirmiyor**; §2.1'in üç gerekçesi arasında yok.

### 2.8. Envanter, bayrağın GÖREMEYECEĞİ metin-düzeyi 3D vaatlerini atlıyor

* **Bulgu:** Bir render bayrağı yalnız **bileşen** kapatır; sözlükte duran vaat metnini kapatmaz.
  Ölçülen, plan envanterinde bulunmayan 3D vaat metinleri:
  - [tr.ts:335](../../src/i18n/dictionaries/tr.ts#L335) `home.hero.subtitle` = *"**3D keşif**, kategori akışı ve teklif yönlendirmesi tek odakta birleşir."*
  - [tr.ts:341](../../src/i18n/dictionaries/tr.ts#L341) `home.hero.visualTitle` = *"**3D keşif** ile kategori kararını ilk ekranda başlatın."*
  - [tr.ts:132](../../src/i18n/dictionaries/tr.ts#L132) `common.view3D` = *"3D görüntüle"*
  - [tr.ts:1683-1723](../../src/i18n/dictionaries/tr.ts#L1683-L1723) `pdp.threeDAuthority.*` ad-alanı (`interactiveView`, `loadingModel`, `interactive3D` …)

  Ek ölçüm — bu iki ana sayfa anahtarının **kaynakta hiçbir tüketicisi yok**
  (`grep -rn "visualTitle" src` → yalnız `tr.ts`/`en.ts`), yani ana sayfa hero'su bugün
  o metni **basmıyor**; buna rağmen ölü-anahtar kapısı YEŞİL koşuyor (8/8, canlı ölçtüm).
  Yani bu vaatler *"kapı görmüyor + ekranda yok + sözlükte duruyor"* konumundadır: hero
  yeniden bağlandığı gün vaat geri gelir ve hiçbir kapı ötmez. Bu tam olarak
  `vaat-butunlugu-standard.md` §4.5'in *"kapının göremediği tek yön"* diye tarif ettiği sınıftır.
* **Hangi Kural:** `vaat-butunlugu-standard.md` §4.5 · `CLAUDE.md` #7.
* **Risk Derecesi:** **Orta**.

### 2.9. "Hızlı Sipariş = 1 kod + 2 anahtar" — DOĞRULANDI, ama kapı o yüzeyi taramıyor

* **Bulgu (planı destekleyen):** İddia ölçümle **doğrulandı**. Depo genelinde
  `quickOrder|Hızlı Sipariş|Quick Order|quick-order` üç isabet veriyor, başka geçiş yok:
  mobil menüde, footer'da, ana sayfada, `sitemap`'te ve analytics olay taksonomisinde **sıfır**.
* **Somut Kanıt:** [StickyHeader.tsx:268](../../src/components/StickyHeader.tsx#L268) ·
  [tr.ts:720](../../src/i18n/dictionaries/tr.ts#L720) · [en.ts:744](../../src/i18n/dictionaries/en.ts#L744).
* **Çürütme (kalıcılık ekseninde):** Ama `INV-VAAT-SIZINTI-1`'in taradığı vitrin ağacı
  `components/StickyHeader.tsx`'i ve `views/ProductsDiscoveryView.tsx`'i **içermiyor**
  ([vaat-sizintisi.test.ts:59-68](../../src/__tests__/conformance/vaat-sizintisi.test.ts#L59-L68)).
  Yani düğme bugün kaldırılır, yarın aynı yere "Hemen Sipariş Ver" yazılır ve kapı görmez.
  Plan §3 tablosunda `INV-6`'ya (ölü anahtar) yaslanıyor — o kapı anahtarı ölçer, **dili** değil.
* **Risk Derecesi:** **Orta** (kalıcı katman eksiği; tekil iş doğru).

### 2.10. §2.2'nin Suspense/SEO kaygısı — ÖLÇTÜM, TERSİ DOĞRU (planı düzelten bulgu)

* **Bulgu:** Şeridi kaldırmanın Suspense/bailout yapısını bozacağı ve SEO'ya zarar vereceği
  endişesi **yersiz**: `ProductsDiscoveryView` **zaten baştan sona `'use client'`**
  ([satır 1](../../src/views/ProductsDiscoveryView.tsx#L1)); oradaki `<Suspense>` yalnız
  `ssr:false` dinamik importun yarattığı CSR bailout'unu **karusele hapsetmek** için var.
  Karusel gidince bailout adası **tamamen kaybolur** → `/tr/products` SSR HTML'i **iyileşir**.
  Ancak iki test dosyası karuseli mock'luyor; import kalkınca bu mock'lar **bayat** kalır
  (kırmızı vermez — sessiz kapı körlüğü):
  [seo-h1-tekilligi.test.tsx:37](../../src/__tests__/conformance/seo-h1-tekilligi.test.tsx#L37) ·
  [ProductsDiscoveryView.test.tsx:23](../../src/views/__tests__/ProductsDiscoveryView.test.tsx#L23).
* **Risk Derecesi:** **Düşük** (temizlik kalemi) — ama plan §2.2'deki uyarı yanlış hedefte.

### 2.11. §4'ün knip/ölü-kod riski — ÖLÇTÜM, RİSK YOK (planı gevşeten bulgu)

* **Bulgu:** *"3D kodu ölü sayılıp knip tarafından silinmeye aday görünür"* riski ölçüldü ve
  **CI'da karşılığı yok**: `knip` ne bir workflow'da ne de `.husky/` kancasında koşuyor
  (`grep -rn "knip" .github/workflows/ .husky/` → 0 isabet); yalnız elle `pnpm knip`.
  Ayrıca beş 3D kapısının hepsi **kaynak-tarayıcı**dır (asset geçerliliği, tek-Canvas,
  CSP origin, recipe, prosedürel environment) — bayrakla kapatmak hiçbirini kırmaz;
  bileşen dosyaları yerinde kaldığı sürece hepsi aynı sonucu verir.
  Ek not: planın "39 dosyanın hiçbiri silinmiyor" cümlesi doğru, ama o kümede **zaten
  sıfır tüketicili** iki bileşen var — `InfiniteProductsShowcase.tsx` ve `BlueprintCanvas.tsx`
  (yalnız test yorumlarında anılıyorlar).
* **Risk Derecesi:** **Düşük** — plan bu satırı abartıyor; zararsız ama ölçüm gibi sunuluyor.

### 2.12. "Migration YOK" — DOĞRULANDI

* **Bulgu:** Doğru. Dal `origin/master@480352bd` üzerinde temiz; `supabase/migrations/` altında
  değişiklik yok, plan hiçbir şema değişikliği önermiyor. `CLAUDE.md` #13 (merge = prod'a
  otomatik uygulama) **tetiklenmiyor**. Bu iddiaya itirazım yok.
* **Risk Derecesi:** **Yok** (PASS).

### 2.13. "39 dosya" — planın kendi kanıt komutu bu sayıyı üretmiyor (A1)

* **Bulgu:** Plan §1, ölçümün yanına komutu da yazıyor:
  `grep -rln '…' src`. O komut bu depoda **72** döndürüyor; 39'a inmek için
  `--include='*.ts' --include='*.tsx'` gerekiyor (fark = 33 üretilmiş companion `.md`).
  Sayı yanlış değil, **kanıt komutu yanlış** — üçüncü bir kişi doğrulamaya kalkarsa 72 görür.
* **Hangi Kural:** A1 · [[kirpilmis-cikti-kanit-degildir]] sınıfı.
* **Risk Derecesi:** **Düşük** (ama kolay düzeltilir ve karnenin güvenilirliğini etkiler).

---

## 3. Stratejik Öneriler ve Aksiyon Planı

Hepsi **kalıcı katman** önerisidir (hand-patch değil):

1. **Kabul ölçütü 1'i değiştir** (2.1 · 2.2 için tek çözüm):
   *"Erişilebilirlik ağacı"* yerine ölçüt **`tests/smoke/ssr-html.spec.ts` ratchet'i** olsun:
   `/tr/products` → `maxBailouts: 1 → 0`, PDP → `2 → 1` (galeri kapanırsa `→ 0`).
   Bu ölçüt ayırt edicidir: bayrak açıkken sayı düşmez, kapalıyken düşer, ve **sayıdır**.
   Erişilebilirlik ağacı ölçümü yalnız **tek** yüzey için geçerlidir (galeri düğmesinin
   `aria-label`'ı) — ölçüt metnine bu sınır açıkça yazılsın.
2. **§5'e "bu ölçüt CI'da koşmuyor" satırı ekle** (2.3): SSR smoke `SMOKE_BASE_URL`
   olmadan atlanıyor. Ya PR'da elle koşulup çıktısı PR gövdesine yapıştırılsın, ya da
   `e2e-smoke.yml`'e vitrin rotası eklensin. Yazılmazsa "kabul ölçütü yeşil" ölçülemez.
3. **Envanteri yeniden say ve tabloya CANLILIK sütunu ekle** (2.4): "otorite bloğu"
   müşteri yüzeyinde erişilemez → ya envanterden çıkar ya da *"admin önizlemesi;
   bayrak kapsamı dışında"* diye işaretle. `/products` şeridinin **iki rota** beslediğini
   (`ProductsPage` + `CategoryMasterView`) §2.2'ye yaz — "kategori kartları" önerisi
   kategori rotasında mükerrer üretir.
4. **§2.2'nin "kanıtlı desen"ini adlandır ya da iddiayı düşür** (2.5): dosya adı yazılmalı.
   Bugün o görünümde kategori kartı deseni **yok**; `initialCategories` prop'u
   destructure bile edilmiyor. En dürüst yol: bu turda şeridi **yerine bir şey koymadan**
   kaldırmak (sarmalayıcı da koşullu — plan bunu zaten doğru söylüyor) ve kategori kartı
   kararını §2.4 gibi ayrı bir tasarım kararına bırakmak.
5. **Bayrak yazımını cetvele bağla** (2.6): planda tek cümleyle karara bağlansın —
   *"bayrak `process.env.NEXT_PUBLIC_UC_BOYUT === '1'` desenini izler
   ([checkout/page.tsx:21](../../src/app/[lang]/checkout/page.tsx#L21) ile aynı), `src/config/features.ts`'te
   tanımlanır ve `src/config/index.ts` barrel'ından export edilir."* `NEXT_PUBLIC_` öneki
   **zorunlu** (altı tüketicinin altısı da `'use client'` ağacında).
   Sabit tercih edilirse §4'teki *"geri açma: tek satır"* satırı *"tek satır + PR + deploy"*
   diye düzeltilmeli.
6. **§2.1'e 4. gerekçe ekle** (2.7): *"Niçin veri değil sabit"* — 3D bir yetenek vaadidir,
   `hide_price` gibi kategori-başına veri değildir; bu yüzden `quoteModeHesapla` çağrılmaz.
   Gerekçe yazılmazsa plan, kapatmayı vaat ettiği "iki yüzey habersiz" sınıfını yeniden üretir.
7. **§4.5 geri-dönüş tablosuna 4 satır daha** (2.8): `home.hero.subtitle`,
   `home.hero.visualTitle` ("3D keşif" metni), `common.view3D`, `pdp.threeDAuthority.*`.
   Bayrak bunları kapatmaz; kaldırılıyorsa tabloya, kalıyorsa "metin duruyor, yüzey kapalı"
   notuyla yazılmalı.
8. **`INV-VAAT-SIZINTI-1`'in vitrin ağacını genişlet** (2.9): `VITRIN_YOLLARI`'na
   `components/StickyHeader.tsx` ve `views/ProductsDiscoveryView.tsx` eklensin — aksi
   hâlde "Hızlı Sipariş" bugün gider, yarın aynı yere sipariş dili geri yazılır ve kapı görmez.
   Terim listesine yetenek-vaadi öbekleri ("hızlı sipariş", "hemen satın al", "etkileşimli 3D")
   girsin; planın kendi §1'de söz verdiği **cetvel §1.4** eki tam olarak budur.
9. **Bayat mock temizliği** (2.10): karusel importu kalkarsa
   `seo-h1-tekilligi.test.tsx:37` ve `ProductsDiscoveryView.test.tsx:23` mock'ları da
   silinsin (kırmızı vermezler → gözden kaçarlar).
10. **§4'teki knip satırını ölçüme çevir** (2.11): knip CI'da koşmuyor; satır
    *"knip elle koşuluyor; bayrakla kapalı ≠ ölü notu REC-119 turuna düşülür"* olsun.
11. **§1'deki kanıt komutunu düzelt** (2.13): `--include='*.ts' --include='*.tsx'` eklensin
    (aksi hâlde komut 72 döndürür, tablo 39 der).

---

## 4. Sonuç

### Genel risk: **KOŞULLU** — üç ön şart yerine gelmeden kod yazılmamalı

Plan yapısal olarak sağlam ve iki yerde **örnek** disiplin gösteriyor: §2.4'ün yapısal kararı
pakete gömmemesi ve §3'ün *"kapının göremeyeceği: bayrağın değeri"* itirafı. Migration
iddiası doğru, "Hızlı Sipariş tek kod noktası" iddiası doğru, knip korkusu ise gereksiz.

Ama **uygulamaya bu hâliyle geçilirse paket sahte-yeşil alır.** Bloklayıcı üç şart:

| # | Ön şart | Kaynak |
|---|---|---|
| **B1** | Kabul ölçütü 1, erişilebilirlik ağacından **SSR bailout ratchet'ine** çevrilir (`maxBailouts` 1→0 / 2→1) | §2.1 · §2.2 |
| **B2** | Giriş noktası envanteri yeniden sayılır: otorite bloğu **admin** diye işaretlenir, `/products` şeridinin **iki rota** beslediği yazılır | §2.4 |
| **B3** | Bayrağın **env-bağlı mı sabit mi** olduğu ve `NEXT_PUBLIC_` önekinin zorunluluğu planda karara bağlanır | §2.6 |

Kalan sekiz öneri (3.4–3.11) **KOŞULLU** kalemlerdir: PR'da karşılanmazsa merge ritüelinde
tek tek gerekçelendirilmelidir.

> **Denetçi notu (A2):** Bu rapor planı yazan bağlamdan ayrı, salt-okunur bir oturumda üretildi.
> Ölçemediğim tek iddia `hide_price=true` × 23 kategoridir (canlı DB okuması yapılmadı);
> o sayı [vaat-butunlugu-standard.md](../standards/vaat-butunlugu-standard.md) ve
> [vaat-sizintisi.test.ts:14](../../src/__tests__/conformance/vaat-sizintisi.test.ts#L14)
> üzerinden **alıntı** olarak kabul edildi, bağımsız doğrulanmadı.
