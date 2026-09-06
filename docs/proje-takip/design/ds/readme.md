
# VentHub Design System

VentHub, HVAC (havalandırma, hava perdesi, ısı geri kazanım, sığınak havalandırması) ürünlerini
satan bir **B2B teknik ticaret** vitrini. Vitrinde fiyat, stok ve sepet yoktur — akış **teklif
odaklıdır** ve tek fiil kullanılır: *Teklif iste*.

Bu proje o kimliğin **türevidir**, kaynağı değil.

## Damga

| Alan | Değer |
|---|---|
| `kaynak_updatedAt` | `2026-09-06T04:42:08Z` — `1 Venthub Marka Kilavuzu.dc.html` (kılavuzda iki ihlal düzeltildi: 10 yerde ham kiremit metin zemini → `#BF5309`, 12 yerde "Teklif al" → "Teklif iste") |
| `karar_updatedAt` | `2026-09-06T04:41:21Z` — `CLAUDE.md` (karar kaydı) |
| `sozlesme_updatedAt` | `2026-09-05T11:34:16Z` — `tasarim-sozlesmesi-v1.json` |
| `varliklar_kopyalandi` | `2026-09-05` — 172 SVG (+ 2 türetilmiş soluk işaret, 2026-09-05 → **174**) |
| `brand_tazelendi` | `2026-09-06T06:17Z` — `brand/tokens.css` · `tailwind-brand.js` · `README.md` kaynaktan birebir kopyalandı (türev, elle düzenlenmez). İkinci tazeleme: K28 üç tokeni |
| `duzeltme` | `2026-09-05`: oluk 40 px, gruplama 5+2, K22 alfa yasağı, soluk işaret (REC-149). Kaynak değişmediği için `kaynak_updatedAt` aynı kaldı |
| `yayin` | **Published işaretli** (Recep) · org default. Tik yayın anahtarıdır, sürüm basma düğmesi değil — kapatıp açmak hiçbir şeyi tazelemez (ölçüldü). **DS'te varlık/bileşen/token değişince her tüketici proje çipi kaldırıp yeniden seçer** (Recep, proje ayarı). Tazelik ölçütü: bağlı `readme.md` metni + `_ds_bundle.js` bileşen kodu; `kaynak_updatedAt` yayın tazeliği göstermez, `assets/` bağlı kopyaya hiç girmez (ikon/logo `brand/` ya da DS projesinden türev kopya) |
| `yayin_notu` | Son değişiklik **2026-09-06** (emir #5 kapanışı): `--surface-dark-inset` aynası (57 token) · `Cip` `baglam` rolü mürekkep turkuaza · `KabukBandi` `sonEk` slotu + v17 sekiz kalem · `TeknikTablo` `kolonlar` · `AnaEylemDugmesi` zemini → **yeniden bağlama gerekir** (üç tüketici projede çip kaldır-yeniden seç) | |

## Kaynaklar

| Kaynak | Ne verir | Erişim |
|---|---|---|
| **Marka Kılavuzu (DESIGN-MARKA)** projesi `670f9f75-9e90-499e-a6fe-a98139bb457a` | Karar: niçin. `CLAUDE.md` (karar kaydı) · `1 Venthub Marka Kilavuzu.dc.html` (kılavuz) · `brand/` (tokens.css · tailwind-brand.js · icons · logo) | okunur, yazılmaz |
| **`tasarim-sozlesmesi-v1.json`** (bu projenin kökünde) | Ölçüm: Menü v15 + Ana Sayfa v9 CSS metninden sayılmış tasarım DNA'sı | kökte |
| **Vitrin 15A (DESIGN-MENU)** projesi `be615496…` | Ekranlar (menü, ana sayfa, kategori, ürün, teklif listesi) | ekran kaynağı orada (K11) |
| Kod deposu `peckop/venthub-hvac-esite` | `src/index.css` + `tailwind.config.js` + `src/design-system/tokens.js` hedef biçimi | kod tarafı URUN'un |

**Değer kuralı:** değerler CLAUDE.md kararı + sözleşme ölçümünden gelir. Sıfırdan icat yok.
İkisi çelişirse **sözleşme kazanır** (ölçüm). Bugün çelişmiyorlar.

Kök `styles.css` ve `tokens/` altındaki dört dosya `brand/tokens.css` ile **aynı değer
kümesidir**; ikinci bir küme üretilmedi. Tek değer dosyası: `brand/tokens.css` = DS kökü =
depoya giden dosya.

## VISUAL FOUNDATIONS

**Metafor:** mühendislik veri sayfası — katalog cetveli ve ölçüm çıktısı. Süs değil kanıt.
Sakin, teknik, kurumsal, yoğun. 2020'lerin İsviçre etkili kurumsal grid'i.

**Renk.** Üç marka rengi: lacivert `#1A2B4A` yapı ve wordmark · turkuaz `#0088B0` hava ve vurgu
(**eylem rengi değil**) · kiremit `#D95D0E` üç izinli kullanım: logo üst dilimi · sayfanın **tek**
ana eylemi · P-Q çalışma noktası (K35 eki). Dördüncü kiremit kullanımı açılmaz.
**Ham hex yalnız etikettir:** ölçüt HSL üçlüsüdür, hex render'da bir tık sapabilir
(`#24395C` → `#24385C`); ham-hex denetimi HSL karşılığıyla ölçer.
**K25-b — turkuaz ve kiremit zemin/kenar rengidir, metin ve metin zemini değildir;** ikisinin
mürekkep karşılığı ayrı token: `--brand-cyan-ink` `#00708F` (küçük turkuaz metin ve bağlantı,
ayrıca sayaç/rozet zemini — beyazda 5.65, `#F4F4F2` üstünde 5.13, beyaz metin altında zemin
olarak 5.65; **koyu zeminde kullanılmaz:** `#1A2B4A` 2.50 · `#0F1723` 3.18, ham turkuazdan da
kötü — K25-b'nin "küçük metin" şartı yalnız açık zeminde geçerli, koyu bantta
`--text-on-dark-muted` kalır) · `--action-terracotta-deep` `#BF5309` (dolu kiremit düğme zemini, beyaz etiketle
4.71; ham kiremit 3.80 verirdi). Küçük turkuaz metin koyu zeminde hiç kullanılmaz.
Kiremit asla metin rengi değildir. Kapsamlı iki vurgu markaya ait değildir: yeşil `#3D7A1E`
yalnız Hava Arıtma kategori sayfalarında, amber `#F59E0B` yalnız uyarı kutusunda; ikisi de logoya
girmez. Macenta `#D6006C` sistemden kaldırıldı. Kontrast kurgusu **koyu-üstünde-aydınlık**:
gövde `#F4F4F2`, kart `#FFFFFF`, tek koyu bölge kabuk. **`--text-muted` yalnız kart ve beyaz yüzeyde** kullanılır: beyazda 4.83 ama sayfa zemininde
(`#F4F4F2`) 4.39'a düşer — sayfa zemininde küçük metin `--text-body` ile yazılır (6.83). Üçüncü
bir gri üretilmez; hiyerarşi boy ve ağırlıkla kurulur. **Metin her zaman tam opaklıktır** — alfa
ile soluklaştırma yok, soluk ton ayrı token: koyu bantta soluk metin `#8FA2BD`
(`--text-on-dark-muted`; lacivert bantta 5.42:1, utility şeridinde 6.92:1). K22, istisna yalnız
`<img>` şeritleri. Gövde ≥4.5:1, başlık ölçeğinde ≥3:1. **Turkuaz ölçülmüş bir açık zemin vurgusudur:**
küçük metinde üç koyu zeminin hiçbirinde AA geçmez — `#1A2B4A` 3.46:1 · `#0F1723` 4.41:1 ·
`#24395C` 2.84:1. Koyu zeminde küçük etiket turkuaz değil `--text-on-dark-muted` ile yazılır
(lacivert bantta 5.35:1); turkuaz overline açık zeminde kalır. **Sınır:** muted ink `#24395C`
üzerinde 4.45:1, eşiğin hemen altında — arama alanı zemini o renktir, orada küçük etiket
gerekirse muted ink değil beyaz (`--text-on-dark`) kullanılır.

**Tipografi.** Üç aile, rol ayrımı katı: **Archivo** arayüzün tamamı · **Source Serif 4** yalnız
uzun açıklama metni (16 px / 1.6, ölçü 66ch) · **IBM Plex Mono** model kodu, teknik değer, bölüm
etiketi, adres ve ölçü (sayılarda `tabular-nums`). Dördüncü aile eklenmez, **Inter kullanılmaz**.
Üçü de Google Fonts ve SIL OFL; **bağlantıyla yüklenir**, ikame yapılmaz, binary taşınmaz.
Başlıklarda negatif tracking (−0.02 … −0.03em). Baskın ağırlık 600 (kart/bölüm başlığı, düğme
etiketi); 700 yalnız wordmark ve h1. Wordmark her zaman **VentHub** (camel case); `VENTHUB` ve
`venthub` yasaktır.

**Biçim.** **Köşe yarıçapı yok, gölge yok.** İki istisna: logo dairesi %50, teklif paneli ve
mobil alt panel üst köşeleri 8 px (`--radius-panel`). `box-shadow` kullanılmaz — ölçümde 0
eşleşme. Derinlik üç yolla kurulur: (1) yüzey tonu, (2) 1 px kenar, (3) örtü katmanı (mobil panel
açıkken `rgba(26,43,74,0.45)` perde ve arkada kısılmış gerçek kabuk, boş perde değil).
Kenar yüzeyi ayıran tek araçtır ve dört tonu **bozulmaz bir kademe** kurar (K28, beyaz üstünde):
`--border-control` `#D8D8D4` 1.43 (etkileşimli öğe) > `--border-hairline` `#E2E2DE` 1.28 (kart) >
`--surface-inset` `#EEEEEA` 1.20 (blok ayırıcı) > `--border-row` `#F2F2EE` 1.12 (satır ayırıcı) —
sıra bozulursa tablo satırları bloklardan ağır görünür. Kart içi ikincil bölge
`--surface-subtle` `#FBFBF9`, ama beyazda 1.04 / sayfa zemininde 1.06 kaldığı için **tek başına
sınır bildirmez**, daima 1 px kenarla kullanılır. Kullanım: 1 px `#D8D8D4` düğme/giriş · 1 px `#E2E2DE` kart · 1 px
`#1A2B4A` çerçeveli düğme · 2 px `#1A2B4A` seçili kart · 1 px `#EEEEEA` blok ayırıcı · 3 px sol
kural yalnız semantik kutuda. Doku, gradyan, cam/neumorfizm, parçacık, gölge yok.

**Yerleşim.** Soyut 12 kolonluk ızgara yok; her ekran kendi kolon şemasını taşır (baskın kalıp
`repeat(4,1fr)`). **İçerik sütunu 1060 px**, artboard 1440 ve 390. Kabuk bandı ayrı ölçüdür: bant **tam
genişlikte**, yüksekliği **74 px**, iç oluğu **40 px**, öğe arası **30 px** (Menü v15 ekran 01
ölçümü). Bandın oluğu ortalanmış sütundan türetilmez — 1060 px içerik sütunu genişliğidir, bant
oluğu değil; ikisi karıştırılmaz. Sola hizalı,
ortalanmış metin bloğu yok. Boşluk **işlevseldir, nefes için değil**: kart içi 14–20 px, bölüm
arası 26–36 px, sayfa iç boşluğu 40 px masaüstü / 18 px mobil; tek sayılı boşluklar (7 · 9 · 11 ·
13) optik sıkılık için bilinçlidir. Etkileşimli her öğe **min 44 px**.

**Hareket ve durumlar.** Kaynak çizimlerde `transition`/`animation` **hiç yok** (0 eşleşme);
durumlar ayrı karelerle anlatıldı. Bu yüzden bu sistemde hareket, hover ve press tokenı
**tanımlanmadı** — ölçülmeyene kural yazılmaz. Bilinen tek süre: menü panelinin açılışı 200 ms
(altyazı metni). Geri bildirim animasyonla değil **metinle** verilir: hüküm kutusu değişir
(YETER / SINIRDA / YETMEZ + sebep), sayaç güncellenir. Logo hareketi ayrı kuraldır: dilimlerin
aşağı akışı, yalnız 48 px üstünde, tek 2–3 sn döngü, ilk görünümde; favicon, evrak ve baskı
daima statik.

**Görsel.** Beyaz fonlu ürün fotoğrafı, 1 px `#E2E2DE` kenarlı beyaz kutu içinde; filtre,
gri-ton, hover dönüşümü yok; koyu zemine konmaz. **Fotoğraf yoksa kutu kaldırılır** ve kart 2 px
lacivert üst kural ile başlar — boş kutu bırakılmaz. Şematik çizimler tek çizgi + düz dolgu,
ölçekli, gölgesiz (fan silueti, hava perdesi kesiti, P-Q eğrisi). Dekoratif illüstrasyon yok.

## CONTENT FUNDAMENTALS

- **Ton:** açık, mühendis diline yakın, abartısız. Değerin ne anlama geldiğini söyler:
  *"Kanal uzadıkça bu payı tüketirsiniz."*
- **Kişi:** ikinci çoğul — *"mahalinize"*, *"girdiğiniz değerlerle"*. Resmi ama mesafeli değil.
- **Eylem metni:** emir kipi ve sayfaya özel — *"Bu model için teklif iste"*, *"Teklif talebini
  gönder"*, *"Teknik destek iste"*. Tek fiil ailesi: teklif iste / teklif listesine ekle.
  **"Teklif al" yazımı yasaktır.**
- **Yalnız dolu alan satır olur (K7):** "belirtilmemiş", tire ve "veri yok" yazılmaz. Boş dal,
  ürünsüz kategori ve modeli olmayan blok **hiç çizilmez**. **"Yakında" yasak.**
- **Hata tonu** suçlamaz, gerekçe verir: *"✗ Bu devirde YETMEZ — devri %77'ye çıkarın"*.
  Verisi olmayanda hüküm verilmez: *"değerlendirilemedi · bu model için mühendisimize sorun"*.
- **Boş durum** sebebi ve çıkış yolunu yazar (hangi süzgeç kaç modeli sakladı), iki çerçeveli
  çıkış düğmesi verir, kiremit kullanmaz.
- **Emoji kullanılmaz.** Rozetler büyük harf ve kısa: `UL-94` · `ErP` · `ÖNERİLEN` ·
  `DEĞERLENDİRİLEMEDİ` · `ARŞİV`. Marka yazımı veriden: `SEAT`, `AVenS`.
- **Marka listesi — yedi, bu sıra ve yazımla:** Vortice · SEAT · AVenS · Nicotra Gebhardt ·
  Danfoss · Casals · Flexiva. **Storm marka değildir** (SEAT ürün serisi). Gösterim **5 + 2, iki
  satır, etiketli**: ürün grubu olan beş, ardından **"Temsil edilen markalar"**. Sayı yazılmaz
  (sayılar kod/DB'nin, kart bayatlar); "ürün bekliyor" ve "yakında" gibi vaat okunan ifade
  yazılmaz. 3·2·2 gruplamasının dayanağı yoktu, kaldırıldı.

## ICONOGRAPHY

İki dil bir arada:

1. **Marka kategori ve senaryo ikonları** — `assets/icons/`, **144 SVG**: 16 ikon ×
   64/48/24 px × `tamrenk` / `lacivert` / `koyu`. Dolu iki renkli dil: lacivert gövde + turkuaz
   hava. Hava anlatımı **ok işaretiyle değil dilim/jet ritmiyle** yapılır; **kiremit ikonlarda
   yoktur**. Ad düzeni `venthub-[kat|sen]-[ad]-[px]-[surum].svg`, Türkçe karakter yok.
   - **Koyu lacivert header ve footer içinde `koyu` sürüm kullanılır** — `tamrenk` sürüm lacivert
     üstünde 1.31:1 kalır, okunmaz.
   - Tek renk `lacivert` sürümde turkuaz **kapsama duyarlı** çevrilmiştir: lacivert gövdenin
     içindeki turkuaz beyaz knockout olur, sayfa zeminindeki turkuaz laciverte döner. Kör hex
     değişimi yapılmaz.
   - Ayrıntı düşme eşiği 34 px. 64 px, 48 px geometrisinin birebir vektör ölçeğidir.
   - **Alt dallar için ikon çizilmez** — 22 px'te ayırt edilemez; ayırt ediciliği ürün fotoğrafı
     sağlar. Senaryo seti dokuz kalır, sitede sekizi görünür.
   - Baskıda kategori vurgu rengi kullanılmaz; tek renk lacivert sürüm kullanılır.
2. **Arayüz ikonları** — tek çizgi outline, dolgu yok, `currentColor`. Kontur kalınlığı
   **1.5** (sözleşme ölçümü, 128 kullanım). Bu set **bu sistemde bulunmaz**: arayüz ikonu marka
   dili değil arayüz ihtiyacıdır, sahibi DESIGN-MENU'dür (OPS hükmü). Hazır ikon kütüphanesi
   (Lucide, Heroicons vb.) kullanılmaz, CDN'den ikame çekilmez.

Logo: `assets/logo/`, **30 SVG** — işaret 9 · yatay kilit 7 · dikey kilit 7 · favicon 4 ·
avatar 2 · paylaşım 1. İşaretin **soluk** iki sürümü (`venthub-isaret-soluk.svg` `#7A8290` açık
zemin · `venthub-isaret-soluk-koyu.svg` `#8FA2BD` koyu zemin) seçilmemiş sekme gibi sönük hâller
içindir; geometri ana çizimin birebir aynısı. Ölçülen kontrast — `#7A8290`: beyaz üstünde
3.87:1, sayfa zemininde (`#F4F4F2`) 3.52:1 · `#8FA2BD`: lacivert bantta 5.35:1, `#0F1723`
üstünde 6.92:1. **Soluk hâl bilgi taşımaz, eşik aranmaz** — sayılar kayıt için yazıldı.
**Sönükleştirme `filter: grayscale()` ya da opaklıkla yapılmaz** (K22 · K23 ruhu): soluk sürüm
dosyadan gelir. **Logo hiçbir yerde elle çizilmez (K23)** — CSS `clip-path` ile dilim
çizmek yasaktır, dosyadan gelir. Koyu zeminde `-tamrenk-koyu` kullanılır: dizilim
`kiremit · beyaz · beyaz · turkuaz` (ikinci **ve** üçüncü dilim beyaza döner). Wordmark yola
çevrilmedi; kilitler `<text>` + Archivo 700 taşır, kullanan yer Archivo'yu yüklemek zorundadır.

### Varlık damgası

`assets/icons/` ve `assets/logo/` **üretilmiş türev kopyadır. Kaynak: Marka Kılavuzu projesi
`brand/`. Elle düzenlenmez.** Kılavuz değişince yenilenir — tazeleme DESIGN-MARKA, tetik OPS.
Kopya tarihi: **2026-09-05**.

## Bileşenler

Kapsam **on** bileşendir: kuruluşta OPS onaylı altı, K29 desen envanteri sonrası dördü daha
(emir #6). Kılavuzda ya da envanterde karşılığı olmayan bileşen üretilmedi.

| Bileşen | Dosya | Ne |
|---|---|---|
| `AnaEylemDugmesi` | `components/dugme/` | Dolu kiremit düğme, zemin `--action-terracotta-deep` (4.71). Sayfada **tek**, sayfanın işini bitiren eylem (K5) |
| `CerceveliDugme` | `components/dugme/` | Çerçeveli ikincil düğme. Kiremit dışındaki her eylem; `koyuZemin` sürümü var |
| `Kart` | `components/yuzey/` | Beyaz yüzey + 1 px kenar, yarıçap 0, gölge 0. Dört dolgu kademesi (0/14/16/20), seçili 2 px, kapsam dışı soluk zemin + `--text-body` (K22), `ustKural` |
| `Cip` | `components/yuzey/` | Dört rol: süzgeç · bağlam (mürekkep turkuaz) · varyant · niyet. 44 px hedef; varyant/niyet seçili hâli 1.5 px kenar |
| `TeknikTablo` | `components/veri/` | Alan · değer · anlam. `basliklar[]` başlık satırı bileşende, `kolonlar` ile kolon genişliği, uzun değer sarar. **K7 gömülü:** boş satır çizilmez |
| `KabukBandi` | `components/kabuk/` | Koyu lacivert header / footer bandı: 74 px · iç oluk 40 px · öğe arası 30 px, tam genişlik. Teklif sayacı rozeti (`sayac`) bileşen içinde |
| `KatliCagriSatiri` | `components/dugme/` | Açılır satır (kapalı ▼ / açık ▲). `CerceveliDugme` türevi, kiremit değil (K5) |
| `KarsilastirmaTablosu` | `components/veri/` | Transpoze karşılaştırma: satır = alan, kolon = model. Kendi K7 kuralı: en az bir modelde değer varsa satır çizilir, boş hücre boş kalır |
| `AdetKontrolu` | `components/veri/` | `− n +`. Dokunma hedefi **44 px bileşende sabit** (S1 ihlali bu desenden çıktı) |
| `PQEgrisi` | `components/veri/` | Debi/basınç eğrisi: ana 2 px lacivert, ikincil 1.5 px turkuaz, çalışma noktası kiremit (F8/K35). Tam 520×260 · kısa 330×200; verisi yoksa çizilmez |

### Bilinçli ekleme

Dört bileşen K29 desen envanteriyle geldi (emir #6): `KatliCagriSatiri` · `KarsilastirmaTablosu`
· `AdetKontrolu` · `PQEgrisi`. Hepsi **ölçülmüş** desenler (2–3 ekranda geçen, 5–22 kullanım);
hiçbiri kılavuz kararı gerektirmedi. Yöntemin varsayılan seti (Toast · Tabs · Dialog · Avatar ·
Input · Switch …) hâlâ **girmedi**: kılavuzda da envanterde de karşılığı yok, tanımlanmamış bir
bileşen tüketicinin güvenip tasarımcının tanımayacağı bir icat olur.

### Bilinçli eksik

- **Boşluk ölçeği tokenı** — sözleşmede 22 değer ölçüldü, tek sayılar bilinçli; 4'e yuvarlama
  çizimi bozuyor. Ayrı karar turu bekliyor. 44 px dokunma hedefi ve 1060 px içerik ölçüsü bu
  yüzden token değil **kural** olarak yazıldı (bkz. Ölçü kartı).
- **On beş kademeli nötr ölçek** — sözleşmede ölçüldü, marka tokeni değil; burada yalnız fiilen
  kullanılan yüzeyler var.
- **Semantik renk çiftleri** (başarı · uyarı · hata · bilgi) — sözleşmede ölçüldü, marka paletine
  ait değil; hüküm kutusu bileşeni de altı bileşen kapsamında değil.
- **Hareket tokenları** — ölçülmedi (0 eşleşme). Deponun mevcut `transitionProperty` ölçeği korunur.
- **Yazı tipi binary'leri** — bağlantıyla yüklenir, taşınmaz.
- **UI kit tam ekranları** — ekran kaynağı DESIGN-MENU'dür (K11). Burada yalnız kabuk ekranı var.

## Dosya dizini

| Yol | Ne |
|---|---|
| `styles.css` | Tek global giriş: Google Fonts bağlantısı + dört token dosyası. Yalnız `@import` |
| `tokens/renk.css` · `tipografi.css` · `yuzey.css` · `kenar.css` | Değerler. `brand/tokens.css` ile aynı küme |
| `components/dugme/` · `yuzey/` · `veri/` · `kabuk/` | Altı bileşen (`.jsx` + `.d.ts` + `.prompt.md` + kart) |
| `guidelines/` | 19 temel kartı: renk, tipografi, biçim, ölçü, ikon, logo, marka listesi |
| `templates/kabuk/` | **Kabuk şablonu** (kaynak): `Kabuk.dc.html` + `ds-base.js` + README. Tüketici tek tıkla buradan başlar |
| `ui_kits/kabuk/` | Kabuk ekranı — şablonun **türevi**, koyu header + aydınlık gövde + footer, içerik boş |
| `assets/icons/` | 144 SVG · türev kopya |
| `assets/logo/` | 30 SVG · türev kopya (28 kopya + 2 türetilmiş soluk sürüm) |
| `brand/` | Kılavuzdan gelen paket: `tokens.css` (tek değer dosyası) · `tailwind-brand.js` · `README.md` |
| `tasarim-sozlesmesi-v1.json` | Ölçüm sözleşmesi. Bu sistemi **denetler**, bundan türemez |
| `ops-iletisim-protokolu.md` | OPS ↔ Design iletişim protokolü |
| `thumbnail.html` | Ana sayfa döşemesi |
| `SKILL.md` | Agent Skills uyumlu giriş |

## Bakım

Kılavuz **kaynak**, bu sistem **türev**. Tazeleme DESIGN-MARKA, tetik OPS. Sözleşme JSON bu
sistemden üretilmez — çizimden bağımsız ölçülür ve sistemle çizimin ayrıştığını yakalayan tek
şeydir. Karar SSOT'u Linear'dır; çelişkide Linear kazanır.

