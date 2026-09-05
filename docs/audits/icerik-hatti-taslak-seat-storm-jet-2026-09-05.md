# İçerik hattı — TR taslak: SEAT · STORM · JET (REC-146 Adım 2a·2)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** OPS, REC-146 yorumu 2026-09-05 13:57Z
**Durum:** **TASLAK — DB'ye YAZILMADI.** Onay sonrası `product_families.description` `{tr,en}` +
`is_description_manual=true` ile yazılır. Bu dosya kaynak/kanıt kaydıdır.
**Kaynak:** AVenS Ürün Fiyat Kataloğu 2026, s. 41–45 (TR) · **Çeviri YOK** — kaynak zaten Türkçe.
**Referans biçimi:** her cümlenin sonunda `[s.NN]` = kaynak PDF sayfası.

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **uydurma yok**; kaynağı olmayan blok **boş kalır**.
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (yoksa satır yok) · **K1** (fiyat/vaat metni yok).
* Systemair incelemesi §3.1 — altı blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Adım 1 bulgusu: bu üç ailenin marka kataloğu **yok**, TR anlatımı yalnız bu fiyat listesinde.

---

## ⚠ Kaynakta iki tutarsızlık — kopyalamadan önce yazıyorum

**1. Aynı kimlik cümlesi iki ailede.** s.41 (SEAT) ve s.43 (JET) **birebir aynı** başlığı taşıyor:
"KİMYASALLARA VE AŞINDIRICI GAZLARA KARŞI DAYANIKLI SANTRİFÜJ FANLAR". Bunu olduğu gibi alırsak
**SEAT ve JET sayfaları aynı kimlik cümlesiyle yayına girer** — vitrinde iki farklı seri, tek cümle.
JET'i ayıran bilgi başlıkta değil, maddesinde: çatı/duvar uygulaması, yatay-dikey montaj [s.43].
**Taslakta JET'in kimlik cümlesi o maddeden türetildi**, başlık ikinci sıraya alındı. Sapma bilerek yapıldı.

**2. STORM/JET ATEX sayfasının gövdesi "SEAT ATEX" diyor.** s.45'in başlığı
"STORM ATEX SERİSİ / JET ATEX SERİSİ", ama gövde metni *"Patlayıcı ortamlar için tasarlanan **SEAT ATEX**
Serisi…"* diye başlıyor ve verdiği performans aralığı (40–4500 Pa, 50–5.000 m³/h) **STORM'un s.42'deki
aralığının aynısı** — JET'in s.43'teki aralığı (200–3.500 m³/h, 2.000 Pa) değil.
Yani s.45 metni başka sayfadan kopyalanmış ve düzeltilmemiş. **Verbatim alınırsa JET sayfasına yanlış
seri adı ve yanlış performans aralığı yazılır.** Taslakta ATEX bloğu **yalnız seri-bağımsız
sertifika bilgisiyle** yazıldı; performans aralığı her ailenin kendi sayfasından alındı.

> Bu iki kalem **kaynak hatası**, benim ölçüm hatam değil. Düzeltilmesi AVenS içerik tarafının işi;
> not olarak OPS'a taşındı.

---

## 1 · SEAT Serisi

**DB:** `seat-serisi` · 40 ürün (13'ü ATEX) · modeller SEAT 15/20/25/30/35/50 · açıklama bugün **BOŞ**

### Kimlik cümlesi
> Kimyasallara ve aşındırıcı gazlara karşı dayanıklı santrifüj fanlar. [s.41]

### Dört madde
* Polipropilen gövde — asit ve korozyona karşı üstün dayanım [s.41]
* 40–2000 Pa statik basınç · 50–15.000 m³/h debi [s.41]
* Monofaze 220 V ve trifaze 380 V seçenekleri [s.41]
* ATEX Bölge 2 versiyonu mevcut [s.44]

### Yapısal bloklar

**Gövde.** Polipropilen gövde yapısı, asitlere ve korozyona karşı üstün dayanım sağlayarak maksimum
koruma sunar. [s.41]

**Motor.** Monofaze 220 V ve trifaze 380 V seçenekleri; 0,18 kW ile 7,5 kW arasında güç ve
950, 1400, 2800 d/dk devir alternatifleri. [s.41]

**Koruma.** ATEX versiyonu, patlayıcı ortamlar için ATEX Bölge 2, Kategori 3, Gaz Grup C sınıfında ve
T4 sıcaklık sınıfında; IE3 verimlilik dereceli patlamaya dayanıklı asenkron motor kullanır. [s.44]

**Çark · Kontrol · Montaj —** kaynakta karşılığı yok, **boş bırakıldı** (K7).

---

## 2 · STORM Serisi

**DB:** `storm-serisi` · 20 ürün (7'si ATEX) · modeller STORM 10/12/14/16/18 · açıklama bugün **BOŞ**

### Kimlik cümlesi
> Daha yüksek statik basınca sahip, kimyasallara ve korozyona dayanıklı fanlar. [s.42]

### Dört madde
* Polipropilen gövde — asit ve korozyona karşı üstün dayanım [s.42]
* 40–4500 Pa statik basınç · 50–5.000 m³/h debi [s.42]
* Monofaze 220 V ve trifaze 380 V seçenekleri [s.42]
* ATEX Bölge 2 versiyonu mevcut [s.45]

### Yapısal bloklar

**Gövde.** Polipropilen gövde yapısı, asitlere ve korozyona karşı üstün dayanım sağlayarak maksimum
koruma sunar. [s.42]

**Motor.** Monofaze 220 V ve trifaze 380 V seçenekleri; 0,06 kW ile 0,37 kW arasında güç ve
1400, 2800 d/dk devir alternatifleri. [s.42]

**Koruma.** ATEX versiyonu, patlayıcı ortamlar için ATEX Bölge 2, Kategori 3, Gaz Grup C sınıfında ve
T4 sıcaklık sınıfında; IE3 verimlilik dereceli patlamaya dayanıklı asenkron motor kullanır. [s.45]

**Çark · Kontrol · Montaj —** kaynakta karşılığı yok, **boş bırakıldı** (K7).

> **STORM'un SEAT'ten farkı tek cümlede:** aynı gövde ve aynı koruma, ama **basınç iki katından fazla**
> (4500 Pa'ya karşı 2000 Pa), buna karşılık **debi üçte bir** (5.000'e karşı 15.000 m³/h) [s.41, s.42].
> Vitrinde bu farkın görünmesi, iki seriyi ayıran yegâne şey.

---

## 3 · JET Serisi

**DB:** `jet-serisi` · 21 ürün (7'si ATEX) · modeller JET 20/25/30 · açıklama bugün **BOŞ**

### Kimlik cümlesi
> Çatı ve duvar uygulamaları için, yatay ve dikey montaja uygun santrifüj çatı fanları. [s.43]

*(Kaynak başlığı SEAT'inkiyle birebir aynı olduğu için kimlik cümlesi maddeden türetildi — bkz. yukarıdaki
tutarsızlık notu. Başlık ikinci sıraya alındı:)*
> Kimyasallara ve aşındırıcı gazlara karşı dayanıklı santrifüj fanlar. [s.43]

### Dört madde
* Yatay ve dikey montaja uygun; çatı ve duvar uygulamaları [s.43]
* 200–3.500 m³/h debi · 2.000 Pa'ya kadar statik basınç [s.43]
* Monofaze 220 V ve trifaze 380 V seçenekleri [s.43]
* ATEX Bölge 2 versiyonu mevcut [s.45]

### Yapısal bloklar

**Motor.** Monofaze 220 V ve trifaze 380 V seçenekleri; 0,18 kW ile 2,2 kW arasında güç ve
950, 1400, 2800 d/dk devir alternatifleri. [s.43]

**Koruma.** ATEX versiyonu, patlayıcı ortamlar için ATEX Bölge 2, Kategori 3, Gaz Grup C sınıfında ve
T4 sıcaklık sınıfında; IE3 verimlilik dereceli patlamaya dayanıklı asenkron motor kullanır. [s.45]

**Montaj.** Yatay ve dikey montaja uygundur; çatı ve duvar uygulamaları için tasarlanmıştır. [s.43]

**Gövde · Çark · Kontrol —** kaynakta karşılığı yok, **boş bırakıldı** (K7).

> **Dikkat:** JET'in polipropilen gövdesi hakkında s.43'te **cümle yok**. SEAT ve STORM'da var.
> Aynı ürün ailesi olduğu için "onda da vardır" demek **uydurmadır** — yazılmadı. Doğrulanırsa eklenir.

---

## 4 · Bu taslağın kapattığı ve kapatmadığı

**Kapattığı:** 15A çizimlerinde örnek olarak kullanılan üç ailenin (JET, STORM, SEAT) açıklaması bugün
DB'de **boş**; bu taslak üçünü de kaynağa dayalı, sayfa referanslı biçimde dolduruyor. Toplam
**3 kimlik cümlesi + 12 madde + 9 dolu blok**; 3 ailede 18 bloğun **9'u bilerek boş** (K7):
SEAT ve STORM'da Gövde·Motor·Koruma dolu, JET'te Motor·Koruma·Montaj dolu.

**Kapatmadığı:**
* **EN çevirisi yok** — ikinci tur (emir gereği).
* Çark ve Kontrol blokları **üç ailede de boş**; kaynakta o bilgi yok. Doldurulacaksa AVenS'ten teknik
  föy istenmeli.
* Metnin **ticari onayı yok** — Recep/uzman turu. Özellikle "ATEX Bölge 2 versiyonu mevcut" maddesi
  satış vaadi taşıyor; ATEX modellerinin stok/tedarik durumu **ölçülmedi**.
* `STORM 10 XRM` modeli kaynakta var, DB'de **yok** [s.42]; taslakta ona ait cümle **yazılmadı**.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-05
