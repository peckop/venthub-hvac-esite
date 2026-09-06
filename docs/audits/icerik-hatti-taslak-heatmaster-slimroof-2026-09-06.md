# İçerik hattı — TR taslak: SLIMROOF ES · HEATMASTER F400 (REC-146 Adım 2b·2, ikinci grup)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** Recep doğrudan onayı 2026-09-06 (K7.9)
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır.
**Kaynak:** Vortice Heatmaster/Slimroof kataloğu s.4–44 (EN, **çevrildi**) · AVenS fiyat listesi s.33–34 (TR)
**Referans biçimi:** `[HSK s.NN]` = Heatmaster/Slimroof kataloğu · `[AVenS s.NN]` = fiyat listesi

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — uydurma yok; **yanlış kapsamlı bilgi de vaat ihlalidir**.
* Kararlar — Vitrin 15A **K6** · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Kararlar — Katalog ve Ürün Verisi **K7.2** (çeviri) · **K7.5** (tespit kayıtta) · **K7.9** (bu grup).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok.
* **`icerik-hatti-seri-metni-tek-model-kusuru-2026-09-06.md`** — bu iki ailenin mevcut metni
  o kusurun **en ağır iki örneği**; bu taslak onu düzeltir.

---

## 0 · Bu grupta mevcut metin KORUNMUYOR, DÜZELTİLİYOR

Lineo grubunda mevcut DB metni doğruydu, korudum. **Burada durum farklı** — mevcut metinler kusurlu:

| Aile | Bugün DB'de yazan | DB'deki gerçek |
|---|---|---|
| `…-slimroof-roof` | "Nominal debisi **460 m³/h**", "monofaze model" | 460 – **18.600** m³/h · 5 monofaze + **5 trifaze** |
| `…-slimroof-smoke` | "**Maksimum** debisi **2580 m³/h**", "monofaze model" | 2.580 – **22.550** m³/h · 3 monofaze + **7 trifaze** |

Yani serinin **en küçük** modeli, serinin tamamı gibi sunulmuş — ikincisinde üstelik "maksimum" denerek.
Taslak bunu **aralık vererek** düzeltir. Aralıklar **DB'den** okundu, katalogdan değil: bizim sattığımız
modellerin aralığıdır. (Katalog Heatmaster için 21 model sayıyor, **bizde 10 model var** — katalog
aralığını yazmak satmadığımız ürünü vaat etmek olurdu.)

> **Adlandırma tuzağı (kayda geçiyor):** iki ailenin slug'ı da `…heatmaster-slimroof…` ile başlıyor;
> `-roof` olan **SLIMROOF ES**, `-smoke` olan **HEATMASTER F400**. Slug'a bakarak hangisinin hangisi
> olduğu anlaşılmıyor. Yeniden adlandırma bu şeridin işi değil, ama **karıştırılmaya açık** ve not edildi.

---

## 1 · SLIMROOF ES

**DB:** `vortice-vort-heatmaster-slimroof-roof` · **10 ürün** · 460–18.600 m³/h · 5 monofaze + 5 trifaze

### Kimlik cümlesi
> Dikey gabarisi sınırlı çatılarda düşük enerji tüketimi ve hassas debi ayarı gerektiren uygulamalar için
> tasarlanmış, EC motorlu radyal (yatay) atışlı çatı tipi santrifüj fan. [HSK s.26]

### Dört madde
* Kalıcı mıknatıslı EC motor — düşük tüketim ve kolay performans ayarı [HSK s.26]
* Monofazede **IE5**, trifazede **IE4** verim sınıfı; dış rotorlu tasarım gabariyi küçültür [HSK s.27][AVenS s.33]
* **Düşük dikey gabari** — mimari ve manzara kısıtı olan yerlere uygun [HSK s.29]
* 0–10 V veya PWM sinyaliyle hız kontrolü [AVenS s.33]

### Yapısal bloklar

**Gövde.** Galvaniz çelik sac yapı, kuş telini bütünleşik olarak içerir. [HSK s.27] Alüminyum motor
kapağı hafiftir ve kolayca sökülür; korozyona, darbeye, yüksek sıcaklığa ve atmosferik etkilere
dayanıklıdır. Biçimi, şiddetli yağış halinde bile yağmurun alttaki kanala girmesini önleyecek şekilde
tasarlanmıştır. [HSK s.27] Şapka, kanat ve gövde korozyona dayanıklıdır. [AVenS s.34]

**Çark.** Yüksek verimli, geriye eğimli kanatlı, kendi kendini temizleyen santrifüj çark. 220 mm'ye
kadar olan modellerde takviyeli poliamid, diğerlerinde alüminyum sac. [HSK s.27] Çark tasarımı, motor
verimi ve kontrol elektroniği birlikte yüksek verim sağlar. [HSK s.29]

**Motor.** Yüksek verimli EC motor: monofaze modellerde **IE5**, trifaze modellerde **IE4**. Dış rotorlu
tip, toplam boyutları küçültür; miller bilyalı yataklara oturur, bu da ömrü uzatır. [HSK s.27]
EC teknolojisi motorun her zaman optimum yükte çalışmasını sağlar. [AVenS s.33]

**Koruma.** IP54 koruma derecesi. [HSK s.27] Elektrik izolasyon sınıfı I — **topraklama gereklidir**.
[HSK s.27] Kuş ve yabani hayvanlara karşı koruma, hizmet kesintisine yol açabilecek arızaları önler.
[HSK s.29] İstek üzerine dahili emniyet şalteri sunulur. [HSK s.27]
Çalışma sıcaklığı −30 °C ile +60 °C arasında, modele göre değişir. [HSK s.27]

**Kontrol.** Verimli enerji kullanımı için entegre elektronik kontrol sistemi. [AVenS s.33]
0–10 V veya PWM sinyaliyle hız kontrolü yapılabilir. [AVenS s.33] Geniş ayar imkânı, sağlanan
performansın değişen ihtiyaca uyarlanmasına ve enerji israfının sınırlanmasına olanak verir. [HSK s.29]

**Montaj.** Radyal (yatay) atışlı çatı montajı. [HSK s.26] Hafif ve kolay sökülebilen motor kapakları ile
fan taşıyıcı plakaların alttaki yapıya bağlandığı menteşeler, montaj ve bakımı basitleştirir; menteşe
sistemi büyük boy modellerde bulunur. [HSK s.29][AVenS s.34] Alüminyum dikey atış aksesuarı (KV SLIMROOF)
opsiyoneldir; işlenen havanın dikey atılmasını sağlayarak bina açıklıklarına yakın montajlarda havanın
geri emilmesini önler. [HSK s.27][AVenS s.33]

---

## 2 · HEATMASTER F400

**DB:** `vortice-vort-heatmaster-slimroof-smoke` · **10 ürün** · 2.580–22.550 m³/h · 3 monofaze + 7 trifaze

### Kimlik cümlesi
> Hem günlük havalandırma hem de yangın anında sıcak duman tahliyesi için kullanılabilen, **çift amaçlı**
> radyal (yatay) atışlı çatı tipi santrifüj fan. [HSK s.4]

### Dört madde
* **F400 sertifikası: 400 °C sıcaklıkta 2 saat** çalışma (S2 servisi) [HSK s.4, s.5]
* Sürekli çalışmada (S1) işlenen hava sıcaklığı **80 °C**, istek üzerine **120 °C** [HSK s.5]
* Geriye eğimli kanatlı santrifüj çark; monofaze veya trifaze asenkron motor, tek ya da çift devir
  (Dahlander) [HSK s.4]
* 12101-3:2015 — duman ve ısı kontrol sistemleri standardına uygunluk [HSK s.4]

### Yapısal bloklar

**Gövde.** Galvaniz çelik sac yapı, kuş telini bütünleşik olarak içerir. [HSK s.5] Alüminyum motor
kapakları hafif ve kolay sökülebilir; korozyona, darbeye, yüksek sıcaklığa ve atmosferik etkilere
dayanıklıdır. Biçim, şiddetli yağışta bile yağmurun alttaki kanala girmesini engeller. [HSK s.5]

**Çark.** Yüksek verimli, geriye eğimli kanatlı, kendi kendini temizleyen galvaniz çelik santrifüj çark.
[HSK s.5] Geriye eğimli kanat yapısı verimi en üst düzeye çıkarmak için seçilmiştir. [HSK s.4]

**Motor.** Yüksek verimli AC asenkron motor; Ecodesign 2019/1781 düzenlemesine uygundur ve tüketimi en aza
indirir. Miller bilyalı yataklara oturur, bu da ömrü uzatır. [HSK s.5] Monofaze modellerde 230 V/50 Hz;
trifaze modellerde boya göre 230–400 V/50 Hz veya 400–690 V/50 Hz; çift devirli (Dahlander) modellerde
400 V/50 Hz. [HSK s.5] Seride 2, 4 ve 6 kutuplu motorlar ile çift devirli sürümler bulunur. [HSK s.4]

**Koruma.** **IP55** koruma derecesi ve **F izolasyon sınıfı**. [HSK s.5] Elektrik izolasyon sınıfı I —
**topraklama gereklidir**. [HSK s.5] Çalışma sıcaklığı −25 °C ile +60 °C arasındadır; işlenen havanın
sürekli çalışmadaki (S1) azami sıcaklığı 80 °C, istek üzerine 120 °C'dir. Yangın halinde **400 °C'de
2 saat** (S2 servisi) çalışır. [HSK s.5] Kuş ve yabani hayvanlara karşı koruma, hizmet kesintisine yol
açabilecek arızaları önler. [HSK s.7] Elektrikli ekipman muhafazalarının koruma derecesi (CEI EN
60529/1997) ve duman-ısı kontrol sistemleri (12101-3:2015) standartlarına uygundur. [HSK s.4]

**Kontrol.** Motor tipine göre tek hızlı veya çift hızlı (Dahlander) çalışma. [HSK s.4] Fanların geniş
ayar aralığı, sağlanan performansın değişen ihtiyaca uyarlanmasına ve enerji israfının sınırlanmasına
olanak verir. [HSK s.7]

**Montaj.** Radyal (yatay) atışlı çatı montajı. [HSK s.4] Menteşe, fan taşıyıcı plakanın eğilmesine izin
vererek denetim ve bakım işlemlerini kolaylaştırır. [HSK s.5] Hafif ve kolay sökülebilen alüminyum motor
kapakları ile taşıyıcı plakaları yapıya bağlayan menteşeler, montaj ve bakımı basitleştirir. [HSK s.7]
Alüminyum dikey atış parçası, işlenen havanın dikey atılmasını sağlayarak bina açıklıklarına yakın
montajlarda havanın geri emilmesini önler. [HSK s.5]

---

## 3 · İki seriyi ayıran cümle

> **SLIMROOF ES ile HEATMASTER F400 aynı gövde ailesindendir:** ikisi de galvaniz çelik gövdeli, kuş teli
> entegre, geriye eğimli kendi kendini temizleyen çarklı, radyal atışlı çatı fanıdır. **Ayıran iki şey
> vardır.** Birincisi: HEATMASTER F400 **yangın anında 400 °C'de 2 saat** çalışacak şekilde sertifikalıdır
> ve duman tahliyesi için kullanılabilir; SLIMROOF ES bunu **yapmaz**. İkincisi: SLIMROOF ES **EC motorlu**
> olduğu için tüketimi düşüktür ve dikey gabarisi küçüktür; HEATMASTER F400 **AC asenkron motorludur**.
> [HSK s.4, s.5, s.26, s.27]

Kısaca: **yangın güvenliği gerekiyorsa HEATMASTER, enerji ve yükseklik kısıtı varsa SLIMROOF.**
Bu cümle olmadan iki seri vitrinde birbirinin kopyası görünür.

---

## 4 · Kaynakta ve veride bulduklarım (K7.5)

1. **Katalog 21 model sayıyor, bizde 10 var** (Heatmaster). Katalog aralığını yazmak satmadığımız ürünü
   vaat etmek olurdu; **taslaktaki aralıklar DB'den** okundu.
2. **Mevcut DB metinleri kusurlu** — ayrı raporda ölçüldü (10 aile / 109 ürün).
   Bu taslak iki aileyi düzeltir, kalan 8'i 2b·2'nin sonraki grupları kapatacak.
3. **Slug adları yanıltıcı:** `-roof` = SLIMROOF, `-smoke` = HEATMASTER. Karıştırılmaya açık.
4. **AVenS s.34 metni iki aileyi de anlatıyor** (paylaşık sayfa); "yatay atışlı, menteşeli motor-pervane,
   geriye eğimli kanat, korozyona dayanıklı alüminyum" ifadeleri **ortak** özelliklerdir, bu yüzden
   ikisinde de kullanıldı — tek aileye ait sayılmadı.

## 5 · Kapatmadığı

* **EN çevirisi yazılmadı** (ayrı tur).
* **Debi/basınç tabloları taslağa girmedi**; aralık dışında sayı kullanılmadı.
* **`is_description_manual`** bugün `false`; bu metin yüklenirse **true** yapılmalı, yoksa sonraki
  otomatik tur ezer.
* Ticari onay yok.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
