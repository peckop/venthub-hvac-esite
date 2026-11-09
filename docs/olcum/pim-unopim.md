# Ölçüm defteri: PIM / UnoPIM

Sahibi: OPS · Son doğrulama: 2026-11-09 (KATALOG, yalnız kayıttan; yeniden ölçüm yok. Güncel durum "Ölçüm 2026-11-05…08" bölümüdür; 11-04 bölümü o günün tablosudur, 09-29 ve 11-02 satırları tarihçedir) · Kaynak: Recep 09-29 "önceki ve şimdiki ölçümleri bir md'de birleştir"
Son ölçüm: 2026-09-29 (OPS, Sonnet). Önceki: REC-357 (In Review), karar 36 EVET (09-22), 81/82 EVET.

| Konu | Bulgu |
|---|---|
| Barındırma | YALNIZ bu makinede yerel Docker (C:/tmp/pim-unopim, 7 konteyner, v3.1.1). Sunucu yok; karar 59 açık. |
| Model | Canlı DB Supabase; UnoPIM yerel tezgâh; köprü tek yönlü tek yazıcı. |
| Köprü | Okuma kolu: 442 ürün, 6.542 hücre, fark 0 (#1350). Yazma kolu plan-challenger BLOK (5 koşul). |
| Açıklar | Tek yazıcı bugün İHLAL (admin form/CSV/kategori ekranı PIM alanlarına yazıyor); köprü DB rolü (migration); SKU/slug/ad politikası; 24 ürün teknik verisi boş; tek makine/tek kişi. |
| Olgunluk | 11.013 yıldız, MIT, v3.1.2 (09-24), 2 ayda 5 sürüm, 32 katkıcı. PHP 8.4 + MySQL/PG16 + Redis + kuyruk (+Elasticsearch) → AYRI sunucu. |
| Alternatif | Akeneo CE (destek bitişi doğrulanmadı), Pimcore (lisans, elendi), AtroPIM (küçük), "PIM yok" (Supabase tabloları). |

## Ölçüm 2026-11-02 (ALTYAPI, ALT-129 / OPS-202)
| Konu | Bulgu |
|---|---|
| Ayağa kalkış | Docker Desktop 4.43.2 (motor 28.3.2) bayat `run/dockerInference` soketiyle açılışta çöküyordu; `wsl --shutdown` + `run` klasörü kenara taşınarak açıldı. Kapsayıcılar yeniden kurulmadan `docker start` ile başlatıldı; 7/7 sağlıklı (app, queue, scheduler, pgsql 16, redis 7.2, elasticsearch 8.17, mailpit). |
| Sürüm | Görüntüler `webkul/unopim:3.1.1` (Laravel 13.30.1). 09-29 kaydıyla aynı; yükseltme yapılmadı. |
| Veri | 442 ürün (hepsi simple), 48 aile, 97 öznitelik, 1 kategori, 1 kanal, 2 etkin dil. En kalabalık aileler seat_serisi 40, vortice_vort_quadro_evo 23. Son ürün güncellemesi 2026-09-23; o günden beri veri değişmemiş. |
| Görsel alanı | Tek görsel özniteliği `image` (tip image, zorunlu değil); galeri ya da dosya tipi öznitelik yok. Görseli dolu ürün 0/442. |
| API | Yönetim paneli `/admin/login` 200; REST kimliksiz 401, mevcut anahtarla `GET products` 200 (total=442), `GET attributes/image` 200. 2 API anahtarı, 2 OAuth istemcisi tanımlı. |
| Sınır | Ölçüm salt okumadır: UnoPIM'e ürün verisi yazılmadı, canlı Supabase'e dokunulmadı. |

## Ölçüm 2026-11-04 (KATALOG, KTL-80 / KTL-81 / KTL-82; yerel UnoPIM, canlı Supabase'e yazım yok, hiçbir ürün yayında değil)
| Konu | Bulgu |
|---|---|
| Sürüm | v3.1.1 → v3.1.3 (görüntü etiketi `compose.yaml`'da sabit). Yükseltme öncesi veritabanı ve dosya yedeği alındı; ürün sayısı ve 5 örnek ürünün özeti önce/sonra aynı. |
| Veri | 1165 ürün (hepsi kapalı/taslak), 107 aile (102 + 5 yeni), 201 kategori, 2 etkin dil (tr_TR, en_US). 12 ürün Design'ın yeni modelleri (Penta, Platt, Notus, Phantom, Sanikit), değerleri Design İçerik veri dosyalarından. |
| Metin | 1153 ürünün tr+en açıklaması ve kısa açıklaması, Design seri kaydından (KTL-80 Faz B); 59 ürün Design'ın eksik-içerik dosyasından; ürün adı (tr) Design model adı. |
| Marka | `brand` seçim özniteliği, 1165/1165 (Vortice 916, SEAT 82, Casals 53, AVenS 44, Danfoss 35, Nicotra Gebhardt 35). |
| Kategori | İki kök ağaç: site menüsü (Design katalog-grup v2.4: 11 grup, 21 tür, yaprak 25/25 dolu) ve Marka · Aile · Seri (6 marka, 56 aile, 104 seri). Her ürün iki ağaçta da. Eski sitenin kategori tablosu kaynak DEĞİL (karar 412). |
| Görsel | Ana görseli olan ürün 1157/1165 (KTL-81: 429; yeni modellerden 10). Eksik 8: eski 6 + Sanikit 2. (11-04 anındaki durum; o gün galeri ve alt metin özniteliği yoktu. Sonrası: "Ölçüm 2026-11-05…08" bölümü.) |
| Fiyat / KDV / stok | (11-04 anındaki durum; 11-05'te fiyat ve KDV alanları açılıp yazıldı, bkz. "Ölçüm 2026-11-05…08") UnoPIM'de yoktu, yazılmamıştı. Kaynak ölçümü: fiyat kaynağı tek (Avensair 2026 liste, EUR, KDV hariç) ve 1165 ürünün 348'ini kapsıyor; KDV eski 442 ürünün hepsinde %20; Supabase `stock_qty` yalnız 0 ya da 50 (yer tutucu). Ayrıntı: venthub-gorsel-arsiv `_liste/ktl82-faz-c-2026-11-04/RAPOR.md`. |
| Fark kontrolü | `scripts/icerik-hatti/tasarim-unopim-fark.mjs` (KTL-83: depoda, vitest bozma testli; Design anlık görüntüleri ↔ UnoPIM; görüntü 7 günden eskiyse çıkış 2): ad, açıklama, kısa açıklama, teknik değer, marka, kategori; ilk koşuda 1165 üründe fark 0, bozma testinde farkı yakaladı. |
| Yazım güvencesi | Her toplu yazım: yedek, tam değer klonu (UnoPIM PUT `values.common`'ı tamamen değiştirir), geri okuma, hedef dışı karşılaştırma, ilk farkta durma. |

## Ölçüm 2026-11-05…08 (KATALOG, KTL-82 / KTL-83; yerel UnoPIM v3.1.3, canlı Supabase'e yazım yok, hiçbir ürün yayında değil)
Bu bölüm 2026-11-09'da yeniden ölçülmeden, KATALOG durum kaydından ve kart notlarından yazıldı; sayıların tarihi satırlardadır. Ayrıntı ve ham dosyalar: venthub-gorsel-arsiv `_liste/ktl82-faz-c-2026-11-04/RAPOR.md` (madde 4, 4b-4f) ve aynı klasördeki `*-rapor.json` dosyaları.
| Konu | Bulgu |
|---|---|
| Yeni öznitelikler (11-05) | `adres_tr`, `adres_en` (benzersiz, adres kalıbına uyan), `gallery`, `image_alt_tr`, `image_alt_en` açıldı; 106 ailenin general grubuna eklendi, değer yazılmadı (yedek `unopim-db-adres-galeri-oncesi.dump`). Aynı gün `list_price_eur`, `list_price_source_doc`, `list_price_source_page`, `vat_rate_percent` açıldı (metin, dil yok). `gallery_alt_tr` ve `gallery_alt_en` 11-07'de galeri yazımıyla geldi. 11-02 ve 11-04 satırlarındaki "galeri ya da alt metin özniteliği yok" ifadesi bu tarihten sonra GEÇERSİZDİR. |
| KDV (11-05) | `vat_rate_percent` %20, 1165/1165 ürün (varsayılan oran Recep kararı, OPS iletti). Geri okuma ve hedef dışı karşılaştırma temiz. |
| Liste fiyatı (11-05) | EUR liste fiyatı + kaynak belge + kaynak sayfa: 343 ürün (kaynak: ingestor `paket/fiyatlar.csv`, Avensair 2026 liste, KDV hariç). CSV'de tekil 348 SKU vardı; beş Casals ürününde (`VRT-CA-IL-*-ES-RECT`) EUR, belge ve sayfa boş olduğu için yazılmadı. Satış fiyatı ve stok yazılmaz. 1164 yazım temiz, fark betiği 0. |
| Fiyat kaynağı olmayan | 822 ürün (1165 − 343). Liste: `fiyat-kaynagi-olmayan-urunler.csv` ve `.md` (aynı klasör). Ticari statü (teklif ya da liste modu) ürün kararıdır; KATALOG fiyat aramaz. |
| Adres (11-05…06) | Design adresleri 7 parçalı dosyayla TAM okundu (1206 model kaydı; tekrar eden SKU 0). UnoPIM'in 1165 ürününün 1165'i Design'da adresli (adressiz 0); `/tr/urunler/…-p-…` ve `/en/products/…-p-…` kalıbı 1165/1165 uyumlu, tr ve en benzersiz. `adres_tr` ve `adres_en` 1165 üründe dolu (1164 yazım + 1 aynı değerli atlandı); `url_key` değişmedi 1164/1164. UnoPIM `url_key` değeri Design adresiyle birebir DEĞİL (0/832, 11-05 kesik okuma); ayrı alan olarak duruyor. Durum dağılımı: 442 ürün eski plan adresi, 723 ürün yeni üretilmiş. Yedek `unopim-db-adres-deger-oncesi.dump`. |
| Design'da fazla 41 (11-06) → çözüldü (11-07) | 6 Kasım'da Design adres dizininde (1206) olup UnoPIM'de (1165) olmayan 41 kayıt vardı: `DAN-80141` (UnoPIM karşılığı `AVE-80141`) ve önekli olmayan `EDF-*` 40 kayıt (UnoPIM SKU'su `VRT-EDF-*`). 7 Kasım'da Design bunları çıkardı (önekli kod kalır; `EDF-*` → `VRT-EDF-*` çevirisi), adres dizini toplamı 1165 = UnoPIM 1165 (Design: `surec/ops-cevap-2026-11-07-galeri-ve-cift-kod.md`; OPS-260 arşivlendi). 4 Kasım listesi yalnız tarihçe: venthub-gorsel-arsiv `_liste/ktl82-faz-c-2026-11-04/design-fazla-41-sku-ad.csv`. |
| Galeri (11-07) | Design parçaları birleştirildi (tek dosya 291 KB, DesignSync 256 KiB'da kesiyor): 1147 ürün, 1828 görsel, 253 galerili ürün. Kuru koşum temiz (Supabase 1110/1110 adres 200, sha 429/429). `gallery` 253/253 ve `gallery_alt_tr/en` 253/253 yazıldı; galerilerin hepsi Supabase kaynaklı, Design arşivi indirmesi gerekmedi. Geri okuma ve hedef dışı fark 0; yedekler `unopim-db-galeri-alan-oncesi.dump`, `unopim-db-galeri-deger-oncesi.dump`. |
| Alt metin (11-07) | `image_alt_tr` ve `image_alt_en`: 1158 ürün (1147 Design + 11 üretici görseli). Üretici görselleri 20/20 indirildi (`_teslim/uretici-gorsel-2026-11-07/MANIFEST.tsv`). Fotoğrafsız kalan 5 ürün (VRT-HP-1400, VRT-HP-1400-D, AVE-13050, AVE-13051, SEA-810105): üretici görseli Recep tedarik edecek. |
| Notus / Sanikit (11-07) | Notus VRT-11177 ve VRT-11903: ad takası, 62/76/35 ölçüleri, kısa açıklama yazıldı (2/2, fark 0; eğri `pq_curve` dokunulmadı). Sanikit 250/400 görselleri yazıldı: 5 resmi vortice.com dosyası, gallery 3+2, alt tr/en, doğrulama temiz. Design kataloğunda s.4 ile s.6 tabloları ters ad/kod veriyor; değerler OPS onayıyla web değerlerine göre yazıldı. |
| Fark kontrolü | `tasarim-unopim-fark.mjs` 1165 üründe fark 0 (KTL-83, PR 2279 11-06'da birleşti; 11-07 yazımlarından sonra da 0). |
| Kardeş iş (11-08) | KTL-84 mükerrer çıktı ve kapandı: 11-04…11-07 işleri KTL-82 kapsamında zaten yapılmıştı. Yeniden başlatmadan önce bu defter ve KTL-82 notu okunur. |
| Ölçülmedi (bu bölümde) | 11-09'da canlı UnoPIM'den yeniden sayım yapılmadı; sayılar yazım günlerindeki geri okumalardır. |

## Hüküm (09-29)
441 ürün, tek kanal → ayrı PIM zorunlu değil; asıl acı veri disiplini. UnoPIM YEREL TEZGÂH olarak devam, yazma kolu açılmaz. 4 hafta koşulu (~10-27): 24 boş ürün + 2 hafta fark 0 + challenger 5 koşulu; sağlanmazsa Supabase tabloları.
## Ölçülmedi
Sunucu bedeli, Akeneo destek bitişi, ERP ürün kartı yeteneği.
## Yeniden ölçme tetikleyicisi
Pazaryeri/çok kanal, tedarikçi beslemesi, ikinci kişi ürün girişi, binlerce ürün; 4 hafta sonu.

## KARAR 184 (Recep 2026-09-29 14:17)
UnoPIM = KATALOG penceresinin işi (dondurma 165 kalkınca KATALOG açılır). Görsel ekleme dahil ürün içeriği UnoPIM tarafında halledilecek (Recep). 4 haftalık koşul KATALOG açıldığı gün başlar: 24 boş ürün + 2 hafta fark 0; canlıya yazma kolu challenger 5 koşulu kapanmadan açılmaz; tek yazıcı ihlali (admin form/CSV/kategori ekranı PIM alanlarına yazıyor) KATALOG açılışının ilk işi. Görsel yönetimi UnoPIM DAM ile mi, site kovası ile mi: KATALOG açılışında ölçülür (ADMIN kategori görsel yükleme kusuru buna göre şekillenir).
