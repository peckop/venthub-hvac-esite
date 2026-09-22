# Rakip adres terimi taraması — 442 model adresinin "ürün tipi" kelimesi için · 2026-09-22

**Neden:** Design slug kuralı madde 8, rakip adreslerinin *hangi teknik terimin arandığını görmek için*
taranmasını istiyordu. İlk üretimde (791b4f7a7) bu tarama yapılmamıştı; Recep sordu, yapıldı.
**Yöntem:** salt okuma. Trendyol, Hepsiburada ve n11 doğrudan açılmadı (üçü de `HTTP 403 Forbidden`);
yerine ~45 WebSearch `site:` sorgusu (her biri ≤10 sonuç) + 10 sektör satıcısının kategori sayfaları
(avensair, havalandirmagross, fanmarketi, market.afs, solerpalau.market, mekanikstore, kesselteknik,
promekanikshop, suvsan/ercefe/esuvent, kampa) + Google otomatik tamamlama (ipucu, kanıt değil).
**Sınır:** sayılar görülen sonuçlarda terimin adreste geçtiği sayfa sayısıdır, pazar payı değildir.

## Dal başına sonuç ve uygulanan hüküm

| Dal | Bizim terim | Rakip terimler (adet) | Hüküm |
|---|---|---|---|
| Santrifüj | radyal fan | radyal ≈30 · salyangoz ≈10 · santrifüj 1 (+5 pompa karışması) | KORU |
| Plug | plug fan | toplam 3 | KORU |
| Hücreli | hücreli aspiratör | hücreli aspiratör 8 · modüler fan hücresi 3 | KORU |
| Korozyon dayanımlı | korozyon dayanımlı fan | "asit fanı" 3 · "korozyon dayanımlı" 0; otomatik tamamlama "asit fanı / pp asit fanı" | **KORU, Recep'e not:** dal adı Recep kararıyla "Korozyon Dayanımlı" (11-09); kanıt zayıf (3 adres) |
| Kanal tipi | kanal tipi fan | kanal tipi ≈35 · kanal fanı 7 · inline 0 | KORU |
| Banyo | banyo fanı | banyo aspiratörü ≈21 (üç pazaryerinin kategori adı) · banyo fanı ≈8 | **DEĞİŞTİ → banyo aspiratörü** |
| Çatı | çatı tipi fan | çatı tipi 6 · çatı fanı 5 | KORU |
| Aksiyel | aksiyel fan | aksiyel baskın · aksiyal 2 | KORU |
| Duman egzoz | duman egzoz fanı | duman egzoz 8 · duman tahliye 3 | KORU |
| HVLS | endüstriyel tavan vantilatörü | tavan vantilatörü 3 + Trendyol kategorisi · hvls 2 | KORU (model adı zaten "HVLS" taşıyor) |
| Baca | baca fanı | Trendyol 9/9 "baca fanı" (soba/şömine) | KORU — bizim ürün Vortice TIRACAMINO şömine-baca fanı, aynı ürün sınıfı |
| Frekans | frekans konvertörü | ürün adresinde invertör 23 / konvertör 0 (22'si tek site) · kategoride invertör 4 site / konvertör 2 | **DEĞİŞTİ → frekans invertörü** (tek site ağırlığı not edildi) |
| Hız anahtarı | hız anahtarı | hız anahtarı 8 · hız kontrol cihazı 4 · devir ayar 0 | KORU |
| Ortam havalı perde | ortam havalı hava perdesi | ısıtıcısız 4 · ortam havalı 1; otomatik tamamlama 7'ye 0 | **DEĞİŞTİ → ısıtıcısız hava perdesi** |
| Elektrikli perde | elektrikli ısıtmalı hava perdesi | elektrikli ısıtıcılı 4 · ısıtmalı 0 | **DEĞİŞTİ → elektrikli ısıtıcılı hava perdesi** |
| Isı geri kazanım | ısı geri kazanım cihazı | ≈17 · ünite 1 · HRV 0 | KORU |
| Tek oda | tek oda ısı geri kazanım cihazı | oda tipi ≈10 · tek oda 0 | **DEĞİŞTİ → oda tipi ısı geri kazanım cihazı** |
| Nem alma | nem alma cihazı | 9/9 | KORU |
| Elektrikli kanal ısıtıcısı | elektrikli kanal ısıtıcısı | kanal tipi elektrikli ısıtıcı 7 · bizim sıra 0 | **DEĞİŞTİ → kanal tipi elektrikli ısıtıcı** |
| Sulu batarya | sulu batarya | kanal tipi sulu ısıtıcı batarya 8 · tek başına 0 | **DEĞİŞTİ → kanal tipi sulu ısıtıcı batarya** |
| Sığınak | sığınak havalandırma ünitesi | 7 ürün + 3 kategori, aynı ifade | KORU |
| Yedek parça | yedek parça | kategoride var, ürün adresinde parçanın adı yazılıyor | KORU (3 ürün; parça adı zaten model adında) |

**Dal adlarına not (değiştirilmedi, Recep kararı):** iki yeni hava perdesi dalının slug'ı K17'de
`ortam-havali-hava-perdeleri` / `elektrikli-isitmali-hava-perdeleri`. Tarama pazarın "ısıtıcısız" ve
"elektrikli ısıtıcılı" dediğini gösteriyor. Dallar henüz açılmadığı için bugün değiştirmenin 308 bedeli 0.

## Adres yapısı gözlemi

Trendyol `/{marka}/{başlık}-p-{id}`, Hepsiburada `…-p-HBCV…` / `-pm-HB…`, n11 `…-{7-8 hane}`;
üçü de marka + model önde, değer sonda — bizim `marka-model-tip-değer-p-sku` sırasıyla uyumlu. Sektör
sitelerinin çoğu sona kimlik koymuyor. Birim yazımı dağınık (`m3-h` ≈8, `m-h` ≈8, `mh` ≈6, `m3h` 3);
Design kuralı `m3h` diyor, kural korundu. Ondalık her yerde tireyle (`1-5-kw`), bizim kuralla aynı.

## Ölçülemeyen

Pazaryerlerine doğrudan erişim (403) · toplam ürün sayıları · arama hacmi (ücretli araç denenmedi).
