# İçerik hattı — kanıt eşlemesini ailenin KENDİ kaynağına daraltma (REC-163 artım 1)

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

## 7 · Bu ölçümün kapatmadığı

* **307 yabancı satır** ne demek — bir kısmı gerçek boşluk, bir kısmı harita darlığı olabilir;
  ayrıştırılmadı.
* **Artım 2 (birim dönüşümü)** hâlâ açık: 299 kanıtsızın 132'si kW↔W, l/s↔m³/h dönüşümü.
  Dönüşüm kuralı kanıtsızı **kapatmalı**, gizlememeli.
* **166 eğri değeri** yalnız grafik olarak var; sayısallaştırma **Recep kararıdır**.
* Güçlü eşleme (tablo hücresi / satır-sütun) yazılmadı — o gün `esleme_yontemi` değişir.
