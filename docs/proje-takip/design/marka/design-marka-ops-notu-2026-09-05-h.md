
# DESIGN-MARKA → OPS · 2026-09-05 · DESIGN-MENU'nün SVG kullanımı: iki bulgu

Recep DESIGN-MENU'ye "bu projede SVG üretiyor musun" diye sordu ve cevabı bana aktardı.
Cevapta bizi ilgilendiren **iki şey** var: biri bugün kapattığım boşluğun aynısı, biri
ölçülmüş bir sayı çelişkisi.

## İyi haber — 16 ikonu kopyalamış, çizmemiş

DESIGN-MENU'nün kendi ifadesi: *"Marka projesinden gelen 16 kategori/senaryo ikonu ise hazır
SVG dosyası (`brand/icons/`), onları ben çizmedim, kopyaladım."*

Doğru davranış. Ayrıca SVG disiplini bizimkiyle örtüşüyor: *"dekoratif illüstrasyon
çizmiyorum… SVG'yi yalnız ölçülebilir şey için kullanıyorum: eğri, kesit, ikon, grafik"* —
ürün fotoğrafı yerine SVG fan resmi yapmıyor, yer tutucu bırakıyor.

## Bulgu 1 · Logoyu CSS'te elle çiziyor — bugün kapattığım boşluğun aynısı

DESIGN-MENU'nün ifadesi: *"Marka işareti: logo dairesi SVG değil, `clip-path: polygon` ile
CSS — dört dilim."*

DESIGN-BELGE de aynısını yapmıştı (kendi kaydında yazılı: dilimler kılavuzun CSS'inden
kopyalanmış, referans verilmemiş). Bugün `brand/logo/` açıldı — **28 SVG** — tam bu yüzden.

**Risk ölçülmüş:** koyu zeminde doğru dizilim `kiremit · beyaz · beyaz · turkuaz`, yani
**ikinci VE üçüncü** dilim beyaza döner. Ben bugün bunu tek beyaz olarak yazmıştım, Recep
prova sayfasında yakaladı. Elle CSS çizen her şerit aynı hatayı bağımsız olarak yapabilir ve
kimse görmez — üç projede üç farklı logo olur.

**Önerim (OPS taşır):** DESIGN-MENU ve DESIGN-BELGE, elle CSS çizimi yerine
`brand/logo/venthub-isaret-*.svg` dosyalarını kullansın. Koyu header için
`venthub-isaret-tamrenk-koyu.svg`. Kilit gerekiyorsa
`venthub-kilit-yatay-*` / `venthub-kilit-dikey-*` (wordmark `<text>` olarak duruyor,
Archivo yüklü olmalı). Favicon ve avatar da hazır.

Mevcut çizimlerini değiştirmek zorunda değiller — kural şu olabilir: **yeni yazılan hiçbir
yerde logo elle çizilmez.** Kod tarafına geçerken `public/brand/` altından okunur.

## Bulgu 2 · İkon kontur kalınlığı üçüncü kez farklı ölçüldü

| Kaynak | Değer |
|---|---|
| 15A README (eski) | stroke **1.6** |
| Bizim kayıt (CLAUDE.md, ölçülmüş) | stroke **1.4** — "README'deki 1.6 eski" |
| DESIGN-MENU'nün bugünkü ifadesi | stroke **1.5** |

Üç değer var. Bu bizim kategori/senaryo ikonlarımızı **etkilemiyor** — onlar dolu iki renkli,
konturu yok. Etkilenen DESIGN-MENU'nün kendi **arayüz ikonları** (alt sekme çubuğu, arama,
hesap, kapatma, kargo, telefon, kilit).

**Sorun bizde:** kılavuz kaydımızda (CLAUDE.md 108. satır) "ikonlar kontur viewBox 32 stroke
1.4" yazıyor — yani bize ait olmayan bir şey için sayı taşıyoruz. İki yol var:

- (a) Sayı bizim kayıttan **çıkar**; arayüz ikonu konturu DESIGN-MENU'nün işi, biz tekrar
  etmeyiz. ("26 dal" için aynısını bugün yaptık.)
- (b) Sayı marka kuralı **olur** ve tek değere sabitlenir; o zaman hangisi olduğu ölçülmeli.

**OPS önerim (a).** Bizim ikon dilimiz dolu iki renkli; kontur ikonu marka dili değil, arayüz
ihtiyacı. Kılavuzun kontur kalınlığı hakkında hüküm vermesi, ölçmediğimiz bir şeye kural
yazmak olur. Onay verirseniz satırı çıkarırım.

Ne olursa olsun **üç değerin ikisi bayat** — DESIGN-MENU'nün 1.5'i mi doğru, bizim 1.4'ü mü,
bunu ölçen taraf DESIGN-MENU olmalı.

## Ben ne yapmadım

Kendi kaydımı bu turda değiştirmedim: (b) seçilirse sayının doğrusunu bilmiyorum, (a)
seçilirse satırı silmek OPS onayı gerektiriyor (ölçülmüş bir kaydı sessizce silmek istemem).
DESIGN-MENU'nün dosyalarına da dokunmadım — protokol gereği okurum, yazmam.

— DESIGN-MARKA (Opus) 2026-09-05

