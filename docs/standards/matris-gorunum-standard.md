# Matris (Tablo) Görünüm Standardı — sütun neye göre seçilir

**Kapsam:** ürün liste yüzeyleri (dal/seri sayfaları, kategori sayfaları, tüm ürünler) —
ürünlerin **karşılaştırmalı tablo** olarak sunulduğu görünüm. Kapsam dışı: ürün detay
sayfasının kendi spec bloğu, admin tabloları.

**Durum: TASLAK.** Recep kararı (2026-09-04): tüm ürünler ve her dal/seri sayfası matris
görünümü alacak, sütunlar **doluluğa göre** seçilecek. Bu cetvel o kuralın kod tarafındaki
karşılığıdır. Kod yazılmadı; ölçüm yapıldı ve **kuralın ham hâlinin çalışmadığı** ölçüldü.

---

## 0) Niçin var — ve niçin ham kural yetmiyor

İlk kural şuydu: *">=%60 dolu = matris sütunu · %30-60 = gizlenebilir ikincil · <%30 = ürün
sayfasında kalır."* Prod ölçümü (2026-09-04, 367 spec'li ürün) bunun **tek başına
uygulanamayacağını** gösterdi. İki sebep, ikisi de ölçülmüş:

**1. Doluluk çoğu kategoride HEP-YA-HİÇ.**

| Üst kategori | Spec'li ürün | Farklı doluluk seviyesi |
|---|---|---|
| Fanlar | 295 | 16 |
| Kontrol Sistemleri | 35 | **2** |
| Isı Geri Kazanım (VMC) | 16 | 3 |
| İklimlendirme | 11 | 3 |
| Hava Perdeleri | 8 | **2** |
| Aksesuarlar | 2 | 1 |

Kontrol Sistemleri'nde **10 anahtar birden %94,3**, Hava Perdeleri'nde **19 anahtar birden
%100**. Ürün ya tam spec setiyle geliyor ya neredeyse boş. Ham kural bu kategorilerde
**19-20 sütun** seçer — okunabilir bir tablo değil, yatay kaydırılan bir veri dökümü.

→ **Doluluk eşiği bir ÜST SINIRLA birlikte anlamlıdır.**

**2. Kategori ortalaması seyrek satırı gizliyor.**
Fanlar'da 295 üründen **44'ü ≤3 anahtar** taşıyor (ortalama 13,6 diyor). Yüzdeler "iyi"
görünürken tablonun ~%15'i boş hücreli satır olacak.

→ **Seyrek satır tasarımın açık bir kalemidir**, ortalamanın altına saklanamaz.

---

## 1) Kurallar

1. **Sütun sayısı üst sınırı: 6.** Doluluk ölçütünü geçen aday sayısı 6'yı aşarsa,
   sıralama **ayırt ediciliğe** göre yapılır (aşağıda) ve ilk 6 alınır. Kalanlar
   "gizlenebilir sütun" havuzuna düşer.
2. **Doluluk eşiği:** `>=%60` birincil aday · `%30-60` gizlenebilir · `<%30` yalnız ürün
   sayfasında. Yüzde, o **kategorideki spec'li ürün sayısı** üzerinden hesaplanır.
3. ⭐**Ayırt edicilik ölçütü — doluluk tek başına sütun değeri DEĞİLDİR.**
   Kataloğun en dolu anahtarı `phase` (%80,9) ama ürünlerin çoğu **aynı değeri** taşır;
   böyle bir sütun tabloda yer kaplar, karar ürettirmez. Sütun adayı ayrıca
   `count(DISTINCT value) >= 3` **ve** en sık değerin payı `<%80` olmalıdır.
   *(Bu, "ayırt etmeyen gösterge ölçüm değildir" kuralının tablo yüzeyindeki hâli.)*
4. **Seyrek satır gizlenmez, işaretlenir.** Spec'i ≤3 anahtar olan ürün tabloda kalır ve
   boş hücreleri **"—"** ile gösterilir; satır sessizce elenmez (eleme, müşterinin
   aradığı ürünü kaybettirir).
5. **Birim alan adında yaşar.** `max_delivery_m3h` başlığı "Debi (m³/h)" olarak
   gösterilir; birim başlıkta bir kez yazılır, hücrede tekrarlanmaz.
6. **Matris görünümü tek başına yeterli değildir** — mobilde tablo yatay kaydırılır
   (`overflow-x`), sayfa gövdesi kaymaz.

## 2) Kategori bazlı ölçülmüş adaylar (2026-09-04)

- **Fanlar (295):** `max_absorbed_power_w` %86,4 · `voltage_v` %82,7 · `phase` %80,3 ·
  `diameter_mm` %78,6 · `weight_kg` %74,9 · `max_delivery_m3h` %74,2 · `rpm_max` %66,8
- **Kontrol Sistemleri (35):** 10 anahtar %94,3 (hep-ya-hiç → üst sınır uygulanır)
- **VMC (16):** 20 anahtar %81,3 (hep-ya-hiç → üst sınır uygulanır)
- **Hava Perdeleri (8):** 19 anahtar %100 (hep-ya-hiç → üst sınır uygulanır)
- **İklimlendirme (11):** `frequency_hz`/`voltage_v` %81,8 · `heating_power_w` %72,7 ·
  `nominal_delivery_m3h` %72,7 · `compatible_model` %72,7
- **Aksesuarlar (2):** evren çok küçük — **matris uygulanmaz**, liste kalır

⚠**Ön koşul düzeltmeleri:** emirde "7 üst kategori" yazıyordu, ölçüm **6** gösterdi.
Toplam 375 üründen **367**'sinde spec var (8'inde hiç yok). Ayrıca dağılım dengesiz:
Fanlar kataloğun **%80,4**'ü — "her kategori için matris" pratikte büyük ölçüde Fanlar demek.

## 3) Kapının ölçebileceği / ölçemeyeceği

**Ölçülebilir:** sütun sayısı üst sınırı · seçilen sütunun cetveldeki eşiği geçtiği ·
boş hücrenin "—" ile gösterildiği.

⛔**Ölçülemez:** sütunun müşteri için **anlamlı** olduğu. Ayırt edicilik ölçütü bunun
sayısal vekilidir, kendisi değil. Sütun setinin son onayı **insan incelemesidir**.

⚠**Doluluk verisi CANLI DB'den gelir; kapı kaynak kodu okur.** Yani "bu sütun bugün %60
dolu" iddiasını bir konformans testi doğrulayamaz — o ölçüm bir **denetim** kalemidir ve
`docs/audits/` altında tarihiyle yaşar, bayatlayabilir.

## 4) İlgili

- `docs/standards/product-schema-standard.md` — `technical_specs` anahtar sözleşmesi
- `docs/standards/measurement-discipline-standard.md` — ayırt edicilik kuralı
- Linear "Vitrin Kararlar" K maddesi — Recep'in matris kararı
