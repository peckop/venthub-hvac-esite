
# Tasarım sözleşmesi v1 — ölçüm notları (DESIGN-MENU, 2026-09-05)

Brief: geri-bildirim-10 madde 80. Şema: `tasarim-sozlesmesi-sema.md` (design-dna, üç kat).
Kaynak: `Menü Tasarımı v15.dc.html` (29 kare) + `Venthub Ana Sayfa v9.dc.html`. Çıktı: `tasarim-sozlesmesi-v1.json`.
Kural 8 değişmez: bu sözleşme `tokens.js`'i **besler**, yerine geçmez.

## Yöntem
Statik CSS metni taraması — iki dosyadaki her `font-size`, hex, `letter-spacing`, `line-height`, `gap`, `padding`,
`border`, `border-radius`, `min-height`, `stroke-width` ve `grid-template-columns` değeri **sayıldı**. Baskın değer
token oldu, tek kullanım varyant notu. Canlı DOM ölçümü yapılmadı: dosyalar sabit artboard'lar (1440 + 390), tarayıcı
düzeni değil. Değer atfı `meta.source_references` içinde dosya + satır numarasıyla duruyor (13 çapa).

Frekans kanıtı JSON'da `color.measured_frequency` ve `spacing.dominant_gaps` alanlarında; OPS `tokens.js` farkını
bu sayılarla eşleştirebilir ("bu hex gerçekten token mu, tek kullanım mı" sorusunun cevabı).

## Ölçülen — özet

| Kat | Bulgu |
|---|---|
| Renk | 3 marka rengi + 15 kademeli nötr + 4 semantik çift. Kullanım sayısı: #ffffff 934 · #1a2b4a 675 · #0088b0 298 · #d95d0e **100** (kiremit disiplini sayıyla görünüyor: sayfa başına tek eylem). |
| Tipografi | 28 farklı boy ölçüldü, 8 kademeye indirildi (46 · 34 · 29 · 21/17 · 15 · 13.5 · 12.5 · 11 overline). Ağırlık dağılımı 600×616 · 700×91 · 400×65 · 500×36 — 600 baskın, 700 yalnız logo ve h1. |
| Boşluk | Katı taban birim **yok**; 22 değerli ölçek, tek sayılar (7 · 9 · 11 · 13) bilinçli. Dokunma hedefi 44px, **322 kullanım**. |
| Biçim | Yarıçap **0** (60 kez `50%` logo dairesi, 8 kez `8px` teklif paneli istisnası). Kenar 1px, altı farklı çift. |
| Yükselti | Gölge **hiç yok** (0 `box-shadow`; ölçülen iki `inset` gölge değil, aktif sekme alt çizgisi). Derinlik = yüzey tonu + 1px kenar + örtü perdesi. |
| İkon | Çizgi kalınlığı 1.5 baskın (128); marka ikonu tamrenk 48px kaynak, arayüz ikonu inline outline. |
| Efekt | 17 kategorinin **tamamı** `enabled:false`. Gradyan, canvas, parallax, cursor, glass, particle: sıfır eşleşme. |

## Ölçülemeyen — boş bırakıldı, uydurulmadı

1. **`design_system.motion.*`** — iki dosyada tek `transition`, `animation` ya da `@keyframes` yok (0 eşleşme).
   Süre yalnız altyazı metninde geçiyor ("panel 200 ms"). `easing`, `duration_scale`, `entrance_pattern`,
   `exit_pattern` **null**. Kod tarafında `tokens.js`'in mevcut hareket değerleri korunmalı — sözleşme onları ezmemeli.
2. **`design_system.layout.breakpoints`** — **null**. Dosyalar iki sabit artboard; medya sorgusu içermiyor.
   Mobil kompozisyon ayrı çizim olarak var (390), kırılma noktası olarak değil. Gerçek breakpoint kararı kod tarafının.
3. **`design_style.interaction_feel.hover_behavior`** ve **`loading_style`** — `style-hover` hiç kullanılmadı
   (0 eşleşme); durumlar ayrı karelerle anlatıldı. `transition_personality` "fade-subtle" olarak **çıkarım**,
   ölçüm değil — JSON'da öyle işaretli.

## İki dosya çeliştiğinde

Şema kuralı gereği baskın değer + varyant notu:

| Alan | Menü v15 | Ana Sayfa v9 | Karar |
|---|---|---|---|
| h1 boyu | 34px (masaüstü) · 25px (mobil) | 46px (hero) · 29px (bölüm h1) | 46px **display** (yalnız hero, tek kullanım) · 34px **heading_1** (sayfa başlığı) |
| h1 tracking | -0.025em | -0.03em | Kademe ayrımı: display -0.03em, heading_1 -0.025em |
| Bölüm başlığı | 21px / 600 / -0.02em | 28–30px / 600 / -0.025em | heading_3 21px; ana sayfanın 28–30px'i heading_2 kademesinde varyant |
| İçerik genişliği | 1060px | 1060px | Çelişki yok |

Ana sayfada 6 hex Menü'de yok (#dcdcd6 · #dbe3ec · #9fb0c6 · #f0f0eb · #cfcfc9 · #e6e6e2) — hepsi tek kullanım,
şematik çizim dolgusu. Nötr ölçeğe **alınmadı**, token sayılmaz.

## Design'ın notu — koda geçerken üç dikkat

1. **Boşluk ölçeği tokenlaştırılamaz halde.** 22 değer ve tek sayılar var; bunu 4'ün katına yuvarlamak çizimi
   değiştirir. Öneri: `space-1…space-12` yerine ölçülen değerleri **aynen** token yapmak, ya da 8'lik ızgaraya
   geçme kararını ayrı bir tur olarak almak (görsel etkisi ölçülür, göz kararı olmaz).
2. **Yarıçap istisnası tek yerde.** `radius-panel: 8px` diye ayrı token açılmalı; genel `radius: 0` kalmalı.
   Aksi hâlde ilk refactor'da panel köşesi ya kaybolur ya her yere yayılır.
3. **Hareket boş geldi, bu bir eksik değil karar.** Ürün sayfası v2 (madde 81) ilk hareket kümesini getirecek;
   `motion` ve `visual_effects.scroll_effects` alanları o teslimde ölçülüp v2 sözleşmesine yazılır. Şimdi
   doldurulsa uydurma olur.

## Sözleşmenin kendi kuralı ilk kez uygulandı (aynı gün)

Sözleşme yazıldıktan sonra üç dosya kendi kuralına karşı tarandı — `contrast_strategy`: *"Metin her zaman tam
opaklık — alfa ile soluklaştırma yok, soluk ton ayrı hex."* **Yedi ihlal bulundu ve düzeltildi:**

| Dosya | Yer | Eski | Yeni |
|---|---|---|---|
| Karşılaştırma | B kartı ("çizilmez") | `opacity:0.72` → rozet 2,6:1 · gövde 3,8:1 | başlık #4a5568 · gövde #6b7280 · rozet #4a5568/#eeeeea (7,4:1) |
| Alternatifler v3 | C akışı, cevaplanmış soru | `opacity:0.45` | zemin #fbfbf9 + kenar #eeeeea + **CEVAPLANDI** rozeti |
| Menü v15 | varyant kartı YETERSİZ (2 kare) | `opacity:0.5` | zemin #fbfbf9 + kenar #eeeeea + başlık #4a5568 |
| Menü v15 | 52a ARŞİV karesi | `opacity:0.55` | kesikli kenar + rozet zaten durumu söylüyor |
| Menü v15 | Hesap yaprağı girişsiz satırlar (2) | `opacity:0.7` | zemin #fbfbf9 |
| Menü v15 | Satış kipi bloğu | `opacity:0.62` | "kapalı bekler" etiketi + kesikli çerçeve yeter |

Kalan 10 `opacity:0.5` yalnız mobil menünün marka logo şeridinde (`<img>`, metin değil) — JSON'da
`image_effects` istisnası olarak yazılı.

**Ders:** durum (çizilmez · arşiv · yetersiz · kapalı) alfa ile değil, **soluk hex + zemin + rozet** ile anlatılır.
Alfa kenarı ve rozeti de soluklaştırdığı için durumu zayıflatıyor, üstüne okunabilirliği düşürüyor. Bu kural
bundan sonra her turun kontrol listesinde.

## v1.1 · iki kural sözleşmeye girdi (OPS, 09-05)

**`iconography.stroke: 1.5`** — tek kaynak olarak yazıldı. Ölçüm 128 kullanımla bu değeri verdi; Marka
kaydındaki 1.4 ve eski handoff README'sindeki 1.6 bayat sayıldı. Varyantlar `stroke_notes` içinde: 1.6 panel
başlığı, 1.8 kapatma çarpısı, 2 seçili mobil sekme.

**`iconography.logo_rule` (K23)** — logo elle çizilmez. Marka işareti yalnız `brand/logo/` SVG'lerinden:
açık zemin `venthub-isaret-tamrenk.svg` · koyu header `venthub-isaret-tamrenk-koyu.svg` · tek renk
`venthub-isaret-lacivert.svg` / `-beyaz.svg` · wordmark kilidi `venthub-kilit-yatay-*`. Gerekçe: dilim dizilimi
(kiremit · beyaz · **beyaz** · turkuaz) elde yazılınca hata çıkıyor. Yedi dosya marka projesinden kopyalandı.
Madde 81 teslimindeki iki CSS çizimi (masaüstü header 34px, mobil sekme 22px) aynı turda SVG'ye çevrildi;
v15/v9 Kabuk v2'de dönecek, geri gidilmedi.

## Sözleşmenin dili
Enum alanları şemanın İngilizce sözlüğünü kullanır (`palette_type: "split-complementary"`, `content_density: "compact"`)
— makine karşılaştırması için. Serbest metin ve rol açıklamaları Türkçe. Karışıklık değil, bilinçli: OPS'un
`tokens.js` diff'i enum'lara bakar, Recep açıklamaları okur.

— DESIGN-MENU (Fable) 2026-09-05

