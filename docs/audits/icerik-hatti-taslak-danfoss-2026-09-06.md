<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf -->
<!-- VARSAYILAN-KAYNAK: AVenS -->

# İçerik hattı — TR taslak: DANFOSS FC101 · FC102 · FC-51 (frekans konvertörleri)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** REC-146 Adım 2b — Danfoss aile grubu
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır. Bu dosya kaynak/kanıt kaydıdır.
**Kaynak:** AVenS Ürün Fiyat Kataloğu 2026 (TR) — **s.58 (FC101) · s.59 (FC102) · s.34 ve s.36 (FC-51)**
· ek olarak s.27 (FC101 hız anahtarı satırı) tarandı.
**Referans biçimi:** `[AVenS s.NN]` = fiyat listesi · `[MANIFEST]` = `scripts/db/product-data/danfoss-content-manifest.json`
(kaynağı Danfoss Design Guide PDF'leri; **bu kapı onu ölçmez**, ayrı doğrulanır).

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Kararlar — Katalog ve Ürün Verisi **K7.5** (her tespit kayıtta).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Derinlik ölçümü: **KAYNAK ZAYIF** — FC101 3 birim, FC102 2 birim, FC-51 0 birim öngörülmüştü.
  Ölçüm bu turda **doğrulandı**: AVenS kataloğu bu üç ailede ürün föyü değil, **fiyat satırı**dır.

---

## 0 · Neden bu üçü birlikte yazıldı ve neden metin kısa

Bu üç aile **fan değildir** — fan **sürücüsüdür**. Debi (m³/h), basınç, çark, kanat, gövde malzemesi
gibi fan alanlarının hiçbiri bu ürünlerde YOKTUR; anlatım yalnız **güç (kW) · gerilim (V) · faz ·
kontrol/haberleşme** üzerinden kurulabilir. Altı bloktan üçü (Gövde bir ölçüde, Çark ve Motor
tamamen) bu ürün tipi için **geçersizdir** ve aşağıda uydurulmak yerine **açıkça boş bırakılmıştır**.

Üçü birlikte yazıldı çünkü AVenS kataloğunda **birbirlerini tanımlıyorlar**: FC-51'in kendi tanıtım
sayfası yok, yalnız fan sayfalarında (s.34, s.36) o fanın **hız anahtarı** olarak listeleniyor —
yani FC-51'in kimliği ancak FC101 ile karşılaştırılınca çıkıyor. Ayrı ayrı yazılsalardı üçü de
"Danfoss frekans konvertörü" diye başlayacak ve vitrinde **üç ayrı seri tek cümleyle** çıkacaktı.

## 1 · Bugün DB'de ne var (emirden aktarıldı, bu turda SQL ile yeniden ölçülmedi)

| Aile (slug) | Ürün | `description.tr` | Katalogda satır | Durum |
|---|---|---|---|---|
| `danfoss-fc101` | 16 | **BOŞ** | s.58 · 17 satır (0,75–90 kW) | sıfırdan yazılıyor |
| `danfoss-fc102` | 17 | **BOŞ** | s.59 · 17 satır (1,1–90 kW) | sıfırdan yazılıyor |
| `danfoss-fc51` | 2 | **BOŞ** | s.34 · 3 satır · s.36 · 1 satır | sıfırdan yazılıyor |

---

## 2 · VLT HVAC BASIC DRIVE FC101

**DB:** `danfoss-fc101` · 16 ürün · açıklama **BOŞ** · katalog kodları 80101–80117

### Kimlik cümlesi

> Danfoss VLT HVAC Basic Drive FC101, HVAC uygulamalarına özel fonksiyonlar, EMC filtre, otomatik
> enerji optimizasyonu ve akıllı logic kontrolör sunan bir frekans konvertörü (motor sürücüsü)
> serisidir. [AVenS s.58]

### Maddeler

* Katalogda motor gücü 0,75 kW ile 90 kW arasında 17 model olarak listelenir. [AVenS s.58]
* Besleme gerilimi tüm satırlarda 380V olarak verilir. [AVenS s.58]
* Anma akımı, en küçük modelde 2,2 A'dan en büyük modelde 177 A'ya kadar değişir. [AVenS s.58]
* Üç fazlı besleme, 380–480 V AC aralığı — üretici föyünden [MANIFEST].

### Yapısal bloklar

**Gövde.** AVenS kataloğunda bu aile için gövde, malzeme veya koruma sınıfı bilgisi **YOKTUR** —
fiyat listesi yalnız kod, model, motor gücü ve fiyat sütunlarını taşır. [AVenS s.58]
Üretici föyünden gelen taban gövde bilgisi: IP20 / Open type, H1–H8 gövde boyları, 2,1–51 kg
ağırlık aralığı — **taban (gövdesiz, panel-montaj) varyant varsayımıyla** [MANIFEST].

**Çark.** **Bu ürün tipi için geçersiz.** Frekans konvertöründe çark yoktur; ürün hava taşımaz,
hava taşıyan fanın motorunu sürer.

**Motor.** **Bu ürün tipi için geçersiz.** Ürünün kendisi motor değil, motor **sürücüsüdür**;
sürdüğü motorun gücü Kimlik bölümündeki kW aralığıyla karşılanır.

**Koruma.** Katalog, seri için EMC filtre ve akıllı logic kontrolör dışında koruma bilgisi
vermez. [AVenS s.58] Üretici föyüne göre taban gövde koruma sınıfı IP20 / Open type'tır [MANIFEST].

**Kontrol (bu ailenin asıl bloğu).** Standart yangın modu bulunur. [AVenS s.58]
Çift satır nümerik kontrol panosu ile gelir. [AVenS s.58]
Otomatik enerji optimizasyonu ve akıllı logic kontrolör standarttır. [AVenS s.58]
Standart haberleşme protokolleri Modbus RTU, BacNet, Metasys N2, FC ve FLC olarak listelenir. [AVenS s.58]

**Montaj.** Katalogda tesisat kısıtı olarak yalnız kablo mesafesi verilir: maksimum kablo
mesafesi 50 metredir. [AVenS s.58] Montaj biçimi, ağırlık ve delik ölçüleri **kaynakta yok** —
blok bilinçli olarak boş bırakıldı.

---

## 3 · VLT HVAC DRIVE FC102

**DB:** `danfoss-fc102` · 17 ürün · açıklama **BOŞ** · katalog kodları 80120–80136

### Kimlik cümlesi

> Danfoss VLT HVAC Drive FC102, HVAC uygulamalarına özel fonksiyonlar, %98 temel enerji
> verimliliği, uyku modu ve otomatik enerji optimizasyonu sunan bir frekans konvertörü
> (motor sürücüsü) serisidir. [AVenS s.59]

### Maddeler

* Katalogda motor gücü 1,1 kW ile 90 kW arasında 17 model olarak listelenir. [AVenS s.59]
* Besleme gerilimi satırlarda 380V olarak verilir. [AVenS s.59]
* Temel enerji verimliliği %98 olarak belirtilir. [AVenS s.59]
* Üç fazlı besleme, 380–480 V AC aralığı — üretici föyünden [MANIFEST].

### Yapısal bloklar

**Gövde.** AVenS kataloğunda bu aile için de gövde, malzeme veya koruma sınıfı bilgisi
**YOKTUR**. [AVenS s.59] Üretici föyünden gelen taban gövde bilgisi: IP20 / Chassis,
A2–C4 gövde boyları, 4,8–50 kg ağırlık aralığı — **taban varyant varsayımıyla** [MANIFEST].

**Çark.** **Bu ürün tipi için geçersiz** — FC101 ile aynı gerekçe.

**Motor.** **Bu ürün tipi için geçersiz** — ürün motor değil, motor sürücüsüdür.

**Koruma.** Katalog bu aile için ayrı bir koruma bilgisi vermez; EMC filtre ibaresi
FC101 satırında geçer, FC102 satırında geçmez. [AVenS s.59]
Üretici föyüne göre taban gövde koruma sınıfı IP20 / Chassis'tir [MANIFEST].

**Kontrol (bu ailenin asıl bloğu).** Standart yangın modu bulunur. [AVenS s.59]
LCD operatör paneli ile gelir. [AVenS s.59]
Uyku modu ve otomatik enerji optimizasyonu standarttır. [AVenS s.59]
Standart haberleşme protokolleri Modbus RTU, BacNet, Metasys N2 ve FC olarak listelenir;
FC101'deki FLC protokolü bu listede **yoktur**. [AVenS s.59]

**Montaj.** Tesisat kısıtı olarak maksimum kablo mesafesi 150 metredir. [AVenS s.59]
Montaj biçimi ve ölçüler **kaynakta yok** — blok bilinçli olarak boş bırakıldı.

---

## 4 · FC-51

**DB:** `danfoss-fc51` · 2 ürün (FC-51 220V 0,37 kW · FC-51 230V 0,37 kW) · açıklama **BOŞ**

⚠ **Bu ailenin katalogda kendi tanıtım sayfası YOKTUR.** FC101 s.58 ve FC102 s.59 gibi bir
"seri sayfası" bulunmaz; FC-51 yalnızca fan sayfalarındaki **hız anahtarı / aksesuar** tablolarında
görünür (s.34 HeatMaster çatı fanları, s.36 VORT QBK SAL KC EVO davlumbaz fanları). Aşağıdaki her
cümle bu iki tablodan gelir. Seri tanıtım metni, teknik özellik listesi, kontrol paneli, haberleşme
protokolü, gövde/koruma bilgisi **kaynakta hiç yoktur** — ve **manifest'te de yoktur**
(manifest yalnız FC101/FC102 Design Guide'larını taramış, FC-51 orada tanımlı değil) [MANIFEST].

### Kimlik cümlesi

> Danfoss FC-51, AVenS kataloğunda küçük güçlü çatı ve davlumbaz fanlarının hız kontrolü için
> hız anahtarı olarak listelenen kompakt bir frekans konvertörüdür. [AVenS s.34, 36]

### Maddeler

* Katalogda 0,37 kW ve 0,55 kW olmak üzere iki güç kademesi listelenir. [AVenS s.34]
* 220V besleme ile hem 0,37 kW hem 0,55 kW satırı bulunur. [AVenS s.34]
* 380V besleme ile 0,37 kW satırı bulunur. [AVenS s.34]
* 230V besleme ile 0,37 kW satırı bulunur. [AVenS s.36]

### Yapısal bloklar

**Gövde.** **Kaynakta yok** — FC-51 için katalogda hiçbir gövde/malzeme/koruma bilgisi bulunmaz.

**Çark.** **Bu ürün tipi için geçersiz.**

**Motor.** **Bu ürün tipi için geçersiz** — ürün motor değil, motor sürücüsüdür.

**Koruma.** **Kaynakta yok.**

**Kontrol (bu ailenin asıl bloğu — ve kaynakta olan tek şey uygulamadır).**
HEATMASTER F400 315 M4 0,25kW ve F400 355 M4 0,25kW modellerinde hız anahtarı olarak
FC-51 220V 0,37 kW gösterilir. [AVenS s.34]
HEATMASTER F400 400 M4 0,55kW modelinde hız anahtarı olarak FC-51 220V 0,55 kW gösterilir. [AVenS s.34]
HEATMASTER F400 315 T4 0,25kW ve F400 355 T4 0,25kW modellerinde hız anahtarı olarak
FC-51 380V 0,37 kW gösterilir. [AVenS s.34]
VORT QBK SAL KC EVO 315 T4 0,25kW ve 355 T4 0,25kW modellerinde hız anahtarı olarak
FC-51 380V 0,37 kW gösterilir. [AVenS s.36]
Kontrol paneli, haberleşme protokolü ve çalışma modları **kaynakta yok**.

**Montaj.** **Kaynakta yok** — FC101/FC102'de verilen kablo mesafesi kısıtı FC-51 için verilmemiştir.

---

## 5 · Üç aileyi ayıran cümle (hangisi ne zaman seçilir)

> **FC-51 · FC101 · FC102 aynı işi yapar — bir fanın motorunu değişken hızda sürer — ama üç ayrı
> güç ve kontrol seviyesindedir.**

Tablo **aile başına tek satır**tır: her satırın tüm hücreleri **aynı katalog sayfasından** gelir,
referans satır sonundadır.

| Aile | Güç aralığı | Gerilim | Kontrol paneli | Yangın modu | Enerji | Maks. kablo | Protokol | Kaynak |
|---|---|---|---|---|---|---|---|---|
| **FC-51** | 0,37 kW – 0,55 kW | 220V · 230V · 380V | kaynakta yok | kaynakta yok | kaynakta yok | kaynakta yok | kaynakta yok | [AVenS s.34, 36] |
| **FC101** | 0,75 kW – 90 kW | 380V | çift satır nümerik pano | standart | otomatik enerji optimizasyonu | 50 metre | Modbus RTU, BacNet, Metasys N2, FC, FLC | [AVenS s.58] |
| **FC102** | 1,1 kW – 90 kW | 380V | LCD operatör paneli | standart | %98 verimlilik + uyku modu | 150 metre | Modbus RTU, BacNet, Metasys N2, FC | [AVenS s.59] |

**Seçim kuralı — kaynaktan çıkarılabilen hâliyle:**

1. **FC-51** — tek bir küçük fanı (katalogda 0,25–0,55 kW motorlu çatı ve davlumbaz fanları)
   hızlandırıp yavaşlatmak yeterliyse. [AVenS s.34, 36]
2. **FC101** — 0,75 kW üstü motorlarda, yangın modu ve otomatik enerji optimizasyonu istendiğinde;
   sürücü ile motor arasındaki kablo 50 metreyi geçmiyorsa. [AVenS s.58]
3. **FC102** — aynı güç bandında (1,1 kW üstü) ama LCD operatör paneli, uyku modu ve %98 temel
   enerji verimliliği gerektiğinde; ayrıca kablo mesafesi 150 metreye kadar çıkabildiğinde. [AVenS s.59]

**Ayıran tek cümle:** FC101 ile FC102 **aynı güç bandını ve aynı yangın modunu** paylaşır; ayıran
şey **operatör arayüzü (nümerik pano ↔ LCD panel)**, **uyku modu / %98 verimlilik iddiası** ve
**üç kat uzun kablo mesafesidir**. [AVenS s.58, 59]

---

## 6 · Kaynakta ve veride bulduklarım (K7.5 — hepsi kayıtta)

1. **KOD ÇAKIŞMASI — 80101 ve 80102 iki farklı ürüne veriliyor.** s.58'de `80101 = FC101PK75 0,75 kW`
   ve `80102 = FC101P1K5 1,5 kW`; s.34'te ise `80101 = FC-51 220V 0,37kW` ve `80102 = FC-51 220V 0,55kW`.
   Aynı katalogda aynı kod iki ürün. Manifest de bu çelişkiyi `denetim` listesinde
   `DAN-80101` başlığıyla açmıştı [MANIFEST]. **Karar gerekiyor** — hangi kod hangi ürüne ait.
2. **80141 kodu iki farklı gerilimle listeleniyor.** s.34: `80141 = FC-51 - 380V - 0,37kW`;
   s.36: `80141 = FC-51 - 230V - 0,37kW`. Fiyat ikisinde de aynı (455). DB'deki iki FC-51 ürünü
   "220V" ve "230V"; katalogdaki üçüncü gerilim olan **380V DB'de yok**. Bu turda **çözülmedi**,
   uydurulmadı — hangi gerilimin doğru olduğu **ticari doğrulama** ister.
3. **FC102 akım değerleri FC101 ile birebir aynı yazılmış.** s.59'daki akım sütunu
   (3,7 / 5,3 / 7,2 / 9 / 12 / 15,5 A) s.58'inkiyle aynı. Üretici föyünde FC102 için farklı
   değerler var (P1K5 için 4,1 A, P2K2 için 5,6 A, P4K0 için 10 A) [MANIFEST]. Yani AVenS
   büyük olasılıkla FC101 sütununu kopyalamış. **Bu yüzden taslakta FC102 için akım değeri
   YAZILMADI** — iki kaynak çelişiyor, çelişkiyi metne taşımak yerine buraya yazdım.
4. **s.59'da dizgi hatası: `1,1 - 308V - 2,2A`.** Diğer 16 satırın hepsi 380V. "308V" açık bir
   rakam devriği. Taslakta **380V** kullanıldı ve hata burada kayıtlı; 308V hiçbir yerde iddia edilmedi.
5. **Katalogda "Motbus RTU" yazıyor** (doğrusu Modbus RTU) ve **"Protocal"** yazıyor
   (doğrusu Protocol) — s.58 ve s.59'da aynı hata. Taslakta doğru yazım kullanıldı; anlam değişmedi.
6. **s.27'de FC101 üçüncü kez, üçüncü bir adla geçiyor:** `FC 101-1.5kW Frenkans Konvertörü` ve
   `FC 101-2.2kW Frenkans Konvertörü` (kodlar 80102, 80103) — dikdörtgen kanal tipi radyal fanların
   hız anahtarı olarak. Ad biçimi s.58'deki `FC101P1K5` ile, s.36'daki `FC-101 - 380V - 1,5kW` ile
   uyuşmuyor; ayrıca "Frenkans" ve s.34'teki "İnventörü" dizgi hataları var. **Aynı ürün için
   katalogda en az dört farklı ad biçimi** dolaşıyor — DB eşlemesi bu yüzden kırılgan.
7. **FC101 ailesinde DB 16 ürün, katalog 17 satır.** Emirdeki aile tanımı FC101P4K0 (4 kW) ile
   başlıyor; katalog 0,75 kW ile başlıyor. Fark **ölçülmedi** (bu turda SQL koşulmadı) —
   taslakta katalog aralığı kullanıldı ve bunun **katalog aralığı** olduğu cümlede yazılı.
8. **Manifest'te FC-51 hiç yok.** Manifest yalnız FC101 ve FC102 Design Guide'larını taramış;
   `denetim` kaydı FC-51'in **ayrı bir seri** olduğunu ve o iki föyde tanımlı olmadığını söylüyor
   [MANIFEST]. Yani FC-51'in tek kaynağı bugün AVenS fiyat listesindeki dört satırdır.

## 7 · Bu taslağın kapatmadığı

* **FC-51 için üretici föyü YOK.** Bu aile bugün yalnız "hangi fanın hız anahtarı" bilgisiyle
  yazılabiliyor. Vitrinde satılabilir bir ürün sayfası için Danfoss FC-51 Design Guide gerekir.
* **Ağırlık, ölçü, IP sınıfı hiçbir ailede AVenS'ten gelmiyor.** FC101/FC102 için manifest
  taban gövde varsayımıyla veri taşıyor; bu varsayım **stoktaki gerçek gövde varyantı** IP54/IP55
  ise yanlış olur [MANIFEST]. Vitrine yazmadan önce ticari doğrulama ister.
* **EN çevirisi yazılmadı** — bu tur TR. `description.en` için ayrı tur gerekir.
* **`is_description_manual` bayrağı** yükleme sırasında **true** yapılmalı; aksi halde bir sonraki
  otomatik tur bu elle yazılmış metni ezer.
* **Ticari onay yok** — Recep/uzman turu.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
