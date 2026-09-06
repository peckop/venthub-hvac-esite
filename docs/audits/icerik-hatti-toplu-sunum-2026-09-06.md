# İçerik hattı — 40 ailenin metni, TEK SAYFADA (onay için)

**Şerit:** URUN-KATALOG · **İş:** REC-146 Adım 2b · **Tarih:** 2026-09-06
**Durum:** hiçbiri veritabanına yazılmadı. Bu dosya **senin tek onayın** için (K7.8).
**Bu dosya elle yazılmadı** — taslaklardan makineyle üretildi:
`python scripts/icerik-hatti/toplu-sunum.py --yaz`. Sayılar kapının çıktısıdır.

## Ne onaylıyorsun

Aşağıdaki 40 ailenin her biri için bir **kimlik cümlesi** (ürün sayfasının ilk cümlesi),
birkaç madde ve altı yapısal blok (Gövde · Çark · Motor · Koruma · Kontrol · Montaj) yazıldı.
Onayın: **bu dil ve bu seviye doğru** demektir; aile aile okuman gerekmez.
Onay sonrası bunlar veritabanına yazılır ve vitrinde görünür.

## Sayılarla (ölçülmüş, elle yazılmadı)

| | |
|---|---|
| Aile | **40** |
| Kaynağıyla doğrulanan iddia | **279** |
| — bunların GÜÇLÜ olanı | 222 |
| — bunların ZAYIF olanı | 57 |
| Kaynağıyla çelişen iddia (DÜŞEN) | **0** |
| Kapının ölçemediği cümle | 437 |
| Kaynağı olmadığı için BOŞ bırakılan blok | 75 |

**GÜÇLÜ / ZAYIF ne demek:** kapı, cümledeki sayıyı ve birimi kaynak sayfada arar.
İkisi yan yana bulunursa GÜÇLÜ; ayrı ayrı bulunur ama yan yana olduğu
doğrulanamazsa ZAYIF sayılır (PDF tablosunda birim başlık hücresinde durur,
bu yüzden yan yana şartı gerçek cümleleri de düşürüyordu). ZAYIF **yanlış demek değil**,
*kapı bu cümleyi tam kanıtlayamadı* demek. Gizlemiyoruz, sayıyoruz.

**Kapının ölçemediği cümle:** içinde sayı/kod olmayan cümle (ör. "bakımı kolaydır").
Bunlar kaynaktan çevrildi ama makine doğrulayamaz — insan gözü gerekir.

*Sayılar yalnız AİLE METİNLERİNE aittir: kapı burada her ailenin kendi bölümüne
ayrı ayrı koşturuldu. Taslak dosyalarının karşılaştırma/bulgu bölümlerindeki
referanslar bu toplamın dışındadır — onlar vitrine çıkmıyor.*

## Veritabanıyla tutuyor mu (canlıdan ölçüldü)

* Slug'ı veritabanında bulunamayan aile: **0** (hepsi bulundu)
* Ürün sayısı taslakla tutmayan aile: **0** (hepsi tutuyor)
* Bugün vitrinde metni olan, yani **üstüne yazılacak** aile: **20**

Üstüne yazılacak metinlerin bir kısmı zaten hatalıydı: seri metni tek bir modelin
verisini taşıyordu (ölçüldü, ayrı raporda). Yeni metin bunu da düzeltiyor.

## ⛔ SENDEN KARAR BEKLEYEN AİLELER

Bu ailelerde kaynak, satılabilir tek bir cümle bile vermiyor (yalnız kod ve fiyat).
Uydurmadık, boş bıraktık. İki seçenek var: **(a)** üreticiden teknik föy isteyelim,
**(b)** kendi teknik metnimizi yazalım.

* `avens-bvu-ls` — AVenS BVU-LS — Opsiyonel Kurşun Seperatör (2 ürün)
* `vortice-vortice-bravo-s` — BRA.VO S (`vortice-vortice-bravo-s`) (4 ürün)

---

## AVenS hücreli aspiratörler + sığınak üniteleri

### `avens-hucreli-aspiratorler` — AVenS-HF/FW — Sık Kanatlı Kayış Kasnaklı Hücreli Radyal Fanlar

> Sık kanatlı, kayış kasnaklı, çift cidar hücreli radyal fan ailesi; yüksek debi ve yüksek basınç gerektiren havalandırma uygulamaları için 50 mm standart hücre paneliyle üretilir. [AVenS s.28]

* Hücre paneli 50 mm standart; dış cidar elektrostatik toz boyalıdır. [AVenS s.28]
* Çark statik ve dinamik balans ayarlıdır; kaynak bu ürünleri "yüksek performanslı radyal fanlar" olarak tanımlar. [AVenS s.28]
* Anma güçleri 1,1 kW ile 5,5 kW arasındadır. [AVenS s.28]

**Ürün:** 6 · **Kaynak:** AVenS s.28

**Kapı:** doğrulanan 12 (güçlü 9 · zayıf 3) · düşen 0 · ölçülemeyen 3
**Dolu blok:** Gövde, Çark
**Kaynağı olmadığı için BOŞ:** Motor, Koruma, Kontrol, Montaj

### `avens-hucreli-hf-s` — AVenS-HF/S — Seyrek Kanatlı Kayış Kasnaklı Hücreli Radyal Fanlar

> Seyrek kanatlı, kayış kasnaklı, çift cidar hücreli radyal fan ailesi; HF/FW ile aynı 50 mm hücre gövdesini kullanır, kapasitesi 25000 m³/h ve 11 kW seviyesine kadar uzanır. [AVenS s.28]

* Hücre paneli 50 mm standart; dış cidar elektrostatik toz boyalıdır. [AVenS s.28]
* Çark statik ve dinamik balans ayarlıdır; kaynak bu ürünleri "yüksek performanslı radyal fanlar" olarak tanımlar. [AVenS s.28]
* Anma güçleri 1,1 kW ile 11 kW arasındadır. [AVenS s.28]

**Ürün:** 7 · **Kaynak:** AVenS s.28

**Kapı:** doğrulanan 13 (güçlü 13 · zayıf 0) · düşen 0 · ölçülemeyen 3
**Dolu blok:** Gövde, Çark
**Kaynağı olmadığı için BOŞ:** Motor, Koruma, Kontrol, Montaj

### `avens-siginak-havalandirma-uniteleri` — AVenS BVU — Sığınak Havalandırma Üniteleri

> Sığınak havalandırması için kompakt kanal tipi, plug fanlı ve by-pass damperli filtreli havalandırma ünitesi; radyoaktif nükleer serpinti tutucu H13 filtre, G4 kaba filtre ve aktif karbon filtre ile 1200 m³/h ile 3200 m³/h arasında maksimum debi sunar. [AVenS s.56]

* Radyoaktif nükleer serpinti tutucu filtre H13. [AVenS s.56]
* G4 kaba filtre. [AVenS s.56]
* Aktif karbon filtre. [AVenS s.56]

**Ürün:** 3 · **Kaynak:** AVenS s.56

**Kapı:** doğrulanan 5 (güçlü 5 · zayıf 0) · düşen 0 · ölçülemeyen 10
**Dolu blok:** —
**Kaynağı olmadığı için BOŞ:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj

### `avens-bvu-ls` — AVenS BVU-LS — Opsiyonel Kurşun Seperatör

> AVenS BVU Sığınak Havalandırma Üniteleri ile birlikte kullanılan **opsiyonel kurşun seperatör**; tek başına çalışan bir ünite değil, bir BVU modeline eşlenen aksesuardır. [AVenS s.56]

* Kaynak bu ürünü "AVENS BVU-LS OPSİYONEL KURŞUN SEPERATÖR" başlığıyla tanımlar. [AVenS s.56]
* Kaynak, ürünün AVenS BVU Sığınak Havalandırma Üniteleri ile **birlikte** kullanıldığını belirtir. [AVenS s.56]
* Kataloğun tablosunda her seperatör için "uygun model" sütunu vardır; eşleşme BVU-LS 1000 için BVU 1000, BVU-LS 2000/3000 için BVU 2000/3000'dir. [AVenS s.56]

**Ürün:** 2 · **Kaynak:** AVenS s.56

**Kapı:** doğrulanan 0 (güçlü 0 · zayıf 0) · düşen 0 · ölçülemeyen 7
**Dolu blok:** Montaj
**Kaynağı olmadığı için BOŞ:** Gövde, Çark, Motor, Koruma, Kontrol

## AVenS ısıtıcılar + hız anahtarları

### `avens-elektrikli-isiticilar` — AVenS Elektrikli Isıtıcılar

> AVenS ısı geri kazanım cihazlarıyla birlikte kullanılan, trifaze 380V 50Hz beslemeli elektrikli ısıtıcı serisi. [AVenS s.69]

* Altı güç kademesi: 3 kW, 6 kW, 9 kW, 12 kW, 15 kW ve 18 kW. [AVenS s.69]
* Her kademe belirli bir hava debisiyle eşleştirilmiştir: en küçük model 1000 m³/h, en büyük model 5000 m³/h. [AVenS s.69]
* Uygun AVenS cihaz eşleşmesi tabloda verilir — 3 kW için AVenS 750 - 1000, 18 kW için AVenS 5000. [AVenS s.69]

**Ürün:** 6 · **Kaynak:** AVenS s.69

**Kapı:** doğrulanan 4 (güçlü 4 · zayıf 0) · düşen 0 · ölçülemeyen 4
**Dolu blok:** Çark, Motor, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** Gövde, Koruma

### `avens-sulu-batarya` — AVenS Sulu Batarya

> AVenS ısı geri kazanım cihazlarıyla birlikte kullanılan, 90/70 °C sıcak su ile çalışan kanal tipi sulu ısıtma bataryası serisi. [AVenS s.69]

* Sekiz kapasite kademesi: 7 kW'tan 40 kW'a. [AVenS s.69]
* Isıtma kapasitesi 90/70 °C su rejiminde Kcal/h olarak verilir; 7 kW modelde 4700, 40 kW modelde 47300 Kcal/h. [AVenS s.69]
* Her kademe belirli bir hava debisiyle eşleştirilmiştir: en küçük model 750 m³/h, en büyük modeller 5000 m³/h. [AVenS s.69]

**Ürün:** 8 · **Kaynak:** AVenS s.69

**Kapı:** doğrulanan 4 (güçlü 4 · zayıf 0) · düşen 0 · ölçülemeyen 3
**Dolu blok:** Çark, Motor, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** Gövde, Koruma

### `avens-hiz-anahtarlari` — AVenS Hız Anahtarları

> AVenS fanlarının devrini ayarlamak için kullanılan, maksimum akım değerine göre iki boy sunulan hız anahtarı: 2,5 A ve 5 A. [AVenS s.27, 36]

* AVenS 2,5 A hız anahtarı (kod 60006), dikdörtgen kanal tipi radyal fanlarda 1100 m³/h ile 2520 m³/h arası modellerin (AVENS 40x20, 50x25, 60x30) hız anahtarıdır. [AVenS s.27]
* AVenS 5 A hız anahtarı (kod 01801), 4100 m³/h ve 6000 m³/h modellerin (AVENS 60x35, 70x40) hız anahtarıdır. [AVenS s.27]
* Davlumbaz fanlarında da eşleşir: VORT QBK SAL KC EVO 315 M4 ve 355 M4 modellerinde (2540 m³/h ve 3540 m³/h) 2,5A, 400 M4 modelinde (5240 m³/h) 5A. [AVenS s.36]

**Ürün:** 2 · **Kaynak:** AVenS s.27,36

**Kapı:** doğrulanan 5 (güçlü 5 · zayıf 0) · düşen 0 · ölçülemeyen 1
**Dolu blok:** Çark, Motor, Kontrol
**Kaynağı olmadığı için BOŞ:** Gövde, Koruma, Montaj

## AVenS plug fanlar + ısı geri kazanım

### `avens-plug-fanlar` — AVenS KENTALFAN — IEC motorlu plug fanlar

> Klima santralleri, ısı geri kazanım cihazları ve plenum kutuları için geliştirilmiş; geriye eğik kanatlı, tek emişli, doğrudan tahrikli IEC motorlu plug fan serisidir. [AVenS s.50]

* Seride 14 model bulunur; hava debisi 2590 m³/h ile 22550 m³/h arasında değişir. [AVenS s.50]
* Motor gücü 0,25 kW ile 5,5 kW arasındadır. [AVenS s.50]
* Üç model monofaze (M4), on bir model trifazedir (T2 / T4 / T6 sürümleri). [AVenS s.50, 51]

**Ürün:** 14 · **Kaynak:** AVenS s.50,51

**Kapı:** doğrulanan 7 (güçlü 6 · zayıf 1) · düşen 0 · ölçülemeyen 7
**Dolu blok:** Çark, Motor, Montaj
**Kaynağı olmadığı için BOŞ:** Gövde, Koruma, Kontrol

### `avens-isi-geri-kazanim` — AVenS alüminyum eşanjörlü ısı geri kazanım cihazları

> Eurovent sertifikalı alüminyum eşanjör, G4 filtre ve plug fan ile kurulmuş, kanal bağlantılı ısı geri kazanım cihazı ailesidir. [AVenS s.68]

* Vitrindeki üç modelin nominal hava debileri 750 m³/h, 1000 m³/h ve 2000 m³/h'tir; model adındaki sayı **debiyi** gösterir. [AVenS s.68]
* Eurovent sertifikalı alüminyum eşanjör, G4 filtre ve plug fanlı yapı. [AVenS s.68]
* Opsiyonel elektrikli ısıtıcı gücü AVenS 750 ve AVenS 1000 için 3 kW, AVenS 2000 için 6 kW olarak verilir. [AVenS s.68]

**Ürün:** 3 · **Kaynak:** AVenS s.68,69

**Kapı:** doğrulanan 5 (güçlü 2 · zayıf 3) · düşen 0 · ölçülemeyen 7
**Dolu blok:** Gövde, Çark, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** Motor, Koruma

## VORTICE ticari kanal fanları (CA MD · CA IL ES)

### `vortice-vort-commercial-in-line-circular` — CA MD Serisi — Yuvarlak Kanal Tipi (`…-circular`)

> Asma tavana veya çatı arasına monte edilen, boyalı çelik saç gövdeli yuvarlak kanal tipi fan serisi; konut, ticari ve endüstriyel mahaller (mutfaklar, tuvaletler, laboratuvarlar, barlar, restoranlar, çamaşırhaneler, mağazalar) için düşük görsel etkili havalandırma çözümü. [DPC s.32]

* Anma çapı 100 ile 315 mm arasında değişen modeller. [DPC s.32]
* Zorlu hava koşullarına ve yüksek sıcaklığa dayanacak biçimde üretilmiş; geniş sürekli çalışma sıcaklık aralığı -25 °C / +50 °C. [DPC s.32]
* Toz ve suya karşı yüksek koruma derecesi IP44. [DPC s.32]

**Ürün:** 7 · **Kaynak:** AVenS s.25 · CVL s.34 · DPC s.32

**Kapı:** doğrulanan 8 (güçlü 8 · zayıf 0) · düşen 0 · ölçülemeyen 18
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

### `vortice-vort-commercial-in-line-rectangular` — CA IL ES RECT Serisi — Dikdörtgen Kanal Tipi (`…-rectangular`)

> Dikdörtgen flanşlı galvanizli çelik gövdeli, yüksek verimli EC motorlu dikdörtgen kanal tipi fan serisi. [AVenS s.26]

* Dikdörtgen flanşlı galvanizli çelik gövde. [AVenS s.26]
* Kendi kendini temizleyen, yüksek performanslı, geriye eğimli kanat. [AVenS s.26]
* Yüksek verimli EC motor ve düşük ses seviyesi. [AVenS s.26]

**Ürün:** 5 · **Kaynak:** AVenS s.26

**Kapı:** doğrulanan 5 (güçlü 5 · zayıf 0) · düşen 0 · ölçülemeyen 7
**Dolu blok:** Gövde, Çark, Motor, Kontrol
**Kaynağı olmadığı için BOŞ:** Koruma, Montaj

## DANFOSS frekans konvertörleri

### `danfoss-fc101` — VLT HVAC BASIC DRIVE FC101

> Danfoss VLT HVAC Basic Drive FC101, HVAC uygulamalarına özel fonksiyonlar, EMC filtre, otomatik enerji optimizasyonu ve akıllı logic kontrolör sunan bir frekans konvertörü (motor sürücüsü) serisidir. [AVenS s.58]

* Katalogda motor gücü 0,75 kW ile 90 kW arasında 17 model olarak listelenir. [AVenS s.58]
* Besleme gerilimi tüm satırlarda 380V olarak verilir. [AVenS s.58]
* Anma akımı, en küçük modelde 2,2 A'dan en büyük modelde 177 A'ya kadar değişir. [AVenS s.58]

**Ürün:** 16 · **Kaynak:** AVenS s.58

**Kapı:** doğrulanan 2 (güçlü 1 · zayıf 1) · düşen 0 · ölçülemeyen 9
**Dolu blok:** Gövde, Çark, Motor, Koruma, Montaj
**Kaynağı olmadığı için BOŞ:** Kontrol

### `danfoss-fc102` — VLT HVAC DRIVE FC102

> Danfoss VLT HVAC Drive FC102, HVAC uygulamalarına özel fonksiyonlar, %98 temel enerji verimliliği, uyku modu ve otomatik enerji optimizasyonu sunan bir frekans konvertörü (motor sürücüsü) serisidir. [AVenS s.59]

* Katalogda motor gücü 1,1 kW ile 90 kW arasında 17 model olarak listelenir. [AVenS s.59]
* Besleme gerilimi satırlarda 380V olarak verilir. [AVenS s.59]
* Temel enerji verimliliği %98 olarak belirtilir. [AVenS s.59]

**Ürün:** 17 · **Kaynak:** AVenS s.59

**Kapı:** doğrulanan 3 (güçlü 2 · zayıf 1) · düşen 0 · ölçülemeyen 8
**Dolu blok:** Gövde, Çark, Motor, Koruma, Montaj
**Kaynağı olmadığı için BOŞ:** Kontrol

### `danfoss-fc51` — FC-51

> Danfoss FC-51, AVenS kataloğunda küçük güçlü çatı ve davlumbaz fanlarının hız kontrolü için hız anahtarı olarak listelenen kompakt bir frekans konvertörüdür. [AVenS s.34, 36]

* Katalogda 0,37 kW ve 0,55 kW olmak üzere iki güç kademesi listelenir. [AVenS s.34]
* 220V besleme ile hem 0,37 kW hem 0,55 kW satırı bulunur. [AVenS s.34]
* 380V besleme ile 0,37 kW satırı bulunur. [AVenS s.34]

**Ürün:** 2 · **Kaynak:** AVenS s.34,36

**Kapı:** doğrulanan 8 (güçlü 8 · zayıf 0) · düşen 0 · ölçülemeyen 1
**Dolu blok:** Gövde, Çark, Motor, Koruma, Montaj
**Kaynağı olmadığı için BOŞ:** Kontrol

## VORTICE endüstriyel aksiyel + ATEX

### `vortice-vort-industrial-ventilation-axial` — VORTICEL Endüstriyel Aksiyel Fanlar (E · A-E · MP)

> Ticari ve endüstriyel hacimlerin — spor salonu, kuru temizleme, marangozhane, garaj, depo, ahır — havalandırması için tasarlanmış, farklı çaplarda, monofaze ve trifaze sürümleri bulunan duvar tipi endüstriyel aksiyel fan ailesi. [IND s.4] Aile, Vortice'in üç serisini birlikte kapsar: VORTICEL E, VORTICEL A-E ve VORTICEL MP. `[DB]`

* **VORTICEL E** — düşük basınçlı duvar tipi aksiyel; anma çapı 250–350 mm aralığında 7 model ve toz/suya karşı IP44 korumalı motorlar. [IND s.4]
* **VORTICEL A-E** — ince gövdeli (eksenel derinliği azaltılmış) duvar tipi aksiyel; 2, 4 ve 6 kutuplu, anma çapı 250–630 mm aralığında 19 model, IP54 korumalı motorlar. [IND s.14]
* **VORTICEL MP** — orta basınçlı aksiyel; anma çapı 250–600 mm aralığında 19 model, IP55 korumalı motorlar ve −15 °C / +70 °C sürekli çalışma aralığı. [IND s.24]

**Ürün:** 16 · **Kaynak:** AVenS s.30,31 · IND s.4,14,15,22,24,30

**Kapı:** doğrulanan 12 (güçlü 12 · zayıf 0) · düşen 0 · ölçülemeyen 25
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

### `vortice-vort-e-atex` — VORT E-ATEX (patlayıcı ortam aksiyel fanları)

> Gaz veya toz nedeniyle patlayıcı ortam oluşabilen — ATEX sınıflandırmasına göre Grup II — sanayi hacimlerinde kullanılmak üzere tasarlanmış, ATEX 2014/34/EU direktifine uygun, plaka tipi patlama korumalı endüstriyel aksiyel fan ailesi. [ATX s.4]

* **Gaz ortamı sınıflandırması "II 2G Ex h IIB T3 Gb"** — potansiyel patlayıcı gaz bulunan alanlar: endüstriyel depolar, kimya ve ilaç sanayii, akü şarj alanları. [ATX s.4]
* **Toz ortamı sınıflandırması "II 2D Ex h IIIC T125°C Db"** — potansiyel patlayıcı toz bulunan alanlar: un üretim tesisleri, tekstil sanayii, alüminyum işleme tesisleri. [ATX s.4]
* **Etiketteki tam kod "II 2G/D h T3/125°C X Gb/Db"**; kaynağa göre "h" yapısal güvenlik ve ateşleme kaynağı denetimini, "X" kullanma kılavuzunda belirtilen özel çalışma koşullarını, "Gb/Db" ise hem gaz hem toz için Bölge 1 uygunluğunu gösterir. [ATX s.5]

**Ürün:** 14 · **Kaynak:** ATX s.3,4,5,6,7,8,13 · AVenS s.38 · IND s.98

**Kapı:** doğrulanan 11 (güçlü 11 · zayıf 0) · düşen 0 · ölçülemeyen 23
**Dolu blok:** Gövde, Çark, Motor, Koruma, Montaj
**Kaynağı olmadığı için BOŞ:** Kontrol

## VORTICE hava perdeleri

### `vortice-hava-perdesi` — AIR DOOR AD Serisi — ortam havalı (ısıtmasız)

> Kapıların ve genel olarak giriş bölgelerinin hizasına monte edilen AIR DOOR üniteleri, dış ortamdaki rahatsız edici sıcaklıktaki havanın içeri girmesini engelleyen bir hava akımı oluşturur; böylece kışın ısıtma, yazın soğutma tarafında hissedilir bir maliyet tasarrufu sağlar. [AD s.6]

* Farklı sıcaklıktaki bölgeleri ayıran görünmez bir bariyer kurar; yazın soğutulmuş, kışın ısıtılmış havanın kaçmasını, dışarıdan toz, egzoz gazı, duman, koku ve böcek girişini engeller. [AD s.4]
* Cross-Flow fan kanadı, hava yönü belirleyici kanatlar ve uzaktan kumanda. [AVenS s.64]
* Isıtıcısız (standart) modellerde hava çıkış hızı 9/11 m/s'ye ulaşır — ısıtıcılı modellerin üstünde. [AD s.7]

**Ürün:** 4 · **Kaynak:** AD s.4,5,6,7,8 · AVenS s.64

**Kapı:** doğrulanan 10 (güçlü 2 · zayıf 8) · düşen 0 · ölçülemeyen 25
**Dolu blok:** Gövde, Çark, Motor, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** Koruma

### `vortice-h-ad-elektrikli` — AIR DOOR H AD Serisi — elektrikli ısıtıcılı

> Kapı ve giriş açıklıklarının hizasına yatay monte edilen, PTC termistörlü elektrikli ısıtma elemanlarıyla donatılmış hava perdesi; dışarıdan gelen soğuk havayı kesmekle kalmaz, üflediği havayı ısıtarak geçiş bölgesinde konfor sıcaklığını korur. [AVenS s.64]

* PTC termistörlerden oluşan ısıtma elemanları yüksek ısıl performans ve düşük hava direnci sunar; aşırı ısınmaya ve gerilim tepelerine karşı korumalıdır. [AD s.6]
* Isıtıcı bataryası kapandıktan sonra fanın durmasını geciktiren özel bir çalışma mantığı vardır; bu, ürünün zaman içinde güvenilir çalışmasına katkı verir. [AD s.6]
* Isıtıcı gücü üç kademelidir ve modele göre değişir: 2/4/6 kW, 4/6/8 kW ve 6/8/10 kW. [AD s.7]

**Ürün:** 4 · **Kaynak:** AD s.4,5,6,7,8 · AVenS s.64

**Kapı:** doğrulanan 11 (güçlü 1 · zayıf 10) · düşen 0 · ölçülemeyen 24
**Dolu blok:** Gövde, Çark, Motor, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** Koruma

## VORTICE HEATMASTER / SLIMROOF (çatı fanları)

### `vortice-vort-heatmaster-slimroof-roof` — SLIMROOF ES

> Dikey gabarisi sınırlı çatılarda düşük enerji tüketimi ve hassas debi ayarı gerektiren uygulamalar için tasarlanmış, EC motorlu radyal (yatay) atışlı çatı tipi santrifüj fan. [HSK s.26]

* Kalıcı mıknatıslı EC motor — düşük tüketim ve kolay performans ayarı [HSK s.26]
* Monofazede **IE5**, trifazede **IE4** verim sınıfı; dış rotorlu tasarım gabariyi küçültür [HSK s.27][AVenS s.33]
* **Düşük dikey gabari** — mimari ve manzara kısıtı olan yerlere uygun [HSK s.29]

**Ürün:** 10 · **Kaynak:** AVenS s.33,34 · HSK s.26,27,29

**Kapı:** doğrulanan 9 (güçlü 9 · zayıf 0) · düşen 0 · ölçülemeyen 14
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

### `vortice-vort-heatmaster-slimroof-smoke` — HEATMASTER F400

> Hem günlük havalandırma hem de yangın anında sıcak duman tahliyesi için kullanılabilen, **çift amaçlı** radyal (yatay) atışlı çatı tipi santrifüj fan. [HSK s.4]

* **F400 sertifikası: 400 °C sıcaklıkta 2 saat** çalışma (S2 servisi) [HSK s.4, s.5]
* Sürekli çalışmada (S1) işlenen hava sıcaklığı **80 °C**, istek üzerine **120 °C** [HSK s.5]
* Geriye eğimli kanatlı santrifüj çark; monofaze veya trifaze asenkron motor, tek ya da çift devir

**Ürün:** 10 · **Kaynak:** HSK s.4,5,7

**Kapı:** doğrulanan 6 (güçlü 6 · zayıf 0) · düşen 0 · ölçülemeyen 17
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

## VORTICE ısı geri kazanım (VORT HR · VORT MONO)

### `vortice-isi-geri-kazanim` — VORT HR — Merkezi (kanallı) ısı geri kazanım üniteleri

> Konutların, ticari işletmelerin ve otel odalarının havalandırmasını tek merkezden yürüten, çift akışlı (dual-flow) ısı geri kazanımlı merkezi havalandırma üniteleri. [VMC s.32][AVenS s.67]

* Zemin, duvar veya asma tavan montajı — modele göre **80 m²'den 240 m²'ye** kadar alan [VMC s.32, s.46, s.58]
* Yüksek verimli ısı eşanjörü; ısının **%90'a yakını** geri kazanılır [VMC s.58]
* **VORT HR 300 NETI: Passive House sertifikalı** [VMC s.32]

**Ürün:** 5 · **Kaynak:** AVenS s.67 · MONO s.3 · VMC s.32,46,58,59

**Kapı:** doğrulanan 8 (güçlü 8 · zayıf 0) · düşen 0 · ölçülemeyen 14
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

### `vortice-vort-mono` — VORT HRW MONO — Tekil oda (desantralize) üniteleri

> Kanal tesisatı gerektirmeden tek bir odanın havalandırmasını sağlayan, dış duvara gömülü olarak monte edilen ısı geri kazanımlı oda tipi havalandırma üniteleri. [AVenS s.66][MONO s.5]

* Kanal gerekmez — **260–700 mm** kalınlığındaki dış duvarlara monte edilir [MONO s.5]
* **Üç çalışma modu:** taze hava · egzoz · ısı geri kazanımlı havalandırma [AVenS s.66]
* **HCS modellerde** uzaktan kumanda ve bağıl nem, sıcaklık, ışık sensörü [MONO s.4]

**Ürün:** 8 · **Kaynak:** AVenS s.66 · MONO s.4,5

**Kapı:** doğrulanan 9 (güçlü 9 · zayıf 0) · düşen 0 · ölçülemeyen 7
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

## VORTICE LINEO (yuvarlak kanal fanları)

### `vortice-lineo` — LINEO Serisi

> Konut, ticari ve endüstriyel alanların havalandırması için, kanal içine yatay veya dikey monte edilebilen karma akışlı (mixed flow) kanal fanı. [VLK s.4]

* Yüksek performans, düşük enerji tüketimi, düşük gürültü emisyonu ve kolay montaj [VLK s.4]
* Teknopolimer gövde; E2 yangına tepki sınıfı (EN ISO 11925-2:2010) ve IPX5 su koruması [VLK s.5]
* Üç hızlı endüksiyon motor — performans, tüketim ve ses arasında en iyi denge [VLK s.24]

**Ürün:** 7 · **Kaynak:** AVenS s.24 · VLK s.3,4,5,7,24,25,26

**Kapı:** doğrulanan 4 (güçlü 4 · zayıf 0) · düşen 0 · ölçülemeyen 16
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

### `vortice-lineo-quiet` — LINEO QUIET Serisi

> Ses emici kaplaması dış gövdeye tam entegre edilmiş, ortam ses emisyonunu en aza indirmek üzere optimize edilmiş kanal tipi karma akışlı fan. [VLK s.6]

* Akustik susturucu gövde — ses emici kaplama dış gövdeye **tam entegre** [VLK s.6][AVenS s.22]
* İki motor seçeneği: AC endüksiyon (Quiet) ve **EC fırçasız** (Quiet ES) [VLK s.12, s.18]
* Quiet üç hızlı, **Quiet ES dört hızlı** (4/6/8/10 V) — hız anahtarı olmadan farklı debi [AVenS s.22, s.23]

**Ürün:** 12 · **Kaynak:** AVenS s.22,23 · VLK s.3,4,5,6,7,12,18,26

**Kapı:** doğrulanan 8 (güçlü 7 · zayıf 1) · düşen 0 · ölçülemeyen 8
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

## NICOTRA GEBHARDT radyal fanlar

### `nicotra-gebhardt-dd` — DD SERİSİ — direkt akuple radyal fanlar

> NICOTRA Gebhardt DD serisi; düşük basınçlı, çift emişli, öne eğimli ve sık kanatlı, direkt akuple motorlu radyal fan ailesidir. [AVenS s.52]

* Fiyat listesi ikiye ayırır: standart DD serisi ve 3 hızlı DD 3V serisi; ikisinin de tanım cümlesi aynıdır. [AVenS s.52]
* Motor gücü 147W ile 1500W arasındadır. [AVenS s.52]
* Debi 1550 m³/h ile 7880 m³/h arasındadır. [AVenS s.52]

**Ürün:** 13 · **Kaynak:** AVenS s.52

**Kapı:** doğrulanan 6 (güçlü 6 · zayıf 0) · düşen 0 · ölçülemeyen 6
**Dolu blok:** Çark, Motor, Kontrol
**Kaynağı olmadığı için BOŞ:** Gövde, Koruma, Montaj

### `nicotra-gebhardt-at` — AT SERİSİ — çift emişli radyal fanlar

> NICOTRA Gebhardt AT serisi; düşük basınçlı, kayış kasnak tahrikli, öne eğimli ve sık kanatlı çift emişli radyal fan ailesidir. [AVenS s.53]

* Tahrik kayış kasnaklıdır; motor fana doğrudan akuple değildir. [AVenS s.53]
* Debi 2300 m³/h ile 18200 m³/h arasındadır. [AVenS s.53]
* Fiyat listesinde model adı yalnız çark ölçüsünü verir; motor gücü, devir ve faz bilgisi tabloda yer almaz. [AVenS s.53]

**Ürün:** 8 · **Kaynak:** AVenS s.53

**Kapı:** doğrulanan 1 (güçlü 1 · zayıf 0) · düşen 0 · ölçülemeyen 7
**Dolu blok:** Çark, Motor
**Kaynağı olmadığı için BOŞ:** Gövde, Koruma, Kontrol, Montaj

### `nicotra-gebhardt-adh` — ADH SERİSİ — sık kanatlı çift emişli radyal fanlar

> NICOTRA Gebhardt ADH serisi; öne eğimli, sık kanatlı, kayış kasnak tahrikli çift emişli radyal fandır. Endüstriyel tip taze hava ve egzoz uygulamaları için özel olarak dizayn edilmiştir. [AVenS s.54]

* Endüstriyel tip taze hava ve egzoz uygulamaları için özel olarak tasarlanmıştır. [AVenS s.54]
* Sattığımız aralığın alt ucu ADH-200 E2 modelinde 9800 m³/h debidir. [AVenS s.54]
* Aralığın üst ucu ADH-1000-K modelinde 216000 m³/h değerine çıkar. [AVenS s.54]

**Ürün:** 8 · **Kaynak:** AVenS s.54

**Kapı:** doğrulanan 2 (güçlü 2 · zayıf 0) · düşen 0 · ölçülemeyen 9
**Dolu blok:** Gövde, Çark, Motor
**Kaynağı olmadığı için BOŞ:** Koruma, Kontrol, Montaj

### `nicotra-gebhardt-rdh` — RDH SERİSİ — seyrek kanatlı çift emişli radyal fanlar

> NICOTRA Gebhardt RDH serisi; geriye eğimli, seyrek kanatlı, kayış kasnak tahrikli çift emişli radyal fandır. Ticari ve endüstriyel sistemlerde taze hava ve egzoz uygulamaları için özel olarak dizayn edilmiştir. [AVenS s.55]

* Ticari **ve** endüstriyel sistemlerde taze hava ve egzoz uygulamaları için tasarlanmıştır. [AVenS s.55]
* Çark geriye eğimli ve seyrek kanatlıdır; kataloğun bu bölümündeki tek geriye eğimli radyal fan ailesidir. [AVenS s.55]
* Sattığımız aralığın alt ucu RDH-180 E2 modelinde 2900 m³/h debidir. [AVenS s.55]

**Ürün:** 6 · **Kaynak:** AVenS s.55

**Kapı:** doğrulanan 2 (güçlü 2 · zayıf 0) · düşen 0 · ölçülemeyen 7
**Dolu blok:** Gövde, Çark, Motor
**Kaynağı olmadığı için BOŞ:** Koruma, Kontrol, Montaj

## VORTICE RADON (radon tahliye fanları)

### `vortice-radon-range-circular` — VORT CA-RM ES — KANAL tipi (`vortice-radon-range-circular`)

> Vortice'nin radona özel ürün ailesinin kanal tipi üyesi: radon yüklü havayı kanal içinden çekip dışarı atmak için tasarlanmış kanal tipi egzoz fanı. [RAD s.23]

* Kanal tipi egzoz fanı — radona özel Vortice ürün ailesinin parçası [RAD s.23]
* Anma çapları 100-125-150-160-200 mm [RAD s.23]
* IPX7 — suya daldırmaya karşı sızdırmaz koruma [RAD s.23]

**Ürün:** 5 · **Kaynak:** RAD s.20,23,25

**Kapı:** doğrulanan 3 (güçlü 3 · zayıf 0) · düşen 0 · ölçülemeyen 10
**Dolu blok:** Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** Gövde, Çark

### `vortice-radon-range-roof` — VORT CA-RM RF ES — ÇATI tipi (`vortice-radon-range-roof`)

> Vortice'nin radona özel ürün ailesinin çatı tipi üyesi: dış ortama, çatı üzerine monte edilen emiş (aspiratör) ünitesi. [RAD s.24]

* Çatı tipi emiş ünitesi — radona özel Vortice ürün ailesinin parçası [RAD s.24]
* Anma çapları 150-160-200 mm [RAD s.24]
* IP45 — dış ortam montajına uygun koruma [RAD s.24]

**Ürün:** 3 · **Kaynak:** RAD s.17,24,25

**Kapı:** doğrulanan 3 (güçlü 3 · zayıf 0) · düşen 0 · ölçülemeyen 9
**Dolu blok:** Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** Gövde, Çark

## SEAT · STORM · JET (AVenS çatı fanları)

### `seat-serisi` — SEAT Serisi

> Kimyasallara ve aşındırıcı gazlara karşı dayanıklı santrifüj fanlar. [s.41]

* Polipropilen gövde — asit ve korozyona karşı üstün dayanım [s.41]
* 40–2000 Pa statik basınç · 50–15.000 m³/h debi [s.41]
* Monofaze 220 V ve trifaze 380 V seçenekleri [s.41]

**Ürün:** 40 · **Kaynak:** ? s.41,44

**Kapı:** doğrulanan 5 (güçlü 4 · zayıf 1) · düşen 0 · ölçülemeyen 3
**Dolu blok:** Gövde, Motor
**Kaynağı olmadığı için BOŞ:** Çark, Koruma, Kontrol, Montaj

### `storm-serisi` — STORM Serisi

> Daha yüksek statik basınca sahip, kimyasallara ve korozyona dayanıklı fanlar. [s.42]

* Polipropilen gövde — asit ve korozyona karşı üstün dayanım [s.42]
* 40–4500 Pa statik basınç · 50–5.000 m³/h debi [s.42]
* Monofaze 220 V ve trifaze 380 V seçenekleri [s.42]

**Ürün:** 20 · **Kaynak:** ? s.41,42,45

**Kapı:** doğrulanan 6 (güçlü 5 · zayıf 1) · düşen 0 · ölçülemeyen 3
**Dolu blok:** Gövde, Motor
**Kaynağı olmadığı için BOŞ:** Çark, Koruma, Kontrol, Montaj

### `jet-serisi` — JET Serisi

> Çatı ve duvar uygulamaları için, yatay ve dikey montaja uygun santrifüj çatı fanları. [s.43] *(Kaynak başlığı SEAT'inkiyle birebir aynı olduğu için kimlik cümlesi maddeden türetildi — bkz. yukarıdaki tutarsızlık notu. Başlık ikinci sıraya alındı:)* Kimyasallara ve aşındırıcı gazlara karşı dayanıklı santrifüj fanlar. [s.43]

* Yatay ve dikey montaja uygun; çatı ve duvar uygulamaları [s.43]
* 200–3.500 m³/h debi · 2.000 Pa'ya kadar statik basınç [s.43]
* Monofaze 220 V ve trifaze 380 V seçenekleri [s.43]

**Ürün:** 21 · **Kaynak:** ? s.43,45

**Kapı:** doğrulanan 5 (güçlü 4 · zayıf 1) · düşen 0 · ölçülemeyen 4
**Dolu blok:** Motor, Koruma
**Kaynağı olmadığı için BOŞ:** Gövde, Çark, Kontrol, Montaj

## VORTICE konut tipi (QUADRO · PUNTO)

### `vortice-vort-quadro-evo` — VORT QUADRO EVO Serisi

> Banyo ve WC gibi ıslak hacimler için, duvar/tavan yüzeyine veya sıva altına gömme monte edilebilen konut tipi radyal (santrifüj) aspiratör serisi; koruma derecesi IP45'tir. [QE s.2]

* Duvar/tavan yüzey montajına veya gömme montaja uygundur; performans ve yangına dayanım DIN 18017-3 standardına göredir. [QE s.2]
* Yüksek koruma derecesi (IP45), banyoların Zone 1 bölgesinde güvenli montaja izin verir. [QE s.2]
* Modüler kurgu: 23 ventilasyon ünitesi ile 10 kasa serbestçe eşleştirilir; farklı yangın koruma seviyeleri seçilebilir. [QE s.6]

**Ürün:** 23 · **Kaynak:** AVenS s.20,21 · QE s.2,3,4,5,6,9,11,13,16,17

**Kapı:** doğrulanan 20 (güçlü 16 · zayıf 4) · düşen 0 · ölçülemeyen 17
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

### `vortice-punto-evo-flexo` — PUNTO EVO FLEXO Serisi

> Duvar ve tavan montajına uygun, duvardan ya da kısa kanallardan doğrudan hava atışı için tasarlanmış mini aksiyel fan serisi; 100 mm ve 120 mm olmak üzere iki anma çapı sunulur. [RES s.24]

* İki sürüm vardır: Standart ve zaman saatli (T); seri aralıklı ya da sürekli havalandırma için uygundur. [RES s.24]
* Debi MEX 100/4" modellerinde 90 m³/h, MEX 120/5" modellerinde 175 m³/h'tir. [AVenS s.10]
* (Kaynak s.10 model adını `MEX 100/4"` biçiminde, **inç işaretiyle** yazar ve o sayfada "mm"

**Ürün:** 4 · **Kaynak:** AVenS s.10 · PEF s.3,4,6 · RES s.24

**Kapı:** doğrulanan 12 (güçlü 4 · zayıf 8) · düşen 0 · ölçülemeyen 17
**Dolu blok:** Gövde, Çark, Motor, Koruma, Montaj
**Kaynağı olmadığı için BOŞ:** Kontrol

## VORTICE tekil ürünler (DEUMIDO · BRA.VO · TIRACAMINO)

### `vortice-deumido-range` — DEUMIDO RANGE (`vortice-deumido-range`)

> Elektronik kumandalı, taşınabilir nem alma cihazı ailesi; yüksek bağıl nemin yol açtığı küf oluşumunu, solunum sorunlarını ve mobilya, duvar ile yapı elemanlarındaki hasarı önlemek üzere ortam bağıl nemini denetler. [DEU s.4]

* Aile, farklı boyut, ağırlık ve performansa sahip üç modelden oluşur ve her konut ya da ticari
* Model adındaki sayı, 30 °C sabit sıcaklıkta ve sabit 80% bağıl nemde 24 saat sürekli çalışmada
* Yıkanabilir toz filtresi havadaki katı kirleticileri tutar; aktif karbon filtre hoş olmayan

**Ürün:** 3 · **Kaynak:** DEU s.3,4,5,6,7,8,9,10

**Kapı:** doğrulanan 10 (güçlü 2 · zayıf 8) · düşen 0 · ölçülemeyen 18
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

### `vortice-vortice-bravo-s` — BRA.VO S (`vortice-vortice-bravo-s`)

> Ortamdaki kirleticilerin varlığını algılayabilen bir hava kalitesi ölçüm cihazıdır. [BRV s.1]

* Algılanan kirletici tipine göre birbirinden ayrılan **dört model** sunulur. [BRV s.1]
* Tüm VORTICE IoT mekanik ısı geri kazanım üniteleriyle entegre çalışır. [BRV s.1]

**Ürün:** 4 · **Kaynak:** BRV s.1

**Kapı:** doğrulanan 0 (güçlü 0 · zayıf 0) · düşen 0 · ölçülemeyen 5
**Dolu blok:** Çark, Motor, Kontrol
**Kaynağı olmadığı için BOŞ:** Gövde, Koruma, Montaj

### `vortice-vort-industrial-ventilation-roof` — TIRACAMINO (`vortice-vort-industrial-ventilation-roof`)

> Şömine ve baca fanları grubunda yer alan, sürekli 200ºC dayanımlı, radyal fanlı, baca gazı tahliyelerine uygun fan. [AVenS s.29]

* Hava debisi 750 m³/h. [AVenS s.29]
* Hız anahtarı ürüne **dahildir** (ayrıca satın alınmaz). [AVenS s.29]
* Katalog kodu 15000. [AVenS s.29]

**Ürün:** 1 · **Kaynak:** AVenS s.29

**Kapı:** doğrulanan 1 (güçlü 1 · zayıf 0) · düşen 0 · ölçülemeyen 8
**Dolu blok:** Gövde, Çark, Koruma, Kontrol
**Kaynağı olmadığı için BOŞ:** Motor, Montaj

## VORTICE ticari (NORDIK HVLS · QBK/SAL/KC)

### `vortice-vort-nordik-hvls` — NORDIK HVLS HYPERBLADE

> Geniş hacimli endüstriyel ve ticari alanlarda havayı düşük hızda karıştıran, EC motorlu, ters yönde de dönebilen büyük çaplı endüstriyel tavan pervanesi ailesi. [NRD s.6] Tavanda biriken sıcak havayı aşağı iterek tabakalaşmayı (stratifikasyon) giderir ve hem yazın hem kışın kullanılır. [NRD s.5]

* Beş farklı çapta **yedi model** — 300, 400, 500, 600 ve 700 cm kanat çapı. [NRD s.10]
* Azami hava debisi **79.400 m³/h ile 330.800 m³/h** arasında değişir (AMCA 230-2023 ölçümü). [NRD s.11]
* **M modeller monofaze** (100-240 V / 50-60 Hz), **T modeller trifaze** (200-480 V / 50-60 Hz) beslenir. [NRD s.7]

**Ürün:** 7 · **Kaynak:** AVenS s.62,63 · NRD s.3,4,5,6,7,8,10,11,14,15,16,17

**Kapı:** doğrulanan 16 (güçlü 12 · zayıf 4) · düşen 0 · ölçülemeyen 29
**Dolu blok:** Gövde, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** Çark

### `vortice-vort-qbk-sal-kc-evo` — VORT QBK SAL-KC EVO

> Sıcak, nemli ve kirli havayı dışarı atmak için tasarlanmış; emiş ve basma ağızları 90° olan, yağ ve is yüklü havanın işlenmesine uygun hücreli (kabinli) davlumbaz ve mutfak egzoz fanı ailesi. [QBK s.4]

* Seri **21 modelden** oluşur; 2, 4 ve 6 kutuplu motorlar, monofaze ve trifaze besleme ile
* Hava debisi **2540 m³/h ile 22100 m³/h** arasında değişir. [QBK s.6]
* İşlenen hava sıcaklığı trifaze modellerde **120°C**'ye kadar çıkabilir. [QBK s.5]

**Ürün:** 21 · **Kaynak:** AVenS s.36 · QBK s.3,4,5,6,7,8,14,15,16,17,18

**Kapı:** doğrulanan 18 (güçlü 16 · zayıf 2) · düşen 0 · ölçülemeyen 24
**Dolu blok:** Gövde, Çark, Motor, Koruma, Kontrol, Montaj
**Kaynağı olmadığı için BOŞ:** yok

