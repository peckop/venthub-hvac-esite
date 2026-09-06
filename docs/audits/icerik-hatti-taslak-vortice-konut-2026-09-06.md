<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf, QE=Doc_Pubblicita_Residential_ventilation_vort_quadro_evo_4.pdf, RES=ResidentialVentilation.pdf, PEF=Doc_Pubblicita_Residential_ventilation_Punto_Evo_Flexo_2.pdf -->

# İçerik hattı — TR taslak: VORT QUADRO EVO · PUNTO EVO FLEXO

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır.
**Referans biçimi:** `[QE s.NN]` = Vort Quadro Evo broşürü · `[RES s.NN]` = Residential Ventilation ana kataloğu
· `[PEF s.NN]` = Punto Evo Flexo broşürü · `[AVenS s.NN]` = AVenS TR fiyat kataloğu 2026.
Sayfa numaraları **PDF sayfa numarasıdır** (dört kaynakta da basılı sayfa = PDF sayfası).

## KAYNAK / CETVEL

* Kalıp: `docs/audits/icerik-hatti-taslak-lineo-2026-09-06.md` (Kimlik cümlesi · Dört madde · Altı blok · ayıran cümle).
* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kapı: `scripts/icerik-hatti/taslak-kaynak-kapisi.py` (sayı/kod jetonu ↔ referans sayfa).

---

## 0 · Neden bu ikisi birlikte yazıldı

İkisi de "konut fanı" rafında duruyor ve bugünkü DB metinleri ikisini de **tek cümleye** indirmiş. Yan yana
yazılmalarının sebebi tam bu: biri **radyal (santrifüj), kasalı, gömme montajlı** bir sistem, diğeri **aksiyel
(helikosantrifüj), kasasız, duvara doğrudan** bir fan. Ayrı ayrı yazılsalardı ikisi de "banyo fanı" diye çıkacak
ve vitrinde **iki farklı mimari tek kelimeye** çökecekti — Lineo/Lineo Quiet turunda kaçındığımız tuzağın aynısı.

## 1 · Bugün DB'de ne var (emirle verilen ölçüm)

| Aile | Ürün | Bugünkü `description.tr` | Kusur |
|---|---|---|---|
| `vortice-vort-quadro-evo` | 23 | "Duvar veya tavan montajına uygun, bilyalı motorlu (Long Life) santrifüj kanal tipi fan." | çok kısa; **gömme montaj yok**, **kasa/modülerlik yok**, elektronik süit yok, "kanal tipi" nitelemesi kaynakla çelişiyor |
| `vortice-punto-evo-flexo` | 4 | "…100 mm çaplı…" | seride **100 mm ve 120 mm** var; tek çap yazılmış |

Ürün sayıları, monofaze sayısı ve DB aile aralıkları **DB'den** gelir; bu turda PDF'le değil, emirle verilmiştir. [DB]

---

## 2 · VORT QUADRO EVO Serisi

**DB:** `vortice-vort-quadro-evo` · 23 ürün · QE 60 / 60/35 / 100 / 100/60 / 100/60/35 LL ailesi ·
düz, T, TP, T PIR, TP HCS varyantları [DB]

### Kimlik cümlesi

> Banyo ve WC gibi ıslak hacimler için, duvar/tavan yüzeyine veya sıva altına gömme monte edilebilen konut
> tipi radyal (santrifüj) aspiratör serisi; koruma derecesi IP45'tir. [QE s.2]

### Dört madde

* Duvar/tavan yüzey montajına veya gömme montaja uygundur; performans ve yangına dayanım DIN 18017-3 standardına göredir. [QE s.2]
* Yüksek koruma derecesi (IP45), banyoların Zone 1 bölgesinde güvenli montaja izin verir. [QE s.2]
* Modüler kurgu: 23 ventilasyon ünitesi ile 10 kasa serbestçe eşleştirilir; farklı yangın koruma seviyeleri seçilebilir. [QE s.6]
* Debi seçenekleri tek hızlı 60 m³/h ve 100 m³/h'ten üç hızlı 100/60/35 m³/h'e uzanır. [AVenS s.20]

### Yapısal bloklar

**Gövde.** Salyangoz gövde, elektronik kart yuvasını da içine alacak biçimde kendinden sönümlü (V0) ABS'ten
üretilmiştir. [QE s.4] Estetik ön kapak da kendinden sönümlü (V0) ABS'tir; çevresel emişli kapak, iki menteşesi
sayesinde geniş açıyla açılarak filtre bakımını kolaylaştırır. [QE s.4] Motor yuvası ve filtre çerçevesi ABS
plastiktendir. [QE s.4] Ürün, tercih edilen kasayla tamamlanır; kasalar 80 mm anma çaplı entegre valf ve geri
tepme klapesi içerir. [QE s.5]

**Çark.** Öne eğik kanatlı santrifüj çark PBT'den üretilmiştir; yüksek rijitlik, boyutsal kararlılık ve agresif
kimyasal maddelere yüksek direnç sağlar. [QE s.4] Aerodinamik çalışmalara dayanan yüksek verim, anma debilerinde
QE 60 ailesinde 343 Pa'ya, QE 100 ailesinde 353 Pa'ya varan basınç seviyeleri verir. [QE s.13] Duvar montajında
ses gücü seviyesi 100 / 60 / 35 m³/h debilerinde sırasıyla 50.5, 43.7 ve 33.7 dB(A)'dır. [QE s.13]

**Motor.** Bilyalı yataklara oturan milde çalışan AC motor, azami anma sıcaklığında en az 40.000 saat sürekli
çalışma sağlar. [QE s.4] Çekilen güç 60 m³/h modellerde 16 W, 100 m³/h modellerde 26 W'tır; besleme 220-240 V,
50 Hz'dir. [QE s.13] Azami çalışma sıcaklığı 50 °C'dir. [QE s.13]

**Koruma.** Koruma derecesi IP45'tir ve banyoların Zone 1 bölgesine montaja izin verir. [QE s.2] Geri tepme
klapesinin sızdırmazlığı TÜV sertifikalıdır; ürün kapalıyken kötü koku ve soğuk hava girişini önler. [QE s.3]
Kasa valfi ve arka çıkış kapağı, DIN 18017-3'e uygun olarak Alman TÜV Enstitüsü tarafından onaylanmıştır.
[AVenS s.21] Yangına dayanıklı K90 sınıfı kasa seçenekleri paslanmaz çelik valfle sunulur; valf anma çapı
80 mm'dir. [AVenS s.21] G2 filtre, Erp Reg. 1253/2014/EU 2. Kademe uyarınca tıkalı filtre alarmıyla birlikte
verilir. [QE s.4]

**Kontrol.** Seri beş elektronik süit hâlinde sunulur. Temel sürümde açma/kapama, ayrılmış bir uzaktan anahtar
ya da aydınlatma anahtarı ile yapılır. [QE s.6] Çok hızlı sürümlerde istenen hız uzaktan anahtarla seçilir;
ünite asgari hızda kesintisiz çalıştırılıp uzaktan anahtarla azami hıza çıkarılabilir. [QE s.6] Zamanlayıcılı
(T) sürümde gecikmeli açılma montajda 0-45 saniye, gecikmeli kapanma 0-20 dakika arasında ayarlanır.
[AVenS s.20] Timer Plus (TP) sürümde gecikmeli açılma 0, 45, 90 veya 120 saniye; gecikmeli kapanma 6, 10, 15
veya 21 dakikadır. [AVenS s.20] Uzun hareketsiz dönemler için tatil modu, her 8, 12 veya 24 saatte bir periyodik
çalışma çevrimi kurar. [AVenS s.20] TP HCS sürümünde nem eşiği montajda %60, %70, %80 veya %90 olarak
ayarlanır; fabrika ayarı %70'tir. [AVenS s.20] Fan, bağıl nem önceden ayarlanmış değerin %15 altına düştüğünde
veya iki saat sürekli çalıştıktan sonra durur. [AVenS s.20] T PIR sürümünde fan, hareket algılandığı anda
çalışmaya başlar ve gecikmeli olarak kapanır; çok hızlı modellerde sürekli çalışıp hareket algılandığında hıza
çıkması mümkündür. [AVenS s.20] İsteğe bağlı hız anahtarları DIN standart kutu için 3SS-D, UNI 503 kutu için
2SS-I ve 3SS-I kodlarıyla sunulur. [QE s.17]

**Montaj.** Kasalar, toz ve sıva girişini önleyen kare çerçeveyle birlikte verilir; gömme kasalar alçıpan
montajına imkân tanır. [AVenS s.21] Kasalarda 80 mm anma çaplı entegre valf ve geri tepme klapesi bulunur.
[QE s.9] Gömme kasalara ikinci bir odadan hava emmek için QE-AD ikinci oda valfi bağlanabilir. [AVenS s.21]
Alçıpan sistemlerine gömme montaj için QE-MH montaj tutucusu, kanal sistemleri ve asma tavanlar için QE-UMB
üniversal braketi aksesuar olarak sunulur. [QE s.16] Otomatik akustik hava girişleri 30 m³/h ve 45 m³/h
debilerde mevcuttur. [QE s.16] Aksesuar olarak 100, 125, 140, 160, 180 ve 200 mm çaplarda AVR yangın damperleri
vardır. [QE s.17] 100 mm kanal için manuel ve otomatik hava besleme valfleri ile bunların ses yalıtımlı
sürümleri sunulur. [QE s.17] Katalogda ana kolon çapı seçimi için 60 ve 100 m³/h anma debilerine göre kat
sayısı–çap diyagramları verilmiştir. [QE s.11]

---

## 3 · PUNTO EVO FLEXO Serisi

**DB:** `vortice-punto-evo-flexo` · 4 ürün · MEX 100/4" LL 1S · MEX 100/4" LL 1S T · MEX 120/5" LL 1S ·
MEX 120/5" LL 1S T [DB]

### Kimlik cümlesi

> Duvar ve tavan montajına uygun, duvardan ya da kısa kanallardan doğrudan hava atışı için tasarlanmış mini
> aksiyel fan serisi; 100 mm ve 120 mm olmak üzere iki anma çapı sunulur. [RES s.24]

### Dört madde

* İki sürüm vardır: Standart ve zaman saatli (T); seri aralıklı ya da sürekli havalandırma için uygundur. [RES s.24]
* Debi MEX 100/4" modellerinde 90 m³/h, MEX 120/5" modellerinde 175 m³/h'tir. [AVenS s.10]
  *(Kaynak s.10 model adını `MEX 100/4"` biçiminde, **inç işaretiyle** yazar ve o sayfada "mm"
  birimi hiç geçmez. Önceki yazım "100 mm modellerde" diyordu — birim kaynakta olmayan bir
  tamamlamaydı; kapı sıkılaştırılınca yakalandı ve model adına çevrildi.)*
* IP45 koruma sınıfı; banyoların Zone 1 bölgesi dâhil ıslak hacimlere montaja uygundur. [PEF s.3]
* Ses seviyesi 100 mm modellerde 26.9 dB(A), 120 mm modellerde 32.3 dB(A)'dır (Lp, 3 m). [PEF s.3]

### Yapısal bloklar

**Gövde.** Ön kapak, motor taşıyıcı ve entegre geri tepme klapesi; darbeye dayanıklı ve UV'ye dirençli ABS
termoplastik reçineden üretilmiştir. [PEF s.4] Montaj derinliği düşüktür: 100 mm modellerde 61,5 mm, 120 mm
modellerde 71 mm. [PEF s.3] Dış ölçüler kompakttır: 100 mm modellerde 173 mm, 120 mm modellerde 193 mm.
[PEF s.3] Ürün, geri dönüştürülebilir malzemeler ve "Design for Disassembly" tekniğiyle düşük çevresel etki
gözetilerek tasarlanmıştır. [PEF s.4]

**Çark.** Çarklar PP reçineden üretilmiş helikosantrifüj (karma akışlı) tiptedir. [PEF s.4] Çark ve motor
taşıyıcı; yüksek performans, düşük güç tüketimi ve düşük gürültü emisyonu için özel olarak tasarlanmıştır.
[PEF s.4] Türbülansı azaltan ve performansı iyileştiren bir akış toplayıcı bulunur. [PEF s.6] Azami basınç
100 mm modellerde 39.23 Pa, 120 mm modellerde 49.04 Pa'dır. [RES s.24]

**Motor.** Bilyalı yataklı Long Life motorlar, 30.000 saat kesintisiz ve sorunsuz çalışma için garanti
edilmiştir. [PEF s.4] Güç tüketimi 100 mm modellerde 9 W, 120 mm modellerde 13 W'tır. [PEF s.3] Besleme
gerilimi 230 V, 50 Hz'dir. [RES s.24] Motor devri MEX 100/4" LL 1S modelinde 2175, MEX 120/5" LL 1S modelinde
2075 dev/dak'tır. [RES s.24]

**Koruma.** Koruma derecesi IP45'tir. [PEF s.4] Yalıtım sınıfı II'dir. [PEF s.4] Entegre kelebek tip geri tepme
klapesi, cihaz kapalıyken istenmeyen hava girişini önler. [PEF s.4] Azami çalışma sıcaklığı 50 °C'dir.
[RES s.24]

**Kontrol.** Seri iki sürüm hâlinde sunulur: standart tek hızlı (1S) ve zaman saatli (T). [RES s.24] Zaman
saatli sürümler MEX 100/4" LL 1S T ve MEX 120/5" LL 1S T kodlarıyla listelenir. [AVenS s.10] Seri, aralıklı
veya sürekli havalandırma için uygundur. [RES s.24]
> *Zaman saati gecikme süreleri (açılma/kapanma dakikaları) bu dört kaynakta verilmemiştir —
> **kaynakta karşılığı yok**, uydurulmadı. Hız kontrol aksesuarı da Flexo için listelenmemiştir.*

**Montaj.** Tipik montaj yerleri duvar/panel, giydirme duvar, tavan ve asma tavandır. [PEF s.4] Düşük montaj
derinliği, 90° dirseklerin yakınlığı nedeniyle montaj alanının kısıtlı olduğu yerlerde bile uygulamaya
elverişlidir. [PEF s.4] Ürün yatay ve dikey monte edilebilir. [AVenS s.10] Ön kapak alet gerektirmeden kolayca
çıkarılabilir. [PEF s.6] Ürün ağırlığı 100 mm modellerde 0.60 kg, 120 mm modellerde 0.77 kg'dır. [PEF s.6]

---

## 4 · İki aileyi ayıran cümle

> **VORT QUADRO EVO bir sistemdir, PUNTO EVO FLEXO bir cihazdır.** Quadro Evo, ayrı satılan bir kasayla
> tamamlanan radyal (santrifüj) bir üniteyle 80 mm'lik kolona bağlanır ve gömme, K90 yangın kasası, nem/hareket
> sensörlü elektronik süit gibi seçeneklerle kurulur. [QE s.5] Punto Evo Flexo ise kasasız, tek parça bir
> helikosantrifüj duvar fanıdır; doğrudan duvardan veya kısa kanaldan atış yapar ve yalnız Standart ile zaman
> saatli sürüm sunar. [RES s.24]

Vitrinde ayrımın taşıyıcısı **debi değil kurgudur**: ikisinin debi aralıkları kısmen çakışır, ama biri kolonlu
bir bina havalandırma sistemine bağlanır, diğeri tek mahalli dışarıya boşaltır.

---

## 5 · Kaynakta bulduğum çelişki ve hatalar (hepsi kayıtta)

1. **Aynı ürünün ölçüleri iki kaynakta farklı.** Quadro Evo yüzey montaj sürümünün derinliği bir kaynakta
   111,5 mm'dir. [QE s.14] Aynı sürüm için diğer kaynakta 123,5 mm verilmiştir. [RES s.90] Gömme sürüm bir
   kaynakta 277 mm genişliktedir. [QE s.14] Diğer kaynakta aynı sürüm 262 mm genişliktedir. [RES s.90]
   **Bu yüzden taslakta ölçü verilmedi** — hangisinin güncel olduğu ölçülmedi.
2. **Ses basıncı ölçüm mesafesi iki kaynakta farklı etiketlenmiş.** Bir kaynakta tablo başlığı 1,5 m mesafeyi
   söyler. [QE s.13] Diğer kaynakta aynı dB değerleri 2 m mesafe başlığıyla verilmiştir. [RES s.89] dB
   değerleri iki kaynakta **birebir aynı**; yani en az biri yanlış etiketli. Taslakta ses gücü (LwA) değerleri
   kullanıldı, ses basıncı mesafesi kullanılmadı.
3. **Punto Evo Flexo koruma sınıfı iki kaynakta farklı.** Ana katalog "IPX5 and IP45" der. [RES s.24] Ürün
   broşürü ve TR fiyat listesi yalnız IP45 der. [PEF s.4] Taslakta yalnız **IP45** yazıldı (iki kaynağın
   kesişimi).
4. **Emirde verilen `PEF s.7–8` sayfaları Flexo değil.** PEF broşürünün 7. sayfası **Punto Evo / Punto Evo ES /
   Punto Evo Gold** kardeş serisini listeler, 8. sayfa künyedir. Flexo'nun kendi içeriği **s.3–s.6**'dadır;
   referanslar oraya verildi. Bu ayrım kritik: `ME` kodlu Punto Evo modelleri **çift hızlı ve beş sürümlü**,
   `MEX` kodlu Flexo modelleri **tek hızlı ve iki sürümlü** — karıştırılırsa vitrinde yanlış vaat doğar.
5. **AVenS s.20 Quadro Evo fiyat tablosunda sıralama tutarsızlığı var:** `QE 60/35 LL` satırı `QE 60/35 LL T`
   satırından daha yüksek fiyatla listelenmiş (217 ↔ 214). Fiyat bizim metnimize girmiyor, ama tabloyu otomatik
   ayrıştıran her hat bunu **tespit edip durmalı**; sessiz geçmesin diye kayda geçiriliyor.
6. **Quadro Evo kasa bilgisi emirde verilen s.20'de değil, s.21'dedir.** TR fiyat listesinde ünite sayfası
   (s.20) ile kasa sayfası (s.21) ayrıdır ve **kasa fiyata dahil değildir** ("kasa dahil değildir" notu
   s.20'dedir). Referanslar bilginin bulunduğu sayfaya verildi.
7. **AVenS s.21'de OCR/dizgi kaybı var:** birkaç kasa açıklaması cümle ortasından başlıyor ("…ren TUM onaylı
   DIN 18017-3'e uygun paslanmaz çelik valf."). Anlam kurtarılabiliyor ama **otomatik ayrıştırma için
   güvenilmez**; bu yüzden kasa metinleri özetlenerek değil, yalnız doğrulanabilir kısımlarıyla kullanıldı.
8. **Aksesuar kodu iki kaynakta farklı.** Otomatik akustik hava girişi EAA30 BL için bir kaynakta 91018 kodu
   verilirken diğerinde 23753 verilmiştir (QE s.16 ↔ RES s.92). Kod taslağa **alınmadı**.

## 6 · DB metniyle kaynak arasındaki farklar

* **`vortice-vort-quadro-evo` — "kanal tipi fan" nitelemesi kaynakla çelişiyor.** Kaynak ürünü "residential
  centrifugal extractor fans" / "duvar ve tavan tipi radyal fanlar" diye tanımlar; ürün bir **kanal fanı değil**,
  kasa üzerinden 80 mm kolona bağlanan bir **mahal aspiratörüdür**. (Kanal tipi fan bizde ayrıca Lineo ailesidir —
  aynı kelimeyi iki mimariye vermek vitrinde ayrımı öldürür.)
* **`vortice-vort-quadro-evo` — gömme (sıva altı) montaj DB metninde hiç yok.** Kaynak serinin yarısını gömme
  kasalar üzerine kurar; 10 kasanın 8'i gömme/K90 seçeneğidir. Bu, serinin **ana satış argümanıdır** ve bugün
  metinde görünmüyor.
* **`vortice-vort-quadro-evo` — modülerlik ve elektronik süit yok.** "23 ünite + 10 kasa" kurgusu ile
  T / TP / T PIR / TP HCS ayrımı DB metninde hiç geçmiyor; oysa 23 ürünü birbirinden ayıran **tek şey** budur.
* **`vortice-vort-quadro-evo` — "Long Life" doğru ama eksik.** Kaynak bunu "bilyalı yatak + en az 40.000 saat"
  diye niceliklendirir; DB metni yalnız etiketi taşıyor, sayıyı taşımıyor.
* **`vortice-punto-evo-flexo` — "100 mm çaplı" ifadesi seriyi yarıya indiriyor.** Seride 100 mm ve 120 mm
  vardır; 120 mm modeller debinin **büyük ucudur** (175 m³/h ↔ 90 m³/h). Bugünkü metinle 120 mm ürünler
  aranmadan kayboluyor.
* **`vortice-punto-evo-flexo` — DB'nin bildirdiği 90–175 m³/h aralığı kaynakla uyumlu.** AVenS TR listesi
  aynı iki değeri verir; bu turda **doğrulandı**, sorun yalnız çap ifadesindedir.

## 7 · Bu taslağın kapatmadığı

* **EN çevirisi yazılmadı** — bu tur TR. `description.en` ayrı tur ister.
* **Ölçü tabloları taslağa girmedi** (madde 1'deki çelişki nedeniyle); hangi kaynağın güncel olduğu ölçülmeli.
* **Kasa fiyatlandırması / "kasa dahil değildir" uyarısı** ticari metindir, vitrin anlatımına alınmadı.
* **`is_description_manual`** bayrağı: elle yazılan bu metin yüklenirse **true** yapılmalı.
* **Ticari onay yok** — Recep/uzman turu.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
