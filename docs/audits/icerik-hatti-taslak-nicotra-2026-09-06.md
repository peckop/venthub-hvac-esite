<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf -->
<!-- VARSAYILAN-KAYNAK: AVenS -->

# İçerik hattı — TR taslak: NICOTRA GEBHARDT DD · AT · ADH · RDH (REC-146 Adım 2b, radyal fan grubu)

**Şerit:** URUN-KATALOG · **Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır.
**Kaynak:** AVenS Ürün Fiyat Kataloğu 2026 (TR) — **DD s.52 · AT s.53 · ADH s.54 · RDH s.55**
**Referans biçimi:** `[AVenS s.NN]` = fiyat listesi (basılı sayfa numarası; PDF indeksi = NN−1)

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Kararlar — Katalog ve Ürün Verisi **K7.1** (satmadığımız varyantın metni yüklenmez) · **K7.5** (her tespit kayıtta).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Kalıp örneği: `docs/audits/icerik-hatti-taslak-lineo-2026-09-06.md`.

---

## 0 · Bu taslağın dürüst sınırı — ÖNCE OKU

Dört ailenin **tek** kaynağı var: AVenS 2026 fiyat listesinin **birer sayfası**. O sayfalarda
aile başına **bir tanım cümlesi + bir fiyat tablosu** vardır; başka anlatım yoktur. Bu yüzden
altı bloğun çoğu bu turda **BOŞ** kalmıştır. Boşluk bir eksiklik değil, **kaynağın gerçek
sınırıdır**: gövde malzemesi, koruma sınıfı, yalıtım sınıfı, sıcaklık dayanımı, montaj biçimi
ve sertifikalar bu dört ailenin sayfalarında **hiç geçmiyor** — oysa aynı katalogda komşu
ailelerde (NIMUS s.47, NIMAX s.48, ENKELFAN s.49, KENTALFAN s.50) tam bu bilgiler yazılıdır.
Yani boşluk bizim aramamızın değil, **kaynağın** eksiğidir.

**Sonuç (karar besleyen):** dört ailenin dördü de üreticiden **teknik föy** ister. Ayrıntı §8'de.

---

## 1 · Bugün DB'de ne var

| Aile | Ürün | `description.tr` | Kaynakta karşılığı |
|---|---|---|---|
| `nicotra-gebhardt-dd` | 13 | **BOŞ** | s.52 — 1 tanım cümlesi (iki alt seri için iki kez) + 14 satırlık tablo |
| `nicotra-gebhardt-at` | 8 | **BOŞ** | s.53 — 1 tanım cümlesi + 11 satırlık tablo |
| `nicotra-gebhardt-adh` | 8 | **BOŞ** | s.54 — 2 cümlelik tanım + 16 satırlık tablo |
| `nicotra-gebhardt-rdh` | 6 | **BOŞ** | s.55 — 2 cümlelik tanım + 16 satırlık tablo |

---

## 2 · DD SERİSİ — direkt akuple radyal fanlar

**DB:** `nicotra-gebhardt-dd` · 13 ürün · açıklama **BOŞ**

### Kimlik cümlesi

> NICOTRA Gebhardt DD serisi; düşük basınçlı, çift emişli, öne eğimli ve sık kanatlı,
> direkt akuple motorlu radyal fan ailesidir. [AVenS s.52]

### Maddeler

* Fiyat listesi ikiye ayırır: standart DD serisi ve 3 hızlı DD 3V serisi; ikisinin de tanım cümlesi aynıdır. [AVenS s.52]
* Motor gücü 147W ile 1500W arasındadır. [AVenS s.52]
* Debi 1550 m³/h ile 7880 m³/h arasındadır. [AVenS s.52]
* Model kodları tek fazlı ve üç fazlı, dört kutuplu ve altı kutuplu motor seçeneklerini birlikte kapsar. [AVenS s.52]

### Yapısal bloklar

**Gövde.** Fanlar çift emişlidir. [AVenS s.52]
*Gövde malzemesi, koruma sınıfı ve sıcaklık dayanımı bu sayfada yazmıyor — kaynakta karşılığı yok.*

**Çark.** Çark öne eğimli ve sık kanatlıdır. [AVenS s.52] Fan düşük basınç sınıfındadır. [AVenS s.52]

**Motor.** Motor doğrudan (direkt) akupledir; ayrı bir tahrik düzeni yoktur. [AVenS s.52]
Katalogdaki güç kademeleri 147W, 300W, 373W, 420W, 550W, 735W, 750W, 1100W ve 1500W değerleridir. [AVenS s.52]

**Koruma.** **Kaynakta karşılığı yok.** DD sayfasında koruma sınıfı, yalıtım sınıfı,
yangın/sıcaklık dayanımı veya sertifika bilgisi geçmiyor.

**Kontrol.** DD 3V alt serisi 3 hızlıdır. [AVenS s.52] Standart DD tablosundaki modeller 1V
olarak kodlanmıştır; aynı tabloda tek bir 2V kodlu model de vardır. [AVenS s.52]

**Montaj.** **Kaynakta karşılığı yok.** Montaj biçimi, bağlantı ve uygulama alanı listesi
DD sayfasında yer almıyor.

---

## 3 · AT SERİSİ — çift emişli radyal fanlar

**DB:** `nicotra-gebhardt-at` · 8 ürün · açıklama **BOŞ**

### Kimlik cümlesi

> NICOTRA Gebhardt AT serisi; düşük basınçlı, kayış kasnak tahrikli, öne eğimli ve sık
> kanatlı çift emişli radyal fan ailesidir. [AVenS s.53]

### Maddeler

* Tahrik kayış kasnaklıdır; motor fana doğrudan akuple değildir. [AVenS s.53]
* Debi 2300 m³/h ile 18200 m³/h arasındadır. [AVenS s.53]
* Fiyat listesinde model adı yalnız çark ölçüsünü verir; motor gücü, devir ve faz bilgisi tabloda yer almaz. [AVenS s.53]

### Yapısal bloklar

**Gövde.** Fanlar çift emişlidir. [AVenS s.53]
*Gövde malzemesi ve koruma sınıfı bu sayfada yazmıyor — kaynakta karşılığı yok.*

**Çark.** Çark öne eğimli ve sık kanatlıdır. [AVenS s.53] Fan düşük basınç sınıfındadır. [AVenS s.53]

**Motor.** Kayış kasnak tahriklidir. [AVenS s.53] Motor bir katalog kalemi olarak
listelenmediği için güç, devir, kutup ve faz bilgisi **kaynakta yok**.

**Koruma.** **Kaynakta karşılığı yok.**

**Kontrol.** **Kaynakta karşılığı yok.** Hız kademesi ve kontrol donanımı AT sayfasında
geçmiyor. Tahrik kayış kasnak olduğu için hızın kasnak oranıyla belirlendiği **çıkarımı
kaynakta yazılı değildir ve taslağa alınmamıştır.**

**Montaj.** **Kaynakta karşılığı yok.**

---

## 4 · ADH SERİSİ — sık kanatlı çift emişli radyal fanlar

**DB:** `nicotra-gebhardt-adh` · 8 ürün · açıklama **BOŞ**

### Kimlik cümlesi

> NICOTRA Gebhardt ADH serisi; öne eğimli, sık kanatlı, kayış kasnak tahrikli çift emişli
> radyal fandır. Endüstriyel tip taze hava ve egzoz uygulamaları için özel olarak dizayn
> edilmiştir. [AVenS s.54]

### Maddeler

* Endüstriyel tip taze hava ve egzoz uygulamaları için özel olarak tasarlanmıştır. [AVenS s.54]
* Sattığımız aralığın alt ucu ADH-200 E2 modelinde 9800 m³/h debidir. [AVenS s.54]
* Aralığın üst ucu ADH-1000-K modelinde 216000 m³/h değerine çıkar. [AVenS s.54]
* Katalogdaki en büyük E2 gövdesi ADH-560 E2 modelidir ve 66100 m³/h verir. [AVenS s.54]
* Katalog gövde büyüklüğüne göre üç kod eki kullanır: E2, -R ve -K. [AVenS s.54]

### Yapısal bloklar

**Gövde.** Fanlar çift emişlidir. [AVenS s.54] Model kodundaki E2, -R ve -K ekleri farklı
gövde büyüklüğü gruplarını ayırır; **bu eklerin anlamı kaynakta açıklanmıyor.** [AVenS s.54]

**Çark.** Çark öne eğimli ve sık kanatlıdır. [AVenS s.54]

**Motor.** Kayış kasnak tahriklidir. [AVenS s.54] Motor verisi **kaynakta yok**.

**Koruma.** **Kaynakta karşılığı yok.**

**Kontrol.** **Kaynakta karşılığı yok.**

**Montaj.** **Kaynakta karşılığı yok.** Kaynakta yalnız kullanım amacı — endüstriyel taze hava
ve egzoz — yazılıdır, montaj biçimi değil. [AVenS s.54]

---

## 5 · RDH SERİSİ — seyrek kanatlı çift emişli radyal fanlar

**DB:** `nicotra-gebhardt-rdh` · 6 ürün · açıklama **BOŞ**

### Kimlik cümlesi

> NICOTRA Gebhardt RDH serisi; geriye eğimli, seyrek kanatlı, kayış kasnak tahrikli çift
> emişli radyal fandır. Ticari ve endüstriyel sistemlerde taze hava ve egzoz uygulamaları
> için özel olarak dizayn edilmiştir. [AVenS s.55]

### Maddeler

* Ticari **ve** endüstriyel sistemlerde taze hava ve egzoz uygulamaları için tasarlanmıştır. [AVenS s.55]
* Çark geriye eğimli ve seyrek kanatlıdır; kataloğun bu bölümündeki tek geriye eğimli radyal fan ailesidir. [AVenS s.55]
* Sattığımız aralığın alt ucu RDH-180 E2 modelinde 2900 m³/h debidir. [AVenS s.55]
* Aralığın üst ucu RDH-500 E2 modelinde 25500 m³/h değerindedir. [AVenS s.55]

### Yapısal bloklar

**Gövde.** Fanlar çift emişlidir. [AVenS s.55] Model kodundaki E2, -R ve -K ekleri ADH ile
aynı biçimde kullanılır; anlamları **kaynakta açıklanmıyor.** [AVenS s.55]

**Çark.** Çark geriye eğimli ve seyrek kanatlıdır. [AVenS s.55]

**Motor.** Kayış kasnak tahriklidir. [AVenS s.55] Motor verisi **kaynakta yok**.

**Koruma.** **Kaynakta karşılığı yok.**

**Kontrol.** **Kaynakta karşılığı yok.**

**Montaj.** **Kaynakta karşılığı yok.**

---

## 6 · Dört aileyi ayıran karşılaştırma

Kaynak dört aileyi **dört ayrı bölüm başlığı** altında verir; ayrım tam da bu başlıklarda ve
tek tanım cümlesindedir.

| | DD | AT | ADH | RDH |
|---|---|---|---|---|
| Kaynak sayfası | s.52 | s.53 | s.54 | s.55 |
| Bölüm başlığı | Direkt akuple radyal fanlar | Radyal fanlar | Sık kanatlı radyal fanlar | Seyrek kanatlı radyal fanlar |
| Tahrik | direkt akuple motor | kayış kasnak | kayış kasnak | kayış kasnak |
| Kanat yönü | öne eğimli | öne eğimli | öne eğimli | **geriye eğimli** |
| Kanat sıklığı | sık | sık | sık | **seyrek** |
| Emiş | çift | çift | çift | çift |
| Basınç sınıfı (kaynakta yazılı) | düşük | düşük | yazmıyor | yazmıyor |
| Beyan edilen kullanım | yazmıyor | yazmıyor | endüstriyel taze hava/egzoz | ticari + endüstriyel taze hava/egzoz |
| DB debi aralığı | 1550–7880 m³/h | 2300–18200 m³/h | 9800–216000 m³/h | 2900–25500 m³/h |

### Ayıran cümleler

> **DD, dördü içinde motoru üzerinde gelen tek ailedir.** DD direkt akuple motorludur; AT, ADH
> ve RDH kayış kasnak tahriklidir — bu üçünde motor ve devir seçimi projeye bırakılır. [AVenS s.52, 53]

> **DD ile AT aynı çarkı, farklı tahriki tarifler.** İkisi de düşük basınçlı, çift emişli, öne
> eğimli ve sık kanatlıdır; tanım cümlelerindeki tek fark tahrik biçimidir. [AVenS s.52, 53]
> Kapasite farkı buradan doğar: DD 7880 m³/h değerinde biterken AT 18200 m³/h değerine çıkar. [AVenS s.52, 53]

> **AT ile ADH aynı çark ailesinin iki ölçek basamağıdır.** İkisi de öne eğimli, sık kanatlı,
> kayış kasnak tahrikli çift emişli radyal fandır; ADH'yi ayıran, kaynakta açıkça yazılan
> **endüstriyel taze hava ve egzoz** hedefi ile çok daha geniş gövde aralığıdır. [AVenS s.53, 54]

> **RDH, dördü içinde tek geriye eğimli seyrek kanatlı ailedir** ve kaynakta hedefi **ticari
> ve endüstriyel** diye ikili tanımlanan tek ailedir. [AVenS s.55] Aynı gövde numarasında
> ADH'den belirgin biçimde düşük debi verir: ADH-200 E2 9800 m³/h iken RDH-200 E2 3500 m³/h değerindedir. [AVenS s.54, 55]

### Vitrinde hangi soru hangi aileye götürür

* Motoruyla birlikte gelen, düşük basınçlı, çift emişli fan → **DD**. [AVenS s.52]
* Aynı fan tipini kendi motor ve kasnak seçimiyle, daha yüksek debide → **AT**. [AVenS s.53]
* Endüstriyel taze hava ve egzoz, büyük gövde, yüksek debi → **ADH**. [AVenS s.54]
* Ticari veya endüstriyel sistemde geriye eğimli çark → **RDH**. [AVenS s.55]

---

## 7 · Kaynakta bulduklarım (K7.5 — hepsi kayıtta)

1. **24 blok hücresinden 11'i boş kaldı.** Aile başına ölçüm §8'de. Sebep tek: AVenS fiyat
   listesi bu dört ailede **teknik anlatım vermiyor**, yalnız tanım cümlesi ve fiyat tablosu
   veriyor. Aynı katalogda NIMUS (s.47), NIMAX (s.48), ENKELFAN (s.49) ve KENTALFAN (s.50)
   ailelerinde koruma sınıfı, yalıtım sınıfı ve sıcaklık dayanımı **yazılı** — yani bu boşluk
   kataloğun genel üslubu değil, bu dört sayfaya özgü.
2. **DB ürün sayısı ile katalog satır sayısı tutmuyor** (satmadığımız modeller, K7.1):
   * DD: katalogda **14** satır, DB'de **13** ürün. Hangi satırın DB'de olmadığı **ölçülmedi** —
     DB tarafı bu turda sorgulanmadı, uydurulmadı.
   * AT: katalogda **11** model; DB listesinde olmayanlar **AT 12/12, AT 15/11, AT 18/18**.
   * ADH: katalogda **16** model; DB listesinde olmayanlar **ADH-180, -250, -280, -315 E2 ve
     ADH-630-R, -710-R, -800-K, -900-K**.
   * RDH: katalogda **16** model; DB listesinde olmayanlar **RDH-315, -355, -400, -450, -560 E2 ve
     RDH-630-R, -710-R, -800-K, -900-K, -1000-K**.
   Bu modellerin metni **yazılmadı** — bugün satmıyoruz; vaat bütünlüğü satmadığımız ürünün
   anlatımını yasaklar.
3. **RDH ürün seçkisinde boşluk var.** DB'deki RDH ailesi 180/200/225/250/280 boylarını ardışık
   kapsıyor, sonra dört boy atlayıp **500**'e sıçrıyor. Katalogda 315/355/400/450 boyları mevcut.
   Bu bir veri hatası mı yoksa ticari seçim mi — **ölçülmedi**, denetim kalemi olarak bırakıldı.
4. **DD tablosunda kod tutarsızlığı:** tek hızlı tabloda listelenen `11921 DD 12/12 1500W 3F 4P 2V`
   kalemi iki hızlı (2V) kodlu ve yanında çift yıldız dipnot işareti var; sayfada bu dipnotun
   karşılığı **basılmamış**. Yıldızın ne anlattığı bilinmiyor.
5. **s.53'te aileye ait olmayan bir görsel bloğu var:** "DD Model · DDMP Model · RLM 50 Model ·
   RLM EVO Model" ve altında "Bu modellerin fiyatları için iletişime geçiniz." notu. AT sayfasında
   duruyor ama AT ailesini anlatmıyor; **DDMP, RLM 50 ve RLM EVO** dört ailemizde yok.
   Taslağa alınmadı.
6. **Debi aralıkları kaynakta doğrulandı; canlı-veritabanı işaretine gerek kalmadı.** Dördünün de DB
   alt/üst ucu ilgili sayfadaki tabloda birebir bulundu — ADH'nin geniş aralığı dahil
   (ADH-200 E2 alt uç, ADH-1000-K üst uç).
7. **Basılı sayfa numarası ile PDF indeksi bir kaymalı** (basılı s.52 = PDF sayfa 51). Referanslar
   **basılı** numarayı kullanır; kapı da basılı numarayla ölçer.

## 8 · Aile başına ölçüm (rapor kalemi)

| Aile | Kaynakta bulunan anlatım cümlesi | Dolan blok | Boş blok | Boş kalanlar |
|---|---|---|---|---|
| DD | 2 (aynı tanım cümlesi iki alt seri için) + "3 HIZLI" etiketi | 4 | 2 | Koruma, Montaj |
| AT | 1 | 3 | 3 | Koruma, Kontrol, Montaj |
| ADH | 2 | 3 | 3 | Koruma, Kontrol, Montaj |
| RDH | 2 | 3 | 3 | Koruma, Kontrol, Montaj |

**Föy ihtiyacı (karar besleyen sonuç):** dördü de üreticiden teknik föy ister. Öncelik sırası
**AT > RDH > ADH > DD**. AT kaynakta tek cümleyle geçiyor ve motor verisi hiç yok; AT, ADH ve
RDH'de koruma, kontrol ve montaj bloklarının üçü de tamamen boş (aile başına 3/6 hücre); DD ise
en azından motor gücü ve hız kademesi taşıyor (2/6 boş).
İstenecek asgari kalemler: gövde malzemesi, koruma sınıfı, yalıtım sınıfı, çalışma sıcaklık
aralığı, montaj biçimi, sertifikalar ve kayış kasnak ailelerinde motor/kasnak seçim tablosu.

## 9 · Bu taslağın kapatmadığı

* **EN çevirisi yazılmadı** — bu tur TR.
* **Fiyat ve stok yazılmadı** (K1). Katalogdaki Euro sütunu taslağa hiç girmedi.
* **Ses, devir ve basınç eğrisi yok** — bu dört sayfada zaten yayımlanmamış.
* **Web araştırması yapılmadı** — bu turun kapsamı dışı, ayrı iş olarak planlandı.
* **`is_description_manual`** yüklemede **true** yapılmalı; aksi halde sonraki otomatik tur ezer.
* **Ticari onay yok** — Recep/uzman turu.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
