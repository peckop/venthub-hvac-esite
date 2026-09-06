<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf, DEU=Doc_Pubblicita_Air_treatment_Deumido_Range_1.pdf, BRV=vortice-bravo-s.pdf -->

# İçerik hattı — TR taslak: DEUMIDO RANGE · BRA.VO S · TIRACAMINO (REC-146, Vortice tekiller)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır.
**Referans biçimi:** `[DEU s.NN]` = Vortice DEUMIDO RANGE kataloğu (EN, **çevrildi**) ·
`[BRV s.1]` = Vortice BRA.VO S föyü (EN, tek sayfa) · `[AVenS s.NN]` = AVenS Ürün Fiyat Kataloğu 2026 (TR)

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Kalıp örneği: `docs/audits/icerik-hatti-taslak-lineo-2026-09-06.md`.

## 0 · Bu üç aile neden AYRI yazıldı

Üçü birbirinden bağımsızdır ve ortak kaynak sayfası paylaşmazlar. İkisi **fan bile değildir**:
DEUMIDO bir **nem alma cihazı**, BRA.VO S bir **hava kalitesi sensörüdür**. Bu yüzden LINEO
taslağındaki "ayırt edici cümle" bölümü burada yoktur; her ailenin **kendi kimlik cümlesi** yeterlidir.
Altı bloğun bir kısmı bu ürün tiplerinde **anlamsızdır** — zorlanmadı, boş bırakıldı ve sebebi yazıldı.

---

## 1 · DEUMIDO RANGE (`vortice-deumido-range`)

**DB:** 3 ürün — DEUMIDO NG 10 / NG 16 / NG 20 · **Kaynak:** DEUMIDO RANGE kataloğu s.1–12 (EN)

### Kimlik cümlesi

> Elektronik kumandalı, taşınabilir nem alma cihazı ailesi; yüksek bağıl nemin yol açtığı küf
> oluşumunu, solunum sorunlarını ve mobilya, duvar ile yapı elemanlarındaki hasarı önlemek üzere
> ortam bağıl nemini denetler. [DEU s.4]

### Maddeler

* Aile, farklı boyut, ağırlık ve performansa sahip üç modelden oluşur ve her konut ya da ticari
  uygulamanın ihtiyacını karşılamayı hedefler: DEUMIDO NG 10 (kod 26020), DEUMIDO NG 16 (kod 26021),
  DEUMIDO NG 20 (kod 26022). [DEU s.4]
* Model adındaki sayı, 30 °C sabit sıcaklıkta ve sabit 80% bağıl nemde 24 saat sürekli çalışmada
  çekilen günlük nem miktarıdır — yani seri **10 · 16 · 20 l/24h** kapasite basamaklarını kapsar. [DEU s.5]
* Yıkanabilir toz filtresi havadaki katı kirleticileri tutar; aktif karbon filtre hoş olmayan
  kokuları giderir. [DEU s.6]
* Her DEUMIDO NG modelinin üst yüzeyinde sezgisel bir elektronik kumanda paneli bulunur. [DEU s.6]

### Ölçülen aralıklar (üç modelin tamamı)

| Büyüklük | NG 10 | NG 16 | NG 20 | **Aralık** |
|---|---|---|---|---|
| Nem çekme (30 °C, 80% BN) | 10 | 16 | 20 | **10–20 l/24h** |
| Su haznesi | 2,5 | 3 | 3 | **2,5–3 litre** |
| Maks. debi | 130 | 150 | 150 | **130–150 m³/h** |
| Güç | 260 | 340 | 500 | **260–500 W** |
| Ses (LP, 1 m) | 39 | 43,8 | 43,8 | **39–43,8 dB(A)** |
| Ağırlık | 10,5 | 12,5 | 13 | **10,5–13 kg** |

NG 10 satırı: 130 m³/h debi, 260 W güç, 39 dB(A) ses, 10,5 kg ağırlık ve 220–240 V besleme. [DEU s.7]
NG 16 ve NG 20 satırı: 150 m³/h debi, 340 W ve 500 W güç, 43,8 dB(A) ses, 12,5 kg ve 13 kg ağırlık. [DEU s.9]

### Yapısal bloklar

**Gövde.** Parlak ABS reçineden sağlam gövde; taşımayı kolaylaştıran entegre tutamaklar ve hareket
kolaylığı için 4 tekerlek. [DEU s.6] Su seviyesi şeffaf hazne sayesinde dışarıdan görülür: NG 10'da
2,5 litre, NG 16 ve NG 20'de 3 litre. [DEU s.6, 8] Gövde ölçüleri katalogda A/B/C/D olarak verilir —
NG 10 için 300 mm, 453 mm, 204 mm ve 429 mm. [DEU s.7] NG 16 ve NG 20 aynı gövdeyi paylaşır:
311 mm, 547 mm, 236 mm ve 523 mm. [DEU s.9] Cihaz ağırlığı 10,5 kg ile 13 kg arasındadır. [DEU s.7, 9]

**Çark.** Verimli santrifüj fan, nemli ortam havasını cihazın **arka** yüzünden içeri çeker; fazla nem
alındıktan sonra filtrelenmiş ve nemi giderilmiş hava cihazın **üst** yüzündeki çıkıştan ortama geri
verilir. [DEU s.6] NG 16 ve NG 20, bu santrifüj fanın **çift hızlı** sürümünü kullanır. [DEU s.8]
Maksimum debi NG 10'da 130 m³/h, NG 16 ve NG 20'de 150 m³/h'tir. [DEU s.7, 9]

**Motor.** *Kaynakta ayrı bir motor tanımı YOK* — föy motor tipini, kutup sayısını veya verim sınıfını
vermez. Verilen tek elektriksel veri cihazın besleme ve tüketim değerleridir: 220–240 V besleme,
260 W (NG 10) ile 500 W (NG 20) arasında güç. [DEU s.7, 9]

**Koruma.** Yıkanabilir toz filtresi ve aktif karbon filtre, hem katı kirleticilere hem kokuya karşı
koruma sağlar. [DEU s.6] Hazne dolduğunda kumanda panelindeki led uyarı verir. [DEU s.7] Cihazlar CE
işaretlidir; Alçak Gerilim Direktifi (2014/35/UE) ve Elektromanyetik Uyumluluk Direktifi (2014/30/UE)
kapsamındadır. [DEU s.3] Elektrik güvenliği tarafında EN 60335-1, EN 60335-2-40, EN 60529 ve EN 62233;
elektromanyetik uyumluluk tarafında EN 55014 serisi ile EN 61000-3-2 ve EN 61000-3-3 standartları
geçerlidir. [DEU s.3] Çalışma sıcaklığı aralığı 5 – 32 °C'dir. [DEU s.7, 9] Soğutucu akışkan
R-134a'dır (GWP 1430). [DEU s.7]

**Kontrol.** NG 10 panelinde On/Off tuşu, hazne dolu led göstergesi, istenen bağıl nem eşiğinin
(40%, 50%, 60% veya 70%) ya da sürekli çalışmanın seçimi ve gecikmesi 15 saate kadar ayarlanabilen
otomatik kapanma zamanlayıcısı bulunur. [DEU s.7] NG 16 ve NG 20 panelinde ek olarak bilgi ekranı
(önce oda sıcaklığını, 8 saniye sonra bağıl nemi gösterir), yüksek/düşük hız seçimi, filtrelenmiş
havayı geri veren kurutma işlevi (yüksek hızlı havalandırmayla nem alma) ve gecikmesi 24 saate kadar
ayarlanabilen zamanlayıcı yer alır. [DEU s.9] Kurutma işlevi, cihazın üzerine serilen çamaşırın
kurumasına yardımcı olur. [DEU s.8]

**Montaj.** Ürün **taşınabilirdir**; sabit montaj gerektirmez. Küçük boyut ve düşük ağırlık ile entegre
tutamaklar ve 4 tekerlek sayesinde kolayca taşınır ve yer değiştirir. [DEU s.6, 8]

### Aksesuar (kaynakta var, vitrin metnine girmez)

Aktif karbon filtre FSEK10 (kod 21018) DEUMIDO NG 10 (26020) için; FSEK1620 (kod 21019) NG 16 ve
NG 20 (26021 – 26022) için listelenir. [DEU s.10]

### Blok bilançosu — DEUMIDO

**Dolu 6 / 6.** Motor bloğu **kısmi**: motor tanımı kaynakta yok, yalnız cihaz elektriksel verisi var
ve bu açıkça yazıldı. Boş blok yok.

---

## 2 · BRA.VO S (`vortice-vortice-bravo-s`)

**DB:** 4 ürün — BRA.VO S1 / S2 / S3 / S4 · **Kaynak:** `vortice-bravo-s.pdf`, **tek sayfa**

### ⚠ Kaynağın ölçülmüş sınırı

Föyün **metin katmanında toplam 39 kelime** vardır (PyMuPDF `get_text`, tüm çıkarma kipleri denendi).
Sayfada 5 gömülü görsel var; dört modelin **hangisinin hangi kirleticiyi ölçtüğü** bu görsellerin
içinde olabilir ama **metin katmanında yoktur**. Bu yüzden model ayrımı **yazılmadı** — uydurmak
yerine eksik bırakıldı. Ayrımı yazmak, föyün görsel katmanının okunmasını (OCR ya da orijinal
Vortice teknik dokümanı) gerektirir; bu taslağın kapsamı dışındadır.

### Kimlik cümlesi

> Ortamdaki kirleticilerin varlığını algılayabilen bir hava kalitesi ölçüm cihazıdır. [BRV s.1]

### Maddeler

* Algılanan kirletici tipine göre birbirinden ayrılan **dört model** sunulur. [BRV s.1]
* Tüm VORTICE IoT mekanik ısı geri kazanım üniteleriyle entegre çalışır. [BRV s.1]

> Bu iki madde, föyün metin katmanının **tamamıdır**. Üçüncü bir madde yazılamaz.

### Yapısal bloklar

**Gövde.** — **kaynakta karşılığı yok.** Föy malzeme, ölçü veya gövde tarifi vermez.

**Çark.** — **bu ürün tipi için geçersiz.** BRA.VO S bir sensördür; hava hareket ettirmez.

**Motor.** — **bu ürün tipi için geçersiz.** Aynı sebep.

**Koruma.** — **kaynakta karşılığı yok.** Föyde koruma sınıfı (IP), yangın sınıfı ya da sertifika
bilgisi geçmez.

**Kontrol.** Cihaz bağımsız bir kumanda değildir; ölçtüğünü VORTICE IoT mekanik ısı geri kazanım
ünitelerine taşıyarak onlarla entegre çalışır. [BRV s.1]

**Montaj.** — **kaynakta karşılığı yok.** Föy montaj biçimini (sıva üstü / gömme / duvar) söylemez.

### Blok bilançosu — BRA.VO S

**Dolu 1 / 6** (yalnız Kontrol). Boş 5: Gövde · Koruma · Montaj = *kaynakta yok* ·
Çark · Motor = *ürün tipi için geçersiz*.

---

## 3 · TIRACAMINO (`vortice-vort-industrial-ventilation-roof`)

**DB:** 1 ürün · **Kaynak:** AVenS Ürün Fiyat Kataloğu 2026, **s.29** (TR)

### ⚠ Kaynak seçimi (ölçüldü)

Vortice `industrial_Ventilation.pdf` içinde **TIRACAMINO bölümü yoktur**; oradaki TORRETTE bölümleri
çatı fanıdır, bu ürün değildir — o dosya **kullanılmadı**. AVenS kataloğunda TIRACAMINO yalnız iki
sayfada geçer: s.4 (içindekiler) ve s.29 (ürünün kendisi). Yani TR kaynak **tek sayfadır** ve
toplam üç satır metin içerir.

### Kimlik cümlesi

> Şömine ve baca fanları grubunda yer alan, sürekli 200ºC dayanımlı, radyal fanlı, baca gazı
> tahliyelerine uygun fan. [AVenS s.29]

### Maddeler

* Hava debisi 750 m³/h. [AVenS s.29]
* Hız anahtarı ürüne **dahildir** (ayrıca satın alınmaz). [AVenS s.29]
* Katalog kodu 15000. [AVenS s.29]

### Yapısal bloklar

**Gövde.** Katalog gövde malzemesini yazmaz; verdiği tek gövde verisi ölçü tablosudur —
⌀A 405, ⌀B 410, ⌀C 357, ⌀D 10, E 38, F 518, G 480, A1 401, B1 357, C1 140, D1 40. [AVenS s.29]
> *Ölçü tablosunda **birim yazmıyor** (büyük olasılıkla mm, ama kaynak söylemiyor) — bu yüzden
> birim eklenmedi. Vitrine yazılmadan önce doğrulanmalı.*

**Çark.** Radyal (santrifüj) fanlıdır. [AVenS s.29]

**Motor.** — **kaynakta karşılığı yok.** s.29 motor gücü, gerilim, akım ya da devir vermez.

**Koruma.** Sürekli 200ºC sıcaklığa dayanır; baca gazı tahliyesine uygunluğu bu dayanıma dayanır.
[AVenS s.29]

**Kontrol.** Hız anahtarı ürünle birlikte verilir; debi bu anahtarla ayarlanır. [AVenS s.29]

**Montaj.** — **kaynakta karşılığı yok.** s.29 montaj biçimini (baca üstü / şömine bacası içi,
yatay / dikey) tarif etmez; yalnız uygulama alanını ("şömine ve baca fanları") söyler.

### Blok bilançosu — TIRACAMINO

**Dolu 4 / 6** (Gövde — yalnız ölçü, birimi belirsiz · Çark · Koruma · Kontrol).
Boş 2: Motor · Montaj — ikisi de *kaynakta yok*.

---

## 4 · Bugünkü DB metni ile kaynak arasındaki farklar (K7.5 — hepsi kayıtta)

### 4.1 DEUMIDO — ⛔ **AİLE METNİ TEK MODELİN VERİSİNİ TAŞIYOR**

Bugünkü `description.tr`:

> "Ev ve ticari kullanım için tasarlanmış, şık ve taşınabilir nem alma cihazı. Günde 10.0 litre nem
> toplama kapasitesine sahip, 2.5 litrelik şeffaf su haznesi ve yıkanabilir toz filtresi ile birlikte gelir."

Kaynakla karşılaştırma:

| DB iddiası | Kaynakta | Hüküm |
|---|---|---|
| "Günde 10.0 litre" | 10 l/24h **yalnız NG 10**; NG 16 = 16, NG 20 = 20 | **YANLIŞ** aile geneli için — NG 10'un değeri üç ürüne birden yazılmış |
| "2.5 litrelik hazne" | 2,5 L **yalnız NG 10**; NG 16 ve NG 20 = 3 L | **YANLIŞ** aile geneli için |
| "yıkanabilir toz filtresi" | üç modelde de var | doğru |
| "taşınabilir" | "portable / easily transportable" | doğru |
| "ev ve ticari kullanım" | "any residential or commercial application" | doğru |
| aktif karbon filtre | üç modelde de var | **DB'de eksik** — kaynakta var, metinde yok |
| kurutma işlevi (çamaşır) | NG 16 ve NG 20'de var | **DB'de eksik** |
| çift hızlı fan | NG 16 ve NG 20'de var | **DB'de eksik** |

**Sonuç:** aile metni bugün NG 10'un ürün metnidir. NG 16 ve NG 20 sayfalarında **yanlış sayı**
görünüyor. Aralık yazımı (10–20 l/24h, 2,5–3 L) bu hatayı kapatır. Doğrusu: kapasite ve hazne
**model bazında** yazılmalı, aile metninde **aralık** verilmelidir.

### 4.2 BRA.VO S — DB metni kaynakta doğrulanamadı

Bugünkü `description.tr`:

> "Sıcaklık, bağıl nem ve VOC seviyelerini izleyen akıllı ev hava kalitesi sensörü.
> Vortice IoT ısı geri kazanım cihazları ile entegre çalışır."

* **"Sıcaklık, bağıl nem ve VOC"** — föyün metin katmanında **geçmiyor**. `[DB]` Doğrulanmadı;
  kaynağı bilinmiyor. Ne çürütüldü ne doğrulandı — **ölçülemedi**.
* **"IoT ısı geri kazanım cihazları ile entegre"** — kaynakta **var**, doğru. [BRV s.1]
* **"akıllı ev"** — föyde geçmiyor; kaynakta yalnız "hava kalitesi ölçer" der.
* Dört modelin farkı DB metninde de yok; kaynakta da (metin katmanında) yok.

### 4.3 TIRACAMINO — bir iddia kaynağın ötesinde

Bugünkü `description.tr`:

> "Şömine ve bacalarda **çekişi artırmak** ve baca gazını güvenli bir şekilde tahliye etmek için
> tasarlanmış, sürekli 200ºC sıcaklığa dayanıklı, radyal pervaneli şömine ve baca fanı (750 m3/h)."

* "sürekli 200ºC", "radyal", "baca gazı tahliyesi", "750 m³/h" — **hepsi kaynakta var**, doğru.
* **"çekişi artırmak"** — s.29'da **geçmiyor**. Ürün adının anlamı ("tira camino" = baca çeker) ve
  ürün tipi bunu düşündürür ama **kaynak bunu yazmıyor**. `[DB]` Taslakta **kullanılmadı**.
* DB metnindeki "200ºC" karakteri kaynaktakiyle aynıdır (º = U+00BA, derece işareti değil) — sayı
  doğru, tipografi kaynakla birebir.

---

## 5 · Bu taslağın kapatmadığı

* **EN çevirisi yazılmadı** — bu tur TR. `description.en` ayrı tur ister.
* **BRA.VO S1–S4 model ayrımı yazılamadı** — föyün görsel katmanında olabilir; metin katmanında yok.
  Bu, dört ürünün **aynı metinle** vitrine çıkması demektir. Ayrımı açacak kaynak bulunmadan
  bu aile "yazıldı" sayılmamalıdır.
* **TIRACAMINO ölçü birimi** doğrulanmadı (tabloda birim yok).
* **`is_description_manual`** yüklemede **true** yapılmalı; aksi halde bir sonraki otomatik tur ezer.
* **Ticari onay yok** — Recep/uzman turu.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
