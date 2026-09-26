# Katalog sayımı — 2026-09-26

Bu dosya **üretilmiştir** (`scripts/katalog/katalog-sayim.mjs`). Elle düzenlenmez.

> **Sayısal bir katalog iddiası bu tabloyu kaynak göstermeden yapılmaz** (REC-136).
> Sebebi ölçülmüş bir olaydır: aynı sorular elle yazılan farklı SQL'lerle tekrar tekrar
> soruldu ve üç kez yanlış cevaplandı. Sayının üretildiği yer TEK olmalı.

⚠**Bu bir KAPI DEĞİL, bir SAYAÇTIR.** Kırmızı vermez; "bu ürün doğru dalda mı" gibi
YARGI gerektiren soruları ölçmez — ölçseydi var olmayan bir kapı sanılırdı.

## Özet

| urun | aile | kategori | kok | dal | aktif_kategori | marka |
| --- | --- | --- | --- | --- | --- | --- |
| 442 | 47 | 31 | 8 | 23 | 24 | 5 |


## Kök başına dal ve ürün

| kok | slug | is_active | dal_sayisi | urun | dalda_urun |
| --- | --- | --- | --- | --- | --- |
| Fanlar | fans | true | 13 | 361 | 361 |
| Kontrol Sistemleri | control-systems | true | 2 | 37 | 37 |
| İklimlendirme ve Hava Şartlandırma | air-treatment | true | 3 | 17 | 17 |
| Isı Geri Kazanım (VMC) | heat-recovery-vmc | true | 2 | 16 | 16 |
| Hava Perdeleri | air-curtains | true | 0 | 8 | 0 |
| Aksesuarlar | accessories | true | 1 | 3 | 3 |
| Commercial Ventilation | commercial-ventilation | false | 1 | 0 | 0 |
| Residential Ventilation | residential-ventilation | false | 1 | 0 | 0 |


## Dalsız ürün / aile ve bütünlük

| dalsiz_urun | dalsiz_aile | yetim_referans | ust_uyusmazligi |
| --- | --- | --- | --- |
| 8 | 2 | 0 | 0 |


## Ürün almayan dal

| ust | dal | slug | is_active |
| --- | --- | --- | --- |
| Commercial Ventilation | Dikdörtgen Kanal Tipi Fanlar | rectangular-duct-fans | false |
| Fanlar | Ex-Proof (ATEX) Fanlar | ex-proof-atex-fans | false |
| Fanlar | Jet Fans | jet-fans | false |
| Fanlar | Otopark Jet Fanları | parking-jet-fan | false |
| Residential Ventilation | Kanal İçi Hayalet Fanlar | inline-duct-fans | false |


## technical_specs doluluğu (kök başına)

| kok | specli_urun | en_az_anahtar | ortalama_anahtar | en_cok_anahtar | seyrek_urun |
| --- | --- | --- | --- | --- | --- |
| Fanlar | 352 | 1 | 14.2 | 24 | 28 |
| Kontrol Sistemleri | 37 | 1 | 9.5 | 10 | 2 |
| İklimlendirme ve Hava Şartlandırma | 17 | 2 | 6.2 | 17 | 8 |
| Isı Geri Kazanım (VMC) | 16 | 7 | 17.8 | 21 | 0 |
| Hava Perdeleri | 8 | 19 | 20.0 | 21 | 0 |
| Aksesuarlar | 2 | 1 | 1.0 | 1 | 2 |


## Sayım sözleşmesi — iki tuzak

1. **Ağaç ataması `subcategory_id`'dedir**; `category_id` yalnız kökü taşır. Yalnız birine
   bakan sorgu yanlış cevap verir — 2026-09-04'te "375 ürün kökte" tam bu yüzden denildi.
2. **`jsonb_each_text` satır çoğaltır**; o birleşimde `count(*)` ürünü değil ANAHTARI sayar.
