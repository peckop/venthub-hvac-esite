# Katalog sayımı — 2026-10-27

Bu dosya **üretilmiştir** (`scripts/katalog/katalog-sayim.mjs`). Elle düzenlenmez.

> **Sayısal bir katalog iddiası bu tabloyu kaynak göstermeden yapılmaz** (REC-136).
> Sebebi ölçülmüş bir olaydır: aynı sorular elle yazılan farklı SQL'lerle tekrar tekrar
> soruldu ve üç kez yanlış cevaplandı. Sayının üretildiği yer TEK olmalı.

⚠**Bu bir KAPI DEĞİL, bir SAYAÇTIR.** Kırmızı vermez; "bu ürün doğru dalda mı" gibi
YARGI gerektiren soruları ölçmez — ölçseydi var olmayan bir kapı sanılırdı.

## Özet

| urun | aile | kategori | kok | dal | aktif_kategori | marka |
| --- | --- | --- | --- | --- | --- | --- |
| 442 | 47 | 36 | 8 | 28 | 29 | 6 |


## Kök başına dal ve ürün

| kok | slug | is_active | dal_sayisi | urun | dalda_urun |
| --- | --- | --- | --- | --- | --- |
| Fanlar | fans | true | 14 | 358 | 358 |
| İklimlendirme ve Hava Şartlandırma | air-treatment | true | 3 | 17 | 17 |
| Isı Geri Kazanım | heat-recovery-vmc | true | 2 | 16 | 16 |
| Hava Perdeleri | air-curtains | true | 2 | 8 | 8 |
| Sığınak Havalandırma Fanları | shelter-ventilation | true | 0 | 3 | 0 |
| Aksesuarlar | accessories | true | 2 | 0 | 0 |
| Commercial Ventilation | commercial-ventilation | false | 1 | 0 | 0 |
| Residential Ventilation | residential-ventilation | false | 1 | 0 | 0 |


## Dalsız ürün / aile ve bütünlük

| dalsiz_urun | dalsiz_aile | yetim_referans | ust_uyusmazligi |
| --- | --- | --- | --- |
| 5 | 2 | 0 | 0 |


## Ürün almayan dal

| ust | dal | slug | is_active |
| --- | --- | --- | --- |
| Aksesuarlar | Elektrik Aksesuarları | control-systems | true |
| Aksesuarlar | Mekanik Aksesuarlar | mechanical-accessories | true |
| Commercial Ventilation | Dikdörtgen Kanal Tipi Fanlar | rectangular-duct-fans | false |
| Fanlar | Ex-Proof (ATEX) Fanlar | ex-proof-atex-fans | false |
| Fanlar | Jet Fans | jet-fans | false |
| Fanlar | Otopark Jet Fanları | parking-jet-fan | false |
| Residential Ventilation | Kanal İçi Hayalet Fanlar | inline-duct-fans | false |


## technical_specs doluluğu (kök başına)

| kok | specli_urun | en_az_anahtar | ortalama_anahtar | en_cok_anahtar | seyrek_urun |
| --- | --- | --- | --- | --- | --- |
| Fanlar | 349 | 1 | 14.3 | 24 | 25 |
| Aksesuarlar | 39 | 1 | 9.0 | 10 | 4 |
| İklimlendirme ve Hava Şartlandırma | 17 | 2 | 6.2 | 17 | 8 |
| Isı Geri Kazanım | 16 | 7 | 17.8 | 21 | 0 |
| Hava Perdeleri | 8 | 19 | 20.0 | 21 | 0 |
| Sığınak Havalandırma Fanları | 3 | 2 | 2.0 | 2 | 3 |


## Sayım sözleşmesi — iki tuzak

1. **Ağaç ataması `subcategory_id`'dedir**; `category_id` yalnız kökü taşır. Yalnız birine
   bakan sorgu yanlış cevap verir — 2026-09-04'te "375 ürün kökte" tam bu yüzden denildi.
2. **`jsonb_each_text` satır çoğaltır**; o birleşimde `count(*)` ürünü değil ANAHTARI sayar.
