# KATALOG defteri: UnoPIM ürün içeriği (neler dolu, neler doldurulmalı)

Sahibi: KATALOG · Son doğrulama: 2026-11-09 · Cetvel: `docs/standards/departman-defter-standard.md` · Kaynak: KTL-86 (OPS emri), KTL-82, KTL-83, KTL-85

**Tazelik kuralı:** ölçüm her sabah kör koşmaz. Tetik KAYNAK değişikliğidir: UnoPIM'in son ürün güncelleme damgası ya da Design anlık görüntü dosyalarının sha256'sı değişince ölçüm yeniden koşulur ve bu sayfa güncellenir. Kaynak değişmediyse son sonuç geçerlidir (`--kontrol` "kaynak değişmedi" der) ve sayfa yalnız yaşı yüzünden bayat sayılmaz. Manifest tetiği: `kart-kapanisi` + `dis-kaynak`.

Bu sayfa "UnoPIM'de hangi ürün alanı ne kadar dolu, neyin doldurulması gerekiyor, Design ile aradaki fark ne" sorusunun tek cevabıdır. Aynı ölçüm
yeniden kurulmaz: sayılar `node scripts/icerik-hatti/unopim-icerik-olc.mjs` ile canlı yerel UnoPIM'den (salt okuma) alınır; manifestteki `olcum`
komutu (`--kontrol`) bu sayfadaki özet bloğunu canlıyla kıyaslar, sayı sapması ya da kaynak değişikliği varsa sayfa bayattır ve önce o düzeltilir. Bloğun dışındaki tablolar elle taşınmaz, `--md` çıktısından üretilir.
**UnoPIM'e doğrudan değer yazılmaz:** değer düzeltmesi Design'da yapılır, fark betiği yeniden koşar, UnoPIM'e yazım ancak ayrı onayla (kart + yedek +
geri okuma + hedef dışı karşılaştırma). Ham ayrıntı (ürün SKU listeleri) depoya girmez, aşağıda yolu ve sha256'sı yazılıdır (cetvel D5).
Eski ölçüm ve işlem tarihçesi: `docs/olcum/pim-unopim.md` ("Ölçüm 2026-11-05…08" bölümü).

## 1 Ne yaptık

| Tarih | İş | Sonuç | Kart |
|---|---|---|---|
| 2026-11-09 | Design tarafı güncel dosyalardan okundu: adres dizini toplamı 1165 = UnoPIM 1165; 41 çift kod 7 Kasım'da Design'da çözülmüş (öneksiz kayıtlar çıkarıldı, `EDF-*` → `VRT-EDF-*` çevirisi); Design'ın 18 fotoğrafsız ürününden 13'ü UnoPIM'de görselli | `surec/ops-cevap-2026-11-07-galeri-ve-cift-kod.md`, `assets/veri/adres-model-dizin.json` (Venthub New) | KTL-86 |
| 2026-11-09 | Bu defter ve ölçüm betiği kuruldu; ilk canlı ölçüm (yerel UnoPIM, salt okuma) | 1165 ürün, 106 aile; teknik alanlarda 115 kısmi + 156 ailede tamamen boş alan, 2841 boş hücre | KTL-86 |
| 2026-11-09 | Ölçüm defteri `docs/olcum/pim-unopim.md` 5-8 Kasım işleriyle güncellendi | PR #2460 | KTL-85 |
| 2026-11-08 | Çevrimdışı ön ölçüm (5 Kasım yedeğinden): 118 kısmi aile×alan (`max_delivery_m3h` 74, `max_static_pressure_pa` 72 boş hücre) | Bu defterin ilk satırı; arşiv `_liste/ktl84-2026-11-08/cevrimdisi-kismi-alanlar.json`; bugünkü ölçüm canlıdan, ölçüt farklı (115 kısmi + 156 tam boş) | KTL-84 (mükerrer kapandı) |
| 2026-11-07 | Galeri (253), alt metin (1158), Notus/Sanikit yazımı | `docs/olcum/pim-unopim.md` | KTL-82 |
| 2026-11-06 | Design↔UnoPIM fark betiği depoya taşındı (bozma testli); adres 1165/1165 | `tasarim-unopim-fark.mjs` | KTL-83, KTL-82 |
| 2026-11-05 | KDV %20 (1165), liste fiyatı 343 ürün; fiyat kaynağı olmayan 822 | `docs/olcum/pim-unopim.md` | KTL-82 |

## 2 Envanter

Tüm satırların dayanağı: `node scripts/icerik-hatti/unopim-icerik-olc.mjs --md` (canlı yerel UnoPIM `products` tablosu, 2026-11-09).
Ürünlerin durumu: 1165'i de kapalı/taslak (hiçbir ürün yayında değil).

### 2.1 Genel alanlar (her ürün için aranır)

<!-- olcum-ozet:basla
{
 "sema": 1,
 "kaynak": {
  "unopimSonGuncelleme": "2026-11-07 19:59:31",
  "unopimUrunSayisi": 1165,
  "tasarimGoruntuSha": "42c834b1b6ee4dc6b19a13a84399fa4e7d41e97c7c148e3ede1c9a7f274a1e40"
 },
 "urun": 1165,
 "aile": 106,
 "durum": {
  "false": 1165
 },
 "genel": {
  "name@tr_TR": "1165/1165",
  "name@en_US": "1165/1165",
  "description@tr_TR": "1165/1165",
  "description@en_US": "1165/1165",
  "short_description@tr_TR": "1165/1165",
  "short_description@en_US": "1165/1165",
  "image": "1160/1165",
  "gallery": "255/1165",
  "image_alt_tr": "1160/1165",
  "image_alt_en": "1160/1165",
  "gallery_alt_tr": "255/1165",
  "gallery_alt_en": "255/1165",
  "adres_tr": "1165/1165",
  "adres_en": "1165/1165",
  "url_key": "1165/1165",
  "brand": "1165/1165",
  "categories": "1165/1165",
  "list_price_eur": "343/1165",
  "list_price_source_doc": "343/1165",
  "list_price_source_page": "343/1165",
  "vat_rate_percent": "1165/1165"
 },
 "teknik": {
  "bosHucre": 2841,
  "kismiAlan": 115,
  "tamBosAlan": 156
 }
}
olcum-ozet:bitti -->

| Alan | Dolu | Toplam | Boş | Dayanak (komut, tarih) |
|---|---|---|---|---|
| `name@tr_TR` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `name@en_US` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `description@tr_TR` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `description@en_US` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `short_description@tr_TR` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `short_description@en_US` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `image` | 1160 | 1165 | 5 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `gallery` | 255 | 1165 | 910 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `image_alt_tr` | 1160 | 1165 | 5 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `image_alt_en` | 1160 | 1165 | 5 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `gallery_alt_tr` | 255 | 1165 | 910 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `gallery_alt_en` | 255 | 1165 | 910 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `adres_tr` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `adres_en` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `url_key` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `brand` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `categories` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `list_price_eur` | 343 | 1165 | 822 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `list_price_source_doc` | 343 | 1165 | 822 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `list_price_source_page` | 343 | 1165 | 822 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `vat_rate_percent` | 1165 | 1165 | 0 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |

Ayrıntı notları: `image` 5 ürün boş (VRT-HP-1400, VRT-HP-1400-D, AVE-13050, AVE-13051, SEA-810105; üretici görseli bekleniyor, bkz. `pim-unopim.md`).
`gallery` ve `gallery_alt_*` yalnız galerisi olan 255 üründe (Design verisi galeri taşıyan ürünler); galerisiz ürünün galeri alanı boş olması eksik
sayılmaz, kaç ürünün galerisi olması gerektiği Design kararıdır. `list_price_*` yalnız Avensair 2026 liste fiyat kaynağı olan 343 üründe; kalan 822
ürünün fiyat modeli ürün kararıdır (`fiyat-kaynagi-olmayan-urunler.csv`, arşiv deposu `_liste/ktl82-faz-c-2026-11-04/`).

### 2.2 Teknik alanlar (aile bazında)

Ölçüt: ailenin öznitelik tanımında olup bir üründe boş olan alan "boş hücre"dir. Aile içinde hiçbir üründe dolu olmayan alan "ailede tamamen boş"
(asıl kaynakta o aile için değer yok olabilir, yani eksik olmayabilir: ayırt etmek Design ve kaynak kontrolünün işidir); en az bir üründe dolu olan
ama başka üründe boş kalan alan "kısmi" (asıl şüpheli). Toplam: 2841 boş hücre, 115 kısmi aile×alan, 156 ailede tamamen boş aile×alan.

En çok boşluk olan 20 teknik alan (tam liste: ölçüm betiği `--md`):

| Teknik alan | Boşluklu aile | Boş hücre | Ailede tamamen boş (aile sayısı) | Kısmi boş hücre | Dayanak (komut, tarih) |
|---|---|---|---|---|---|
| `ip_rating` | 56 | 707 | 50 | 32 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `diameter_mm` | 51 | 613 | 48 | 11 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `noise_level_db_a` | 13 | 210 | 9 | 40 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `rpm_max` | 22 | 206 | 16 | 37 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `absorbed_current_a` | 15 | 198 | 9 | 34 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `max_static_pressure_pa` | 16 | 181 | 10 | 72 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `max_absorbed_power_w` | 13 | 127 | 5 | 35 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `weight_kg` | 6 | 94 | 4 | 6 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `max_delivery_m3h` | 9 | 76 | 1 | 74 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `min_static_pressure_pa` | 2 | 45 | 0 | 45 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `atex_zone` | 3 | 43 | 0 | 43 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `voltage_alt_v` | 3 | 42 | 0 | 42 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `min_delivery_m3h` | 2 | 39 | 0 | 39 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `wiring` | 1 | 33 | 0 | 33 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `nominal_delivery_m3h` | 5 | 22 | 0 | 22 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `phase` | 7 | 20 | 0 | 20 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `nominal_static_pressure_pa` | 4 | 16 | 0 | 16 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `atex_marking` | 2 | 15 | 0 | 15 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `noise_lpa_3m_db` | 3 | 15 | 0 | 15 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |
| `voltage_v` | 4 | 14 | 0 | 14 | `unopim-icerik-olc.mjs --md`, 2026-11-09 |

En çok boş hücresi olan 15 aile (66 ailede en az bir boşluk var; tam liste `doldurulacak.csv`):

| Aile | Ürün | Kısmi alan | Ailede tamamen boş alan | Boş hücre | Dayanak (komut, tarih) |
|---|---|---|---|---|---|
| `vortice_mpc_ed_f400` | 40 | 0 | 7 | 280 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `seat_serisi` | 40 | 13 | 0 | 274 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_vorticent_cms` | 39 | 1 | 5 | 197 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_mpc_hp` | 24 | 0 | 7 | 168 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_mpc_ed` | 22 | 0 | 7 | 154 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_torrette_tr_ed` | 20 | 6 | 2 | 112 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_torrette_tr_ed_v` | 20 | 6 | 2 | 112 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_jet_a_f400` | 24 | 0 | 4 | 96 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_lineo_quiet` | 18 | 15 | 0 | 85 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `storm_serisi` | 20 | 12 | 0 | 81 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_heatmaster_f400` | 11 | 0 | 6 | 66 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_punto` | 47 | 7 | 1 | 61 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_vorticel_ehp` | 28 | 0 | 2 | 56 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_qbk_he_comfort` | 15 | 2 | 3 | 48 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |
| `vortice_qbk_he_sal` | 15 | 2 | 3 | 48 | `unopim-icerik-olc.mjs` (`doldurulacak.csv`), 2026-11-09 |

### 2.3 Design ↔ UnoPIM fark sonucu

| Tarih | Komut | Sonuç | Not |
|---|---|---|---|
| 2026-11-09 | `node scripts/icerik-hatti/tasarim-unopim-fark.mjs` | 1165 üründe fark 0: ad 1153 kontrol, açıklama 2330, kısa açıklama 2330, teknik 4130, marka 1165, kategori 1165 | Design anlık görüntüleri 1,9 ile 6,9 gün eski (11-09; en eskisi `ops-foto-urun-listesi-2026-11-02.csv`, eşik 7 gün aşılınca fark betiği çıkış 2 verir; yaş her koşuda betik çıkışından okunur). Teknik karşılaştırmada 454 ürünün Design karşılığı yok (kaynak UnoPIM'in kendisi) ve 12 ürün için ad kaynağı yok: "fark 0" bu ürünler için güvence değildir. Recep 9 Kasım'da Design'da teknik özellikleri yeniden kontrol ettiriyor; Design değişince anlık görüntüler `DesignSync` ile tazelenir ve betik yeniden koşar. |

### 2.4 Doldurulması gereken (özet; ayrıntı depo dışında)

| Liste | Sayı | Yer |
|---|---|---|
| Ürün/aile × teknik alan boşlukları (SKU listeli) | 271 aile×alan (115 kısmi + 156 ailede tamamen boş), 2841 boş hücre | `~/VentHub-Gorsel-Arsiv/_liste/unopim-icerik-olcum/doldurulacak.csv` (sha256 `ea272f1acc5e86cc0a99cc9c1d06319adc68f11e96f4a49d6d27eedbb801cdbe`) |
| Liste fiyatı kaynağı olmayan ürün | 822 | `_liste/ktl82-faz-c-2026-11-04/fiyat-kaynagi-olmayan-urunler.csv` (arşiv deposu); ticari statü ürün kararı |
| Design'da olup UnoPIM'de olmayan kayıt | 0 (çözüldü) | 6 Kasım'da 41 kayıt (`DAN-80141` + `EDF-*` 40) vardı; 7 Kasım'da Design'da öneksiz kayıtlar çıkarıldı, adres dizini toplamı 1165 = UnoPIM 1165 (`surec/ops-cevap-2026-11-07-galeri-ve-cift-kod.md`). 41'lik liste yalnız tarihçe: `_liste/ktl82-faz-c-2026-11-04/design-fazla-41-sku-ad.csv` |
| Design'da kaynağı olmayan fotoğrafsız ürün | 18 (Design 11-07) → UnoPIM'de görselsiz 5 | 13'ü sonradan üretici/Supabase görseliyle UnoPIM'de görselli (VRT-12103, -10914, -10925, -10926, -10927, -11291, -11293, -11177, -11903, -12108, -25095, -25096, SEA-61102010); kalan 5: VRT-HP-1400, VRT-HP-1400-D, AVE-13050, AVE-13051, SEA-810105 |
| Ölçülmedi | Boşluğun "kaynakta değer var, yazılmamış" mı "kaynakta zaten yok" mu olduğu 271 aile×alan için ayrıştırılmadı | Ayrıştırma kaynak dizini + Design kontrolüyle yapılır (3. bölüm) |

## 3 Sırada ve yapılabilecekler

| Madde | Gerekçe | Öncelik | Kart |
|---|---|---|---|
| 115 kısmi aile×alanı kaynak dizini ve Design ile karşılaştır: değer kaynakta varsa Design'a düzeltme/ekleme listesi, yoksa "kaynakta yok" işareti | Kısmi boşluk, aynı ailenin diğer ürünlerinde dolu olduğu için en olası eksik | Yüksek | KTL-86 sonrası kart açılacak |
| 156 ailede tamamen boş alanı sınıfla: ailede uygulanmaz mı (tanım fazlası) yoksa kaynakta var mı | Tanım fazlası alan, boş görünüp yanlış eksik sayısı üretir | Orta | — |
| Design teknik değerleri değişince anlık görüntüleri tazele, fark betiğini ve bu ölçümü yeniden koş, defteri güncelle | Recep Design'da teknik özellikleri yeniden kontrol ettiriyor (9 Kasım) | Yüksek | — |
| Ölçümü kaynak değişikliği tetiğine bağla (UnoPIM damgası ya da Design anlık görüntü sha değişince açılışta ölç); Docker yerel olduğu için zamanlayıcı ayrı karardır | `olcum` komutu Docker kapalıyken 2 (ölçülemedi) verir; kör günlük koşu istenmiyor | Orta | ALTYAPI / OPS |

## 4 Kararlar

| Tarih | Karar | Karar no / kayıt |
|---|---|---|
| 2026-11-08 | UnoPIM'e doğrudan değer yazılmaz; ürün verisi işi Design İçerik'in, KATALOG yalnız kaynak doğrulama ve ölçümü yapar | KTL-82 kart notu (Recep kararı, OPS iletti) |
| 2026-11-05 | KDV varsayılanı %20 UnoPIM'e yazıldı; satış fiyatı ve stok UnoPIM'e yazılmaz | KTL-82 kart notu; `pim-unopim.md` |
| 2026-11-09 | UnoPIM ürün içeriği yaşayan defterle izlenir; sahip KATALOG | OPS-258 çerçevesi, KTL-86 |
| 2026-11-09 | Ölçüm kör günlük koşmaz; tetik kaynak değişikliği (UnoPIM damgası, Design anlık görüntü sha); kaynak değişmediyse son sonuç geçerli | OPS iletti (Recep düzeltmesi), KTL-86 |
| 2026-11-09 | Design tarafı sayısı güncel Design dosyasından alınır (adres dizini toplamı), eski anlık görüntüden değil | OPS iletti, KTL-86 |
