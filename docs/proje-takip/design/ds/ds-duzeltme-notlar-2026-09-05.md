
# DS düzeltme turu — 2026-09-05

OPS düzeltme emri (REC-149, tek tur). Yeni bileşen, yeni token, yeni kart üretilmedi; fontlara ve
renklere dokunulmadı.

## 1 · Kabuk bandı oluğu

**Kaynak ölçüm** (DESIGN-MENU `Menü Tasarımı v15.dc.html`, ekran 01 header):
`background #1a2b4a · height 74px · display flex · align-items center · gap 30px · padding 0 40px`.

**Kök neden.** Eski `KabukBandi` bandın kendi oluğunu taşımıyordu; içine **ortalanmış 1060 px
sütun** koyuyordu. Oluk böylece `(genişlik − 1060) ÷ 2` oluyordu:

| Genişlik | Eski oluk | Yeni oluk |
|---|---|---|
| 1440 px artboard | 190 / 190 px | **40 / 40 px** |
| 911 px önizleme | **0 / 0 px** (`computed padding: 0px`) | **40 / 40 px** |
| 700 px kart iframe'i | ~0 / ~12 px (OPS ölçümü) | **40 / 40 px** |

Yani asimetri geniş ekranda görünmüyordu, 1060'tan dar her panelde oluk sıfıra düşüyordu. Hatalı
olan 1060 değeri değil, bandın kendine ait oluğunun olmamasıydı.

**Yeni kural (kaynak kaydına da girdi):** bant tam genişlikte durur, oluğu kendi `padding`
kuralıdır — **ortalanmış sütundan türetilmez**. `1060 px içerik sütunu genişliğidir, bant oluğu
değil.` Bileşene iki prop olarak yazıldı: `oluk = 40`, `aralik = 30`.

### Ölçüm sonucu — üç dosya × üç genişlik (paket yenilendikten sonra, gözle)

| Yer | 700 px | önizleme (911–925 px) | 1440 px |
|---|---|---|---|
| `components/kabuk/kabuk.card.html` (grup kartı) | 40 / 40 · yük 74 · gap 30 | 40 / 40 · yük 74 · gap 30 | 40 / 40 · yük 74 · gap 30 |
| `ui_kits/kabuk/index.html` header | 40 / 40 · gap 30 | 40 / 40 · yük 74 | 40 / 40 · yük 74 |
| `ui_kits/kabuk/index.html` footer | 40 / 40 | 40 / 40 | 40 / 40 |
| `ui_kits/kabuk/index.html` utility şeridi | 40 / 40 | 40 / 40 | 40 / 40 |

Üç dosyanın hiçbirinde bant içinde `max-width: 1060px` **yok** (kontrol: `getComputedStyle`
taraması, sonuç HAYIR) — oluk artık sütundan türemiyor.

Kart iframe'i darsa oluğun kaybolmaması için grup kartının `viewport` genişliği bileşenin gerçek
genişliğine (**1440**) eşitlendi; kart 700 px'e sıkışsa da oluk 40 kalıyor.

İki küçük ek düzeltme aynı ölçümden çıktı: sağdaki TR/EN + Teklif kümesi `marginLeft: auto` ile
sağ oluğa yapıştırıldı (1440'ta sağ boşluk 344 px ölçülmüştü, artık 40), arama alanı
`min-width: 0` ile küçülebilir yapıldı (700 px'te satır 1 px taşıyordu).

## 2 · Marka satırı gruplaması

3·2·2 kaldırıldı — dayanağı yoktu. Yeni gösterim **5 + 2, iki satır, etiketli**:

- **Ürün grubu olan markalar:** Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss
- **Temsil edilen markalar:** Casals · Flexiva

Sayı yazılmadı (sayılar kod/DB'nin, kart bayatlar). "Ürün bekliyor", "yakında" ya da vaat gibi
okunacak ifade kullanılmadı. Uygulandığı iki yer: marka listesi kartı ve kabuk footer'ı (grup
kartı + ekran).

## 3 · Damga

`kaynak_updatedAt` **değişmedi** (kaynak değişmedi). `readme.md` damga tablosuna satır eklendi:
`düzeltme 2026-09-05: oluk 40 px, gruplama 5+2 (REC-149)`.

## Değişen dosyalar

| Dosya | Ne değişti |
|---|---|
| `components/kabuk/KabukBandi.jsx` | Tam genişlik bant; `oluk = 40`, `aralik = 30`; 1060 sütunu kaldırıldı |
| `components/kabuk/KabukBandi.d.ts` | Ölçüm kaynağı + "1060 içerik sütunu ≠ bant oluğu" ayrımı; iki yeni prop |
| `components/kabuk/KabukBandi.prompt.md` | Ölçülen değerler + footer marka satırı kuralı |
| `components/kabuk/kabuk.card.html` | `viewport` 1440; footer 5+2 etiketli; altyazıya ölçüm yazıldı |
| `ui_kits/kabuk/index.html` | Utility şeridi 40 px oluk; sağ küme sağ oluğa; arama `min-width: 0`; footer 5+2 |
| `guidelines/marka-listesi.html` | 5 + 2, iki satır, etiketli; sayı ve durum metni kaldırıldı |
| `readme.md` | Düzeltme damgası; yerleşim ve bileşen satırında bant ölçüsü; marka listesi kuralı |

## Ek düzeltmeler

### Kartın kendi içeriği (aynı gün)

Design System sekmesinde kart iki ayrı sebeple "boş" görünüyordu:

1. **Yanlarda ~190 px oluk.** Ölçtüm: `(1440 − 1060) ÷ 2 = 190` — yani kartın o görüntüsü
   **derleme öncesi** eski bileşendi. Yeni derlemede aynı yerde 40 / 40 px (yukarıdaki tablo).
   Kart görüntüsü paket yenilenince tazelenir; değer hatası değil, gecikme.
2. **Ortada büyük boşluk — bu bendendi.** Grup kartının header'ına arama alanını koymamıştım;
   1440 px'te logo + menü solda, düğmeler sağda kalıp arası ~680 px boş duruyordu. Bant gerçek
   kabuk gibi okunmuyordu. Arama alanı eklendi (`flex: 1 1 220px · max 380 · nowrap · ellipsis`),
   footer'a işaret logosu kondu, kart yüksekliği ölçülen bant toplamına (74 + 20 + 146) göre
   **1440×250**'ye indirildi. Aynı arama kuralı ekranda da uygulandı — 924 px'te placeholder iki
   satıra kırılıyordu, artık tek satır.

### K22 — koyu bantta soluk metin (OPS doğrulama turu)

Aykırılık: `monoAlt` stili metni `opacity: 0.72` ile soluklaştırıyordu; K22 metinde alfayı
yasaklar. Kaynaktaki token (`brand/tokens.css` → `--text-on-dark-muted: 215 26% 65%`, `#8FA2BD`;
lacivert bantta 5.42:1, utility şeridinde 6.92:1, ikisi AA) `tokens/renk.css`'e aynen eklendi;
`opacity` kaldırıldı, yerine `color: hsl(var(--text-on-dark-muted))` kondu.

OPS'un saydığı iki dosya (`ui_kits/kabuk/index.html` · `components/kabuk/kabuk.card.html`)
dışında **aynı aykırılığı dört temel kartında da buldum** ve aynı turda düzelttim:
`guidelines/renk-metin.html` · `logo-isaret.html` (iki yer) · `logo-kilit.html` ·
`ikon-uc-surum.html`. Projede koyu zemin üstü metinde `opacity` kalmadı. Token sayısı 50 → **51**.

**Açık kalan tek `opacity`:** `Kart` bileşeninin `kapsamDisi` hâli (`opacity: 0.5`) — sözleşmede
ölçülmüş bir değer, ama metin taşıyan kutunun tamamına alfa uyguluyor, yani K22 ile çelişiyor.
Kendiliğinden değiştirmedim; soluk hex + zemin + rozet karşılığı ayrı ölçüm ister, hükmü OPS'ta.

### Koyu bantta turkuaz etiket — K22 düzeltmesinin yan etkisi

Alfa kalkınca marka satırı başlıkları (`satirEtiket`, 11 px / 400) turkuaz kaldı: `#0088B0`
lacivert bant üzerinde ölçülen kontrast **3.47:1** — 11 px başlık ölçeği değil, eşik 4.5:1.
İki dosyada (`ui_kits/kabuk/index.html` · `components/kabuk/kabuk.card.html`) etiket rengi
`--text-on-dark-muted` yapıldı: **5.35:1**, AA. Yeni token gerekmedi.

Kural olarak yazıldı: **turkuaz ölçülmüş bir açık zemin vurgusudur**; koyu bantta 11 px etiket
turkuaz değil `--text-on-dark-muted` ile yazılır. Açık zeminli temel kartlarındaki turkuaz
overline'lara dokunulmadı (orada sorun yok).

### Düğme etiketi tek satır (kaynakta düzeltildi)

Koyu banttaki TR/EN ve "Teklif (n)" düğmelerinin etiketi dar pencerede iki satıra kırılıyordu
(ölçüm: 924 px'te düğme `72×44`, metin 3 satır dikdörtgeni, `white-space: normal`). Kök neden
kabuk değil bileşendi: `CerceveliDugme` tabanı ne `nowrap` ne `flex-shrink: 0` taşıyordu, arama
alanına yer açılırken düğmeler küçültülüyordu.

Kaynakta düzeltildi — `CerceveliDugme.jsx` ve simetri için `AnaEylemDugmesi.jsx` tabanına
`whiteSpace: 'nowrap'` + `flexShrink: 0`. Böylece düğme etiketi bileşeni kullanan **her** tüketici
düzeninde tek satır kalır; kabuk dosyalarına yama gerekmedi. Kural `CerceveliDugme.prompt.md`'ye
yazıldı: uzun etiket gerekiyorsa metin kısalır, düğme daralmaz.

### Turkuaz kuralı ölçümle genişletildi + `templates/kabuk/` açıldı

**Turkuaz.** Kural artık yalnız bant için değil: turkuaz küçük metin `#1A2B4A` 3.46 · `#0F1723`
4.41 · `#24395C` 2.84 — üç koyu zeminin hiçbirinde AA geçmiyor. Koyu zeminde küçük etiket
`--text-on-dark-muted` ile yazılır. **Sınır yazıldı:** muted ink `#24395C` üzerinde 4.45:1,
eşiğin hemen altında — arama alanı zemini o renk; orada küçük etiket gerekirse beyaz
(`--text-on-dark`) kullanılır. Şu an orada küçük etiket yok, ihlal değil; kural ilk ekleyen
düşmesin diye `readme.md` ve `SKILL.md`'ye kondu.

**Şablon.** `templates/kabuk/` açıldı: `Kabuk.dc.html` (giriş) + `ds-base.js` + `README.md`.
Kabuk, DS'in kendi `KabukBandi` ve `CerceveliDugme` bileşenlerini bundle'dan mount ediyor; ölçüler
bileşenden geliyor (oluk 40 · yükseklik 74 · aralık 30), şablon kendi değer kümesi tutmuyor.
Tweaks: `utilityGoster` · `aramaGoster` · `teklifSayaci` (metin ve renk doğrudan düzenlenir).
Tüketici projede tek satır değişir: `ds-base.js` içindeki `base`; logo yolları da `dsKok` alanıyla
aynı köke bağlı (K23 — logo dosyadan).

**Sahiplik (OPS hükmü):** şablon kaynak, kart türev. `ui_kits/kabuk/index.html` kartının
altyazısına *"Türev — kaynak `templates/kabuk/`"* damgası + `kaynak_updatedAt` kondu; ekranın
README'sine de yazıldı. Kabuk düzeni değişecekse önce şablon değişir.

### `Kart` kapsam dışı hâli — K22'ye uyduruldu (bekletmeden)

Son açık madde kapatıldı. `opacity: 0.5` kaldırıldı; kapsam dışı kart artık soluk zemin
`--surface-inset` + soluk metin `--text-muted` ile anlatılıyor, kenar aynı kalıyor. **Yeni değer
icat edilmedi** — iki token da sistemde zaten vardı, K22'nin tarif ettiği yol da bu (soluk hex +
zemin). Alfa hiçbir yerde kalmadı.

Değişen: `components/yuzey/Kart.jsx` · `Kart.d.ts` · `Kart.prompt.md` · `yuzey.card.html` ·
`readme.md`. OPS başka bir hüküm verirse geri almak tek satır.

**Doğrulama düzeltmesi:** ilk denemede metni de `--text-muted` yapmıştım; ölçüm `#EEEEEA` üstünde
**4.16:1** verdi — beyaz zemindeki hâlinden (4.83) *düşük*, eşiğin altı. Zemin ve metin aynı yönde
soluklaştırılınca pay kalmıyor. Metin `--text-body` yapıldı: **6.47:1**, AA rahat. Kural olarak da
yazıldı (`.d.ts` + `.prompt.md`): kapsam dışı hâlde zemin soluklaşır, metin soluklaşmaz.

İkinci tur eksik kaldı, doğrulama yakaladı: kartın kendi prova metni `--text-muted` ile explicit
yazıldığı için kökteki düzeltmeyi eziyordu (soluk zeminde yine 4.16:1). Prova metninden renk
kaldırıldı — kökten miras alıyor. Kural `.prompt.md`'ye eklendi: **kapsam dışı kartta çocuk
öğelere mutlak metin rengi verilmez.** Ayrıca kartın `@dsCard` altyazısı hâlâ "kapsam dışı %50"
diyordu (küçük/büyük harf yüzünden önceki toplu değişimde eşleşmemişti); "soluk zemin (K22 — alfa
yok)" olarak düzeltildi.

### `Kart` üst kenarı hiç çizilmiyordu (kök neden)

Doğrulama ölçümü: üç kartın da `borderTopWidth: 0 / borderTopStyle: none`, diğer üç kenar 1 px
(seçili kartta 2 px). Yani kartlar 1 px kenar yerine **üç kenarla** çiziliyordu.

**Kök neden:** aynı style nesnesinde `border` kısayolu ile `borderTop: undefined` birlikte
yazılmıştı; React kısayolun longhand'lerini yazdıktan sonra `border-top-*`'ı boşaltıyor, yani
`undefined` "hiç yazma" gibi davranmıyor — `ustKural` false olsa da üst kenar açık kalıyor.

**Düzeltme:** style nesnesi koşullu kuruluyor, `borderTop` yalnız gerçekten gerektiğinde
(`ustKural && !secili`) ekleniyor. Tek dosya: `components/yuzey/Kart.jsx`. Diğer beş bileşende
aynı kalıp yok (kısayol + longhand `undefined` eşleşmesi yalnız burada vardı).

### Soluk işaret sürümleri üretildi (OPS küçük iş)

`assets/logo/venthub-isaret-soluk.svg` (`#7A8290`, açık zemin) ve `venthub-isaret-soluk-koyu.svg`
(`#8FA2BD`, koyu zemin). Geometri ana çizimin birebir aynısı: 200×200, r=100 daire kırpması, dört
eğik dilim (`0,0 200,12.5 200,37.5 0,25` ritmi), yarıçap ve gölge yok. `assets/logo/` **28 → 30**;
işaret 7 → 9. İşaret kartı dokuz sürümü gösteriyor.

Ölçülen kontrast (kayıt için — soluk hâl bilgi taşımaz, eşik aranmaz): `#7A8290` beyaz üstünde
**3.87:1**, sayfa zemininde **3.52:1** · `#8FA2BD` lacivert bantta **5.35:1**, `#0F1723` üstünde
**6.92:1**. Kural yazıldı: sönükleştirme `filter: grayscale()` ya da opaklıkla yapılmaz, soluk
sürüm dosyadan gelir (K22 · K23 ruhu).

**Yeniden yayın gerekir** — varlık ve bileşen değişti; damga tablosuna `yeniden_yayin: Gerekir`
satırı kondu.

## Yapamadığım

**Published kutusunu işaretleyemiyorum** — proje ayarları arayüzünde, benim erişimimde değil;
aynı sebeple çip listesini de göremiyorum. İşaretlendiğinde "VentHub" görünürlüğünü tüketici
projeden doğrulayabilirim.

**Açık kalan:** `templates/kabuk/` şablonu (OPS "AÇ" dedi, 13:47 yorumu). Bu tur "yeni kart/
bileşen yok" kapsamındaydı, kendiliğinden açmadım; ayrı tur.

— DESIGN-MARKA/DS 2026-09-05

