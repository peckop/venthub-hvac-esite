
# VentHub — karar kaydı (kalıcı)

Bu dosya sohbet sıkıştırılsa bile kaybolmaması gereken kararları tutar.

## Logo — KAPALI KARAR
- İşaret: **14A-3** — daire içinde 4 eğik kanatçık dilimi, **kiremit üst dilim**.
- Wordmark her zaman tam **VentHub** (camel case: iç büyük H, Vent + Hub okunur).
  VENTHUB ve venthub yazımları yasak; büyük harf yalnız utility bar etiketlerinde.
  İşaret harf ikame etmez.
- Yazı tipi: **Archivo Bold 700, harf aralığı −0.03em** (SIL OFL, ticari kullanım serbest).
  İkincil / etiket: IBM Plex Mono.
- Sürümler: tam renk · iki renk (lacivert+turkuaz) · tek renk lacivert · tek renk beyaz ·
  yalnız turkuaz · siyah.

## Palet
- **Ham hex etikettir, ölçüt HSL üçlüsüdür** (6 Eylül, DS ölçümü). Render'da hex bir tık sapabilir
  (`#24395C` → `#24385C`); ham-hex denetimi HSL karşılığıyla ölçer, hex eşitliği aramaz.
- Lacivert **#1A2B4A** — yapı, wordmark
- Turkuaz **#0088B0** — hava, vurgu. **Açık zemin vurgusudur.** Koyu bantta küçük etiket
  olarak KULLANILMAZ (ölçüm: #1A2B4A üstünde 3.46:1 · #0F1723 üstünde 4.41:1 ·
  #24395C üstünde 2.84:1 — üçü de 4.5 eşiğinin altında). Koyu zeminde küçük etiket
  `--text-on-dark-muted` #8FA2BD ile yazılır (5.42 · 6.92 · 4.45:1).
  **Sınır:** #24395C (arama alanı zemini) üstünde #8FA2BD 4.45:1 ile eşiğin hemen altında —
  o zeminde küçük etiket beyaz (`--text-on-dark`) olur. Açık zeminli kartlardaki turkuaz
  overline'lar geçerli, dokunulmaz.
- **K25-b · iki mürekkep tonu (5–6 Eylül, ölçüm doğrulanıp kaynağa yazıldı).** Ham marka
  renkleri **zemin/kenar** rengidir, metin veya metin zemini değil:
  - `--brand-cyan-ink` **#00708F** (193 100% 28%) — turkuazın metin ve sayaç ZEMİNİ hâli.
    Açık zemin metni: beyazda 5.65 · #F4F4F2'de 5.13. Zemin olarak beyaz metinle 5.65.
    **KOYU zeminde de kullanılmaz** (yeni ölçüm: #1A2B4A 2.50 · #0F1723 3.18) — orada
    `--text-on-dark-muted` kalır.
  - `--action-terracotta-deep` **#BF5309** (24 91% 39%) — ana eylem düğmesi zemini, beyaz
    metinle 4.71. Ham #D95D0E beyaz metinle 3.80, metin zemini olarak kullanılmaz.
  - `--text-muted` #6B7280 **yalnız kart/beyaz yüzeyde** (4.83); sayfa zemininde küçük metin
    `--text-body` ile yazılır (6.83; muted orada 4.39). Üçüncü gri üretilmedi.
- **K28 · kenar ve yüzey kademesi (6 Eylül, Menü ham-hex beyanından).** Ham hex yalnız DS'te
  token karşılığı varsa ihlaldir; B kümesi 676 kullanım üç değere indi, adlar bende:
  - `--border-control` **#D8D8D4** (60 5% 84%) — düğme ve giriş kenarı, 426 kullanım.
    OPS `--border-input` önerdi; **`control` yazdım** çünkü düğmeyi de kapsıyor.
  - `--border-row` **#F2F2EE** (60 13% 94%) — tablo/liste satır ayırıcısı, 142 kullanım.
  - `--surface-subtle` **#FBFBF9** (60 20% 98%) — kart içi ikincil bölge, 74 kullanım.
    Beyazda 1.04 — tek başına sınır bildirmez, 1 px kenarla birlikte kullanılır.
  **Kademe anlamlıdır:** etkileşimli öğe kenarı (control 1.43) yüzey kenarından (hairline 1.28)
  koyu; satır ayırımı (row 1.12) blok ayırımından (inset 1.20) açık. Sıra bozulursa tablo
  satırları bloklardan ağır görünür.
  **Ayrışma düzeltmesi:** kılavuzda `#FBFBFA`, Menü'de `#FBFBF9` vardı — tek değere birleşti.
- Kiremit **#D95D0E** — **üç izinli kullanım** (K5 eki, 6 Eylül · DS tazelemesinde yakalandı):
  logo üst dilimi · sayfanın tek ana eylemi ("Teklif iste") · **P-Q eğrisinin çalışma noktası**
  (K35). Üçüncüsü K35 ile fiilen açılmıştı ama K5 satırı güncellenmemişti; dördüncü kiremit
  kullanımı açılmaz. Asla metin rengi değil.
  **DÜZELTME (K5, 5 Eylül):** tek fiil "Teklif iste"; "Teklif al" YAZIMI KALKTI. Her sayfada tek
  dolu kiremit, o da sayfanın işini bitiren eylem; diğer her düğme çerçeveli.
  (DESIGN-BELGE bunu "marka projesinde bayat ayna" olarak bize not etmiş.)
- Amber **#F59E0B** — markaya ait DEĞİL; yalnız arayüz uyarı kutuları.

## Kurallar
- **K31 · İşlevsel renkler (6 Eylül, OPS onayı).** Hüküm ve semantik kutu için **yeni renk
  üretilmez**; kırmızı icat edilmez, dördüncü palet rengi eklenmez. Ayrım **3 px sol kural +
  metin tonu** ile yapılır, geri bildirimin kendisi metindir (K7 tonu):
  - **YETER** → `--primary-navy`
  - **SINIRDA** → `--warn-amber`
  - **YETMEZ** → `--action-terracotta-deep`
  - **bilgi** → `--brand-cyan-ink`
  - "başarı" ayrı kutu değildir — YETER onu karşılar.
  **Sınır (K5 gevşemez):** kiremit-deep bu kutularda **dolu zemin olarak ASLA** kullanılmaz;
  yalnız 3 px sol kural ve metin tonu olarak görünür. Dolu kiremit sayfanın tek ana eylemidir.
- **K31-a · Mobil alt sekme çubuğu.** Dört sekme ve adları bilgi mimarisidir (K19, sahibi
  DESIGN-MENU): Ana sayfa · Ürünler · Teklif · Hesap. Kimlik tarafı yalnız **hâl rengi**:
  - **Seçili** — ikon ve etiket `--text-strong` (beyaz zeminde 14.11), üstünde 2 px lacivert kural
  - **Seçilmemiş** — `--text-muted` (4.83 beyazda · 4.67 `--surface-subtle` üstünde)
  - Turkuaz seçili hâl rengi **olamaz**: ham turkuaz açık zeminde 4.08, eşiğin altında (K25).
    Kiremit de olamaz (K5). Sekme sayacı gerekiyorsa rozet kuralı geçerlidir (K30 hüküm sınıfı).
  - Sönük sekme işareti dosyadan gelir: `venthub-isaret-soluk.svg` (K23).
- **K30 · Rozet tonu üç sınıf (6 Eylül, Menü envanterinden — 115 kullanım).** Rozet veri taşır
  ya da hüküm bildirir; ikisi aynı tonda yazılmaz. Hepsi büyük harf, Plex Mono, yarıçap 0:
  - **Nesnel** (`UL-94` · `ErP` · `IP54`) — zemin YOK, 1 px `--border-control` kenar, metin
    `--text-body` (7.53). Veri hüküm gibi okunmamalı: standart sistemin önerisi değildir.
  - **Hüküm** (`ÖNERİLEN`) — dolu `--brand-cyan-ink` zemin + beyaz metin (5.65).
  - **Soluk** (`DEĞERLENDİRİLEMEDİ` · `ARŞİV`) — `--surface-inset` zemin + `--text-muted`
    metin (4.83, kart üstünde). Alfa yok (K22).
  **Kiremit rozette kullanılmaz** (K5: kiremit sayfanın tek ana eylemi, rozet tıklanmaz).
  **Ham turkuaz da kullanılmaz** (K25: küçük metinde AA geçmiyor).
- **K32 · Ürün fotoğrafı kutusu (6 Eylül, emir #7 kalem 3 — kılavuz F5).** Kutu: beyaz yüzey,
  1 px `--border-hairline` kenar, yarıçap 0, gölge yok; fotoğraf beyaz fonlu, kutu içinde
  ortalanır, **koyu zemine konmaz**. **Fotoğraf yoksa kutu kaldırılır** ve kart 2 px lacivert
  üst kural ile başlar — boş kutu, "görsel yok" yazısı ve yer tutucu ikon bırakılmaz (K7).
  Yasak: filtre, gri-ton, hover dönüşümü, ölçek/parlaklık oyunu, alfa (K22). **Fotoğrafın
  üstüne rozet/etiket/metin bindirilmez** — rozet kutunun altındaki metin bloğunda durur.
  Kutu oranı ve kart ızgarası yerleşimdir, sahibi DESIGN-MENU (K11); kimlik tarafı kenar tonu,
  beyaz zemin, boş kutu yasağı ve üst kural kuralıdır.
- **K33 · Yarıçapın tek istisnasının sınırı (6 Eylül — kılavuz F6).** `--radius-panel` 8 px
  **yalnız yüzen panelin üst iki köşesi** (teklif paneli, mobil alt panel); alt köşeler 0,
  panel ekran kenarına oturur. **Panelin içindeki hiçbir öğe yarıçap almaz** — düğme, giriş,
  kart, rozet, çip 0 kalır. Gölge yok: yüzme 1 px kenar + `rgba(26,43,74,0.45)` perde +
  perdenin altında kısılmış **gerçek** kabukla anlatılır (boş perde çizilmez). Panel içindeki
  tek dolu kiremit düğme sayfanın işini bitirir, fiil "Teklif talebini gönder" (K5).
  İstisna genişletilmez; yeni bir bileşen 8 px isterse ayrı karar turudur.
- **K34 · Mono bölüm etiketi (6 Eylül — kılavuz F7).** IBM Plex Mono, büyük harf, boy
  **9 · 11 · 12 px**, harf aralığı **0.08–0.14em** (boy küçüldükçe artar), sayı taşıyorsa
  `tabular-nums`; etiket sarmaz, kısaltılır. **Renk zemine göredir:** açık zeminde turkuaz
  etiket `--brand-cyan-ink` (ham #0088B0 beyazda 4.08, kullanılmaz) · kart üstünde ikincil
  etiket `--text-muted`, sayfa zemininde `--text-body` · koyu bantta
  `--text-on-dark-muted` · `--surface-dark-inset` üstünde **beyaz** (muted ink orada 4.45).
  Büyük harf yalnız etiket ve rozete aittir; **marka ve ürün adı büyük harfe çevrilmez.**
- **K35 · P-Q eğrisi çizim dili (6 Eylül — kılavuz F8).** Üç çizgi ağırlığı: ana eğri 2 px
  lacivert · ikincil seri 1.5 px turkuaz · ızgara 1 px `--border-row`, eksen 1 px
  `--border-control`. Dördüncü seri gerekirse **kesikli lacivert**, yeni renk eklenmez.
  **Çalışma noktası kiremittir:** 5 px dolu daire + 1 px düşey iniş + mono etiket; grafikteki
  tek kiremit odur, eğri asla kiremit çizilmez (K5). Yasak: alan dolgusu, gradyan, gölge, 3B,
  yuvarlatılmış uç, animasyonlu çizim, ok başı. Birim etikette yazılır (m³/h · Pa), eksende
  tekrar edilmez. Ölçü **520×260** masaüstü / **330×200** mobil; mobilde ikincil seri düşer,
  çalışma noktası düşmez. Verisi olmayan modelde eğri çizilmez, hüküm de verilmez (K7).
- **`--surface-dark-inset` #24395C** — koyu bant içinde gömülü alan (arama kutusu).
  Lacivert banttan yalnız 1.22 ayrılır; kenar veya konum olmadan tek başına okunmaz.
  Üstünde metin **beyaz** olur (11.57) — muted ink 4.45 ile eşiğin hemen altında.
- **K23 · Logo elle çizilmez.** Tek kaynak `brand/logo/` (30 SVG). Koyu zeminde
  `venthub-isaret-tamrenk-koyu.svg` (kiremit · beyaz · beyaz · turkuaz). **Sönükleştirme de
  dosyadan gelir** — `filter: grayscale()`, `opacity` veya çalışma anında renk değişimi yok:
  `venthub-isaret-soluk.svg` (#7A8290, açık zemin) · `venthub-isaret-soluk-koyu.svg` (#8FA2BD).
  Mevcut CSS
  çizimleri (DESIGN-MENU kabuk, DESIGN-BELGE belge kabuğu) kendi turlarında SVG'ye döner;
  kod tarafı `public/brand/` altından okur. Yeni yazılan hiçbir yerde elle çizilmez.
- **K22 · Durum alfa ile anlatılmaz.** `opacity` kullanılmaz; soluk hâl için soluk hex +
  zemin + rozet. Metin daima tam opaklıkta. İstisna yalnız `<img>` şeritleri.
- **Köşe yarıçapı yok, gölge yok.** Derinlik yüzey tonu + 1 px kenarla anlatılır.
  (15A tasarım sözleşmesi ölçümü: yarıçap 0, gölge yok; istisna yalnız logo dairesi %50 ve
  teklif paneli 8 px. DESIGN-BELGE kimlik bloğu da aynı hükmü taşıyor.)
- 16 px'te dilimler düz (kanatçık profili düşer).
- Koyu zeminde **ikinci ve üçüncü** dilim beyaza döner (kiremit · beyaz · beyaz · turkuaz).
- Koruma alanı: işaret yüksekliğinin yarısı.
- En küçük: ekranda 16 px işaret / 96 px kilit; baskıda 6 mm işaret / 25 mm kilit.
- Yanlış kullanım: döndürme, renk değişimi, gövdeye fotoğraf, yazı tipi değişimi,
  kiremitin başka dilime kayması, gölge/hacim.
- Hareket: dilimlerin aşağı akışı; yalnız 48 px üstü, tek 2–3 sn döngü, ilk görünümde.
  Favicon, evrak, baskı daima statik.

## Site kabuğu
- **K36 · C bölümünün kapsamı (6 Eylül).** Kılavuz C bölümündeki kabuk çizimleri **kimlik
  provasıdır, ekran değildir** (kart başlıklarında yazılı). Bağlayıcı olan: koyu bant + aydınlık
  gövde, bant ölçüsü 74 px / 40 px oluk / 30 px öğe arası, sayfada tek dolu kiremit eylem,
  logonun dosyadan gelmesi (K23), koyu bantta ikonun koyu sürümü. **Bağlayıcı olmayan:** menü
  kalemleri, arama konumu, sekme sayısı, genel yerleşim — ekran ve bilgi mimarisi
  DESIGN-MENU'nün (K11 · K19), ölçülü hâli Menü v17. Çizimler v15/v17 ölçümünden önce yapıldı,
  ölçü iddiası taşımaz; "kılavuzda böyleydi" gerekçesiyle ekrana referans edilmez.
- Sitede tek koyu ton: lacivert. **Header ve footer koyu, sayfa gövdesi aydınlık.**
- Kiremit sayfada tek sıcak nokta: logo + ana eylem butonu.
- Menü kalemleri **bilgi mimarisidir, sahibi DESIGN-MENU** (K11) — burada liste tutulmaz.
  Ölçülen son hâl (Menü v15 ekran 01): Ürünler ▾ (açılır panel) · Ürün Seçici · Bilgi Merkezi ·
  arama · TR/EN · İletişim · **Teklif (n)** · hesap. K5: header sağında eylem öğesi **tek**,
  o da "Teklif (n)" (Apple çanta paneli; Favorilerim panel içinde).
  **Sepet, favoriler ve hızlı sipariş YOK** — teklif odaklı akışta fiyat/stok/sepet olmaz.
  (Eski kaydımdaki "hızlı sipariş, favoriler, sepet" satırı bayattı, 6 Eylül'de düzeltildi.)
- Kategori şeridi varyantı 1440'ta (lacivert veya beyaz zemin); açılır panel mobilde kalır.
- **Marka listesi — 7 marka, bu sıra ve yazımla** (OPS ölçümü, 5 Eylül): Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva.
  İlk beşinin katalogda ürünü var (Vortice 173 · SEAT 81 · AVenS 51 · Nicotra Gebhardt 35 ·
  Danfoss 35); Casals ve Flexiva temsil edilen ama ürünü 0 (`src/data/brands.ts`).
  **Storm marka DEĞİL** — SEAT ürün serisi, listeden çıktı.
  **Yazım veriden gelir ve büyük harfe ÇEVRİLMEZ:** Vortice · SEAT · AVenS · Nicotra Gebhardt ·
  Danfoss · Casals · Flexiva. `text-transform: uppercase` marka adına uygulanmaz — "AVenS"
  büyük harfe çevrilince "AVENS" olup camel case'i kaybediyor, bu VENTHUB yazımıyla aynı sınıf
  hatadır. Büyük harf yalnız **etiket ve rozetlerde** ("ÜRÜN GRUBU OLAN MARKALAR", `UL-94`),
  marka ve ürün adlarında değil.
  Ürünsüz ikisinin vitrinde görünmesi K1 kapsamında ayrı soru, kılavuz kararı değil.
- Hero sayıları ve etiket alanı **yer tutucu**: [marka] / [ürün] / [teslim].

## Kategori ikonları (altı, 48 ve 24 px, tam renk + tek renk lacivert)
1. **Fan** — salyangoz gövde + göbek/nokta + turkuaz hava çıkış ağzı. ONAYLI.
2. **Sığınak** — kategori ve senaryo TEK TİP: kemerli oda + figür + filtreli boru
   (senaryo çizimi kazandı, eski kütle+baca çizimi bırakıldı). Aynı işaret her yerde.
2b. **Sessiz fan** — İKİ SÜRÜM DE ONAYLI, yerine göre kullanılır:
   **T2** (fan gövdesi + çıkış ağzının sağında hoparlör) menü/şeritte birincil;
   **R2-B** (halka + kanat + disk içinde hoparlör) kare alan gerekince.
3. **Hava perdesi** — üst bar + aşağı inen değişken boyda jetler (90° dönüş ritmi). ONAYLI.
4. **Nem alma** — gövde + ızgara + turkuaz hazne + damla. ONAYLI.
5. **Isı geri kazanım** — Tur 32 · aday B ONAYLI: **kasa + ortada baklava dilimi eşanjör
   nüvesi + yatay çapraz akış**. Her akış bir uçtan girer, nüvede kat değiştirir, öbür uçtan
   çıkar; dört kanal ağzı kasanın iki ucunda görünür. Nüve beyaz baklava dilimi, içinde
   lacivert delik; nüvenin çevresinde bir de **lacivert boşluk halkası** var — akışlar tek renge
   düştüğünde dilimin ayrı okunmasını o sağlar (delik 34 px altında düşer, halka kalır).
   Çapraz kanallar halkayı geçecek kadar uzun olmak zorunda: genişlik kutunun **%66'sı**
   (%44'te halka ikisini de tamamen kapatıyordu — kesişme görünmez oluyordu). Görünür pay
   48'de 3.1 px, 24'te 1.6 px. Halka veya çapraz ölçüsü değişirse bu payı yeniden ölç.
   Bütün parçalar kutunun tam merkezinden türetilir, koordinatlar yuvarlanmaz (0.5'e yuvarlama
   kasa, halka ve deliği üç ayrı merkeze düşürüyordu). Ölçüler kutunun oranı olarak:
   kasa yüksekliği %72, ağız %38×%13 (dış kenar merkezden %24, iç kenar %11),
   çapraz %66×%13 ±51°, halka %48, nüve %40, delik %18 (34 px altında düşer).
   Kasa halkayı içine almak zorunda: halkanın yarı köşegeni %33.9, kasanın yarı yüksekliği %36.
   %66 kasa yüksekliğinde halkanın üst ve alt köşesi dışarı taşıyordu. Eski çizim (yalnız çapraz kanal + ok başları)
   bırakıldı — şematik kalıyordu, kasa ve nüve yoktu.
   Adaylar: `ARSIV Venthub Isi Geri Kazanim Alternatifleri.dc.html` (A onaylı+kasa+nüve, B seçildi,
   C iki fan, D dilim ritmi).
6. **Hava arıtma** — dik gövde (nem alma ile aynı ölçü), tepede yatay yarık, **ortada turkuaz
   zikzak filtre hattı (pile)**, altta beyaz ızgara; solda üç boyda zerre girer, sağda iki kısa
   turkuaz çizgi çıkar. Organizma/bakteri çizimi YOK. ONAYLI.
- Hava anlatımı ok işaretiyle değil dilim/jet ritmiyle. Kiremit ikonlarda yok.

## Dosyalar
- `1 Venthub Marka Kilavuzu.dc.html` — **TEK TESLİM DOSYASI**. Bölüm A logo sistemi,
  B kategori ikonları, C site kabuğu, D dosya listesi, E birleştirme kararları,
  **F desen kuralları** (F1 kenar kademesi · F2 rozet · F3 işlevsel renkler · F4 mobil alt
  çubuk · F5 fotoğraf kutusu · F6 panel yarıçapı · F7 mono etiket · F8 P-Q eğrisi).
  (Eski `Teslim Seti` ve `Kimlik Uygulamasi` dosyaları bunun içinde birleşti, silindi.)
- `ARSIV Venthub Logo.dc.html` — ARŞİV: logo arama turları (14A/15A/16 serileri)
- `ARSIV Venthub Sessiz Fan Alternatifleri.dc.html` — ARŞİV: sessiz fan turları (A…T2), satır silinmez
- `brand/icons/` — 144 SVG: 16 ikon × 64/48/24 px × tamrenk / lacivert / koyu. GEÇERLİ SET.
- `brand/logo/` — **30 SVG**, kılavuz Bölüm D adlandırmasıyla: işaret 9 (yedi sürüm + iki
  soluk) · yatay kilit 7 · dikey kilit 7 · favicon 4 (16 · 32 · 180 · 180-zemin) · avatar 2 ·
  paylaşım 1.
  **Koyu zemin dizilimi ÖLÇÜLDÜ:** kiremit · beyaz · beyaz · turkuaz — ikinci VE üçüncü dilim
  beyaza döner (kılavuzda 14 yerde böyle). Yalnız laciverti çevirmek yetmiyor.
  **Wordmark yola çevrilmedi**, kilitlerde `<text>` olarak kalır; Archivo yüklü olmalı.
  Prova: `3 Venthub Logo SVG Provasi.html`. Ölçülü fark: 16/32 px'te dilim aralığı var (favicon uygular),
  ana çizimde yok (işaret ve kilit onu izler).
- `handoff/README.md` — Claude Code devir paketi: tokenlar, davranış kuralları, varlıklar,
  depoya alma adımları, bilinçli eksikler. `brand/` klasörüne referans verir, kopyalamaz.
- `2 Venthub Ikon SVG Provasi.dc.html` — SVG provası: açık/koyu zemin, iki ölçü, iki sürüm
- `ARSIV svg eski/` — ESKİ, altı ikon × 48/24 px × tam renk / tek renk lacivert;
  sessiz fan iki sürüm: `-t2-` ve `-r2b-` ekli
- Dosya adı düzeni: `venthub-[parca]-[dizilim]-[surum].svg`, Türkçe karakter yok

## Menü projesi ile birleştirme (be615496 · Broadsheet)
- Ortak zemin: turkuaz **#0088B0** iki projede de birebir aynı.
- **KARAR**: site header'ı ve ürün logoları bizim tasarımımız — koyu lacivert band,
  işaret 14A-3 + Archivo wordmark. Broadsheet'in açık zemin + kural çizgisi düzeni kullanılmaz.
- Menü projesi gerçeği: 7 kategori · 9 senaryo · 375 ürün (canlı ölçüm). **"26 dal" sayısı
  ölçülmemiş** (REC-135'te tartışmalı: 13 `parent_id null` vs 7) — burada kural değil,
  bilgi mimarisi DESIGN-MENU'nün, tekrar edilmez.
  Arayüz ikonu konturu **bizim kaydımızda tutulmaz** (K23-a): değer 1.5, sözleşme v1 ölçümü,
  sahibi DESIGN-MENU. Bizim kategori/senaryo ikonlarımız dolu iki renkli, konturu yok.
  (Eski kayıtlarımızdaki 1.4 ve README'deki 1.6 bayat.) Source Serif 4 tek aile,
  ikinci vurgu macenta #D6006C.
- **KARAR · yazı tipi**: iki aile birden. Archivo → menü, buton, ürün kartı, teknik tablo, filtre.
  Source Serif 4 → yalnız uzun açıklama metinleri (kategori ve senaryo yazıları).
  Dördüncü aile eklenmez (Archivo'nun tabular rakamı var).
- **KARAR · macenta #D6006C kaldırıldı.** Kiremit tek sıcak nokta olarak kalır.
  Grafiklerde: eğri lacivert, ikincil seri turkuaz, çalışma noktası kiremit.
- **AÇIK FİKİR**: Hava Arıtma için yeşil sayfa vurgusu — logoya girmez, o kategori
  taksonomiye gerçekten eklenince kategori rengi olarak denenecek. Sarıya kaçan koyu yeşil
  (turkuaz tonu gibi görünmemeli).
- **KARAR · ikon kapsamı: 16 ikon, üç boy.** 7 kategori + 9 senaryo, hepsi bizim dolu iki renkli
  dilde. **Ölçü (OPS, 5 Eylül): 64 + 48 + 24 px** — hangisinin nerede kullanılacağı uygulama
  aşamasında görerek kararlaştırılır. 64 px, 48 px geometrisinin birebir vektör ölçeği.
  K2 ile teyitli. **K4 ayrımı:** sitede senaryo listesi 8 görünür (Atıksu Arıtma ve Hava Arıtma
  menüde/sayfada yok); ikon seti 9 kalır, Hava Arıtma ikonu ürün gelince açılır. Set eksilmez.
  **Alt dallar için ikon çizilmez** — 22 px'te ayırt edilemez (fan dalları yalnız çark tipiyle
  farklı); dal seviyesinde ayırt ediciliği öncü serinin ürün fotoğrafı sağlar (867 fotoğraf var).
  Senaryolar ikon alır çünkü hiç görselleri yok ve anlamca birbirinden uzak.
- **KARAR · Hava Arıtma kategori vurgusu: yeşil A #3D7A1E** (zeytin yeşili).
  Markaya ait DEĞİL, palete dördüncü renk olarak eklenmez, logoya girmez.
  Yalnız Hava Arıtma kategori sayfalarında: header altı şerit, bölüm etiketi, o kategorinin çipleri
  ve ikon havası. Menüde, hero'da, butonlarda yok. Ölçüm: beyaz metin 5.25:1, etiket 5.07:1 (AA geçer);
  gri dönüşümde turkuazdan 1.29 kat ayrı — tek renk baskıda vurgu zayıflar, o yüzden baskıda
  kategori vurgusu kullanılmaz. `ARSIV Venthub Yesil Vurgu.dc.html` çalışmasında dört aday ve ölçümler.
- Diğer altı kategori de renk isterse kategori renk sistemi ayrı karar olarak açılır.
- 7 kategori ikonu çizildi: `KAYNAK Venthub Kategori Ikonlari.dc.html` (dördü yeni).
- 9 senaryo ikonu çizildi: `KAYNAK Venthub Senaryo Ikonlari.dc.html` — Tur 31 güncel; sektör değil
  hava problemi ve çözümü anlatır. Atıksu arıtma çıktı, yerine hava arıtma geldi.
- Karıştırma: kategori ikonları ve senaryo ikonları kılavuzun B2/B3/B4 kartlarında.
  **SVG üretimi henüz yapılmadı** — `ARSIV svg eski/` klasöründeki altı ikon eski settir.
- `ARSIV Venthub Isi Geri Kazanim Alternatifleri.dc.html` — Tur 32 dört aday, B onaylandı
- `ARSIV Venthub Karsilastirma.dc.html` — altı çelişki yan yana, kaynaktan birebir.

## Depo birleştirme ÖNERİLERİ (peckop/venthub-hvac-esite · 3 Eylül 2026)

> **Statü (OPS, 5 Eylül): bunlar KARAR değil ÖNERİ.** Kod tarafı REC-147 fark dosyasıyla
> karar alır; uygulama sırası ve "tek seferde mi" sorusu Recep'te (yapısal). Design kod
> tarafına dokunmaz: design system'in iki ayağı var — (a) çip tarafı benim, (b) `tokens.js`
> + `index.css` OPS/URUN'un. İkisi aynı sözleşme JSON'undan beslenir.
- **Palet**: marka paleti kazanır. `--brand-cyan` → #0088B0, `--primary-navy` → #1A2B4A.
  Depodaki eski değerler (#22D3EE cyan, ~#1E4FAF navy) değiştirilir.
- **Tema**: vitrin aydınlık gövde + koyu lacivert header/footer. Deponun bugün hangi kurguyu
  kullandığı **ÖLÇÜLECEK** — "koyu-mod-birincil terk edilir" cümlesi ölçülmemiş iddiaydı,
  geri alındı (OPS düzeltmesi 5 Eylül). Admin ayrı karar.
- **Yazı tipi — KAPALI**: Archivo (arayüzün tamamı) + Source Serif 4 (yalnız uzun açıklama
  metni) + IBM Plex Mono (model kodu, etiket). **Inter kaldırılır** — `src/app/layout.tsx`
  içindeki `next/font/google` tanımı Archivo'ya çevrilir, `--font-sans` değişkeni aynı kalır.
  Dördüncü aile eklenmez.
- **Kiremit**: yeni `--action-terracotta` #D95D0E tokeni eklenir; depodaki `gold-accent` #D97706
  dokunulmaz.
- Depo düzeni: renkler `src/index.css`'te HSL üçlüsü custom property, `tailwind.config.js`'te
  `hsl(var(--x) / <alpha-value>)` eşlemesi; renk dışı tokenlar `src/design-system/tokens.js`.
  `brand/` paketi bu biçime uyar.

## DURUM (3 Eylül 2026 · buradan devam)
Tamamlanan:
- Marka kılavuzu Bölüm A–E tamam ve çelişkisiz: A logo sistemi · B ikonlar (B2 yedi kategori,
  B3 dokuz senaryo, B4 kapsam) · C site kabuğu · D dosya listesi · E birleştirme kararları
  (E1 yazı tipi rolleri, E2 wordmark yazımı, E3 macenta kaldırıldı, E4 taksonomi, E5 yeşil
  #3D7A1E + sayfa provası, E6 Broadsheet'ten alınmayanlar).
- 16 ikon çizildi (7 kategori + 9 senaryo). Senaryo ikonları Tur 31.
- Yeşil A #3D7A1E onaylandı, kılavuza girdi.

Bekleyen işler (sıra):
1. ~~16 ikonun SVG üretimi~~ **TAMAM** — `brand/icons/` içinde **144 dosya**:
   16 ikon × 64/48/24 px × üç sürüm (tamrenk / lacivert / koyu). 64 px 5 Eylül'de eklendi
   (OPS: 48/24 kalır + 64 üretilir); 48 geometrisinin birebir vektör ölçeği, yeni elle ayar yok.
   Adlandırma
   `venthub-[kat|sen]-[ad]-[px]-[surum].svg`. CSS kaynağından otomatik çevrildi, uyarı yok.
   Kaynak: kategori light + `#kdark`, senaryo `#r48`/`#r24` + `#rdark` (Tur 31).
   Prova: `2 Venthub Ikon SVG Provasi.dc.html`. Eski `ARSIV svg eski/` klasörü geçersiz, depoya girmez.
   Koyu lacivert header/footer içinde **koyu** sürüm kullanılır — tamrenk sürüm 1.31:1 kalır.
   Tek renk lacivert sürümde turkuaz kapsama duyarlı çevrilir: lacivert gövde İÇİNDEKİ turkuaz
   beyaz knockout olur, sayfa zeminindeki turkuaz laciverte döner. Kör hex değişimi yapılmaz —
   yoksa Isı geri kazanım kanalı, Hava şartlandırma serpantini ve Kontrol kadranı yok oluyor.
   ATEX düzeltmeleri (3 Eylül): altıgen düzgün oldu (yükseklik = genişlik × 0.866, dikey merkez
   sabit); dönüştürücü artık `transform-origin`'i okuyor — önce yok sayıldığı için 24 px'te üç
   fan kanadı kendi merkezinde dönüp tek çubuğa yığılıyordu; fan+kıvılcım takımı altıgen
   merkezine kaydırıldı (96'da +4/−2, 48'de +2/−0.5, 24'te +0.5/−0.5); mono eşleme artık
   conic-gradient'i de okuyor — önce atlandığı için lacivert sürümde kanatlar `fill="null"`
   olup kayboluyordu.
   Dönüştürücü `tools/icons-to-svg.js` içinde; yeniden üretim için onu eval edip kullan.
2. **Ana sayfa tasarımı — BU PROJEDE DEĞİL.** 15A projesinde çizilir (yukarıdaki düzeltme).
   OPS ana sayfa sorularının cevaplarını REC-129'a yazmış; Recep 15A'ya yapıştıracak.
3. ~~`brand/` klasörü~~ **TAMAM (5 Eylül 2026)** — `brand/` içinde `tokens.css` (HSL üçlüsü,
   depo düzeni) + `tailwind-brand.js` (theme.extend eşleme parçası) + `README.md` (palet,
   yazı tipi rolleri, logo, ikon, kabuk, depoya alma adımları, bilinçli eksikler) + 96 SVG.
   Depoya elle eklenecek; yazma yetkim yok.

Birleştirme yöntemi (kararlaştırıldı): menü projesinin bilgi mimarisi korunur (7 kategori,
alt dallar, teklif odaklı akış — fiyat/stok/sepet yok), kabuk bizim olur. Dal sayısı
burada yazılmaz (ölçülmemiş).

**DÜZELTME (Recep 3 Eylül ~19:10, REC-129 yorumu):** sitenin TAMAMI 15A projesinde
("E-ticaret menü tasarımı", be615496…) çizilir — menü, ana sayfa, kategori, ürün, teklif
listesi. **Bu proje yalnız kimlik kaynağıdır**; 15A referans olarak bağlar. Eski not ("yeni
ekranlar bu projede açılır") geçersiz. Ana sayfa briefi 15A'ya taşındı, buradan silindi.

## Şerit kimliği ve yazma sınırı (K · 4 Eylül #5 · 5 Eylül)
- Bu projenin şerit adı **DESIGN-MARKA**. Üç Design şeridi var: DESIGN-MENU (Vitrin 15A) ·
  DESIGN-MARKA (kimlik) · DESIGN-BELGE (Kurumsal Belgeler).
- **Linear projem: "Marka Kılavuzu (DESIGN-MARKA)".** Kayıt **REC-149** oraya taşındı
  (OPS, 5 Eylül); tur sonu yorumlarım o projeye düşer. Vitrin 15A'ya yazılmaz.
- Linear'a yazılan her yorum imzalanır: `— DESIGN-MARKA (model adı) YYYY-MM-DD`.
- **Yazma sınırı:** Linear'a karar / iş / durum YAZILMAZ. İzin verilen tek şey **tur sonu tek
  Linear yorumu**. Karar belgesine yazılmaz. Her şerit yalnız kendi Linear projesine yazar.
- Okunur: GitHub · canlı site · sitemap · Linear · Supabase (yalnız SELECT).
- **Çıktı DOSYA olarak yazılır. Linear yorumu OPS'a ULAŞMAZ** — OPS'un bash tarafında Linear
  anahtarı yok, yalnız Design projelerinin dosya gözcüleri canlı (Marka'nınki 5 Eylül'de
  eklendi). Öneri, soru, teslim: hepsi bu projeye dosya olarak iner; Linear yorumu ikincildir
  ve tek başına iletişim sayılmaz. (5 Eylül'de iki Linear yorumu yazdım, ikisi de ulaşmadı.)
- **Teslim kuralı (OPS, 5 Eylül): her teslim = DOSYA + Linear yorumu.** İkisi birlikte,
  biri diğerinin yerine geçmez. Dosya OPS'un gözcüsünü uyandırır; yorum kaydın izini bırakır.
  OPS yorum yazıldığında uyanmaz — dosya olayı gelince Linear'a bakar. OPS sohbeti GÖREMEZ.
- **Recep "Linear" derse:** bu projenin yorumlarını yeniden eskiye oku, OPS imzalı son yorumu
  emir say. Tetik kelimesi "posta" değil **"Linear"** (OPS hükmü).
- Recep'e yalnız **karar sorusu** gider (yapısal ya da ticari); mekanik soru OPS'a.
  Recep'in sohbette söylediği karar değildir — OPS Kararlar belgesine yazınca karar olur.
- Başka Design projesinin dosyasını **oku, yazma**. Oraya yazım OPS üzerinden.
- Yoruma saat yazılmaz; Linear damgası geçerlidir.
- Tur sonu yorumuna **hangi `/` yeteneğini kullandığımı** yazarım.
- Protokolün tamamı: `ops-iletisim-protokolu.md` (OPS yazdı, üç Design şeridinde aynı).

## Bu şeritte kullanılacak yetenekler (OPS hükmü, 5 Eylül)
- Çip: **VentHub** · Şablon: Blank
- Kullanılır: **Create design system** (DS projesinde) · Handoff to Claude Code (`brand/` paketi)
  · Save as PDF (kılavuzun basılı hâli) · Make a deck (marka sunumu, Recep isterse)
- Kullanılmaz: Color + type pairing (palet karar verildi) · Frontend design (kod tarafı URUN'un)

## VentHub Design System projesi (OPS açtı, 5 Eylül)
- Kimlik: `31b0824c-8d7e-4a4c-94c7-8c094a1c62b7` · tür PROJECT_TYPE_DESIGN_SYSTEM doğrulandı.
- **DESIGN-MARKA'nın ikinci projesi**, aynı şerit; yazma sınırım o projeyi kapsar.
- Tohum kondu: kök `styles.css` (= `brand/tokens.css` birebir) · `brand/` · sözleşme JSON ·
  iletişim protokolü.
- **Bakım:** kılavuz (CLAUDE.md) kaynak, design system türev. Tazeleme DESIGN-MARKA, tetik OPS.
- **Değerlerin kaynağı:** CLAUDE.md kararı + `tasarim-sozlesmesi-v1.json` ölçümü. Sıfırdan icat
  yok. İkisi çelişirse **sözleşme kazanır** (ölçüm). Bugün çelişmiyorlar — iki proje birbirinden
  habersiz aynı üç hex, aynı üç aile, yarıçap 0, gölge yok değerlerine varmış.
- **Tek değer dosyası:** `tokens.css` = DS kökü `styles.css` = depoya giden dosya. Üç kopya YOK.
  Kılavuz = karar (niçin) · sözleşme JSON = ölçüm (DS'i denetler, DS'den TÜREMEZ).
- DS kökü ve README'ye `kaynak_updatedAt` + `sozlesme_updatedAt` damgası konur.
- **UI kit tam ekranları DS'e girmez** (K11: ekran kaynağı DESIGN-MENU). Yalnız kabuk ekranı:
  koyu header + aydınlık gövde + footer, içerik boş.
- **DS KURULDU (5 Eylül).** Ölçüm: `assets/icons` 144 · `assets/logo` 28 · `tokens/` dört
  dosya (değerler `brand/tokens.css` ile birebir) · 20 foundation kartı · **tam altı bileşen**
  (AnaEylemDugmesi · CerceveliDugme · Kart · Cip · TeknikTablo · KabukBandi; uydurma yok) ·
  yalnız kabuk ekranı · `SKILL.md` · kök `styles.css` yalnız @import + üç damga
  (`kaynak_updatedAt` · `karar_updatedAt` · `sozlesme_updatedAt`).
- **YAYINDA (5 Eylül).** Recep Published'ı işaretledi ve **org default** yaptı — yeni her proje
  çipi VentHub açar. Bu projede çip bağlı: `_ds/venthub-design-system-31b0824c…`,
  damga `kaynak_updatedAt 2026-09-05T13:03:31Z`. **Üç projede de çip çevrildi** (Marka ·
  DESIGN-MENU · DESIGN-BELGE — Recep, 5 Eylül); org default yeni projeler için.
  **DS'in kendi projesinde çip seçilemez** — kaynak kendine bağlanmaz, "Failed to update"
  hatası doğru davranış.
- **Bağlı kopya kendiliğinden tazelenmiyor (ÖLÇÜM, 5–6 Eylül).** DS'te varlık/bileşen değişince
  Published tikinin durması yetmiyor: tüketici projedeki `_ds/…` kopyası eski kalıyor.
  **Tazeleme yöntemi: çip seçimini kaldır, tekrar seç.** Ölçüm: soluk işaret + `Kart` düzeltmesi
  (16:40) tik dururken üç projeye de gitmedi; yeniden seçince readme 30 SVG / 174 varlık /
  kapsam dışı 6.47:1 ve bundle'daki koşullu `borderTop` göründü. DS readme'sindeki "tik durduğu
  sürece kendiliğinden gider" satırı bu ölçümle çelişiyor.
- **Tazelik nasıl ölçülür:** `kaynak_updatedAt` damgası İŞE YARAMAZ — kılavuz dosyasının
  tarihini izler, yayın saatini değil (kaynak değişmeyen turlarda sabit kalır). Bakılacak yerler:
  bağlı `readme.md` metni (yeni kural/varlık geçiyor mu) ve `_ds_bundle.js` içindeki bileşen
  kodu. **`assets/` bağlı kopyaya HİÇ girmez** — yalnız `tokens/`, bundle, manifest, readme,
  styles.css gelir; varlık yokluğu bayatlık kanıtı değildir, ikon/logo `brand/` veya DS
  projesinden alınır.
- **Sohbete eklenen DS özeti bilgi kaynağı DEĞİL.** O metin sohbet açıldığında alınan bir
  kopyadır; tur içinde DS değişse de güncellenmez (6 Eylül: özet 13:03:31Z gösterirken bağlı
  dosya 04:42:08Z idi). Ölçüm daima `_ds/…` altındaki **dosyadan** yapılır. Yeni sohbette özet
  kendiliğinden tazelenir; düzeltilecek bir şey yok.
- **Tüketici olarak kullanım:** her DC `<helmet>`'inde dört token CSS + `styles.css` +
  `_ds_bundle.js` yüklenir; bileşenler
  `<x-import component-from-global-scope="VentHubDesignSystem_31b082.X">` ile mount edilir.
  Kabuk gereken yerde `templates/kabuk/` şablonu kopyalanır, elle çizilmez.
- Sıra: DS önce, DENEY-MARKA projeleri sonra.
- **Handoff to Claude Code da bu projede:** `brand/` paketi + kurallar terminalin okuyacağı
  biçimde `handoff/` klasörüne DOSYA olarak bırakılır. Depoya yazan ben değilim; OPS çeker,
  REC-147 token farkının girdisi olur.
- Deney: `marka-deney-brief-1.md` burada kayıt, ama deney **üç geçici projede** koşar
  (DENEY-MARKA-1/2/3, kör). Bu projede o ikonlar çizilmez.
- OPS'a giden dosya adı düzeni: `design-marka-ops-notu-YYYY-MM-DD.md`.
- Karar SSOT'u Linear'dır. Bu dosya aynadır; çelişkide Linear kazanır.
  Kaynak kopya: 15A projesinde `kararlar-vitrin-15a-2026-09-04.md` — **K19'da kalmış, BAYAT.**
  Bugün K20–K23 eklendi; tam ayna yenilemesi OPS dışa aktarımıyla gelecek
  (`kararlar-vitrin-15a-2026-09-06.md`). O güne kadar geçerli olan: DS projesindeki
  `bayat-2026-09-05.md` + Linear.
- **Bayatlık sinyali kuruldu (OPS, 5 Eylül):** bir karar değişince OPS **dört projeye de**
  `bayat-<tarih>.md` bırakır (Marka · MENU · BELGE · DS — teyit edildi).
  **"Linear" turunun İLK işi o dosyayı okumaktır.**
- **Ölçü ayrımı:** "içerik 1060 px" **içerik sütunu** genişliğidir, kabuk bandının oluğu
  değil. Kabuk bandı tam genişlikte; iç oluk **40 px**, yükseklik **74 px**, öğe arası
  **30 px** (DESIGN-MENU Menü v15 ekran 01'den ölçüldü).
- **Kabuk bandının oluğu kendine ait olmak zorunda** — ortalanmış sütundan TÜRETİLMEZ.
  Ölçüm (DS, 5 Eylül): oluk (genişlik − 1060) ÷ 2 kurulduğunda 1440'ta 190 px veriyor ama
  **1060'tan dar her panelde sıfıra düşüyor**, logo kenara yapışıyor (911 px pencerede
  computed padding 0). Sabit 40 px her genişlikte korunur. Aynı hata kart iframe'inde de
  görünür (700 px'te sol ~2 / sağ ~12 px).

## Bekleyen iş — K27 · bileşen envanteri (OPS, 6 Eylül)
- **K27:** ekran DS'e girmez, tekrar eden desen DS'e çıkar. Sıra: envanter DESIGN-MENU ölçer →
  OPS eşik koyar (≥2 ekran) → **kimlik kuralları bana gelir** → DS bileşene çevirir → ekranlar
  o bileşenleri kullanmaya döner. MENU'ye envanter emri gitti (09-06 #4, yalnız ölçüm).
- **Benim payım TAMAM (6 Eylül).** Dokuz desenin kimlik kuralı yayınlandı: K30 rozet ·
  K31 işlevsel renkler · K31-a mobil alt çubuk · K32 fotoğraf kutusu · K33 panel yarıçapı ·
  K34 mono etiket · K35 P-Q eğrisi (+ K28 kenar kademesi, emir #6). Kılavuz **Bölüm F**
  (F1–F8) bunların sayfası. Yerleşim DESIGN-MENU'nün kalır; DS bileşenleri bu kurallardan
  türer. Arama şeridi için dördüncü token eklenmedi — `--surface-dark-inset` zaten var.
- Ekran dosyası güncel adı: **Menü Tasarımı v17** — Recep'in gösterdiği ekran budur.
  v17'de logo SVG `clip-path` 0 (K23) ve sayaç rozeti `--brand-cyan-ink` 73 kullanım (K25-b)
  ölçüldü, ikisi de temiz.

## Çalışma biçimi
- Yeni deneme **yeni satır** olarak eklenir; beğenilen bir sürümün üzerine yazılmaz.
- Küçük istekte yalnız istenen değişir; redesign istenmedikçe geometri korunur.

