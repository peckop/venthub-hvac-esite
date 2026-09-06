<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf, CVL=Commercial_Ventilation_in_Line_1.pdf, DPC=Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf -->

# İçerik hattı — TR taslak: VORT COMMERCIAL IN-LINE · YUVARLAK + DİKDÖRTGEN

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** REC-146 Adım 2b, ikinci aile grubu
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır. Bu dosya kaynak/kanıt kaydıdır.
**Referans biçimi:** `[AVenS s.NN]` = AVenS Ürün Fiyat Kataloğu 2026 (TR) · `[CVL s.NN]` =
Commercial_Ventilation_in_Line_1.pdf (EN, **çevrildi**) · `[DPC s.NN]` =
Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf (EN, **çevrildi**)

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Kalıp: `docs/audits/icerik-hatti-taslak-lineo-2026-09-06.md` (LINEO taslağı).

---

## 0 · Neden bu ikisi birlikte yazıldı

İki aile de "VORT Commercial In-Line" başlığı altında duruyor ve bugünkü DB metinleri birbirine
karışmış durumda: yuvarlak aileye dikdörtgen ailenin gövde tarifi, dikdörtgen aileye ise yanlış bir
faz bilgisi yazılmış. Ayıran cümle ancak ikisi yan yana yazılınca görünür.

**Kaynak dengesizliği baştan söylenmeli:** yuvarlak aile iki İngilizce Vortice kataloğunda **tam
sayfa** anlatılır; dikdörtgen ailenin (CA IL … ES RECT) **hiçbir İngilizce katalogda karşılığı yoktur**
— tek kaynağı TR fiyat listesinin bir sayfasıdır. Bu yüzden dikdörtgen ailede iki blok **bilerek boş**
bırakıldı. (Ayrıntı → §5.1)

## 1 · Bugün DB'de ne var (emirle verildi)

| Aile | Ürün | Bugünkü `description.tr` | Tespit |
|---|---|---|---|
| `vortice-vort-commercial-in-line-circular` | 7 | "…kendinden sönümlü V0 plastik gövdeli karma akışlı havalandırma fanı (monofaze model)." | **V0 = gövde DEĞİL**, motor yuvası/klemens kutusu; gövde boyalı çelik saç |
| `vortice-vort-commercial-in-line-rectangular` | 5 | "…kendinden flanşlı dikdörtgen kanal tipi radyal fan (monofaze model)." | **"monofaze" YANLIŞ** — 5 modelin 2'si trifaze; ayrıca faz bilgisi kaynakta hiç geçmiyor |

---

## 2 · CA MD Serisi — Yuvarlak Kanal Tipi (`…-circular`)

**DB:** 7 ürün · CA 100 / 125 / 150 / 150 Q / 200 / 250 / 315 MD · debi 340–1800 m³/h

### Kimlik cümlesi
> Asma tavana veya çatı arasına monte edilen, boyalı çelik saç gövdeli yuvarlak kanal tipi fan
> serisi; konut, ticari ve endüstriyel mahaller (mutfaklar, tuvaletler, laboratuvarlar, barlar,
> restoranlar, çamaşırhaneler, mağazalar) için düşük görsel etkili havalandırma çözümü. [DPC s.32]

### Dört madde
* Anma çapı 100 ile 315 mm arasında değişen modeller. [DPC s.32]
* Zorlu hava koşullarına ve yüksek sıcaklığa dayanacak biçimde üretilmiş; geniş sürekli çalışma sıcaklık aralığı -25 °C / +50 °C. [DPC s.32]
* Toz ve suya karşı yüksek koruma derecesi IP44. [DPC s.32]
* Hava debisi 340 m³/h ile 1800 m³/h arasında. [AVenS s.25]

### Yapısal bloklar

**Gövde.** Dekapaj görmüş, fosfat kaplı çelik saç gövde; agresif hava koşullarına karşı polyester
boya ile boyanmıştır. [DPC s.32] Şebeke bağlantı klemenslerini ve akış yönlendirici kanatçıkları
barındıran motor yuvası, kendinden sönümlü plastik reçineden (V0) üretilmiştir. [DPC s.32]
Fiyat listesindeki tanım: metal gövde, standart montaj ayağı. [AVenS s.25]
> *DB'deki bugünkü metin V0 sınıfını gövdeye atfediyor; kaynak bu sınıfı **motor yuvası ve klemens
> kutusu** için kullanıyor, gövde boyalı çelik saçtır.* [DPC s.32]

**Çark.** Geriye eğimli santrifüj çark kullanılır. [CVL s.34] Kanatlar, yapısal dayanım ile boyutsal
kararlılığı birlikte sağlamak üzere cam elyaf takviyeli, ısıya dayanıklı plastik reçineden
üretilmiştir. [DPC s.32] Cihaz içindeki türbülansı azaltmak için akış yönlendirici kanatçıklar
optimize edilmiştir. [CVL s.34]

**Motor.** Termik aşırı yük korumalı AC motorlar; milleri bilyalı yataklarda döner ve azami etiket
sıcaklığında en az 30.000 saat sürekli çalışmayı güvence altına alır. [DPC s.32] Yüksek verimli
bilyalı yataklı motorlar düşük gürültü emisyonu ve düşük özgül tüketim sağlar. [CVL s.34]
Elektrik beslemesi 230 V ~ 50 Hz. [CVL s.34]

**Koruma.** Toz ve suya karşı koruma derecesi IP44 — cihaz emiş ve basma tarafında kanala bağlıyken
geçerlidir. [DPC s.32] Yalıtım sınıfı II. [DPC s.32] Performans ve güvenlik, bağımsız üçüncü taraf
kuruluş (IMQ) tarafından belgelenmiştir. [DPC s.32] Aşırı yük koruması standarttır. [AVenS s.25]

**Kontrol.** Fanlar çift hızlıdır; hız anahtarına ihtiyaç duymadan iki farklı hava debisi sağlanabilir,
isteğe bağlı olarak hız anahtarı ile kontrol edilebilir. [AVenS s.25] Hız anahtarları sıva üstü
montajlı, sigorta korumalı, minimum hız ayarlı ve On/Off anahtarlıdır. [AVenS s.25] Ürün, uzaktan
ortam sıcaklığı, nem, duman ve varlık sensörlerine bağlanabilir (opsiyonel). [DPC s.32]
> *Kaynak çelişkisi kayda geçirildi: İtalyan kataloğu aynı seriyi üç hızlı olarak tanımlar ve
> opsiyonel TRIO-CA cihazıyla ayarlandığını söyler.* [DPC s.32]

**Montaj.** Yatay, dikey veya eğimli monte edilebilir. [DPC s.32] Duvar, tavan ve asma tavan montajı
için galvanizli çelik saç braketler standart olarak ürünle birlikte verilir. [DPC s.32] Fiyat
listesinde de standart montaj ayağı ürüne dahildir. [AVenS s.25]

---

## 3 · CA IL ES RECT Serisi — Dikdörtgen Kanal Tipi (`…-rectangular`)

**DB:** 5 ürün · CA IL 4020 / 5035 / 6040 / 7050 / 8060 ES RECT · debi 715–7030 m³/h

### Kimlik cümlesi
> Dikdörtgen flanşlı galvanizli çelik gövdeli, yüksek verimli EC motorlu dikdörtgen kanal tipi fan
> serisi. [AVenS s.26]

### Dört madde
* Dikdörtgen flanşlı galvanizli çelik gövde. [AVenS s.26]
* Kendi kendini temizleyen, yüksek performanslı, geriye eğimli kanat. [AVenS s.26]
* Yüksek verimli EC motor ve düşük ses seviyesi. [AVenS s.26]
* Hava debisi 715 m³/h ile 7030 m³/h arasında değişen beş model. [AVenS s.26]

### Yapısal bloklar

**Gövde.** Dikdörtgen flanşlı, galvanizli çelik gövde. [AVenS s.26]

**Çark.** Kendi kendini temizleyen, yüksek performanslı, geriye eğimli kanat. [AVenS s.26]

**Motor.** Yüksek verimli EC motor. [AVenS s.26] Seri, düşük ses seviyesi ile öne çıkarılır. [AVenS s.26]

**Koruma.** — **kaynakta karşılığı yok, boş bırakıldı.** (TR fiyat listesinin bu sayfasında koruma
sınıfı, yalıtım sınıfı, sıcaklık aralığı veya sertifika bilgisi verilmemiştir; bu seri için İngilizce
katalog karşılığı da yoktur → §5.1.)

**Kontrol.** 0-10 V veya PWM sinyaliyle hız kontrolü yapmak mümkündür. [AVenS s.26] Seriye POT (REGC)
kodlu EC motor hız anahtarı sunulur. [AVenS s.26] Sensör üniteleri; sıcaklık, duman, nem, hareket ve
zaman ile ilgili değişiklikleri algılayıp havalandırma fanını istenilen değerde çalıştıran
cihazlardır. [AVenS s.26]

**Montaj.** — **kaynakta karşılığı yok, boş bırakıldı.** (Sayfada montaj yönü, braket veya sabitleme
öğesi tarif edilmemiştir. "Dikdörtgen flanş" bir gövde tarifi olarak Gövde bloğunda kalmıştır;
ondan montaj biçimi **çıkarılmadı**.)

---

## 4 · İki aileyi ayıran cümle

> **CA MD yuvarlak kanala, CA IL ES RECT dikdörtgen kanala bağlanır; ayrım yalnızca kesitte
> değildir.** CA MD boyalı çelik saç gövdeli ve AC motorludur. [DPC s.32] Fanları çift hızlıdır.
> [AVenS s.25] CA IL ES RECT ise galvanizli çelik gövdelidir ve kademesiz hız kontrolüne açık
> (0-10 V veya PWM) EC motorludur. [AVenS s.26]

Vitrinde bu farkın görünmesi şart: "kanal tipi fan" ikisini de anlatır, ama biri **hız kademesi**
seçtirir, diğeri **sinyalle sürekli hız** verir.

---

## 5 · Kaynakta ve veride bulduklarım (hepsi kayıtta)

### 5.1 · Dikdörtgen ailenin İngilizce katalog karşılığı YOK (ölçüldü)

Her iki İngilizce PDF'in **tüm sayfaları** `RECT|4020|5035|6040|7050|8060` deseniyle tarandı:
model adları **sıfır kez** geçiyor (CVL 88 sayfa, DPC 84 sayfa).

Emirde işaret edilen **DPC s.76–84 "CA IN-LINE QUIET ES RANGE" bu aile DEĞİLDİR.** O bölüm
CA-IL 100 / 125 / 150 / 160 / 200 QUIET ES modellerini anlatır: dairesel bağlantı ağızlı, melamin
akustik kaplamalı, azami debileri 310–850 m³/h olan **yassı sessiz** bir seri. Bizim serimizin
debileri 715–7030 m³/h; model adları da örtüşmüyor. **Bu bölümden tek cümle alınmadı** — alınsaydı
yanlış aileye doğru görünen bir metin yazılmış olurdu.

### 5.2 · Bugünkü DB metinlerindeki hatalar

1. **Yuvarlak aile — "V0 plastik gövde" yanlış.** Kaynak, kendinden sönümlü V0 plastik reçineyi
   **motor yuvası / klemens kutusu** için kullanır; gövde dekapajlı-fosfatlı, polyester boyalı
   çelik saçtır [DPC s.32]. TR fiyat listesi de "Metal gövde" der [AVenS s.25].
2. **Dikdörtgen aile — "(monofaze model)" yanlış.** DB'ye göre 5 modelin 2'si trifaze. Ayrıca faz
   bilgisi AVenS s.26'da **hiç geçmiyor** — bu yüzden düzeltilmiş metin faz bilgisi **yazmıyor**,
   uydurmuyor da. Faz alanı ürün teknik tablosundan gelmelidir, anlatımdan değil.
3. **Yuvarlak aile — "karma akışlı" ifadesi tartışmalı** (bkz. 5.3/2). Taslak, kimlik cümlesinde
   akış tipi iddiasını kullanmadı; "yuvarlak kanal tipi fan" dedi.

### 5.3 · Kaynaklar arası çelişkiler (hiçbiri sessizce çözülmedi)

1. **Hız kademesi:** AVenS s.25 "standart iki hızlı … Fanlar çift hızlıdır"; DPC s.32 "3-speed fans
   … optional device TRIO-CA (code 12869)"; CVL s.34 "Two speeds". **2'ye 1** — taslak TR kaynağını
   (çift hızlı) esas aldı, çelişkiyi Kontrol bloğunda alıntı olarak bıraktı.
2. **Fan tipi:** DPC s.32 seriyi "mixed flow duct fans" (karma akışlı) diye tanımlıyor; CVL s.34 ise
   aynı seriyi "In-line centrifugal fans in metal" başlığıyla veriyor ve "Backward curved centrifugal
   impellers" diyor. **Karma akışlı, santrifüj ile aynı şey değildir.** Taslak çarkı, iki kaynağın da
   hemfikir olduğu yönüyle ("geriye eğimli") tarif etti; akış tipi iddiası kimlik cümlesine sokulmadı.
3. **Model sayısı:** CVL s.34 "13 models: from 100 diameter to 315"; DPC s.32 "8 models, with nominal
   diameter between 100 and 315 mm". Kapsam farkı: CVL, CA MD **ve CA MD E**'yi birlikte sayıyor.
   Taslak sayı yazmadı, çap aralığı yazdı.
4. **Ürün kodları iki İngilizce katalogda FARKLI.** CA 100 / 125 / 150 Q MD için CVL s.34: 16150,
   16151, 16152; DPC s.33 ve AVenS s.25: 16107, 16108, 16109. Aynı model, iki kod ailesi. Taslakta
   kod kullanılmadı; ama **CSV/SKU eşlemesi yapan her iş bunu bilmeli.**
5. **AVenS s.26'da CA IL ES RECT satırlarının KOD sütunu BOŞ.** Fiyat listesindeki diğer bütün
   tablolarda kod var; bu tabloda yok. Aksesuar satırında (POT/REGC) kod var.
6. **Emirde verilen AVenS s.32 bu ailelerden hiçbiri değil.** O sayfa `CA MD E RF` — yatay atışlı
   **çatı tipi** fanlar. Kullanılmadı.
7. **CVL s.34'te yazım hatası:** "Avalable only for the Extra EU market" (doğrusu *Available*).
   İçerik doğru, yazım yanlış.
8. **Katalogda olup DB'de olmayan boy:** `CA 160 MD` her iki İngilizce katalogda da var
   (CVL s.34, DPC s.35); bizim yuvarlak ailemizde 160 boy **yok**. Metinde kullanılmadı.

---

## 6 · Bu taslağın kapatmadığı

* **EN çevirisi yazılmadı** — bu tur TR. `description.en` ayrı tur ister.
* **Dikdörtgen ailede Koruma ve Montaj blokları boş.** Doldurmanın tek dürüst yolu üreticiden
  ayrı bir teknik doküman (koruma sınıfı, yalıtım sınıfı, sıcaklık aralığı) getirmektir. Boş kalması
  bir eksiklik değil, **ölçülmüş bir kaynak boşluğudur.**
* **Ses, basınç ve güç tabloları taslağa girmedi.** Kaynakta var; sayı yazmak ayrı bir
  birim/doğrulama turu ister.
* **Faz bilgisi (mono/tri) anlatım metnine yazılmadı** — teknik tablo alanıdır.
* **`is_description_manual`** yükleme sırasında **true** yapılmalı; aksi halde bir sonraki otomatik
  tur bu metni ezer.
* **Ticari onay yok** — Recep/uzman turu.

---

— URUN-KATALOG alt-ajanı (sid 3a7976a1), 2026-09-06
