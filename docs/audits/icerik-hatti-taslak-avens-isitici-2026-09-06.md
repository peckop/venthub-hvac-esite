<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf -->
<!-- VARSAYILAN-KAYNAK: AVenS -->

# İçerik hattı — TR taslak: AVenS Elektrikli Isıtıcılar · AVenS Sulu Batarya · AVenS Hız Anahtarları

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** REC-146 Adım 2b, AVenS ısıtıcı/anahtar grubu
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır. Bu dosya kaynak/kanıt kaydıdır.
**Kaynak:** AVenS Ürün Fiyat Kataloğu 2026 (TR) — s.69 (ısıtıcı çifti) · s.27, s.36 (hız anahtarı)
**Referans biçimi:** `[AVenS s.NN]` = AVenS 2026 fiyat listesi PDF sayfası (PDF indeksi = basılı sayfa no; ölçüldü)

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Kararlar — Katalog ve Ürün Verisi **K7.1** (varyant metni yazılır, yüklenmez) · **K7.5** (her tespit kayıtta).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Kalıp örneği: `docs/audits/icerik-hatti-taslak-lineo-2026-09-06.md`.

## 0 · Bu üçü niçin bir arada yazıldı — ve okurun bilmesi gereken sınır

Elektrikli ısıtıcılar ile sulu bataryalar TR fiyat listesinde **aynı sayfayı (s.69) paylaşır**; iki ayrı
tablo hâlinde, ortak bir "ISI GERİ KAZANIM CİHAZLARI" başlığı altında. Ayrı ayrı yazılsalardı ikisi de
"AVenS ısı geri kazanım cihazları için ısıtıcı" diye başlar ve vitrinde **iki ayrı aile tek cümleyle**
çıkardı. Ayıran cümle ancak yan yana yazınca görünür (§4).

**Dürüst sınır — bu turun en önemli cümlesi:** AVenS fiyat listesi bir **fiyat listesidir**, teknik föy
değildir. Bu üç ailede kaynak, tablolardaki **model / güç / debi / eşleşme** verisi ile **üç** kısa
anlatım cümlesinden ibarettir. Gövde malzemesi, koruma sınıfı, ısıtıcı rezistans tipi, batarya
boru/kanat malzemesi, su bağlantı ölçüsü, basınç kaybı, hız anahtarı montaj biçimi — **hiçbiri kaynakta
yoktur**. O bloklar bu taslakta **boştur ve boş kalmalıdır**. AVenS'in kendi markamız olması bu boşluğu
doldurma izni değildir; **eksik olan, eksik diye raporlanır** (§6, §7).

## 1 · Bugün DB'de ne var

| Aile | Ürün | `description.tr` | Durum |
|---|---|---|---|
| `avens-elektrikli-isiticilar` | 6 | **BOŞ** | sıfırdan yazılıyor |
| `avens-sulu-batarya` | 8 | **BOŞ** | sıfırdan yazılıyor |
| `avens-hiz-anahtarlari` | 2 | **BOŞ** | sıfırdan yazılıyor |

---

## 2 · AVenS Elektrikli Isıtıcılar

**DB:** `avens-elektrikli-isiticilar` · 6 ürün · 3 / 6 / 9 / 12 / 15 / 18 kW · açıklama **BOŞ**

### Kimlik cümlesi
> AVenS ısı geri kazanım cihazlarıyla birlikte kullanılan, trifaze 380V 50Hz beslemeli elektrikli ısıtıcı serisi. [AVenS s.69]

### Maddeler
* Altı güç kademesi: 3 kW, 6 kW, 9 kW, 12 kW, 15 kW ve 18 kW. [AVenS s.69]
* Her kademe belirli bir hava debisiyle eşleştirilmiştir: en küçük model 1000 m³/h, en büyük model 5000 m³/h. [AVenS s.69]
* Uygun AVenS cihaz eşleşmesi tabloda verilir — 3 kW için AVenS 750 - 1000, 18 kW için AVenS 5000. [AVenS s.69]
* Kontrol paneli ile birlikte kullanılır. [AVenS s.69]

### Model tablosu (kaynaktan birebir)

| Kod | Model | Debi | Isıtıcı gücü | Uygun model |
|---|---|---|---|---|
| 13037 | 3 KW ELEKTRİKLİ ISITICI | 1000 m³/h | 3kW | AVenS 750 - 1000 |
| 13032 | 6 KW ELEKTRİKLİ ISITICI | 2000 m³/h | 6kW | AVenS 1500 - 2000 - 2500 |
| 13033 | 9 KW ELEKTRİKLİ ISITICI | 3000 m³/h | 9kW | AVenS 3000 - 3500 |
| 13034 | 12 KW ELEKTRİKLİ ISITICI | 4000 m³/h | 12kW | AVenS 4000 |
| 13038 | 15 KW ELEKTRİKLİ ISITICI | 5000 m³/h | 15W (kaynak hatası) | AVenS 5000 |
| 13039 | 18 KW ELEKTRİKLİ ISITICI | 5000 m³/h | 18W (kaynak hatası) | AVenS 5000 |

Kaynakta güç sütunu son iki satırda `15W` / `18W` yazar; model adı `15 KW` / `18 KW`'dır. **Kaynak
hatası olarak kayda geçirildi, düzeltilmedi** (§6-1).

### Yapısal bloklar

**Gövde.** *Kaynakta karşılığı yok — boş.* Fiyat listesi ısıtıcının gövde malzemesini, kabin yapısını
veya ölçüsünü vermez.

**Çark.** *Bu ürün tipi için geçersiz.* Elektrikli ısıtıcı bir fan değildir; çarkı yoktur, havayı
kendisi hareket ettirmez — bağlı olduğu ısı geri kazanım cihazının debisiyle eşleştirilir. [AVenS s.69]

**Motor.** *Bu ürün tipi için geçersiz.* Isıtıcının motoru yoktur.

**Koruma.** *Kaynakta karşılığı yok — boş.* IP sınıfı, termik/aşırı ısınma koruması ve yangın sınıfı
fiyat listesinde belirtilmemiştir.

**Kontrol.** Elektrikli ısıtıcı kontrol paneli ile birlikte kullanılır. [AVenS s.69]

**Montaj.** *Kaynakta montaj biçimi verilmemiştir.* Fiyat listesi yalnız **cihaz eşleşmesini** verir:
her güç kademesinin karşısında uygun AVenS modeli yazılıdır, AVenS 750'den AVenS 5000'e. [AVenS s.69]

---

## 3 · AVenS Sulu Batarya

**DB:** `avens-sulu-batarya` · 8 ürün · 7 / 8 / 11 / 14 / 20 / 28 / 36 / 40 kW · açıklama **BOŞ**

### Kimlik cümlesi
> AVenS ısı geri kazanım cihazlarıyla birlikte kullanılan, 90/70 °C sıcak su ile çalışan kanal tipi sulu ısıtma bataryası serisi. [AVenS s.69]

### Maddeler
* Sekiz kapasite kademesi: 7 kW'tan 40 kW'a. [AVenS s.69]
* Isıtma kapasitesi 90/70 °C su rejiminde Kcal/h olarak verilir; 7 kW modelde 4700, 40 kW modelde 47300 Kcal/h. [AVenS s.69]
* Her kademe belirli bir hava debisiyle eşleştirilmiştir: en küçük model 750 m³/h, en büyük modeller 5000 m³/h. [AVenS s.69]
* Kontrol paneli ile birlikte kullanılır. [AVenS s.69]

### Model tablosu (kaynaktan birebir)

| Kod | Model | Debi | Isıtıcı gücü (Kcal/h) 90/70 °C | Uygun model |
|---|---|---|---|---|
| 13050 | SULU BATARYA 7 KW KANAL TİPİ | 750 m³/h | 4700 | AVenS 750 |
| 13051 | SULU BATARYA 8 KW KANAL TİPİ | 1000 m³/h | 7000 | AVenS 1000 |
| 13052 | SULU BATARYA 11 KW KANAL TİPİ | 1500 m³/h | 11300 | AVenS 1500 |
| 13053 | SULU BATARYA 14 KW KANAL TİPİ | 2000 m³/h | 20700 | AVenS 2000 |
| 13054 | SULU BATARYA 20 KW KANAL TİPİ | 3000 m³/h | 33000 | AVenS 3000 |
| 13055 | SULU BATARYA 28 KW KANAL TİPİ | 4000 m³/h | 37400 | AVenS 4000 |
| 13056 | SULU BATARYA 36 KW KANAL TİPİ | 5000 m³/h | 42500 | AVenS 5000 |
| 13057 | SULU BATARYA 40 KW KANAL TİPİ | 5000 m³/h | 47300 | AVenS 5000 |

### Yapısal bloklar

**Gövde.** *Kaynakta karşılığı yok — boş.* Batarya gövdesi, boru/kanat malzemesi (bakır-alüminyum vb.),
sıra sayısı ve su bağlantı ölçüsü fiyat listesinde verilmemiştir.

**Çark.** *Bu ürün tipi için geçersiz.* Sulu batarya bir fan değildir; çarkı yoktur.

**Motor.** *Bu ürün tipi için geçersiz.* Bataryanın motoru yoktur.

**Koruma.** *Kaynakta karşılığı yok — boş.* Donma koruması, test basıncı ve IP sınıfı belirtilmemiştir.

**Kontrol.** Sulu bataryalar kontrol paneli ile birlikte kullanılır. [AVenS s.69]

**Montaj.** Model adları bataryayı **kanal tipi** olarak tanımlar. [AVenS s.69] Fiyat listesi bunun
ötesinde montaj yönü, servis boşluğu veya kanal bağlantı ölçüsü vermez — *o kısım boş.*

---

## 4 · İki aileyi ayıran cümle (paylaşık sayfanın çözümü)

> **Elektrikli ısıtıcı ile sulu batarya aynı işi yapar — havayı ısıtır — ama enerjiyi farklı yerden alır.** Elektrikli ısıtıcı ısıyı trifaze 380V 50Hz elektrikten üretir ve gücü doğrudan kW ile anılır; sulu batarya ısıyı 90/70 °C sıcak sudan alır ve kapasitesi Kcal/h ile verilir. [AVenS s.69]

İkisi de aynı AVenS cihaz ailesine (AVenS 750 – AVenS 5000) eşleştirilir ve ikisi de kontrol paneli ile
birlikte kullanılır; seçim ürünün kendisinde değil, **binada hazır bir sıcak su kaynağı olup olmadığında**
düğümlenir. [AVenS s.69] Vitrinde bu farkın görünmesi, iki aileyi ayıran yegâne şeydir — "ısıtıcı"
kelimesi tek başına ikisini de anlatır ve müşteriyi yanlış aileye götürür.

---

## 5 · AVenS Hız Anahtarları

**DB:** `avens-hiz-anahtarlari` · 2 ürün — AVenS 2,5 A HIZ ANAHTARI (kod 60006) · AVenS 5 A HIZ ANAHTARI
(kod 01801) · açıklama **BOŞ**

### Kimlik cümlesi
> AVenS fanlarının devrini ayarlamak için kullanılan, maksimum akım değerine göre iki boy sunulan hız anahtarı: 2,5 A ve 5 A. [AVenS s.27, 36]

### Maddeler
* AVenS 2,5 A hız anahtarı (kod 60006), dikdörtgen kanal tipi radyal fanlarda 1100 m³/h ile 2520 m³/h arası modellerin (AVENS 40x20, 50x25, 60x30) hız anahtarıdır. [AVenS s.27]
* AVenS 5 A hız anahtarı (kod 01801), 4100 m³/h ve 6000 m³/h modellerin (AVENS 60x35, 70x40) hız anahtarıdır. [AVenS s.27]
* Davlumbaz fanlarında da eşleşir: VORT QBK SAL KC EVO 315 M4 ve 355 M4 modellerinde (2540 m³/h ve 3540 m³/h) 2,5A, 400 M4 modelinde (5240 m³/h) 5A. [AVenS s.36]
* Hız anahtarının kapsadığı sınırın üstünde frekans konvertörüne geçilir; 7000 m³/h ve 9500 m³/h modellerde FC 101-1.5kW ve FC 101-2.2kW. [AVenS s.27]

### Model tablosu (kaynaktan birebir)

| Kod | Model | Maks. akım |
|---|---|---|
| 60006 | AVenS 2,5 A HIZ ANAHTARI | 2.5 A |
| 01801 | AVenS 5 A HIZ ANAHTARI | 5 A |

### Yapısal bloklar

**Gövde.** *Kaynakta karşılığı yok — boş.* Kutu malzemesi, ölçü ve renk verilmemiştir.

**Çark.** *Bu ürün tipi için geçersiz.* Hız anahtarı bir kumanda elemanıdır; çarkı yoktur.

**Motor.** *Bu ürün tipi için geçersiz.* Hız anahtarının motoru yoktur; ürün **kumanda ettiği fanın**
motoruna maksimum akım sınırı üzerinden bağlanır.

**Koruma.** *Kaynakta karşılığı yok — boş.* Sigorta/termik koruma, IP sınıfı ve EMC uygunluğu bu iki
ürün için fiyat listesinde belirtilmemiştir. (⚠ s.22–23'teki "sıva üstü montaj, sigorta korumalı,
minimum hız ayarı, On/Off anahtarı" tanımı **POT / POT-IT** hız anahtarlarına aittir, AVenS 2,5A/5A'ya
değil — taşınmadı; §6-3.)

**Kontrol.** Ürünün kendisi kontrol elemanıdır: fanın devrini ayarlar. Kaç kademe sunduğu ve ayar biçimi
(potansiyometre mi kademe anahtarı mı) **kaynakta yazmıyor** — *o kısım boş.*

**Montaj.** *Kaynakta karşılığı yok — boş.* Montaj biçimi (sıva üstü/altı) ve pano/duvar tipi
belirtilmemiştir.

### Seçim kuralı (kaynaktan türetilen tek cümle)
> Hız anahtarı fanın modeline göre eşleştirilir: kataloğun eşleşme sütunu 2520 m³/h modele kadar 2,5 A anahtarı, 6000 m³/h modele kadar 5 A anahtarı gösterir; üstünde frekans konvertörü yazar. [AVenS s.27]

---

## 6 · Kaynakta bulduklarım (K7.5 — hepsi kayıtta)

1. **Kaynakta birim hatası:** s.69 elektrikli ısıtıcı tablosunun "ISITICI GÜCÜ (kW)" sütununda son iki
   satır `15W` ve `18W` yazar; model adları `15 KW ELEKTRİKLİ ISITICI` ve `18 KW ELEKTRİKLİ ISITICI`'dır.
   Doğrusu **15 kW / 18 kW**. Taslakta model adı esas alındı, hatalı hücre **düzeltilmeden** kayda geçti.
2. **Sulu batarya Kcal/h dizisi doğrusal değil:** 7 kW→4700, 8 kW→7000, 11 kW→11300, **14 kW→20700**,
   20 kW→33000, 28 kW→37400, 36 kW→42500, 40 kW→47300. 14 kW satırındaki sıçrama (11300→20700) ve
   28 kW sonrası yavaşlama kaynakta böyledir. **Birebir aktarıldı, düzeltilmedi** — ama kW ile Kcal/h
   oranı satırdan satıra tutarsız olduğu için bu sütun **bağımsız doğrulama ister**; vitrinde bu
   sayılar tek tek gösterilecekse önce föyle karşılaştırılmalıdır.
3. **s.22–23'teki hız anahtarı tanımı bizim ürünümüzün değil:** "Sıva üstü montaj, sigorta korumalı,
   minimum hız ayarı, On/Off anahtarı" cümlesi **POT-IT (kod 12826) / POT (kod 12828)** ürünlerinin
   altındadır; AVenS 2,5A/5A ile ilgisi yoktur. LINEO taslağında bu cümle doğru yerde kullanılmıştı;
   **buraya taşınmadı.** Taşınsaydı doğru görünen bir uydurma olurdu.
4. **Aynı ürün iki farklı yazımla geçiyor:** `AVenS 2,5 A HIZ ANAHTARI` (s.27) ile `AVenS 2,5A HIZ
   ANAHTARI` / `AVENS 5A HIZ ANAHTARI` (s.36) — boşluk ve büyük harf farkı. Kodlar aynı (60006 / 01801),
   yani tek üründür. Otomatik eşleştirmede tuzak.
5. **Marka yazımı kararsız:** s.69 sulu batarya tablosunda "uygun model" hücreleri `AvenS 750` (küçük v),
   elektrikli ısıtıcı tablosunda `AVenS 750` biçimindedir.
6. **s.68 bağlamı (taslakta KULLANILMADI, kayıtta):** Elektrikli ısıtıcı, s.68'de ısı geri kazanım
   cihazlarının "ELEKTRİKLİ ISITICI (Opsiyonel)" sütunu olarak da geçer ve s.69'daki eşleşmeyle birebir
   tutarlıdır (750/1000→3kW, 1500/2000/2500→6kW, 3000/3500→9kW, 4000→12kW, 5000→15-18kW). Ayrıca s.68
   "AVenS Isı Geri Kazanım Cihazlarına Dijital Kontrol Panosu Fiyata Dahildir" der — s.69'daki "kontrol
   paneli"nin bu pano olduğu **ölçülmedi, varsayılmadı**. Emir s.69 ile sınırlıydı; s.68 taslakta
   referans olarak kullanılmadı, yalnız burada not edildi.

## 7 · Bu taslağın kapatmadığı (föy şart olan kalemler)

* **Elektrikli ısıtıcı:** rezistans tipi, gövde/kabin malzemesi, termik emniyet (aşırı ısınma
  termostatı), IP sınıfı, hava hızı alt sınırı ve kanal bağlantı ölçüsü — **hiçbiri kaynakta yok**.
* **Sulu batarya:** sıra sayısı, boru/kanat malzemesi, su bağlantı çapı, su ve hava tarafı basınç kaybı,
  test basıncı, donma koruması — **hiçbiri kaynakta yok**.
* **Hız anahtarı:** besleme gerilimi, kademe sayısı, ayar biçimi, montaj biçimi, kutu ölçüsü, IP sınıfı,
  minimum hız ayarı olup olmadığı — **hiçbiri kaynakta yok**. Bu ailenin altı bloğundan dördü tümüyle boş.
* **EN çevirisi yazılmadı** — bu tur TR. `description.en` ayrı tur ister.
* **`is_description_manual`** bugün her ailede `false`. Elle yazılan bu metin yüklenirse **true**
  yapılmalı; aksi halde bir sonraki otomatik tur ezer.
* **Ticari onay yok** — Recep/uzman turu.

## 8 · Kapı ölçümü ve sabotaj sınavı (2026-09-06)

`scripts/icerik-hatti/taslak-kaynak-kapisi.py <bu dosya> --ayrinti`

| Ölçüm | Sonuç |
|---|---|
| Durum | **YEŞİL** (çıkış kodu 0) |
| Doğrulanan iddia | 14 |
| Düşen | 0 |
| Ölçülemeyen (jeton taşımayan cümle) | 9 |
| Kapsama | **%61** |
| Referans sayısı | 23 (hepsi adlı, `[AVenS s.NN]`) |

**Sabotaj sınavı — kapı gerçekten ayırt ediyor mu?** Taslağın kopyasında iki sayı kasten bozuldu:
`4100 m³/h` → `4800 m³/h` (s.27'de geçmeyen debi) ve `18 kW` → `22 kW` (s.69'da geçmeyen güç).
Kapı **KIRMIZI** verdi, çıkış kodu 1, **her iki bozmayı da tek tek adlandırdı**:
"sayfada YOK: 22 kW" ve "sayfada YOK: 4800 m³/h". Yani bu dosyadaki yeşil, "bakmadım" yeşili değil.

**Kapının bu dosyada ölçülen kör noktası (yeni bulgu, 2026-09-06):** kaynak sayfada derece işareti
**U+00BA (masculine ordinal, `º`)** olarak geçiyor, taslakta doğru tipografi **U+00B0 (`°`)** kullanıldı.
Kapı bunu yine de **doğruladı** — ama tam eşleşmeyle değil, `bulundu()` içindeki *sayı-yalnız* geri
düşüşüyle: "70 °C" jetonu bulunamayınca yalnız "70" arandı ve sayfada bulundu. Sonuç bu satırda doğru,
**ama ölçüt zayıf**: aynı geri düşüş "70 °F" ya da "70 bar" yazsaydı da yeşil verirdi. **Birim hataları
bu kapıda görünmez.** (İlgili: `agrega-sayi-ters-gideni-gizler`, `olcut-keskin-ama-evren-yanlis`.)

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
