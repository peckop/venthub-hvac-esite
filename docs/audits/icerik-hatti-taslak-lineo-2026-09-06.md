# İçerik hattı — TR taslak: LINEO · LINEO QUIET (REC-146 Adım 2b·2, ilk aile grubu)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** OPS pano notu 2026-09-06 ("Lineo + Lineo Quiet ilk grup KABUL")
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır. Bu dosya kaynak/kanıt kaydıdır.
**Kaynak:** AVenS Ürün Fiyat Kataloğu 2026 s.22–24 (TR) · Vortice LINEO kataloğu s.3–26 (EN, **çevrildi**)
**Referans biçimi:** `[AVenS s.NN]` = fiyat listesi · `[VLK s.NN]` = Vortice LINEO kataloğu

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Kararlar — Katalog ve Ürün Verisi **K7.1** (varyant metni yazılır, **yüklenmez**) · **K7.2** (çeviri serbest)
  · **K7.5** (her tespit kayıtta).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Derinlik ölçümü (`icerik-hatti-anlatim-derinligi-2026-09-05.md`): **Lineo ZENGİN** 383 birim / 6 blok ·
  **Lineo Quiet ZENGİN** 131 birim / 5 blok. İkisi de TR fiyat listesinde s.22–23'ü **paylaşıyor**.

---

## 0 · Neden bu ikisi birlikte yazıldı

Derinlik ölçümünde bu iki aile, TR kaynağında **aynı iki sayfayı paylaşan** ailelerdi. Paylaşık metni
doğru aileye bölmenin tek dürüst yolu, ikisini **yan yana** yazmaktır: ayıran cümle ancak karşılaştırınca
görünür. Ayrı ayrı yazılsalardı ikisi de "kanal tipi karma akışlı fan" diye başlayacak ve vitrinde
**iki ayrı seri tek cümleyle** çıkacaktı — SEAT/JET'te tam bu tuzağa düşmenin eşiğinden dönmüştük.

## 1 · Bugün DB'de ne var (ölçüldü, 2026-09-06)

| Aile | Ürün | `description.tr` | Durum |
|---|---|---|---|
| `vortice-lineo` | 7 | **BOŞ** | sıfırdan yazılıyor |
| `vortice-lineo-quiet` | 12 | 212 karakter, **2 cümle** | var ama altı blok **yok**, zenginleştiriliyor |

**Mevcut Quiet metni (korunacak çekirdek, atılmıyor):**
> "Ultra sessiz çalışan, akustik susturucu gövdeli kanal tipi karma akışlı havalandırma fanı serisi.
> 100–315 mm çap seçenekleri ve 260–2890 m³/h debi aralığı ile konut ve ticari havalandırma
> uygulamalarına uygundur."

Bu metin **doğru** ve sayıları DB'den türetilmiş (`vortice-lineo-descriptions.json` `_kaynak` notu).
Taslak onu **değiştirmiyor**, üstüne altı bloğu ekliyor. `is_description_manual` bugün **false**;
elle yazılmış metin yüklenirse **true** olmalı.

---

## 2 · LINEO Serisi

**DB:** `vortice-lineo` · 7 ürün · Lineo 100 / 100 Q / 125 / 150 / 200 / 250 / 315 · açıklama **BOŞ**

### Kimlik cümlesi
> Konut, ticari ve endüstriyel alanların havalandırması için, kanal içine yatay veya dikey monte
> edilebilen karma akışlı (mixed flow) kanal fanı. [VLK s.4]

### Dört madde
* Yüksek performans, düşük enerji tüketimi, düşük gürültü emisyonu ve kolay montaj [VLK s.4]
* Teknopolimer gövde; E2 yangına tepki sınıfı (EN ISO 11925-2:2010) ve IPX5 su koruması [VLK s.5]
* Üç hızlı endüksiyon motor — performans, tüketim ve ses arasında en iyi denge [VLK s.24]
* 100–315 mm anma çapı aralığı [VLK s.25]

### Yapısal bloklar

**Gövde.** Teknopolimer gövde, E2 yangına tepki güvenlik sınıfını (EN ISO 11925-2:2010) ve yüksek
derecede su korumasını (IPX5) sağlar. [VLK s.5] Merkezi motor yuvası fan-motor grubunu içine alır;
kablolama elemanlarını ise dışarıda, kolay erişilebilir bir konumda barındırır. Ana gövde, emiş ve
basma borularına bağlanmaya hazır bir çift uç desteğe sabitlenmiştir. [VLK s.5]
> *Sınıflandırma yalnızca kurallara uygun monte edilmiş ürün için geçerlidir.* [VLK s.5]

**Çark.** Karma akışlı (mixed flow) çark kullanılır. Basma tarafındaki akış doğrultucular, yukarı
akıştaki çarkla sinerji içinde çalışarak yönetilen hava akışını optimize eder; böylece performans
artar, girdap oluşumu azalır ve gürültü emisyonu en aza iner. [VLK s.5] Ojival profilli akış
yönlendirici aynı amaca hizmet eder. [VLK s.7] Diverjan eleman, çarkın performansını artırır. [VLK s.26]

**Motor.** Üç hızlı endüksiyon motor. [VLK s.24] Motorlar, maksimum hızda ve maksimum ortam
sıcaklığında sürekli çalışmada, tipine göre **30.000 veya 40.000 saat** asgari garantili ömre
sahiptir. [VLK s.5]

**Koruma.** IPX5 su koruma derecesi ve E2 yangına tepki sınıfı. [VLK s.5] Elektrik kutusu, elektriksel
ve yangına karşı dayanım sağlayan malzemeden üretilmiştir. [VLK s.26] Ürünler CE işaretlidir; güvenlik
ve elektromanyetik uyumluluk direktiflerine uygunluk için **IMQ sertifikasına** sahiptir. [VLK s.3]

**Kontrol.** Lineo 100–150 modelleri çift hızlı, Lineo 200–315 modelleri üç hızlıdır; hız anahtarına
ihtiyaç duymadan farklı kademede hava debisi sağlanabilir. İsteğe bağlı olarak hız anahtarı ile
kontrol edilebilir. [AVenS s.24]

**Montaj.** Kanal içine yatay veya dikey montaja uygundur. [VLK s.4] Giriş nozulu, duvar ve tavan
montajında ürünü taşıyacak biçimde boyutlandırılmıştır. [VLK s.26] Her bileşen komşu elemanlarla kolay
bağlanıp ayrılabilir; iç bileşenlere (motor-çark) erişim ve değişim kolaydır. [VLK s.5]

---

## 3 · LINEO QUIET Serisi

**DB:** `vortice-lineo-quiet` · 12 ürün — **6 adet Quiet (AC) + 6 adet Quiet ES (EC)**, hepsi `active`
· açıklama **2 cümle, blok yok**

### Kimlik cümlesi
> Ses emici kaplaması dış gövdeye tam entegre edilmiş, ortam ses emisyonunu en aza indirmek üzere
> optimize edilmiş kanal tipi karma akışlı fan. [VLK s.6]

### Dört madde
* Akustik susturucu gövde — ses emici kaplama dış gövdeye **tam entegre** [VLK s.6][AVenS s.22]
* İki motor seçeneği: AC endüksiyon (Quiet) ve **EC fırçasız** (Quiet ES) [VLK s.12, s.18]
* Quiet üç hızlı, **Quiet ES dört hızlı** (4/6/8/10 V) — hız anahtarı olmadan farklı debi [AVenS s.22, s.23]
* Serinin üst ucu: aynı gövde ailesinin en yüksek performans seviyesi [VLK s.6]

### Yapısal bloklar

**Gövde.** Ses emici kaplama dış gövdeye tamamen entegredir ve ortama yayılan ses emisyonunu en aza
indirecek şekilde optimize edilmiştir. [VLK s.6] Gövde yapısı, malzemesi ve koruma sınıfı bakımından
LINEO serisiyle ortaktır: teknopolimer gövde, E2 yangına tepki sınıfı, IPX5. [VLK s.5]

**Çark.** LINEO serisiyle ortak: karma akışlı çark, basma tarafında akış doğrultucular, ojival profilli
akış yönlendirici. [VLK s.5, s.7]

**Motor.** İki seçenek sunulur: AC endüksiyon motorlu **LINEO QUIET** [VLK s.18] ve EC fırçasız motorlu
**LINEO QUIET ES** [VLK s.12]. EC fırçasız model düşük enerji tüketimi sağlar. [AVenS s.22]

**Koruma.** LINEO serisiyle ortak: IPX5, E2 sınıfı gövde, yangına dayanıklı elektrik kutusu, CE + IMQ.
[VLK s.3, s.5, s.26]

**Kontrol.** LINEO QUIET (AC) **üç hızlıdır**; hız anahtarına ihtiyaç duymadan üç farklı hava debisi
sağlanabilir. [AVenS s.23] LINEO QUIET ES (EC) **dört hızlıdır**; hız anahtarına ihtiyaç duymadan dört
farklı hava debisi sağlanabilir. [AVenS s.22] Her ikisi de isteğe bağlı hız anahtarıyla kontrol
edilebilir; hız anahtarları sıva üstü montajlı, sigorta korumalı, minimum hız ayarlı ve On/Off
anahtarlıdır. [AVenS s.22, s.23]

**Montaj.** LINEO serisiyle ortak: kanal içine yatay veya dikey montaj, taşıyıcı giriş nozulu, kolay
sökülüp takılabilen bileşenler. [VLK s.4, s.5, s.26]

---

## 4 · İki seriyi ayıran cümle (paylaşık sayfanın çözümü)

> **LINEO ile LINEO QUIET aynı gövde, aynı çark, aynı koruma ailesindendir.** Ayıran tek şey,
> QUIET'in dış gövdesine **tam entegre ses emici kaplama** ve buna bağlı olarak sunulan **EC fırçasız
> motorlu ES seçeneği**dir. [VLK s.5, s.6, s.12]

Vitrinde bu farkın görünmesi, iki seriyi ayıran yegâne şeydir. "Sessiz" kelimesi tek başına yetmez —
LINEO de düşük gürültü emisyonu iddia eder [VLK s.4]; QUIET'te farklı olan **nasıl** sağlandığıdır.

---

## 5 · K7.1 — YAZILDI ama **YÜKLENMEZ** (satmadığımız varyantlar)

Aşağıdaki metinler kaynakta vardır ve ileride ürün açılırsa hazır beklesin diye yazılmıştır.
**DB'ye yüklenmez** — bugün bu modelleri satmıyoruz; vaat bütünlüğü satmadığımız ürünün anlatımını yasaklar.

* **LINEO ES (düz seri, EC motorlu):** "EC fırçasız motorlu LINEO serisi." Kaynak: [VLK s.3] başlığı
  ve s.25'teki "26 modelin 18'i AC, 8'i EC fırçasız motorlu" ifadesi. **DB'de düz seri ES modeli yok.**
* **160 mm boy:** Katalogda `LINEO 160 QUIET` ve `LINEO 160 QUIET ES` mevcut [VLK s.12, s.13].
  **DB'de 160 boy yok** — Quiet ailemiz 100/125/150/200/250/315.

---

## 6 · Kaynakta ve veride bulduklarım (K7.5 — hepsi kayıtta)

1. **`Vortice Lineo 100 Q` (SKU `VRT-17144`… değil, `VRT-17143`) kimliği belirsiz.** DB'de `vortice-lineo`
   ailesinde duruyor, adı "Q" ile bitiyor. Katalogda `LINEO 100 QUIET` kodu **17160**; 17143 bu değil.
   "Q = Quiet" varsayımı **yapılmadı** — ürün yanlış ailede olabilir ya da farklı bir varyant olabilir.
   **Ölçülmedi, uydurulmadı; denetim kalemi olarak bırakıldı.**
2. **Kaynak dosya adı hatalı:** `LINEO_QUITE_KATALOG.pdf` — doğrusu QUIET. İçerik doğru, ad yanlış.
   (Depo temizliği bizim işimiz değil; kaydı burada.)
3. **Quiet ES ses değerlerinde ondalık ayırıcı karışık:** aynı tabloda hem `71,4` hem `76.7`
   biçimi kullanılmış [VLK s.12]. Sayı okunabiliyor ama otomatik ayrıştırmada tuzak — **taslakta
   ses değeri kullanılmadı.**
4. **Mevcut Quiet metnindeki "260–2890 m³/h" aralığı DB'den türetilmiş** (manifest `_kaynak` notu),
   katalogdan değil. Doğruluğu **bu turda yeniden ölçülmedi**; korunarak bırakıldı.

## 7 · Bu taslağın kapatmadığı

* **EN çevirisi yazılmadı** — bu tur TR. EN metin `description.en` için ayrı tur gerekir.
* **Ses (dB) ve debi tabloları taslağa girmedi.** Kaynakta var ama sayı yazmak ayrı bir doğrulama
  turu ister (birim sözleşmesi, `product-schema-standard.md` §11.6/11.7).
* **`is_description_manual` bayrağı** bugün her ailede `false`. Elle yazılmış bu metin yüklenirse
  **true** yapılmalı; aksi halde bir sonraki otomatik tur bunu ezer.
* **Ticari onay yok** — Recep/uzman turu.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
