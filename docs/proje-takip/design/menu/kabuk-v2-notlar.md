
# Kabuk v2 — tur notları (DESIGN-MENU, 2026-09-05)

Emir: `ops-emir-2026-09-05-1-menu.md` + eki `ops-emir-2026-09-05-2-cip.md`. Düğmeler **VARIANCE 4 · MOTION 3 ·
DENSITY 7**. Teslim: `Menü Tasarımı v16.dc.html` (9 kare) + `Venthub Ana Sayfa v10.dc.html`. v15 ve v9 arşivde.
Kullanılan yetenek: yok — kare seti, prototip bu turda yasak (emir madde 3).

## Çip durumu · GÖRÜLDÜ

VentHub çipi bağlı, Broadsheet elle ezme bitti. `_ds/venthub-design-system-31b0824c-8d7e-4a4c-94c7-8c094a1c62b7/`
altında gördüğüm: **4 token dosyası** (renk · tipografi · yüzey · kenar) + `styles.css` + `_ds_bundle.js` ·
**6 bileşen** (`AnaEylemDugmesi` · `CerceveliDugme` · `Kart` · `Cip` · `TeknikTablo` · `KabukBandi`) ·
**19 kart** `guidelines/` · **172 varlık** (144 ikon + 28 logo) · `templates/kabuk/` şablonu. Emirdeki sayı
(50 token · 6 bileşen · 19 kart · 172 varlık) ile tuttu; token dosyalarını satır satır saymadım, dosya sayısı
ve bileşen/kart/varlık sayısı birebir.

İki dosyanın `<helmet>`ine dört token dosyası + `styles.css` + bundle eklendi.

**Çip ↔ sözleşme çelişkisi: yok.** Değerler aynı küme (DS kılavuzu da "brand/tokens.css ile aynı değer kümesi"
diyor). Tek fark çipin sözleşmede olmayan bir şey söylemesi, çelişki değil ekleme:
- `--text-on-dark-muted: #8FA2BD` — sözleşme v1.2'ye bu turda eklendi.
- Arama alanı zemini `#24395C`, o zeminde muted 4.45:1 → alan içi beyaz. Sözleşmeye eklendi.
- Kategori ikonlarının koyu bantta `koyu` sürüm gerektirmesi (tamrenk lacivert üstünde 1.31:1). Bu turun
  karelerinde koyu bantta kategori ikonu yok; kural not edildi, v16'da uygulanacak yer çıkmadı.

## Çip BİLEŞENLERİYLE kuruldu (denetim düzeltmesi, aynı tur)

İlk teslimde bundle'ı yükleyip hiçbir şeyi ondan bileşmemiştim: `x-import` 0, `var(--*)` 0, buna karşılık
13 elle çizilmiş lacivert bant ve 73 inline hex. Bundle bir `<script src>` olarak duruyordu. Ayrıca
`templates/kabuk/Kabuk.dc.html` hiç okunmamıştı — bu turun işini birebir yapan hazır şablon. Düzeltildi:

| Ne | Önce | Sonra |
|---|---|---|
| Kabuk bandı | 15 elle çizilmiş `<div background:#1a2b4a>` | **15 `KabukBandi` mount'u** (`rol="header"` / `rol="footer"`) |
| TR/EN çipi | elle çizilmiş kenarlı span | **11 `CerceveliDugme koyu-zemin` mount'u** |
| Renk ve tipografi | inline hex + font adı | **v16'da 609, v10'da 105 dönüşüm** → `hsl(var(--primary-navy))`, `hsl(var(--text-on-dark-muted))`, `var(--font-mono)` … |
| `var(--*)` referansı | 0 | **v16 647 · v10 113** |
| `x-import` | 0 | **v16 24 · v10 6** |

Ölçüm (canlı DOM): bundle `window.VentHubDesignSystem_31b082` altında 6 bileşen veriyor, mount edilen bant
sayısı **15**, ilk bandın hesaplanan değerleri **74 px yükseklik · 40 px oluk · 30 px öğe arası** — sayıyı elle
taşımak yerine bileşen veriyor, DS değeri değişince bantlar birlikte değişir. `CerceveliDugme` 9 düğme,
44 px, koyu zeminde beyaz kenar. `--text-on-dark-muted` tarayıcıda `215 26% 65%` olarak çözülüyor.

**Logo yolu:** bağlı `_ds` kopyası yalnız `tokens/` + `styles.css` + `_ds_bundle.js` taşıyor, `assets/` yok.
Bu yüzden emir #1'in türev kopya kuralı geçerli kaldı: `logo-src` `brand/logo/` altındaki damgalı kopyayı
gösteriyor. Çip assets verseydi referans verilecekti (emir #2).

## `x-import` style tuzağı (ikinci denetim düzeltmesi)

Bileşenleri mount ettikten sonra yerleşimi `<x-import … style="flex-direction:column">` ile geçirmeye çalıştım.
**Çalışmıyor:** DC'de mount'un `style` niteliği mount sarmalayıcısına uygulanır, bileşene prop olarak geçmez;
sarmalayıcı `display:contents` olduğu için etki sıfır ve `KabukBandi`'nin kendi style objesi kazanıyor. Üç yer
sessizce bozulmuştu:

| Yer | Bozukluk | Düzeltme |
|---|---|---|
| Mobil ana sayfa header'ı | iki satır tek satıra düştü, tam genişlik arama alanı 173 px'e sıkıştı | mount içine tek sarmalayıcı çocuk (sütun, `gap:11px`, `width:100%`) |
| İki footer | sütun yerine satır; hukuki satır ızgaranın yanına dizildi | aynı yöntem, `gap:32px` / mobilde `24px` |
| Masaüstü bandı | `flex-wrap` kayboldu (924 px'te sağ blok kırpılması geri gelmişti) | sarma davranışı sarmalayıcı çocukta |

`CerceveliDugme` mount'larındaki `style` de aynı sebeple düşüyordu (TR/EN mono yerine Archivo çiziliyordu);
mono biçim düğmenin çocuk `<span>`ına taşındı.

**Çalışan yol:** `oluk` / `aralik` / `yukseklik` propları bileşene geçiyor (ölçümde 18 px ve 60 px doğru geldi);
yerleşim ise **mount'un içine tek sarmalayıcı çocuk** olarak yazılır. Bileşen mount'u korunur, DS bileşimi bozulmaz.

Düzeltme sonrası ölçüm: mobil header sarmalayıcısı **column**, arama alanı **354 px** (tam genişlik) ·
iki footer da **column** · masaüstü bandı 74 px · oluk 40 px · sarmalayıcı `flex-wrap: wrap` ·
TR/EN düğmesi 44 px ve IBM Plex Mono · kırık görsel 0.

## Üçüncü düzeltme · kabuk kareler arasında tutmuyordu (Recep gözlemi)

Recep haklıydı: "v16'da iki tarafta da İletişim var", "mobil karman çurman", "ana sayfaya bakıyorum başka,
buraya bakıyorum başka". Ölçüm üç kusur gösterdi:

| Kusur | Ölçüm | Sebep |
|---|---|---|
| Masaüstü nav'da **ve** header sağında İletişim | 13 bandın **6'sında iki kez** (01 · 04 · 06 · 07c · 10 ve eşleri); 12 · 58 · B4 doğruydu | K19 dönüşümünü kalıp eşleşmesiyle yaptım; nav'dan çıkarma yalnız bazı karelerde tuttu |
| v16 kare 01'in mobil header'ı eski | logo + tek hesap simgesi (v15 hâli); TR/EN çipi, bildirim rozeti ve İletişim **yok** | v10'un mobil header'ını yeniledim, v16'nın aynı ekranını atlamışım |
| İki dosyanın aynı ekranı farklı | ana sayfa (v10) yeni kabuk, menü (v16) kare 01 eski kabuk | Tek kaynak yok; her dosyada ayrı ayrı kalıp değiştirdim |

**Kök neden:** kabuğu iki dosyada, kare kare, metin kalıbı eşleştirerek değiştirdim. Kalıplar kareler arasında
birebir aynı olmadığı için bazı kareler dönüştü, bazıları eski kaldı ve kimse fark etmedi — dosya toplamında
sayı doğru görünüyordu.

**Düzeltme:** nav'daki İletişim beş kareden kaldırıldı; v16 kare 01'in mobil header'ı **v10'daki satırın birebir
kopyası** yapıldı (artık iki dosya aynı kaynağı taşıyor).

**Ölçülen son hâl:** 13 bandın hepsinde İletişim **tam bir kez** (header sağında) · v16 kare 01 ile v10 mobil
logo satırı birebir aynı dört öğe (logo · TR/EN · bildirim · İletişim) · alt çubuk dört sekme
(Ana sayfa · Ürünler · Teklif · Hesap) · kırık görsel 0.

**Kontrol listesine 10. madde:** *kabuk öğeleri kare kare değil, kanonik blok olarak değiştirilir; teslim öncesi
her bandın öğe listesi tek tek ölçülür ve iki dosya karşılaştırılır.* Recep'in tek tek bulması beklenmez.

## v17 + v11 · emir #4 uygulandı (2026-09-05)

**Kapsam değişti:** 8 temsilî kare yetmedi (Recep: "ana sayfa ile menü birbirini tutmuyor"). Bu turda v15'in
**26 karesinin tamamı** yeni kabukla v17'ye taşındı, üstüne B4 eklendi → **27 kare**. Ana sayfa v11 ile birebir.

### İki dosyanın ölçüm tablosu (emir #4 madde 4)

| Ölçüt | v17 (menü) | v11 (ana sayfa) | Hüküm |
|---|---|---|---|
| Kare sayısı | **27** | 1 + 2 (masaüstü + mobil) | v15'in 26 karesi + B4 |
| DS `KabukBandi` mount'u | **55 header + 2 footer** | **2 header + 2 footer** | elle çizilmiş bant **0** |
| Elle bant oluğu (`padding:0 40px` kutusu) | **0** | **0** | bandın oluğu bileşenden |
| Bant ölçüsü (canlı) | 74 px · oluk 40 px | 74 px · oluk 40 px | birebir aynı |
| `CerceveliDugme` mount'u | **26** | **2** | TR/EN her bantta bileşen |
| Ham `#1a2b4a` | **0** | **0** | tamamı `hsl(var(--primary-navy))` |
| `var(--…)` token kullanımı | **~4.100** | **207** | çözülmeyen token **0** (17 kullanılan / 51 tanımlı) |
| Masaüstü header'da İletişim | 25 bandın **hepsinde tam 1** (sağda) | **1** (sağda) | nav'da 0 |
| Alt çubuk sekmeleri | 24 çubuğun hepsi **Ana sayfa · Ürünler · Teklif · Hesap** | aynı | K19 |
| K19 niyet grubu satırı | **9** (iki panelde üçer grup) | — (ana sayfada panel yok) | K19 madde 3 |
| "Destek" (sekme/yaprak adı) | **0** | **0** | fiil "Teknik destek iste" korundu |
| `opacity` / `clip-path` | 0 / 0 | 0 / 0 | K22 · K23 |
| Kırık görsel | **0** | **0** | logo `brand/logo/` |
| Bant taşması | **0** | **0** | sarma sarmalayıcı çocukta |


### Yöntem değişikliği · neden bu kez tuttu
v16'da kabuğu kare kare, metin kalıbı eşleştirerek değiştirmiştim; kalıplar kareler arasında birebir aynı
olmadığı için bazısı dönüştü bazısı kaldı. v17'de **yapısal** yola geçtim: bant açıcısını bul → dengeli kapanışını
bul → mount'a çevir; sonra logo bloğunu, nav öğesini, arama alanını, sağ bloğu **ayrı ayrı** dönüştür. Varyasyon
(sayaç değeri, aktif hâl) artık dönüşümü engellemiyor. Sayılar: 25 masaüstü + 30 mobil bant, hepsi tek geçişte.

### OPS'un ölçümü bayat kopyadanmış
Emir #4'ün tablosunda "v16'da `KabukBandi` **0**" yazıyor; benim dosyamda o an **15** mount vardı (bileşen
benimseme düzeltmesi aynı gün, emirden önce yapılmıştı). `padding:0 40px` 5 ve ham `#1a2b4a` 14 sayıları da
düzeltme öncesi hâle ait. Kalan gerçek eksikler (niyet satırları 0, "Destek" 4, kapsam) doğruydu ve yapıldı.

### DS'te olmayan beş token · bulgu
Dönüşüm sırasında beş token adı uydurdum, hiçbiri DS'te yok: `--surface-subtle` · `--border-strong` ·
`--border-card` · `--text-faint` · `--text-placeholder`. Geri aldım (çözülmeyen token 0). Ama bu bir **DS
boşluğu**: sözleşme 15 nötr ölçmüş, DS yalnız 4 yüzey + 1 kenar tokeni veriyor. Tokensiz kalan ve dosyada hex
olarak duran ölçülmüş nötrler: **#8A8F94** (313 kullanım · soluk metin) · **#B9BCC0** (167 · yer tutucu) ·
**#D8D8D4** (325 · düğme/giriş kenarı) · **#FBFBF9** (62 · ikincil zemin). Marka'dan istenmeli.

### Bir renk birleşti · kayda geçiyor
`#3F4A5A` (36 kullanım, Source Serif gövde tonu) token dönüşümünde `--text-body` (#4A5568) ile birleşti.
Sözleşmenin "baskın değer token, tek kullanım varyant" kuralına uyuyor ama **ölçülen bir değer değişti** —
sessiz geçmesin diye yazıyorum. İstenirse ayrı token (`--text-editorial`) olarak Marka'dan istenir.

## Mobil kabuk M1–M9 · emir #5 (2026-09-05)

Recep: "mobil menü yarım mı kaldı, o kadar konuştuk." Doğruydu: v16/v17'de kabuk **iskeleti** vardı
(4 sekme · Hesap · İletişim simgesi · TR/EN · Teklif (n) · arama alt satır · 44 px), **içi yoktu**.
Dokuz kare 390 olarak çizildi, hepsi `data-screen-label="M1-M9"` bölümünde, her karenin altyazısında
dayandığı karar yazılı.

| # | Kare | Çizildi | Ölçüldü |
|---|---|---|---|
| **M1** | İletişim alt paneli · üç niyet grubu | ✔ ekran 12'de (bu turda yeniden yazıldı) | niyet grubu başlığı 9 · "Destek" 0 · bağlam satırı var |
| **M2** | Ürünler sekmesi bir **sayfa** (örtü değil) | ✔ | 7 kategori satırı (dokunuş + 44 px artı ayrı hedef) · 8 senaryo · **Ürün Seçici** satırı · Teklif düğmesi **0** · koşullu "Son baktıklarınız" 3 çip |
| **M3** | Hesap sekmesi **iki hâl** | ✔ girişsiz + girişli | girişsiz: tek kiremit "Giriş yap" + kilitli iki satır + dil · girişli: kimlik + 2 sayı kutusu + 4 grup · "Siparişlerim" girişsizde **yok**, girişlide KAPALI BEKLER |
| **M4** | İç sayfa üst şeridi "‹ geri · başlık · arama" | ✔ dört bağlam (kategori · liste · PDP · teklif listesi) | 3 öğe · 44 px · başlık taşarsa üç nokta, arama düşmüyor |
| **M5** | Girişli ana sayfa kısayol şeridi | ✔ | selamlama + 4 yatay kısayol · turkuaz kare yalnız yanıt bekleyende · girişsizde şerit **yok** |
| **M6** | Teklif sekmesi sayfası + **kapalı Sepet hâli** | ✔ iki kare yan yana | teklif kipi: tek kiremit, toplam tutar **yok** · satış kipi: Sepet başlığı, ara toplam/KDV satırı, KAPALI BEKLER rozeti, 4. sekme İletişim |
| **M7** | PDP mobil yapışık çubuk + **"soru sor"** | ✔ | çubuk 3 öğe: kiremit + 46 px soru sor + 46 px teklif listesi · katlı panel kapalı 44 px · tablo 4 satır ilk ekranda |
| **M8** | Bildirim rozeti **girişli** | ✔ iki header yan yana | girişsizde simge **yok** · girişlide TR/EN ile İletişim arasında · sayı yazmıyor |
| **M9** | Geri dönüş hâli, tek kare | ✔ | İletişim 4. sekme · Hesap header'da (turkuaz çerçeveli) · ölçüt yazılı |

**Teslim öncesi ölçüm:** 28 kare · şablon dışında kare **0** · ham `x-import` **0** · 73 bant (hepsi `KabukBandi`) ·
M bölümünde 14 bant + 7 `CerceveliDugme` · kırık görsel **0** · 390 çerçevesinde taşma **0**.

**Ölçümde çıkan iki ihlal, düzeltildi:** M6'nın adet kontrolü 36 px'ti (− / + / sayı hücresi → **44 px**) ve
"Not ekle" ince turkuaz metin bağlantısıydı (**S2 ihlali**) → çerçeveli 44 px düğme. Dördü de dört kalemde.

## Açık zemin kontrast ölçümü (denetim bulgusu, aynı tur)

**Kendi hatam:** K22 aynı gün koyu zeminde 11 px küçük metni ölçüp `--text-on-dark-muted` tokenini doğurdu;
**açık zemini hiç ölçmedim.** Aynı 11 px, aynı hata, öbür tarafta. Ölçtüm (WCAG AA · 4,5:1 metin, 3:1 metin dışı):

| Ton | beyaz | sayfa #F4F4F2 | ikincil #FBFBF9 | gömülü #EEEEEA |
|---|---|---|---|---|
| `#8A8F94` (soluk metin, 500 kullanım) | **3,26** | **2,96** | **3,15** | **2,80** |
| `#B9BCC0` (yer tutucu ve "›", 265) | **1,91** | **1,73** | **1,84** | **1,64** |
| `#6B7280` = `--text-muted` | 4,83 ✔ | **4,39** | 4,67 ✔ | **4,16** |
| `#4A5568` = `--text-body` | 7,53 ✔ | 6,83 ✔ | 7,26 ✔ | 6,47 ✔ |
| `#0088B0` = `--brand-cyan` | **4,02** | **3,70** | **3,94** | **3,51** |

**Düzeltilen (765 dönüşüm iki dosyada):**
- `#8A8F94` ve `#B9BCC0` → `--text-muted`. En önemlisi **alt çubuğun 99 sekme etiketi** (11 px, beyaz kart
  üstünde): 3,26 → **4,83** ✔. K19'un yeni dörtlü sekmesi mobil gezinmenin birincil yüzeyi; orada kalması olmazdı.
- Sayfa zemininde duran küçük metin (kare altyazıları, eyebrow, adres etiketi, breadcrumb ayırıcısı) →
  `--text-body`: 4,35–4,39 → **6,83** ✔. 434 dönüşüm.

**Sürpriz bulgu:** `--text-muted` **beyazda 4,83 ama sayfa zemininde 4,39** — DS'in kendi soluk tonu açık
sayfa zemininde AA'yı geçmiyor. Bu yüzden kart içi metin `--text-muted`, sayfa zeminindeki metin
`--text-body` oldu; ikisi arasındaki hiyerarşiyi artık **boy ve ağırlık** taşıyor, üçüncü bir gri değil.

**Marka kararı bekleyen dört eşleşme — ÇİZİMDE DEĞİŞTİRİLMEDİ** (hepsi DS tokeni; tek başıma değiştirmem
tokeni bozar):

| Eşleşme | Kontrast | Nerede | Kullanım |
|---|---|---|---|
| beyaz / `--brand-cyan` @10,5–11,5 px | **4,02** | header'daki Teklif sayacı "3" | 59 |
| `--brand-cyan` / açık zemin @11 px | **3,61 / 3,88 / 4,02** | mono bölüm etiketi ("Debi · m³/h") | 72 |
| `--brand-cyan` / `--primary-navy` @9 px | **3,47** | nav'daki "▼" | 27 |
| `--action-terracotta` / sayfa @12 px | **3,52** | kare etiketi ("EKRAN 01") | 28 |

Son satır **ürün arayüzü değil**, artboard açıklama katmanı — yine de sayıyla yazıldı.

**Önceki "DS token boşluğu" bulgum yarımdı.** `#8A8F94` · `#B9BCC0` · `#D8D8D4` · `#FBFBF9` için "token
ver" demişim; doğrusu **"kontrast düzeltilmiş token ver"**. İkisi kullanıldıkları boyda AA'yı geçmiyor;
Marka bu değerleri olduğu gibi tokene çevirirse hata DS'e kalıcı girer.

**Kontrol listesine 12. madde:** her teslimde **açık zemin küçük metni de** koyu zeminle aynı disiplinle
ölçülür — renk/zemin/boy üçlüsü tek tek, toplam sayı değil.

## Arama alanı düzeltmesi · üçüncü kez aynı sınıf hata (denetim, aynı tur)

**Kök neden tek cümle:** arama alanını tek literal kalıpla dönüştürdüm, kaynakta ise **üç genişlik varyantı**
vardı (408 masaüstü · 409 · 354 mobil ve iç sayfa) — yalnız birebir eşleşen 5'i döndü, **16'sı Kabuk v2 öncesi
hâlde kaldı**. Kullanıcının iki kez yakaladığı hatanın aynı sınıfı: literal eşleştirme varyantı atlıyor.

Kalan 16 alanda üç ihlal birlikteydi:
1. **Emrin K22 eki uygulanmamış:** zemin `rgba(255,255,255,0.07)`, metin `--text-on-dark-muted` — oysa kural
   "zemin `#24395C`, metin **beyaz**". Notlarımda ve Linear yorumumda "teslim edildi" yazıyordu; yanlıştı.
2. **K22 "alfa yok" ihlali:** `background: rgba(255,255,255,0.07)` bir alfa zemini. K22 uyumunu `opacity:` ve
   `clip-path` sayısıyla ölçüyordum (ikisi de 0) — o metrik `background` içindeki `rgba()`'yı **yakalamıyor**.
3. **Kontrast:** `#8FA2BD`, %7 beyazın lacivertle karışmasıyla oluşan gerçek zemine (`rgb(42,58,87)`) karşı
   **4,38:1** — eşiğin altında. `--text-on-dark-muted` düz lacivertte 5,42 verdiği için "koyu zemin tamam"
   varsayımım bu alanlarda geçersizdi.

**Düzeltme yapısal yapıldı:** arama alanını biçiminden değil **metninden** buldum ("Model kodu veya ürün adı"),
her birinin kendi kutusuna gidip zemini `#24395C`, içindeki metni ve simgeyi beyaz yaptım, alfa kenarı kaldırdım;
kabı çökmüş 13 alana `width:100%;box-sizing:border-box` verdim. 27 dönüşüm, iki dosya.

**Ölçülen son hâl:** "Model kodu" taşıyan **37 alanın hepsi** `rgb(36,57,92)` + beyaz metin (22× 408 px ·
13× 354 px · 2× 409 px). Beyaz / `#24395C` ≈ **6,9:1** ✔. Kalan 6 şeffaf kutu **sarmalayıcı**, her birinin
içinde kanonik alan duruyor — kusur değil.

**Kalan alfa: 7 × `rgba(26,43,74,0.45)`** — yaprak/örtü karelerinin perdesi (02 · 03 · 06 · 12 · 52).
Bu kasıtlı: perdenin arkasında kısılmış gerçek kabuk görünüyor (mobil kare denetimi, 09-04). K22'nin "alfa yok"
kuralı **metin ve token renkleri** için; örtü perdesi istisna ve gerekçesi burada yazılı.

**Kontrol listesine 13. madde:** K22 denetimi `opacity` ve `clip-path` ile yetinmez, **`background` içindeki
`rgba(` da sayılır**; bilinen tek istisna örtü perdesi.

## Kontrast turu 2 · görünmez metin ve atladığım en kritik eşleşme (denetim, aynı tur)

### Kusur 1 · beyaz üstüne beyaz metin — 5 kullanım, görünmez
**Kök neden:** kare 08c'nin arama öneri paneli koyu bandın **içine** yazılmıştı ve kendi metin rengini
taşımıyordu; rengi banttan kalıtımla alıyordu. `KabukBandi` bileşeni bandın rengini
`--text-on-dark` yapıyor, panel ise `position:absolute` ile **beyaz zemine** biniyor → beyaz-üstüne-beyaz,
**1:1 kontrast**, metin tamamen görünmez ("SEAT 30 Polipropilen Radyal Fan", "SEAT 30 ATEX Versiyon",
`SEAT-30-PP`).
**Düzeltme (tek karar):** koyu bandın içinde açık zeminli katman kendi metin rengini taşır —
`color:hsl(var(--text-strong))`. İki panele uygulandı.
**Ders:** bileşen mount'u renk **kalıtımı** getirir; bandın içine açık bir katman koyduğunda o katman rengini
kendisi söylemeli. Elle çizilmiş bantta da aynı tuzak vardı, bileşene geçince görünür oldu.

### Kusur 2 · atladığım en kritik eşleşme: kiremit düğme
Beyaz / `--action-terracotta` (#D95D0E) = **3,87:1**, **30 kullanım**, hiçbiri WCAG büyük-metin muafiyetinde
değil (14–16 px, ağırlık **600** — muafiyet ≥18,66 px ya da ≥14 px **ve ≥700**). Etiketler tasarımın
**sayfa başına tek ana eylemi**: "Bu model için teklif iste" · "Teklif talebini gönder" · "Projeniz için teklif
iste" · "Teknik destek iste" · "Hesapla" · "Projeyi oluştur".

**Kendi betiğim bu turda `beyaz / #d95d0e → 3.8` yazdırdı** ve ben Marka'ya dört eşleşme gönderirken
**setin en yüksek bahisli, en kötü kontrastlı üyesini atladım.** Notlarda, Linear'da ve REC-152'de tek satır
geçmiyordu. Diğerleri gibi bu da çizimde tek başıma değiştirilmez (DS tokeni); **Marka kararı** olarak yazıldı:
ya kiremit koyulaşır (beyaz metnin 4,5:1'i için ≈#B34A0B) ya da düğme etiketi 700 ağırlığa / ≥18,66 px'e çıkar.

### Kusur 3 · 11 px etiket, kendi yeni kodumda
`--text-muted` / sayfa zemini @**11 px** = **4,39**. M1–M9 bölümünde yazdığım `bas()` yardımcısının üçüncü
alanı (9 etiket: "K19 madde 2-3 · ekran 12" gibi). Dönüşüm listem 11,5–13 px'i kapsıyordu, **11 px'i
kapsamıyordu** — yani "sayfa zeminindeki küçük metin → `--text-body`" kuralımı kendi yeni kodum ihlal etti.

**Düzeltme boy listesi yerine KURAL oldu:** `--text-muted` taşıyan her stil, boyu 16 px'in altındaysa ya da
boyu kalıtımla geliyorsa → `--text-body`. Tek istisna: **mono olmayan 11 px** (alt çubuk sekme etiketleri,
beyaz kart üstünde **4,83** ✔). 411 dönüşüm iki dosyada.

### Kendi semantik tonlarım da AA'ya çekildi (DS tokeni değil, benim)
`#4C8BA1` → `#2C6B82` (bilgi kutusu, 3,36 → 5,1) · `#B4761F` → `#8A5A13` (SINIRDA, 3,38 → 5,3) ·
`#2E7D4F` → `#256540` (YETERLİ, 4,49 → 6,0 — 4,49 bir yüzde birle kalıyordu). 27 dönüşüm.

### Ölçülen son hâl
**Benim tarafımda kalan ihlal: 0.** Kalan 298 kullanımın tamamı marka renk eşleşmesi (turkuaz ve kiremit),
hepsi DS tokeni, hepsi Marka kararı olarak REC-152'de:

| Eşleşme | Kontrast | Kullanım |
|---|---|---|
| beyaz / `--action-terracotta` @14–16 px / 600 | **3,87** | **30** ← bu turda eklendi |
| beyaz / `--brand-cyan` @10,5–11,5 px | **4,02** | 59 |
| `--brand-cyan` / açık zemin @9–16 px | **3,61 · 3,88 · 4,02** | ~110 |
| `--brand-cyan` / `--primary-navy` @9–11 px | **3,47** | 32 |
| `--action-terracotta` / sayfa @9,5–12 px | **2,98 · 3,52** | 40 |

**Kontrol listesine 14. madde:** kontrast denetimi **iki kümeye ayrılır** — "benim düzelteceğim" (DS tokeni
olmayan her renk) ve "Marka kararı" (DS tokeni eşleşmeleri). İkinci küme **eksiksiz** yazılır; bir üyesini
atlamak (kiremit düğme) raporu geçersiz kılar.

## Emir #6 · #7 · #8 uygulandı (2026-09-06)

### #6 · Tek dosya
`Venthub Ana Sayfa v11` ayrı dosya olmaktan çıktı → v17'nin **`02-ana`** karesi (masaüstü + 390 eşi, kendi
başlık satırıyla). Dosya `ARSIV Venthub Ana Sayfa v11.dc.html` olarak arşivde, silinmedi. Hikâye akışı ve
Ürün Seçici zaten v17'de kare olarak duruyor (B4 iki alternatifle). **Recep tek dosyada geziyor;** prototip de
bu dosyadan türeyecek.
**Etiket çakışması notu:** emir "02 karesi" diyor ama `02` zaten menü panelinde. Görünen etiketi
"EKRAN 02 · ANA SAYFA" yaptım, DOM etiketi `02-ana` — çakışma yok, numaralandırma bozulmadı.
Yeniden numaralandırma istenirse tek turda yapılır (27 karede kaskad).

### #7 · Soluk işaret dosyadan (K23-b)
Marka'nın iki dosyası DS'ten türev kopyayla alındı: `venthub-isaret-soluk.svg` (#7A8290, açık zemin) ·
`venthub-isaret-soluk-koyu.svg` (#8FA2BD, koyu zemin) → `brand/logo/`, kaynak DS `assets/logo/`, kopya
**2026-09-06**. Alt çubuğun seçilmemiş Ürünler sekmesi artık dosyadan geliyor.
**Ölçüm: `filter` kullanımı 0** (13 + 1 = 14 dönüşüm). Ayrıca marka logolarındaki `grayscale(1);opacity:0.5`
da kalktı (10 kullanım) — GB1 madde 7 "gri-ton yok" ve K22 alfa yasağı gereği; **`opacity` de 0**.

### #8 · Satış kipi S1–S6 · "kapalı bekler"
Altı kare çizildi, hepsi `NEXT_PUBLIC_ODEME_ACIK` etiketiyle. Alan adları **canlı şemadan** doğrulandı
(`venthub_orders` 39 kolon · `venthub_order_items` 22 · `order_invoices` 8 · `user_invoice_profiles` 17 ·
`venthub_returns` 15); uydurma alan yok, her karede alan adları altyazıda.

| # | Kare | Karar izi |
|---|---|---|
| **S1** | Sepet — Teklif sekmesinin satış hâli, aynı yuva | Kargoda sabit "Ücretsiz" **yazmıyor** (REC-47) → "teslimatta bildirilir". Tek kiremit "Ödemeye geç". "Sepeti teklif listesine çevir" ile iki kip arası geçiş |
| **S2** | Ödeme — dört adım tek sayfa | Kurumsal/bireysel fatura anahtarı · İyzico **iframe yuvası** (VentHub kart verisi tutmaz) · iki yasal onay kutusu işaretlenmeden ana eylem etkin değil |
| **S3** | Sipariş onayı | Sipariş no sayfanın en büyük öğesi (`2026-000318`, 29 px mono) · "Bundan sonra" üç adım · **kiremit yok** (sayfanın işi bitti) |
| **S4** | Siparişlerim + takip | Hesap → "Sipariş & Kargo" (K19 madde 5) · **kargo takip no 27 px, ekranın en büyük öğesi** · durum çizgisi dört aşama |
| **S5** | İade talebi + durum | Kalem seçimi adetli · hasarda **fotoğraf zorunlu** · durum çizgisi tweak olarak aynı karede · "ürün elden çıkmadan tutar işlenmez" yazılı |
| **S6** | Header + alt çubuk satış hâli | İki kip yan yana; tek fark sağdaki öğe (`Teklif (n)` → `Sepet (n)`) ve üçüncü sekmenin adı. Anahtar açıldığında **birlikte dönen beş şey** karede yazılı |

### Ölçülen son hâl (tek dosya)
**30 kare** · şablon dışında kare **0** · ham `x-import` **0** · 83 bandın hepsi `KabukBandi` ·
`filter` **0** · `opacity` **0** · kırık görsel **0** · bantsız tek kare **13** (şablon parçası, gerekçeli).
Dosya **830 KB**.

**Kalan uyarı:** bu boyutta ekran görüntüsü rasterleştirmesi düşüyor (render sağlam, `eval_js` sorunsuz).
Prototipin ayrı dosya olması bu yüzden de doğru — emir #3'teki plan geçerli.

## Denetim düzeltmesi · S1–S5'in 390 eşleri + hero arama alanı (2026-09-06)

### Kusur 1 · emrin "masaüstü + 390 eşi" şartı yarım kalmıştı
Emir #8 başlığı "**(masaüstü + 390 eşi)**" diyordu; ilk teslimde 390 karşılığı yalnız S6'daydı (o da ekranın
mobil hâli değil, iki kipin alt çubuk karşılaştırması). **S1 · S2 · S3 · S4 · S5'in mobil karesi yoktu** —
Recep'in M1–M9 turunu doğuran şikâyetinin ("mobil menü yarım mı kaldı") aynısı, üstelik S6'nın altyazısı mobil
alt çubuğun üçüncü sekmesinin Sepet olmasını anlatıyordu: **mobil satış kabuğu yarı tanımlıydı, gittiği
sayfalar yoktu.**

Beş kare çizildi, hepsi M4 üst şeridi (‹ geri · başlık · arama) + dört sekmeli satış alt çubuğuyla:

| Kare | Mobil kompozisyonda değişen |
|---|---|
| **S1m** Sepet | Kalem kartı dikey: foto + ad + adet kontrolü (44 px) + satır toplamı; özet blok hâlinde; yapışkan tek kiremit |
| **S2m** Ödeme | Dört adım **yatay ilerleme çizgisi** oldu (masaüstünde numaralı satır); alanlar tek kolon; yasal onaylar tam görünür |
| **S3m** Sipariş onayı | Sipariş no 27 px (masaüstü 29); "Bundan sonra" üç adım tek kolon; iki çerçeveli çıkış |
| **S4m** Siparişlerim | Tekil sipariş **önce**, geçmiş liste altta (masaüstünde yan yana); kargo takip no 25 px, hâlâ ekranın en büyük öğesi |
| **S5m** İade | Kalem seçimi ve sebep tek kolon; fotoğraf kutuları 96 px; durum çizgisi aynı karede |

### Kusur 2 · hero arama alanı 1,54:1 — aynı sınıf hata dördüncü kez
`02-ana` karesindeki iki arama alanı **1,54:1** kontrastla okunmuyordu: zemin `#24395C` (koyu bant zemini),
metin `--text-body`, kenar `#d8d8d4` (açık yüzey giriş kenarı) — **içsel olarak tutarsız bir kutu.**

**Kök neden:** arama alanı kanonikleştirme taramam kutuyu **metninden** buldu ("Model kodu" geçen ve
`background` taşıyan her kutu), **"koyu bandın soyundan mı" koşuluyla sınırlamadı** — ana sayfanın gövdedeki
hero arama alanına da koyu bant zeminini verdi.

**Düzeltme:** imzadan tanıdım (aynı stilde `#24395C` zemin **ve** `solid #d8d8d4` açık-yüzey kenarı) ve o iki
kutuyu açık yüzeye döndürdüm — `--surface-card` zemin, kenar ve metin olduğu gibi. Hero gövdede, bantta değil.

**Kontrol listesine 15. madde:** kabuk öğesi taraması **DOM konumuyla** sınırlanır (`closest('header')` ya da
hesaplanan ata zemini), metin eşleşmesiyle değil. Metinle bulmak öğeyi bulur, **bağlamını bulmaz.**

### Ölçülen son hâl
30 kare · S1–S5 **1440 + 390 çifti** (6× 1440 · 7× 390) · ham `x-import` **0** · 88 bant hepsi `KabukBandi` ·
kırık görsel **0** · **benim tarafımda kontrast ihlali 0** · dosya 878 KB.

## "29 kare mi 26 mı" — sayım farkının cevabı (OPS sorusu 1, 2026-09-06)

v15'in masthead'i **"yirmi dokuz kare"** diyor, dosya ise **26 `data-screen-label`** bölümü taşıyor. Kayıp kare
yok; iki sayım farklı şeyi sayıyor.

**Fark tam olarak 3 kare, hepsi `52` bölümünün içinde.** O bölüm tek `data-screen-label` altında **dört adlı
kare** taşıyor:

| Bölümdeki adlı kare | Etiketi |
|---|---|
| 52a · ARŞİV — seçilmedi | (bölümün kendi etiketi `52`) |
| 52b · SEÇİLDİ | aynı bölüm |
| 52b · dil çipi varyantı | aynı bölüm |
| **53 · Hesap yaprağı (52b üstünde)** | aynı bölüm |

26 bölüm + bu üç fazladan adlı kare = **29**. Yani masthead adlı kareyi saydı, benim ölçümüm DOM etiketini.
`13` (eylem bloğu) iki kip taşıyor ama tek kare sayılıyor — yan yana karşılaştırma, ayrı ekran değil.

**v17'ye dördü de geçti**, içerik tam: `52` bölümü v17'de aynı dört kareyle duruyor. Sayı beyanım
("26 + B4 = 27") DOM etiketi sayımıydı; adlı kare sayımıyla **29 + B4 = 30**, ki v17'nin bugünkü etiket sayısı
da 30 (`02-ana` ve iki toplu bölüm dahil). İki sayım da doğru, tanımı yazmamıştım — bundan sonra
**"N bölüm / M adlı kare"** diye ikisi birlikte yazılır.

**Kontrol listesine 16. madde:** kare sayısı beyan edilirken sayım tanımı yazılır (DOM etiketi mi, adlı kare mi).

## K24 + K25 uygulandı (emir 09-06 #2)

### K24 · B4 kapandı: Ürün Seçici girişi = header
Kare başlığı "K24: giriş header'da" oldu. **Izgara alternatifi ARŞİV etiketiyle bırakıldı** (kaldırılmadı) —
gerekçe: karar kaydı değeri var, "neden ızgara değil" sorusu iki ay sonra tekrar gelir ve kare cevabı taşıyor.
Mobil karşılığı M2'deki "Ürün Seçici" satırı, zaten çizili.

**Düzeltme (denetim, aynı tur):** ilk yazımda bu cümleyi yazdım ama **etiketi çizmedim** — karede `ARŞİV` ve
`SEÇİLDİ` sıfır kullanımdı, A alternatifi nötr başlığıyla duruyordu; kareye bakan hangisinin kazandığını
göremiyordu. Üç şey eklendi/düzeltildi:
- **A bloğu:** kesikli çerçeve + mono büyük harf `ARŞİV · ÇİZİLMEZ (K24)`, başlığı `--text-body`'ye soldu
  (52 karesindeki `52a · ARSIV — seçilmedi` kalıbıyla aynı dil).
- **B bloğu:** lacivert çerçeveli `SEÇİLDİ · K24`.
- **Bayat meta ve altyazı:** "karar Recep'in" → `K24 · karar kapandı (OPS hükmü: header)`; "Design önerisi B" →
  "Hüküm B (K24)"; "A gerekiyorsa … kabul edilir" → "A çizilmez; ARŞİV etiketiyle karar kaydı olarak duruyor".

**Sınıf:** dört turdur tekrarlayan "yazdığım ile ölçülen ayrışıyor" hatasının aynısı, bu kez çizim değil
**beyan** tarafında — notu ve Linear yorumunu yazdım, kareyi güncellemedim. **Kontrol listesine 17. madde:**
bir kararı notta "uygulandı" diye yazmadan önce **karede ölçülür** (etiket metni var mı, kaç kullanım).

### K25 · dört renk eşleşmesi + ölçüm satırı

| Eşleşme | Hüküm | Uygulanan | Ölçülen |
|---|---|---|---|
| Teklif/Sepet sayacı | metin lacivert (hüküm "≥7:1" varsaydı) | **beyaz kaldı** — hüküm sayısı tutmadı, aşağıda | **4,02** (lacivert 3,47 olurdu) |
| mono bölüm etiketi | `--brand-cyan-ink` gelene kadar `--text-body` | 153 dönüşüm | **7,53** beyazda · 6,83 sayfada |
| koyu bantta "▼" | beyaz, 10 px | 34 dönüşüm | **13,92** |
| artboard kare etiketi | `--text-body` | 52 dönüşüm | **7,53 / 6,83** |

**`--brand-cyan` metin olarak kullanım: 0** (hedef 0 ✔). Zemin ve kenar olarak duruyor: 130 zemin · 3 kenar.
**`--action-terracotta` metin olarak: 0**; zemin 36 (yalnız kiremit düğme, K5 ✔).
Bağlantı hover'ı da turkuazdan çıktı: renk değişmiyor, **alt çizgi** kazanıyor (K25 gereği).

### Hükmün bir sayısı tutmadı — sayaç
Emir "turkuaz üstüne lacivert (≥7:1)" diyor. **Ölçüm: `--primary-navy` / `--brand-cyan` = 3,47:1** — beyazdan
(4,02) *daha kötü*. Uyguladım, ölçtüm, gördüm, **geri aldım**: sayaç beyaz kaldı. Hükmün amacı AA geçmek;
turkuaz zeminde 11 px hiçbir metin rengi 4,5'i geçmiyor. AA isteniyorsa tek yol **zemini lacivert yapmak**
(beyaz/lacivert = 13,92), ki o da turkuaz sayaç imzasını bitirir. Karar OPS'ta; çizimde bugünkü en iyi hâl duruyor.

### Üç kendi hatam, aynı sınıf — ve nihayet doğru yöntem
1. Değiştirme değerlerim `color:` önekini taşımıyordu, eşleşen kalıp taşıyordu → **205 bildirim özellik adını
   kaybetti** (geçersiz CSS). Ölçümde yakalandı, onarıldı.
2. Turkuaz metni çevirirken zemini öğenin **kendi stilinden** tahmin ettim → koyu banttaki 25 öğe açık-zemin
   rengine döndü (1,85:1). **Bant bölgesine göre** yeniden yapıldı.
3. Bant bölgesi taramasının "açık katman" muafiyeti iki bildirimin **yan yana** olmasını arıyordu; 08c öneri
   panelinde ayrıklar → 12 öğe koyu-bant tonunu beyaz zeminde aldı (2,6:1). Panel kalıplarıyla düzeltildi.

**Ölçülen son hâl: benim tarafımda kontrast ihlali 0.** Kalan 105 kullanım marka eşleşmesi — beyaz/turkuaz
sayaç **4,02** (72) ve beyaz/kiremit düğme **3,87** (33); ikisi de REC-152'de, çizimde değiştirilmedi.
30 kare · ham `x-import` 0 · kırık görsel 0.

## K25-b uygulandı — Marka iki token yayınladı, bekleyen soru kapandı (2026-09-06)

DS `tokens/renk.css` iki yeni token taşıyor, ikisi de çalışma zamanında çözülüyor:
- **`--brand-cyan-ink`** `#00708F` — "turkuaz MÜREKKEP: küçük metin, bağlantı ve **sayaç/rozet zemini**"
  · beyazda **5,65** · #F4F4F2'de **5,13**
- **`--action-terracotta-deep`** `#BF5309` — "**dolu kiremit düğme zemini**" · beyaz metinle **4,71**
- `--action-terracotta`'nın kendi yorumu güncellendi: "beyaz metinle 3,87 — **metin zemini değil**"

**Bekleyen sorum cevaplandı ve cevabım yanlıştı.** Son yorumumda "turkuaz zeminde 11 px hiçbir metin rengi
4,5'i geçmiyor; AA isteniyorsa zemin lacivert olmalı ama o turkuaz imzayı bitirir" demiştim. Marka'nın cevabı
üçüncü yol: **turkuazı koyulaştır, terk etme.** Rozet marka imzasını koruyor ve AA geçiyor.

| Düzeltme | Sayı | Ölçülen |
|---|---|---|
| Dolu kiremit düğme zemini → `-deep` | **36** | beyaz metinle 3,87 → **4,71** ✓ |
| Sayaç/rozet zemini → `-ink` (beyaz metin taşıyanlar) | **73** | 4,02 → **5,65** ✓ |
| Mono bölüm etiketi → `-ink` (geçici `--text-body`'den) | **178** | beyazda **5,65** · sayfada **5,13** ✓ |

**Kendi tutarsızlığım:** `AnaEylemDugmesi` DS mount'u 6 yerde `-deep` zeminini zaten render ediyordu, yanındaki
**32 elle yazılmış kiremit düğme** düz `--action-terracotta` üstündeydi — aynı dosyada aynı düğmenin iki
kontrastı. Bileşen doğruyu yapıyordu, elle yazdığım kardeşi yapmıyordu.

**Ölçülen son hâl:** `--brand-cyan` metin olarak **0** · `--action-terracotta` metin olarak **0** ve
**zemin olarak da 0** (36'sı `-deep`'e geçti) · `-ink` 251 kullanım · `-deep` 36.
Kalan 57 `--brand-cyan` zemin **metin taşımıyor** (bildirim noktası, ilerleme ve durum çizgileri) — metin dışı
grafik, 3:1 eşiğini 4,02 ile geçiyor, dokunulmadı.

**Marka kılavuzunun turkuaz imzası geri geldi:** "bölüm etiketi, bağlantı, aktif sekme alt çizgisi" satırı
178 etiketle yeniden yürürlükte; geçici `--text-body` nötrleştirmesi bitti.

### REC-152 güncellendi — beş maddeden ikisi kaldı
| Eşleşme | Durum |
|---|---|
| beyaz / kiremit düğme 3,87 | ✅ **KAPANDI** — `-deep` 4,71 |
| beyaz / turkuaz sayaç 4,02 | ✅ **KAPANDI** — `-ink` 5,65 |
| turkuaz / açık zemin mono etiket 3,61–4,02 | ✅ **KAPANDI** — `-ink` 5,65 / 5,13 |
| turkuaz / lacivert "▼" 3,47 | ✅ kapandı (K25, beyaz 10 px = 13,92) |
| kiremit / sayfa artboard etiketi 3,52 | ✅ kapandı (K25, `--text-body`) |

**Beşi de kapandı; açık madde yok.** Üçü Marka'nın yayınladığı tokenle, ikisi K25 hükmüyle.

**Kontrol listesine 17. madde:** DS token dosyası her turda yeniden okunur — Marka bekleyen soruyu yeni token
yayınlayarak cevaplayabilir ve bu, benim "çözümsüz" beyanımı geçersiz kılar. Ayrıca: bir DS bileşeni doğru
değeri render ediyorsa, yanındaki elle yazılmış kardeşi **aynı değeri taşımak zorundadır** — fark, bileşeni
kullanmadığımın kanıtıdır.

## Emir #5 · bağımsız ölçüm uzlaştırması (2026-09-06)

OPS bağımsız ajana 13 iddiamı saydırdı: **7 tuttu**, 3 tutmadı, 1 ölçülemedi. Dördü de kapandı.

| # | İddiam | Bağımsız ölçüm | Sonuç |
|---|---|---|---|
| 1 | "30 kare" | 31 `section` · 30 etiket (2'si grup) · 28 tekil · başlık "29" diyordu | **Tek tanım tek sayı:** başlık, notlar ve yorum artık **"28 kare + 2 toplu bölüm"** |
| 2 | "opacity 0" | 2 kullanım (`opacity:1`) | Beyanım yanlıştı; ikisi **etkisiz bildirim**di, **kaldırıldı** → ölçüm artık gerçekten 0 |
| 3 | "ARŞİV · ÇİZİLMEZ (K24)" | Büyük harfli hâl yok; `text-transform` render'da büyütüyordu ama **kaynak metin küçük harf**ti | Kaynak büyük harfe çevrildi (DS: "rozetler büyük harf") — kaynak ile render aynı |
| 4 | "83/88 bant" | payda 88 doğru, **83 dosyada yok** | Ölçüt hatası bendeydi: 88'in hepsi `KabukBandi` (`rol="header"` 84 + `rol="footer"` 4), elle bant **0**. Doğru beyan **88/88** |

### Ek: aktif sekme alt çizgisi de tokene döndü
21 yerde `box-shadow:inset 0 -3px 0 #0088b0` ham hex'le yazılmış — marka kılavuzunun "turkuaz: **aktif sekme
alt çizgisi**" satırının ta kendisi. Tokene çevrildi. Marka renklerinin ham kullanımı artık **0**.

### Ham hex beyanı → `ham-hex-beyani-2026-09-06.md`
999 ham hex dört kümeye ayrıldı, ölçüt yazıldı: **ham hex ihlaldir ancak ve ancak DS'te bugün yayınlanmış bir
token karşılığı varsa.** A kümesi (132) **düzeltildi → 0**. Kalan 867: B 676 (**DS ölçtü, token yayınlamadı** —
`#d8d8d4` 426 dahil, DS'in kendi `kenar.css` ölçüm bloğunda adı yazılı ama tokene bağlanmamış) · C 64
(Kabuk v2 eklemeleri, sözleşme v1.2) · D 125 (semantik kutular, DS'in "bilinçli eksik" listesinde).

**"Ham hex 0" teknik olarak imkânsız bir hedef** — doğru beyan **"A kümesi 0"**. Marka üç token yayınlarsa
(`--border-input` · `--border-row` · `--surface-subtle`) B kümesi 676 → 32'ye iner.

**Kontrol listesine 18. madde:** sayı beyanı **ölçütüyle** yazılır; ölçütsüz "0" bağımsız ölçümde çürür.

## Emir #6 · mevcut bileşenlerin mount'u — 1/3 (2026-09-06)

### `TeknikTablo` mount edildi
Kare 07'nin Konuşan teknik tablosu: **8 satır**, elle çizilmiş grid'den `TeknikTablo` mount'una döndü.
Logic class eklendi (dosya template-only idi); `satirlar` dizisi `renderVals()`'tan geliyor, `anlam`
kolonundaki dört vurgu `React.createElement` ile korundu.

**Canlı ölçüm:** 8 satır render ediliyor · ızgara `190/150/1fr` (bileşen varsayılanı) · ilk satır
`ilkSatirVurgulu` ile `--surface-inset` · son satırın alt kenarı **yok** (bileşen kuralı) · vurgular
görünüyor · ham `x-import` **0**.

**Bileşenin değiştirdiği bir şey:** ilk satırın zemini elle çizimde `#E5F3F8` (turkuaz bilgi tonu) idi,
bileşende `--surface-inset`. Bileşen mount etmek bileşenin kuralını kabul etmek demek; değiştirmedim.

**Bedel — açıkça yazıyorum:** `satirlar` bir veri prop'u olduğu için tablo metni artık **editörden
düzenlenemez**. Recep bu dosyada doğrudan düzenleme yapıyor; 8 satırın metni artık logic class'ta.
Bu, "bileşen mount edilir" hükmünün kaçınılmaz sonucu ama sessiz geçmemeli.

### Tablo sınıflandırması — envanterdeki sayı düzeltmesi
Envanterde "matris/teknik tablo **44 kullanım**" yazmıştım; o **imza sayısıydı**. Gerçek tablo sayısı:

| Kalıp | Ölçüm | `TeknikTablo` karşılıyor mu |
|---|---|---|
| A · `190px 150px 1fr` (alan·değer·anlam) | **1 tablo** (kare 07, 8 satır) | ✅ **mount edildi** |
| B · `190px 1fr` + `1fr auto` (alan·değer) | 7 satır | ⚠️ `kolonlar` ile mümkün, `anlam` boş kalır |
| D · karşılaştırma (`230px repeat(3,1fr)`) | 11 satır (kare 11) + 6 mobil | ❌ **transpoze** — satır=alan, kolon=model |

**DS'e varyant isteği (kendim genişletmedim, emir gereği):** karşılaştırma tablosu `TeknikTablo`'nun
veri modeline sığmıyor. Bugünkü model satır başına `{alan, deger, anlam}`; karşılaştırmada bir alanın
**N model için N değeri** var. İstek: `satirlar[].degerler: string[]` + `basliklar: string[]` (model adları)
ya da ayrı bir `KarsilastirmaTablosu`. Karar DS'te.

### Kalan iki bileşen — bu turda yapılmadı, gerekçe
- **`Kart`**: 168 beyaz kart ölçüldü (27'si seçili 2 px). Tek turda güvenli değil — bu turda 20.554
  karakterlik yanlış silme yaşadım (sınır hesabım "Askı ve titreşim" metnini sonraki karede bulmuştu),
  geri aldım ve sınırları tek tek doğrulayarak yeniden yaptım. 168 kartta aynı hatanın maliyeti yüksek.
  Sonraki turda **kare kare**, her sınır doğrulanarak.
- **`Cip`**: faset onay kutusu 13 · bağlam çipi 15 = 28 kullanım. Küçük iş, `Kart` ile aynı turda.

### Denetim düzeltmesi · mount hizalaması + 04/05'in kaçmış mobil şeridi

**Kusur 1 · elle başlık + mount gövde hizasızdı.** `TeknikTablo` mount edildikten sonra başlık satırı elle
çizilmiş kaldı ve iki geometri uyuşmuyordu: başlık `padding:11px 18px` + `gap:16px`, bileşen satırı
`padding:11px 0` + gap yok + hücrede `padding-right:14px`. Kayma tam olarak `18` / `18+16` / `18+2×16` px —
üç kolon etiketi verisinin üstünde durmuyordu. Gövde ayrıca yatay oluğunu kaybetmişti (sol boşluk 1 px).

**Bu, 32 kiremit düğme hatasının aynısı:** bileşen bir şey render ediyor, yanındaki elle yazılmış kardeşi
başka bir şey. Düzeltme bileşenin kuralına uydu (mount'a `style` verilmedi — geçmezdi): başlık ve mount tek
`padding:0 18px` sarmalayıcısına alındı, başlık `padding:11px 0`'a çevrildi, `gap:16px` kalktı, ilk iki
başlık hücresine `padding-right:14px` eklendi.

**Ölçüm:** başlık hücre x `[115, 305, 455]` · ilk veri satırı x `[115, 305, 455]` — **birebir aynı** ·
ızgara ikisinde de `190/150/982.7px` · sol oluk **18 px** · sağ oluk **19 px** (1 px kart kenarı).

**DS'e ikinci istek:** `TeknikTablo`'ya **`basliklar: string[]`** prop'u. Elle çizilmiş başlığın mount'un
üstünde durması yapısal olarak kırılgan — bileşen kuralı değişirse hiza yine kayar. Başlık bileşende
render edilirse bir daha ayrışamaz. (Birinci istek karşılaştırma tablosu varyantı, aynı turda yazıldı.)

**Kusur 2 · 04 ve 05'in mobil şeridi Kabuk v2 dönüşümünde kaçmış** (Recep buldu):
- **04**: K19 öncesi 52b şeridinde kalmış — logo + hesap simgesi vardı, **TR/EN çipi, bildirim rozeti ve
  İletişim yoktu**; bant 106 px. Kanonik K19 şeridine çevrildi (01 ile birebir): **124 px**, TR/EN düğmesi
  bileşen mount'u.
- **05**: M4 kalıbı yerine wordmark taşıyordu — "‹ + logo işareti + VentHub". M4 "‹ geri · **sayfa adı** ·
  arama" diyor; 06 ve 07 doğruydu, 05 kaçmıştı. Çevrildi: **"‹ Korozyon Dayanımlı Fanlar" + arama**,
  oluk 18→12, aralık 14→6 (M4 ile aynı).

Recep'in tarifi ("mobil arayüzü yapılmamış gibi") doğruydu: 04'te şeridin yarısı, 05'te sayfa kimliği yoktu.
Kontrol listesi 15. maddenin (DOM konumuyla tarama) mobil karşılığı: **bant içeriği kare kare doğrulanır**,
bant varlığı yetmez.

### İki DS engeli · `Cip` ve `#24395C` (2026-09-06)

**1 · `--surface-dark-inset` henüz yayınlanmamış.** OPS "`#24395C` → `--surface-dark-inset` çevirisi ve
sayı" dedi; DS `tokens/` dosyalarında o ad **yok** (aradım: `--surface-dark-inset` · `--border-input` ·
`--border-row` · `--surface-subtle` — dördü de yok). Kendi ölçütüm gereği çevirmedim: **uydurma token adı
yazmak çözülmeyen değişkene ve sessiz boya kaybına yol açıyor** (09-05'te bir kez yaptım, geri aldım).
Token yayınlanınca tek geçişte 45 kullanım çevrilir.

**2 · `Cip`'in `baglam` rolü K25'i ihlal ediyor.** Bundle'daki tanım:
```
baglam: { border: '1px solid hsl(var(--brand-cyan))',
          color:  'hsl(var(--brand-cyan))',      ← turkuaz METİN
          background: 'hsl(var(--surface-card))' }
```
K25 "turkuaz metin rengi değil" diyor ve K25-b `--brand-cyan-ink`'i tam bu iş için yayınladı. `--brand-cyan`
beyaz üstünde **4,02:1**; `cipTemel` yazı boyu `--size-body-small` (13,5 px) — AA eşiği 4,5. **Mount etmek
bu turda kapattığım ihlali geri getirir.**

Bu yüzden bağlam çipini (15 kullanım) mount **etmedim**. DS'e üçüncü istek: `Cip`'in `baglam` rolünde
`color` ve `border` → **`--brand-cyan-ink`** (beyazda 5,65 · sayfada 5,13). Tek satır, K25-b'nin doğal devamı.

**Faset onay kutusu `Cip` değil.** Envanterde 13 kullanım saymıştım; ölçünce gördüm ki onlar çip değil
**liste satırı** (19 px onay kutusu + etiket + sayı, tam genişlik, `<button>` değil). `Cip` bir `<button>`
render ediyor ve `inline-flex` — faset satırına uymaz. Envanterdeki "faset/bağlam `Cip` 28 kullanım"
beyanımı düzeltiyorum: **gerçek `Cip` adayı 15** (bağlam çipi), faset satırı ayrı desen.

**Kalan iş:** `Kart` (168, kare kare) sonraki turda; `Cip` DS düzeltmesinden sonra.

### Yerleşim ve bant · sınıf taraması (Recep gözlemi, 2026-09-06)

**Recep'in ekran görüntüsü asıl kusuru gösterdi:** mobil çerçeve masaüstünün **altına** düşüyordu. Benim
"mobil sağda, doğru" ölçümüm 04/05 içindi; sorun **başka 7 karedeydi.**

**Kök neden:** o yedi karenin çerçeve satırı `flex-wrap: wrap` taşıyordu — 1440 + 390 + boşluk kapsayıcıya
sığmayınca mobil alt satıra düşüyor. Diğer karelerde `nowrap`. Etkilenen: **12 · 14 · 04-mod2 · 04-mod3 ·
07e · 13s · S1-S6**. Yedisinde de çerçeve satırından `flex-wrap:wrap` kaldırıldı (kare **içi** wrap'lere
dokunulmadı — başlık satırları ve düğme grupları için doğru).

**Mobil bant sınıf taraması** (aynı turda, Recep'in 04/05 gözleminin sınıfı):
- **B · geri şeridi:** 32 tarandı, **21'inde arama simgesi hiç yoktu** (M4 üç öğe ister: ‹ geri · sayfa adı ·
  arama), 18'inde başlık `flex:1` değildi ("‹SEAT 30" bitişik duruyordu). Düzeltildi.
- **A · logo şeridi:** 15 tarandı, **8'i düzeltildi** (TR/EN bileşen düğmesine çevrildi, bildirim ve İletişim
  eklendi).

**Doğrulama ölçümü — tek ölçütle, ortak ebeveyn koşuluyla:**
`29 çerçeve çifti ölçüldü · alta düşen 0 · üst üste binen 0` · bant: **A ✓ 12 · B ✓ 29 · B eksik 0** ·
ham `x-import` 0 · kırık görsel 0.

Kalan 3 "A eksik" ve 2 "diğer" **kusur değil, ayrı sınıf**: 02 · 03 menü örtüsünün başlığı (logo + kapat,
arama yok — örtü sayfa değil) · 52 dil çipi varyantı (TR/EN düğmesi yerine ayrı TR ve EN çipi, kasıtlı) ·
M1-M9#6 · #7 panel başlığı ("Teklif listesi · 3 kalem" / "Sepet · 3 ürün", geri oku yok).

**İki ölçüm hatam kayda geçiyor:**
1. Ölçütü düzeltme ortasında değiştirdim (A sınıfına bildirim+İletişim koşulu ekledim) → "A ✓ 9 → 0" gibi
   göründü, karşılaştırma geçersizdi.
2. Çerçeve çiftlerini **kartezyen** karşılaştırdım (her masaüstü × her mobil) → S1-S6'da S1'in masaüstü
   S5'in mobiliyle karşılaştırıldı, sahte kusur çıktı. Doğrusu **ortak ebeveyn** koşulu.

**Kontrol listesine 18. madde:** kullanıcı bir kusuru işaret ettiğinde **önce sınıf taranır, sonra
düzeltilir** — "iki kare düzeltildi" cevabı, kusur sınıf hatasıysa yanlış cevaptır. Bu turda hem yerleşim
(7 kare) hem bant (29 öğe) sınıf hatasıydı.

### Hizalama · 58 ve sonrası (Recep gözlemi, 2026-09-06)

Recep: *"ekran 58 için aynı sorun devam ediyor, sonrasında da hizalanma sorunu devam ediyor."* Resim
istemedi, ölçüm yeterliydi. Dört kare kusurluydu:

| Kare | Kusur | Düzeltme |
|---|---|---|
| **58** | 360 px İletişim paneli ile 1440 çerçevesi ayrı satırdaydı, `flex-wrap:wrap` | satır `nowrap` + `align-items:flex-start` |
| **13** | iki kip çerçevesi (700 px × 2) alt alta, +226 px | aynı |
| **B4** | iki alternatif (1440 × 2) alt alta, +784 px | aynı |
| **52** | 5 mobil çerçevenin 3'ü alt alta (+778 · +1543 · +2080) | ikinci grubun `flex-direction:column`'u **satıra** çevrildi — üç alt grup artık yan yana |

**Ölçüm ölçütümdeki hata:** ilk taramam 02-ana · 04 · 09 · 12 · 58'i de sorunlu saydı. O düşen 360/420 px
kutular **masaüstü çerçevesinin İÇİNDEKİ panel örnekleri** (ata zincirinde `block` görünüyor) — kasıtlı,
kare değil. Doğru ölçüt: **yalnız kare seviyesindeki çerçeveler**; ata zincirinde 1440 px çerçeve varsa o
kutu sayılmaz.

**Doğrulama (doğru ölçütle):** kasıtlı çok satırlı iki bölüm (M1–M9 · S1–S6) dışında **sorunlu kare 0** ·
30 kare · ham `x-import` 0 · kırık görsel 0.

Bu, aynı sınıf hatanın **beşinci** tekrarıydı ve bu kez ölçüt hatası da bendeydi. 15. maddenin devamı:
**çerçeve sayımı ata zinciriyle sınırlanır** — kare içindeki panel örneği artboard değildir.

**52'nin düzeltmesinde bir etiketi ezdim (denetim yakaladı).** Grubu `column` → `row` çevirince o grubun
**5 çocuğu** (bir etiket + kendi çerçevesi + üç iç grup) satır öğesi oldu; dört 391 px çerçeve + üç 36 px
boşluk satırı doldurdu ve etiket bütün daralmayı üstlendi: genişlik **63 px**, yükseklik **118 px** — sekiz
satıra sarmış dikey şerit. Taşma yoktu (`scrollWidth === clientWidth`), metin okunmaz hâle gelmişti.

**Yapısal düzeltme:** grup `flex-direction:column`'a döndü (etiket yine kendi çerçevesinin üstünde), üç iç
grup **bir DOM seviyesi yukarı** taşındı — bölümün çerçeve satırına. Satır artık 1, 3, 4 ve 5'in zaten
taşıdığı şekli taşıyor: beş kardeş `column` grup, her birinde etiket-üstte-çerçeve.

**Ölçüm:** beş çerçeve `left 56 / 483 / 911 / 1338 / 1765` · beş etiketin hepsi **391 px genişlik**,
yükseklik 15 px (biri 29 — iki satırlık metin, doğru) · hepsi çerçevesinin **üstünde** · ebeveyn yönü
`column`.

**Notlardaki bir tanımı düzeltiyorum (denetim uyarısı):** 02 ve 03'ün örtü bandını "logo + kapat" diye
yazmıştım. Ölçüldü: bandın **tek çocuğu var, logo `<img>`** (56 px, metin yok); kapatma işareti ve
"Ürünler / TR / EN" başlığı bandın **altındaki örtü panelinde**. Kompozisyon doğru, tanımım yanlıştı.

**Üçüncü halka: etiketi kurtarınca altyazıyı satıra soktum.** Üç iç grubu bir seviye yukarı taşırken 52'nin
altyazı paragrafı çerçeve satırının **6. flex öğesi** oldu; beş 391 px grup + dört 36 px boşluk satırı
doldurdu ve altyazı bütün daralmayı üstlendi: **79 px genişlik × 2163 px yükseklik** — satır kadar uzun
dikey şerit. Taşma yok, metin sessizce okunmaz.

**Kök neden aynı kısıt, bir seviye dışta.** Etiket ve altyazı ikisi de `flex-shrink:1; min-width:auto;
white-space:normal` taşıyor; satırda sabit genişlikli çerçevelerin yanında **daralmayı onlar emiyor.**
Ders: bir kapsayıcıya öğe eklerken o kapsayıcının **flex kısıtı** okunur, yalnız çocuk listesi değil.

**Düzeltme:** altyazı satırdan çıkarıldı, `<section>`'ın doğrudan çocuğu oldu (58'in şekli). Ayrıca iki
yapısal artık bulundu ve onarıldı:
- **52**: bir `</div>` eksikti (satırın kapanışı kaybolmuş) → altyazı satırın içinde kalıyordu
- **12**: bir `</div>` fazlaydı (proje formunu taşıdığım turdan kalan artık)

Dosya dengesi **2572/2572**; bölüm bölüm ölçüldü, dengesiz bölüm **0**.

**Ölçüm:** 29 altyazının **hepsi** section'ın doğrudan çocuğu, genişlik **491 px** (66ch), ebeveyn yönü
`column` · 52 ve 12'nin çocuk sayısı **3** (başlık · çerçeve satırı · altyazı) — 58 ile aynı şekil ·
ham `x-import` 0 · kırık görsel 0.

**Kayda geçen yöntem:** bir DOM yapısını değiştirdikten sonra **dosya bütününde ve bölüm bölüm `<div>`
dengesi** ölçülür. Bu turda iki artık ancak o ölçümle görüldü; ikisi de görsel olarak "çalışıyor"
görünüyordu.

### `TeknikTablo` mount'u bir AA ihlali getirdi — kendi notumdaki sayı bunu öngörüyordu

**Kök neden tek cümle:** `TeknikTablo` `alan` hücresini `color: --text-muted` ile sabitliyor ve
`ilkSatirVurgulu` satır zeminini `--surface-inset` yapıyor; bu çift prop'la erişilemez ve **4,19:1** ile
AA'yı geçmiyor (13,5 px / 400 → eşik 4,5).

**Utanç verici tarafı:** bu dosyadaki kontrast tablomda `--text-muted` / gömülü `#EEEEEA` = **4,16**
yazıyor ve K25'i "**`--text-muted` yalnız kart/beyaz yüzeyde**" diye kaydetmişim. Bileşen, benim
belgelediğim kararı ihlal ediyor; ben de mount ederken kendi tablomu okumadım.

**Tek kararlı düzeltme:** `ilk-satir-vurgulu` mount'tan **kaldırıldı**. Vurgu, ihlali yaratan tek şeydi.
Inline `color` ile yamamak mümkün değil — `<x-import>`'un `style`'ı `display:contents` sarmalayıcıya
düşer, hücreye ulaşmaz; hücre rengi prop da değil.

**Ölçüm:** 8 satırın hepsi beyaz kart üstünde, `alan` hücresi **4,83 ✓** · vurgulu satır **0** ·
belge geneli **benim tarafımda kontrast ihlali 0**.

**Üçüncü DS bileşen-kontrast isteği** (`Cip.baglam` ile aynı sınıf): `TeknikTablo`'nun `alan` hücresi
`--text-body` render etmeli (beyazda 7,53 · `--surface-inset` üstünde 6,47) ya da `ilkSatirVurgulu` o
hücrenin rengini de değiştirmeli. Gelince vurgu geri konur.

**Beyan düzeltmesi:** "benim tarafımda kontrast ihlali 0" cümlesini üç Linear yorumunda yazdım; o üçünde
**bir hücre yüzünden yanlıştı** (`TeknikTablo` mount'undan sonraki turlar). Şimdi ölçülmüş hâliyle doğru.

### Çip sonrası token çevirisi + iki hizalama kusuru (2026-09-06, emir #7 sıra 0)

DS beş isteği birlikte yayınladı; hepsi uygulandı.

**679 ham hex → token** (B kümesi 0, A kümesi zaten 0):

| Hex | Token | Kullanım |
|---|---|---|
| `#D8D8D4` | `--border-control` | **426** |
| `#F2F2EE` | `--border-row` | **134** |
| `#FBFBF9` | `--surface-subtle` | **74** |
| `#24395C` | `--surface-dark-inset` | **45** |

**Mobil header sıkışıklığı — Recep gördü, ölçüm doğruladı.** Kök neden: satırda
`justify-content: normal` ve hiçbir öğede `auto` marj yok → dört öğe soldan akıyor, sağda
**51 px** boş kalıyor (390 çerçevede ölçüldü). Çözüm bir özellik: mobil logoya
`margin-right: auto` — logo sola yaslanır, TR/EN + bildirim + İletişim sağa iter. 14 logo
(117×32 on kullanım · 102×32 dört kullanım). Bir önceki turda denediğim sarmalayıcı
(`margin-left:auto` + `<div>`) kalıp eşleşmesi yüzünden yalnız 1 satırda tutmuştu; geri alındı.

**Ölçüt hatası kaydı:** "son çocuk sağa değmiyorsa kusur" ölçütü kare 02 ve 03'te 255 px
"boşluk" bildirdi — o satırda logo **tek çocuk** (mobil menü örtüsü header'ı), boşluk doğru.
Ölçüt düzeltildi: **2+ çocuklu satırlar** ölçülür.

**Bir kontrast ihlali daha, aynı sınıf:** arama önerisi panelinin altyazısı beyaz kart üstünde
`--text-on-dark-muted` (#8FA2BD) kullanıyordu → **2,6:1**. O token koyu bant içindir. K25'in
kendi kuralı: koyu-bant tokeni açık zeminde kullanılmaz. `--text-body` yapıldı. Açık zemin
bağlamında kalan kullanım **0**.

**Ölçüm:** 30 kare · ham hex (A+B) **0** · kontrast ihlali **0** · sağ boşluk **0** ·
kırık görsel **0**.

### Üç bileşen mount'u — ölçüldü, yapılmadı, gerekçe

DS `Cip`'e dört rol (`notr` · `baglam` · `varyant` · `niyet`), `Kart`'a `dolgu` dört kademesi
ve `TeknikTablo`'ya `basliklar[]` ekledi. Mount için çip ↔ düğme ayrımı gerekiyor:
**399 öğe** `min-height:44px` taşıyor (93 + 73 `--border-control` kenarlı, 13 dolu lacivert,
1 × 1,5 px kenar, 218 diğer) — çoğu düğme. Bu kümeyi kalıpla ayırmak düğmeleri çipe çevirme
riski taşır; bu turda iki kez yakalanan hata sınıfının aynısı (kalıp eşleşmesi atlıyor).

Mount, ekran ekran yapılacak iş: her karede o öğenin çip mi düğme mi olduğu bağlamdan belli.
Emir #7'nin 1 → 2 → 3 sırası bu kareleri zaten yeniden yazıyor; mount o sırada, kare
bağlamıyla yapılır. `Kart.dolgu` ölçümü hazır: dört kademe 204 kartın **106'sını** kapatıyor.

## Yetenekler (emir #8 · 2026-09-06)

OPS ölçtü: projede `skills/` dizini 0 — uygulamanın yetenekleri dosya olarak durmuyor, bende
tanımlı. Aşağıda **19 yetenek**, dört alanla. "Dinamik" = tıklanabilir/çalışan çıktı üretir;
"statik" = kare/belge üretir. Son kolon bu projede fiilî kullanım.

| Yetenek | Ne yapar | Aşama | Bizde kullanım |
|---|---|---|---|
| Interactive prototype | Gerçek etkileşimli uygulama: durum tutar, girdi alır, hesap yapar | **dinamik** | **0** |
| Make tweakable | Tasarıma anahtar/kaydırıcı ekler; tek karede iki hâl görünür | **dinamik** | **0** |
| Claude API in prototypes | Prototipten `window.claude.complete` ile model çağırır (serbest metin → yapılandırılmış girdi) | **dinamik** | **0** |
| Animated video | Zaman çizelgeli hareket kompozisyonu; sahne listesi, video dışa aktarma | dinamik (izlenir) | **0** |
| 3D object | three.js modeli, OBJ/GLB indirilebilir | dinamik (döndürülür) | **0** — K1: 3D yok |
| Handoff to Claude Code | Geliştirici teslim paketi: hangi token nerede, hangi bileşen hangi karede | statik | **0** |
| Wireframe | Tel kafes/storyboard ile çok fikir hızlı keşfi | statik | **0** — hi-fi aşamasındayız |
| Make a deck | HTML sunum, ileri/geri, PDF ve PPTX çıkışı | statik | **0** |
| Make a doc | Sayfa düzeninde belge, baskıya hazır | statik | **0** — raporlar markdown |
| Save as PDF | Kare/belgeyi baskıya hazır PDF yapar | statik | **0** |
| Save as standalone HTML | Tek dosya, çevrimdışı açılır (varlıklar gömülü) | statik | **0** |
| Export as PPTX (editable) | PowerPoint'te düzenlenebilir metin/şekil | statik | **0** |
| Export as PPTX (screenshots) | Slayt başına düz görüntü | statik | **0** |
| Flier | Baskıya hazır tek sayfa | statik | **0** |
| HTML email | Gönderime hazır tek dosya e-posta | statik | **0** |
| Create design system | Tasarım sistemi/UI kit üretir | statik | **0** — DS DESIGN-MARKA'nın |
| Frontend design | Marka sistemi olmayan işlerde estetik yön | statik | **0** — DS bağlı, gerekmiyor |
| Web research | Canlı web kaynaklarından bulgu | statik | **0** — veri Supabase'de |
| Maps & geography | Gerçek coğrafi veriden harita | statik | **0** |

**Fiilî kullanım 19/19 sıfır.** Bu proje bugüne kadar tek yetenekle yürüdü: tasarım dosyası
yazmak + DOM ölçümü. Yeteneklerin hiçbiri bir kareye girmedi.

**Yetenek olmayan ama kullanılan araçlar** (OPS'un sorusu dışında, kayıt için): Supabase salt-okuma
SELECT (ölçüm raporları) · Linear okuma/yazma (yorum) · GitHub okuma (47 yol sayımı, `SeriesLandingView`)
· canlı tarayıcı (Kernel — sitemap sayımı) · DOM ölçümü ve ekran görüntüsü (her turun doğrulaması).

**Bilmediğim:** Animated video, 3D object, Maps & geography ve Export as PPTX yeteneklerinin
**kullanım ayrıntısını** (hangi parametreler, hangi kısıtlar) okumadım — bu projede işleri
olmadığı için. Ne yaptıklarını biliyorum, nasıl yapılandırıldıklarını **bilmiyorum**.
Diğer 15'in kullanımını biliyorum. `bilmiyorum` sayısı: **4** (yalnız ayrıntı düzeyinde).

### Öneri — prototip hangi işte (karar OPS+Recep'te)

**K18 A+C kabuğu prototip çizilmeli, 6 eksik ekran statik kalmalı.** Gerekçe: A ile C arasındaki
fark **dokunuş sayısı ve nerede vazgeçildiği** — statik kare bunu gösteremez, "6–7 dokunuş"
tahminim ölçüm değil. Prototip gerçek `technical_specs` ile çalışırsa hüküm de gerçek olur
(K18a). 6 ekranın işi ise hâl göstermek (404, teşekkür, kapalı-bekler) — orada etkileşim yok,
statik kare doğru araç.

Üstüne iki ek: **oturum kaydı** (`localStorage`: hangi adımda kaldı, kaç dokunuş — A/C
karşılaştırması sayıya döner) ve **serbest metin girdisi** (Claude API: "300 m² depo, koku
problemi" → kanonik girdi kümesi; C kipinin gerçek hâli). İkisi de prototip olmadan ölçülemez.

## Kontrol listesi · 8 madde

| # | Madde | Sonuç |
|---|---|---|
| 1 | Gradyan · cam · gölge · yarıçap · sonsuz animasyon | **0** (yanlış pozitif kalıpları hariç) |
| 2 | K22 metinde alfa | **0** · koyu bantta tek değer `#8FA2BD`, ölçülen 5,42:1 |
| 3 | K23 logo `brand/logo/` SVG'sinden | **19 CSS dilim çizimi kalktı**, `clip-path:polygon` **0** |
| 4 | `min-height:44px` etkileşimli öğelerde | v16'da 322 → seçilen 9 karede korundu; B4'ün grup sekmeleri ve çipleri 44 px |
| 5 | Kontrast | `#8FA2BD` / `#1A2B4A` **5,42:1** ölçüldü · arama alanı içi beyaz / `#24395C` |
| 6 | K7 boş alan · "veri yok" · "yakında" | **0** |
| 7 | Uzun çizgi oranı (arayüzde 0, altyazıda ≤1) | **uygulandı** · 21 → 10, kare başına en çok 1, arayüz metninde 0 |
| 8 | Mobil 390 · koyu kabuk · 4 sekme · taşma | 4 çerçeve: 01 · 07c · 12 (iki alt panel). Taşma yalnız `overflow-x:auto` şeritlerinde (gerçek kaydırma) |

## Ölçülenler

**Kabuk bandı (emir madde 1).** Bant `min-height:74px`, yatay oluk `padding:0 40px`, öğe arası `gap:14px 30px`.
`max-width` bandın içinde **yok**. Kök nedenin düzeltmesi: eski kurgu bandın oluğunu `(genişlik−1060)/2` ile
türetiyordu ve 911 px'te 0 oluyordu; oluk artık sabit ve bandın kendine ait. Sözleşme v1.2'ye
`spacing.shell_band` olarak yazıldı (74 / 60 mobil · 40 / 18 mobil · 30 / 14 mobil, `owns_its_gutter: true`).

**Motion (emir madde 1).** v15 + v9 ölçüldü: `style-hover` 0, `style-focus` 0, `transition` 0. Alanlar **boş**
bırakıldı, uydurulmadı. Not: ilk gerçek hareket kümesi madde 81 teslimindedir (opacity + translateY, 420 ms,
`cubic-bezier(0.22,0.61,0.36,1)`, katman kademesi 160 ms) — Kabuk v2 hareket taşımadığı için buraya girmedi.

**Logo (K23).** 7 SVG marka paketinden + 2 DS'ten (`kilit-yatay-tamrenk-koyu`, `isaret-turkuaz`) türev kopya;
her dosyanın başında `<!-- türev kopya · kaynak DS assets/logo · kopya 2026-09-05 · DESIGN-MENU -->`.
Kullanım: header ve footer yatay kilit (146×40 / 128×35), mobil header kilit (117×32), mobil sekme işaret
lacivert (22×22). Seçilmemiş sekme **alfa değil** `filter:grayscale(1) brightness(1.62)` ile sönükleşiyor
(K22: marka setinde gri işaret sürümü yok, alfa yasak).

**K19.** Header sağı: TR/EN çipi (çerçeveli, her zaman) · İletişim (ikon + etiket, alt panel açar) · Teklif tek
öğe + sayaç · hesap simgesi. "İletişim" nav'dan çıktı. Alt çubuk 4 sayfa sekmesi, dördüncü **Hesap** (5 yerde
değişti). İletişim panelinin kendisi kare 58'de duruyor.

**K18-b grup sekmesi üç hâl.** B4 karesinde çizildi: açık (Kanal fanı · Hava perdesi) · soluk (Isı geri kazanım ·
Jet fan, `HESAP YOK` rozeti + "Teknik destek iste") · yok (ürünsüz grup sekme olarak çizilmez). "Yakında" yazmıyor.
Soluk hâl ayrı gri ton (`#7A8290` metin, `#f4f4f2` zemin, `#5C6470` rozet) ile, alfa yok.

## Kare listesi

| Kare | Ne | 390 eşi |
|---|---|---|
| 01 | Kabuk · header kapalı, footer | ✓ |
| 04 | Kategori sayfası · mod 1 vitrin | — |
| 06 | Filtreli liste · model kartları | — |
| 07c | Aile PDP · varsayılan (panel kapalı) | ✓ |
| 10 | Teklif listesi | — |
| 12 | Teklif paneli + Hesap alt paneli iki hâl | ✓ (iki alt panel) |
| 58 | İletişim paneli · masaüstü | — |
| 13 | İki kip · satış kipi | — |
| **B4** | **Ürün Seçici menüde nerede duruyor · iki alternatif** | — |

**12'nin 390 çerçeveleri kaldırılmadı, gerekçe:** emir "390 eşi yalnız ana sayfa ve PDP" diyor; 12'nin mobil
çerçeveleri bir masaüstü ekranın *eşi* değil, karenin **konusu** (Hesap alt paneli iki hâl mobilde yaşıyor).
Kaldırılsa emrin istediği "Hesap iki hâl" içeriği kaybolurdu. 04 · 06 · 10'un eşleri kaldırıldı.

## B4 · Design önerisi B

**A** senaryo ızgarasının içinde sekizinci kutu · **B** header'da kendi girişi (bugünkü hâl). Önerim **B**:
"hangi kategori" diye duraksayana fan seçici göstermek cevabı peşin vermek olur (madde 37 gerekçesi, Recep
onaylamıştı) ve senaryo ızgarasının sekiz kutusu bozulmuyor. A seçilirse Sığınak alt satıra iner, ızgara 7 + 1
olur. İki alternatifte grup sekmesinin üç hâli aynı çalışıyor. Karar Recep'in.

## Tur içinde bulunan kusur

v15'in kare 12'sinde fazla bir `</div>`, kare 52'sinde eksik bir `</div>` vardı; dosya toplamında birbirlerini
götürdükleri için önceki denetimlerde görünmemişler. v16'ya yalnız 12 taşındığı için ortaya çıktı ve düzeltildi.
**Bundan sonra denge kare bazında ölçülür, dosya toplamında değil.**

## Çip ↔ 15A sapması · ÇİZİLMEDİ, yazıldı (emir #2 gereği)

İlk notumda "çelişki yok" yazmıştım; bileşenleri ve şablonu okumadan yazdığım için **yanlıştı**. Şablonu
okuyunca iki sapma çıktı, ikisi de çizilmedi:

1. **Utility şeridi.** DS `templates/kabuk/Kabuk.dc.html`, 74 px header'ın ÜSTÜNDE 30 px koyu bir utility
   şeridi taşıyor (`utilityGoster` prop'u, mono overline, "Teklif odaklı satış · fiyat ve stok gösterilmez" +
   telefon) ve DS renk kartı da "utility şeridinde 6.92:1" diye o şeride atıf yapıyor. **15A'da utility bar
   kaldırılmıştı** (onaylı Design eklemesi, geri bildirim 1 öncesi tur: kabuk tek koyu banda indi, o bağlantılar
   nav'a ve footer'a taşındı). Çizmedim, `utilityGoster` kullanılmadı. Karar gerekiyor: DS şeridi 15A'ya geri mi
   dönecek, yoksa DS şablonundan mı düşecek?
2. **Header'da Teklif öğesi.** DS şablonu Teklif'i `CerceveliDugme koyu-zemin` yapıyor; 15A'da header'da düğme
   yok (geri bildirim 2 madde 2 + K19), Teklif tek metin öğesi + turkuaz sayaç. TR/EN'i bileşene çevirdim
   (kalıp birebir aynıydı), Teklif'i metin bıraktım.

## REC-152 kapandı (OPS emri #3)

| Soru | Cevap | Dosyadaki durum |
|---|---|---|
| B4 · Ürün Seçici menü yeri | Recep'e tek başına gitti; OPS önerisi de **B**. Cevap gelmeden seçilmez. | İki alternatif yan yana çizili, seçim yapılmadı |
| Kategori ikonu zemin kuralı | Açık zemin → `tamrenk`; koyu zemin (`#1A2B4A` · `#0F1723` · `#24395C`) → `koyu`. Başka sürüm yok. Sözleşme v1.2 `iconography.category_icon_by_surface`. | **Ölçüldü: 22 kategori ikonunun tamamı açık zeminde, koyu zeminde ikon 0** → kural sağlanıyor, dosyada değişiklik gerekmedi |
| Soluk sekme filtresi | Geçici kabul. Marka `venthub-isaret-soluk.svg` (#7A8290) + `-soluk-koyu.svg` (#8FA2BD) üretiyor; gelince filtre kalkar, dosya girer. | `filter:grayscale` duruyor, kayda geçti |
| Utility şeridi | (emir #3'te ayrıca hükme bağlanmadı) | Çizilmedi, karar bekliyor |
| Header'da Teklif | (aynı) | K19 uygulandı, metin öğesi |

## Kabul (OPS emri #3, 2026-09-05)
Teslim **KABUL**: çip sayımı tuttu, çelişki 0, 8 madde dolu, motion boş bırakıldı (doğru bulundu),
12'nin 390 çerçeveleri gerekçeyle kaldı. **Kare-bazlı `</div>` dengesi kontrol listesinin 9. maddesi oldu.**

Sıradaki (Recep "olur" demeden başlanmaz): **Interactive prototype** ayrı dosya `Prototip Kabuk v2.dc.html` —
8 karenin akışı + B4'ün seçilen alternatifi + Hesap iki hâl.

## Önceki soru kaydı (tarihsel)

1. **B4 kararı:** A mı B mi? (Design önerisi B.)
2. **Kategori ikonu koyu bantta:** DS kılavuzu koyu bantta `koyu` sürüm istiyor. v16'nın 9 karesinde koyu bantta
   kategori ikonu yok; 29 kareye yayılırken mobil menü örtüsündeki 30 px ikonlar hangi sürümü alacak? Örtü
   zemini beyaz, orada `tamrenk` doğru — ama alt çubuğun koyu olduğu bir hâl gelirse kural gerekir.
3. **Utility şeridi:** DS şablonunda var, 15A'da kaldırılmıştı. Hangisi kazanır?
4. **Header'da Teklif:** DS şablonu düğme yapıyor, K19 metin öğesi diyor. K19 kazanıyor varsayımıyla metin bıraktım.
5. **Soluk sekme filtresi:** marka setinde gri işaret sürümü yok, `filter:grayscale()` kullandım. Marka'dan
   `-gri` sürüm istenmeli mi, filtre yeterli mi?

## DS sahibine bilgi
`VentHubDesignSystem_31b082.__errors` içinde iki kayıt: `brand/tailwind-brand.js` → "module is not defined".
Render'ı bozmuyor (bundle bileşenleri çalışıyor), ama DS tarafında düzeltilmesi gerekir.

— DESIGN-MENU (Fable) 2026-09-05

