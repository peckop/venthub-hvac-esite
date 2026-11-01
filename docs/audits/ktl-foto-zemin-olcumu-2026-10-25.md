# KTL-64 — Ürün fotoğrafı zemin ölçümü (önce/sonra + galeri taraması)

Ölçüm tarihi: 31 Ekim 2026 (kartın dosya adı 25 Ekim; 25 Ekim ölçümü depoya girmemişti, yeniden yapıldı).
Yöneten cetvel: `docs/standards/product-image-standard.md` §2 (şeffaflık korunur; arka plan basılmaz).
Yöntem: elle (ölçüm + görsel işleme betiği, `scripts/icerik-hatti/foto-zemin/`). Bağımsız doğrulayıcı ölçümü yeniden koşar.

## Kabul ölçütü

- Kenardaki 3 px şeritte piksellerin en az %85'i beyaz (RGB üç kanal 236 ve üstü) ya da saydam.
- Ürün gövdesi kenardan en az %4 boşlukta (işlemde %6 verildi).
- Aynı dosya adı, aynı adres; yazımdan önce yedek, yazımdan sonra yeniden ölçüm.

## Dört dosya: önce / sonra

Kart ölçüsüyle (31 / 22 / 64 / 82) benim ölçümüm uyuşmuyor; kartın ölçü yöntemi bilinmiyor. Aşağıdakiler kabul ölçütünün birebir ölçümüdür.

| Ürün | Dosya | Önce (şerit) | Önce boşluk | Sorun | İşlem | Sonra (şerit) | Sonra boşluk (en küçük) |
|---|---|---|---|---|---|---|---|
| AVenS BVU | 561be29e…/00.webp | %13,9 | %0 | gri vinyet zemin (208–239), ürün kenara dayalı | zemini beyaza çevir + %6 beyaz tuval | %100 | %7,2 |
| Casals ENKELFAN EC | a3707a3a…/foto.webp | %68,3 | %0 | zemin beyaz, ürün sol/alt kenara dayalı | %6 beyaz tuval | %100 | %5,3 |
| Vortice VORT-E ATEX | 45d3f204…/foto.webp | %100 | %1,8 | zaten beyaz; yalnız boşluk dar | %6 beyaz tuval | %100 | %6,9 |
| AVenS HF/S | b2735646…/foto.webp | %79,1 | %0 | zemin beyaz, ürün alt kenara dayalı | %6 beyaz tuval | %100 | %5,4 |

Görsel kontrol: BVU işlenmiş hâli ürün ayrıntısını koruyor (üst yüzey, kollar, filtre kasası bozulmadı). Kalan sınır: ENKELFAN kaynağı düşük çözünürlüklü (416×505) ve ürün kadrajda kesik; beyaz tuval bunu çözmez, daha iyi kaynak ancak üreticiden gelir (üretici sürümü bu işte aranmadı, ölçülmedi).

Dosyalar: yedek (eski dosyalar) `C:/tmp/ktl64/orijinal/`, işlenmiş `C:/tmp/ktl64/sonra/`.

## Galeri taraması

1146 görsel (429 ürün, tek kiracı), hepsi okundu, hata 0.

| Ölçüt | Sayı |
|---|---|
| Kabul (şerit %85 ve üstü) | 944 |
| Kabul dışı | 202 (%17,6) |
| — şerit %50'nin altı | 151 |
| Genişlik ya da yükseklik 400 px altı | 257 |

Kabul dışı 202 görselin tam listesi: `docs/audits/ktl-foto-zemin-galeri-listesi-2026-10-31.csv`. Bunlar bu kartın kapsamı dışıdır; ayrı karttır (sayı büyük, zemin işlemi ürün başına görsel kontrol ister).

## Yazım (canlı) — Recep "yaz" sözüyle OPS penceresinde

```
node scripts/icerik-hatti/foto-zemin/yukle.mjs C:/tmp/ktl64/sonra C:/tmp/ktl64/orijinal            # kuru koşu
node scripts/icerik-hatti/foto-zemin/yukle.mjs C:/tmp/ktl64/sonra C:/tmp/ktl64/orijinal --yaz      # yazar
node scripts/icerik-hatti/foto-zemin/yukle.mjs C:/tmp/ktl64/sonra C:/tmp/ktl64/orijinal --geri-al  # yedeği geri yazar
```

Sonra: `python -I scripts/icerik-hatti/foto-zemin/olc.py` dört dosyanın canlı kopyasına koşturulur (kabul: şerit %85 üstü). Önbellek: adres aynı kaldığı için eski görsel bir süre görünebilir; ölçüm eski görseli görürse önbellek payı sayılır, 1 saat sonra tekrarlanır.
