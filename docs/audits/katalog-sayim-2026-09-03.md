# Katalog sayımı — 2026-09-03

Bu dosya **üretilmiştir** (`scripts/katalog/katalog-sayim.mjs`). Elle düzenlenmez.

> **Sayısal bir katalog iddiası bu tabloyu kaynak göstermeden yapılmaz** (REC-136).
> Sebebi ölçülmüş bir olaydır: aynı sorular elle yazılan farklı SQL'lerle tekrar tekrar
> soruldu ve üç kez yanlış cevaplandı. Sayının üretildiği yer TEK olmalı.

⚠**Bu bir KAPI DEĞİL, bir SAYAÇTIR.** Kırmızı vermez; "bu ürün doğru dalda mı" gibi
YARGI gerektiren soruları ölçmez — ölçseydi var olmayan bir kapı sanılırdı.

## Özet

| urun | aile | kategori | kok | dal | aktif_kategori | marka |
| --- | --- | --- | --- | --- | --- | --- |
| 375 | 40 | 37 | 13 | 24 | 23 | 5 |


## Kök başına dal ve ürün

| kok | slug | is_active | dal_sayisi | urun | dalda_urun |
| --- | --- | --- | --- | --- | --- |
| Fanlar | fans | true | 14 | 295 | 295 |
| Kontrol Sistemleri | control-systems | true | 2 | 37 | 37 |
| İklimlendirme ve Hava Şartlandırma | air-treatment | true | 3 | 17 | 17 |
| Isı Geri Kazanım (VMC) | heat-recovery-vmc | true | 2 | 16 | 16 |
| Hava Perdeleri | air-curtains | true | 0 | 8 | 0 |
| Aksesuarlar | accessories | true | 0 | 2 | 0 |
| Air Conditioning | air-conditioning | false | 0 | 0 | 0 |
| Commercial Ventilation | commercial-ventilation | false | 2 | 0 | 0 |
| Electric Heating | electric-heating | false | 0 | 0 | 0 |
| Hygiene and Sanitizer | hygiene-sanitizer | false | 0 | 0 | 0 |
| Residential Ventilation | residential-ventilation | false | 1 | 0 | 0 |
| Smart Home | smart-home | false | 0 | 0 | 0 |
| Summer Ventilation | summer-ventilation | false | 0 | 0 | 0 |


## Dalsız ürün / aile ve bütünlük

| dalsiz_urun | dalsiz_aile | yetim_referans | ust_uyusmazligi |
| --- | --- | --- | --- |
| 10 | 3 | 0 | 0 |


## Ürün almayan dal

| ust | dal | slug | is_active |
| --- | --- | --- | --- |
| Commercial Ventilation | Dikdörtgen Kanal Tipi Fanlar | rectangular-duct-fans | false |
| Commercial Ventilation | İklimlendirme Çözümleri | air-conditioning-solutions | false |
| Fanlar | Cam ve Pencere Tipi Fanlar | window-fans | false |
| Fanlar | Ex-Proof (ATEX) Fanlar | ex-proof-atex-fans | false |
| Fanlar | Jet Fans | jet-fans | false |
| Fanlar | Otopark Jet Fanları | parking-jet-fan | false |
| Residential Ventilation | Kanal İçi Hayalet Fanlar | inline-duct-fans | false |


## technical_specs doluluğu (kök başına)

| kok | specli_urun | en_az_anahtar | ortalama_anahtar | en_cok_anahtar | seyrek_urun |
| --- | --- | --- | --- | --- | --- |
| Fanlar | 295 | 1 | 13.6 | 23 | 44 |
| Kontrol Sistemleri | 35 | 1 | 9.5 | 10 | 2 |
| Isı Geri Kazanım (VMC) | 16 | 7 | 17.6 | 21 | 0 |
| İklimlendirme ve Hava Şartlandırma | 11 | 3 | 8.2 | 16 | 2 |
| Hava Perdeleri | 8 | 19 | 19.5 | 20 | 0 |
| Aksesuarlar | 2 | 1 | 1.0 | 1 | 2 |


## Sayım sözleşmesi — iki tuzak

1. **Ağaç ataması `subcategory_id`'dedir**; `category_id` yalnız kökü taşır. Yalnız birine
   bakan sorgu yanlış cevap verir — 2026-09-04'te "375 ürün kökte" tam bu yüzden denildi.
2. **`jsonb_each_text` satır çoğaltır**; o birleşimde `count(*)` ürünü değil ANAHTARI sayar.
