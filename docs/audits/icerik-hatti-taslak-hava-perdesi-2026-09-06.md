<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf, AD=Air_Conditioning_Air_Door_2.pdf -->

# İçerik hattı — TR taslak: AIR DOOR AD (ortam havalı) · AIR DOOR H AD (elektrikli ısıtıcılı)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** hava perdesi aile grubu (REC-146 Adım 2b)
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır. Bu dosya kaynak/kanıt kaydıdır.
**Kaynak:** AVenS Ürün Fiyat Kataloğu 2026 s.64 (TR) · Vortice AIR DOOR RANGE kataloğu s.4–8 (EN, **çevrildi**)
**Referans biçimi:** `[AVenS s.NN]` = fiyat listesi · `[AD s.NN]` = Air_Conditioning_Air_Door_2.pdf

> **Sayfa aralığı notu.** Emir `AD s.6–8` diyordu. Ölçtüm: AIR DOOR RANGE bölümü PDF'te **s.4'te
> başlıyor** (aile tanımı + anahtar özellikler); s.5 montaj yüksekliği, hava hızı ve uygulama
> alanlarını taşıyor. Bu iki sayfayı dışarıda bırakmak ailenin montaj verisini kaynaksız
> bırakırdı — bu yüzden **s.4 ve s.5 de referans verildi**. PDF toplam 8 sayfa; basılı sayfa
> numaraları PDF sayfalarıyla birebir örtüşüyor (kontrol edildi, s.6 → "6").

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Kararlar — Katalog ve Ürün Verisi **K7.1** (varyant metni yazılır, yüklenmez) · **K7.2** (çeviri serbest) · **K7.5** (her tespit kayıtta).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Kalıp örneği: `docs/audits/icerik-hatti-taslak-lineo-2026-09-06.md`.
* Kapı: `scripts/icerik-hatti/taslak-kaynak-kapisi.py` (sonuç §8'de).

---

## 0 · Niçin bu ikisi birlikte yazıldı

İki aile de kaynakta **aynı bölümü paylaşıyor**: AD ve H AD modelleri Vortice kataloğunda tek bir
"AIR DOOR RANGE" başlığı, tek ürün tanımı ve **tek teknik tablo** içinde duruyor [AD s.6];
TR fiyat listesinde ise aynı sayfada, iki ayrı tablo hâlinde [AVenS s.64].

Paylaşık bölümü doğru aileye bölmenin tek dürüst yolu, ikisini yan yana yazmaktır. Ayrı ayrı
yazılsalardı ikisi de "cross-flow fanlı, uzaktan kumandalı hava perdesi" diye başlayacak ve
**ısıtıcılı olan ile olmayan vitrinde aynı görünecekti** — müşterinin ödediği farkı gizleyen tam
bu tür bir cümledir. Kaynağın kendisi ayrımı açıkça yazıyor: ısıtma elemanları **"yalnızca
AIR DOOR H modelleri için"** [AD s.6].

## 1 · Bugün DB'de ne var (emirle gelen ölçüm, 2026-09-06)

| Aile | Ürün | `description.tr` | Durum |
|---|---|---|---|
| `vortice-hava-perdesi` | 4 | 1 cümle (ortam havalı, "monofaze model") | var ama altı blok yok, zenginleştiriliyor |
| `vortice-h-ad-elektrikli` | 4 | **BOŞ** | sıfırdan yazılıyor |

**Mevcut `vortice-hava-perdesi` metni (çekirdeği doğru, korunuyor):**
> "İç mekan sıcaklığını korumak ve dış ortamla ısı alışverişini engellemek amacıyla kapıların
> üzerine monte edilmek üzere tasarlanmış, ortam havalı hava perdesi ünitesi (monofaze model)."

Bu metin kaynakla çelişmiyor: ortam havalı dört modelin dördü de monofazedir. Taslak onu
**değiştirmiyor**, üstüne altı bloğu ekliyor. `H AD` ailesinde ise "monofaze model" ifadesi
**yanlış olurdu** — o ailede üç model trifazedir [AVenS s.64].

---

## 2 · AIR DOOR AD Serisi — ortam havalı (ısıtmasız)

**DB:** `vortice-hava-perdesi` · 4 ürün · AD 900 / AD 1200 / AD 1500 / AD 2000 · dördü de monofaze

### Kimlik cümlesi

> Kapıların ve genel olarak giriş bölgelerinin hizasına monte edilen AIR DOOR üniteleri, dış
> ortamdaki rahatsız edici sıcaklıktaki havanın içeri girmesini engelleyen bir hava akımı
> oluşturur; böylece kışın ısıtma, yazın soğutma tarafında hissedilir bir maliyet tasarrufu
> sağlar. [AD s.6]

### Dört madde

* Farklı sıcaklıktaki bölgeleri ayıran görünmez bir bariyer kurar; yazın soğutulmuş, kışın ısıtılmış havanın kaçmasını, dışarıdan toz, egzoz gazı, duman, koku ve böcek girişini engeller. [AD s.4]
* Cross-Flow fan kanadı, hava yönü belirleyici kanatlar ve uzaktan kumanda. [AVenS s.64]
* Isıtıcısız (standart) modellerde hava çıkış hızı 9/11 m/s'ye ulaşır — ısıtıcılı modellerin üstünde. [AD s.7]
* Alüminyum gövde ve ızgara ile estetik, şık tasarım. [AVenS s.64]

### Teknik veri (kaynak tablosundan birebir)

| Model | Kod | Fan gücü asg./azm. (W) | Debi asg./azm. (m³/h) | Ses asg./azm. (dB) | Ağırlık (Kg) |
|---|---|---|---|---|---|
| AIR DOOR AD 900 | 65195 | 110/160 | 1100/1400 | 55/57 | 10 |
| AIR DOOR AD 1200 | 65196 | 150/200 | 1600/1900 | 56/58 | 12.5 |
| AIR DOOR AD 1500 | 65197 | 180/230 | 2000/2500 | 57/59 | 15.5 |
| AIR DOOR AD 2000 | 65198 | 300/350 | 2900/3600 | 59/61 | 20.5 |

Aynı değerlerin cümle hâli (kapının ölçebilmesi için):

* Fan gücü modele göre 110/160 W ile 300/350 W arasındadır. [AD s.7]
* Hava debisi 1100/1400 m³/h ile 2900/3600 m³/h arasında değişir (asgari/azami). [AD s.7]
* Ses seviyesi 55/57 dB ile 59/61 dB arasındadır. [AD s.7]
* Ağırlık 10 kg ile 20.5 kg arasındadır (ondalık ayırıcı kaynaktaki gibi bırakıldı — bulgu 6). [AD s.7]
* Dört modelin dördü de 230 V ve 50 Hz besleme ile, monofaze çalışır. [AD s.7]
* Gövde ölçüleri: A boyu sırasıyla 900 mm, 1200 mm, 1500 mm ve 2000 mm; B = 220 mm ile C = 190 mm dört modelde ortaktır. [AD s.7]
* Hava hızı sütunu dört model için tek birleşik hücredir: 9/11 m/s. [AD s.7]
* Isıtma gücü sütunu bu dört modelde tire ile boş bırakılmıştır — ısıtma yoktur. [AD s.7]
* TR listede kapı genişliği karşılıkları: 1 m · 1,2 m · 1,5 m · 2 m. [AVenS s.64]

### Yapısal bloklar

**Gövde.** Ön paneller fırçalanmış alüminyumdandır (gümüş gri renk) ve emiş ızgarasını kendi
üzerinde barındırır; arka paneller siyah boyalı sacdan, yan paneller siyah termoplastik reçineden
üretilmiştir. [AD s.6] TR kaynak bunu "alüminyum gövde ve ızgara" ve "estetik, şık tasarım" diye
özetler. [AVenS s.64] Gövde derinliği dört modelde ortaktır: B = 220 mm, C = 190 mm. [AD s.7]

**Çark.** Cross-flow (çapraz akışlı) fanlar kullanılır; bu çark tipi düşük ses seviyesi sağlar.
[AD s.6] Egzoz çıkışının hizasına yerleştirilen ayarlanabilir kanatlar, çıkan hava akımını
istenen yöne yönlendirir. [AD s.6] TR kaynakta aynı parça "hava yönü belirleyici kanatlar"
olarak geçer. [AVenS s.64]

**Motor.** Fanlar asenkron, çift milli, iki hızlı motorlarla tahrik edilir; bu seçim performans,
üretilen hava akımının sıcaklığı ve dışarı verilen ses seviyesi arasında en iyi dengeyi kurar.
[AD s.6] Fan gücü 110/160 W ile 300/350 W arasındadır ve besleme 230 V / 50 Hz monofazedir.
[AD s.7]

**Koruma.** Yalıtım sınıfı: I. [AD s.6] Ürünler şu standartlara uygundur: EN 60335-1,
EN 60335-2-80, EN 60529 ve EN 62233. [AD s.8] Elektromanyetik uyumluluk için EN 55014 serisi,
EN 61000-3-2 ve EN 60555-1 listelenir; CE işareti Alçak Gerilim ve Elektromanyetik Uyumluluk
direktiflerine dayanır. [AD s.8]
> **IP koruma sınıfı, yangına tepki sınıfı ve motor ömrü (saat): kaynakta karşılığı yok.**
> Bu üç kalem LINEO ailesinde vardı; hava perdesi kaynağında **yoktur** ve yazılmamıştır.

**Kontrol.** Kızılötesi uzaktan kumanda ile açma/kapama ve çalışma hızı seçimi yapılır; aynı
komutlar cihaz üzerinde de tekrarlanmıştır ve ön paneldeki bir lamba ürün durumunu gösterir.
[AD s.6] Motorlar iki hızlıdır. [AD s.6] Ünite, piyasadaki standart kapı sensörleriyle birlikte
çalışacak biçimde bağlanabilir. [AD s.6] TR kaynak ürünü "uzaktan kumandalı" olarak listeler.
[AVenS s.64]
> **Isıtıcı aç/kapa komutu bu ailede YOKTUR** — kumandadaki o işlev yalnızca AIR DOOR H
> modelleri içindir. [AD s.6]

**Montaj.** Yatay, duvara montaj içindir; kapıların üstüne ya da açıklığa mümkün olduğunca yakın
monte edilir, böylece havanın yanlardan geçmesi önlenir. [AD s.5] Asgari montaj yüksekliği 2,3
metre, önerilen azami montaj yüksekliği 4 metredir. [AD s.5] Ön taraftan emişli ızgara sayesinde
perde ile tavan arasında boşluk bırakmak gerekmez; bu yüzden alçak tavanlı hacimlerde bile
(en az 2,30 m) tavana yakın montaj mümkündür. [AD s.4] Pratik duvar montaj braketiyle kolay ve
hızlı kurulur. [AD s.5] Geniş açıklıkları kapatmak için üniteler **seri hâlinde** yan yana monte
edilebilir. [AD s.4]

---

## 3 · AIR DOOR H AD Serisi — elektrikli ısıtıcılı

**DB:** `vortice-h-ad-elektrikli` · 4 ürün · H AD 900 M / H AD 900 T / H AD 1200 T / H AD 1500 T
· **1 monofaze + 3 trifaze** · açıklama bugün **BOŞ**

### Kimlik cümlesi

> Kapı ve giriş açıklıklarının hizasına yatay monte edilen, PTC termistörlü elektrikli ısıtma
> elemanlarıyla donatılmış hava perdesi; dışarıdan gelen soğuk havayı kesmekle kalmaz, üflediği
> havayı ısıtarak geçiş bölgesinde konfor sıcaklığını korur. [AVenS s.64]

### Dört madde

* PTC termistörlerden oluşan ısıtma elemanları yüksek ısıl performans ve düşük hava direnci sunar; aşırı ısınmaya ve gerilim tepelerine karşı korumalıdır. [AD s.6]
* Isıtıcı bataryası kapandıktan sonra fanın durmasını geciktiren özel bir çalışma mantığı vardır; bu, ürünün zaman içinde güvenilir çalışmasına katkı verir. [AD s.6]
* Isıtıcı gücü üç kademelidir ve modele göre değişir: 2/4/6 kW, 4/6/8 kW ve 6/8/10 kW. [AD s.7]
* Dört modelin biri monofaze (H AD 900), üçü trifazedir (T). [AVenS s.64]

### Teknik veri (kaynak tablosundan birebir)

| Model | Kod | Fan gücü asg./azm. (W) | Isıtıcı gücü asg./orta/azm. (kW) | Debi asg./azm. (m³/h) | Ses asg./azm. (dB) | Ağırlık (Kg) |
|---|---|---|---|---|---|---|
| AIR DOOR H AD 900 M | 65155 | 110/160 | 2/4/6 | 1000/1200 | 55/57 | 13.5 |
| AIR DOOR H AD 900 T | 65156 | 110/160 | 2/4/6 | 1000/1200 | 55/57 | 13.5 |
| AIR DOOR H AD 1200 T | 65157 | 150/200 | 4/6/8 | 1500/1700 | 56/58 | 16 |
| AIR DOOR H AD 1500 T | 65158 | 180/230 | 6/8/10 | 1900/2200 | 57/59 | 18.5 |

Aynı değerlerin cümle hâli (kapının ölçebilmesi için):

* Fan gücü 110/160 W ile 180/230 W arasındadır. [AD s.7]
* Isıtıcı gücü üç kademelidir: 2/4/6 kW, 4/6/8 kW ve 6/8/10 kW. [AD s.7]
* Hava debisi 1000/1200 m³/h ile 1900/2200 m³/h arasında değişir. [AD s.7]
* Ses seviyesi 55/57 dB ile 57/59 dB arasındadır. [AD s.7]
* Ağırlık 13.5 kg ile 18.5 kg arasındadır (ondalık ayırıcı kaynaktaki gibi). [AD s.7]
* Trifaze modellerin besleme gerilimi tabloda 380 V olarak verilir. [AD s.7]
* Gövde ölçüleri: A boyu sırasıyla 950 mm, 950 mm, 1230 mm ve 1510 mm; B = 305 mm ile C = 235 mm dört modelde ortaktır. [AD s.7]
* Hava hızı sütunu dört model için tek birleşik hücredir: 8,5/9,5 m/s. [AD s.7]
* TR listede kapı genişliği karşılıkları: 1 m · 1 m · 1,2 m · 1,5 m. [AVenS s.64]

> **Besleme uyarısı.** Tabloda 380 V yalnız 65156 satırının hizasında yazılıdır; 65155 satırının
> besleme hücresi **boştur**. [AD s.7] O modelin monofaze olduğu ancak TR listeden bilinir:
> "AIR DOOR H AD 900 Monofaze". [AVenS s.64]

### Yapısal bloklar

**Gövde.** Gövde yapısı ısıtmasız AD serisiyle ortaktır: fırçalanmış alüminyum ön panel (gümüş
gri, emiş ızgarası entegre), siyah boyalı sac arka panel, siyah termoplastik reçine yan paneller.
[AD s.6] TR kaynak bu aileyi de "alüminyum gövde ve ızgara" ve "estetik, şık tasarım" ile
tanımlar. [AVenS s.64] Gövde **daha derindir**: ısıtmasız modelde B = 220 mm ve C = 190 mm iken,
ısıtıcılı modelde B = 305 mm ve C = 235 mm'dir — ısıtma bataryası bu hacmi ister. [AD s.7]

**Çark.** Ortaktır: cross-flow (çapraz akışlı) fanlar düşük ses seviyesi sağlar; egzoz
hizasındaki ayarlanabilir kanatlar hava akımını istenen yöne yönlendirir. [AD s.6] TR kaynak bu
ailede de "Cross-Flow fan kanadı" ve "hava yönü belirleyici kanatlar" yazar. [AVenS s.64]

**Motor.** Fanlar asenkron, çift milli, iki hızlı motorlarla tahrik edilir. Kaynak bu seçimin
gerekçesini yazarken **ısıtıcılı modelleri açıkça anar**: denge, performans ile *üretilen hava
akımının sıcaklığı* (ısıtma elemanlı modellerde) ve ses seviyesi arasında kurulur. [AD s.6]
Fan gücü 110/160 W ile 180/230 W arasındadır; buna ek olarak 2/4/6 kW ile 6/8/10 kW aralığında
üç kademeli ısıtıcı gücü gelir. [AD s.7]

**Koruma.** PTC ısıtma elemanları aşırı ısınmaya ve yüksek gerilime karşı korumalıdır.
[AVenS s.64] Aynı koruma kaynakta "aşırı ısınma ve gerilim tepelerine karşı korumalı" diye
tanımlanır ve bataryanın kapanmasından sonra fanı geciktiren çalışma mantığıyla desteklenir.
[AD s.6] Yalıtım sınıfı: I. [AD s.6] Ürünler EN 60335-1, EN 60335-2-80, EN 60529 ve EN 62233
standartlarına uygundur. [AD s.8]
> **IP koruma sınıfı ve ısıtıcı için ayrı bir termik emniyet kodu: kaynakta karşılığı yok.**

**Kontrol.** Kızılötesi uzaktan kumanda açma/kapama, çalışma hızı seçimi **ve ısıtma
elemanlarının açılıp kapatılmasını** sağlar; son işlev kaynakta "yalnızca AIR DOOR H modelleri"
notuyla verilmiştir. [AD s.6] Komutlar cihaz üzerinde de tekrarlanır, ön paneldeki lamba ürün
durumunu gösterir. [AD s.6] Motorlar iki hızlıdır ve ünite piyasadaki standart kapı
sensörleriyle çalışacak biçimde bağlanabilir. [AD s.6] TR kaynak ürünü "uzaktan kumandalı"
olarak listeler. [AVenS s.64]

**Montaj.** Ortaktır: yatay duvar montajı, kapı üstü ya da açıklığa en yakın konum, asgari 2,3
metre montaj yüksekliği ve önerilen azami 4 metre. [AD s.5] Ön emişli ızgara sayesinde tavanla
arada boşluk gerekmez. [AD s.4] Pratik duvar montaj braketiyle kurulur ve geniş açıklıklar için
seri montaj mümkündür. [AD s.4] Isıtıcılı modellerde hava hızı 8,5/9,5 m/s'dir; ısıtmasız
ailenin 9/11 m/s değerinin altında kalır. [AD s.7] Montaj yüksekliğinin bu farka göre nasıl
seçileceği **kaynakta yazmıyor** — hesap yapılmadı, yorum eklenmedi.

---

## 4 · İki aileyi ayıran cümle (paylaşık bölümün çözümü)

> **AIR DOOR AD ile AIR DOOR H AD aynı gövde ailesi, aynı cross-flow fan, aynı iki hızlı asenkron
> motor ve aynı kızılötesi kumanda mantığını paylaşır. Ayıran tek şey, H AD'de bulunan PTC
> termistörlü elektrikli ısıtma elemanlarıdır: AD ortam havasını üfler, H AD üflediği havayı
> ısıtır.** [AD s.6]

Bu farkın vitrinde görünmesi için kaynakta ölçülebilir üç sonucunu yazmak yeterlidir:

1. **Hava hızı düşer.** Isıtmasız ailede 9/11 m/s, ısıtıcılı ailede 8,5/9,5 m/s. [AD s.7]
2. **Debi düşer, karşılığında ısı gelir.** Aynı 900 boyunda ısıtmasız modelin debisi
   1100/1400 m³/h iken ısıtıcılı modelinki 1000/1200 m³/h'dir; karşılığında 2/4/6 kW ısıtma
   gücü gelir. [AD s.7]
3. **Besleme ve gövde değişir.** Isıtmasız ailenin dördü de monofazeyken ısıtıcılı ailede üç
   model trifazedir [AVenS s.64]; ayrıca ısıtıcılı gövde daha derindir (305 mm ve 235 mm'ye
   karşı 220 mm ve 190 mm). [AD s.7]

"Isıtmalı" kelimesi tek başına yetmez: ısıtmanın **bedeli** (daha düşük debi ve hız, trifaze
besleme ihtiyacı, daha derin gövde) müşterinin karar verirken göreceği asıl bilgidir.

---

## 5 · K7.1 — YAZILDI ama YÜKLENMEZ (satmadığımız varyantlar)

Kaynak, iki aileyi birlikte sayarken **"8 model"** der ve boy listesini şöyle verir:
900 mm, 1200 mm, 1500 mm ve 2000; besleme türü ise monofaze veya trifazedir. [AD s.6]

DB'deki 4 + 4 = 8 ürün bu sayıyla **birebir örtüşür**. Yani bu kaynakta satmadığımız bir AIR DOOR
varyantı **yoktur** — LINEO turundaki gibi "yaz ama yükleme" kalemi bu grupta çıkmadı. Tek
istisna adlandırmadır: TR liste 65155'i "AIR DOOR H AD 900 Monofaze" diye yazar, katalog
"AIR DOOR H AD 900 M" der; kod aynı olduğu için aynı üründür, yeni bir varyant değildir.
[AVenS s.64]

---

## 6 · Kaynakta gördüğüm çelişkiler ve tuzaklar (K7.5 — hepsi kayıtta)

1. **Debi çelişkisi — anahtar özellikler ile teknik tablo uyuşmuyor.** Anahtar özellikler sayfası
   "yüksek performans (2,700 m3/h'ye kadar)" der. [AD s.4] Aynı kataloğun teknik tablosunda ise
   AIR DOOR AD 2000 için azami debi 3600 m³/h'dir. [AD s.7] **Taslakta anahtar özellikler
   sayfasının değeri KULLANILMADI**; model bazında ayrıntılı olan tablo esas alındı. Hangisinin
   güncel olduğu **ölçülmedi** — üretici teyidi gerekir.
2. **Model adı katalog içinde tutarsız.** Teknik tablo 65158'i **"AIR DOOR AD H 1500 T"** yazar
   (H ile AD yer değiştirmiş); boyut tablosu ve TR liste **"AIR DOOR H AD 1500 T"** yazar.
   [AD s.7] Kod aynı olduğu için aynı üründür; ad, TR listedeki biçimle alındı. [AVenS s.64]
3. **Boy listesinde birim düşmüş.** Kaynak "900 mm, 1200 mm, 1500 mm ve 2000" yazar — dördüncü
   değerde birim yoktur. [AD s.6] Boyut tablosu aynı ölçüyü 2000 mm olarak ve başlıkta
   "Dimensions (mm)" diyerek doğrular. [AD s.7] §5'teki alıntıda eksik **kaynaktaki gibi
   bırakıldı**, tamamlanmadı.
4. **Besleme sütunu birleşik hücrelerle yazılmış.** Tabloda 230 V yalnız 65195 satırının,
   380 V yalnız 65156 satırının hizasında görünür; diğer satırlar boştur. [AD s.7] Yani
   65155'in besleme değeri katalog tablosunda **yoktur**; monofaze olduğu ancak TR listeden
   bilinir. [AVenS s.64] "Tabloya bakıp faz çıkaran" bir betik burada sessizce yanlış üretir.
5. **TR listede ısıtıcı gücü birimsiz ve virgülle ayrılmış.** Sütun "ISITICI GÜCÜ" der, değerler
   "2,4,6" biçimindedir. [AVenS s.64] Bu, ondalık sayı gibi okunabilir (2,4 ve 6). Doğrusu üç
   kademedir ve birim **yalnız İngilizce katalogda** verilir: 2/4/6 kW. [AD s.7] Otomatik
   ayrıştırmada bu alan elle doğrulanmadan kullanılmamalıdır.
6. **Aynı tabloda iki farklı ondalık ayırıcı.** Ağırlık sütunu 12.5 kg, 15.5 kg, 20.5 kg (nokta);
   hava hızı sütunu 8,5/9,5 m/s (virgül) biçimindedir. [AD s.7] Taslak kaynaktaki biçimi korudu;
   **DB'ye yazılırken Türkçe ondalık ayırıcıya (virgül) çevrilmelidir.**
7. **Standart kodlarından biri yumuşak tire (U+00AD) ile yazılmış.** Düz metne çıkarıldığında kod
   parçalanıyor ve otomatik eşleşme düşüyor. [AD s.8] Bu yüzden EMC standartları taslakta seri
   adıyla anıldı, tek tek dizilmedi.
8. **Model adı TR listede bitişik yazılmış.** "AIR DOOR AD1200 / AD1500 / AD2000" — katalogda
   boşlukludur. [AVenS s.64] Ad eşleştirmesi **kod üzerinden** yapılmalıdır (65195–65198,
   65155–65158), ad üzerinden değil. [AD s.7]
9. **Katalog eski.** Kapak arkasındaki baskı kodu 07/15 tarihlidir ve CE için gösterilen
   direktifler 2006/95 ile 2004/108'dir; ikisi de o tarihten sonra yenilenmiştir. [AD s.8]
   Vitrinde direktif numarası **yazılmadı**; yalnız "Alçak Gerilim ve Elektromanyetik Uyumluluk
   direktifleri" denildi.

---

## 7 · Bu taslağın kapatmadığı

* **EN çevirisi yazılmadı** — bu tur TR. `description.en` için ayrı tur gerekir.
* **Fiyat ve stok yazılmadı** (K1). TR kaynakta Euro fiyat sütunu var; taslağa **alınmadı**.
* **Boş kalan kalemler:** IP koruma sınıfı, yangına tepki sınıfı, motor ömrü (saat), filtre ve
  ısı geri kazanım — **kaynakta karşılığı yok**, hiçbiri yazılmadı.
* **Kapının zayıf yeri, dürüstçe:** kapı sayı+birim jetonunu bulamazsa **yalnız sayıyı** arar.
  "6 kW" gibi tek haneli değerlerde bu ayırt edici değildir (sayfada "6" zaten geçer). Güçlü
  doğrulananlar dört haneli olanlardır (1400, 3600, 2200, 1510, 1230). Bunu bilerek okuyun.
* **`is_description_manual` bayrağı** — elle yazılmış bu metin yüklenirse **true** yapılmalı;
  aksi hâlde sonraki otomatik tur ezer.
* **Ticari onay yok** — Recep/uzman turu.

---

## 8 · Kapı çıktısı

```
cd C:/tmp/vh-katalog-rec146 && PYTHONIOENCODING=utf-8 \
  python scripts/icerik-hatti/taslak-kaynak-kapisi.py <bu dosya> --ayrinti

  [YESIL] ajan-hava-perdesi.md
      dogrulanan 31 · DUSEN 0 · olculemeyen 65 (jeton tasimayan cumle) · kapsama %32 · referans 96

SONUC: YESIL — jeton tasiyan her iddia, referans verdigi sayfada dogrulandi.
```

İki not:

* Kapı betiği bu koşuda **çalışma ağacında düzenlenmekteydi** (commit'siz değişiklik):
  ilk koşumda `KeyError: 'db_etiketi'` ile çöktü, ikinci koşumda konsol kod sayfası yüzünden
  `UnicodeEncodeError` verdi. İkisi de **benim taslağımın değil, betiğin** durumudur;
  `PYTHONIOENCODING=utf-8` ile koşuldu. → `ortak-agacta-commitsiz-is-ucar`
* İlk koşumda **1 düşen** vardı: "2.700 m³/h" yazmıştım (Türkçe binlik ayırıcı), kaynak
  "2,700 m3/h" yazıyor. Bu **benim hatamdı** ve kapı yakaladı — düzeltildi (bulgu 1).

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
