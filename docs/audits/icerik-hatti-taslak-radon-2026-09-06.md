<!-- KAYNAK-HARITASI: RAD=2022-11-en-ca-rm-es-radon.pdf -->

# İçerik hattı — TR taslak: VORTICE RADON serisi (KANAL + ÇATI)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** REC-146 Adım 2b — aile grubu "radon"
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır. Bu dosya kaynak/kanıt kaydıdır.

**Kaynak:** `2022-11-en-ca-rm-es-radon.pdf` (EN, 42 sayfa) — bölüm **THE RADON-SPECIFIC VORTICE RANGE**, s.23–25.
Yol: `~/venthub-pdf-ingestor/venthub/markalar/vortice/konut-fanlari/radon-range/01-input/`

**Referans biçimi:**

* `[RAD s.NN]` = yukarıdaki PDF'in NN numaralı sayfası (1-tabanlı, PyMuPDF okuması).
* `[DB]` = bugünkü Supabase ürün verisinden gelen sayı (aile/ürün/debi sayımı). **PDF'te yoktur** —
  bu yüzden PDF sayfasına referans verilmez; kaynağı açıkça DB'dir.

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Kararlar — Katalog ve Ürün Verisi **K7.2** (çeviri serbest) · **K7.5** (her tespit kayıtta).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Kalıp örneği: `docs/audits/icerik-hatti-taslak-lineo-2026-09-06.md`.
* **Sağlık sınırı (bu ailede özel):** Kaynak s.7–9 radon–akciğer kanseri epidemiyolojisini anlatır.
  Bu taslak o cümlelerin **hiçbirini vitrine taşımaz**. Vitrinde yalnız kaynağın söylediği
  **teknik işlev** vardır: radon yüklü havayı çekip dışarı atmak.

---

## 0 · Bu iki aile niçin birlikte yazıldı

Kaynakta bu iki ailenin tarifi **art arda iki sayfada** durur ve ikisi de aynı başlığı taşır:
**THE RADON-SPECIFIC VORTICE RANGE**. Aynı seri, aynı motor teknolojisi, aynı kumanda paneli.
Ayrı ayrı yazılsalardı ikisi de "radon tahliyesi için fırçasız motorlu fan" diye başlayacak ve
vitrinde **iki ayrı ürün ailesi tek cümleyle** çıkacaktı. Ayıran şey ancak yan yana konunca
görünür: **nereye monte edildiği** ve buna bağlı **koruma sınıfı** (§4).

### Aile sınırı — nerede bulundu (doğrulandı)

| Sayfa | Başlık (kaynakta birebir) | Aile |
|---|---|---|
| s.23 | `VORT CA RM ES` — "Duct exhaust fan" | **KANAL** → `vortice-radon-range-circular` |
| s.24 | `VORT CA RM RF ES` — "Rooftop suction unit" | **ÇATI** → `vortice-radon-range-roof` |
| s.25 | `SICURBOX remote control panel (optional)` | **her iki aileye ortak** aksesuar |

Önceki ölçümün bulduğu sınır **doğrulandı**: iki aile ayrı sayfalarda, ayrı çap kümesi ve ayrı
koruma sınıfıyla tarif edilmiş. Kaynakta bu iki sayfa dışında ürün tarifi **yoktur** (s.1–22 radon
olgusu ve havalandırma stratejileri, s.26–41 saha uygulama örnekleri, s.42 kapak).

---

## 1 · Bugün DB'de ne var (verilen ölçüm, 2026-09-06)

| Aile | Ürün | Modeller | Debi | Faz | Bugünkü `description.tr` |
|---|---|---|---|---|---|
| `vortice-radon-range-circular` | 5 | CA-RM 100/125/150/160/200 ES | 350–1210 m³/h | 5 monofaze | 1 cümle, blok yok |
| `vortice-radon-range-roof` | 3 | CA-RM 150/160/200 RF ES | 775–985 m³/h | 3 monofaze | 1 cümle, blok yok |

Mevcut iki cümle korunmuyor **değil**, düzeltiliyor: çatı metnindeki koruma sınıfı kaynakla
çelişiyor (§6.1). Kanal metnindeki IPX7 kaynakla **birebir uyuşuyor**.

---

## 2 · VORT CA-RM ES — KANAL tipi (`vortice-radon-range-circular`)

**DB:** 5 ürün · CA-RM 100 / 125 / 150 / 160 / 200 ES · hepsi monofaze [DB]

### Kimlik cümlesi

> Vortice'nin radona özel ürün ailesinin kanal tipi üyesi: radon yüklü havayı kanal içinden çekip
> dışarı atmak için tasarlanmış kanal tipi egzoz fanı. [RAD s.23]

### Dört madde

* Kanal tipi egzoz fanı — radona özel Vortice ürün ailesinin parçası [RAD s.23]
* Anma çapları 100-125-150-160-200 mm [RAD s.23]
* IPX7 — suya daldırmaya karşı sızdırmaz koruma [RAD s.23]
* Elektronik kontrollü fırçasız motor; kendine ait kumanda paneliyle birlikte kullanılabilir [RAD s.23]

Debi aralığı 350–1210 m³/h; beş model, hepsi monofaze [DB]

### Yapısal bloklar

**Gövde.** **Kaynakta karşılığı yok.** Bu kaynak, ürünün gövde malzemesini, yapısını veya üretim
biçimini tarif etmiyor; ürün sayfasında yalnız tip, çap, koruma sınıfı, motor ve montaj bilgisi
veriliyor [RAD s.23]. Gövde anlatımı, ürünün kendi teknik föyü/kataloğu bulunmadan yazılmaz.

**Çark.** **Kaynakta karşılığı yok.** Bu kaynak CA-RM ES'in çark tipini (radyal / eksenel / karma
akışlı) hiçbir yerde söylemiyor. Bugünkü DB metnindeki "radyal fan" ifadesi bu kaynaktan
**doğrulanamıyor** (§6.2).

**Motor.** Elektronik kontrollü fırçasız (brushless) motor kullanılır. [RAD s.23]

**Koruma.** IPX7 koruma sınıfı — suya daldırmaya karşı sızdırmaz. [RAD s.23] Bu koruma seviyesi,
ailenin kanal içi ve radon kuyusu içi yerleşimiyle uyumludur. [RAD s.20]

**Kontrol.** Ürün, kendisi için tanımlanmış kumanda paneliyle birlikte kullanılabilir. [RAD s.23]
Opsiyonel **SICURBOX** uzaktan kumanda paneli şunları sağlar: LCD ekran; iki fanın birbirinden
bağımsız performans kontrolü; fanların güç kontrolü; fanın düzenli çalışmasının izlenmesi;
çekilen debinin doğru kontrolü (akış anahtarı ayrıca temin edilir); haftalık zaman dilimleriyle
programlı çalışma; çalışma hatalarının sesli ve görsel bildirimi; harici alarm sirenlerine
bağlantı imkânı. [RAD s.25]

**Montaj.** Kanal içine monte edilir ve **seri (ard arda) montaja** imkân verir. [RAD s.23]
Uygulama örneklerinde CA-RM ES tipi fanlar radon kuyusunun içine de yerleştirilebilir. [RAD s.20]

---

## 3 · VORT CA-RM RF ES — ÇATI tipi (`vortice-radon-range-roof`)

**DB:** 3 ürün · CA-RM 150 / 160 / 200 RF ES · hepsi monofaze [DB]

### Kimlik cümlesi

> Vortice'nin radona özel ürün ailesinin çatı tipi üyesi: dış ortama, çatı üzerine monte edilen
> emiş (aspiratör) ünitesi. [RAD s.24]

### Dört madde

* Çatı tipi emiş ünitesi — radona özel Vortice ürün ailesinin parçası [RAD s.24]
* Anma çapları 150-160-200 mm [RAD s.24]
* IP45 — dış ortam montajına uygun koruma [RAD s.24]
* Elektronik kontrollü fırçasız motor; kendine ait kumanda paneliyle birlikte kullanılabilir [RAD s.24]

Debi aralığı 775–985 m³/h; üç model, hepsi monofaze [DB]

### Yapısal bloklar

**Gövde.** **Kaynakta karşılığı yok.** Kaynak yalnız ünitenin tipini, çap kümesini, koruma sınıfını
ve motor teknolojisini veriyor; gövde malzemesi ya da yapısı tarif edilmiyor [RAD s.24].

**Çark.** **Kaynakta karşılığı yok.** Kaynak CA-RM RF ES'in çark tipini söylemiyor; bugünkü DB
metnindeki "radyal fan" ifadesi bu kaynaktan doğrulanamıyor (§6.2).

**Motor.** Elektronik kontrollü fırçasız (brushless) motor kullanılır. [RAD s.24]

**Koruma.** IP45 koruma sınıfı — dış ortam montajına uygundur. [RAD s.24]

**Kontrol.** Ürün, kendisi için tanımlanmış kumanda paneliyle birlikte kullanılabilir. [RAD s.24]
Opsiyonel **SICURBOX** uzaktan kumanda paneli kanal tipiyle ortaktır: LCD ekran; iki fanın bağımsız
performans kontrolü; güç kontrolü; düzenli çalışmanın izlenmesi; çekilen debinin doğru kontrolü
(akış anahtarı ayrıca temin edilir); haftalık programlama; hataların sesli ve görsel bildirimi;
harici alarm sirenine bağlantı. [RAD s.25]

**Montaj.** Dış ortama monte edilecek biçimde tasarlanmıştır. [RAD s.24] Uygulama örneklerinde
CA-RM RF ES tipi fanlar, saçak/çatı üzerinden atış yapan bir kanalın **ucuna** yerleştirilir. [RAD s.17]

---

## 4 · İki aileyi ayıran cümle (paylaşık bölümün çözümü)

> **VORT CA-RM ES ile VORT CA-RM RF ES aynı radon ailesinin iki montaj biçimidir**: ikisi de
> elektronik kontrollü fırçasız motorludur ve aynı kumanda paneline bağlanabilir. Ayıran şey
> **nereye monte edildikleri** ve buna bağlı **koruma sınıfı**dır — kanal tipi kanalın (ya da radon
> kuyusunun) içine girer, IPX7 ile suya daldırmaya karşı sızdırmazdır ve seri montaja izin verir;
> çatı tipi ise dış ortama, çatıya konur ve IP45 ile dış ortam montajına uygundur. Çap kümesi de
> farklıdır: kanal tipi 100-125-150-160-200 mm, çatı tipi 150-160-200 mm. [RAD s.23, 24]

Vitrinde "radon fanı" demek iki aileyi ayırmaz — ikisi de odur. Ayıran, **fanın binanın neresinde
durduğudur**: kanalın içinde mi (IPX7, seri montaj), çatının üstünde mi (IP45).

---

## 5 · Ortak aksesuar — SICURBOX (her iki ailede aynı)

Kaynak SICURBOX'ı ayrı bir sayfada, iki üründen sonra tarif eder; **hangi aileye ait olduğunu
söylemez** ve "iki fanın bağımsız kontrolü" ifadesi her iki aile için de geçerlidir. Bu yüzden
taslak onu **iki ailenin de Kontrol bloğunda** anar, ayrı bir ürün gibi yazmaz. [RAD s.25]

---

## 6 · Kaynakta ve veride bulduklarım (K7.5 — hepsi kayıtta)

### 6.1 · IPX5 / IP45 çelişkisi — **kaynak IP45 diyor, DB metni YANLIŞ**

Bugünkü DB metni çatı ailesi için **"IPX5"** diyor. Kaynağın s.24 satırı birebir şudur:

> `IP45 (suitable for outdoor installation)`

Ham metin okumasıyla (PyMuPDF `get_text("text")`) doğrulandı; sayfada "IPX5" dizisi **hiç geçmiyor**.
Kanal ailesi için s.23 satırı birebir `IPX7 (immersion watertight)` — DB'deki IPX7 **doğru**.
**Hüküm:** çatı ailesinin koruma sınıfı **IP45**'tir; DB'deki "IPX5" bir aktarım hatasıdır.
Bu taslak IP45 yazar. (İkisi aynı şey değildir: IPX5'te toz basamağı belirtilmemiştir, IP45 ise
toz için 4 su için 5 basamağını verir — yani DB metni ürünün toz korumasını sessizce siliyordu.)

### 6.2 · "Radyal fan" ifadesi bu kaynakta yok

Her iki DB metni de ürünü "radyal fan" diye tanımlıyor. Bu kaynağın s.23/s.24 ürün sayfalarında
çark tipi **hiç yazmıyor**. Saha örneklerinde geçen "centrifugal exhaust fan Ø250" ifadeleri
belirli bir **proje uygulamasını** anlatır, CA-RM ES / RF ES modelini değil — bu yüzden çark tipi
iddiası oraya dayandırılmadı. **Ölçülmedi, uydurulmadı; denetim kalemi olarak bırakıldı.**

### 6.3 · Kaynakta performans verisi YOK

s.23–25'te tek bir performans sayısı (debi, basınç, güç, ses) yoktur. Taslaktaki debi aralıkları
**yalnız DB'den** gelir ve `[DB]` ile işaretlenmiştir. Katalog veya teknik föy bulunmadan bu
ailelerin performans tablosu yazılamaz.

### 6.4 · Kaynak bir ÜRÜN KATALOĞU değil, bir SUNUM

Dosyanın 42 sayfasının yalnız **3'ü** (s.23–25) ürün tarifidir; geri kalanı radon olgusu, mevzuat
ve saha uygulama örnekleridir. Bu, altı bloğun neden yarısına yakınının boş kaldığının sebebidir —
metin kısalığı tembellik değil, **kaynak yokluğudur**.

### 6.5 · Model kodu biçimi: kaynak "VORT CA RM ES", DB "CA-RM … ES"

Kaynak aynı sayfada iki biçim kullanıyor: başlıkta `VORT CA RM ES` (tiresiz), görsel altında
`VORT CA-RM ES` (tireli). DB tireli biçimi kullanıyor. Çelişki değil, biçim farkı; marka-model
adı çevrilmedi ve DB biçimi korundu.

### 6.6 · Sağlık iddiaları kaynakta VAR ama vitrine ALINMADI

Kaynak s.7 radonu "sigaradan sonra akciğer kanserinin ikinci sebebi" diye anar ve s.9 ölüm
tahminleri verir. Bunlar bir ürün vaadi değil epidemiyolojik bağlamdır; vitrin metnine hiçbiri
alınmadı. Ürün metinlerinde yalnız teknik işlev anlatılır.

---

## 7 · Blok doluluk karnesi

| Blok | KANAL (CA-RM ES) | ÇATI (CA-RM RF ES) |
|---|---|---|
| Gövde | **BOŞ** — kaynakta karşılığı yok | **BOŞ** — kaynakta karşılığı yok |
| Çark | **BOŞ** — kaynakta karşılığı yok | **BOŞ** — kaynakta karşılığı yok |
| Motor | DOLU | DOLU |
| Koruma | DOLU | DOLU |
| Kontrol | DOLU | DOLU |
| Montaj | DOLU | DOLU |

**Aile başına 4 dolu / 2 boş.** Toplam 12 bloğun **8'i dolu, 4'ü boş**.

## 8 · Bu taslağın kapatmadığı

* **EN çevirisi yazılmadı** — bu tur TR. `description.en` ayrı tur ister.
* **Gövde ve Çark blokları açık** — CA-RM ES / RF ES teknik föyü ya da Vortice ürün kataloğu depoya
  girerse bu iki blok doldurulabilir. Bugün kaynak yok.
* **Performans (debi/basınç/ses/güç) tabloları yok** — kaynakta hiç sayı yok (§6.3).
* **`is_description_manual`** bayrağı: elle yazılmış bu metin yüklenirse **true** yapılmalı;
  aksi halde bir sonraki otomatik tur ezer.
* **Ticari onay yok** — Recep/uzman turu.
* **DB düzeltmesi ayrı iş:** §6.1 (IPX5→IP45) ve §6.2 (radyal iddiası) bu taslakla değil,
  DB yazım turunda kapanır.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
