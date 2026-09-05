# İçerik hattı — sessiz boşluk taraması ve ÖNCEKİ SAYILARIMIN DÜZELTİLMESİ

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** Recep, 2026-09-05 (Kararlar—Katalog ve Ürün Verisi **K7.4/K7.5**)
**Kapsam:** salt okuma · kod yok · prod yok · DB'ye yazma yok · sayılar betikten (PyMuPDF)
**Girdi:** 24 kaynak PDF + canlı DB `products` (40 aile, 375 ürün model adı)

## KAYNAK / CETVEL

* Kararlar — Katalog ve Ürün Verisi **K7.4** ("sessiz boşluklar tespit edilir, doldurulabiliyorsa doldurulur
  ama **önce raporlanır**") ve **K7.5** ("her şey kesinlikle kayıt altında olacak… sonra geri dönüp
  gelecekte bu neymiş dememeliyiz").
* `docs/standards/vaat-butunlugu-standard.md` — uydurma yok.
* Önceki adımlar: `icerik-hatti-pdf-yapisi-…` (Adım 1) · `…-sayfa-araliklari-…` (1b) · `…-bolum-aile-eslemesi-…` (2a).

---

## 0 · BAŞLIK: sessiz boşluk **yok**, ama benim önceki sayım **yanlıştı**

Adım 1'de "21 ailenin kaynağı yok, bunların 12'sinde elde **hiçbir metin** yok" yazmıştım.
**Bu yanlış.** Ölçüm düzeltildi:

| | Aile |
|---|---|
| Model kodu en az bir PDF'te geçen | **40 / 40** |
| **AVenS fiyat listesinde TÜRKÇE anlatımı olan** | **36 / 40** |
| Kalan 4'ün Vortice kataloğunda (EN) anlatımı olan | **4 / 4** |
| **Gerçekten kaynaksız aile** | **0** |

Yani içerik hattının önündeki engel "malzeme yok" değil, "malzeme dağınık ve bir kısmı İngilizce".
Bu, işin **büyüklüğünü küçültür**, cinsini değiştirmez.

---

## 1 · Ölçütüm dört kez yanıldı — dördü de yayımlanmadan yakalandı

K7.5 gereği hatanın kendisi de kayıttır. Dördü de **aynı sınıf**: ölçüt keskindi, **evren yanlıştı**.

| # | Yanlış ölçüt | Verdiği sonuç | Gerçek | Nasıl yakalandı |
|---|---|---|---|---|
| 1 | Seri kodu taraması (Adım 1) | `AT` kodu 22 PDF'te "eşleşti" | Hepsi İngilizce *at* kelimesi | Marka hizası kontrolü |
| 2 | Klasör adı slug içinde geçiyor mu (Adım 1) | 22/40 aile "kaynaklı" | Marka klasörü `vortice` her slug'a uyuyordu; doğrusu 19 | Sonucu okuyunca saçmalık göründü |
| 3 | Ad listesiyle bölüm arama (Adım 1b) | 168 sayfada 4 bölüm | Ad listesi kapalı küme; yapısal desenle 19 bölüm | Sayfa başlıklarını **okudum** |
| 4 | **Model jetonu + madde işareti (bu adım)** | 3 aile "kaynaksız", anlatım "6 sayfada 13 madde" | **0 aile kaynaksız**, anlatım **61 sayfada** | Üç "boşluğun" üçünü de tek tek açtım |

**4 numaralı hata en pahalısıydı** çünkü **eyleme dönüşmüştü**: Adım 1 raporunda "12 aile için üreticiden
metin toplanmalı" yazdım, OPS Linear'a taşıdı, Recep'e "kaynağımız yok" diye sunuldu. Gerçekte kaynak
elimizdeydi — 74 sayfalık AVenS kataloğunun içinde.

**Ders (cetvele önerilir):** *bir şeyin YOK olduğunu iddia etmek, VAR olduğunu iddia etmekten daha ağır
kanıt ister.* "Bulamadım" ile "yok" farklı cümlelerdir; ilkini yazıp ikincisini kastettim.

---

## 2 · Üç "boşluk" tek tek açıldı — üçü de ölçüm hatası

### 2.1 Radon (kanal + çatı) — kaynak VAR, üstelik ayrımıyla birlikte

Model jetonum `CA-RM 100 ES` idi; katalog kodu bir kez yazıp çapları ayrı listeliyor.
Gerçek metin, `2022-11-en-ca-rm-es-radon.pdf`:

* **s.23** — `VORT CA RM ES DUCT EXHAUST FAN`, çaplar 100/125/150/160/200 mm, IPX7 su geçirmez, elektronik
  kontrollü fırçasız motor, kontrol paneliyle birleştirilebilir, seri montaj mümkün → **kanal ailesi**
* **s.24** — `VORT CA RM RF ES ROOFTOP SUCTION UNIT`, çaplar 150/160/200 mm, IP45, dış mekân montajına uygun
  → **çatı ailesi**

> **Yan kazanç:** Adım 2a'da "insan kararı" diye bıraktığım *"tek bölüm iki aileyi kapsıyor, sınır hangi
> sayfada belli değil"* kalemi **bununla kapandı**: sınır s.23 / s.24.
> **9 insan kararından biri düştü, 8 kaldı.**

### 2.2 BRA.VO S — kaynak VAR, üstelik iki tane

`vort-hr-w-all-100-df.pdf` içinde dört model de geçiyor: "BRA.VO S1/S2/S3/S4 — wireless remote sensor for
monitoring temperature…". Kendi tek sayfalık föyü de anlatım taşıyor:
"It is an air quality meter, capable to detect the presence of pollutants… integrates with all VORTICE IoT
mechanical heat recovery units. There are four models available which differ according to the type of
pollutants detected."

> **Bu bir üründen fazlası: sınıflandırma hatası.** BRA.VO **fan değil, hava kalitesi sensörü**.
> Adım 1'de bu dosyayı "1 sayfa, 272 karakter, dil veri yok, 0/6 blok" diye **neredeyse boş** göstermiştim;
> aslında ailenin kimlik cümlesi tam olarak orada duruyor.

### 2.3 AVenS Elektrikli Kanal Isıtıcıları — kaynak VAR (ince)

Fiyat listesi **s.69**: `ELEKTRİKLİ ISITICILAR — Trifaze 380V, 50Hz.` +
"Elektrikli ısıtıcı kontrol paneli ile birlikte kullanılır."
Jetonum `12 kW Elektrikli Isıtıcı` idi; katalog gücü tabloda ayrı kolonda veriyor.
**Anlatım var ama zayıf** — iki cümle. Altı bloktan yalnız Motor/Kontrol'e malzeme verir.

---

## 3 · 40 ailenin anlatım kaynağı (ölçülmüş)

**36 aile — AVenS fiyat listesinde Türkçe anlatım** (sayfa numaralarıyla):

| Marka | Aile | TR anlatım sayfası |
|---|---|---|
| AVenS | BVU Sığınak Havalandırma Üniteleri · BVU-LS Kurşun Seperatör | 56 |
| AVenS | Hız Anahtarları | 27, 36 |
| AVenS | Hücreli Aspiratörler HF/FW · HF/S | 28 |
| AVenS | Isı Geri Kazanım Cihazları | 68 |
| AVenS | Plug Fanlar (KENTALFAN) | 50, 51 |
| AVenS | Sulu Batarya Kanal Tipi | 69 |
| AVenS | Elektrikli Kanal Isıtıcıları | 69 *(ince)* |
| Danfoss | FC 101 · FC 102 · FC 51 | 58 · 59 · 34, 36 |
| Nicotra Gebhardt | DD · AT · ADH · RDH | 52 · 53 · 54 · 55 |
| SEAT | SEAT · STORM · JET | 41, 44 · 42, 45 · 43, 45 |
| Vortice | Hava perdesi (AD) · H AD elektrikli | 64 |
| Vortice | VORT HR ısı geri kazanım · VORT Mono | 67 · 66 |
| Vortice | Lineo · Lineo Quiet | 22–25 · 22, 23 |
| Vortice | Punto Evo / Flexo | 10 |
| Vortice | Commercial In-Line yuvarlak · dikdörtgen | 25, 32 · 26 |
| Vortice | VORT-E ATEX · Aksiyel Endüstriyel | 38 · 30, 31, 38 |
| Vortice | Slimroof · Heatmaster | 33 · 34 |
| Vortice | TIRACAMINO | 29 |
| Vortice | Nordik HVLS · QBK SAL KC Evo · Quadro Evo | 62 · 36 · 20 |

**4 aile — yalnız Vortice kataloğunda (İngilizce), çeviri gerekir:**
Deumido (`DEUMIDO RANGE`, 12 sayfa) · Radon kanal (s.23) · Radon çatı (s.24) · BRA.VO S (iki kaynak).

---

## 4 · TIRACAMINO: düzeltilmiş hüküm

Adım 2a'da "klasör düzeyinde kaynağı var görünüyor ama bölüm düzeyinde yok — fiilen kaynaksız" demiştim.
**Yarısı doğru, sonucu yanlıştı.** Doğrusu:

* Vortice `industrial_Ventilation.pdf` içinde TIRACAMINO bölümü **gerçekten yok** (oradaki 5 `TORRETTE …`
  bölümü çatı fanı) — bu tespit **ayakta**.
* Ama **AVenS fiyat listesi s.29** "ŞÖMİNE VE BACA FANLARI / TIRACAMINO" başlığıyla Türkçe anlatım taşıyor.
* **Sonuç: TIRACAMINO kaynaksız DEĞİL, kaynağı başka dosyada.**

Genelleme: *bir dosyada bölüm bulunamaması, o ailenin kaynaksız olduğunu göstermez* — **tüm evren taranmalı.**

---

## 5 · Bu ölçümün Adım 2b'ye etkisi

1. **Çeviri yükü sandığımdan küçük.** 40 ailenin 36'sı Türkçe kaynaklı. Çeviri yalnız 4 ailede zorunlu.
2. **Üretici sitesinden veri çekme (K7.3) şu an ZORUNLU DEĞİL.** Elde kaynağı olmayan aile yok. Web araştırması
   **derinleştirme** için değerli (Çark ve Kontrol blokları kaynakta hâlâ zayıf), **boşluk kapatma** için değil.
   Öncelik sırasında geriye alınmasını öneriyoruz.
3. **İnsan kararı bekleyen kalem 9 → 8** (radon sınırı ölçümle çözüldü).
4. **Yeni ölçüm borcu:** 36 ailenin TR anlatımı ne kadar *derin*? Bu rapor **varlık** ölçtü, **yeterlilik**
   ölçmedi. Bazı sayfalarda tek cümle var (elektrikli ısıtıcı), bazılarında dört madde (SEAT). Adım 2b'nin
   ilk işi bu derinlik ölçümü olmalı — yoksa "kaynak var" deyip iki kelimelik anlatımla sayfa açarız.

## 6 · Ölçülemeyenler (uydurulmadı)

* Anlatım **derinliği** ölçülmedi (§5.4).
* Fiyat listesindeki anlatımların **güncelliği** doğrulanmadı (2026 baskısı, ürün revizyonu olabilir).
* Vortice kataloglarındaki EN anlatımların aile başına **tam sayfa aralığı** yalnız 15 PDF için çıkarıldı
  (Adım 1b); kalan 9 PDF tek aileli olduğu için aralık = tüm belge kabul edildi, **doğrulanmadı**.
* AVenS kataloğundaki **fiyat ve tablo doğruluğu** kapsam dışı.
* Kaynak hataları ayrı belgede: `icerik-hatti-avens-katalog-hatalari-2026-09-05.md` (K7.6, Recep AVenS'e iletecek).

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-05
