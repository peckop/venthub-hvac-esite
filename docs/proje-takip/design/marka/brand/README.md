
# VentHub marka paketi

Kimlik kaynağı: **DESIGN-MARKA** projesi, `1 Venthub Marka Kilavuzu.dc.html`.
Karar SSOT'u **Linear**'dır (`kararlar-vitrin-15a-2026-09-04.md`, K1–K19); bu paket onun
dışa aktarımıdır. Çelişkide Linear kazanır.

## İçindekiler

| Dosya | Ne |
|---|---|
| `tokens.css` | Renk, yazı tipi, yarıçap tokenları — HSL üçlüsü custom property |
| `tailwind-brand.js` | `tailwind.config.js` `theme.extend` eşleme parçası |
| `icons/` | 144 SVG: 16 ikon × 64/48/24 px × üç sürüm |

## Palet

| Token | Hex | Rol |
|---|---|---|
| `--primary-navy` | `#1A2B4A` | Yapı, wordmark, header ve footer |
| `--brand-cyan` | `#0088B0` | Hava, vurgu — **zemin/kenar rengi**, küçük metin değil |
| `--brand-cyan-ink` | `#00708F` | Turkuazın metin ve sayaç zemini hâli (beyazda 5.65) |
| `--action-terracotta` | `#D95D0E` | Logo üst dilimi — **zemin rengi**, metin zemini değil |
| `--action-terracotta-deep` | `#BF5309` | Ana eylem düğmesi zemini (beyaz metinle 4.71) |
| `--accent-air-green` | `#3D7A1E` | Yalnız Hava Arıtma kategori sayfaları |
| `--warn-amber` | `#F59E0B` | Yalnız arayüz uyarı kutusu |

**Ham marka renkleri zemin/kenar rengidir, metin veya metin zemini değil (K25-b).** Metin ve
sayaç zemini için mürekkep tonları kullanılır: turkuaz yerine `--brand-cyan-ink` #00708F
(beyazda 5.65 · #F4F4F2'de 5.13), kiremit düğme zemini için `--action-terracotta-deep`
#BF5309 (beyaz metinle 4.71; ham #D95D0E yalnız 3.80 verir). `--brand-cyan-ink` **koyu zeminde
de kullanılmaz** (#1A2B4A 2.50 · #0F1723 3.18) — orada `--text-on-dark-muted` kalır.

`--text-muted` #6B7280 yalnız kart/beyaz yüzeydedir (4.83); sayfa zemininde küçük metin
`--text-body` ile yazılır (6.83; muted orada 4.39).

Kiremit **asla metin rengi değildir.** Her sayfada tek dolu kiremit düğme bulunur, o da
sayfanın işini bitiren eylem; diğer her düğme çerçevelidir (K5).

Tek fiil: **"Teklif iste"**. "Teklif al" yazımı kalktı.

Yeşil ve amber **palete dahil değildir** — kapsamı belli iki vurgudur, logoya girmez.
Macenta `#D6006C` sistemden kaldırıldı.

## Yazı tipi — üç aile, rol ayrımı katı

| Aile | Kullanım |
|---|---|
| **Archivo** | Arayüzün tamamı: wordmark, menü, düğme, ürün kartı, teknik tablo, filtre, form |
| **Source Serif 4** | Yalnız uzun açıklama metni (kategori ve senaryo yazıları) |
| **IBM Plex Mono** | Model kodu, belge no, teknik değer, bölüm etiketi |

Dördüncü aile eklenmez. **Inter kullanılmaz.** Archivo'nun tabular rakamı var, sayı
hizalaması için ayrı aileye gerek yoktur.

Wordmark: Archivo 700, harf aralığı `-0.03em`, her zaman **VentHub** (camel case).
`VENTHUB` ve `venthub` yazımları yasak — büyük harfli etiketin içinde bile camel-case kalır.

## Kenar ve yüzey tonları (K28)

Kenar yüzeyi ayıran tek araçtır — gölge yok, yarıçap yok. Dört kademe, hepsi 1 px:

| Token | Hex | Rol | Beyazda |
|---|---|---|---|
| `--border-control` | `#D8D8D4` | Düğme ve giriş kenarı | 1.43 |
| `--border-hairline` | `#E2E2DE` | Kart kenarı | 1.28 |
| `--border-row` | `#F2F2EE` | Tablo ve liste satır ayırıcısı | 1.12 |
| `--surface-inset` | `#EEEEEA` | Blok ayırıcı, gömülü alan, tablo başlığı | 1.20 |

Kademe **anlamlıdır, keyfi değil:** etkileşimli öğe kenarı (`control`) yüzey kenarından
(`hairline`) koyu, satır ayırımı (`row`) blok ayırımından (`inset`) açık. Bu sıra bozulursa
tablo satırları bloklardan ağır görünür.

`--surface-subtle` `#FBFBF9` kart içi ikincil bölgedir; beyazdan bir tık kırık (1.04) —
**tek başına sınır bildirmez**, 1 px kenarla birlikte kullanılır.

## Rozet tonları (K30)

Rozet **veri taşır ya da hüküm bildirir** — ikisi aynı tonda yazılmaz. Üç sınıf, hepsi büyük
harf, IBM Plex Mono, yarıçap 0:

| Sınıf | Ne | Ton | Ölçüm |
|---|---|---|---|
| **Nesnel** | Ürünün taşıdığı belge: `UL-94` · `ErP` · `IP54` | Zemin YOK · 1 px `--border-control` kenar · metin `--text-body` | 7.53 beyazda |
| **Hüküm** | Sistemin sözü: `ÖNERİLEN` | Dolu `--brand-cyan-ink` zemin · beyaz metin | 5.65 |
| **Soluk** | Veri yok ya da edilgen: `DEĞERLENDİRİLEMEDİ` · `ARŞİV` | `--surface-inset` zemin · `--text-muted` metin | 4.83 kart üstünde |

**Kiremit rozette kullanılmaz** — kiremit yalnız sayfanın tek ana eylemidir (K5); rozet eylem
değildir, tıklanmaz. **Ham turkuaz da kullanılmaz**: küçük metin ölçüsünde AA geçmiyor (K25),
hüküm rozeti mürekkep tonuyla yazılır.

Nesnel rozet zemin taşımaz çünkü **veri hüküm gibi okunmamalı** — `UL-94` bir standarttır,
sistemin önerisi değil. Soluk sınıfta alfa kullanılmaz (K22), soluk hex + zemin ile anlatılır.

## İşlevsel renkler (K31)

Hüküm ve semantik kutu için **yeni renk üretilmez** — kırmızı icat edilmez, palete dördüncü
renk eklenmez. Geri bildirimin kendisi metindir; renk yalnız **3 px sol kural + metin tonu**
olarak görünür.

| Hâl | Ton |
|---|---|
| **YETER** | `--primary-navy` |
| **SINIRDA** | `--warn-amber` |
| **YETMEZ** | `--action-terracotta-deep` |
| **bilgi** | `--brand-cyan-ink` |

"Başarı" ayrı bir kutu değildir — YETER onu karşılar.

**Sınır:** kiremit-deep bu kutularda **dolu zemin olarak asla** kullanılmaz; yalnız sol kural
ve metin tonu. Dolu kiremit sayfanın tek ana eylemidir (K5), bu kural gevşemez.

Hüküm metni suçlamaz, gerekçe verir: *"✗ Bu devirde YETMEZ — devri %77'ye çıkarın"*.
Verisi olmayanda hüküm verilmez: *"değerlendirilemedi · bu model için mühendisimize sorun"*.

## Mobil alt sekme çubuğu (K31-a)

Dört sekme ve adları bilgi mimarisidir (K19, sahibi DESIGN-MENU): Ana sayfa · Ürünler ·
Teklif · Hesap. Kimlik tarafı yalnız **hâl rengi**:

| Hâl | Ton | Ölçüm |
|---|---|---|
| **Seçili** | ikon + etiket `--text-strong`, üstünde 2 px lacivert kural | 14.11 beyazda |
| **Seçilmemiş** | `--text-muted` | 4.83 beyazda · 4.67 `--surface-subtle` üstünde |

Turkuaz seçili hâl rengi **olamaz** — ham turkuaz açık zeminde 4.08, eşiğin altında (K25).
Kiremit de olamaz (K5). Sekme sayacı gerekiyorsa rozet kuralı geçerlidir (K30, hüküm sınıfı).
Sönük sekme işareti `filter` ile değil dosyadan gelir: `venthub-isaret-soluk.svg` (K23).

## Yarıçap ve gölge (K33)

**Köşe yarıçapı yok. Gölge yok.** Derinlik yüzey tonu + 1 px kenarla anlatılır.
`box-shadow` kullanılmaz. İki istisna: logo dairesi `50%` ve **yüzen panelin üst iki
köşesi** `8px` (`--radius-panel` — teklif paneli, mobil alt panel).

**İstisnanın sınırı:** yalnız üst iki köşe; alt köşeler 0, panel ekran kenarına oturur.
**Panelin içindeki hiçbir öğe yarıçap almaz** — düğme, giriş, kart, rozet, çip 0 kalır.
Panelin yüzdüğü üç yolla anlatılır: 1 px kenar, `rgba(26,43,74,0.45)` perde ve perdenin
altında **kısılmış gerçek kabuk** (boş perde çizilmez). Panel içindeki tek dolu kiremit
düğme sayfanın işini bitirir: *"Teklif talebini gönder"* (K5). İstisna genişletilmez.

## Ürün fotoğrafı kutusu (K32)

Beyaz yüzey, 1 px `--border-hairline` kenar, yarıçap 0, gölge yok. Fotoğraf beyaz fonlu ve
kutu içinde ortalanır; kutu **koyu zemine konmaz**.

**Fotoğraf yoksa kutu kaldırılır** ve kart 2 px lacivert üst kural ile başlar. Boş kutu,
"görsel yok" yazısı ve yer tutucu ikon bırakılmaz (K7).

**Yasak:** filtre, gri-ton, hover dönüşümü, ölçek/parlaklık oyunu, alfa ile soluklaştırma
(K22). **Fotoğrafın üstüne rozet, etiket ya da metin bindirilmez** — rozet kutunun altındaki
metin bloğunda durur. Kutu oranı ve kart ızgarası yerleşimdir, sahibi DESIGN-MENU (K11).

## Mono bölüm etiketi (K34)

IBM Plex Mono, büyük harf, yarıçap 0. Boy **9 · 11 · 12 px**, harf aralığı **0.08–0.14em**
(boy küçüldükçe artar); sayı ve ölçü taşıyorsa `tabular-nums`. Etiket sarmaz, kısaltılır.

| Zemin | Ton | Ölçüm |
|---|---|---|
| Kart / beyaz — turkuaz etiket | `--brand-cyan-ink` | 5.65 (ham #0088B0: 4.08, kullanılmaz) |
| Kart / beyaz — ikincil etiket | `--text-muted` | 4.83 |
| Sayfa zemini `#F4F4F2` | `--text-body` | 6.83 (muted orada 4.39) |
| Koyu bant | `--text-on-dark-muted` | 5.42 · 6.92 |
| `--surface-dark-inset` #24395C | `--text-on-dark` (beyaz) | 11.57 (muted ink 4.45) |

Büyük harf yalnız etiket ve rozete aittir: **marka ve ürün adı büyük harfe çevrilmez**
(AVenS → AVENS olmaz).

## P-Q eğrisi çizim dili (K35)

Üç çizgi ağırlığı: ana eğri **2 px lacivert** · ikincil seri **1.5 px turkuaz** · ızgara
1 px `--border-row`, eksen 1 px `--border-control`. Dördüncü seri gerekirse **kesikli
lacivert**; yeni renk eklenmez.

**Çalışma noktası kiremittir:** 5 px dolu daire + 1 px düşey iniş çizgisi + mono etiket.
Grafikteki tek kiremit odur; **eğri asla kiremit çizilmez** (K5).

**Yasak:** alan dolgusu, gradyan, gölge, 3B, yuvarlatılmış uç, animasyonlu çizim, ok başı.
Birim etikette yazılır (m³/h · Pa), eksende tekrar edilmez.

**Ölçü:** masaüstü **520×260**, mobil **330×200**; ızgara dört yatay + dört düşey kalır,
mobilde ikincil seri düşürülür, çalışma noktası düşmez. Verisi olmayan modelde eğri
çizilmez, hüküm de verilmez (K7).

## İkonlar

16 ikon: **7 kategori + 9 senaryo.** Alt dallar için ikon çizilmez — 22 px'te ayırt
edilemiyor; dal ayrımını ürün fotoğrafı sağlar. (Dal sayısı burada yazılmaz: ölçülmedi.)

Boylar: **64 · 48 · 24 px.** Hangisinin nerede kullanılacağı uygulama aşamasında görerek
kararlaştırılır. 64 px, 48 px geometrisinin birebir vektör ölçeğidir (yeni elle ayar yok).

Dosya adı: `venthub-[kat|sen]-[ad]-[px]-[surum].svg`
Sürümler: `tamrenk` · `lacivert` (tek renk) · `koyu` (koyu zemin için)

**Koyu lacivert header ve footer içinde `koyu` sürüm kullanılır** — tamrenk sürüm lacivert
üstünde 1.31:1 kontrast verir, okunmaz.

Tek renk `lacivert` sürümde turkuaz kapsama duyarlı çevrilmiştir: lacivert gövdenin
İÇİNDEKİ turkuaz beyaz knockout olur, sayfa zeminindeki turkuaz laciverte döner. Kör hex
değişimi yapılmaz.

Baskıda kategori vurgu rengi kullanılmaz (yeşil ve turkuaz gri dönüşümde 1.29 kat ayrı,
tek renkte vurgu zayıflar) — tek renk lacivert sürüm kullanılır.

Hava anlatımı ok işaretiyle değil dilim/jet ritmiyle yapılır. Kiremit ikonlarda yoktur.

## Marka listesi

Yedi marka, bu sıra ve yazımla:

**Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva**

İlk beşinin katalogda ürünü var (173 · 81 · 51 · 35 · 35). Casals ve Flexiva temsil edilen
markalar, ürünü henüz 0. **Storm marka değildir** — SEAT'in ürün serisidir.
Yazım veriden gelir: "SEAT" büyük harf, "AVenS" bu şekilde.

## Logo kullanımı

- İşaret: 14A-3 — daire içinde dört eğik kanatçık dilimi, kiremit üst dilim
- Koruma alanı: işaret yüksekliğinin yarısı
- En küçük: ekranda 16 px işaret / 96 px kilit · baskıda 6 mm işaret / 25 mm kilit
- 16 px'te dilimler düz basar (kanatçık profili düşer)
- Koyu zeminde **ikinci ve üçüncü** dilim beyaza döner (kiremit · beyaz · beyaz · turkuaz);
  dosya `venthub-isaret-tamrenk-koyu.svg`. Logo elle çizilmez, sönükleştirme de dosyadan
  gelir (K23 · K22): `venthub-isaret-soluk.svg` · `venthub-isaret-soluk-koyu.svg`
- Hareket yalnız 48 px üstünde, tek 2–3 sn döngü, ilk görünümde. **Favicon, evrak ve
  baskı daima statik**
- Yanlış kullanım: döndürme, renk değişimi, gövdeye fotoğraf, yazı tipi değişimi,
  kiremitin başka dilime kayması, gölge veya hacim

## Site kabuğu

Sitede tek koyu ton lacivert: **header ve footer koyu, sayfa gövdesi aydınlık.**
Kiremit sayfada tek sıcak noktadır — logo + ana eylem düğmesi.

## Depoya alma (peckop/venthub-hvac-esite)

1. `tokens.css` içeriği `src/index.css`'in `:root` bloğuna girer. Değişen mevcut tokenlar:
   `--brand-cyan` (eski `#22D3EE`) ve `--primary-navy` (eski parlak royal mavi).
   `--action-terracotta` yenidir. Mevcut `gold-accent` `#D97706` **dokunulmaz.**
2. `tailwind-brand.js` `theme.extend`'e birleşir. Admin ölçekleri ve 3D materyal renkleri
   kapsam dışıdır, dokunulmaz. Eşleme `tokens.css` ile **tam**: koyu zemin metin adları
   (`text-on-dark` · `text-on-dark-muted`) da eşlenmiştir — K22'nin soluk hâli depoda
   Tailwind sınıfıyla yazılabilir, ham hex gerekmez (emir #8, REC-165 köprüsü).
3. `src/app/layout.tsx` içindeki `next/font/google` **Inter** tanımı Archivo'ya çevrilir;
   `--font-sans` değişken adı korunur. Source Serif 4 ve IBM Plex Mono eklenir.
4. `icons/` → `public/icons/`. Kullanım yalnız kategori ve senaryo yüzeylerinde.
5. Vitrin **aydınlık gövde + koyu header/footer** olur. Deponun bugün hangi tema kurgusunu
   kullandığı **ölçülmedi**; "koyu-mod terk edilir" bir iddiaydı, geri alındı (admin ayrı karar).
6. Renk dışı tokenlar `src/design-system/tokens.js` düzenini korur.

Ham hex koda yazılmaz; `tsx/ts` içinde ham hex yasağı kapısı vitrine genişletilir
(3D materyal renkleri ve chart karantinası gerekçeli istisna listesinde kalır).

## Bu pakette OLMAYAN, bilinçli

- **Boşluk ölçeği** — 15A tasarım sözleşmesinde 22 değer ölçüldü, tek sayılar bilinçli;
  4'e yuvarlama çizimi bozuyor. Ayrı karar turu bekliyor.
- **Hareket tokenları** — deponun mevcut `transitionProperty` ölçeği korunur.
- **Nötr ölçeğin tamamı** — burada yalnız çizimde fiilen kullanılan yüzeyler var;
  15 kademeli sıcak nötr ölçek 15A sözleşmesinde ölçüldü, ayrı iş.
- **Belge sistemi** — kurumsal belge kuralları (A4, ≥10 pt, kapalı bekler şeridi) DESIGN-BELGE
  projesinde; marka kılavuzuna bölüm olarak eklenmesi Recep'in açılışını bekliyor.

