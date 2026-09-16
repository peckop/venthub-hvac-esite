# KATALOG KARNESİ — ürün başına yapılmışlık · 2026-09-09

**Soru (Recep):** *"USB'yi koyup verileri, klasörleri, resimleri, açıklamaları, fiyat
listelerini ürün bazında hazır mı — tek soru tek cevap, yapılmışlık yüzdesi?"*

**Ölçüm:** canlı DB, **tek sorgu**, salt okuma. Evren: `products` `status='active'` = **441**.

---

## CEVAP: **%59**

| alan | var | oran |
|---|---|---|
| Görsel (`product_images`) | 429 / 441 | **%97** |
| Teknik özellik (`technical_specs`) | 368 / 441 | **%83** |
| Fiyat (`product_prices`) | 347 / 441 | **%79** |
| Türkçe açıklama | 187 / 441 | **%42** |
| İngilizce açıklama | 187 / 441 | **%42** |
| İngilizce ad | 24 / 441 | **%5** |
| **Müşteriye açık belge** | **0 / 441** | **%0** |

**Yedi alanın ortalaması: %59.**

## Hüküm tek cümleyle

**Satılabilir bir katalog var, anlatılabilir bir katalog yok.**

- **Sağlam taraf:** ürün *görünüyor* ve *satılabiliyor* — görsel %97, spec %83, fiyat %79.
- **Zayıf taraf:** ürün *anlatılmıyor* — yarısının açıklaması yok, **hiçbirinin belgesi yok**,
  İngilizce pratikte yok (%5).

## İki kırılma noktası

**1. Belge %0.** Tek bir ürünün föyü/kataloğu/montaj kılavuzu müşteriye açık değil.
**59 kaynak PDF elimizde duruyor, hiçbiri bağlanmamış.** Tablo, kova ve indirme düğmesi yok.

**2. İngilizce %5.** 441 üründen 24'ünün İngilizce adı var. Yabancı müşteri söz konusuysa
site pratikte tek dilli.

---

## ⛔Bu karne niçin bugün yazıldı — patinajın teşhisi

Recep: *"saçma saçma patinaj çekiyoruz günlerdir"* · *"aynı veriyi tekrar tekrar çıkarmaya mı
bakıyorsun?"* — **Haklı.** Somut adı:

**Yanlış soru kovalandı.** Katalog hattı günlerdir *"CSV eksiksiz mi"* sorusunu çözmeye
çalışıyordu. Doğru soru **"DB'de ne eksik"**ti. İkisi aynı şey değil.

**Gerekçe ölçümle çürüdü:** CSV yeniden üretimi *"kaynakta olan ürünler CSV'de yok"*
varsayımına dayanıyordu. Ölçüldü — **ürünler zaten DB'de**: s.42/43'ün 27 satırı
`STORM Serisi` (20 varyant) ve `JET Serisi` (21 varyant) altında, **gerçek üretici
kodlarıyla** (`SEA-61103110` vb.) kayıtlı. Yeniden üretim, **zaten girilmiş verinin
kopyasını** üretecekti.

⭐**Ders:** *kaynağı yeniden çıkarmadan önce hedefe bak.* Eksik aranacaksa **önce DB'ye**
bakılır, PDF'e değil. Bu karne **tek sorguyla** çıktı; günlerdir aranan cevap oradaydı.

## Karar (Recep'e)

**CSV yeniden üretimi DURDURULDU** — gerekçesi çürüdü, yeniden açılması Recep kararı.
Sıradaki iş, üç boşluktan **hangisinin** kapatılacağına bağlı:

| boşluk | bugün | etkisi |
|---|---|---|
| Belge | %0 | müşteri teknik veriye ulaşamıyor; en büyük eksik |
| Açıklama | %42 | ürün anlatılmıyor, arama motoru göremiyor |
| İngilizce | %5 | yabancı müşteriye kapalı |

Sıralama **ticari karar** → Recep.

## Nasıl tekrar ölçülür

Aynı sorgu: `products status='active'` üzerinden yedi alanın varlık sayımı
(`product_images` · `technical_specs` · `product_prices` · `description_i18n.tr/.en` ·
`name_i18n.en` · belge tablosu **henüz yok**).
⛔Belge satırı bugün **tanım gereği %0** — `product_documents` tablosu mevcut değil (REC-145).

İlgili: REC-145 (belge deposu) · REC-146 (CSV — durduruldu) · REC-172 (teknik özellik)
