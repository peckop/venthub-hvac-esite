# VentHub Admin Tasarım & Etkileşim Cetveli

> **SSOT.** Admin panelin **görünüşü, hissi ve yerleşim mekaniği**. `admin-standard.md` "nasıl
> kurulur"u (yapı/davranış) anlatır; bu cetvel **"nasıl görünür ve nasıl davranır"ı** sabitler.
> **Kapsam:** `src/app/admin/**`, `src/views/admin/**`, `src/components/admin/**` + admin'in
> kullandığı paylaşılan kabuk parçaları.
> **Kardeş cetvel:** `storefront-design-standard.md` — kapsamı açıkça *"`src/` eksi admin"*, yani
> admin'i dışarıda bırakıyordu. Bu dosya o boşluğu kapatır.
> v1.0 · 2026-08-15 — kabuk/overlay denetimi + 3 paralel kaynak araştırması sonrası ilk sürüm.
> Zorlama planı: §6 (INV-ADMIN-* testleri + zoom kapısı + mobil viewport projesi).

---

## 0. Bu cetvel neye cevap veriyor

Üç somut şikâyet ölçüldü ve kod düzeyinde doğrulandı:

1. *"Sol menü doğru mekanizma ile çalışmıyor"* → §2.4, §2.5
2. *"Ana ekran scroll ile küçültülüp büyütüldüğünde doğru çalışmıyor"* → §2.1, §2.2, §2.3
3. *"Nerede açılır pencere, nerede genişleyen pencere, nerede popup olacak"* → §4

Bir dördüncüsü ölçüm sırasında çıktı: panelin görsel dili kurumsal panel normlarının dışında (§3).

---

## 1. Ölçülen drift (2026-08-15)

| # | Kusur | Kanıt | Çözen bölüm |
|---|---|---|---|
| D1 | **Üç kat iç içe tam-ekran kabuk** — `MainLayout` (`min-h-screen` + 48px bar) > `AdminLayout` (`h-screen` + `overflow-hidden`) > `CategoryBuilderView` (`h-screen`) | `MainLayout.tsx:61-73`, `AdminLayout.tsx:121`, `CategoryBuilderView.tsx:279` | §2.1 |
| D2 | Kalıcı **iki scrollbar**; belge hiç scroll etmiyor; footer hep katlanın altında | D1'in sonucu | §2.1 |
| D3 | Zoom'da içerik kırpılıyor, kaçış scroll'u yok | kök `overflow-hidden` | §2.3 |
| D4 | Sidebar kapanınca **280px ölü sütun** kalıyor; içerik genişlemiyor | `AdminLayout.tsx:153-156` — `lg:relative` + `w-280px` + `-translate-x-full` | §2.4 |
| D5 | Geçiş **animasyonlanmıyor** — `transition-colors` yazılmış, `transform`/`opacity` değişiyor | `AdminLayout.tsx:154` | §2.4 |
| D6 | Kapalı menü **hâlâ Tab'la geziliyor** (`inert` yok) | `AdminLayout.tsx:153-179` | §2.5 |
| D7 | Mobilde **backdrop / ESC / focus-trap / scroll-lock yok** | aynı | §2.5 |
| D8 | Menüde **rol filtresi yok** → yetkisiz link görünüp `AccessDenied` duvarına çarpıyor | `AdminLayout.tsx:92-118` | §2.4 |
| D9 | Aktif vurgu **tam eşitlik** → alt rotalarda menü ölü; `aria-current` yok | `AdminLayout.tsx:167` | §2.6 |
| D10 | 21 rotanın **7'si menüde yok**; breadcrumb yok | rota envanteri | §2.6 |
| D11 | **`<Toaster/>` admin'de mount edilmiyor → 127 `toast.*` çağrısı ölü** | `MainLayout.tsx:61` erken dönüş | §4.6 |
| D12 | **21 `window.confirm` + 7 `alert`**; `ConfirmDialog` bileşeni yok | envanter | §4.7 |
| D13 | **~26 bağımsız overlay implementasyonu**, ortak sarmalayıcı yok | envanter | §4 |
| D14 | 6 modalda ESC handler'ı odaklanamayan `<div>`'e bağlı → **hiç çalışmıyor** | envanter | §4.8 |
| D15 | Overlay katmanında **~%40 ham `z-*`**; tarih popover'ı `z-toast` (9999) ile modalların 99 kat üstünde | `DateRangePicker.tsx:139` vd. | §4.9 |
| D16 | **Her şey `font-black` + `uppercase` + `tracking-widest`** — hiyerarşi yok | `adminUi.ts:3,4,10,11,14,15,17-20,31` | §3.2 |
| D17 | Tablo satırı **~60px** (`px-6 py-5`) — kurumsal norm 32-48px | `adminUi.ts:10,11` | §3.1 |
| D18 | Her kartta **`shadow-[0_0_40px_rgba(0,0,0,0.3)]`** (Y-offset 0 = *glow*) | `adminUi.ts:6` | §3.3 |
| D19 | Köşe dili karışık: `rounded-hvac-*` token'ı ile ham `rounded-xl/2xl` yan yana | `adminUi.ts:7,14,17,23` | §3.5 |
| D20 | `w-3/10` **hiç var olmayan sınıf** → ikinci arka plan blob'u hiç çizilmiyor (ölü kod) | `AdminLayout.tsx:124` | §3.3 |

---

## 2. YERLEŞİM & SCROLL MEKANİĞİ (kabuk)

### 2.1 Scroll sahipliği — **belge scroll eder**

**Kural: kabuk kökü scroll konteyneri OLAMAZ.**

```
✅ DOĞRU                              ❌ YANLIŞ (mevcut)
<div class="min-h-svh">               <div class="h-screen overflow-hidden">
  <header class="sticky top-0">         <header class="h-16 flex-none">
  <div class="flex">                    <div class="flex-1 flex overflow-hidden">
    <aside>…</aside>                      <aside>…</aside>
    <main>{children}</main>               <main class="overflow-y-auto">…</main>
  </div>                                </div>
</div>                                </div>
```

**Gerekçe (Chromium root-scroller explainer):** belge kaydırıcısının yalnızca `documentElement`'e
verilen ayrıcalıkları var ve iç konteyner bunların **hiçbirini** alamaz:

| Yetenek | İç konteynerde |
|---|---|
| Mobil URL çubuğunun gizlenmesi | ✗ (kalıcı ~60-100px alan kaybı) |
| Overscroll glow / rubber-band | ✗ |
| Pull-to-refresh | ✗ |
| Space / PageDown ile sayfa atlama | ✗ (konteyner odaktaysa çalışır) |
| iOS Safari üst-bara dokunup başa dönme | ✗ |
| Döndürmede scroll çıpalama | ✗ |

Ek bedeller:
- **Scroll restoration ölür.** `history.scrollRestoration` **belge** scroll konumunu geri yükler; iç
  konteynerin `scrollTop`'unu değil. Elle `sessionStorage` + `useLayoutEffect` yazmak gerekir.
- **`scroll-behavior: smooth` sessizce çalışmaz.** MDN: kök elemanda tanımlanınca viewport'a uygulanır,
  `body`'den **viewport'a propagate etmez**. Her scroll kutusuna ayrı yazılmak zorunda.
- **`position: sticky` sahibi değişir.** Sticky öğe *"en yakın scroll mekanizmasına yapışır — o ata
  gerçekten kayan ata olmasa bile"*. `overflow-hidden` sarmalayıcı, sticky'yi **hiç kaymayan** bir
  kutuya yapıştırır → başlık hiç hareket etmez. ("Sticky çalışmıyor" hatalarının kökü budur.)
- **WCAG F69** `overflow: hidden`'ı kırpılmanın birebir sebebi olarak adlandırır.

**Sektör teyidi:** Polaris `Frame` (`.Main`'de hiç `overflow` bildirimi yok) ve Carbon UI Shell
(header/side-nav `fixed`, content `margin`) belge scroll'u kullanır. Atlassian'ın yeni
`navigation-system`'i tersini yapar — ama tam kabuk sistemi olarak inşa edip yukarıdaki telafileri
kendisi üstlenir.

**İstisna:** Bir bölge kendi içinde kayabilir (ör. sanal listeli ızgara), ancak:
- kabuk başına **en fazla 1** iç scroll konteyneri,
- **adlandırılmış** ve gerekçesi yorumla yazılmış,
- kendi `scroll-behavior`, `scroll-padding-top`, `overscroll-behavior: contain` ve scroll-restore
  kodunu getirir.

**Tam-ekran çalışma yüzeyleri** (ör. CategoryBuilder) kabuğun **içine** değil, kendi route-group'una
(`(fullscreen)`) alınır. Kabuk içinde ikinci bir tam-ekran kabuk kurmak yasak.

### 2.2 Viewport birimleri — **`svh`**

MDN: **`vh` ≡ `lvh`** — yani `100vh` "dinamik araç çubukları *gizliyken*ki yükseklik" demektir.
Sayfa yüklendiğinde araç çubukları açıktır → `100vh`'lik kutu **daima taşar**.

| Birim | Kullan |
|---|---|
| `svh` | **Kabuğun varsayılanı.** Araç çubuğu açıkken bile kırpmaz; sabit → reflow üretmez. |
| `dvh` | Yalnız tek elemanlı tam-ekran örtüşme (ör. mobil full-screen dialog), gerekçesi yorumda. |
| `lvh` / `vh` | **Kabukta yasak.** Yalnız kasıtlı olarak araç çubuğu altına uzanan dekoratif katman. |

**`dvh` tuzağı (MDN, birebir):** *"using viewport-percentage units based on the dynamic viewport size
can cause the content to resize while a user is scrolling a page. This can lead to degradation of the
user interface and cause a performance hit."* → Kabuk yüksekliğine `dvh` koymak, her scroll'da tüm
kabuğu yeniden düzenler. **"`100vh` yerine `100dvh` yaz" tavsiyesi eksiktir.**

Tailwind `min-h-screen` = `100vh` → **`min-h-svh` kullanılır.** (shadcn/ui Sidebar da `h-svh`/`min-h-svh`
kullanıyor; kaynak kodunda `vh` hiç geçmiyor.) Tarayıcı tabanı: Chrome 108+, Firefox 101+, Safari 15.4+.

### 2.3 Zoom dayanıklılığı — normatif eşikler

Dördü de **Level AA**, biri diğerini karşılamaz:

| SC | Gereksinim (birebir özet) |
|---|---|
| **1.4.10 Reflow** | 320 CSS px genişlikte (≡ **1280px viewport @ %400 zoom**) ve 256 CSS px yükseklikte **iki-yönlü scroll olmadan**, bilgi/işlev kaybı olmadan sunulabilmeli |
| **1.4.4 Resize Text** | Metin **%200**'e kadar büyütülebilmeli, içerik/işlev kaybı olmadan — **ara adımlarda da** |
| **2.4.11 Focus Not Obscured** | Klavye odağı alan bileşen, yazar içeriği tarafından **tamamen gizlenemez** |
| **1.4.12 Text Spacing** | `line-height ≥1.5×`, paragraf `≥2×`, `letter-spacing ≥0.12×`, `word-spacing ≥0.16×` uygulandığında kırpılma/örtüşme olmamalı |

1.4.10'un kritik alt-kuralı: istisna **bölüme** verilir, hücreye değil — *"each cell within a table
would still need to meet this success criterion."* "Admin tablom var, muafım" savunması tabloyu
kurtarır, hücre içeriğini kurtarmaz.

**Yasaklar (her biri adlandırılmış bir failure tekniğine bağlı):**

| # | Yasak | ID |
|---|---|---|
| 1 | Kökte `height:100vh` + `overflow:hidden` | F69 |
| 2 | Sabit px yükseklikli başlık/panel (`h-16`, `height:64px`) | F69 |
| 3 | `vw` tabanlı tipografi (`font-size: 1vw`) | F94 |
| 4 | Metin kapsayıcı boyutunu px ile vermek (`em`/`rem` yerine) | C28 ihlali |
| 5 | %400 zoom'da hâlâ fixed kalan üst bar + yan çubuk + alt aksiyon çubuğu (üçü birden) | C34 |
| 6 | Sticky öğenin klavye odağını örtmesi | **2.4.11 (AA)** |
| 7 | Dar viewport'ta öğeleri eşdeğer erişim vermeden `display:none` | F102 |
| 8 | Sabit satır yüksekliği + `line-height` override'a kapalı düzen | F104 |
| 9 | Filtre/arama input'larının metinle büyümemesi | F80 |
| 10 | Uzun SKU/URL string'lerinin taşması (kırma yok) | C33 ihlali |

**Deterministik zoom kapısı (§6'da otomatize edilir):**
1. 1280×1024 viewport → **%400 zoom** (≡ 320×256 CSS px) → hiçbir yerde **iki-yönlü scroll yok**,
   1280'de görünen her öğeye eşdeğer erişim var.
2. Ayrıca yalnız metin **%200** → hiçbir metin/kontrol clipped/truncated/obscured değil.
3. Ayrıca text-spacing (1.5 / 2 / 0.12 / 0.16) → kırpılma/örtüşme yok.

> **Dürüstlük notu:** 1.4.10 altında `overflow:hidden`'ı doğrudan adlandıran bir failure tekniği
> **yoktur**; `overflow:hidden` yalnız **F69** (1.4.4) altında geçer. 1.4.10'un tek failure'ı **F102**'dir
> ve CSS mekanizmasını adlandırmaz. "F102 = overflow-hidden failure" diye yazmayın.

> ⚠️ **ÖLÇÜM TUZAĞI — zoom kapısını yazacak kişi bunu bilmeli.**
> `html, body { overflow-x: hidden }` yürürlükteyken **`scrollingElement.scrollWidth` yatay taşmayı
> RAPORLAMAZ.** 2026-08-15'te ölçüldü: canlı sayfaya 3000px genişlikte bir öğe enjekte edildi,
> `scrollWidth` **hiç değişmedi** (310px → 310px). Yani kural yerindeyken naif bir
> `scrollWidth > innerWidth` kontrolü **her zaman yeşil yanar** ve kırpılan içeriği göremez.
>
> Doğru yöntem: ölçümden hemen önce `documentElement.style.overflowX = 'visible'` (ve `body` için de)
> uygulayıp yeniden düzen tetiklemek. Bu aynı zamanda *"kuralı kaldırırsam ne olur"* sorusunun
> birebir cevabıdır. Araç: `scripts/a11y/reflow-scan.mjs` — ve o araç, **bilerek taşma enjekte
> edilerek** görebildiği kanıtlandıktan sonra kullanıldı (310px → 3000px).
>
> Genel ders: **tek genişlikte ölçmek yetmez.** Admin'de bildirilen kırpılma 320px'te *görünmüyordu*
> (orada mobil dal devreye girip kurtarıyor); gerçek bant **~768–1100px** idi. Tarama en az
> {320, 768, 1024, 1280} genişliklerinde koşmalı.

### 2.4 Sidebar mekaniği — **gap + fixed deseni**

**D4'ün kökü:** `lg:relative` + genişlik akışta kalırken `-translate-x-full` uygulamak **görsel** bir
transformdur; layout kutusunu küçültmez. `visibility:hidden` de küçültmez (MDN: *"still affects layout
as normal"*). Kutuyu küçülten tek doğru desen:

```
SidebarProvider            display:flex; width:100%; min-height:100svh
│                          --sidebar-width: 16rem   --sidebar-width-icon: 3rem
├─ Sidebar kökü            width: auto        ← AÇIK GENİŞLİK VERİLMEZ
│  │                       data-state = expanded|collapsed
│  │                       data-collapsible = ""|offcanvas|icon
│  ├─ [gap]                position:relative              ← AKIŞTA, YER TUTAR
│  │                       width: var(--sidebar-width)
│  │                       transition: width 200ms linear
│  │                       [collapsible=offcanvas] → width: 0
│  │                       [collapsible=icon]      → width: var(--sidebar-width-icon)
│  └─ [panel]              position:fixed; inset-block:0; height:100svh
│                          ← AKIŞ DIŞI, GENİŞLİĞE KATKISI SIFIR
│                          transition: left,width 200ms linear   ← gap ile AYNI süre+easing
└─ <main>                  flex: 1 1 0%
```

**Değişmezler — biri bozulursa 280px ölü sütun geri gelir:**

1. Yer tutan kutu **akışta**, görünen panel **`fixed`**. İkisi de `fixed` olursa D4 tekrarlanır.
2. **Sidebar kökünün açık genişliği olmamalı** (`width:auto`). Köke `w-64`/`w-280px` yazmak, gap'in
   daralmasını anlamsız kılar — kutu sabit kalır. **En sık yapılan hata budur ve D4 tam olarak budur.**
3. Genişlikler **CSS custom property** (kural 8: `tokens.js`'ten türet, arbitrary değer değil).
4. `data-*` **köke** yazılır; alt parçalar `group-data-[…]` ile okur.
5. Gap ve panel **aynı `duration` + aynı `ease`** — yoksa panel içerikten kopar.
6. JS breakpoint ile CSS breakpoint **aynı sayı**. Ayrışırsa aradaki 1px'te ne panel ne drawer görünür.

> **`grid-template-columns: 0fr → 1fr` alternatifini kullanma.** MDN'in animation-type tanımı
> *"simple list of length, percentage, or calc"* diyor; `fr` bu listede yok → geçiş spesifikasyona
> göre garanti değil.

**Sayısal sözleşme** (kaynak yakınsaması; Carbon 256/48/48 · shadcn 256/48/288/768 · Polaris 240/56/768 ·
Atlassian 320/48 · M3 rail 80-96dp, drawer 360dp):

| Kalem | Değer |
|---|---|
| Üst bar yüksekliği | **56px** (48px de meşru; başka değer yok) |
| Açık sidebar | **16rem = 256px** |
| İkon rayı (rail) | **3rem = 48px** (salt ikon) |
| Mobil drawer | **18rem = 288px** (veya `min(90%, 320px)`) |
| Drawer'a geçiş eşiği | **768px** (JS ve CSS **aynı sayı** olmak zorunda) |
| Ray moduna geçiş (opsiyonel) | 1056–1200px |
| Geçiş süresi | **200ms linear**, gap ve panel için aynı |

**Üç durum zorunlu:** genişletilmiş (256px) · **ikon rayı (48px)** · gizli/drawer (<768px).
Mevcut panelde ray modu **yok** — ikili aç/kapa yetersiz.

**Kalıcılık: cookie, localStorage değil.** `sidebar_state`, `path=/`, 7 gün; RSC layout'ta
`cookies()` ile okunup `defaultOpen`'a geçirilir. Gerekçe: localStorage sunucuda okunamaz → SSR daima
yanlış varsayılanı render eder, ilk boyada menü zıplar.
**VentHub eki (kural 12):** cookie **tenant-scoped** olmalı — düz `path=/` çerezi multi-tenant'ta sızar.

> ⚠️ **shadcn/ui'ı kopyalıyorsan bunları düzelt:** `SidebarTrigger`'da `aria-expanded` ve
> `aria-controls` **yok**; `SidebarMenuButton` `data-active` yazıyor ama `aria-current="page"` yazmıyor.
> `axe` bunları **yakalamaz** (buton adı var, eksik olan *durum*). Ayrıca kısayol `event.key === "b"`
> küçük harf karşılaştırması → Caps Lock'ta çalışmaz ve input içinde de tetiklenir.
> Ek not: güncel shadcn dokümanından `Persisted State` bölümü kaldırılmış — kod cookie'yi hâlâ
> *yazıyor* ama okuma örneği dokümante değil. `cookies().get("sidebar_state")` okumasını **elle ekle**,
> yoksa kalıcılık sessizce çalışmaz.

**Menü içeriği:**
- Öğeler **tek registry'den** (§10.4 S1 — sidebar ve komut paleti aynı kaynağı tüketir).
- **RBAC-filtreli:** `canAccess` false ise öğe **listelenmez** (D8). Görünür link + AccessDenied duvarı
  kabul edilemez.
- Gruplar 6'yı geçerse accordion; geçmiyorsa düz başlık yeterli.
- **Her rota menüden erişilebilir olmalı** ya da bilinçli olarak "yalnız derin bağlantı" işaretlenmeli
  (D10: 7 rota kayıp).

### 2.5 Mobil drawer sözleşmesi

**Kapalıyken zorunlu:**
- Layout kutusu **0'a iner** (§2.4 gap deseni)
- **`inert`** — yalnız `translate` **yasak** (D6)

| Mekanizma | Layout kutusu | Odaklanabilir | A11y ağacı | Animasyon |
|---|---|---|---|---|
| `display:none` | kaldırılır | ✗ | dışında | **yok** |
| `visibility:hidden` | **kalır (ölü boşluk)** | ✗ | dışında | var |
| **`inert`** | kalır | ✗ | dışında | var |
| `-translate-x-full` (mevcut) | kalır | **✓ hâlâ tab'lanır** | **içinde** | var |

`inert` kapsamı (MDN): click ateşlenmez · odaklanamaz · **find-in-page bulamaz** · metin seçilemez ·
a11y ağacından çıkar. Flat-tree torunlarına cascade eder.

**Açıkken zorunlu (WAI-ARIA APG Dialog pattern):**
backdrop · focus trap (Tab döngüsü içeride kapanır) · **ESC ile kapanma** · odağın **tetikleyiciye
dönmesi** · body scroll lock · `role="dialog"` · **`aria-modal="true"`** · `aria-labelledby`/`aria-label` ·
tetikleyicide `aria-expanded` + `aria-controls`.

> ⚠️ **Radix Dialog kullanıyorsan iki tuzak (lokal `@radix-ui/react-dialog@1.1.15` dist'inden doğrulandı):**
> 1. Radix **`aria-modal` basmıyor** — `aria-modal` string'i dist'te hiç geçmiyor. Bunun yerine
>    `aria-hidden` paketinin `hideOthers()`'ını çağırıyor, yani arka plan ekran okuyucudan gizlenir ama
>    **DOM'da hâlâ tab'lanabilirdir**; klavye korumasını tamamen JS focus-trap sağlar. `aria-modal`'ı
>    **elle ekle**. (Native `inert` ikisini birden yapar ve JS gerektirmez.)
> 2. **Body scroll lock `<Dialog.Overlay>` içindedir.** "Backdrop istemiyorum" diye Overlay'i çıkaran
>    bir uyarlama scroll lock'u **sessizce kaybeder**. Overlay asla çıkarılmaz.

CSS tarafı: `overscroll-behavior: contain` (zincirlemeyi keser, bounce'ı korur). Tek başına yetmez —
iOS Safari'de backdrop üzerinde doğrudan kaydırma için `react-remove-scroll` benzeri katman gerekir.

### 2.6 Konum bildirimi: aktif durum, breadcrumb, skip-link

**`aria-current="page"`** (MDN): *"Only mark one element in a set of elements as current."*

Eşleme mantığı (D9'un düzeltmesi):
```
aktif ⟺ pathname === href  ||  pathname.startsWith(href + "/")
```
Kök yol (`/admin`) bu kurala **girmez** — tam eşitlik ister, aksi halde her sayfada eşleşir.
Bir ağaçta **yalnız en derin** eşleşen öğe `aria-current="page"` alır; ataları **görsel olarak**
vurgulanabilir ama `aria-current` **almaz** (MDN'in "only one" kuralı). Ayrım:
ata → `data-active-ancestor`, yaprak → `aria-current="page"`.

`role="tab"` kullanan bir nav'da doğru öznitelik `aria-selected`'dır, `aria-current` değil.

**Breadcrumb:** koşulu **hiyerarşi derinliğidir**, sayfa sayısı değil (APG: *"list of links to the
parent pages of the current page in hierarchical order"*). Sidebar zaten 1. seviyeyi gösterdiği için
breadcrumb **3+ seviyede** zorunlu (ör. `/admin/inventory/settings`), 2 seviyede sidebar + sayfa
başlığı yeterli. Yapı: `<nav aria-label>` + sıralı liste; son öğe `aria-current="page"`.

**Skip-link — atlanmış Level A maddesi.** Kalıcı sidebar, **SC 2.4.1 Bypass Blocks (Level A)**'nın
tarif ettiği "repeated block"tur. Kabuk, sayfa başında ana içeriğe atlama linki sunmak **zorundadır**
(teknik G1 + ARIA11). Polaris bunu `Frame`'in kendisine gömmüş (`skipToContentTarget`). Bu, cetvelde
**kabuğun sorumluluğudur**, sayfaların değil.

### 2.7 Sticky başlık

- `position: sticky` + **daima bir inset property** (`top-0`). MDN: her iki inset `auto` ise sticky
  **`relative` gibi davranır** — sessiz no-op.
- Başlık ile scroll konteyneri arasında **hiçbir `overflow` bildirimi olamaz** (§2.1'deki sahiplenme
  tuzağı).
- `html { scroll-padding-top: var(--header-h) }` — `#hash` çıpasının başlık altında kalmaması için.
  MDN: `scroll-padding` **scroll konteynerine** yazılır, hedefe değil.
- Dar/kısa viewport ve %400 zoom'da `position: static`'e dön (WCAG advisory teknik **C34**).
- Toplam sticky/fixed dikey yükseklik viewport'un **%25**'ini geçmemeli.
  *(Bu sayı W3C'den gelmiyor — bu cetvelin kendi ratchet'idir. W3C sayısal eşik vermiyor, yalnız
  "significantly reduce the available space for reading" diyor.)*

---

## 3. GÖRSEL KOMPOZİSYON

> **Yön kararı (2026-08-15, Recep):** nötr kurumsal panel dili — Linear / Stripe / Vercel hissi.
> Koyu cam + neon + glow estetiğinden çıkılıyor.

### 3.1 Yoğunluk (density)

Kurumsal panelin birinci işi **ekrana veri sığdırmaktır**. Carbon'un kaynak kodundan (v11):

| Kademe | Satır yüksekliği | Hücre dikey padding |
|---|---|---|
| Compact | **32px** | 6-7px |
| **Standart (varsayılan)** | **40px** | 6-7px |
| Rahat | **48px** | — |
| Uzun (2 satırlık içerik) | 64px | 16px |

- Hücre yatay padding **16px**.
- **Başlık satırı = gövde satırıyla aynı yükseklik** (Carbon: *"The column header row should always
  match the row size of the table."*)
- 64px yalnız *"if your data is expected to have 2 lines of content in a single row."*
- Yoğunluk kullanıcı tercihi olarak sunulabilir; varsayılan **standart (40px)**.

❌ Mevcut `px-6 py-5` (~60px) — en gevşek kademenin bile üstünde. **Yasak.**

### 3.2 Tipografi rolleri

| Rol | Boyut | Ağırlık | Satır yüksekliği |
|---|---|---|---|
| Sayfa başlığı (H1) | 24px | 600 | 32px |
| Bölüm başlığı (H2) | 20px | 600 | 28px |
| Kart başlığı (H3) | 16px | 600 | 24px |
| Tablo başlık hücresi | 14px | **600** | 20px |
| **Gövde / tablo hücresi** | **14px** | **400** | **20px** |
| İkincil / caption | 12px | 400 | 16px |
| Etiket (form) | 12–14px | 500 | 16–20px |

**Üç sert kural:**

1. **`font-black` (900) yasak.** İncelenen dört token setinin **hiçbirinde 700'ün üstü ağırlık
   tanımlı değil**: Radix max 700, Polaris max 700, Atlassian max Bold, Carbon "productive" ölçeğinde
   **max 600**. Hiyerarşi ağırlıkla değil **boyut + renk + boşlukla** kurulur.
2. **Gövde metni 400 (regular).** Dördü de böyle. `500/medium` paragraf için değil — Atlassian'ın
   kuralı: medium = *bileşen içi* metin ve *ikon yanındaki* metin (buton etiketi, tab, ikonlu satır).
3. **UPPERCASE bir tipografi rolü değil.** Dört sistemin token setinde `text-transform: uppercase`
   tanımlı **tek bir metin stili yok**. Material 3 all-caps butonu M1 kalıntısı olarak kaldırdı; her
   şey sentence case. İzin verilen tek kullanım: **11–12px "eyebrow" etiketi**, harf aralığı açılmış,
   sayfada **en fazla 1–2 yerde**. Buton, başlık, tablo hücresi, alt-başlıkta **yasak**.

❌ Mevcut `adminUi.ts`: başlık, alt-başlık, tablo başlığı, tablo hücresi, buton, etiket, satır-eylemi —
**hepsi** `font-black` + `uppercase` + `tracking-widest`. Tamamı değişecek.

### 3.3 Yüzey · kenarlık · gölge

**Kart gölgeyle değil KENARLIKLA ayrılır.**

- shadcn nötr paletinde light temada `--card` = `--background` (**aynı renk**); ayrım tamamen
  `--border` 1px hairline. Dark temada kart bir tık açılır + `oklch(1 0 0 / 10%)` kenarlık. **Gölge yok.**
- Atlassian: default surface *"Use with borders for flat cards."* Gölge yalnız iki yerde:
  `surface.raised` (taşınabilir/vurgulu kart) ve `surface.overlay` — ikincisi *"Reserved for a UI that
  sits over another UI, such as modals, dialogs, dropdown menus, floating toolbars."*
- Atlassian scroll gölgesi: *"A border is the default approach for scrolled content… Overflow shadows
  are reserved for experiences where a border might be easily missed."*

**Gölge yalnız şu üç durumda:** (a) DOM akışının üstünde duran katman — popover / dropdown / dialog /
floating toolbar, (b) sürüklenebilir kart, (c) kenarlığın kaybolacağı yerde scroll-overflow göstergesi.

**Her gölgenin Y-offset'i > 0 olmalı.** Polaris'in tam ölçeği referans:
```
shadow-100  0px  1px  0px  0px rgba(26,26,26,0.07)
shadow-200  0px  3px  1px -1px rgba(26,26,26,0.07)
shadow-300  0px  4px  6px -2px rgba(26,26,26,0.20)
shadow-400  0px  8px 16px -4px rgba(26,26,26,0.22)
shadow-500  0px 12px 20px -8px rgba(26,26,26,0.24)
shadow-600  0px 20px 20px -8px rgba(26,26,26,0.28)
```
Hepsi negatif `spread` ile daraltılmış, alfa 0.07–0.28.

❌ **`shadow-[0_0_40px_rgba(0,0,0,0.3)]` yasak.** Y-offset 0 + geniş blur = *glow*, ışık simülasyonu
değil; incelenen dört resmi token setinin hiçbirinde Y-offset'i 0 olan gölge yok. Aynı gerekçeyle
`StatCard`'daki 7× ve `OrdersTableBody`'deki 9× `shadow-[0_0_Npx_...]` de yasak.

❌ **Dekoratif arka plan blob'ları yasak** (`AdminLayout.tsx:122-125`). `blur-120` GPU maliyeti zoom'da
katlanır; ayrıca `w-3/10` diye bir sınıf **yok** — ikinci blob zaten hiç çizilmiyordu (D20).

**Yüzey merdiveni** rol tokenlarıyla kurulur (Radix gray 12-adım haritası referans):
| Adım | Rol |
|---|---|
| 1–2 | Sayfa ve kart arka planları |
| 3–5 | Etkileşimli bileşen arka planı (rest / hover / active) |
| 6–8 | Kenarlıklar ve ayraçlar |
| 9–10 | Solid renkler |
| 11–12 | Metin (11 = ikincil, 12 = birincil) |

### 3.4 Renk rolleri

- **Vurgu rengi yalnız:** birincil buton, link, odak halkası, aktif nav durumu. Yüzey, kart çerçevesi,
  başlık, tablo kenarlığı **vurgu rengi almaz**.
- **Atlassian'ın değiştirilebilirlik testi:** *"You should be able to exchange one accent color for
  another, and the experience would remain unchanged."* → Vurgu rengini başka bir renkle değiştirdiğinde
  **anlam değişiyorsa**, o renk yanlış yerde kullanılmış.
- **Semantik renkler yalnız kendi anlamında:** success = olumlu sonuç · warning = hata *oluşmadan
  önce* uyarı · danger = tehlike/ciddi hata · info = bilgilendirme veya devam eden işlem.
- Ham `slate-*`/`gray-*` **yasak** — tema `darkMode:'selector'` ile CSS değişkeni üzerinden döner,
  ham Tailwind grisi **dönmez** (storefront cetveli §2.2 ile aynı gerekçe).
- HEX yasağı zaten ESLint'te admin-only `error` — korunur.

### 3.5 Köşe yarıçapı

Kurumsal yakınsama: **input/buton/badge 4–8px · kart/panel 8–12px · modal/dialog 12–16px** ·
pill (`9999px`) yalnız badge ve avatar. **20px+ yarıçap hiçbir kurumsal sistemde standart bileşene
atanmamış.**

Mevcut `rounded-hvac-*` ölçeği (6 / 16 / 24 / 32px) storefront için tasarlanmış ve admin'e **fazla
yuvarlak**. Admin için ayrı kademe gerekir:

| Rol | Yeni token | Değer |
|---|---|---|
| Buton / input / chip / badge | `rounded-admin-sm` | 6px |
| Kart / panel | `rounded-admin-md` | 8px |
| Modal / dialog / geniş yüzey | `rounded-admin-lg` | 12px |

Kenarlık kalınlığı: **varsayılan 1px hairline**; 2px yalnız odak/seçili durum.

❌ Ham `rounded-xl/2xl/3xl` yasak (D19).

### 3.6 Boşluk ritmi

**4px atomik ölçek + 8px görsel ritim.** (Kaynak çelişkisi: Polaris/Tailwind/Radix 4px tabanlı,
Atlassian 8px tabanlı ama 2/4/6px alt adımlı, Carbon mini-unit 8px. Birleşim: ölçek 4'ün katı,
bileşenler-arası boşluk 8'in katı.)

Ölçek: `4, 8, 12, 16, 24, 32, 48, 64`.

| Kalem | Değer |
|---|---|
| Sayfa padding (yatay) | 16px (<1056px) → 24px (≥1584px) |
| Kart içi padding | 16px (compact) / 24px (standart) |
| Kartlar arası gap | 16px |
| Bölümler arası | 32px |
| Tablo hücresi | 16px yatay / 6-7px dikey |
| Buton grubu gap | 8px |

Aralık kuralı (Atlassian): 0–8px = kompakt UI içi · 12–24px = bileşen padding'i · 32–80px = sayfa/layout.

❌ Sayfa kökünde `space-y-4/6/8/10/12` karmaşası (5 farklı değer ölçüldü) — **tek değer: 24px (`space-y-6`)**.

### 3.7 İçerik genişliği

- Kabuk **tam genişlik**; içerik **≤1584px** ile sınırlı ve ortalanmış (Carbon 2x Grid maksimumu).
- **Tablo-ağırlıklı sayfa** → 1584px'e kadar tam genişlik. Tabloyu dar kolona sıkıştırmak yatay
  kaydırma üretir; hiçbir kurumsal sistem bunu önermiyor. (Polaris'in `fullWidth` kaçış kapısı.)
- **Form / ayar / metin ağırlıklı sayfa** → dar sütun **~640–720px (≈80ch)**.
  WCAG 1.4.8 (AAA): metin blokları *"no more than 80 characters or glyphs"*. Ayar formlarını tam
  genişliğe yaymak bu tavsiyeye aykırı.
- **Genişlik sınırı tek yerden gelir** — kabuk verir, sayfa tekrar daraltmaz.
  ❌ Mevcut: `max-w-page` (kabuk) + `max-w-page` (InventoryReport, çift) + `max-w-5xl` (InvSettings) +
  `max-w-4xl` (Users) = dört farklı kaynak.

### 3.8 Tema

- Her renk **`:root`'ta rol tokenı** olarak tanımlanır; `.dark` **yalnız token değerlerini** ezer.
  Hiçbir bileşen iki farklı sınıf yazmaz.
- `color-scheme` CSS property'si **bildirilmek zorunda** (form alanları, scrollbar, seçim renkleri
  tarayıcıya devredilir).
- İlk değeri `prefers-color-scheme` belirler; **kullanıcı toggle'ı kazanır** ve tercihi kalıcılaşır.
- Saf beyaz/siyahtan kaçın (web.dev: *"rgb(250, 250, 250) works better"*).
- Veri-yoğun panelde **opak yüzey** tercih edilir (Radix: `panelBackground="solid"` — *"provides an
  unobstructed background for panels, useful for presenting information clearly"*).
  ❌ Mevcut `glass`/`glass-strong` + `backdrop-blur-xl` her kartta — veri okunabilirliğine aykırı.

> ⚠️ **AÇIK KARAR — varsayılan tema.** Bu cetvelin geri kalanı tema-bağımsızdır, ama varsayılanın
> hangisi olacağı ürün kararıdır ve Recep'in onayını bekliyor. Referans olarak verilen iki ürün bu
> eksende ayrışıyor: **Linear koyu**, **Stripe/Vercel açık** varsayılan. Tokenlar rol-bazlı tanımlandığı
> için varsayılanı çevirmek tek satırlık iştir; bu karar §3'ün *uygulanmasını* bloklamaz.

### 3.9 Odak halkası

- **`:focus-visible`** kullanılır, `:focus` değil. `outline: none` **yasak**
  (MDN: *"removing focus styles makes keyboard navigation inaccessible for sighted users"*).
- `outline: 2px solid var(--ring)`; `outline-offset: 2px` (serbest kontroller), `-2px` (tablo hücresi
  gibi sınıra yapışan yerler — Carbon deseni).
- Kontrast: odak göstergesi zemine karşı **≥3:1** (SC 1.4.11, AA).
- Hedef seviye **SC 2.4.13 (AAA)**: en az 2 CSS px kalınlığında çevre **ve** odaklı/odaksız *aynı
  piksellerin* birbirine oranı ≥3:1. (Sık yapılan hata: komşu renge karşı ölçmek.)
- Sticky başlık varsa `scroll-padding-top` **zorunlu** — SC 2.4.11 **AA**, opsiyon değil.

---

## 4. ETKİLEŞİM YÜZEYİ (OVERLAY) TAKSONOMİSİ

> Bu bölüm *"nerede açılır pencere, nerede genişleyen pencere, nerede popup"* sorusunun cevabıdır.

### 4.1 Karar tablosu

| Durum | Yüzey | Kaynak |
|---|---|---|
| Yıkıcı/geri alınamaz eylem onayı | **AlertDialog** (`role="alertdialog"`) | Fluent · APG |
| Kolayca yeniden yaratılabilir kaydın silinmesi | **Onaysız + Geri Al** | Cloudscape |
| Zincirleme/ciddi sonuçlu silme | **Onay + kaynak adını yazdırma** | Cloudscape |
| **<5 girdili** form | **Modal** | **Carbon Forms** |
| **>5 girdili** form | **Non-modal yan panel** | **Carbon Forms** |
| 1–2 alanlı hızlı düzenleme | **Modal** | Gestalt |
| Kayıt **oluşturma** / geniş alan gerektiren form | **Ayrı rota** (veya route-focus-modal) | Polaris · Medusa |
| Çok adımlı akış | **Ayrı rota** | NN/g · Atlassian |
| **Paylaşılabilir URL gerekiyorsa** | **Ayrı rota — modal DEĞİL** | **Gestalt · Primer** |
| Hem link'lenebilir hem overlay | **Intercepting Route** (yumuşak gezinme=overlay, hard-nav=tam sayfa) | **Next.js** |
| Kullanıcı arkadaki içeriğe bakmalı | **Non-modal panel** | Carbon · Cloudscape |
| Tablo satırı seçince hızlı detay/karşılaştırma | **Split panel (non-modal)** | Cloudscape |
| Tam kayıt detayı | **Detay sayfası** — *"A split view should never replace details pages"* | Cloudscape |
| Sayfa içinde yerinde ek bilgi | **Inline expand / disclosure** | Polaris · APG |
| Küçük, ikincil, **odaklanabilir** içerik | **Popover** | Radix · Gestalt |
| Popover 4 kolondan geniş | **Modal** | Carbon |
| İkonun ne yaptığını söylemek | **Tooltip** | Material 3 |
| Kısa, eylem gerektirmeyen başarı bildirimi | **Toast** | Material 3 |
| **Hata / kritik / eylem gerektiren** | **Inline mesaj veya banner — toast DEĞİL** | 5 sistem birden |
| Form alanı hatası | **Alanın yanında inline hata** | NN/g · Polaris |
| Sistem kendiliğinden bildirim üretiyor (kullanıcı tetiklemedi) | **Toast — dialog DEĞİL** | Carbon |
| Tekrarlanan görev | **Ana sayfada yap, overlay açma** | Carbon |

### 4.2 Modal — kullanım ve tavan

**Kullan:** kritik uyarı/hata önleme · akışı sürdürmek için zorunlu bilgi · karmaşık akışı basit adıma
bölme · kullanıcının işini belirgin şekilde azaltan bilgi toplama.

**Kullanma:** mevcut akışla ilgisiz bilgi · yüksek-riskli süreçlerin ortası · modalda bulunmayan ek
kaynak gerektiren karmaşık karar.

**İçerik tavanı (beş sistem hemfikir):**
- Karmaşık form yok, büyük tablo yok, tam sayfa yeniden yaratma yok.
- **"Modal sayfanın alternatifi değildir"** (Carbon). Büyük modal yetmiyorsa → **sayfa**.
- En fazla **2 birincil aksiyon** (Material); Fluent 3'e izin veriyor.
- Modal içinde bilgi gizleyen bileşen (accordion/tab) **kullanma** (Carbon).
- Modal içi form hatası: **modal açık kalır**, hata alanın yanında işaretlenir (Carbon).

**Maliyet gerekçesi (cetvelde savunma olarak kullanılabilir):** *"They cause the users to create and
address an extra goal — to dismiss the dialog."* (NN/g)

### 4.3 "Genişleyen panel" — **non-modal olmak ZORUNDA**

Bu, araştırmanın en önemli düzeltmesi:

> **Yan panelin ayırt edici özelliği yandan gelmesi değil, MODAL OLUP OLMAMASIDIR.**
> Modal bir drawer, sadece şekli değişmiş bir modaldır — bağlam korunmaz.

Kanıt: Atlassian kendi Drawer'ı için *"The drawer component **is a modal dialog**"* ve *"the background
content isn't interactive or focusable, so **don't present people with a task in a drawer if they need
to reference the content** in the UI behind the drawer"* diyor; *"For most applications, use a modal
dialog instead."* Primer aynı: *"Side sheets are still considered as Dialogs."* Polaris ise Sheet'i
**anti-pattern gerekçesiyle** emekliye ayırdı: *"encourages designers to create a new layer on top of
the page instead of improving the existing user interface."*

**Kural:** "Bağlam korunsun" gerekçesiyle panel seçiyorsan panel **non-modal** olmak zorundadır —
arka içerik etkileşimli kalır, ana içerik daralır (Carbon non-modal dialog / Fluent inline drawer /
Material standard side sheet / Cloudscape split panel modeli).
Panel modal olacaksa, onu modal olarak adlandır ve §4.2'nin tavanlarına tabi tut.

Non-modal panel a11y sözleşmesi: `role="region"` + `aria-label`/`aria-labelledby`; açılışta odak
panele girer, kapanışta tetikleyiciye döner (Cloudscape).

Carbon'un kısıtı: non-modal *"for optional or non-critical tasks only. If a user's response or input
is required to progress the workflow, use a modal dialog."*

### 4.4 İç içe overlay

Kaynaklar çelişiyor (Carbon/Atlassian/Fluent/Gestalt: mutlak yasak · Primer: 2'ye kadar serbest ·
Material: full-screen üstüne serbest · APG'nin kendi örneği çok katmanlı · Medusa `StackedFocusModal`
gönderiyor). **VentHub kararı — ayrımı "yasak/serbest" değil, tür ekseninde kur:**

| Kombinasyon | Karar |
|---|---|
| Çalışma yüzeyi üstüne **onay yüzeyi** (AlertDialog) | ✅ İzinli (dört kaynakta meşru) |
| Çalışma yüzeyi üstüne **çalışma yüzeyi** | ❌ Yasak (altı kaynakta yasak) |
| Üç ve daha fazla katman | ❌ Yasak |

İzinli durumda a11y koşulları (Primer): ESC **yalnız üsttekini** kapatır · dışa tıklama **yalnız
üsttekini** kapatır · kapanışta odak alttaki tetikleyiciye döner.

Yan yüzeylerde iç içe geçme **her kaynakta yasak**: popover içinde popover, disclosure içinde
disclosure, aynı anda birden çok overlay drawer.

### 4.5 Popover · Tooltip · HoverCard

Radix'in kendi sınıflandırması (frontmatter'dan):

| Primitive | APG pattern | Not |
|---|---|---|
| Dialog | dialog-modal | `modal` varsayılan **true** |
| AlertDialog | alertdialog | **`modal` prop'u YOK** — hep modal; dışa tıklama yapısal olarak kapalı |
| **Popover** | **dialog-modal** (Dialog ile aynı) | `modal` varsayılan **false**; odak yönetilir |
| Tooltip | tooltip | odak yönetmez |
| **HoverCard** | **yok** | *"Ignored by screen readers"* · *"intended for sighted users only"* |

**Tooltip'e ASLA konmaz** (dört otorite aynı):
- **Etkileşimli öğe** (link/buton) — APG: *"Tooltip widgets do not receive focus. A hover that contains
  focusable elements can be made using a non-modal dialog."* Carbon'un çözümü: **toggletip**.
- **Kritik / görevi tamamlamak için gerekli bilgi** — Material: *"Don't hide critical information
  within tooltips as it's easy to miss. Use an interruptive dialog instead."*
- **Görsel/ikon.**
- **Devre dışı öğe üstünde** — devre dışı öğe etkileşimli değildir.

**WCAG 1.4.13 (AA)** hover/focus ile çıkan tüm içeriğe bağlayıcı üç şart: **Dismissible** (imleci veya
odağı hareket ettirmeden kapatılabilir) · **Hoverable** (imleç içeriğin üstüne gidebilmeli, kaybolmamalı) ·
**Persistent** (tetikleyici kalkana veya kullanıcı kapatana kadar görünür kalır).

**HoverCard kritik yol üstünde kullanılamaz** — a11y ağacının dışındadır.

> ⚠️ **Radix doküman hatası:** `alert-dialog.mdx`, `onOpenAutoFocus`'u *"focus moves to the destructive
> action"* diye tarif ediyor; **kod `cancelRef.current?.focus()` çağırıyor.** Varsayılan **Cancel**'dır
> ve APG'nin *"set focus on the least destructive action"* tavsiyesiyle uyumlu olan budur. Dokümana
> değil koda güven.

### 4.6 Bildirim: toast vs inline

**Toast'a asla konmaz: hata, kritik uyarı, eylem gerektiren mesaj.** Beş sistem + APG hemfikir:

| Kaynak | İfade |
|---|---|
| Polaris | *"Avoid using toast for critical information that merchants need to act on immediately."* |
| Atlassian | *"Never use auto dismiss flags for any critical warning or error messages."* |
| Carbon | *"Don't use notifications that dismiss on a timer for critical or emergency messages."* |
| Fluent | *"Don't use toasts for necessary actions."* |
| Material 3 | *"auto-dismissing snackbars are inaccessible for people with low vision."* |
| APG (Alert) | *"avoid designing alerts that disappear automatically"* (WCAG 2.2.3 atfıyla) |

**Yüzey seçimi:**

| Tür | Ne zaman | Süre |
|---|---|---|
| Inline | Kesintisiz geri bildirim / durum | Çözülene veya kapatılana kadar |
| Toast | Kısa, zaman-bağlı, eylemsiz | Aksiyonsuz otomatik kapanır; **aksiyonlu ASLA otomatik kapanmaz** |
| Banner | Sistem/ürün seviyesi, göreve özgü değil | Kapatılana kadar |
| Callout | Sayfa içeriğinde bağlamsal vurgu | Kalıcı, kapatılamaz |
| Modal | Kritik, dikkat/eylem şart | Kapatılana kadar bloklar |

Süre: **5000ms** varsayılan; **aksiyonlu toast ≥10 000ms veya hiç kapanmaz** (Polaris). Aynı anda
en fazla 1 toast görünür (Material) — istisna gerekçelendirilir.

Uzun/karmaşık formda: üstte özet **banner** + submit'te odağı banner'a taşı + **her alanda inline hata**.

> **D11 bu bölümün ihlalidir:** admin'de `<Toaster/>` mount edilmiyor, 127 çağrı ölü; hatalar `alert()`
> ile veriliyor. §6'da bunu yakalayan kapı tanımlı.

### 4.7 Onay ve geri alma

NN/g'nin gerçek konumu — **"undo > confirm" değil, "ikisi de"**:

> *"Use a confirmation dialog before committing to actions with serious consequences… **Though as
> mentioned, do try your best to offer undo**"* · *"**Do not use confirmation dialogs for routine
> actions.** … if you cry wolf too many times, people will stop paying attention"*

**Kurallar:**
- Onay **yalnız** ciddi/geri alınamaz sonuç için; rutin işlemde **yasak**.
- Buton etiketleri **sonucu özetler**: "Ürünü sil" / "Vazgeç" — **"Evet/Hayır" yasak**.
- **Varsayılan odak yıkıcı olmayan seçenekte** (APG: *"set focus on the least destructive action"*).
- Özellikle tehlikeli işlemde **standart-dışı doğrulama** (kaynak adını yazdırma).
- Geri alma **her hâlükârda** sunulur. Toast içinde sunuluyorsa görünürlük yetersiz kalabilir —
  kritik geri almalar kalıcı yüzeyde de bulunmalı.

**Risk kademeleri (Cloudscape):**

| Risk | Yüzey |
|---|---|
| Kolayca yeniden yaratılabilir, çalışan sisteme etkisiz | Tek tık, onay yok (+ Geri Al) |
| Hızlıca yeniden yaratılamaz | Basit onay |
| Ciddi / geri alınamaz / zincirleme | Onay + kaynak adını yazdırma |

> **D12 bu bölümün ihlalidir:** 21 `window.confirm` + 7 `alert`. Native kutu stilsizdir, i18n'i
> taşımaz, mobilde "bu site tekrar sormasın" ile **kalıcı olarak susturulabilir** → `confirm` `false`
> döner, silme sessizce iptal olur, kullanıcı hiçbir şey görmez. **Yasak.**

### 4.8 A11y sözleşmesi (WAI-ARIA APG — Dialog/Modal)

Her modal yüzey **istisnasız** şunları sağlar:

| # | Gereklilik |
|---|---|
| 1 | Dış içerik **inert** — dışarıyla hiçbir şekilde etkileşilemez |
| 2 | **Focus trap:** Tab son öğeden ilkine, Shift+Tab ilkinden sonuncuya döner |
| 3 | **ESC kapatır** |
| 4 | Açılışta odak **dialog içindeki bir öğeye** taşınır |
| 5 | Kapanışta odak **tetikleyiciye döner** (tetikleyici yoksa mantıklı bir öğeye) |
| 6 | `role="dialog"` (onay yüzeyinde `role="alertdialog"`) |
| 7 | **`aria-modal="true"`** |
| 8 | `aria-labelledby` (görünür başlığa) **veya** `aria-label` |
| 9 | Tab sırasında **görünür bir kapatma butonu** (APG: "strongly recommended") |
| 10 | Body scroll lock |
| 11 | `alertdialog` ise `aria-describedby` **zorunlu** (dialog'da opsiyonel) |

**Açılışta odak nereye (APG'nin dört senaryosu):** genelde ilk odaklanabilir öğe · içerik semantik yapı
(liste/tablo/çok paragraf) içeriyorsa başa `tabindex="-1"` statik öğe koy ve ona odaklan (ve
`aria-describedby`'ı **koyma**) · içerik uzunsa başlığa odaklan · **geri alınamaz son adımda en az
yıkıcı aksiyona** odaklan.

**`aria-modal` tuzağı (APG):** modal olarak işaretlemek, gerçekten modal davranmıyorsa
*"severe negative ramifications"* üretir. Yalnız **hem** kod dışarıyla etkileşimi tamamen engelliyorsa
**hem de** görsel olarak dışarısı örtülüyorsa `aria-modal` yazılır.

**Non-modal ile fark (APG):** ikisi de tab sırasını içeride tutar; tek fark **non-modal'da kullanıcı
dialog'u kapatmadan odağı dışarı çıkarabilir.**

> **D14 bu bölümün ihlalidir:** 6 modalda ESC handler'ı `role="presentation"` backdrop `<div>`'ine
> bağlı; odaklanamayan eleman `keydown` almaz → **ESC hiç çalışmıyor.** Handler document seviyesine
> taşınır veya Radix'in kendi mekanizması kullanılır.

### 4.9 Katman (z-index) ölçeği

**Tek merkezi ölçek; tek tek değiştirilmez.** (Bootstrap: *"We don't encourage customization of these
individual values; should you change one, you likely need to change them all."*)

Mevcut `tokens.js` ölçeği korunur ve iki katman eklenir:

| Katman | Token | Değer |
|---|---|---|
| Yükseltilmiş içerik | `z-raised` | 10 |
| Sticky başlık / toolbar | `z-sticky` | 90 |
| Backdrop | `z-backdrop` *(yeni)* | 95 |
| Modal / drawer / dialog | `z-modal` | 100 |
| **Menü / popover / dropdown / tooltip** | `z-popover` *(yeni)* | 110 |
| Toast | `z-toast` | 9999 |

**İki karar ve gerekçeleri:**

1. **Menü/popover katmanı modal'ın ÜSTÜNDE.** Kaynaklar bölünmüş (Carbon: dropdown 9100 > modal 9000 ·
   Bootstrap/Atlassian: altında). VentHub Carbon'u izler, çünkü stack'imizde Radix menü/popover içeriği
   **`body`'ye portal ediliyor** — mevcut `z-dropdown: 50 < z-modal: 100` ile bir modal içindeki
   dropdown **modalın arkasında** render olur. Carbon'un kod yorumundaki gerekçe birebir geçerli:
   *"Dropdowns that render outside of a Modal should render above a Modal."*
   Bu, mevcut `z-dropdown` (50) token'ının **latent bug** olduğu anlamına gelir.
2. **Toast en üstte.** Bootstrap (1090 > 1055), Atlassian (*"When a modal is active, flags should
   always be visible above the modal"*), MUI (1400 > 1300) hemfikir. Mevcut 9999 zaten doğru.

❌ **Ham `z-30/z-40/z-50` overlay katmanında yasak.** ❌ `z-[9999]` gibi arbitrary değer yasak.
❌ Bir popover'a `z-toast` vermek yasak (D15: `DateRangePicker.tsx:139`).

### 4.10 Dar ekran

- **<600px:** dialog **full-screen** olabilir (Material: *"Full-screen dialogs are for compact
  breakpoints only"*). Girdi alanı içeren dialog'lar dar viewport'ta **full-screen olmalı** (Primer).
- **≥600px:** ortalanmış dialog **zorunlu** — full-screen kullanma.
- Dialog genişliği: min 280px, maks 560px; ekranı doldurmaz. Masaüstünde viewport'a **16px** güvenli
  alan.
- **≥840px:** alt sayfa (bottom sheet) yerine yan panel kullanılabilir.
- Modal bottom sheet **yalnız mobilde**; başlangıç yüksekliği ekranın **%50**'siyle sınırlı.
- Menüler dar ekranda alt sayfaya dönüşebilir — ama **işlevsel eşdeğer olmayan** bileşenler
  takas edilmez (*"Don't arbitrarily swap components that aren't functionally equivalent"*).

---

## 5. CETVEL (ölçüm aracı)

Skor = ✓ / 40. Kabuk maddeleri **kabuk başına bir kez**, sayfa maddeleri **sayfa başına** ölçülür.

**Kabuk — yerleşim & scroll (12)**
- [ ] Kök scroll konteyneri **değil**; belge scroll ediyor
- [ ] Kabuk başına en fazla 1 iç scroll konteyneri, adlandırılmış
- [ ] `vh`/`100vh` yok; `svh` kullanılıyor
- [ ] `overflow:hidden` kabuk zincirinde yok
- [ ] %400 zoom (320×256) → iki-yönlü scroll yok
- [ ] %200 metin büyütme → kırpılma yok
- [ ] Sidebar collapse **layout'u gerçekten daraltıyor** (gap+fixed deseni)
- [ ] Üç durum var: genişletilmiş / ikon rayı / drawer
- [ ] Geçiş süresi ve easing gap ve panelde aynı
- [ ] Sidebar durumu **cookie** ile kalıcı (tenant-scoped)
- [ ] Sticky başlıkta inset property var; `scroll-padding-top` tanımlı
- [ ] **Skip-link** var (SC 2.4.1, Level A)

**Kabuk — navigasyon & a11y (6)**
- [ ] Menü **RBAC-filtreli** (yetkisiz link listelenmiyor)
- [ ] Aktif eşleme alt rotaları kapsıyor; **yalnız en derin** öğede `aria-current="page"`
- [ ] Kapalı drawer **`inert`** (yalnız translate değil)
- [ ] Açık drawer: backdrop + focus trap + ESC + odak dönüşü + scroll lock
- [ ] Tetikleyicide `aria-expanded` + `aria-controls`
- [ ] Her rota menüden erişilebilir veya bilinçli olarak "derin bağlantı" işaretli

**Görsel kompozisyon (11)**
- [ ] Tablo satırı ≤48px (varsayılan 40px); başlık = gövde yüksekliği
- [ ] `font-black`/900 **yok**
- [ ] Gövde ve tablo hücresi ağırlığı 400
- [ ] UPPERCASE yalnız eyebrow etiketinde (sayfada ≤2)
- [ ] Kart kenarlıkla ayrılıyor; düz kartta gölge yok
- [ ] Y-offset'i 0 olan gölge (glow) yok
- [ ] Dekoratif blur-blob yok
- [ ] Ham `slate-*`/`gray-*` ve HEX yok
- [ ] Radius admin ölçeğinden (6/8/12px); ham `rounded-xl/2xl/3xl` yok
- [ ] Genişlik sınırı tek kaynaktan (kabuk verir, sayfa daraltmaz)
- [ ] `:focus-visible` halkası ≥2px, ≥3:1; `outline:none` yok

**Overlay (11)**
- [ ] Tüm modal yüzeyler **tek paylaşılan bileşenden** türüyor
- [ ] `window.confirm` / `alert` / `prompt` **yok**
- [ ] Yıkıcı işlemde `role="alertdialog"` + `aria-describedby` + en az yıkıcı seçenekte odak
- [ ] Onay butonları sonucu özetliyor ("Evet/Hayır" değil)
- [ ] Rutin işlemde onay yok
- [ ] >5 girdili form modalda değil
- [ ] Paylaşılabilir URL gereken içerik modalda değil (rota veya intercepting route)
- [ ] "Bağlam korunsun" gerekçeli panel **non-modal**
- [ ] Çalışma yüzeyi üstüne çalışma yüzeyi yığılmıyor
- [ ] Hata/kritik mesaj toast'ta değil; aksiyonlu toast otomatik kapanmıyor
- [ ] z katmanı token'dan; menü/popover modalın üstünde

---

## 6. ZORLAMA KATMANLARI

> Bu projenin kuralı: **kontrol = cetvel + onu zorlayan test.** Cetvelin elle puanlanan kısmı
> "ölçülür ama kilitlenmez" — skor düşerse hiçbir kapı kırmızı yanmaz. Aşağıdakiler kilitleyen ayaktır.

| Kapı | Ne zorlar | Tür |
|---|---|---|
| **INV-ADMIN-SHELL-1** | Admin kabuk zincirinde `h-screen`/`100vh`/`min-h-screen` ve `overflow-hidden` yasağı; kabuk başına ≤1 scroll konteyneri; iç içe tam-ekran kabuk yasağı | statik tarama |
| **INV-ADMIN-SHELL-2** | Sidebar kökünde açık genişlik sınıfı yasağı; gap+fixed deseni; `aria-current`/`aria-expanded`/`aria-controls`/`inert` varlığı; skip-link varlığı | statik + render testi |
| **INV-ADMIN-OVERLAY-1** | `window.confirm`/`alert`/`prompt` **0**; `<Toaster/>`'ın admin ağacında mount edildiğinin ispatı | statik + render testi |
| **INV-ADMIN-OVERLAY-2** | Paylaşılan `Modal`/`ConfirmDialog` dışında `fixed inset-0` overlay yasağı; her dialog'da `role` + `aria-modal` + isim bağı; ESC handler'ının odaklanamayan elemana bağlanma yasağı | statik tarama |
| **INV-ADMIN-OVERLAY-3** | Overlay katmanında ham `z-30/40/50` ve arbitrary `z-[…]` yasağı; token kullanımı | statik tarama |
| **INV-ADMIN-DESIGN-1** (ratchet) | `font-black`, `uppercase`, `shadow-[…]`, ham `rounded-xl/2xl/3xl`, ham `slate-*`/`gray-*` sayaçları — **yeni kod artıramaz**, dalgalar düşürür | ratchet (INV-5/INV-9 deseni) |
| **ESLint kaçağı kapatma** | `tailwindcss/no-arbitrary-value` şu an **yalnız literal `className`'i** görüyor; admin'de 38 arbitrary değer sabit/obje içinde kaçıyor (ölçüldü: o dosyalarda eslint 0 hata veriyor). `settings.tailwindcss.callees` + sabit tarama eklenir | lint |
| **Zoom kapısı** | Playwright: 1280×1024 @ %400 → iki-yönlü scroll yok; %200 metin → kırpılma yok | e2e |
| **Mobil viewport projesi** | Playwright şu an **tek proje** (`Desktop Chrome`) — mobil viewport eklenir; drawer sözleşmesi (backdrop/ESC/focus/inert) test edilir | e2e |
| **axe kapsamı** | 10 sayfada axe-0 var; **12 admin dosyasında hiç test yok — `AdminLayout` dahil**. Kabuk ve kalan sayfalar kapsama alınır | test |

**Kapı ekleme kuralı:** her yeni kapı **bilerek bozularak** FAIL görülür; geçmesi çalıştığını
kanıtlamaz. Muafiyet varsa **adla** yazılır, sessiz geçilmez.

---

## 7. RATCHET BASELINE (2026-08-15, admin kapsamı)

INV-ADMIN-DESIGN-1 için başlangıç tavanları — hedef hepsinde **0**:

| Sayaç | Baseline | Not |
|---|---|---|
| `window.confirm` / `confirm(` | **21** (admin 18 + public 3) | hedef 0 |
| `alert(` | **7** | hedef 0 |
| Bağımsız overlay implementasyonu | **~26** (admin 12 + public 14) | hedef: tek kit |
| Mükerrer bulk-bar | **3** | hedef 1 |
| Ham `z-30/40/50` (overlay-kritik) | **~30** | hedef 0 |
| Arbitrary `shadow-[…]` | **≥18** (adminUi 1 + StatCard 7 + OrdersTableBody 9 + AdminToolbar 1) | hedef 0 |
| Arbitrary boyut (`min-w-[1000px]`, `max-w-[120px]`, `min-h-[60px]`, `text-[0.8rem]`) | **4** | token karşılığı **zaten mevcut** |
| Ölü overlay kodu | **~1000 satır** (`InventoryDetailDrawer` + 4 alt bileşen + `InventoryCsvImport` + `InfoTooltip`) | sil veya bağla |
| Testi olmayan admin dosyası | **12** (`AdminLayout` dahil) | hedef 0 |

> Sayaçların kesin regex/glob tanımı INV testlerinin kendisinde yaşar (test = SSOT'un ikinci yarısı);
> buradaki sayılar ilk ölçümün kaydıdır, test yazılırken yeniden ölçülüp sabitlenir.
> Statik tarama tuzakları → `conformance-test-static-scan-gotchas` (import.meta.glob, tam-literal kök
> glob, stale-guard).

---

## 8. PROVENANCE

D = resmi/normatif doküman veya kaynak kod · GP = genel iyi pratik (tek otorite spec'lemiyor)

| Kaynak | Ne kanıtladı | Tür |
|---|---|---|
| **WCAG 2.2** SC 1.4.4 / 1.4.10 / 1.4.11 / 1.4.12 / 1.4.13 / 2.4.1 / 2.4.13 | Zoom, reflow (320×256 ≡ 1280@%400), odak örtülmemesi, metin aralığı, hover içeriği, bypass blocks, odak görünümü — **normatif** | **D** |
| WCAG Teknikleri **F69 / F80 / F94 / F102 / F104 / C28 / C33 / C34 / G1 / ARIA11** | `overflow:hidden` = kırpılma sebebi (örnek kodu mevcut kabuğa birebir benziyor); vw-tipografi ihlali; sticky→static reçetesi; skip-link | **D** |
| **WAI-ARIA APG** — Dialog (Modal), Alert Dialog, Alert, Disclosure, Breadcrumb, Tooltip | Tam modal a11y sözleşmesi; açılış/kapanış odak senaryoları; `aria-modal`'ın iki koşulu; tooltip'in odak almaması; breadcrumb tanımı | **D** |
| **MDN** — `length` (viewport birimleri), `position`, `scroll-behavior`, `scroll-padding`, `overscroll-behavior`, `inert`, `visibility`, `aria-current`, `:focus-visible`, `History.scrollRestoration`, `grid-template-columns` | `vh ≡ lvh`; `dvh` performans uyarısı; sticky'nin overflow-ataya yapışması; `body`'den propagate etmeme; `inert` vs `visibility:hidden` farkı; "only one `aria-current`"; `fr` animasyon garantisizliği | **D** |
| **Chromium root-scroller explainer** (bokand) | Belge kaydırıcısının 6 ayrıcalığı; app-shell probleminin birebir tanımı | **D** |
| **web.dev** — viewport-units, prefers-color-scheme | `100vh` taşma problemi; tema deseni; saf beyazdan kaçınma | **D** |
| **IBM Carbon** — data-table SCSS (v11), Forms pattern, Dialog pattern, Modal, Popover, Tooltip, Notification, 2x Grid, color usage, `_z-index.scss`, `_focus-outline.scss`, UI Shell SCSS | Satır yükseklikleri 32/40/48/64px; **<5/>5 girdi eşiği**; "modal sayfanın alternatifi değil"; iç içe modal yasağı; dropdown'ın modal üstünde olma gerekçesi; odak halkası; katman merdiveni; 1584px grid maksimumu; shell 48/256/48px | **D** |
| **Shopify Polaris** — `polaris-tokens` (text/font/space/size/border/shadow/zIndex), `Frame.module.css`, `Page.module.css`, Modal/Sheet/Toast/Banner/Tooltip | Tam tipografi ve boşluk ölçeği; **gölge ölçeğinde Y-offset hiç 0 değil**; Sheet'in anti-pattern gerekçesiyle emekliliği; toast ≥10 000ms; `Frame`'de belge scroll'u + skip-link | **D** (bileşenler DEPRECATED) |
| **Atlassian Design System** — typography, spacing, elevation, color, Modal, Drawer, Popup, Tooltip, Flag; `@atlaskit/navigation-system` dist | Ağırlık kullanım kuralı (regular/medium/bold); "border is the default approach"; **"drawer is a modal dialog"**; iç içe dialog yasağı; tooltip yasakları; katman tablosu; 320/48px | **D** |
| **Material Design 3** (+ androidx token dosyaları, MDC, Flutter) | 600/840/1200/1600dp eşikleri; **600dp full-screen dialog eşiği**; dialog 280–560dp, max 2 aksiyon; nav rail 80/96dp, drawer 360dp; sentence case; elevation modeli | **D** (spec sayfaları SPA; token dosyaları resmî makine-üretimi) |
| **shadcn/ui** — `sidebar.tsx`, `use-mobile.ts`, `sheet.tsx`, manual installation | Nötr OKLCH palet (chroma 0); kart = background aynı renk; **gap+fixed collapse mekanizması**; cookie kalıcılık + SSR gerekçesi; 256/288/48px, 768px, 200ms; `svh` kullanımı; **`aria-expanded`/`aria-current` eksikleri** | **D** |
| **Radix** — Themes tokens; Primitives MDX; **lokal `@radix-ui/react-dialog@1.1.15` + `aria-hidden@1.2.4` dist** | Tip/boşluk/radius ölçekleri, gray 12-adım rol haritası; Popover'ın dialog pattern'i, HoverCard'ın a11y ağacı dışılığı; **`aria-modal` basmıyor**, `hideOthers` (inert değil), **scroll lock Overlay'de**; AlertDialog focus = Cancel (doküman yanlış) | **D** |
| **GitHub Primer** — Dialog guidelines + accessibility | **Deep-link → sayfa** kuralı; 2 iç içe dialog koşullu izin; dar viewport'ta input'lu dialog full-screen; side sheet = dialog | **D** |
| **Microsoft Fluent 2** — Dialog, Drawer, Popover, Tooltip, Toast | AlertDialog kullanım cümlesi; inline vs overlay drawer; "Don't nest dialogs"; drawer 2–3 adım; toast 7s | **D** |
| **AWS Cloudscape** — Delete pattern, Split view, Drawer | **Üç kademeli yıkıcı-onay modeli**; split panel non-modal; "split view should never replace details pages"; non-modal panel odak sözleşmesi | **D** |
| **Pinterest Gestalt** — Modal, OverlayPanel, Popover | *"Any time a separate, designated URL is desired"* → modal kullanma; 1–2 alan eşiği; iç içe modal yasağı | **D** |
| **Next.js** — Intercepting Routes | Paylaşılabilir URL/refresh'te tam sayfa, yumuşak gezinmede overlay; modal'ın 4 faydası | **D** |
| **NN/g** — Fessenden 2017, Nielsen 2018 & 2006, Laubheimer 2015, Whitenton 2015, Flaherty 2024, Wang 2023, Kendrick 2019 | Modal 4 kullan / 3 kullanma kuralı; onay rasyonlama + **"ayrıca undo sun"**; accordion kullan/kullanma; 2 seviyeden fazla disclosure sorunu; toast'ın hata için uygunsuzluğu; tooltip yasakları | **D** (araştırma) |
| Bootstrap 5.3 / MUI z-index ölçekleri | Katman yığını + "hepsini birlikte değiştir"; toast > modal | D (framework) / GP (tasarım otoritesi olarak) |
| Medusa Admin v2 · Saleor Dashboard (kaynak kod) | Route-bağlı overlay arketipleri (`RouteDrawer`=edit / `RouteFocusModal`=create); query-param modeli | **GP** (kod deseni; resmî doküman yok) |
| Alt rota → aktif öğe eşleme; breadcrumb 3+ seviye eşiği; sticky ≤%25 viewport | Mühendislik kararı; sınırı MDN "only one `aria-current`" ve WCAG Understanding çiziyor | **GP** |

**Erişilemeyen kaynaklar (uydurulmadı):** `m3.material.io` doğrudan fetch (SPA/404 — token dosyalarından
telafi edildi) · `polaris.shopify.com` (301, arşiv reposundan telafi) · `atlassian.design/components/*`
canlı sayfaları (client-render, ayna repodan) · `carbondesignsystem.com` v11 canlı (truncate; v10 + GitHub
kaynağından) · Apple HIG Modality (JS zorunlu) · Carbon Side panel usage (404 — sayfa mevcut değil) ·
Carbon `$spacing-01…13` tam tablosu (yalnız `$spacing-05=16px` ve `$spacing-09=48px` çapraz doğrulandı) ·
Polaris `--pg-layout-width-primary-max` sayısal değeri.

**Kaynak çelişkileri ve verilen kararlar:** spacing tabanı (4px vs 8px → 4px atomik + 8px ritim) ·
Carbon satır yükseklikleri v10≠v11 (v11 esas) · iç içe overlay (§4.4'te tür ekseninde çözüldü) ·
yan panel bağlam korur mu (§4.3'te modal/non-modal ayrımıyla çözüldü) · dropdown modal'ın üstünde mi
(§4.9'da Carbon izlendi, gerekçe portal davranışı) · toast süresi (aksiyonlu = otomatik kapanmaz ortak
paydası alındı).

**Yanlış atfedilmemesi gerekenler:** NN/g "undo > confirm" **demiyor** (ikisini de istiyor) ·
Radix, tooltip'in dokunmatikte kullanılmaması / etkileşimli içerik almaması / HoverCard'ın kritik içerik
taşımaması kurallarını **yazmıyor** (bunlar Atlassian/Carbon/Polaris/APG'de) · Polaris iç içe modal
hakkında **hiçbir şey söylemiyor** · Polaris ve Atlassian modal için **alan sayısı eşiği vermiyor**
(sayı yalnız Carbon ve Gestalt'ta) · GOV.UK'in modal hakkında **yayınlanmış duruşu yok**.

---

*Kaynak: 3 paralel araştırma ajanı (kurumsal görsel dil · overlay taksonomisi · kabuk mekaniği),
2026-08-15; birincil kaynak + tasarım sistemi kaynak kodu + lokal `node_modules` doğrulaması.
Ölçülen drift: bu oturumun admin denetimi (§1). Kardeş cetvel: `storefront-design-standard.md`.
Yapısal kontrat: `admin-standard.md` (§8 sayfa cetveli, §10.4 kabuk cetveli).*
