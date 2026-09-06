<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf, IND=industrial_Ventilation.pdf, ATX=E_ATEX_Range_yeni_2025.pdf -->

# İçerik hattı — TR taslak: VORTICEL Endüstriyel Aksiyel · VORT E-ATEX (REC-146 Adım 2b·2)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** alt-ajan görevi, iki aile birlikte
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır.
**Kaynak:** `industrial_Ventilation.pdf` s.4–31 ve s.98–103 (EN, **çevrildi**) · `E_ATEX_Range_yeni_2025.pdf` s.3–16 (EN, **çevrildi**) · `avens_fiyat_listesi_2026_HQ.pdf` s.30, s.31, s.38 (TR)
**Referans biçimi:** `[IND s.NN]` = industrial_Ventilation · `[ATX s.NN]` = E_ATEX_Range_yeni_2025 · `[AVenS s.NN]` = AVenS 2026 fiyat listesi · `[DB]` = kendi ürün tablomuz (PDF değil)

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — uydurma yok; **yanlış kapsamlı bilgi de vaat ihlalidir**.
* Kararlar — Vitrin 15A **K6** · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Kararlar — Katalog ve Ürün Verisi **K7.2** (çeviri) · **K7.5** (tespit kayıtta).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok (Gövde · Çark · Motor · Koruma · Kontrol · Montaj).
* **`icerik-hatti-seri-metni-tek-model-kusuru-2026-09-06.md`** — bu iki aile o kusurun örneğidir; taslak onu düzeltir.

---

## 0 · Bu grupta mevcut metin KORUNMUYOR, DÜZELTİLİYOR

| Aile | Bugün DB'de yazan | DB'deki gerçek |
|---|---|---|
| `vortice-vort-industrial-ventilation-axial` | "**350 mm** nominal çaplı… (**trifaze** model)" | 16 ürün · 1850–14500 m³/h · **4 monofaze + 12 trifaze** · üç ayrı seri (E · A-E · MP) |
| `vortice-vort-e-atex` | "**250 mm** nominal çaplı… (**monofaze** model)" | 14 ürün · 1145–6550 m³/h · **5 monofaze + 9 trifaze** |

Yani her iki ailede de serinin **en küçük** modeli, serinin tamamı gibi sunulmuş. Taslak bunu
**aralık vererek** düzeltir; aralıklar **DB'den** okundu, katalogdan değil — sattığımız modellerin
aralığıdır.

> ### ⚠ KİMLİK KARIŞIKLIĞI TUZAĞI (kayda geçiyor)
> Aksiyel ailede **`E 354 M`** (kod 40703) vardır; ATEX ailesinde **`E 354 M ATEX`** (kod 40322)
> vardır. **Bunlar ayrı ürünlerdir**, ayrı kataloglardadır ve debileri farklıdır. Aynı tuzak
> `E 254/304/404/454/504/506/604` adlarında da geçerlidir. Bu taslakta her cümlenin referansı,
> cümlenin ait olduğu ailenin kaynağına verilmiştir; kaynaklar **karıştırılmamıştır**.

---

## 1 · VORTICEL Endüstriyel Aksiyel Fanlar (E · A-E · MP)

**DB:** `vortice-vort-industrial-ventilation-axial` · **16 ürün** · 1850–14500 m³/h · 4 monofaze + 12 trifaze `[DB]`
**Modeller:** A-E 354/454/504/564 T · E 354/404/504/604 M · MP 302/304/354/404/454/504/506/604 T `[DB]`

### Kimlik cümlesi

> Ticari ve endüstriyel hacimlerin — spor salonu, kuru temizleme, marangozhane, garaj, depo, ahır —
> havalandırması için tasarlanmış, farklı çaplarda, monofaze ve trifaze sürümleri bulunan duvar tipi
> endüstriyel aksiyel fan ailesi. [IND s.4] Aile, Vortice'in üç serisini birlikte kapsar: VORTICEL E,
> VORTICEL A-E ve VORTICEL MP. `[DB]`

### Dört madde

* **VORTICEL E** — düşük basınçlı duvar tipi aksiyel; anma çapı 250–350 mm aralığında 7 model ve toz/suya karşı IP44 korumalı motorlar. [IND s.4]
* **VORTICEL A-E** — ince gövdeli (eksenel derinliği azaltılmış) duvar tipi aksiyel; 2, 4 ve 6 kutuplu, anma çapı 250–630 mm aralığında 19 model, IP54 korumalı motorlar. [IND s.14]
* **VORTICEL MP** — orta basınçlı aksiyel; anma çapı 250–600 mm aralığında 19 model, IP55 korumalı motorlar ve −15 °C / +70 °C sürekli çalışma aralığı. [IND s.24]
* **Hız kontrolü modele eşlenmiştir:** fiyat listesinde E serisinin dört modeli de IRM30, A-E 354 T IRT15, A-E 454/504/564 T ise IRT35 hız anahtarıyla verilir. [AVenS s.30]

### Yapısal bloklar

**Gövde.** VORTICEL E ve A-E serilerinde gövde; preslenmiş, asitle temizlenmiş ve fosfatlanmış çelik
duvar panelidir, epoksi toz boyayla çekiçlenmiş yüzey bitişi verilir ve agresif maddelere uzun süreli
direnç için gri renkte bitirilir. [IND s.4] Hava geçiş ağızları duvar paneliyle tek parça hâlinde
biçimlendirilir ve hava akışını en iyilemek için ölçülendirilir; A-E serisinde bu ağız uzatılmış
profillidir. [IND s.14] MP serisinde duvar panelleri kalıplanmış, asitle temizlenmiş ve fosfat kaplı
çeliktir; gri polyester toz boyayla boyanır ve çekiçlenmiş yüzey bitişiyle zaman içindeki hava
koşullarına üstün direnç gösterir. [IND s.24] Fiyat listesi E ve A-E serilerini duvar tipi olarak
tanımlar. [AVenS s.30]

**Çark.** VORTICEL E serisinde çark, cam elyafı yüklü plastik reçineden kalıplanmış altı kanatlıdır;
kanatlar enjeksiyon döküm alüminyum kanallı göbeğe oturur ve çark dinamik olarak dengelenir (UNI ISO
1940, Sınıf 6.3). [IND s.4] A-E serisinde çark yine dinamik dengelidir (UNI ISO 1940, Sınıf 6.3);
kanat sayısı modele göre dörtten yediye değişir, kanatlar elektro-galvanizli çelik sacdan kalıplanır
ve polyester toz boyayla kaplanır. [IND s.14] MP serisinde kanat, hava türbülansından doğan ses
düzeyini azaltmak üzere tasarlanmış bindirmeli kanat profilindedir; kanatlar deforme olmayan, yüksek
dayanımlı ve boyutsal olarak kararlı polipropilenden (PP), göbek ise enjeksiyon döküm alüminyumdandır.
[IND s.24]

**Motor.** E serisinde motorlar F sınıfı, termik korumalı asenkron tiptir; miller çift keçeli bilyalı
yataklara oturur ve toz/suya karşı IP44 koruma derecesine sahiptir. [IND s.4] A-E serisinde motorlar,
fanın eksenel derinliğini sınırlamak amacıyla seçilmiş F sınıfı termik korumalı asenkron rotor tipi
motorlardır; miller çift korumalı bilyalı yataklara oturur ve koruma derecesi IP54'tür. [IND s.14]
MP serisinde motorlar UMELEC B5 standart gövdeli asenkron endüksiyon tipidir; miller bilyalı yataklara
oturur ve ısıyı daha etkin atmak için soğutma pervaneleri bulunur, koruma derecesi IP55'tir.
[IND s.24] Monofaze modellerin kalkış kondansatörleri EN 60252-1 standardına uygundur ve üçüncü
tarafça belgelendirilmiştir. [IND s.4] Seride 2, 4 ve 6 kutuplu motorlar bulunur. [IND s.14]

**Koruma.** Toz ve suya karşı koruma derecesi seriye göre değişir; VORTICEL E serisinde IP44'tür.
[IND s.4] A-E serisinde IP54'tür. [IND s.14] MP serisinde IP55'tir. [IND s.24] Kaza önleyici ve kuş
girişini engelleyen koruma ızgaraları UNI ISO 13857 standardına göre tasarlanmıştır, motor taşıyıcı
işlevini de üstlenir, elektro-kaynaklı çelik halkalardan yapılır ve siyah epoksi boyayla bitirilir.
[IND s.4] Elektrik izolasyon sınıfı I'dir — topraklama gereklidir. [IND s.4] MP serisinde de izolasyon
sınıfı I'dir ve topraklama gerekir. [IND s.24] MP serisinde sürekli çalışma sıcaklığı aralığı
geniştir: −15 °C / +70 °C, sıcak duman ile azami çalışma sıcaklığı ise 70 °C'dir. [IND s.24] E ve A-E
serilerinde azami sürekli çalışma sıcaklığı modele göre değişir ve teknik tabloda model bazında
verilir. [IND s.15] Bu ailenin fanları **patlayıcı ortam belgesi taşımaz**; kaynak, önemli derişimde
aşındırıcı toz ya da asidik/korozif madde içeren akışların taşınması için uygun olmadıklarını açıkça
yazar. [IND s.24]

**Kontrol.** E ve A-E serilerinde motor hızı Vortex kontrolörleriyle ayarlanabilir. [IND s.4] Fiyat
listesinde E serisinin dört modeli de IRM30 ile, A-E 354 T IRT15 ile, A-E 454/504/564 T ise IRT35 ile
eşlenmiştir. [AVenS s.30] MP modellerinde eşleşme IRT15 ve IRT35 arasında değişir, MP 604 T için
IRT40 verilir. [AVenS s.31] Katalogda ayrıca inverterli hız kontrolörleri ve bunlarla birlikte
kullanılan 0–10 V potansiyometre listelenir. [IND s.22]

**Montaj.** E ve A-E serileri duvara monte edilir. [IND s.4] MP serisi duvara ve tavana monte
edilebilir; yatay ve dikey montaja uygundur. [AVenS s.31] A-E ve MP serileri, kanala atış ya da hava
filtresiyle birleştirme gibi belirgin basınç kaybı bulunan uygulamalarla uyumludur. [IND s.14]
VORTICEL E serisi ise basınç kaybının aşılmasını gerektirmeyen uygulamalar için tasarlanmıştır.
[IND s.4] Koruma ızgaralarının kolayca sökülebilmesi fanın bakım ve temizliğini basitleştirir.
[IND s.4] Aksesuar olarak panel montajı için DPU ara parçası, PGR yerçekimli panjur ve TRA emniyet
ağlı çerçeve model bazında eşlenmiştir. [IND s.22] MP serisi için aynı aksesuar kümesi ayrı bir
tabloda verilir. [IND s.30]

---

## 2 · VORT E-ATEX (patlayıcı ortam aksiyel fanları)

**DB:** `vortice-vort-e-atex` · **14 ürün** · 1145–6550 m³/h · 5 monofaze + 9 trifaze `[DB]`
**Modeller:** E 254/304/354/404/454 M ve T ATEX · E 504/506/604/606 T ATEX `[DB]`

### Kimlik cümlesi

> Gaz veya toz nedeniyle patlayıcı ortam oluşabilen — ATEX sınıflandırmasına göre Grup II — sanayi
> hacimlerinde kullanılmak üzere tasarlanmış, ATEX 2014/34/EU direktifine uygun, plaka tipi patlama
> korumalı endüstriyel aksiyel fan ailesi. [ATX s.4]

### Dört madde

* **Gaz ortamı sınıflandırması "II 2G Ex h IIB T3 Gb"** — potansiyel patlayıcı gaz bulunan alanlar: endüstriyel depolar, kimya ve ilaç sanayii, akü şarj alanları. [ATX s.4]
* **Toz ortamı sınıflandırması "II 2D Ex h IIIC T125°C Db"** — potansiyel patlayıcı toz bulunan alanlar: un üretim tesisleri, tekstil sanayii, alüminyum işleme tesisleri. [ATX s.4]
* **Etiketteki tam kod "II 2G/D h T3/125°C X Gb/Db"**; kaynağa göre "h" yapısal güvenlik ve ateşleme kaynağı denetimini, "X" kullanma kılavuzunda belirtilen özel çalışma koşullarını, "Gb/Db" ise hem gaz hem toz için Bölge 1 uygunluğunu gösterir. [ATX s.5]
* **Motor koruma derecesi IP65, motor sınıfı F, çalışma sıcaklığı aralığı −20 °C / +40 °C**. [ATX s.6] Ailede 14 model vardır; fiyat listesindeki debiler 1145 m³/h ile 6550 m³/h arasındadır. [AVenS s.38]

### Yapısal bloklar

**Gövde.** Çerçeve ve ızgaralar preslenmiş, asitle temizlenmiş ve fosfatlanmış çeliktendir; epoksi
astar üzerine fırında sertleştirilen poliüretan toz boyayla gri dokulu yüzey elde edilir. [ATX s.6]
Motor kapağı preslenmiş çeliktir. [ATX s.6] Elektrik bağlantısı metal kablo rakorlarıyla yapılır.
[ATX s.6] Monofaze motorların kalkış kondansatörü metal bir muhafaza içine yerleştirilmiştir.
[ATX s.6] Kaynak, kuş girişini engelleyen emniyet ızgaralarının çift yüzey kaplamayla korunan
galvanizli çelik halkalardan yapıldığını belirtir. [IND s.98]

**Çark.** Çark göbekleri alüminyumdandır. [ATX s.6] Kanatlar, cam elyafı takviyeli antistatik
poliamid (PA) reçineden yapılır. [ATX s.6] Motor soğutma pervanesi de alüminyumdandır. [ATX s.6]
Kaynak, kanat malzemesinin boyutsal kararlılık, dayanım ve agresif maddelere direnci bir arada
sağlamak için seçildiğini yazar. [IND s.98]

**Motor.** Motorlar tek hızlı, monofaze (M) veya trifaze (T) AC asenkron tiptir ve UNEL MEC standart
B3/B5 gövdededir. [ATX s.6] Motorlar Ecodesign 2019/1781 düzenlemesine tam uyumludur ve miller çift
korumalı bilyalı yataklara oturur. [ATX s.6] **Motorlarda termik koruma bulunmaz**; termik koruma
(GV2-ME serisi) opsiyonel olarak sunulur. [ATX s.6] Modeller 4 veya 6 kutupludur ve devir sayısı
model tablosunda verilir. [ATX s.7]

**Koruma.** Motor koruma derecesi IP65'tir. [ATX s.6] Motor izolasyon sınıfı F'tir. [ATX s.6]
Çalışma sıcaklığı aralığı −20 °C / +40 °C'dir. [ATX s.6] Ürünler, gaz ve toz nedeniyle patlama riski
bulunan alanlarda kullanım için ATEX Direktifi uyarınca IMQ tarafından belgelendirilmiştir. [ATX s.6]
Belgelendirmenin dayandığı standartlar arasında EN 14986, EN 60079-1, EN 60079-7, EN 60079-31 ve
EN 60529 yer alır. [ATX s.3] Toz ortamı seçeneğinde etikette geçen 125°C, azami yüzey sıcaklığıdır.
[ATX s.5] Kaynak, yapımda kullanılan önlem ve malzemelerin patlayıcı ortamlarda kullanıma uygun
olduğunu ve motor koruma derecesinin IP65 olduğunu yazar. [IND s.98]

**Kontrol.** Motorlar **tek hızlıdır**. [ATX s.6] Kontrol tarafında kaynakta yer alan tek donanım,
opsiyonel GV2-ME termik-manyetik motor koruma şalteridir. [ATX s.6] GV2-ME04, GV2-ME05 ve GV2-ME06
şalterleri ailedeki her modelle tek tek eşlenmiştir. [ATX s.13] Fiyat listesinde bu aile için, aksiyel
ailede bulunan "HIZ ANAHTARI" sütunu yoktur. [AVenS s.38]

> **Kaynakta karşılığı yok:** bu aile için hız kontrolü / debi ayarı seçeneği hiçbir kaynakta
> geçmiyor — aksiyel ailedeki IRM/IRT hız anahtarları burada **eşlenmemiş**. Bu boşluk bilerek
> bırakıldı; doldurulması için üretici teyidi gerekir.

**Montaj.** Cihazlar duvara veya tavana monte edilmek üzere tasarlanmıştır ve kanala da bağlanabilir.
[ATX s.7] Kurulum ortamlarının sınıflandırılması ve tanımlanması yetkili merciler tarafından
yapılmalıdır. [ATX s.7] Anma çapları (mm) 250, 315, 355, 400, 450, 500 ve 630 değerleriyle
tanımlıdır; her modelin montaj ölçüsü ayrı tabloda verilir. [ATX s.8] Kaynak, bu cihazların duvara,
tavana ve hatta kanal içine kurulabildiğini belirtir. [IND s.98]

---

## 3 · İki aileyi ayıran cümle

> **İki aile aynı gövde mantığından gelir; ayrım sertifika ve koruma tarafındadır.** Her ikisi de
> Vortice'in plaka tipi aksiyel fanıdır: preslenmiş çelik panel, kuş girişini engelleyen koruma
> ızgarası ve F sınıfı asenkron motor. [IND s.4] **Birinci fark — belge:** VORT E-ATEX ailesi ATEX
> 2014/34/EU direktifine uygun üretilmiştir ve IMQ tarafından belgelendirilmiştir. [ATX s.6] Aksiyel
> ailenin fanları böyle bir belge taşımaz; kaynak, aşındırıcı toz ile asidik/korozif madde derişimi
> yüksek akışlar için uygun olmadıklarını açıkça yazar. [IND s.14] **İkinci fark — koruma derecesi:**
> ATEX ailesinde motor koruma derecesi IP65'tir. [ATX s.6] Aksiyel ailede ise seriye göre değişir.
> E serisinde IP44'tür. [IND s.4] A-E serisinde IP54'tür. [IND s.14] MP serisinde IP55'tir. [IND s.24]
> **Üçüncü fark — malzeme ve
> ateşleme kaynağı denetimi:** ATEX çarkında kanatlar antistatik poliamid reçinedendir ve elektrik
> bağlantısı metal kablo rakorlarıyla yapılır. [ATX s.6] **Dördüncü fark — termik koruma:** ATEX
> motorlarında dahilî termik koruma yoktur, koruma şalteri dışarıdan eklenir. [ATX s.6] Aksiyel
> ailenin E serisi motorları ise termik korumalıdır. [IND s.4] **Beşinci fark — sıcaklık:** ATEX
> ailesinin çalışma aralığı daha dardır, −20 °C / +40 °C. [ATX s.6] MP serisi ise −15 °C / +70 °C
> aralığında çalışır. [IND s.24]

Kısaca: **patlayıcı ortam varsa E-ATEX, yoksa VORTICEL aksiyel.** ATEX'in bedeli daha dar sıcaklık
aralığı, tek hız ve dışarıdan eklenen motor korumasıdır; karşılığı, Bölge 1 / Bölge 21'de
kullanılabilen belgeli bir fandır.

---

## 4 · Kaynakta gördüğüm çelişki ve hatalar (K7.5)

1. **ATEX debileri iki katalogda FARKLI.** `industrial_Ventilation.pdf` s.99 eski kodları ve eski
   değerleri verir (E 254 M ATEX kod 40301, 1040 m³/h; E 604 T ATEX kod 40317, 6900 m³/h).
   `E_ATEX_Range_yeni_2025.pdf` s.7 yeni kodları ve yeni değerleri verir (40320, 1145 m³/h; 40331,
   6550 m³/h). **DB'deki 1145–6550 aralığı yeni kataloğa uyuyor**, bu yüzden ATEX metninde
   **ATX kaynağı esas alındı**; IND s.98 yalnızca yeni katalogla çelişmeyen yapısal ifadeler için
   kullanıldı, IND s.99 hiç kullanılmadı.
2. **ATX s.7'de anma çapı sütunu iki modelde yer değiştirmiş görünüyor:** E 506 T ATEX için 630,
   E 604 T ATEX için 500 yazıyor. Oysa aynı belgenin s.8 ölçü tablosunda E 506 T ATEX'in ØF ölçüsü
   498, E 604 T ATEX'inki 598'dir — yani tersi. Taslakta model başına çap iddiası **yazılmadı**.
3. **ATX s.12'deki performans eğrisi başlıklarında kod yanlış:** "E 604 T ATEX … code 40332" ve
   "E 606 T ATEX … code 40333" yazıyor; s.5, s.7 ve s.13'e göre 40331 = E 604 T, 40332 = E 606 T,
   40333 = E 506 T. Eğri sayfaları taslakta kullanılmadı.
4. **AVenS s.38 ile ATX s.7 debileri birkaç modelde küçük farklarla ayrışıyor:** E 506 T ATEX
   AVenS'te 3600, katalogda 3580; E 354 T ATEX AVenS'te 2546, katalogda 2548. Taslakta yalnız uç
   değerler (1145 ve 6550) kullanıldı; ikisi de her iki kaynakta aynı.
5. **AVenS s.38'deki ATEX etiket şeması bir ÖRNEKTİR, bizim ürünümüzün kodu DEĞİLDİR.** Orada
   "II 2 G Ex db IIC T4 Gb" yazar; bizim ailenin kodu ATX s.5'e göre "II 2G/D h T3/125°C X Gb/Db".
   Taslakta **yalnız ürünün kendi kodu** kullanıldı. Bu, ailenin koruma tipini ("h" ↔ "db") ve gaz
   grubunu ("IIB" ↔ "IIC") yanlış göstermeye çok açık bir tuzaktı.
6. **ATX s.5'teki sıcaklık sınıfı tablosunun başlığı bozuk çıkıyor** (metin katmanında "Class L (mm)"
   gibi okunuyor; satırlar T1 450 / T2 300 / T3 200 …). Bu tablodan **hiçbir sayı taslağa alınmadı**;
   T3'ün karşılığı olan yüzey sıcaklığı **yazılmadı**, çünkü kaynaktaki birim güvenilir değil.
7. **`industrial_Ventilation.pdf` s.4/s.5'e göre E serisinin ikinci tablosu (E 302 M … E 606 T)
   "yalnızca AB dışı pazar için" işaretlidir.** Bizim sattığımız **E 404 M, E 504 M ve E 604 M** bu
   tablodadır; **E 354 M** ise AB tablosundadır. Türkiye AB dışı pazar olduğu için bu bir çelişki
   değil — ama vitrinde "Avrupa serisi / ErP kapsamında" gibi bir ifade kullanılırsa **yanlış olur**;
   kullanılmadı.
8. **A-E serisinin basınç sınıfı iki kaynakta farklı adlandırılıyor:** Vortice kataloğu başlığı
   "Low-pressure plate axial fans" (düşük basınçlı) [IND s.14], AVenS fiyat listesi ise "VORTICEL A-E
   ORTA BASINÇLI AKSİYEL FANLAR" der [AVenS s.30]. Taslak, blok metinlerinde A-E için basınç sınıfı
   iddiasını **üstlenmedi**; yalnız iki kaynakta da doğrulanan "ince gövdeli / basınç kaybı olan
   uygulamalara uygun" ifadeleri kullanıldı.
9. **MP 604 T debisi iki kaynakta farklı:** AVenS s.31'de 14000 m³/h, IND s.25'te 14500. DB 14500
   diyor; taslakta bu sayı **cümle içinde kullanılmadı**, yalnız DB satırında aralık ucu olarak var.
10. **AVenS s.31 MP serisini "duvara ve tavana monte edilebilir" der; IND s.24 başlığı ise
    "Wall-hung" (duvara asılan) der.** Tavan montajı yalnız TR fiyat listesinde geçtiği için o cümle
    **AVenS'e referanslandı**, katalog kaynağına değil.

## 5 · Kapatmadığı

* **EN çevirisi yazılmadı** (ayrı tur).
* **Debi / basınç / ses tabloları taslağa girmedi**; model başına sayı kullanılmadı.
* **A-E serisi için elektrik izolasyon sınıfı** kaynakta (IND s.14) yazmıyor; E ve MP için yazıyor.
  Bu yüzden "tüm ailede sınıf I" **denmedi**.
* **ATEX ailesinde hız kontrolü/debi ayarı** kaynakta yok — o kısım bilerek boş bırakıldı (kutu).
* **`is_description_manual`** bu metin yüklenirse **true** yapılmalı, yoksa sonraki otomatik tur ezer.
* Ticari onay yok.

---

— URUN-KATALOG alt-ajanı (sid 3a7976a1), 2026-09-06
