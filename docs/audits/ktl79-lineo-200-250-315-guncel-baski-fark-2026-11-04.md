# KTL-79 — Lineo 200 / 250 / 315 (VRT-17180/81/82): canlı ≠ üreticinin güncel baskısı, 4 Kasım 2026

**Canlıya yazılmadı, yeni site verisine kaynak.** Karar (4 Kasım, OPS aktarımı, karar 412): yeni sitenin verisi sıfırdan hazırlanıyor; eski sitede güncel değerin durmasına gerek yok, bu yüzden yazım paketi hazırlandı ama PR'dan çıkarıldı. Bu belge yeni site Lineo (17180/81/82) verisinin kaynağıdır: değerler "yazılacak değer" sütununu (güncel baskı) esas alır.

Yöneten cetvel: `docs/standards/catalog-ingestion-standard.md` §6.3 (önce kaynak dizini), `product-schema-standard.md`. KATALOG-kurallar 1 (baskı tazeliği), 3 (aynı sayı metinde), 4 (belirsiz sütun tahminle yazılmaz).

## Kök

KTL-12 (10 Ekim) bu üç ürünü `LINEO_QUITE_KATALOG.pdf` s.28 ile düzeltti ve o dosyayı "güncel kaynak" saydı. Envanterde (`kaynak-dizini/katalog-envanteri.json`) bu dosya **eski** (2020-12 baskısı); üreticinin son baskısı `Doc_Pubblicita_Lineo_Range_193047.pdf` (kod 5.170.084.504, Şubat 2026, envanterde "güncel", yerine geçtiği dosya LINEO_QUITE_KATALOG). Aynı iki baskıda 17180-82 için güç/akım/devir/debi/basınç/ses sayıları farklı; ebat satırları (s.29) iki baskıda aynıdır.

## Ebat sütun eşlemesi (görsel doğrulama)

Katalog s.29 çizimi (Version C: Lineo 200/250/315) elle okundu: **A** ön görünüşte toplam genişlik, **B** toplam yükseklik, **C** yan görünüşte eksen boyunca toplam uzunluk, **ØD** bağlantı çapı. Canlıda `size_a_mm / size_b_mm / size_c_mm` bu sırayla A/B/C tutuyor (17143-17146 canlı değerleri katalog A/B/C ile birebir). Sayfa görüntüsü: `C:/Users/alize/VentHub-Gorsel-Arsiv/_liste/ktl12-ebat-2026-11-04/s29.png` (depo dışı).

## Fark tablosu (güncel baskı s.28-29 ↔ canlı 4 Kasım, `/tr/products/vortice-lineo-kanal-fanlari`)

| Alan | Ürün | Canlı | Güncel baskı | Eski baskı (2020) | Durum |
|---|---|---|---|---|---|
| ip_rating | 17180/81/82 | IP44 | IPX5 (dipnot: kanallı birimler için) | — | KESİN: canlı yanlış; yazılacak "IPX5 (kanallı kurulum)" (Lineo Quiet canlı biçimi) |
| size A/B/C (mm) | 17180 | 234,5 / 260,5 / 300 | 270 / 373 / 396 | aynı | KESİN (canlı değerler Lineo 200 Q satırına yakın) |
| size A/B/C (mm) | 17181 | 300 / 317 / 385 | 300 / 378 / 322 | aynı | KESİN kaynağa sadık; **C = 322 komşulardan (396, 420) küçük, üretici teyidi adayı** |
| size A/B/C (mm) | 17182 | 361,5 / 392,5 / 448 | 373 / 446 / 420 | aynı | KESİN |
| Güç (W, max) | 17181 | 145 | 150 | 145 | KESİN: canlı eski baskı |
| Akım (A, max) | 17181 | 0,63 | 0,65 | 0,63 | KESİN |
| Akım (A, max) | 17182 | 1,6 | 1,55 | 1,6 | KESİN |
| Devir (rpm max) | 17182 | 2690 | 2710 | 2690 | KESİN |
| Debi (m³/h max) | 17181 / 17182 | 1440 / 2590 | 1470 / 2740 | 1440 / 2590 | KESİN |
| Debi (l/s) | 17181 / 17182 | 400 / 719,44 | 408,3 / 761,1 | — | KESİN |
| Basınç (Pa max) | 17181 / 17182 | 364,8 / 543,3 | 368,7 / 559 | 364,8 / 543,3 | KESİN |
| Ses Lp yayılan max dB(A) | 17182 | 49 | 51,6 | 49 | KESİN |
| Ses Lp yayılan max dB(A) | 17181 | 43,5 | basılı 35,5 (min ile aynı, basım hatası; Lw 64,7'den ~44 beklenir) | 43,5 | **ÇELİŞKİLİ/BELİRSİZ: yazılmadı**, üretici teyidi |
| Ses Lp emiş / basma max (açıklama metni) | 17180 | 72 / 70,7 | 55,4 / 56,8 | 72 / 70,7 | KESİN ama büyük sıçrama (aşağıda) |
| Ses Lp emiş / basma max (açıklama metni) | 17182 | 74,5 / 74,2 | 62,2 / 64,9 | 74,5 / 74,2 | KESİN, aynı sıçrama |
| Ses Lp emiş / basma (açıklama metni) | 17181 | 70,7 / 68,8 | 58,0 / 57,4 | 70,7 / 68,8 | Yazılmadı: yayılan hücresi belirsiz olduğu için cümle bir bütün olarak bekler |
| Güç/akım/devir/debi/basınç/yayılan ses | 17180 | 110 W, 0,49 A, 2710, 1135, 294,2, 46,9 | aynı | aynı | tutuyor |
| Güç, ağırlık | 17182 | 360 W; 9,5 kg | 360 W; 9,5 kg | aynı | tutuyor |
| Ağırlık | 17180 / 17181 | 4,9 / 5,3 kg | 4,9 / 5,3 kg | aynı | tutuyor |

### Ses sıçraması (emiş/basma Lp)

Güncel baskıda 17180 emiş/basma ses basıncı ~17 dB(A) daha düşük (72 → 55,4), yayılan değer aynı (46,9). Aynı baskıda ses gücü Lw da ~17 dB(A) düşük (89,5 → 72,9): üretici ölçüm temelini değiştirmiş gibi görünüyor; nedeni kaynakta yazmıyor (varsayım, ölçülmedi). Paket güncel baskıya göre yazar (KATALOG-kurallar 1); büyüklük nedeniyle OPS yazımdan önce bu satırı gözle onaylamalı.

### pq_curve

17181 ve 17182'de canlı eğri iki noktalı ve eski azami değerlerden türetilmiş; yeni azami değerlerle aynı iki noktalı biçimde güncellenir. Yeni eğri üretilmez; kaynaklı eğri hattı KTL-9.

## Yazım paketi kapsamı

17180: ip, ebat, açıklama emiş/basma (TR+EN). 17181: ip, ebat, güç, akım, debi, basınç, eğri, açıklamada yalnız güç (145 → 150 W). 17182: ip, ebat, akım, devir, debi, basınç, ses, eğri, açıklama ses cümlesi (TR+EN). 17181 sesi ve cümlesi dokunulmaz. Bayatlık kapıları, sayaç kapıları ve geri alma pakette. Paket yerelde **denenmedi**: Docker kapalıydı ve geçici Postgres başlatma izni verilmedi; sözdizimi ve eşleşecek metin parçaları canlı sayfa HTML'inden (TR+EN) birebir alındı, `description_i18n` ve `technical_specs` kolonlarının jsonb olduğu migration'dan doğrulandı. OPS koşmadan önce blok 1 ve 2 (yalnız okuma) çıktısı kontrol edilir.
