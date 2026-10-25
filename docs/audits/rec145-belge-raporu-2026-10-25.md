# REC-145 · Ürün PDF belgeleri — birleşik belge listesi ve rapor (KATALOG, 2026-10-25)

Kanban: KTL-58 (KATALOG panosu).
Yöneten cetvel: `docs/standards/catalog-ingestion-standard.md` §6.3 (kaynak dizini) ve §6.7 (paket tazeliği).
Liste: [`rec145-belge-listesi-2026-10-25.csv`](rec145-belge-listesi-2026-10-25.csv) (116 satır, `;` ayırıcılı, UTF-8 BOM).
Üreteç: `scripts/icerik-hatti/belge-listesi-birlestir.mjs` (salt okuma; kanıtsız bağda çıkış 1).

## Sonuç

| Ölçü | Değer |
|---|---|
| Bugünkü PDF klasörü (kaynak dizini katalog envanteri) | 97 PDF, 97'sinin sha256'sı diskten yeniden hesaplandı, fark 0 |
| Listedeki satır (aile × PDF) | 116 |
| Yayınlanabilir PDF (tekil sha256) | 52 dosya, toplam 265 MB |
| Yayınlanabilir belgesi olan aile | 34 / 47 (ürün 383 / 442) |
| Belgesi olmayan aile | 13 (10'u AVenS; AVenS'in üretici kataloğu yok, tek kaynak fiyat listesi) |
| Kanıtsız bağ | 0 (her bağ, ailenin model simgesinin PDF metninde geçtiği sayfa sayısıyla yazılı) |
| Dil | Yayınlanabilir belgelerin tamamı İngilizce (2'si İngilizce + İspanyolca). Türkçe üretici belgesi yok |

Tür dağılımı (yayınlanabilir satırlar): katalog 40, teknik föy 20, kılavuz 6, diğer 1.

## 1. paket/belgeler.csv tazelik kontrolü (§6.7): BAYAT

- Katalog karnesi `--kapi` 25 Ekim 15:28'de koşuldu: **Katalog paketi tazeliği BAYAT** (paket 2026-09-25; marka 5→7, kategori 31→35, aile ve ürün içerikleri farklı).
- `belgeler.csv` 2026-09-10 tarihli, 65 satır. 15 satırı (13 dosya) bugün `arsiv/` altına taşınmış eski baskıları gösteriyor; yerlerine gelen güncel baskılar (12 Ekim indirmesi) listede yok. Kaynak dizinindeki 54 belge (38 PDF, 16 web metni) listede hiç yok.
- `aile_slug` sütunu canlı `product_families.slug` değil, "yeni şema" adlarını taşıyor (`danfoss-fc102` ↔ canlı `danfoss-vlt-hvac-drive-fc-102`). Belge tablosunun yabancı anahtarı canlı slug'ı tanıyacağı için bu sütun doğrudan kullanılamaz. `aile` (ad) sütunu bir satır dışında canlı adla eşleşiyor; o satırdaki ad (Vortice AD Ortam Havalı Hava Perdeleri) canlıda yeniden adlandırılmış.
- Yanlış bağ: `industrial_Ventilation.pdf` Tiracamino ailesine "dizin adı ön ek" kademesiyle bağlanmış; katalogda TIRACAMINO 0 sayfada geçiyor (adı yalnız AVenS fiyat listesinde var). Yeni listede bağ kaldırıldı.
- Onarım yolu §6.7'de yazılı tek yoldur: paket yeniden üretilir. Bu iş paketi yeniden üretmedi; birleşik liste paketten değil, bugün sha256'sı doğrulanan klasörden ve canlı aile listesinden üretildi.

## 2. Marka geneli 20 satır için öneri

| Karar | Adet | Dosyalar |
|---|---|---|
| Aileye bağlanır | 9 | Danfoss AD449962666883 (FC 101 seçim kılavuzu) → FC 101; AQ276736419659 (FC 51 kullanım kılavuzu) → FC 51; SEAT `FXQejq…` (SEAT serisi özellik föyü) ve `seat-15…50-fiche-technique` 6 föy → SEAT Serisi |
| Marka geneli kalır, yayınlanır | 2 | SEAT ATEX kurulum kılavuzu (2011; yerine geçen kılavuz yok), Vortice "Why Ventilate" bilgilendirme broşürü |
| Yayınlanmaz | 9 | SEAT-CATALOGUE, seat-katalog, SEAT.pdf (eski; yerini 2024-11 broşürü aldı) · Seat_V5 (Fantech Trade baskısı, resmi değil) · Danfoss AJ275648114271en-US1001 (eski ABD baskısı) · Vortice ResidentialVentilation (eski; yerini 186926 aldı) · `vortice-brochure-radon-en.pdf` (adı yanlış, içerik MEV broşürü) · VORT jet fan sistemi (canlıda ailesi yok) · AVenS 2026 fiyat listesi |

Kural önerisi (planın "marka geneli aileye bağlanmaz" satırına uygun): marka geneli belge `family_id NULL` ile yazılır ve yalnız marka sayfasında görünür; ürün sayfasına inmez.

## 3. Design envanterindeki 4 yanlış yol

Design Menü projesinde (`arsiv/md/belge-envanteri-2026-10-22.md`) dört kaydın yolu `uploads/` gösteriyor, dosyalar `arsiv/eski-baski/` altında. Dördü de bu adreste ölçüldü. Dördü de bizim PDF klasörümüzde yok, sha256'ları bu yüzden listeye yazılamadı. Her birinin modeli güncel aile kataloğunda var:

| Design kaydı | Bağlı ürün | Güncel katalogda kanıt | Öneri |
|---|---|---|---|
| QBK SAL-KC EVO 315 M4 föyü | VRT-43151 | QBK 190829, "315 M4" 4 sayfa | Föy yayınlanmaz, aile kataloğu yeter |
| LINEO 100 Q föyü (iki kopya) | VRT-17143 | Lineo Range 193047, "100 Q" 6 sayfa | Föy yayınlanmaz |
| Nicotra AT 7/7 föyü (bayi kopyası, iki kopya) | NIC-11930 | 480-series-at 5 sayfa, ADH-AT-RDE-RZR 3 sayfa | Föy yayınlanmaz (resmi değil) |
| LINEO QUIET kataloğu (2020-12) | Lineo Quiet ailesi | Bizdeki arşiv kopyası; yerini Lineo Range 193047 aldı (QUIET 12 sayfa) | Yayınlanmaz (eski) |

Design'da olup klasörümüzde olmayan diğer dosyalar: AVENS 40-20 teknik formu (2017, eski baskı; AVENS 40x20 fiyat listesi s.27'de), CA 100 MD föyü (In-Line Fans 191875'te "CA 100 MD" 10 sayfa), Casals AF kesiti (Design'ın kendi kesiti), Nicotra DD kesiti, MEV ve Vort Mono'nun iki parçaya bölünmüş kopyaları (bizde tek dosya olarak var).

## 4. Design'ın "doğrulanacak" 8 eşlemesi

| Design eşlemesi | Katalog metninde ölçülen | Hüküm |
|---|---|---|
| Vorticent CMS RANGE 193646 → CMS ATEX ailesi | ATEX 0 sayfa; canlı ailenin 11 ürünü ATEX | Bağlanmaz. Yerine klasördeki 10 model föyü (2026-03-05 baskısı) bağlandı; 11. ürün (14/5 T2 0,25 kW) için föy yok |
| Deumido Evo 177678 → Deumido ailesi | NG 0 sayfa; canlı ürünler NG 10/16/20 | Bağlanmaz. Deumido Range_1 (NG 6 sayfa) bağlandı |
| SEAT broşürü 2024-11 → SEAT, JET, STORM | JET 28, STORM 32, SEAT 21 sayfa | Üç aileye bağlandı |
| VORT HR W-ALL 100 DF 193392 → VORT HR | Avel 0, Invisible 0, Neti 1 sayfa | Bağlanmaz (canlı modeller yok) |
| NRG 178104 → VORT HR | Avel 0, Invisible 0, Neti 1 sayfa | Bağlanmaz |
| MEV 188510 parça 1 → VORT HR | Avel 15, Neti 16, Invisible 6 sayfa | Bağlandı (tek dosya olarak) |
| MEV 188510 parça 2 → VORT HR | (aynı dosya) | Bağlandı (tek dosya olarak) |
| CA 100 MD föyü → VRT-16107 | Föy klasörümüzde yok; In-Line Fans 191875'te 10 sayfa | Föy yayınlanmaz; aile kataloğu bağlı |

Design'ın "PDF'i olmayan" dediği 16 aileden 5'inin güncel PDF'i klasörde var: E-ATEX, Heatmaster, Slimroof, aksiyel endüstriyel ve Vorticent CMS ATEX (model föyleri). Design'ın bağladığı iki bağ metinle tutmadı: 2024 konut kataloğu ↔ Bravo S (BRA.VO 0 sayfa) ve Nicotra DDMP/DDDDM ↔ DD ailesi (metinde yalnız DDM/DDMP modelleri).

## 5. Belge tablosu planına notlar (ALTYAPI ve OPS için)

1. `doc_type` CHECK listesinde kılavuz yok; 6 Danfoss tasarım/kullanım kılavuzu ve SEAT kurulum kılavuzu `kilavuz` değeri istiyor. Öneri: listeye `kilavuz` eklenmesi; Design'ın "Ürün belgeleri" süzgecinde de bu tür var.
2. CAD ve CE/ErP beyanı türünde klasörde tek dosya yok; bu iki tür boş başlar.
3. `lang` için bugün yalnız `en` dolu; Türkçe belge yok.
4. Ürün düzeyi föyler (Vorticent CMS ATEX 10 föy, SEAT 15…50 6 föy) için `product_id` doldurulabilir; dosya adındaki model bunu taşıyor, eşleme ayrı bir doğrulama adımı ister (bu listede aile düzeyinde).
5. Toplam boyut 265 MB; en büyükleri Danfoss kılavuzları ve MEV kataloğu.
6. `FXQejq7tfTOtLQypNJrYMGjORsBaF6yz0G208fqW.pdf` gibi anlamsız adlar kova yolunda sha256 ile adlandırıldığı için sorun çıkarmaz; `title_i18n` elle yazılmalı.

## Ölçmediğim

- Dil sütunu ilk 8 sayfadaki işlev kelimelerinden tahmindir; tek sayfalık görsel PDF'lerde (Bravo S) belirsiz çıkar.
- "kontrol-edilmedi" baskı durumundaki 37 yayınlanabilir satır üreticideki son baskıyla kıyaslanmadı (katalog envanterinin sütunu); bu iş o kıyası yapmadı.
- Design'daki dosyaların sha256'sı alınmadı (DesignSync dosya okuması 256 KB sınırlı ve PDF'i bağlama taşır).
