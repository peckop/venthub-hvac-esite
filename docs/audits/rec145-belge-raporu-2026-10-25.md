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
| Yayınlanabilir PDF (tekil sha256, yayin_onerisi=evet) | 48 dosya, 62 satır, toplam 263,7 MB (1 MB = 1e6 bayt) |
| Yayın kararı bekleyen (yayin_onerisi=dogrulanacak) | 5 dosya: FC51 iki eski fact sheet, SEAT ATEX kurulum kılavuzu, kimliği belirsiz SEAT föyü, Bravo S |
| Yayınlanabilir belgesi olan aile | 34 / 47 (ürün 383 / 442) |
| Belgesi olmayan aile | 13 (10'u AVenS; AVenS'in üretici kataloğu yok, tek kaynak fiyat listesi) |
| Kanıtsız bağ | 0 (her bağ, ailenin anahtar sözcüğünün PDF metninde geçtiği sayfa sayısıyla yazılı; sözcük düzeyi kanıttır, model kodu düzeyi değil) |
| Dil | PDF metninden ölçüldü (sayfa sayfa sınıflama): yayınlanabilir 48 belgenin tamamı İngilizce. Türkçe üretici belgesi yok |

Tür dağılımı (yayınlanabilir 62 satır): katalog 40, teknik föy 16, kılavuz 5, diğer 1.

İlk sürümdeki üç sayı (teknik föy 20, "2'si İngilizce + İspanyolca", 37 satır baskı kontrolsüz) KTL-59 bağımsız doğrulamasında CSV'den yeniden hesaplanınca tutmadı; yukarıdaki değerler düzeltilmiş hâlidir.

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

- Üretici baskı kıyasının 15 ÖLÇÜLEMEDİ dosyası (Chrome ve flipbook turu yapılmadı); web'den sha256 eşitliği yalnız SEAT için ajan tarafından alındı, ben yeniden doğrulamadım.
- Design'daki dosyaların sha256'sı alınmadı (DesignSync dosya okuması 256 KB sınırlı ve PDF'i bağlama taşır).
- Dil ölçümü görsel-yalnız sayfalarda (Bravo S) sonuç vermez.

## 6. KTL-59 (OPS devam emri): paket, dil, üretici baskısı, bağımsız okuma

**Paket yeniden üretildi.** `paket/` (ingestor, git dışı) canlıdan sıfırdan alındı: ham yarı + 8 CSV + `belgeler.csv`; eski dosyalar `paket/yedek-2026-09-25/` altında. Sınamalar: ham ↔ canlı round-trip SIFIR FARK (2724 satır), CSV katmanı SIFIR FARK, görseller depoyla doğrulandı (1146/1146), `katalog-karnesi --kapi` "Katalog paketi tazeliği TAZE". `belgeler.csv` artık bu listeden üretiliyor (`paket-belgeler-uret.mjs --liste=`; sha256 ile eşleşir, 12 sütun korunur, 8 sütun eklenir). Listede olmayan 16 web metni eski dizin-adı yöntemiyle bağlı kalır.

**Dil ölçüldü.** Her sayfa altı dilin işlev kelimeleriyle sınıflanır; belgenin dili sayfaların en az %10'unu tutan diller (dağılım `dil_sayfa_dagilimi` sütununda). Yayınlanabilir 48 belgenin tamamı İngilizce; tek Türkçe belge AVenS fiyat listesi (yayınlanmaz). 12 arşiv PDF'inin sayfa metni dizinde eski yolla durduğu için o dosyalarda dil taraması yapılamadı (hepsi yayınlanmaz).

**Üretici baskı kıyası (29 dosya, 4 araştırmacı, salt okuma, PDF indirilmedi).** Veri: `rec145-baski-kiyasi-2026-10-25.json`.

| Hüküm | Dosya | Hangileri |
|---|---|---|
| GÜNCEL | 11 | SEAT 2024-11 broşürü ve 6 model föyü (üretici dosyasıyla bayt/sha256 eşit); Danfoss FC102 1,1–90 kW (2025.07), FC101 design guide (2025.07), FC51 design guide, FC101 seçim kılavuzu |
| GÜNCEL-ZAYIF | 2 | Danfoss FC102 110–800 kW (yalnız arama özeti, 10 MB sınırı); FC51 operating guide (daha yeni AQ383124996793 kodlu bir kılavuz görüldü, yerine geçtiği doğrulanmadı) |
| AYNI-DOSYA | 1 | Casals NIMUS/NIMAX broşürü (bayt eşit, ama baskı kodu yok) |
| ÖLÇÜLEMEDİ | 15 | Danfoss 3 (FC51 seçim kılavuzu, fact sheet, datasheet), Casals plug fan kataloğu, Nicotra 6, SEAT özellik föyü, Vortice 4. Merdivenin 3. (flipbook) ve 6. (Chrome) basamakları bu turda denenmedi; "bulunamadı" hükmü verilmedi |

Ek bulgular: Casals AF 2024 kesiti (yayınlanmayan) ESKİ: bizde CV092024, üreticinin flipbook'unda CV032025. Deumido NG güncel Vortice listelerinde yok, yalnız Deumido EVO (26025-27) var. Danfoss FC51 ürün sayfası "son sipariş 30 Haziran 2026, son teslim 30 Eylül 2026" diyor (ürün yaşam döngüsü, belge baskısından bağımsız). Bir web PDF'inde ajana yönelik talimat metni vardı, veri olarak okundu.

**Bağımsız doğrulama (katalog-dogrulayici, ilk sürüm üzerinde).** sha256 96/96 diskten yeniden hesaplandı, tuttu. 62 "evet" aile satırı ürün adı ve sayfa taramasıyla sınandı. Yanlış dışlama yok; dört "canlı modeli katalogda yok" hükmü katalog metninde yeniden ölçüldü, tuttu. Düzeltilenler:
- `vortice-brochure-mev.pdf` ve `vortice_vort_mono_range_new.pdf` (aynı bayt) VORT MONO RANGE eski baskısı; MEV değil. VORT HR bağı kaldırıldı, aile `vortice-vort-mono`, "eski baskı, yerini 189860 aldı". Eski kanıt "1/30" `magNETIc` içindeki NETI yanlış pozitifiydi; regex `\b` sınırlı yapıldı.
- Kimliği belirsiz SEAT föyü, SEAT ATEX kurulum kılavuzu (2011, yerine geçeni ölçülmedi) ve FC51'in iki eski fact sheet'i "evet"ten "dogrulanacak"a alındı.
- Rapor sayıları CSV'den yeniden hesaplandı (yukarıdaki tablo).
- Zayıf ama yanlış olmayan bağlar: Casals 77854 broşürü NIMUS/NIMAX'a model değil aile sözcüğüyle bağlı; Nicotra ADH-AT-RDE-RZR kataloğunda AT yalnız 3 sayfada, 78/97 sayfa RZR.
- `avensair-ADH-*` 8 föy: doğrulayıcıya göre AVenS'in (İkitelli) kendi föyleri; Recep kararı (25 Ekim 2026, OPS penceresi): iptal, yayınlanmaz, konu kapandı. Listede `yayin_onerisi` "hayir: Recep kararı".
