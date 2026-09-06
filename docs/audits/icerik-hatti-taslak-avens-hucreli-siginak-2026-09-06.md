<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf -->
<!-- VARSAYILAN-KAYNAK: AVenS -->

# İçerik hattı — TR taslak: AVenS Hücreli Aspiratörler + AVenS Sığınak Havalandırma (REC-146, iki paylaşımlı çift)

**Şerit:** URUN-KATALOG · **Marka:** AVenS (**VentHub'ın kendi markası**)
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır. Bu dosya kaynak/kanıt kaydıdır.
**Kaynak:** AVenS Ürün Fiyat Kataloğu 2026 (TR) — **s.28** (hücreli çift) · **s.56** (sığınak çift)
**Referans biçimi:** `[AVenS s.NN]` = AVenS 2026 fiyat kataloğu (74 sayfa; PDF sayfa no = basılı sayfa no, ölçüldü)

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Kararlar — Katalog ve Ürün Verisi **K7.5** (her tespit kayıtta).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Kalıp örneği: `docs/audits/icerik-hatti-taslak-lineo-2026-09-06.md`.

---

## 0 · Neden bu dört aile birlikte yazıldı

İki **paylaşımlı çift** var: `avens-hucreli-aspiratorler` ile `avens-hucreli-hf-s` **aynı sayfayı**
(s.28), `avens-siginak-havalandirma-uniteleri` ile `avens-bvu-ls` **aynı sayfayı** (s.56) paylaşıyor.
Paylaşık sayfayı doğru aileye bölmenin tek dürüst yolu ikisini yan yana yazmaktır; ayıran cümle
ancak karşılaştırınca görünür. Ayrı yazılsalardı iki hücreli aile de "kayış kasnaklı hücreli radyal
fan" diye başlayacak, iki sığınak ailesi de "sığınak havalandırma" diye başlayacaktı — vitrinde
**dört ayrı sayfa, iki cümle** çıkardı.

## 1 · Kaynakta gerçekten ne var (ölçüldü, 2026-09-06)

PyMuPDF `get_text("blocks")` ile s.28 ve s.56 tam çıkarıldı. **Ölçülen hacim çok düşük:**

| Aile | DB slug | Ürün | Kaynak sayfa | Kaynakta bulunan tanıtım metni |
|---|---|---|---|---|
| AVenS-HF/FW | `avens-hucreli-aspiratorler` | 6 | s.28 | **1 cümle** + 2 rozet + 6 satırlık tablo |
| AVenS-HF/S | `avens-hucreli-hf-s` | 7 | s.28 | **1 cümle** + 2 rozet + 7 satırlık tablo |
| AVenS BVU | `avens-siginak-havalandirma-uniteleri` | 3 | s.56 | **0 cümle**, **6 madde** + 3 satırlık tablo |
| AVenS BVU-LS | `avens-bvu-ls` | 2 | s.56 | **0 cümle**, 1 dipnot + 2 satırlık tablo |

Katalogda bu ailelere ait **başka sayfa yoktur**: `HF/FW`, `HF/S`, `BVU`, `SIĞINAK`, `KURŞUN`,
`SEPERATÖR`, `H13`, `serpinti` terimleri 74 sayfanın tamamında tarandı; s.4 ve s.5 (**içindekiler**)
dışında yalnız s.28 ve s.56'da geçiyor. Yani **üretici föyü yok, elimizdeki her şey bu iki sayfa.**

---

## 2 · AVenS-HF/FW — Sık Kanatlı Kayış Kasnaklı Hücreli Radyal Fanlar

**DB:** `avens-hucreli-aspiratorler` · 6 ürün · açıklama **BOŞ**

### Kimlik cümlesi
> Sık kanatlı, kayış kasnaklı, çift cidar hücreli radyal fan ailesi; yüksek debi ve yüksek basınç gerektiren havalandırma uygulamaları için 50 mm standart hücre paneliyle üretilir. [AVenS s.28]

### Maddeler
* Hücre paneli 50 mm standart; dış cidar elektrostatik toz boyalıdır. [AVenS s.28]
* Çark statik ve dinamik balans ayarlıdır; kaynak bu ürünleri "yüksek performanslı radyal fanlar" olarak tanımlar. [AVenS s.28]
* Anma güçleri 1,1 kW ile 5,5 kW arasındadır. [AVenS s.28]
* Hava debisi 3400 m³/h ile 18000 m³/h arasında; kataloğun basınç sütunu 250 Pa ile 350 Pa arasındadır. [AVenS s.28]

### Model listesi (kaynaktan birebir)

| Kod | Model | Güç | Hava debisi | Basınç kaybı | Ref |
|---|---|---|---|---|---|
| 20100 | AVenS-HF/FW 7/7 | 1,1 kW | 3400 m³/h | 250 Pa | [AVenS s.28] |
| 20110 | AVenS-HF/FW 9/9 | 1,5 kW | 5000 m³/h | 250 Pa | [AVenS s.28] |
| 20120 | AVenS-HF/FW 10/10 | 2.2 kW | 7000 m³/h | 250 Pa | [AVenS s.28] |
| 20130 | AVenS-HF/FW 12/12 | 3 kW | 9500 m³/h | 250 Pa | [AVenS s.28] |
| 20140 | AVenS-HF/FW 15/15 | 4 kW | 14000 m³/h | 250 Pa | [AVenS s.28] |
| 20150 | AVenS-HF/FW 18/18 | 5,5 kW | 18000 m³/h | 350 Pa | [AVenS s.28] |

*Ondalık ayırıcı (`2.2` ile `1,1`) kaynakta karışıktır; tablo kaynağa birebir sadık bırakıldı — §9 bulgu 3.*

### Yapısal bloklar

**Gövde.** Çift cidar hücreli yapı; 50 mm standart hücre paneli ve elektrostatik toz boyalı dış cidar. [AVenS s.28]

**Çark.** Sık kanatlı radyal çark; statik ve dinamik balans ayarlıdır. [AVenS s.28]

**Motor.** Tahrik **kayış-kasnaklıdır**; anma güçleri 1,1 kW ile 5,5 kW arasında sıralanır. [AVenS s.28]
*Motor tipi, yalıtım sınıfı, devir ve IP derecesi: **kaynakta karşılığı yok.***

**Koruma.** **Kaynakta karşılığı yok** — s.28'de koruma derecesi, yalıtım sınıfı, yangın/sıcaklık
dayanımı veya sertifika bilgisi geçmiyor.

**Kontrol.** **Kaynakta karşılığı yok** — hız kademesi, kumanda veya frekans konvertörü bilgisi yok.
Kaynak yalnız "farklı opsiyonlar için iletişime geçiniz" notunu düşer. [AVenS s.28]

**Montaj.** **Kaynakta karşılığı yok** — montaj biçimi, yön, titreşim sönümleyici veya kanal bağlantısı
hakkında s.28'de tek satır yok.

---

## 3 · AVenS-HF/S — Seyrek Kanatlı Kayış Kasnaklı Hücreli Radyal Fanlar

**DB:** `avens-hucreli-hf-s` · 7 ürün · açıklama **BOŞ**

### Kimlik cümlesi
> Seyrek kanatlı, kayış kasnaklı, çift cidar hücreli radyal fan ailesi; HF/FW ile aynı 50 mm hücre gövdesini kullanır, kapasitesi 25000 m³/h ve 11 kW seviyesine kadar uzanır. [AVenS s.28]

### Maddeler
* Hücre paneli 50 mm standart; dış cidar elektrostatik toz boyalıdır. [AVenS s.28]
* Çark statik ve dinamik balans ayarlıdır; kaynak bu ürünleri "yüksek performanslı radyal fanlar" olarak tanımlar. [AVenS s.28]
* Anma güçleri 1,1 kW ile 11 kW arasındadır. [AVenS s.28]
* Hava debisi 4000 m³/h ile 25000 m³/h arasında; kataloğun basınç sütunu 250 Pa ile 500 Pa arasındadır. [AVenS s.28]

### Model listesi (kaynaktan birebir)

| Kod | Model | Güç | Hava debisi | Basınç kaybı | Ref |
|---|---|---|---|---|---|
| 20200 | AVenS-HF/S 250 | 1,1 kW | 4000 m³/h | 250 Pa | [AVenS s.28] |
| 20210 | AVenS-HF/S 280 | 1,5 kW | 6000 m³/h | 250 Pa | [AVenS s.28] |
| 20220 | AVenS-HF/S 315 | 3 kW | 9500 m³/h | 250 Pa | [AVenS s.28] |
| 20230 | AVenS-HF/S 355 | 4 kW | 12000 m³/h | 250 Pa | [AVenS s.28] |
| 20240 | AVenS-HF/S 400 | 5.5 kW | 16000 m³/h | 250 Pa | [AVenS s.28] |
| 20250 | AVenS-HF/S 450 | 7,5 kW | 20000 m³/h | 400 Pa | [AVenS s.28] |
| 20260 | AVenS-HF/S 500 | 11 kW | 25000 m³/h | 500 Pa | [AVenS s.28] |

### Yapısal bloklar

**Gövde.** HF/FW ile ortak: çift cidar hücreli yapı, 50 mm standart hücre paneli, elektrostatik toz boyalı dış cidar. [AVenS s.28]

**Çark.** **Seyrek kanatlı** radyal çark; statik ve dinamik balans ayarlıdır. [AVenS s.28]

**Motor.** Tahrik **kayış-kasnaklıdır**; anma güçleri 1,1 kW ile 11 kW arasında sıralanır. [AVenS s.28]
*Motor tipi, yalıtım sınıfı, devir ve IP derecesi: **kaynakta karşılığı yok.***

**Koruma.** **Kaynakta karşılığı yok** — HF/FW ile aynı boşluk.

**Kontrol.** **Kaynakta karşılığı yok.** Kaynak yalnız "farklı opsiyonlar için iletişime geçiniz" notunu düşer. [AVenS s.28]

**Montaj.** **Kaynakta karşılığı yok.**

---

## 4 · ÇİFT 1 — İki hücreli aileyi ayıran cümle

> **AVenS-HF/FW ile AVenS-HF/S aynı hücre gövdesindendir:** ikisi de 50 mm standart hücre paneli, çift cidar yapı, elektrostatik toz boyalı dış cidar ve **kayış-kasnak tahrik** kullanır; ayıran tek şey **kanat sıklığıdır** — HF/FW **sık kanatlı**, HF/S **seyrek kanatlıdır** — ve buna bağlı kapasite bandı: HF/FW 3400 m³/h ile 18000 m³/h arasında ve 5,5 kW seviyesine kadar, HF/S 4000 m³/h ile 25000 m³/h arasında ve 11 kW seviyesine kadar. [AVenS s.28]

**Ayrım kaynakta nerede bulundu:** iki başlık satırının kendisinde —
`AVenS-HF/FW SIK KANATLI KAYIŞ KASNAKLI HÜCRELİ RADYAL FANLAR` ve
`AVenS-HF/S SEYREK KANATLI KAYIŞ KASNAKLI HÜCRELİ RADYAL FANLAR`. [AVenS s.28]
Başlıklardan sonraki tanıtım cümlesi **iki ailede kelimesi kelimesine aynıdır**; rozetler de aynıdır
(`YÜKSEK DEBİ VE YÜKSEK BASINÇ`, `ÇİFT CİDAR HÜCRELİ`). Yani ayrım **yalnız iki kelimede** yaşıyor:
*sık* ve *seyrek*. Vitrinde bu iki kelime görünmezse iki sayfa birbirinin kopyası olur.

⚠ **İş emrindeki ipucu ölçümle düştü.** Emir "HF/FW = kayış-kasnaklı, çift emişli; HF/S muhtemelen
farklı tahrik/çark" diyordu. Kaynak bunu **doğrulamıyor**: **her ikisi de kayış kasnaklıdır** ve
s.28'de **"çift emişli" ifadesi hiç geçmez**. "Çift emişli" nitelemesi bu katalogda s.55'teki
**Nicotra Gebhardt RDH** ailesine aittir [AVenS s.55] — **başka markanın metnidir, AVenS'e taşınmadı.**
Model adındaki çift sayı (7/7, 9/9) kaynakta açıklanmıyor; anlamı **uydurulmadı** (§9 bulgu 1).

---

## 5 · AVenS BVU — Sığınak Havalandırma Üniteleri

**DB:** `avens-siginak-havalandirma-uniteleri` · 3 ürün · açıklama **BOŞ**

### Kimlik cümlesi
> Sığınak havalandırması için kompakt kanal tipi, plug fanlı ve by-pass damperli filtreli havalandırma ünitesi; radyoaktif nükleer serpinti tutucu H13 filtre, G4 kaba filtre ve aktif karbon filtre ile 1200 m³/h ile 3200 m³/h arasında maksimum debi sunar. [AVenS s.56]

### Maddeler (kaynaktaki altı maddenin tamamı)
* Radyoaktif nükleer serpinti tutucu filtre H13. [AVenS s.56]
* G4 kaba filtre. [AVenS s.56]
* Aktif karbon filtre. [AVenS s.56]
* Kompakt kanal tipi. [AVenS s.56]
* By-pass damperli. [AVenS s.56]
* Plug fanlı. [AVenS s.56]

### Model listesi (kaynaktan birebir)

| Kod | Model | Maks. debi | Ref |
|---|---|---|---|
| 30100 | BVU 1000-230W | 1200 m³/h | [AVenS s.56] |
| 30101 | BVU 2000-310W | 2000 m³/h | [AVenS s.56] |
| 30102 | BVU 3000-430W | 3200 m³/h | [AVenS s.56] |

### Yapısal bloklar

**Gövde.** Kompakt kanal tipi ünite gövdesi; kaynak ünitenin maksimum debisini 1200 m³/h ile 3200 m³/h arasında verir. [AVenS s.56]
*Gövde malzemesi, sac kalınlığı, yalıtım ve boya: **kaynakta karşılığı yok.***

**Çark.** Ünite **plug fanlıdır**. [AVenS s.56]
*Çark çapı, kanat yönü (öne/geriye eğimli) ve malzeme: **kaynakta karşılığı yok.***

**Motor.** **Kaynakta karşılığı yok** — model adındaki `230W` / `310W` / `430W` eklerinin motor gücü
olduğu s.56'da hiçbir yerde yazmıyor; model kodunun parçası olarak duruyor ve anlamı **varsayılmadı**
(§9 bulgu 5).

**Koruma.** Filtreleme kademeleri: radyoaktif nükleer serpinti tutucu H13 filtre, G4 kaba filtre ve aktif karbon filtre. [AVenS s.56]
*Koruma derecesi, yangın sınıfı, sızdırmazlık sınıfı ve **sığınak/NBC mevzuatına uygunluk beyanı:
kaynakta karşılığı yok** — mevzuat iddiası yazılmadı.*

**Kontrol.** Hava yolunda **by-pass damperi** bulunur. [AVenS s.56]
*Elektriksel kumanda, kontrol paneli, hız kademesi ve sensör: **kaynakta karşılığı yok.***

**Montaj.** Ünite **kanal tipidir**. [AVenS s.56]
*Montaj yönü, askı/ayak ve servis erişimi: **kaynakta karşılığı yok.***

---

## 6 · AVenS BVU-LS — Opsiyonel Kurşun Seperatör

**DB:** `avens-bvu-ls` · 2 ürün · açıklama **BOŞ**

### Kimlik cümlesi
> AVenS BVU Sığınak Havalandırma Üniteleri ile birlikte kullanılan **opsiyonel kurşun seperatör**; tek başına çalışan bir ünite değil, bir BVU modeline eşlenen aksesuardır. [AVenS s.56]

### Maddeler
* Kaynak bu ürünü "AVENS BVU-LS OPSİYONEL KURŞUN SEPERATÖR" başlığıyla tanımlar. [AVenS s.56]
* Kaynak, ürünün AVenS BVU Sığınak Havalandırma Üniteleri ile **birlikte** kullanıldığını belirtir. [AVenS s.56]
* Kataloğun tablosunda her seperatör için "uygun model" sütunu vardır; eşleşme BVU-LS 1000 için BVU 1000, BVU-LS 2000/3000 için BVU 2000/3000'dir. [AVenS s.56]

### Model listesi (kaynaktan birebir)

| Kod | Model | Uygun model | Ref |
|---|---|---|---|
| 30110 | BVU-LS 1000 | BVU 1000 | [AVenS s.56] |
| 30111 | BVU-LS 2000/3000 | BVU 2000/3000 | [AVenS s.56] |

### Yapısal bloklar

**Gövde.** **Kaynakta karşılığı yok** — s.56'da BVU-LS için gövde, ölçü veya malzeme bilgisi yok.

**Çark.** **Kaynakta karşılığı yok** — seperatörün hareketli parçası olup olmadığı bile yazmıyor.

**Motor.** **Kaynakta karşılığı yok.**

**Koruma.** **Kaynakta karşılığı yok.** Ürün adı "kurşun seperatör"dür; seperatörün neyi, hangi
mekanizmayla ayırdığı, kurşunun nerede ve ne kalınlıkta bulunduğu ya da hangi radyasyon türüne karşı
olduğu **kaynakta yazmıyor** ve **uydurulmamıştır** (§9 bulgu 6).

**Kontrol.** **Kaynakta karşılığı yok.**

**Montaj.** BVU ünitesiyle birlikte kullanılır; eşleşme kataloğun "uygun model" sütununda verilmiştir. [AVenS s.56]

---

## 7 · ÇİFT 2 — İki sığınak ailesini ayıran cümle

> **AVenS BVU bir havalandırma ünitesidir; AVenS BVU-LS ise o üniteye eklenen opsiyonel bir aksesuardır.** BVU, H13 serpinti tutucu, G4 kaba ve aktif karbon filtre kademelerini, plug fanını ve by-pass damperini kendi kompakt kanal tipi gövdesinde taşıyıp 1200 m³/h ile 3200 m³/h arasında maksimum debi verir; BVU-LS'in ise kendi debisi, fanı ve filtresi yoktur — kataloğun "uygun model" sütunuyla bir BVU modeline eşlenir ve **onunla birlikte** kullanılır. [AVenS s.56]

**Ayrım kaynakta nerede bulundu:** s.56'da BVU tablosunun sütun başlığı `MAKS. DEBİ`, BVU-LS
tablosununki `UYGUN MODEL`'dir; ayrıca BVU-LS başlığı **"OPSİYONEL"** kelimesiyle başlar ve altında
`* AVenS BVU Sığınak Havalandırma Üniteleri ile birlikte kullanılır.` dipnotu vardır. [AVenS s.56]
Altı maddelik özellik listesi sayfada **BVU bloğunun içindedir**, BVU-LS'e ait değildir; bu ayrımı
blok koordinatlarıyla ölçtüm (maddeler y≈194, BVU-LS başlığı y≈462).

---

## 8 · Boş kalan bloklar — tek bakışta

| Blok | HF/FW | HF/S | BVU | BVU-LS |
|---|---|---|---|---|
| Gövde | dolu | dolu | kısmi | **BOŞ** |
| Çark | dolu | dolu | kısmi | **BOŞ** |
| Motor | kısmi (yalnız güç + tahrik) | kısmi (yalnız güç + tahrik) | **BOŞ** | **BOŞ** |
| Koruma | **BOŞ** | **BOŞ** | dolu (filtre kademeleri) | **BOŞ** |
| Kontrol | **BOŞ** | **BOŞ** | kısmi (by-pass damperi) | **BOŞ** |
| Montaj | **BOŞ** | **BOŞ** | kısmi (kanal tipi) | kısmi (BVU ile birlikte) |

**24 blok hücresinin 12'si tamamen boş.** Sebep tek: kaynak bir **fiyat listesidir**, teknik föy değildir.

---

## 9 · Kaynakta bulduklarım (K7.5 — hepsi kayıtta)

1. **`7/7`, `9/9`, `10/10` gibi model adlarındaki çift sayının anlamı kaynakta açıklanmıyor.**
   Sektörde bu genellikle çark ölçüsünü ifade eder ama s.28'de böyle bir açıklama **yoktur** — yazılmadı.
2. **İş emrindeki "HF/FW kayış-kasnaklı, HF/S farklı tahrik" varsayımı yanlıştır.** Kaynak iki aileyi de
   `KAYIŞ KASNAKLI` diye adlandırır; gerçek fark `SIK KANATLI` ile `SEYREK KANATLI` arasındadır. [AVenS s.28]
3. **Ondalık ayırıcı kaynakta tutarsız:** aynı tabloda `1,1KW`, `2.2KW`, `5.5KW`, `7,5KW` biçimleri
   birlikte kullanılmış. [AVenS s.28] Otomatik ayrıştırmada tuzak; tablolarda kaynağa birebir sadık kalındı.
4. **Kaynak yazım hatası:** `AVENS-HF/FW 18/18` satırında güç `5,5K` yazılmış, birimin `W` harfi eksik.
   [AVenS s.28] Bağlamdan kW olduğu açık; taslakta 5,5 kW yazıldı, kaynak hatası burada kayıtlı.
   Ayrıca sütun başlığı **"BASINÇ KAYBI"**dır; bir fan kataloğunda beklenen başlık "basınç"tır — değer
   birebir aktarıldı, başlık **düzeltilmedi**, üreticide doğrulanmalı.
5. **BVU model adlarındaki `230W`, `310W`, `430W` eklerinin ne olduğu yazmıyor.** Motor gücü olduğu
   **varsayılmadı**; makul görünse de bu bir çıkarımdır, kaynak değildir.
6. **"Kurşun seperatör"ün işlevi kaynakta hiç anlatılmıyor.** Ne ayırdığı, kurşunun nerede/ne kalınlıkta
   olduğu, hangi radyasyon türüne karşı olduğu yazmıyor. Sığınak/NBC mevzuatına atıf da yoktur —
   mevzuat cümlesi yazılmadı.
7. **Katalogda bu dört aile için başka sayfa yok.** 74 sayfa tarandı; ilgili terimler yalnız içindekiler
   (s.4, s.5) ile s.28 ve s.56'da geçiyor. Üretici föyü **elimizde değil**.

## 10 · Bu taslağın kapatmadığı

* **EN çevirisi yazılmadı** — bu tur TR.
* **Ses (dB), ağırlık, boyut, koruma/yalıtım sınıfı hiçbir ailede yok** — kaynakta yok, uydurulmadı.
* **`is_description_manual`** yüklemede **true** yapılmalı; aksi halde bir sonraki otomatik tur bunu ezer.
* **Ticari onay yok** — Recep/uzman turu.
* **Üretici föyü ihtiyacı:** dört ailenin de satılabilir sayfa olması için AVenS teknik föyü gerekir.
  Föy yoksa "kendi metnimizi yazalım mı" kararı **Recep'e** gider — AVenS'in bizim markamız olması bu
  taslakta uydurma izni olarak **kullanılmadı.**

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
