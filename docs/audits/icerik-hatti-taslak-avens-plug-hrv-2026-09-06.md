<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf -->
<!-- VARSAYILAN-KAYNAK: AVenS -->

# İçerik hattı — TR taslak: AVenS KENTALFAN plug fanlar · AVenS ısı geri kazanım cihazları

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır.
**Kaynak:** AVenS 2026 ürün fiyat kataloğu (TR) — plug fanlar **s.50, 51**, ısı geri kazanım **s.68**
(ek ürünler s.69) · **Referans biçimi:** `[AVenS s.NN]`
**AVenS = VentHub'ın kendi markasıdır** — bu, kaynakta olmayanı yazma izni değildir; her cümle sayfaya bağlıdır.

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — uydurma yok; **yanlış kapsamlı bilgi de vaat ihlalidir**.
* Kararlar — Vitrin 15A **K6** · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok.
* `icerik-hatti-taslak-heatmaster-slimroof-2026-09-06.md` — kalıp ve tek-model kusuru örneği.

---

## 0 · Bu grupta ne düzeltiliyor

| Aile | Bugün DB'de yazan | Kaynaktaki gerçek |
|---|---|---|
| `avens-plug-fanlar` | "**315 mm** nominal çaplı", "**trifaze** model" (14 üründe tek şablon) | seri **315–630** boy · **3 monofaze + 11 trifaze** · 2590–22550 m³/h |
| `avens-isi-geri-kazanim` | açıklama **BOŞ** | 750 / 1000 / 2000 m³/h · alüminyum eşanjör · G4 filtre · plug fan |

Plug fan metninde serinin **en küçük** modeli, serinin tamamı gibi sunulmuş; ayrıca faz bilgisi
14 ürünün hepsinde aynı yazılmış hâlde. Taslak bunu **aralık vererek** düzeltir.

---

## 1 · AVenS KENTALFAN — IEC motorlu plug fanlar

**DB:** `avens-plug-fanlar` · **14 ürün** · KENTALFAN 315 / 355 / 400 / 450 / 500 / 560 / 630

### Kimlik cümlesi

> Klima santralleri, ısı geri kazanım cihazları ve plenum kutuları için geliştirilmiş; geriye eğik kanatlı, tek emişli, doğrudan tahrikli IEC motorlu plug fan serisidir. [AVenS s.50]

### Dört madde

* Seride 14 model bulunur; hava debisi 2590 m³/h ile 22550 m³/h arasında değişir. [AVenS s.50]
* Motor gücü 0,25 kW ile 5,5 kW arasındadır. [AVenS s.50]
* Üç model monofaze (M4), on bir model trifazedir (T2 / T4 / T6 sürümleri). [AVenS s.50, 51]
* IP-55 korumalı ve F sınıfı elektrik yalıtımlı, IEC standartlı asenkron motorla sunulur. [AVenS s.50, 51]

### Yapısal bloklar

**Gövde.** Gövde malzemesi, kaplaması ve yapısı için **kaynakta karşılığı yok** — s.50 ve s.51 yalnız model, kod, elektriksel değer ve ağırlık verir. Seri ağırlıkları 15 kg ile 82 kg arasındadır. [AVenS s.51]

**Çark.** Geriye eğik kanatlı, tek emişli, yüksek performanslı çark. [AVenS s.50] Seri KENTALFAN 315'ten KENTALFAN 630'a kadar boy numaralarıyla sunulur. [AVenS s.50] Bu boy numaralarının "nominal çap (mm)" karşılığı fiyat listesinde açıkça yazmaz; canlı veride 315–630 mm nominal çap olarak kayıtlıdır. [DB] Kanat sayısı, çark malzemesi ve emiş ağzı ölçüsü kaynakta verilmemiştir.

**Motor.** Doğrudan tahrikli, IEC standartlı asenkron motor. [AVenS s.50] Monofaze modeller 4 kutupludur ve 230 V ile listelenir; trifaze modeller 2, 4 ve 6 kutuplu sürümler hâlinde 230 V / 400 V değerleriyle verilir. [AVenS s.51] Devir sayısı 900 ile 1460 arasında değişir (d/dk). [AVenS s.51] Motor gücü 0,25 kW ile 5,5 kW arasındadır. [AVenS s.50, 51]

**Koruma.** IP-55 koruma derecesi ve F sınıfı elektrik yalıtımı. [AVenS s.50, 51] Çalışma sıcaklığı aralığı, ATEX ya da duman sertifikası ve emniyet şalteri gibi kalemler için **kaynakta karşılığı yok** — s.49'daki sıcaklık değerleri **başka bir aileye (ENKELFAN EC)** aittir, bu seriye taşınmadı.

**Kontrol.** **Kaynakta karşılığı yok** — s.50 ve s.51'de hız kontrolü, frekans sürücüsü, sinyal girişi ya da kontrol panosu hakkında hiçbir ifade bulunmuyor.

**Montaj.** Doğrudan tahrikli OEM fan olarak sunulur; uygulama alanları klima santralleri, ısı geri kazanım cihazları ve plenum kutularıdır. [AVenS s.50, 51] Montaj plakası, delik deseni, flanş ve gabari ölçüleri kaynakta verilmemiştir.

---

## 2 · AVenS alüminyum eşanjörlü ısı geri kazanım cihazları

**DB:** `avens-isi-geri-kazanim` · **3 ürün** · AVenS 750 / 1000 / 2000

### Kimlik cümlesi

> Eurovent sertifikalı alüminyum eşanjör, G4 filtre ve plug fan ile kurulmuş, kanal bağlantılı ısı geri kazanım cihazı ailesidir. [AVenS s.68]

### Dört madde

* Vitrindeki üç modelin nominal hava debileri 750 m³/h, 1000 m³/h ve 2000 m³/h'tir; model adındaki sayı **debiyi** gösterir. [AVenS s.68]
* Eurovent sertifikalı alüminyum eşanjör, G4 filtre ve plug fanlı yapı. [AVenS s.68]
* Opsiyonel elektrikli ısıtıcı gücü AVenS 750 ve AVenS 1000 için 3 kW, AVenS 2000 için 6 kW olarak verilir. [AVenS s.68]
* Cihazlar dijital kontrol panosuyla birlikte sunulur. [AVenS s.68]

### Yapısal bloklar

**Gövde.** AVenS 750 ve AVenS 1000 gövde ölçüleri (L × W × H) 910 mm × 815 mm × 350 mm'dir. [AVenS s.68] AVenS 2000 gövde ölçüsü 1400 mm × 1025 mm × 500 mm'dir. [AVenS s.68] Gövde sacı, yalıtımı ve kapak düzeni kaynakta anlatılmamıştır.

**Çark.** Cihazlar plug fanlıdır. [AVenS s.68] Fan adedi, çark çapı, kanat biçimi ve devir bilgisi kaynakta verilmemiştir.

**Motor.** **Kaynakta karşılığı yok** — s.68'de motor tipi, gücü, gerilimi, devri ve verim sınıfı hakkında hiçbir ifade bulunmuyor.

**Koruma.** Hava filtrasyonu G4 sınıfı filtre ile yapılır. [AVenS s.68] Koruma derecesi (IP), elektrik yalıtım sınıfı, donma koruması ve çalışma sıcaklığı aralığı için **kaynakta karşılığı yok**.

**Kontrol.** Cihazlar dijital kontrol panosuyla birlikte sunulur. [AVenS s.68] Panonun işlevleri, haberleşme protokolü, sensör donanımı ve kademe sayısı kaynakta anlatılmıyor.

**Montaj.** Kanal bağlantı ağzı ölçüleri AVenS 750 için 250 mm × 250 mm, AVenS 1000 için 275 mm × 275 mm, AVenS 2000 için 300 mm × 300 mm'dir. [AVenS s.68] Kanal tipi elektrikli ısıtıcı ve sulu batarya, bu üç model için ayrı ürün olarak listelenir ve kontrol paneliyle birlikte kullanılır. [AVenS s.69] Cihazın montaj biçimi (tavana asma, döşemeye oturtma vb.) ve askı noktaları kaynakta belirtilmemiştir.

---

## 3 · Kaynakta ve veride bulduklarım (K7.5)

1. **IP55 / F sınıfı iddiası DOĞRULANDI.** Kaynak s.50 ve s.51 başlığında birebir şöyle yazar:
   "IP-55 korumalı ve F sınıfı elektrik yalıtımlı, IEC standartlı asenkron motor". Yani bugün canlı
   sayfada duran iki iddia da gerçektir; **kusur yalnız kapsamdadır** (tek çap, tek faz). Yazım biçimi
   kaynakta tireli — **IP-55** — bu taslakta da tireli bırakıldı.
2. **750 / 1000 / 2000 gerçekten DEBİDİR**, sıra numarası değil: s.68 tablosunda "DEBİ" sütunu bu üç
   model için sırasıyla 750 m³/h, 1000 m³/h ve 2000 m³/h değerlerini verir. [AVenS s.68]
3. **Kaynak s.68'de dokuz model listelenir, vitrinde üç model var** (750 / 1000 / 2000). Aralık bu yüzden
   yalnız sattığımız modellerden verildi: 750 m³/h ile 2000 m³/h. [AVenS s.68]
4. **Kaynak kendi içinde çelişiyor (KENTALFAN 630 T6):** hava debisi s.50'de 14820 m³/h, s.51'de
   14280 m³/h yazar. [AVenS s.50, 51] Canlı veri s.51 değerini almış. [DB] Bu yüzden taslakta model bazlı
   debi kullanılmadı; yalnız seri aralığı verildi — aralık uçları (2590 ve 22550) iki sayfada da aynıdır.
5. **Kaynakta tablo başlığı hatası var (s.51):** KENTALFAN 315 T2 satırı "Single-phase motor / 4 poles"
   başlıklı bloğun altında duruyor, buna karşın 400 V sütununda akım değeri taşıyor. [AVenS s.51]
   Model kodu (T2) ve bu sütun trifazeyi gösterirken başlık monofaze diyor; taslakta o başlığa dayanan
   hiçbir cümle kurulmadı, faz dağılımı model kodlarından sayıldı.
6. **Plug fanda Gövde ve Kontrol blokları boş kaldı.** Fiyat listesi bu seri için yalnız tablo verir;
   gövde malzemesi ve hız kontrolü hakkında tek kelime yoktur. Uydurmak yerine blok boş bırakıldı — bu
   bilgiler ancak AVenS teknik kataloğu/veri sayfası geldiğinde yazılabilir.
7. **Isı geri kazanımda Motor bloğu boş kaldı.** s.68 motor hakkında hiçbir şey söylemiyor; "plug fanlı"
   ifadesinden motor tipi çıkarmak uydurma olurdu.

## 4 · Kapatmadığı

* **EN çevirisi yazılmadı** (ayrı tur).
* **Debi/basınç eğrileri ve model bazlı tablolar taslağa girmedi**; aralık dışında model bazlı sayı kullanılmadı.
* **`is_description_manual`** bugün `false`; bu metin yüklenirse **true** yapılmalı, yoksa sonraki
  otomatik tur ezer.
* Ticari onay yok. Fiyat/stok/teslim vaadi içermez.

---

— URUN-KATALOG alt-ajanı (sid 3a7976a1), 2026-09-06
