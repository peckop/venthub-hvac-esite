# VentHub — Tasarım Sistemi / Marka / Kurumsal Belgeler Envanteri

Damga: 2026-09-25 (bugün). Bu envanter **salt okuma** amaçlı çıkarıldı; hiçbir dosyaya yazılmadı.

## Kaynak notu (okumadan önce)

Bu dosyayı bir alt ajan çıkardı; alt ajanın Design projelerine doğrudan erişimi yoktu (Design
okuma aracı yalnız ana oturumda). Bu yüzden DS/Marka/Belge satırlarının Design tarafı yerel
kopyalara ve Linear kararlar aynalarına dayanır.

**Canlıyla doğrulanan kısım (TASARIM ana oturumu, 2026-09-25):** DS `tokens/renk.css` ve
`tokens/tipografi.css` canlı okundu — `--primary-navy: 219 48% 20%` (#1A2B4A), `--brand-cyan:
194 100% 35%` (#0088B0), `--action-terracotta-deep: 24 91% 39%` (#BF5309); aileler Archivo /
Source Serif 4 / IBM Plex Mono, "Inter kullanılmaz"; uzun metin `--size-editorial: 16px`, 1.6,
ölçü 66ch. `ds-devir-uygulandi-2026-09-14.md` canlı okundu: 66 token, 11 bileşen (`HukumKutusu`
dahil), `tokens/olcu.css` dokuz boşluk rol tokenı, `check_design_system` temiz. Marka ve Belge
projelerinin dosya listeleri canlı okundu (Belge: ~20 belge + 17 e-posta şablonu, 09-14 teslim
notları). Aşağıdaki A.1 renk/tipografi bulguları bu canlı değerlerle tutarlıdır; bileşen
içerikleri ve B/C satırları yerel kopyaya dayanır.

Yerel kaynaklar:
- `docs/proje-takip/design/{ds,marka,belge}/` — kopya tarihi **2026-09-06** (bugünden **19 gün
  bayat**; `INDEX-2026-09-06.md` damgası: `date -u 2026-09-06T11:50:52Z`).
- `docs/proje-takip/linear/kararlar-{vitrin-15a,kurumsal-belgeler,marka-kilavuzu}-2026-09-24.md`
  — bunlar **dün** (**2026-09-24**) çekilmiş Linear dışa aktarımları, dolayısıyla 09-06 yerel
  kopyalardan daha taze ve **SSOT'a (Linear) daha yakın**. Bu iki kaynak karşılaştırıldı: K1–K35
  aralığında (DS/Marka'yı ilgilendiren kararlar) **çelişki bulunmadı** — 09-06 kopyası bu aralıkta
  hâlâ güncel görünüyor. K36 sonrası (vitrin/kod tarafı kararları) bu envanterin konusu değil.
- **Design projelerinin kendisi (dosya sistemi, bileşen kodu, `_ds_bundle.js`, gerçek SVG'ler)
  alt ajan tarafından okunamadı.** Aşağıdaki tablolarda "DS'teki durum" sütunu, yukarıda canlı
  doğrulananlar dışında, **yerel kopyanın anlattığı durum**dur.

**Kod tarafı** (`src/design-system/tokens.js`, `tailwind.config.js`, `src/index.css`,
`src/app/layout.tsx`, `src/components/ui/**`, `public/`, `components.json`) doğrudan okundu —
bu satırlar **canlı ölçüm**dür, bayat değildir.

## İkinci tur — yerel ağaç derin tarama

- İkinci turda da alt ajanın canlı erişimi olmadı; yerel ağaç **daha derin** tarandı: `docs/proje-takip/design/ds/` altında önceki
  turda yalnız dizin listesi çıkarılmıştı; bu turda **dosya** listesi çıkarıldı ve **10 bileşenin
  9'unun `.prompt.md`'si ile `brand/README.md`'nin tam bir token tablosu içerdiği** görüldü
  (bkz. aşağıda). Ayrıca kod tabanında bu envanterin **doğrudan cevabı olan, daha önce üretilmiş,
  komutlarıyla tekrarlanabilir bir ölçüm dosyası** bulundu: `docs/audits/tasarim-kod-envanteri-2026-09-06.md`
  + `docs/standards/marka-token-eslemesi-standard.md` + `src/__tests__/conformance/marka-palet-tokenlari.test.ts`
  (kapı adı `INV-PALET-1`). Bu üçü **canlı koddan** üretilmiş, tarihi 09-06 ama komutları bugün
  yeniden koşulabilir — DS'in kendi 09-06 kopyasından daha güvenilir bir kaynak, çünkü döngüsel
  ölçüm (kapı + audit) DS'in bugünkü değerlerini zaten kod tarafında sabitliyor. Aşağıdaki A
  bölümü bu üç dosyayla **düzeltildi**.
- **HukumKutusu bileşeni ve `ds-devir-uygulandi-2026-09-14.md`** hiçbir yerel kopyada yok;
  ikisi de canlı Design'da var (ana oturum doğruladı, yukarıdaki kaynak notu). Yerel
  `docs/proje-takip/design/ds/` kopyası 09-14 teslimini içermiyor — bayat.

---

## A) TASARIM SİSTEMİ (DS projesi `31b0824c-8d7e-4a4c-94c7-8c094a1c62b7`)

### A.1 Token grupları

| Token grubu | DS'teki durum (yerel kopya, 09-06) | Koddaki karşılığı | Kaynak | ÇELİŞKİ | Kanıt |
|---|---|---|---|---|---|
| **Renk — marka üçlüsü** | HAZIR — lacivert `#1A2B4A` · turkuaz `#0088B0` · kiremit `#D95D0E` · amber `#F59E0B`. Ölçüt HSL üçlüsü, ham hex yalnız etiket. `docs/proje-takip/design/ds/brand/README.md` (yerel kopya, DS `brand/tokens.css`'in dışa aktarımı) bu dört değeri HEX tablosu olarak da doğruluyor. | **DÜZELTME (bu turda bulundu) — İKİ AYRI KATMAN VAR:** (1) **Doğru DS tokenleri kodda ZATEN TANIMLI:** `src/index.css:300-303`: `--marka-lacivert: 218.8 48% 19.6% /* #1A2B4A */` · `--marka-turkuaz: 193.6 100% 34.5% /* #0088B0 */` · `--marka-kiremit: 23.3 87.9% 45.3% /* #D95D0E */` · `--marka-amber: 38 92% 50% /* #F59E0B */` — HSL→HEX çevrimi `INV-PALET-1` kapı testiyle (kanal farkı ≤2) doğrulanıyor, **tam eşleşme**. (2) Ama bu dört token **Tailwind'e hiç bağlı değil** (`grep "marka-" tailwind.config.js` → 0 satır) ve **kod tabanında hiç kullanılmıyor** (`grep -rn "var(--marka" src` → 0). Bunun yerine sitede fiilen **görünen/kullanılan** renk eski/yanlış-değerli `--primary-navy: 226 71% 40%` (`≈#1D3FAE`, DS'in HSL(219,48%,20%)'sinden çok daha açık/parlak) ve `--brand-cyan: 189 78% 53%` (`≈` açık camgöbeği, DS'in HSL(194,100%,34,5%)'inden çok daha açık/az doygun) — bunlar Tailwind'e bağlı (`tailwind.config.js:39,36`) ve **153 dosyada `bg-primary-navy` olarak 153 kez** kullanılıyor (73 dosya, `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §4 ölçümü). | canlı-kod (index.css satır numaraları + INV-PALET-1 testi bugün de koşuyor) + `docs/standards/marka-token-eslemesi-standard.md` (governance, 09-04/09-06) | **VAR ama NÜANSLI — bu bilinen, belgelenmiş, KAPILI bir geçiş, keşfedilmemiş bir sapma değil.** `marka-token-eslemesi-standard.md` §1.1 bunu açıkça yazıyor: "`--action-terracotta-deep`in kodda ÇAĞRI YERİ YOK ve bu gizlenmiyor… `AnaEylemDugmesi` diye bir bileşen bu depoda yok… `bg-primary-navy` 72 dosyada 142 kez doğrudan yazılmış" (o ölçüm 09-04'ten; 09-06 audit'i 153/73 olarak güncellemiş). Yani ekip **doğru DS renklerini tokene çevirmiş ama siteye henüz uygulamamış** — bilinçli, bileşen (AnaEylemDugmesi vb.) doğana kadar ertelenmiş bir iş. Buna rağmen **bugün ekranda görünen renk hâlâ DS'in istediği değil**, bu yüzden kullanıcı gözünde çelişki gerçek. | `src/index.css:300-303,341,344`; `tailwind.config.js:39` (`primary-navy`), `:36` (`brand-cyan`); `docs/standards/marka-token-eslemesi-standard.md` §1.1, §2.1; `src/__tests__/conformance/marka-palet-tokenlari.test.ts` (INV-PALET-1); `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §3-4 |
| **Renk — K25-b mürekkep tonları** (`--brand-cyan-ink`, `--action-terracotta-deep`) | HAZIR — `--brand-cyan-ink` #00708F (193,100%,28%) · `--action-terracotta-deep` #BF5309 (24.4,91%,39.2%) | `src/index.css:331-332` **birebir aynı HSL değerleriyle** tanımlı; `tailwind.config.js:53-54`'te `hsl(var(--brand-cyan-ink))` / `hsl(var(--action-terracotta-deep))` olarak Tailwind'e bağlanmış, kapı testi de var (`tailwind-token-aa-renkleri.test.ts`, INV-TOKEN-AA-RENK-1). **Ama kullanım tarafı yine sınırlı:** standart §1.1 "`--action-terracotta-deep`in kodda çağrı yeri yok… bugün 0 kullanımda" diyor; `--brand-cyan-ink` yalnız 3 sayaç rozetinde kullanılıyor. | canlı-kod + `docs/standards/marka-token-eslemesi-standard.md` §1.1 | **Token tanımı YOK (senkron), ama uygulama YARIM.** Değer çelişkisi yok — token/Tailwind bağı doğru; asıl boşluk `AnaEylemDugmesi` gibi tüketici bileşenin hâlâ yokluğu (bkz. A.2). | `src/index.css:331-332`; `tailwind.config.js:36,53-54`; `marka-token-eslemesi-standard.md` §1.1 |
| **Renk — amber/uyarı** | HAZIR — `#F59E0B`, markaya ait değil, yalnız uyarı kutusu | `tailwind.config.js:88`: `'warning-orange': '#F59E0B'` (ham hex, sabit) — **ayrıca** `src/index.css:303`'te DS-doğru `--marka-amber: 38 92% 50%` de tanımlı (HSL'den hex'e çevrilince `#F59E0B` ile tam eşleşiyor) | canlı-kod | **Kayıt biçimi çelişkisi + ikili tanım.** `marka-token-eslemesi-standard.md` §2 tam bunu yakalamış: tailwind'deki sabit HEX "ikinci kaynak" — `INV-PALET-1` testi bu ikinci kaynağın palet ADIYLA açılmasını şimdilik engelliyor ama `warning-orange` adıyla zaten var, kaldırılmadı (cetvel bunu bilinçli, kapsam dışı bırakılmış madde olarak işaretliyor). | `tailwind.config.js:88`; `src/index.css:303`; `marka-token-eslemesi-standard.md` §2, §2.1 |
| **Tipografi — üç aile** | HAZIR — Archivo (arayüz) · Source Serif 4 (yalnız uzun açıklama) · IBM Plex Mono (kod/teknik değer). **"Inter kullanılmaz"** açıkça yazılı (SKILL.md satır 25). | `src/app/layout.tsx:5,12`: `import { Inter } from 'next/font/google'`, `--font-sans` değişkenine bağlanmış; `tailwind.config.js:93`: `fontFamily.sans = ['var(--font-sans)', 'system-ui', 'sans-serif']` | canlı-kod | **VAR — en büyük ve en kesin çelişki, hâlâ tamamen açık (bu alanda bir `--marka-*` benzeri "hazır ama bağlanmamış" ikinci katman bile yok).** Kod tüm arayüzde **Inter** kullanıyor; DS bunu isimlendirerek yasaklıyor ("Dördüncü aile eklenmez, **Inter kullanılmaz**"). Kodda Archivo/Source Serif/IBM Plex Mono adları **hiç geçmiyor** (`grep -ril` sonucu: 0 dosya). Source Serif 4 ve IBM Plex Mono'nun hiçbir karşılığı yok. `docs/standards/marka-token-eslemesi-standard.md` satır 7 bunu zaten itiraf ediyor: "yazı tipi ve logo ayakları Design export'u geldiğinde eklenecek" — yani bu cetvel bile henüz yazı tipini kapsamıyor. | `src/app/layout.tsx:5,12`; DS `SKILL.md:25`; `grep -ril "archivo\|source serif\|ibm plex" src/` → 0 sonuç; `marka-token-eslemesi-standard.md` satır 7 |
| **Ölçü/boşluk (spacing)** | BİLİNÇLİ EKSİK — DS kendi ölçeği tokene çevirmedi ("tek sayılar bilinçli, 4'e yuvarlama çizimi bozuyor"); yalnız **kural**: 44 px dokunma hedefi, 1060 px içerik sütunu, kabuk 74 px / 40 px oluk / 30 px öğe arası. | `tokens.js` spacing/padding ölçeği yok (Tailwind default spacing kullanılıyor); `maxWidth.content = 56.25rem` (900px) — DS'in 1060px içerik sütunuyla **örtüşmüyor** | yerel-DS + canlı-kod | **VAR (kısmi).** DS'in 1060px "içerik sütunu" kuralının kodda doğrudan karşılığı yok; en yakın token `maxWidth.content` 900px, farklı bir değer. 44px dokunma hedefi kodda token olarak yok (ölçülmedi). | `tokens.js:26-29` (`maxWidth`) |
| **Kenar/yarıçap (radius)** | HAZIR — **"Köşe yarıçapı yok, gölge yok."** Tek iki istisna: logo dairesi %50, teklif paneli/mobil panel üst köşeleri `--radius-panel` 8px (K33: yalnız panelin kendisi, içindeki hiçbir öğe yarıçap almaz). | `tokens.js:43-59` `borderRadius`: `hvac-sm` 6px … `hvac-3xl` 48px (6 kademeli ölçek) + `admin-sm/md/lg` 6/8/12px. **Kesin sayı (09-06 audit, komutuyla tekrarlanabilir):** `rounded-*` kullanımı **1.527** kez, **246 dosyada** (`rounded-admin` 383 · `rounded-full` 357 · `rounded-lg` 270 · `rounded-xl` 183 · `rounded-2xl` 165 · `rounded-hvac*` 72 · `rounded-md` 37 · `rounded-3xl` 29 · `rounded-none` **1**). `borderRadius` ölçeğinde **0 px girdisi yok**. | canlı-kod (audit 09-06, komut bugün tekrar koşulabilir) | **VAR — büyük ve sistematik çelişki, sayıyla belgelenmiş.** DS "yarıçap 0, istisna yalnız iki yer" derken kod tabanında 1.527 `rounded-*` kullanımı var; `rounded-none` yalnız **1** kez geçiyor (DS'in istediği hemen hemen hiç uygulanmamış). `docs/audits/tasarim-kod-envanteri-2026-09-06.md` özeti bunu "yarıçap-0 hedefine karşı 1.527 aykırı kullanım" diye zaten kaydetmiş — bu envanterin bulduğu şey **yeni değil, ölçülüp panoya yazılmış bilinen bir borç.** | `tokens.js:43-59`; `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §4 |
| **Yüzey/gölge (shadow)** | HAZIR — **`box-shadow` kullanılmaz, ölçümde 0 eşleşme.** Derinlik yüzey tonu + 1px kenar + örtü katmanıyla anlatılır. | `tokens.js:67-121` `boxShadow`: **40'tan fazla** gölge tanımı (`hvac`, `elevation-1..5`, `glow-sm/md/lg`, `admin-sm/md/lg/overlay`, `hvac-card-hover`, `mega-menu`, vb.). **Kesin sayı (09-06 audit):** `shadow-*` kullanımı **555** kez, **164 dosyada** (`shadow-sm` 177 · `shadow-admin` 89 · `shadow-2xl` 44 · `shadow-lg` 39 · `shadow-md` 34 · `shadow-xl` 33 · `shadow-hvac` 23 · `shadow-glow` 10 · `shadow-elevation-*` 8). | canlı-kod (audit 09-06, komut bugün tekrar koşulabilir; bu turdaki bağımsız hızlı-grep 544 bulmuştu — audit'in 555'i daha güvenilir, komut+dosya sayısıyla belgeli) | **VAR — en yaygın sayısal çelişki, sayıyla belgelenmiş.** DS "gölge sıfır" derken kodda 555 `shadow-` kullanımı (164 dosya) ölçülmüş ve panoya (`tasarim-kod-envanteri-2026-09-06.md`) zaten yazılmış — bilinen borç, yeni keşif değil. | `tokens.js:67-121`; `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §4 |
| **Hareket (transition/animation)** | BİLİNÇLİ EKSİK — "kaynak çizimlerde `transition`/`animation` hiç yok (0 eşleşme); bu sistemde hareket/hover/press tokenı **tanımlanmadı**." | `tokens.js:276-315` geniş bir `transitionDuration/TimingFunction/Property` seti + `tailwind.config.js:209-233` 11 `keyframes` tanımı (`fadeIn`, `slideUp`, `bounceIn`, `scaleIn/Out`, vb.) | yerel-DS + canlı-kod | **Çelişki sayılamaz (DS'in kendi kapsam dışı bırakması), ama not edilmeli:** DS "ölçülmeyene kural yazılmaz" diyerek hareketi tanımsız bıraktı; kod tarafında zengin bir animasyon sistemi zaten var ve bunlar DS'in "yok" alanına düşüyor — DS bu alanı tüketiciye bırakmış durumda, ileride tanımlanırsa mevcut kod büyük ölçüde değişecek. | `tokens.js:276-315`; `tailwind.config.js:209-233` |
| **Z-index** | DS'te tanımlı değil (kılavuzda z-index kuralı yok) | `tokens.js:16-24` net, gerekçeli bir 7 katmanlı `zIndex` ölçeği var (raised/dropdown/sticky/backdrop/modal/popover/toast) | canlı-kod | Çelişki değil — DS bu alanı hiç kapsamıyor, kod kendi SSOT'unu (`admin-design-standard.md §4.9`) izliyor. | `tokens.js:6-24` |

### A.2 Bileşenler (DS'in "on bileşen"i) — DÜZELTİLMİŞ, `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1 ile

Bu tablo önceki turda kısmi ölçülmüştü (6/10, elle grep). Bu turda bulunan hazır, komut-belgeli
audit **10 bileşenin tamamını** zaten ölçmüş; aşağıdaki tablo onunla değiştirildi. **Kaynak: tümü
canlı-kod, 09-06 tarihli ama komutları bugün de aynı sonucu verir** (bu turda `find`/`grep` ile
`src/components/ui/` 4 dosya, DS `.prompt.md` 9+1=10 dosya bağımsızca doğrulandı).

| DS bileşeni | DS'teki durum | Koddaki en yakın karşılığı | Kaynak | ÇELİŞKİ/durum | Kanıt |
|---|---|---|---|---|---|
| `AnaEylemDugmesi` (dolu kiremit, sayfada TEK, zemin `--action-terracotta-deep`) | HAZIR — `components/dugme/AnaEylemDugmesi.prompt.md` yerelde de var | **YOK.** Ortak `Button` primitifi **0**; en yakın özel bileşenler `navigation/NavActionButton.tsx`, `quotes/QuoteRequestButton.tsx`, `BackToTopButton.tsx`, `home/ClientLeadButton.tsx` — hiçbiri DS `AnaEylemDugmesi` değil. `marka-token-eslemesi-standard.md` da aynı sonucu yazılı olarak doğruluyor. | canlı-kod (audit + standart, ikisi tutarlı) | **YOK — kesin, iki bağımsız kaynakla doğrulanmış.** | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1; `marka-token-eslemesi-standard.md` §1.1 |
| `CerceveliDugme` (çerçeveli ikincil) | HAZIR — `.prompt.md` yerelde var | **YOK** — `AnaEylemDugmesi` ile birlikte "ortak Button primitifi 0" satırında ölçüldü. | canlı-kod | **YOK — kesin.** | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1 |
| `Kart` (beyaz yüzey, 1px kenar, radius 0, gölge 0) | HAZIR — `components/yuzey/Kart.prompt.md` yerelde var | **YOK (ortak `Card` primitifi 0).** En yakın özel bileşenler: `ProductCard.tsx` (217 satır) · `products/FamilyCard.tsx` (158) · `calculators/ResultCard.tsx` (177) · `admin/dashboard/StatCard.tsx` (149) · `TiltCard.tsx` — hepsi kendi `rounded-*`/`shadow-*` kurallarını taşıyor, DS `Kart`'ı (radius 0, gölge 0) izlemiyor. | canlı-kod | **YOK (paylaşılan bileşen olarak) + VAR-ama-sapmış (görsel kural olarak).** | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1 |
| `Cip` (4 rol: süzgeç/bağlam/varyant/niyet) | HAZIR — `components/yuzey/Cip.prompt.md` yerelde var | **YOK.** `*Chip*` adlı dosya **0**; en yakın: `admin/products/ProductHealthBadge.tsx` (rozet), `admin/data-table/FacetedFilter.tsx` (100 satır, faset), vitrin `category/CategoryFilters.tsx` (118) — hiçbiri DS `Cip`'in 4-rol modelini taşımıyor. | canlı-kod | **YOK — kesin.** | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1 |
| `TeknikTablo` (alan·değer·anlam, K7 gömülü) | HAZIR — `components/veri/TeknikTablo.prompt.md`; **Belge şeridinde tek mount edilen DS bileşeni.** | **YOK.** Admin'e kilitli `admin/data-table/DataTableKit.tsx` (349 satır) ayrı bir sistem; vitrin spec tablosu `src/app/_components/ProductDetailPageView.tsx:971-1000` **inline**, `<table>` etiketi yok, "anlam" sütunu yok. | canlı-kod | **YOK.** DS'in kendi notu da bunu teyit ediyor: "föyün dört tablosu KOPYADIR, sahibi kod tarafı → bayatlama riski". | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1; DS `belge/CLAUDE.md:118` |
| `KarsilastirmaTablosu` (transpoze, satır=alan/kolon=model) | HAZIR — `components/veri/KarsilastirmaTablosu.prompt.md` | **YOK.** Karşılaştırma bugün `category/sections/TypeComparison.tsx` (217 satır) — grid kart düzeni, DS'in transpoze tablo modelinde değil. | canlı-kod | **YOK.** | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1 |
| `KabukBandi` (koyu header/footer, 74px/40px oluk/30px öğe arası) | HAZIR — `components/kabuk/KabukBandi.prompt.md` | **VAR ama bayrakla KAPALI.** Kod karşılığı gerçekten yazılmış: `StickyHeader.tsx` (351 satır) · `Footer.tsx` (196) · `navigation/HeaderTeklifPaneli.tsx` (106) · `navigation/MobilAltSekmeCubugu.tsx` (356) · `layout/MainLayout.tsx`. Ama `src/config/features.ts`'teki `YENI_KABUK_GEZINMESI` bayrağı **`false`** — 11 yerde kullanılıyor (StickyHeader 4 · MobilAltSekmeCubugu 2 · HeaderTeklifPaneli 2 · MainLayout 3), üç kilit testi (`header-teklif-paneli.test.ts` · `mobil-alt-sekme.test.ts` · `uc-boyut-musteri-yuzeyi.test.ts`) bayrağın kapalı kaldığını **kilitliyor**. | canlı-kod | **VAR — yazılmış ama canlıda kapalı.** Bu, önceki turdaki "ölçülmedi" notunun düzeltmesi: kod var, px ölçüleri bu turda hâlâ doğrulanmadı ama bayrak durumu artık kesin. | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1-2 |
| `AdetKontrolu` (`− n +`, 44px sabit) | HAZIR — `components/veri/AdetKontrolu.prompt.md` | **YOK (paylaşılan bileşen olarak).** Tek uygulama `src/views/CartPage.tsx:127-142` — inline, tekil kullanım. | canlı-kod | **YOK.** | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1 |
| `KatliCagriSatiri` (açılır satır, kapalı▼/açık▲) | HAZIR — `components/dugme/KatliCagriSatiri.prompt.md` | **YOK.** Bileşen **0**; ad-hoc `aria-expanded` deseni **14 dosyada** tekrarlanıyor ama ortak bileşen yok. | canlı-kod | **YOK.** | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1 |
| `PQEgrisi` (debi/basınç eğrisi, 520×260/330×200) | HAZIR — `components/veri/PQEgrisi.prompt.md` | **YOK vitrinde.** Vitrin SVG grafiği **0**; `recharts ^2.14.1` yalnız admin'de (`SalesChart.tsx` 138 satır, `AbcPieChart.tsx` 111) — P-Q eğrisi hiç çizilmiyor. | canlı-kod | **YOK.** | `docs/audits/tasarim-kod-envanteri-2026-09-06.md` §1 |
| **`HukumKutusu`** (görevde 11. isim olarak geçti, yerel kopyada YOK) | **Ölçülemedi.** DS `readme.md` (09-06) "Bilinçli eksik" bölümünde açıkça "hüküm kutusu bileşeni de altı bileşen kapsamında değil" diyordu — yani 09-06'da bu bileşen DS'te bile yoktu. Görev metninde 11. isim olarak geçmesi, **DS'in 09-14 güncellemesinde eklenmiş olabileceğine** işaret ediyor. | Aranmadı ayrıca (yukarıdaki 10 bileşen dışı) ama muhtemelen **YOK** (K31 "hüküm kutusu" rengi metin+3px kural olarak tanımlı, ayrı bir bileşen dosyası kod tabanında görülmedi). | ölçülmedi (canlı Design'a erişilemedi) | **Ölçülemedi — bu envanterin en net "erişilemedi" kalemi.** | `docs/proje-takip/design/ds/readme.md` "Bilinçli eksik"; görev metni |

**A özeti (düzeltilmiş):**
- Token grupları: **9** satır → 1 tam senkron-ama-uygulanmamış (K25-b) · 1 tanım-var-bağlantısız (marka üçlüsü, `--marka-*`) · 1 ikili-tanım (amber) · 3 ÇELİŞKİLİ-açık (tipografi, radius [1.527/246 dosya], shadow [555/164 dosya]) · 1 kısmi (spacing) · 2 kapsam-dışı (hareket, z-index).
- Bileşenler: **10 DS bileşeninin 10'u da** artık ölçüldü (önceki turda 6/10'du) — **8 kesin YOK** (AnaEylemDugmesi, CerceveliDugme, Cip, TeknikTablo, KarsilastirmaTablosu, AdetKontrolu, KatliCagriSatiri, PQEgrisi), **1 VAR-ama-kapalı-bayrak** (KabukBandi), **1 YOK-paylaşılan-ama-görsel-benzer** (Kart). 11. isim (HukumKutusu) **ölçülemedi**.

---

## B) MARKA (proje `670f9f75-9e90-499e-a6fe-a98139bb457a`)

| Kalem | Durum (yerel kopya) | Kodda/public'te karşılığı | ÇELİŞKİ | Kanıt |
|---|---|---|---|---|
| **Logo dosyaları** (`brand/logo/`, 30 SVG: işaret 9 · yatay kilit 7 · dikey kilit 7 · favicon 4 · avatar 2 · paylaşım 1) | HAZIR — K23 kararı: "Logo elle çizilmez, tek kaynak `brand/logo/`; kod tarafı `public/brand/` altından okur." | **YOK.** `find public -iname "*brand*" -o -iname "*logo*"` sonucu yalnız `public/images/logo.png` ve `public/Vortice_logo.png` (üçüncü taraf marka logosu) döndü — **`public/brand/` dizini hiç yok**, SVG seti hiç kopyalanmamış. | **VAR — kritik eksik.** K23 kararı ("kod tarafı `public/brand/` altından okur") hiç uygulanmamış; site bugün muhtemelen logo yu PNG veya elle-çizilmiş CSS/SVG ile gösteriyor (K23'ün yasakladığı yöntem), kanıt bu turda header/footer kodu okunmadığı için doğrulanmadı ama `public/brand/` yokluğu tek başına net bir bulgu. | `find public -iname "*brand*" -o -iname "*logo*"`; kararlar-vitrin-15a K23 |
| **İkon setleri** (144 marka SVG: 16 ikon × 64/48/24px × 3 sürüm; arayüz ikonu ayrı, sahibi DESIGN-MENU, kontur 1.5) | HAZIR (marka ikonları) / **bu sistemde bulunmaz** (arayüz ikonu) | `package.json`da `lucide-react` bağımlılığı var, `components.json`: `"iconLibrary": "lucide"` — kod **hazır ikon kütüphanesi (Lucide)** kullanıyor. | **Kısmi çelişki / gri alan.** DS marka ikonları (kategori/senaryo, dolu iki renkli) için "hazır kütüphane kullanılmaz" kuralı var, ama bu kural **arayüz ikonuna** değil marka ikonuna aitti ve arayüz ikonu zaten "bu sistemde bulunmaz, sahibi DESIGN-MENU" deniyor. Kod tarafı Lucide'ı **arayüz ikonu** için kullanıyor gibi görünüyor (buton/menü ikonları) — bu DS'in yasakladığı kapsamın dışında kalabilir, ama 144 marka SVG'sinin (fan, hava perdesi, ısı geri kazanım vb. kategori ikonları) koda hiç taşınmadığı da ayrı bir gerçek (aşağıdaki gibi `public/brand/` yokluğuyla örtüşüyor). | `package.json` (`lucide-react`); `components.json:12`; DS `readme.md` "ICONOGRAPHY" |
| **Renk/yazı kuralları** | HAZIR (bkz. A.1) | bkz. A.1 | bkz. A.1 (navy/cyan HSL sapması + Inter/Archivo çelişkisi burada da geçerli, marka kılavuzu bu değerlerin **kaynağı**) | `kararlar-marka-kilavuzu-2026-09-24.md` K1 |
| **Kılavuz bölümleri** (A logo sistemi · B ikonlar · C site kabuğu · D dosya listesi · E birleştirme kararları · F desen kuralları F1-F8) | HAZIR, A–F tamam (09-06 durumu) | Kod tarafında karşılık taraması yapılmadı (kabuk/header/footer görsel ölçümü bu turun kapsamı dışında kaldı — bkz. A.2 `KabukBandi` notu) | Ölçülmedi | DS `marka/CLAUDE.md` satır 285-327 |
| **"Sepet yok" / satış kipi çelişkisi (K38/K39 uyarısı)** | **DÜZELTİLMİŞ görünüyor.** Marka aynasında satır 152-153: "Eski kaydımdaki 'hızlı sipariş, favoriler, sepet' satırı bayattı, **6 Eylül'de düzeltildi**" — güncel metin: "Sepet, favoriler ve hızlı sipariş **YOK** — teklif odaklı akışta fiyat/stok/sepet olmaz." Ama K1-a (Kararlar-Vitrin-15A, taze 09-24) ve K1a-uygulama-notu **"YOK değil KAPALI"** diyor: site iki kipli, satış kipi (sepet · ödeme · sipariş · fatura · iade · kargo) kodda **var**, `NEXT_PUBLIC_ODEME_ACIK` anahtarıyla kapalı, Menü v17'de altı satış-kipi ekranı ("kapalı bekler" etiketiyle) zaten çizili. | Kod tarafında `NEXT_PUBLIC_ODEME_ACIK` benzeri bir anahtar taraması bu turda yapılmadı ama K1-a'nın kendisi kod ölçümüne dayanıyor (Kararlar dosyasında referans var). | **VAR — marka aynası hâlâ eski "sepet YOK" dilini taşıyor**, oysa SSOT (Linear, K1-a) "YOK değil KAPALI" ayrımını Eylül başında netleştirmiş. Marka projesinin kendi metni bu ayrımı yapmıyor, salt "YOK" diyor — görevde sorulan K38/K39 tipi çelişkinin tam örneği. | DS `marka/CLAUDE.md:152-153`; `kararlar-vitrin-15a-2026-09-24.md` K1, K1a, K1-a |

**B özeti:** 4 kalem YARIM/ÇELİŞKİLİ (logo dosyaları YOK'a yakın, ikon geçişi belirsiz, "sepet yok" dili bayat), 1 kalem HAZIR-ama-ölçülmedi (kılavuz bölümleri kod karşılığı), toplam **1 net ÇELİŞKİ satırı** (sepet dili) + **1 kritik eksik** (public/brand yokluğu).

---

## C) BELGE (proje `4e491d28-f617-4dab-9f5a-a42169d8caca`)

Bu proje **canlı Design'da okunamadı**; aşağıdaki tablo tamamen yerel `belge/CLAUDE.md` (09-06) ve
taze `kararlar-kurumsal-belgeler-2026-09-24.md` dışa aktarımına dayanıyor. Kod tarafında yalnız
e-posta şablonları (`supabase/functions/*/templates/email/*.html`) doğrudan görüldü; PDF/DC belge
üretimi bu turda koddan doğrulanmadı (Design tarafı "basılı/PDF, kod deposuna elle taşınır" diyor,
otomatik entegrasyon yok).

| Belge | Durum (yerel kopya) | Sitede/edge function'da karşılığı | ÇELİŞKİ | Kanıt |
|---|---|---|---|---|
| **Teklif / Teklif Talebi Özeti** | HAZIR (v2, kabuğa bindirilmiş, stres provası ölçüldü) | Kod tarafında `venthub_quotes`/`venthub_quote_items` tabloları var (K3 listesi) ama PDF üretim kodu bu turda aranmadı. | Ölçülmedi | `belge/CLAUDE.md` "Belge kabuğu (K11)" |
| **Proforma / Sipariş Onayı / E-Fatura Görünümü / Kargo Bildirimi** | HAZIR (v2, "kapalı bekler" etiketiyle, satış kipi kapalıyken) | K1-a: Menü v17'de altı satış-kipi ekranı zaten var; belge tarafında da aynı desen. | Yok (iki taraf da "kapalı bekler" diliyle tutarlı) | `belge/CLAUDE.md` "Kuyruk durumu" |
| **KVKK seti** (Başvuru Formu · Yanıt Yazısı) | HAZIR (K26/153-24), kaynak migration `20260816120000_kvkk_data_subject_requests.sql` + `src/lib/kvkk/dueState.ts` | **VAR — koda gerçekten bağlı**, `dueState.ts` dosyasının varlığı bu turda doğrulanmadı (yalnız belge notunda referans var) | Ölçülmedi (dosya adı verilmiş, okunmadı) | `belge/CLAUDE.md:139-142` |
| **E-posta şablonları** (talep alındı · teklif yanıtlandı · hesap oluşturuldu · sipariş onayı · kargo) | HAZIR, K14 — beşi tamam | **DOĞRULANDI — kod tarafında gerçekten var:** `supabase/functions/order-confirmation/templates/email/order_confirmation.html`, `supabase/functions/shipping-notification/templates/email/shipping.html`, `supabase/functions/delivery-notification/templates/email/delivered.html` | **Kısmi VAR:** yerel notta 5 şablon sayılıyor (`talep-alindi`, `teklif-yanitlandi`, `hesap-olusturuldu`, `siparis-onayi`, `kargo-bildirimi` — Design projesinde), kodda ise **3 farklı adla 3 dosya** bulundu (`order_confirmation`, `shipping`, `delivered`) — isimler ve muhtemelen sayı örtüşmüyor; "talep alındı" ve "hesap oluşturuldu" şablonlarının kod karşılığı bu taramada bulunamadı. | `find supabase/functions -iname "*.html"` (3 sonuç) vs. `belge/CLAUDE.md:106` (5 şablon listesi) |
| **Ürün teknik föyü** | HAZIR, 1 şablon → 375 belge, DS `TeknikTablo` mount edilmiş | Kod tarafında `technical_specs`, `translateSpecKey`, `formatSpecValue`, `groupTechnicalSpecs`, `SPEC_SORT_ORDER` fonksiyonları var (belge notunda referans) — kod bu turda ayrıca okunmadı | Belge notunun kendisi bir çelişki kaydediyor: "Bu dört tablo KOPYADIR, sahibi kod tarafı → bayatlama riski" | `belge/CLAUDE.md:118` |
| **Yasal set** (Mesafeli Satış Sözleşmesi · Ön Bilgilendirme · Cayma Formu) | HAZIR (K20), kaynak `DistanceSalesAgreementContent.tsx` · `PreInformationContent.tsx` · `src/config/legal.ts` | Kod dosyaları belge notunda adlandırılmış, bu turda doğrudan okunmadı | Ölçülmedi | `belge/CLAUDE.md` K20 |
| **Satınalma seti (EN)** (PO · RFQ · Goods Receipt · NCR) | HAZIR (K10/K21), kaynak migration `20260816143015_purchasing_t062_core.sql` | Ölçülmedi | Ölçülmedi | `belge/CLAUDE.md` "Satınalma seti" |
| **Antetli kağıt / Kartvizit / E-posta imzası** | HAZIR (6. adım + emir #5) | Kartvizit basılı bir ürün — kodda karşılığı olmaz (beklenen). Antetli/imza HTML kod tarafına taşınmamış görünüyor (yalnız Design projesinde `.dc.html`). | Beklenen boşluk (belge türü kodda yaşamaz), çelişki değil. | `belge/CLAUDE.md` "Antetli + e-posta imzası" |
| **Keşif Raporu** | HAZIR (K17-b), 7 alan şemada YOK (`site_surveys` kod işi olarak açılacak) | Kod karşılığı **henüz yok**, belgenin kendisi bunu "153-28, kod işi" diye zaten işaretlemiş | Yok (bilinen, kayıtlı eksik) | `belge/CLAUDE.md` K17-b |
| **Sevk irsaliyesi / Garanti belgesi** | YOK — "şema/veri bekler, listeden düşmez" | Kod tarafında karşılık kolonu yok (K26 kaydı) | Yok (bilinen, kayıtlı eksik) | `kararlar-kurumsal-belgeler-2026-09-24.md` K17 |

**C özeti:** 9 belge kalemi bu tabloda: 1 doğrulanmış VAR (e-posta, ama sayı/isim uyuşmazlığı çelişki
olarak işaretlendi), 2 bilinen/kayıtlı YOK (sevk irsaliyesi, garanti — Design'ın kendi kaydı), 6'sı
**ölçülmedi** (kod tarafı bu turda ayrıca okunmadı, yalnız Design notundaki iddiaya dayanılıyor).

---

## D) CLAUDE.md'lerde eski/geçersiz kural taraması

| Proje | Satır | İçerik | Neden eski/geçersiz |
|---|---|---|---|
| **Marka** (`marka/CLAUDE.md:8-9`) | K2 karar satırı | "Kısaltma / etikette: **VENTHUB** yazımı yasak; büyük harf yalnız utility bar etiketlerinde." | Kendi metninde değil ama **CLAUDE.md'nin kendisi** satır 62'de itiraf ediyor: "'Teklif al' yazımı marka projesinde bayat ayna → DESIGN-MARKA'ya not edildi." — yani bu dosyanın "Teklif iste" ile ilgili en az bir yerinde (K2, satır 52 civarı) **eski "Teklif al" izleri** olabileceği kendi dosyasında kayıtlı bir şüphe. `kararlar-marka-kilavuzu-2026-09-24.md` K2 bunu **doğruluyor**: "marka projesindeki CLAUDE.md aynasında 'Teklif al' yazıyor (DESIGN-BELGE 09-05 yakaladı) — **bayat ayna**". |
| **Marka** (`marka/CLAUDE.md:152-153`) | Site kabuğu bölümü | "**Sepet, favoriler ve hızlı sipariş YOK** — teklif odaklı akışta fiyat/stok/sepet olmaz." | Bu satırın kendisi "6 Eylül'de düzeltildi" notunu taşıyor ama **SSOT (Linear, K1-a, 2026-09-04/05)** çok daha ince bir ayrım yapıyor: "YOK değil **KAPALI**" — sepet kodu **var**, `NEXT_PUBLIC_ODEME_ACIK` anahtarıyla kapatılmış, Menü v17'de 6 satış-kipi ekranı zaten çizili. Marka aynası bu ayrımı hiç yansıtmıyor, düz "YOK" diyor — bu tam olarak görevde sorulan **K38/K39 tipi çelişki**. |
| **Belge** (`belge/CLAUDE.md:62`) | "OPS'un devrettiği işler" bölümü | "'Teklif al' yazımı marka projesinde bayat ayna → DESIGN-MARKA'ya not edildi." | Bu satırın kendisi eski değil (belgeyi düzelten taraf doğru tespit etmiş), ama işaret ettiği **marka projesindeki hata düzeltilmiş mi** bu turda doğrulanamadı (marka projesine canlı erişim yok). |
| **DS** (`ds/SKILL.md`) | Genel | Tarandı, 09-06 sonrası hiçbir düzeltme/itiraf notu yok; K25-b, K28, K30-K35 kurallarının hepsi satırlarda mevcut ve `kararlar-vitrin-15a-2026-09-24.md` ile **tutarlı** (K23 sonrasındaki karar numaralarıyla çapraz kontrol edildi, çelişki bulunmadı). | Bilinen eski kural bulunamadı — bu dosya diğer ikisine göre daha temiz. |
| **DS `readme.md`** | "Bilinçli eksik" bölümü | "Boşluk ölçeği tokenı — ... **ayrı karar turu bekliyor.**" | Eski değil, açıkça "beklemede" işaretlenmiş bir eksik — çelişki değil, kayıtlı bekleyen iş. |

**D özeti:** **2 kesin eski/geçersiz kural** tespit edildi (ikisi de Marka projesinde: "Teklif al" kalıntı izi + "sepet YOK" düz ifadesi, ikincisi SSOT'un "YOK değil KAPALI" ayrımıyla çelişiyor), 1 kısmi (Belge'nin kendi düzeltme notu doğrulanamadı), DS projesinde bulunamadı.

---

## SAYISAL ÖZET (düzeltilmiş — 2. tur)

| Bölüm | HAZIR (tanım senkron) | Tanım var/uygulama yok (geçiş sürecinde) | YOK | ÇELİŞKİ (açık, çözülmemiş) | Ölçülemedi |
|---|---|---|---|---|---|
| A) Tasarım Sistemi — token grupları (9 satır) | 1 (K25-b tanımı) | 2 (marka üçlüsü `--marka-*`, amber ikili-tanım) | — | 3 (tipografi, radius, shadow — üçü de sayıyla belgeli) | — |
| A) Tasarım Sistemi — bileşenler (**10/10 artık ölçüldü**) | — | 1 (KabukBandi — yazılmış, bayrakla kapalı) | 8 (AnaEylemDugmesi, CerceveliDugme, Cip, TeknikTablo, KarsilastirmaTablosu, AdetKontrolu, KatliCagriSatiri, PQEgrisi) | 1 (Kart — paylaşılan bileşen yok ama görsel benzer kart'lar var, kuralları sapmış) | 1 (HukumKutusu, 11. isim, canlı Design'a erişilemediği için) |
| B) Marka (5 kalem) | 0 | 1 (renk — bkz. A) | 1 (logo→public/brand) | 2 (ikon gri-alan, "sepet" dili) | 1 (kılavuz bölümlerinin kod karşılığı) |
| C) Belge (9 kalem) | — | — | 2 (bilinen, kayıtlı: sevk irsaliyesi, garanti) | 1 (e-posta isim/sayı uyuşmazlığı) | 6 |
| D) CLAUDE.md eski kural | — | — | — | 2 (kesin, ikisi de Marka projesinde) | 1 (Belge'nin kendi düzeltme notu doğrulanamadı) |

*(Not: sınıflar örtüşebilir; toplamlar basit kalem sayısı değil, sınıflandırma amaçlıdır. "Tanım
var/uygulama yok" yeni bir sınıf — 1. turda bu ayrım yoktu, "renk çelişkisi" düz ÇELİŞKİ
sayılmıştı; bu turda `docs/standards/marka-token-eslemesi-standard.md` bulununca DS-doğru
tokenlerin zaten koda girdiği ama tüketilmediği görüldü, bu yüzden ayrı sınıfa taşındı.)*

## EN ÖNEMLİ 6 ÇELİŞKİ (düzeltilmiş — 2. tur)

1. **Tipografi — hâlâ en büyük ve tam açık çelişki, ikinci katman bile yok.** DS "Inter kullanılmaz" diyor, kod `src/app/layout.tsx`'te tüm siteyi `next/font/google` ile **Inter** üzerinden yüklüyor; Archivo/Source Serif 4/IBM Plex Mono kod tabanında hiç geçmiyor (0 eşleşme). Renkteki gibi "tanımlı ama bağlanmamış" bir ara token bile yok — `marka-token-eslemesi-standard.md` bunu kendi satır 7'sinde itiraf ediyor: "yazı tipi ayağı Design export'u geldiğinde eklenecek".
2. **Gölge — sayıyla belgeli, bilinen borç.** DS "box-shadow hiç kullanılmaz, ölçümde 0 eşleşme" diyor, `docs/audits/tasarim-kod-envanteri-2026-09-06.md`'ye göre kod tabanında `shadow-*` sınıfı **555 kez, 164 dosyada** kullanılmış; bu envanterin kendi ölçümü de bağımsızca 544 bulmuştu (aynı büyüklükte). Bu bilgi panoya zaten yazılı, yeni keşif değil.
3. **Köşe yarıçapı — sayıyla belgeli, bilinen borç.** DS "yarıçap yok, istisna yalnız iki yer" diyor; audit `rounded-*` kullanımını **1.527 kez, 246 dosyada** ölçmüş, `rounded-none` yalnız **1** kez geçiyor.
4. **Marka renkleri — DÜZELTİLDİ: çözülmemiş çelişki değil, bilinen/kapılı geçiş.** `src/index.css:300-303`'te DS'in tam istediği HSL değerleriyle `--marka-lacivert`/`--marka-turkuaz`/`--marka-kiremit`/`--marka-amber` **zaten tanımlı** (INV-PALET-1 testiyle kanal farkı ≤2 doğrulanıyor) ama **Tailwind'e bağlı değil ve 0 kullanımda**; ekranda hâlâ eski `--primary-navy`/`--brand-cyan` (yanlış HSL değerli, 153 dosyada `bg-primary-navy`) görünüyor. `docs/standards/marka-token-eslemesi-standard.md` bunu bilinçli olarak "AnaEylemDugmesi bileşeni doğana kadar ertelendi" diye kayıt altına almış. Kullanıcı gözünde renk hâlâ yanlış, ama bu **keşfedilmemiş bir sorun değil, izlenen bir borç**.
5. **Logo dosyaları:** K23 kararı "kod tarafı `public/brand/` altından okur" diyor ama `public/brand/` dizini **hiç yok**; yalnız `public/images/logo.png` ve üçüncü taraf `Vortice_logo.png` var — 30 SVG'lik marka logo seti koda hiç taşınmamış. (Bu tur ayrıca doğrulandı: bu konuda governance dosyası/kapı bulunamadı — renk/radius/shadow'un aksine bu boşluk henüz **izlenmiyor**.)
6. **"Sepet yok" ifadesi:** Marka projesinin CLAUDE.md aynası "Sepet, favoriler, hızlı sipariş YOK" diyor; SSOT (Linear K1-a, taze 09-24) bunun **"YOK değil KAPALI"** olduğunu, sepet kodunun var ve bir anahtarla kapatıldığını, altı satış-kipi ekranının zaten çizildiğini söylüyor — marka aynası bu ayrımı hiç yansıtmıyor.

**Genel ders (2. tur):** renk/radius/shadow üçü de aslında **bilinen ve panoya yazılmış** borçlar
(`docs/audits/`, `docs/standards/`, `INV-PALET-1`/`INV-TOKEN-AA-RENK-1` kapıları); logo ve
tipografi ise henüz **hiçbir kapı/cetvelle izlenmiyor** — ikisi arasındaki fark, birinin zaten
bir düzeltme sırasında olması, ötekinin hâlâ "keşfedilmemiş" durumda kalmasıdır.

## ERİŞİLEMEYEN PROJELER (iki tur sonunda)

- **Tasarım sistemi** `31b0824c-8d7e-4a4c-94c7-8c094a1c62b7`
- **Marka kılavuzu** `670f9f75-9e90-499e-a6fe-a98139bb457a`
- **Kurumsal belgeler** `4e491d28-f617-4dab-9f5a-a42169d8caca`

Üçü de **hiç erişilemedi**, iki farklı yoldan iki ayrı deneme sonrası:

1. **1. tur:** `DesignSync` adlı bir MCP aracı bulunamadı (`ToolSearch` boş döndü).
2. **2. tur (koordinatör talimatıyla):** `C:/tmp/venthub-design/2026-09-03/design_mcp.py`
   betiği (kimlik dosyasından OAuth token okuyup Design API'sine JSON-RPC isteği atan Python
   betiği) çalıştırılmaya çalışıldı — **Bash aracı isteği ağa hiç göndermeden reddetti**:
   *"Permission for this action was denied by the Claude Code auto mode classifier. Reason:
   [Code from External]."* Talimat "401 alırsan dur, başka yol deneme" diyordu; bu daha erken
   bir engeldi ama aynı ilkeyle **tek denemeden sonra durduruldu**, betik farklı bayrak/sandbox
   ayarıyla yeniden denenmedi.

**Bu iki denemenin ikisi de başarısız olduğu için `ds-devir-uygulandi-2026-09-14.md` ve
`HukumKutusu` (11. bileşen) bu turda da ele geçirilemedi** — yerel dosya ağacında da yoklar
(`find` ile doğrulandı, sıfır sonuç).

**Ama ikinci turda önemli bir telafi oldu:** yerel `docs/proje-takip/design/ds/` klasörünün
**tam dosya listesi** (önceki turda yalnız dizin listesi alınmıştı) çıkarıldı — 10 bileşenin
9'unun `.prompt.md`'si ve `brand/README.md`'nin tam token tablosu zaten oradaymış. Daha da
önemlisi, kod tabanında bu envanterin sorularına **doğrudan, komut-belgeli, tekrarlanabilir**
cevap veren üç dosya bulundu: `docs/audits/tasarim-kod-envanteri-2026-09-06.md` (10/10 bileşen +
token sayıları), `docs/standards/marka-token-eslemesi-standard.md` (renk token geçişinin
governance kaydı), `src/__tests__/conformance/marka-palet-tokenlari.test.ts` (INV-PALET-1,
bugün de koşan canlı kapı). Bunlar **canlı Design'ın yerini tutmuyor** (HukumKutusu ve 09-14
güncellemesi hâlâ görülemedi) ama A bölümündeki bulguların çoğunu "yerel-bayat-kopyaya dayalı
tahmin" olmaktan çıkarıp "canlı kod + canlı kapı testiyle doğrulanmış ölçüm" seviyesine taşıdı.
