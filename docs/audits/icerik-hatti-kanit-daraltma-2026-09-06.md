# İçerik hattı — kanıt eşlemesi: aileye daraltma + birim dönüşümü (REC-163 artım 1 + 2)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Tarih:** 2026-09-06 · **Durum:** ölçüm + betik; DB'ye hiçbir şey yazılmadı.

## KAYNAK / CETVEL

* `docs/standards/catalog-ingestion-standard.md` **§6.3** — Kaynak Dizini; "PDF doğrudan
  taranmaz, dizin okunur" kuralı ve kanıt tablosu + kanıtsız mandalı.
* Kararlar — **K7** (kaynak yoksa satır yok) · **K7.5** (her bulgu kayıtta).
* OPS kapanışı: *"artım 1, `tenant_id` taşınmadan kapanmaz."* → bu ölçümde taşındı (3127/3127).
* **YÖNTEM:** elle (tek betik ailesi + ölçüm). Cetvel `execution-method-standard.md` —
  "tek dosya = elle". Sapma yok.

---

## 0 · Kapatılan sorun

v1'in dürüst sınırı şuydu: *"değer, dizindeki **bir** sayfada geçiyor"*. Hangi sayfa olduğunu
gösteremiyordu (3434 satırın yalnız 88'i tek adaylı) ve **hangi kataloğun** sayfası olduğuna hiç
bakmıyordu. Somut sonucu şu satır:

```
aile   : avens-hucreli-hf-s      alan: max_absorbed_power_w   deger: 7500
bulundu: markalar/vortice/.../Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf s.27
```

AVenS hücreli aspiratörün gücü, **Vortice'nin başka bir ürün ailesinin broşüründe** "bulunmuş"
sayılıyordu. 7500 yaygın bir sayı; geçmesi rastlantı. v1 bunu **kanıt** diye sayıyordu.

## 1 · Ne yapıldı

Her ailenin **kendi kaynak PDF'leri** belirlendi ve arama yalnız o sayfalarda yapıldı.

Harita **elle yazılmadı** — taslaklardan program çıkardı
(`scripts/icerik-hatti/aile-kaynak-cikar.py`). Gerekçe: taslak, bir ailenin hangi katalog
sayfalarından yazıldığının **kaydıdır**; elle harita yazmak ölçülmemiş bir eşleme uydurmak olurdu.
Çıkarım, ailenin slug'ının geçtiği bölümlerdeki `[KOD s.NN]` referanslarını toplar; adsız
`[s.NN]` biçimi `VARSAYILAN-KAYNAK` yorumundan çözülür. **40/40 aile haritalandı, haritasız kalan yok.**

| Aile başına kaynak PDF | Aile |
|---|---|
| 1 PDF | 26 |
| 2 PDF | 3 |
| 3 PDF | 9 |
| 4 PDF | 2 |

## 2 · Ölçülen kazanç (aynı veri, aynı dizin, 375 ürün / 1171 sayfa)

| Ölçüt | v1 | v2 | |
|---|---|---|---|
| Aranabilir değer | 3733 | 3733 | — |
| Kendi kaynağında bulunan | 3434\* | **3127** | \*v1'de "herhangi bir kaynakta" |
| **Tek adaylı (sayfa gösterilebilen)** | **88** | **267** | **3,0×** |
| Aday sayfa **ortancası** | 100 | **13** | 7,7× dar |
| Aday sayfa ortalaması | 211,7 | 29,6 | |
| En kötü durum (max aday) | 959 | 202 | |
| ⚠ Yabancı kaynakta geçen | (kanıt sayılıyordu) | **307** | yeni sınıf |
| ⛔ KANITSIZ | 299 | **299** | **mandal korundu** |

Korunum sağlanıyor: 3127 + 307 + 299 = 3733. **Kanıtsız sayısı değişmedi** — daraltma
mandalı bozmadı, yalnız "kanıt" sütunundan 307 rastlantıyı ayırdı.

## 3 · ⚠ Kendi kusurum — ölçüm yayımdan ÖNCE yakaladı

İlk koşumda MONO ailesinin **101 değerinin tamamı** "kendi kaynağında yok" çıktı ve
`vortice_vort_mono_range_new.pdf` "dizinde yok" diye rapor edildi. Yanlıştı.

Dosya dizinde **duruyor** — `vortice-brochure-mev.pdf` ile **bayt-aynı** olduğu için dizin onu
tek kayda indirgemiş ve ötekini `manifest.json` → `takma_adlar` altında tutmuş. Taban ada göre
kurduğum filtre **takma adlara kördü**. Düzeltildi (manifest okunur, takma ad kanoniğe çözülür);
MONO 0 → **81 kanıt**, yabancı 428 → 307.

Ders: **kendi kurduğum tekilleştirmeyi kendi filtrem görmedi.** Dizin, aynı PDF'i iki adla
tutmamak için doğru davrandı; ikinci katman o kararı bilmiyordu. → [[olcut-keskin-ama-evren-yanlis]]

## 4 · ⚠ Daraltmanın ÇÖZMEDİĞİ — sabotaj sınavı ne dedi

İki aileye kasten **yanlış** kaynak atandı (Lineo → hava perdesi broşürü):

| | doğru harita | sabotajlı harita |
|---|---|---|
| `vortice-lineo` kanıt | 86 | **32** |
| `vortice-lineo` tek adaylı | 19 | **15** |

Yani sabotaj satırların **%63'ünü** düşürdü ama **%37'si ayakta kaldı**; tek adaylı satırlarda
düşüş yalnız **%21**. Sebep: `100`, `125`, `230` gibi **jenerik** değerler hemen her HVAC
kataloğunda geçer. **Daraltma rastlantıyı azaltır, bitirmez.** Bu yüzden alan adı hâlâ
`kanit_gucu` değil `esleme_yontemi`; değeri hâlâ `SAYFA_ICINDE_GECIYOR`.

Manşeti kendim düşürüyorum: **"3127 değerin kaynağı var" DEMEK DEĞİL.** Söylenebilecek olan
şudur — 267 değer için tek bir sayfa gösterebiliyoruz; kalan 2860 için "ailenin kendi
kataloğunun şu 13 sayfasından birinde geçiyor" diyebiliyoruz.

## 5 · `tenant_id` (OPS'un kapanış şartı)

Her kanıt/kanıtsız/yabancı satırı artık `tenant_id` taşıyor — **3127/3127 dolu**, bugün tek
kiracı (`d3b07384…0000`). Niçin şart: bu alan olmadan çok-kiracılı kurulumda başka kiracının
değeri bizim kanıtımız gibi sayılabilirdi ve fark **hiçbir yerde görünmezdi** (kural 12).

## 6 · Üretilen dosyalar

| Dosya | Ne |
|---|---|
| `scripts/icerik-hatti/aile-kaynak-cikar.py` | taslaklardan aile→PDF haritası üretir |
| `scripts/icerik-hatti/aile-kaynak-haritasi.json` | üretilmiş harita (40 aile) |
| `scripts/icerik-hatti/urun-veri-cek.mjs` | ürün verisi + `tenant_id` çeker (salt okuma) |
| `scripts/icerik-hatti/kanit-tablosu.py` | v2 — daraltma, takma ad çözümü, yabancı sınıfı |

Koşum sırası:

```bash
node   scripts/icerik-hatti/urun-veri-cek.mjs urunler.json
python scripts/icerik-hatti/aile-kaynak-cikar.py docs/audits urunler.json \
       scripts/icerik-hatti/aile-kaynak-haritasi.json
python scripts/icerik-hatti/kanit-tablosu.py --veri urunler.json --cikti-dizin <dizin>
```

---

# ARTIM 2 — birim dönüşümü

## 7 · Kanıtsızın gerçek bileşimi (daraltma sonrası ölçüldü)

299 kanıtsız değer **tek bir yığın değil**; üç ayrı sorun:

| Alan | Adet | Ne demek |
|---|---|---|
| `pq_curve` · `thermal_efficiency_curve` · `discharge_velocity_curve` | **166** | katalogda yalnız **grafik** olarak var — metinde sayı yok |
| `max_delivery_ls` | **123** | DB l/s tutuyor, katalog m³/h basıyor → **birim farkı** |
| diğer (`rated_power_w`, `max_delivery_m3h`, `absorbed_current_a`, `filter_classes`) | 10 | tekil |

(Daha önce "132 dönüşüm" demiştim; daraltma sonrası ölçülen sayı **123**.)

## 8 · Dönüşüm kanıtsızı KAPATIR, gizlemez

Dönüşümle bulunan satırın `esleme_yontemi`'i ayrıdır
(`BIRIM_DONUSUMUYLE_BIRIME_BITISIK`) ve hangi dönüşümün uygulandığı satırda yazar.
Doğrudan eşleşmeyle aynı kefeye konmaz.

**Yuvarlama toleransı gerekti:** `719.44 l/s × 3.6 = 2589.984`, katalogda yazan **2590**.
Fark (%0,0006) değerin **kendi yuvarlanmasından** gelir. Tolerans bağıl ve dardır (%0,1) —
geniş tolerans komşu modelin değerini yakalar ve kanıt uydurur.

## 9 · ⛔ İlk kuralım AYIRT ETMİYORDU — sınav yakaladı, manşeti düşürdüm

İlk sürüm dönüştürülen sayıyı **çıplak** arıyordu ve 105 satır "kapandı". İki yönlü sınav
(katsayıyı kasten bozup koşmak) bunu çürüttü:

| l/s → m³/h katsayısı | ÇIPLAK sayı arayınca | **BİRİMLE BİTİŞİK** arayınca |
|---|---|---|
| **3,6 (doğru)** | 105 | **91** |
| 3,5 (sabotaj) | 56 | **0** |
| 3,7 (sabotaj) | 46 | **1** |
| 3,4 (sabotaj) | 41 | **0** |
| 4,0 (sabotaj) | 49 | **0** |
| 2,0 (sabotaj) | 54 | **0** |

Çıplak arama **yanlış katsayıyla da 41–56 satır kapatıyordu** — yani ölçüt ayırt etmiyordu,
sayfadaki yüzlerce sayıdan birine çarpıp kanıt uyduruyordu. Kural değiştirildi: dönüşümlü
eşleme **sayının birimle bitişik geçmesini** ister (`2590 m³/h`). Son sürümde tam koşum:
doğru katsayı **109**, sabotaj katsayıları **0 · 1 · 0 · 1**.

Ayrıca **asgari belirginlik** kuralı kondu: `11000 W → "11"` araması 46 sayfada "bulunuyordu";
11 her katalogda geçer. Dönüşümlü eşleme için gösterim **en az 3 basamak** taşımalı. Bu kural
ilk sürümdeki 180 dönüşümün 37'sini düşürdü. (Doğrudan eşleşmeye uygulanmaz — orada değer
DB'nin kendi yazımıdır.)

## 10 · Artım 1 + 2 birlikte — son tablo

| Ölçüt | v1 | v2 (daraltma) | **v3 (+dönüşüm)** |
|---|---|---|---|
| Kendi kaynağında bulunan | 3434\* | 3127 | **3238** |
| — doğrudan eşleşen | 3434\* | 3127 | 3127 |
| — birim dönüşümüyle | — | — | **111** |
| **Tek adaylı** | **88** | 267 | **312** (3,5×) |
| Aday sayfa ortancası | 100 | 13 | 13 |
| Yabancı kaynakta geçen | kanıt sayılıyordu | 307 | 287 |
| ⛔ **KANITSIZ** | **299** | 299 | **208** |

\*v1'de "herhangi bir kaynakta". Korunum: 3238 + 287 + 208 = 3733 ✔

Mandal **91 birim küçüldü** ve küçülmenin tamamı ayırt eden bir sınavdan geçti.

## 11 · Bu ölçümün kapatmadığı

* **287 yabancı satır** ne demek — bir kısmı gerçek boşluk, bir kısmı harita darlığı olabilir;
  ayrıştırılmadı.
* **Kalan 208 kanıtsızın 166'sı eğri** — katalogda yalnız grafik. Sayısallaştırma
  **Recep kararıdır** (emek/fayda dengesi ticari karar).
* Kalan 15 `max_delivery_ls` birimle bitişik geçmiyor — sayfada tablo başlığında olabilir;
  güçlü eşleme (satır/sütun) yazılana kadar açık.
* Güçlü eşleme (tablo hücresi / satır-sütun) yazılmadı — o gün `esleme_yontemi` değişir.
